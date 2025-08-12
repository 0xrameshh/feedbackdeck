import { sendEmail } from "@/lib/email";
import { db } from "@/db";
import { feedback, project, member, user, organization } from "@/db/schema";
import { eq, and, gte, desc, sql } from "drizzle-orm";
import { createNewFeedbackEmail, createResponseEmail, createSummaryEmail } from "./templates";
import type { FeedbackCategory } from "@/db/schema";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

interface FeedbackNotificationData {
  feedbackId: string;
}

interface ResponseNotificationData {
  feedbackId: string;
  response: string;
  adminId: string;
}

// Send notification for new feedback submission
export async function sendNewFeedbackNotification({ feedbackId }: FeedbackNotificationData) {
  try {
    // Get feedback with project and user details
    const feedbackData = await db
      .select({
        feedback: feedback,
        project: project,
        user: user
      })
      .from(feedback)
      .innerJoin(project, eq(feedback.projectId, project.id))
      .innerJoin(user, eq(project.userId, user.id))
      .where(eq(feedback.id, feedbackId))
      .limit(1);

    if (feedbackData.length === 0) {
      console.error('Feedback not found:', feedbackId);
      return;
    }

    const { feedback: feedbackInfo, project: projectInfo, user: projectOwner } = feedbackData[0];

    const emailTemplate = createNewFeedbackEmail({
      feedback: {
        ...feedbackInfo,
        project: {
          name: projectInfo.name,
          domain: projectInfo.domain
        }
      },
      adminName: projectOwner.name,
      dashboardUrl: `${APP_URL}/dashboard/feedback`
    });

    await sendEmail({
      to: projectOwner.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html
    });

    console.log(`Sent new feedback notification to ${projectOwner.email} for feedback ${feedbackId}`);

  } catch (error) {
    console.error('Error sending new feedback notification:', error);
  }
}

// Send response notification to user
export async function sendResponseNotification({ feedbackId, response, adminId }: ResponseNotificationData) {
  try {
    // Get feedback with project details
    const feedbackData = await db
      .select({
        feedback: feedback,
        project: project
      })
      .from(feedback)
      .innerJoin(project, eq(feedback.projectId, project.id))
      .where(eq(feedback.id, feedbackId))
      .limit(1);

    if (feedbackData.length === 0) {
      console.error('Feedback not found:', feedbackId);
      return;
    }

    const { feedback: feedbackInfo, project: projectInfo } = feedbackData[0];

    // Check if user provided email for response
    if (!feedbackInfo.userEmail) {
      console.log('No email provided for feedback response:', feedbackId);
      return;
    }

    // Get admin details
    const adminData = await db
      .select()
      .from(user)
      .where(eq(user.id, adminId))
      .limit(1);

    if (adminData.length === 0) {
      console.error('Admin not found:', adminId);
      return;
    }

    const adminUser = adminData[0];

    const emailTemplate = createResponseEmail({
      feedback: {
        ...feedbackInfo,
        project: {
          name: projectInfo.name,
          domain: projectInfo.domain
        }
      },
      response,
      adminName: adminUser.name
    });

    await sendEmail({
      to: feedbackInfo.userEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html
    });

    console.log(`Sent response notification to ${feedbackInfo.userEmail} for feedback ${feedbackId}`);

  } catch (error) {
    console.error('Error sending response notification:', error);
  }
}

// Send daily summary email
export async function sendDailySummary() {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    await sendSummaryEmail('daily', yesterday);
  } catch (error) {
    console.error('Error sending daily summary:', error);
  }
}

// Send weekly summary email
export async function sendWeeklySummary() {
  try {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    lastWeek.setHours(0, 0, 0, 0);

    await sendSummaryEmail('weekly', lastWeek);
  } catch (error) {
    console.error('Error sending weekly summary:', error);
  }
}

async function sendSummaryEmail(period: 'daily' | 'weekly', since: Date) {
  // Get all organizations with their admins
  const orgsWithAdmins = await db
    .select({
      organization: organization,
      user: user,
      role: member.role
    })
    .from(organization)
    .innerJoin(member, eq(member.organizationId, organization.id))
    .innerJoin(user, eq(member.userId, user.id))
    .where(sql`${member.role} IN ('admin', 'owner')`);

  // Group by organization
  const orgGroups = orgsWithAdmins.reduce((acc, item) => {
    if (!acc[item.organization.id]) {
      acc[item.organization.id] = {
        organization: item.organization,
        admins: []
      };
    }
    acc[item.organization.id].admins.push({
      user: item.user,
      role: item.role
    });
    return acc;
  }, {} as Record<string, { organization: typeof organization.$inferSelect, admins: Array<{ user: typeof user.$inferSelect, role: string }> }>);

  // Send summary for each organization
  for (const [orgId, orgData] of Object.entries(orgGroups)) {
    try {
      // Get feedback stats for this organization
      const stats = await getFeedbackStats(orgId, since);
      
      if (stats.totalFeedback === 0) {
        continue; // Skip if no feedback
      }

      // Send to all admins in the organization
      const emailPromises = orgData.admins.map(async ({ user: adminUser }) => {
        const emailTemplate = createSummaryEmail({
          adminName: adminUser.name,
          period,
          stats,
          dashboardUrl: `${APP_URL}/dashboard/feedback`
        });

        return sendEmail({
          to: adminUser.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html
        });
      });

      await Promise.allSettled(emailPromises);
      console.log(`Sent ${period} summary to ${orgData.admins.length} admins for organization ${orgId}`);

    } catch (error) {
      console.error(`Error sending ${period} summary for organization ${orgId}:`, error);
    }
  }
}

async function getFeedbackStats(organizationId: string, since: Date) {
  // Get total feedback count
  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(feedback)
    .innerJoin(project, eq(feedback.projectId, project.id))
    .where(
      and(
        eq(project.organizationId, organizationId),
        gte(feedback.createdAt, since)
      )
    );

  const totalFeedback = totalResult[0]?.count || 0;

  // Get unread count
  const unreadResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(feedback)
    .innerJoin(project, eq(feedback.projectId, project.id))
    .where(
      and(
        eq(project.organizationId, organizationId),
        eq(feedback.status, 'unread'),
        gte(feedback.createdAt, since)
      )
    );

  const unreadCount = unreadResult[0]?.count || 0;

  // Get category breakdown
  const categoryResult = await db
    .select({
      category: feedback.category,
      count: sql<number>`count(*)`
    })
    .from(feedback)
    .innerJoin(project, eq(feedback.projectId, project.id))
    .where(
      and(
        eq(project.organizationId, organizationId),
        gte(feedback.createdAt, since)
      )
    )
    .groupBy(feedback.category);

  const categories = {
    general: 0,
    bug: 0,
    feature: 0,
    praise: 0
  } as Record<FeedbackCategory, number>;

  categoryResult.forEach(({ category, count }) => {
    categories[category] = count;
  });

  // Get top projects
  const topProjectsResult = await db
    .select({
      projectName: project.name,
      count: sql<number>`count(*)`
    })
    .from(feedback)
    .innerJoin(project, eq(feedback.projectId, project.id))
    .where(
      and(
        eq(project.organizationId, organizationId),
        gte(feedback.createdAt, since)
      )
    )
    .groupBy(project.id, project.name)
    .orderBy(desc(sql`count(*)`))
    .limit(5);

  const topProjects = topProjectsResult.map(({ projectName, count }) => ({
    projectName,
    count
  }));

  return {
    totalFeedback,
    unreadCount,
    categories,
    topProjects
  };
}
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { feedback, project } from "@/db/schema";
import { eq, and, count, gte, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Get user's projects
    const userProjects = await db
      .select({ id: project.id })
      .from(project)
      .where(eq(project.userId, userId));

    const projectIds = userProjects.map(p => p.id);

    if (projectIds.length === 0) {
      return NextResponse.json({
        totalFeedback: 0,
        pending: 0,
        responded: 0,
        thisWeek: 0,
        activeSites: 0,
        responseRate: 0,
        weeklyData: [0, 0, 0, 0, 0, 0, 0],
        categoryData: { general: 0, bug: 0, feature: 0, praise: 0 }
      });
    }

    // Get all feedback stats for user's projects
    const [
      totalFeedbackResult,
      pendingResult,
      respondedResult,
      thisWeekResult
    ] = await Promise.all([
      // Total feedback count
      db
        .select({ count: count() })
        .from(feedback)
        .where(sql`${feedback.projectId} IN (${sql.join(projectIds.map(id => sql`${id}`), sql`, `)})`)
        .then(result => result[0]?.count || 0),

      // Pending (unread + read but not responded)
      db
        .select({ count: count() })
        .from(feedback)
        .where(and(
          sql`${feedback.projectId} IN (${sql.join(projectIds.map(id => sql`${id}`), sql`, `)})`,
          sql`${feedback.status} IN ('unread', 'read')`
        ))
        .then(result => result[0]?.count || 0),

      // Responded feedback
      db
        .select({ count: count() })
        .from(feedback)
        .where(and(
          sql`${feedback.projectId} IN (${sql.join(projectIds.map(id => sql`${id}`), sql`, `)})`,
          eq(feedback.status, 'responded')
        ))
        .then(result => result[0]?.count || 0),

      // This week's feedback
      db
        .select({ count: count() })
        .from(feedback)
        .where(and(
          sql`${feedback.projectId} IN (${sql.join(projectIds.map(id => sql`${id}`), sql`, `)})`,
          gte(feedback.createdAt, weekAgo)
        ))
        .then(result => result[0]?.count || 0)
    ]);

    // Calculate response rate (responded / total * 100)
    const responseRate = totalFeedbackResult > 0 
      ? Math.round((respondedResult / totalFeedbackResult) * 100)
      : 0;

    // Get weekly data for charts (last 7 days)
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayCount = await db
        .select({ count: count() })
        .from(feedback)
        .where(and(
          sql`${feedback.projectId} IN (${sql.join(projectIds.map(id => sql`${id}`), sql`, `)})`,
          gte(feedback.createdAt, date),
          sql`${feedback.createdAt} < ${nextDate}`
        ))
        .then(result => result[0]?.count || 0);

      weeklyData.push(dayCount);
    }

    // Get category breakdown
    const categoryData = { general: 0, bug: 0, feature: 0, praise: 0 };
    if (projectIds.length > 0) {
      const categories = await db
        .select({
          category: feedback.category,
          count: count()
        })
        .from(feedback)
        .where(sql`${feedback.projectId} IN (${sql.join(projectIds.map(id => sql`${id}`), sql`, `)})`)
        .groupBy(feedback.category);

      categories.forEach((cat: { category: string; count: number }) => {
        if (cat.category in categoryData) {
          categoryData[cat.category as keyof typeof categoryData] = cat.count;
        }
      });
    }

    return NextResponse.json({
      totalFeedback: totalFeedbackResult,
      pending: pendingResult,
      responded: respondedResult,
      thisWeek: thisWeekResult,
      activeSites: projectIds.length,
      responseRate,
      weeklyData,
      categoryData
    });

  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" }, 
      { status: 500 }
    );
  }
}
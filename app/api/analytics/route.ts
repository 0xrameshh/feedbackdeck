import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { feedback, project } from "@/db/schema";
import { eq, and, gte, desc, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days
    const projectId = searchParams.get('projectId');

    const periodDays = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    // Build WHERE conditions for user's projects
    const baseConditions = [
      eq(project.userId, session.user.id),
      gte(feedback.createdAt, startDate)
    ];

    if (projectId) {
      baseConditions.push(eq(feedback.projectId, projectId));
    }

    // Get total feedback count
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(feedback)
      .innerJoin(project, eq(feedback.projectId, project.id))
      .where(and(...baseConditions));

    const totalFeedback = totalResult[0]?.count || 0;

    // Get unread count
    const unreadResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(feedback)
      .innerJoin(project, eq(feedback.projectId, project.id))
      .where(and(...baseConditions, eq(feedback.status, 'unread')));

    const unreadCount = unreadResult[0]?.count || 0;

    // Get category breakdown
    const categoryResult = await db
      .select({
        category: feedback.category,
        count: sql<number>`count(*)`
      })
      .from(feedback)
      .innerJoin(project, eq(feedback.projectId, project.id))
      .where(and(...baseConditions))
      .groupBy(feedback.category);

    const categories = {
      general: 0,
      bug: 0,
      feature: 0,
      praise: 0
    };

    categoryResult.forEach(({ category, count }) => {
      categories[category] = count;
    });

    // Get daily trends for the last 7 days
    const trendsResult = await db
      .select({
        date: sql<string>`DATE(${feedback.createdAt})`,
        count: sql<number>`count(*)`
      })
      .from(feedback)
      .innerJoin(project, eq(feedback.projectId, project.id))
      .where(and(
        eq(project.userId, session.user.id),
        gte(feedback.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
        ...(projectId ? [eq(feedback.projectId, projectId)] : [])
      ))
      .groupBy(sql`DATE(${feedback.createdAt})`)
      .orderBy(sql`DATE(${feedback.createdAt})`);

    const trends = trendsResult.map(({ date, count }) => ({
      date,
      count
    }));

    // Get top pages by feedback count
    const topPagesResult = await db
      .select({
        pageUrl: feedback.pageUrl,
        count: sql<number>`count(*)`
      })
      .from(feedback)
      .innerJoin(project, eq(feedback.projectId, project.id))
      .where(and(...baseConditions))
      .groupBy(feedback.pageUrl)
      .orderBy(desc(sql`count(*)`))
      .limit(10);

    const topPages = topPagesResult.map(({ pageUrl, count }) => ({
      url: pageUrl,
      count
    }));

    // Calculate response rate
    const respondedResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(feedback)
      .innerJoin(project, eq(feedback.projectId, project.id))
      .where(and(...baseConditions, eq(feedback.status, 'responded')));

    const respondedCount = respondedResult[0]?.count || 0;
    const responseRate = totalFeedback > 0 ? Math.round((respondedCount / totalFeedback) * 100) : 0;

    // Get project performance (if no specific project selected)
    let projectStats: Array<{
      projectId: string;
      projectName: string;
      projectDomain: string;
      feedbackCount: number;
    }> = [];
    if (!projectId) {
      const projectStatsResult = await db
        .select({
          projectId: project.id,
          projectName: project.name,
          projectDomain: project.domain,
          count: sql<number>`count(*)`
        })
        .from(feedback)
        .innerJoin(project, eq(feedback.projectId, project.id))
        .where(and(...baseConditions))
        .groupBy(project.id, project.name, project.domain)
        .orderBy(desc(sql`count(*)`))
        .limit(5);

      projectStats = projectStatsResult.map(({ projectId, projectName, projectDomain, count }) => ({
        projectId,
        projectName,
        projectDomain,
        feedbackCount: count
      }));
    }

    return NextResponse.json({
      totalFeedback,
      unreadCount,
      categories,
      trends,
      topPages,
      responseRate,
      projectStats,
      period: periodDays
    });

  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" }, 
      { status: 500 }
    );
  }
}
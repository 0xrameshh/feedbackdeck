import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { feedback, project } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// Get individual feedback item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: feedbackId } = await params;

    // Get feedback with project info and verify user owns the project
    const feedbackData = await db
      .select({
        id: feedback.id,
        projectId: feedback.projectId,
        projectName: project.name,
        projectDomain: project.domain,
        message: feedback.message,
        category: feedback.category,
        userEmail: feedback.userEmail,
        pageUrl: feedback.pageUrl,
        userAgent: feedback.userAgent,
        ipAddress: feedback.ipAddress,
        status: feedback.status,
        metadata: feedback.metadata,
        createdAt: feedback.createdAt
      })
      .from(feedback)
      .innerJoin(project, eq(feedback.projectId, project.id))
      .where(
        and(
          eq(feedback.id, feedbackId),
          eq(project.userId, session.user.id)
        )
      )
      .limit(1);

    if (feedbackData.length === 0) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
    }

    return NextResponse.json({ feedback: feedbackData[0] });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" }, 
      { status: 500 }
    );
  }
}

// Update feedback status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: feedbackId } = await params;
    const body = await request.json();
    const { status } = body;

    // Validate status
    const validStatuses = ['unread', 'read', 'responded', 'archived'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: " + validStatuses.join(', ') }, 
        { status: 400 }
      );
    }

    // Verify feedback exists and user owns the project
    const existingFeedback = await db
      .select({ id: feedback.id })
      .from(feedback)
      .innerJoin(project, eq(feedback.projectId, project.id))
      .where(
        and(
          eq(feedback.id, feedbackId),
          eq(project.userId, session.user.id)
        )
      )
      .limit(1);

    if (existingFeedback.length === 0) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
    }

    // Update feedback status
    await db
      .update(feedback)
      .set({ status: status as 'unread' | 'read' | 'responded' | 'archived' })
      .where(eq(feedback.id, feedbackId));

    return NextResponse.json({ 
      success: true,
      message: "Feedback status updated successfully"
    });

  } catch (error) {
    console.error("Error updating feedback:", error);
    return NextResponse.json(
      { error: "Failed to update feedback" }, 
      { status: 500 }
    );
  }
}

// Delete feedback
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: feedbackId } = await params;

    // Verify feedback exists and user owns the project
    const existingFeedback = await db
      .select({ id: feedback.id })
      .from(feedback)
      .innerJoin(project, eq(feedback.projectId, project.id))
      .where(
        and(
          eq(feedback.id, feedbackId),
          eq(project.userId, session.user.id)
        )
      )
      .limit(1);

    if (existingFeedback.length === 0) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
    }

    // Delete feedback
    await db
      .delete(feedback)
      .where(eq(feedback.id, feedbackId));

    return NextResponse.json({ 
      success: true,
      message: "Feedback deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting feedback:", error);
    return NextResponse.json(
      { error: "Failed to delete feedback" }, 
      { status: 500 }
    );
  }
}
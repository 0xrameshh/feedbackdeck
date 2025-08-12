import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { feedback, feedbackResponse, project } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { getUserOrganizations } from "@/lib/organizations";
import { sendResponseNotification } from "@/lib/email/notifications";

// Send response to feedback
export async function POST(
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
    const { message } = body;

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Response message is required" }, 
        { status: 400 }
      );
    }

    const organizations = await getUserOrganizations(session.user.id);
    const organizationIds = organizations.map(org => org.id);

    if (organizationIds.length === 0) {
      return NextResponse.json({ error: "No access to organizations" }, { status: 403 });
    }

    // Verify feedback exists and user has access
    const feedbackData = await db
      .select({
        feedback: feedback,
        project: project
      })
      .from(feedback)
      .innerJoin(project, eq(feedback.projectId, project.id))
      .where(
        and(
          eq(feedback.id, feedbackId),
          inArray(project.organizationId, organizationIds)
        )
      )
      .limit(1);

    if (feedbackData.length === 0) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
    }

    const { feedback: feedbackInfo } = feedbackData[0];

    // Create response record
    const responseId = uuidv4();
    const newResponse = {
      id: responseId,
      feedbackId,
      adminId: session.user.id,
      message: message.trim(),
      sentAt: new Date(),
      createdAt: new Date()
    };

    await db.insert(feedbackResponse).values(newResponse);

    // Update feedback status to 'responded'
    await db
      .update(feedback)
      .set({ status: 'responded' })
      .where(eq(feedback.id, feedbackId));

    // Send response notification email asynchronously
    if (process.env.RESEND_API_KEY && feedbackInfo.userEmail) {
      sendResponseNotification({
        feedbackId,
        response: message.trim(),
        adminId: session.user.id
      }).catch(error => {
        console.error('Failed to send response notification:', error);
      });
    }

    return NextResponse.json({ 
      success: true,
      responseId,
      message: "Response sent successfully"
    });

  } catch (error) {
    console.error("Error sending response:", error);
    return NextResponse.json(
      { error: "Failed to send response" }, 
      { status: 500 }
    );
  }
}

// Get responses for a feedback item
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
    const organizations = await getUserOrganizations(session.user.id);
    const organizationIds = organizations.map(org => org.id);

    if (organizationIds.length === 0) {
      return NextResponse.json({ error: "No access to organizations" }, { status: 403 });
    }

    // Verify feedback exists and user has access, then get responses
    const responses = await db
      .select({
        id: feedbackResponse.id,
        message: feedbackResponse.message,
        adminId: feedbackResponse.adminId,
        sentAt: feedbackResponse.sentAt,
        createdAt: feedbackResponse.createdAt
      })
      .from(feedbackResponse)
      .innerJoin(feedback, eq(feedbackResponse.feedbackId, feedback.id))
      .innerJoin(project, eq(feedback.projectId, project.id))
      .where(
        and(
          eq(feedbackResponse.feedbackId, feedbackId),
          inArray(project.organizationId, organizationIds)
        )
      )
      .orderBy(feedbackResponse.createdAt);

    return NextResponse.json({ responses });

  } catch (error) {
    console.error("Error fetching responses:", error);
    return NextResponse.json(
      { error: "Failed to fetch responses" }, 
      { status: 500 }
    );
  }
}
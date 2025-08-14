import { NextRequest, NextResponse } from "next/server";

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { feedback, project } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { sendNewFeedbackNotification } from "@/lib/email/notifications";

// Submit feedback from widget (public endpoint)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, message, category, rating, userEmail, pageUrl, userAgent, metadata } = body;

    // Validate required fields
    if (!projectId || !message || !category || !pageUrl) {
      return NextResponse.json(
        { error: "Missing required fields" }, 
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['general', 'bug', 'feature', 'praise'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: "Invalid category" }, 
        { status: 400 }
      );
    }

    // Verify project exists and is active
    const projectData = await db
      .select()
      .from(project)
      .where(and(
        eq(project.id, projectId),
        eq(project.isActive, true)
      ))
      .limit(1);

    if (projectData.length === 0) {
      return NextResponse.json(
        { error: "Project not found or inactive" }, 
        { status: 404 }
      );
    }

    // const projectInfo = projectData[0]; // Currently unused

    // Basic URL validation
    try {
      new URL(pageUrl);
    } catch {
      return NextResponse.json(
        { error: "Invalid page URL" }, 
        { status: 400 }
      );
    }

    // Get client IP address
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') ||
                     'unknown';

    // Get country from IP (simple approach using cloudflare headers or ip-api)
    let country = 'Unknown';
    try {
      // Try to get country from Cloudflare header first
      country = request.headers.get('cf-ipcountry') || 'Unknown';
      
      // If not available and we have a real IP, use ip-api service
      if (country === 'Unknown' && clientIP !== 'unknown' && !clientIP.startsWith('192.168.') && !clientIP.startsWith('10.') && clientIP !== '127.0.0.1') {
        const geoResponse = await fetch(`http://ip-api.com/json/${clientIP}`);
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          country = geoData.country || 'Unknown';
        }
      }
    } catch (error) {
      console.warn('Failed to get country info:', error);
    }

    // Validate rating if provided
    const validRating = rating ? Math.max(1, Math.min(5, parseInt(rating))) : null;

    // Create feedback entry
    const feedbackId = uuidv4();
    const newFeedback = {
      id: feedbackId,
      projectId,
      message: message.trim(),
      category: category as 'general' | 'bug' | 'feature' | 'praise',
      rating: validRating,
      userEmail: userEmail?.trim() || null,
      pageUrl,
      userAgent: userAgent || null,
      ipAddress: clientIP,
      status: 'unread' as const,
      metadata: {
        ...metadata,
        country: country
      },
      createdAt: new Date()
    };

    await db.insert(feedback).values(newFeedback);

    // Send notification email asynchronously (don't block the response)
    if (process.env.RESEND_API_KEY) {
      sendNewFeedbackNotification({ feedbackId }).catch(error => {
        console.error('Failed to send feedback notification:', error);
      });
    }

    const response = NextResponse.json({ 
      success: true,
      id: feedbackId,
      message: "Feedback submitted successfully"
    });
    
    // Add CORS headers for cross-origin requests
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    
    return response;

  } catch (error) {
    console.error("Error submitting feedback:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback" }, 
      { status: 500 }
    );
  }
}

// Get feedback for admin dashboard (authenticated endpoint)
export async function GET(request: NextRequest) {
  try {
    const session = await getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Build WHERE conditions for user's projects
    const whereConditions = [
      eq(project.userId, session.user.id)
    ];

    if (projectId) {
      whereConditions.push(eq(feedback.projectId, projectId));
    }

    if (category && ['general', 'bug', 'feature', 'praise'].includes(category)) {
      whereConditions.push(eq(feedback.category, category as 'general' | 'bug' | 'feature' | 'praise'));
    }

    if (status && ['unread', 'read', 'responded', 'archived'].includes(status)) {
      whereConditions.push(eq(feedback.status, status as 'unread' | 'read' | 'responded' | 'archived'));
    }

    // Get feedback with project info
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
      .where(and(...whereConditions))
      .orderBy(desc(feedback.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalResult = await db
      .select({ count: feedback.id })
      .from(feedback)
      .innerJoin(project, eq(feedback.projectId, project.id))
      .where(and(...whereConditions));

    const total = totalResult.length;
    const hasMore = offset + feedbackData.length < total;

    return NextResponse.json({
      feedback: feedbackData,
      total,
      page,
      limit,
      hasMore
    });

  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" }, 
      { status: 500 }
    );
  }
}
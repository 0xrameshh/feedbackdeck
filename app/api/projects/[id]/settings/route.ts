import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { project } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: projectId } = await params;

    if (!projectId) {
      const response = NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
      response.headers.set('Access-Control-Allow-Origin', '*');
      return response;
    }

    // Fetch project with widget settings
    const projectData = await db
      .select({
        id: project.id,
        name: project.name,
        widgetSettings: project.widgetSettings,
        isActive: project.isActive
      })
      .from(project)
      .where(eq(project.id, projectId))
      .limit(1);

    if (projectData.length === 0) {
      const response = NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
      response.headers.set('Access-Control-Allow-Origin', '*');
      return response;
    }

    const projectInfo = projectData[0];

    if (!projectInfo.isActive) {
      const response = NextResponse.json(
        { error: "Project is inactive" },
        { status: 403 }
      );
      response.headers.set('Access-Control-Allow-Origin', '*');
      return response;
    }

    const response = NextResponse.json({
      id: projectInfo.id,
      name: projectInfo.name,
      widgetSettings: projectInfo.widgetSettings || {}
    });

    // Add CORS headers for cross-origin requests
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    
    return response;

  } catch (error) {
    console.error('Error fetching project settings:', error);
    const response = NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
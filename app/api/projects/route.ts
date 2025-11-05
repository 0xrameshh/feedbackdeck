import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { project } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projects = await db
      .select()
      .from(project)
      .where(eq(project.userId, session.user.id));

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, domain } = body;

    if (!name || !domain) {
      return NextResponse.json(
        { error: "Name and domain are required" }, 
        { status: 400 }
      );
    }

    // Basic domain validation - allow any format for flexibility
    if (!domain || domain.trim().length === 0) {
      return NextResponse.json(
        { error: "Domain is required" }, 
        { status: 400 }
      );
    }

    const projectId = uuidv4();
    const newProject = {
      id: projectId,
      userId: session.user.id,
      organizationId: null, // Optional organization support
      name,
      domain,
      widgetSettings: {
        triggerText: "Feedback",
        position: "bottom-right" as const,
        primaryColor: "#3b82f6",
        backgroundColor: "#ffffff",
        textColor: "#1f2937"
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.insert(project).values(newProject);

    return NextResponse.json({ 
      project: newProject,
      embedCode: generateEmbedCode(projectId)
    });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" }, 
      { status: 500 }
    );
  }
}

function generateEmbedCode(projectId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  
  return `<script 
  defer 
  data-project-id="${projectId}"
  src="${baseUrl}/js/script.js">
</script>`;
}

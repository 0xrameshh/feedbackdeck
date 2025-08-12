import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { project } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { getUserOrganizations } from "@/lib/organizations";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId } = await params;
    const organizations = await getUserOrganizations(session.user.id);
    const organizationIds = organizations.map(org => org.id);

    if (organizationIds.length === 0) {
      return NextResponse.json({ error: "No access to organizations" }, { status: 403 });
    }

    const projectData = await db
      .select()
      .from(project)
      .where(
        and(
          eq(project.id, projectId),
          inArray(project.organizationId, organizationIds)
        )
      )
      .limit(1);

    if (projectData.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project: projectData[0] });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" }, 
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId } = await params;
    const body = await request.json();
    const { name, domain, widgetSettings, isActive } = body;

    const organizations = await getUserOrganizations(session.user.id);
    const organizationIds = organizations.map(org => org.id);

    if (organizationIds.length === 0) {
      return NextResponse.json({ error: "No access to organizations" }, { status: 403 });
    }

    // Verify project exists and user has access
    const existingProject = await db
      .select()
      .from(project)
      .where(
        and(
          eq(project.id, projectId),
          inArray(project.organizationId, organizationIds)
        )
      )
      .limit(1);

    if (existingProject.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Build update object
    const updateData: {
      name?: string;
      domain?: string;
      widgetSettings?: Record<string, unknown>;
      isActive?: boolean;
      updatedAt: Date;
    } = { updatedAt: new Date() };
    
    if (name) updateData.name = name;
    if (domain) {
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.([a-zA-Z]{2,})+$/;
      if (!domainRegex.test(domain)) {
        return NextResponse.json(
          { error: "Invalid domain format" }, 
          { status: 400 }
        );
      }
      updateData.domain = domain;
    }
    if (widgetSettings) updateData.widgetSettings = widgetSettings;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    await db
      .update(project)
      .set(updateData)
      .where(eq(project.id, projectId));

    const updatedProject = await db
      .select()
      .from(project)
      .where(eq(project.id, projectId))
      .limit(1);

    return NextResponse.json({ project: updatedProject[0] });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" }, 
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId } = await params;
    const organizations = await getUserOrganizations(session.user.id);
    const organizationIds = organizations.map(org => org.id);

    if (organizationIds.length === 0) {
      return NextResponse.json({ error: "No access to organizations" }, { status: 403 });
    }

    // Verify project exists and user has access
    const existingProject = await db
      .select()
      .from(project)
      .where(
        and(
          eq(project.id, projectId),
          inArray(project.organizationId, organizationIds)
        )
      )
      .limit(1);

    if (existingProject.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    await db
      .delete(project)
      .where(eq(project.id, projectId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" }, 
      { status: 500 }
    );
  }
}
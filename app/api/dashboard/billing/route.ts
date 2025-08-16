import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { organization, member } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user's organization with billing info
    const orgMembership = await db
      .select({ organization })
      .from(member)
      .leftJoin(organization, eq(member.organizationId, organization.id))
      .where(
        and(
          eq(member.userId, userId),
          eq(member.role, 'owner') // Only owners can view billing
        )
      )
      .limit(1);

    if (!orgMembership[0]?.organization) {
      return NextResponse.json({ 
        error: "No organization found or insufficient permissions" 
      }, { status: 403 });
    }

    const org = orgMembership[0].organization;

    return NextResponse.json({
      currentPlan: org.currentPlan,
      subscriptionStatus: org.subscriptionStatus,
      subscriptionId: org.subscriptionId,
      polarCustomerId: org.polarCustomerId
    });

  } catch (error) {
    console.error("Error fetching billing info:", error);
    return NextResponse.json(
      { error: "Failed to fetch billing information" }, 
      { status: 500 }
    );
  }
}
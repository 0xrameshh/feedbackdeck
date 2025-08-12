import { CustomerPortal } from "@polar-sh/nextjs";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { organization, member } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export const GET = CustomerPortal({
  accessToken: process.env.POLAR_ACCESS_TOKEN as string,
  getCustomerId: async (req: NextRequest) => {
    const session = await auth.api.getSession({
      headers: req.headers
    });
    
    if (!session?.user) {
      throw new Error("No authenticated user");
    }

    // Get the user's organization and return the Polar customer ID
    const orgMembership = await db
      .select({ organization })
      .from(member)
      .leftJoin(organization, eq(member.organizationId, organization.id))
      .where(
        and(
          eq(member.userId, session.user.id),
          eq(member.role, 'owner') // Only owners can access billing
        )
      )
      .limit(1);

    if (!orgMembership[0]?.organization?.polarCustomerId) {
      throw new Error("No Polar customer ID found for user's organization");
    }

    return orgMembership[0].organization.polarCustomerId;
  },
  server: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
});
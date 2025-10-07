import { getSession } from "./auth";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getCurrentUser() {
  const session = await getSession({ headers: new Headers() });
  if (!session?.user?.id) return null;

  // Fetch full user from database to get systemRole
  const [fullUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  return fullUser;
}

export async function isSuperAdmin() {
  const user = await getCurrentUser();
  return user?.systemRole === "super_admin";
}

export async function isAdmin() {
  const user = await getCurrentUser();
  return user?.systemRole === "admin" || user?.systemRole === "super_admin";
}

export async function requireSuperAdmin() {
  const user = await getCurrentUser();
  if (!user || user.systemRole !== "super_admin") {
    throw new Error("Super admin access required");
  }
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || (user.systemRole !== "admin" && user.systemRole !== "super_admin")) {
    throw new Error("Admin access required");
  }
  return user;
}
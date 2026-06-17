#!/usr/bin/env tsx

import { db } from "../db";
import { user } from "../db/schema";
import { eq } from "drizzle-orm";

async function seedAdminRoles() {
  const emails = process.argv.slice(2).map((email) => email.trim().toLowerCase());

  if (emails.length === 0) {
    console.error("Usage: pnpm seed-admin <email> [email...]");
    process.exit(1);
  }

  for (const email of emails) {
    const [existingUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (!existingUser) {
      console.warn(`User not found: ${email}`);
      continue;
    }

    if (existingUser.systemRole === "admin" || existingUser.systemRole === "super_admin") {
      console.log(`Already admin: ${email}`);
      continue;
    }

    await db
      .update(user)
      .set({
        systemRole: "admin",
        updatedAt: new Date(),
      })
      .where(eq(user.email, email));

    console.log(`Promoted to admin: ${email}`);
  }
}

seedAdminRoles()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Failed to seed admin roles:", error);
    process.exit(1);
  });

#!/usr/bin/env tsx

import { db } from "../db";
import { user } from "../db/schema";
import { eq } from "drizzle-orm";

const ADMIN_EMAILS = [
  "rameshvoodi24@gmail.com",
  "rameshkumarvoodi2002@gmail.com"
];

const SUPER_ADMIN_EMAILS = [
  "rameshvoodi24@gmail.com"
];

async function seedAdminRoles() {
  console.log("🔐 Seeding admin roles...");

  try {
    // Promote users to admin
    for (const email of ADMIN_EMAILS) {
      const [existingUser] = await db
        .select()
        .from(user)
        .where(eq(user.email, email))
        .limit(1);

      if (existingUser) {
        const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(email);
        const newRole = isSuperAdmin ? "super_admin" : "admin";

        if (existingUser.systemRole !== newRole) {
          await db
            .update(user)
            .set({
              systemRole: newRole,
              updatedAt: new Date()
            })
            .where(eq(user.email, email));

          console.log(`✅ Promoted ${email} to ${newRole}`);
        } else {
          console.log(`ℹ️  ${email} already has ${newRole} role`);
        }
      } else {
        console.log(`⚠️  User ${email} not found. Please register first.`);
      }
    }

    console.log("🎉 Admin role seeding completed!");
  } catch (error) {
    console.error("❌ Error seeding admin roles:", error);
    process.exit(1);
  }
}

// Run the script
seedAdminRoles()
  .then(() => {
    console.log("✨ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
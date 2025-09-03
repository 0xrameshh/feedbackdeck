import { db } from '../db';
import { user as userTable } from '../db/schema';
import { eq } from 'drizzle-orm';

const DEFAULT_ADMINS = [
  'rameshvoodi24@gmail.com',
  'rameshkumarvoodi2002@gmail.com',
];

async function ensureAdmins() {
  try {
    const emails = (process.argv.slice(2).length > 0 ? process.argv.slice(2) : DEFAULT_ADMINS)
      .map(e => e.trim().toLowerCase());

    for (const email of emails) {
      const existing = await db.select().from(userTable).where(eq(userTable.email, email)).limit(1);

      if (existing.length === 0) {
        const id = crypto.randomUUID();
        const name = email.split('@')[0];
        await db.insert(userTable).values({
          id,
          name: name || 'Admin',
          email,
          emailVerified: false,
          systemRole: 'admin',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log(`Created and promoted: ${email}`);
      } else {
        const u = existing[0];
        if (u.systemRole !== 'admin') {
          await db.update(userTable)
            .set({ systemRole: 'admin', updatedAt: new Date() })
            .where(eq(userTable.id, u.id));
          console.log(`Promoted existing user to admin: ${email}`);
        } else {
          console.log(`Already admin: ${email}`);
        }
      }
    }
  } catch (err) {
    console.error('Error ensuring admins:', err);
    process.exitCode = 1;
  }
}

ensureAdmins();

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { db } from '@/db';
import { organization, project, user as userTable, feedback } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { sql } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AdminPage() {
  // Build a standard Headers object from Next cookies for better-auth
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');
  const h = new Headers();
  if (cookieHeader) h.set('cookie', cookieHeader);
  const session = await getSession({ headers: h });
  if (!session?.user?.id) {
    redirect('/');
  }

  // Fetch full user to verify systemRole from DB to be safe
  const [dbUser] = await db
    .select()
    .from(userTable)
    .where(sql`${userTable.id} = ${session.user.id}`)
    .limit(1);

  if (!dbUser || dbUser.systemRole !== 'admin') {
    redirect('/');
  }

  // Aggregate counts for super admin overview
  const [[orgCount], [userCount], [projectCount], [feedbackCount]] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(organization),
    db.select({ count: sql<number>`count(*)` }).from(userTable),
    db.select({ count: sql<number>`count(*)` }).from(project),
    db.select({ count: sql<number>`count(*)` }).from(feedback),
  ]);

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Super Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">High-level overview across all tenants</p>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{orgCount?.count ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Total organizations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{userCount?.count ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Total users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{projectCount?.count ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">All tracked properties</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{feedbackCount?.count ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Total submissions</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

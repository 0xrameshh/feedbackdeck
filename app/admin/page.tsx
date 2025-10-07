import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { db } from '@/db';
import { organization, project, user as userTable, feedback } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { sql, eq, count } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Building2, MessageSquare, Activity, TrendingUp, AlertCircle, Shield } from 'lucide-react';

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

  if (!dbUser || (dbUser.systemRole !== 'admin' && dbUser.systemRole !== 'super_admin')) {
    redirect('/');
  }

  const isSuperAdmin = dbUser.systemRole === 'super_admin';

  // Aggregate counts for admin overview
  const [[orgCount], [userCount], [projectCount], [feedbackCount]] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(organization),
    db.select({ count: sql<number>`count(*)` }).from(userTable),
    db.select({ count: sql<number>`count(*)` }).from(project),
    db.select({ count: sql<number>`count(*)` }).from(feedback),
  ]);

  // Additional stats for super admin
  const [activeUsersResult, adminUsersResult, superAdminUsersResult] = isSuperAdmin ? await Promise.all([
    db.select({ count: count() }).from(userTable).where(eq(userTable.systemRole, "user")),
    db.select({ count: count() }).from(userTable).where(eq(userTable.systemRole, "admin")),
    db.select({ count: count() }).from(userTable).where(eq(userTable.systemRole, "super_admin")),
  ]) : [null, null, null];

  const activeUsers = activeUsersResult?.[0];
  const adminUsers = adminUsersResult?.[0];
  const superAdminUsers = superAdminUsersResult?.[0];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isSuperAdmin ? 'Super Admin Dashboard' : 'Admin Dashboard'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isSuperAdmin
              ? 'Platform-wide overview and management'
              : 'Organization management and analytics'
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant={isSuperAdmin ? "default" : "secondary"} className="text-sm">
            {isSuperAdmin ? (
              <>
                <Shield className="w-3 h-3 mr-1" />
                Super Admin
              </>
            ) : (
              <>
                <Users className="w-3 h-3 mr-1" />
                Admin
              </>
            )}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{orgCount?.count ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isSuperAdmin ? 'Total organizations' : 'Your organizations'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{userCount?.count ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isSuperAdmin ? 'Total registered users' : 'Organization members'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{projectCount?.count ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Active feedback projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Feedback</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{feedbackCount?.count ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Total submissions</p>
          </CardContent>
        </Card>
      </div>

      {isSuperAdmin && (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Regular Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{activeUsers?.count ?? 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Standard user accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{adminUsers?.count ?? 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Organization admins</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Super Admins</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{superAdminUsers?.count ?? 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Platform administrators</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform Status</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-green-600">Live</div>
              <p className="text-xs text-muted-foreground mt-1">All systems operational</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              {isSuperAdmin
                ? 'Platform management tools'
                : 'Organization management'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {isSuperAdmin ? (
                <>
                  <Badge variant="outline">User Management</Badge>
                  <Badge variant="outline">System Settings</Badge>
                  <Badge variant="outline">Analytics</Badge>
                  <Badge variant="outline">Platform Health</Badge>
                </>
              ) : (
                <>
                  <Badge variant="outline">Manage Projects</Badge>
                  <Badge variant="outline">View Feedback</Badge>
                  <Badge variant="outline">Team Members</Badge>
                  <Badge variant="outline">Settings</Badge>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest {isSuperAdmin ? 'platform' : 'organization'} events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Activity tracking coming soon...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

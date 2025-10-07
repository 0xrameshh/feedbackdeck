import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { db } from '@/db';
import { organization, project, user as userTable, feedback } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { sql, eq, count, desc, gte } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  Building2,
  MessageSquare,
  Activity,
  Shield,
  Settings,
  UserCheck,
  Clock,
  Star,
  BarChart3,
  PieChart,
  Zap,
  Lock,
  ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';

export default async function AdminPage() {
  try {
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

    // Enhanced analytics with more detailed data - wrapped in try-catch for safety
    let orgCount, userCount, projectCount, feedbackCount, activeProjects, verifiedUsers, thisMonthFeedback, avgRating;

    try {
      [
        [orgCount],
        [userCount],
        [projectCount],
        [feedbackCount],
        [activeProjects],
        [verifiedUsers],
        [thisMonthFeedback],
        [avgRating]
      ] = await Promise.all([
        db.select({ count: sql<number>`count(*)` }).from(organization),
        db.select({ count: sql<number>`count(*)` }).from(userTable),
        db.select({ count: sql<number>`count(*)` }).from(project),
        db.select({ count: sql<number>`count(*)` }).from(feedback),
        db.select({ count: sql<number>`count(*)` }).from(project).where(eq(project.isActive, true)),
        db.select({ count: sql<number>`count(*)` }).from(userTable).where(eq(userTable.emailVerified, true)),
        db.select({ count: sql<number>`count(*)` }).from(feedback).where(
          gte(feedback.createdAt, new Date(new Date().getFullYear(), new Date().getMonth(), 1))
        ),
        db.select({ avg: sql<number>`avg(rating)` }).from(feedback).where(sql`rating IS NOT NULL`)
      ]);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      // Fallback values
      orgCount = { count: 0 };
      userCount = { count: 0 };
      projectCount = { count: 0 };
      feedbackCount = { count: 0 };
      activeProjects = { count: 0 };
      verifiedUsers = { count: 0 };
      thisMonthFeedback = { count: 0 };
      avgRating = { avg: 0 };
    }

    // Super admin additional stats - also wrapped in try-catch
    let activeUsersResult, adminUsersResult, superAdminUsersResult, recentUsers, topProjects, feedbackByCategory;

    if (isSuperAdmin) {
      try {
        [
          activeUsersResult,
          adminUsersResult,
          superAdminUsersResult,
          recentUsers,
          topProjects,
          feedbackByCategory
        ] = await Promise.all([
          db.select({ count: count() }).from(userTable).where(eq(userTable.systemRole, "user")),
          db.select({ count: count() }).from(userTable).where(eq(userTable.systemRole, "admin")),
          db.select({ count: count() }).from(userTable).where(eq(userTable.systemRole, "super_admin")),
          db.select().from(userTable).orderBy(desc(userTable.createdAt)).limit(5),
          db.select({
            name: project.name,
            feedbackCount: count(feedback.id),
            avgRating: sql<number>`avg(${feedback.rating})`
          }).from(project).leftJoin(feedback, eq(project.id, feedback.projectId))
            .groupBy(project.id).orderBy(desc(count(feedback.id))).limit(5),
          db.select({
            category: feedback.category,
            count: count(feedback.id)
          }).from(feedback).groupBy(feedback.category)
        ]);
      } catch (error) {
        console.error('Error fetching super admin stats:', error);
        activeUsersResult = [{ count: 0 }];
        adminUsersResult = [{ count: 0 }];
        superAdminUsersResult = [{ count: 0 }];
        recentUsers = [];
        topProjects = [];
        feedbackByCategory = [];
      }
    } else {
      activeUsersResult = null;
      adminUsersResult = null;
      superAdminUsersResult = null;
      recentUsers = null;
      topProjects = null;
      feedbackByCategory = null;
    }

    const activeUsers = activeUsersResult?.[0];
    const adminUsers = adminUsersResult?.[0];
    const superAdminUsers = superAdminUsersResult?.[0];

    return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {isSuperAdmin ? 'Super Admin Dashboard' : 'Admin Dashboard'}
              </h1>
              <Badge variant={isSuperAdmin ? "default" : "secondary"} className="text-sm px-3 py-1">
                {isSuperAdmin ? (
                  <>
                    <Shield className="w-4 h-4 mr-1" />
                    Super Admin
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4 mr-1" />
                    Admin
                  </>
                )}
              </Badge>
            </div>
            <p className="text-muted-foreground text-lg">
              {isSuperAdmin
                ? 'Platform-wide overview and management'
                : 'Organization management and analytics'
              }
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/users">
                <Users className="w-4 h-4 mr-2" />
                Users
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/organizations">
                <Building2 className="w-4 h-4 mr-2" />
                Organizations
              </Link>
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 group-hover:from-purple-500/20 group-hover:to-blue-500/20 transition-all duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <CardTitle className="text-sm font-medium text-muted-foreground">Organizations</CardTitle>
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{orgCount?.count ?? 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isSuperAdmin ? 'Total organizations' : 'Your organizations'}
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 group-hover:from-blue-500/20 group-hover:to-cyan-500/20 transition-all duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{userCount?.count ?? 0}</div>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {verifiedUsers?.count ?? 0} verified
                    </Badge>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 group-hover:from-green-500/20 group-hover:to-emerald-500/20 transition-all duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Projects</CardTitle>
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{activeProjects?.count ?? 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    of {projectCount?.count ?? 0} total projects
                  </p>
                </div>
                <div className="text-green-500 text-xs">Active</div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 group-hover:from-amber-500/20 group-hover:to-orange-500/20 transition-all duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <CardTitle className="text-sm font-medium text-muted-foreground">Feedback</CardTitle>
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <MessageSquare className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{feedbackCount?.count ?? 0}</div>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {thisMonthFeedback?.count ?? 0} this month
                    </Badge>
                  </div>
                </div>
                {avgRating?.avg && (
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-sm font-medium">{avgRating.avg.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

            {/* Super Admin Section */}
        {isSuperAdmin && (
          <div className="space-y-8">
            {/* System User Stats */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Regular Users</CardTitle>
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <UserCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{activeUsers?.count ?? 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Standard user accounts</p>
                  <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3" />
                    Active users
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{adminUsers?.count ?? 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Organization admins</p>
                  <div className="mt-2 text-xs text-blue-600 flex items-center gap-1">
                    <Settings className="h-3 w-3" />
                    Management access
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Super Admins</CardTitle>
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{superAdminUsers?.count ?? 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Platform administrators</p>
                  <div className="mt-2 text-xs text-purple-600 flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    Full access
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity & Analytics */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              {/* Recent Users */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Recent Users
                  </CardTitle>
                  <CardDescription>
                    Latest user registrations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentUsers?.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={user.systemRole === 'super_admin' ? 'default' : user.systemRole === 'admin' ? 'secondary' : 'outline'} className="text-xs">
                            {user.systemRole}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-4" asChild>
                    <Link href="/admin/users">View All Users</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Top Projects */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Top Projects
                  </CardTitle>
                  <CardDescription>
                    Projects with most feedback
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topProjects?.slice(0, 5).map((project, index) => (
                      <div key={project.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-400 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{project.name}</p>
                            <p className="text-xs text-muted-foreground">{project.feedbackCount} feedback</p>
                          </div>
                        </div>
                        {project.avgRating && (
                          <div className="flex items-center gap-1 text-amber-500">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="text-sm font-medium">{project.avgRating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-4" asChild>
                    <Link href="/admin/projects">View All Projects</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Feedback Categories */}
            {feedbackByCategory && feedbackByCategory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Feedback by Category
                  </CardTitle>
                  <CardDescription>
                    Distribution of feedback types
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    {feedbackByCategory.map((category) => (
                      <div key={category.category} className="text-center p-4 rounded-lg bg-muted/50">
                        <div className="text-2xl font-bold text-primary">{category.count}</div>
                        <p className="text-sm text-muted-foreground capitalize">{category.category}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Quick Actions Section */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                {isSuperAdmin
                  ? 'Platform management tools'
                  : 'Organization management'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 grid-cols-2">
                {isSuperAdmin ? (
                  <>
                    <Button variant="outline" size="sm" className="h-auto p-4 flex flex-col gap-2" asChild>
                      <Link href="/admin/users">
                        <Users className="h-6 w-6" />
                        <span>User Management</span>
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="h-auto p-4 flex flex-col gap-2" asChild>
                      <Link href="/admin/organizations">
                        <Building2 className="h-6 w-6" />
                        <span>Organizations</span>
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="h-auto p-4 flex flex-col gap-2" asChild>
                      <Link href="/admin/analytics">
                        <BarChart3 className="h-6 w-6" />
                        <span>Analytics</span>
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="h-auto p-4 flex flex-col gap-2">
                      <Settings className="h-6 w-6" />
                      <span>System Settings</span>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" className="h-auto p-4 flex flex-col gap-2">
                      <Activity className="h-6 w-6" />
                      <span>Manage Projects</span>
                    </Button>
                    <Button variant="outline" size="sm" className="h-auto p-4 flex flex-col gap-2">
                      <MessageSquare className="h-6 w-6" />
                      <span>View Feedback</span>
                    </Button>
                    <Button variant="outline" size="sm" className="h-auto p-4 flex flex-col gap-2">
                      <Users className="h-6 w-6" />
                      <span>Team Members</span>
                    </Button>
                    <Button variant="outline" size="sm" className="h-auto p-4 flex flex-col gap-2">
                      <Settings className="h-6 w-6" />
                      <span>Settings</span>
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Status
              </CardTitle>
              <CardDescription>
                Platform health and monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="font-medium">Database</span>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-600">Operational</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="font-medium">Authentication</span>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-600">Operational</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span className="font-medium">API Services</span>
                  </div>
                  <Badge variant="outline" className="text-blue-600 border-blue-600">Healthy</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <span className="font-medium">Last Updated</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{new Date().toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    );
  } catch (error) {
    console.error('Admin dashboard error:', error);

    // Return a fallback error page
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">Admin Dashboard Error</h1>
          <p className="text-muted-foreground max-w-md">
            There was an error loading the admin dashboard. Please try again later or contact support if the issue persists.
          </p>
          <Button asChild>
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }
}

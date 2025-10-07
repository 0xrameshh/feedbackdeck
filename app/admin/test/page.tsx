import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { db } from '@/db';
import { user as userTable } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { sql } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Check, X } from 'lucide-react';

export default async function AdminTestPage() {
  try {
    // Test basic auth first
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');
    const h = new Headers();
    if (cookieHeader) h.set('cookie', cookieHeader);
    const session = await getSession({ headers: h });

    if (!session?.user?.id) {
      redirect('/login');
    }

    // Test database connection with simple query
    let dbUser = null;
    let dbConnectionStatus = 'unknown';

    try {
      [dbUser] = await db
        .select()
        .from(userTable)
        .where(sql`${userTable.id} = ${session.user.id}`)
        .limit(1);
      dbConnectionStatus = 'connected';
    } catch (error) {
      console.error('Database connection test failed:', error);
      dbConnectionStatus = 'failed';
    }

    // Test role access
    const hasAccess = dbUser && (dbUser.systemRole === 'admin' || dbUser.systemRole === 'super_admin');
    const isSuperAdmin = dbUser?.systemRole === 'super_admin';

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Admin Access Test</h1>
            <p className="text-muted-foreground">Testing admin dashboard functionality</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Authentication Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Session Active:</span>
                  {session ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <X className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>User ID:</span>
                  <span className="font-mono text-sm">{session?.user?.id || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>User Email:</span>
                  <span className="text-sm">{session?.user?.email || 'N/A'}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Check className="h-5 w-5" />
                  Database Connection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Database Status:</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    dbConnectionStatus === 'connected'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {dbConnectionStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>User Found:</span>
                  {dbUser ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <X className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>System Role:</span>
                  <span className="font-mono text-sm">{dbUser?.systemRole || 'N/A'}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Admin Access Check
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2">
                  {hasAccess ? (
                    <div className="flex items-center gap-2">
                      <Check className="h-6 w-6 text-green-500" />
                      <span className="text-green-600 font-medium">Admin Access Granted</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <X className="h-6 w-6 text-red-500" />
                      <span className="text-red-600 font-medium">Admin Access Denied</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <p>
                    {isSuperAdmin
                      ? 'You have Super Admin privileges'
                      : hasAccess
                        ? 'You have Admin privileges'
                        : 'You do not have admin privileges'
                    }
                  </p>

                  {hasAccess && (
                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-green-700 dark:text-green-300">
                        ✅ You can access the main admin dashboard
                      </p>
                      <div className="mt-2">
                        <a
                          href="/admin"
                          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                          Go to Admin Dashboard
                        </a>
                      </div>
                    </div>
                  )}

                  {!hasAccess && (
                    <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <p className="text-amber-700 dark:text-amber-300">
                        ⚠️ You need admin privileges to access the admin dashboard
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Contact an administrator if you believe this is an error.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Admin test page error:', error);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <h1 className="text-2xl font-bold text-red-600">Test Error</h1>
          <p className="text-muted-foreground">There was an error running the admin test.</p>
          <pre className="text-xs text-red-500 bg-red-50 p-4 rounded-lg text-left">
            {error instanceof Error ? error.message : String(error)}
          </pre>
        </div>
      </div>
    );
  }
}
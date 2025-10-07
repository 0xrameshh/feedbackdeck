import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function middleware(request: NextRequest) {
    // Protect admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
        const cookieHeader = request.headers.get('cookie');
        if (!cookieHeader) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // Create a mock Headers object for auth
        const headers = new Headers();
        headers.set('cookie', cookieHeader);

        try {
            // Import auth dynamically to avoid issues
            const { auth } = await import("@/lib/auth");
            const session = await auth.api.getSession({
                headers
            });

            if (!session?.user?.id) {
                return NextResponse.redirect(new URL('/login', request.url));
            }

            // Fetch full user from database to check systemRole
            const [fullUser] = await db
                .select()
                .from(user)
                .where(eq(user.id, session.user.id))
                .limit(1);

            const userRole = fullUser?.systemRole;
            if (userRole !== 'admin' && userRole !== 'super_admin') {
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }
        } catch (error) {
            console.error('Admin middleware error:', error);
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // Only protect API routes that need authentication
    if (request.nextUrl.pathname.startsWith('/api/') &&
        !request.nextUrl.pathname.startsWith('/api/auth')) {

        // For API routes, just let them handle their own auth
        // Individual API routes will check authentication
        return NextResponse.next();
    }

    // Let all other routes pass through
    // Dashboard protection will be handled by AuthGuard component
    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/api/projects/(.*)", "/api/feedback/(.*)"],
};
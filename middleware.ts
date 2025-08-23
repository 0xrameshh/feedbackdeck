import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
    // Allow API auth routes to pass through
    if (request.nextUrl.pathname.startsWith('/api/auth')) {
        return NextResponse.next();
    }

    // Simple cookie check - more reliable in edge runtime
    const sessionCookie = getSessionCookie(request);

    if (!sessionCookie) {
        // For API routes, return 401
        if (request.nextUrl.pathname.startsWith('/api/')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        // For dashboard routes, redirect to home
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard", "/dashboard/(.*)", "/api/dashboard/(.*)", "/api/projects/(.*)", "/api/feedback/(.*)"],
};
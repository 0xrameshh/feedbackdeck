import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    // For now, let admin routes pass through - we'll protect them at the page level
    // This avoids database issues in edge middleware
    if (request.nextUrl.pathname.startsWith('/admin')) {
        return NextResponse.next();
    }

    // Only protect API routes that need authentication
    if (request.nextUrl.pathname.startsWith('/api/') &&
        !request.nextUrl.pathname.startsWith('/api/auth')) {

        // For API routes, just let them handle their own auth
        // Individual API routes will check authentication
        return NextResponse.next();
    }

    // Let all other routes pass through
    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/api/projects/(.*)", "/api/feedback/(.*)"],
};
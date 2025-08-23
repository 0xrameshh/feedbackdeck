import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
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
    matcher: ["/api/projects/(.*)", "/api/feedback/(.*)"],
};
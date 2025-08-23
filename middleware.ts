import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    // Allow API auth routes to pass through
    if (request.nextUrl.pathname.startsWith('/api/auth')) {
        return NextResponse.next();
    }

    try {
        const session = await auth.api.getSession({
            headers: request.headers
        });

        if (!session) {
            // For API routes, return 401
            if (request.nextUrl.pathname.startsWith('/api/')) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
            // For dashboard routes, redirect to home
            return NextResponse.redirect(new URL("/", request.url));
        }

        return NextResponse.next();
    } catch (error) {
        console.error('Middleware auth check failed:', error);
        
        // For API routes, return 401
        if (request.nextUrl.pathname.startsWith('/api/')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        // For dashboard routes, redirect to home
        return NextResponse.redirect(new URL("/", request.url));
    }
}

export const config = {
    matcher: ["/dashboard", "/dashboard/(.*)", "/api/dashboard/(.*)", "/api/projects/(.*)", "/api/feedback/(.*)"],
};
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if accessing admin routes
    if (pathname.startsWith('/admin')) {
        const session = request.cookies.get('session');
        if (!session || !session.value) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('from', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // We removed the automatic /login -> /admin redirect to prevent infinite loops 
    // when a session is invalidated by the server but the cookie still exists.
    // The user will just see the login form and can re-authenticate.

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/login'],
};

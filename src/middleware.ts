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

    // Already logged in, redirect from /login to /admin
    if (pathname === '/login') {
        const session = request.cookies.get('session');
        if (session && session.value) {
            return NextResponse.redirect(new URL('/admin', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/login'],
};

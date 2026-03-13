import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST() {
    const response = NextResponse.json({ success: true });
    // Clear session cookies
    response.cookies.set('session', '', { maxAge: 0, path: '/' });
    response.cookies.set('user_role', '', { maxAge: 0, path: '/' });
    response.cookies.set('user_id', '', { maxAge: 0, path: '/' });
    response.cookies.set('user_full_name', '', { maxAge: 0, path: '/' });
    response.cookies.set('user_email', '', { maxAge: 0, path: '/' });
    return response;
}

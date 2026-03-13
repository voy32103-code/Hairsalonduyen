import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ success: false, message: 'Vui lòng cung cấp đầy đủ email và mật khẩu.' }, { status: 400 });
        }

        // Query database for user with matching email and password (case-insensitive email)
        const userRes = await pool.query(`
            SELECT u.id, u.full_name, r.name as role 
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE LOWER(u.email) = LOWER($1) AND u.password = $2
            LIMIT 1
        `, [email, password]);

        const user = userRes.rows[0];
        if (!user) {
            return NextResponse.json({ success: false, message: 'Email hoặc mật khẩu không đúng.' }, { status: 401 });
        }

        // Generate a new session token to force single-device login
        const sessionToken = crypto.randomUUID();
        
        // Update database with the new token
        await pool.query('UPDATE users SET session_token = $1 WHERE id = $2', [sessionToken, user.id]);

        const response = NextResponse.json({ success: true, role: user.role });
        response.cookies.set('session', sessionToken, {
            httpOnly: true,
            path: '/',
            maxAge: 60 * 60 * 24, // 24 hours
            sameSite: 'strict',
        });
        response.cookies.set('user_role', user.role, {
            httpOnly: false,
            path: '/',
            maxAge: 60 * 60 * 24,
        });
        response.cookies.set('user_id', user.id, {
            httpOnly: false,
            path: '/',
            maxAge: 60 * 60 * 24,
        });
        response.cookies.set('user_full_name', user.full_name, {
            httpOnly: false,
            path: '/',
            maxAge: 60 * 60 * 24,
        });
        response.cookies.set('user_email', email, {
            httpOnly: false,
            path: '/',
            maxAge: 60 * 60 * 24,
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ success: false, message: 'Lỗi server.' }, { status: 500 });
    }
}

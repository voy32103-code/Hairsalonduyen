import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const { fullName, email, password, phone } = await request.json();

        if (!fullName || !email || !password || !phone) {
            return NextResponse.json({ success: false, message: 'Vui lòng điền đầy đủ các trường.' }, { status: 400 });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Basic phone validation
        if (!phone || phone.length < 10) {
            return NextResponse.json({ success: false, message: 'Số điện thoại không hợp lệ.' }, { status: 400 });
        }

        // Check if user exists (case-insensitive)
        const checkUser = await pool.query('SELECT id FROM users WHERE LOWER(email) = $1', [normalizedEmail]);
        if (checkUser.rows.length > 0) {
            return NextResponse.json({ success: false, message: 'Email này đã được sử dụng.' }, { status: 400 });
        }

        // Get default 'staff' role id if no specific role logic
        const roleRes = await pool.query("SELECT id FROM roles WHERE name = 'staff' LIMIT 1");
        const roleId = roleRes.rows[0]?.id;

        // In a real app, hash the password! For demo, storing plain text as requested for login simplicity
        await pool.query(
            'INSERT INTO users (full_name, email, password, phone, role_id) VALUES ($1, $2, $3, $4, $5)',
            [fullName, normalizedEmail, password, phone, roleId]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ success: false, message: 'Lỗi server khi đăng ký.' }, { status: 500 });
    }
}

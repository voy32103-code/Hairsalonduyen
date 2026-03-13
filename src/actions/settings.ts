'use server';

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { getSessionUser } from '@/lib/auth';

export async function updateSettings(formData: FormData) {
    try {
        const fullName = formData.get('fullName') as string;
        const phone = formData.get('phone') as string;
        const email = formData.get('email') as string;
        const userId = formData.get('userId') as string;

        const sessionUser = await getSessionUser();
        if (!sessionUser) throw new Error('Unauthorized');

        // Security check: only own settings or admin
        if (sessionUser.role !== 'admin' && sessionUser.id !== userId) {
            return { success: false, message: 'Bạn không có quyền chỉnh sửa tài khoản này.' };
        }

        if (!userId) return { success: false, message: 'Không tìm thấy người dùng.' };

        const normalizedEmail = email.toLowerCase().trim();

        await pool.query(
            'UPDATE users SET full_name = $1, phone = $2, email = $3 WHERE id = $4',
            [fullName, phone, normalizedEmail, userId]
        );

        // If updating own profile, refresh identity cookies
        if (sessionUser.id === userId) {
            const cookieStore = await cookies();
            cookieStore.set('user_full_name', fullName, { path: '/', maxAge: 60 * 60 * 24 });
            cookieStore.set('user_email', normalizedEmail, { path: '/', maxAge: 60 * 60 * 24 });
        }

        revalidatePath('/admin/settings');
        return { success: true };
    } catch (error) {
        console.error('Failed to update settings:', error);
        return { success: false, message: 'Lỗi khi lưu thông tin.' };
    }
}

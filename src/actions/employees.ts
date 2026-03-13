'use server';

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { broadcastSSE } from '@/app/api/events/route';
import { authorize } from '@/lib/auth';

export async function createEmployee(formData: FormData) {
    try {
        await authorize('employees', 'create');
        const fullName = formData.get('fullName') as string;
        const email = (formData.get('email') as string).toLowerCase().trim();
        const phone = formData.get('phone') as string;
        const roleName = formData.get('role') as string;

        if (!email.includes('@')) throw new Error('Email không hợp lệ');

        const roleRes = await pool.query('SELECT id FROM roles WHERE name = $1', [roleName.toLowerCase()]);
        if (roleRes.rows.length === 0) throw new Error('Role not found');
        const roleId = roleRes.rows[0].id;

        await pool.query(
            'INSERT INTO users (full_name, email, phone, role_id) VALUES ($1, $2, $3, $4)',
            [fullName, email, phone, roleId]
        );

        broadcastSSE('new_employee', { name: fullName });
        revalidatePath('/admin/employees');
        return { success: true };
    } catch (error) {
        console.error('Failed to create employee:', error);
        return { success: false, message: 'Lỗi khi thêm nhân viên.' };
    }
}

export async function deleteEmployee(id: string) {
    try {
        await authorize('employees', 'delete');
        await pool.query('DELETE FROM users WHERE id = $1', [id]);
        revalidatePath('/admin/employees');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete employee:', error);
        return { success: false, message: 'Lỗi khi xóa nhân viên.' };
    }
}

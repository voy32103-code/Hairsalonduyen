'use server';

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getSessionUser } from '@/lib/auth';

export async function createCustomer(formData: FormData) {
    try {
        const sessionUser = await getSessionUser();
        if (!sessionUser) throw new Error('Unauthorized');

        // Check permission if needed, but usually staff can create customers
        // For now, let's assume any logged in user can stay consistent with general hair salon flow

        const fullName = formData.get('fullName') as string;
        const phone = formData.get('phone') as string;
        const email = formData.get('email') as string;
        const note = formData.get('note') as string;

        if (!fullName) return { success: false, message: 'Vui lòng nhập tên khách hàng.' };

        await pool.query(
            'INSERT INTO customers (full_name, phone, email, note) VALUES ($1, $2, $3, $4)',
            [fullName, phone, email.toLowerCase().trim(), note]
        );

        revalidatePath('/admin/customers');
        return { success: true };
    } catch (error) {
        console.error('Failed to create customer:', error);
        return { success: false, message: 'Lỗi khi tạo khách hàng.' };
    }
}

export async function updateCustomer(formData: FormData) {
    try {
        const sessionUser = await getSessionUser();
        if (!sessionUser) throw new Error('Unauthorized');

        const id = formData.get('id') as string;
        const fullName = formData.get('fullName') as string;
        const phone = formData.get('phone') as string;
        const email = formData.get('email') as string;
        const note = formData.get('note') as string;

        if (!id || !fullName) return { success: false, message: 'Thiếu thông tin khách hàng.' };

        await pool.query(
            'UPDATE customers SET full_name = $1, phone = $2, email = $3, note = $4 WHERE id = $5',
            [fullName, phone, email.toLowerCase().trim(), note, id]
        );

        revalidatePath('/admin/customers');
        return { success: true };
    } catch (error) {
        console.error('Failed to update customer:', error);
        return { success: false, message: 'Lỗi khi cập nhật khách hàng.' };
    }
}

export async function deleteCustomer(id: string) {
    try {
        const sessionUser = await getSessionUser();
        if (!sessionUser || sessionUser.role !== 'admin') {
            return { success: false, message: 'Chỉ Admin mới có quyền xoá khách hàng.' };
        }

        await pool.query('DELETE FROM customers WHERE id = $1', [id]);

        revalidatePath('/admin/customers');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete customer:', error);
        return { success: false, message: 'Lỗi khi xoá khách hàng.' };
    }
}

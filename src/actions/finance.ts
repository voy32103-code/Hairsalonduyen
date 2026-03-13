'use server';

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { broadcastSSE } from '@/app/api/events/route';
import { authorize, getSessionUser } from '@/lib/auth';

export async function createExpense(formData: FormData) {
    try {
        await authorize('finance', 'create');
        const title = formData.get('title') as string;
        const amount = parseFloat(formData.get('amount') as string);
        const category = formData.get('category') as string;
        const note = formData.get('note') as string;
        const expenseDate = (formData.get('expenseDate') as string) || new Date().toISOString().split('T')[0];

        const user = await getSessionUser();
        const createdBy = user?.id || null;

        await pool.query(
            'INSERT INTO expenses (title, amount, category, expense_date, note, created_by) VALUES ($1, $2, $3, $4, $5, $6)',
            [title, amount, category, expenseDate, note || null, createdBy]
        );

        broadcastSSE('new_expense', { title, amount });
        revalidatePath('/admin/finance');
        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        console.error('Failed to create expense:', error);
        return { success: false, message: 'Lỗi khi ghi nhận chi tiêu.' };
    }
}

export async function deleteExpense(id: string) {
    try {
        await authorize('finance', 'delete');
        await pool.query('DELETE FROM expenses WHERE id = $1', [id]);
        revalidatePath('/admin/finance');
        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete expense:', error);
        return { success: false, message: 'Lỗi khi xóa khoản chi.' };
    }
}

'use server';

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { authorize } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function createPayroll(formData: FormData) {
    try {
        await authorize('finance', 'edit');

        const employeeId = formData.get('employeeId') as string;
        const periodMonth = parseInt(formData.get('periodMonth') as string);
        const periodYear = parseInt(formData.get('periodYear') as string);
        const baseSalary = parseFloat(formData.get('baseSalary') as string) || 0;
        const bonus = parseFloat(formData.get('bonus') as string) || 0;
        const deductions = parseFloat(formData.get('deductions') as string) || 0;
        const note = formData.get('note') as string;

        const cookieStore = await cookies();
        const createdBy = cookieStore.get('user_id')?.value;

        await pool.query(`
            INSERT INTO payroll (employee_id, period_month, period_year, base_salary, bonus, deductions, note, created_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (employee_id, period_month, period_year) DO UPDATE SET
                base_salary = EXCLUDED.base_salary,
                bonus = EXCLUDED.bonus,
                deductions = EXCLUDED.deductions,
                note = EXCLUDED.note,
                updated_at = NOW()
        `, [employeeId, periodMonth, periodYear, baseSalary, bonus, deductions, note, createdBy]);

        revalidatePath('/admin/finance/payroll');
        return { success: true };
    } catch (error: any) {
        console.error('Failed to create/update payroll:', error);
        return { success: false, message: error.message || 'Lỗi khi lưu bảng lương.' };
    }
}

export async function updatePayrollStatus(id: string, status: string) {
    try {
        await authorize('finance', 'edit');
        
        await pool.query(`
            UPDATE payroll 
            SET status = $1::payroll_status, updated_at = NOW() 
            WHERE id = $2
        `, [status, id]);

        revalidatePath('/admin/finance/payroll');
        return { success: true };
    } catch (error: any) {
        console.error('Failed to update payroll status:', error);
        return { success: false, message: error.message || 'Lỗi khi cập nhật trạng thái.' };
    }
}

export async function deletePayroll(id: string) {
    try {
        await authorize('finance', 'delete');
        await pool.query('DELETE FROM payroll WHERE id = $1', [id]);
        revalidatePath('/admin/finance/payroll');
        return { success: true };
    } catch (error: any) {
        console.error('Failed to delete payroll:', error);
        return { success: false, message: error.message || 'Lỗi khi xóa bảng lương.' };
    }
}

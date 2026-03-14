'use server';

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { authorize } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function createSchedule(formData: FormData) {
    try {
        await authorize('employees', 'edit'); // Assuming managers can edit schedules

        const employeeId = formData.get('employeeId') as string;
        const date = formData.get('date') as string;
        const shiftStart = formData.get('shiftStart') as string;
        const shiftEnd = formData.get('shiftEnd') as string;
        const note = formData.get('note') as string;

        const cookieStore = await cookies();
        const createdBy = cookieStore.get('user_id')?.value;

        await pool.query(`
            INSERT INTO work_schedules (employee_id, date, shift_start, shift_end, note, created_by)
            VALUES ($1, $2, $3, $4, $5, $6)
        `, [employeeId, date, shiftStart, shiftEnd, note, createdBy]);

        revalidatePath('/admin/employees/schedule');
        return { success: true };
    } catch (error: any) {
        console.error('Failed to create schedule:', error);
        return { success: false, message: error.message || 'Lỗi khi tạo lịch làm việc.' };
    }
}

export async function updateScheduleStatus(id: string, status: string) {
    try {
        await authorize('employees', 'edit');
        
        await pool.query(`
            UPDATE work_schedules 
            SET status = $1::shift_status, updated_at = NOW() 
            WHERE id = $2
        `, [status, id]);

        revalidatePath('/admin/employees/schedule');
        return { success: true };
    } catch (error: any) {
        console.error('Failed to update schedule status:', error);
        return { success: false, message: error.message || 'Lỗi khi cập nhật trạng thái.' };
    }
}

export async function deleteSchedule(id: string) {
    try {
        await authorize('employees', 'delete');
        await pool.query('DELETE FROM work_schedules WHERE id = $1', [id]);
        revalidatePath('/admin/employees/schedule');
        return { success: true };
    } catch (error: any) {
        console.error('Failed to delete schedule:', error);
        return { success: false, message: error.message || 'Lỗi khi xóa lịch làm việc.' };
    }
}

'use server';

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getSessionUser } from '@/lib/auth';

export async function clockIn(note?: string) {
    try {
        const user = await getSessionUser();
        if (!user) throw new Error('Unauthorized');

        // Check for existing active session for today (where check_out is NULL)
        const existingRes = await pool.query(
            'SELECT id FROM attendance WHERE user_id = $1 AND check_out IS NULL LIMIT 1',
            [user.id]
        );

        if (existingRes.rows.length > 0) {
            return { success: false, message: 'Bạn đã có một phiên làm việc đang diễn ra.' };
        }

        // --- LATE DETECTION LOGIC ---
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        let status = 'present';

        // Check if there's a work schedule for today
        const scheduleRes = await pool.query(
            'SELECT shift_start FROM work_schedules WHERE employee_id = $1 AND date = $2 LIMIT 1',
            [user.id, todayStr]
        );

        if (scheduleRes.rows.length > 0) {
            const shiftStartStr = scheduleRes.rows[0].shift_start; // "HH:mm"
            const [sHour, sMin] = shiftStartStr.split(':').map(Number);
            
            const shiftStartTime = new Date(now);
            shiftStartTime.setHours(sHour, sMin, 0, 0);

            // If check-in is more than 5 minutes after shift start
            const gracePeriodMins = 5;
            const diffMins = (now.getTime() - shiftStartTime.getTime()) / (1000 * 60);

            if (diffMins > gracePeriodMins) {
                status = 'late';
            }
        } else {
            // No schedule found for today? Mark as overtime or just present
            status = 'present'; 
        }

        await pool.query(
            'INSERT INTO attendance (user_id, check_in, note, status) VALUES ($1, NOW(), $2, $3)',
            [user.id, note, status]
        );

        const message = status === 'late' ? 'Chấm công thành công (Bạn đã đi trễ).' : 'Chấm công thành công!';
        revalidatePath('/admin');
        revalidatePath('/admin/employees/attendance');
        return { success: true, message };
    } catch (error: any) {
        console.error('Clock-in failed:', error);
        return { success: false, message: 'Lỗi khi chấm công vào.' };
    }
}

export async function clockOut(note?: string) {
    try {
        const user = await getSessionUser();
        if (!user) throw new Error('Unauthorized');

        const activeRes = await pool.query(
            'SELECT id FROM attendance WHERE user_id = $1 AND check_out IS NULL ORDER BY check_in DESC LIMIT 1',
            [user.id]
        );

        if (activeRes.rows.length === 0) {
            return { success: false, message: 'Không tìm thấy phiên làm việc đang diễn ra.' };
        }

        await pool.query(
            'UPDATE attendance SET check_out = NOW(), note = COALESCE($1, note), updated_at = NOW() WHERE id = $2',
            [note, activeRes.rows[0].id]
        );

        revalidatePath('/admin');
        revalidatePath('/admin/employees/attendance');
        return { success: true };
    } catch (error: any) {
        console.error('Clock-out failed:', error);
        return { success: false, message: 'Lỗi khi chấm công ra.' };
    }
}

'use server';

import pool from '@/lib/db';
import { authorize } from '@/lib/auth';

export async function sendReminder(appointmentId: string) {
    try {
        await authorize('appointments', 'edit');

        // Fetch customer info
        const res = await pool.query(`
            SELECT a.appointment_time, c.full_name as customer_name, c.phone
            FROM appointments a
            JOIN customers c ON a.customer_id = c.id
            WHERE a.id = $1
        `, [appointmentId]);

        if (res.rows.length === 0) throw new Error('Không tìm thấy lịch hẹn.');

        const appt = res.rows[0];
        const time = new Date(appt.appointment_time).toLocaleString('vi-VN');

        // MOCK SMS SENDING
        console.log(`[MOCK SMS] Sending reminder to ${appt.customer_name} (${appt.phone}): "Chào bạn, đừng quên lịch hẹn cắt tóc lúc ${time} nhé!"`);
        
        // In a real app, we'd call an SMS API here (Twilio, eSMS.vn, etc.)

        return { success: true, message: `Đã gửi lời nhắc đến ${appt.customer_name} (${appt.phone})` };
    } catch (error: any) {
        console.error('Reminder failed:', error);
        return { success: false, message: error.message || 'Lỗi khi gửi lời nhắc.' };
    }
}

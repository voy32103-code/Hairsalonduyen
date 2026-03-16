import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const { userId, type, note } = await request.json(); // type: 'in' | 'out'

        if (!userId) {
            return NextResponse.json({ success: false, message: 'Missing userId' }, { status: 400 });
        }

        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        if (type === 'in') {
            // Check for existing active session for today (where check_out is NULL)
            const existingRes = await pool.query(
                'SELECT id FROM attendance WHERE user_id = $1 AND check_out IS NULL LIMIT 1',
                [userId]
            );

            if (existingRes.rows.length > 0) {
                return NextResponse.json({ success: false, message: 'Bạn đã có một phiên làm việc đang diễn ra.' });
            }

            let status = 'present';

            // Check if there's a work schedule for today
            const scheduleRes = await pool.query(
                'SELECT shift_start FROM work_schedules WHERE employee_id = $1 AND date = $2 LIMIT 1',
                [userId, todayStr]
            );

            if (scheduleRes.rows.length > 0) {
                const shiftStartStr = scheduleRes.rows[0].shift_start; // "HH:mm"
                const [sHour, sMin] = shiftStartStr.split(':').map(Number);
                
                const shiftStartTime = new Date(now);
                shiftStartTime.setHours(sHour, sMin, 0, 0);

                const gracePeriodMins = 5;
                const diffMins = (now.getTime() - shiftStartTime.getTime()) / (1000 * 60);

                if (diffMins > gracePeriodMins) {
                    status = 'late';
                }
            } else {
                status = 'present'; 
            }

            await pool.query(
                'INSERT INTO attendance (user_id, check_in, note, status) VALUES ($1, NOW(), $2, $3)',
                [userId, note || 'Nhận diện khuôn mặt', status]
            );

            const message = status === 'late' ? 'Chấm công thành công (Đi trễ).' : 'Chấm công vào thành công!';
            return NextResponse.json({ success: true, message });

        } else {
            // Clock out
            const activeRes = await pool.query(
                'SELECT id FROM attendance WHERE user_id = $1 AND check_out IS NULL ORDER BY check_in DESC LIMIT 1',
                [userId]
            );

            if (activeRes.rows.length === 0) {
                return NextResponse.json({ success: false, message: 'Không tìm thấy phiên làm việc đang diễn ra.' });
            }

            await pool.query(
                'UPDATE attendance SET check_out = NOW(), note = COALESCE($1, note), updated_at = NOW() WHERE id = $2',
                [note || 'Nhận diện khuôn mặt ra ca', activeRes.rows[0].id]
            );

            return NextResponse.json({ success: true, message: 'Chấm công ra thành công!' });
        }
    } catch (error) {
        console.error('Face check-in error:', error);
        return NextResponse.json({ success: false, message: 'Lỗi hệ thống.' }, { status: 500 });
    }
}

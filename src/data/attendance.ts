import pool from '@/lib/db';
import { authorize, getSessionUser } from '@/lib/auth';

export async function getAttendanceData(userId?: string) {
    try {
        const user = await getSessionUser();
        if (!user) throw new Error('Unauthorized');

        // If not admin, can only see own attendance
        const targetUserId = (user.role === 'admin' && userId) ? userId : user.id;

        const res = await pool.query(`
            SELECT a.*, u.full_name as employee_name
            FROM attendance a
            JOIN users u ON a.user_id = u.id
            WHERE ($1::uuid IS NULL OR a.user_id = $1)
            ORDER BY a.check_in DESC
            LIMIT 100
        `, [targetUserId === 'all' && user.role === 'admin' ? null : (targetUserId || user.id)]);

        return res.rows;
    } catch (error) {
        console.error('Error fetching attendance data:', error);
        return [];
    }
}

export async function getActiveAttendance() {
    try {
        const user = await getSessionUser();
        if (!user) return null;

        const res = await pool.query(
            'SELECT * FROM attendance WHERE user_id = $1 AND check_out IS NULL LIMIT 1',
            [user.id]
        );

        return res.rows[0] || null;
    } catch (error) {
        console.error('Error fetching active attendance:', error);
        return null;
    }
}

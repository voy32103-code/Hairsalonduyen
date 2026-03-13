import pool from '@/lib/db';
import { authorize } from '@/lib/auth';

export async function getSchedulesData(month?: number, year?: number) {
    try {
        await authorize('employees', 'view'); // Assuming schedule ties into employees module access
        
        const currentMonth = month || new Date().getMonth() + 1;
        const currentYear = year || new Date().getFullYear();

        const startDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
        const endDate = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];

        // Fetch schedules
        const schedulesRes = await pool.query(`
            SELECT ws.*, u.full_name as employee_name 
            FROM work_schedules ws
            JOIN users u ON ws.employee_id = u.id
            WHERE ws.date >= $1 AND ws.date <= $2
            ORDER BY ws.date ASC, ws.shift_start ASC
        `, [startDate, endDate]);

        // Fetch employees for the assignment dropdown
        const employeesRes = await pool.query(`
            SELECT id, full_name, role_id 
            FROM users 
            WHERE is_active = true
            ORDER BY full_name ASC
        `);

        return {
            schedules: schedulesRes.rows,
            employees: employeesRes.rows,
            currentMonth,
            currentYear
        };
    } catch (error) {
        console.error('Failed to fetch schedules data:', error);
        return { schedules: [], employees: [], currentMonth: month || new Date().getMonth() + 1, currentYear: year || new Date().getFullYear() };
    }
}

export async function getMyScheduleData(userId: string, month?: number, year?: number) {
    try {
        const currentMonth = month || new Date().getMonth() + 1;
        const currentYear = year || new Date().getFullYear();

        const startDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
        const endDate = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];

        const schedulesRes = await pool.query(`
            SELECT ws.*, u.full_name as employee_name 
            FROM work_schedules ws
            JOIN users u ON ws.employee_id = u.id
            WHERE ws.employee_id = $1 AND ws.date >= $2 AND ws.date <= $3
            ORDER BY ws.date ASC, ws.shift_start ASC
        `, [userId, startDate, endDate]);

        return {
            schedules: schedulesRes.rows,
            currentMonth,
            currentYear
        };
    } catch (error) {
        console.error('Failed to fetch my schedule data:', error);
        return { schedules: [], currentMonth: month || new Date().getMonth() + 1, currentYear: year || new Date().getFullYear() };
    }
}

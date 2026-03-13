import pool from '@/lib/db';
import { authorize } from '@/lib/auth';

export async function getPayrollData(month?: number, year?: number) {
    try {
        await authorize('finance', 'view'); // Payroll assumes finance or employees access
        
        const currentMonth = month || new Date().getMonth() + 1;
        const currentYear = year || new Date().getFullYear();

        const payrollRes = await pool.query(`
            SELECT p.*, u.full_name as employee_name, u.role_id, r.name as role_name 
            FROM payroll p
            JOIN users u ON p.employee_id = u.id
            JOIN roles r ON u.role_id = r.id
            WHERE p.period_month = $1 AND p.period_year = $2
            ORDER BY u.full_name ASC
        `, [currentMonth, currentYear]);

        // Also fetch employee list to allow generation
        const employeesRes = await pool.query(`
            SELECT id, full_name, role_id 
            FROM users 
            WHERE is_active = true
            ORDER BY full_name ASC
        `);

        return {
            payroll: payrollRes.rows,
            employees: employeesRes.rows,
            currentMonth,
            currentYear
        };
    } catch (error) {
        console.error('Failed to fetch payroll data:', error);
        return { payroll: [], employees: [], currentMonth: month || new Date().getMonth() + 1, currentYear: year || new Date().getFullYear() };
    }
}

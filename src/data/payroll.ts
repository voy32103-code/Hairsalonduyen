import pool from '@/lib/db';
import { authorize } from '@/lib/auth';

export async function getPayrollData(month?: number, year?: number) {
    try {
        await authorize('finance', 'view'); // Payroll assumes finance or employees access
        
        const currentMonth = month || new Date().getMonth() + 1;
        const currentYear = year || new Date().getFullYear();

        const payrollRes = await pool.query(`
            SELECT 
                p.*, 
                u.full_name as employee_name, 
                u.role_id, 
                r.name as role_name,
                COALESCE(c.total_commission, 0) as total_commission
            FROM payroll p
            JOIN users u ON p.employee_id = u.id
            JOIN roles r ON u.role_id = r.id
            LEFT JOIN (
                SELECT ii.staff_id, SUM(ii.commission_amount) as total_commission
                FROM invoice_items ii
                JOIN invoices i ON ii.invoice_id = i.id
                WHERE EXTRACT(MONTH FROM i.created_at) = $1 
                  AND EXTRACT(YEAR FROM i.created_at) = $2
                  AND i.status = 'paid'
                GROUP BY ii.staff_id
            ) c ON c.staff_id = p.employee_id
            WHERE p.period_month = $1 AND p.period_year = $2
            ORDER BY u.full_name ASC
        `, [currentMonth, currentYear]);

        // Also fetch employee list to allow generation
        const employeesRes = await pool.query(`
            SELECT 
                u.id, u.full_name, u.role_id,
                COALESCE(c.total_commission, 0) as total_commission
            FROM users u
            LEFT JOIN (
                SELECT ii.staff_id, SUM(ii.commission_amount) as total_commission
                FROM invoice_items ii
                JOIN invoices i ON ii.invoice_id = i.id
                WHERE EXTRACT(MONTH FROM i.created_at) = $1 
                  AND EXTRACT(YEAR FROM i.created_at) = $2
                  AND i.status = 'paid'
                GROUP BY ii.staff_id
            ) c ON c.staff_id = u.id
            WHERE u.is_active = true
            ORDER BY u.full_name ASC
        `, [currentMonth, currentYear]);

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

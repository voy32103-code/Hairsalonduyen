import pool from '@/lib/db';
import { Employee } from '@/types/employees';

export async function getEmployeesData(): Promise<{ employees: Employee[] }> {
    try {
        const employeesRes = await pool.query(`
      SELECT u.id, u.full_name, u.email, u.phone, u.avatar_url, u.is_active, u.created_at, r.name as role
      FROM users u
      JOIN roles r ON u.role_id = r.id
      ORDER BY u.created_at ASC;
    `);
        return { employees: employeesRes.rows };
    } catch (error) {
        console.error('Error fetching employees:', error);
        return { employees: [] };
    }
}

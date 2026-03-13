import pool from '@/lib/db';
import { Customer, CustomerStats } from '@/types/customers';

export async function getCustomers(): Promise<Customer[]> {
    try {
        const res = await pool.query('SELECT * FROM customers ORDER BY created_at DESC');
        return res.rows;
    } catch (error) {
        console.error('Error fetching customers:', error);
        return [];
    }
}

export async function getCustomerStats(): Promise<CustomerStats> {
    try {
        const totalRes = await pool.query('SELECT COUNT(*) as total FROM customers');
        const newRes = await pool.query(`
            SELECT COUNT(*) as new_count 
            FROM customers 
            WHERE created_at >= NOW() - INTERVAL '30 days'
        `);

        return {
            total: parseInt(totalRes.rows[0].total),
            new_last_30_days: parseInt(newRes.rows[0].new_count)
        };
    } catch (error) {
        console.error('Error fetching customer stats:', error);
        return { total: 0, new_last_30_days: 0 };
    }
}

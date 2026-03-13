import pool from '@/lib/db';
import { authorize } from '@/lib/auth';

export async function getReportsData() {
    try {
        await authorize('reports', 'view');
        const revenueByMonth = await pool.query(`
            SELECT TO_CHAR(created_at, 'Month') as month, 
                   SUM(total_amount) as revenue,
                   COUNT(*) as count
            FROM invoices
            WHERE status = 'paid'
            AND created_at > NOW() - INTERVAL '6 months'
            GROUP BY month
            ORDER BY MIN(created_at);
        `);

        const serviceBreakdown = await pool.query(`
            SELECT ii.item_name as service_name, SUM(ii.quantity) as count, SUM(ii.total_price) as total
            FROM invoice_items ii
            JOIN invoices i ON ii.invoice_id = i.id
            WHERE i.status = 'paid' AND ii.service_id IS NOT NULL
            GROUP BY ii.item_name
            ORDER BY count DESC;
        `);

        const customerGrowth = await pool.query(`
            SELECT TO_CHAR(created_at, 'Month') as month, COUNT(*) as count
            FROM customers
            WHERE created_at > NOW() - INTERVAL '6 months'
            GROUP BY month
            ORDER BY MIN(created_at);
        `);

        return {
            revenueByMonth: revenueByMonth.rows,
            serviceBreakdown: serviceBreakdown.rows,
            customerGrowth: customerGrowth.rows
        };
    } catch (error) {
        console.error('Error fetching reports:', error);
        return { revenueByMonth: [], serviceBreakdown: [], customerGrowth: [] };
    }
}

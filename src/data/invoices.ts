import pool from '@/lib/db';
import { authorize } from '@/lib/auth';

export async function getInvoicesData() {
    try {
        await authorize('finance', 'view'); // Assuming finance permission handles invoices

        const res = await pool.query(`
            SELECT i.*, 
                   u.full_name as created_by_name,
                   c.full_name as customer_name,
                   c.phone as customer_phone
            FROM invoices i
            LEFT JOIN users u ON i.created_by = u.id
            LEFT JOIN customers c ON i.customer_id = c.id
            ORDER BY i.created_at DESC
            LIMIT 100
        `);

        // We can fetch items for all these 100 invoices, or fetch items on-demand. 
        // For a simple view, let's fetch items for each to display the full bill details.
        // Doing N+1 is bad, so we'll do 1 query with IN array.
        
        const invoices = res.rows;
        if (invoices.length === 0) return [];

        const invoiceIds = invoices.map(inv => inv.id);
        const itemsRes = await pool.query(`
            SELECT * FROM invoice_items
            WHERE invoice_id = ANY($1)
        `, [invoiceIds]);

        // Map items to invoices
        return invoices.map(inv => ({
            ...inv,
            items: itemsRes.rows.filter(item => item.invoice_id === inv.id)
        }));

    } catch (error) {
        console.error('Error fetching invoices:', error);
        return [];
    }
}

export async function getInvoiceById(id: string) {
    try {
        await authorize('finance', 'view');
        
        const res = await pool.query(`
            SELECT i.*, 
                   u.full_name as created_by_name,
                   c.full_name as customer_name,
                   c.phone as customer_phone
            FROM invoices i
            LEFT JOIN users u ON i.created_by = u.id
            LEFT JOIN customers c ON i.customer_id = c.id
            WHERE i.id = $1
        `, [id]);

        if (res.rows.length === 0) return null;

        const itemsRes = await pool.query('SELECT * FROM invoice_items WHERE invoice_id = $1', [id]);

        return {
            ...res.rows[0],
            items: itemsRes.rows
        };

    } catch (error) {
        console.error('Error fetching invoice:', error);
        return null;
    }
}

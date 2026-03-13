import pool from '@/lib/db';
import { authorize } from '@/lib/auth';
import { Expense, ExpenseByCategory } from '@/types/finance';

export async function getFinanceData(): Promise<{
    expenses: Expense[],
    byCategory: ExpenseByCategory[],
    grandTotal: number
}> {
    try {
        await authorize('finance', 'view');
        const expensesRes = await pool.query(`
            SELECT e.id, e.title, e.amount, e.category, e.expense_date, e.note,
                   u.full_name as created_by_name, u.avatar_url as created_by_avatar
            FROM expenses e
            LEFT JOIN users u ON e.created_by = u.id
            ORDER BY e.expense_date DESC
            LIMIT 50;
        `);

        const categoryRes = await pool.query(`
            SELECT category, SUM(amount) as total
            FROM expenses
            GROUP BY category
            ORDER BY total DESC;
        `);

        const totalRes = await pool.query('SELECT SUM(amount) as grand_total FROM expenses;');

        return {
            expenses: expensesRes.rows,
            byCategory: categoryRes.rows,
            grandTotal: totalRes.rows[0]?.grand_total || 0,
        };
    } catch (error) {
        console.error('Error fetching finance:', error);
        return { expenses: [], byCategory: [], grandTotal: 0 };
    }
}

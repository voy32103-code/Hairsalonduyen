import pool from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function getDashboardData() {
    try {
        const user = await getSessionUser();
        const isAdmin = user?.role === 'admin';
        const revenueRes = await pool.query(`
            SELECT COALESCE(SUM(total_amount), 0) as total_revenue, COUNT(*) as total_appointments 
            FROM invoices 
            WHERE date_trunc('month', created_at) = date_trunc('month', current_date) AND status = 'paid';
        `);
        const currentMonthData = revenueRes.rows[0] || { total_revenue: 0, total_appointments: 0 };

        const prevRevenueRes = await pool.query(`
            SELECT COALESCE(SUM(total_amount), 0) as total_revenue, COUNT(*) as total_appointments 
            FROM invoices 
            WHERE date_trunc('month', created_at) = date_trunc('month', current_date - interval '1 month') AND status = 'paid';
        `);
        const prevMonthData = prevRevenueRes.rows[0] || { total_revenue: 0, total_appointments: 0 };

        const revChange = prevMonthData.total_revenue > 0
            ? ((currentMonthData.total_revenue - prevMonthData.total_revenue) / prevMonthData.total_revenue) * 100 : 0;
        const apptChange = prevMonthData.total_appointments > 0
            ? ((currentMonthData.total_appointments - prevMonthData.total_appointments) / prevMonthData.total_appointments) * 100 : 0;

        const upcomingRes = await pool.query(`
      SELECT a.id, c.full_name as customer_name, a.service_name, a.appointment_time, u.full_name as staff_name, a.price
      FROM appointments a
      JOIN customers c ON a.customer_id = c.id
      LEFT JOIN users u ON a.staff_id = u.id
      WHERE a.appointment_time >= NOW() AND a.status = 'scheduled'
      ORDER BY a.appointment_time ASC LIMIT 5;
    `);

        const stockRes = await pool.query('SELECT * FROM low_stock_items LIMIT 5;');

        const chartRes = await pool.query(`
          SELECT date_trunc('month', created_at) as month, SUM(total_amount) as revenue 
          FROM invoices 
          WHERE status = 'paid'
          GROUP BY month ORDER BY month DESC LIMIT 6;
        `);

        const staffRes = await pool.query(`
          SELECT u.id, u.full_name, u.avatar_url, r.name as role, COUNT(i.id) as appt_count, SUM(i.total_amount) as revenue
          FROM users u
          JOIN roles r ON u.role_id = r.id
          LEFT JOIN invoices i ON i.created_by = u.id AND i.status = 'paid'
          GROUP BY u.id, u.full_name, u.avatar_url, r.name
          ORDER BY revenue DESC NULLS LAST LIMIT 5;
        `);

        const expensesRes = await pool.query(`SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date_trunc('month', expense_date::timestamp) = date_trunc('month', current_date);`);
        const prevExpensesRes = await pool.query(`SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date_trunc('month', expense_date::timestamp) = date_trunc('month', current_date - interval '1 month');`);
        const currentExpenses = parseFloat(expensesRes.rows[0]?.total || 0);
        const prevExpenses = parseFloat(prevExpensesRes.rows[0]?.total || 0);
        const expensesChange = prevExpenses > 0 ? ((currentExpenses - prevExpenses) / prevExpenses) * 100 : 0;

        const custRes = await pool.query(`SELECT COUNT(*) as total FROM customers WHERE date_trunc('month', created_at) = date_trunc('month', current_date);`);
        const prevCustRes = await pool.query(`SELECT COUNT(*) as total FROM customers WHERE date_trunc('month', created_at) = date_trunc('month', current_date - interval '1 month');`);
        const currentCust = parseInt(custRes.rows[0]?.total || 0);
        const prevCust = parseInt(prevCustRes.rows[0]?.total || 0);
        const custChange = prevCust > 0 ? ((currentCust - prevCust) / prevCust) * 100 : 0;

        let currentProfit = 0;
        let profitChange = 0;
        
        if (isAdmin) {
            currentProfit = currentMonthData.total_revenue - currentExpenses;
            const prevProfit = prevMonthData.total_revenue - prevExpenses;
            profitChange = prevProfit !== 0 ? ((currentProfit - prevProfit) / Math.abs(prevProfit)) * 100 : 0;
        }

        return {
            kpis: {
                revenue: isAdmin ? currentMonthData.total_revenue : 0,
                revenueChange: isAdmin ? revChange : 0,
                appointments: currentMonthData.total_appointments,
                appointmentsChange: apptChange,
                newCustomers: currentCust,
                newCustomersChange: custChange,
                totalExpenses: isAdmin ? currentExpenses : 0,
                totalExpensesChange: isAdmin ? expensesChange : 0,
                netProfit: currentProfit,
                netProfitChange: profitChange,
            },
            upcomingAppointments: upcomingRes.rows,
            lowStock: stockRes.rows,
            chartData: isAdmin ? chartRes.rows.reverse() : [],
            staffPerformance: isAdmin ? staffRes.rows : [],
        };
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return {
            kpis: {
                revenue: 0, revenueChange: 0,
                appointments: 0, appointmentsChange: 0,
                newCustomers: 0, newCustomersChange: 0,
                totalExpenses: 0, totalExpensesChange: 0,
                netProfit: 0, netProfitChange: 0
            },
            upcomingAppointments: [],
            lowStock: [],
            chartData: [],
            staffPerformance: []
        };
    }
}

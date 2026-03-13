import pool from '@/lib/db';
import { Appointment, AppointmentStats } from '@/types/appointments';

export async function getAppointmentsData(): Promise<{ appointments: Appointment[], stats: AppointmentStats }> {
  try {
    const apptsRes = await pool.query(`
      SELECT a.id, c.full_name as customer_name, c.phone, a.service_name, a.appointment_time, u.full_name as staff_name, a.status, a.price
      FROM appointments a
      JOIN customers c ON a.customer_id = c.id
      LEFT JOIN users u ON a.staff_id = u.id
      ORDER BY a.appointment_time DESC
      LIMIT 50;
    `);

    const statsRes = await pool.query(`
      SELECT 
        COUNT(*) as total_today,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_today,
        SUM(CASE WHEN appointment_time > NOW() AND status = 'scheduled' THEN 1 ELSE 0 END) as upcoming
      FROM appointments
      WHERE DATE(appointment_time) = CURRENT_DATE;
    `);

    return {
      appointments: apptsRes.rows,
      stats: statsRes.rows[0] || { total_today: 0, completed_today: 0, upcoming: 0 }
    };
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return { appointments: [], stats: { total_today: 0, completed_today: 0, upcoming: 0 } };
  }
}

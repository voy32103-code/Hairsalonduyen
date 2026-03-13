'use server';

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { broadcastSSE } from '@/app/api/events/route';
import { authorize } from '@/lib/auth';

export async function createAppointment(formData: FormData) {
    try {
        await authorize('appointments', 'create');
        const customerName = formData.get('customerName') as string;
        const phone = formData.get('phone') as string;
        const serviceIdString = formData.get('serviceId') as string;
        const appointmentTime = formData.get('appointmentTime') as string;
        let price = parseFloat(formData.get('price') as string);
        
        let serviceName = "Dịch vụ khác";
        let serviceId: string | null = null;
        
        if (serviceIdString) {
            const serviceRes = await pool.query('SELECT id, name, price FROM services WHERE id = $1', [serviceIdString]);
            if (serviceRes.rows.length > 0) {
                serviceName = serviceRes.rows[0].name;
                serviceId = serviceRes.rows[0].id;
                if (isNaN(price)) price = Number(serviceRes.rows[0].price);
            }
        }
        
        if (isNaN(price)) price = 0;

        let customerId;
        const customerRes = await pool.query('SELECT id FROM customers WHERE phone = $1', [phone]);
        if (customerRes.rows.length > 0) {
            customerId = customerRes.rows[0].id;
        } else {
            const newCustomerRes = await pool.query(
                'INSERT INTO customers (full_name, phone) VALUES ($1, $2) RETURNING id',
                [customerName, phone]
            );
            customerId = newCustomerRes.rows[0].id;
        }

        await pool.query(
            `INSERT INTO appointments (customer_id, service_id, service_name, appointment_time, price, status) VALUES ($1, $2, $3, $4, $5, 'scheduled')`,
            [customerId, serviceId, serviceName, appointmentTime, price]
        );

        broadcastSSE('new_appointment', { customerName, service: serviceName });
        revalidatePath('/admin/appointments');
        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        console.error('Failed to create appointment:', error);
        return { success: false, message: 'Lỗi khi tạo lịch hẹn.' };
    }
}

export async function updateAppointmentStatus(id: string, status: string) {
    try {
        await authorize('appointments', 'edit');
        await pool.query('UPDATE appointments SET status = $1::appointment_status WHERE id = $2', [status, id]);
        revalidatePath('/admin/appointments');
        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        console.error('Failed to update appointment:', error);
        return { success: false, message: 'Lỗi khi cập nhật lịch hẹn.' };
    }
}

export async function deleteAppointment(id: string) {
    try {
        await authorize('appointments', 'delete');
        await pool.query('DELETE FROM appointments WHERE id = $1', [id]);
        revalidatePath('/admin/appointments');
        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete appointment:', error);
        return { success: false, message: 'Lỗi khi xóa lịch hẹn.' };
    }
}

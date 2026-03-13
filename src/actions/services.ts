'use server';

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { authorize } from '@/lib/auth';

export async function createService(formData: FormData) {
    try {
        // Technically only admin/manager should edit services
        await authorize('services', 'edit');
        
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const price = parseFloat(formData.get('price') as string) || 0;
        const durationMins = parseInt(formData.get('durationMins') as string) || 60;
        const isActive = formData.get('isActive') === 'on' || formData.get('isActive') === 'true';

        await pool.query(`
            INSERT INTO services (name, description, price, duration_mins, is_active)
            VALUES ($1, $2, $3, $4, $5)
        `, [name, description, price, durationMins, isActive]);

        revalidatePath('/admin/services');
        return { success: true };
    } catch (error: any) {
        console.error('Failed to create service:', error);
        return { success: false, message: error.message || 'Lỗi khi tạo dịch vụ.' };
    }
}

export async function updateService(id: string, formData: FormData) {
    try {
        await authorize('services', 'edit');
        
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const price = parseFloat(formData.get('price') as string) || 0;
        const durationMins = parseInt(formData.get('durationMins') as string) || 60;
        const isActive = formData.get('isActive') === 'on' || formData.get('isActive') === 'true';

        await pool.query(`
            UPDATE services 
            SET name = $1, description = $2, price = $3, duration_mins = $4, is_active = $5, updated_at = NOW()
            WHERE id = $6
        `, [name, description, price, durationMins, isActive, id]);

        // Revalidate everywhere services are used
        revalidatePath('/admin/services');
        revalidatePath('/admin/appointments'); 
        return { success: true };
    } catch (error: any) {
        console.error('Failed to update service:', error);
        return { success: false, message: error.message || 'Lỗi khi cập nhật dịch vụ.' };
    }
}

export async function deleteService(id: string) {
    try {
        await authorize('services', 'delete');
        
        // Let's perform a soft delete or hard delete. Hard delete will cascade if permitted, 
        // but since appointments.service_id is SET NULL, hard delete is safe.
        await pool.query('DELETE FROM services WHERE id = $1', [id]);
        
        revalidatePath('/admin/services');
        return { success: true };
    } catch (error: any) {
        console.error('Failed to delete service:', error);
        return { success: false, message: error.message || 'Lỗi khi xóa dịch vụ.' };
    }
}

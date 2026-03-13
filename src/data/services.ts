import pool from '@/lib/db';
import { authorize } from '@/lib/auth';

export async function getServicesData() {
    try {
        const userHasManagerAccess = await import('@/lib/auth').then(m => m.checkPermission('services', 'view'));
        
        // Actually for services, maybe staff can also view. Let's assume everyone authenticated can view services.
        // We will just fetch them. But if we want restriction, we check here.
        
        const res = await pool.query(`
            SELECT * FROM services
            ORDER BY name ASC
        `);
        return res.rows;
    } catch (error) {
        console.error('Error fetching services:', error);
        return [];
    }
}

export async function getActiveServices() {
    try {
        const res = await pool.query(`
            SELECT * FROM services
            WHERE is_active = true
            ORDER BY name ASC
        `);
        return res.rows;
    } catch (error) {
        console.error('Error fetching active services:', error);
        return [];
    }
}

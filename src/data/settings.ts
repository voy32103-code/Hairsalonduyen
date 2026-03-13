import pool from '@/lib/db';
import { cookies } from 'next/headers';

export async function getSettingsData() {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get('user_id')?.value;

        if (!userId) {
            return { userProfile: null };
        }

        const userRes = await pool.query(`
            SELECT u.id, u.full_name, u.email, u.phone, u.avatar_url, r.name as role
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.id = $1
            LIMIT 1;
        `, [userId]);
        return { userProfile: userRes.rows[0] || null };
    } catch (error) {
        console.error('Error fetching settings:', error);
        return { userProfile: null };
    }
}

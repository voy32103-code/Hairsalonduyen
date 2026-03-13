import { cookies } from 'next/headers';
import pool from './db';

export interface UserSession {
    id: string;
    fullName: string;
    email: string;
    role: string;
}

/**
 * Gets the current logged in user from cookies and verifies they exist in the DB.
 */
export async function getSessionUser(): Promise<UserSession | null> {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get('user_id')?.value;
        const sessionToken = cookieStore.get('session')?.value;

        if (!userId || !sessionToken) {
            return null;
        }

        const userRes = await pool.query(`
            SELECT u.id, u.full_name, u.email, r.name as role, u.session_token
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.id = $1
            LIMIT 1;
        `, [userId]);

        const user = userRes.rows[0];
        // Validate session token match
        if (!user || user.session_token !== sessionToken) {
            return null;
        }

        return {
            id: user.id,
            fullName: user.full_name,
            email: user.email,
            role: user.role
        };
    } catch (error) {
        console.error('Error getting session user:', error);
        return null;
    }
}

/**
 * Checks if the current user has a specific permission.
 * Admins always have all permissions.
 */
export async function checkPermission(moduleKey: string, action: string): Promise<boolean> {
    const user = await getSessionUser();
    if (!user) return false;

    // Admin bypasses all checks
    if (user.role === 'admin') return true;

    try {
        const permRes = await pool.query(`
            SELECT 1 
            FROM role_permissions rp
            JOIN permissions p ON p.id = rp.permission_id
            JOIN roles r ON r.id = rp.role_id
            WHERE r.name = $1 AND p.module_key = $2 AND p.action = $3
            LIMIT 1;
        `, [user.role, moduleKey, action]);

        return permRes.rows.length > 0;
    } catch (error) {
        console.error('Error checking permission:', error);
        return false;
    }
}

/**
 * Throws an error if the user doesn't have the required permission.
 * Useful for server actions.
 */
export async function authorize(moduleKey: string, action: string) {
    const hasPermission = await checkPermission(moduleKey, action);
    if (!hasPermission) {
        throw new Error('Bạn không có quyền thực hiện hành động này.');
    }
}

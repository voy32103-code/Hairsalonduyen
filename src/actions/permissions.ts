'use server';

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { authorize } from '@/lib/auth';

export async function updateRolePermissions(roleId: string, permissionKeys: string[]) {
    const client = await pool.connect();
    try {
        await authorize('permissions', 'edit');
        await client.query('BEGIN');

        // 1. Get current role name
        const roleRes = await client.query('SELECT name FROM roles WHERE id = $1', [roleId]);
        if (roleRes.rows.length === 0) throw new Error('Role not found');

        if (roleRes.rows[0].name === 'admin') {
            throw new Error('Bạn không thể sửa quyền của Admin');
        }

        // 2. Clear existing permissions for this role
        await client.query('DELETE FROM role_permissions WHERE role_id = $1', [roleId]);

        // 3. Insert new permissions
        if (permissionKeys.length > 0) {
            // Convert 'module_action' back to IDs
            const values: string[] = [];
            const placeholders: string[] = [];

            permissionKeys.forEach((key, index) => {
                const [moduleKey, action] = key.split('_');
                placeholders.push(`($1, (SELECT id FROM permissions WHERE module_key = $${index * 2 + 2} AND action = $${index * 2 + 3}))`);
                values.push(moduleKey, action);
            });

            const query = `
                INSERT INTO role_permissions (role_id, permission_id)
                VALUES ${placeholders.join(', ')}
                ON CONFLICT DO NOTHING;
            `;
            await client.query(query, [roleId, ...values]);
        }

        await client.query('COMMIT');
        revalidatePath('/admin/permissions');
        return { success: true };
    } catch (error: any) {
        await client.query('ROLLBACK');
        console.error('Error updating permissions:', error);
        return { success: false, message: error.message || 'Lỗi khi cập nhật quyền hạn' };
    } finally {
        client.release();
    }
}

import pool from '@/lib/db';

export async function getRolesData() {
    try {
        const rolesRes = await pool.query('SELECT id, name, description FROM roles ORDER BY name ASC;');
        const permsRes = await pool.query(`
            SELECT rp.role_id, p.module_key, p.action 
            FROM role_permissions rp
            JOIN permissions p ON p.id = rp.permission_id;
        `);

        // Group permissions by role
        const permissionsByRole: Record<string, string[]> = {};
        permsRes.rows.forEach(row => {
            if (!permissionsByRole[row.role_id]) {
                permissionsByRole[row.role_id] = [];
            }
            permissionsByRole[row.role_id].push(`${row.module_key}_${row.action}`);
        });

        const rolesWithPerms = rolesRes.rows.map(role => ({
            ...role,
            permissions: permissionsByRole[role.id] || []
        }));

        return { roles: rolesWithPerms };
    } catch (error) {
        console.error('Error fetching roles:', error);
        throw error;
    }
}

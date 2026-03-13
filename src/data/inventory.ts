import pool from '@/lib/db';
import { InventoryItem } from '@/types/inventory';

export async function getInventoryData(): Promise<{ inventory: InventoryItem[] }> {
    try {
        const inventoryRes = await pool.query(`
      SELECT id, product_name, quantity, min_stock, unit_price, updated_at
      FROM inventory
      ORDER BY product_name ASC;
    `);
        return { inventory: inventoryRes.rows };
    } catch (error) {
        console.error('Error fetching inventory:', error);
        return { inventory: [] };
    }
}

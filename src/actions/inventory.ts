'use server';

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { broadcastSSE } from '@/app/api/events/route';
import { authorize } from '@/lib/auth';

export async function createInventoryItem(formData: FormData) {
    try {
        await authorize('inventory', 'create');
        const title = formData.get('productName') as string;
        const quantity = parseInt(formData.get('quantity') as string);
        const minStock = parseInt(formData.get('minStock') as string);
        const price = parseFloat(formData.get('price') as string);

        await pool.query(
            'INSERT INTO inventory (product_name, quantity, min_stock, unit_price) VALUES ($1, $2, $3, $4)',
            [title, quantity, minStock, price]
        );

        if (quantity < minStock) {
            broadcastSSE('low_stock', { product: title });
        }
        revalidatePath('/admin/inventory');
        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        console.error('Failed to create inventory item:', error);
        return { success: false, message: 'Lỗi khi thêm sản phẩm.' };
    }
}

export async function updateInventoryQuantity(id: string, quantity: number) {
    try {
        await authorize('inventory', 'edit');
        await pool.query('UPDATE inventory SET quantity = $1, updated_at = NOW() WHERE id = $2', [quantity, id]);
        revalidatePath('/admin/inventory');
        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        console.error('Failed to update inventory:', error);
        return { success: false, message: 'Lỗi khi cập nhật kho.' };
    }
}

export async function deleteInventoryItem(id: string) {
    try {
        await authorize('inventory', 'delete');
        await pool.query('DELETE FROM inventory WHERE id = $1', [id]);
        revalidatePath('/admin/inventory');
        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete inventory item:', error);
        return { success: false, message: 'Lỗi khi xóa sản phẩm.' };
    }
}

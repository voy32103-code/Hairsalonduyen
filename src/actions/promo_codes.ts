'use server';

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { authorize } from '@/lib/auth';

export async function createPromoCode(formData: FormData) {
    try {
        await authorize('finance', 'edit');
        const code = (formData.get('code') as string).toUpperCase();
        const type = formData.get('type') as 'percent' | 'fixed';
        const value = parseFloat(formData.get('value') as string);
        const maxUses = formData.get('maxUses') ? parseInt(formData.get('maxUses') as string) : null;
        const validFrom = formData.get('validFrom') || null;
        const validUntil = formData.get('validUntil') || null;

        await pool.query(
            `INSERT INTO promo_codes (code, discount_type, discount_value, max_uses, valid_from, valid_until) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [code, type, value, maxUses, validFrom, validUntil]
        );

        revalidatePath('/admin/pos/promo');
        return { success: true };
    } catch (error: any) {
        console.error('Failed to create promo code:', error);
        return { success: false, message: error.message || 'Lỗi khi tạo mã giảm giá.' };
    }
}

export async function getPromoCodes() {
    try {
        await authorize('finance', 'view');
        const res = await pool.query('SELECT * FROM promo_codes ORDER BY created_at DESC');
        return res.rows;
    } catch (error) {
        console.error('Failed to fetch promo codes:', error);
        return [];
    }
}

export async function deletePromoCode(id: string) {
    try {
        await authorize('finance', 'delete');
        await pool.query('DELETE FROM promo_codes WHERE id = $1', [id]);
        revalidatePath('/admin/pos/promo');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete promo code:', error);
        return { success: false, message: 'Lỗi khi xóa mã giảm giá.' };
    }
}

export async function togglePromoStatus(id: string, currentStatus: boolean) {
    try {
        await authorize('finance', 'edit');
        await pool.query('UPDATE promo_codes SET is_active = $1 WHERE id = $2', [!currentStatus, id]);
        revalidatePath('/admin/pos/promo');
        return { success: true };
    } catch (error) {
        console.error('Failed to toggle promo status:', error);
        return { success: false, message: 'Lỗi khi cập nhật trạng thái.' };
    }
}

// POS Validation Action
export async function validatePromoCode(code: string) {
    try {
        const res = await pool.query(
            `SELECT * FROM promo_codes 
             WHERE code = $1 AND is_active = true 
             AND (valid_from IS NULL OR valid_from <= NOW()) 
             AND (valid_until IS NULL OR valid_until >= NOW())
             AND (max_uses IS NULL OR used_count < max_uses)`,
            [code.toUpperCase()]
        );

        if (res.rows.length === 0) {
            return { success: false, message: 'Mã không hợp lệ hoặc đã hết hạn.' };
        }

        const promo = res.rows[0];
        return { 
            success: true, 
            promo: {
                id: promo.id,
                code: promo.code,
                discountType: promo.discount_type,
                discountValue: parseFloat(promo.discount_value)
            }
        };
    } catch (error) {
        console.error('Failed to validate promo code:', error);
        return { success: false, message: 'Lỗi kiểm tra mã.' };
    }
}

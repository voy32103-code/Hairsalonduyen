'use server';

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { authorize } from '@/lib/auth';

// 1. Manage Master Packages
export async function createPrepaidPackage(formData: FormData) {
    try {
        await authorize('finance', 'edit');
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const price = parseFloat(formData.get('price') as string);
        const totalCredits = parseInt(formData.get('totalCredits') as string);
        const validDays = formData.get('validDays') ? parseInt(formData.get('validDays') as string) : null;

        await pool.query(
            `INSERT INTO prepaid_packages (name, description, price, total_credits, valid_days) 
             VALUES ($1, $2, $3, $4, $5)`,
            [name, description, price, totalCredits, validDays]
        );

        revalidatePath('/admin/pos/packages');
        return { success: true };
    } catch (error: any) {
        console.error('Failed to create package:', error);
        return { success: false, message: error.message };
    }
}

export async function getPrepaidPackages() {
    try {
        await authorize('finance', 'view');
        const res = await pool.query('SELECT * FROM prepaid_packages WHERE is_active = true ORDER BY name ASC');
        return res.rows;
    } catch (error) {
        console.error('Failed to fetch packages:', error);
        return [];
    }
}

// 2. Customer Package Operations
export async function getCustomerPackages(customerId: string) {
    try {
        const res = await pool.query(
            `SELECT cp.*, pp.name as package_name 
             FROM customer_packages cp
             JOIN prepaid_packages pp ON cp.package_id = pp.id
             WHERE cp.customer_id = $1 AND cp.status = 'active' AND cp.remaining_credits > 0
             AND (cp.expiry_date IS NULL OR cp.expiry_date >= NOW())`,
            [customerId]
        );
        return res.rows;
    } catch (error) {
        console.error('Failed to fetch customer packages:', error);
        return [];
    }
}

export async function purchasePackage(customerId: string, packageId: string) {
    const client = await pool.connect();
    try {
        await authorize('finance', 'edit');
        await client.query('BEGIN');

        // Get package details
        const pkgRes = await client.query('SELECT * FROM prepaid_packages WHERE id = $1', [packageId]);
        const pkg = pkgRes.rows[0];

        const expiryDate = pkg.valid_days ? new Date(Date.now() + pkg.valid_days * 24 * 60 * 60 * 1000) : null;

        await client.query(
            `INSERT INTO customer_packages (customer_id, package_id, remaining_credits, expiry_date) 
             VALUES ($1, $2, $3, $4)`,
            [customerId, packageId, pkg.total_credits, expiryDate]
        );

        await client.query('COMMIT');
        revalidatePath('/admin/pos');
        return { success: true };
    } catch (error: any) {
        await client.query('ROLLBACK');
        console.error('Failed to purchase package:', error);
        return { success: false, message: error.message };
    } finally {
        client.release();
    }
}

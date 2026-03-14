'use server';

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { authorize, getSessionUser } from '@/lib/auth';
import { broadcastSSE } from '@/app/api/events/route';

export async function createInvoice(data: {
    appointmentId?: string | null,
    customerId?: string | null,
    discount: number,
    promoCodeId?: string | null,
    paymentMethod: string,
    note?: string,
    items: {
        serviceId?: string | null,
        productId?: string | null,
        staffId?: string | null,
        itemName: string,
        quantity: number,
        unitPrice: number,
        packageId?: string | null,
        customerPackageId?: string | null
    }[]
}) {
    // We use a transaction to ensure rollback if inventory deduction fails.
    const client = await pool.connect();
    try {
        await authorize('finance', 'edit');
        const user = await getSessionUser();
        if (!user) throw new Error('Unauthorized');

        await client.query('BEGIN');

        // 1. Calculate subtotal
        const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const discount = data.discount || 0;

        // 2. Insert Invoice
        const invRes = await client.query(`
            INSERT INTO invoices (appointment_id, customer_id, subtotal, discount, promo_code_id, payment_method, status, note, created_by)
            VALUES ($1, $2, $3, $4, $5, $6, 'paid', $7, $8)
            RETURNING id
        `, [data.appointmentId || null, data.customerId || null, subtotal, discount, data.promoCodeId || null, data.paymentMethod, data.note, user.id]);

        const invoiceId = invRes.rows[0].id;

        // 3. Fetch service commission percentages
        const serviceIds = data.items.map(i => i.serviceId).filter(Boolean);
        let commissions: Record<string, any> = {};
        if (serviceIds.length > 0) {
            const svcRes = await client.query('SELECT id, price, commission_percent FROM services WHERE id = ANY($1)', [serviceIds]);
            svcRes.rows.forEach(r => commissions[r.id] = { 
                percent: parseFloat(r.commission_percent || 0),
                base_price: parseFloat(r.price || 0)
            });
        }

        // 4. Insert Invoice Items and Deduct Inventory
        for (const item of data.items) {
            let commissionAmount = 0;
            if (item.serviceId && item.staffId && commissions[item.serviceId]) {
                const comm = commissions[item.serviceId];
                // Use base_price if unitPrice is 0 (redemption)
                const priceForComm = item.unitPrice > 0 ? item.unitPrice : comm.base_price;
                commissionAmount = (item.quantity * priceForComm * comm.percent) / 100;
            }

            await client.query(`
                INSERT INTO invoice_items (invoice_id, service_id, product_id, item_name, quantity, unit_price, commission_amount, staff_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `, [invoiceId, item.serviceId || null, item.productId || null, item.itemName, item.quantity, item.unitPrice, commissionAmount, item.staffId || null]);

            // If it's a package sale, create a customer_package for the customer
            if (item.packageId && data.customerId) {
                const pkgRes = await client.query('SELECT * FROM prepaid_packages WHERE id = $1', [item.packageId]);
                if (pkgRes.rows.length > 0) {
                    const pkg = pkgRes.rows[0];
                    const expiryDate = pkg.valid_days ? new Date(Date.now() + pkg.valid_days * 24 * 60 * 60 * 1000) : null;
                    
                    for (let i = 0; i < item.quantity; i++) {
                        await client.query(
                            `INSERT INTO customer_packages (customer_id, package_id, remaining_credits, expiry_date) 
                             VALUES ($1, $2, $3, $4)`,
                            [data.customerId, item.packageId, pkg.total_credits, expiryDate]
                        );
                    }
                }
            }

            // Deduct inventory if it's a product
            if (item.productId) {
                const stockRes = await client.query(`
                    UPDATE inventory 
                    SET quantity = quantity - $1, updated_at = NOW()
                    WHERE id = $2 AND quantity >= $1
                    RETURNING id
                `, [item.quantity, item.productId]);

                if (stockRes.rows.length === 0) {
                    throw new Error(`Sản phẩm ${item.itemName} không đủ số lượng trong kho.`);
                }
            }
            // If it's a package redemption, decrement remaining_credits
            if (item.customerPackageId) {
                const updRes = await client.query(
                    "UPDATE customer_packages SET remaining_credits = remaining_credits - 1, status = CASE WHEN remaining_credits - 1 <= 0 THEN 'exhausted' ELSE status END WHERE id = $1 AND remaining_credits > 0 RETURNING id",
                    [item.customerPackageId]
                );
                if (updRes.rows.length === 0) {
                    throw new Error('Gói dịch vụ đã hết lượt sử dụng hoặc không tồn tại.');
                }
            }
        }

        // 4. Update appointment status to 'completed' if appointmentId is present
        if (data.appointmentId) {
            await client.query(`UPDATE appointments SET status = 'completed' WHERE id = $1`, [data.appointmentId]);
            // Optional: insert into revenue_logs (but usually invoices table itself suffices because we can aggregate invoices)
            // If we keep revenue_logs, we do it here. But invoices table represents a super-set of revenue. Let's do both to not break analytics.
            await client.query(`
                INSERT INTO revenue_logs (appointment_id, amount)
                VALUES ($1, $2)
            `, [data.appointmentId, subtotal - discount]);
        } else {
            // Standalone POS sale (no appointment). Log to revenue logs with null appointment_id? 
            // Our schema requires appointment_id in revenue_logs? Wait, looking at schema:
            // "appointment_id uuid REFERENCES appointments(id)" - it is nullable if we didn't specify NOT NULL.
            // Oh wait, if it's NOT nullable, it will fail. Let's check schema.
            // `appointment_id uuid REFERENCES appointments(id) ON DELETE CASCADE`
            // Usually we can just insert null. We'll skip revenue_logs for direct POS sales without appointments if schema complains, 
            // but actually we should just rely on `invoices` for financial reports. 
        }

        // 5. If promoCodeId is present, increment used_count
        if (data.promoCodeId) {
            await client.query('UPDATE promo_codes SET used_count = used_count + 1 WHERE id = $1', [data.promoCodeId]);
        }

        await client.query('COMMIT');

        revalidatePath('/admin/pos');
        revalidatePath('/admin/finance/invoices');
        revalidatePath('/admin/inventory');
        revalidatePath('/admin/appointments');
        revalidatePath('/admin');
        
        // Broadcast notification
        broadcastSSE('new_invoice', { invoiceId: invoiceId.split('-')[0], total: subtotal - discount });

        return { success: true, invoiceId };

    } catch (error: any) {
        await client.query('ROLLBACK');
        console.error('Transaction Failed:', error);
        return { success: false, message: error.message || 'Lỗi xử lý thanh toán.' };
    } finally {
        client.release();
    }
}

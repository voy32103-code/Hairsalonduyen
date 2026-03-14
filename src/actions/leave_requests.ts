'use server';

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getSessionUser, authorize } from '@/lib/auth';

export async function createLeaveRequest(formData: FormData) {
    try {
        const user = await getSessionUser();
        if (!user) throw new Error('Unauthorized');

        const startDate = formData.get('startDate') as string;
        const endDate = formData.get('endDate') as string;
        const reason = formData.get('reason') as string;

        if (new Date(startDate) > new Date(endDate)) {
            throw new Error('Ngày bắt đầu không được sau ngày kết thúc.');
        }

        await pool.query(
            'INSERT INTO leave_requests (employee_id, start_date, end_date, reason) VALUES ($1, $2, $3, $4)',
            [user.id, startDate, endDate, reason]
        );

        revalidatePath('/admin/employees/leave');
        return { success: true };
    } catch (error: any) {
        console.error('Failed to create leave request:', error);
        return { success: false, message: error.message || 'Lỗi khi tạo đơn xin nghỉ phép.' };
    }
}

export async function updateLeaveStatus(id: string, status: 'approved' | 'rejected') {
    try {
        console.log(`[ACTION] updateLeaveStatus: id=${id}, status=${status}`);
        const user = await getSessionUser();
        console.log(`[ACTION] User role: ${user?.role}, ID: ${user?.id}`);
        
        await authorize('employees', 'edit'); 
        console.log('[ACTION] Authorization successful');

        const result = await pool.query(
            'UPDATE leave_requests SET status = $1::leave_status, updated_at = NOW() WHERE id = $2',
            [status, id]
        );
        console.log(`[ACTION] Update completed. Rows affected: ${result.rowCount}`);

        if (result.rowCount === 0) {
            return { success: false, message: 'Không tìm thấy đơn nghỉ phép để cập nhật.' };
        }

        revalidatePath('/admin/employees/leave');
        return { success: true };
    } catch (error: any) {
        console.error('[ACTION] Failed to update leave status:', error);
        return { success: false, message: error.message || 'Lỗi khi cập nhật trạng thái đơn nghỉ phép.' };
    }
}

export async function getLeaveRequests() {
    try {
        const user = await getSessionUser();
        if (!user) return [];

        let query = `
            SELECT l.*, u.full_name as employee_name
            FROM leave_requests l
            JOIN users u ON l.employee_id = u.id
        `;
        const params: any[] = [];

        // Staff only see their own requests, Manager/Admin see all
        if (user.role === 'staff') {
            query += ' WHERE l.employee_id = $1';
            params.push(user.id);
        }

        query += ' ORDER BY l.created_at DESC';

        const res = await pool.query(query, params);
        return res.rows;
    } catch (error) {
        console.error('Failed to fetch leave requests:', error);
        return [];
    }
}

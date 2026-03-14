export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {
    id: string;
    employee_id: string;
    employee_name?: string; // Joined from users
    start_date: string;
    end_date: string;
    reason: string;
    status: LeaveStatus;
    created_at: string;
    updated_at: string;
}

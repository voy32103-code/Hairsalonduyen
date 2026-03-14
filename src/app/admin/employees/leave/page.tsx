import { getLeaveRequests } from '@/actions/leave_requests';
import { getSessionUser } from '@/lib/auth';
import LeaveRequestsClient from '@/app/admin/employees/leave/LeaveRequestsClient';

export default async function LeaveRequestsPage() {
    const user = await getSessionUser();
    if (!user) return null;

    const isAdminOrManager = user.role === 'admin' || user.role === 'manager';
    const requests = await getLeaveRequests();

    return <LeaveRequestsClient initialRequests={requests} isAdminOrManager={isAdminOrManager} />;
}

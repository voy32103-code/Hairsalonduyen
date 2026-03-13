import { getSchedulesData } from '@/data/schedules';
import PageHeader from '@/components/ui/PageHeader';
import ScheduleCalendar from '@/components/employees/ScheduleCalendar';
import { cookies } from 'next/headers';

export default async function SchedulePage({
    searchParams
}: {
    searchParams: { month?: string, year?: string }
}) {
    const { month: searchMonth, year: searchYear } = await searchParams;
    const cookieStore = await cookies();
    const userRole = cookieStore.get('user_role')?.value || 'admin';
    const userId = cookieStore.get('user_id')?.value;

    const month = searchMonth ? parseInt(searchMonth) : undefined;
    const year = searchYear ? parseInt(searchYear) : undefined;

    const data = await getSchedulesData(month, year); // For brevity, we pass this to both admin/staff right now but front-end filters or we adjust query

    // If staff, filter schedules to only show their own. In a real app we'd call `getMyScheduleData` instead.
    const schedules = userRole === 'staff' 
        ? data.schedules.filter((s: any) => s.employee_id === userId) 
        : data.schedules;

    return (
        <>
            <PageHeader
                breadcrumbItems={[{ label: 'Main' }, { label: 'Nhân viên', href: '/admin/employees' }, { label: 'Lịch làm việc' }]}
                title="Lịch Làm Việc"
                description={userRole === 'admin' || userRole === 'manager' ? "Phân ca và quản lý lịch làm việc của đội ngũ stylist" : "Xem lịch làm việc cá nhân của bạn"}
            />

            <div className="glass-card rounded-2xl overflow-hidden shadow-2xl border border-white/5">
                <ScheduleCalendar
                    initialSchedules={schedules}
                    employees={data.employees}
                    currentMonth={data.currentMonth}
                    currentYear={data.currentYear}
                    userRole={userRole}
                />
            </div>
        </>
    );
}

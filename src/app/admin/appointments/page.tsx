import { getAppointmentsData } from '@/data/appointments';
import { getActiveServices } from '@/data/services';
import AddAppointmentModal from '@/components/appointments/AddAppointmentModal';
import AppointmentTable from '@/components/appointments/AppointmentTable';
import { cookies } from 'next/headers';
import PageHeader from '@/components/ui/PageHeader';
import StatCards from '@/components/ui/StatCards';

export default async function AppointmentsPage() {
    const data = await getAppointmentsData();
    const activeServices = await getActiveServices();
    const cookieStore = await cookies();
    const userRole = cookieStore.get('user_role')?.value || 'admin';

    return (
        <>
            <PageHeader
                breadcrumbItems={[{ label: 'Main' }, { label: 'Lịch hẹn' }]}
                title="Quản lý lịch hẹn"
                actionElement={userRole === 'admin' ? <AddAppointmentModal services={activeServices} /> : undefined}
            />

            <StatCards
                stats={[
                    { label: 'Lịch chờ (Hôm nay)', value: data.stats?.upcoming || 0, icon: 'schedule', colorClass: 'text-blue-400', iconBgClass: 'bg-blue-500/10' },
                    { label: 'Hoàn thành hôm nay', value: data.stats?.completed_today || 0, icon: 'check_circle', colorClass: 'text-green-400', iconBgClass: 'bg-green-500/10' },
                    { label: 'Tổng lịch hẹn', value: data.stats?.total_today || 0, icon: 'event', colorClass: 'text-primary', iconBgClass: 'bg-primary/10' },
                ]}
            />

            {/* Table */}
            <div className="bg-glass-surface rounded-xl overflow-hidden border border-white/5">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">event_list</span>
                        Danh sách lịch hẹn
                        <span className="ml-2 px-2 py-0.5 rounded-full bg-white/5 text-xs text-slate-400">{data.appointments?.length || 0}</span>
                    </h3>
                    {userRole === 'admin' && <p className="text-xs text-slate-500">Di chuột vào hàng để xem thao tác</p>}

                </div>
                <AppointmentTable appointments={data.appointments || []} userRole={userRole} />
            </div>
        </>
    );
}

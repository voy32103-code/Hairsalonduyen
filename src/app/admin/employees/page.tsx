export const dynamic = 'force-dynamic';

import { getEmployeesData } from '@/data/employees';
import AddEmployeeModal from '@/components/employees/AddEmployeeModal';
import EmployeeTable from '@/components/employees/EmployeeTable';
import { cookies } from 'next/headers';
import PageHeader from '@/components/ui/PageHeader';
import StatCards from '@/components/ui/StatCards';
import { Employee } from '@/types/employees';

export default async function EmployeesPage() {
    const cookieStore = await cookies();
    const userRole = cookieStore.get('user_role')?.value || 'admin';

    if (userRole !== 'admin') {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-10">
                <div className="w-20 h-20 rounded-3xl bg-rose-500/10 flex items-center justify-center text-rose-500 mb-6 border border-rose-500/20">
                    <span className="material-symbols-outlined text-4xl">lock</span>
                </div>
                <h2 className="text-2xl font-black text-white mb-2">Truy cập bị từ chối</h2>
                <p className="text-slate-500 max-w-sm">Chỉ có Quản trị viên mới có quyền xem và quản lý danh sách nhân viên.</p>
                <a href="/admin" className="mt-8 px-6 py-3 rounded-xl bg-primary text-background-dark font-black hover:brightness-110 transition-all">Quay lại Dashboard</a>
            </div>
        );
    }

    const data = await getEmployeesData();

    return (
        <>
            <PageHeader
                breadcrumbItems={[{ label: 'Main' }, { label: 'Nhân viên' }]}
                title="Quản lý nhân viên"
                description="Theo dõi và quản lý đội ngũ stylist chuyên nghiệp"
                actionElement={<AddEmployeeModal />}
            />

            <StatCards
                stats={[
                    { label: 'Tổng nhân viên', value: data.employees?.length || 0, icon: 'group', colorClass: 'text-primary' },
                    { label: 'Admin / Quản lý', value: data.employees?.filter((e: Employee) => e.role === 'admin' || e.role === 'manager').length || 0, icon: 'manage_accounts', colorClass: 'text-blue-400' },
                    { label: 'Stylist', value: data.employees?.filter((e: Employee) => e.role === 'staff').length || 0, icon: 'content_cut', colorClass: 'text-green-400' },
                ]}
            />

            <div className="glass-card rounded-2xl overflow-hidden shadow-2xl border border-white/5">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">badge</span>
                        Danh sách nhân viên
                    </h3>
                    <p className="text-xs text-slate-500">Di chuột vào hàng để xem thao tác</p>
                </div>
                <EmployeeTable employees={data.employees || []} />
            </div>
        </>
    );
}

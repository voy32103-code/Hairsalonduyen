import { getPayrollData } from '@/data/payroll';
import PageHeader from '@/components/ui/PageHeader';
import PayrollTable from '@/components/finance/PayrollTable';
import { cookies } from 'next/headers';

export default async function PayrollPage({
    searchParams
}: {
    searchParams: { month?: string, year?: string }
}) {
    const { month: searchMonth, year: searchYear } = await searchParams;
    const cookieStore = await cookies();
    const userRole = cookieStore.get('user_role')?.value || 'admin';

    // Staff cannot view everyone's overall payroll page in standard setup.
    // They could have a different route or we check here and deny them.
    if (userRole === 'staff') {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-10">
                <div className="w-20 h-20 rounded-3xl bg-rose-500/10 flex items-center justify-center text-rose-500 mb-6 border border-rose-500/20">
                    <span className="material-symbols-outlined text-4xl">lock</span>
                </div>
                <h2 className="text-2xl font-black text-white mb-2">Truy cập bị từ chối</h2>
                <p className="text-slate-500 max-w-sm">Chỉ có Admin/Manager mới có quyền quản lý bảng lương tổng.</p>
                <a href="/admin" className="mt-8 px-6 py-3 rounded-xl bg-primary text-background-dark font-black hover:brightness-110 transition-all">Quay lại Dashboard</a>
            </div>
        );
    }

    const month = searchMonth ? parseInt(searchMonth) : undefined;
    const year = searchYear ? parseInt(searchYear) : undefined;

    const data = await getPayrollData(month, year);

    return (
        <>
            <PageHeader
                breadcrumbItems={[{ label: 'Main' }, { label: 'Tài chính', href: '/admin/finance' }, { label: 'Bảng lương & Thưởng' }]}
                title="Bảng lương Nhân viên"
                description="Tính toán và quản lý lương cứng, thưởng, và khấu trừ"
            />

            <div className="glass-card rounded-2xl overflow-hidden shadow-2xl border border-white/5">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                        Kỳ tính lương {data.currentMonth}/{data.currentYear}
                    </h3>
                </div>
                <PayrollTable 
                    initialPayroll={data.payroll} 
                    employees={data.employees}
                    currentMonth={data.currentMonth}
                    currentYear={data.currentYear}
                />
            </div>
        </>
    );
}

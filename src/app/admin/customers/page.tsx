import { getCustomers, getCustomerStats } from '@/data/customers';
import CustomerClient from '@/components/customers/CustomerClient';
import PageHeader from '@/components/ui/PageHeader';

export const metadata = {
    title: 'Quản lý khách hàng - DuyenHairSalon',
};

export default async function CustomersPage() {
    const customers = await getCustomers();
    const stats = await getCustomerStats();

    return (
        <div className="space-y-6">
            <PageHeader
                breadcrumbItems={[{ label: 'Main' }, { label: 'Khách hàng' }]}
                title="Quản lý khách hàng"
                description="Lưu trữ và theo dõi thông tin chi tiết khách hàng của salon"
            />

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="glass-card p-6 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                            <span className="material-symbols-outlined">group</span>
                        </div>
                        <div>
                            <p className="text-3xl font-black text-white">{stats.total}</p>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Tổng khách hàng</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                            <span className="material-symbols-outlined">trending_up</span>
                        </div>
                        <div>
                            <p className="text-3xl font-black text-white">+{stats.new_last_30_days}</p>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Khách mới <span className="text-[10px] text-slate-500 normal-case">(30 ngày)</span></p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <CustomerClient customers={customers} />
        </div>
    );
}

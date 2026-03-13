import { getFinanceData } from '@/data/finance';
import FinanceClient from '@/components/finance/FinanceClient';
import { cookies } from 'next/headers';
import PageHeader from '@/components/ui/PageHeader';
import { ExpenseByCategory } from '@/types/finance';

export default async function FinancePage() {
    const cookieStore = await cookies();
    const userRole = cookieStore.get('user_role')?.value || 'admin';

    if (userRole !== 'admin') {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-10">
                <div className="w-20 h-20 rounded-3xl bg-rose-500/10 flex items-center justify-center text-rose-500 mb-6 border border-rose-500/20">
                    <span className="material-symbols-outlined text-4xl">payments</span>
                </div>
                <h2 className="text-2xl font-black text-white mb-2">Truy cập bị từ chối</h2>
                <p className="text-slate-500 max-w-sm">Bạn không có quyền truy cập vào dữ liệu tài chính của salon.</p>
                <a href="/admin" className="mt-8 px-6 py-3 rounded-xl bg-primary text-background-dark font-black hover:brightness-110 transition-all">Quay lại Dashboard</a>
            </div>
        );
    }

    const data = await getFinanceData();

    const formatCurrency = (amount: number | string) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount));

    const grandTotal = Number(data.grandTotal);
    const categories = data.byCategory || [];

    return (
        <>
            <PageHeader
                breadcrumbItems={[{ label: 'Main' }, { label: 'Tài chính' }]}
                title="Quản lý tài chính"
                description="Theo dõi thu chi và hiệu suất tài chính của salon"
            />

            {/* Summary cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 glass-card rounded-xl p-6 border border-white/5">
                    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">Phân bổ chi tiêu</h3>
                    {categories.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                            {categories.map((cat: ExpenseByCategory, i: number) => {
                                const pct = grandTotal > 0 ? ((Number(cat.total) / grandTotal) * 100).toFixed(0) : 0;
                                return (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-primary" />
                                            <span className="text-slate-300 text-sm">{cat.category}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-white text-sm font-bold">{formatCurrency(cat.total)}</p>
                                            <p className="text-primary text-[10px]">{pct}%</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-sm">Chưa có dữ liệu chi tiêu.</p>
                    )}
                </div>
                <div className="glass-card rounded-xl p-6 border border-white/5 flex flex-col justify-between">
                    <div>
                        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Tổng chi tiêu</h3>
                        <p className="text-white text-3xl font-black">{formatCurrency(grandTotal)}</p>
                        <p className="text-primary text-sm mt-1">{data.expenses?.length || 0} giao dịch</p>
                    </div>
                    <div className="flex items-end gap-1.5 h-16 mt-4">
                        {categories.slice(0, 5).map((cat: ExpenseByCategory, i: number) => {
                            const h = grandTotal > 0 ? Math.max(15, (Number(cat.total) / grandTotal) * 100) : 20;
                            return <div key={i} className={`flex-1 rounded-t ${i === 0 ? 'bg-primary' : 'bg-primary/20'}`} style={{ height: `${h}%` }} />;
                        })}
                    </div>
                </div>
            </div>

            {/* Expense list with full CRUD */}
            <div className="glass-card rounded-xl border border-white/5 overflow-hidden">
                <div className="border-b border-white/5 p-6">
                    <h3 className="text-lg font-bold text-white">Danh sách chi tiêu</h3>
                </div>
                <div className="p-6">
                    <FinanceClient
                        expenses={data.expenses || []}
                        grandTotal={grandTotal}
                        byCategory={categories}
                    />
                </div>
            </div>
        </>
    );
}

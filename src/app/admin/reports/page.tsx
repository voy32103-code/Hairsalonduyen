export const dynamic = 'force-dynamic';

import { getReportsData } from '@/data/reports';
import PageHeader from '@/components/ui/PageHeader';

export default async function ReportsPage() {
    const data = await getReportsData();

    const formatCurrency = (amount: number | string) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount));

    return (
        <>
            <PageHeader
                breadcrumbItems={[{ label: 'Main' }, { label: 'Báo cáo' }]}
                title="Thống kê & Báo cáo"
                description="Phân tích hiệu suất kinh doanh và biểu đồ tăng trưởng"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Revenue chart mockup/stats */}
                <div className="glass-card rounded-xl p-6 border border-white/5">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">analytics</span>
                        Doanh thu 6 tháng gần nhất
                    </h3>
                    <div className="space-y-4">
                        {data.revenueByMonth.length > 0 ? data.revenueByMonth.map((m: { month: string, revenue: string | number }, i: number) => (
                            <div key={i}>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-400 font-bold uppercase">{m.month}</span>
                                    <span className="text-white font-black">{formatCurrency(m.revenue)}</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary rounded-full transition-all duration-1000"
                                        style={{ width: `${Math.min(100, (Number(m.revenue) / 5000000) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        )) : (
                            <p className="text-slate-500 text-sm py-10 text-center">Chưa có dữ liệu doanh thu</p>
                        )}
                    </div>
                </div>

                {/* Service breakdown */}
                <div className="glass-card rounded-xl p-6 border border-white/5">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">pie_chart</span>
                        Phổ biến dịch vụ
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                        {data.serviceBreakdown.length > 0 ? data.serviceBreakdown.slice(0, 5).map((s: { service_name: string, count: string | number, total: string | number }, i: number) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 group hover:border-primary/30 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-xs">
                                        #{i + 1}
                                    </div>
                                    <span className="text-sm font-bold text-slate-300">{s.service_name}</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-white text-sm font-black">{s.count} lượt</p>
                                    <p className="text-[10px] text-slate-500">{formatCurrency(s.total)}</p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-slate-500 text-sm py-10 text-center">Chưa có dữ liệu dịch vụ</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="glass-card rounded-xl p-6 border border-white/5">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">trending_up</span>
                    Khách hàng mới mỗi tháng
                </h3>
                <div className="flex items-end gap-3 h-40 mt-8">
                    {data.customerGrowth.length > 0 ? data.customerGrowth.map((g: { month: string, count: number }, i: number) => {
                        const h = Math.max(10, (g.count / 20) * 100);
                        return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                <div className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">+{g.count}</div>
                                <div className="w-full bg-primary/20 rounded-t-lg group-hover:bg-primary transition-colors" style={{ height: `${h}%` }}></div>
                                <div className="text-[9px] font-black text-slate-500 uppercase rotate-45 mt-4">{g.month.substring(0, 3)}</div>
                            </div>
                        );
                    }) : (
                        <p className="w-full text-slate-500 text-sm text-center self-center">Chưa có dữ liệu khách hàng</p>
                    )}
                </div>
            </div>
        </>
    );
}

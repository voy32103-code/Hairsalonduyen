export const dynamic = 'force-dynamic';

import { getDashboardData } from '@/data/dashboard';
import Link from 'next/link';

export default async function DashboardPage() {
    const data = await getDashboardData();

    // Helper functions for formatting
    const formatCurrency = (amount: number | string) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount));
    };

    const formatChange = (change: number) => {
        const sign = change > 0 ? '+' : '';
        return `${sign}${change.toFixed(1)}%`;
    };

    const getChangeColorClass = (change: number) => {
        return change >= 0 ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-400 bg-rose-400/10';
    };

    return (
        <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                <Link href="/admin/finance/invoices" className="glass-card p-5 rounded-2xl smooth-transition hover:bg-white/5 block group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-background-dark transition-colors">
                            <span className="material-symbols-outlined">payments</span>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-lg ${getChangeColorClass(data.kpis.revenueChange)}`}>
                            {formatChange(data.kpis.revenueChange)}
                        </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-1">Tổng doanh thu</p>
                    <h3 className="text-2xl font-bold">{formatCurrency(data.kpis.revenue)}</h3>
                </Link>

                <Link href="/admin/appointments" className="glass-card p-5 rounded-2xl smooth-transition hover:bg-white/5 block group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-400 group-hover:text-background-dark transition-colors">
                            <span className="material-symbols-outlined">event_available</span>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-lg ${getChangeColorClass(data.kpis.appointmentsChange)}`}>
                            {formatChange(data.kpis.appointmentsChange)}
                        </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-1">Lịch hẹn</p>
                    <h3 className="text-2xl font-bold">{data.kpis.appointments}</h3>
                </Link>

                <Link href="/admin/customers" className="glass-card p-5 rounded-2xl smooth-transition hover:bg-white/5 block group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:bg-purple-400 group-hover:text-background-dark transition-colors">
                            <span className="material-symbols-outlined">person_add</span>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-lg ${getChangeColorClass(data.kpis.newCustomersChange)}`}>
                            {formatChange(data.kpis.newCustomersChange)}
                        </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-1">Khách hàng mới</p>
                    <h3 className="text-2xl font-bold">{data.kpis.newCustomers}</h3>
                </Link>

                <Link href="/admin/finance" className="glass-card p-5 rounded-2xl smooth-transition hover:bg-white/5 block group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 group-hover:bg-rose-400 group-hover:text-background-dark transition-colors">
                            <span className="material-symbols-outlined">receipt_long</span>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-lg ${getChangeColorClass(data.kpis.totalExpensesChange)}`}>
                            {formatChange(data.kpis.totalExpensesChange)}
                        </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-1">Tổng chi phí</p>
                    <h3 className="text-2xl font-bold">{formatCurrency(data.kpis.totalExpenses)}</h3>
                </Link>

                <Link href="/admin/finance" className="glass-card p-5 rounded-2xl smooth-transition hover:bg-white/5 block group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-background-dark transition-colors">
                            <span className="material-symbols-outlined">savings</span>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-lg ${getChangeColorClass(data.kpis.netProfitChange)}`}>
                            {formatChange(data.kpis.netProfitChange)}
                        </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-1">Lợi nhuận ròng</p>
                    <h3 className="text-2xl font-bold">{formatCurrency(data.kpis.netProfit)}</h3>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Financial Chart Area */}
                <div className="glass-card p-6 rounded-2xl lg:col-span-2 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-lg font-semibold">Tổng quan tài chính</h2>
                            <p className="text-sm text-slate-400">Doanh thu, Chi phí & Lợi nhuận (6 tháng qua)</p>
                        </div>
                        <select className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary appearance-none">
                            <option>6 tháng qua</option>
                            <option>Năm nay</option>
                        </select>
                    </div>
                    <div className="flex-1 relative min-h-[300px] flex items-end">
                        <div className="w-full h-full flex flex-col justify-between absolute inset-0 py-2">
                            <div className="border-b border-white/5 w-full h-0"></div>
                            <div className="border-b border-white/5 w-full h-0"></div>
                            <div className="border-b border-white/5 w-full h-0"></div>
                            <div className="border-b border-white/5 w-full h-0"></div>
                            <div className="border-b border-white/5 w-full h-0"></div>
                        </div>
                        <svg
                            className="w-full h-[80%] z-10"
                            preserveAspectRatio="none"
                            viewBox="0 0 100 100"
                        >
                            <path
                                d="M0,80 Q20,60 40,70 T80,40 T100,20 L100,100 L0,100 Z"
                                fill="url(#grad-revenue)"
                                opacity="0.3"
                            />
                            <path
                                d="M0,80 Q20,60 40,70 T80,40 T100,20"
                                fill="none"
                                stroke="var(--color-primary)"
                                strokeWidth="2"
                            />
                            <path
                                d="M0,90 Q30,85 50,90 T100,80"
                                fill="none"
                                stroke="#f43f5e"
                                strokeDasharray="2,2"
                                strokeWidth="2"
                            />
                            <path
                                d="M0,70 Q20,50 40,60 T80,30 T100,10"
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="2"
                            />
                            <defs>
                                <linearGradient id="grad-revenue" x1="0%" x2="0%" y1="0%" y2="100%">
                                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.8" />
                                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute bottom-0 left-0 w-full flex justify-between text-xs text-slate-400 translate-y-6">
                            {data.chartData && data.chartData.length > 0 ? (
                                data.chartData.map((d: any, i: number) => (
                                    <span key={i}>{new Date(d.month).toLocaleString('default', { month: 'short' })}</span>
                                ))
                            ) : (
                                <>
                                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-center gap-6 mt-8">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="w-3 h-3 rounded-full bg-primary"></span> Doanh thu
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Lợi nhuận
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="w-3 h-3 rounded-full bg-rose-500"></span> Chi phí
                        </div>
                    </div>
                </div>

                {/* Appointments Mini Calendar */}
                <div className="glass-card p-6 rounded-2xl flex flex-col">
                    <h2 className="text-lg font-semibold mb-4">Lịch hẹn sắp tới</h2>

                    <div className="flex-1 space-y-3 overflow-y-auto pr-2">
                        {data.upcomingAppointments && data.upcomingAppointments.length > 0 ? (
                            data.upcomingAppointments.map((appt: any, i: number) => {
                                const date = new Date(appt.appointment_time);
                                let hours = date.getHours();
                                const ampm = hours >= 12 ? 'PM' : 'AM';
                                hours = hours % 12;
                                hours = hours ? hours : 12;
                                const mins = date.getMinutes().toString().padStart(2, '0');

                                return (
                                    <Link 
                                        key={i} 
                                        href="/admin/appointments"
                                        className="flex gap-3 items-center p-3 rounded-xl bg-slate-800/40 border border-white/5 hover:bg-slate-800/60 smooth-transition cursor-pointer group"
                                    >
                                        <div className="flex flex-col items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-xl shrink-0 group-hover:bg-primary group-hover:text-background-dark transition-colors">
                                            <span className="text-xs font-semibold">{hours}:{mins}</span>
                                            <span className="text-[10px]">{ampm}</span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-medium">{appt.service_name}</h4>
                                            <p className="text-xs text-slate-400">{appt.customer_name} • with {appt.staff_name || 'Any'}</p>
                                        </div>
                                    </Link>
                                );
                            })
                        ) : (
                            <p className="text-sm text-slate-500">No upcoming appointments.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Lower Section Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Inventory Status */}
                <div className="glass-card p-6 rounded-2xl flex flex-col xl:col-span-1">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Cảnh báo tồn kho</h2>
                        <a className="text-sm text-primary hover:underline" href="/admin/inventory">Xem tất cả</a>
                    </div>
                    <div className="space-y-4 flex-1">
                        {data.lowStock && data.lowStock.length > 0 ? (
                            data.lowStock.map((item: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-slate-800/30">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-slate-400">warning</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{item.product_name}</p>
                                            <p className="text-xs text-slate-400">Stock: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="inline-block px-2 py-1 rounded-md bg-rose-500/10 text-rose-400 text-xs font-medium border border-rose-500/20 mb-1">Low</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-slate-500">No low stock items.</p>
                        )}
                    </div>
                    <Link href="/admin/inventory" className="mt-4 w-full py-2 rounded-xl border border-slate-700/50 hover:bg-slate-800 text-sm font-medium smooth-transition flex items-center justify-center">
                        Nhập thêm hàng
                    </Link>
                </div>

                {/* Employee Table */}
                <div className="glass-card p-6 rounded-2xl flex flex-col lg:col-span-2 xl:col-span-2 overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Hiệu suất nhân viên</h2>
                        <Link href="/admin/employees" className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 smooth-transition">
                            Quản lý nhân viên
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
                                <tr>
                                    <th className="px-4 py-3 rounded-tl-lg">Nhân viên</th>
                                    <th className="px-4 py-3">Vai trò</th>
                                    <th className="px-4 py-3">Trạng thái</th>
                                    <th className="px-4 py-3">Số lịch hẹn</th>
                                    <th className="px-4 py-3 text-right rounded-tr-lg">Doanh thu (Tháng)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {data.staffPerformance && data.staffPerformance.length > 0 ? (
                                    data.staffPerformance.map((staff: any, i: number) => (
                                        <tr key={i} className="hover:bg-slate-800/30 smooth-transition">
                                            <td className="px-4 py-3 flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-700 bg-cover bg-center" style={{ backgroundImage: `url('${staff.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + staff.full_name}')` }}></div>
                                                <span className="font-medium">{staff.full_name}</span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-300 capitalize">{staff.role}</td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-300">
                                                {staff.appt_count}
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium">{formatCurrency(staff.revenue || 0)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-3 text-center text-slate-500">No staff performance data available.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

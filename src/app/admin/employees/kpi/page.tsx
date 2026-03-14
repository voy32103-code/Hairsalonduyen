import pool from '@/lib/db';
import { getSessionUser, authorize } from '@/lib/auth';
import PageHeader from '@/components/ui/PageHeader';

export const dynamic = 'force-dynamic';

export default async function KPIPage() {
    const user = await getSessionUser();
    if (!user) return null;

    const isAdminOrManager = user.role === 'admin' || user.role === 'manager';
    
    // Fetch KPI data
    let query = `
        SELECT 
            u.id, 
            u.full_name, 
            u.avatar_url, 
            r.name as role_name,
            COUNT(DISTINCT i.id) as total_customers,
            COALESCE(SUM(ii.quantity * ii.unit_price), 0) as total_revenue,
            COALESCE(SUM(ii.commission_amount), 0) as total_commission
        FROM users u
        JOIN roles r ON u.role_id = r.id
        LEFT JOIN invoice_items ii ON ii.staff_id = u.id
        LEFT JOIN invoices i ON i.id = ii.invoice_id 
            AND i.status = 'paid' 
            AND EXTRACT(MONTH FROM i.created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
            AND EXTRACT(YEAR FROM i.created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
        WHERE u.is_active = true
    `;
    const params: any[] = [];

    if (!isAdminOrManager) {
        query += ` AND u.id = $1`;
        params.push(user.id);
    }

    query += ` GROUP BY u.id, u.full_name, u.avatar_url, r.name ORDER BY total_revenue DESC`;

    const kpiRes = await pool.query(query, params);
    const kpis = kpiRes.rows;

    const formatCurrency = (amount: number) => 
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    return (
        <div className="space-y-6">
            <PageHeader 
                breadcrumbItems={[{label: 'Main'}, {label: 'Nhân viên'}, {label: 'KPI & Đánh giá'}]}
                title={isAdminOrManager ? "Bảng đánh giá KPI Nhân viên" : "KPI Của tôi"}
                description={`Thống kê hiệu suất làm việc tháng ${new Date().getMonth() + 1}/${new Date().getFullYear()}`}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {kpis.map((kpi: any) => (
                    <div key={kpi.id} className="glass-card p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="material-symbols-outlined text-6xl text-primary">trending_up</span>
                        </div>
                        
                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-primary/20 text-primary flex items-center justify-center font-bold text-xl uppercase shadow-lg shadow-primary/10">
                                {kpi.full_name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg">{kpi.full_name}</h3>
                                <p className="text-sm text-slate-400 capitalize">{kpi.role_name}</p>
                            </div>
                        </div>

                        <div className="space-y-4 relative z-10">
                            <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Doanh thu tạo ra</p>
                                <p className="text-xl font-black text-white">{formatCurrency(Number(kpi.total_revenue))}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Khách phục vụ</p>
                                    <p className="text-lg font-black text-emerald-400">{kpi.total_customers}</p>
                                </div>
                                <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Hoa hồng nhận</p>
                                    <p className="text-lg font-black text-primary">+{formatCurrency(Number(kpi.total_commission))}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                
                {kpis.length === 0 && (
                    <div className="col-span-full p-10 text-center glass-card rounded-3xl border border-white/5">
                        <span className="material-symbols-outlined text-4xl text-slate-600 mb-2">inbox</span>
                        <p className="text-slate-400">Chưa có dữ liệu KPI cho tháng này.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

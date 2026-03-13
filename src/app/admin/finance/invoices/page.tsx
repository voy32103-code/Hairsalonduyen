import { getInvoicesData } from '@/data/invoices';
import PageHeader from '@/components/ui/PageHeader';
import { cookies } from 'next/headers';

export default async function InvoicesPage() {
    const invoices = await getInvoicesData();
    const cookieStore = await cookies();
    const userRole = cookieStore.get('user_role')?.value || 'admin';

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    return (
        <>
            <PageHeader
                breadcrumbItems={[{ label: 'Main' }, { label: 'Tài chính' }, { label: 'Hóa đơn' }]}
                title="Quản lý Hóa Đơn & Doanh thu"
                description="Lịch sử các giao dịch thanh toán từ tính năng POS Thu ngân"
            />

            <div className="glass-card rounded-2xl overflow-hidden shadow-2xl border border-white/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/[0.03]">
                                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Mã hóa đơn</th>
                                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Khách hàng</th>
                                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Ngày tạo</th>
                                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Tổng tiền</th>
                                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Phương thức</th>
                                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {invoices.map(inv => (
                                <tr key={inv.id} className="hover:bg-white/[0.01] transition-colors">
                                    <td className="p-4 text-sm font-bold text-slate-300">
                                        #{inv.id.split('-')[0].toUpperCase()}
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm font-bold text-white">{inv.customer_name || 'Khách vãng lai'}</div>
                                        {inv.customer_phone && <div className="text-xs text-slate-500">{inv.customer_phone}</div>}
                                    </td>
                                    <td className="p-4 text-sm text-slate-400">
                                        {new Date(inv.created_at).toLocaleString('vi-VN')}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="font-black text-primary">{formatCurrency(Number(inv.total_amount))}</div>
                                        {Number(inv.discount) > 0 && <div className="text-xs text-rose-400">Đã giảm {formatCurrency(Number(inv.discount))}</div>}
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className="text-xs font-bold text-slate-400 uppercase bg-white/5 px-2 py-1 rounded">
                                            {inv.payment_method === 'cash' ? 'Tiền mặt' : inv.payment_method === 'credit_card' ? 'Thẻ' : inv.payment_method === 'bank_transfer' ? 'Chuyển khoản' : 'Khác'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        {inv.status === 'paid' && <span className="px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20">Đã thanh toán</span>}
                                        {inv.status === 'pending' && <span className="px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-bold border border-yellow-500/20">Chờ xử lý</span>}
                                        {inv.status === 'cancelled' && <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-bold border border-rose-500/20">Đã hủy</span>}
                                    </td>
                                </tr>
                            ))}
                            {invoices.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-500 text-sm">
                                        Chưa có giao dịch nào được ghi nhận.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

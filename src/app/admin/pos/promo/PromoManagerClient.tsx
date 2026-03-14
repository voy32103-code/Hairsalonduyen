'use client';

import { useState } from 'react';
import { PromoCode } from '@/types/promo';
import { createPromoCode, deletePromoCode, togglePromoStatus } from '@/actions/promo_codes';

export default function PromoManagerClient({ initialPromos }: { initialPromos: PromoCode[] }) {
    const [promos, setPromos] = useState(initialPromos);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const formatCurrency = (amount: number) => 
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const res = await createPromoCode(formData);
        if (res.success) {
            setIsModalOpen(false);
            window.location.reload();
        } else {
            alert(res.message);
        }
        setLoading(false);
    }

    async function handleDelete(id: string) {
        if (!confirm('Xóa mã giảm giá này?')) return;
        const res = await deletePromoCode(id);
        if (res.success) {
            setPromos(promos.filter(p => p.id !== id));
        }
    }

    async function handleToggle(id: string, current: boolean) {
        const res = await togglePromoStatus(id, current);
        if (res.success) {
            setPromos(promos.map(p => p.id === id ? { ...p, is_active: !current } : p));
        }
    }

    return (
        <div>
            <div className="flex justify-end mb-6">
                <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-primary text-background-dark font-bold rounded-xl flex items-center gap-2">
                    <span className="material-symbols-outlined">add</span>
                    Tạo mã mới
                </button>
            </div>

            <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/[0.02] border-b border-white/5">
                            <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Mã Code</th>
                            <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Loại</th>
                            <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Giá trị</th>
                            <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Lượt dùng</th>
                            <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Hiệu lực</th>
                            <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Trạng thái</th>
                            <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {promos.map(p => (
                            <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.01]">
                                <td className="p-4"><span className="px-2 py-1 bg-primary/10 text-primary font-black rounded text-sm uppercase">{p.code}</span></td>
                                <td className="p-4 text-sm text-slate-300">{p.discount_type === 'percent' ? 'Phần trăm (%)' : 'Cố định (VNĐ)'}</td>
                                <td className="p-4 text-sm font-bold text-white text-right">
                                    {p.discount_type === 'percent' ? `${p.discount_value}%` : formatCurrency(Number(p.discount_value))}
                                </td>
                                <td className="p-4 text-center text-sm text-slate-400">
                                    {p.used_count} / {p.max_uses || '∞'}
                                </td>
                                <td className="p-4 text-xs text-slate-400">
                                    {p.valid_until ? new Date(p.valid_until).toLocaleDateString() : 'Không thời hạn'}
                                </td>
                                <td className="p-4 text-center">
                                    <button onClick={() => handleToggle(p.id, p.is_active)} className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${p.is_active ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'}`}>
                                        {p.is_active ? 'Đang chạy' : 'Tạm dừng'}
                                    </button>
                                </td>
                                <td className="p-4 text-right">
                                    <button onClick={() => handleDelete(p.id)} className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors">
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="glass-card w-full max-w-md bg-slate-900 border border-white/10 p-8 rounded-3xl">
                        <h2 className="text-2xl font-black text-white mb-6">Tạo Mã Giảm Giá</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Code</label>
                                <input name="code" required className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white uppercase font-black" placeholder="SUMMER20" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Loại</label>
                                    <select name="type" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white">
                                        <option value="percent">% Giảm</option>
                                        <option value="fixed">Tiền cố định</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Giá trị</label>
                                    <input type="number" name="value" required className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Giới hạn lượt dùng</label>
                                <input type="number" name="maxUses" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white" placeholder="Để trống nếu không giới hạn" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Hết hạn</label>
                                <input type="date" name="validUntil" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white" />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-slate-400 font-bold">Hủy</button>
                                <button type="submit" disabled={loading} className="flex-1 py-3 bg-primary text-background-dark font-black rounded-xl hover:brightness-110">
                                    {loading ? 'Đang tạo...' : 'Xác nhận'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

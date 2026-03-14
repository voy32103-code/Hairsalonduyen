'use client';

import { useState } from 'react';
import { createPrepaidPackage } from '@/actions/packages';
import { PrepaidPackage } from '@/types/packages';

export default function PackageManagerClient({ initialPackages }: { initialPackages: PrepaidPackage[] }) {
    const [packages, setPackages] = useState(initialPackages);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const formatCurrency = (amount: number) => 
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const res = await createPrepaidPackage(formData);
        if (res.success) {
            setIsModalOpen(false);
            window.location.reload();
        } else {
            alert(res.message);
        }
        setLoading(false);
    }

    return (
        <div>
            <div className="flex justify-end mb-6">
                <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-primary text-background-dark font-bold rounded-xl flex items-center gap-2">
                    <span className="material-symbols-outlined">add</span>
                    Thêm gói mới
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.map(pkg => (
                    <div key={pkg.id} className="glass-card rounded-3xl border border-white/5 p-6 flex flex-col relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4">
                            <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-black rounded uppercase border border-primary/20">Active</span>
                        </div>
                        <h3 className="text-xl font-black text-white mb-2">{pkg.name}</h3>
                        <p className="text-slate-400 text-sm mb-6 flex-1">{pkg.description || 'Không có mô tả'}</p>
                        
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Số buổi/lượt:</span>
                                <span className="text-white font-bold">{pkg.total_credits} lượt</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Hạn dùng:</span>
                                <span className="text-white font-bold">{pkg.valid_days ? `${pkg.valid_days} ngày` : 'Vô thời hạn'}</span>
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t border-white/5">
                                <span className="text-slate-500">Giá bán:</span>
                                <span className="text-primary text-xl font-black">{formatCurrency(Number(pkg.price))}</span>
                            </div>
                        </div>

                        <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-xl border border-white/10 transition-colors">
                            Chỉnh sửa
                        </button>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="glass-card w-full max-w-md bg-slate-900 border border-white/10 p-8 rounded-3xl">
                        <h2 className="text-2xl font-black text-white mb-6">Tạo Gói Dịch Vụ</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Tên gói</label>
                                <input name="name" required className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white font-bold" placeholder="Gói 10 lần Cắt tóc" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Mô tả</label>
                                <textarea name="description" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-sm" placeholder="Mô tả quyền lợi..." rows={3} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Giá bán (VNĐ)</label>
                                    <input type="number" name="price" required className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white" placeholder="2000000" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Tổng số lượt</label>
                                    <input type="number" name="totalCredits" required className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white" placeholder="10" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Hạn dùng (ngày)</label>
                                <input type="number" name="validDays" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white" placeholder="Để trống nếu vô hạn" />
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

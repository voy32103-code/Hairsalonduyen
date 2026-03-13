'use client';

import { useState } from 'react';
import { createService, updateService, deleteService } from '@/actions/services';

export default function ServiceTable({ initialServices, userRole }: { initialServices: any[], userRole: string }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editItem, setEditItem] = useState<any>(null);

    const isManager = userRole === 'admin' || userRole === 'manager';

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const handleOpenModal = (item?: any) => {
        if (!isManager) return;
        setEditItem(item || null);
        setIsModalOpen(true);
    };

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        // The HTML forms natively submit 'on' for checked checkboxes, we handled this in server actions
        
        if (editItem) {
            await updateService(editItem.id, formData);
        } else {
            await createService(formData);
        }
        
        setLoading(false);
        setIsModalOpen(false);
    }

    async function handleDelete(id: string) {
        if (!isManager) return;
        if(confirm('Chắc chắn muốn xóa dịch vụ này? (Không thể hoàn tác)')) {
            await deleteService(id);
        }
    }

    return (
        <div>
            {isManager && (
                <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-end">
                    <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-primary text-background-dark text-xs font-black rounded-lg flex items-center gap-2 hover:brightness-110">
                        <span className="material-symbols-outlined text-sm">add</span> Thêm Dịch vụ
                    </button>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/[0.03]">
                            <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Tên dịch vụ</th>
                            <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Đơn giá</th>
                            <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Thời gian ước tính</th>
                            <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Trạng thái</th>
                            {isManager && <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Tùy chọn</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {initialServices.map(s => (
                            <tr key={s.id} className="hover:bg-white/[0.01] transition-colors group">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                            <span className="material-symbols-outlined">cut</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-white">{s.name}</p>
                                            <p className="text-xs text-slate-500 line-clamp-1 max-w-xs">{s.description || 'Chưa phân loại'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-right">
                                    <span className="font-black text-primary">{formatCurrency(Number(s.price))}</span>
                                </td>
                                <td className="p-4 text-center">
                                    <span className="text-sm font-medium text-slate-300 bg-white/5 px-3 py-1 rounded-full">
                                        {s.duration_mins} phút
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    {s.is_active ? (
                                        <span className="px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20">Đang phục vụ</span>
                                    ) : (
                                        <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-bold border border-rose-500/20">Ngừng phục vụ</span>
                                    )}
                                </td>
                                {isManager && (
                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleOpenModal(s)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 flex items-center justify-center" aria-label="Sửa dịch vụ">
                                                <span className="material-symbols-outlined text-sm">edit</span>
                                            </button>
                                            <button onClick={() => handleDelete(s.id)} className="w-8 h-8 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 flex items-center justify-center" aria-label="Xóa dịch vụ">
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {initialServices.length === 0 && (
                            <tr>
                                <td colSpan={isManager ? 5 : 4} className="p-8 text-center text-slate-500 text-sm">
                                    Chưa có dịch vụ nào trong hệ thống.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
                    <div className="glass-card w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl p-8" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-black text-white">{editItem ? 'Cập nhật Dịch vụ' : 'Thêm Dịch vụ mới'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white"><span className="material-symbols-outlined text-2xl">close</span></button>
                        </div>

                        <form action={handleSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tên dịch vụ</label>
                                <input name="name" defaultValue={editItem?.name} required placeholder="Cắt tóc, Uốn máy..." className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none transition-colors" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đơn giá (VNĐ)</label>
                                    <input type="number" name="price" defaultValue={editItem?.price || 0} required min="0" className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none transition-colors" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thời gian (Phút)</label>
                                    <input type="number" name="durationMins" defaultValue={editItem?.duration_mins || 60} required min="1" className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none transition-colors" />
                                </div>
                            </div>
                            
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mô tả chi tiết</label>
                                <textarea name="description" defaultValue={editItem?.description} rows={3} placeholder="Mô tả kỹ thuật..." className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none transition-colors resize-none"></textarea>
                            </div>

                            <div className="flex items-center gap-3 pt-2 pb-4">
                                <input type="checkbox" name="isActive" defaultChecked={editItem ? editItem.is_active : true} id="isActiveToggle" className="w-5 h-5 rounded border-slate-700 bg-slate-900/70 text-primary focus:ring-primary focus:ring-offset-background-dark" />
                                <label htmlFor="isActiveToggle" className="text-sm font-medium text-slate-300">Dịch vụ đang hoạt động phục vụ khách hàng</label>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl bg-white/5 text-slate-300 font-bold hover:bg-white/10">Hủy</button>
                                <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl bg-primary text-[#111827] font-black hover:brightness-110 disabled:opacity-60 flex items-center justify-center">
                                    {loading ? 'Đang lưu...' : 'Lưu dịch vụ'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createInventoryItem } from '@/actions/inventory';

export default function AddInventoryModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const formRef = useRef<HTMLFormElement>(null);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setMessage('');
        const result = await createInventoryItem(formData);
        setLoading(false);
        if (result.success) {
            setMessage('✅ Thêm sản phẩm thành công!');
            formRef.current?.reset();
            router.refresh();
            setTimeout(() => { setIsOpen(false); setMessage(''); }, 1200);
        } else {
            setMessage(`❌ ${result.message}`);
        }
    }

    return (
        <>
            <button onClick={() => setIsOpen(true)} className="px-4 py-2 bg-primary text-background-dark rounded-lg text-xs font-black flex items-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-sm">add_circle</span>
                Nhập sản phẩm mới
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}>
                    <div className="glass-card w-full max-w-md rounded-2xl border border-white/10 shadow-2xl p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-white">Nhập sản phẩm mới</h3>
                                <p className="text-slate-500 text-sm mt-1">Thêm mặt hàng vào kho</p>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white"><span className="material-symbols-outlined text-2xl">close</span></button>
                        </div>

                        <form ref={formRef} action={handleSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tên sản phẩm</label>
                                <input name="productName" required placeholder="VD: Dầu gội Wella Enrich" className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none transition-colors" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Số lượng nhập</label>
                                    <input type="number" name="quantity" required min="0" placeholder="10" className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none transition-colors" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tồn kho tối thiểu</label>
                                    <input type="number" name="minStock" required min="0" placeholder="5" className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none transition-colors" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đơn giá (VNĐ)</label>
                                <input type="number" name="price" required min="0" placeholder="320000" className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none transition-colors" />
                            </div>

                            {message && (
                                <p className={`text-sm font-semibold text-center py-2 rounded-lg ${message.startsWith('✅') ? 'text-green-400 bg-green-500/10' : 'text-rose-400 bg-rose-500/10'}`}>{message}</p>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setIsOpen(false)} className="flex-1 py-3 rounded-xl bg-white/5 text-slate-300 font-bold hover:bg-white/10">Hủy</button>
                                <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl bg-primary text-[#111827] font-black hover:brightness-110 disabled:opacity-60 flex items-center justify-center gap-2">
                                    {loading ? <span className="w-4 h-4 border-2 border-[#111827]/40 border-t-[#111827] rounded-full animate-spin" /> : null}
                                    {loading ? 'Đang lưu...' : 'Thêm vào kho'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { updateInventoryQuantity, deleteInventoryItem } from '@/actions/inventory';
import { InventoryItem } from '@/types/inventory';

export default function InventoryGrid({ items: initialItems, userRole = 'admin' }: { items: InventoryItem[], userRole?: string }) {
    const [items, setItems] = useState(initialItems);
    const [editItem, setEditItem] = useState<InventoryItem | null>(null);
    const [newQty, setNewQty] = useState('');
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Sync when server re-renders with fresh data
    useEffect(() => { setItems(initialItems); }, [initialItems]);


    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    async function handleUpdateQty() {
        if (!editItem) return;
        const qty = parseInt(newQty);
        if (isNaN(qty) || qty < 0) return;
        setLoading(true);
        await updateInventoryQuantity(editItem.id, qty);
        setItems(prev => prev.map(i => i.id === editItem.id ? { ...i, quantity: qty } : i));
        setEditItem(null);
        setLoading(false);
    }

    async function handleDelete(id: string) {
        setLoading(true);
        await deleteInventoryItem(id);
        setItems(prev => prev.filter(i => i.id !== id));
        setConfirmDeleteId(null);
        setLoading(false);
    }

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.length > 0 ? items.map((item) => {
                    const isLow = item.quantity < item.min_stock;
                    return (
                        <div key={item.id} className={`glass-card rounded-xl p-5 border transition-all hover:scale-[1.02] group ${isLow ? 'border-rose-500/30' : 'border-white/5'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isLow ? 'bg-rose-500/10' : 'bg-primary/10'}`}>
                                    <span className={`material-symbols-outlined text-2xl ${isLow ? 'text-rose-400' : 'text-primary'}`}>inventory_2</span>
                                </div>
                                {isLow && (
                                    <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 text-[10px] font-black border border-rose-500/20">SẮP HẾT</span>
                                )}
                            </div>
                            <h3 className="font-bold text-slate-100 text-sm mb-1 line-clamp-2">{item.product_name}</h3>
                            <p className="text-xs text-slate-500 mb-4">{formatCurrency(item.unit_price)} / đơn vị</p>

                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-xs text-slate-500">Tồn kho</p>
                                    <p className={`text-2xl font-black ${isLow ? 'text-rose-400' : 'text-white'}`}>{item.quantity}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-500">Tối thiểu</p>
                                    <p className="text-lg font-bold text-slate-400">{item.min_stock}</p>
                                </div>
                            </div>
                            <div className="flex border-t border-white/5 p-4 justify-between items-center bg-white/[0.02]">
                                <span className="text-primary font-black text-sm">{formatCurrency(item.unit_price)}</span>
                                {userRole === 'admin' ? (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { setEditItem(item); setNewQty(item.quantity.toString()); }}
                                            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-primary/20 hover:text-primary flex items-center justify-center text-slate-400 transition-colors"
                                            title="Sửa số lượng"
                                        >
                                            <span className="material-symbols-outlined text-lg">edit</span>
                                        </button>
                                        <button
                                            onClick={() => setConfirmDeleteId(item.id)}
                                            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 flex items-center justify-center text-slate-400 transition-colors"
                                            title="Xóa sản phẩm"
                                        >
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                    </div>
                                ) : (
                                    <span className="text-slate-600 text-[10px] uppercase font-bold tracking-tight">Chỉ xem</span>
                                )}
                            </div>
                        </div>
                    );
                }) : (
                    <div className="col-span-full py-16 text-center">
                        <span className="material-symbols-outlined text-5xl text-slate-700 block mb-3">inventory_2</span>
                        <p className="text-slate-500">Kho hàng trống</p>
                    </div>
                )}
            </div>

            {/* Edit Quantity Modal */}
            {editItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setEditItem(null)}>
                    <div className="glass-card w-full max-w-sm rounded-2xl border border-white/10 p-8" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-white">Cập nhật số lượng</h3>
                            <button onClick={() => setEditItem(null)} className="text-slate-500 hover:text-white"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <p className="text-slate-400 text-sm mb-6">{editItem.product_name}</p>
                        <div className="space-y-1.5 mb-6">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Số lượng mới</label>
                            <input
                                type="number"
                                value={newQty}
                                onChange={(e) => setNewQty(e.target.value)}
                                min="0"
                                className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-3 text-white text-lg font-bold focus:border-primary outline-none transition-colors text-center"
                            />
                            <p className="text-xs text-slate-500 text-center">Tồn kho hiện tại: {editItem.quantity} | Tối thiểu: {editItem.min_stock}</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setEditItem(null)} className="flex-1 py-3 rounded-xl bg-white/5 text-slate-300 font-bold hover:bg-white/10">Hủy</button>
                            <button onClick={handleUpdateQty} disabled={loading} className="flex-1 py-3 rounded-xl bg-primary text-background-dark font-black hover:brightness-110 disabled:opacity-60">
                                {loading ? 'Đang lưu...' : 'Lưu'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            {confirmDeleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setConfirmDeleteId(null)}>
                    <div className="glass-card w-full max-w-sm rounded-2xl border border-white/10 p-8 text-center" onClick={e => e.stopPropagation()}>
                        <span className="material-symbols-outlined text-5xl text-rose-400 mb-4 block">delete_forever</span>
                        <h3 className="text-xl font-black text-white mb-2">Xóa sản phẩm?</h3>
                        <p className="text-slate-400 text-sm mb-6">Thao tác này không thể hoàn tác.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmDeleteId(null)} className="flex-1 py-3 rounded-xl bg-white/5 text-slate-300 font-bold hover:bg-white/10">Hủy</button>
                            <button onClick={() => handleDelete(confirmDeleteId)} disabled={loading} className="flex-1 py-3 rounded-xl bg-rose-500 text-white font-black hover:bg-rose-600 disabled:opacity-60">
                                {loading ? 'Đang xóa...' : 'Xóa'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCustomer, updateCustomer, deleteCustomer } from '@/actions/customers';
import { Customer } from '@/types/customers';

interface Props {
    customers: Customer[];
}

export default function CustomerClient({ customers: initialCustomers }: Props) {
    const [customers, setCustomers] = useState(initialCustomers);
    const [search, setSearch] = useState('');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [message, setMessage] = useState('');
    const router = useRouter();

    const filtered = customers.filter(c =>
        c.full_name.toLowerCase().includes(search.toLowerCase()) ||
        (c.phone && c.phone.includes(search)) ||
        (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
    );

    function exportCSV() {
        const rows = [
            ['Tên khách hàng', 'Số điện thoại', 'Email', 'Ghi chú', 'Ngày tạo'],
            ...filtered.map(c => [
                c.full_name,
                c.phone || '',
                c.email || '',
                c.note || '',
                new Date(c.created_at).toLocaleDateString('vi-VN'),
            ]),
        ];
        const csv = rows.map(r => r.map(col => `"${col}"`).join(',')).join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `khach-hang-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    async function handleAddCustomer(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        const fd = new FormData(e.currentTarget);
        const result = await createCustomer(fd);
        setLoading(false);
        if (result.success) {
            setMessage('✅ Thêm khách hàng thành công!');
            (e.target as HTMLFormElement).reset();
            router.refresh();
            setTimeout(() => { setIsAddOpen(false); setMessage(''); }, 1200);
        } else {
            setMessage(`❌ ${result.message}`);
        }
    }

    async function handleEditCustomer(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        const fd = new FormData(e.currentTarget);
        const result = await updateCustomer(fd);
        setLoading(false);
        if (result.success) {
            setMessage('✅ Cập nhật khách hàng thành công!');
            router.refresh();
            setTimeout(() => { setIsEditOpen(false); setMessage(''); }, 1200);
        } else {
            setMessage(`❌ ${result.message}`);
        }
    }

    async function handleDelete(id: string) {
        setDeleteLoading(id);
        const result = await deleteCustomer(id);
        if (result.success) {
            setCustomers(prev => prev.filter(c => c.id !== id));
        } else {
            alert(result.message || 'Lỗi khi xoá khách hàng');
        }
        setConfirmDeleteId(null);
        setDeleteLoading(null);
        router.refresh();
    }

    function openEdit(customer: Customer) {
        setSelectedCustomer(customer);
        setIsEditOpen(true);
    }

    return (
        <>
            {/* Filter + toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">search</span>
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên, SĐT, email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:border-primary outline-none transition-colors"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={exportCSV} className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-300 text-sm font-bold flex items-center gap-2 hover:bg-white/10 transition-colors">
                        <span className="material-symbols-outlined text-base">download</span> Xuất danh sách
                    </button>
                    <button onClick={() => setIsAddOpen(true)} className="px-5 py-3 bg-primary text-background-dark rounded-xl text-sm font-black flex items-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined text-base">person_add</span> Thêm khách hàng
                    </button>
                </div>
            </div>

            {/* Total */}
            <div className="mb-6 p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-white">Tổng số lượng khách hàng</h3>
                    <p className="text-xs text-slate-500 mt-1">Dựa trên kết quả tìm kiếm hiển thị</p>
                </div>
                <div className="text-right">
                    <p className="text-3xl font-black text-primary">{filtered.length}</p>
                </div>
            </div>

            {/* Customer Table */}
            <div className="overflow-x-auto rounded-2xl border border-white/5 bg-white/[0.02]">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/[0.02] border-b border-white/5">
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Khách hàng</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Liên hệ</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Ghi chú</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Thành viên từ</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider w-24">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filtered.length > 0 ? filtered.map((customer) => (
                            <tr key={customer.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black">
                                            {customer.full_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{customer.full_name}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="space-y-1">
                                        {customer.phone ? (
                                            <p className="text-sm text-slate-300 flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px] text-slate-500">call</span> {customer.phone}</p>
                                        ) : (
                                            <p className="text-sm text-slate-600 italic">Chưa có SĐT</p>
                                        )}
                                        {customer.email && (
                                            <p className="text-xs text-slate-500 flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">mail</span> {customer.email}</p>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-400">
                                    {customer.note ? (
                                        <span className="line-clamp-2 max-w-xs">{customer.note}</span>
                                    ) : (
                                        <span className="text-slate-600 italic">—</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-400">
                                    {new Date(customer.created_at).toLocaleDateString('vi-VN')}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openEdit(customer)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-primary/20 hover:text-primary flex items-center justify-center text-slate-400 transition-colors">
                                            <span className="material-symbols-outlined text-[18px]">edit</span>
                                        </button>
                                        <button onClick={() => setConfirmDeleteId(customer.id)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 flex items-center justify-center text-slate-400 transition-colors">
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={5} className="px-6 py-20 text-center text-slate-500">
                                <span className="material-symbols-outlined text-4xl mb-3 block opacity-50">person_off</span>
                                Không có khách hàng nào phù hợp với tìm kiếm
                            </td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setIsAddOpen(false); }}>
                    <div className="bg-[#1a2235] border border-white/10 w-full max-w-md rounded-2xl p-8 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-white">Thêm khách hàng mới</h3>
                            <button onClick={() => setIsAddOpen(false)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 transition-colors">
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleAddCustomer} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tên khách hàng <span className="text-rose-500">*</span></label>
                                <input type="text" name="fullName" required placeholder="VD: Nguyễn Văn A" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary focus:bg-white/5 outline-none transition-all" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Số điện thoại</label>
                                    <input type="tel" name="phone" placeholder="VD: 09..." className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary focus:bg-white/5 outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</label>
                                    <input type="email" name="email" placeholder="VD: email@..." className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary focus:bg-white/5 outline-none transition-all" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ghi chú thêm</label>
                                <textarea name="note" rows={3} placeholder="Sở thích, loại tóc, lịch sử cắt..." className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary focus:bg-white/5 outline-none transition-all resize-none"></textarea>
                            </div>
                            {message && (
                                <div className={`p-3 rounded-xl text-sm font-semibold flex items-center gap-2 ${message.startsWith('✅') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                                    {message}
                                </div>
                            )}
                            <div className="flex gap-3 pt-4 border-t border-white/5">
                                <button type="button" onClick={() => setIsAddOpen(false)} className="flex-1 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-colors">Hủy</button>
                                <button type="submit" disabled={loading} className="flex-1 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-background-dark font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50">
                                    {loading ? <span className="w-5 h-5 border-2 border-background-dark/30 border-t-background-dark rounded-full animate-spin"></span> : 'Thêm mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditOpen && selectedCustomer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setIsEditOpen(false); }}>
                    <div className="bg-[#1a2235] border border-white/10 w-full max-w-md rounded-2xl p-8 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-white">Chỉnh sửa thông tin</h3>
                            <button onClick={() => setIsEditOpen(false)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 transition-colors">
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleEditCustomer} className="space-y-4">
                            <input type="hidden" name="id" value={selectedCustomer.id} />
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tên khách hàng <span className="text-rose-500">*</span></label>
                                <input type="text" name="fullName" required defaultValue={selectedCustomer.full_name} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary focus:bg-white/5 outline-none transition-all" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Số điện thoại</label>
                                    <input type="tel" name="phone" defaultValue={selectedCustomer.phone || ''} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary focus:bg-white/5 outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</label>
                                    <input type="email" name="email" defaultValue={selectedCustomer.email || ''} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary focus:bg-white/5 outline-none transition-all" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ghi chú thêm</label>
                                <textarea name="note" rows={3} defaultValue={selectedCustomer.note || ''} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary focus:bg-white/5 outline-none transition-all resize-none"></textarea>
                            </div>
                            {message && (
                                <div className={`p-3 rounded-xl text-sm font-semibold flex items-center gap-2 ${message.startsWith('✅') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                                    {message}
                                </div>
                            )}
                            <div className="flex gap-3 pt-4 border-t border-white/5">
                                <button type="button" onClick={() => setIsEditOpen(false)} className="flex-1 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-colors">Hủy</button>
                                <button type="submit" disabled={loading} className="flex-1 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-background-dark font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50">
                                    {loading ? <span className="w-5 h-5 border-2 border-background-dark/30 border-t-background-dark rounded-full animate-spin"></span> : 'Cập nhật'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            {confirmDeleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setConfirmDeleteId(null)}>
                    <div className="bg-[#1a2235] border border-white/10 w-full max-w-sm rounded-3xl p-8 text-center shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 mx-auto flex items-center justify-center text-rose-500 mb-6">
                            <span className="material-symbols-outlined text-3xl">person_remove</span>
                        </div>
                        <h3 className="text-xl font-black text-white mb-2">Xác nhận xóa?</h3>
                        <p className="text-slate-400 text-sm mb-8 leading-relaxed">Bạn có chắc chắn muốn xóa khách hàng này không? Mọi dữ liệu liên quan có thể bị ảnh hưởng.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmDeleteId(null)} className="flex-1 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-colors">Hủy bỏ</button>
                            <button onClick={() => handleDelete(confirmDeleteId)} disabled={!!deleteLoading} className="flex-1 py-3.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black transition-colors disabled:opacity-50 flex items-center justify-center">
                                {deleteLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Xóa ngay'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

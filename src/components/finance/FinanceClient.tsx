'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createExpense, deleteExpense } from '@/actions/finance';
import { Expense } from '@/types/finance';

const CATEGORIES = ['Tất cả', 'Lương nhân viên', 'Nhập hàng', 'Marketing', 'Điện nước', 'Thuê mặt bằng', 'Khác'];
const ADD_CATEGORIES = ['Lương nhân viên', 'Nhập hàng', 'Marketing', 'Điện nước', 'Thuê mặt bằng', 'Khác'];

interface Props {
    expenses: Expense[];
    grandTotal: number;
    byCategory: { category: string; total: number }[];
}

export default function FinanceClient({ expenses: initialExpenses }: Props) {
    const [expenses, setExpenses] = useState(initialExpenses);
    const [filterCat, setFilterCat] = useState('Tất cả');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [message, setMessage] = useState('');
    const router = useRouter();

    const filtered = filterCat === 'Tất cả' ? expenses : expenses.filter(e => e.category === filterCat);

    const formatCurrency = (n: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

    function exportCSV() {
        const rows = [
            ['Ngày', 'Tên khoản chi', 'Danh mục', 'Số tiền', 'Ghi chú'],
            ...filtered.map(e => [
                new Date(e.expense_date).toLocaleDateString('vi-VN'),
                e.title,
                e.category,
                e.amount.toString(),
                e.note || '',
            ]),
        ];
        const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chi-tieu-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    async function handleAddExpense(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        const fd = new FormData(e.currentTarget);
        const result = await createExpense(fd);
        setLoading(false);
        if (result.success) {
            setMessage('✅ Ghi nhận thành công!');
            (e.target as HTMLFormElement).reset();
            router.refresh();
            setTimeout(() => { setIsAddOpen(false); setMessage(''); }, 1200);
        } else {
            setMessage(`❌ ${result.message}`);
        }
    }

    async function handleDelete(id: string) {
        setDeleteLoading(id);
        await deleteExpense(id);
        setExpenses(prev => prev.filter(e => e.id !== id));
        setConfirmDeleteId(null);
        setDeleteLoading(null);
    }

    return (
        <>
            {/* Filter + toolbar */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="flex gap-2 flex-wrap flex-1">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilterCat(cat)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterCat === cat ? 'bg-primary text-background-dark' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2">
                    <button onClick={exportCSV} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-300 text-xs font-bold flex items-center gap-2 hover:bg-white/10 transition-colors">
                        <span className="material-symbols-outlined text-sm">download</span>Xuất CSV
                    </button>
                    <button onClick={() => setIsAddOpen(true)} className="px-4 py-2 bg-primary text-background-dark rounded-lg text-xs font-black flex items-center gap-2 hover:brightness-110 transition-all">
                        <span className="material-symbols-outlined text-sm">add_circle</span>Thêm chi tiêu
                    </button>
                </div>
            </div>

            {/* Total */}
            <div className="mb-4 p-4 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Tổng chi {filterCat !== 'Tất cả' ? `(${filterCat})` : ''}</p>
                    <p className="text-2xl font-black text-primary">{formatCurrency(filtered.reduce((s, e) => s + Number(e.amount), 0))}</p>
                </div>
                <p className="text-slate-500 text-sm">{filtered.length} giao dịch</p>
            </div>

            {/* Expense Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/[0.02]">
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ngày</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Khoản chi</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Danh mục</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Số tiền</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ghi chú</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Xóa</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filtered.length > 0 ? filtered.map((exp) => (
                            <tr key={exp.id} className="hover:bg-white/[0.03] transition-colors group">
                                <td className="px-6 py-4 text-sm text-slate-400">{new Date(exp.expense_date).toLocaleDateString('vi-VN')}</td>
                                <td className="px-6 py-4 text-sm font-semibold text-slate-100">{exp.title}</td>
                                <td className="px-6 py-4">
                                    <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black border border-primary/20">{exp.category}</span>
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-white">{formatCurrency(Number(exp.amount))}</td>
                                <td className="px-6 py-4 text-sm text-slate-500">{exp.note || '—'}</td>
                                <td className="px-6 py-4 text-center">
                                    <button
                                        onClick={() => setConfirmDeleteId(exp.id)}
                                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 flex items-center justify-center text-slate-500 mx-auto transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <span className="material-symbols-outlined text-lg">delete</span>
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={6} className="px-6 py-16 text-center text-slate-500">Không có dữ liệu</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Expense Modal */}
            {isAddOpen && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm cursor-pointer" 
                    onClick={(e) => { if (e.target === e.currentTarget) setIsAddOpen(false); }}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
                            setIsAddOpen(false);
                        }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label="Đóng cửa sổ"
                >
                    <div className="glass-card w-full max-w-md rounded-2xl border border-white/10 p-8 cursor-default" onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-white">Thêm khoản chi</h3>
                            <button onClick={() => setIsAddOpen(false)} className="text-slate-500 hover:text-white"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <form onSubmit={handleAddExpense} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tên khoản chi</label>
                                <input name="title" required placeholder="VD: Tiền lương tháng 3" className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Số tiền (VNĐ)</label>
                                    <input type="number" name="amount" required min="0" placeholder="5000000" className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ngày chi</label>
                                    <input type="date" name="expenseDate" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Danh mục</label>
                                <select name="category" required className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none">
                                    {ADD_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ghi chú</label>
                                <input name="note" placeholder="Mô tả thêm..." className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none" />
                            </div>
                            {message && <p className={`text-sm text-center py-2 rounded-lg font-semibold ${message.startsWith('✅') ? 'text-green-400 bg-green-500/10' : 'text-rose-400 bg-rose-500/10'}`}>{message}</p>}
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setIsAddOpen(false)} className="flex-1 py-3 rounded-xl bg-white/5 text-slate-300 font-bold">Hủy</button>
                                <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl bg-primary text-background-dark font-black hover:brightness-110 disabled:opacity-60 flex items-center justify-center gap-2">
                                    {loading ? <span className="w-4 h-4 border-2 border-background-dark/40 border-t-background-dark rounded-full animate-spin" /> : null}
                                    {loading ? 'Đang lưu...' : 'Ghi nhận'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            {confirmDeleteId && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm cursor-pointer" 
                    onClick={() => setConfirmDeleteId(null)}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
                            setConfirmDeleteId(null);
                        }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label="Đóng cửa sổ"
                >
                    <div className="glass-card w-full max-w-sm rounded-2xl border border-white/10 p-8 text-center cursor-default" onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}>
                        <span className="material-symbols-outlined text-5xl text-rose-400 mb-4 block">receipt_long</span>
                        <h3 className="text-xl font-black text-white mb-2">Xóa khoản chi?</h3>
                        <p className="text-slate-400 text-sm mb-6">Thao tác này không thể hoàn tác.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmDeleteId(null)} className="flex-1 py-3 rounded-xl bg-white/5 text-slate-300 font-bold">Hủy</button>
                            <button onClick={() => handleDelete(confirmDeleteId)} disabled={!!deleteLoading} className="flex-1 py-3 rounded-xl bg-rose-500 text-white font-black hover:bg-rose-600 disabled:opacity-60">
                                {deleteLoading ? 'Đang xóa...' : 'Xóa'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

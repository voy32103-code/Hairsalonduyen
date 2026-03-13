'use client';

import { useState, useEffect } from 'react';
import { deleteEmployee } from '@/actions/employees';
import { Employee } from '@/types/employees';

const ROLE_LABELS: Record<string, string> = {
    admin: 'Quản trị viên',
    manager: 'Quản lý',
    staff: 'Nhân viên',
};
const ROLE_COLORS: Record<string, string> = {
    admin: 'bg-primary/10 text-primary border-primary/20',
    manager: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    staff: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

export default function EmployeeTable({ employees }: { employees: Employee[] }) {
    const [items, setItems] = useState(employees);
    const [detailItem, setDetailItem] = useState<Employee | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Sync with fresh server data after router.refresh()
    useEffect(() => { setItems(employees); }, [employees]);

    async function handleDelete(id: string) {
        setLoading(true);
        await deleteEmployee(id);
        setItems(prev => prev.filter(e => e.id !== id));
        setConfirmDeleteId(null);
        setDetailItem(null);
        setLoading(false);
    }

    return (
        <>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/[0.02]">
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nhân viên</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Điện thoại</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Vai trò</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tham gia</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {items.length > 0 ? items.map((emp) => {
                            const seed = emp.full_name.replace(/\s/g, '');
                            const avatar = emp.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
                            const joinDate = new Date(emp.created_at).toLocaleDateString('vi-VN');
                            return (
                                <tr key={emp.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-cover bg-center flex-shrink-0 border border-white/10" style={{ backgroundImage: `url('${avatar}')` }} />
                                            <div>
                                                <p className="text-sm font-bold text-white">{emp.full_name}</p>
                                                <p className="text-xs text-slate-500">{emp.is_active ? 'Đang làm' : 'Nghỉ việc'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-400">{emp.email}</td>
                                    <td className="px-6 py-4 text-sm text-slate-400">{emp.phone || '—'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${ROLE_COLORS[emp.role] || ROLE_COLORS.staff}`}>
                                            {ROLE_LABELS[emp.role] || emp.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{joinDate}</td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => setDetailItem(emp)}
                                                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-primary/20 hover:text-primary flex items-center justify-center text-slate-400 transition-colors"
                                                title="Xem chi tiết"
                                            >
                                                <span className="material-symbols-outlined text-lg">person</span>
                                            </button>
                                            <button
                                                onClick={() => setConfirmDeleteId(emp.id)}
                                                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 flex items-center justify-center text-slate-400 transition-colors"
                                                title="Xóa nhân viên"
                                            >
                                                <span className="material-symbols-outlined text-lg">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-16 text-center">
                                    <span className="material-symbols-outlined text-4xl text-slate-700 block mb-2">group</span>
                                    <p className="text-slate-500">Chưa có nhân viên nào</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Detail slide-over */}
            {detailItem && (
                <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setDetailItem(null)}>
                    <div className="w-full max-w-md h-full glass-card border-l border-white/10 shadow-2xl overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-black text-white">Chi tiết nhân viên</h3>
                                <button onClick={() => setDetailItem(null)} className="text-slate-500 hover:text-white">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <div className="text-center mb-8">
                                <div className="w-24 h-24 rounded-full bg-cover bg-center mx-auto border-4 border-primary/30 mb-4"
                                    style={{ backgroundImage: `url('${detailItem.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${detailItem.full_name.replace(/\s/g, '')}`}')` }} />
                                <h4 className="text-2xl font-black text-white">{detailItem.full_name}</h4>
                                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-black uppercase border ${ROLE_COLORS[detailItem.role] || ROLE_COLORS.staff}`}>
                                    {ROLE_LABELS[detailItem.role] || detailItem.role}
                                </span>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { icon: 'email', label: 'Email', value: detailItem.email },
                                    { icon: 'phone', label: 'Điện thoại', value: detailItem.phone || 'Chưa cập nhật' },
                                    { icon: 'calendar_today', label: 'Ngày tham gia', value: new Date(detailItem.created_at).toLocaleDateString('vi-VN') },
                                    { icon: 'toggle_on', label: 'Trạng thái', value: detailItem.is_active ? 'Đang làm việc' : 'Nghỉ việc' },
                                ].map((row, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                                        <span className="material-symbols-outlined text-primary text-xl">{row.icon}</span>
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wider">{row.label}</p>
                                            <p className="text-white font-semibold">{row.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => { setDetailItem(null); setConfirmDeleteId(detailItem.id); }}
                                className="mt-8 w-full py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold hover:bg-rose-500/20 transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">delete</span>
                                Xóa nhân viên này
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete confirm */}
            {confirmDeleteId && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setConfirmDeleteId(null)}>
                    <div className="glass-card w-full max-w-sm rounded-2xl border border-white/10 p-8 text-center" onClick={e => e.stopPropagation()}>
                        <span className="material-symbols-outlined text-5xl text-rose-400 mb-4 block">person_remove</span>
                        <h3 className="text-xl font-black text-white mb-2">Xóa nhân viên?</h3>
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

'use client';

import { useState, useEffect } from 'react';
import { updateAppointmentStatus, deleteAppointment } from '@/actions/appointments';
import { sendReminder } from '@/actions/reminders';
import { Appointment } from '@/types/appointments';

interface Props {
    appointments: Appointment[];
    userRole?: string;
}

const STATUS_LABELS: Record<string, string> = {
    scheduled: 'Chờ xử lý',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
};

export default function AppointmentTable({ appointments, userRole = 'admin' }: Props) {
    const [items, setItems] = useState(appointments);
    const [loading, setLoading] = useState<string | null>(null);
    const [editId, setEditId] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    // Sync with fresh server data after router.refresh()
    useEffect(() => { setItems(appointments); }, [appointments]);

    const formatCurrency = (amount: number | string) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount));

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'scheduled': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'cancelled': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
            default: return 'bg-slate-500/10 text-slate-400';
        }
    };

    async function handleUpdateStatus(id: string, status: string) {
        setLoading(id);
        await updateAppointmentStatus(id, status);
        setItems(prev => prev.map(a => a.id === id ? { ...a, status } : a));
        setEditId(null);
        setLoading(null);
    }

    async function handleDelete(id: string) {
        setLoading(id);
        await deleteAppointment(id);
        setItems(prev => prev.filter(a => a.id !== id));
        setConfirmDeleteId(null);
        setLoading(null);
    }

    async function handleSendReminder(id: string) {
        setLoading(id);
        const res = await sendReminder(id);
        alert(res.message);
        setLoading(null);
    }

    return (
        <>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/[0.02]">
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Thời gian</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Khách hàng</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Dịch vụ</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nhân viên</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Trạng thái</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Tổng tiền</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {items.length > 0 ? items.map((appt) => {
                            const date = new Date(appt.appointment_time);
                            const timeStr = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                            const dateStr = date.toLocaleDateString('vi-VN');
                            return (
                                <tr key={appt.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="text-sm font-bold text-slate-200">{timeStr}</div>
                                        <div className="text-[10px] text-slate-500">{dateStr}</div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-primary">
                                                {appt.customer_name ? appt.customer_name.substring(0, 2).toUpperCase() : 'KH'}
                                            </div>
                                            <span className="text-sm font-medium text-slate-200">{appt.customer_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="px-3 py-1 rounded-full bg-white/5 text-[11px] font-bold text-slate-300">{appt.service_name}</span>
                                    </td>
                                    <td className="px-6 py-5 text-sm text-slate-400">{appt.staff_name || 'Bất kỳ'}</td>
                                    <td className="px-6 py-5 text-center">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusStyles(appt.status)}`}>
                                            {STATUS_LABELS[appt.status] || appt.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right font-bold text-primary">{formatCurrency(appt.price)}</td>
                                    <td className="px-6 py-5 text-center">
                                        {userRole === 'admin' ? (
                                            <div className="flex items-center justify-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                                                {/* Edit status */}
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setEditId(editId === appt.id ? null : appt.id)}
                                                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-primary/20 hover:text-primary flex items-center justify-center text-slate-400 transition-colors"
                                                        title="Cập nhật trạng thái"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">edit</span>
                                                    </button>
                                                    {editId === appt.id && (
                                                        <div className="absolute right-0 top-10 z-20 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden w-40">
                                                            {(['scheduled', 'completed', 'cancelled'] as const).map(s => (
                                                                <button
                                                                    key={s}
                                                                    disabled={loading === appt.id}
                                                                    onClick={() => handleUpdateStatus(appt.id, s)}
                                                                    className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-white/10 flex items-center gap-2 
                                                                        ${appt.status === s ? 'text-primary font-bold' : 'text-slate-300'}`}
                                                                >
                                                                    {loading === appt.id ? '...' : STATUS_LABELS[s]}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Delete */}
                                                <button
                                                    onClick={() => setConfirmDeleteId(appt.id)}
                                                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 flex items-center justify-center text-slate-400 transition-colors"
                                                    title="Xóa lịch hẹn"
                                                >
                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                </button>
                                                {/* Reminder */}
                                                {appt.status === 'scheduled' && (
                                                    <button
                                                        onClick={() => handleSendReminder(appt.id)}
                                                        disabled={loading === appt.id}
                                                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-blue-500/20 hover:text-blue-400 flex items-center justify-center text-slate-400 transition-colors"
                                                        title="Gửi nhắc lịch"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">{loading === appt.id ? 'hourglass_empty' : 'notifications_active'}</span>
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-slate-600 text-[10px] uppercase font-bold tracking-tight px-2 py-1 rounded bg-white/5">Chỉ xem</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan={7} className="px-6 py-16 text-center">
                                    <span className="material-symbols-outlined text-4xl text-slate-700 block mb-2">calendar_month</span>
                                    <p className="text-slate-500">Chưa có lịch hẹn nào</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Delete confirm modal */}
            {confirmDeleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setConfirmDeleteId(null)}>
                    <div className="glass-card w-full max-w-sm rounded-2xl border border-white/10 p-8 text-center" onClick={e => e.stopPropagation()}>
                        <span className="material-symbols-outlined text-5xl text-rose-400 mb-4 block">warning</span>
                        <h3 className="text-xl font-black text-white mb-2">Xóa lịch hẹn?</h3>
                        <p className="text-slate-400 text-sm mb-6">Thao tác này không thể hoàn tác.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmDeleteId(null)} className="flex-1 py-3 rounded-xl bg-white/5 text-slate-300 font-bold hover:bg-white/10">Hủy</button>
                            <button
                                onClick={() => handleDelete(confirmDeleteId)}
                                disabled={loading === confirmDeleteId}
                                className="flex-1 py-3 rounded-xl bg-rose-500 text-white font-black hover:bg-rose-600 disabled:opacity-60"
                            >
                                {loading === confirmDeleteId ? 'Đang xóa...' : 'Xóa'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

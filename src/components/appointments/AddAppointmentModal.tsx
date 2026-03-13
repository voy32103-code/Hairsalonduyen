'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createAppointment } from '@/actions/appointments';

export default function AddAppointmentModal({ services = [] }: { services?: any[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [selectedPrice, setSelectedPrice] = useState<string>('');
    const formRef = useRef<HTMLFormElement>(null);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setMessage('');
        const result = await createAppointment(formData);
        setLoading(false);
        if (result.success) {
            setMessage('✅ Đặt lịch hẹn thành công!');
            formRef.current?.reset();
            router.refresh();
            setTimeout(() => { setIsOpen(false); setMessage(''); }, 1200);
        } else {
            setMessage(`❌ ${result.message}`);
        }
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="bg-primary hover:brightness-110 text-[#111827] font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-primary/10"
            >
                <span className="material-symbols-outlined">add_circle</span>
                Thêm lịch hẹn mới
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}>
                    <div className="glass-card w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-white">Lịch hẹn mới</h3>
                                <p className="text-slate-500 text-sm mt-1">Điền đầy đủ thông tin để đặt lịch</p>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-2xl">close</span>
                            </button>
                        </div>

                        <form ref={formRef} action={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tên khách hàng</label>
                                    <input name="customerName" required placeholder="Nguyễn Thị A" className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none transition-colors" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Số điện thoại</label>
                                    <input name="phone" required placeholder="09xx xxx xxx" className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none transition-colors" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dịch vụ</label>
                                <select 
                                    name="serviceId" 
                                    required 
                                    defaultValue=""
                                    className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none transition-colors"
                                    onChange={(e) => {
                                        const svc = services.find(s => s.id === e.target.value);
                                        if (svc) setSelectedPrice(svc.price.toString());
                                    }}
                                >
                                    <option value="" disabled>-- Chọn dịch vụ --</option>
                                    {services.map(s => (
                                        <option key={s.id} value={s.id}>{s.name} - {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(s.price))}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ngày &amp; Giờ hẹn</label>
                                    <input type="datetime-local" name="appointmentTime" required className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none transition-colors" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Giá (VNĐ)</label>
                                    <input type="number" name="price" value={selectedPrice} onChange={e => setSelectedPrice(e.target.value)} placeholder="Tự động tính" className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none transition-colors" />
                                </div>
                            </div>

                            {message && (
                                <p className={`text-sm font-semibold text-center py-2 rounded-lg ${message.startsWith('✅') ? 'text-green-400 bg-green-500/10' : 'text-rose-400 bg-rose-500/10'}`}>{message}</p>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setIsOpen(false)} className="flex-1 py-3 rounded-xl bg-white/5 text-slate-300 font-bold hover:bg-white/10 transition-colors">Hủy bỏ</button>
                                <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl bg-primary text-[#111827] font-black hover:brightness-110 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                                    {loading ? <span className="w-4 h-4 border-2 border-[#111827]/40 border-t-[#111827] rounded-full animate-spin" /> : <span className="material-symbols-outlined text-xl">check_circle</span>}
                                    {loading ? 'Đang lưu...' : 'Xác nhận đặt lịch'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createEmployee } from '@/actions/employees';
import FaceCapture from '@/components/attendance/FaceCapture';

export default function AddEmployeeModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<1 | 2>(1);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [newUserId, setNewUserId] = useState<string | null>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setMessage('');
        const result = await createEmployee(formData);
        setLoading(false);
        if (result.success && result.userId) {
            setMessage('✅ Thêm thông tin thành công! Vui lòng cập nhật khuôn mặt.');
            setNewUserId(result.userId);
            setStep(2);
        } else {
            setMessage(`❌ ${result.message}`);
        }
    }

    async function handleFaceCaptured(descriptor: number[]) {
        if (!newUserId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/staff/${newUserId}/face`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ faceDescriptor: descriptor })
            });
            const data = await res.json();
            if (data.success) {
                setMessage('✅ Lưu khuôn mặt thành công!');
                formRef.current?.reset();
                router.refresh();
                setTimeout(() => { setIsOpen(false); setStep(1); setNewUserId(null); setMessage(''); }, 1500);
            } else {
                setMessage(`❌ ${data.message}`);
            }
        } catch (e) {
            setMessage('❌ Lỗi khi lưu khuôn mặt.');
        } finally {
            setLoading(false);
        }
    }

    function handleClose() {
        setIsOpen(false);
        setStep(1);
        setMessage('');
        setNewUserId(null);
    }

    return (
        <>
            <button onClick={() => setIsOpen(true)} className="px-4 py-2 bg-primary text-background-dark rounded-lg text-xs font-black flex items-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-sm">person_add</span>
                Thêm nhân viên
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}>
                    <div className="glass-card w-full max-w-md rounded-2xl border border-white/10 shadow-2xl p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-white">Thêm nhân viên</h3>
                                <p className="text-slate-500 text-sm mt-1">
                                    {step === 1 ? 'Thêm thành viên mới vào team' : 'Đăng ký khuôn mặt cho nhân viên'}
                                </p>
                            </div>
                            <button onClick={handleClose} className="text-slate-500 hover:text-white">
                                <span className="material-symbols-outlined text-2xl">close</span>
                            </button>
                        </div>

                        {step === 1 ? (
                        <form ref={formRef} action={handleSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Họ và tên</label>
                                <input name="fullName" required placeholder="Nguyễn Thị A" className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none transition-colors" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</label>
                                <input type="email" name="email" required placeholder="nv@duyensalon.vn" className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none transition-colors" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Số điện thoại</label>
                                <input name="phone" required placeholder="09xx xxx xxx" className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none transition-colors" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vai trò</label>
                                <select name="role" required className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none transition-colors">
                                    <option value="staff">Nhân viên (Stylist)</option>
                                    <option value="manager">Quản lý</option>
                                </select>
                            </div>

                            {message && (
                                <p className={`text-sm font-semibold text-center py-2 rounded-lg ${message.startsWith('✅') ? 'text-green-400 bg-green-500/10' : 'text-rose-400 bg-rose-500/10'}`}>{message}</p>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={handleClose} className="flex-1 py-3 rounded-xl bg-white/5 text-slate-300 font-bold hover:bg-white/10">Hủy</button>
                                <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl bg-primary text-[#111827] font-black hover:brightness-110 disabled:opacity-60 flex items-center justify-center gap-2">
                                    {loading ? <span className="w-4 h-4 border-2 border-[#111827]/40 border-t-[#111827] rounded-full animate-spin" /> : null}
                                    {loading ? 'Đang lưu...' : 'Tiếp tục'}
                                </button>
                            </div>
                        </form>
                        ) : (
                            <div className="space-y-4">
                                <FaceCapture onCapture={handleFaceCaptured} onCancel={handleClose} />
                                {message && (
                                    <p className={`text-sm font-semibold text-center py-2 rounded-lg ${message.startsWith('✅') ? 'text-green-400 bg-green-500/10' : 'text-rose-400 bg-rose-500/10'}`}>{message}</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const [form, setForm] = useState({
        fullName: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp.');
            return;
        }

        setLoading(true);
        setError('');

        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });

        const data = await res.json();
        setLoading(false);

        if (data.success) {
            router.push('/login?registered=true');
        } else {
            setError(data.message || 'Lỗi khi đăng ký tài khoản.');
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background-dark relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />

            <div className="relative z-10 w-full max-w-md px-6 py-12">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-background-dark mx-auto mb-4 shadow-xl shadow-primary/30">
                        <span className="material-symbols-outlined text-3xl">person_add</span>
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Tham gia hệ thống</h1>
                    <p className="text-slate-500 mt-2 text-sm">Tạo tài khoản quản trị mới cho salon của bạn</p>
                </div>

                <div className="glass-card rounded-2xl border border-white/10 p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Họ và tên</label>
                            <input
                                type="text"
                                value={form.fullName}
                                onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                                required
                                placeholder="Nhập họ và tên..."
                                className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none transition-colors"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Số điện thoại</label>
                            <input
                                type="tel"
                                value={form.phone}
                                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                required
                                placeholder="0901 234 567"
                                className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none transition-colors"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                required
                                placeholder="name@example.com"
                                className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none transition-colors"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mật khẩu</label>
                                <input
                                    type="password"
                                    value={form.password}
                                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none transition-colors"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Xác nhận</label>
                                <input
                                    type="password"
                                    value={form.confirmPassword}
                                    onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none transition-colors"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-xl bg-primary text-background-dark font-black hover:brightness-110 transition-all disabled:opacity-60 shadow-lg shadow-primary/20 mt-2"
                        >
                            {loading ? 'Đang khởi tạo...' : 'Đăng ký ngay'}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <p className="text-slate-500 text-sm">
                            Đã có tài khoản?{' '}
                            <Link href="/login" className="text-primary font-bold hover:underline">
                                Đăng nhập
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

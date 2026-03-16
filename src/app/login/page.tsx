'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (searchParams.get('registered') === 'true') {
            setShowSuccess(true);
        }
    }, [searchParams]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');

        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });

        const data = await res.json();
        setLoading(false);

        if (data.success) {
            router.push('/admin');
            router.refresh();
        } else {
            setError(data.message || 'Email hoặc mật khẩu không đúng.');
        }
    }

    return (
        <div className="glass-card rounded-2xl border border-white/10 p-8 shadow-2xl">
            <h2 className="text-xl font-black text-white mb-6">Đăng nhập</h2>

            {showSuccess && (
                <div className="mb-6 p-3 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-400 text-xl">check_circle</span>
                    <p className="text-green-400 text-xs font-bold">Đăng ký thành công! Vui lòng đăng nhập.</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xl">email</span>
                        <input
                            type="email"
                            value={form.email}
                            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                            required
                            placeholder="admin@duyenhairsalon.vn"
                            className="w-full bg-slate-900/70 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white text-sm focus:border-primary outline-none transition-colors"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mật khẩu</label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xl">lock</span>
                        <input
                            type="password"
                            value={form.password}
                            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                            required
                            placeholder="••••••••"
                            className="w-full bg-slate-900/70 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white text-sm focus:border-primary outline-none transition-colors"
                        />
                    </div>
                </div>

                {error && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2">
                        <span className="material-symbols-outlined text-rose-400 text-xl">error</span>
                        <p className="text-rose-400 text-sm font-semibold">{error}</p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-primary text-background-dark font-black hover:brightness-110 transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                >
                    {loading ? (
                        <span className="w-5 h-5 border-2 border-background-dark/40 border-t-background-dark rounded-full animate-spin" />
                    ) : (
                        <span className="material-symbols-outlined">login</span>
                    )}
                    {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/5 text-center space-y-4">
                <Link href="/checkin" className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 text-primary font-bold hover:bg-white/10 transition-colors border border-primary/20">
                    <span className="material-symbols-outlined text-xl">face_retouching_natural</span>
                    Trạm Chấm Công Khuôn Mặt
                </Link>
                <p className="text-slate-500 text-xs mt-4">
                    Chưa có tài khoản?{' '}
                    <Link href="/register" className="text-primary font-bold hover:underline">
                        Đăng ký ngay
                    </Link>
                </p>
                <div className="opacity-40">
                    <p className="text-slate-500 text-[10px]">
                        Tài khoản mặc định: <span className="text-primary font-mono">admin@duyenhairsalon.vn</span>
                    </p>
                    <p className="text-slate-500 text-[10px] mt-1">
                        Mật khẩu: <span className="text-primary font-mono">admin123</span>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background-dark relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
            <div className="absolute top-20 left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />

            <div className="relative z-10 w-full max-w-md px-6">
                {/* Logo */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-background-dark mx-auto mb-4 shadow-xl shadow-primary/30">
                        <span className="material-symbols-outlined text-3xl">content_cut</span>
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">DuyenHairSalon</h1>
                    <p className="text-slate-500 mt-2 text-sm">Đăng nhập vào hệ thống quản trị</p>
                </div>

                {/* Card wrapping in Suspense */}
                <Suspense fallback={
                    <div className="glass-card rounded-2xl border border-white/10 p-8 shadow-2xl h-[400px] flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    </div>
                }>
                    <LoginForm />
                </Suspense>
            </div>
        </div>
    );
}

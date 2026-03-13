'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateSettings } from '@/actions/settings';

interface UserProfile {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    avatar_url: string | null;
    role: string;
}

export default function SettingsForm({ userProfile }: { userProfile: UserProfile | null }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [form, setForm] = useState({
        fullName: userProfile?.full_name || 'Võ Thị Thu Duyên',
        email: userProfile?.email || 'admin@duyenhairsalon.vn',
        phone: userProfile?.phone || '0372999667',
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!userProfile?.id) {
            setMessage('❌ Không tìm thấy thông tin người dùng.');
            return;
        }
        setLoading(true);
        setMessage('');
        const fd = new FormData();
        fd.append('userId', userProfile.id);
        fd.append('fullName', form.fullName);
        fd.append('email', form.email);
        fd.append('phone', form.phone);
        const result = await updateSettings(fd);
        setLoading(false);
        setMessage(result.success ? '✅ Lưu thành công!' : `❌ ${result.message}`);
        if (result.success) {
            router.refresh();
        }
        setTimeout(() => setMessage(''), 3000);
    }

    const avatarSeed = form.fullName.replace(/\s/g, '') || 'ThuDuyen';
    const avatar = userProfile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`;

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Avatar section */}
            <div className="flex items-center gap-6 p-6 glass-card rounded-2xl border border-white/5">
                <div className="w-24 h-24 rounded-full bg-cover bg-center border-4 border-primary/30 flex-shrink-0" style={{ backgroundImage: `url('${avatar}')` }} />
                <div>
                    <h3 className="text-xl font-black text-white">{form.fullName}</h3>
                    <p className="text-slate-400 text-sm mt-1 capitalize">{userProfile?.role || 'admin'} · DuyenHairSalon</p>
                    <p className="text-xs text-slate-500 mt-2">Avatar được tạo tự động từ tên</p>
                </div>
            </div>

            {/* Profile fields */}
            <div className="glass-card rounded-2xl border border-white/5 p-8 space-y-6">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">person</span>
                    Thông tin cá nhân
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Họ và tên</label>
                        <input
                            value={form.fullName}
                            onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                            className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Số điện thoại</label>
                        <input
                            value={form.phone}
                            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                            className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none transition-colors"
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                            className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* System info (read-only) */}
            <div className="glass-card rounded-2xl border border-white/5 p-8 space-y-4">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">settings</span>
                    Thông tin hệ thống
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    {[
                        { label: 'Phiên bản', value: 'v1.0.0' },
                        { label: 'Database', value: 'Neon PostgreSQL' },
                        { label: 'Múi giờ', value: 'Asia/Ho_Chi_Minh (GMT+7)' },
                        { label: 'Ngôn ngữ', value: 'Tiếng Việt' },
                    ].map((item, i) => (
                        <div key={i} className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                            <p className="text-xs text-slate-500 uppercase tracking-wider">{item.label}</p>
                            <p className="text-white font-semibold text-sm mt-1">{item.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Save button */}
            {message && (
                <p className={`text-sm font-semibold text-center py-3 rounded-xl ${message.startsWith('✅') ? 'text-green-400 bg-green-500/10 border border-green-500/20' : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'}`}>
                    {message}
                </p>
            )}

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 rounded-xl bg-primary text-background-dark font-black hover:brightness-110 transition-all disabled:opacity-60 flex items-center gap-2 shadow-lg shadow-primary/20"
                >
                    {loading ? (
                        <span className="w-4 h-4 border-2 border-background-dark/40 border-t-background-dark rounded-full animate-spin" />
                    ) : (
                        <span className="material-symbols-outlined">save</span>
                    )}
                    {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
            </div>
        </form>
    );
}

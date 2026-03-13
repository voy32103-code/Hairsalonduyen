'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AttendanceWidget from '../employees/AttendanceWidget';

interface NotifItem {
    id: string;
    icon: string;
    text: string;
    time: string;
    unread: boolean;
    link?: string;
}

export default function Header({ initialActiveSession }: { initialActiveSession?: any }) {
    const [isDark, setIsDark] = useState(true);
    const [notifs, setNotifs] = useState<NotifItem[]>([]);
    const [showNotifs, setShowNotifs] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [userRole, setUserRole] = useState('admin');
    const [userName, setUserName] = useState('Admin');
    const [userEmail, setUserEmail] = useState('');
    const [activeSession, setActiveSession] = useState<any>(initialActiveSession);
    const notifRef = useRef<HTMLDivElement>(null);
    const userRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const router = useRouter();

    // Init dark mode from localStorage on first render
    useEffect(() => {
        const saved = localStorage.getItem('theme');
        const dark = saved !== 'light';
        setIsDark(dark);
        if (dark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    // Read user info from cookies
    useEffect(() => {
        const cookies = Object.fromEntries(document.cookie.split(';').map(c => c.trim().split('=')));
        setUserRole(cookies['user_role'] || 'admin');
        setUserName(decodeURIComponent(cookies['user_full_name'] || 'Admin'));
        setUserEmail(decodeURIComponent(cookies['user_email'] || ''));
    }, []);

    // SSE: connect to /api/events for real-time notifications
    useEffect(() => {
        let eventSource: EventSource;
        let retryTimer: NodeJS.Timeout;

        function connect() {
            eventSource = new EventSource('/api/events');

            eventSource.addEventListener('new_appointment', (e) => {
                const d = JSON.parse(e.data);
                addNotif({ 
                    icon: 'event', 
                    text: `Lịch hẹn mới: ${d.customerName} – ${d.service}`, 
                    unread: true,
                    link: '/admin/appointments'
                });
            });

            eventSource.addEventListener('new_employee', (e) => {
                const d = JSON.parse(e.data);
                addNotif({ 
                    icon: 'person_add', 
                    text: `Nhân viên mới: ${d.name} đã được thêm`, 
                    unread: true,
                    link: '/admin/employees'
                });
            });

            eventSource.addEventListener('new_invoice', (e) => {
                const d = JSON.parse(e.data);
                addNotif({ 
                    icon: 'receipt_long', 
                    text: `Hóa đơn mới: #${d.invoiceId} (${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(d.total)})`, 
                    unread: true,
                    link: '/admin/finance/invoices'
                });
            });

            eventSource.addEventListener('low_stock', (e) => {
                const d = JSON.parse(e.data);
                addNotif({ 
                    icon: 'warning', 
                    text: `Kho cảnh báo: ${d.product} sắp hết hàng`, 
                    unread: true, 
                    link: '/admin/inventory' 
                });
            });

            eventSource.addEventListener('new_expense', (e) => {
                const d = JSON.parse(e.data);
                addNotif({ 
                    icon: 'payments', 
                    text: `Chi phí mới: ${d.title} (${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(d.amount)})`, 
                    unread: true, 
                    link: '/admin/finance' 
                });
            });

            eventSource.onerror = () => {
                eventSource.close();
                retryTimer = setTimeout(connect, 5000); // retry in 5s
            };
        }

        connect();
        return () => {
            eventSource?.close();
            clearTimeout(retryTimer);
        };
    }, []);

    function addNotif(n: Omit<NotifItem, 'id' | 'time'>) {
        const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        setNotifs(prev => [{ ...n, id: Date.now().toString(), time: `lúc ${now}` }, ...prev].slice(0, 10));
    }

    // Close dropdowns on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false);
            if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUserMenu(false);
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    useEffect(() => { setShowNotifs(false); setShowUserMenu(false); }, [pathname]);

    function toggleDark() {
        const next = !isDark;
        setIsDark(next);
        if (next) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', next ? 'dark' : 'light');
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        router.push(`/admin/appointments?q=${encodeURIComponent(searchQuery)}`);
    }

    async function handleLogout() {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
        router.refresh();
    }

    const unreadCount = notifs.filter(n => n.unread).length;

    return (
        <header className="flex items-center justify-between px-8 py-4 sticky top-0 z-50 bg-[rgba(17,24,39,0.85)] backdrop-blur-xl border-b border-white/5">
            {/* Logo */}
            <div className="flex items-center gap-3 w-1/3">
                <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-background-dark shadow-lg shadow-primary/30">
                    <span className="material-symbols-outlined text-xl">content_cut</span>
                </div>
                <h1 className="text-lg font-black tracking-wide text-white">DuyenHairSalon</h1>
            </div>

            {/* Search */}
            <div className="w-1/3 flex justify-center">
                <form onSubmit={handleSearch} className="relative w-full max-w-sm">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xl">search</span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Tìm kiếm lịch hẹn..."
                        className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                </form>
            </div>

            {/* Right actions */}
            <div className="flex items-center justify-end gap-3 w-1/3">
                {/* Dark mode toggle */}
                {/* Attendance Widget */}
                <AttendanceWidget activeSession={activeSession} />

                {/* Dark mode toggle */}
                <button
                    onClick={toggleDark}
                    title={isDark ? 'Light Mode' : 'Dark Mode'}
                    className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/30 transition-all"
                >
                    <span className="material-symbols-outlined text-[20px]">{isDark ? 'light_mode' : 'dark_mode'}</span>
                </button>

                {/* Notifications */}
                <div ref={notifRef} className="relative">
                    <button
                        onClick={() => { setShowNotifs(p => !p); setNotifs(prev => prev.map(n => ({ ...n, unread: false }))); }}
                        className="relative w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/30 transition-all"
                    >
                        <span className="material-symbols-outlined text-[20px]">notifications</span>
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-[9px] font-black text-background-dark flex items-center justify-center">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {showNotifs && (
                        <div className="absolute right-0 top-12 w-80 bg-[rgba(17,24,39,0.97)] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
                            <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center">
                                <h3 className="font-black text-white text-sm">Thông báo</h3>
                                <span className="text-xs text-primary">{notifs.length} thông báo</span>
                            </div>
                            {notifs.length > 0 ? (
                                <div className="divide-y divide-white/5 max-h-72 overflow-y-auto">
                                    {notifs.map(n => (
                                        <div 
                                            key={n.id} 
                                            onClick={() => {
                                                if (n.link) {
                                                    router.push(n.link);
                                                    setShowNotifs(false);
                                                }
                                            }}
                                            className="px-5 py-4 flex gap-3 hover:bg-white/5 cursor-pointer transition-colors"
                                        >
                                            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                                                <span className="material-symbols-outlined text-lg">{n.icon}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-slate-200 leading-snug">{n.text}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">{n.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="px-5 py-8 text-center">
                                    <span className="material-symbols-outlined text-3xl text-slate-700 block mb-2">notifications_off</span>
                                    <p className="text-slate-500 text-sm">Chưa có thông báo mới</p>
                                    <p className="text-slate-600 text-xs mt-1">Thông báo realtime sẽ xuất hiện ở đây</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* User menu */}
                <div ref={userRef} className="relative">
                    <button
                        onClick={() => setShowUserMenu(p => !p)}
                        className="flex items-center gap-2.5 pl-3 border-l border-white/10 hover:opacity-80 transition-opacity"
                    >
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-bold text-white leading-tight">{userName}</p>
                            <p className="text-[10px] text-slate-500 capitalize">{userRole === 'admin' ? 'System Admin' : 'Nhân viên'}</p>
                        </div>
                        <div
                            className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 bg-cover bg-center flex-shrink-0"
                            style={{ backgroundImage: `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}')` }}
                        />
                    </button>

                    {showUserMenu && (
                        <div className="absolute right-0 top-12 w-52 bg-[rgba(17,24,39,0.97)] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
                            <div className="px-4 py-3 border-b border-white/5">
                                <p className="text-sm font-bold text-white">{userName}</p>
                                <p className="text-xs text-slate-500">{userEmail}</p>
                            </div>
                            <div className="p-2">
                                <a href="/admin/settings" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-white/5 text-sm transition-colors">
                                    <span className="material-symbols-outlined text-lg">settings</span>
                                    Cài đặt tài khoản
                                </a>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-rose-400 hover:bg-rose-500/10 text-sm transition-colors"
                                >
                                    <span className="material-symbols-outlined text-lg">logout</span>
                                    Đăng xuất
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

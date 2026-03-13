'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

// Admin sees everything, staff sees a limited subset
const ADMIN_NAV = [
    { section: 'Tổng quan', items: [{ href: '/admin', icon: 'dashboard', label: 'Dashboard' }] },
    {
        section: 'Quản lý', items: [
            { href: '/admin/appointments', icon: 'calendar_month', label: 'Lịch hẹn' },
            { href: '/admin/customers', icon: 'person', label: 'Khách hàng' },
            { href: '/admin/employees', icon: 'group', label: 'Nhân viên' },
            { href: '/admin/employees/schedule', icon: 'event_note', label: 'Lịch làm việc' },
            { href: '/admin/employees/attendance', icon: 'assignment_turned_in', label: 'Chấm công' },
            { href: '/admin/services', icon: 'content_cut', label: 'Dịch vụ' },
            { href: '/admin/inventory', icon: 'inventory_2', label: 'Kho hàng' },
        ]
    },
    {
        section: 'Bán hàng & Thu ngân', items: [
            { href: '/admin/pos', icon: 'point_of_sale', label: 'POS - Tính tiền' },
            { href: '/admin/finance/invoices', icon: 'receipt_long', label: 'Hóa đơn' },
        ]
    },
    {
        section: 'Báo cáo & Tài chính', items: [
            { href: '/admin/finance', icon: 'payments', label: 'Thu chi' },
            { href: '/admin/finance/payroll', icon: 'account_balance_wallet', label: 'Bảng lương' },
            { href: '/admin/reports', icon: 'analytics', label: 'Báo cáo' },
        ]
    },
    {
        section: 'Hệ thống', items: [
            { href: '/admin/permissions', icon: 'admin_panel_settings', label: 'Phân quyền' },
            { href: '/admin/settings', icon: 'settings', label: 'Cài đặt' },
        ]
    },
];

const STAFF_NAV = [
    { section: 'Tổng quan', items: [{ href: '/admin', icon: 'dashboard', label: 'Dashboard' }] },
    {
        section: 'Công việc', items: [
            { href: '/admin/appointments', icon: 'calendar_month', label: 'Lịch hẹn' },
            { href: '/admin/customers', icon: 'person', label: 'Khách hàng' },
            { href: '/admin/employees/schedule', icon: 'event_note', label: 'Lịch làm việc' },
            { href: '/admin/employees/attendance', icon: 'assignment_turned_in', label: 'Chấm công' },
            { href: '/admin/inventory', icon: 'inventory_2', label: 'Kho hàng' },
        ]
    },
    {
        section: 'Cá nhân', items: [
            { href: '/admin/settings', icon: 'settings', label: 'Cài đặt' },
        ]
    },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [userRole, setUserRole] = useState<'admin' | 'staff'>('admin');

    useEffect(() => {
        const cookies = Object.fromEntries(
            document.cookie.split(';').map(c => { const [k, v] = c.trim().split('='); return [k, v]; })
        );
        const role = cookies['user_role'];
        if (role === 'staff') setUserRole('staff');
        else setUserRole('admin');
    }, []);

    const navGroups = userRole === 'staff' ? STAFF_NAV : ADMIN_NAV;

    function isActive(href: string) {
        if (href === '/admin') return pathname === '/admin';
        return pathname.startsWith(href);
    }

    return (
        <aside className="w-64 flex-shrink-0 flex flex-col min-h-screen bg-[rgba(17,24,39,0.70)] border-r border-white/5 py-8">
            {/* Role badge */}
            <div className="px-6 mb-6">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-black uppercase tracking-wider ${userRole === 'admin' ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'}`}>
                    <span className="material-symbols-outlined text-base">
                        {userRole === 'admin' ? 'admin_panel_settings' : 'badge'}
                    </span>
                    {userRole === 'admin' ? 'Hệ thống Admin' : 'Nhân viên (Staff)'}
                </div>
            </div>

            {/* Nav groups */}
            <nav className="flex-1 px-4 space-y-6 overflow-y-auto">
                {navGroups.map((group) => (
                    <div key={group.section}>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2 px-3">{group.section}</p>
                        <div className="space-y-0.5">
                            {group.items.map((item) => {
                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group
                                            ${active
                                                ? 'bg-primary text-background-dark shadow-lg shadow-primary/20'
                                                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                                            }`}
                                    >
                                        <span className={`material-symbols-outlined text-[20px] ${active ? 'text-background-dark' : ''}`}>
                                            {item.icon}
                                        </span>
                                        {item.label}
                                        {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-background-dark" />}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Footer help */}
            <div className="px-6 mt-6">
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 text-center">
                    <span className="material-symbols-outlined text-primary text-2xl block mb-1">content_cut</span>
                    <p className="text-white text-xs font-bold">DuyenHairSalon</p>
                    <p className="text-slate-600 text-[10px]">© 2025 Admin v1.0</p>
                </div>
            </div>
        </aside>
    );
}

export const dynamic = 'force-dynamic';

import { getRolesData } from '@/data/permissions';
import { cookies } from 'next/headers';
import PermissionsClient from '@/components/permissions/PermissionsClient';

export default async function PermissionsPage() {
    const cookieStore = await cookies();
    const userRole = cookieStore.get('user_role')?.value || 'admin';

    if (userRole !== 'admin') {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-10">
                <div className="w-20 h-20 rounded-3xl bg-rose-500/10 flex items-center justify-center text-rose-500 mb-6 border border-rose-500/20">
                    <span className="material-symbols-outlined text-4xl">admin_panel_settings</span>
                </div>
                <h2 className="text-2xl font-black text-white mb-2">Truy cập bị từ chối</h2>
                <p className="text-slate-500 max-w-sm">Bạn không có quyền quản lý phân quyền hệ thống.</p>
                <a href="/admin" className="mt-8 px-6 py-3 rounded-xl bg-primary text-background-dark font-black hover:brightness-110 transition-all">Quay lại Dashboard</a>
            </div>
        );
    }
    const data = await getRolesData();

    return (
        <div className="max-w-6xl mx-auto py-4">
            <nav className="flex text-[10px] text-slate-500 mb-6 gap-2 items-center uppercase tracking-widest font-black">
                <span>Hệ thống</span>
                <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                <span className="text-primary font-black">Phân quyền</span>
            </nav>

            <PermissionsClient roles={data.roles || []} />
        </div>
    );
}

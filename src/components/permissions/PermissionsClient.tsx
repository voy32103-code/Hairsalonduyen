'use client';

import { useState } from 'react';
import { updateRolePermissions } from '@/actions/permissions';
import { RoleWithPermissions, Module } from '@/types/permissions';

const MODULES: Module[] = [
    { key: 'appointments', name: "Lịch hẹn", icon: "calendar_month" },
    { key: 'finance', name: "Tài chính", icon: "payments" },
    { key: 'employees', name: "Nhân viên", icon: "badge" },
    { key: 'inventory', name: "Kho hàng", icon: "inventory_2" },
    { key: 'reports', name: "Báo cáo", icon: "query_stats" }
];

export default function PermissionsClient({ roles: initialRoles }: { roles: RoleWithPermissions[] }) {
    const [roles] = useState(initialRoles);
    const [selectedRoleId, setSelectedRoleId] = useState(roles[0]?.id);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // Local state for pending changes
    const [permissions, setPermissions] = useState<Record<string, string[]>>(
        Object.fromEntries(roles.map((r: RoleWithPermissions) => [r.id, [...r.permissions]]))
    );

    const selectedRole = roles.find((r: RoleWithPermissions) => r.id === selectedRoleId);
    const isAdmin = selectedRole?.name === 'admin';

    const togglePermission = (moduleKey: string, action: string) => {
        if (isAdmin) return; // Admin always has full power

        const key = `${moduleKey}_${action}`;
        setPermissions(prev => {
            const rolePerms = prev[selectedRoleId] || [];
            const newPerms = rolePerms.includes(key)
                ? rolePerms.filter((p: string) => p !== key)
                : [...rolePerms, key];

            return {
                ...prev,
                [selectedRoleId]: newPerms
            };
        });
        setSuccess(false);
        setError('');
    };

    const isChecked = (moduleKey: string, action: string) => {
        if (isAdmin) return true;
        return permissions[selectedRoleId]?.includes(`${moduleKey}_${action}`);
    };

    const handleSave = async () => {
        setLoading(true);
        setError('');

        try {
            const result = await updateRolePermissions(selectedRoleId, permissions[selectedRoleId] || []);
            if (result.success) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            } else {
                setError(result.message || 'Lỗi khi lưu quyền hạn');
            }
        } catch {
            setError('Đã xảy ra lỗi không xác định');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-white">Cài đặt phân quyền</h2>
                    <p className="text-slate-500 mt-1">Quản lý quyền hạn truy cập cho {selectedRole?.name}.</p>
                </div>
                <div className="flex gap-3">
                    {success && (
                        <div className="flex items-center gap-2 text-green-400 text-sm font-bold bg-green-400/10 px-4 py-2 rounded-lg border border-green-400/20 animate-in fade-in slide-in-from-right-4">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            Đã lưu thành công
                        </div>
                    )}
                    {error && (
                        <div className="flex items-center gap-2 text-rose-400 text-sm font-bold bg-rose-400/10 px-4 py-2 rounded-lg border border-rose-400/20 animate-in fade-in slide-in-from-right-4">
                            <span className="material-symbols-outlined text-sm">error</span>
                            {error}
                        </div>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={loading || isAdmin}
                        className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 shadow-lg
                            ${isAdmin ? 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/10'
                                : 'bg-primary text-background-dark hover:brightness-110 shadow-primary/20'}`}
                    >
                        {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {roles.map((role: RoleWithPermissions) => {
                    const isRoleAdmin = role.name === 'admin';
                    const isSelected = selectedRoleId === role.id;

                    return (
                        <div
                            key={role.id}
                            onClick={() => setSelectedRoleId(role.id)}
                            className={`glass-card p-6 rounded-2xl flex flex-col gap-3 relative overflow-hidden group cursor-pointer transition-all border
                                ${isSelected ? 'border-primary ring-1 ring-primary/30 shadow-2xl shadow-primary/10 bg-primary/5' : 'border-white/5 hover:border-white/20'}`}
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors 
                                ${isSelected ? 'bg-primary text-background-dark' : 'bg-white/5 text-slate-400 group-hover:text-slate-200'}`}>
                                <span className="material-symbols-outlined text-[28px]">
                                    {role.name === 'admin' ? 'verified_user' : role.name === 'manager' ? 'manage_accounts' : 'person'}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold flex items-center gap-2 capitalize text-white">
                                    {role.name}
                                    {isRoleAdmin && (
                                        <span className="text-[10px] bg-primary text-background-dark px-2 py-0.5 rounded-full uppercase font-black">Mặc định</span>
                                    )}
                                </h3>
                                <p className="text-xs text-slate-500 leading-relaxed mt-1 line-clamp-2">{role.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                        <span className="material-symbols-outlined text-primary">rule</span>
                        Ma trận quyền hạn: <span className="text-primary italic capitalize">{selectedRole?.name}</span>
                    </h3>
                </div>

                <div className="glass-card rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/[0.03]">
                                <th className="p-5 text-xs font-black text-slate-500 uppercase tracking-widest">Module</th>
                                {['Xem', 'Thêm', 'Sửa', 'Xóa'].map(action => (
                                    <th key={action} className="p-5 text-xs font-black text-slate-500 uppercase tracking-widest text-center">{action}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {MODULES.map((module) => (
                                <tr key={module.key} className="hover:bg-white/[0.01] transition-colors group">
                                    <td className="p-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                                                <span className="material-symbols-outlined text-xl">{module.icon}</span>
                                            </div>
                                            <span className="font-bold text-slate-200">{module.name}</span>
                                        </div>
                                    </td>
                                    {['view', 'add', 'edit', 'delete'].map((action) => {
                                        const checked = isChecked(module.key, action);
                                        return (
                                            <td key={action} className="p-5 text-center">
                                                <button
                                                    onClick={() => togglePermission(module.key, action)}
                                                    disabled={isAdmin}
                                                    className={`w-12 h-6 rounded-full transition-all relative p-1
                                                        ${checked ? 'bg-primary' : 'bg-slate-800'} 
                                                        ${isAdmin ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                                                >
                                                    <div className={`w-4 h-4 rounded-full bg-background-dark shadow-sm transition-transform duration-200
                                                        ${checked ? 'translate-x-6' : 'translate-x-0'}`}
                                                    />
                                                </button>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {isAdmin && (
                    <div className="flex items-center gap-3 p-5 bg-primary/10 rounded-2xl border border-primary/20">
                        <span className="material-symbols-outlined text-primary">shield_with_heart</span>
                        <p className="text-xs text-slate-300 font-medium italic">
                            Vai trò <strong className="text-primary tracking-wide">ADMIN</strong> được bảo vệ và có toàn quyền tuyệt đối. Bạn không thể thay đổi thiết lập này để đảm bảo an toàn hệ thống.
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}

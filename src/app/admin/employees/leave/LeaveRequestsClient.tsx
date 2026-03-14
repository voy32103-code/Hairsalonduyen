'use client';

import { useState } from 'react';
import { LeaveRequest } from '@/types/leave';
import { createLeaveRequest, updateLeaveStatus } from '@/actions/leave_requests';

export default function LeaveRequestsClient({ initialRequests, isAdminOrManager }: { initialRequests: LeaveRequest[], isAdminOrManager: boolean }) {
    const [requests, setRequests] = useState<LeaveRequest[]>(initialRequests);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const formData = new FormData(e.currentTarget);
        
        console.log('--- Creating leave request ---');
        const res = await createLeaveRequest(formData);
        if (res.success) {
            console.log('Leave request created successfully');
            setIsModalOpen(false);
            window.location.reload(); // Refresh to get the latest list from server
        } else {
            console.error('Failed to create leave request:', res.message);
            setError(res.message || 'Lỗi');
        }
        setLoading(false);
    };

    const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
        // console.log('Button clicked for ID:', id); 
        if (!confirm(`Bạn chắc chắn muốn ${status === 'approved' ? 'duyệt' : 'từ chối'} đơn này?`)) return;
        
        console.log(`--- Updating leave request: ${id} to ${status} ---`);
        setActionLoading(id);
        setError('');
        
        try {
            const res = await updateLeaveStatus(id, status);
            
            if (res.success) {
                console.log('Update successful, refreshing state');
                setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
                // Optional: alert('Cập nhật thành công');
            } else {
                console.error('Update failed:', res.message);
                alert('Lỗi: ' + res.message);
                setError(res.message || 'Lỗi khi cập nhật trạng thái.');
            }
        } catch (err: any) {
            console.error('Client error during update:', err);
            alert('Lỗi hệ thống khi cập nhật: ' + err.message);
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Quản lý Nghỉ phép</h1>
                    <p className="text-slate-400 text-sm mt-1">Danh sách đơn xin nghỉ phép của nhân viên.</p>
                </div>
                {!isAdminOrManager && (
                    <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-primary text-background-dark font-semibold rounded-xl flex items-center gap-2">
                        <span className="material-symbols-outlined">add</span>
                        Tạo đơn nghỉ phép
                    </button>
                )}
            </div>

            <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="p-4 text-sm font-semibold text-slate-300">Nhân viên</th>
                                <th className="p-4 text-sm font-semibold text-slate-300">Từ ngày</th>
                                <th className="p-4 text-sm font-semibold text-slate-300">Đến ngày</th>
                                <th className="p-4 text-sm font-semibold text-slate-300">Lý do</th>
                                <th className="p-4 text-sm font-semibold text-slate-300">Trạng thái</th>
                                {isAdminOrManager && <th className="p-4 text-sm font-semibold text-slate-300 text-right">Thao tác</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map(req => (
                                <tr key={req.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                                    <td className="p-4 font-medium text-white">{req.employee_name}</td>
                                    <td className="p-4 text-slate-300">{new Date(req.start_date).toLocaleDateString()}</td>
                                    <td className="p-4 text-slate-300">{new Date(req.end_date).toLocaleDateString()}</td>
                                    <td className="p-4 text-slate-300 max-w-xs truncate">{req.reason}</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                            req.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                                            req.status === 'rejected' ? 'bg-rose-500/20 text-rose-400' :
                                            'bg-amber-500/20 text-amber-400'
                                        }`}>
                                            {req.status === 'approved' ? 'Đã duyệt' : req.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
                                        </span>
                                    </td>
                                    {isAdminOrManager && (
                                        <td className="p-4 text-right flex justify-end gap-2">
                                            {req.status === 'pending' && (
                                                <>
                                                    <button 
                                                        onClick={() => handleUpdateStatus(req.id, 'approved')} 
                                                        disabled={actionLoading === req.id}
                                                        className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 disabled:opacity-50"
                                                    >
                                                        {actionLoading === req.id ? (
                                                            <div className="w-5 h-5 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin"></div>
                                                        ) : (
                                                            <span className="material-symbols-outlined text-sm">check</span>
                                                        )}
                                                    </button>
                                                    <button 
                                                        onClick={() => handleUpdateStatus(req.id, 'rejected')} 
                                                        disabled={actionLoading === req.id}
                                                        className="p-2 bg-rose-500/10 text-rose-400 rounded-lg hover:bg-rose-500/20 disabled:opacity-50"
                                                    >
                                                        {actionLoading === req.id ? (
                                                            <div className="w-5 h-5 border-2 border-rose-400/30 border-t-rose-400 rounded-full animate-spin"></div>
                                                        ) : (
                                                            <span className="material-symbols-outlined text-sm">close</span>
                                                        )}
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {requests.length === 0 && (
                                <tr>
                                    <td colSpan={isAdminOrManager ? 6 : 5} className="p-8 text-center text-slate-400">Không có đơn nghỉ phép nào.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Tạo đơn */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-[#1f2937] border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">Tạo Đơn Xin Nghỉ</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        {error && <div className="mb-4 p-3 bg-red-500/20 text-red-500 rounded-xl text-sm border border-red-500/20">{error}</div>}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Từ ngày</label>
                                    <input type="date" name="startDate" required className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Đến ngày</label>
                                    <input type="date" name="endDate" required className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Lý do</label>
                                <textarea name="reason" required rows={3} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white" placeholder="Lý do xin nghỉ..."></textarea>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-300 hover:text-white">Hủy</button>
                                <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-background-dark font-semibold rounded-xl">
                                    {loading ? 'Đang gửi...' : 'Gửi đơn'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

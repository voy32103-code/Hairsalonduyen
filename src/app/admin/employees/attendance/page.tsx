import { getAttendanceData } from '@/data/attendance';
import PageHeader from '@/components/ui/PageHeader';
import { cookies } from 'next/headers';
import { authorize } from '@/lib/auth';

export default async function AttendancePage() {
    await authorize('employees', 'view');
    const cookieStore = await cookies();
    const userRole = cookieStore.get('user_role')?.value || 'admin';
    const logs = await getAttendanceData(userRole === 'admin' ? 'all' : undefined);

    return (
        <>
            <PageHeader 
                breadcrumbItems={[{ label: 'Main' }, { label: 'Nhân viên', href: '/admin/employees' }, { label: 'Chấm công' }]}
                title="Lịch sử chấm công"
                description="Theo dõi thời gian làm việc của toàn bộ nhân viên"
            />

            <div className="glass-card rounded-2xl overflow-hidden shadow-2xl border border-white/5">
                <div className="p-6 border-b border-white/5 bg-white/5">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">history</span>
                        Danh sách chấm công gần đây
                    </h3>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-white/5">
                                <th className="px-6 py-4">Nhân viên</th>
                                <th className="px-6 py-4">Giờ vào</th>
                                <th className="px-6 py-4">Giờ ra</th>
                                <th className="px-6 py-4">Tổng thời gian</th>
                                <th className="px-6 py-4">Ghi chú</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {logs.map((log: any) => {
                                const checkIn = new Date(log.check_in);
                                const checkOut = log.check_out ? new Date(log.check_out) : null;
                                let duration = '---';
                                if (checkOut) {
                                    const diff = Math.abs(checkOut.getTime() - checkIn.getTime());
                                    const hours = Math.floor(diff / (1000 * 60 * 60));
                                    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                                    duration = `${hours}h ${mins}m`;
                                }

                                return (
                                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                    {log.employee_name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-slate-200">{log.employee_name}</div>
                                                    {log.status === 'late' && (
                                                        <span className="text-[9px] font-black text-rose-400 uppercase tracking-tighter">● Đi trễ</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-300">
                                            {checkIn.toLocaleString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {checkOut ? (
                                                <span className="text-slate-300">{checkOut.toLocaleString('vi-VN')}</span>
                                            ) : (
                                                <div className="flex flex-col gap-1">
                                                    <span className="px-2 py-1 rounded-md bg-green-500/10 text-green-400 text-[10px] font-bold uppercase w-fit">Đang làm việc</span>
                                                    {log.status === 'late' && (
                                                        <span className="px-2 py-1 rounded-md bg-rose-500/10 text-rose-400 text-[10px] font-bold uppercase w-fit">Đi trễ</span>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-mono text-slate-400">
                                            {duration}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-500 italic">
                                            {log.note || '---'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

'use client';

import { useState } from 'react';
import { createPayroll, deletePayroll, updatePayrollStatus } from '@/actions/payroll';
import { useRouter } from 'next/navigation';

export default function PayrollTable({
    initialPayroll,
    employees,
    currentMonth,
    currentYear,
}: {
    initialPayroll: any[],
    employees: any[],
    currentMonth: number,
    currentYear: number,
}) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editItem, setEditItem] = useState<any>(null);

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const handlePreviousMonth = () => {
        let prevM = currentMonth - 1;
        let prevY = currentYear;
        if (prevM < 1) { prevM = 12; prevY--; }
        router.push(`/admin/finance/payroll?month=${prevM}&year=${prevY}`);
    };

    const handleNextMonth = () => {
        let nextM = currentMonth + 1;
        let nextY = currentYear;
        if (nextM > 12) { nextM = 1; nextY++; }
        router.push(`/admin/finance/payroll?month=${nextM}&year=${nextY}`);
    };

    const handleOpenModal = (item?: any) => {
        if (item) {
            setEditItem(item);
        } else {
            setEditItem(null);
        }
        setIsModalOpen(true);
    };

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        formData.append('periodMonth', currentMonth.toString());
        formData.append('periodYear', currentYear.toString());
        
        await createPayroll(formData);
        
        setLoading(false);
        setIsModalOpen(false);
    }

    async function handleDelete(id: string) {
        if(confirm('Bạn có chắc chắn muốn xóa bản ghi này?')) {
            await deletePayroll(id);
        }
    }

    async function handleApprove(id: string) {
        if(confirm('Xác nhận đã thanh toán lương cho nhân viên này?')) {
            await updatePayrollStatus(id, 'paid');
        }
    }

    const calculateNetPay = (p: any) => 
        Number(p.base_salary || 0) + Number(p.bonus || 0) + Number(p.total_commission || 0) - Number(p.deductions || 0);

    const totalNetPay = initialPayroll.reduce((acc, p) => acc + calculateNetPay(p), 0);

    return (
        <div>
            <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={handlePreviousMonth} className="p-2 hover:bg-white/5 rounded-full text-slate-400">
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <span className="text-sm font-bold text-white">Tháng {currentMonth} / {currentYear}</span>
                    <button onClick={handleNextMonth} className="p-2 hover:bg-white/5 rounded-full text-slate-400">
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-400">Tổng thanh toán: <strong className="text-white text-lg">{formatCurrency(totalNetPay)}</strong></span>
                    <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-primary text-background-dark text-xs font-black rounded-lg flex items-center gap-2 hover:brightness-110">
                        <span className="material-symbols-outlined text-sm">add</span> Chốt lương
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/[0.03]">
                            <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Nhân viên</th>
                            <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Lương CB</th>
                            <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Thưởng</th>
                            <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Hoa hồng</th>
                            <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Khấu trừ</th>
                            <th className="p-4 text-xs font-black text-primary uppercase tracking-widest text-right">Thực lãnh</th>
                            <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Trạng thái</th>
                            <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Tùy chọn</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {initialPayroll.map(p => (
                            <tr key={p.id} className="hover:bg-white/[0.01] transition-colors group">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs uppercase">
                                            {p.employee_name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-white">{p.employee_name}</p>
                                            <p className="text-[10px] text-slate-500">{p.role_name}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-right text-sm text-slate-300">{formatCurrency(Number(p.base_salary))}</td>
                                <td className="p-4 text-right text-sm text-green-400">+{formatCurrency(Number(p.bonus))}</td>
                                <td className="p-4 text-right text-sm text-green-400">+{formatCurrency(Number(p.total_commission || 0))}</td>
                                <td className="p-4 text-right text-sm text-rose-400">-{formatCurrency(Number(p.deductions))}</td>
                                <td className="p-4 text-right font-black text-primary text-base">{formatCurrency(calculateNetPay(p))}</td>
                                <td className="p-4 text-center">
                                    {p.status === 'paid' ? (
                                        <span className="px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20">Đã thanh toán</span>
                                    ) : (
                                        <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">Chưa trả</span>
                                    )}
                                </td>
                                <td className="p-4 text-center">
                                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {p.status !== 'paid' && (
                                            <button onClick={() => handleApprove(p.id)} className="w-8 h-8 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 flex items-center justify-center" title="Đánh dấu đã trả">
                                                <span className="material-symbols-outlined text-sm">payments</span>
                                            </button>
                                        )}
                                        <button onClick={() => handleOpenModal(p)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-sm">edit</span>
                                        </button>
                                        <button onClick={() => handleDelete(p.id)} className="w-8 h-8 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {initialPayroll.length === 0 && (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-slate-500 text-sm">
                                    Chưa có bảng lương cho tháng này.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm cursor-pointer" 
                    onClick={() => setIsModalOpen(false)}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
                            setIsModalOpen(false);
                        }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label="Đóng cửa sổ"
                >
                    <div className="glass-card w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl p-8 cursor-default" onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-white">{editItem ? 'Sửa bảng lương' : 'Chốt lương nhân viên'}</h3>
                                <p className="text-slate-500 text-sm mt-1">Kỳ: {currentMonth}/{currentYear}</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white"><span className="material-symbols-outlined text-2xl">close</span></button>
                        </div>

                        <form action={handleSubmit} className="space-y-5">
                            {!editItem && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nhân viên</label>
                                    <select name="employeeId" required defaultValue="" className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none transition-colors appearance-none">
                                        <option value="" disabled>Chọn nhân viên</option>
                                        {employees.map(e => <option key={e.id} value={e.id}>{e.full_name}</option>)}
                                    </select>
                                </div>
                            )}
                            {editItem && (
                                <input type="hidden" name="employeeId" value={editItem.employee_id} />
                            )}

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lương cơ bản (VNĐ)</label>
                                <input type="number" name="baseSalary" defaultValue={editItem?.base_salary || 0} required min="0" className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none transition-colors" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thưởng chuyên cần/Khác</label>
                                    <input type="number" name="bonus" defaultValue={editItem?.bonus || 0} min="0" className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none transition-colors text-green-400" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Khấu trừ/Phạt</label>
                                    <input type="number" name="deductions" defaultValue={editItem?.deductions || 0} min="0" className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none transition-colors text-rose-400" />
                                </div>
                            </div>
                            
                            <div className="space-y-1.5 bg-white/5 p-4 rounded-xl border border-white/10">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400">Hoa hồng tự động (tháng {currentMonth}):</span>
                                    <span className="font-bold text-green-400">+{formatCurrency(editItem ? Number(editItem.total_commission || 0) : 0)}</span>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-1">*Tiền hoa hồng được tính tự động từ các hóa đơn dịch vụ đã thanh toán do nhân viên trực tiếp thực hiện trong tháng. Không thể chỉnh sửa thủ công tại đây.</p>
                            </div>
                            
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ghi chú</label>
                                <input name="note" defaultValue={editItem?.note} placeholder="Tùy chọn..." className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none transition-colors" />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl bg-white/5 text-slate-300 font-bold hover:bg-white/10">Hủy</button>
                                <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl bg-primary text-[#111827] font-black hover:brightness-110 disabled:opacity-60 flex items-center justify-center">
                                    {loading ? 'Đang lưu...' : 'Lưu bảng lương'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

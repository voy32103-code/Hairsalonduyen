'use client';

import { useState } from 'react';
import { createSchedule, deleteSchedule, updateScheduleStatus } from '@/actions/schedules';
import { useRouter } from 'next/navigation';

export default function ScheduleCalendar({
    initialSchedules,
    employees,
    currentMonth,
    currentYear,
    userRole
}: {
    initialSchedules: any[],
    employees: any[],
    currentMonth: number,
    currentYear: number,
    userRole: string
}) {
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Days in current month
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0 is Sunday
    const blanks = Array.from({ length: firstDay === 0 ? 6 : firstDay - 1 }); 
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const isManager = userRole === 'admin' || userRole === 'manager';

    const getSchedulesForDay = (day: number) => {
        const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return initialSchedules.filter(s => {
            const d = new Date(s.date);
            const rowDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            return rowDate === dateStr;
        });
    };

    const handlePreviousMonth = () => {
        let prevM = currentMonth - 1;
        let prevY = currentYear;
        if (prevM < 1) { prevM = 12; prevY--; }
        router.push(`/admin/employees/schedule?month=${prevM}&year=${prevY}`);
    };

    const handleNextMonth = () => {
        let nextM = currentMonth + 1;
        let nextY = currentYear;
        if (nextM > 12) { nextM = 1; nextY++; }
        router.push(`/admin/employees/schedule?month=${nextM}&year=${nextY}`);
    };

    const handleDayClick = (day: number) => {
        if (!isManager) return;
        setSelectedDate(new Date(currentYear, currentMonth - 1, day));
        setIsAddModalOpen(true);
    };

    async function handleAddShift(formData: FormData) {
        setLoading(true);
        // Default time if not specified
        if (!formData.get('shiftStart')) formData.set('shiftStart', '08:00');
        if (!formData.get('shiftEnd')) formData.set('shiftEnd', '18:00');
        
        await createSchedule(formData);
        
        setLoading(false);
        setIsAddModalOpen(false);
        router.refresh();
    }

    async function handleDelete(id: string) {
        if(confirm('Bạn có chắc chắn muốn xóa ca làm việc này?')) {
            await deleteSchedule(id);
            router.refresh();
        }
    }

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'scheduled': return 'bg-blue-500 text-white';
            case 'completed': return 'bg-green-500 text-white';
            case 'absent': return 'bg-rose-500 text-white';
            case 'cancelled': return 'bg-slate-500 text-white';
            default: return 'bg-primary text-background-dark';
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <button onClick={handlePreviousMonth} className="p-2 hover:bg-white/5 rounded-full text-slate-400">
                    <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <h2 className="text-xl font-bold text-white">Tháng {currentMonth} / {currentYear}</h2>
                <button onClick={handleNextMonth} className="p-2 hover:bg-white/5 rounded-full text-slate-400">
                    <span className="material-symbols-outlined">chevron_right</span>
                </button>
            </div>

            <div className="grid grid-cols-7 gap-px rounded-xl overflow-hidden bg-white/10 border border-white/5">
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
                    <div key={d} className="bg-slate-900/50 p-2 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {d}
                    </div>
                ))}

                {blanks.map((_, i) => (
                    <div key={`blank-${i}`} className="bg-[#111827] min-h-32 p-2 opacity-50"></div>
                ))}

                {days.map(day => {
                    const daySchedules = getSchedulesForDay(day);
                    const isToday = new Date().getDate() === day && new Date().getMonth() + 1 === currentMonth && new Date().getFullYear() === currentYear;

                    return (
                        <div key={day} 
                             onClick={() => handleDayClick(day)}
                             className={`bg-[#111827] min-h-32 p-3 transition-colors border-t border-transparent
                                ${isManager ? 'cursor-pointer hover:bg-white/5' : ''}
                                ${isToday ? 'border-primary shadow-[inset_0_2px_0_0_rgba(167,139,250,1)]' : ''}`}>
                            <div className={`text-xs font-bold mb-2 ${isToday ? 'text-primary' : 'text-slate-500'}`}>{day}</div>
                            <div className="space-y-1">
                                {daySchedules.map(s => (
                                    <div key={s.id} 
                                         className={`text-[10px] p-1.5 rounded flex flex-col font-medium ${getStatusColor(s.status)}`}
                                         onClick={(e) => { e.stopPropagation(); if(isManager) handleDelete(s.id); }}>
                                        <span className="font-bold truncate" title={s.employee_name}>{s.employee_name}</span>
                                        <span className="opacity-90">{s.shift_start.slice(0,5)} - {s.shift_end.slice(0,5)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Add Shift Modal */}
            {isAddModalOpen && selectedDate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}>
                    <div className="glass-card w-full max-w-md rounded-2xl border border-white/10 shadow-2xl p-8" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-white">Thêm ca làm việc</h3>
                                <p className="text-slate-500 text-sm mt-1">{selectedDate.toLocaleDateString('vi-VN')}</p>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-slate-500 hover:text-white"><span className="material-symbols-outlined text-2xl">close</span></button>
                        </div>

                        <form action={handleAddShift} className="space-y-5">
                            <input type="hidden" name="date" value={`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`} />
                            
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nhân viên</label>
                                <select name="employeeId" required defaultValue="" className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none transition-colors appearance-none">
                                    <option value="" disabled>Chọn nhân viên</option>
                                    {employees.map(e => <option key={e.id} value={e.id}>{e.full_name}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bắt đầu</label>
                                    <input type="time" name="shiftStart" defaultValue="08:00" className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none transition-colors [color-scheme:dark]" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kết thúc</label>
                                    <input type="time" name="shiftEnd" defaultValue="18:00" className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none transition-colors [color-scheme:dark]" />
                                </div>
                            </div>
                            
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ghi chú</label>
                                <input name="note" placeholder="Tùy chọn..." className="w-full bg-slate-900/70 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none transition-colors" />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 rounded-xl bg-white/5 text-slate-300 font-bold hover:bg-white/10">Hủy</button>
                                <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl bg-primary text-[#111827] font-black hover:brightness-110 disabled:opacity-60 flex items-center justify-center">
                                    {loading ? 'Đang lưu...' : 'Thêm ca làm'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

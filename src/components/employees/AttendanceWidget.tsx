import { useState } from 'react';
import { clockIn, clockOut } from '@/actions/attendance';

export default function AttendanceWidget({ activeSession }: { activeSession: any }) {
    const [loading, setLoading] = useState(false);
    const [session, setSession] = useState(activeSession);

    const handleClockIn = async () => {
        setLoading(true);
        const res = await clockIn();
        if (res.success) {
            alert('Chấm công vào thành công!');
            setSession({ check_in: new Date().toISOString() });
        } else {
            alert(res.message);
        }
        setLoading(false);
    };

    const handleClockOut = async () => {
        setLoading(true);
        const res = await clockOut();
        if (res.success) {
            alert('Chấm công ra thành công!');
            setSession(null);
        } else {
            alert(res.message);
        }
        setLoading(false);
    };

    return (
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
            <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Trạng thái</span>
                <span className={`text-xs font-bold ${session ? 'text-green-400' : 'text-slate-400'}`}>
                    {session ? 'Đang làm việc' : 'Nghỉ'}
                </span>
            </div>
            <div className="h-8 w-px bg-white/10 mx-1"></div>
            {session ? (
                <button 
                    onClick={handleClockOut}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 text-xs font-bold hover:bg-rose-500/20 transition-colors"
                >
                    <span className="material-symbols-outlined text-sm">logout</span>
                    {loading ? '...' : 'Check-out'}
                </button>
            ) : (
                <button 
                    onClick={handleClockIn}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
                >
                    <span className="material-symbols-outlined text-sm">login</span>
                    {loading ? '...' : 'Check-in'}
                </button>
            )}
        </div>
    );
}

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { clockIn, clockOut } from '@/actions/attendance';
import FaceCheckIn from '@/components/attendance/FaceCheckIn';

export default function AttendanceWidget({ activeSession }: { activeSession: any }) {
    const [loading, setLoading] = useState(false);
    const [session, setSession] = useState(activeSession);
    const [showScanner, setShowScanner] = useState(false);
    const [actionType, setActionType] = useState<'in' | 'out'>('in');
    const [userId, setUserId] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const cookies = Object.fromEntries(document.cookie.split(';').map(c => c.trim().split('=')));
        if (cookies['user_id']) setUserId(cookies['user_id']);
    }, []);

    const handleClockInInit = () => {
        setActionType('in');
        setShowScanner(true);
    };

    const handleClockOutInit = () => {
        setActionType('out');
        setShowScanner(true);
    };

    const handleCheckInScanned = async (matchedId: string) => {
        if (userId && matchedId !== userId) {
            alert('Khuôn mặt không khớp với tài khoản đang đăng nhập!');
            return;
        }
        setShowScanner(false);
        setLoading(true);
        if (actionType === 'in') {
            const res = await clockIn('Chấm công bằng khuôn mặt');
            if (res.success) {
                alert('Chấm công vào thành công!');
                setSession({ check_in: new Date().toISOString() });
            } else {
                alert(res.message);
            }
        } else {
            const res = await clockOut('Chấm công ra bằng khuôn mặt');
            if (res.success) {
                alert('Chấm công ra thành công!');
                setSession(null);
            } else {
                alert(res.message);
            }
        }
        setLoading(false);
    };

    return (
        <>
            <div className="flex items-center gap-2 md:gap-3 bg-white/5 border border-white/10 rounded-xl px-2 md:px-4 py-2">
                <div className="flex flex-col">
                    <span className="hidden md:block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Trạng thái</span>
                    <span className={`text-[10px] md:text-xs font-bold ${session ? 'text-green-400' : 'text-slate-400'}`}>
                        {session ? 'Online' : 'Off'}
                    </span>
                </div>
                <div className="h-8 w-px bg-white/10 mx-0.5 md:mx-1"></div>
                {session ? (
                    <button 
                        onClick={handleClockOutInit}
                        disabled={loading}
                        className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 text-[10px] md:text-xs font-bold hover:bg-rose-500/20 transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">logout</span>
                        <span className="hidden sm:inline">{loading ? '...' : 'Check-out'}</span>
                        {!loading && <span className="sm:hidden">Out</span>}
                    </button>
                ) : (
                    <button 
                        onClick={handleClockInInit}
                        disabled={loading}
                        className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[10px] md:text-xs font-bold hover:bg-primary/20 transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">login</span>
                        <span className="hidden sm:inline">{loading ? '...' : 'Check-in'}</span>
                        {!loading && <span className="sm:hidden">In</span>}
                    </button>
                )}
            </div>

            {mounted && showScanner && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="relative w-full max-w-xl h-auto aspect-[3/4] sm:aspect-square bg-[#0A0A0A] rounded-[40px] shadow-2xl border border-white/20 flex flex-col items-center overflow-hidden">
                        <button 
                            onClick={() => setShowScanner(false)}
                            className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white transition-colors flex items-center justify-center"
                        >
                            <span className="material-symbols-outlined text-xl">close</span>
                        </button>
                        <div className="w-full h-full relative overflow-hidden rounded-[40px]">
                            <FaceCheckIn onCheckInSuccess={handleCheckInScanned} cooldownSeconds={2} />
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}

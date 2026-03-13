import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { getActiveAttendance } from '@/data/attendance';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const activeSession = await getActiveAttendance();

    return (
        <>
            <Header initialActiveSession={activeSession} />
            <div className="flex flex-1 overflow-hidden h-[calc(100vh-80px)]">
                <Sidebar />
                <main className="flex-1 auto-rows-min overflow-y-auto p-6 space-y-6">
                    {children}
                </main>
            </div>
        </>
    );
}

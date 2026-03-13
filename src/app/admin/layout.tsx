import AdminLayoutClient from '@/components/layout/AdminLayoutClient';
import { getActiveAttendance } from '@/data/attendance';
import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getSessionUser();
    
    // Force re-login if session is invalidated (multi-device login)
    if (!user) {
        redirect('/login');
    }

    const activeSession = await getActiveAttendance();

    return (
        <AdminLayoutClient activeSession={activeSession}>
            {children}
        </AdminLayoutClient>
    );
}

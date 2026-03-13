import AdminLayoutClient from '@/components/layout/AdminLayoutClient';
import { getActiveAttendance } from '@/data/attendance';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const activeSession = await getActiveAttendance();

    return (
        <AdminLayoutClient activeSession={activeSession}>
            {children}
        </AdminLayoutClient>
    );
}

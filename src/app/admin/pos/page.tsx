export const dynamic = 'force-dynamic';

import PageHeader from '@/components/ui/PageHeader';
import POSLayout from '@/components/pos/POSLayout';
import { getAppointmentsData } from '@/data/appointments';
import { getActiveServices } from '@/data/services';
import pool from '@/lib/db';
import { cookies } from 'next/headers';

export default async function POSPage() {
    // Only fetch scheduled or completed appointments from today to checkout
    // But getAppointmentsData() fetches all upcoming/today. That's fine.
    const appointmentsData = await getAppointmentsData();
    const activeServices = await getActiveServices();
    
    // Fetch products
    const productsRes = await pool.query('SELECT * FROM inventory ORDER BY product_name ASC');
    const products = productsRes.rows;

    const cookieStore = await cookies();
    const userRole = cookieStore.get('user_role')?.value || 'admin';

    // Staff cannot use POS
    if (userRole === 'staff') {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-10">
                <div className="w-20 h-20 rounded-3xl bg-rose-500/10 flex items-center justify-center text-rose-500 mb-6 border border-rose-500/20">
                    <span className="material-symbols-outlined text-4xl">lock</span>
                </div>
                <h2 className="text-2xl font-black text-white mb-2">Truy cập bị từ chối</h2>
                <p className="text-slate-400 max-w-md">Bạn không có quyền truy cập vào khu vực Thu ngân (POS).</p>
            </div>
        );
    }

    // Filter appointments suitable for checkout (e.g., scheduled but past time, or explicitly completed, but not already paid)
    // Actually our simplistic system: you checkout an appointment to seal its revenue.
    const checkoutableAppointments = appointmentsData.appointments?.filter(a => a.status !== 'cancelled') || [];

    return (
        <div className="h-[calc(100vh-80px)] mt-[-1rem] flex flex-col">
            <div className="mb-4 shrink-0">
                <PageHeader
                    breadcrumbItems={[{ label: 'Main' }, { label: 'Thu ngân' }]}
                    title="Màn hình Thu Ngân (POS)"
                    description="Thanh toán lịch hẹn và bán lẻ sản phẩm"
                />
            </div>
            
            <div className="flex-1 min-h-0">
                <POSLayout 
                    appointments={checkoutableAppointments} 
                    services={activeServices} 
                    products={products} 
                />
            </div>
        </div>
    );
}

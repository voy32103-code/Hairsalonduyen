export const dynamic = 'force-dynamic';

import { getServicesData } from '@/data/services';
import PageHeader from '@/components/ui/PageHeader';
import ServiceTable from '@/components/services/ServiceTable';
import { cookies } from 'next/headers';

export default async function ServicesPage() {
    const cookieStore = await cookies();
    const userRole = cookieStore.get('user_role')?.value || 'admin';

    const services = await getServicesData();

    return (
        <>
            <PageHeader
                breadcrumbItems={[{ label: 'Main' }, { label: 'Quản lý' }, { label: 'Dịch vụ' }]}
                title="Danh mục Dịch vụ"
                description="Quản lý danh sách dịch vụ, bảng giá và thời gian thực hiện"
            />

            <div className="glass-card rounded-2xl overflow-hidden shadow-2xl border border-white/5">
                <ServiceTable initialServices={services} userRole={userRole} />
            </div>
        </>
    );
}

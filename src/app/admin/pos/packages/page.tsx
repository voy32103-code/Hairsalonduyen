import { getPrepaidPackages } from '@/actions/packages';
import PackageManagerClient from '@/app/admin/pos/packages/PackageManagerClient';
import PageHeader from '@/components/ui/PageHeader';

export const dynamic = 'force-dynamic';

export default async function PackagesPage() {
    const packages = await getPrepaidPackages();

    return (
        <div className="space-y-6">
            <PageHeader 
                breadcrumbItems={[{label: 'Main'}, {label: 'Thu ngân', href: '/admin/pos'}, {label: 'Gói dịch vụ'}]}
                title="Quản lý Gói dịch vụ"
                description="Tạo các gói trả trước (combo 10 lần, thẻ thành viên) để bán cho khách hàng"
            />
            <PackageManagerClient initialPackages={packages} />
        </div>
    );
}

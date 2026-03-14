import { getPromoCodes } from '@/actions/promo_codes';
import PromoManagerClient from '@/app/admin/pos/promo/PromoManagerClient';
import PageHeader from '@/components/ui/PageHeader';

export const dynamic = 'force-dynamic';

export default async function PromoPage() {
    const promos = await getPromoCodes();

    return (
        <div className="space-y-6">
            <PageHeader 
                breadcrumbItems={[{label: 'Main'}, {label: 'Thu ngân', href: '/admin/pos'}, {label: 'Khuyến mãi'}]}
                title="Quản lý Mã giảm giá"
                description="Tạo và quản lý các chương trình khuyến mãi, voucher cho khách hàng"
            />
            <PromoManagerClient initialPromos={promos} />
        </div>
    );
}

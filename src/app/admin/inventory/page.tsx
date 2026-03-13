import { getInventoryData } from '@/data/inventory';
import AddInventoryModal from '@/components/inventory/AddInventoryModal';
import InventoryGrid from '@/components/inventory/InventoryGrid';
import { cookies } from 'next/headers';
import PageHeader from '@/components/ui/PageHeader';
import StatCards from '@/components/ui/StatCards';
import { InventoryItem } from '@/types/inventory';

export default async function InventoryPage() {
    const data = await getInventoryData();
    const cookieStore = await cookies();
    const userRole = cookieStore.get('user_role')?.value || 'admin';
    const inventoryItems = data.inventory || [];
    const lowStockCount = inventoryItems.filter((i: InventoryItem) => i.quantity < i.min_stock).length;

    return (
        <>
            <PageHeader
                breadcrumbItems={[{ label: 'Main' }, { label: 'Kho hàng' }]}
                title="Quản lý kho hàng"
                description="Theo dõi và cập nhật tồn kho mỹ phẩm cao cấp"
                actionElement={userRole === 'admin' ? <AddInventoryModal /> : undefined}
            />

            <StatCards
                stats={[
                    { label: 'Tổng sản phẩm', value: inventoryItems.length, icon: 'inventory_2', colorClass: 'text-primary' },
                    { label: 'Sắp hết hàng', value: lowStockCount, icon: 'warning', colorClass: lowStockCount > 0 ? 'text-rose-400' : 'text-green-400' },
                    { label: 'Đủ hàng', value: inventoryItems.length - lowStockCount, icon: 'check_circle', colorClass: 'text-green-400' },
                ]}
            />

            {lowStockCount > 0 && (
                <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3">
                    <span className="material-symbols-outlined text-rose-400">warning</span>
                    <p className="text-rose-300 text-sm font-semibold">
                        {lowStockCount} sản phẩm đang sắp hết hàng. Cần nhập thêm sớm!
                    </p>
                </div>
            )}

            <InventoryGrid items={inventoryItems} userRole={userRole} />

        </>
    );
}

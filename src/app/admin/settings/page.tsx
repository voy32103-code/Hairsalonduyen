import { getSettingsData } from '@/data/settings';
import SettingsForm from '@/components/settings/SettingsForm';
import PageHeader from '@/components/ui/PageHeader';

export default async function SettingsPage() {
    const data = await getSettingsData();

    return (
        <>
            <PageHeader
                breadcrumbItems={[{ label: 'System' }, { label: 'Cài đặt' }]}
                title="Cài đặt hệ thống"
                description="Quản lý thông tin cá nhân và cấu hình hệ thống"
            />

            <div className="max-w-3xl">
                <SettingsForm userProfile={data.userProfile} />
            </div>
        </>
    );
}

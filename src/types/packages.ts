export interface PrepaidPackage {
    id: string;
    name: string;
    description: string | null;
    price: number;
    total_credits: number; // For usage count packages
    valid_days: number | null; // Max days until expiry
    is_active: boolean;
    created_at: string;
}

export interface CustomerPackage {
    id: string;
    customer_id: string;
    package_id: string;
    package_name: string;
    remaining_credits: number;
    expiry_date: string | null;
    status: 'active' | 'expired' | 'exhausted';
    purchased_at: string;
}

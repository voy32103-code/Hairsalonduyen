export interface PrepaidPackage {
    id: string;
    name: string;
    description: string | null;
    price: number | string;
    total_credits: number;
    valid_days: number | null;
    is_active: boolean;
    created_at: string;
}

export interface CustomerPackage {
    id: string;
    customer_id: string;
    package_id: string;
    package_name?: string;
    total_credits: number;
    used_credits: number;
    remaining_credits: number;
    expiry_date: string | null;
    created_at: string;
}

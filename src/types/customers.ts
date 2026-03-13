export interface Customer {
    id: string;
    full_name: string;
    phone: string | null;
    email: string | null;
    note: string | null;
    created_at: string;
}

export interface CustomerStats {
    total: number;
    new_last_30_days: number;
}

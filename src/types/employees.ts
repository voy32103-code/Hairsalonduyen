export interface Employee {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    avatar_url: string | null;
    is_active: boolean;
    created_at: string;
    role: string;
}

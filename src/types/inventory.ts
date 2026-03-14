export interface InventoryItem {
    id: string;
    product_name: string;
    quantity: number;
    min_stock: number;
    unit_price: number;
    created_at: string;
    updated_at: string;
    expiry_date?: string | null;
}

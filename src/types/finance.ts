export interface Expense {
    id: string;
    title: string;
    amount: number;
    category: string;
    expense_date: string;
    note: string | null;
    created_by_name: string | null;
    created_by_avatar: string | null;
}

export interface ExpenseByCategory {
    category: string;
    total: number;
}

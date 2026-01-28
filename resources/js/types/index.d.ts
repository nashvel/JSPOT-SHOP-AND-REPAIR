export interface User {
    id: number;
    name: string;
    email: string;
    branch_id?: number;
    branch?: Branch;
    is_active: boolean;
    roles?: Role[];
}

export interface Branch {
    id: number;
    name: string;
    code: string;
    address?: string;
    phone?: string;
    email?: string;
    is_main: boolean;
    is_active: boolean;
}

export interface Product {
    id: number;
    name: string;
    sku?: string;
    barcode?: string;
    description?: string;
    category_id: number;
    category?: Category;
    price: number;
    cost?: number;
    stock_quantity: number;
    min_stock_level: number;
    unit: string;
    images?: string[];
    is_active: boolean;
    track_inventory: boolean;
    available_quantity?: number;
}

export interface Category {
    id: number;
    name: string;
    slug: string;
    description?: string;
    parent_id?: number;
    is_active: boolean;
}

export interface Customer {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    customer_code: string;
    credit_limit: number;
    current_balance: number;
}

export interface Order {
    id: number;
    order_number: string;
    branch_id: number;
    branch?: Branch;
    customer_id?: number;
    customer?: Customer;
    user_id: number;
    user?: User;
    type: 'sale' | 'reservation' | 'service';
    status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'on_hold';
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    paid_amount: number;
    notes?: string;
    items?: OrderItem[];
    payments?: Payment[];
    created_at: string;
    completed_at?: string;
}

export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    product?: Product;
    quantity: number;
    unit_price: number;
    discount: number;
    tax: number;
    total: number;
}

export interface Payment {
    id: number;
    order_id: number;
    payment_method: string;
    amount: number;
    reference_number?: string;
    notes?: string;
}

export interface Role {
    id: number;
    name: string;
    permissions?: Permission[];
}

export interface Permission {
    id: number;
    name: string;
}

export interface PageProps {
    auth: {
        user: User;
    };
}

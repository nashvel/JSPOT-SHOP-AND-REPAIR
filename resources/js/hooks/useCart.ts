import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

export interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    branchName?: string;
}

const CART_KEY = 'jspot_cart';
const CART_UPDATE_EVENT = 'cartUpdated';

// Custom event for same-tab updates
const dispatchCartUpdate = () => {
    window.dispatchEvent(new Event(CART_UPDATE_EVENT));
};

export function useCart() {
    const [items, setItems] = useState<CartItem[]>([]);

    // Load cart from localStorage
    const loadCart = useCallback(() => {
        const stored = localStorage.getItem(CART_KEY);
        if (stored) {
            try {
                setItems(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse cart', e);
            }
        } else {
            setItems([]);
        }
    }, []);

    // Load on mount and listen for updates
    useEffect(() => {
        loadCart();

        // Listen for custom cart update events (same tab)
        const handleCartUpdate = () => loadCart();
        window.addEventListener(CART_UPDATE_EVENT, handleCartUpdate);

        // Listen for storage events (other tabs)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === CART_KEY) {
                loadCart();
            }
        };
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener(CART_UPDATE_EVENT, handleCartUpdate);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [loadCart]);

    // Save cart to localStorage and dispatch update event
    const saveCart = (newItems: CartItem[]) => {
        localStorage.setItem(CART_KEY, JSON.stringify(newItems));
        setItems(newItems);
        dispatchCartUpdate();
    };

    const addItem = (item: Omit<CartItem, 'quantity'>, quantity = 1) => {
        const stored = localStorage.getItem(CART_KEY);
        const currentItems: CartItem[] = stored ? JSON.parse(stored) : [];

        const existing = currentItems.find(i => i.id === item.id);
        let newItems: CartItem[];

        if (existing) {
            newItems = currentItems.map(i =>
                i.id === item.id
                    ? { ...i, quantity: i.quantity + quantity }
                    : i
            );
        } else {
            newItems = [...currentItems, { ...item, quantity }];
        }

        saveCart(newItems);
        toast.success(`${item.name} added to cart!`, {
            duration: 2000,
            position: 'top-right',
            style: {
                background: '#fff',
                color: '#1f2937',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                borderRadius: '8px',
                padding: '12px 16px',
            },
            iconTheme: {
                primary: '#7c3aed',
                secondary: '#fff',
            },
        });
    };

    const removeItem = (id: number) => {
        const stored = localStorage.getItem(CART_KEY);
        const currentItems: CartItem[] = stored ? JSON.parse(stored) : [];
        const item = currentItems.find(i => i.id === id);
        const newItems = currentItems.filter(i => i.id !== id);
        saveCart(newItems);

        if (item) {
            toast.success(`${item.name} removed from cart`, {
                duration: 2000,
                position: 'top-right',
                style: {
                    background: '#fff',
                    color: '#1f2937',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    borderRadius: '8px',
                },
            });
        }
    };

    const updateQuantity = (id: number, quantity: number) => {
        if (quantity <= 0) {
            removeItem(id);
            return;
        }
        const stored = localStorage.getItem(CART_KEY);
        const currentItems: CartItem[] = stored ? JSON.parse(stored) : [];
        const newItems = currentItems.map(i =>
            i.id === id ? { ...i, quantity } : i
        );
        saveCart(newItems);
    };

    const clearCart = () => {
        saveCart([]);
        toast.success('Cart cleared', {
            duration: 2000,
            position: 'top-right',
            style: {
                background: '#fff',
                color: '#1f2937',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                borderRadius: '8px',
            },
        });
    };

    const getCount = () => items.reduce((sum, i) => sum + i.quantity, 0);

    const getTotal = () => items.reduce((sum, i) => sum + (i.price * i.quantity), 0);

    return {
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getCount,
        getTotal,
    };
}

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

export interface WishlistItem {
    id: number;
    name: string;
    price: number;
    image?: string;
    description?: string;
}

const WISHLIST_KEY = 'jspot_wishlist';
const WISHLIST_UPDATE_EVENT = 'wishlistUpdated';

// Custom event for same-tab updates
const dispatchWishlistUpdate = () => {
    window.dispatchEvent(new Event(WISHLIST_UPDATE_EVENT));
};

export function useWishlist() {
    const [items, setItems] = useState<WishlistItem[]>([]);

    // Load wishlist from localStorage
    const loadWishlist = useCallback(() => {
        const stored = localStorage.getItem(WISHLIST_KEY);
        if (stored) {
            try {
                setItems(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse wishlist', e);
            }
        } else {
            setItems([]);
        }
    }, []);

    // Load on mount and listen for updates
    useEffect(() => {
        loadWishlist();

        // Listen for custom wishlist update events (same tab)
        const handleWishlistUpdate = () => loadWishlist();
        window.addEventListener(WISHLIST_UPDATE_EVENT, handleWishlistUpdate);

        // Listen for storage events (other tabs)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === WISHLIST_KEY) {
                loadWishlist();
            }
        };
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener(WISHLIST_UPDATE_EVENT, handleWishlistUpdate);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [loadWishlist]);

    // Save wishlist to localStorage and dispatch update event
    const saveWishlist = (newItems: WishlistItem[]) => {
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(newItems));
        setItems(newItems);
        dispatchWishlistUpdate();
    };

    const addItem = (item: WishlistItem) => {
        const stored = localStorage.getItem(WISHLIST_KEY);
        const currentItems: WishlistItem[] = stored ? JSON.parse(stored) : [];

        // Check if already in wishlist
        const existing = currentItems.find(i => i.id === item.id);
        if (existing) {
            toast.error('Already in wishlist', {
                duration: 2000,
                position: 'top-right',
                style: {
                    background: '#fff',
                    color: '#1f2937',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    borderRadius: '8px',
                },
            });
            return;
        }

        const newItems = [...currentItems, item];
        saveWishlist(newItems);

        toast.success(`${item.name} added to wishlist!`, {
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
                primary: '#ec4899',
                secondary: '#fff',
            },
        });
    };

    const removeItem = (id: number) => {
        const stored = localStorage.getItem(WISHLIST_KEY);
        const currentItems: WishlistItem[] = stored ? JSON.parse(stored) : [];
        const item = currentItems.find(i => i.id === id);
        const newItems = currentItems.filter(i => i.id !== id);
        saveWishlist(newItems);

        if (item) {
            toast.success(`${item.name} removed from wishlist`, {
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

    const isInWishlist = (id: number) => {
        return items.some(i => i.id === id);
    };

    const toggleItem = (item: WishlistItem) => {
        if (isInWishlist(item.id)) {
            removeItem(item.id);
        } else {
            addItem(item);
        }
    };

    const clearWishlist = () => {
        saveWishlist([]);
        toast.success('Wishlist cleared', {
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

    const getCount = () => items.length;

    return {
        items,
        addItem,
        removeItem,
        isInWishlist,
        toggleItem,
        clearWishlist,
        getCount,
    };
}

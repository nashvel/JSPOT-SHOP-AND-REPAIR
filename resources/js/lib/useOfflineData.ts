/**
 * Custom Hook for Offline Data Access
 * 
 * Provides products and categories from IndexedDB with automatic
 * fallback to server data and initial data synchronization.
 */

import { useState, useEffect, useCallback } from 'react';
import db, { OfflineProduct, OfflineCategory, generateLocalId, OfflineSale } from './db';
import { fetchFromServer, syncToServer, getUnsyncedCount } from './sync';

// ============================================
// Types
// ============================================

interface UseOfflineDataOptions {
    branchId: number;
    serverProducts?: any[];
    serverCategories?: any[];
}

interface UseOfflineDataResult {
    products: OfflineProduct[];
    categories: OfflineCategory[];
    isLoading: boolean;
    isOffline: boolean;
    unsyncedCount: number;
    refreshData: () => Promise<void>;
}

// ============================================
// Hook: useOfflineData
// ============================================

export function useOfflineData(options: UseOfflineDataOptions): UseOfflineDataResult {
    const { branchId, serverProducts, serverCategories } = options;

    const [products, setProducts] = useState<OfflineProduct[]>([]);
    const [categories, setCategories] = useState<OfflineCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [unsyncedCount, setUnsyncedCount] = useState(0);

    // Update online/offline status
    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Load or sync data
    const loadData = useCallback(async () => {
        setIsLoading(true);

        try {
            // If we have server data and we're online, sync it to IndexedDB
            if (navigator.onLine && serverProducts && serverProducts.length > 0) {
                await syncServerDataToLocal(serverProducts, serverCategories || [], branchId);
            }

            // Load from IndexedDB
            const localProducts = await db.products
                .filter(p => p.branchId === branchId)
                .toArray();

            const localCategories = await db.categories.toArray();

            // If no local data and we have server data, use server data
            if (localProducts.length === 0 && serverProducts && serverProducts.length > 0) {
                // Convert server products to local format
                const converted = serverProducts.map(p => convertServerProductToLocal(p, branchId));
                setProducts(converted);
            } else {
                setProducts(localProducts);
            }

            if (localCategories.length === 0 && serverCategories && serverCategories.length > 0) {
                const converted = serverCategories.map(convertServerCategoryToLocal);
                setCategories(converted);
            } else {
                setCategories(localCategories);
            }

            // Update unsynced count
            const count = await getUnsyncedCount();
            setUnsyncedCount(count);

        } catch (error) {
            console.error('[Offline] Failed to load data:', error);

            // Fallback to server data if available
            if (serverProducts) {
                const converted = serverProducts.map(p => convertServerProductToLocal(p, branchId));
                setProducts(converted);
            }
            if (serverCategories) {
                setCategories(serverCategories.map(convertServerCategoryToLocal));
            }
        } finally {
            setIsLoading(false);
        }
    }, [branchId, serverProducts, serverCategories]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return {
        products,
        categories,
        isLoading,
        isOffline,
        unsyncedCount,
        refreshData: loadData,
    };
}

// ============================================
// Hook: useOfflineSale
// ============================================

interface CreateSaleParams {
    branchId: number;
    mechanicId?: number | null;
    mechanicName?: string | null;
    customerName?: string;
    items: Array<{
        product: OfflineProduct;
        quantity: number;
        paymentMethod: string;
        referenceNumber?: string | null;
    }>;
    paymentMethod: 'cash' | 'gcash' | 'maya';
    amountPaid: number;
    referenceNumber?: string | null;
    notes?: string;
}

export async function createOfflineSale(params: CreateSaleParams): Promise<OfflineSale> {
    const {
        branchId,
        mechanicId,
        mechanicName,
        customerName,
        items,
        paymentMethod,
        amountPaid,
        referenceNumber,
        notes,
    } = params;

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const total = subtotal; // Add tax/discount logic if needed
    const changeAmount = Math.max(0, amountPaid - total);

    // Generate sale number
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const saleCount = await db.sales.filter(s => s.branchId === branchId).count();
    const saleNumber = `SALE-${branchId}-${dateStr}-${String(saleCount + 1).padStart(4, '0')}`;

    // Create sale object
    const sale: OfflineSale = {
        id: generateLocalId(),
        serverId: null,
        saleNumber,
        branchId,
        mechanicId: mechanicId || null,
        mechanicName: mechanicName || null,
        customerId: null,
        customerName: customerName || null,
        items: items.map(item => ({
            id: generateLocalId(),
            saleId: '', // Will be set below
            productId: item.product.id,
            productName: item.product.name,
            productType: item.product.type,
            categoryName: item.product.categoryName,
            quantity: item.quantity,
            unitPrice: item.product.price,
            total: item.product.price * item.quantity,
            paymentMethod: item.paymentMethod,
            referenceNumber: item.referenceNumber || null,
            transactions: [{
                referenceNumber: item.referenceNumber || null,
                quantity: item.quantity,
                amount: item.product.price * item.quantity,
            }],
        })),
        subtotal,
        taxAmount: 0,
        discountAmount: 0,
        total,
        amountPaid,
        changeAmount,
        paymentMethod,
        referenceNumber: referenceNumber || null,
        status: 'completed',
        notes: notes || null,
        synced: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    // Update saleId in items
    sale.items = sale.items.map(item => ({ ...item, saleId: sale.id }));

    // Save to IndexedDB
    await db.sales.add(sale);

    // Deduct stock for products
    for (const item of items) {
        if (item.product.type === 'product') {
            const product = await db.products.get(item.product.id);
            if (product) {
                await db.products.update(item.product.id, {
                    stock: Math.max(0, product.stock - item.quantity),
                    synced: false,
                });
            }
        }
    }

    // Try to sync if online
    if (navigator.onLine) {
        syncToServer().catch(err => console.error('[Offline] Background sync failed:', err));
    }

    console.log('[Offline] Sale created:', sale.saleNumber);
    return sale;
}

// ============================================
// Helper Functions
// ============================================

function convertServerProductToLocal(product: any, branchId: number): OfflineProduct {
    // Get stock from branches pivot
    let stock = 0;
    if (product.branches && Array.isArray(product.branches)) {
        const branchData = product.branches.find((b: any) => b.id === branchId);
        stock = branchData?.pivot?.stock_quantity || 0;
    } else if (product.pivot?.stock_quantity !== undefined) {
        stock = product.pivot.stock_quantity;
    } else if (product.stock_quantity !== undefined) {
        stock = product.stock_quantity;
    }

    return {
        id: product.id?.toString() || generateLocalId(),
        serverId: product.id || null,
        name: product.name,
        sku: product.sku || null,
        type: product.type || 'product',
        categoryId: product.category_id?.toString() || null,
        categoryName: product.category?.name || null,
        price: parseFloat(product.price) || 0,
        cost: product.cost ? parseFloat(product.cost) : null,
        description: product.description || null,
        stock,
        lowStockThreshold: product.low_stock_threshold || 10,
        branchId,
        synced: true,
        createdAt: product.created_at ? new Date(product.created_at) : new Date(),
        updatedAt: product.updated_at ? new Date(product.updated_at) : new Date(),
    };
}

function convertServerCategoryToLocal(category: any): OfflineCategory {
    return {
        id: category.id?.toString() || generateLocalId(),
        serverId: category.id || null,
        name: category.name,
        type: category.type || 'product',
        synced: true,
        createdAt: category.created_at ? new Date(category.created_at) : new Date(),
        updatedAt: category.updated_at ? new Date(category.updated_at) : new Date(),
    };
}

async function syncServerDataToLocal(
    serverProducts: any[],
    serverCategories: any[],
    branchId: number
): Promise<void> {
    // Sync categories
    for (const cat of serverCategories) {
        const existing = await db.categories.where('serverId').equals(cat.id).first();
        if (!existing) {
            await db.categories.add(convertServerCategoryToLocal(cat));
        }
    }

    // Sync products
    for (const prod of serverProducts) {
        const existing = await db.products.where('serverId').equals(prod.id).first();
        const localProduct = convertServerProductToLocal(prod, branchId);

        if (!existing) {
            await db.products.add(localProduct);
        } else {
            // Update with server data (server wins for stock)
            await db.products.update(existing.id, {
                name: localProduct.name,
                price: localProduct.price,
                stock: localProduct.stock,
                synced: true,
            });
        }
    }
}

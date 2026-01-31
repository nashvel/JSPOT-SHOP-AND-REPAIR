/**
 * Sync Logic for Offline/Online Data Synchronization
 * 
 * Handles pushing local data to the server and pulling updates from the server.
 */

import db, {
    OfflineCategory,
    OfflineProduct,
    OfflineSale,
    OfflineJobOrder,
    OfflineAttendance,
    getUnsyncedCount,
} from './db';
import axios from 'axios';

// ============================================
// Types
// ============================================

interface SyncResult {
    success: boolean;
    pushed: {
        categories: number;
        products: number;
        sales: number;
        jobOrders: number;
        attendance: number;
    };
    pulled: {
        categories: number;
        products: number;
    };
    errors: string[];
}

interface ServerIdMapping {
    localId: string;
    serverId: number;
}

// ============================================
// Sync Status State
// ============================================

let isSyncing = false;
let lastSyncTime: Date | null = null;
let syncListeners: Array<(result: SyncResult) => void> = [];

export function onSyncComplete(listener: (result: SyncResult) => void): () => void {
    syncListeners.push(listener);
    return () => {
        syncListeners = syncListeners.filter(l => l !== listener);
    };
}

function notifySyncComplete(result: SyncResult): void {
    syncListeners.forEach(listener => listener(result));
}

// ============================================
// Push to Server (Upload unsynced data)
// ============================================

export async function syncToServer(): Promise<SyncResult> {
    const result: SyncResult = {
        success: false,
        pushed: { categories: 0, products: 0, sales: 0, jobOrders: 0, attendance: 0 },
        pulled: { categories: 0, products: 0 },
        errors: [],
    };

    // Check if online
    if (!navigator.onLine) {
        result.errors.push('Device is offline');
        return result;
    }

    // Prevent concurrent syncs
    if (isSyncing) {
        result.errors.push('Sync already in progress');
        return result;
    }

    isSyncing = true;

    try {
        // Get all unsynced records
        const [
            unsyncedSales,
            unsyncedJobOrders,
            unsyncedAttendance,
        ] = await Promise.all([
            db.sales.filter(r => !r.synced).toArray(),
            db.jobOrders.filter(r => !r.synced).toArray(),
            db.attendance.filter(r => !r.synced).toArray(),
        ]);

        // Push sales
        if (unsyncedSales.length > 0) {
            try {
                const response = await axios.post('/api/sync/push/sales', {
                    sales: unsyncedSales.map(transformSaleForServer),
                });

                if (response.data.success) {
                    const mappings: ServerIdMapping[] = response.data.mappings || [];

                    // Update local records with server IDs
                    for (const mapping of mappings) {
                        await db.sales.update(mapping.localId, {
                            serverId: mapping.serverId,
                            synced: true,
                        });
                    }

                    result.pushed.sales = unsyncedSales.length;
                }
            } catch (error: any) {
                result.errors.push(`Sales sync failed: ${error.message}`);
            }
        }

        // Push job orders
        if (unsyncedJobOrders.length > 0) {
            try {
                const response = await axios.post('/api/sync/push/job-orders', {
                    jobOrders: unsyncedJobOrders.map(transformJobOrderForServer),
                });

                if (response.data.success) {
                    const mappings: ServerIdMapping[] = response.data.mappings || [];

                    for (const mapping of mappings) {
                        await db.jobOrders.update(mapping.localId, {
                            serverId: mapping.serverId,
                            synced: true,
                        });
                    }

                    result.pushed.jobOrders = unsyncedJobOrders.length;
                }
            } catch (error: any) {
                result.errors.push(`Job orders sync failed: ${error.message}`);
            }
        }

        // Push attendance
        if (unsyncedAttendance.length > 0) {
            try {
                const response = await axios.post('/api/sync/push/attendance', {
                    attendance: unsyncedAttendance.map(transformAttendanceForServer),
                });

                if (response.data.success) {
                    const mappings: ServerIdMapping[] = response.data.mappings || [];

                    for (const mapping of mappings) {
                        await db.attendance.update(mapping.localId, {
                            serverId: mapping.serverId,
                            synced: true,
                        });
                    }

                    result.pushed.attendance = unsyncedAttendance.length;
                }
            } catch (error: any) {
                result.errors.push(`Attendance sync failed: ${error.message}`);
            }
        }

        result.success = result.errors.length === 0;
        lastSyncTime = new Date();

    } catch (error: any) {
        result.errors.push(`Sync failed: ${error.message}`);
    } finally {
        isSyncing = false;
        notifySyncComplete(result);
    }

    return result;
}

// ============================================
// Fetch from Server (Download data)
// ============================================

export async function fetchFromServer(branchId: number): Promise<SyncResult> {
    const result: SyncResult = {
        success: false,
        pushed: { categories: 0, products: 0, sales: 0, jobOrders: 0, attendance: 0 },
        pulled: { categories: 0, products: 0 },
        errors: [],
    };

    if (!navigator.onLine) {
        result.errors.push('Device is offline');
        return result;
    }

    try {
        // Fetch categories
        const categoriesResponse = await axios.get('/api/sync/pull/categories');
        if (categoriesResponse.data.success) {
            const serverCategories = categoriesResponse.data.categories || [];

            for (const cat of serverCategories) {
                const existing = await db.categories.where('serverId').equals(cat.id).first();

                if (!existing) {
                    await db.categories.add({
                        id: crypto.randomUUID(),
                        serverId: cat.id,
                        name: cat.name,
                        type: cat.type,
                        synced: true,
                        createdAt: new Date(cat.created_at),
                        updatedAt: new Date(cat.updated_at),
                    });
                    result.pulled.categories++;
                }
            }
        }

        // Fetch products for branch
        const productsResponse = await axios.get(`/api/sync/pull/products?branch_id=${branchId}`);
        if (productsResponse.data.success) {
            const serverProducts = productsResponse.data.products || [];

            for (const prod of serverProducts) {
                const existing = await db.products.where('serverId').equals(prod.id).first();

                if (!existing) {
                    await db.products.add({
                        id: crypto.randomUUID(),
                        serverId: prod.id,
                        name: prod.name,
                        sku: prod.sku,
                        type: prod.type,
                        categoryId: prod.category_id?.toString() || null,
                        categoryName: prod.category?.name || null,
                        price: parseFloat(prod.price),
                        cost: prod.cost ? parseFloat(prod.cost) : null,
                        description: prod.description,
                        stock: prod.stock || 0,
                        lowStockThreshold: prod.low_stock_threshold || 10,
                        branchId: branchId,
                        synced: true,
                        createdAt: new Date(prod.created_at),
                        updatedAt: new Date(prod.updated_at),
                    });
                    result.pulled.products++;
                } else {
                    // Update existing product with server data (server wins for stock)
                    await db.products.update(existing.id, {
                        name: prod.name,
                        price: parseFloat(prod.price),
                        stock: prod.stock || 0,
                        updatedAt: new Date(prod.updated_at),
                    });
                }
            }
        }

        result.success = result.errors.length === 0;

    } catch (error: any) {
        result.errors.push(`Fetch failed: ${error.message}`);
    }

    return result;
}

// ============================================
// Auto-Sync Setup
// ============================================

let autoSyncInterval: NodeJS.Timeout | null = null;

export function setupAutoSync(branchId: number): void {
    // Sync when browser comes online
    window.addEventListener('online', () => {
        console.log('[Sync] Device online - starting sync...');
        syncToServer().then(() => fetchFromServer(branchId));
    });

    // Log when going offline
    window.addEventListener('offline', () => {
        console.log('[Sync] Device offline - data will be stored locally');
    });

    // Sync every 5 minutes when online
    autoSyncInterval = setInterval(() => {
        if (navigator.onLine) {
            console.log('[Sync] Periodic sync...');
            syncToServer();
        }
    }, 5 * 60 * 1000);

    // Initial sync on setup
    if (navigator.onLine) {
        syncToServer().then(() => fetchFromServer(branchId));
    }
}

export function stopAutoSync(): void {
    if (autoSyncInterval) {
        clearInterval(autoSyncInterval);
        autoSyncInterval = null;
    }
}

// ============================================
// Helper: Transform Data for Server
// ============================================

function transformSaleForServer(sale: OfflineSale): any {
    return {
        local_id: sale.id,
        sale_number: sale.saleNumber,
        branch_id: sale.branchId,
        mechanic_id: sale.mechanicId,
        customer_id: sale.customerId,
        items: sale.items.map(item => ({
            product_id: item.productId,
            product_name: item.productName,
            product_type: item.productType,
            category_name: item.categoryName,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            total: item.total,
            payment_method: item.paymentMethod,
            reference_number: item.referenceNumber,
            transactions: item.transactions,
        })),
        subtotal: sale.subtotal,
        tax_amount: sale.taxAmount,
        discount_amount: sale.discountAmount,
        total: sale.total,
        amount_paid: sale.amountPaid,
        change_amount: sale.changeAmount,
        payment_method: sale.paymentMethod,
        reference_number: sale.referenceNumber,
        status: sale.status,
        notes: sale.notes,
        created_at: sale.createdAt.toISOString(),
    };
}

function transformJobOrderForServer(jobOrder: OfflineJobOrder): any {
    return {
        local_id: jobOrder.id,
        job_order_number: jobOrder.jobOrderNumber,
        branch_id: jobOrder.branchId,
        customer_name: jobOrder.customerName,
        customer_phone: jobOrder.customerPhone,
        vehicle_type: jobOrder.vehicleType,
        vehicle_plate: jobOrder.vehiclePlate,
        vehicle_model: jobOrder.vehicleModel,
        mechanic_id: jobOrder.mechanicId,
        services: jobOrder.services,
        parts: jobOrder.parts,
        labor_cost: jobOrder.laborCost,
        parts_total: jobOrder.partsTotal,
        total: jobOrder.total,
        status: jobOrder.status,
        notes: jobOrder.notes,
        created_at: jobOrder.createdAt.toISOString(),
    };
}

function transformAttendanceForServer(attendance: OfflineAttendance): any {
    return {
        local_id: attendance.id,
        user_id: attendance.userId,
        branch_id: attendance.branchId,
        clock_in: attendance.clockIn.toISOString(),
        clock_out: attendance.clockOut?.toISOString() || null,
        notes: attendance.notes,
        created_at: attendance.createdAt.toISOString(),
    };
}

// ============================================
// Status Helpers
// ============================================

export function getLastSyncTime(): Date | null {
    return lastSyncTime;
}

export function isSyncInProgress(): boolean {
    return isSyncing;
}

export { getUnsyncedCount };

/**
 * Local Database (IndexedDB) using Dexie.js
 * 
 * This is the offline-first storage for JSPOT POS.
 * All data is stored here first, then synced to the server when online.
 */

import Dexie, { Table } from 'dexie';

// ============================================
// Interfaces for local data structures
// ============================================

export interface OfflineCategory {
    id: string;
    serverId: number | null;
    name: string;
    type: 'product' | 'service';
    synced: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface OfflineProduct {
    id: string;
    serverId: number | null;
    name: string;
    sku: string | null;
    type: 'product' | 'service';
    categoryId: string | null;
    categoryName: string | null;
    price: number;
    cost: number | null;
    description: string | null;
    stock: number;
    lowStockThreshold: number;
    branchId: number;
    synced: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface OfflineSaleItem {
    id: string;
    saleId: string;
    productId: string;
    productName: string;
    productType: 'product' | 'service';
    categoryName: string | null;
    quantity: number;
    unitPrice: number;
    total: number;
    paymentMethod: string;
    referenceNumber: string | null;
    transactions: Array<{
        referenceNumber: string | null;
        quantity: number;
        amount: number;
    }> | null;
}

export interface OfflineSale {
    id: string;
    serverId: number | null;
    saleNumber: string;
    branchId: number;
    mechanicId: number | null;
    mechanicName: string | null;
    customerId: number | null;
    customerName: string | null;
    items: OfflineSaleItem[];
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    total: number;
    amountPaid: number;
    changeAmount: number;
    paymentMethod: 'cash' | 'gcash' | 'maya' | 'card';
    referenceNumber: string | null;
    status: 'pending' | 'completed' | 'refunded' | 'cancelled';
    notes: string | null;
    synced: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface OfflineJobOrder {
    id: string;
    serverId: number | null;
    jobOrderNumber: string;
    branchId: number;
    customerId: number | null;
    customerName: string;
    customerPhone: string | null;
    vehicleType: string | null;
    vehiclePlate: string | null;
    vehicleModel: string | null;
    mechanicId: number | null;
    mechanicName: string | null;
    services: Array<{
        productId: string;
        productName: string;
        quantity: number;
        unitPrice: number;
        total: number;
    }>;
    parts: Array<{
        productId: string;
        productName: string;
        quantity: number;
        unitPrice: number;
        total: number;
    }>;
    laborCost: number;
    partsTotal: number;
    total: number;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    notes: string | null;
    synced: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface OfflineAttendance {
    id: string;
    serverId: number | null;
    userId: number;
    userName: string;
    branchId: number;
    clockIn: Date;
    clockOut: Date | null;
    hoursWorked: number | null;
    notes: string | null;
    synced: boolean;
    createdAt: Date;
}

export interface OfflineSyncConflict {
    id: string;
    type: 'stock' | 'jobOrder' | 'product' | 'price';
    itemId: string;
    itemName: string;
    itemType: 'product' | 'jobOrder';
    localValue: any;
    serverValue: any;
    localUpdatedAt: Date;
    serverUpdatedAt: Date;
    branchId: number;
    resolved: boolean;
    resolution: 'local' | 'server' | 'pending';
    detectedAt: Date;
    resolvedAt: Date | null;
}

// ============================================
// Dexie Database Class
// ============================================

class JspotDatabase extends Dexie {
    categories!: Table<OfflineCategory, string>;
    products!: Table<OfflineProduct, string>;
    sales!: Table<OfflineSale, string>;
    jobOrders!: Table<OfflineJobOrder, string>;
    attendance!: Table<OfflineAttendance, string>;
    conflicts!: Table<OfflineSyncConflict, string>;

    constructor() {
        super('JspotPOS');

        // Define database schema version 1
        this.version(1).stores({
            categories: 'id, serverId, name, type, synced, branchId',
            products: 'id, serverId, name, sku, type, categoryId, branchId, synced',
            sales: 'id, serverId, saleNumber, branchId, status, synced, createdAt',
            jobOrders: 'id, serverId, jobOrderNumber, branchId, status, synced, createdAt',
            attendance: 'id, serverId, userId, branchId, synced, createdAt',
        });

        // Version 2: Add conflicts table
        this.version(2).stores({
            categories: 'id, serverId, name, type, synced, branchId',
            products: 'id, serverId, name, sku, type, categoryId, branchId, synced',
            sales: 'id, serverId, saleNumber, branchId, status, synced, createdAt',
            jobOrders: 'id, serverId, jobOrderNumber, branchId, status, synced, createdAt',
            attendance: 'id, serverId, userId, branchId, synced, createdAt',
            conflicts: 'id, type, itemId, branchId, resolved, detectedAt',
        });
    }
}

// Create database instance
export const db = new JspotDatabase();

// ============================================
// Helper Functions
// ============================================

/**
 * Generate a unique ID for local records
 */
export function generateLocalId(): string {
    return crypto.randomUUID();
}

/**
 * Get count of unsynced records across all tables
 */
export async function getUnsyncedCount(): Promise<number> {
    const [categories, products, sales, jobOrders, attendance] = await Promise.all([
        db.categories.filter(r => !r.synced).count(),
        db.products.filter(r => !r.synced).count(),
        db.sales.filter(r => !r.synced).count(),
        db.jobOrders.filter(r => !r.synced).count(),
        db.attendance.filter(r => !r.synced).count(),
    ]);

    return categories + products + sales + jobOrders + attendance;
}

/**
 * Clear all local data (use with caution!)
 */
export async function clearAllData(): Promise<void> {
    await Promise.all([
        db.categories.clear(),
        db.products.clear(),
        db.sales.clear(),
        db.jobOrders.clear(),
        db.attendance.clear(),
    ]);
}

/**
 * Check if database has any data
 */
export async function hasLocalData(): Promise<boolean> {
    const count = await db.products.count();
    return count > 0;
}

export default db;

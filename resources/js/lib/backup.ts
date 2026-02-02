/**
 * Backup System for Local Data
 * 
 * Provides export/import functionality and emergency localStorage backup.
 */

import db from './db';

// ============================================
// Types
// ============================================

interface BackupData {
    version: string;
    timestamp: string;
    branchId: number | null;
    data: {
        categories: any[];
        products: any[];
        sales: any[];
        jobOrders: any[];
        attendance: any[];
    };
}

interface BackupSettings {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    lastBackup: string | null;
}

const BACKUP_SETTINGS_KEY = 'jspot-backup-settings';
const EMERGENCY_BACKUP_KEY = 'jspot-emergency-backup';
const BACKUP_VERSION = '1.0';

// ============================================
// Manual Export/Import
// ============================================

/**
 * Export all local data to a JSON file
 */
export async function exportBackup(): Promise<void> {
    try {
        const [categories, products, sales, jobOrders, attendance] = await Promise.all([
            db.categories.toArray(),
            db.products.toArray(),
            db.sales.toArray(),
            db.jobOrders.toArray(),
            db.attendance.toArray(),
        ]);

        const backup: BackupData = {
            version: BACKUP_VERSION,
            timestamp: new Date().toISOString(),
            branchId: products.length > 0 ? products[0].branchId : null,
            data: {
                categories,
                products,
                sales,
                jobOrders,
                attendance,
            },
        };

        // Create and download file
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `jspot-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('[Backup] Export completed successfully');
    } catch (error) {
        console.error('[Backup] Export failed:', error);
        throw error;
    }
}

/**
 * Import data from a JSON backup file
 */
export async function importBackup(file: File): Promise<{ imported: number; skipped: number }> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const text = e.target?.result as string;
                const backup: BackupData = JSON.parse(text);

                // Validate backup structure
                if (!backup.version || !backup.data) {
                    throw new Error('Invalid backup file format');
                }

                let imported = 0;
                let skipped = 0;

                // Import categories (skip existing)
                for (const cat of backup.data.categories || []) {
                    const existing = await db.categories.get(cat.id);
                    if (!existing) {
                        await db.categories.add(cat);
                        imported++;
                    } else {
                        skipped++;
                    }
                }

                // Import products (skip existing)
                for (const prod of backup.data.products || []) {
                    const existing = await db.products.get(prod.id);
                    if (!existing) {
                        await db.products.add(prod);
                        imported++;
                    } else {
                        skipped++;
                    }
                }

                // Import sales (skip existing)
                for (const sale of backup.data.sales || []) {
                    const existing = await db.sales.get(sale.id);
                    if (!existing) {
                        // Restore dates
                        sale.createdAt = new Date(sale.createdAt);
                        sale.updatedAt = new Date(sale.updatedAt);
                        await db.sales.add(sale);
                        imported++;
                    } else {
                        skipped++;
                    }
                }

                // Import job orders (skip existing)
                for (const jo of backup.data.jobOrders || []) {
                    const existing = await db.jobOrders.get(jo.id);
                    if (!existing) {
                        jo.createdAt = new Date(jo.createdAt);
                        jo.updatedAt = new Date(jo.updatedAt);
                        await db.jobOrders.add(jo);
                        imported++;
                    } else {
                        skipped++;
                    }
                }

                // Import attendance (skip existing)
                for (const att of backup.data.attendance || []) {
                    const existing = await db.attendance.get(att.id);
                    if (!existing) {
                        att.clockIn = new Date(att.clockIn);
                        att.clockOut = att.clockOut ? new Date(att.clockOut) : null;
                        att.createdAt = new Date(att.createdAt);
                        await db.attendance.add(att);
                        imported++;
                    } else {
                        skipped++;
                    }
                }

                console.log(`[Backup] Import completed: ${imported} imported, ${skipped} skipped`);
                resolve({ imported, skipped });

            } catch (error) {
                console.error('[Backup] Import failed:', error);
                reject(error);
            }
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
}

// ============================================
// Emergency Backup (localStorage)
// ============================================

/**
 * Save critical data to localStorage as emergency backup
 * Called daily automatically
 */
export async function saveEmergencyBackup(): Promise<void> {
    try {
        // Only backup unsynced data to save space
        const [sales, jobOrders] = await Promise.all([
            db.sales.filter(r => !r.synced).toArray(),
            db.jobOrders.filter(r => !r.synced).toArray(),
        ]);

        const backup = {
            timestamp: new Date().toISOString(),
            unsyncedSales: sales,
            unsyncedJobOrders: jobOrders,
        };

        localStorage.setItem(EMERGENCY_BACKUP_KEY, JSON.stringify(backup));
        console.log('[Backup] Emergency backup saved');

    } catch (error) {
        console.error('[Backup] Emergency backup failed:', error);
    }
}

/**
 * Restore from emergency backup (localStorage)
 */
export async function restoreEmergencyBackup(): Promise<{ restored: number }> {
    try {
        const backupStr = localStorage.getItem(EMERGENCY_BACKUP_KEY);
        if (!backupStr) {
            throw new Error('No emergency backup found');
        }

        const backup = JSON.parse(backupStr);
        let restored = 0;

        // Restore sales
        for (const sale of backup.unsyncedSales || []) {
            const existing = await db.sales.get(sale.id);
            if (!existing) {
                sale.createdAt = new Date(sale.createdAt);
                sale.updatedAt = new Date(sale.updatedAt);
                await db.sales.add(sale);
                restored++;
            }
        }

        // Restore job orders
        for (const jo of backup.unsyncedJobOrders || []) {
            const existing = await db.jobOrders.get(jo.id);
            if (!existing) {
                jo.createdAt = new Date(jo.createdAt);
                jo.updatedAt = new Date(jo.updatedAt);
                await db.jobOrders.add(jo);
                restored++;
            }
        }

        console.log(`[Backup] Emergency restore completed: ${restored} records`);
        return { restored };

    } catch (error) {
        console.error('[Backup] Emergency restore failed:', error);
        throw error;
    }
}

/**
 * Get emergency backup info
 */
export function getEmergencyBackupInfo(): { timestamp: string; count: number } | null {
    try {
        const backupStr = localStorage.getItem(EMERGENCY_BACKUP_KEY);
        if (!backupStr) return null;

        const backup = JSON.parse(backupStr);
        const count = (backup.unsyncedSales?.length || 0) + (backup.unsyncedJobOrders?.length || 0);

        return {
            timestamp: backup.timestamp,
            count,
        };
    } catch {
        return null;
    }
}

// ============================================
// Scheduled Backup Settings
// ============================================

export function getBackupSettings(): BackupSettings {
    try {
        const stored = localStorage.getItem(BACKUP_SETTINGS_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch { }

    // Default settings
    return {
        enabled: true,
        frequency: 'daily',
        time: '23:00',
        lastBackup: null,
    };
}

export function saveBackupSettings(settings: BackupSettings): void {
    localStorage.setItem(BACKUP_SETTINGS_KEY, JSON.stringify(settings));
}

/**
 * Check if scheduled backup should run (call every minute)
 */
export function checkScheduledBackup(): boolean {
    const settings = getBackupSettings();
    if (!settings.enabled) return false;

    const now = new Date();
    const [hour, minute] = settings.time.split(':').map(Number);

    // Check if current time matches
    if (now.getHours() !== hour || now.getMinutes() !== minute) {
        return false;
    }

    // Check frequency
    if (settings.lastBackup) {
        const lastDate = new Date(settings.lastBackup);
        const daysDiff = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

        switch (settings.frequency) {
            case 'daily':
                if (daysDiff < 1) return false;
                break;
            case 'weekly':
                if (daysDiff < 7) return false;
                break;
            case 'monthly':
                if (daysDiff < 30) return false;
                break;
        }
    }

    return true;
}

/**
 * Run scheduled backup if due
 */
export async function runScheduledBackup(): Promise<void> {
    if (!checkScheduledBackup()) return;

    try {
        await exportBackup();

        // Update last backup time
        const settings = getBackupSettings();
        settings.lastBackup = new Date().toISOString();
        saveBackupSettings(settings);

        console.log('[Backup] Scheduled backup completed');
    } catch (error) {
        console.error('[Backup] Scheduled backup failed:', error);
    }
}

// ============================================
// Initialize Backup System
// ============================================

let backupCheckInterval: NodeJS.Timeout | null = null;
let emergencyBackupInterval: NodeJS.Timeout | null = null;

export function initializeBackupSystem(): void {
    // Check for scheduled backup every minute
    backupCheckInterval = setInterval(runScheduledBackup, 60 * 1000);

    // Emergency backup every 24 hours
    emergencyBackupInterval = setInterval(saveEmergencyBackup, 24 * 60 * 60 * 1000);

    // Initial emergency backup
    saveEmergencyBackup();

    console.log('[Backup] Backup system initialized');
}

export function stopBackupSystem(): void {
    if (backupCheckInterval) {
        clearInterval(backupCheckInterval);
        backupCheckInterval = null;
    }
    if (emergencyBackupInterval) {
        clearInterval(emergencyBackupInterval);
        emergencyBackupInterval = null;
    }
}

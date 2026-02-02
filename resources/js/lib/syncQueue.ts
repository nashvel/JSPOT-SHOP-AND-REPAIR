/**
 * Sync Queue with Priority and Retry Logic
 * 
 * Manages offline sync operations with:
 * - Priority queue (sales first, then job orders, then attendance)
 * - Exponential backoff retry on failures
 * - Progress tracking
 */

import db, {
    OfflineSale,
    OfflineJobOrder,
    OfflineAttendance,
} from './db';

// ============================================
// Types
// ============================================

export type SyncItemType = 'sales' | 'jobOrders' | 'attendance';

export type SyncPriority = 1 | 2 | 3;

export interface SyncQueueItem {
    id: string;
    type: SyncItemType;
    recordId: string;
    priority: SyncPriority;
    retryCount: number;
    maxRetries: number;
    nextRetryAt: Date | null;
    lastError: string | null;
    createdAt: Date;
}

export interface SyncProgress {
    status: 'idle' | 'syncing' | 'paused' | 'error' | 'complete';
    currentStep: string;
    totalItems: number;
    completedItems: number;
    failedItems: number;
    percentage: number;
    currentType: SyncItemType | null;
    currentItemId: string | null;
    errors: SyncError[];
    startedAt: Date | null;
    completedAt: Date | null;
}

export interface SyncError {
    itemId: string;
    type: SyncItemType;
    message: string;
    timestamp: Date;
    retryCount: number;
}

export interface RetryConfig {
    maxRetries: number;
    baseDelayMs: number;
    maxDelayMs: number;
}

// ============================================
// Priority Configuration
// ============================================

export const SYNC_PRIORITIES: Record<SyncItemType, SyncPriority> = {
    sales: 1,      // Highest priority - revenue critical
    jobOrders: 2,  // Medium priority - work in progress
    attendance: 3, // Lower priority - historical data
};

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
    maxRetries: 3,
    baseDelayMs: 1000,  // 1 second
    maxDelayMs: 30000,  // 30 seconds max
};

// ============================================
// Progress State (Singleton)
// ============================================

let currentProgress: SyncProgress = {
    status: 'idle',
    currentStep: '',
    totalItems: 0,
    completedItems: 0,
    failedItems: 0,
    percentage: 0,
    currentType: null,
    currentItemId: null,
    errors: [],
    startedAt: null,
    completedAt: null,
};

type ProgressListener = (progress: SyncProgress) => void;
let progressListeners: ProgressListener[] = [];

export function onProgressChange(listener: ProgressListener): () => void {
    progressListeners.push(listener);
    // Immediately call with current state
    listener(currentProgress);
    return () => {
        progressListeners = progressListeners.filter(l => l !== listener);
    };
}

function updateProgress(updates: Partial<SyncProgress>): void {
    currentProgress = { ...currentProgress, ...updates };
    if (currentProgress.totalItems > 0) {
        currentProgress.percentage = Math.round(
            (currentProgress.completedItems / currentProgress.totalItems) * 100
        );
    }
    progressListeners.forEach(listener => listener(currentProgress));
}

export function getProgress(): SyncProgress {
    return { ...currentProgress };
}

export function resetProgress(): void {
    currentProgress = {
        status: 'idle',
        currentStep: '',
        totalItems: 0,
        completedItems: 0,
        failedItems: 0,
        percentage: 0,
        currentType: null,
        currentItemId: null,
        errors: [],
        startedAt: null,
        completedAt: null,
    };
    progressListeners.forEach(listener => listener(currentProgress));
}

// ============================================
// Retry Logic with Exponential Backoff
// ============================================

/**
 * Calculate delay with exponential backoff
 */
export function calculateBackoffDelay(
    attempt: number,
    config: RetryConfig = DEFAULT_RETRY_CONFIG
): number {
    const delay = config.baseDelayMs * Math.pow(2, attempt);
    // Add jitter (±10%) to prevent thundering herd
    const jitter = delay * 0.1 * (Math.random() * 2 - 1);
    return Math.min(delay + jitter, config.maxDelayMs);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Execute operation with retry and exponential backoff
 */
export async function withRetry<T>(
    operation: () => Promise<T>,
    config: RetryConfig = DEFAULT_RETRY_CONFIG,
    onRetry?: (attempt: number, error: Error, nextDelayMs: number) => void
): Promise<T> {
    let lastError: Error = new Error('Unknown error');

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error as Error;

            // Don't retry on last attempt
            if (attempt < config.maxRetries) {
                const delay = calculateBackoffDelay(attempt, config);

                if (onRetry) {
                    onRetry(attempt + 1, lastError, delay);
                }

                console.log(
                    `[Sync] Retry ${attempt + 1}/${config.maxRetries} in ${Math.round(delay)}ms: ${lastError.message}`
                );

                await sleep(delay);
            }
        }
    }

    throw lastError;
}

// ============================================
// Queue Management
// ============================================

/**
 * Build sync queue from unsynced records, sorted by priority
 */
export async function buildSyncQueue(): Promise<SyncQueueItem[]> {
    const [sales, jobOrders, attendance] = await Promise.all([
        db.sales.filter(r => !r.synced).toArray(),
        db.jobOrders.filter(r => !r.synced).toArray(),
        db.attendance.filter(r => !r.synced).toArray(),
    ]);

    const queue: SyncQueueItem[] = [];
    const now = new Date();

    // Add sales (priority 1)
    for (const sale of sales) {
        queue.push({
            id: crypto.randomUUID(),
            type: 'sales',
            recordId: sale.id,
            priority: SYNC_PRIORITIES.sales,
            retryCount: 0,
            maxRetries: DEFAULT_RETRY_CONFIG.maxRetries,
            nextRetryAt: null,
            lastError: null,
            createdAt: now,
        });
    }

    // Add job orders (priority 2)
    for (const jo of jobOrders) {
        queue.push({
            id: crypto.randomUUID(),
            type: 'jobOrders',
            recordId: jo.id,
            priority: SYNC_PRIORITIES.jobOrders,
            retryCount: 0,
            maxRetries: DEFAULT_RETRY_CONFIG.maxRetries,
            nextRetryAt: null,
            lastError: null,
            createdAt: now,
        });
    }

    // Add attendance (priority 3)
    for (const att of attendance) {
        queue.push({
            id: crypto.randomUUID(),
            type: 'attendance',
            recordId: att.id,
            priority: SYNC_PRIORITIES.attendance,
            retryCount: 0,
            maxRetries: DEFAULT_RETRY_CONFIG.maxRetries,
            nextRetryAt: null,
            lastError: null,
            createdAt: now,
        });
    }

    // Sort by priority (lower = higher priority), then by creation time
    queue.sort((a, b) => {
        if (a.priority !== b.priority) {
            return a.priority - b.priority;
        }
        return a.createdAt.getTime() - b.createdAt.getTime();
    });

    return queue;
}

/**
 * Get queue counts by type
 */
export async function getQueueCounts(): Promise<Record<SyncItemType, number>> {
    const [sales, jobOrders, attendance] = await Promise.all([
        db.sales.filter(r => !r.synced).count(),
        db.jobOrders.filter(r => !r.synced).count(),
        db.attendance.filter(r => !r.synced).count(),
    ]);

    return { sales, jobOrders, attendance };
}

/**
 * Get total unsynced count
 */
export async function getTotalUnsyncedCount(): Promise<number> {
    const counts = await getQueueCounts();
    return counts.sales + counts.jobOrders + counts.attendance;
}

// ============================================
// Exports
// ============================================

export default {
    withRetry,
    calculateBackoffDelay,
    buildSyncQueue,
    getQueueCounts,
    getTotalUnsyncedCount,
    onProgressChange,
    getProgress,
    resetProgress,
    updateProgress,
    SYNC_PRIORITIES,
    DEFAULT_RETRY_CONFIG,
};

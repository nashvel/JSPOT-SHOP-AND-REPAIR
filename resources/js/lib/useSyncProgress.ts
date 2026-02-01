/**
 * React Hook for Sync Progress
 * 
 * Provides real-time sync progress updates for UI components.
 */

import { useState, useEffect, useCallback } from 'react';
import { onSyncProgress, getSyncProgress } from './sync';
import { SyncProgress, SyncError } from './syncQueue';

// Re-export types for consumer convenience
export type { SyncProgress, SyncError };

/**
 * Hook to subscribe to sync progress updates
 */
export function useSyncProgress(): SyncProgress {
    const [progress, setProgress] = useState<SyncProgress>(getSyncProgress());

    useEffect(() => {
        // Subscribe to progress updates
        const unsubscribe = onSyncProgress((newProgress) => {
            setProgress(newProgress);
        });

        return unsubscribe;
    }, []);

    return progress;
}

/**
 * Hook that provides sync progress with additional helper methods
 */
export function useSyncProgressWithActions() {
    const progress = useSyncProgress();

    const isSyncing = progress.status === 'syncing';
    const hasErrors = progress.errors.length > 0;
    const isComplete = progress.status === 'complete';

    const getStatusText = useCallback(() => {
        switch (progress.status) {
            case 'idle':
                return 'Ready to sync';
            case 'syncing':
                return progress.currentStep;
            case 'complete':
                return `Sync complete (${progress.completedItems} items)`;
            case 'error':
                return `Sync failed (${progress.failedItems} errors)`;
            case 'paused':
                return 'Sync paused';
            default:
                return 'Unknown status';
        }
    }, [progress]);

    const getTypeLabel = useCallback((type: string | null) => {
        switch (type) {
            case 'sales':
                return 'Sales';
            case 'jobOrders':
                return 'Job Orders';
            case 'attendance':
                return 'Attendance';
            default:
                return '';
        }
    }, []);

    const getDuration = useCallback(() => {
        if (!progress.startedAt) return null;
        const end = progress.completedAt || new Date();
        const durationMs = end.getTime() - progress.startedAt.getTime();
        return Math.round(durationMs / 1000);
    }, [progress.startedAt, progress.completedAt]);

    return {
        progress,
        isSyncing,
        hasErrors,
        isComplete,
        getStatusText,
        getTypeLabel,
        getDuration,
    };
}

export default useSyncProgress;

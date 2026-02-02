import { useState, useEffect, useCallback } from 'react';
import db, { OfflineJobOrder, generateLocalId } from './db';
import { syncToServer } from './sync';

export function useOfflineJobOrders(branchId: number) {
    const [offlineJobOrders, setOfflineJobOrders] = useState<OfflineJobOrder[]>([]);
    const [loading, setLoading] = useState(true);

    // Refresh local job orders
    const refreshJobOrders = useCallback(async () => {
        setLoading(true);
        try {
            let collection = db.jobOrders.toCollection();

            if (branchId !== 0) {
                collection = db.jobOrders.where('branchId').equals(branchId);
            }

            const orders = await collection
                .reverse()
                .sortBy('createdAt');
            setOfflineJobOrders(orders);
        } catch (error) {
            console.error('[Offline] Failed to load job orders:', error);
        } finally {
            setLoading(false);
        }
    }, [branchId]);

    // Initial load
    useEffect(() => {
        refreshJobOrders();
    }, [refreshJobOrders]);

    return {
        offlineJobOrders,
        loading,
        refreshJobOrders,
    };
}

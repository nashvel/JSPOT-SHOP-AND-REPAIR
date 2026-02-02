import { useState, useEffect, useCallback } from 'react';
import db, { OfflineSale, generateLocalId } from './db';
import { syncToServer } from './sync';

export function useOfflineSales(branchId: number) {
    const [offlineSales, setOfflineSales] = useState<OfflineSale[]>([]);
    const [loading, setLoading] = useState(true);

    // Refresh local sales
    const refreshSales = useCallback(async () => {
        setLoading(true);
        try {
            let collection = db.sales.toCollection();

            if (branchId !== 0) {
                collection = db.sales.where('branchId').equals(branchId);
            }

            const sales = await collection
                .reverse()
                .sortBy('createdAt');
            setOfflineSales(sales);
        } catch (error) {
            console.error('[Offline] Failed to load sales:', error);
        } finally {
            setLoading(false);
        }
    }, [branchId]);

    // Initial load
    useEffect(() => {
        refreshSales();
    }, [refreshSales]);

    return {
        offlineSales,
        loading,
        refreshSales,
    };
}

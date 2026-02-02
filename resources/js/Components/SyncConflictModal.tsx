/**
 * Sync Conflict Modal Component
 * 
 * Displays when a sync conflict is detected between local and server data.
 * Allows user to choose: Keep Mine, Use Server, or Review Later.
 */

import React, { useState } from 'react';
import {
    AlertTriangle,
    Smartphone,
    Cloud,
    Clock,
    Check,
    X,
} from 'lucide-react';

// ============================================
// Types
// ============================================

export interface ConflictData {
    id: string;
    type: 'stock' | 'jobOrder' | 'product' | 'price';
    itemName: string;
    itemId: string;
    localValue: any;
    serverValue: any;
    localUpdatedAt: Date;
    serverUpdatedAt: Date;
    detectedAt: Date;
    resolved: boolean;
    resolution?: 'local' | 'server' | 'pending';
}

interface SyncConflictModalProps {
    /** Whether the modal is open */
    isOpen: boolean;
    /** Callback when modal is closed */
    onClose: () => void;
    /** Current conflict to display */
    conflict: ConflictData | null;
    /** Callback when user chooses to keep local data */
    onKeepMine?: (conflict: ConflictData) => void;
    /** Callback when user chooses to use server data */
    onUseServer?: (conflict: ConflictData) => void;
    /** Callback when user wants to review later */
    onReviewLater?: (conflict: ConflictData) => void;
}

// ============================================
// Component
// ============================================

export default function SyncConflictModal({
    isOpen,
    onClose,
    conflict,
    onKeepMine,
    onUseServer,
    onReviewLater,
}: SyncConflictModalProps) {
    const [isResolving, setIsResolving] = useState(false);

    if (!isOpen || !conflict) return null;

    const handleKeepMine = async () => {
        setIsResolving(true);
        try {
            onKeepMine?.(conflict);
            onClose();
        } finally {
            setIsResolving(false);
        }
    };

    const handleUseServer = async () => {
        setIsResolving(true);
        try {
            onUseServer?.(conflict);
            onClose();
        } finally {
            setIsResolving(false);
        }
    };

    const handleReviewLater = () => {
        onReviewLater?.(conflict);
        onClose();
    };

    const formatValue = (value: any, type: string) => {
        if (type === 'stock' || type === 'price') {
            return typeof value === 'number' ? value.toLocaleString() : value;
        }
        if (typeof value === 'object') {
            return JSON.stringify(value, null, 2);
        }
        return String(value);
    };

    const getConflictIcon = () => {
        switch (conflict.type) {
            case 'stock':
                return '📦';
            case 'price':
                return '💰';
            case 'jobOrder':
                return '🔧';
            default:
                return '📄';
        }
    };

    const getConflictLabel = () => {
        switch (conflict.type) {
            case 'stock':
                return 'Stock Quantity';
            case 'price':
                return 'Price';
            case 'jobOrder':
                return 'Job Order Status';
            default:
                return 'Data';
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative w-full max-w-md transform rounded-2xl bg-white shadow-xl transition-all">

                    {/* Header */}
                    <div className="bg-amber-50 px-6 py-4 rounded-t-2xl border-b border-amber-100">
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Sync Conflict Detected
                                </h3>
                                <p className="text-sm text-amber-700">
                                    Local data differs from server
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-5">
                        {/* Item Info */}
                        <div className="mb-5">
                            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                                <span>{getConflictIcon()}</span>
                                <span>{getConflictLabel()}</span>
                            </div>
                            <p className="text-lg font-medium text-gray-900">
                                {conflict.itemName}
                            </p>
                        </div>

                        {/* Comparison */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            {/* Local Version */}
                            <div className="bg-blue-50 rounded-xl p-4">
                                <div className="flex items-center gap-2 text-blue-700 text-sm font-medium mb-2">
                                    <Smartphone className="w-4 h-4" />
                                    Your Version
                                </div>
                                <p className="text-2xl font-bold text-blue-900">
                                    {formatValue(conflict.localValue, conflict.type)}
                                </p>
                                <p className="text-xs text-blue-600 mt-1">
                                    {new Date(conflict.localUpdatedAt).toLocaleString()}
                                </p>
                            </div>

                            {/* Server Version */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center gap-2 text-gray-700 text-sm font-medium mb-2">
                                    <Cloud className="w-4 h-4" />
                                    Server Version
                                </div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatValue(conflict.serverValue, conflict.type)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {new Date(conflict.serverUpdatedAt).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        {/* Explanation */}
                        <div className="bg-gray-50 rounded-lg p-3 mb-5">
                            <p className="text-sm text-gray-600">
                                <strong>What happened:</strong> This data was modified on another device
                                or by another user while you were offline. Choose which version to keep.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="space-y-2">
                            <button
                                onClick={handleKeepMine}
                                disabled={isResolving}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                <Smartphone className="w-5 h-5" />
                                Keep My Version
                            </button>

                            <button
                                onClick={handleUseServer}
                                disabled={isResolving}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
                            >
                                <Cloud className="w-5 h-5" />
                                Use Server Version
                            </button>

                            <button
                                onClick={handleReviewLater}
                                disabled={isResolving}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                <Clock className="w-5 h-5" />
                                Review Later
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================
// Conflict List Component (for reviewing multiple conflicts)
// ============================================

interface ConflictListProps {
    conflicts: ConflictData[];
    onResolve: (conflict: ConflictData, resolution: 'local' | 'server') => void;
}

export function ConflictList({ conflicts, onResolve }: ConflictListProps) {
    if (conflicts.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <Check className="w-12 h-12 mx-auto mb-3 text-green-500" />
                <p>No pending conflicts</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {conflicts.map(conflict => (
                <div
                    key={conflict.id}
                    className="bg-white border border-amber-200 rounded-xl p-4"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="font-medium text-gray-900">
                                {conflict.itemName}
                            </p>
                            <p className="text-sm text-gray-500">
                                {conflict.type}: {String(conflict.localValue)} → {String(conflict.serverValue)}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                Detected {new Date(conflict.detectedAt).toLocaleString()}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => onResolve(conflict, 'local')}
                                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                            >
                                Mine
                            </button>
                            <button
                                onClick={() => onResolve(conflict, 'server')}
                                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                            >
                                Server
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

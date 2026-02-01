/**
 * Sync Status Indicator Component
 * 
 * Displays a visual progress indicator for offline sync status.
 * Shows progress bar, current step, and error count.
 */

import React from 'react';
import { useSyncProgressWithActions } from '../lib/useSyncProgress';
import {
    CloudUpload,
    CheckCircle,
    AlertTriangle,
    RefreshCw,
} from 'lucide-react';

interface SyncStatusIndicatorProps {
    /** Show expanded view with details */
    expanded?: boolean;
    /** Custom class name */
    className?: string;
    /** Callback when clicked */
    onClick?: () => void;
}

export default function SyncStatusIndicator({
    expanded = false,
    className = '',
    onClick,
}: SyncStatusIndicatorProps) {
    const {
        progress,
        isSyncing,
        hasErrors,
        isComplete,
        getStatusText,
        getTypeLabel,
        getDuration,
    } = useSyncProgressWithActions();

    // Icon based on status
    const StatusIcon = () => {
        if (isSyncing) {
            return (
                <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
            );
        }
        if (hasErrors) {
            return (
                <AlertTriangle className="w-5 h-5 text-amber-500" />
            );
        }
        if (isComplete) {
            return (
                <CheckCircle className="w-5 h-5 text-green-500" />
            );
        }
        return (
            <CloudUpload className="w-5 h-5 text-gray-400" />
        );
    };

    // Compact view (just icon and percentage)
    if (!expanded) {
        return (
            <button
                onClick={onClick}
                className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-lg
                    transition-all duration-200
                    ${isSyncing
                        ? 'bg-blue-50 text-blue-700'
                        : hasErrors
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }
                    ${className}
                `}
            >
                <StatusIcon />
                {isSyncing && (
                    <span className="text-sm font-medium">
                        {progress.percentage}%
                    </span>
                )}
                {hasErrors && !isSyncing && (
                    <span className="text-sm font-medium">
                        {progress.failedItems} error{progress.failedItems !== 1 ? 's' : ''}
                    </span>
                )}
            </button>
        );
    }

    // Expanded view with full details
    return (
        <div
            className={`
                bg-white rounded-xl border shadow-sm p-4
                ${hasErrors ? 'border-amber-200' : 'border-gray-200'}
                ${className}
            `}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <StatusIcon />
                    <span className="font-medium text-gray-900">
                        {isSyncing ? 'Syncing...' : hasErrors ? 'Sync Issues' : 'Sync Status'}
                    </span>
                </div>
                {progress.completedAt && !isSyncing && (
                    <span className="text-xs text-gray-400">
                        {getDuration()}s
                    </span>
                )}
            </div>

            {/* Progress Bar */}
            {isSyncing && (
                <div className="mb-3">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 transition-all duration-300 ease-out"
                            style={{ width: `${progress.percentage}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">
                            {progress.completedItems} / {progress.totalItems}
                        </span>
                        <span className="text-xs text-gray-500">
                            {progress.percentage}%
                        </span>
                    </div>
                </div>
            )}

            {/* Current Step */}
            <p className="text-sm text-gray-600 mb-2">
                {getStatusText()}
            </p>

            {/* Current Type Badge */}
            {isSyncing && progress.currentType && (
                <span className={`
                    inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                    ${progress.currentType === 'sales'
                        ? 'bg-green-100 text-green-700'
                        : progress.currentType === 'jobOrders'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                    }
                `}>
                    {getTypeLabel(progress.currentType)}
                </span>
            )}

            {/* Error List */}
            {hasErrors && progress.errors.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs font-medium text-amber-600 mb-2">
                        Failed Items ({progress.errors.length})
                    </p>
                    <ul className="space-y-1 max-h-24 overflow-y-auto">
                        {progress.errors.slice(0, 5).map((error, index) => (
                            <li key={index} className="text-xs text-gray-500 truncate">
                                • {error.message}
                            </li>
                        ))}
                        {progress.errors.length > 5 && (
                            <li className="text-xs text-gray-400">
                                +{progress.errors.length - 5} more...
                            </li>
                        )}
                    </ul>
                </div>
            )}

            {/* Success State */}
            {isComplete && !hasErrors && (
                <div className="flex items-center gap-2 text-green-600 mt-1">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">All items synced successfully</span>
                </div>
            )}
        </div>
    );
}

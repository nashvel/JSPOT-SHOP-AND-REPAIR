import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState, useEffect } from 'react';
import { BarChart3, Package, Wrench } from 'lucide-react';

interface Branch {
    id: number;
    name: string;
}

interface Props extends PageProps {
    branches: Branch[];
    selectedBranch: number | null;
    canFilterBranches: boolean;
}

export default function AnalyticsIndex({ auth, branches, selectedBranch, canFilterBranches }: Props) {
    const [activeTab, setActiveTab] = useState<'sales' | 'inventory' | 'job-orders'>('sales');
    const [branchId, setBranchId] = useState<string>(selectedBranch?.toString() || '');

    // Handle branch filter change
    useEffect(() => {
        if (!canFilterBranches) return;

        const params = new URLSearchParams();
        if (branchId) {
            params.set('branch', branchId);
        }

        const queryString = params.toString();
        const url = queryString ? `?${queryString}` : '';

        router.get(route('admin.analytics.index') + url, {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }, [branchId]);

    const tabs = [
        { id: 'sales' as const, name: 'Sales Report', icon: BarChart3 },
        { id: 'inventory' as const, name: 'Inventory Report', icon: Package },
        { id: 'job-orders' as const, name: 'Job Orders Report', icon: Wrench },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Analytics & Reports" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {/* Header with Branch Filter */}
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        View comprehensive reports for sales, inventory, and job orders
                                    </p>
                                </div>
                                {canFilterBranches && branches.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm text-gray-600">Branch:</label>
                                        <select
                                            value={branchId}
                                            onChange={(e) => setBranchId(e.target.value)}
                                            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        >
                                            <option value="">All Branches</option>
                                            {branches.map((branch) => (
                                                <option key={branch.id} value={branch.id}>
                                                    {branch.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Tabs */}
                            <div className="border-b border-gray-200 mb-6">
                                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                    {tabs.map((tab) => {
                                        const Icon = tab.icon;
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`
                                                    whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
                                                    ${activeTab === tab.id
                                                        ? 'border-indigo-500 text-indigo-600'
                                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                                                `}
                                            >
                                                <Icon className="h-4 w-4" />
                                                {tab.name}
                                            </button>
                                        );
                                    })}
                                </nav>
                            </div>

                            {/* Tab Content */}
                            <div className="mt-6">
                                {activeTab === 'sales' && (
                                    <SalesReportContent branchId={branchId} />
                                )}
                                {activeTab === 'inventory' && (
                                    <InventoryReportContent branchId={branchId} />
                                )}
                                {activeTab === 'job-orders' && (
                                    <JobOrdersReportContent branchId={branchId} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// Sales Report Component
function SalesReportContent({ branchId }: { branchId: string }) {
    const [dateFilter, setDateFilter] = useState('today');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Auto-navigate when filters change
    useEffect(() => {
        const params = new URLSearchParams();
        if (branchId) params.set('branch', branchId);
        params.set('date', dateFilter);
        if (dateFilter === 'custom') {
            if (startDate) params.set('start', startDate);
            if (endDate) params.set('end', endDate);
        }

        router.visit(route('admin.analytics.sales') + '?' + params.toString());
    }, [dateFilter, startDate, endDate, branchId]);

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Sales Analytics Dashboard</h3>
                <p className="text-sm text-gray-600 mb-6">
                    View daily/weekly/monthly revenue charts, best-selling products/services, and profit margins analysis.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date Range
                    </label>
                    <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="year">This Year</option>
                        <option value="custom">Custom Range</option>
                    </select>
                </div>

                {dateFilter === 'custom' && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// Inventory Report Component
function InventoryReportContent({ branchId }: { branchId: string }) {
    const [filter, setFilter] = useState('all');
    const [threshold, setThreshold] = useState('10');

    // Auto-navigate when filters change
    useEffect(() => {
        const params = new URLSearchParams();
        if (branchId) params.set('branch', branchId);
        params.set('filter', filter);
        params.set('threshold', threshold);

        router.visit(route('admin.analytics.inventory') + '?' + params.toString());
    }, [filter, threshold, branchId]);

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Inventory Reports</h3>
                <p className="text-sm text-gray-600 mb-6">
                    Monitor low stock alerts, stock movement history, reorder point suggestions, and identify dead stock.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock Filter
                    </label>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                        <option value="all">All Products</option>
                        <option value="low_stock">Low Stock</option>
                        <option value="out_of_stock">Out of Stock</option>
                        <option value="in_stock">In Stock</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Low Stock Threshold
                    </label>
                    <input
                        type="number"
                        value={threshold}
                        onChange={(e) => setThreshold(e.target.value)}
                        min="1"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>
            </div>
        </div>
    );
}

// Job Orders Report Component
function JobOrdersReportContent({ branchId }: { branchId: string }) {
    const [status, setStatus] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');

    // Auto-navigate when filters change
    useEffect(() => {
        const params = new URLSearchParams();
        if (branchId) params.set('branch', branchId);
        params.set('status', status);
        params.set('date', dateFilter);

        router.visit(route('admin.analytics.job-orders') + '?' + params.toString());
    }, [status, dateFilter, branchId]);

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Job Orders Report</h3>
                <p className="text-sm text-gray-600 mb-6">
                    Track jobs completed per mechanic, average completion time, and labor earnings breakdown.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status Filter
                    </label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date Range
                    </label>
                    <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                    </select>
                </div>
            </div>
        </div>
    );
}

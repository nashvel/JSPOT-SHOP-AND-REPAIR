import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { DollarSign, ShoppingCart, TrendingUp, Package, Building2, Calendar, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import AnalyticsTabs from './Components/AnalyticsTabs';
import { useState } from 'react';
import BranchSelectionModal from '@/Components/BranchSelectionModal';

interface Sale {
    id: number;
    sale_number: string;
    customer_name: string | null;
    total: number;
    payment_method: string;
    created_at: string;
    branch: { id: number; name: string } | null;
    user: { id: number; name: string } | null;
    items: { product: { name: string } | null; quantity: number; price: number }[];
}

interface TopProduct {
    name: string;
    quantity: number;
    revenue: number;
}

interface DailyBreakdown {
    date: string;
    count: number;
    revenue: number;
}

interface Branch {
    id: number;
    name: string;
}

interface Props {
    sales: Sale[];
    stats: {
        total_sales: number;
        total_revenue: number;
        avg_sale: number;
        total_items: number;
    };
    topProducts: TopProduct[];
    dailyBreakdown: DailyBreakdown[];
    dateFilter: string;
    dateRange: { start: string; end: string };
    branches: Branch[];
    selectedBranch: number | null;
    canFilterBranches: boolean;
}

export default function Sales({ sales, stats, topProducts, dailyBreakdown, dateFilter, dateRange, branches, selectedBranch, canFilterBranches }: Props) {
    const [showExportModal, setShowExportModal] = useState(false);
    const handleDateFilterChange = (newFilter: string) => {
        const params = new URLSearchParams(window.location.search);
        params.set('date', newFilter);
        if (newFilter !== 'custom') {
            params.delete('start');
            params.delete('end');
        }
        window.location.href = `?${params.toString()}`;
    };

    const handleBranchChange = (branchId: string) => {
        const params = new URLSearchParams(window.location.search);
        if (branchId) {
            params.set('branch', branchId);
        } else {
            params.delete('branch');
        }
        window.location.href = `?${params.toString()}`;
    };

    const handleCustomDateChange = (start: string, end: string) => {
        const params = new URLSearchParams(window.location.search);
        params.set('date', 'custom');
        params.set('start', start);
        params.set('end', end);
        window.location.href = `?${params.toString()}`;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Sales Report" />
            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    <AnalyticsTabs activeTab="sales" />
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Sales Report</h2>
                            <p className="text-gray-500 text-sm mt-1">
                                {dateFilter === 'today' ? "Today's sales" : `${dateRange.start} to ${dateRange.end}`}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => {
                                    if (canFilterBranches && !selectedBranch) {
                                        setShowExportModal(true);
                                    } else {
                                        window.location.href = route('admin.analytics.export.sales', {
                                            branch_id: selectedBranch,
                                            date: dateFilter,
                                            start: dateRange.start,
                                            end: dateRange.end
                                        });
                                    }
                                }}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
                            >
                                <Download className="h-4 w-4" /> Export
                            </button>

                            {canFilterBranches && (
                                <select
                                    value={selectedBranch || ''}
                                    onChange={(e) => handleBranchChange(e.target.value)}
                                    className="bg-white border border-gray-200 text-gray-700 h-9 rounded-md text-sm font-medium shadow-sm"
                                >
                                    <option value="">All Branches</option>
                                    {branches.map((b) => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            )}
                            <select
                                value={dateFilter}
                                onChange={(e) => handleDateFilterChange(e.target.value)}
                                className="bg-white border border-gray-200 text-gray-700 h-9 rounded-md text-sm font-medium shadow-sm"
                            >
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="year">This Year</option>
                                <option value="custom">Custom Range</option>
                            </select>
                            {dateFilter === 'custom' && (
                                <>
                                    <input
                                        type="date"
                                        defaultValue={dateRange.start}
                                        onChange={(e) => handleCustomDateChange(e.target.value, dateRange.end)}
                                        className="bg-white border border-gray-200 text-gray-700 h-9 rounded-md text-sm shadow-sm"
                                    />
                                    <input
                                        type="date"
                                        defaultValue={dateRange.end}
                                        onChange={(e) => handleCustomDateChange(dateRange.start, e.target.value)}
                                        className="bg-white border border-gray-200 text-gray-700 h-9 rounded-md text-sm shadow-sm"
                                    />
                                </>
                            )}
                        </div>
                    </div>

                    <BranchSelectionModal
                        isOpen={showExportModal}
                        onClose={() => setShowExportModal(false)}
                        onConfirm={(branchId) => {
                            setShowExportModal(false);
                            window.location.href = route('admin.analytics.export.sales', {
                                branch_id: branchId,
                                date: dateFilter,
                                start: dateRange.start,
                                end: dateRange.end
                            });
                        }}
                        branches={branches}
                        title="Export Sales Report"
                        description="Select a branch to export sales data for. Leave as 'All Branches' to export for all."
                    />

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard title="Total Sales" value={stats.total_sales} icon={ShoppingCart} color="text-blue-600" />
                        <StatCard title="Total Revenue" value={`₱${stats.total_revenue.toLocaleString()}`} icon={DollarSign} color="text-green-600" />
                        <StatCard title="Average Sale" value={`₱${Math.round(stats.avg_sale).toLocaleString()}`} icon={TrendingUp} color="text-indigo-600" />
                        <StatCard title="Items Sold" value={stats.total_items} icon={Package} color="text-orange-600" />
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Revenue Trend */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Trend</h3>
                            <div className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={dailyBreakdown}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="date" fontSize={12} tickLine={false} />
                                        <YAxis fontSize={12} tickLine={false} tickFormatter={(v) => `₱${v}`} />
                                        <Tooltip formatter={(v: any) => [`₱${v.toLocaleString()}`, 'Revenue']} />
                                        <Area type="monotone" dataKey="revenue" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.1} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Top Products */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Top Selling Products</h3>
                            <div className="h-[250px]">
                                {topProducts.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={topProducts} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                            <XAxis type="number" fontSize={12} tickFormatter={(v) => `₱${v}`} />
                                            <YAxis dataKey="name" type="category" fontSize={12} width={100} />
                                            <Tooltip formatter={(v: any) => [`₱${v.toLocaleString()}`, 'Revenue']} />
                                            <Bar dataKey="revenue" fill="#10B981" radius={[0, 4, 4, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-500">
                                        No sales data for this period
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sales List */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900">Recent Transactions</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sale #</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                        {canFilterBranches && !selectedBranch && (
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                                        )}
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {sales.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                                No sales found for this period.
                                            </td>
                                        </tr>
                                    ) : (
                                        sales.slice(0, 20).map((sale) => (
                                            <tr key={sale.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">{sale.sale_number}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.customer_name || 'Walk-in'}</td>
                                                {canFilterBranches && !selectedBranch && (
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sale.branch?.name || '-'}</td>
                                                )}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sale.items.length} items</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₱{sale.total.toLocaleString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{sale.payment_method}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(sale.created_at).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function StatCard({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: any; color: string }) {
    return (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-gray-50 ${color}`}>
                    <Icon className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-xs text-gray-500">{title}</p>
                    <p className="text-lg font-bold text-gray-900">{value}</p>
                </div>
            </div>
        </div>
    );
}

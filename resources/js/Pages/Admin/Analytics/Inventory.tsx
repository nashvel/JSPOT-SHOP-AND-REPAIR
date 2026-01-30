import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Package, AlertTriangle, XCircle, CheckCircle, Building2, DollarSign } from 'lucide-react';
import AnalyticsTabs from './Components/AnalyticsTabs';

interface InventoryItem {
    id: number;
    name: string;
    sku: string;
    price: number;
    cost: number;
    type: string;
    category_name: string | null;
    branch_id: number;
    branch_name: string;
    stock_quantity: number;
}

interface Branch {
    id: number;
    name: string;
}

interface Props {
    inventory: InventoryItem[];
    stats: {
        total_products: number;
        out_of_stock: number;
        low_stock: number;
        in_stock: number;
        total_value: number;
    };
    filter: string;
    threshold: number;
    branches: Branch[];
    selectedBranch: number | null;
    canFilterBranches: boolean;
}

export default function Inventory({ inventory, stats, filter, threshold, branches, selectedBranch, canFilterBranches }: Props) {
    const handleFilterChange = (newFilter: string) => {
        const params = new URLSearchParams(window.location.search);
        params.set('filter', newFilter);
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

    const getStockBadge = (qty: number) => {
        if (qty === 0) return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">Out of Stock</span>;
        if (qty <= threshold) return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">Low Stock</span>;
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">In Stock</span>;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Inventory Report" />
            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    <AnalyticsTabs activeTab="inventory" />
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Inventory Report</h2>
                            <p className="text-gray-500 text-sm mt-1">Monitor stock levels and identify reorder needs.</p>
                        </div>
                        <div className="flex gap-2">
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
                                value={filter}
                                onChange={(e) => handleFilterChange(e.target.value)}
                                className="bg-white border border-gray-200 text-gray-700 h-9 rounded-md text-sm font-medium shadow-sm"
                            >
                                <option value="all">All Products</option>
                                <option value="out_of_stock">Out of Stock</option>
                                <option value="low_stock">Low Stock (≤{threshold})</option>
                                <option value="in_stock">In Stock</option>
                            </select>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <StatCard title="Total Products" value={stats.total_products} icon={Package} color="text-gray-600" />
                        <StatCard title="Out of Stock" value={stats.out_of_stock} icon={XCircle} color="text-red-600" />
                        <StatCard title="Low Stock" value={stats.low_stock} icon={AlertTriangle} color="text-yellow-600" />
                        <StatCard title="In Stock" value={stats.in_stock} icon={CheckCircle} color="text-green-600" />
                        <StatCard title="Total Value" value={`₱${stats.total_value.toLocaleString()}`} icon={DollarSign} color="text-indigo-600" />
                    </div>

                    {/* Inventory Table */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                        {canFilterBranches && !selectedBranch && (
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                                        )}
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {inventory.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                                No inventory items found matching your criteria.
                                            </td>
                                        </tr>
                                    ) : (
                                        inventory.map((item) => (
                                            <tr key={`${item.id}-${item.branch_id}`} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.sku || '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category_name || '-'}</td>
                                                {canFilterBranches && !selectedBranch && (
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.branch_name}</td>
                                                )}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.stock_quantity}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₱{(item.cost || 0).toLocaleString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₱{(item.price || 0).toLocaleString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{getStockBadge(item.stock_quantity)}</td>
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

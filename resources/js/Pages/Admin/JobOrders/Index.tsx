import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { ClipboardList, Clock, CheckCircle, AlertCircle, Search } from 'lucide-react';
import { useState, useEffect } from 'react';

interface JobOrder {
    id: number;
    tracking_code: string;
    customer_name: string;
    vehicle_details: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    created_at: string;
    branch?: {
        name: string;
    };
}

interface Props {
    jobOrders: JobOrder[];
    branches: { id: number; name: string }[];
    filters: {
        branch_id?: number;
    };
    userBranchId: number | null;
}

export default function Index({ jobOrders, branches, filters, userBranchId }: Props) {
    const [search, setSearch] = useState('');
    const [branchId, setBranchId] = useState(filters.branch_id || '');

    useEffect(() => {
        router.get(route('admin.job-orders.index'), {
            branch_id: branchId || undefined
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    }, [branchId]);

    const filteredOrders = jobOrders.filter(order =>
        order.tracking_code.toLowerCase().includes(search.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(search.toLowerCase()) ||
        order.vehicle_details.toLowerCase().includes(search.toLowerCase())
    );

    const formatDate = (date: string) => new Date(date).toLocaleString('en-PH', {
        year: 'numeric', month: 'short', day: 'numeric',
    });

    const StatusBadge = ({ status }: { status: string }) => {
        const styles: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            in_progress: 'bg-blue-100 text-blue-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-gray-100 text-gray-800',
        };

        const icons: Record<string, any> = {
            pending: Clock,
            in_progress: AlertCircle,
            completed: CheckCircle,
            cancelled: AlertCircle,
        };

        const Icon = icons[status] || Clock;

        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
                <Icon className="h-3 w-3" />
                {status.replace('_', ' ').toUpperCase()}
            </span>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Job Orders" />
            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Job Orders</h1>
                            <p className="text-gray-500">Track repair services and maintenance status</p>
                        </div>
                        <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium text-sm flex items-center gap-2">
                            <ClipboardList className="h-4 w-4" />
                            New Job Order
                        </button>
                    </div>

                    {/* Search & Filters */}
                    <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                        <div className="flex gap-4">
                            {!userBranchId && (
                                <div className="w-64">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                                    <select
                                        value={branchId}
                                        onChange={e => setBranchId(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="">All Branches</option>
                                        {branches.map(branch => (
                                            <option key={branch.id} value={branch.id}>{branch.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search tracking code, customer, or vehicle..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tracking #</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle/Device</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredOrders.map(order => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-mono text-indigo-600 font-medium">
                                            {order.tracking_code}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {order.customer_name}
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">
                                            {order.vehicle_details}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                            {order.description}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {order.branch?.name || '—'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={order.status} />
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {formatDate(order.created_at)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={route('admin.job-orders.edit', order.id)}
                                                className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium text-xs"
                                            >
                                                Update
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {filteredOrders.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                            No job orders found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

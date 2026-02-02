import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { ClipboardList, Clock, CheckCircle, AlertCircle, Search, Wrench, Eye, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useOfflineJobOrders } from '@/lib/useOfflineJobOrders';
import { useOfflineData } from '@/lib/useOfflineData';

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
    sale?: {
        mechanics?: {
            id: number;
            name: string;
        }[];
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
    const [viewingOrder, setViewingOrder] = useState<any | null>(null);

    // Offline Hooks
    const effectiveBranchId = userBranchId || (branchId ? Number(branchId) : 0);
    const { isOffline } = useOfflineData({ branchId: effectiveBranchId });
    const { offlineJobOrders } = useOfflineJobOrders(effectiveBranchId);

    useEffect(() => {
        router.get(route('admin.job-orders.index'), {
            branch_id: branchId || undefined
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    }, [branchId]);

    const filteredOrders = isOffline ? offlineJobOrders.filter(order =>
        order.jobOrderNumber.toLowerCase().includes(search.toLowerCase()) ||
        order.customerName.toLowerCase().includes(search.toLowerCase()) ||
        (order.vehicleModel && order.vehicleModel.toLowerCase().includes(search.toLowerCase()))
    ) : jobOrders.filter(order =>
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
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                Job Orders
                                {isOffline && (
                                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-gray-600 text-white">
                                        OFFLINE MODE
                                    </span>
                                )}
                            </h1>
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mechanics</th>
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
                                            {(order as any).tracking_code || (order as any).jobOrderNumber}
                                            {isOffline && !(order as any).synced && (
                                                <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-amber-100 text-amber-700 rounded-full">
                                                    Unsynced
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {(order as any).customer_name || (order as any).customerName}
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">
                                            {(order as any).vehicle_details || (order as any).vehicleModel || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                            {(order as any).description || (order as any).notes || 'No description'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1">
                                                <Wrench className="h-3 w-3 text-gray-400" />
                                                <span className="text-sm text-gray-600">
                                                    {(order as any).mechanicName || ((order as any).sale?.mechanics && (order as any).sale.mechanics.length > 0
                                                        ? (order as any).sale.mechanics.map((m: any) => m.name).join(', ')
                                                        : '—')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {(order as any).branch?.name || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={order.status} />
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {formatDate((order as any).created_at || (order as any).createdAt)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {!isOffline ? (
                                                <Link
                                                    href={route('admin.job-orders.edit', order.id)}
                                                    className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium text-xs"
                                                >
                                                    Update
                                                </Link>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">View Only</span>
                                            )}
                                            <button
                                                onClick={() => setViewingOrder(order)}
                                                className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 font-medium text-xs ml-3"
                                            >
                                                <Eye className="h-3 w-3" />
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredOrders.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                                            {isOffline ? 'No offline job orders found' : 'No job orders found'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* View Modal */}
            {viewingOrder && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{viewingOrder.tracking_code}</h2>
                                <p className="text-sm text-gray-500">{formatDate(viewingOrder.created_at)}</p>
                            </div>
                            <button onClick={() => setViewingOrder(null)} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Customer</h3>
                                <p className="font-medium text-gray-900">{viewingOrder.customer_name}</p>
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Vehicle Details</h3>
                                <p className="font-medium text-gray-900">{viewingOrder.vehicle_details}</p>
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Issue Description</h3>
                                <p className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 leading-relaxed">
                                    {viewingOrder.description}
                                </p>
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Assigned Mechanics</h3>
                                <div className="flex flex-wrap gap-2">
                                    {viewingOrder.sale?.mechanics && viewingOrder.sale.mechanics.length > 0 ? (
                                        viewingOrder.sale.mechanics.map((m: any) => (
                                            <span key={m.id} className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                                                <Wrench className="h-3 w-3" />
                                                {m.name}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-gray-500 text-sm italic">No mechanics assigned</span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Status</h3>
                                <StatusBadge status={viewingOrder.status} />
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end">
                            <button
                                onClick={() => setViewingOrder(null)}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

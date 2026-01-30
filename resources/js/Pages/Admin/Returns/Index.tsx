import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { CheckCircle, XCircle, Clock, Package, Filter } from 'lucide-react';
import { useState } from 'react';

interface SaleReturn {
    id: number;
    quantity: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    processed_at: string | null;
    created_at: string;
    sale: {
        sale_number: string;
        customer_name: string;
        branch: { name: string };
        user: { name: string };
    };
    sale_item: {
        product_name: string;
        product_type: 'product' | 'service';
        category_name: string | null;
        unit_price: number;
    };
    approver?: { name: string };
}

interface Branch {
    id: number;
    name: string;
}

interface Props {
    returns: {
        data: SaleReturn[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    branches: Branch[];
    filters: { status?: string; branch_id?: number };
    userBranchId: number | null;
}

export default function Index({ returns, branches, filters, userBranchId }: Props) {
    const [processing, setProcessing] = useState<number | null>(null);

    const formatPrice = (price: number) => `₱${parseFloat(String(price)).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
    const formatDate = (date: string) => new Date(date).toLocaleString('en-PH', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    const handleApprove = (id: number) => {
        setProcessing(id);
        router.post(route('admin.returns.approve', id), {}, {
            onFinish: () => setProcessing(null),
        });
    };

    const handleReject = (id: number) => {
        setProcessing(id);
        router.post(route('admin.returns.reject', id), {}, {
            onFinish: () => setProcessing(null),
        });
    };

    const filterByStatus = (status: string) => {
        router.get(route('admin.returns.index'), { 
            status: status || undefined,
            branch_id: filters.branch_id 
        }, { preserveState: true });
    };

    const filterByBranch = (branchId: string) => {
        router.get(route('admin.returns.index'), { 
            branch_id: branchId || undefined,
            status: filters.status 
        }, { preserveState: true });
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const config: Record<string, { icon: React.ReactNode; class: string }> = {
            pending: { icon: <Clock className="h-4 w-4" />, class: 'bg-yellow-100 text-yellow-800' },
            approved: { icon: <CheckCircle className="h-4 w-4" />, class: 'bg-green-100 text-green-800' },
            rejected: { icon: <XCircle className="h-4 w-4" />, class: 'bg-red-100 text-red-800' },
        };
        const { icon, class: className } = config[status] || config.pending;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${className}`}>
                {icon}
                {status}
            </span>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Returns Management" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Returns Management</h1>
                            <p className="text-gray-500">Review and process return requests</p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {/* Branch Filter (System Admin Only) */}
                        {!userBranchId && branches.length > 0 && (
                            <select
                                value={filters.branch_id || ''}
                                onChange={(e) => filterByBranch(e.target.value)}
                                className="px-4 py-2 rounded-lg border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500 font-medium"
                            >
                                <option value="">All Branches</option>
                                {branches.map(branch => (
                                    <option key={branch.id} value={branch.id}>
                                        {branch.name}
                                    </option>
                                ))}
                            </select>
                        )}

                        {/* Status Filters */}
                        <button
                            onClick={() => filterByStatus('')}
                            className={`px-4 py-2 rounded-lg font-medium ${!filters.status ? 'bg-indigo-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => filterByStatus('pending')}
                            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${filters.status === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                        >
                            <Clock className="h-4 w-4" />
                            Pending
                        </button>
                        <button
                            onClick={() => filterByStatus('approved')}
                            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${filters.status === 'approved' ? 'bg-green-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                        >
                            <CheckCircle className="h-4 w-4" />
                            Approved
                        </button>
                        <button
                            onClick={() => filterByStatus('rejected')}
                            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${filters.status === 'rejected' ? 'bg-red-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                        >
                            <XCircle className="h-4 w-4" />
                            Rejected
                        </button>
                    </div>

                    {/* Returns List */}
                    <div className="space-y-4">
                        {returns.data.map(ret => (
                            <div key={ret.id} className="bg-white rounded-xl shadow-sm p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                            <Package className="h-6 w-6 text-orange-600" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-gray-900">{ret.sale_item.product_name}</h3>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ret.sale_item.product_type === 'product' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                                    {ret.sale_item.product_type === 'product' ? 'Product' : 'Service'}
                                                </span>
                                                {ret.sale_item.category_name && (
                                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                                        {ret.sale_item.category_name}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                Sale: <span className="font-mono text-indigo-600">{ret.sale.sale_number}</span>
                                                {' · '}{ret.sale.customer_name}
                                                {' · '}<span className="font-medium">{ret.sale.branch.name}</span>
                                            </p>
                                            <div className="mt-2 flex items-center gap-4 text-sm">
                                                <span className="font-medium">Qty: {ret.quantity}</span>
                                                <span className="text-gray-500">Value: {formatPrice(ret.sale_item.unit_price * ret.quantity)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <StatusBadge status={ret.status} />
                                </div>

                                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-700"><strong>Reason:</strong> {ret.reason}</p>
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                    <div className="text-sm text-gray-500">
                                        Requested: {formatDate(ret.created_at)}
                                        {ret.processed_at && ` · Processed: ${formatDate(ret.processed_at)}`}
                                        {ret.approver && ` by ${ret.approver.name}`}
                                    </div>

                                    {ret.status === 'pending' && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleReject(ret.id)}
                                                disabled={processing === ret.id}
                                                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium disabled:opacity-50"
                                            >
                                                Reject
                                            </button>
                                            <button
                                                onClick={() => handleApprove(ret.id)}
                                                disabled={processing === ret.id}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
                                            >
                                                Approve
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {returns.data.length === 0 && (
                            <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
                                <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
                                <p>No return requests found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

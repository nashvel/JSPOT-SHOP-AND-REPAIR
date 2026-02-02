import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Search, Eye, Filter, RefreshCw, Banknote, Smartphone, CreditCard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useOfflineSales } from '@/lib/useOfflineSales';
import { useOfflineData } from '@/lib/useOfflineData';
import ViewSaleModal from './Components/ViewSaleModal';

interface SaleItem {
    id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
    total: number;
}

interface Sale {
    id: number;
    sale_number: string;
    customer_name: string;
    plate_number: string;
    total: number;
    payment_method: 'cash' | 'gcash' | 'maya';
    status: 'completed' | 'returned' | 'partial_return';
    created_at: string;
    user: { name: string };
    branch: { name: string };
    items: SaleItem[];
}

interface Props {
    sales: {
        data: Sale[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    branches: { id: number; name: string }[];
    filters: {
        search?: string;
        status?: string;
        payment_method?: string;
        start_date?: string;
        end_date?: string;
        branch_id?: number;
    };
    userBranchId: number | null;
}

export default function Index({ sales, branches, filters, userBranchId }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [branchId, setBranchId] = useState(filters.branch_id || '');
    // Offline Hooks
    const effectiveBranchId = userBranchId || (branchId ? Number(branchId) : 0);
    const { isOffline } = useOfflineData({ branchId: effectiveBranchId });
    const { offlineSales } = useOfflineSales(effectiveBranchId);
    const [viewSaleModal, setViewSaleModal] = useState<{ show: boolean; sale: any | null }>({ show: false, sale: null });

    // Filter logic for display
    const displaySales = isOffline ? offlineSales.filter(s => {
        const matchesSearch = search ? (
            s.saleNumber.toLowerCase().includes(search.toLowerCase()) ||
            (s.customerName && s.customerName.toLowerCase().includes(search.toLowerCase()))
        ) : true;
        // Basic search filter for offline, can extend for date/payment method if needed
        return matchesSearch;
    }) : sales.data;

    // Auto-search with debounce
    // Auto-search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(route('admin.sales.index'), {
                search,
                start_date: startDate,
                end_date: endDate,
                branch_id: branchId || undefined
            }, {
                preserveState: true,
                preserveScroll: true,
                replace: true
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [search, startDate, endDate, branchId]);

    const formatPrice = (price: number) => `₱${parseFloat(String(price)).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
    const formatDate = (date: string) => new Date(date).toLocaleString('en-PH', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    const PaymentIcon = ({ method }: { method: string }) => {
        switch (method) {
            case 'cash': return <Banknote className="h-4 w-4 text-green-600" />;
            case 'gcash': return <Smartphone className="h-4 w-4 text-blue-600" />;
            case 'maya': return <CreditCard className="h-4 w-4 text-emerald-600" />;
            default: return null;
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const styles: Record<string, string> = {
            completed: 'bg-green-100 text-green-800',
            returned: 'bg-red-100 text-red-800',
            partial_return: 'bg-yellow-100 text-yellow-800',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
                {status.replace('_', ' ')}
            </span>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Sales Records" />

            <div className="py-8">
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                Sales Records
                                {isOffline && (
                                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-gray-600 text-white">
                                        OFFLINE MODE
                                    </span>
                                )}
                            </h1>
                            <p className="text-gray-500">View and manage all completed sales</p>
                        </div>
                        <div className="flex gap-2">
                            {/* Optional: Add actionable buttons here if needed in future (e.g. Export) */}
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by sale number, customer name, or plate..."
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4">
                                {!userBranchId && (
                                    <div className="flex-1">
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
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={e => setStartDate(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={e => setEndDate(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sales Table */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sale #</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plate</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {(isOffline ? displaySales : sales.data).map(sale => (
                                    <tr key={sale.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <span className="font-mono font-medium text-indigo-600">
                                                {(sale as any).sale_number || (sale as any).saleNumber}
                                            </span>
                                            {isOffline && !(sale as any).synced && (
                                                <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-amber-100 text-amber-700 rounded-full">
                                                    Unsynced
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{(sale as any).customer_name || (sale as any).customerName || 'Walk-in'}</div>
                                            <div className="text-sm text-gray-500">{(sale as any).user?.name || (sale as any).mechanicName || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-gray-700">{(sale as any).plate_number || '-'}</td>
                                        <td className="px-6 py-4 font-bold text-gray-900">{formatPrice(sale.total)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <PaymentIcon method={(sale as any).payment_method || (sale as any).paymentMethod} />
                                                <span className="capitalize">{(sale as any).payment_method || (sale as any).paymentMethod}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={sale.status} />
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{formatDate((sale as any).created_at || (sale as any).createdAt)}</td>
                                        <td className="px-6 py-4 text-right">
                                            {!isOffline ? (
                                                <Link
                                                    href={route('admin.sales.show', sale.id)}
                                                    className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    View
                                                </Link>
                                            ) : (
                                                <button
                                                    onClick={() => setViewSaleModal({ show: true, sale })}
                                                    className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    View
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {(isOffline ? displaySales.length === 0 : sales.data.length === 0) && (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                            {isOffline ? 'No offline sales found' : 'No sales records found'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {sales.last_page > 1 && (
                            <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
                                <span className="text-sm text-gray-500">
                                    Page {sales.current_page} of {sales.last_page}
                                </span>
                                <div className="flex gap-2">
                                    {sales.links.map((link, i) => (
                                        <Link
                                            key={i}
                                            href={link.url || '#'}
                                            className={`px-3 py-1 rounded text-sm ${link.active
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-white border hover:bg-gray-100'
                                                } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Offline View Modal */}
            <ViewSaleModal
                show={viewSaleModal.show}
                onClose={() => setViewSaleModal({ show: false, sale: null })}
                sale={viewSaleModal.sale}
            />
        </AuthenticatedLayout>
    );
}

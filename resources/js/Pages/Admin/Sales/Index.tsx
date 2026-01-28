import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Search, Eye, Filter, RefreshCw, Banknote, Smartphone, CreditCard } from 'lucide-react';
import { useState } from 'react';

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
    filters: {
        search?: string;
        status?: string;
        payment_method?: string;
    };
}

export default function Index({ sales, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.sales.index'), { search }, { preserveState: true });
    };

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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Sales Records</h1>
                            <p className="text-gray-500">View and manage all completed sales</p>
                        </div>
                        <Link
                            href={route('admin.pos.index')}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                        >
                            New Sale
                        </Link>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                        <form onSubmit={handleSearch} className="flex gap-4">
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
                            <button type="submit" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">
                                Search
                            </button>
                        </form>
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
                                {sales.data.map(sale => (
                                    <tr key={sale.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <span className="font-mono font-medium text-indigo-600">{sale.sale_number}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{sale.customer_name}</div>
                                            <div className="text-sm text-gray-500">{sale.user?.name}</div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-gray-700">{sale.plate_number}</td>
                                        <td className="px-6 py-4 font-bold text-gray-900">{formatPrice(sale.total)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <PaymentIcon method={sale.payment_method} />
                                                <span className="capitalize">{sale.payment_method}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={sale.status} />
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{formatDate(sale.created_at)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={route('admin.sales.show', sale.id)}
                                                className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium"
                                            >
                                                <Eye className="h-4 w-4" />
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {sales.data.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                            No sales records found
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
        </AuthenticatedLayout>
    );
}

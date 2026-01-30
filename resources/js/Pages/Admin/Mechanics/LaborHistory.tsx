import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, DollarSign, Wrench, Package, User } from 'lucide-react';

interface Branch {
    id: number;
    name: string;
}

interface Mechanic {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    specialization: string | null;
    total_labor_earned: number;
    branch: Branch;
}

interface Sale {
    id: number;
    receipt_number: string;
    total_amount: number;
    created_at: string;
}

interface JobOrderPart {
    id: number;
    product_name: string;
    quantity: number;
    price: number;
}

interface JobOrder {
    id: number;
    job_number: string;
    customer_name: string;
    vehicle_model: string;
    vehicle_plate: string;
    labor_cost: number;
    parts_cost: number;
    total_cost: number;
    status: string;
    created_at: string;
    completed_at: string | null;
    sale: Sale | null;
    parts: JobOrderPart[];
}

interface Props {
    mechanic: Mechanic;
    jobOrders: {
        data: JobOrder[];
        links: any[];
        current_page: number;
        last_page: number;
    };
}

export default function LaborHistory({ mechanic, jobOrders }: Props) {
    const formatPrice = (price: number) => `₱${parseFloat(String(price)).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
    
    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'in-progress':
                return 'bg-blue-100 text-blue-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Labor History - ${mechanic.name}`} />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <Link
                            href={route('admin.mechanics.index')}
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Mechanics
                        </Link>
                        
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
                                        <User className="h-8 w-8 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900">{mechanic.name}</h1>
                                        <p className="text-gray-500">{mechanic.specialization || 'General Mechanic'}</p>
                                        <p className="text-sm text-gray-400">{mechanic.branch.name}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Total Labor Earned</p>
                                    <p className="text-3xl font-bold text-green-600">{formatPrice(mechanic.total_labor_earned)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Job Orders List */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b bg-gray-50">
                            <h2 className="text-lg font-semibold text-gray-900">Job Order History</h2>
                            <p className="text-sm text-gray-500">Complete list of jobs assigned to this mechanic</p>
                        </div>

                        <div className="divide-y divide-gray-200">
                            {jobOrders.data.length > 0 ? (
                                jobOrders.data.map((job) => (
                                    <div key={job.id} className="p-6 hover:bg-gray-50 transition">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {job.job_number}
                                                    </h3>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                                                        {job.status.replace('-', ' ').toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-gray-500">Customer</p>
                                                        <p className="font-medium text-gray-900">{job.customer_name}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500">Vehicle</p>
                                                        <p className="font-medium text-gray-900">
                                                            {job.vehicle_model} ({job.vehicle_plate})
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right ml-6">
                                                <div className="flex items-center gap-2 text-green-600 mb-1">
                                                    <DollarSign className="h-4 w-4" />
                                                    <span className="text-xl font-bold">{formatPrice(job.labor_cost)}</span>
                                                </div>
                                                <p className="text-xs text-gray-500">Labor Cost</p>
                                            </div>
                                        </div>

                                        {/* Parts Used */}
                                        {job.parts.length > 0 && (
                                            <div className="mb-3">
                                                <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                                    <Package className="h-4 w-4" />
                                                    Parts Used
                                                </p>
                                                <div className="bg-gray-50 rounded-lg p-3">
                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                                                        {job.parts.map((part) => (
                                                            <div key={part.id} className="flex justify-between">
                                                                <span className="text-gray-600">
                                                                    {part.product_name} x{part.quantity}
                                                                </span>
                                                                <span className="font-medium text-gray-900">
                                                                    {formatPrice(part.price * part.quantity)}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between text-sm">
                                                        <span className="text-gray-600">Parts Total</span>
                                                        <span className="font-semibold text-gray-900">{formatPrice(job.parts_cost)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Footer */}
                                        <div className="flex items-center justify-between text-sm pt-3 border-t">
                                            <div className="flex items-center gap-4 text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>{formatDate(job.created_at)}</span>
                                                </div>
                                                {job.sale && (
                                                    <Link
                                                        href={route('admin.sales.show', job.sale.id)}
                                                        className="text-indigo-600 hover:text-indigo-800 font-medium"
                                                    >
                                                        Receipt #{job.sale.receipt_number}
                                                    </Link>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-gray-500">Total Job Cost</p>
                                                <p className="text-lg font-bold text-gray-900">{formatPrice(job.total_cost)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center text-gray-500">
                                    <Wrench className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                    <p>No job orders found for this mechanic</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {jobOrders.last_page > 1 && (
                            <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
                                <span className="text-sm text-gray-500">
                                    Page {jobOrders.current_page} of {jobOrders.last_page}
                                </span>
                                <div className="flex gap-2">
                                    {jobOrders.links.map((link, i) => (
                                        <Link
                                            key={i}
                                            href={link.url || '#'}
                                            className={`px-3 py-1 rounded text-sm ${
                                                link.active
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

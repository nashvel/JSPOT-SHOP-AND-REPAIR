import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import { Search, Eye, Pencil, CalendarClock, Clock, CheckCircle, XCircle, AlertCircle, Plus, Wrench, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import Modal from '@/Components/Modal';
import { useOfflineReservations } from '@/lib/useOfflineReservations';
import { useOfflineData } from '@/lib/useOfflineData';

interface ReservationItem {
    id: number;
    product_name: string;
    product_type: 'product' | 'service';
    category_name: string | null;
    quantity: number;
    unit_price: number;
    total: number;
}

interface Mechanic {
    id: number;
    name: string;
}

interface Reservation {
    id: number;
    reservation_number: string;
    customer_name: string;
    customer_contact: string | null;
    vehicle_engine: string | null;
    vehicle_chassis: string | null;
    vehicle_plate: string | null;
    reservation_date: string;
    issue_description: string | null;
    notes: string | null;
    status: 'pending' | 'available' | 'in_progress' | 'completed' | 'cancelled';
    sale_id: number | null;
    created_at: string;
    branch?: { name: string };
    mechanics: Mechanic[];
    items: ReservationItem[];
}

interface Props {
    reservations: {
        data: Reservation[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    branches: { id: number; name: string }[];
    mechanics: Mechanic[];
    products: any[];
    filters: {
        search?: string;
        status?: string;
        branch_id?: number;
    };
    userBranchId: number | null;
}

export default function Index({ reservations, branches, mechanics, products, filters, userBranchId }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [branchId, setBranchId] = useState(filters.branch_id?.toString() || '');
    const [statusModal, setStatusModal] = useState<{ show: boolean; reservation: Reservation | null }>({ show: false, reservation: null });

    // Offline Hooks
    const effectiveBranchId = userBranchId || (branchId ? Number(branchId) : 0);
    const { isOffline } = useOfflineData({ branchId: effectiveBranchId });
    const { offlineReservations, updateStatus: updateOfflineStatus } = useOfflineReservations(effectiveBranchId);

    // Determine which reservations to display
    // If offline, filter local reservations based on search/status
    const displayReservations = isOffline ? offlineReservations.filter(r => {
        const matchesSearch = search ? (
            r.reservationNumber.toLowerCase().includes(search.toLowerCase()) ||
            r.customerName.toLowerCase().includes(search.toLowerCase())
        ) : true;
        const matchesStatus = statusFilter ? r.status === statusFilter : true;
        return matchesSearch && matchesStatus;
    }) : reservations.data;


    const formatPrice = (price: number) => `₱${Number(price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
    const formatDate = (date: string) => new Date(date).toLocaleDateString('en-PH', {
        month: 'short', day: 'numeric', year: 'numeric'
    });

    const handleSearch = () => {
        router.get(route('admin.reservations.index'), {
            search, status: statusFilter, branch_id: branchId
        }, { preserveState: true, replace: true });
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const styles: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            available: 'bg-emerald-100 text-emerald-800',
            in_progress: 'bg-blue-100 text-blue-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        const icons: Record<string, any> = {
            pending: Clock,
            available: CheckCircle,
            in_progress: AlertCircle,
            completed: CheckCircle,
            cancelled: XCircle,
        };
        const Icon = icons[status] || Clock;
        const labels: Record<string, string> = {
            pending: 'Pending',
            available: 'Parts Available',
            in_progress: 'In Progress',
            completed: 'Completed',
            cancelled: 'Cancelled',
        };
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                <Icon className="h-3 w-3" />
                {labels[status] || status}
            </span>
        );
    };

    const handleStatusChange = async (reservation: any, newStatus: string) => {
        if (newStatus === 'completed' && !confirm('Complete this reservation? This will create a sale record.')) return;

        if (isOffline) {
            await updateOfflineStatus(reservation.id, newStatus as any);
            setStatusModal({ show: false, reservation: null });
            // Optionally show a toast
        } else {
            router.patch(route('admin.reservations.update-status', reservation.id), { status: newStatus }, {
                preserveState: true,
            });
        }
    };

    const getTotal = (items: any[]) => items.reduce((sum, item) => sum + Number(item.total), 0);

    return (
        <AuthenticatedLayout>
            <Head title="Reservations" />

            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 rounded-lg">
                                    <CalendarClock className="h-6 w-6 text-indigo-600" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                        Reservations
                                        {isOffline && (
                                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-gray-600 text-white">
                                                OFFLINE MODE
                                            </span>
                                        )}
                                    </h1>
                                    <p className="text-sm text-gray-500">Manage service reservations</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        className="pl-10 pr-4 py-2 border rounded-lg text-sm w-48"
                                    />
                                </div>

                                {/* Status Filter */}
                                <select
                                    value={statusFilter}
                                    onChange={(e) => { setStatusFilter(e.target.value); handleSearch(); }}
                                    className="rounded-lg border-gray-300 text-sm"
                                >
                                    <option value="">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>

                                {/* Branch Filter */}
                                {!userBranchId && (
                                    <select
                                        value={branchId}
                                        onChange={(e) => { setBranchId(e.target.value); handleSearch(); }}
                                        className="rounded-lg border-gray-300 text-sm"
                                    >
                                        <option value="">All Branches</option>
                                        {branches.map((branch) => (
                                            <option key={branch.id} value={branch.id}>{branch.name}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reservation #</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mechanics</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {isOffline && displayReservations.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                            No offline reservations found
                                        </td>
                                    </tr>
                                ) : !isOffline && reservations.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                            No reservations found
                                        </td>
                                    </tr>
                                ) : (
                                    (isOffline ? displayReservations : reservations.data).map((reservation) => (
                                        <tr key={reservation.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="font-mono text-sm font-medium text-indigo-600">
                                                    {(reservation as any).reservation_number || (reservation as any).reservationNumber}
                                                </span>
                                                {isOffline && !(reservation as any).synced && (
                                                    <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-amber-100 text-amber-700 rounded-full">
                                                        Unsynced
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{(reservation as any).customer_name || (reservation as any).customerName}</div>
                                                    {(reservation as any).vehicle_plate || (reservation as any).vehiclePlate ? (
                                                        <div className="text-xs text-gray-500">{(reservation as any).vehicle_plate || (reservation as any).vehiclePlate}</div>
                                                    ) : null}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate((reservation as any).reservation_date || (reservation as any).reservationDate)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1">
                                                    <Users className="h-4 w-4 text-gray-400" />
                                                    <span className="text-sm text-gray-600">
                                                        {(reservation as any).mechanics?.length > 0
                                                            ? (reservation as any).mechanics.map((m: any) => m.name).join(', ')
                                                            : (reservation as any).mechanicIds?.length > 0 ? `${(reservation as any).mechanicIds.length} Assigned` : 'None assigned'
                                                        }
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {reservation.items.length} items
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                {formatPrice(getTotal(reservation.items))}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <StatusBadge status={reservation.status} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {!isOffline && (
                                                        <Link
                                                            href={route('admin.reservations.show', reservation.id)}
                                                            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                            title="View"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    )}
                                                    {reservation.status !== 'completed' && (
                                                        <button
                                                            onClick={() => setStatusModal({ show: true, reservation: reservation as any })}
                                                            className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                            title="Update Status"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {reservations.last_page > 1 && (
                        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                                Page {reservations.current_page} of {reservations.last_page}
                            </div>
                            <div className="flex gap-2">
                                {reservations.links.map((link: any, i: number) => (
                                    <button
                                        key={i}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                        disabled={!link.url}
                                        className={`px-3 py-1 rounded text-sm ${link.active
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Status Update Modal */}
            <Modal show={statusModal.show} onClose={() => setStatusModal({ show: false, reservation: null })} maxWidth="sm">
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        Update Status
                    </h2>
                    {statusModal.reservation && (
                        <div className="space-y-3">
                            <p className="text-sm text-gray-500 mb-4">
                                Update status for Reservation <span className="font-bold">{statusModal.reservation.reservation_number}</span>
                            </p>

                            <button
                                onClick={() => { handleStatusChange(statusModal.reservation!, 'pending'); setStatusModal({ show: false, reservation: null }); }}
                                className={`w-full flex items-center p-3 rounded-lg border ${statusModal.reservation.status === 'pending' ? 'border-yellow-500 bg-yellow-50 text-yellow-700 font-bold' : 'border-gray-200 hover:bg-gray-50 text-gray-700'}`}
                            >
                                <Clock className="w-5 h-5 mr-3" />
                                Pending
                            </button>

                            <button
                                onClick={() => { handleStatusChange(statusModal.reservation!, 'available'); setStatusModal({ show: false, reservation: null }); }}
                                className={`w-full flex items-center p-3 rounded-lg border ${statusModal.reservation.status === 'available' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold' : 'border-gray-200 hover:bg-gray-50 text-gray-700'}`}
                            >
                                <CheckCircle className="w-5 h-5 mr-3" />
                                Parts Available
                            </button>

                            <button
                                onClick={() => { handleStatusChange(statusModal.reservation!, 'in_progress'); setStatusModal({ show: false, reservation: null }); }}
                                className={`w-full flex items-center p-3 rounded-lg border ${statusModal.reservation.status === 'in_progress' ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold' : 'border-gray-200 hover:bg-gray-50 text-gray-700'}`}
                            >
                                <AlertCircle className="w-5 h-5 mr-3" />
                                In Progress
                            </button>

                            <div className="border-t border-gray-100 my-2 pt-2"></div>

                            <button
                                onClick={() => { handleStatusChange(statusModal.reservation!, 'completed'); setStatusModal({ show: false, reservation: null }); }}
                                className="w-full flex items-center p-3 rounded-lg border border-gray-200 hover:bg-green-50 hover:border-green-300 text-green-700"
                            >
                                <CheckCircle className="w-5 h-5 mr-3" />
                                Custom Completion
                            </button>

                            <button
                                onClick={() => { handleStatusChange(statusModal.reservation!, 'cancelled'); setStatusModal({ show: false, reservation: null }); }}
                                className="w-full flex items-center p-3 rounded-lg border border-gray-200 hover:bg-red-50 hover:border-red-300 text-red-700"
                            >
                                <XCircle className="w-5 h-5 mr-3" />
                                Cancel Reservation
                            </button>
                        </div>
                    )}
                </div>
            </Modal>

            {/* View Modal Removed */}
        </AuthenticatedLayout>
    );
}

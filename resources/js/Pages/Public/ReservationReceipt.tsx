import { Head } from '@inertiajs/react';
import { Clock, CheckCircle, XCircle, AlertCircle, Package, Wrench, Phone, Car, Calendar, MapPin } from 'lucide-react';

interface ReservationItem {
    id: number;
    product_name: string;
    product_type: 'product' | 'service';
    quantity: number;
    unit_price: number;
    total: number;
    payment_method: string | null;
}

interface Reservation {
    id: number;
    reservation_number: string;
    customer_name: string;
    customer_contact: string | null;
    vehicle_plate: string | null;
    issue_description: string | null;
    reservation_date: string;
    status: 'pending' | 'available' | 'in_progress' | 'completed' | 'cancelled';
    created_at: string;
    branch: { name: string; address?: string };
    items: ReservationItem[];
    mechanics: { name: string }[];
}

interface Props {
    reservation: Reservation;
}

export default function ReservationReceipt({ reservation }: Props) {
    const formatPrice = (price: number) => `₱${parseFloat(String(price)).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
    const formatDate = (date: string) => new Date(date).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
    const total = reservation.items.reduce((sum, item) => sum + Number(item.total), 0);

    const statusConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
        pending: { label: 'Pending', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
        available: { label: 'Parts Available', icon: Package, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
        in_progress: { label: 'In Progress', icon: Wrench, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
        completed: { label: 'Completed', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
        cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
    };

    const currentStatus = statusConfig[reservation.status] || statusConfig.pending;
    const StatusIcon = currentStatus.icon;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <Head title={`Reservation ${reservation.reservation_number}`} />

            <div className="max-w-lg mx-auto py-8 px-4">
                {/* Header Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
                    <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-8 text-white text-center">
                        <h1 className="text-2xl font-bold mb-1">JSPOT SHOP</h1>
                        <p className="text-indigo-200 text-sm">Shop & Repair</p>
                    </div>

                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider">Reservation #</p>
                                <p className="font-bold text-gray-900">{reservation.reservation_number}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500 uppercase tracking-wider">Date</p>
                                <p className="text-sm text-gray-700">{formatDate(reservation.created_at)}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span>{reservation.branch.name}</span>
                        </div>
                    </div>
                </div>

                {/* Status Card */}
                <div className={`rounded-2xl border-2 p-6 mb-4 ${currentStatus.bg}`}>
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full bg-white shadow-sm ${currentStatus.color}`}>
                            <StatusIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Current Status</p>
                            <p className={`text-xl font-bold ${currentStatus.color}`}>{currentStatus.label}</p>
                        </div>
                    </div>
                    {reservation.status === 'available' && (
                        <p className="mt-3 text-sm text-emerald-700 bg-white/50 rounded-lg p-3">
                            🎉 Your reserved items are now available! Please visit the shop to complete your transaction.
                        </p>
                    )}
                    {reservation.status === 'in_progress' && (
                        <p className="mt-3 text-sm text-blue-700 bg-white/50 rounded-lg p-3">
                            🔧 Our mechanics are currently working on your vehicle.
                        </p>
                    )}
                    {reservation.status === 'completed' && (
                        <p className="mt-3 text-sm text-green-700 bg-white/50 rounded-lg p-3">
                            ✅ Your reservation has been completed. Thank you for choosing JSPOT!
                        </p>
                    )}
                </div>

                {/* Customer Info */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Customer Details</h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <span className="text-gray-600 font-bold text-sm">{reservation.customer_name.charAt(0).toUpperCase()}</span>
                            </div>
                            <span className="font-medium text-gray-900">{reservation.customer_name}</span>
                        </div>
                        {reservation.customer_contact && (
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span>{reservation.customer_contact}</span>
                            </div>
                        )}
                        {reservation.vehicle_plate && (
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Car className="h-4 w-4 text-gray-400" />
                                <span>{reservation.vehicle_plate}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Items */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Reserved Items</h3>
                    <div className="space-y-3">
                        {reservation.items.map(item => (
                            <div key={item.id} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        {item.product_type === 'product' ? (
                                            <Package className="h-3.5 w-3.5 text-blue-500" />
                                        ) : (
                                            <Wrench className="h-3.5 w-3.5 text-green-500" />
                                        )}
                                        <span className="font-medium text-gray-900 text-sm">{item.product_name}</span>
                                    </div>
                                    <span className="text-xs text-gray-500">Qty: {item.quantity} × {formatPrice(item.unit_price)}</span>
                                </div>
                                <span className="font-bold text-gray-900">{formatPrice(item.total)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between items-center pt-4 mt-4 border-t-2 border-gray-200">
                        <span className="font-bold text-gray-900">Estimated Total</span>
                        <span className="text-xl font-bold text-indigo-600">{formatPrice(total)}</span>
                    </div>
                </div>

                {/* Mechanics */}
                {reservation.mechanics.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Assigned Mechanics</h3>
                        <div className="flex flex-wrap gap-2">
                            {reservation.mechanics.map((m, i) => (
                                <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                                    {m.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="text-center text-xs text-gray-400 mt-6">
                    <p>This is a reservation status page.</p>
                    <p className="mt-1">For inquiries, please contact the shop directly.</p>
                </div>
            </div>
        </div>
    );
}

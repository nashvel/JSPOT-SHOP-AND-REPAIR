import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { ArrowLeft, Printer, ShoppingCart, Banknote, Smartphone, CreditCard, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import MiniPosModal from '../Sales/Components/MiniPosModal';

interface Transaction {
    reference_number: string | null;
    quantity: number;
    amount: number;
}

interface ReservationItem {
    id: number;
    product_id: number | null;
    product_name: string;
    product_type: 'product' | 'service';
    category_name: string | null;
    quantity: number;
    unit_price: number;
    total: number;
    payment_method: string | null;
    reference_number: string | null;
    transactions: Transaction[] | null;
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
    status: string;
    created_at: string;
    branch: { name: string };
    branch_id: number;
    items: ReservationItem[];
    mechanics: Mechanic[];
    sale_id?: number | null;
    payment_method: string | null;
    amount_paid: number;
    change: number;
    reference_number: string | null;
}

interface Props {
    reservation: Reservation;
    posData?: {
        products: any[];
        services: any[];
        categories: any[];
        mechanics: any[];
    };
}

export default function Show({ reservation, posData }: Props) {
    const [showPosModal, setShowPosModal] = useState(false);
    const [showMechanicModal, setShowMechanicModal] = useState(false);
    const [selectedMechanics, setSelectedMechanics] = useState<number[]>(reservation.mechanics.map(m => m.id));
    const [status, setStatus] = useState(reservation.status);
    const [showTransactions, setShowTransactions] = useState(true);

    const formatPrice = (price: number) => `₱${parseFloat(String(price)).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
    const formatDate = (date: string) => new Date(date).toLocaleString('en-PH');

    const PaymentIcon = ({ method }: { method: string | null }) => {
        switch (method) {
            case 'cash': return <Banknote className="h-5 w-5 text-green-600" />;
            case 'gcash': return <Smartphone className="h-5 w-5 text-blue-600" />;
            case 'maya': return <CreditCard className="h-5 w-5 text-emerald-600" />;
            default: return null;
        }
    };

    // Calculate totals
    const subtotal = reservation.items.reduce((sum, item) => sum + Number(item.total), 0);
    const total = subtotal; // Assuming no tax/discount yet

    const handlePrintTicket = () => {
        // Open print ticket route in new tab
        window.open(route('admin.reservations.ticket', reservation.id), '_blank');
    };

    const handleStatusChange = (newStatus: string) => {
        if (newStatus === 'completed' && !confirm('Complete this reservation? This will create a sale record.')) return;
        router.patch(route('admin.reservations.update-status', reservation.id), { status: newStatus }, {
            preserveState: true,
            onSuccess: () => setStatus(newStatus)
        });
    };

    const handleMechanicsUpdate = () => {
        router.patch(route('admin.reservations.update-mechanics', reservation.id), {
            mechanic_ids: selectedMechanics
        }, {
            preserveState: true,
            onSuccess: () => setShowMechanicModal(false)
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Reservation ${reservation.reservation_number}`} />

            <div className="py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <Link href={route('admin.reservations.index')} className="p-2 hover:bg-gray-100 rounded-lg">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{reservation.reservation_number}</h1>
                                <p className="text-gray-500">{formatDate(reservation.created_at)}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {reservation.status !== 'completed' && reservation.status !== 'cancelled' && (
                                <>
                                    <select
                                        value={status}
                                        onChange={(e) => handleStatusChange(e.target.value)}
                                        className="rounded-lg border-gray-300 text-sm py-2 px-3"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Complete & Create Sale</option>
                                        <option value="cancelled">Cancel</option>
                                    </select>
                                    {posData && (
                                        <button
                                            onClick={() => setShowPosModal(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Add Items
                                        </button>
                                    )}
                                </>
                            )}
                            <a
                                href={route('admin.reservations.ticket', reservation.id)}
                                target="_blank"
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                            >
                                <Printer className="h-4 w-4" />
                                Print Ticket
                            </a>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Receipt */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Customer & Vehicle Info */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Customer & Vehicle Details</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">Customer Name</span>
                                        <p className="font-medium">{reservation.customer_name}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Contact Number</span>
                                        <p className="font-medium">{reservation.customer_contact || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Engine Number</span>
                                        <p className="font-mono">{reservation.vehicle_engine || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Chassis Number</span>
                                        <p className="font-mono">{reservation.vehicle_chassis || 'N/A'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-gray-500">Plate Number</span>
                                        <p className="font-mono text-lg font-bold">{reservation.vehicle_plate || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Issue Description */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h3 className="font-semibold text-gray-900 mb-2">Issue Description</h3>
                                <p className="text-gray-600">{reservation.issue_description || 'No description provided.'}</p>
                            </div>

                            {/* Items */}
                            <div className="bg-white rounded-xl shadow-sm overflow-hidden overflow-x-auto">
                                <div className="p-4 border-b">
                                    <h3 className="font-semibold text-gray-900">Items / Services</h3>
                                </div>
                                <table className="min-w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Item</th>
                                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Payment</th>
                                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Qty</th>
                                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {reservation.items.map(item => (
                                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-gray-900">{item.product_name}</span>
                                                        <span className="text-xs text-gray-500">{item.category_name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.product_type === 'product' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                                        {item.product_type === 'product' ? 'Product' : 'Service'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className={`px-2 py-1 text-xs font-bold rounded uppercase ${item.payment_method === 'gcash' ? 'bg-blue-100 text-blue-700' : item.payment_method === 'maya' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                                        {item.payment_method || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    {item.quantity}
                                                </td>
                                                <td className="px-4 py-3 text-right">{formatPrice(item.unit_price)}</td>
                                                <td className="px-4 py-3 text-right font-medium">{formatPrice(item.total)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Payment Summary */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Payment Summary</h3>

                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-4">
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full capitalize ${status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                        status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                            status === 'completed' ? 'bg-green-100 text-green-700' :
                                                'bg-red-100 text-red-700'
                                        }`}>
                                        {status.replace('_', ' ')}
                                    </span>
                                    <span className="text-sm text-gray-500 ml-auto">
                                        {reservation.branch.name}
                                    </span>
                                </div>

                                {reservation.payment_method && (
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-4">
                                        <PaymentIcon method={reservation.payment_method} />
                                        <span className="font-medium capitalize">{reservation.payment_method}</span>
                                        {reservation.reference_number && (
                                            <span className="text-sm text-gray-500 ml-auto">Ref: {reservation.reference_number}</span>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Subtotal</span>
                                        <span>{formatPrice(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between border-t pt-2 text-lg font-bold">
                                        <span>Total</span>
                                        <span className="text-indigo-600">{formatPrice(total)}</span>
                                    </div>
                                    {reservation.amount_paid > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Paid</span>
                                            <span>{formatPrice(reservation.amount_paid)}</span>
                                        </div>
                                    )}
                                    {reservation.change > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Change</span>
                                            <span>{formatPrice(reservation.change)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Payment Transactions - Expandable */}
                            {(reservation.items.some(i => i.payment_method === 'gcash' || i.payment_method === 'maya')) && (
                                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                                    <button
                                        onClick={() => setShowTransactions(!showTransactions)}
                                        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                    >
                                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                            <Smartphone className="h-4 w-4 text-indigo-500" />
                                            Payment Transactions
                                        </h3>
                                        {showTransactions ? (
                                            <ChevronUp className="h-5 w-5 text-gray-400" />
                                        ) : (
                                            <ChevronDown className="h-5 w-5 text-gray-400" />
                                        )}
                                    </button>

                                    {showTransactions && (
                                        <div className="border-t border-gray-100 p-4 space-y-3 bg-gray-50/50">
                                            {/* Group items by payment_method + reference_number */}
                                            {Object.entries(
                                                reservation.items
                                                    .filter(i => i.payment_method === 'gcash' || i.payment_method === 'maya')
                                                    .reduce((acc: { [key: string]: ReservationItem[] }, item) => {
                                                        const key = `${item.payment_method}-${item.reference_number || 'no-ref'}`;
                                                        if (!acc[key]) acc[key] = [];
                                                        acc[key].push(item);
                                                        return acc;
                                                    }, {})
                                            ).map(([key, items]) => {
                                                const [method, ...refParts] = key.split('-');
                                                const refNumber = refParts.join('-') === 'no-ref' ? null : refParts.join('-');
                                                const totalAmount = items.reduce((sum, i) => sum + Number(i.total), 0);

                                                return (
                                                    <div key={key} className="bg-white rounded-lg p-3 border border-gray-200">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className={`px-2 py-0.5 text-xs font-bold rounded uppercase ${method === 'gcash' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                                                {method}
                                                            </span>
                                                            <span className="text-sm font-bold text-gray-900">
                                                                {formatPrice(totalAmount)}
                                                            </span>
                                                        </div>
                                                        {refNumber && (
                                                            <p className="text-xs text-gray-500 font-mono mb-2">
                                                                Ref: {refNumber}
                                                            </p>
                                                        )}
                                                        <div className="space-y-1">
                                                            {items.map(item => (
                                                                <div key={item.id} className="flex justify-between text-xs text-gray-600">
                                                                    <span className="truncate max-w-[120px]">{item.product_name}</span>
                                                                    <span className="text-gray-400 mx-1">×{item.quantity}</span>
                                                                    <span className="font-medium">{formatPrice(item.total)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-semibold text-gray-900">Assigned Mechanics</h3>
                                    {reservation.status !== 'completed' && reservation.status !== 'cancelled' && (
                                        <button
                                            onClick={() => setShowMechanicModal(true)}
                                            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                                        >
                                            Edit
                                        </button>
                                    )}
                                </div>

                                {reservation.mechanics.length > 0 ? (
                                    <div className="space-y-2">
                                        {reservation.mechanics.map(m => (
                                            <div key={m.id} className="flex items-center gap-2 text-sm text-gray-700">
                                                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                                {m.name}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 italic">No mechanics assigned</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mechanics Modal */}
            {showMechanicModal && posData && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
                        <h3 className="font-bold text-lg mb-4">Update Mechanics</h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                            {posData.mechanics.map(mechanic => (
                                <label key={mechanic.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded border border-gray-100 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedMechanics.includes(mechanic.id)}
                                        onChange={e => {
                                            if (e.target.checked) setSelectedMechanics([...selectedMechanics, mechanic.id]);
                                            else setSelectedMechanics(selectedMechanics.filter(id => id !== mechanic.id));
                                        }}
                                        className="rounded text-indigo-600"
                                    />
                                    <span>{mechanic.name}</span>
                                </label>
                            ))}
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowMechanicModal(false)} className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                            <button onClick={handleMechanicsUpdate} className="px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700">Save</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mini POS Modal */}
            {showPosModal && posData && (
                <MiniPosModal
                    isOpen={showPosModal}
                    onClose={() => setShowPosModal(false)}
                    saleId={reservation.id} // Reusing saleId prop - need to check if MiniPosModal supports reservationId or handles generic ID
                    reservationMode={true} // IMPORTANT: Tell modal it's reservation mode
                    currentPaymentMethod={'cash'} // Dummy, not used in reservation mode
                    products={posData.products}
                    services={posData.services}
                    categories={posData.categories}
                    mechanics={posData.mechanics}
                />
            )}
        </AuthenticatedLayout>
    );
}

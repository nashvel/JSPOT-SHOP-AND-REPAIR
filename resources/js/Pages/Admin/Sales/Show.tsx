import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, QrCode, RotateCcw, Banknote, Smartphone, CreditCard, Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface SaleItem {
    id: number;
    product_id: number;
    product_name: string;
    product_type: 'product' | 'service';
    category_name: string | null;
    quantity: number;
    unit_price: number;
    total: number;
}

interface SaleReturn {
    id: number;
    sale_item_id: number;
    quantity: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    approver?: { name: string };
}

interface Sale {
    id: number;
    sale_number: string;
    customer_name: string;
    contact_number: string;
    engine_number: string;
    chassis_number: string;
    plate_number: string;
    subtotal: number;
    total: number;
    payment_method: 'cash' | 'gcash' | 'maya';
    amount_paid: number;
    change: number;
    reference_number: string | null;
    qr_token: string;
    status: string;
    created_at: string;
    user: { name: string };
    branch: { name: string };
    items: SaleItem[];
    returns: SaleReturn[];
}

interface Props {
    sale: Sale;
    receiptUrl: string;
}

export default function Show({ sale, receiptUrl }: Props) {
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<SaleItem | null>(null);
    const [copied, setCopied] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        sale_id: sale.id,
        sale_item_id: 0,
        quantity: 1,
        reason: '',
    });

    const formatPrice = (price: number) => `₱${parseFloat(String(price)).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
    const formatDate = (date: string) => new Date(date).toLocaleString('en-PH');

    const PaymentIcon = ({ method }: { method: string }) => {
        switch (method) {
            case 'cash': return <Banknote className="h-5 w-5 text-green-600" />;
            case 'gcash': return <Smartphone className="h-5 w-5 text-blue-600" />;
            case 'maya': return <CreditCard className="h-5 w-5 text-emerald-600" />;
            default: return null;
        }
    };

    const openReturnModal = (item: SaleItem) => {
        setSelectedItem(item);
        setData({ ...data, sale_item_id: item.id, quantity: 1 });
        setShowReturnModal(true);
    };

    const submitReturn = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.returns.store'), {
            onSuccess: () => {
                setShowReturnModal(false);
                reset();
            },
        });
    };

    const copyReceiptUrl = () => {
        navigator.clipboard.writeText(receiptUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getReturnedQty = (itemId: number) => {
        return sale.returns
            .filter(r => r.sale_item_id === itemId && r.status !== 'rejected')
            .reduce((sum, r) => sum + r.quantity, 0);
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Sale ${sale.sale_number}`} />

            <div className="py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <Link href={route('admin.sales.index')} className="p-2 hover:bg-gray-100 rounded-lg">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{sale.sale_number}</h1>
                                <p className="text-gray-500">{formatDate(sale.created_at)}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={copyReceiptUrl}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
                            >
                                {copied ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                {copied ? 'Copied!' : 'Copy Link'}
                            </button>
                            <a
                                href={receiptUrl}
                                target="_blank"
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                            >
                                <QrCode className="h-4 w-4" />
                                View Receipt
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
                                        <p className="font-medium">{sale.customer_name}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Contact Number</span>
                                        <p className="font-medium">{sale.contact_number}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Engine Number</span>
                                        <p className="font-mono">{sale.engine_number}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Chassis Number</span>
                                        <p className="font-mono">{sale.chassis_number}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-gray-500">Plate Number</span>
                                        <p className="font-mono text-lg font-bold">{sale.plate_number}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="bg-white rounded-xl shadow-sm overflow-hidden overflow-x-auto">
                                <div className="p-4 border-b">
                                    <h3 className="font-semibold text-gray-900">Items Purchased</h3>
                                </div>
                                <table className="min-w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {sale.items.map(item => {
                                            const returnedQty = getReturnedQty(item.id);
                                            const availableQty = item.quantity - returnedQty;
                                            const canReturn = item.product_type === 'product' && availableQty > 0;

                                            return (
                                                <tr key={item.id}>
                                                    <td className="px-4 py-3 font-medium">{item.product_name}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${item.product_type === 'product' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                                            {item.product_type === 'product' ? 'Product' : 'Service'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">
                                                        {item.category_name || '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        {item.quantity}
                                                        {returnedQty > 0 && (
                                                            <span className="text-red-500 text-xs block">-{returnedQty} returned</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">{formatPrice(item.unit_price)}</td>
                                                    <td className="px-4 py-3 text-right font-medium">{formatPrice(item.total)}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        {canReturn ? (
                                                            <button
                                                                onClick={() => openReturnModal(item)}
                                                                className="text-orange-600 hover:text-orange-800 text-sm font-medium flex items-center gap-1 ml-auto"
                                                            >
                                                                <RotateCcw className="h-4 w-4" />
                                                                Return
                                                            </button>
                                                        ) : item.product_type === 'service' ? (
                                                            <span className="text-gray-400 text-xs">N/A</span>
                                                        ) : null}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Payment Summary */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Payment Summary</h3>

                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-4">
                                    <PaymentIcon method={sale.payment_method} />
                                    <span className="font-medium capitalize">{sale.payment_method}</span>
                                    {sale.reference_number && (
                                        <span className="text-sm text-gray-500 ml-auto">Ref: {sale.reference_number}</span>
                                    )}
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Subtotal</span>
                                        <span>{formatPrice(sale.subtotal)}</span>
                                    </div>
                                    {sale.returns.some(r => r.status === 'approved') && (
                                        <div className="flex justify-between text-red-600">
                                            <span>Returns Deducted</span>
                                            <span>
                                                -{formatPrice(
                                                    sale.returns
                                                        .filter(r => r.status === 'approved')
                                                        .reduce((sum, r) => {
                                                            const item = sale.items.find(i => i.id === r.sale_item_id);
                                                            return sum + (item ? item.unit_price * r.quantity : 0);
                                                        }, 0)
                                                )}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between border-t pt-2 text-lg font-bold">
                                        <span>Total</span>
                                        <span className="text-indigo-600">{formatPrice(sale.total)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Paid</span>
                                        <span>{formatPrice(sale.amount_paid)}</span>
                                    </div>
                                    {sale.change > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Change</span>
                                            <span>{formatPrice(sale.change)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* QR Code */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h3 className="font-semibold text-gray-900 mb-4 text-center">Customer Receipt</h3>
                                <div className="flex flex-col items-center">
                                    <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                                        <QRCodeSVG
                                            value={receiptUrl}
                                            size={180}
                                            level="H"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-3 text-center">
                                        Scan to view receipt & track order
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1 font-mono">
                                        {sale.sale_number}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h3 className="font-semibold text-gray-900 mb-2">Processed By</h3>
                                <p className="text-gray-700">{sale.user.name}</p>
                                <p className="text-sm text-gray-500">{sale.branch.name}</p>
                            </div>

                            {sale.returns.length > 0 && (
                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <h3 className="font-semibold text-gray-900 mb-4">Return Requests</h3>
                                    <div className="space-y-3">
                                        {sale.returns.map(ret => (
                                            <div key={ret.id} className={`p-3 rounded-lg ${ret.status === 'pending' ? 'bg-yellow-50 border border-yellow-200' :
                                                ret.status === 'approved' ? 'bg-green-50 border border-green-200' :
                                                    'bg-red-50 border border-red-200'
                                                }`}>
                                                <div className="flex justify-between items-start">
                                                    <span className="text-sm font-medium">Qty: {ret.quantity}</span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${ret.status === 'pending' ? 'bg-yellow-200' :
                                                        ret.status === 'approved' ? 'bg-green-200' : 'bg-red-200'
                                                        }`}>
                                                        {ret.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">{ret.reason}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Return Modal */}
            {showReturnModal && selectedItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="p-6 border-b">
                            <h3 className="text-xl font-bold text-gray-900">Request Return</h3>
                            <p className="text-gray-500">{selectedItem.product_name}</p>
                        </div>

                        <form onSubmit={submitReturn} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity to Return</label>
                                <input
                                    type="number"
                                    min="1"
                                    max={selectedItem.quantity - getReturnedQty(selectedItem.id)}
                                    value={data.quantity}
                                    onChange={e => setData('quantity', parseInt(e.target.value))}
                                    className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                />
                                {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Return</label>
                                <textarea
                                    value={data.reason}
                                    onChange={e => setData('reason', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                    rows={3}
                                    placeholder="Describe why the item is being returned..."
                                    required
                                />
                                {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason}</p>}
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                <p className="text-sm text-yellow-800">
                                    ⚠️ Return requests require admin approval before processing.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowReturnModal(false)}
                                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                                >
                                    {processing ? 'Submitting...' : 'Submit Return'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

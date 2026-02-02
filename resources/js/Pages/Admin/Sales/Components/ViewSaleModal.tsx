import { X, Printer, Banknote, Smartphone, CreditCard } from 'lucide-react';
import Modal from '@/Components/Modal';

interface SaleItem {
    id: number | string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total: number;
}

interface Sale {
    id: number | string;
    sale_number?: string;
    saleNumber?: string;
    customer_name?: string;
    customerName?: string;
    plate_number?: string;
    plateNumber?: string;
    total: number;
    payment_method?: string;
    paymentMethod?: string;
    status: string;
    created_at?: string;
    createdAt?: string;
    items: SaleItem[];
    subtotal: number;
    amount_paid?: number;
    amountPaid?: number;
    change_amount?: number;
    changeAmount?: number;
    user?: { name: string };
    mechanicName?: string;
}

interface Props {
    show: boolean;
    onClose: () => void;
    sale: Sale | null;
}

export default function ViewSaleModal({ show, onClose, sale }: Props) {
    if (!sale) return null;

    const formatPrice = (price: number) => `₱${Number(price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
    const formatDate = (date: string | undefined) => date ? new Date(date).toLocaleString('en-PH') : 'N/A';

    const getPaymentIcon = (method: string | undefined) => {
        switch (method) {
            case 'cash': return <Banknote className="h-5 w-5 text-green-600" />;
            case 'gcash': return <Smartphone className="h-5 w-5 text-blue-600" />;
            case 'maya': return <CreditCard className="h-5 w-5 text-emerald-600" />;
            default: return null;
        }
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {sale.sale_number || sale.saleNumber}
                        </h2>
                        <p className="text-sm text-gray-500">{formatDate(sale.created_at || sale.createdAt)}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-6">
                    {/* Customer Info */}
                    <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
                        <div>
                            <span className="text-gray-500 block">Customer</span>
                            <span className="font-medium text-gray-900">{sale.customer_name || sale.customerName || 'Walk-in'}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 block">Plate Number</span>
                            <span className="font-mono text-gray-900">{sale.plate_number || (sale as any).plateNumber || '-'}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 block">Attendant/Mechanic</span>
                            <span className="font-medium text-gray-900">{sale.user?.name || sale.mechanicName || '-'}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 block">Payment Method</span>
                            <div className="flex items-center gap-2 mt-1">
                                {getPaymentIcon(sale.payment_method || sale.paymentMethod)}
                                <span className="font-medium capitalize">{sale.payment_method || sale.paymentMethod}</span>
                            </div>
                        </div>
                    </div>

                    {/* Items */}
                    <div>
                        <h3 className="font-medium text-gray-900 mb-3">Items</h3>
                        <div className="border rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Item</th>
                                        <th className="px-4 py-2 text-center text-xs font-bold text-gray-500 uppercase">Qty</th>
                                        <th className="px-4 py-2 text-right text-xs font-bold text-gray-500 uppercase">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {sale.items.map((item, i) => (
                                        <tr key={i}>
                                            <td className="px-4 py-2 text-sm text-gray-900">{item.product_name}</td>
                                            <td className="px-4 py-2 text-sm text-gray-900 text-center">{item.quantity}</td>
                                            <td className="px-4 py-2 text-sm text-gray-900 text-right">{formatPrice(item.total)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Subtotal</span>
                            <span className="font-medium">{formatPrice(sale.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-indigo-600">
                            <span>Total</span>
                            <span>{formatPrice(sale.total)}</span>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t border-dashed">
                            <span className="text-gray-500">Amount Paid</span>
                            <span className="font-medium">{formatPrice(sale.amount_paid || sale.amountPaid || 0)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-green-600 font-medium">
                            <span>Change</span>
                            <span>{formatPrice(sale.change_amount || sale.changeAmount || 0)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
}

import PublicLayout from '@/Layouts/PublicLayout';
import { Head } from '@inertiajs/react';
import { Package, User, Phone, Car, Calendar, CreditCard, Banknote, Smartphone, CheckCircle } from 'lucide-react';

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
    contact_number: string;
    engine_number: string;
    chassis_number: string;
    plate_number: string;
    subtotal: number;
    total: number;
    payment_method: 'cash' | 'gcash' | 'maya';
    amount_paid: number;
    change: number;
    status: string;
    created_at: string;
    user: { name: string };
    branch: { name: string };
    items: SaleItem[];
}

interface Props {
    sale: Sale;
}

export default function Receipt({ sale }: Props) {
    const formatPrice = (price: number) => `₱${parseFloat(String(price)).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
    const formatDate = (date: string) => new Date(date).toLocaleString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    const PaymentIcon = ({ method }: { method: string }) => {
        switch (method) {
            case 'cash': return <Banknote className="h-5 w-5" />;
            case 'gcash': return <Smartphone className="h-5 w-5" />;
            case 'maya': return <CreditCard className="h-5 w-5" />;
            default: return null;
        }
    };

    return (
        <PublicLayout>
            <Head title={`Receipt - ${sale.sale_number}`} />

            <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-8 px-4">
                <div className="max-w-lg mx-auto">
                    {/* Receipt Card */}
                    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-center text-white">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="h-10 w-10" />
                            </div>
                            <h1 className="text-2xl font-bold">JSPOT SHOP & REPAIR</h1>
                            <p className="text-indigo-200 mt-1">Sales Receipt</p>
                        </div>

                        {/* Sale Info */}
                        <div className="p-6 border-b">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm text-gray-500">Receipt No.</p>
                                    <p className="font-mono font-bold text-lg text-indigo-600">{sale.sale_number}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Date</p>
                                    <p className="text-sm font-medium">{formatDate(sale.created_at)}</p>
                                </div>
                            </div>
                            <div className="mt-3 text-sm text-gray-500">
                                <p>Branch: {sale.branch.name}</p>
                                <p>Processed by: {sale.user.name}</p>
                            </div>
                        </div>

                        {/* Customer & Vehicle Info */}
                        <div className="p-6 bg-gray-50 border-b">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-gray-400" />
                                    <div>
                                        <p className="text-gray-500">Customer</p>
                                        <p className="font-medium">{sale.customer_name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                    <div>
                                        <p className="text-gray-500">Contact</p>
                                        <p className="font-medium">{sale.contact_number}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 p-3 bg-white rounded-lg border">
                                <div className="flex items-center gap-2 mb-2">
                                    <Car className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-700">Vehicle Details</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                    <div>
                                        <p className="text-gray-500">Engine</p>
                                        <p className="font-mono">{sale.engine_number}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Chassis</p>
                                        <p className="font-mono">{sale.chassis_number}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Plate</p>
                                        <p className="font-mono font-bold">{sale.plate_number}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="p-6 border-b">
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                Items Purchased
                            </h3>
                            <div className="space-y-3">
                                {sale.items.map((item, index) => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                        <div className="flex gap-3">
                                            <span className="text-gray-400">{index + 1}.</span>
                                            <div>
                                                <p className="font-medium">{item.product_name}</p>
                                                <p className="text-gray-500">
                                                    {item.quantity} × {formatPrice(item.unit_price)}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="font-medium">{formatPrice(item.total)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Totals */}
                        <div className="p-6 bg-gray-50 border-b">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span>{formatPrice(sale.subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold border-t pt-2">
                                    <span>Total</span>
                                    <span className="text-indigo-600">{formatPrice(sale.total)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="p-6">
                            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                        <PaymentIcon method={sale.payment_method} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-green-700">Payment Method</p>
                                        <p className="font-semibold capitalize text-green-800">{sale.payment_method}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-green-700">Paid</p>
                                    <p className="font-bold text-green-800">{formatPrice(sale.amount_paid)}</p>
                                </div>
                            </div>
                            {sale.change > 0 && (
                                <p className="text-center mt-3 text-sm text-gray-500">
                                    Change: <span className="font-medium text-gray-700">{formatPrice(sale.change)}</span>
                                </p>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-gray-100 text-center">
                            <p className="text-sm text-gray-600">Thank you for your purchase!</p>
                            <p className="text-xs text-gray-400 mt-2">
                                This is an electronic receipt. Keep for your records.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}

import { Head } from '@inertiajs/react';
import { CreditCard, Banknote, Smartphone, Wrench, Clock, CircleCheck, CircleX, CircleDashed, Printer, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface SaleItem {
    id: number;
    product_name: string;
    product_type: 'product' | 'service';
    category_name: string | null;
    quantity: number;
    unit_price: number;
    total: number;
    payment_method: string | null;
    reference_number: string | null;
}

interface JobOrderPart {
    id: number;
    part_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    product?: { name: string };
}

interface JobOrder {
    id: number;
    tracking_code: string;
    description: string;
    labor_cost: number;
    parts_cost: number;
    total_cost: number;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    created_at: string;
    updated_at: string;
    completed_at: string | null;
    mechanic: {
        name: string;
        specialization: string | null;
    };
    parts: JobOrderPart[];
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
    jobOrder: JobOrder | null;
}

export default function Receipt({ sale, jobOrder }: Props) {
    const [showJobOrder, setShowJobOrder] = useState(false);

    const formatPrice = (price: number) => `₱${parseFloat(String(price)).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
    const formatDate = (date: string) => new Date(date).toLocaleString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    const receiptUrl = window.location.href;

    const PaymentIcon = ({ method }: { method: string }) => {
        switch (method) {
            case 'cash': return <Banknote className="h-5 w-5" />;
            case 'gcash': return <Smartphone className="h-5 w-5" />;
            case 'maya': return <CreditCard className="h-5 w-5" />;
            default: return null;
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const config: Record<string, { icon: React.ReactNode; class: string; label: string }> = {
            pending: { icon: <CircleDashed className="h-4 w-4" />, class: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending' },
            in_progress: { icon: <Clock className="h-4 w-4" />, class: 'bg-blue-100 text-blue-800 border-blue-200', label: 'In Progress' },
            completed: { icon: <CircleCheck className="h-4 w-4" />, class: 'bg-green-100 text-green-800 border-green-200', label: 'Completed' },
            cancelled: { icon: <CircleX className="h-4 w-4" />, class: 'bg-red-100 text-red-800 border-red-200', label: 'Cancelled' },
        };
        const { icon, class: className, label } = config[status] || config.pending;
        return (
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${className}`}>
                {icon}
                {label}
            </span>
        );
    };

    return (
        <>
            <Head title={`Receipt - ${sale.sale_number}`} />

            {/* Print-specific styles */}
            <style>{`
                @media print {
                    /* Hide everything except receipt */
                    body > *:not(#app) {
                        display: none !important;
                    }
                    
                    /* Remove background colors and gradients */
                    body, html {
                        background: white !important;
                        background-image: none !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    
                    /* Remove shadows and borders that waste ink */
                    .shadow-2xl, .shadow-xl, .shadow-lg {
                        box-shadow: none !important;
                    }
                    
                    /* Ensure content fits on page */
                    .rounded-2xl, .rounded-xl, .rounded-lg {
                        border-radius: 0 !important;
                    }
                    
                    /* Remove padding from container */
                    .py-8 {
                        padding-top: 0 !important;
                        padding-bottom: 0 !important;
                    }
                    
                    .px-4 {
                        padding-left: 0.25rem !important;
                        padding-right: 0.25rem !important;
                    }
                    
                    /* Reduce all padding */
                    .p-6 {
                        padding: 0.5rem !important;
                    }
                    
                    .p-4 {
                        padding: 0.25rem !important;
                    }
                    
                    .p-3 {
                        padding: 0.15rem !important;
                    }
                    
                    .py-3, .py-4 {
                        padding-top: 0.25rem !important;
                        padding-bottom: 0.25rem !important;
                    }
                    
                    /* Make text smaller */
                    body {
                        font-size: 9pt !important;
                        line-height: 1.2 !important;
                    }
                    
                    h1 {
                        font-size: 14pt !important;
                    }
                    
                    h3 {
                        font-size: 10pt !important;
                    }
                    
                    .text-2xl {
                        font-size: 14pt !important;
                    }
                    
                    .text-xl {
                        font-size: 12pt !important;
                    }
                    
                    .text-lg {
                        font-size: 10pt !important;
                    }
                    
                    .text-base {
                        font-size: 9pt !important;
                    }
                    
                    .text-sm {
                        font-size: 8pt !important;
                    }
                    
                    .text-xs {
                        font-size: 7pt !important;
                    }
                    
                    /* Reduce spacing */
                    .gap-4, .gap-3 {
                        gap: 0.25rem !important;
                    }
                    
                    .space-y-3 > * + * {
                        margin-top: 0.25rem !important;
                    }
                    
                    .space-y-2 > * + * {
                        margin-top: 0.15rem !important;
                    }
                    
                    .mb-4, .mb-3 {
                        margin-bottom: 0.25rem !important;
                    }
                    
                    .mt-4, .mt-3 {
                        margin-top: 0.25rem !important;
                    }
                    
                    /* Ensure QR code prints clearly */
                    svg {
                        print-color-adjust: exact !important;
                        -webkit-print-color-adjust: exact !important;
                    }
                    
                    /* Keep important colors */
                    .bg-indigo-600, .bg-purple-600, .bg-green-50, .bg-gray-50, .bg-blue-100, .bg-green-100 {
                        print-color-adjust: exact !important;
                        -webkit-print-color-adjust: exact !important;
                    }
                    
                    /* Force single page */
                    @page {
                        size: auto;
                        margin: 10mm;
                    }
                    
                    /* Prevent page breaks */
                    .no-break {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }
                    
                    /* Hide print button */
                    .no-print {
                        display: none !important;
                    }
                }
                
                /* Screen styles - hide navbar on screen too */
                @media screen {
                    body {
                        overflow-x: hidden;
                    }
                }
            `}</style>

            <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-8 px-4">
                <div className="max-w-lg mx-auto">
                    {/* Receipt Card */}
                    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="bg-white p-4 text-center border-b border-gray-100 relative">
                            {/* Print Button - Hidden when printing */}
                            <button
                                onClick={() => window.print()}
                                className="no-print absolute top-4 right-4 flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors text-xs font-medium text-gray-700"
                            >
                                <Printer className="h-3 w-3" />
                                <span>Print</span>
                            </button>

                            <h1 className="text-xl font-bold text-gray-900">JSPOT SHOP & REPAIR</h1>
                            <p className="text-gray-500 text-xs mt-1">Customer Receipt</p>
                        </div>

                        {/* QR Code at Top */}
                        <div className="p-4 bg-white border-b no-break">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500 mb-1">Receipt No.</p>
                                    <p className="font-mono font-bold text-sm text-indigo-600">{sale.sale_number}</p>
                                    <p className="text-xs text-gray-500 mt-1">{formatDate(sale.created_at)}</p>

                                    {jobOrder && (
                                        <div className="mt-2 pt-2 border-t border-dashed border-gray-200">
                                            <p className="text-xs text-gray-500 mb-1">Tracking ID</p>
                                            <p className="font-mono font-bold text-sm text-purple-600">{jobOrder.tracking_code}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="bg-white p-2 rounded border border-gray-200">
                                        <QRCodeSVG
                                            value={receiptUrl}
                                            size={80}
                                            level="H"
                                        />
                                    </div>
                                    <p className="text-[8px] text-gray-500 mt-1 text-center">Scan to track</p>
                                </div>
                            </div>
                        </div>

                        {/* Sales Receipt - Always Visible */}
                        <div>
                            {/* Sale Info - Removed since it's now at top with QR */}

                            {/* Customer & Vehicle Info */}
                            <div className="p-3 bg-gray-50 border-b no-break">
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <p className="text-gray-500 text-[10px]">Customer</p>
                                        <p className="font-medium">{sale.customer_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-[10px]">Contact</p>
                                        <p className="font-medium">{sale.contact_number}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-[10px]">Engine</p>
                                        <p className="font-mono text-[10px]">{sale.engine_number}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-[10px]">Chassis</p>
                                        <p className="font-mono text-[10px]">{sale.chassis_number}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-gray-500 text-[10px]">Plate Number</p>
                                        <p className="font-mono text-sm font-bold">{sale.plate_number}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="p-3 border-b no-break">
                                <h3 className="font-semibold text-gray-900 mb-2 text-xs">Items Purchased</h3>
                                <div className="space-y-1">
                                    {sale.items.map((item, index) => (
                                        <div key={item.id} className="flex justify-between text-xs border-b border-gray-100 pb-1">
                                            <div className="flex gap-2 flex-1">
                                                <span className="text-gray-400">{index + 1}.</span>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-1">
                                                        <p className="font-medium">{item.product_name}</p>
                                                        <span className={`text-[8px] px-1 py-0.5 rounded ${item.product_type === 'product'
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : 'bg-green-100 text-green-700'
                                                            }`}>
                                                            {item.product_type === 'product' ? 'P' : 'S'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <p className="text-[10px] text-gray-500">
                                                            {item.quantity} × {formatPrice(item.unit_price)}
                                                        </p>
                                                        {item.payment_method && (
                                                            <span className="text-[8px] uppercase font-bold text-gray-500 bg-gray-100 px-1 rounded">
                                                                {item.payment_method}
                                                            </span>
                                                        )}
                                                        {item.reference_number && (
                                                            <span className="text-[8px] text-gray-400 font-mono">
                                                                #{item.reference_number}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="font-medium">{formatPrice(item.total)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Totals */}
                            <div className="p-3 bg-gray-50 border-b no-break">
                                <div className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Subtotal</span>
                                        <span>{formatPrice(sale.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold border-t pt-1">
                                        <span>Total</span>
                                        <span className="text-indigo-600">{formatPrice(sale.total)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="p-3 border-b no-break">
                                <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                            <PaymentIcon method={sale.payment_method} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-green-700">Payment</p>
                                            <p className="text-xs font-semibold capitalize text-green-800">{sale.payment_method}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-green-700">Paid</p>
                                        <p className="text-xs font-bold text-green-800">{formatPrice(sale.amount_paid)}</p>
                                    </div>
                                </div>
                                {sale.change > 0 && (
                                    <p className="text-center mt-1 text-[10px] text-gray-500">
                                        Change: <span className="font-medium text-gray-700">{formatPrice(sale.change)}</span>
                                    </p>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-3 bg-gray-50 text-center no-break">
                                <p className="text-[10px] text-gray-600">Thank you for your purchase!</p>
                                <p className="text-[8px] text-gray-400 mt-1">
                                    {sale.branch.name} • {sale.user.name}
                                </p>
                            </div>
                        </div>

                        {/* Job Order Dropdown - Only show if services were purchased */}
                        {jobOrder && (
                            <div className="border-t-4 border-indigo-100">
                                {/* Dropdown Button */}
                                <button
                                    onClick={() => setShowJobOrder(!showJobOrder)}
                                    className="w-full p-4 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition-colors flex items-center justify-between no-print"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                                            <Wrench className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-indigo-900">Track Your Service</p>
                                            <p className="text-xs text-indigo-600">Click to view job order status</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <StatusBadge status={jobOrder.status} />
                                        {showJobOrder ? (
                                            <ChevronUp className="h-6 w-6 text-indigo-600" />
                                        ) : (
                                            <ChevronDown className="h-6 w-6 text-indigo-600 animate-bounce" />
                                        )}
                                    </div>
                                </button>

                                {/* Job Order Details - Collapsible */}
                                {showJobOrder && (
                                    <div className="bg-white animate-in slide-in-from-top duration-300">
                                        {/* Job Order Header */}
                                        <div className="p-6 border-b">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <p className="text-sm text-gray-500">Tracking Code</p>
                                                    <p className="font-mono font-bold text-lg text-indigo-600">{jobOrder.tracking_code}</p>
                                                </div>
                                                <StatusBadge status={jobOrder.status} />
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                <p>Created: {formatDate(jobOrder.created_at)}</p>
                                                <p>Last Updated: {formatDate(jobOrder.updated_at)}</p>
                                                {jobOrder.completed_at && (
                                                    <p className="text-green-600 font-medium">Completed: {formatDate(jobOrder.completed_at)}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Mechanic Info */}
                                        <div className="p-6 bg-gray-50 border-b">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                                                    <Wrench className="h-6 w-6 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Assigned Mechanic</p>
                                                    <p className="font-semibold text-gray-900">{jobOrder.mechanic.name}</p>
                                                    {jobOrder.mechanic.specialization && (
                                                        <p className="text-xs text-gray-500">{jobOrder.mechanic.specialization}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Job Description */}
                                        <div className="p-6 border-b">
                                            <h3 className="font-semibold text-gray-900 mb-2">Job Description</h3>
                                            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{jobOrder.description}</p>
                                        </div>

                                        {/* Parts Used */}
                                        {jobOrder.parts.length > 0 && (
                                            <div className="p-6 border-b">
                                                <h3 className="font-semibold text-gray-900 mb-3">Parts Used</h3>
                                                <div className="space-y-2">
                                                    {jobOrder.parts.map((part) => (
                                                        <div key={part.id} className="flex justify-between text-sm bg-gray-50 p-3 rounded-lg">
                                                            <div>
                                                                <p className="font-medium">{part.part_name}</p>
                                                                <p className="text-gray-500">Qty: {part.quantity}</p>
                                                            </div>
                                                            <span className="font-medium">{formatPrice(part.total_price)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Cost Breakdown */}
                                        <div className="p-6 bg-gray-50">
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Labor Cost</span>
                                                    <span>{formatPrice(jobOrder.labor_cost)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Parts Cost</span>
                                                    <span>{formatPrice(jobOrder.parts_cost)}</span>
                                                </div>
                                                <div className="flex justify-between text-lg font-bold border-t pt-2">
                                                    <span>Total Cost</span>
                                                    <span className="text-indigo-600">{formatPrice(jobOrder.total_cost)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Footer */}
                        <div className={`p-6 text-center border-t ${jobOrder ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-100'}`}>
                            <p className={`text-sm font-medium ${jobOrder ? 'text-indigo-900' : 'text-gray-600'}`}>Thank you for your purchase!</p>
                            <p className={`text-xs mt-2 ${jobOrder ? 'text-indigo-600' : 'text-gray-400'}`}>
                                {jobOrder ? 'Keep this page bookmarked to track your job order status.' : 'This is an electronic receipt. Keep for your records.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

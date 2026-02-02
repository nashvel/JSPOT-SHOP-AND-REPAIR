import { Head } from '@inertiajs/react';
import { useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface ReservationItem {
    id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
    total: number;
}

interface Reservation {
    id: number;
    reservation_number: string;
    customer_name: string;
    customer_contact: string | null;
    vehicle_plate: string | null;
    reservation_date: string;
    created_at: string;
    qr_token: string;
    branch: { name: string; address?: string };
    items: ReservationItem[];
    mechanics: { name: string }[];
}

interface Props {
    reservation: Reservation;
}

export default function Ticket({ reservation }: Props) {
    useEffect(() => {
        window.print();
    }, []);

    const formatPrice = (price: number) => `₱${parseFloat(String(price)).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
    const formatDate = (date: string) => new Date(date).toLocaleString('en-PH');
    const total = reservation.items.reduce((sum, item) => sum + Number(item.total), 0);
    const qrUrl = `${window.location.origin}/reservation/${reservation.qr_token}`;

    return (
        <div className="bg-white min-h-screen p-8 text-sm font-mono text-gray-900 leading-tight">
            <Head title={`Ticket - ${reservation.reservation_number}`} />

            <div className="max-w-[300px] mx-auto border border-gray-300 p-4 shadow-none print:border-none print:p-0 print:max-w-none">
                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-xl font-bold uppercase tracking-wider mb-1">JSPOT SHOP</h1>
                    <p className="text-xs text-gray-400">Shop & Repair</p>
                    {reservation.branch.address && <p className="text-xs mt-1">{reservation.branch.address}</p>}
                    <p className="text-xs font-bold mt-2">{reservation.branch.name}</p>
                </div>

                {/* Ticket Info */}
                <div className="mb-4 border-b border-gray-200 pb-2 border-dashed">
                    <div className="flex justify-between">
                        <span>Ticket #</span>
                        <span className="font-bold">{reservation.reservation_number}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Date</span>
                        <span>{formatDate(reservation.created_at)}</span>
                    </div>
                </div>

                {/* Customer Info */}
                <div className="mb-4 border-b border-gray-200 pb-2 border-dashed">
                    <p className="font-bold uppercase">{reservation.customer_name}</p>
                    {reservation.customer_contact && <p>{reservation.customer_contact}</p>}
                    {reservation.vehicle_plate && <p className="mt-1">Vehicle: {reservation.vehicle_plate}</p>}
                </div>

                {/* Items */}
                <div className="space-y-2 mb-4">
                    <div className="flex font-bold border-b border-gray-200 pb-1">
                        <span className="flex-1">Item</span>
                        <span className="w-8 text-center">Qty</span>
                        <span className="w-16 text-right">Price</span>
                    </div>
                    {reservation.items.map(item => (
                        <div key={item.id} className="flex">
                            <span className="flex-1 truncate pr-2">{item.product_name}</span>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <span className="w-16 text-right">{formatPrice(item.total)}</span>
                        </div>
                    ))}
                </div>

                {/* Totals */}
                <div className="border-t border-gray-200 border-dashed pt-2 mb-4">
                    <div className="flex justify-between text-lg font-bold">
                        <span>Total Est.</span>
                        <span>{formatPrice(total)}</span>
                    </div>
                </div>

                {/* Mechanics */}
                {reservation.mechanics.length > 0 && (
                    <div className="mb-4 text-center">
                        <p className="text-xs text-gray-500 mb-1">Assigned Mechanics</p>
                        <p className="font-bold">{reservation.mechanics.map(m => m.name).join(', ')}</p>
                    </div>
                )}

                {/* QR Code */}
                <div className="flex flex-col items-center py-4 border-t border-gray-200 border-dashed">
                    <QRCodeSVG value={qrUrl} size={100} level="M" />
                    <p className="text-xs text-gray-400 mt-2 text-center">Scan to check status</p>
                </div>

                {/* Footer */}
                <div className="text-center text-xs text-gray-400 mt-4">
                    <p>This is a reservation ticket.</p>
                    <p>Not an official receipt.</p>
                    <p className="mt-2">Thank you!</p>
                </div>
            </div>

            <style>
                {`
                    @media print {
                        @page { margin: 0; size: auto; }
                        body { background: white; }
                        .no-print { display: none; }
                    }
                `}
            </style>
        </div>
    );
}


import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { useCart } from '@/hooks/useCart';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';

interface CartProps {
    branches: any[];
    companyEmail: string;
    themeColors: { primary: string; secondary: string; accent: string };
    tagline: string;
}

export default function Cart({ branches, companyEmail, themeColors, tagline }: CartProps) {
    const { items, removeItem, updateQuantity, clearCart, getTotal, getCount } = useCart();

    return (
        <PublicLayout
            branches={branches}
            companyEmail={companyEmail}
            themeColors={themeColors}
            tagline={tagline}
        >
            <Head title="Your Cart" />

            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 mb-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Continue Shopping
                            </Link>
                            <h1 className="text-3xl font-black text-gray-900">Your Cart</h1>
                            <p className="text-gray-500 mt-1">{getCount()} items in your cart</p>
                        </div>
                        {items.length > 0 && (
                            <button
                                onClick={() => clearCart()}
                                className="text-red-500 hover:text-red-700 text-sm font-medium"
                            >
                                Clear All
                            </button>
                        )}
                    </div>

                    {items.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h2 className="text-xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
                            <p className="text-gray-500 mb-6">Browse our products and add items to your cart</p>
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-800 transition-colors"
                            >
                                <ShoppingBag className="w-5 h-5" />
                                Start Shopping
                            </Link>
                        </div>
                    ) : (
                        <div className="grid lg:grid-cols-3 gap-6">
                            {/* Cart Items */}
                            <div className="lg:col-span-2 space-y-4">
                                {items.map((item) => (
                                    <div key={item.id} className="bg-white rounded-xl shadow-sm p-4 flex gap-4">
                                        <img
                                            src={item.image || `https://placehold.co/100x100?text=${encodeURIComponent(item.name)}`}
                                            alt={item.name}
                                            className="w-24 h-24 object-cover rounded-lg bg-gray-100"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 truncate">{item.name}</h3>
                                            <p className="text-sm text-gray-500">{item.branchName || 'Multiple Branches'}</p>
                                            <p className="text-lg font-bold text-purple-700 mt-1">
                                                ₱{item.price.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end justify-between">
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="text-gray-400 hover:text-red-500 p-1"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="w-8 text-center font-semibold">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Order Summary */}
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-xl shadow-sm p-6 sticky top-32">
                                    <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between text-gray-600">
                                            <span>Subtotal ({getCount()} items)</span>
                                            <span>₱{getTotal().toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600">
                                            <span>Shipping</span>
                                            <span className="text-green-600">Free Pickup</span>
                                        </div>
                                        <hr />
                                        <div className="flex justify-between text-lg font-bold">
                                            <span>Total</span>
                                            <span className="text-purple-700">₱{getTotal().toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <button className="w-full py-3 bg-purple-700 text-white rounded-lg font-bold hover:bg-purple-800 transition-colors mb-3">
                                        Proceed to Reservation
                                    </button>

                                    <p className="text-xs text-center text-gray-500">
                                        Reserve items for pickup at your nearest branch
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}

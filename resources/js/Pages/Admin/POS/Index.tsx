import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { Search, Plus, Minus, Trash2, ShoppingCart, CreditCard, Banknote, Smartphone, X, CheckCircle, Package, Wrench } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    sku: string;
    price: number;
    type: 'product' | 'service';
    branches: { pivot: { stock_quantity: number } }[];
}

interface CartItem {
    product: Product;
    quantity: number;
}

interface Employee {
    id: number;
    name: string;
}

interface Props {
    products: Product[];
    services: Product[];
    employee: Employee;
}

export default function Index({ products, services, employee }: Props) {
    const [activeTab, setActiveTab] = useState<'products' | 'services'>('products');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPayment, setSelectedPayment] = useState<'cash' | 'gcash' | 'maya' | null>(null);
    const [showCheckout, setShowCheckout] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        customer_name: '',
        contact_number: '',
        engine_number: '',
        chassis_number: '',
        plate_number: '',
        employee_name: '',
        payment_method: '' as 'cash' | 'gcash' | 'maya' | '',
        amount_paid: 0,
        reference_number: '',
        items: [] as { product_id: number; quantity: number }[],
    });

    // Get items based on active tab
    const currentItems = activeTab === 'products' ? products : services;

    const filteredItems = useMemo(() => {
        if (!searchQuery) return currentItems;
        return currentItems.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [currentItems, searchQuery]);

    const cartTotal = useMemo(() => {
        return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    }, [cart]);

    const addToCart = (product: Product) => {
        const existing = cart.find(item => item.product.id === product.id);

        // Services don't have stock limits
        if (product.type === 'service') {
            if (existing) {
                setCart(cart.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                ));
            } else {
                setCart([...cart, { product, quantity: 1 }]);
            }
            return;
        }

        // Products have stock limits
        const stock = product.branches[0]?.pivot?.stock_quantity || 0;
        if (existing) {
            if (existing.quantity < stock) {
                setCart(cart.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                ));
            }
        } else {
            if (stock > 0) {
                setCart([...cart, { product, quantity: 1 }]);
            }
        }
    };

    const updateQuantity = (productId: number, delta: number) => {
        setCart(cart.map(item => {
            if (item.product.id === productId) {
                if (item.product.type === 'service') {
                    // Services have no upper limit
                    const newQty = Math.max(1, item.quantity + delta);
                    return { ...item, quantity: newQty };
                } else {
                    const stock = item.product.branches[0]?.pivot?.stock_quantity || 0;
                    const newQty = Math.max(1, Math.min(stock, item.quantity + delta));
                    return { ...item, quantity: newQty };
                }
            }
            return item;
        }));
    };

    const removeFromCart = (productId: number) => {
        setCart(cart.filter(item => item.product.id !== productId));
    };

    const openCheckout = (method: 'cash' | 'gcash' | 'maya') => {
        if (cart.length === 0) return;
        setSelectedPayment(method);
        setData({
            ...data,
            payment_method: method,
            amount_paid: cartTotal,
            items: cart.map(item => ({ product_id: item.product.id, quantity: item.quantity })),
        });
        setShowCheckout(true);
    };

    const handleCheckout = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.sales.store'), {
            onSuccess: () => {
                setCart([]);
                setShowCheckout(false);
                reset();
            },
        });
    };

    const formatPrice = (price: number) => `₱${price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

    return (
        <AuthenticatedLayout>
            <Head title="Point of Sale" />

            <div className="h-[calc(100vh-4rem)] flex bg-gray-100">
                {/* Products/Services Panel */}
                <div className="flex-1 p-4 overflow-auto">
                    {/* Tabs */}
                    <div className="flex gap-2 mb-4">
                        <button
                            onClick={() => { setActiveTab('products'); setSearchQuery(''); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all ${activeTab === 'products'
                                    ? 'bg-indigo-600 text-white shadow-lg'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <Package className="h-5 w-5" />
                            Products ({products.length})
                        </button>
                        <button
                            onClick={() => { setActiveTab('services'); setSearchQuery(''); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all ${activeTab === 'services'
                                    ? 'bg-emerald-600 text-white shadow-lg'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <Wrench className="h-5 w-5" />
                            Services ({services.length})
                        </button>
                    </div>

                    {/* Search */}
                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder={`Search ${activeTab}...`}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border-0 shadow-sm focus:ring-2 focus:ring-indigo-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Items Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                        {filteredItems.map(item => {
                            const stock = item.type === 'product' ? (item.branches[0]?.pivot?.stock_quantity || 0) : null;
                            const inCart = cart.find(c => c.product.id === item.id);
                            const isOutOfStock = item.type === 'product' && stock === 0;

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => addToCart(item)}
                                    disabled={isOutOfStock}
                                    className={`p-4 rounded-xl text-left transition-all ${isOutOfStock
                                        ? 'bg-gray-200 opacity-50 cursor-not-allowed'
                                        : 'bg-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                                        } ${inCart ? 'ring-2 ring-indigo-500' : ''}`}
                                >
                                    <div className={`aspect-square rounded-lg mb-3 flex items-center justify-center ${item.type === 'product'
                                            ? 'bg-gradient-to-br from-indigo-100 to-purple-100'
                                            : 'bg-gradient-to-br from-emerald-100 to-teal-100'
                                        }`}>
                                        {item.type === 'product' ? (
                                            <Package className="h-8 w-8 text-indigo-600" />
                                        ) : (
                                            <Wrench className="h-8 w-8 text-emerald-600" />
                                        )}
                                    </div>
                                    <h3 className="font-semibold text-gray-900 text-sm truncate">{item.name}</h3>
                                    <p className="text-xs text-gray-500">{item.sku || (item.type === 'service' ? 'Service' : 'No SKU')}</p>
                                    <div className="mt-2 flex items-center justify-between">
                                        <span className={`text-lg font-bold ${item.type === 'product' ? 'text-indigo-600' : 'text-emerald-600'}`}>
                                            {formatPrice(item.price)}
                                        </span>
                                        {item.type === 'product' ? (
                                            <span className={`text-xs px-2 py-1 rounded-full ${stock! > 10 ? 'bg-green-100 text-green-700' :
                                                stock! > 0 ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {stock} in stock
                                            </span>
                                        ) : (
                                            <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                                                Service
                                            </span>
                                        )}
                                    </div>
                                    {inCart && (
                                        <div className={`mt-2 text-center py-1 rounded-lg text-sm font-medium ${item.type === 'product' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                                            }`}>
                                            {inCart.quantity} in cart
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {filteredItems.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            {activeTab === 'products' ? (
                                <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
                            ) : (
                                <Wrench className="mx-auto h-12 w-12 mb-4 opacity-50" />
                            )}
                            <p>No {activeTab} found</p>
                        </div>
                    )}
                </div>

                {/* Cart Panel */}
                <div className="w-96 bg-white shadow-xl flex flex-col">
                    <div className="p-4 border-b bg-gradient-to-r from-indigo-600 to-purple-600">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5" />
                            Current Sale
                        </h2>
                        <p className="text-indigo-100 text-sm">Employee: {employee.name}</p>
                    </div>

                    <div className="flex-1 overflow-auto p-4 space-y-3">
                        {cart.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                                <ShoppingCart className="mx-auto h-12 w-12 mb-3 opacity-50" />
                                <p>Cart is empty</p>
                                <p className="text-sm">Add products or services to get started</p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.product.id} className="bg-gray-50 rounded-xl p-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                {item.product.type === 'product' ? (
                                                    <Package className="h-4 w-4 text-indigo-500" />
                                                ) : (
                                                    <Wrench className="h-4 w-4 text-emerald-500" />
                                                )}
                                                <h4 className="font-medium text-gray-900 text-sm">{item.product.name}</h4>
                                            </div>
                                            <p className="text-xs text-gray-500">{formatPrice(item.product.price)} each</p>
                                        </div>
                                        <button onClick={() => removeFromCart(item.product.id)} className="text-red-500 hover:text-red-700">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => updateQuantity(item.product.id, -1)}
                                                className="p-1 rounded-lg bg-white border hover:bg-gray-100"
                                            >
                                                <Minus className="h-4 w-4" />
                                            </button>
                                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.product.id, 1)}
                                                className="p-1 rounded-lg bg-white border hover:bg-gray-100"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <span className="font-bold text-gray-900">
                                            {formatPrice(item.product.price * item.quantity)}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Cart Footer */}
                    <div className="border-t p-4 space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="text-2xl font-bold text-gray-900">{formatPrice(cartTotal)}</span>
                        </div>

                        {/* Payment Buttons */}
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={() => openCheckout('cash')}
                                disabled={cart.length === 0}
                                className="flex flex-col items-center gap-1 p-3 rounded-xl bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Banknote className="h-6 w-6" />
                                <span className="text-xs font-medium">Cash</span>
                            </button>
                            <button
                                onClick={() => openCheckout('gcash')}
                                disabled={cart.length === 0}
                                className="flex flex-col items-center gap-1 p-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Smartphone className="h-6 w-6" />
                                <span className="text-xs font-medium">GCash</span>
                            </button>
                            <button
                                onClick={() => openCheckout('maya')}
                                disabled={cart.length === 0}
                                className="flex flex-col items-center gap-1 p-3 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <CreditCard className="h-6 w-6" />
                                <span className="text-xs font-medium">Maya</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Checkout Modal */}
            {showCheckout && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-auto">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">Complete Sale</h2>
                            <button onClick={() => setShowCheckout(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCheckout} className="p-6 space-y-4">
                            {/* Customer Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                                    <input
                                        type="text"
                                        value={data.customer_name}
                                        onChange={(e) => setData('customer_name', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 focus:ring-indigo-500"
                                        required
                                    />
                                    {errors.customer_name && <p className="text-red-500 text-xs mt-1">{errors.customer_name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                                    <input
                                        type="text"
                                        value={data.contact_number}
                                        onChange={(e) => setData('contact_number', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 focus:ring-indigo-500"
                                        required
                                    />
                                    {errors.contact_number && <p className="text-red-500 text-xs mt-1">{errors.contact_number}</p>}
                                </div>
                            </div>

                            {/* Employee Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name</label>
                                <input
                                    type="text"
                                    value={data.employee_name}
                                    onChange={(e) => setData('employee_name', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 focus:ring-indigo-500"
                                    placeholder="Enter employee name"
                                    required
                                />
                                {errors.employee_name && <p className="text-red-500 text-xs mt-1">{errors.employee_name}</p>}
                            </div>

                            {/* Vehicle Info */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Engine #</label>
                                    <input
                                        type="text"
                                        value={data.engine_number}
                                        onChange={(e) => setData('engine_number', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 focus:ring-indigo-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Chassis #</label>
                                    <input
                                        type="text"
                                        value={data.chassis_number}
                                        onChange={(e) => setData('chassis_number', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 focus:ring-indigo-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Plate #</label>
                                    <input
                                        type="text"
                                        value={data.plate_number}
                                        onChange={(e) => setData('plate_number', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 focus:ring-indigo-500"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Payment */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    {selectedPayment === 'cash' && <Banknote className="h-5 w-5 text-green-600" />}
                                    {selectedPayment === 'gcash' && <Smartphone className="h-5 w-5 text-blue-600" />}
                                    {selectedPayment === 'maya' && <CreditCard className="h-5 w-5 text-emerald-600" />}
                                    <span className="font-medium capitalize">{selectedPayment} Payment</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid</label>
                                        <input
                                            type="number"
                                            value={data.amount_paid}
                                            onChange={(e) => setData('amount_paid', parseFloat(e.target.value))}
                                            className="w-full rounded-lg border-gray-300 focus:ring-indigo-500"
                                            min={cartTotal}
                                            required
                                        />
                                    </div>
                                    {selectedPayment !== 'cash' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Reference #</label>
                                            <input
                                                type="text"
                                                value={data.reference_number}
                                                onChange={(e) => setData('reference_number', e.target.value)}
                                                className="w-full rounded-lg border-gray-300 focus:ring-indigo-500"
                                            />
                                        </div>
                                    )}
                                </div>
                                {data.amount_paid >= cartTotal && (
                                    <div className="mt-3 p-2 bg-green-100 rounded-lg text-green-800 font-medium text-sm">
                                        Change: {formatPrice(data.amount_paid - cartTotal)}
                                    </div>
                                )}
                            </div>

                            {/* Order Summary */}
                            <div className="border-t pt-4">
                                <h3 className="font-medium text-gray-900 mb-2">Order Summary</h3>
                                <div className="space-y-1 text-sm">
                                    {cart.map(item => (
                                        <div key={item.product.id} className="flex justify-between">
                                            <span className="flex items-center gap-1">
                                                {item.product.type === 'product' ? (
                                                    <Package className="h-3 w-3 text-indigo-500" />
                                                ) : (
                                                    <Wrench className="h-3 w-3 text-emerald-500" />
                                                )}
                                                {item.product.name} x{item.quantity}
                                            </span>
                                            <span>{formatPrice(item.product.price * item.quantity)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-3 pt-3 border-t flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span>{formatPrice(cartTotal)}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={processing || data.amount_paid < cartTotal}
                                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <CheckCircle className="h-5 w-5" />
                                Complete Sale
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

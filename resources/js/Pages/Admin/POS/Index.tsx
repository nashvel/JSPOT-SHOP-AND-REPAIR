import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { Search, Plus, Minus, Trash2, ShoppingCart, CreditCard, Banknote, Smartphone, X, CheckCircle, Package, Wrench, Menu, Grid, List } from 'lucide-react';

interface Category {
    id: number;
    name: string;
    type: 'product' | 'service';
}

interface Product {
    id: number;
    name: string;
    sku: string;
    price: number;
    type: 'product' | 'service';
    category_id: number | null;
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

interface Mechanic {
    id: number;
    name: string;
    specialization: string | null;
}

interface Props {
    products: Product[];
    services: Product[];
    categories: Category[];
    mechanics: Mechanic[];
    employee: Employee;
}

export default function Index({ products, services, categories, mechanics, employee }: Props) {
    const [activeTab, setActiveTab] = useState<'products' | 'services'>('products');
    const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
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
        employee_name: employee.name, // Auto-fill from logged-in user
        mechanic_id: '',
        payment_method: '' as 'cash' | 'gcash' | 'maya' | '',
        amount_paid: 0,
        reference_number: '',
        items: [] as { product_id: number; quantity: number }[],
    });

    const currentItems = activeTab === 'products' ? products : services;
    const currentCategories = categories.filter(c => c.type === (activeTab === 'products' ? 'product' : 'service'));

    const filteredItems = useMemo(() => {
        let items = currentItems;

        if (selectedCategory !== 'all') {
            items = items.filter(p => p.category_id === selectedCategory);
        }

        if (searchQuery) {
            items = items.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return items;
    }, [currentItems, searchQuery, selectedCategory]);

    const cartTotal = useMemo(() => {
        return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    }, [cart]);

    const hasServices = useMemo(() => {
        return cart.some(item => item.product.type === 'service');
    }, [cart]);

    const addToCart = (product: Product) => {
        const existing = cart.find(item => item.product.id === product.id);

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

        const stock = product.branches[0]?.pivot?.stock_quantity || 0;
        const cartQuantity = existing?.quantity || 0;
        const availableStock = stock - cartQuantity;

        if (existing) {
            if (availableStock > 0) {
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

            <div className="h-[calc(100vh-4rem)] flex overflow-hidden bg-gray-50">

                {/* Main Content - Grid */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Top Bar */}
                    <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">

                            <div className="flex gap-4 w-full md:w-auto">
                                {/* Type Toggle */}
                                <div className="flex p-1 bg-gray-100 rounded-lg">
                                    <button
                                        onClick={() => { setActiveTab('products'); setSelectedCategory('all'); setSearchQuery(''); }}
                                        className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${activeTab === 'products'
                                                ? 'bg-white text-gray-900 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        Products
                                    </button>
                                    <button
                                        onClick={() => { setActiveTab('services'); setSelectedCategory('all'); setSearchQuery(''); }}
                                        className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${activeTab === 'services'
                                                ? 'bg-white text-gray-900 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        Services
                                    </button>
                                </div>

                                {/* Category Dropdown */}
                                <div className="relative min-w-[200px]">
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                                        className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium appearance-none cursor-pointer"
                                    >
                                        <option value="all">All Categories</option>
                                        {currentCategories.map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                                        <Menu className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>

                            {/* Search */}
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name or SKU..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {filteredItems.map(item => {
                                const stock = item.type === 'product' ? (item.branches[0]?.pivot?.stock_quantity || 0) : null;
                                const cartItem = cart.find(c => c.product.id === item.id);
                                const cartQuantity = cartItem?.quantity || 0;
                                const availableStock = item.type === 'product' ? (stock! - cartQuantity) : null;
                                const isOutOfStock = item.type === 'product' && availableStock! <= 0;

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => addToCart(item)}
                                        disabled={isOutOfStock}
                                        className={`group relative bg-white rounded-xl border border-gray-200 p-4 text-left transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:hover:translate-y-0 disabled:hover:shadow-none ${isOutOfStock ? 'opacity-60 grayscale' : ''
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className={`p-2 rounded-lg ${item.type === 'product' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                                                }`}>
                                                {item.type === 'product' ? <Package className="h-5 w-5" /> : <Wrench className="h-5 w-5" />}
                                            </div>
                                            {item.type === 'product' && (
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${availableStock! > 10 ? 'bg-green-100 text-green-700' :
                                                        availableStock! > 0 ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'
                                                    }`}>
                                                    {availableStock} left
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 min-h-[2.5rem] mb-1 group-hover:text-indigo-600 transition-colors">
                                            {item.name}
                                        </h3>
                                        <p className="text-xs text-gray-400 font-mono mb-3">{item.sku || 'No SKU'}</p>

                                        <div className="flex items-end justify-between">
                                            <span className="text-lg font-bold text-gray-900 tracking-tight">
                                                {formatPrice(item.price)}
                                            </span>
                                            <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                <Plus className="h-4 w-4" />
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {filteredItems.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <Search className="h-12 w-12 mb-4 opacity-20" />
                                <p className="text-lg font-medium">No items found</p>
                                <p className="text-sm">Try adjusting your filters</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Sidebar - Cart */}
                <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full shadow-2xl relative z-20">
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-1">
                            <h2 className="font-bold text-xl text-gray-900">Current Sale</h2>
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs font-medium">
                                {cart.length} items
                            </span>
                        </div>
                        <p className="text-xs text-gray-500">Employee: {employee.name}</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-300">
                                <ShoppingCart className="h-16 w-16 mb-4 opacity-20" />
                                <p className="font-medium text-gray-400">Cart is empty</p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.product.id} className="flex gap-4 group">
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="text-sm font-medium text-gray-900 leading-tight">{item.product.name}</h4>
                                            <button
                                                onClick={() => removeFromCart(item.product.id)}
                                                className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-2">{formatPrice(item.product.price)} each</p>

                                        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-1">
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => updateQuantity(item.product.id, -1)} className="p-1 hover:bg-white rounded shadow-sm text-gray-500">
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.product.id, 1)} className="p-1 hover:bg-white rounded shadow-sm text-gray-500">
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>
                                            <span className="text-sm font-bold text-gray-900 pr-2">
                                                {formatPrice(item.product.price * item.quantity)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-4">
                        <div className="flex justify-between items-end">
                            <span className="text-sm text-gray-500 mb-1">Total Amount</span>
                            <span className="text-3xl font-bold text-gray-900 leading-none">{formatPrice(cartTotal)}</span>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={() => openCheckout('cash')}
                                disabled={cart.length === 0}
                                className="flex flex-col items-center justify-center py-3 px-2 bg-white border border-gray-200 rounded-xl hover:border-green-500 hover:text-green-600 hover:bg-green-50 transition-all disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:bg-white disabled:hover:text-inherit"
                            >
                                <Banknote className="h-6 w-6 mb-1" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Cash</span>
                            </button>
                            <button
                                onClick={() => openCheckout('gcash')}
                                disabled={cart.length === 0}
                                className="flex flex-col items-center justify-center py-3 px-2 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:bg-white disabled:hover:text-inherit"
                            >
                                <Smartphone className="h-6 w-6 mb-1" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">GCash</span>
                            </button>
                            <button
                                onClick={() => openCheckout('maya')}
                                disabled={cart.length === 0}
                                className="flex flex-col items-center justify-center py-3 px-2 bg-white border border-gray-200 rounded-xl hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:bg-white disabled:hover:text-inherit"
                            >
                                <CreditCard className="h-6 w-6 mb-1" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Maya</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Checkout Modal */}
            {showCheckout && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Complete Payment</h2>
                                <p className="text-sm text-gray-500">Enter customer details to finalize</p>
                            </div>
                            <button onClick={() => setShowCheckout(false)} className="bg-white p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shadow-sm border border-gray-200">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCheckout} className="flex-1 overflow-y-auto p-6 space-y-6">

                            {/* Payment Summary Box */}
                            <div className="bg-indigo-50 rounded-xl p-4 flex justify-between items-center border border-indigo-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600">
                                        {selectedPayment === 'cash' && <Banknote className="h-6 w-6" />}
                                        {selectedPayment === 'gcash' && <Smartphone className="h-6 w-6" />}
                                        {selectedPayment === 'maya' && <CreditCard className="h-6 w-6" />}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Payment Method</p>
                                        <p className="font-bold text-gray-900 capitalize">{selectedPayment}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Amount Due</p>
                                    <p className="text-xl font-bold text-indigo-700">{formatPrice(cartTotal)}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Customer Name</label>
                                        <input
                                            type="text"
                                            value={data.customer_name}
                                            onChange={(e) => setData('customer_name', e.target.value)}
                                            className="w-full rounded-lg border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
                                            required
                                        />
                                        {errors.customer_name && <p className="text-red-500 text-xs">{errors.customer_name}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Contact #</label>
                                        <input
                                            type="text"
                                            value={data.contact_number}
                                            onChange={(e) => setData('contact_number', e.target.value)}
                                            className="w-full rounded-lg border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
                                            required
                                        />
                                        {errors.contact_number && <p className="text-red-500 text-xs">{errors.contact_number}</p>}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Vehicle Details</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <input
                                            type="text"
                                            placeholder="Engine #"
                                            value={data.engine_number}
                                            onChange={(e) => setData('engine_number', e.target.value)}
                                            className="w-full rounded-lg border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 text-sm"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Chassis #"
                                            value={data.chassis_number}
                                            onChange={(e) => setData('chassis_number', e.target.value)}
                                            className="w-full rounded-lg border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 text-sm"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Plate #"
                                            value={data.plate_number}
                                            onChange={(e) => setData('plate_number', e.target.value)}
                                            className="w-full rounded-lg border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 text-sm"
                                            required
                                        />
                                    </div>
                                </div>

                                {hasServices && (
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Assigned Mechanic <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={data.mechanic_id}
                                            onChange={(e) => setData('mechanic_id', e.target.value)}
                                            className="w-full rounded-lg border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
                                            required
                                        >
                                            <option value="">Select Mechanic</option>
                                            {mechanics.map(mechanic => (
                                                <option key={mechanic.id} value={mechanic.id}>
                                                    {mechanic.name} {mechanic.specialization ? `- ${mechanic.specialization}` : ''}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.mechanic_id && <p className="text-red-500 text-xs">{errors.mechanic_id}</p>}
                                    </div>
                                )}

                                <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-gray-700">Amount Tendered</label>
                                        {data.amount_paid >= cartTotal && (
                                            <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                                Change: {formatPrice(data.amount_paid - cartTotal)}
                                            </span>
                                        )}
                                    </div>
                                    <input
                                        type="number"
                                        value={data.amount_paid}
                                        onChange={(e) => setData('amount_paid', parseFloat(e.target.value))}
                                        className="w-full text-right font-mono text-2xl font-bold rounded-lg border-gray-300 focus:ring-green-500 focus:border-green-500"
                                        min={cartTotal}
                                        required
                                    />

                                    {selectedPayment !== 'cash' && (
                                        <input
                                            type="text"
                                            placeholder="Reference Number (Optional)"
                                            value={data.reference_number}
                                            onChange={(e) => setData('reference_number', e.target.value)}
                                            className="w-full rounded-lg border-gray-200 bg-white"
                                        />
                                    )}
                                </div>
                            </div>
                        </form>

                        <div className="p-6 border-t border-gray-100 bg-gray-50">
                            <button
                                onClick={handleCheckout}
                                disabled={processing || data.amount_paid < cartTotal}
                                className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                            >
                                {processing ? (
                                    <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <CheckCircle className="h-5 w-5" />
                                )}
                                Confirm Transaction
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

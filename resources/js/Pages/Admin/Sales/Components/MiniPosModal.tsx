import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import { useState, useMemo } from 'react';
import { Search, ShoppingCart, X, Plus, Minus, Wrench, Package, User } from 'lucide-react';
import { useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';

interface Product {
    id: number;
    name: string;
    type: 'product' | 'service';
    price: number;
    category_id: number;
    branches: { pivot: { stock_quantity: number } }[];
}

interface Category {
    id: number;
    name: string;
}

interface Mechanic {
    id: number;
    name: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    saleId: number;
    currentPaymentMethod?: string;
    products: Product[];
    services: Product[];
    categories: Category[];
    mechanics: Mechanic[];
}

export default function MiniPosModal({ isOpen, onClose, saleId, currentPaymentMethod = 'cash', products, services, categories, mechanics }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'products' | 'services'>('products');
    const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
    const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);

    // Form for submission
    const { data, setData, post, processing, reset } = useForm({
        items: [] as { product_id: number; quantity: number }[],
        mechanic_id: '' as string | number,
        payment_method: currentPaymentMethod,
        amount_paid: 0,
        reference_number: '',
    });

    const filteredItems = useMemo(() => {
        const items = activeTab === 'products' ? products : services;
        return items.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [activeTab, products, services, searchQuery, selectedCategory]);

    const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    const addToCart = (product: Product) => {
        const existing = cart.find(i => i.product.id === product.id);
        if (existing) {
            updateQuantity(product.id, 1);
        } else {
            setCart([...cart, { product, quantity: 1 }]);
        }
    };

    const updateQuantity = (productId: number, delta: number) => {
        setCart(cart.map(item => {
            if (item.product.id === productId) {
                // Stock check for products
                if (item.product.type === 'product') {
                    const stock = item.product.branches[0]?.pivot?.stock_quantity || 0;
                    const newQty = Math.max(1, Math.min(stock, item.quantity + delta));
                    return { ...item, quantity: newQty };
                }
                return { ...item, quantity: Math.max(1, item.quantity + delta) };
            }
            return item;
        }));
    };

    const removeFromCart = (productId: number) => {
        setCart(cart.filter(i => i.product.id !== productId));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate
        if (cart.length === 0) return;
        if (data.amount_paid < cartTotal) {
            Swal.fire({
                title: 'Insufficient Payment',
                text: 'Amount paid must be equal to or greater than the total amount.',
                icon: 'error'
            });
            return;
        }

        data.items = cart.map(i => ({ product_id: i.product.id, quantity: i.quantity }));

        post(route('admin.sales.add-items', saleId), {
            onSuccess: () => {
                onClose();
                reset();
                setCart([]);
                Swal.fire({
                    title: 'Success!',
                    text: 'Items added to sale successfully.',
                    icon: 'success',
                    timer: 1500
                });
            }
        });
    };

    const hasServices = cart.some(i => i.product.type === 'service');
    const formatPrice = (price: number) => `₱${price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

    return (
        <Modal show={isOpen} onClose={onClose} maxWidth="3xl">
            <div className="flex h-[600px] overflow-hidden rounded-2xl">
                {/* Left Side: Product Selection */}
                <div className="w-[60%] flex flex-col border-r border-gray-200 bg-gray-50/50">
                    <div className="p-3 border-b border-gray-200 bg-white space-y-3 shadow-sm z-10">
                        <div className="flex justify-between items-center">
                            <h2 className="text-base font-bold text-gray-900">Add Items</h2>
                            <div className="flex gap-1 text-xs bg-gray-100 p-0.5 rounded-lg">
                                <button
                                    onClick={() => setActiveTab('products')}
                                    className={`px-3 py-1 rounded-md font-medium transition-all ${activeTab === 'products' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    Products
                                </button>
                                <button
                                    onClick={() => setActiveTab('services')}
                                    className={`px-3 py-1 rounded-md font-medium transition-all ${activeTab === 'services' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    Services
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-8 pr-3 py-1.5 bg-gray-100 border-none rounded-md focus:ring-2 focus:ring-indigo-500 text-sm"
                                />
                            </div>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                                className="bg-gray-100 border-none rounded-md text-xs py-1.5 focus:ring-2 focus:ring-indigo-500 w-32 truncate"
                            >
                                <option value="all">All Categories</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                        <div className="grid grid-cols-2 gap-2">
                            {filteredItems.map(item => {
                                const stock = item.type === 'product' ? (item.branches[0]?.pivot?.stock_quantity || 0) : 999;
                                const cartItem = cart.find(c => c.product.id === item.id);
                                const available = stock - (cartItem?.quantity || 0);
                                const isOutOfStock = available <= 0;

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => addToCart(item)}
                                        disabled={isOutOfStock}
                                        className={`group bg-white p-2.5 rounded-lg border border-gray-200 text-left hover:border-indigo-300 hover:shadow-sm transition-all relative overflow-hidden ${isOutOfStock ? 'opacity-60 grayscale' : ''}`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <div className={`p-1 rounded-md ${item.type === 'product' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                                                {item.type === 'product' ? <Package className="h-3.5 w-3.5" /> : <Wrench className="h-3.5 w-3.5" />}
                                            </div>
                                            {item.type === 'product' && (
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${available < 5 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                                                    {available} left
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="font-semibold text-xs text-gray-900 line-clamp-2 h-8 leading-tight">{item.name}</h4>
                                        <div className="mt-2 flex justify-between items-end">
                                            <span className="font-bold text-sm text-indigo-600">{formatPrice(item.price)}</span>
                                            <div className="bg-indigo-50 text-indigo-600 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Plus className="h-3 w-3" />
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                            {filteredItems.length === 0 && (
                                <div className="col-span-2 flex flex-col items-center justify-center py-10 text-gray-400">
                                    <Search className="h-8 w-8 mb-2 opacity-20" />
                                    <p className="text-xs">No items found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side: Cart & Checkout */}
                <div className="w-[40%] flex flex-col bg-white h-full relative z-20 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]">
                    <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                        <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                            <ShoppingCart className="h-4 w-4 text-indigo-600" />
                            New items
                        </h3>
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                            {cart.length}
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-gray-50/30">
                        {cart.map(item => (
                            <div key={item.product.id} className="flex gap-2 bg-white p-2 rounded-lg border border-gray-100 shadow-sm group">
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-xs font-semibold text-gray-900 truncate">{item.product.name}</h4>
                                    <p className="text-[10px] text-gray-500">{formatPrice(item.product.price)}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <button
                                        onClick={() => removeFromCart(item.product.id)}
                                        className="text-gray-300 hover:text-red-500 -mr-1"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                    <div className="flex items-center bg-gray-100 rounded-md border border-gray-200">
                                        <button onClick={() => updateQuantity(item.product.id, -1)} className="p-1 hover:bg-white rounded-l-md transition-colors"><Minus className="h-2.5 w-2.5 text-gray-600" /></button>
                                        <span className="text-xs font-bold w-5 text-center leading-none">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.product.id, 1)} className="p-1 hover:bg-white rounded-r-md transition-colors"><Plus className="h-2.5 w-2.5 text-gray-600" /></button>
                                    </div>
                                    <span className="text-xs font-bold text-indigo-600">{formatPrice(item.product.price * item.quantity)}</span>
                                </div>
                            </div>
                        ))}
                        {cart.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-gray-300 space-y-2">
                                <div className="p-3 bg-gray-50 rounded-full">
                                    <ShoppingCart className="h-6 w-6 opacity-30" />
                                </div>
                                <p className="text-xs">Cart is empty</p>
                            </div>
                        )}
                    </div>

                    <div className="p-3 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] space-y-3">
                        <div className="flex justify-between items-baseline mb-1">
                            <span className="text-xs text-gray-500 font-medium">Total Payable</span>
                            <span className="text-xl font-bold text-gray-900 tracking-tight">{formatPrice(cartTotal)}</span>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3">
                            {hasServices && (
                                <div className="relative">
                                    <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                                    <select
                                        value={data.mechanic_id}
                                        onChange={(e) => setData('mechanic_id', e.target.value)}
                                        className="w-full pl-8 pr-3 py-2 rounded-lg border-gray-200 bg-gray-50 text-xs font-medium focus:ring-indigo-500 focus:bg-white transition-all"
                                        required={hasServices}
                                    >
                                        <option value="">Select Mechanic</option>
                                        {mechanics.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                    </select>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-2">
                                <select
                                    value={data.payment_method}
                                    onChange={(e) => setData('payment_method', e.target.value)}
                                    className="w-full py-2 px-2 rounded-lg border-gray-200 bg-gray-50 text-xs font-medium focus:ring-indigo-500"
                                >
                                    <option value="cash">Cash</option>
                                    <option value="gcash">GCash</option>
                                    <option value="maya">Maya</option>
                                </select>
                                <div className="relative">
                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">₱</span>
                                    <input
                                        type="number"
                                        value={data.amount_paid}
                                        onChange={(e) => setData('amount_paid', parseFloat(e.target.value))}
                                        className={`w-full pl-6 pr-2 py-2 rounded-lg border-gray-200 bg-gray-50 text-xs font-bold focus:ring-indigo-500 ${data.amount_paid < cartTotal ? 'text-red-600' : 'text-green-600'}`}
                                        placeholder="Amount"
                                        min={cartTotal}
                                        step="0.01"
                                    />
                                </div>
                            </div>

                            {/* Reference Number for GCash/Maya */}
                            {(data.payment_method === 'gcash' || data.payment_method === 'maya') && (
                                <input
                                    type="text"
                                    value={data.reference_number}
                                    onChange={(e) => setData('reference_number', e.target.value)}
                                    className="w-full py-2 px-3 rounded-lg border-gray-200 bg-gray-50 text-xs font-medium focus:ring-indigo-500"
                                    placeholder="Reference Number (e.g., GCash Ref #)"
                                />
                            )}

                            <div className="flex justify-between items-center px-1">
                                <span className="text-xs text-gray-500 font-medium">Change Due:</span>
                                <span className={`text-sm font-bold ${data.amount_paid >= cartTotal ? 'text-green-600' : 'text-gray-400'}`}>
                                    {data.amount_paid >= cartTotal ? formatPrice(data.amount_paid - cartTotal) : '₱0.00'}
                                </span>
                            </div>

                            <div className="flex gap-2 pt-1">
                                <button type="button" onClick={onClose} className="flex-1 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing || cart.length === 0 || data.amount_paid < cartTotal}
                                    className="flex-[2] py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all shadow-sm hover:shadow-indigo-200/50 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
                                >
                                    {processing ? '...' : (cart.length > 0 ? `Pay ${formatPrice(cartTotal)}` : 'Add Items')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Modal>
    );
}

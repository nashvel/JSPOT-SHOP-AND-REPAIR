import { PropsWithChildren, useState, useMemo, useEffect } from 'react';
import { Link, Head, router } from '@inertiajs/react';
import { ShoppingBag, Search, ClipboardList, ShoppingCart, User, Phone, Mail, MapPin, X, Trash2, Home, Heart, Store, Minus, Plus } from 'lucide-react';
import Fuse from 'fuse.js';
import ScrollToTop from '@/Components/ScrollToTop';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';

interface PublicLayoutProps extends PropsWithChildren {
    branches?: any[];
    currentBranch?: string;
    searchIndex?: any[];
    companyEmail?: string;
    themeColors?: { primary: string; secondary: string; accent: string };
    tagline?: string;
}

export default function PublicLayout({ children, branches = [], currentBranch, searchIndex = [], companyEmail = 'info@jspotmotors.com', themeColors = { primary: 'purple', secondary: 'gray', accent: 'red' }, tagline = 'Your Trusted Auto Parts Dealer' }: PublicLayoutProps) {
    const { items, getCount, removeItem, clearCart, getTotal, updateQuantity } = useCart();
    const { getCount: getWishlistCount } = useWishlist();
    const [search, setSearch] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);

    const fuse = useMemo(() => {
        return new Fuse(searchIndex || [], {
            keys: ['name', 'description'],
            threshold: 0.4, // Fuzzy match sensitivity
            distance: 100,
        });
    }, [searchIndex]);

    const handleSearchInput = (e: any) => {
        const query = e.target.value;
        setSearch(query);

        if (query.trim().length > 1) {
            const results = fuse.search(query).slice(0, 5).map(result => result.item);
            setSuggestions(results);
        } else {
            setSuggestions([]);
        }
    };

    const handleBranchChange = (e: any) => {
        router.get('/', { branch: e.target.value }, { preserveState: true, preserveScroll: true });
    };

    const handleSearch = (e: any) => {
        e.preventDefault();
        // Search functionality will be handled by the page component
        const event = new CustomEvent('search', { detail: search });
        window.dispatchEvent(event);
    };

    // Color Mapping for Theme
    const PRIMARY_COLORS: Record<string, Record<string, string>> = {
        'purple': { 50: '#faf5ff', 100: '#f3e8ff', 200: '#e9d5ff', 300: '#d8b4fe', 400: '#c084fc', 500: '#a855f7', 600: '#9333ea', 700: '#7e22ce', 800: '#6b21a8', 900: '#581c87' },
        'blue': { 50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a' },
        'red': { 50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5', 400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c', 800: '#991b1b', 900: '#7f1d1d' },
        'green': { 50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac', 400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d', 800: '#166534', 900: '#14532d' },
        'indigo': { 50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc', 400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 900: '#312e81' },
        'orange': { 50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74', 400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c', 800: '#9a3412', 900: '#7c2d12' },
        'teal': { 50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4', 400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e', 800: '#115e59', 900: '#134e4a' },
        'cyan': { 50: '#ecfeff', 100: '#cffafe', 200: '#a5f3fc', 300: '#67e8f9', 400: '#22d3ee', 500: '#06b6d4', 600: '#0891b2', 700: '#0e7490', 800: '#155e75', 900: '#164e63' },
        'pink': { 50: '#fdf2f8', 100: '#fce7f3', 200: '#fbcfe8', 300: '#f9a8d4', 400: '#f472b6', 500: '#ec4899', 600: '#db2777', 700: '#be185d', 800: '#9d174d', 900: '#831843' },
        'gray': { 50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db', 400: '#9ca3af', 500: '#6b7280', 600: '#4b5563', 700: '#374151', 800: '#1f2937', 900: '#111827' },
        'black': { 50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db', 400: '#9ca3af', 500: '#000000', 600: '#000000', 700: '#000000', 800: '#000000', 900: '#000000' },
    };

    const primaryShades = PRIMARY_COLORS[themeColors.primary] || PRIMARY_COLORS['purple'];

    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--primary-50', primaryShades[50]);
        root.style.setProperty('--primary-100', primaryShades[100]);
        root.style.setProperty('--primary-200', primaryShades[200]);
        root.style.setProperty('--primary-300', primaryShades[300]);
        root.style.setProperty('--primary-400', primaryShades[400]);
        root.style.setProperty('--primary-500', primaryShades[500]);
        root.style.setProperty('--primary-600', primaryShades[600]);
        root.style.setProperty('--primary-700', primaryShades[700]);
        root.style.setProperty('--primary-800', primaryShades[800]);
        root.style.setProperty('--primary-900', primaryShades[900]);
    }, [primaryShades]);

    return (
        <div className="min-h-screen bg-white">

            {/* Sticky Header Container */}
            <div className="sticky top-0 z-50 bg-white">
                {/* Top Purple Contact Bar - Hidden on mobile */}
                <div className="hidden md:block bg-gradient-to-r from-primary-900 to-primary-700 text-white text-xs py-2">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                {branches.slice(0, 3).map((branch, index) => (
                                    <span key={branch.id} className="flex items-center gap-1">
                                        {index === 0 && <Phone className="h-3 w-3" />}
                                        {branch.name.replace(/Branch \(|\)/g, '').toUpperCase()}: {branch.contact_number}
                                    </span>
                                ))}
                            </div>
                            <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {companyEmail}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Header */}
                <div className="border-b border-gray-200 bg-white">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
                        <div className="flex items-center justify-between gap-4">
                            {/* Logo */}
                            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
                                <ShoppingBag className="h-7 w-7 md:h-8 md:w-8 text-primary-700" />
                                <div className="flex flex-col leading-tight">
                                    <span className="text-xl md:text-2xl font-black text-primary-900">JSPOT</span>
                                    <span className="text-[10px] md:text-xs text-gray-600 font-medium hidden sm:block">MOTORS & SERVICES</span>
                                </div>
                            </Link>

                            {/* Search Bar - Hidden on mobile, shown on sm+ */}
                            <div className="hidden sm:flex flex-1 max-w-xl gap-3">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        placeholder="Search parts..."
                                        className="w-full rounded-lg border border-gray-300 pl-4 pr-12 py-2 text-sm focus:border-primary-500 focus:ring-primary-500"
                                        value={search}
                                        onChange={handleSearchInput}
                                        onBlur={() => setTimeout(() => setSuggestions([]), 200)}
                                        onFocus={() => { if (search.length > 1) handleSearchInput({ target: { value: search } }) }}
                                    />
                                    <button
                                        onClick={handleSearch}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary-700 hover:bg-primary-800 text-white p-1.5 rounded"
                                    >
                                        <Search className="h-4 w-4" />
                                    </button>

                                    {/* Search Suggestions Dropdown */}
                                    {suggestions.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50">
                                            {suggestions.map((item: any) => (
                                                <button
                                                    key={item.id}
                                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors"
                                                    onClick={() => {
                                                        setSearch(item.name);
                                                        setSuggestions([]);
                                                        const event = new CustomEvent('search', { detail: item.name });
                                                        window.dispatchEvent(event);
                                                    }}
                                                >
                                                    <div className="font-bold text-gray-900">{item.name}</div>
                                                    <div className="text-xs text-primary-600 flex flex-wrap gap-1 mt-1">
                                                        <span className="font-medium text-gray-500">Available in:</span>
                                                        {item.branches && item.branches.length > 0 ? (
                                                            item.branches.map((b: any) => (
                                                                <span key={b.id} className="bg-primary-50 px-1.5 py-0.5 rounded text-primary-700">
                                                                    {b.name}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-gray-400 italic">No specific branch (Order basis)</span>
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Icons */}
                            <div className="flex items-center gap-2 sm:gap-4">
                                {/* Mobile Search Button */}
                                <button className="sm:hidden p-2 text-gray-600 hover:text-primary-700">
                                    <Search className="h-5 w-5" />
                                </button>

                                {/* Branch Selector - Icon only on mobile */}
                                {branches.length > 0 && (
                                    <div className="relative hidden lg:block">
                                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                                        <select
                                            value={currentBranch || ''}
                                            onChange={handleBranchChange}
                                            className="rounded-lg border border-gray-300 pl-9 pr-4 py-2 text-sm focus:border-primary-500 focus:ring-primary-500"
                                        >
                                            <option value="">All Branches</option>
                                            {branches.map((b: any) => (
                                                <option key={b.id} value={b.name}>{b.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <Link href="/login" className="hidden sm:flex items-center gap-1 text-gray-600 hover:text-primary-700">
                                    <User className="h-5 w-5" />
                                </Link>

                                {/* Cart with Dropdown - Hidden on mobile */}
                                <div className="relative hidden md:block">
                                    <button
                                        onClick={() => setIsCartOpen(!isCartOpen)}
                                        className="relative flex items-center gap-1 text-gray-600 hover:text-primary-700"
                                    >
                                        <ShoppingCart className="h-6 w-6" />
                                        {getCount() > 0 && (
                                            <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                                {getCount()}
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Menu - Hidden on mobile */}
                <nav className="hidden md:block bg-gray-50 border-b border-gray-200">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-center gap-8 py-3">
                            <Link href="/" className="text-sm font-medium text-gray-700 hover:text-primary-700">
                                Home
                            </Link>

                            {/* TODO: Make these dropdowns dynamic from categories - Engine Parts Dropdown */}
                            <div className="relative group">
                                <button className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-primary-700">
                                    Engine Parts
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                <div className="absolute left-0 top-full mt-0 w-56 bg-white shadow-lg border border-gray-200 rounded-b-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                    <div className="py-2">
                                        <Link href="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700">
                                            Pistons
                                        </Link>
                                        <Link href="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700">
                                            Cylinders
                                        </Link>
                                        <Link href="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700">
                                            Crankshafts
                                        </Link>
                                        <Link href="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700">
                                            Camshafts
                                        </Link>
                                        <Link href="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700">
                                            Valves
                                        </Link>
                                        <Link href="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700">
                                            Gaskets
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <Link href="/" className="text-sm font-medium text-gray-700 hover:text-primary-700">
                                Brake Systems
                            </Link>

                            {/* TODO: Make these dropdowns dynamic from categories - Accessories Dropdown */}
                            <div className="relative group">
                                <button className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-primary-700">
                                    Accessories
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                <div className="absolute left-0 top-full mt-0 w-56 bg-white shadow-lg border border-gray-200 rounded-b-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                    <div className="py-2">
                                        <Link href="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700">
                                            Floor Mats
                                        </Link>
                                        <Link href="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700">
                                            Seat Covers
                                        </Link>
                                        <Link href="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700">
                                            Steering Wheel Covers
                                        </Link>
                                        <Link href="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700">
                                            Air Fresheners
                                        </Link>
                                        <Link href="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700">
                                            Phone Holders
                                        </Link>
                                        <Link href="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700">
                                            Dash Cams
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* TODO: Make these dropdowns dynamic from categories - Oils & Lubricants Dropdown */}
                            <div className="relative group">
                                <button className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-primary-700">
                                    Oils & Lubricants
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                <div className="absolute left-0 top-full mt-0 w-56 bg-white shadow-lg border border-gray-200 rounded-b-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                    <div className="py-2">
                                        <Link href="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700">
                                            Engine Oil
                                        </Link>
                                        <Link href="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700">
                                            Transmission Fluid
                                        </Link>
                                        <Link href="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700">
                                            Brake Fluid
                                        </Link>
                                        <Link href="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700">
                                            Coolant
                                        </Link>
                                        <Link href="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700">
                                            Grease
                                        </Link>
                                        <Link href="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700">
                                            Chain Lube
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            <Link href="/track" className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-primary-700">
                                <ClipboardList className="h-4 w-4" />
                                Service Tracker
                            </Link>
                            <Link href="/" className="relative text-sm font-medium text-gray-700 hover:text-primary-700">
                                Promotions
                                <span className="absolute -top-2 -right-8 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">HOT</span>
                            </Link>
                        </div>
                    </div>
                </nav>
            </div>
            {/* End Sticky Header Container */}

            <main>{children}</main>

            <footer className="border-t border-gray-100 bg-gray-50 mt-12 pb-20 md:pb-0">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <p className="text-center text-xs text-gray-500">
                        &copy; 2026 JSPOT MOTORS & SERVICES. All rights reserved.
                    </p>
                </div>
            </footer>
            <ScrollToTop />

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
                <div className="flex items-center justify-around py-2">
                    <Link href="/" className="flex flex-col items-center gap-1 text-gray-600 hover:text-primary-700">
                        <Home className="w-5 h-5" />
                        <span className="text-[10px] font-medium">Home</span>
                    </Link>
                    <button
                        onClick={() => setIsBranchModalOpen(true)}
                        className="flex flex-col items-center gap-1 text-gray-600 hover:text-primary-700"
                    >
                        <Store className="w-5 h-5" />
                        <span className="text-[10px] font-medium">Branches</span>
                    </button>
                    <Link href="/wishlist" className="flex flex-col items-center gap-1 text-gray-600 hover:text-primary-700 relative">
                        <Heart className="w-5 h-5" />
                        {getWishlistCount() > 0 && (
                            <span className="absolute -top-1 right-2 bg-pink-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                {getWishlistCount()}
                            </span>
                        )}
                        <span className="text-[10px] font-medium">Wishlist</span>
                    </Link>
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="flex flex-col items-center gap-1 text-gray-600 hover:text-primary-700 relative"
                    >
                        <ShoppingCart className="w-5 h-5" />
                        {getCount() > 0 && (
                            <span className="absolute -top-1 right-2 bg-primary-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                {getCount()}
                            </span>
                        )}
                        <span className="text-[10px] font-medium">Cart</span>
                    </button>
                </div>
            </div>

            {/* Cart Side Drawer */}
            <div
                className={`fixed inset-0 z-[60] transition-opacity duration-300 ${isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            >
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/50"
                    onClick={() => setIsCartOpen(false)}
                />

                {/* Drawer */}
                <div
                    className={`absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-xl transform transition-transform duration-300 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}
                >
                    <div className="flex flex-col h-full">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900">Your Cart</h2>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                    <ShoppingCart className="w-12 h-12 mb-3 text-gray-300" />
                                    <p className="font-medium">Your cart is empty</p>
                                    <p className="text-sm">Add items to get started</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex gap-3 bg-gray-50 rounded-lg p-3">
                                            <img
                                                src={item.image || `https://placehold.co/80x80?text=${encodeURIComponent(item.name)}`}
                                                alt={item.name}
                                                className="w-16 h-16 object-cover rounded bg-white"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 text-sm truncate">{item.name}</h3>
                                                <p className="text-xs text-gray-500">{item.branchName || 'Multiple Branches'}</p>
                                                <p className="text-primary-700 font-bold text-sm mt-1">₱{item.price.toLocaleString()}</p>
                                            </div>
                                            <div className="flex flex-col items-end justify-between">
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="text-gray-400 hover:text-red-500"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="p-4 border-t border-gray-200">
                                <div className="flex justify-between mb-4">
                                    <span className="text-gray-600">Total</span>
                                    <span className="text-lg font-bold text-primary-900">₱{getTotal().toLocaleString()}</span>
                                </div>
                                <Link
                                    href="/cart"
                                    className="block w-full py-3 bg-primary-700 text-white rounded-lg font-bold text-center hover:bg-primary-800 transition-colors mb-2"
                                    onClick={() => setIsCartOpen(false)}
                                >
                                    View Cart
                                </Link>
                                <button
                                    onClick={() => clearCart()}
                                    className="w-full py-2 text-sm text-gray-500 hover:text-red-600"
                                >
                                    Clear Cart
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Branch Selection Modal */}
            {isBranchModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setIsBranchModalOpen(false)}
                    />
                    <div className="relative w-full md:max-w-md bg-white rounded-t-2xl md:rounded-2xl p-6 animate-slide-up">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900">Select Branch</h2>
                            <button
                                onClick={() => setIsBranchModalOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-2">
                            <button
                                onClick={() => {
                                    router.get('/', { branch: '' }, { preserveState: true, preserveScroll: true });
                                    setIsBranchModalOpen(false);
                                }}
                                className={`w-full text-left p-3 rounded-lg border transition-colors ${!currentBranch ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 hover:bg-gray-50'}`}
                            >
                                <span className="font-medium">All Branches</span>
                            </button>
                            {branches.map((branch) => (
                                <button
                                    key={branch.id}
                                    onClick={() => {
                                        router.get('/', { branch: branch.name }, { preserveState: true, preserveScroll: true });
                                        setIsBranchModalOpen(false);
                                    }}
                                    className={`w-full text-left p-3 rounded-lg border transition-colors ${currentBranch === branch.name ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 hover:bg-gray-50'}`}
                                >
                                    <span className="font-medium">{branch.name}</span>
                                    {branch.contact_number && (
                                        <span className="block text-sm text-gray-500">{branch.contact_number}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}

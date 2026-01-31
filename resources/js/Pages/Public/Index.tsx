import PublicLayout from '@/Layouts/PublicLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { ChevronRight, Star } from 'lucide-react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { useCart } from '@/hooks/useCart';
import {
    HeroSection,
    ProductCard,
    TestimonialsCarousel,
    BrandLogosCarousel,
    BranchSelectionSection,
    QuickViewModal,
} from '@/Components/Public';

export default function Index({ products, branches, currentBranch, searchIndex, sections, companyEmail, themeColors = { primary: 'purple', secondary: 'gray', accent: 'red' }, tagline, canLogin }: any) {
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [isReservationOpen, setIsReservationOpen] = useState(false);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
    const [addedToCart, setAddedToCart] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [nearestBranch, setNearestBranch] = useState<any>(null);
    const { addItem } = useCart();

    const { data, setData, post, processing, reset, errors } = useForm({
        branch_id: currentBranch || (branches[0]?.id || ''),
        customer_name: '',
        customer_contact: '',
        items: [] as any[],
    });

    // ──────────────────────────────────────────────────────────────
    // Reservation Modal Handlers
    // ──────────────────────────────────────────────────────────────
    const openReservation = (product: any) => {
        setSelectedProduct(product);
        setData('items', [{ product_id: product.id, quantity: 1 }]);
        setIsReservationOpen(true);
    };

    const closeModal = () => {
        setIsReservationOpen(false);
        reset();
    };

    const submitReservation = (e: any) => {
        e.preventDefault();
        post(route('public.reserve'), {
            onSuccess: () => closeModal(),
        });
    };

    // ──────────────────────────────────────────────────────────────
    // Quick View Modal Handlers
    // ──────────────────────────────────────────────────────────────
    const openQuickView = (product: any) => {
        setSelectedProduct(product);
        setAddedToCart(false);
        setIsQuickViewOpen(true);
    };

    const closeQuickView = () => {
        setIsQuickViewOpen(false);
        setSelectedProduct(null);
    };

    const handleAddToCart = () => {
        if (selectedProduct) {
            addItem({
                id: selectedProduct.id,
                name: selectedProduct.name,
                price: selectedProduct.price,
                image: 'https://placehold.co/300?text=' + encodeURIComponent(selectedProduct.name),
                branchName: currentBranch || 'Any Branch',
            });
            setAddedToCart(true);
            setTimeout(() => setAddedToCart(false), 2000);
        }
    };

    // ──────────────────────────────────────────────────────────────
    // Geolocation - Find Nearest Store
    // ──────────────────────────────────────────────────────────────
    const branchCoordinates: Record<string, { lat: number; lng: number }> = {
        'Main Branch': { lat: 14.5995, lng: 120.9842 },
        'Downtown': { lat: 14.5944, lng: 120.9772 },
        'North Branch': { lat: 14.6760, lng: 121.0437 },
    };

    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const findNearestStore = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }
        setIsLocating(true);
        setNearestBranch(null);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                let closest: any = null;
                let minDist = Infinity;
                branches.forEach((branch: any) => {
                    const coords = branchCoordinates[branch.name];
                    if (coords) {
                        const dist = calculateDistance(latitude, longitude, coords.lat, coords.lng);
                        if (dist < minDist) {
                            minDist = dist;
                            closest = { ...branch, distance: dist.toFixed(1) };
                        }
                    }
                });
                setNearestBranch(closest);
                setIsLocating(false);
            },
            () => {
                alert('Unable to get your location. Please select a branch manually.');
                setIsLocating(false);
            }
        );
    };

    return (
        <PublicLayout branches={branches} currentBranch={currentBranch} searchIndex={searchIndex} companyEmail={companyEmail} themeColors={themeColors} tagline={tagline}>
            <Head title="Premium Auto Parts & Accessories" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                .promo-badge { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .8; } }
                .product-card:hover .product-image { transform: scale(1.05); }
                .product-card .product-image { transition: transform 0.3s ease-in-out; }
                * { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
            `}</style>

            {/* Hero Section */}
            {currentBranch && <HeroSection themeColors={themeColors} />}


            {/* Product Sections by Category */}
            <div id="products" className="bg-white py-12">
                {currentBranch ? (
                    <div className="space-y-16">
                        {sections && sections.length > 0 ? (
                            sections.map((section: any) => {
                                // section.products is already loaded from backend
                                if (!section.products || section.products.length === 0) return null;
                                const displayedProducts = section.products.slice(0, 12);

                                return (
                                    <div key={section.id}>
                                        <div className="px-4 sm:px-6 lg:px-8 mb-6">
                                            <div className="flex items-center justify-between">
                                                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary-900 uppercase tracking-tight">
                                                    {section.name}
                                                </h2>
                                                <button
                                                    onClick={() => router.get(`/section/${section.slug}`, { branch: currentBranch || '' }, { preserveState: false })}
                                                    className="text-primary-600 hover:text-primary-800 font-semibold flex items-center gap-1 text-sm"
                                                >
                                                    View All <ChevronRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="px-4 sm:px-6 lg:px-8">
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                                {displayedProducts.map((product: any) => (
                                                    <ProductCard
                                                        key={product.id}
                                                        product={product}
                                                        themeColors={themeColors}
                                                        onViewProduct={openQuickView}
                                                        onReserve={openReservation}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            /* Fallback: show all products without sections */
                            <div className="px-4 sm:px-6 lg:px-8">
                                <div className="mx-auto max-w-7xl mb-6">
                                    <h2 className="text-xl sm:text-2xl font-black text-primary-900 uppercase tracking-tight">
                                        All Products
                                    </h2>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                    {products.slice(0, 24).map((product: any) => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            themeColors={themeColors}
                                            onViewProduct={openQuickView}
                                            onReserve={openReservation}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    // Branch Selection Screen
                    <BranchSelectionSection
                        branches={branches}
                        nearestBranch={nearestBranch}
                        isLocating={isLocating}
                        onFindNearest={findNearestStore}
                        themeColors={themeColors}
                    />
                )}
            </div>

            {/* Testimonials */}
            <TestimonialsCarousel />

            {/* Brand Logos */}
            <BrandLogosCarousel />

            {/* Newsletter */}
            <div className="bg-white py-16 border-t border-gray-100">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-primary-900 mb-4">Stay Updated</h2>
                    <p className="text-gray-600 mb-8 max-w-xl mx-auto">
                        Subscribe to our newsletter for exclusive deals and new arrivals.
                    </p>
                    <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                        />
                        <button type="submit" className="bg-primary-700 text-white px-6 py-3 rounded-lg font-bold hover:bg-primary-800 transition-colors">
                            Subscribe
                        </button>
                    </form>
                </div>
            </div>

            {/* Reservation Modal */}
            <Modal show={isReservationOpen} onClose={closeModal}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        Reserve {selectedProduct?.name}
                    </h2>
                    <form onSubmit={submitReservation} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="branch" value="Select Pickup Branch" />
                            <select
                                id="branch"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                value={data.branch_id}
                                onChange={(e) => setData('branch_id', e.target.value)}
                                required
                            >
                                <option value="" disabled>Select a branch</option>
                                {branches.map((b: any) => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                            {errors.branch_id && <p className="text-red-500 text-xs mt-1">{errors.branch_id}</p>}
                        </div>

                        <div>
                            <InputLabel htmlFor="name" value="Your Name" />
                            <TextInput
                                id="name"
                                type="text"
                                className="mt-1 block w-full"
                                value={data.customer_name}
                                onChange={(e) => setData('customer_name', e.target.value)}
                                required
                            />
                            {errors.customer_name && <p className="text-red-500 text-xs mt-1">{errors.customer_name}</p>}
                        </div>

                        <div>
                            <InputLabel htmlFor="contact" value="Contact Number" />
                            <TextInput
                                id="contact"
                                type="text"
                                className="mt-1 block w-full"
                                value={data.customer_contact}
                                onChange={(e) => setData('customer_contact', e.target.value)}
                                required
                            />
                            {errors.customer_contact && <p className="text-red-500 text-xs mt-1">{errors.customer_contact}</p>}
                        </div>

                        <div>
                            <InputLabel htmlFor="qty" value="Quantity" />
                            <TextInput
                                id="qty"
                                type="number"
                                className="mt-1 block w-full"
                                value={data.items[0]?.quantity || 1}
                                onChange={(e) => {
                                    const newItems = [...data.items];
                                    if (newItems[0]) newItems[0].quantity = e.target.value;
                                    setData('items', newItems);
                                }}
                                min="1"
                                required
                            />
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <SecondaryButton onClick={closeModal}>Cancel</SecondaryButton>
                            <PrimaryButton disabled={processing}>Confirm Reservation</PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Quick View Modal */}
            <QuickViewModal
                product={selectedProduct}
                isOpen={isQuickViewOpen}
                onClose={closeQuickView}
                onAddToCart={handleAddToCart}
                onReserve={() => {
                    closeQuickView();
                    if (selectedProduct) openReservation(selectedProduct);
                }}
                addedToCart={addedToCart}
                currentBranch={currentBranch}
            />
        </PublicLayout>
    );
}

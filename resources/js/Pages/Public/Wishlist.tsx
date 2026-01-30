import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/hooks/useCart';
import { Trash2, ShoppingCart, Heart, ArrowLeft } from 'lucide-react';

interface WishlistProps {
    branches: any[];
    companyEmail: string;
    themeColors: { primary: string; secondary: string; accent: string };
    tagline: string;
}

export default function Wishlist({ branches, companyEmail, themeColors, tagline }: WishlistProps) {
    const { items, removeItem, clearWishlist, getCount } = useWishlist();
    const { addItem: addToCart } = useCart();

    const handleAddToCart = (item: any) => {
        addToCart({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
        });
    };

    return (
        <PublicLayout
            branches={branches}
            companyEmail={companyEmail}
            themeColors={themeColors}
            tagline={tagline}
        >
            <Head title="Your Wishlist" />

            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 mb-2 text-sm"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span className="hidden sm:inline">Continue Shopping</span>
                                <span className="sm:hidden">Back</span>
                            </Link>
                            <h1 className="text-xl sm:text-3xl font-black text-gray-900">Your Wishlist</h1>
                            <p className="text-gray-500 mt-1 text-sm">{getCount()} items saved</p>
                        </div>
                        {items.length > 0 && (
                            <button
                                onClick={() => clearWishlist()}
                                className="text-red-500 hover:text-red-700 text-sm font-medium"
                            >
                                Clear All
                            </button>
                        )}
                    </div>

                    {items.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h2 className="text-xl font-bold text-gray-700 mb-2">Your wishlist is empty</h2>
                            <p className="text-gray-500 mb-6">Save items you love for later</p>
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-800 transition-colors"
                            >
                                <Heart className="w-5 h-5" />
                                Explore Products
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            {items.map((item) => (
                                <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden group">
                                    <div className="relative aspect-square bg-gray-100">
                                        <img
                                            src={item.image || `https://placehold.co/300x300?text=${encodeURIComponent(item.name)}`}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="p-3 sm:p-4">
                                        <h3 className="font-bold text-gray-900 truncate text-sm sm:text-base">{item.name}</h3>
                                        <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 mt-1">{item.description || 'Premium automotive part'}</p>
                                        <p className="text-base sm:text-lg font-bold text-purple-700 mt-2">
                                            ₱{item.price.toLocaleString()}
                                        </p>
                                        <button
                                            onClick={() => handleAddToCart(item)}
                                            className="w-full mt-3 py-2 bg-purple-700 text-white rounded-lg font-semibold hover:bg-purple-800 transition-colors flex items-center justify-center gap-2 text-sm"
                                        >
                                            <ShoppingCart className="w-4 h-4" />
                                            <span className="hidden sm:inline">Add to Cart</span>
                                            <span className="sm:hidden">Add</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}

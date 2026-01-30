import { Star, Heart } from 'lucide-react';
import { useWishlist } from '@/hooks/useWishlist';

interface ProductCardProps {
    product: {
        id: number;
        name: string;
        description?: string;
        price: number;
        branches?: any[];
    };
    themeColors?: { primary: string; secondary: string; accent: string };
    onViewProduct: (product: any) => void;
    onReserve: (product: any) => void;
}

export default function ProductCard({
    product,
    themeColors = { primary: 'purple', secondary: 'gray', accent: 'red' },
    onViewProduct,
    onReserve
}: ProductCardProps) {
    const { isInWishlist, toggleItem } = useWishlist();
    const inWishlist = isInWishlist(product.id);

    const handleToggleWishlist = (e: React.MouseEvent) => {
        e.stopPropagation();
        toggleItem({
            id: product.id,
            name: product.name,
            price: product.price,
            description: product.description,
            image: 'https://placehold.co/300?text=' + encodeURIComponent(product.name),
        });
    };

    return (
        <div className="product-card group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
            {/* Sale Badge */}
            <div className="absolute top-2 left-2 z-10">
                <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                    Save ₱{Math.floor(product.price * 0.1)}
                </span>
            </div>

            {/* Wishlist Button */}
            <button
                onClick={handleToggleWishlist}
                className={`absolute top-2 right-2 z-10 p-2 rounded-full shadow-md transition-all ${inWishlist
                    ? 'bg-pink-500 text-white'
                    : 'bg-white text-gray-400 hover:text-pink-500'
                    }`}
            >
                <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
            </button>

            <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img
                    src={'https://placehold.co/300?text=' + encodeURIComponent(product.name)}
                    alt={product.name}
                    className="product-image h-full w-full object-cover"
                />
            </div>
            <div className="p-3 flex-1 flex flex-col">
                <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
                <p className="text-xs text-gray-500 mb-2 line-clamp-2 flex-grow">{product.description || 'Premium quality automotive part'}</p>

                <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-lg font-bold text-gray-900">₱{product.price}</span>
                    <span className="text-xs text-gray-400 line-through">₱{Math.floor(product.price * 1.1)}</span>
                </div>

                <button
                    onClick={() => onViewProduct(product)}
                    className={`w-full bg-${themeColors.primary}-900 text-white py-2 rounded-lg font-semibold text-xs hover:bg-${themeColors.primary}-800 transition-colors`}
                    style={{ backgroundColor: themeColors.primary === 'purple' ? '#581c87' : undefined }}
                >
                    VIEW PRODUCT
                </button>

                <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                        {product.branches?.length || 0} branches
                    </span>
                    <button
                        onClick={() => onReserve(product)}
                        className={`text-${themeColors.primary}-600 hover:text-${themeColors.primary}-800 font-semibold flex items-center gap-1`}
                        style={{ color: themeColors.primary === 'purple' ? '#9333ea' : undefined }}
                    >
                        <Star className="w-3 h-3" />
                        Reserve
                    </button>
                </div>
            </div>
        </div>
    );
}

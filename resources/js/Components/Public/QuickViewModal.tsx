import { X, ShoppingCart, Check } from 'lucide-react';
import Modal from '@/Components/Modal';

interface QuickViewModalProps {
    product: any;
    isOpen: boolean;
    onClose: () => void;
    onAddToCart: () => void;
    onReserve: () => void;
    addedToCart: boolean;
    currentBranch?: string;
}

export default function QuickViewModal({
    product,
    isOpen,
    onClose,
    onAddToCart,
    onReserve,
    addedToCart,
    currentBranch,
}: QuickViewModalProps) {
    if (!product) return null;

    return (
        <Modal show={isOpen} onClose={onClose} maxWidth="sm">
            <div className="flex flex-col sm:flex-row">
                {/* Product Image */}
                <div className="sm:w-2/5 bg-gray-100 flex items-center justify-center p-4">
                    <img
                        src={'https://placehold.co/200x200?text=' + encodeURIComponent(product.name)}
                        alt={product.name}
                        className="w-32 h-32 object-contain rounded"
                    />
                </div>

                {/* Product Details */}
                <div className="sm:w-3/5 p-4 flex flex-col">
                    <button
                        onClick={onClose}
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <span className="text-[10px] font-semibold text-purple-600 uppercase tracking-wide mb-1">
                        {currentBranch || 'Multiple Branches'}
                    </span>

                    <h2 className="text-lg font-bold text-gray-900 mb-1 leading-tight">
                        {product.name}
                    </h2>

                    <p className="text-gray-500 text-xs mb-2 line-clamp-2">
                        {product.description || 'Premium automotive part'}
                    </p>

                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-xl font-bold text-gray-900">
                            ₱{product.price?.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-400 line-through">
                            ₱{Math.floor(product.price * 1.1).toLocaleString()}
                        </span>
                        <span className="bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                            -10%
                        </span>
                    </div>

                    <div className="text-xs text-gray-500 mb-3">
                        {product.branches?.length > 0 ? (
                            <span className="text-green-600">In Stock ({product.branches.length})</span>
                        ) : (
                            <span className="text-yellow-600">Order Basis</span>
                        )}
                    </div>

                    <div className="flex gap-2 mt-auto">
                        <button
                            onClick={onAddToCart}
                            disabled={addedToCart}
                            className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded font-semibold text-white text-xs transition-all whitespace-nowrap ${addedToCart
                                ? 'bg-green-500'
                                : 'bg-purple-700 hover:bg-purple-800'
                                }`}
                        >
                            {addedToCart ? (
                                <><Check className="w-3.5 h-3.5" /> Added</>
                            ) : (
                                <><ShoppingCart className="w-3.5 h-3.5" /> Add to Cart</>
                            )}
                        </button>
                        <button
                            onClick={onReserve}
                            className="flex-1 py-2 px-3 border border-purple-700 text-purple-700 rounded font-semibold text-xs hover:bg-purple-50 transition-colors whitespace-nowrap"
                        >
                            Reserve
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}

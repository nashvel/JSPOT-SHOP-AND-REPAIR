import PublicLayout from '@/Layouts/PublicLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Star, X, ChevronRight } from 'lucide-react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function Section({ section, products, branches, currentBranch, searchIndex, companyEmail, themeColors = { primary: 'purple', secondary: 'gray', accent: 'red' }, tagline, canLogin }: any) {
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [isReservationOpen, setIsReservationOpen] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        branch_id: currentBranch ? branches.find((b: any) => b.name === currentBranch)?.id : (branches[0]?.id || ''),
        customer_name: '',
        customer_contact: '',
        items: [] as any[],
    });

    const openReservation = (product: any) => {
        setSelectedProduct(product);
        setData('items', [{
            product_id: product.id,
            product_name: product.name,
            quantity: 1,
            price: product.price
        }]);
        setIsReservationOpen(true);
    };

    const closeModal = () => {
        setIsReservationOpen(false);
        setSelectedProduct(null);
        reset();
    };

    const submitReservation = (e: any) => {
        e.preventDefault();
        post(route('public.reserve'), {
            onSuccess: () => {
                closeModal();
                // Optional: show success message
            }
        });
    };

    return (
        <PublicLayout
            branches={branches}
            currentBranch={currentBranch}
            searchIndex={searchIndex}
            companyEmail={companyEmail}
            themeColors={themeColors}
            tagline={tagline}
        >
            <Head title={`${section.name} | JSPOT Motors`} />

            <div className="bg-white py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center mb-12">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-purple-900 uppercase tracking-tight mb-4">
                        {section.name}
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                        {section.description}
                    </p>
                </div>

                {!currentBranch ? (
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center py-12">
                        <div className="text-center mb-12">
                            <h2 className="text-2xl font-black text-purple-900 uppercase tracking-tight mb-4">
                                Select Your Branch
                            </h2>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                To view accurate stock for <strong>{section.name}</strong>, please select a branch.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            {branches.map((branch: any) => (
                                <button
                                    key={branch.id}
                                    onClick={() => {
                                        router.get(`/section/${section.slug}`, { branch: branch.name }, { preserveState: false });
                                    }}
                                    className="group relative bg-gray-50 p-6 rounded-2xl hover:bg-white hover:shadow-xl border-2 border-transparent hover:border-purple-500 transition-all duration-300 text-left flex flex-col h-full"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="bg-white group-hover:bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center transition-colors">
                                            <Star className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-purple-700 transition-colors">
                                        {branch.name}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {branch.contact_number}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="px-4 sm:px-6 lg:px-8">
                        {products.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                {products.map((product: any) => (
                                    <div key={product.id} className="product-card group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300">
                                        {/* Sale Badge */}
                                        <div className="absolute top-2 left-2 z-10">
                                            <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                                                Save ₱{Math.floor(product.price * 0.1)}
                                            </span>
                                        </div>

                                        <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                                            <img
                                                src={'https://placehold.co/300?text=' + encodeURIComponent(product.name)}
                                                alt={product.name}
                                                className="product-image h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="p-3">
                                            <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
                                            <p className="text-xs text-gray-500 mb-2 line-clamp-2">{product.description || 'Premium quality automotive part'}</p>

                                            <div className="flex items-baseline gap-2 mb-2">
                                                <span className="text-lg font-bold text-gray-900">₱{product.price}</span>
                                                <span className="text-xs text-gray-400 line-through">₱{Math.floor(product.price * 1.1)}</span>
                                            </div>

                                            <button
                                                onClick={() => openReservation(product)}
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
                                                    onClick={() => openReservation(product)}
                                                    className={`text-${themeColors.primary}-600 hover:text-${themeColors.primary}-800 font-semibold flex items-center gap-1`}
                                                    style={{ color: themeColors.primary === 'purple' ? '#9333ea' : undefined }}
                                                >
                                                    <Star className="w-3 h-3" />
                                                    Reserve
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                No products found in this section for this branch.
                            </div>
                        )}
                    </div>
                )}
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
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-purple-500 focus:ring-purple-500"
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

                        <div className="mt-6 flex justify-end gap-3">
                            <SecondaryButton onClick={closeModal}>Cancel</SecondaryButton>
                            <PrimaryButton disabled={processing}>Submit Reservation</PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>
        </PublicLayout>
    );
}

import PublicLayout from '@/Layouts/PublicLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function Index({ products, branches, currentBranch, canLogin }: any) {
    const [search, setSearch] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [isReservationOpen, setIsReservationOpen] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        branch_id: currentBranch || (branches[0]?.id || ''),
        customer_name: '',
        customer_contact: '',
        items: [] as any[],
    });

    const handleBranchChange = (e: any) => {
        router.get('/', { branch: e.target.value }, { preserveState: true });
        setData('branch_id', e.target.value);
    };

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

    return (
        <PublicLayout>
            <Head title="Catalog" />

            {/* Hero & Filters */}
            <div className="bg-gray-50 py-12 border-b border-gray-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-6">
                        Find the best parts for your ride.
                    </h1>

                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full sm:w-auto">
                            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search parts, oils, accessories..."
                                className="w-full rounded-lg border-gray-300 pl-10 h-12 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="relative w-full sm:w-64">
                            <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <select
                                value={currentBranch || ''}
                                onChange={handleBranchChange}
                                className="w-full rounded-lg border-gray-300 pl-10 h-12 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">All Branches</option>
                                {branches.map((b: any) => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.filter((p: any) => p.name.toLowerCase().includes(search.toLowerCase())).map((product: any) => (
                        <div key={product.id} className="group relative bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="aspect-square bg-gray-100 flex items-center justify-center">
                                {/* Placeholder for Image */}
                                <img
                                    src={'https://placehold.co/400?text=' + product.name}
                                    alt={product.name}
                                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                                <p className="text-sm text-gray-500 mt-1">{product.description}</p>
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="text-lg font-bold text-gray-900">₱{product.price}</span>
                                    <button
                                        onClick={() => openReservation(product)}
                                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                    >
                                        Reserve Now
                                    </button>
                                </div>
                                <div className="mt-2 text-xs text-gray-400">
                                    Available in {product.branches?.length || 0} branches
                                </div>
                            </div>
                        </div>
                    ))}
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
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
        </PublicLayout>
    );
}

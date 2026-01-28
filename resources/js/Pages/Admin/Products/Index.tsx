import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, useForm, router } from '@inertiajs/react'; // Added routers
import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Package } from 'lucide-react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function Index({ products, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [modal, setModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editProduct, setEditProduct] = useState<any>(null);

    const { data, setData, post, put, delete: destroy, processing, reset, errors } = useForm({
        name: '',
        sku: '',
        price: '',
        description: '', // Optional
    });

    // Search Logic
    const handleSearch = (e: any) => {
        setSearch(e.target.value);
        router.get(route('admin.products.index'), { search: e.target.value }, { preserveState: true, replace: true });
    };

    // Modal Logic
    const openAddModal = () => {
        reset();
        setIsEditing(false);
        setModal(true);
    };

    const openEditModal = (product: any) => {
        setEditProduct(product);
        setData({
            name: product.name,
            sku: product.sku,
            price: product.price,
            description: product.description || '',
        });
        setIsEditing(true);
        setModal(true);
    };

    const handleSubmit = (e: any) => {
        e.preventDefault();
        if (isEditing) {
            put(route('admin.products.update', editProduct.id), {
                onSuccess: () => setModal(false),
            });
        } else {
            post(route('admin.products.store'), {
                onSuccess: () => setModal(false),
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this product?')) {
            destroy(route('admin.products.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Products" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">

                        {/* Header & Actions */}
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Inventory Management</h3>
                                <p className="text-sm text-gray-500">Manage your product catalog and prices.</p>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <div className="relative flex-1 md:w-64">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name or SKU..."
                                        value={search}
                                        onChange={handleSearch}
                                        className="pl-9 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>
                                <PrimaryButton onClick={openAddModal} className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" /> Add Product
                                </PrimaryButton>
                            </div>
                        </div>

                        {/* DataGrid */}
                        <div className="overflow-x-auto border rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Stock</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {products.data.length > 0 ? (
                                        products.data.map((product: any) => (
                                            <tr key={product.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center">
                                                            <Package className="h-5 w-5 text-gray-400" />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                            <div className="text-xs text-gray-500">{product.branches?.length || 0} Branches</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {product.sku || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                    ₱{Number(product.price).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                        {product.branches?.reduce((acc: number, b: any) => acc + b.pivot.stock_quantity, 0)} Units
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button onClick={() => openEditModal(product)} className="text-indigo-600 hover:text-indigo-900 mr-3">
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-4 text-center text-gray-500 text-sm">
                                                No products found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination (Simplified) */}
                        <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
                            <div>Showing {products.from} to {products.to} of {products.total} results</div>
                            <div className="flex gap-2">
                                {products.links.map((link: any, index: number) => (
                                    link.url ? (
                                        <a
                                            key={index}
                                            href={link.url}
                                            className={`px-3 py-1 border rounded ${link.active ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : null
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Product Modal */}
            <Modal show={modal} onClose={() => setModal(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        {isEditing ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="name" value="Product Name" />
                            <TextInput
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            />
                            {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="sku" value="SKU (Stock Keeping Unit)" />
                                <TextInput
                                    id="sku"
                                    value={data.sku}
                                    onChange={(e) => setData('sku', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                                {errors.sku && <div className="text-red-500 text-xs mt-1">{errors.sku}</div>}
                            </div>
                            <div>
                                <InputLabel htmlFor="price" value="Price (PHP)" />
                                <TextInput
                                    id="price"
                                    type="number"
                                    value={data.price}
                                    onChange={(e) => setData('price', e.target.value)}
                                    className="mt-1 block w-full"
                                    required
                                />
                                {errors.price && <div className="text-red-500 text-xs mt-1">{errors.price}</div>}
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <SecondaryButton onClick={() => setModal(false)}>Cancel</SecondaryButton>
                            <PrimaryButton disabled={processing}>
                                {isEditing ? 'Save Changes' : 'Create Product'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

        </AuthenticatedLayout>
    );
}

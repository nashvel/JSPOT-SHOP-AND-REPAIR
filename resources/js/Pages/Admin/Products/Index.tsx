import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Search, Edit2, Package, Wrench } from 'lucide-react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function Index({ products, filters }: any) {
    const { flash } = usePage().props as any;
    const [search, setSearch] = useState(filters.search || '');
    const [typeFilter, setTypeFilter] = useState(filters.type || '');
    const [modal, setModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editProduct, setEditProduct] = useState<any>(null);

    const { data, setData, post, put, processing, reset, errors } = useForm({
        type: 'product' as 'product' | 'service',
        name: '',
        sku: '',
        price: '',
        description: '',
    });

    // Search Logic
    const handleSearch = (e: any) => {
        setSearch(e.target.value);
        router.get(route('admin.products.index'), { search: e.target.value, type: typeFilter }, { preserveState: true, replace: true });
    };

    const handleTypeFilter = (type: string) => {
        setTypeFilter(type);
        router.get(route('admin.products.index'), { search, type }, { preserveState: true, replace: true });
    };

    // Modal Logic
    const openAddModal = (type: 'product' | 'service') => {
        reset();
        setData('type', type);
        setIsEditing(false);
        setModal(true);
    };

    const openEditModal = (product: any) => {
        setEditProduct(product);
        setData({
            type: product.type,
            name: product.name,
            sku: product.sku || '',
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

    return (
        <AuthenticatedLayout>
            <Head title="Products & Services" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">

                        {/* Flash Messages */}
                        {flash?.success && (
                            <div className="mb-4 rounded-md bg-green-50 p-4 border border-green-200">
                                <p className="text-sm font-medium text-green-800">{flash.success}</p>
                            </div>
                        )}

                        {/* Header & Actions */}
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Products & Services</h3>
                                <p className="text-sm text-gray-500">Manage your product and service catalog.</p>
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
                                <button
                                    onClick={() => openAddModal('product')}
                                    className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                                >
                                    <Package className="h-4 w-4" /> Add Product
                                </button>
                                <button
                                    onClick={() => openAddModal('service')}
                                    className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                                >
                                    <Wrench className="h-4 w-4" /> Add Service
                                </button>
                            </div>
                        </div>

                        {/* Type Filter Tabs */}
                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={() => handleTypeFilter('')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${!typeFilter ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => handleTypeFilter('product')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${typeFilter === 'product' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                <Package className="h-4 w-4 inline mr-1" /> Products
                            </button>
                            <button
                                onClick={() => handleTypeFilter('service')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${typeFilter === 'service' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                <Wrench className="h-4 w-4 inline mr-1" /> Services
                            </button>
                        </div>

                        {/* DataGrid */}
                        <div className="overflow-x-auto border rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {products.data.length > 0 ? (
                                        products.data.map((product: any) => (
                                            <tr key={product.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {product.type === 'product' ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-medium">
                                                            <Package className="h-3 w-3" /> Product
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-medium">
                                                            <Wrench className="h-3 w-3" /> Service
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                    {product.description && (
                                                        <div className="text-xs text-gray-500 truncate max-w-xs">{product.description}</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {product.sku || '—'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                    ₱{Number(product.price).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {product.type === 'product' ? (
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                            {product.branches?.reduce((acc: number, b: any) => acc + b.pivot.stock_quantity, 0) || 0} Units
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">N/A</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button onClick={() => openEditModal(product)} className="text-indigo-600 hover:text-indigo-900">
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    {/* Delete only available in Inventory Management */}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-4 text-center text-gray-500 text-sm">
                                                No products or services found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {products.total > 0 && (
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
                        )}

                    </div>
                </div>
            </div>

            {/* Product/Service Modal */}
            <Modal show={modal} onClose={() => setModal(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                        {data.type === 'product' ? <Package className="h-5 w-5 text-indigo-600" /> : <Wrench className="h-5 w-5 text-emerald-600" />}
                        {isEditing ? `Edit ${data.type === 'product' ? 'Product' : 'Service'}` : `Add New ${data.type === 'product' ? 'Product' : 'Service'}`}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="name" value="Name" />
                            <TextInput
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            />
                            {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
                        </div>

                        <div>
                            <InputLabel htmlFor="description" value="Description (optional)" />
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                rows={2}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="sku" value={data.type === 'product' ? 'SKU (Stock Keeping Unit)' : 'Service Code (optional)'} />
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
                                {isEditing ? 'Save Changes' : `Create ${data.type === 'product' ? 'Product' : 'Service'}`}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

        </AuthenticatedLayout>
    );
}

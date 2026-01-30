import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';
import { Plus, Search, Edit2, Package, Wrench } from 'lucide-react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Swal from 'sweetalert2';

export default function Index({ products, categories: initialCategories, branches, filters, userBranchId }: any) {
    const { flash } = usePage().props as any;
    const [search, setSearch] = useState(filters.search || '');
    const [typeFilter, setTypeFilter] = useState(filters.type || '');
    const [branchId, setBranchId] = useState(filters.branch_id || '');
    const [modal, setModal] = useState(false);
    const [quickAddCategory, setQuickAddCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [categories, setCategories] = useState(initialCategories || []);

    const { data, setData, post, processing, reset, errors } = useForm({
        type: 'product' as 'product' | 'service',
        name: '',
        sku: '',
        price: '',
        cost: '',
        description: '',
        category_id: '',
    });

    // Search Logic
    const handleSearch = (e: any) => {
        setSearch(e.target.value);
        router.get(route('admin.products.index'), { search: e.target.value, type: typeFilter, branch_id: branchId }, { preserveState: true, replace: true });
    };

    const handleTypeFilter = (type: string) => {
        setTypeFilter(type);
        router.get(route('admin.products.index'), { search, type, branch_id: branchId }, { preserveState: true, replace: true });
    };

    const handleBranchFilter = (branch: string) => {
        setBranchId(branch);
        router.get(route('admin.products.index'), { search, type: typeFilter, branch_id: branch }, { preserveState: true, replace: true });
    };

    // Modal Logic
    const openAddModal = (type: 'product' | 'service') => {
        reset();
        setData('type', type);
        setModal(true);
    };

    const handleSubmit = (e: any) => {
        e.preventDefault();
        post(route('admin.products.store'), {
            onSuccess: () => setModal(false),
        });
    };

    const handleQuickAddCategory = async () => {
        if (!newCategoryName.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Category Name Required',
                text: 'Please enter a category name.',
                confirmButtonColor: '#4F46E5',
            });
            return;
        }
        
        try {
            const response = await axios.post(route('categories.store'), {
                name: newCategoryName,
                type: data.type
            });
            
            // Add new category to the list
            const newCategory = response.data.category;
            setCategories([...categories, newCategory]);
            
            // Auto-select the new category
            setData('category_id', newCategory.id.toString());
            
            // Reset and close quick add
            setNewCategoryName('');
            setQuickAddCategory(false);
            
            // Show success message
            Swal.fire({
                icon: 'success',
                title: 'Category Created!',
                text: `${newCategory.name} has been added successfully.`,
                timer: 2000,
                showConfirmButton: false,
            });
        } catch (error: any) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to create category.',
                confirmButtonColor: '#4F46E5',
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

                        {/* Filters */}
                        <div className="flex gap-2 mb-4 items-center">
                            {/* Type Filter Tabs */}
                            <div className="flex gap-2">
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

                            {/* Branch Filter (System Admin Only) */}
                            {!userBranchId && (
                                <select
                                    value={branchId}
                                    onChange={(e) => handleBranchFilter(e.target.value)}
                                    className="ml-auto rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                >
                                    <option value="">All Branches</option>
                                    {branches?.map((branch: any) => (
                                        <option key={branch.id} value={branch.id}>{branch.name}</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* DataGrid */}
                        <div className="overflow-x-auto border rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
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
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {product.category?.name || '—'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {product.sku || '—'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    ₱{Number(product.cost || 0).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                    ₱{Number(product.price).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {product.type === 'product' ? (
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                            {Array.isArray(product.branches) 
                                                                ? product.branches.reduce((acc: number, b: any) => acc + (b.pivot?.stock_quantity || 0), 0)
                                                                : 0} Units
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">N/A</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-4 text-center text-gray-500 text-sm">
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
                        Add New {data.type === 'product' ? 'Product' : 'Service'}
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
                            <InputLabel htmlFor="category" value="Category" />
                            <div className="flex gap-2">
                                <select
                                    id="category"
                                    value={data.category_id}
                                    onChange={(e) => setData('category_id', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">Select Category</option>
                                    {categories?.filter((c: any) => c.type === data.type).map((c: any) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => setQuickAddCategory(!quickAddCategory)}
                                    className="mt-1 p-2 bg-gray-100 rounded-md hover:bg-gray-200"
                                    title="Add New Category"
                                >
                                    <Plus className="h-5 w-5 text-gray-600" />
                                </button>
                            </div>
                            {errors.category_id && <div className="text-red-500 text-xs mt-1">{errors.category_id}</div>}

                            {/* Quick Add Category Input */}
                            {quickAddCategory && (
                                <div className="mt-2 flex gap-2">
                                    <TextInput
                                        placeholder="New Category Name"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        className="block w-full text-sm"
                                    />
                                    <SecondaryButton onClick={handleQuickAddCategory} type="button" disabled={!newCategoryName}>
                                        Save
                                    </SecondaryButton>
                                </div>
                            )}
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
                                <InputLabel htmlFor="sku" value={data.type === 'product' ? 'SKU' : 'Service Code'} />
                                <TextInput
                                    id="sku"
                                    value={data.sku}
                                    onChange={(e) => setData('sku', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                                {errors.sku && <div className="text-red-500 text-xs mt-1">{errors.sku}</div>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="cost" value="Cost (PHP)" />
                                <TextInput
                                    id="cost"
                                    type="number"
                                    value={data.cost}
                                    onChange={(e) => setData('cost', e.target.value)}
                                    className="mt-1 block w-full"
                                    required
                                />
                                {errors.cost && <div className="text-red-500 text-xs mt-1">{errors.cost}</div>}
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
                                Create {data.type === 'product' ? 'Product' : 'Service'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

        </AuthenticatedLayout>
    );
}

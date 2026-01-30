import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Search, Plus, Minus, Trash2, Package, AlertTriangle, Edit2 } from 'lucide-react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

interface Branch {
    id: number;
    name: string;
    pivot: { stock_quantity: number };
}

interface Product {
    id: number;
    name: string;
    sku: string;
    price: number;
    cost: number;
    description: string | null;
    category_id: number | null;
    category: { id: number; name: string } | null;
    branches: Branch[];
}

interface Props {
    products: {
        data: Product[];
        from: number;
        to: number;
        total: number;
        links: any[];
    };
    branches: { id: number; name: string }[];
    categories: { id: number; name: string; type: string }[];
    filters: { search?: string; branch_id?: number };
    userBranchId: number | null;
}

export default function Index({ products, branches, categories, filters, userBranchId }: Props) {
    const { flash } = usePage().props as any;
    const [search, setSearch] = useState(filters.search || '');
    const [branchId, setBranchId] = useState(filters.branch_id || '');
    const [adjustModal, setAdjustModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const adjustForm = useForm({
        branch_id: userBranchId || (branches[0]?.id || 0),
        adjustment: 1,
        type: 'add' as 'add' | 'subtract',
        reason: '',
    });

    const { delete: destroy, processing: deleteProcessing } = useForm({});

    const [editModal, setEditModal] = useState(false);
    const editForm = useForm({
        name: '',
        sku: '',
        price: '',
        cost: '',
        category_id: '',
        description: '',
    });

    const handleSearch = (e: any) => {
        setSearch(e.target.value);
        router.get(route('admin.stocks.index'), { search: e.target.value, branch_id: branchId }, { preserveState: true, replace: true });
    };

    const handleBranchFilter = (branch: string) => {
        setBranchId(branch);
        router.get(route('admin.stocks.index'), { search, branch_id: branch }, { preserveState: true, replace: true });
    };

    const openAdjustModal = (product: Product, type: 'add' | 'subtract') => {
        setSelectedProduct(product);
        adjustForm.setData({
            branch_id: userBranchId || (branches[0]?.id || 0),
            adjustment: 1,
            type,
            reason: '',
        });
        setAdjustModal(true);
    };

    const openEditModal = (product: any) => {
        setSelectedProduct(product);
        editForm.setData({
            name: product.name,
            sku: product.sku || '',
            price: product.price,
            cost: product.cost || '',
            category_id: product.category_id || '',
            description: product.description || '',
        });
        setEditModal(true);
    };

    const handleEdit = (e: any) => {
        e.preventDefault();
        if (!selectedProduct) return;
        editForm.put(route('admin.products.update', selectedProduct.id), {
            onSuccess: () => {
                setEditModal(false);
                setSelectedProduct(null);
            },
        });
    };

    const openDeleteModal = (product: Product) => {
        setSelectedProduct(product);
        setDeleteModal(true);
    };

    const handleAdjust = (e: any) => {
        e.preventDefault();
        if (!selectedProduct) return;
        adjustForm.post(route('admin.stocks.adjust', selectedProduct.id), {
            onSuccess: () => {
                setAdjustModal(false);
                setSelectedProduct(null);
            },
        });
    };

    const handleDelete = () => {
        if (!selectedProduct) return;
        destroy(route('admin.stocks.destroy', selectedProduct.id), {
            onSuccess: () => {
                setDeleteModal(false);
                setSelectedProduct(null);
            },
        });
    };

    const getTotalStock = (product: Product) => {
        return product.branches?.reduce((acc, b) => acc + b.pivot.stock_quantity, 0) || 0;
    };

    const getStockForBranch = (product: Product, branchId: number) => {
        const branch = product.branches?.find(b => b.id === branchId);
        return branch?.pivot?.stock_quantity || 0;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Inventory Management" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">

                        {/* Flash Messages */}
                        {flash?.success && (
                            <div className="mb-4 rounded-md bg-green-50 p-4 border border-green-200">
                                <p className="text-sm font-medium text-green-800">{flash.success}</p>
                            </div>
                        )}
                        {flash?.error && (
                            <div className="mb-4 rounded-md bg-red-50 p-4 border border-red-200">
                                <p className="text-sm font-medium text-red-800">{flash.error}</p>
                            </div>
                        )}

                        {/* Header */}
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Inventory Management</h3>
                                <p className="text-sm text-gray-500">
                                    Adjust stock levels and manage product inventory.
                                    {userBranchId && <span className="text-indigo-600 font-medium"> (Showing your branch)</span>}
                                </p>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <div className="relative flex-1 md:w-64">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={search}
                                        onChange={handleSearch}
                                        className="pl-9 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>
                                {/* Branch Filter (System Admin Only) */}
                                {!userBranchId && (
                                    <select
                                        value={branchId}
                                        onChange={(e) => handleBranchFilter(e.target.value)}
                                        className="rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                    >
                                        <option value="">All Branches</option>
                                        {branches?.map((branch) => (
                                            <option key={branch.id} value={branch.id}>{branch.name}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>

                        {/* Products Table */}
                        <div className="overflow-x-auto border rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {products.data.length > 0 ? (
                                        products.data.map((product) => {
                                            const totalStock = getTotalStock(product);
                                            const isLowStock = totalStock < 10;
                                            return (
                                                <tr key={product.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="h-10 w-10 flex-shrink-0 bg-indigo-100 rounded-lg flex items-center justify-center">
                                                                <Package className="h-5 w-5 text-indigo-600" />
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                            </div>
                                                        </div>
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
                                                        <div className="flex items-center gap-2">
                                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${isLowStock ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                                {totalStock} Units
                                                            </span>
                                                            {isLowStock && (
                                                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                                            )}
                                                        </div>
                                                        {/* Branch breakdown */}
                                                        {product.branches.length > 0 && !userBranchId && (
                                                            <div className="mt-1 text-xs text-gray-400">
                                                                {product.branches.slice(0, 3).map(b => (
                                                                    <span key={b.id} className="mr-2">{b.name}: {b.pivot.stock_quantity}</span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <button
                                                                onClick={() => openEditModal(product)}
                                                                className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition"
                                                                title="Edit Details"
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </button>
                                                            <div className="w-px h-4 bg-gray-300 mx-1 self-center"></div>
                                                            <button
                                                                onClick={() => openAdjustModal(product, 'add')}
                                                                className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition"
                                                                title="Add Stock"
                                                            >
                                                                <Plus className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => openAdjustModal(product, 'subtract')}
                                                                className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition"
                                                                title="Subtract Stock"
                                                            >
                                                                <Minus className="h-4 w-4" />
                                                            </button>
                                                            <div className="w-px h-4 bg-gray-300 mx-1 self-center"></div>
                                                            <button
                                                                onClick={() => openDeleteModal(product)}
                                                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                                                                title="Delete Product"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-4 text-center text-gray-500 text-sm">
                                                No products found. Only products (not services) appear here.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {products.total > 0 && (
                            <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
                                <div>Showing {products.from} to {products.to} of {products.total} products</div>
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

            {/* Edit Product Modal */}
            <Modal show={editModal} onClose={() => setEditModal(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                        <Edit2 className="h-5 w-5 text-indigo-600" /> Edit Product Details
                    </h2>
                    <form onSubmit={handleEdit} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="edit_name" value="Name" />
                            <TextInput
                                id="edit_name"
                                value={editForm.data.name}
                                onChange={(e) => editForm.setData('name', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            />
                            {editForm.errors.name && <div className="text-red-500 text-xs mt-1">{editForm.errors.name}</div>}
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_category" value="Category" />
                            <select
                                id="edit_category"
                                value={editForm.data.category_id}
                                onChange={(e) => editForm.setData('category_id', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">Select Category</option>
                                {categories?.filter((c: any) => c.type === 'product').map((c: any) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            {editForm.errors.category_id && <div className="text-red-500 text-xs mt-1">{editForm.errors.category_id}</div>}
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_description" value="Description" />
                            <textarea
                                id="edit_description"
                                value={editForm.data.description}
                                onChange={(e) => editForm.setData('description', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                rows={2}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="edit_sku" value="SKU" />
                                <TextInput
                                    id="edit_sku"
                                    value={editForm.data.sku}
                                    onChange={(e) => editForm.setData('sku', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                                {editForm.errors.sku && <div className="text-red-500 text-xs mt-1">{editForm.errors.sku}</div>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="edit_cost" value="Cost (PHP)" />
                                <TextInput
                                    id="edit_cost"
                                    type="number"
                                    value={editForm.data.cost}
                                    onChange={(e) => editForm.setData('cost', e.target.value)}
                                    className="mt-1 block w-full"
                                    required
                                />
                                {editForm.errors.cost && <div className="text-red-500 text-xs mt-1">{editForm.errors.cost}</div>}
                            </div>
                            <div>
                                <InputLabel htmlFor="edit_price" value="Price (PHP)" />
                                <TextInput
                                    id="edit_price"
                                    type="number"
                                    value={editForm.data.price}
                                    onChange={(e) => editForm.setData('price', e.target.value)}
                                    className="mt-1 block w-full"
                                    required
                                />
                                {editForm.errors.price && <div className="text-red-500 text-xs mt-1">{editForm.errors.price}</div>}
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <SecondaryButton onClick={() => setEditModal(false)}>Cancel</SecondaryButton>
                            <PrimaryButton disabled={editForm.processing}>
                                Save Changes
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Adjust Stock Modal */}
            <Modal show={adjustModal} onClose={() => setAdjustModal(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                        {adjustForm.data.type === 'add' ? (
                            <><Plus className="h-5 w-5 text-green-600" /> Add Stock</>
                        ) : (
                            <><Minus className="h-5 w-5 text-orange-600" /> Subtract Stock</>
                        )}
                    </h2>
                    {selectedProduct && (
                        <p className="text-sm text-gray-500 mb-4">
                            Product: <span className="font-medium text-gray-900">{selectedProduct.name}</span>
                        </p>
                    )}
                    <form onSubmit={handleAdjust} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="branch_id" value="Branch" />
                            <select
                                id="branch_id"
                                value={adjustForm.data.branch_id}
                                onChange={(e) => adjustForm.setData('branch_id', parseInt(e.target.value))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            >
                                {branches.map((branch) => (
                                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <InputLabel htmlFor="adjustment" value="Quantity" />
                            <TextInput
                                id="adjustment"
                                type="number"
                                min="1"
                                value={adjustForm.data.adjustment}
                                onChange={(e) => adjustForm.setData('adjustment', parseInt(e.target.value))}
                                className="mt-1 block w-full"
                                required
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor="reason" value="Reason (optional)" />
                            <textarea
                                id="reason"
                                value={adjustForm.data.reason}
                                onChange={(e) => adjustForm.setData('reason', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder="e.g., New shipment, Damaged goods, etc."
                                rows={2}
                            />
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <SecondaryButton onClick={() => setAdjustModal(false)}>Cancel</SecondaryButton>
                            <PrimaryButton disabled={adjustForm.processing}>
                                {adjustForm.data.type === 'add' ? 'Add Stock' : 'Subtract Stock'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={deleteModal} onClose={() => setDeleteModal(false)}>
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <Trash2 className="h-5 w-5 text-red-600" />
                        </div>
                        <h2 className="text-lg font-medium text-gray-900">Delete Product</h2>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">
                        Are you sure you want to delete <span className="font-medium text-gray-900">{selectedProduct?.name}</span>?
                        This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3">
                        <SecondaryButton onClick={() => setDeleteModal(false)}>Cancel</SecondaryButton>
                        <button
                            onClick={handleDelete}
                            disabled={deleteProcessing}
                            className="inline-flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-700 disabled:opacity-50"
                        >
                            Delete Product
                        </button>
                    </div>
                </div>
            </Modal>

        </AuthenticatedLayout>
    );
}

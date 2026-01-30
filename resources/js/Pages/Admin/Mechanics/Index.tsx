import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Search, Plus, Edit, Trash2, ToggleLeft, ToggleRight, Wrench, History, User } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Branch {
    id: number;
    name: string;
}

interface Mechanic {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    specialization: string | null;
    total_labor_earned: number;
    is_active: boolean;
    branch: Branch;
}

interface Props {
    mechanics: {
        data: Mechanic[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    branches: Branch[];
    filters: {
        search?: string;
        branch_id?: number;
        status?: string;
    };
    userBranchId: number | null;
}

export default function Index({ mechanics, branches, filters, userBranchId }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [branchId, setBranchId] = useState(filters.branch_id?.toString() || '');
    const [status, setStatus] = useState(filters.status || '');

    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(route('admin.mechanics.index'), {
                search,
                branch_id: branchId,
                status,
            }, { preserveState: true, replace: true });
        }, 300);

        return () => clearTimeout(timer);
    }, [search, branchId, status]);

    const toggleStatus = (mechanicId: number) => {
        if (confirm('Are you sure you want to toggle this mechanic\'s status?')) {
            router.post(route('admin.mechanics.toggle-status', mechanicId), {}, {
                preserveScroll: true,
            });
        }
    };

    const deleteMechanic = (mechanicId: number) => {
        if (confirm('Are you sure you want to delete this mechanic? This action cannot be undone.')) {
            router.delete(route('admin.mechanics.destroy', mechanicId));
        }
    };

    const formatPrice = (price: number) => `₱${parseFloat(String(price)).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

    return (
        <AuthenticatedLayout>
            <Head title="Mechanics" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Mechanics</h1>
                            <p className="text-gray-500">Manage mechanics and track labor earnings</p>
                        </div>
                        <Link
                            href={route('admin.mechanics.create')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                        >
                            <Plus className="h-5 w-5" />
                            Add Mechanic
                        </Link>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search mechanics..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            {!userBranchId && (
                                <select
                                    value={branchId}
                                    onChange={e => setBranchId(e.target.value)}
                                    className="rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="">All Branches</option>
                                    {branches.map(branch => (
                                        <option key={branch.id} value={branch.id}>{branch.name}</option>
                                    ))}
                                </select>
                            )}
                            <select
                                value={status}
                                onChange={e => setStatus(e.target.value)}
                                className="rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    {/* Mechanics Table */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mechanic</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specialization</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Labor Earned</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {mechanics.data.map(mechanic => (
                                    <tr key={mechanic.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                    <User className="h-5 w-5 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{mechanic.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{mechanic.email || 'N/A'}</div>
                                            <div className="text-sm text-gray-500">{mechanic.phone || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                                <Wrench className="h-3 w-3" />
                                                {mechanic.specialization || 'General'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{mechanic.branch.name}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-green-600">{formatPrice(mechanic.total_labor_earned)}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleStatus(mechanic.id)}
                                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                                                    mechanic.is_active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}
                                            >
                                                {mechanic.is_active ? (
                                                    <>
                                                        <ToggleRight className="h-4 w-4" />
                                                        Active
                                                    </>
                                                ) : (
                                                    <>
                                                        <ToggleLeft className="h-4 w-4" />
                                                        Inactive
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={route('admin.mechanics.labor-history', mechanic.id)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                    title="Labor History"
                                                >
                                                    <History className="h-4 w-4" />
                                                </Link>
                                                <Link
                                                    href={route('admin.mechanics.edit', mechanic.id)}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                                    title="Edit"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => deleteMechanic(mechanic.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {mechanics.data.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                            No mechanics found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {mechanics.last_page > 1 && (
                            <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
                                <span className="text-sm text-gray-500">
                                    Page {mechanics.current_page} of {mechanics.last_page}
                                </span>
                                <div className="flex gap-2">
                                    {mechanics.links.map((link, i) => (
                                        <Link
                                            key={i}
                                            href={link.url || '#'}
                                            className={`px-3 py-1 rounded text-sm ${
                                                link.active
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-white border hover:bg-gray-100'
                                            } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Shield, UserPlus, Users, Trash2, Edit, Key } from 'lucide-react';
import { useState } from 'react';
import Swal from 'sweetalert2';

interface Admin {
    id: number;
    name: string;
    email: string;
    role: {
        id: number;
        name: string;
        display_name: string;
    };
    menus: Array<{
        id: number;
        name: string;
        route: string;
    }>;
    created_at: string;
    menus_count: number;
}

interface Role {
    id: number;
    name: string;
    display_name: string;
    description: string;
}

interface Menu {
    id: number;
    name: string;
    route: string;
    icon: string;
    group: string;
    order: number;
}

interface Props {
    admins: {
        data: Admin[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    roles: Role[];
    availableMenus: Menu[];
    filters: {
        search?: string;
    };
}

export default function Index({ admins, roles, availableMenus, filters }: Props) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
    const [managingMenus, setManagingMenus] = useState<Admin | null>(null);

    const { data, setData, post, put, processing, reset, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role_id: roles[0]?.id || '',
    });

    const { data: menuData, setData: setMenuData, post: postMenus, processing: processingMenus } = useForm({
        menus: [] as number[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingAdmin) {
            put(route('admin.super-admin.update', editingAdmin.id), {
                onSuccess: () => {
                    setEditingAdmin(null);
                    reset();
                    Swal.fire('Updated!', 'System Admin updated successfully', 'success');
                },
            });
        } else {
            post(route('admin.super-admin.store'), {
                onSuccess: () => {
                    setShowCreateModal(false);
                    reset();
                    Swal.fire('Created!', 'System Admin created successfully', 'success');
                },
            });
        }
    };

    const handleDelete = (admin: Admin) => {
        Swal.fire({
            title: 'Delete System Admin?',
            text: `Are you sure you want to delete ${admin.name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.super-admin.destroy', admin.id), {
                    onSuccess: () => {
                        Swal.fire('Deleted!', 'System Admin deleted successfully', 'success');
                    },
                });
            }
        });
    };

    const openEditModal = (admin: Admin) => {
        setEditingAdmin(admin);
        setData({
            name: admin.name,
            email: admin.email,
            password: '',
            password_confirmation: '',
            role_id: admin.role.id,
        });
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setEditingAdmin(null);
        setManagingMenus(null);
        reset();
    };

    const openMenuModal = (admin: Admin) => {
        setManagingMenus(admin);
        setMenuData('menus', admin.menus.map(m => m.id));
    };

    const handleMenuSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!managingMenus) return;

        postMenus(route('admin.super-admin.menus.update', managingMenus.id), {
            onSuccess: () => {
                setManagingMenus(null);
                Swal.fire('Updated!', 'Menu permissions updated successfully', 'success');
            },
        });
    };

    const toggleMenu = (menuId: number) => {
        const currentMenus = menuData.menus;
        if (currentMenus.includes(menuId)) {
            setMenuData('menus', currentMenus.filter(id => id !== menuId));
        } else {
            setMenuData('menus', [...currentMenus, menuId]);
        }
    };

    const toggleAllMenus = () => {
        if (menuData.menus.length === availableMenus.length) {
            setMenuData('menus', []);
        } else {
            setMenuData('menus', availableMenus.map(m => m.id));
        }
    };

    // Group menus by group
    const groupedMenus = availableMenus.reduce((acc: any, menu: Menu) => {
        const group = menu.group || 'Other';
        if (!acc[group]) acc[group] = [];
        acc[group].push(menu);
        return acc;
    }, {});

    return (
        <AuthenticatedLayout>
            <Head title="Super Admin Panel" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                                <Shield className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Super Admin Panel</h1>
                                <p className="text-gray-500">Manage system administrators and roles</p>
                            </div>
                        </div>
                    </div>

                    {/* Hardcoded Modules */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Create Accounts Module */}
                        <div className="bg-white rounded-xl shadow-sm border-2 border-indigo-100 hover:border-indigo-300 transition-colors">
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                        <UserPlus className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">Create Accounts</h2>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    Create new System Admin accounts with full access to all modules
                                </p>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <UserPlus className="h-5 w-5" />
                                    Create New Admin
                                </button>
                            </div>
                        </div>

                        {/* Create Role Module */}
                        <div className="bg-white rounded-xl shadow-sm border-2 border-purple-100 hover:border-purple-300 transition-colors">
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <Key className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">Create Role</h2>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    Manage roles and permissions for branch users
                                </p>
                                <a
                                    href={route('admin.roles.index')}
                                    className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <Key className="h-5 w-5" />
                                    Manage Roles
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* System Admins List */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Users className="h-5 w-5 text-gray-400" />
                                    <h3 className="text-lg font-semibold text-gray-900">System Administrators</h3>
                                </div>
                                <span className="text-sm text-gray-500">
                                    {admins.data.length} admin{admins.data.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Admin
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Modules
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Created
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {admins.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                                No system administrators found. Create one to get started.
                                            </td>
                                        </tr>
                                    ) : (
                                        admins.data.map((admin) => (
                                            <tr key={admin.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                                            <span className="text-indigo-600 font-semibold">
                                                                {admin.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                                                            <div className="text-xs text-gray-500">{admin.role.display_name}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{admin.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        {admin.menus_count} modules
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(admin.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => openMenuModal(admin)}
                                                        className="text-purple-600 hover:text-purple-900 mr-4"
                                                        title="Manage Menus"
                                                    >
                                                        <Key className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(admin)}
                                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                        title="Edit"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(admin)}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {(showCreateModal || editingAdmin) && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="p-6 border-b">
                            <h3 className="text-xl font-bold text-gray-900">
                                {editingAdmin ? 'Edit System Admin' : 'Create System Admin'}
                            </h3>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                />
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    value={data.role_id}
                                    onChange={e => setData('role_id', parseInt(e.target.value))}
                                    className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                >
                                    {roles.map(role => (
                                        <option key={role.id} value={role.id}>
                                            {role.display_name}
                                        </option>
                                    ))}
                                </select>
                                {errors.role_id && <p className="text-red-500 text-sm mt-1">{errors.role_id}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Password {editingAdmin && '(leave blank to keep current)'}
                                </label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                    required={!editingAdmin}
                                />
                                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                <input
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={e => setData('password_confirmation', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                    required={!editingAdmin}
                                />
                            </div>

                            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                                <p className="text-sm text-indigo-800">
                                    ℹ️ System Admins have full access to all modules and can manage all branches.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {processing ? 'Saving...' : editingAdmin ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Menu Management Modal */}
            {managingMenus && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b">
                            <h3 className="text-xl font-bold text-gray-900">
                                Manage Menu Permissions - {managingMenus.name}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Select which menus this admin can access
                            </p>
                        </div>

                        <form onSubmit={handleMenuSubmit} className="flex-1 overflow-y-auto p-6">
                            <div className="mb-4 flex items-center justify-between bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                                <span className="text-sm font-medium text-indigo-900">
                                    Quick Actions
                                </span>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-gray-500">
                                        {menuData.menus.length} of {availableMenus.length} selected
                                    </span>
                                    <button
                                        type="button"
                                        onClick={toggleAllMenus}
                                        className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 font-medium transition-colors"
                                    >
                                        {menuData.menus.length === availableMenus.length ? 'Deselect All' : 'Allow All Modules'}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {Object.entries(groupedMenus).map(([group, menus]: [string, any]) => (
                                    <div key={group} className="border rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-3 uppercase text-xs tracking-wider">
                                            {group}
                                        </h4>
                                        <div className="space-y-2">
                                            {menus.map((menu: Menu) => (
                                                <label
                                                    key={menu.id}
                                                    className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={menuData.menus.includes(menu.id)}
                                                        onChange={() => toggleMenu(menu.id)}
                                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                    <span className="ml-3 text-sm text-gray-700">{menu.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-3 pt-6 border-t mt-6">
                                <button
                                    type="button"
                                    onClick={() => setManagingMenus(null)}
                                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processingMenus}
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {processingMenus ? 'Saving...' : 'Save Permissions'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

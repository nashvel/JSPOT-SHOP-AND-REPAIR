import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Plus, Edit2, Trash2, Users, Shield } from 'lucide-react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputError from '@/Components/InputError';

interface Role {
    id: number;
    name: string;
    display_name: string;
    description: string | null;
    users_count: number;
}

interface Props {
    roles: Role[];
}

export default function Index({ roles }: Props) {
    const { flash } = usePage().props as any;
    const [showModal, setShowModal] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        display_name: '',
        description: '',
    });

    const openCreateModal = () => {
        reset();
        setEditingRole(null);
        setShowModal(true);
    };

    const openEditModal = (role: Role) => {
        setData({
            name: role.name,
            display_name: role.display_name,
            description: role.description || '',
        });
        setEditingRole(role);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingRole(null);
        reset();
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingRole) {
            put(route('admin.roles.update', editingRole.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('admin.roles.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (role: Role) => {
        if (role.users_count > 0) {
            alert('Cannot delete role with assigned users. Reassign users first.');
            return;
        }
        if (confirm(`Are you sure you want to delete the "${role.display_name}" role?`)) {
            destroy(route('admin.roles.destroy', role.id));
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Role Management</h2>}
        >
            <Head title="Role Management" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
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
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-indigo-600" />
                                        System Roles
                                    </h3>
                                    <p className="text-sm text-gray-500">Manage user roles and permissions</p>
                                </div>
                                <button
                                    onClick={openCreateModal}
                                    className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Role
                                </button>
                            </div>

                            {/* Roles Grid */}
                            <div className="grid gap-4">
                                {roles.map((role) => (
                                    <div
                                        key={role.id}
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-indigo-300 transition"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                                <Shield className="h-5 w-5 text-indigo-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{role.display_name}</h4>
                                                <p className="text-sm text-gray-500">{role.description || 'No description'}</p>
                                                <span className="inline-flex items-center gap-1 text-xs text-gray-400 mt-1">
                                                    <Users className="h-3 w-3" />
                                                    {role.users_count} users
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => openEditModal(role)}
                                                className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(role)}
                                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                                                disabled={role.users_count > 0}
                                                title={role.users_count > 0 ? 'Cannot delete role with users' : 'Delete role'}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create/Edit Modal */}
            <Modal show={showModal} onClose={closeModal}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        {editingRole ? 'Edit Role' : 'Create New Role'}
                    </h2>
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="display_name" value="Role Name" />
                            <TextInput
                                id="display_name"
                                value={data.display_name}
                                onChange={(e) => {
                                    setData('display_name', e.target.value);
                                    // Auto-generate slug from display name
                                    if (!editingRole) {
                                        setData('name', e.target.value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''));
                                    }
                                }}
                                className="mt-1 block w-full"
                                placeholder="e.g., Cashier"
                                required
                            />
                            <InputError message={errors.display_name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="name" value="System Name (lowercase, no spaces)" />
                            <TextInput
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''))}
                                className="mt-1 block w-full font-mono text-sm"
                                placeholder="e.g., cashier"
                                required
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="description" value="Description (optional)" />
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder="What can this role do?"
                                rows={2}
                            />
                            <InputError message={errors.description} className="mt-2" />
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <SecondaryButton onClick={closeModal}>Cancel</SecondaryButton>
                            <PrimaryButton disabled={processing}>
                                {editingRole ? 'Update Role' : 'Create Role'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}

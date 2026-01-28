import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { useState } from 'react';
import { User } from '@/types';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputError from '@/Components/InputError';
import Checkbox from '@/Components/Checkbox';

export default function Index({ users, availableMenus }: { users: User[], availableMenus: any[] }) {
    const [modal, setModal] = useState(false);
    const { data, setData, post, delete: destroy, processing, reset, errors } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'user',
        menus: [] as number[],
    });

    const openModal = () => {
        reset();
        setModal(true);
    };

    const submit = (e: any) => {
        e.preventDefault();
        post(route('admin.users.store'), {
            onSuccess: () => setModal(false),
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this user?')) {
            destroy(route('admin.users.destroy', id));
        }
    };

    const handleMenuChange = (id: number, checked: boolean) => {
        if (checked) {
            setData('menus', [...data.menus, id]);
        } else {
            setData('menus', data.menus.filter(menuId => menuId !== id));
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">User Management</h2>}
        >
            <Head title="User Management" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">

                            {/* Header & Actions */}
                            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">System Users</h3>
                                    <p className="text-sm text-gray-500">Manage access and permissions for your staff.</p>
                                </div>
                                <button
                                    onClick={openModal}
                                    className="inline-flex items-center gap-2 rounded-md bg-gray-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-gray-700 focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-gray-900"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add User
                                </button>
                            </div>

                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Role</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">{user.name}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-gray-500">{user.email}</td>
                                            <td className="whitespace-nowrap px-6 py-4 capitalize">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                                        user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                                                            user.role === 'cashier' ? 'bg-green-100 text-green-800' :
                                                                'bg-orange-100 text-orange-800'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right">
                                                <Link href={route('admin.users.edit', user.id)} className="inline-flex text-indigo-600 hover:text-indigo-900 mr-4">
                                                    <Edit2 className="h-4 w-4" />
                                                </Link>
                                                <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create User Modal */}
            <Modal show={modal} onClose={() => setModal(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Create New User</h2>
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="name" value="Name" />
                            <TextInput
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="email" value="Email" />
                            <TextInput
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="role" value="Role" />
                            <select
                                id="role"
                                value={data.role}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                onChange={(e) => setData('role', e.target.value)}
                                required
                            >
                                <option value="user">User</option>
                                <option value="admin">System Admin</option>
                                <option value="manager">Branch Manager</option>
                                <option value="cashier">Cashier Staff</option>
                                <option value="mechanic">Head Mechanic</option>
                            </select>
                            <InputError message={errors.role} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel value="Sidebar Menu Access" />
                            <div className="mt-2 grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border p-2 rounded-md">
                                {availableMenus.map((menu) => (
                                    <div key={menu.id} className="flex items-center">
                                        <Checkbox
                                            name="menus"
                                            value={menu.id.toString()}
                                            checked={data.menus.includes(menu.id)}
                                            onChange={(e) => handleMenuChange(menu.id, e.target.checked)}
                                        />
                                        <span className="ms-2 text-sm text-gray-600">{menu.name}</span>
                                    </div>
                                ))}
                            </div>
                            <InputError message={errors.menus} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password" value="Password" />
                            <TextInput
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            />
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <SecondaryButton onClick={() => setModal(false)}>Cancel</SecondaryButton>
                            <PrimaryButton disabled={processing}>Create User</PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}

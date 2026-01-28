import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Plus, Trash2, Edit } from 'lucide-react';

export default function Index({ menus }: { menus: any[] }) {
    const { delete: destroy } = useForm();

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this menu?')) {
            destroy(route('admin.menus.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            Menu Management
                        </h2>
                        <div className="flex space-x-2 border-l pl-4 border-gray-300">
                            <span className="px-3 py-1 bg-gray-900 text-white rounded text-sm">Menus</span>
                            <Link href={route('admin.menus.users.index')} className="px-3 py-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded text-sm transition transition-colors">
                                User Access Audit
                            </Link>
                        </div>
                    </div>
                    <Link
                        href={route('admin.menus.create')}
                        className="inline-flex items-center gap-2 rounded-md bg-gray-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-gray-700 focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-gray-900"
                    >
                        <Plus className="h-4 w-4" />
                        Create Menu
                    </Link>
                </div>
            }
        >
            <Head title="Menu Management" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Route
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Icon
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Order
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {menus.map((menu) => (
                                        <tr key={menu.id}>
                                            <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                                                {menu.name}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-gray-500">
                                                {menu.route}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-gray-500">
                                                {menu.icon}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-gray-500">
                                                {menu.order}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right">
                                                <Link
                                                    href={route('admin.menus.edit', menu.id)}
                                                    className="inline-flex text-indigo-600 hover:text-indigo-900 mr-4"
                                                >
                                                    <Edit className="h-5 w-5" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(menu.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <Trash2 className="h-5 w-5" />
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
        </AuthenticatedLayout>
    );
}

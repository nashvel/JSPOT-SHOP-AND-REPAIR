import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Eye } from 'lucide-react';
import { User } from '@/types';

export default function Index({ users }: { users: User[] }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Menu Access Audit
                </h2>
            }
        >
            <Head title="Menu Access Audit" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <p className="mb-4 text-sm text-gray-600">Select a user to view their current menu access permissions.</p>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Role
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                                                {user.name}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-gray-500">
                                                {user.email}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 capitalize text-gray-500">
                                                {user.role.replace('_', ' ')}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right">
                                                <Link
                                                    href={route('admin.menus.users.show', user.id)}
                                                    className="inline-flex items-center text-indigo-600 hover:text-indigo-900 gap-1"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    View Menus
                                                </Link>
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

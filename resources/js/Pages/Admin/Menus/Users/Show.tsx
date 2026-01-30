import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

export default function Show({ targetUser }: { targetUser: any }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Menu Access: {targetUser.name}
                </h2>
            }
        >
            <Head title={`Menu Access - ${targetUser.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <Link href={route('admin.menus.users.index')} className="flex items-center text-gray-600 hover:text-gray-900">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to User List
                        </Link>
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-6 border-b pb-4">
                                <h3 className="text-lg font-medium">User Information</h3>
                                <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                                    <div className="sm:col-span-1">
                                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{targetUser.email}</dd>
                                    </div>
                                    <div className="sm:col-span-1">
                                        <dt className="text-sm font-medium text-gray-500">Role</dt>
                                        <dd className="mt-1 text-sm text-gray-900 capitalize">{targetUser.role?.display_name || 'N/A'}</dd>
                                    </div>
                                </dl>
                            </div>

                            <h3 className="text-lg font-medium mb-4">Assigned Menus</h3>
                            {targetUser.menus.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {targetUser.menus.map((menu: any) => (
                                        <div key={menu.id} className="flex items-center p-4 border rounded-lg bg-green-50 border-green-100">
                                            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                                            <div>
                                                <p className="font-medium text-gray-900">{menu.name}</p>
                                                <p className="text-xs text-gray-500">Route: {menu.route}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center p-4 border rounded-lg bg-gray-50">
                                    <XCircle className="h-5 w-5 text-gray-400 mr-3" />
                                    <p className="text-gray-500">No specific menus assigned (may only have defaults).</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

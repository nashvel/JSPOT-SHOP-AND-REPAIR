import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Index() {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Help & Support
                </h2>
            }
        >
            <Head title="Help & Support" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h3 className="text-lg font-medium text-gray-900">Need Help?</h3>
                            <p className="mt-2 text-gray-600">
                                Contact the system administrator for assistance or refer to the user manual.
                            </p>

                            <div className="mt-8 grid gap-4 grid-cols-1 md:grid-cols-2">
                                <div className="p-4 border rounded-lg bg-gray-50">
                                    <h4 className="font-semibold">Documentation</h4>
                                    <p className="text-sm text-gray-500 mt-1">Read the guide on how to use the system.</p>
                                </div>
                                <div className="p-4 border rounded-lg bg-gray-50">
                                    <h4 className="font-semibold">Contact Support</h4>
                                    <p className="text-sm text-gray-500 mt-1">Email support@quamc.com for urgent issues.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

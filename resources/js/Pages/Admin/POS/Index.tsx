import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Index() {
    return (
        <AuthenticatedLayout>
            <Head title="Point of Sale" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-medium">Point of Sale</h3>
                        <p className="text-gray-500">POS interface coming soon.</p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

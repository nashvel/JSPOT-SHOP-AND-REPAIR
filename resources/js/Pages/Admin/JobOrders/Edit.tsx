import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { ArrowLeft, Save } from 'lucide-react';

interface JobOrder {
    id: number;
    tracking_code: string;
    customer_name: string;
    vehicle_details: string;
    description: string;
    status: string;
    branch?: {
        name: string;
    };
}

interface Props {
    jobOrder: JobOrder;
}

export default function Edit({ jobOrder }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        status: jobOrder.status,
        description: jobOrder.description,
        vehicle_details: jobOrder.vehicle_details,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('admin.job-orders.update', jobOrder.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit Job Order ${jobOrder.tracking_code}`} />
            <div className="py-8">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Back Link */}
                    <Link
                        href={route('admin.job-orders.index')}
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Job Orders
                    </Link>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                            <div>
                                <h1 className="text-lg font-semibold text-gray-900">Edit Job Order</h1>
                                <p className="text-sm text-gray-500">{jobOrder.tracking_code} • {jobOrder.customer_name}</p>
                            </div>
                            <div className="text-right">
                                <span className="text-xs text-gray-500 block">Branch</span>
                                <span className="text-sm font-medium text-gray-900">{jobOrder.branch?.name}</span>
                            </div>
                        </div>

                        <form onSubmit={submit} className="p-6 space-y-6">
                            {/* Status */}
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <select
                                    id="status"
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
                            </div>

                            {/* Vehicle Details */}
                            <div>
                                <label htmlFor="vehicle_details" className="block text-sm font-medium text-gray-700 mb-1">
                                    Vehicle / Device Details
                                </label>
                                <input
                                    id="vehicle_details"
                                    type="text"
                                    value={data.vehicle_details}
                                    onChange={(e) => setData('vehicle_details', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                {errors.vehicle_details && <p className="mt-1 text-sm text-red-600">{errors.vehicle_details}</p>}
                            </div>

                            {/* Description / Issue */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                    Issue Description
                                </label>
                                <textarea
                                    id="description"
                                    rows={4}
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                            </div>

                            {/* Submit */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                                <Link
                                    href={route('admin.job-orders.index')}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    <Save className="h-4 w-4" />
                                    {processing ? 'Saving...' : 'Update Job Order'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

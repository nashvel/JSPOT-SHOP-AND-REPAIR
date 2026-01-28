import PublicLayout from '@/Layouts/PublicLayout';
import { Head, usePage, useForm } from '@inertiajs/react';
import { Search, PenTool, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';

interface JobOrder {
    tracking_code: string;
    branch?: { name: string };
    status: string;
    customer_name: string;
    vehicle_details: string;
    description: string;
    updated_at: string;
}

export default function Tracker() {
    const { job, errors: serverErrors } = usePage<{ job?: JobOrder, auth: any }>().props;
    const { data, setData, post, processing, errors } = useForm({
        tracking_code: ''
    });

    const submit = (e: any) => {
        e.preventDefault();
        post(route('public.track.search'));
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const styles: any = {
            pending: 'bg-yellow-100 text-yellow-800',
            in_progress: 'bg-blue-100 text-blue-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${styles[status] || styles.pending}`}>
                {status.replace('_', ' ')}
            </span>
        );
    }

    return (
        <PublicLayout>
            <Head title="Track Repair" />

            <div className="bg-white py-16 sm:py-24">
                <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8 text-center">
                    <PenTool className="mx-auto h-12 w-12 text-indigo-600" />
                    <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                        Track Your Repair Service
                    </h1>
                    <p className="mt-4 text-lg text-gray-500">
                        Enter your Job Order Tracking Code provided by the branch staff to check the status of your vehicle.
                    </p>

                    <form onSubmit={submit} className="mt-8 relative max-w-md mx-auto">
                        <div className="flex gap-2">
                            <TextInput
                                id="tracking_code"
                                type="text"
                                className="block w-full text-center tracking-widest uppercase font-mono"
                                placeholder="JO-1234-XYZ"
                                value={data.tracking_code}
                                onChange={(e) => setData('tracking_code', e.target.value)}
                                required
                            />
                            <PrimaryButton disabled={processing} className="h-full">
                                <Search className="h-4 w-4" />
                            </PrimaryButton>
                        </div>
                        {errors.tracking_code && <p className="text-red-500 text-sm mt-2 text-left">{errors.tracking_code}</p>}
                    </form>
                </div>

                {/* Result Section */}
                {job && (
                    <div className="mx-auto max-w-2xl px-4 mt-12">
                        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Job Order #{job.tracking_code}</h3>
                                    <p className="text-sm text-gray-500">{job.branch?.name}</p>
                                </div>
                                <StatusBadge status={job.status} />
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase">Customer</p>
                                    <p className="text-gray-900">{job.customer_name}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase">Vehicle</p>
                                    <p className="text-gray-900">{job.vehicle_details}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase">Description</p>
                                    <p className="text-gray-700 bg-gray-50 p-3 rounded-md mt-1">{job.description}</p>
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-3 text-sm text-gray-500">
                                        <Clock className="h-4 w-4" />
                                        <span>Last Updated: {new Date(job.updated_at).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}

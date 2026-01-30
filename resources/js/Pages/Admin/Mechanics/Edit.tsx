import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

interface Branch {
    id: number;
    name: string;
}

interface Mechanic {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    date_of_birth: string | null;
    hire_date: string | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    specialization: string | null;
    branch_id: number;
    is_active: boolean;
}

interface Props {
    mechanic: Mechanic;
    branches: Branch[];
}

export default function Edit({ mechanic, branches }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: mechanic.name || '',
        email: mechanic.email || '',
        phone: mechanic.phone || '',
        address: mechanic.address || '',
        date_of_birth: mechanic.date_of_birth || '',
        hire_date: mechanic.hire_date || '',
        emergency_contact_name: mechanic.emergency_contact_name || '',
        emergency_contact_phone: mechanic.emergency_contact_phone || '',
        specialization: mechanic.specialization || '',
        branch_id: mechanic.branch_id.toString(),
        is_active: mechanic.is_active,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin.mechanics.update', mechanic.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Edit Mechanic" />

            <div className="py-8">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <Link
                            href={route('admin.mechanics.index')}
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Mechanics
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Edit Mechanic</h1>
                        <p className="text-gray-500">Update mechanic details below</p>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
                        {/* Personal Information */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
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
                                    />
                                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        type="text"
                                        value={data.phone}
                                        onChange={e => setData('phone', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="09XXXXXXXXX"
                                    />
                                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                    <input
                                        type="date"
                                        value={data.date_of_birth}
                                        onChange={e => setData('date_of_birth', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                    {errors.date_of_birth && <p className="text-red-500 text-sm mt-1">{errors.date_of_birth}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <textarea
                                        value={data.address}
                                        onChange={e => setData('address', e.target.value)}
                                        rows={2}
                                        className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Emergency Contact */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                                    <input
                                        type="text"
                                        value={data.emergency_contact_name}
                                        onChange={e => setData('emergency_contact_name', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                    {errors.emergency_contact_name && <p className="text-red-500 text-sm mt-1">{errors.emergency_contact_name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                                    <input
                                        type="text"
                                        value={data.emergency_contact_phone}
                                        onChange={e => setData('emergency_contact_phone', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="09XXXXXXXXX"
                                    />
                                    {errors.emergency_contact_phone && <p className="text-red-500 text-sm mt-1">{errors.emergency_contact_phone}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Work Information */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Work Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Branch <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.branch_id}
                                        onChange={e => setData('branch_id', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                    >
                                        <option value="">Select Branch</option>
                                        {branches.map(branch => (
                                            <option key={branch.id} value={branch.id}>{branch.name}</option>
                                        ))}
                                    </select>
                                    {errors.branch_id && <p className="text-red-500 text-sm mt-1">{errors.branch_id}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Hire Date</label>
                                    <input
                                        type="date"
                                        value={data.hire_date}
                                        onChange={e => setData('hire_date', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                    {errors.hire_date && <p className="text-red-500 text-sm mt-1">{errors.hire_date}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                                    <input
                                        type="text"
                                        value={data.specialization}
                                        onChange={e => setData('specialization', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="e.g., Engine Specialist"
                                    />
                                    {errors.specialization && <p className="text-red-500 text-sm mt-1">{errors.specialization}</p>}
                                </div>

                                <div className="flex items-center">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.is_active}
                                            onChange={e => setData('is_active', e.target.checked)}
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Active</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-4 pt-4 border-t">
                            <Link
                                href={route('admin.mechanics.index')}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50"
                            >
                                {processing ? 'Updating...' : 'Update Mechanic'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

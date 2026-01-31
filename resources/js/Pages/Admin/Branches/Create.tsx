import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { ArrowLeft, Key } from 'lucide-react';
import LocationPicker from '@/Components/LocationPicker';

interface Menu {
    id: number;
    name: string;
    route: string;
    group: string;
}

interface Props {
    availableMenus: Menu[];
}

export default function Create({ availableMenus }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        address: '',
        contact_number: '',
        latitude: '',
        longitude: '',
        is_main: false,
        menus: [] as number[],
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.branches.store'));
    };

    const handleMenuChange = (menuId: number, checked: boolean) => {
        if (checked) {
            setData('menus', [...data.menus, menuId]);
        } else {
            setData('menus', data.menus.filter(id => id !== menuId));
        }
    };

    // Group menus by their group name
    const groupedMenus = availableMenus.reduce((acc, menu) => {
        const group = menu.group || 'Other';
        if (!acc[group]) acc[group] = [];
        acc[group].push(menu);
        return acc;
    }, {} as Record<string, Menu[]>);

    return (
        <AuthenticatedLayout>
            <Head title="Create Branch" />
            <div className="py-8">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Back Link */}
                    <Link
                        href={route('admin.branches.index')}
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Branches
                    </Link>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h1 className="text-xl font-semibold text-gray-900">Create New Branch</h1>
                            <p className="text-sm text-gray-500 mt-1">Add a new branch account with login credentials</p>
                        </div>

                        <form onSubmit={submit} className="p-6 space-y-6">
                            {/* Branch Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Branch Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="e.g., Makati Branch"
                                    required
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                            </div>

                            {/* Account Credentials Section */}
                            <div className="border border-indigo-200 rounded-lg p-4 bg-indigo-50/50">
                                <div className="flex items-center gap-2 mb-4">
                                    <Key className="h-4 w-4 text-indigo-600" />
                                    <h3 className="font-medium text-gray-900">Branch Account Credentials</h3>
                                </div>
                                <p className="text-xs text-gray-500 mb-4">
                                    These credentials will be used to log in as this branch.
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            placeholder="branch@example.com"
                                            required
                                        />
                                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                            Password <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="password"
                                            type="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            placeholder="Min 8 characters"
                                            required
                                        />
                                        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                    Address
                                </label>
                                <textarea
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    rows={2}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="Branch address"
                                />
                                {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                            </div>

                            {/* Contact Number */}
                            <div>
                                <label htmlFor="contact_number" className="block text-sm font-medium text-gray-700 mb-1">
                                    Contact Number
                                </label>
                                <input
                                    id="contact_number"
                                    type="text"
                                    value={data.contact_number}
                                    onChange={(e) => setData('contact_number', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="e.g., +63 912 345 6789"
                                />
                                {errors.contact_number && <p className="mt-1 text-sm text-red-600">{errors.contact_number}</p>}
                            </div>

                            {/* Map Coordinates Section */}
                            <div className="border border-green-200 rounded-lg p-4 bg-green-50/50">
                                <h3 className="font-medium text-gray-900 mb-2">Branch Location</h3>
                                <p className="text-xs text-gray-500 mb-4">
                                    Search for the location or pin it on the map.
                                </p>

                                <LocationPicker
                                    onLocationSelect={(lat, lng) => {
                                        setData(data => ({
                                            ...data,
                                            latitude: lat.toString(),
                                            longitude: lng.toString()
                                        }));
                                    }}
                                />

                                {/* Hidden inputs to ensure data submission although setData handles it */}
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">
                                            Selected Latitude
                                        </label>
                                        <input
                                            type="text"
                                            readOnly
                                            className="w-full bg-white/50 text-gray-600 text-sm border-gray-200 rounded-md shadow-sm"
                                            value={data.latitude}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">
                                            Selected Longitude
                                        </label>
                                        <input
                                            type="text"
                                            readOnly
                                            className="w-full bg-white/50 text-gray-600 text-sm border-gray-200 rounded-md shadow-sm"
                                            value={data.longitude}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Is Main Branch */}
                            <div className="flex items-center gap-2">
                                <input
                                    id="is_main"
                                    type="checkbox"
                                    checked={data.is_main}
                                    onChange={(e) => setData('is_main', e.target.checked)}
                                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                <label htmlFor="is_main" className="text-sm text-gray-700">
                                    Main Branch (Primary location)
                                </label>
                            </div>

                            {/* Module Assignment */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Assigned Modules
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const allMenuIds = availableMenus.map(m => m.id);
                                            const allSelected = allMenuIds.every(id => data.menus.includes(id));
                                            setData('menus', allSelected ? [] : allMenuIds);
                                        }}
                                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800 px-3 py-1 rounded-md hover:bg-indigo-50 transition"
                                    >
                                        {availableMenus.every(m => data.menus.includes(m.id)) ? 'Deselect All' : 'Allow All'}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mb-4">
                                    Select which modules this branch can access. Staff assigned to this branch will inherit these permissions.
                                </p>
                                <div className="space-y-4">
                                    {Object.entries(groupedMenus).map(([group, menus]) => (
                                        <div key={group} className="border border-gray-200 rounded-lg p-4">
                                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{group}</h4>
                                            <div className="grid grid-cols-2 gap-3">
                                                {menus.map((menu) => (
                                                    <label key={menu.id} className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={data.menus.includes(menu.id)}
                                                            onChange={(e) => handleMenuChange(menu.id, e.target.checked)}
                                                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                        />
                                                        <span className="text-sm text-gray-700">{menu.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {errors.menus && <p className="mt-1 text-sm text-red-600">{errors.menus}</p>}
                            </div>

                            {/* Submit */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                                <Link
                                    href={route('admin.branches.index')}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50"
                                >
                                    {processing ? 'Creating...' : 'Create Branch'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

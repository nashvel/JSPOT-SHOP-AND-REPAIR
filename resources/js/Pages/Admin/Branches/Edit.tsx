import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Users, Key, Shield, Lock, X, Check } from 'lucide-react';
import LocationPicker from '@/Components/LocationPicker';
import Modal from '@/Components/Modal';
import Checkbox from '@/Components/Checkbox';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';

interface Menu {
    id: number;
    name: string;
    route: string;
    group: string;
}

interface Role {
    id: number;
    name: string;
    display_name: string;
}

interface Staff {
    id: number;
    name: string;
    email: string;
    role?: Role;
    menus: Menu[];
}

interface Branch {
    id: number;
    name: string;
    email: string;
    address: string | null;
    contact_number: string | null;
    latitude: number | null;
    longitude: number | null;
    is_main: boolean;
    menus: Menu[];
    staff: Staff[];
}

interface Props {
    branch: Branch;
    availableMenus: Menu[];
    roles: Role[];
}

export default function Edit({ branch, availableMenus, roles }: Props) {
    const [showAddStaff, setShowAddStaff] = useState(false);

    // Modal State for Staff Permissions
    const [permissionsModal, setPermissionsModal] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

    const { data, setData, put, processing, errors } = useForm({
        name: branch.name,
        email: branch.email || '',
        password: '',
        address: branch.address || '',
        contact_number: branch.contact_number || '',
        latitude: branch.latitude?.toString() || '',
        longitude: branch.longitude?.toString() || '',
        is_main: branch.is_main,
        menus: branch.menus.map(m => m.id),
    });

    const staffForm = useForm({
        name: '',
        email: '',
        password: '',
    });

    // Form for updating staff permissions
    const permissionsForm = useForm({
        menus: [] as number[],
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('admin.branches.update', branch.id));
    };

    const handleAddStaff: FormEventHandler = (e) => {
        e.preventDefault();
        staffForm.post(route('admin.branches.staff.add', branch.id), {
            onSuccess: () => {
                setShowAddStaff(false);
                staffForm.reset();
            },
        });
    };

    const handleRemoveStaff = (staffId: number, staffName: string) => {
        if (confirm(`Remove "${staffName}" from this branch?`)) {
            router.delete(route('admin.branches.staff.remove', [branch.id, staffId]));
        }
    };

    const handleMenuChange = (menuId: number, checked: boolean) => {
        if (checked) {
            setData('menus', [...data.menus, menuId]);
        } else {
            setData('menus', data.menus.filter(id => id !== menuId));
        }
    };

    // Open Permissions Modal
    const openPermissionsModal = (staff: Staff) => {
        setSelectedStaff(staff);
        // Pre-select staff's existing menus
        permissionsForm.setData('menus', staff.menus.map(m => m.id));
        setPermissionsModal(true);
    };

    // Handle Staff Menu Change
    const handleStaffMenuChange = (menuId: number, checked: boolean) => {
        let currentMenus = permissionsForm.data.menus;
        if (checked) {
            permissionsForm.setData('menus', [...currentMenus, menuId]);
        } else {
            permissionsForm.setData('menus', currentMenus.filter(id => id !== menuId));
        }
    };

    // Submit Staff Permissions
    const submitStaffPermissions: FormEventHandler = (e) => {
        e.preventDefault();
        if (!selectedStaff) return;

        permissionsForm.post(route('admin.branches.staff.menus.update', [branch.id, selectedStaff.id]), {
            onSuccess: () => {
                setPermissionsModal(false);
                setSelectedStaff(null);
            },
        });
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
            <Head title={`Edit Branch: ${branch.name}`} />
            <div className="py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Back Link */}
                    <Link
                        href={route('admin.branches.index')}
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Branches
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Branch Details Form */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h1 className="text-xl font-semibold text-gray-900">Edit Branch</h1>
                                    <p className="text-sm text-gray-500 mt-1">Update branch details and module access</p>
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
                                                    required
                                                />
                                                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                                            </div>
                                            <div>
                                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                                    New Password
                                                </label>
                                                <input
                                                    id="password"
                                                    type="password"
                                                    value={data.password}
                                                    onChange={(e) => setData('password', e.target.value)}
                                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    placeholder="Leave blank to keep current"
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
                                        />
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
                                        />
                                    </div>

                                    {/* Map Coordinates Section */}
                                    <div className="border border-green-200 rounded-lg p-4 bg-green-50/50">
                                        <h3 className="font-medium text-gray-900 mb-2">Branch Location</h3>
                                        <p className="text-xs text-gray-500 mb-4">
                                            Search for the location or pin it on the map.
                                        </p>

                                        <LocationPicker
                                            initialLat={branch.latitude ? parseFloat(branch.latitude.toString()) : undefined}
                                            initialLng={branch.longitude ? parseFloat(branch.longitude.toString()) : undefined}
                                            onLocationSelect={(lat, lng) => {
                                                setData(data => ({
                                                    ...data,
                                                    latitude: lat.toString(),
                                                    longitude: lng.toString()
                                                }));
                                            }}
                                        />

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
                                            Main Branch
                                        </label>
                                    </div>

                                    {/* Module Assignment */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Assigned Modules (Default for this Branch)
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
                                    </div>

                                    {/* Submit */}
                                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50"
                                        >
                                            {processing ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Staff Panel */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-gray-400" />
                                        <h2 className="font-medium text-gray-900">Staff</h2>
                                        <span className="text-xs text-gray-500">({branch.staff.length})</span>
                                    </div>
                                    <button
                                        onClick={() => setShowAddStaff(true)}
                                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>

                                {/* Add Staff Form */}
                                {showAddStaff && (
                                    <form onSubmit={handleAddStaff} className="p-4 border-b border-gray-200 bg-gray-50 space-y-3">
                                        <input
                                            type="text"
                                            placeholder="Name"
                                            value={staffForm.data.name}
                                            onChange={(e) => staffForm.setData('name', e.target.value)}
                                            className="w-full text-sm rounded-lg border-gray-300"
                                            required
                                        />
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            value={staffForm.data.email}
                                            onChange={(e) => staffForm.setData('email', e.target.value)}
                                            className="w-full text-sm rounded-lg border-gray-300"
                                            required
                                        />
                                        <input
                                            type="password"
                                            placeholder="Password"
                                            value={staffForm.data.password}
                                            onChange={(e) => staffForm.setData('password', e.target.value)}
                                            className="w-full text-sm rounded-lg border-gray-300"
                                            required
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setShowAddStaff(false)}
                                                className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={staffForm.processing}
                                                className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                                            >
                                                Add Staff
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {/* Staff List */}
                                <div className="divide-y divide-gray-100">
                                    {branch.staff.length === 0 ? (
                                        <div className="px-4 py-8 text-center">
                                            <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                            <p className="text-sm text-gray-500">No staff assigned</p>
                                            <button
                                                onClick={() => setShowAddStaff(true)}
                                                className="mt-2 text-xs text-indigo-600 hover:text-indigo-800"
                                            >
                                                Add first staff member
                                            </button>
                                        </div>
                                    ) : (
                                        branch.staff.map(staff => (
                                            <div key={staff.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 group">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 flex-shrink-0">
                                                        {staff.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">{staff.name}</p>
                                                        <div className="flex items-center gap-1">
                                                            <p className="text-xs text-gray-500 truncate">{staff.email === branch.email ? 'Branch Account' : (staff.role?.display_name || 'Staff')}</p>
                                                            {staff.menus.length > 0 && (
                                                                <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1 rounded">Custom Access</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => openPermissionsModal(staff)}
                                                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                        title="Manage Module Access"
                                                    >
                                                        <Shield className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRemoveStaff(staff.id, staff.name)}
                                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Remove Staff"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Staff Permissions Modal */}
            <Modal show={permissionsModal} onClose={() => setPermissionsModal(false)}>
                {selectedStaff && (
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-lg font-medium text-gray-900">Manage Staff Permissions</h2>
                                <p className="text-sm text-gray-500">
                                    Customize module access for <span className="font-semibold">{selectedStaff.name}</span>
                                </p>
                            </div>
                            <button onClick={() => setPermissionsModal(false)} className="text-gray-400 hover:text-gray-500">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
                            <Lock className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                            <div className="text-sm text-yellow-700">
                                <p className="font-medium">Please Note:</p>
                                <p className="mt-1">
                                    If you select specific modules below, this user will <b>ONLY</b> see those modules, overriding the default Branch settings.
                                    <br />
                                    If you uncheck all modules, they will revert to using the <b>Branch Defaults</b>.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={submitStaffPermissions}>
                            <div className="space-y-4 max-h-[50vh] overflow-y-auto p-1">
                                {Object.entries(groupedMenus).map(([group, menus]) => (
                                    <div key={group} className="border border-gray-200 rounded-lg p-4">
                                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{group}</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            {menus.map((menu) => (
                                                <label key={menu.id} className="flex items-center gap-2 cursor-pointer">
                                                    <Checkbox
                                                        name="menus"
                                                        value={menu.id.toString()}
                                                        checked={permissionsForm.data.menus.includes(menu.id)}
                                                        onChange={(e) => handleStaffMenuChange(menu.id, e.target.checked)}
                                                    />
                                                    <span className="text-sm text-gray-700">{menu.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100 bg-white relative z-10">
                                <SecondaryButton type="button" onClick={() => setPermissionsModal(false)}>
                                    Cancel
                                </SecondaryButton>
                                <PrimaryButton type="submit" disabled={permissionsForm.processing}>
                                    Save Permissions
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}

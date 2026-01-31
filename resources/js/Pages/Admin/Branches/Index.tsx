import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import React from 'react';
import { ChevronRight, ChevronDown, Navigation, Plus, Edit, Trash2, Users, Store } from 'lucide-react';
import Swal from 'sweetalert2';

interface Staff {
    id: number;
    name: string;
    email: string;
    role?: {
        id: number;
        name: string;
        display_name: string;
    };
}

interface Branch {
    id: number;
    name: string;
    email: string | null;
    address: string | null;
    contact_number: string | null;
    is_main: boolean;
    staff: Staff[];
    staff_count: number;
    menus: any[];
}

interface Props {
    branches: Branch[];
}

export default function Index({ branches }: Props) {
    const [expandedBranches, setExpandedBranches] = useState<number[]>([]);

    const toggleBranch = (branchId: number) => {
        setExpandedBranches(prev =>
            prev.includes(branchId)
                ? prev.filter(id => id !== branchId)
                : [...prev, branchId]
        );
    };

    const handleNavigate = (branchId: number) => {
        router.post(route('admin.impersonate', branchId));
    };

    const handleDeleteBranch = (branchId: number, branchName: string) => {
        if (confirm(`Are you sure you want to delete "${branchName}"?`)) {
            router.delete(route('admin.branches.destroy', branchId));
        }
    };

    const handleAddStaff = (branch: Branch) => {
        // @ts-ignore
        Swal.fire({
            title: `Add Staff to ${branch.name}`,
            html: `
                <div class="space-y-4 text-left">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input id="swal-name" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. Nacht" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input id="swal-email" type="email" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. example@gmil.com" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input id="swal-password" type="password" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="••••••••" />
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Add Staff',
            confirmButtonColor: '#4F46E5',
            cancelButtonColor: '#6B7280',
            focusConfirm: false,
            preConfirm: () => {
                const name = (document.getElementById('swal-name') as HTMLInputElement).value;
                const email = (document.getElementById('swal-email') as HTMLInputElement).value;
                const password = (document.getElementById('swal-password') as HTMLInputElement).value;

                if (!name || !email || !password) {
                    // @ts-ignore
                    Swal.showValidationMessage('All fields are required');
                    return false;
                }
                return { name, email, password };
            }
        }).then((result: any) => {
            if (result.isConfirmed) {
                router.post(route('admin.branches.staff.add', branch.id), result.value, {
                    onSuccess: () => {
                        // @ts-ignore
                        Swal.fire({
                            title: 'Success!',
                            text: 'Staff member has been added successfully.',
                            icon: 'success',
                            confirmButtonColor: '#4F46E5',
                        });
                    },
                    onError: (errors) => {
                        // @ts-ignore
                        Swal.fire({
                            title: 'Error!',
                            text: Object.values(errors).flat().join('\n'),
                            icon: 'error',
                            confirmButtonColor: '#EF4444',
                        });
                    }
                });
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Branch Accounts" />
            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Branch Accounts</h1>
                            <p className="text-sm text-gray-500 mt-1">Manage branches and their staff members</p>
                        </div>
                        <Link
                            href={route('admin.branches.create')}
                            className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Add Branch
                        </Link>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8"></th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accounts</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Type</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {branches.map((branch) => (
                                    <React.Fragment key={branch.id}>
                                        {/* Branch Row */}
                                        <tr className="bg-gray-50/50 hover:bg-gray-100/50">
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => toggleBranch(branch.id)}
                                                    className="text-gray-400 hover:text-gray-600"
                                                >
                                                    {expandedBranches.includes(branch.id) ? (
                                                        <ChevronDown className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronRight className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                                                        <Store className="h-4 w-4 text-indigo-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{branch.name}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {branch.staff_count} staff • {branch.menus?.length || 0} modules
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">—</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{branch.email || '—'}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                    Branch
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleNavigate(branch.id)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-md text-xs font-medium hover:bg-emerald-100 transition-colors"
                                                    >
                                                        <Navigation className="h-3 w-3" />
                                                        Navigate
                                                    </button>
                                                    <Link
                                                        href={route('admin.branches.edit', branch.id)}
                                                        className="p-1.5 text-gray-400 hover:text-gray-600"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDeleteBranch(branch.id, branch.name)}
                                                        className="p-1.5 text-gray-400 hover:text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>

                                        {/* Staff Rows (expanded) */}
                                        {expandedBranches.includes(branch.id) && branch.staff.map((staff, index) => (
                                            <tr key={`staff-${staff.id}`} className="hover:bg-gray-50">
                                                <td className="px-6 py-3"></td>
                                                <td className="px-6 py-3 pl-16">
                                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                                        <span className="text-gray-300">{index + 1}.</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                                                            {staff.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-700">{staff.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3 text-sm text-gray-500">{staff.email}</td>
                                                <td className="px-6 py-3">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                        {staff.email === branch.email ? 'Branch Account' : (staff.role?.display_name || 'Staff')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    <button
                                                        onClick={() => handleNavigate(branch.id)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-md text-xs font-medium hover:bg-gray-200 transition-colors"
                                                    >
                                                        <Navigation className="h-3 w-3" />
                                                        Navigate
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}

                                        {/* Add Staff Row (expanded) */}
                                        {expandedBranches.includes(branch.id) && (
                                            <tr className="bg-gray-50/30">
                                                <td className="px-6 py-2"></td>
                                                <td colSpan={5} className="px-6 py-2 pl-16">
                                                    <button
                                                        onClick={() => handleAddStaff(branch)}
                                                        className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                        Add Staff to {branch.name}
                                                    </button>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}

                                {branches.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <Store className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                            <p className="text-gray-500 mb-2">No branches yet</p>
                                            <Link
                                                href={route('admin.branches.create')}
                                                className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                                            >
                                                Create your first branch
                                            </Link>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

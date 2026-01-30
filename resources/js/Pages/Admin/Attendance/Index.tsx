import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface Attendance {
    id: number;
    status: string;
    time_in: string | null;
    time_out: string | null;
    remarks: string | null;
}

interface Person {
    id: number;
    name: string;
    type: string;
    role: string;
    attendance: Attendance | null;
}

interface Props {
    users: Person[];
    mechanics: Person[];
    branches: { id: number; name: string }[];
    filters: {
        branch_id: number;
        date: string;
    }
}

export default function AttendanceIndex({ users, mechanics, branches, filters }: Props) {
    const [selectedBranch, setSelectedBranch] = useState(filters.branch_id);
    const [selectedDate, setSelectedDate] = useState(filters.date);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const handleFilterChange = (key: string, value: any) => {
        router.get(route('admin.attendance.index'), {
            ...filters,
            [key]: value
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleAttendanceUpdate = (person: Person, status: string, time_in: string | null = null, time_out: string | null = null, remarks: string | null = null) => {
        const key = `${person.type}_${person.id}`;
        setProcessingId(key);

        router.post(route('admin.attendance.store'), {
            branch_id: selectedBranch,
            attendable_id: person.id,
            attendable_type: person.type,
            date: selectedDate,
            status: status,
            time_in: time_in,
            time_out: time_out,
            remarks: remarks
        }, {
            preserveScroll: true,
            onFinish: () => setProcessingId(null)
        });
    };

    const StatusBadge = ({ status }: { status: string }) => {
        switch (status) {
            case 'present':
                return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Present</span>;
            case 'absent':
                return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" /> Absent</span>;
            case 'late':
                return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" /> Late</span>;
            case 'on_leave':
                return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><AlertCircle className="w-3 h-3 mr-1" /> On Leave</span>;
            default:
                return null;
        }
    };

    const AttendanceRow = ({ person }: { person: Person }) => {
        const isProcessing = processingId === `${person.type}_${person.id}`;
        const currentStatus = person.attendance?.status;

        // Default times if not set
        const [timeIn, setTimeIn] = useState(person.attendance?.time_in || '');
        const [timeOut, setTimeOut] = useState(person.attendance?.time_out || '');
        const [remarks, setRemarks] = useState(person.attendance?.remarks || '');

        const saveChanges = () => {
            handleAttendanceUpdate(person, currentStatus || 'present', timeIn || null, timeOut || null, remarks || null);
        };

        return (
            <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                        <div>
                            <div className="text-sm font-medium text-gray-900">{person.name}</div>
                            <div className="text-xs text-gray-500">{person.role}</div>
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                        {['present', 'late', 'on_leave', 'absent'].map((status) => (
                            <button
                                key={status}
                                onClick={() => handleAttendanceUpdate(person, status)}
                                disabled={isProcessing}
                                className={`px-3 py-1 text-xs rounded-lg transition-colors border ${currentStatus === status
                                    ? status === 'present' ? 'bg-green-600 text-white border-green-600'
                                        : status === 'absent' ? 'bg-red-600 text-white border-red-600'
                                            : status === 'late' ? 'bg-yellow-500 text-white border-yellow-500'
                                                : 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                                    }`}
                            >
                                {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                            </button>
                        ))}
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                        <input
                            type="time"
                            className="text-xs border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            value={timeIn}
                            onChange={(e) => setTimeIn(e.target.value)}
                            onBlur={saveChanges}
                        />
                        <span className="text-gray-400">-</span>
                        <input
                            type="time"
                            className="text-xs border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            value={timeOut}
                            onChange={(e) => setTimeOut(e.target.value)}
                            onBlur={saveChanges}
                        />
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <input
                        type="text"
                        placeholder="Remarks..."
                        className="text-xs w-full max-w-[150px] border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        onBlur={saveChanges}
                    />
                </td>
            </tr>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Attendance" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <select
                            value={selectedBranch}
                            onChange={(e) => {
                                setSelectedBranch(parseInt(e.target.value));
                                handleFilterChange('branch_id', e.target.value);
                            }}
                            className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="">Select Branch</option>
                            {branches.map(branch => (
                                <option key={branch.id} value={branch.id}>
                                    {branch.name}
                                </option>
                            ))}
                        </select>

                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => {
                                setSelectedDate(e.target.value);
                                handleFilterChange('date', e.target.value);
                            }}
                            className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {!selectedBranch ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                        <p className="text-gray-500">Please select a branch to view attendance.</p>
                    </div>
                ) : (
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
                        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {format(new Date(selectedDate), 'MMMM d, yyyy')}
                            </h2>
                            <span className="text-sm text-gray-500">
                                Total Staff: {users.length + mechanics.length}
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time In/Out</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.length > 0 && (
                                        <>
                                            <tr className="bg-gray-50/50">
                                                <td colSpan={4} className="px-6 py-2 text-xs font-bold text-gray-500 uppercase">
                                                    Staff
                                                </td>
                                            </tr>
                                            {users.map(user => (
                                                <AttendanceRow key={`user-${user.id}`} person={user} />
                                            ))}
                                        </>
                                    )}

                                    {mechanics.length > 0 && (
                                        <>
                                            <tr className="bg-gray-50/50">
                                                <td colSpan={4} className="px-6 py-2 text-xs font-bold text-gray-500 uppercase">
                                                    Mechanics
                                                </td>
                                            </tr>
                                            {mechanics.map(mechanic => (
                                                <AttendanceRow key={`mechanic-${mechanic.id}`} person={mechanic} />
                                            ))}
                                        </>
                                    )}

                                    {users.length === 0 && mechanics.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                                No staff or mechanics found for this branch.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

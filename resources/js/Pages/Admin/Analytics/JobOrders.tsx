import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Wrench, Clock, CheckCircle, XCircle, AlertCircle, Building2 } from 'lucide-react';
import AnalyticsTabs from './Components/AnalyticsTabs';

interface JobOrder {
    id: number;
    tracking_code: string;
    customer_name: string;
    device_type: string | null;
    device_brand: string | null;
    issue_description: string | null;
    status: string;
    created_at: string;
    branch: { id: number; name: string } | null;
}

interface Branch {
    id: number;
    name: string;
}

interface Props {
    jobOrders: JobOrder[];
    stats: {
        total: number;
        pending: number;
        in_progress: number;
        completed: number;
        cancelled: number;
    };
    status: string;
    dateFilter: string;
    branches: Branch[];
    selectedBranch: number | null;
    canFilterBranches: boolean;
}

export default function JobOrders({ jobOrders, stats, status, dateFilter, branches, selectedBranch, canFilterBranches }: Props) {
    const handleStatusChange = (newStatus: string) => {
        const params = new URLSearchParams(window.location.search);
        params.set('status', newStatus);
        window.location.href = `?${params.toString()}`;
    };

    const handleDateFilterChange = (newFilter: string) => {
        const params = new URLSearchParams(window.location.search);
        params.set('date', newFilter);
        window.location.href = `?${params.toString()}`;
    };

    const handleBranchChange = (branchId: string) => {
        const params = new URLSearchParams(window.location.search);
        if (branchId) {
            params.set('branch', branchId);
        } else {
            params.delete('branch');
        }
        window.location.href = `?${params.toString()}`;
    };

    const getStatusBadge = (s: string) => {
        const badges: Record<string, { bg: string; text: string; icon: any }> = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
            in_progress: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Wrench },
            completed: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
            cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
        };
        const badge = badges[s] || { bg: 'bg-gray-100', text: 'text-gray-700', icon: AlertCircle };
        const Icon = badge.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${badge.bg} ${badge.text}`}>
                <Icon className="h-3 w-3" />
                {s.replace('_', ' ')}
            </span>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Job Orders Report" />
            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    <AnalyticsTabs activeTab="job-orders" />
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Job Orders Report</h2>
                            <p className="text-gray-500 text-sm mt-1">Track repair jobs and service requests.</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {canFilterBranches && (
                                <select
                                    value={selectedBranch || ''}
                                    onChange={(e) => handleBranchChange(e.target.value)}
                                    className="bg-white border border-gray-200 text-gray-700 h-9 rounded-md text-sm font-medium shadow-sm"
                                >
                                    <option value="">All Branches</option>
                                    {branches.map((b) => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            )}
                            <select
                                value={dateFilter}
                                onChange={(e) => handleDateFilterChange(e.target.value)}
                                className="bg-white border border-gray-200 text-gray-700 h-9 rounded-md text-sm font-medium shadow-sm"
                            >
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                            </select>
                            <select
                                value={status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className="bg-white border border-gray-200 text-gray-700 h-9 rounded-md text-sm font-medium shadow-sm"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <StatCard title="Total Jobs" value={stats.total} icon={Wrench} color="text-gray-600" active={status === 'all'} onClick={() => handleStatusChange('all')} />
                        <StatCard title="Pending" value={stats.pending} icon={Clock} color="text-yellow-600" active={status === 'pending'} onClick={() => handleStatusChange('pending')} />
                        <StatCard title="In Progress" value={stats.in_progress} icon={Wrench} color="text-blue-600" active={status === 'in_progress'} onClick={() => handleStatusChange('in_progress')} />
                        <StatCard title="Completed" value={stats.completed} icon={CheckCircle} color="text-green-600" active={status === 'completed'} onClick={() => handleStatusChange('completed')} />
                        <StatCard title="Cancelled" value={stats.cancelled} icon={XCircle} color="text-red-600" active={status === 'cancelled'} onClick={() => handleStatusChange('cancelled')} />
                    </div>

                    {/* Job Orders Table */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tracking Code</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device</th>
                                        {canFilterBranches && !selectedBranch && (
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                                        )}
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {jobOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                                No job orders found matching your criteria.
                                            </td>
                                        </tr>
                                    ) : (
                                        jobOrders.map((job) => (
                                            <tr key={job.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">{job.tracking_code}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{job.customer_name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {job.device_brand} {job.device_type}
                                                </td>
                                                {canFilterBranches && !selectedBranch && (
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.branch?.name || '-'}</td>
                                                )}
                                                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(job.status)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(job.created_at).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function StatCard({ title, value, icon: Icon, color, active, onClick }: { title: string; value: number; icon: any; color: string; active?: boolean; onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`bg-white p-4 rounded-xl border shadow-sm text-left transition-all ${active ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200 hover:border-gray-300'}`}
        >
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-gray-50 ${color}`}>
                    <Icon className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-xs text-gray-500">{title}</p>
                    <p className="text-lg font-bold text-gray-900">{value}</p>
                </div>
            </div>
        </button>
    );
}

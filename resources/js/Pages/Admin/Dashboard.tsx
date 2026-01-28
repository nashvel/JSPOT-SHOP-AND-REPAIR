import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend, RadialBarChart, RadialBar } from 'recharts';
import { DollarSign, ShoppingBag, Package, Store, TrendingUp, ArrowUpRight } from 'lucide-react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import { useState } from 'react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function Dashboard({ stats, charts, goals }: any) {
    const handleTimeframeChange = (timeframe: string) => {
        window.location.href = `?timeframe=${timeframe}`;
    }

    const { data, setData, post, processing, errors, reset } = useForm({
        timeframe: goals.timeframe,
        target: goals.target
    });

    const [modal, setModal] = useState(false);

    const openModal = () => {
        setData({ timeframe: goals.timeframe, target: goals.target });
        setModal(true);
    };

    const submitGoal = (e: any) => {
        e.preventDefault();
        post(route('admin.dashboard.goal.update'), {
            onSuccess: () => setModal(false)
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Overview" />

            {/* Goal Edit Modal */}
            <Modal show={modal} onClose={() => setModal(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        Update {goals.timeframe} Revenue Goal
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Set a new target revenue amount for this timeframe.
                    </p>
                    <form onSubmit={submitGoal} className="mt-6">
                        <div>
                            <InputLabel htmlFor="target" value="Target Amount (Initial)" />
                            <TextInput
                                id="target"
                                type="number"
                                className="mt-1 block w-full"
                                value={data.target}
                                onChange={(e) => setData('target', e.target.value)}
                                required
                            />
                        </div>
                        <div className="mt-6 flex justify-end">
                            <SecondaryButton onClick={() => setModal(false)}>Cancel</SecondaryButton>
                            <PrimaryButton className="ml-3" disabled={processing}>Save Goal</PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            <div className="py-8 select-none">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h2>
                            <p className="text-gray-500 text-sm mt-1">Real-time insights and performance metrics.</p>
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={goals.timeframe}
                                onChange={(e) => handleTimeframeChange(e.target.value)}
                                className="bg-white border border-gray-200 text-gray-700 h-9 rounded-md text-sm font-medium shadow-sm focus:ring-0 focus:border-gray-200 cursor-pointer"
                            >
                                <option value="daily">Daily Goal</option>
                                <option value="monthly">Monthly Goal</option>
                                <option value="yearly">Yearly Goal</option>
                            </select>
                            <button className="bg-gray-900 text-white px-3 py-1.5 rounded-md text-sm font-medium shadow-sm hover:bg-gray-800 transition-colors">
                                Export Report
                            </button>
                        </div>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <KPICard title="Total Revenue" value={'₱' + stats.revenue.toLocaleString()} icon={DollarSign} trend="+12.5%" trendUp={true} color="text-indigo-600" />
                        <KPICard title="Active Job Orders" value={stats.orders} icon={ShoppingBag} trend="+8.2%" trendUp={true} color="text-blue-600" />
                        <KPICard title="Total Inventory" value={stats.products} icon={Package} trend="-2.4%" trendUp={false} color="text-orange-600" />
                        <KPICard title="Active Branches" value={stats.branches} icon={Store} trend="+1 New" trendUp={true} color="text-green-600" />
                    </div>

                    {/* Upper Charts Row: Revenue & Distribution */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Revenue Area Chart */}
                        <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900">Revenue Analysis</h3>
                                <TrendingUp className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={charts.revenue} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₱${value}`} />
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            formatter={(value: any) => [`₱${value}`, 'Revenue']}
                                        />
                                        <Area type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Revenue Goal Card */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center relative group">
                            <button onClick={openModal} className="absolute top-4 right-4 text-gray-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                            </button>
                            <h3 className="text-lg font-bold text-gray-900 mb-2 capitalize">{goals.timeframe} Goal</h3>
                            <button onClick={openModal} className="text-sm text-gray-500 mb-6 hover:text-indigo-600 hover:underline">
                                Target: ₱{goals.target.toLocaleString()}
                            </button>

                            <div className="relative h-[200px] w-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadialBarChart
                                        innerRadius="80%"
                                        outerRadius="100%"
                                        barSize={10}
                                        data={[{ name: 'progress', value: goals.percentage, fill: '#4F46E5' }]}
                                        startAngle={90}
                                        endAngle={-270}
                                    >
                                        <RadialBar background dataKey="value" cornerRadius={10} />
                                    </RadialBarChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-bold text-indigo-600">{goals.percentage}%</span>
                                    <span className="text-xs text-gray-500">Achieved</span>
                                </div>
                            </div>

                            <div className="mt-6 text-center">
                                <p className="text-2xl font-bold text-gray-900">₱{goals.current.toLocaleString()}</p>
                                <p className="text-xs text-green-600 font-medium mt-1">On Track</p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row: Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Branch Distribution Donut */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Branch Activity</h3>
                            <div className="flex-1 min-h-[250px] flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={charts.branchDistribution}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {charts.branchDistribution.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Top Products */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900">Top Selling Products</h3>
                                <ArrowUpRight className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={charts.topProducts} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip cursor={{ fill: 'transparent' }} />
                                        <Bar dataKey="sales" fill="#10B981" radius={[4, 4, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function KPICard({ title, value, icon: Icon, trend, trendUp, color }: any) {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-gray-50 ${color}`}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
                <span className={`font-medium ${trendUp ? 'text-green-600' : 'text-red-600'} flex items-center`}>
                    {trend}
                </span>
                <span className="text-gray-400 ml-2">vs last month</span>
            </div>
        </div>
    );
}

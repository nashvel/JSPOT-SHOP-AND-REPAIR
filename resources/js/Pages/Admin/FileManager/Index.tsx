import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import {
    Search, MoreHorizontal, Folder, FileText, Image, Video, Music,
    HardDrive, Upload, Plus
} from 'lucide-react';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from 'recharts';

export default function Index() {
    const COLORS = ['#3b82f6', '#e5e7eb'];
    const storageData = [
        { name: 'Used', value: 75 },
        { name: 'Free', value: 25 },
    ];

    const shortcuts = ['My Files', 'Shared with me', 'Recent', 'Starred', 'Trash'];
    const recentFiles = [
        { name: 'Project_Specs_v2.pdf', type: 'PDF', size: '2.4 MB', date: '2 hrs ago', icon: FileText },
        { name: 'Dashboard_Mockup.png', type: 'Image', size: '1.8 MB', date: '5 hrs ago', icon: Image },
        { name: 'Onboarding_Video.mp4', type: 'Video', size: '150 MB', date: '1 day ago', icon: Video },
        { name: 'Meeting_Notes.docx', type: 'Doc', size: '450 KB', date: '2 days ago', icon: FileText },
        { name: 'Background_Music.mp3', type: 'Audio', size: '5.2 MB', date: '3 days ago', icon: Music },
        { name: 'Database_Backup.sql', type: 'Code', size: '12 MB', date: '1 week ago', icon: HardDrive },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="File Manager" />

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">File Manager</h1>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search files"
                                className="w-64 rounded-md border border-gray-200 bg-white py-1.5 pl-9 pr-4 text-sm outline-none focus:border-gray-300"
                            />
                        </div>
                        <button className="flex items-center gap-2 bg-gray-900 text-white px-4 py-1.5 rounded-md hover:bg-gray-800 transition-colors text-sm font-medium">
                            <Upload className="h-4 w-4" />
                            Upload
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2">
                        {/* Shortcuts */}
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Locations</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-12">
                            {shortcuts.map((item, idx) => (
                                <div key={idx} className="group cursor-pointer">
                                    <div className="aspect-[4/3] bg-gray-100 rounded-lg flex items-end justify-center mb-2 group-hover:bg-gray-200 transition-colors relative overflow-hidden">
                                        <Folder className="h-12 w-12 text-blue-300 absolute -bottom-1 group-hover:text-blue-400 transition-colors fill-current" />
                                    </div>
                                    <p className="text-xs text-center font-medium text-gray-600">{item}</p>
                                </div>
                            ))}
                        </div>

                        {/* Recent Files Grid */}
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Recent Files</h2>
                            <button className="text-xs text-blue-600 hover:underline">View All</button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {recentFiles.map((file, idx) => (
                                <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow flex items-start justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-500">
                                            <file.icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900 truncate max-w-[150px]">{file.name}</h3>
                                            <p className="text-xs text-gray-500">{file.size} • {file.date}</p>
                                        </div>
                                    </div>
                                    <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar / Statistics */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 h-fit">
                        <h3 className="text-base font-semibold text-gray-900 mb-6">Storage Usage</h3>
                        <div className="h-[200px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={storageData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={0}
                                        dataKey="value"
                                        startAngle={90}
                                        endAngle={-270}
                                    >
                                        {storageData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Text */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-center">
                                    <span className="block text-2xl font-bold text-gray-900">75%</span>
                                    <span className="text-xs text-gray-500">Used</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-gray-700">750 GB used</span>
                                <span className="text-gray-500">of 1 TB</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                            </div>
                            <button className="w-full mt-6 border border-gray-200 rounded-lg py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                                Upgrade Storage
                            </button>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <h4 className="text-sm font-semibold text-gray-900 mb-4">Quick Actions</h4>
                            <div className="space-y-2">
                                <button className="w-full flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-50 rounded-md transition-colors">
                                    <Plus className="h-4 w-4" /> Create New Folder
                                </button>
                                <button className="w-full flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-50 rounded-md transition-colors">
                                    <Upload className="h-4 w-4" /> Upload File
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

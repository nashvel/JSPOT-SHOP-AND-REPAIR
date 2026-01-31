import { PropsWithChildren, ReactNode, useState, useRef, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { LayoutDashboard, Users, FileText, Settings, LogOut, Shield, Search, Folder, LifeBuoy, MoreHorizontal, PanelLeftClose, ShoppingCart, ClipboardList, Package, ArrowLeftRight, Store, XCircle, MapPin, Receipt, BarChart3, PieChart, ClipboardCheck, Menu, Bell } from 'lucide-react';
import ApplicationLogo from '@/Components/ApplicationLogo';

const DropdownNotification = ({ lowStockState }: { lowStockState: any }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2 transition-colors focus:outline-none rounded-full hover:bg-gray-100 ${isOpen ? 'text-indigo-600 bg-gray-100' : 'text-gray-500'}`}
            >
                <Bell className="h-6 w-6" />
                {lowStockState?.count > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                        {lowStockState.count}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden origin-top-right animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                        <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                        {lowStockState?.count > 0 && (
                            <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                                {lowStockState.count} Alert(s)
                            </span>
                        )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {lowStockState?.items?.length > 0 ? (
                            <div className="py-2">
                                {lowStockState.items.map((item: any, idx: number) => (
                                    <Link
                                        key={idx}
                                        href={route('admin.stocks.index', { search: item.name })}
                                        className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 group"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <div className="flex-shrink-0 mt-1">
                                            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                                                <Package className="h-4 w-4 text-red-600" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {item.name}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                <span className="font-semibold text-red-600">{item.stock} left</span> (Threshold: {item.low_stock_threshold})
                                            </p>
                                            {item.branch_name && (
                                                <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                                                    <Store className="h-3 w-3" /> {item.branch_name}
                                                </p>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                                {lowStockState.count > 5 && (
                                    <Link
                                        href={route('admin.stocks.index', { low_stock: true })}
                                        className="block px-4 py-3 text-xs text-center text-indigo-600 font-medium hover:bg-indigo-50 transition-colors border-t border-gray-100"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        View all {lowStockState.count} alerts
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="px-4 py-8 text-center text-gray-500">
                                <div className="mx-auto h-12 w-12 text-gray-300 mb-2 flex items-center justify-center rounded-full bg-gray-50">
                                    <Bell className="h-6 w-6" />
                                </div>
                                <p className="text-sm">No new notifications</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};


export default function Authenticated({
    children,
    header,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const { auth, impersonating } = usePage().props as any;
    const user = auth.user;
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Icon mapping
    const iconMap: Record<string, any> = {
        LayoutDashboard,
        Users,
        FileText,
        Shield,
        Settings,
        Folder,
        LifeBuoy,
        ShoppingCart,
        ClipboardList,
        Package,
        ArrowLeftRight,
        Store,
        MapPin,
        Receipt,
        BarChart3,
        PieChart,
        ClipboardCheck,
    };

    // Use menus from auth (comes from middleware based on impersonation/branch)
    const menus = auth.menus || [];

    // Group menus
    const groupedMenus = menus.reduce((acc: any, menu: any) => {
        const group = menu.group || 'Essentials';
        if (!acc[group]) acc[group] = [];
        acc[group].push(menu);
        return acc;
    }, {});

    const groupOrder = ['Essentials', 'Analytics', 'Operations', 'Inventory', 'Management', 'Support'];

    const handleExitImpersonation = () => {
        router.post(route('admin.stop-impersonating'));
    };

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 text-sm">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-gray-200 bg-white flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Impersonation Banner */}
                {impersonating?.active && (
                    <div className="bg-amber-500 text-white px-4 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <Store className="h-4 w-4 flex-shrink-0" />
                            <div className="flex flex-col min-w-0">
                                <span className="font-bold text-xs uppercase tracking-wider">Impersonating</span>
                                <span className="font-medium text-sm truncate" title={`${impersonating.user_name} (${impersonating.branch_name})`}>
                                    {impersonating.user_name} ({impersonating.branch_name})
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={handleExitImpersonation}
                            className="flex items-center gap-1 text-xs bg-amber-600 hover:bg-amber-700 px-3 py-1.5 rounded transition-colors flex-shrink-0 ml-2"
                        >
                            <XCircle className="h-3 w-3" />
                            Exit
                        </button>
                    </div>
                )}

                {/* Profile / Workspace Switcher Style Header */}
                <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <img src="/user.png" alt="Profile" className="h-8 w-8 rounded-md object-cover bg-gray-100" />
                            <div className="min-w-0">
                                <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                                <p className="text-xs text-gray-500 truncate capitalize">{user.role?.display_name || 'User'}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="lg:hidden text-gray-400 hover:text-gray-600"
                        >
                            <PanelLeftClose className="h-5 w-5" />
                        </button>
                    </div>
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search"
                            className="w-full rounded-md border border-gray-200 bg-gray-50 py-1.5 pl-9 pr-4 text-sm outline-none focus:border-indigo-500 focus:bg-white"
                        />
                        <span className="absolute right-2.5 top-2 text-xs text-gray-400">⌘F</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-6 overflow-y-auto [&::-webkit-scrollbar]:hidden">
                    {groupOrder.map(group => {
                        const groupMenus = groupedMenus[group];
                        if (!groupMenus) return null;

                        return (
                            <div key={group}>
                                <h3 className="mb-2 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {group}
                                </h3>
                                <div className="space-y-1">
                                    {groupMenus.map((menu: any) => {
                                        const IconComponent = iconMap[menu.icon] || FileText;
                                        const active = route().current(menu.route) || route().current(menu.route + '.*');

                                        return (
                                            <Link
                                                key={menu.id}
                                                href={route(menu.route)}
                                                onClick={() => setIsSidebarOpen(false)}
                                                className={`flex items-center gap-3 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${active
                                                    ? 'bg-gray-100 text-gray-900'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                    }`}
                                            >
                                                <IconComponent className="h-4 w-4" />
                                                {menu.name}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        )
                    })}

                    {/* Hardcoded Super Admin Panel - Only visible to Super Admin role */}
                    {user.role?.name === 'super_admin' && (
                        <div>
                            <h3 className="mb-2 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ADMINISTRATION
                            </h3>
                            <div className="space-y-1">
                                <Link
                                    href={route('admin.super-admin.index')}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={`flex items-center gap-3 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${route().current('admin.super-admin.*')
                                        ? 'bg-gray-100 text-gray-900'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <Shield className="h-4 w-4" />
                                    Super Admin Panel
                                </Link>
                            </div>
                        </div>
                    )}
                </nav>

                <div className="border-t border-gray-100 p-4">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        Log Out
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Header */}
                <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="-ml-2 p-2 rounded-md text-gray-600 hover:bg-gray-100"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <div className="flex items-center gap-2">
                            <img src="/jspot-removebg-preview.png" alt="JSPOT" className="h-8 w-auto object-contain" />
                            <span className="font-bold text-gray-900">JSPOT POS</span>
                        </div>
                    </div>

                    {/* Mobile Actions */}
                    <div className="flex items-center gap-3">
                        <DropdownNotification lowStockState={(usePage().props as any).lowStockState} />
                        <div className="h-8 w-8 rounded-full bg-gray-100 overflow-hidden border border-gray-200">
                            <img src="/user.png" alt="Profile" className="h-full w-full object-cover" />
                        </div>
                    </div>
                </div>

                {/* Header with Notification */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-30 px-6 py-3 flex items-center justify-between">
                    <h1 className="text-xl font-semibold text-gray-800">
                        {header}
                    </h1>
                    <div className="hidden lg:flex items-center gap-4">
                        <DropdownNotification lowStockState={(usePage().props as any).lowStockState} />
                        <div className="flex items-center gap-3 border-l pl-4 ml-2">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.role?.display_name || 'User'}</p>
                            </div>
                            <img src="/user.png" alt="Profile" className="h-8 w-8 rounded-full bg-gray-100 object-cover" />
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto bg-white p-6 sm:p-8 [&::-webkit-scrollbar]:hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}

import { PropsWithChildren, ReactNode } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { LayoutDashboard, Users, FileText, Settings, LogOut, Shield, Search, Folder, LifeBuoy, MoreHorizontal, PanelLeftClose, ShoppingCart, ClipboardList, Package, ArrowLeftRight, Store, XCircle, MapPin, Receipt, BarChart3, PieChart, ClipboardCheck } from 'lucide-react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function Authenticated({
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const { auth, impersonating } = usePage().props as any;
    const user = auth.user;

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
            {/* Sidebar */}
            <div className="w-64 border-r border-gray-200 bg-white flex flex-col">
                {/* Impersonation Banner */}
                {impersonating?.active && (
                    <div className="bg-amber-500 text-white px-4 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Store className="h-4 w-4" />
                            <span className="font-medium text-sm truncate">{impersonating.branch_name}</span>
                        </div>
                        <button
                            onClick={handleExitImpersonation}
                            className="flex items-center gap-1 text-xs bg-amber-600 hover:bg-amber-700 px-2 py-1 rounded"
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
                            <div className="h-8 w-8 rounded bg-gray-900 flex items-center justify-center text-white">
                                <ApplicationLogo className="h-5 w-5 fill-current" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                                <p className="text-xs text-gray-500 truncate capitalize">{user.role?.display_name || 'User'}</p>
                            </div>
                        </div>
                        <PanelLeftClose className="h-4 w-4 text-gray-400" />
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
                {/* No top header bar - content flows freely like in the example image */}
                <main className="flex-1 overflow-y-auto bg-white p-6 sm:p-8 [&::-webkit-scrollbar]:hidden">
                    {/* Inject Header Here if needed */}
                    {children}
                </main>
            </div>
        </div>
    );
}

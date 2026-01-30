import { Link } from '@inertiajs/react';

interface Props {
    activeTab: 'sales' | 'inventory' | 'job-orders';
}

export default function AnalyticsTabs({ activeTab }: Props) {
    const tabs = [
        { id: 'sales', name: 'Sales Report', route: 'admin.analytics.sales' },
        { id: 'inventory', name: 'Inventory Report', route: 'admin.analytics.inventory' },
        { id: 'job-orders', name: 'Job Orders Report', route: 'admin.analytics.job-orders' },
    ];

    return (
        <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map((tab) => (
                    <Link
                        key={tab.id}
                        href={route(tab.route)}
                        className={`
                            whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm
                            ${activeTab === tab.id
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                        `}
                    >
                        {tab.name}
                    </Link>
                ))}
            </nav>
        </div>
    );
}

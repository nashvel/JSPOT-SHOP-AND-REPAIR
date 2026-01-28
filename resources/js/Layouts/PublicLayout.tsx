import { PropsWithChildren } from 'react';
import { Link, Head } from '@inertiajs/react';
import { ShoppingBag, Search, ClipboardList } from 'lucide-react';

export default function PublicLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen bg-white">
            <nav className="border-b border-gray-100 bg-white sticky top-0 z-50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        <div className="flex items-center gap-2">
                            <ShoppingBag className="h-6 w-6 text-gray-900" />
                            <Link href="/" className="text-xl font-bold tracking-tight text-gray-900">
                                MotorShop
                            </Link>
                        </div>

                        <div className="flex items-center gap-6">
                            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                                Shop
                            </Link>
                            <Link href="/track" className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900">
                                <ClipboardList className="h-4 w-4" />
                                Track Repair
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main>{children}</main>

            <footer className="border-t border-gray-100 bg-gray-50 mt-12">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <p className="text-center text-xs text-gray-500">
                        &copy; 2026 MotorShop POS. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}

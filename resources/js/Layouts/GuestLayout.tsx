import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4">
            <div className="w-full overflow-hidden bg-white px-6 py-12 shadow-2xl sm:max-w-md rounded-lg">
                <div className="mb-10 text-center">
                    <h1 className="text-3xl font-bold text-gray-800 tracking-wide">Login</h1>
                </div>
                {children}
            </div>
        </div>
    );
}

import { MapPin, ChevronRight, Navigation, Loader2 } from 'lucide-react';
import { router } from '@inertiajs/react';

interface Branch {
    id: number;
    name: string;
    distance?: string;
}

interface BranchSelectionSectionProps {
    branches: Branch[];
    nearestBranch: Branch | null;
    isLocating: boolean;
    onFindNearest: () => void;
    themeColors: { primary: string; secondary: string; accent: string };
}

export default function BranchSelectionSection({
    branches,
    nearestBranch,
    isLocating,
    onFindNearest,
    themeColors = { primary: 'purple', secondary: 'gray', accent: 'red' },
}: BranchSelectionSectionProps) {
    return (
        <div id="branch-selection" className="py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-black text-primary-900 uppercase tracking-tight mb-4">
                        Select Your Branch
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
                        Choose a location to see products and stock available near you.
                    </p>

                    {/* Find Nearest Store Button */}
                    <button
                        onClick={onFindNearest}
                        disabled={isLocating}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-700 to-primary-600 text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-70 disabled:cursor-wait"
                    >
                        {isLocating ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Finding your location...
                            </>
                        ) : (
                            <>
                                <Navigation className="w-5 h-5" />
                                Find Nearest Store
                            </>
                        )}
                    </button>

                    {/* Nearest Branch Result */}
                    {nearestBranch && (
                        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl inline-block">
                            <p className="text-green-800 font-medium">
                                📍 Nearest store: <strong>{nearestBranch.name}</strong> ({nearestBranch.distance} km away)
                            </p>
                            <button
                                onClick={() => router.get('/', { branch: nearestBranch.name }, { preserveState: false })}
                                className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                            >
                                Go to {nearestBranch.name}
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {branches.map((branch) => (
                        <button
                            key={branch.id}
                            onClick={() => {
                                router.get('/', { branch: branch.name }, { preserveState: false });
                            }}
                            className="group relative bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl border-2 border-transparent hover:border-primary-500 transition-all duration-300 text-left flex flex-col h-full"
                        >
                            <div className="bg-primary-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                                <MapPin className="w-7 h-7 text-primary-600 group-hover:text-white" />
                            </div>

                            <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-primary-700 transition-colors">
                                {branch.name}
                            </h3>

                            <p className="text-gray-500 mb-6 flex-grow">
                                Visit our {branch.name} location for premium auto parts and services.
                            </p>

                            <div className="flex items-center text-primary-600 font-bold group-hover:translate-x-2 transition-transform duration-300">
                                Select Branch <ChevronRight className="w-5 h-5 ml-1" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

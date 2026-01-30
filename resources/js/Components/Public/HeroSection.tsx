import { X } from 'lucide-react';

interface HeroSectionProps {
    themeColors?: { primary: string; secondary: string; accent: string };
}

export default function HeroSection({ themeColors = { primary: 'purple', secondary: 'gray', accent: 'red' } }: HeroSectionProps) {
    return (
        <div className="bg-white py-12 sm:py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div className="text-left order-2 lg:order-1">
                        {/* Promo Badge */}
                        <div className="inline-flex items-center mb-6 promo-badge">
                            <button className="bg-purple-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                                GET 2% OFF
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <h1 className="hidden sm:block text-4xl sm:text-5xl lg:text-6xl font-black text-purple-900 mb-4 leading-tight">
                            Unleash Your Ride's
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-900">
                                Performance
                            </span>
                        </h1>

                        <button
                            onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                            className="hidden sm:block bg-purple-900 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-bold text-base sm:text-lg hover:bg-purple-800 transition-colors shadow-lg"
                        >
                            GET A FREE QUOTE!
                        </button>
                    </div>

                    <div>
                        <img
                            src="/hero.png"
                            alt="Premium Vehicles"
                            className="w-full h-auto"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

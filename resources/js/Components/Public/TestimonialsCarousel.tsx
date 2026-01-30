import { useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

interface Testimonial {
    text: string;
    author: string;
    role: string;
}

interface TestimonialsCarouselProps {
    testimonials?: Testimonial[];
}

const defaultTestimonials: Testimonial[] = [
    {
        text: "Excellent service! High quality parts and very friendly staff!",
        author: "Juan Dela Cruz",
        role: "Car Enthusiast"
    },
    {
        text: "Best automotive parts supplier in town. Always reliable!",
        author: "Maria Santos",
        role: "Fleet Manager"
    },
    {
        text: "Great prices and authentic products. Highly recommended!",
        author: "Roberto Garcia",
        role: "Mechanic"
    }
];

export default function TestimonialsCarousel({ testimonials = defaultTestimonials }: TestimonialsCarouselProps) {
    const [current, setCurrent] = useState(0);

    const next = () => setCurrent((prev) => (prev + 1) % testimonials.length);
    const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);

    return (
        <div className="bg-gradient-to-b from-purple-50 to-white py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-purple-900">
                        What Our Customers Say
                    </h2>
                </div>

                <div className="relative max-w-2xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                        <div className="flex justify-center mb-4">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                            ))}
                        </div>
                        <p className="text-gray-700 text-lg italic mb-6">
                            "{testimonials[current].text}"
                        </p>
                        <div>
                            <p className="font-bold text-gray-900">{testimonials[current].author}</p>
                            <p className="text-gray-500 text-sm">{testimonials[current].role}</p>
                        </div>
                    </div>

                    <button
                        onClick={prev}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50"
                    >
                        <ChevronLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <button
                        onClick={next}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50"
                    >
                        <ChevronRight className="w-6 h-6 text-gray-600" />
                    </button>

                    <div className="flex justify-center gap-2 mt-6">
                        {testimonials.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrent(i)}
                                className={`w-2 h-2 rounded-full transition-colors ${i === current ? 'bg-purple-600' : 'bg-gray-300'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

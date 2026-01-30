import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);
    const [scrollPercentage, setScrollPercentage] = useState(0);

    const toggleVisibility = () => {
        const scrolled = document.documentElement.scrollTop;
        const maxHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const percentage = Math.round((scrolled / maxHeight) * 100);

        setScrollPercentage(percentage);

        if (percentage > 5) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <button
                onClick={scrollToTop}
                className={`flex justify-center items-center border-none w-[60px] h-[60px] rounded-full cursor-pointer shadow-[0px_4px_10px_rgba(0,0,0,0.162)] transition-all duration-200 p-[0.4rem] ${isVisible ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-[120%] opacity-0 pointer-events-none'
                    }`}
                style={{
                    background: `conic-gradient(#2b2692 ${scrollPercentage}%, #e0e0e0 ${scrollPercentage}%)`,
                }}
            >
                <div className="group flex flex-col w-full h-full bg-[#4f46e5] rounded-full overflow-hidden relative">
                    <span
                        className="absolute inset-0 flex justify-center items-center text-white text-xs font-bold transition-transform duration-300 group-hover:-translate-y-full"
                    >
                        {scrollPercentage}%
                    </span>
                    <span
                        className="absolute inset-0 flex justify-center items-center text-white transition-transform duration-300 translate-y-full group-hover:translate-y-0"
                    >
                        <ArrowUp className="w-5 h-5" />
                    </span>
                </div>
            </button>
        </div>
    );
}

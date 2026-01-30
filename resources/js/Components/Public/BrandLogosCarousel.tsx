const brands = [
    { name: 'Toyota', logo: 'https://cdn.worldvectorlogo.com/logos/toyota-1.svg' },
    { name: 'Honda', logo: 'https://cdn.worldvectorlogo.com/logos/honda-6.svg' },
    { name: 'Nissan', logo: 'https://cdn.worldvectorlogo.com/logos/nissan-6.svg' },
    { name: 'Ford', logo: 'https://cdn.worldvectorlogo.com/logos/ford-8.svg' },
    { name: 'Chevrolet', logo: 'https://cdn.worldvectorlogo.com/logos/chevrolet.svg' },
    { name: 'BMW', logo: 'https://cdn.worldvectorlogo.com/logos/bmw.svg' },
    { name: 'Hyundai', logo: 'https://cdn.worldvectorlogo.com/logos/hyundai-motor-company-2.svg' },
    { name: 'Mercedes', logo: 'https://cdn.worldvectorlogo.com/logos/mercedes-benz-9.svg' },
    { name: 'Audi', logo: 'https://cdn.worldvectorlogo.com/logos/audi-13.svg' },
    { name: 'Volkswagen', logo: 'https://cdn.worldvectorlogo.com/logos/volkswagen-3.svg' },
    { name: 'Subaru', logo: 'https://cdn.worldvectorlogo.com/logos/subaru-1.svg' },
    { name: 'Mazda', logo: 'https://cdn.worldvectorlogo.com/logos/mazda-2.svg' },
    { name: 'Kia', logo: 'https://cdn.worldvectorlogo.com/logos/kia-3.svg' },
    { name: 'Jeep', logo: 'https://cdn.worldvectorlogo.com/logos/jeep-3.svg' },
    { name: 'Fiat', logo: 'https://cdn.worldvectorlogo.com/logos/fiat-3.svg' },
];

export default function BrandLogosCarousel() {
    // Duplicate for seamless loop
    const allBrands = [...brands, ...brands];

    return (
        <div className="bg-white py-16 overflow-hidden">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="relative w-full overflow-hidden mask-gradient">
                    <div className="flex w-max animate-scroll gap-8 sm:gap-12 lg:gap-16 hover:pause">
                        {allBrands.map((brand, index) => (
                            <div
                                key={`${brand.name}-${index}`}
                                className="flex-shrink-0 flex justify-center items-center w-24 h-24 sm:w-32 sm:h-32 bg-gray-50 rounded-full p-6 hover:shadow-lg transition-all duration-300 group cursor-pointer hover:bg-white border border-transparent hover:border-gray-100"
                            >
                                <img
                                    src={brand.logo}
                                    alt={brand.name}
                                    className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300 opacity-70 group-hover:opacity-100 transform group-hover:scale-110"
                                    onError={(e) => {
                                        const parent = e.currentTarget.parentElement;
                                        if (parent) {
                                            e.currentTarget.style.display = 'none';
                                            parent.innerText = brand.name;
                                            parent.classList.add('text-xs', 'font-bold', 'text-gray-500');
                                        }
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

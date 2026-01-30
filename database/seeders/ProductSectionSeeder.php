<?php

namespace Database\Seeders;

use App\Models\ProductSection;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSectionSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        $sections = [
            [
                'name' => 'Premium Auto Parts & Accessories',
                'slug' => 'premium-parts-accessories',
                'description' => 'Featured premium automotive parts and accessories',
                'order' => 1,
            ],
            [
                'name' => 'Best Sellers',
                'slug' => 'best-sellers',
                'description' => 'Our most popular products',
                'order' => 2,
            ],
            [
                'name' => 'New Arrivals',
                'slug' => 'new-arrivals',
                'description' => 'Latest products in stock',
                'order' => 3,
            ],
            [
                'name' => 'Budget-Friendly Options',
                'slug' => 'budget-friendly',
                'description' => 'Quality products at affordable prices',
                'order' => 4,
            ],
        ];

        foreach ($sections as $section) {
            ProductSection::create($section);
        }
    }
}

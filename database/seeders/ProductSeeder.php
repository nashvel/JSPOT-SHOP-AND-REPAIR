<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Branch;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            ['name' => 'Engine Oil', 'description' => 'Synthentic 4T Oil', 'price' => 250.00, 'sku' => 'OIL-001'],
            ['name' => 'Brake Pad', 'description' => 'Ceramic Brake Pad', 'price' => 450.00, 'sku' => 'BRK-002'],
            ['name' => 'Chain Lube', 'description' => 'High performance lube', 'price' => 150.00, 'sku' => 'LUB-003'],
            ['name' => 'Spark Plug', 'description' => 'Iridium Spark Plug', 'price' => 120.00, 'sku' => 'SPK-004'],
            ['name' => 'Helmet', 'description' => 'Full Face Helmet', 'price' => 2500.00, 'sku' => 'HLM-005'],
        ];

        $branches = Branch::all();

        foreach ($products as $prod) {
            $product = Product::create($prod);

            // Attach to all branches with random stock
            foreach ($branches as $branch) {
                $branch->products()->attach($product->id, ['stock_quantity' => rand(10, 100)]);
            }
        }
    }
}

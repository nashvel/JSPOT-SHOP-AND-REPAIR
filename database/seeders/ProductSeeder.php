<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Branch;
use App\Models\Category;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // Create categories first
        $oilCategory = Category::firstOrCreate(
            ['name' => 'Oils & Lubricants'],
            ['name' => 'Oils & Lubricants', 'type' => 'product']
        );
        $partsCategory = Category::firstOrCreate(
            ['name' => 'Parts & Accessories'],
            ['name' => 'Parts & Accessories', 'type' => 'product']
        );
        $serviceCategory = Category::firstOrCreate(
            ['name' => 'Services'],
            ['name' => 'Services', 'type' => 'service']
        );

        // Products (physical items with stock)
        $products = [
            [
                'name' => 'Engine Oil 4T',
                'description' => 'Synthetic 4T Engine Oil - 1L',
                'price' => 250.00,
                'cost' => 180.00,
                'sku' => 'OIL-001',
                'type' => 'product',
                'category_id' => $oilCategory->id,
            ],
            [
                'name' => 'Brake Pad Set',
                'description' => 'Ceramic Brake Pad - Front',
                'price' => 450.00,
                'cost' => 320.00,
                'sku' => 'BRK-002',
                'type' => 'product',
                'category_id' => $partsCategory->id,
            ],
            [
                'name' => 'Chain Lube',
                'description' => 'High Performance Chain Lubricant',
                'price' => 150.00,
                'cost' => 100.00,
                'sku' => 'LUB-003',
                'type' => 'product',
                'category_id' => $oilCategory->id,
            ],
            [
                'name' => 'Spark Plug',
                'description' => 'Iridium Spark Plug',
                'price' => 120.00,
                'cost' => 80.00,
                'sku' => 'SPK-004',
                'type' => 'product',
                'category_id' => $partsCategory->id,
            ],
            [
                'name' => 'Air Filter',
                'description' => 'High Flow Air Filter',
                'price' => 350.00,
                'cost' => 250.00,
                'sku' => 'FLT-005',
                'type' => 'product',
                'category_id' => $partsCategory->id,
            ],
            [
                'name' => 'Transmission Oil',
                'description' => 'Automatic Transmission Fluid - 1L',
                'price' => 280.00,
                'cost' => 200.00,
                'sku' => 'OIL-006',
                'type' => 'product',
                'category_id' => $oilCategory->id,
            ],
            [
                'name' => 'Battery 12V',
                'description' => 'Maintenance-Free Battery',
                'price' => 1500.00,
                'cost' => 1100.00,
                'sku' => 'BAT-007',
                'type' => 'product',
                'category_id' => $partsCategory->id,
            ],
        ];

        // Services (no stock needed)
        $services = [
            [
                'name' => 'Oil Change Service',
                'description' => 'Complete oil change with filter',
                'price' => 300.00,
                'cost' => 100.00,
                'sku' => 'SRV-001',
                'type' => 'service',
                'category_id' => $serviceCategory->id,
            ],
            [
                'name' => 'Brake Service',
                'description' => 'Brake inspection and adjustment',
                'price' => 500.00,
                'cost' => 150.00,
                'sku' => 'SRV-002',
                'type' => 'service',
                'category_id' => $serviceCategory->id,
            ],
            [
                'name' => 'Tire Replacement',
                'description' => 'Tire removal and installation',
                'price' => 200.00,
                'cost' => 50.00,
                'sku' => 'SRV-003',
                'type' => 'service',
                'category_id' => $serviceCategory->id,
            ],
            [
                'name' => 'Engine Tune-Up',
                'description' => 'Complete engine tune-up service',
                'price' => 800.00,
                'cost' => 300.00,
                'sku' => 'SRV-004',
                'type' => 'service',
                'category_id' => $serviceCategory->id,
            ],
            [
                'name' => 'Chain Cleaning & Lube',
                'description' => 'Chain cleaning and lubrication service',
                'price' => 150.00,
                'cost' => 50.00,
                'sku' => 'SRV-005',
                'type' => 'service',
                'category_id' => $serviceCategory->id,
            ],
            [
                'name' => 'General Checkup',
                'description' => 'Complete motorcycle inspection',
                'price' => 250.00,
                'cost' => 80.00,
                'sku' => 'SRV-006',
                'type' => 'service',
                'category_id' => $serviceCategory->id,
            ],
        ];

        $branches = Branch::all();

        if ($branches->isEmpty()) {
            $this->command->warn('No branches found. Please seed branches first.');
            return;
        }

        // Create products and attach to branches with stock
        foreach ($products as $prod) {
            $product = Product::firstOrCreate(
                ['sku' => $prod['sku']],
                $prod
            );

            // Attach to all branches with stock
            foreach ($branches as $branch) {
                if (!$product->branches()->where('branch_id', $branch->id)->exists()) {
                    $product->branches()->attach($branch->id, [
                        'stock_quantity' => rand(20, 100)
                    ]);
                }
            }
        }

        // Create services and attach to branches (stock_quantity = 0 for services)
        foreach ($services as $srv) {
            $service = Product::firstOrCreate(
                ['sku' => $srv['sku']],
                $srv
            );

            // Attach services to all branches (with 0 stock_quantity)
            foreach ($branches as $branch) {
                if (!$service->branches()->where('branch_id', $branch->id)->exists()) {
                    $service->branches()->attach($branch->id, [
                        'stock_quantity' => 0
                    ]);
                }
            }
        }

        $this->command->info('Created ' . count($products) . ' products and ' . count($services) . ' services.');
    }
}

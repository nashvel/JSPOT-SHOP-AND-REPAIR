<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Branch;
use App\Models\Category;
use App\Models\Product;
use App\Models\BranchInventory;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create permissions
        $permissions = [
            'view_dashboard', 'manage_products', 'manage_inventory',
            'process_sales', 'manage_customers', 'view_reports',
            'manage_users', 'manage_branches', 'manage_settings',
            'impersonate_users', 'view_all_branches'
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles
        $developer = Role::create(['name' => 'developer']);
        $developer->givePermissionTo(Permission::all());

        $admin = Role::create(['name' => 'admin']);
        $admin->givePermissionTo([
            'view_dashboard', 'manage_products', 'manage_inventory',
            'process_sales', 'manage_customers', 'view_reports',
            'manage_users', 'manage_branches', 'view_all_branches'
        ]);

        $manager = Role::create(['name' => 'manager']);
        $manager->givePermissionTo([
            'view_dashboard', 'manage_products', 'manage_inventory',
            'process_sales', 'manage_customers', 'view_reports'
        ]);

        $cashier = Role::create(['name' => 'cashier']);
        $cashier->givePermissionTo(['view_dashboard', 'process_sales']);

        // Create main branch
        $mainBranch = Branch::create([
            'name' => 'Main Branch',
            'code' => 'MAIN',
            'address' => '123 Main Street',
            'phone' => '+63 912 345 6789',
            'email' => 'main@motorshop.com',
            'is_main' => true,
            'is_active' => true,
        ]);

        // Create additional branches
        $branch2 = Branch::create([
            'name' => 'Branch 2 - North',
            'code' => 'BR02',
            'address' => '456 North Avenue',
            'phone' => '+63 912 345 6790',
            'email' => 'north@motorshop.com',
            'is_main' => false,
            'is_active' => true,
        ]);

        // Create developer user
        $developer_user = User::create([
            'name' => 'Developer',
            'email' => 'dev@motorshop.com',
            'password' => bcrypt('password'),
            'branch_id' => $mainBranch->id,
            'is_active' => true,
        ]);
        $developer_user->assignRole('developer');

        // Create admin user
        $admin_user = User::create([
            'name' => 'Admin User',
            'email' => 'admin@motorshop.com',
            'password' => bcrypt('password'),
            'branch_id' => $mainBranch->id,
            'is_active' => true,
        ]);
        $admin_user->assignRole('admin');

        // Create categories
        $categories = [
            ['name' => 'Motorcycle Parts', 'slug' => 'motorcycle-parts'],
            ['name' => 'Accessories', 'slug' => 'accessories'],
            ['name' => 'Oils & Lubricants', 'slug' => 'oils-lubricants'],
            ['name' => 'Tires', 'slug' => 'tires'],
            ['name' => 'Batteries', 'slug' => 'batteries'],
        ];

        foreach ($categories as $cat) {
            Category::create(array_merge($cat, ['is_active' => true]));
        }

        // Create sample products
        $products = [
            [
                'name' => 'Engine Oil 10W-40',
                'sku' => 'OIL-10W40',
                'barcode' => '1234567890123',
                'description' => 'High-quality synthetic engine oil',
                'category_id' => 3,
                'price' => 450.00,
                'cost' => 300.00,
                'stock_quantity' => 100,
                'min_stock_level' => 20,
                'unit' => 'bottle',
            ],
            [
                'name' => 'Brake Pads Set',
                'sku' => 'BP-001',
                'barcode' => '1234567890124',
                'description' => 'Premium brake pads for motorcycles',
                'category_id' => 1,
                'price' => 850.00,
                'cost' => 600.00,
                'stock_quantity' => 50,
                'min_stock_level' => 10,
                'unit' => 'set',
            ],
            [
                'name' => 'Motorcycle Helmet',
                'sku' => 'HLM-001',
                'barcode' => '1234567890125',
                'description' => 'Full-face motorcycle helmet',
                'category_id' => 2,
                'price' => 2500.00,
                'cost' => 1800.00,
                'stock_quantity' => 30,
                'min_stock_level' => 5,
                'unit' => 'pcs',
            ],
        ];

        foreach ($products as $productData) {
            $product = Product::create($productData);

            // Add inventory for each branch
            BranchInventory::create([
                'branch_id' => $mainBranch->id,
                'product_id' => $product->id,
                'quantity' => $productData['stock_quantity'],
                'reserved_quantity' => 0,
            ]);

            BranchInventory::create([
                'branch_id' => $branch2->id,
                'product_id' => $product->id,
                'quantity' => rand(10, 50),
                'reserved_quantity' => 0,
            ]);
        }
    }
}

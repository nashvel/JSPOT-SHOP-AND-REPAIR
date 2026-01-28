<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing menus to avoid duplicates if re-seeding
        \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
        \Illuminate\Support\Facades\DB::table('menu_user')->truncate();
        \Illuminate\Support\Facades\DB::table('menus')->truncate();
        \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();

        // 1. Create Menus
        // Essentials
        $dashboard = \App\Models\Menu::create(['name' => 'Overview', 'route' => 'admin.dashboard', 'icon' => 'LayoutDashboard', 'group' => 'Essentials', 'order' => 1]);
        
        // Operations
        $pos = \App\Models\Menu::create(['name' => 'Point of Sale', 'route' => 'admin.pos.index', 'icon' => 'ShoppingCart', 'group' => 'Operations', 'order' => 2]);
        $orders = \App\Models\Menu::create(['name' => 'Job Orders', 'route' => 'admin.job-orders.index', 'icon' => 'ClipboardList', 'group' => 'Operations', 'order' => 3]);
        
        // Inventory
        $products = \App\Models\Menu::create(['name' => 'Inventory', 'route' => 'admin.products.index', 'icon' => 'Package', 'group' => 'Inventory', 'order' => 4]);
        $stocks = \App\Models\Menu::create(['name' => 'Stock Adjustment', 'route' => 'admin.stocks.index', 'icon' => 'ArrowLeftRight', 'group' => 'Inventory', 'order' => 5]);

        // Management
        $branches = \App\Models\Menu::create(['name' => 'Branches', 'route' => 'admin.branches.index', 'icon' => 'Store', 'group' => 'Management', 'order' => 6]);
        $users = \App\Models\Menu::create(['name' => 'Users', 'route' => 'admin.users.index', 'icon' => 'Users', 'group' => 'Management', 'order' => 7]);
        $settings = \App\Models\Menu::create(['name' => 'Settings', 'route' => 'admin.settings.index', 'icon' => 'Settings', 'group' => 'Management', 'order' => 8]);

        // 2. Assign Menus to Users
        $allUsers = \App\Models\User::all();
        $adminMenus = [$dashboard->id, $pos->id, $orders->id, $products->id, $stocks->id, $branches->id, $users->id, $settings->id];
        
        foreach ($allUsers as $user) {
            // For now, give admin access to everything. 
            // In a real app, granular permissions apply.
            if ($user->role === 'admin') {
                $user->menus()->attach($adminMenus);
            }
            // Basic users might only get POS and Orders
             if ($user->role !== 'admin') {
                $user->menus()->attach([$dashboard->id, $pos->id, $orders->id]);
            }
        }
    }
}

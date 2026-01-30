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
        // COMMENTED OUT - Menus are now created via migration (2026_01_30_024046_create_all_system_menus.php)
        // This seeder is kept for reference but not used in production
        
        /*
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
        $sales = \App\Models\Menu::create(['name' => 'Sales Record', 'route' => 'admin.sales.index', 'icon' => 'Receipt', 'group' => 'Operations', 'order' => 4]);

        // Inventory
        $products = \App\Models\Menu::create(['name' => 'Products & Services', 'route' => 'admin.products.index', 'icon' => 'Package', 'group' => 'Inventory', 'order' => 4]);
        $stocks = \App\Models\Menu::create(['name' => 'Inventory Management', 'route' => 'admin.stocks.index', 'icon' => 'ArrowLeftRight', 'group' => 'Inventory', 'order' => 5]);

        // Management
        $branchLocations = \App\Models\Menu::create(['name' => 'Branch Locations', 'route' => 'admin.branch-locations.index', 'icon' => 'MapPin', 'group' => 'Management', 'order' => 6]);
        $branches = \App\Models\Menu::create(['name' => 'Branch Accounts', 'route' => 'admin.branches.index', 'icon' => 'Store', 'group' => 'Management', 'order' => 7]);
        $mechanics = \App\Models\Menu::create(['name' => 'Mechanics', 'route' => 'admin.mechanics.index', 'icon' => 'Wrench', 'group' => 'Management', 'order' => 8]);
        $users = \App\Models\Menu::create(['name' => 'Users', 'route' => 'admin.users.index', 'icon' => 'Users', 'group' => 'Management', 'order' => 9]);
        $settings = \App\Models\Menu::create(['name' => 'Settings', 'route' => 'admin.settings.index', 'icon' => 'Settings', 'group' => 'Management', 'order' => 10]);

        // Analytics
        $analyticsSales = \App\Models\Menu::create(['name' => 'Sales Report', 'route' => 'admin.analytics.sales', 'icon' => 'BarChart3', 'group' => 'Analytics', 'order' => 11]);
        $analyticsInventory = \App\Models\Menu::create(['name' => 'Inventory Report', 'route' => 'admin.analytics.inventory', 'icon' => 'PieChart', 'group' => 'Analytics', 'order' => 12]);
        $analyticsJobs = \App\Models\Menu::create(['name' => 'Job Orders Report', 'route' => 'admin.analytics.job-orders', 'icon' => 'ClipboardCheck', 'group' => 'Analytics', 'order' => 13]);

        // 2. Assign Menus to Users
        $allUsers = \App\Models\User::all();
        // System Admin menus (no POS - they manage branches, not sell)
        $adminMenus = [
            $dashboard->id,
            $orders->id,
            $sales->id,
            $products->id,
            $stocks->id,
            $branchLocations->id,
            $branches->id,
            $mechanics->id,
            $users->id,
            $settings->id,
            $analyticsSales->id,
            $analyticsInventory->id,
            $analyticsJobs->id
        ];

        foreach ($allUsers as $user) {
            // System Admin - no POS access
            if ($user->role === 'admin' && !$user->branch_id) {
                $user->menus()->attach($adminMenus);
            }
            // Branch users - include POS
            if ($user->role !== 'admin' || $user->branch_id) {
                $user->menus()->attach([$dashboard->id, $pos->id, $orders->id, $sales->id, $products->id, $stocks->id, $mechanics->id]);
            }
        }
        */
    }
}

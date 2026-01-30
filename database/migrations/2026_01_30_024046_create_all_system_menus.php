<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Menu;
use App\Models\User;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // ============================================
        // ESSENTIALS
        // ============================================
        $dashboard = Menu::firstOrCreate(
            ['route' => 'admin.dashboard'],
            ['name' => 'Overview', 'icon' => 'LayoutDashboard', 'group' => 'Essentials', 'order' => 1, 'parent_id' => null]
        );

        // ============================================
        // OPERATIONS
        // ============================================
        $pos = Menu::firstOrCreate(
            ['route' => 'admin.pos.index'],
            ['name' => 'Point of Sale', 'icon' => 'ShoppingCart', 'group' => 'Operations', 'order' => 2, 'parent_id' => null]
        );

        $jobOrders = Menu::firstOrCreate(
            ['route' => 'admin.job-orders.index'],
            ['name' => 'Job Orders', 'icon' => 'ClipboardList', 'group' => 'Operations', 'order' => 3, 'parent_id' => null]
        );

        $salesRecord = Menu::firstOrCreate(
            ['route' => 'admin.sales.index'],
            ['name' => 'Sales Record', 'icon' => 'Receipt', 'group' => 'Operations', 'order' => 4, 'parent_id' => null]
        );

        // ============================================
        // INVENTORY
        // ============================================
        $products = Menu::firstOrCreate(
            ['route' => 'admin.products.index'],
            ['name' => 'Products & Services', 'icon' => 'Package', 'group' => 'Inventory', 'order' => 5, 'parent_id' => null]
        );

        $stocks = Menu::firstOrCreate(
            ['route' => 'admin.stocks.index'],
            ['name' => 'Inventory Management', 'icon' => 'ArrowLeftRight', 'group' => 'Inventory', 'order' => 6, 'parent_id' => null]
        );

        // ============================================
        // MANAGEMENT
        // ============================================
        $branchLocations = Menu::firstOrCreate(
            ['route' => 'admin.branch-locations.index'],
            ['name' => 'Branch Locations', 'icon' => 'MapPin', 'group' => 'Management', 'order' => 7, 'parent_id' => null]
        );

        $branches = Menu::firstOrCreate(
            ['route' => 'admin.branches.index'],
            ['name' => 'Branch Accounts', 'icon' => 'Store', 'group' => 'Management', 'order' => 8, 'parent_id' => null]
        );

        $mechanics = Menu::firstOrCreate(
            ['route' => 'admin.mechanics.index'],
            ['name' => 'Mechanics', 'icon' => 'Wrench', 'group' => 'Management', 'order' => 9, 'parent_id' => null]
        );

        $users = Menu::firstOrCreate(
            ['route' => 'admin.users.index'],
            ['name' => 'Users', 'icon' => 'Users', 'group' => 'Management', 'order' => 10, 'parent_id' => null]
        );

        $settings = Menu::firstOrCreate(
            ['route' => 'admin.settings.index'],
            ['name' => 'Settings', 'icon' => 'Settings', 'group' => 'Management', 'order' => 11, 'parent_id' => null]
        );

        // ============================================
        // ANALYTICS & REPORTS (Direct to Sales Report)
        // ============================================
        $analyticsReports = Menu::firstOrCreate(
            ['route' => 'admin.analytics.sales'],
            ['name' => 'Analytics & Reports', 'icon' => 'BarChart3', 'group' => 'Analytics', 'order' => 12, 'parent_id' => null]
        );

        // ============================================
        // AUTO-ASSIGN TO SYSTEM ADMIN
        // ============================================
        $adminUsers = User::whereNull('branch_id')->get();

        // System Admin menus (no POS - they manage branches, not sell)
        $adminMenuIds = [
            $dashboard->id,
            $jobOrders->id,
            $salesRecord->id,
            $products->id,
            $stocks->id,
            $branchLocations->id,
            $branches->id,
            $mechanics->id,
            $users->id,
            $settings->id,
            $analyticsReports->id,
        ];

        foreach ($adminUsers as $user) {
            $user->menus()->syncWithoutDetaching($adminMenuIds);
        }

        // ============================================
        // AUTO-ASSIGN TO BRANCH USERS
        // ============================================
        $branchUsers = User::whereNotNull('branch_id')->get();

        // Branch users menus (includes POS, excludes admin-only features)
        $branchMenuIds = [
            $dashboard->id,
            $pos->id,
            $jobOrders->id,
            $salesRecord->id,
            $products->id,
            $stocks->id,
            $mechanics->id,
        ];

        foreach ($branchUsers as $user) {
            $user->menus()->syncWithoutDetaching($branchMenuIds);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove all menus created by this migration
        $routes = [
            'admin.dashboard',
            'admin.pos.index',
            'admin.job-orders.index',
            'admin.sales.index',
            'admin.products.index',
            'admin.stocks.index',
            'admin.branch-locations.index',
            'admin.branches.index',
            'admin.mechanics.index',
            'admin.users.index',
            'admin.settings.index',
            'admin.analytics.sales',
        ];

        foreach ($routes as $route) {
            $menu = Menu::where('route', $route)->first();
            if ($menu) {
                $menu->users()->detach();
                $menu->branches()->detach();
                $menu->delete();
            }
        }
    }
};

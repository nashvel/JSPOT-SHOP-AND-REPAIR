<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Define the standard routes that every branch should have
        $branchRoutes = [
            'admin.dashboard',
            'admin.pos.index',
            'admin.job-orders.index',
            'admin.sales.index',
            'admin.returns.index',
            'admin.products.index',
            'admin.stocks.index',
            'admin.mechanics.index',
            'admin.attendance.index', // Include the new Attendance module
        ];

        // Fetch Menu IDs
        $menuIds = \App\Models\Menu::whereIn('route', $branchRoutes)->pluck('id');

        // Attach to all Branches
        $branches = \App\Models\Branch::all();
        foreach ($branches as $branch) {
            $branch->menus()->syncWithoutDetaching($menuIds);
        }
    }

    public function down(): void
    {
        // Optional: Detach menus from branches
        // Keeping it simple since detaching might affect intentional manual assignments if any.
        // But for "down", we can just assume we want to reverse this exact action.

        $branchRoutes = [
            'admin.dashboard',
            'admin.pos.index',
            'admin.job-orders.index',
            'admin.sales.index',
            'admin.returns.index',
            'admin.products.index',
            'admin.stocks.index',
            'admin.mechanics.index',
            'admin.attendance.index',
        ];

        $menuIds = \App\Models\Menu::whereIn('route', $branchRoutes)->pluck('id');
        $branches = \App\Models\Branch::all();
        foreach ($branches as $branch) {
            $branch->menus()->detach($menuIds);
        }
    }
};

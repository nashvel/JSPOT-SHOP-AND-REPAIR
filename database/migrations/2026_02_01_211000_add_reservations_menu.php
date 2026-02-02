<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // Add Reservations menu to Operations group
        $maxOrder = DB::table('menus')->where('group', 'Operations')->max('order') ?? 0;

        DB::table('menus')->insert([
            'name' => 'Reservations',
            'route' => 'admin.reservations.index',
            'icon' => 'CalendarClock',
            'group' => 'Operations',
            'order' => $maxOrder + 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Get the new menu id
        $menuId = DB::table('menus')->where('route', 'admin.reservations.index')->value('id');

        // Assign to all users who have access to Job Orders or Sales
        $usersWithAccess = DB::table('menu_user')
            ->join('menus', 'menu_user.menu_id', '=', 'menus.id')
            ->whereIn('menus.route', ['admin.job-orders.index', 'admin.sales.index'])
            ->distinct()
            ->pluck('menu_user.user_id');

        foreach ($usersWithAccess as $userId) {
            DB::table('menu_user')->insertOrIgnore([
                'user_id' => $userId,
                'menu_id' => $menuId,
            ]);
        }
    }

    public function down(): void
    {
        $menu = DB::table('menus')->where('route', 'admin.reservations.index')->first();
        if ($menu) {
            DB::table('menu_user')->where('menu_id', $menu->id)->delete();
            DB::table('menus')->where('id', $menu->id)->delete();
        }
    }
};

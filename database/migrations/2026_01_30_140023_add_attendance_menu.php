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
        $attendance = \App\Models\Menu::firstOrCreate(
            ['route' => 'admin.attendance.index'],
            [
                'name' => 'Attendance',
                'icon' => 'Clock',
                'group' => 'Management',
                'order' => 10, // Adjust order as needed
            ]
        );

        // Assign to all users for now, or specific roles
        // Assuming Staff (role_id 2) and Admin (role_id 1) should see this if they manage people
        $users = \App\Models\User::all();
        foreach ($users as $user) {
            // attach if not already attached
            if (!$user->menus()->where('menu_id', $attendance->id)->exists()) {
                $user->menus()->attach($attendance->id);
            }
        }
    }

    public function down(): void
    {
        $menu = \App\Models\Menu::where('route', 'admin.attendance.index')->first();
        if ($menu) {
            $menu->users()->detach();
            $menu->delete();
        }
    }
};

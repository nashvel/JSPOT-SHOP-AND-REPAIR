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
        // Create Reservations Menu
        $reservations = Menu::firstOrCreate(
            ['route' => 'admin.reservations.index'],
            ['name' => 'Reservations', 'icon' => 'CalendarClock', 'group' => 'Operations', 'order' => 2, 'parent_id' => null]
        );

        // Assign to Admin Users
        $adminUsers = User::whereNull('branch_id')
            ->whereHas('role', function ($q) {
                $q->where('name', '!=', 'super_admin');
            })
            ->get();

        foreach ($adminUsers as $user) {
            $user->menus()->syncWithoutDetaching([$reservations->id]);
        }

        // Assign to Branch Users
        $branchUsers = User::whereNotNull('branch_id')->get();

        foreach ($branchUsers as $user) {
            $user->menus()->syncWithoutDetaching([$reservations->id]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $menu = Menu::where('route', 'admin.reservations.index')->first();
        if ($menu) {
            $menu->users()->detach();
            $menu->delete();
        }
    }
};

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
        \Illuminate\Support\Facades\DB::table('menus')
            ->where('route', 'admin.products.index')
            ->update(['name' => 'Products & Services', 'group' => 'Inventory']);

        \Illuminate\Support\Facades\DB::table('menus')
            ->where('route', 'admin.stocks.index')
            ->update(['name' => 'Inventory Management', 'group' => 'Inventory']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};

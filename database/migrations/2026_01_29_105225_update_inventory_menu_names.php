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
        \Illuminate\Support\Facades\DB::table('menus')->where('name', 'Inventory')->update(['name' => 'Products & Services']);
        \Illuminate\Support\Facades\DB::table('menus')->where('name', 'Stock Adjustment')->update(['name' => 'Inventory Management']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        \Illuminate\Support\Facades\DB::table('menus')->where('name', 'Products & Services')->update(['name' => 'Inventory']);
        \Illuminate\Support\Facades\DB::table('menus')->where('name', 'Inventory Management')->update(['name' => 'Stock Adjustment']);
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('sale_items', function (Blueprint $table) {
            if (!Schema::hasColumn('sale_items', 'product_type')) {
                $table->string('product_type')->default('product')->after('product_name');
            }
            if (!Schema::hasColumn('sale_items', 'category_name')) {
                $table->string('category_name')->nullable()->after('product_type');
            }
        });
    }

    public function down(): void
    {
        Schema::table('sale_items', function (Blueprint $table) {
            if (Schema::hasColumn('sale_items', 'product_type')) {
                $table->dropColumn('product_type');
            }
            if (Schema::hasColumn('sale_items', 'category_name')) {
                $table->dropColumn('category_name');
            }
        });
    }
};

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
        Schema::table('sale_items', function (Blueprint $table) {
            $table->string('payment_method')->nullable()->after('total');
        });

        // Backfill existing items with their parent sale's payment method
        $sales = \App\Models\Sale::with('items')->get();
        foreach ($sales as $sale) {
            foreach ($sale->items as $item) {
                $item->payment_method = $sale->payment_method;
                $item->save();
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sale_items', function (Blueprint $table) {
            $table->dropColumn('payment_method');
        });
    }
};

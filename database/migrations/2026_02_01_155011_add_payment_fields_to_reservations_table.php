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
        Schema::table('reservations', function (Blueprint $table) {
            $table->string('payment_method')->nullable()->after('status');
            $table->decimal('amount_paid', 10, 2)->default(0)->after('payment_method');
            $table->decimal('change', 10, 2)->default(0)->after('amount_paid');
            $table->string('reference_number')->nullable()->after('change');
        });

        Schema::table('reservation_items', function (Blueprint $table) {
            $table->string('payment_method')->nullable()->after('total');
            $table->string('reference_number')->nullable()->after('payment_method');
            $table->json('transactions')->nullable()->after('reference_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn(['payment_method', 'amount_paid', 'change', 'reference_number']);
        });

        Schema::table('reservation_items', function (Blueprint $table) {
            $table->dropColumn(['payment_method', 'reference_number', 'transactions']);
        });
    }
};

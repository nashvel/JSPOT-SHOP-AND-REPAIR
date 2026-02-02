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
            if (!Schema::hasColumn('reservations', 'payment_method')) {
                $table->string('payment_method')->nullable()->after('status');
            }
            if (!Schema::hasColumn('reservations', 'amount_paid')) {
                $table->decimal('amount_paid', 10, 2)->default(0)->after('payment_method');
            }
            if (!Schema::hasColumn('reservations', 'change')) {
                $table->decimal('change', 10, 2)->default(0)->after('amount_paid');
            }
            if (!Schema::hasColumn('reservations', 'reference_number')) {
                $table->string('reference_number')->nullable()->after('change');
            }
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
    }
};

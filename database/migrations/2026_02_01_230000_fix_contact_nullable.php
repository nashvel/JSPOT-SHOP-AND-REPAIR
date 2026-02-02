<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            // Ensure customer_contact is nullable
            $table->string('customer_contact')->nullable()->change();

            // Also ensure other fields are nullable just in case
            $table->string('vehicle_engine')->nullable()->change();
            $table->string('vehicle_chassis')->nullable()->change();
            $table->string('vehicle_plate')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            // Revert is risky if we have nulls, but for strictness:
            // $table->string('customer_contact')->nullable(false)->change();
        });
    }
};

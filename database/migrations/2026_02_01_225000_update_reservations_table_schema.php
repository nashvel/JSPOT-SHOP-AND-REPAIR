<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            if (!Schema::hasColumn('reservations', 'reservation_number')) {
                $table->string('reservation_number')->unique()->after('branch_id');
            }
            if (!Schema::hasColumn('reservations', 'vehicle_engine')) {
                $table->string('vehicle_engine')->nullable()->after('customer_contact');
            }
            if (!Schema::hasColumn('reservations', 'vehicle_chassis')) {
                $table->string('vehicle_chassis')->nullable()->after('vehicle_engine');
            }
            if (!Schema::hasColumn('reservations', 'vehicle_plate')) {
                $table->string('vehicle_plate')->nullable()->after('vehicle_chassis');
            }
            if (!Schema::hasColumn('reservations', 'reservation_date')) {
                $table->date('reservation_date')->after('vehicle_plate');
            }
            if (!Schema::hasColumn('reservations', 'issue_description')) {
                $table->text('issue_description')->nullable()->after('reservation_date');
            }
            if (!Schema::hasColumn('reservations', 'notes')) {
                $table->text('notes')->nullable()->after('issue_description');
            }
            if (!Schema::hasColumn('reservations', 'sale_id')) {
                $table->foreignId('sale_id')->nullable()->constrained('sales')->nullOnDelete()->after('status');
            }
            // Drop legacy 'items' column if exists
            if (Schema::hasColumn('reservations', 'items')) {
                $table->dropColumn('items');
            }
        });
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn([
                'reservation_number',
                'vehicle_engine',
                'vehicle_chassis',
                'vehicle_plate',
                'reservation_date',
                'issue_description',
                'notes',
                'sale_id'
            ]);
            // Restore items column? No need for exact rollback of legacy mess.
        });
    }
};

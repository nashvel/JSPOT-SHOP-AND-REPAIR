<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::disableForeignKeyConstraints();

        // Reservations table
        if (!Schema::hasTable('reservations')) {
            Schema::create('reservations', function (Blueprint $table) {
                $table->id();
                $table->foreignId('branch_id')->constrained('branches')->onDelete('cascade');
                $table->string('reservation_number')->unique();
                $table->string('customer_name');
                $table->string('customer_contact')->nullable();
                $table->string('vehicle_engine')->nullable();
                $table->string('vehicle_chassis')->nullable();
                $table->string('vehicle_plate')->nullable();
                $table->date('reservation_date');
                $table->text('issue_description')->nullable();
                $table->text('notes')->nullable();
                $table->enum('status', ['pending', 'in_progress', 'completed', 'cancelled'])->default('pending');
                $table->foreignId('sale_id')->nullable()->constrained('sales')->nullOnDelete();
                $table->timestamps();
            });
        }

        // Reservation items
        if (!Schema::hasTable('reservation_items')) {
            Schema::create('reservation_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('reservation_id')->constrained('reservations')->onDelete('cascade');
                $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();
                $table->string('product_name');
                $table->string('product_type')->default('product');
                $table->string('category_name')->nullable();
                $table->integer('quantity')->default(1);
                $table->decimal('unit_price', 10, 2)->default(0);
                $table->decimal('total', 10, 2)->default(0);
                $table->timestamps();
            });
        }

        // Reservation-Mechanic pivot (many-to-many)
        if (!Schema::hasTable('mechanic_reservation')) {
            Schema::create('mechanic_reservation', function (Blueprint $table) {
                $table->foreignId('reservation_id')->constrained('reservations')->onDelete('cascade');
                $table->foreignId('mechanic_id')->constrained('mechanics')->onDelete('cascade');
                $table->primary(['reservation_id', 'mechanic_id']);
            });
        }

        // Sale-Mechanic pivot (many-to-many) - for multi-mechanic sales
        if (!Schema::hasTable('mechanic_sale')) {
            Schema::create('mechanic_sale', function (Blueprint $table) {
                $table->foreignId('sale_id')->constrained('sales')->onDelete('cascade');
                $table->foreignId('mechanic_id')->constrained('mechanics')->onDelete('cascade');
                $table->primary(['sale_id', 'mechanic_id']);
            });
        }

        Schema::enableForeignKeyConstraints();
    }

    public function down(): void
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('mechanic_sale');
        Schema::dropIfExists('mechanic_reservation');
        Schema::dropIfExists('reservation_items');
        Schema::dropIfExists('reservations');
        Schema::enableForeignKeyConstraints();
    }
};

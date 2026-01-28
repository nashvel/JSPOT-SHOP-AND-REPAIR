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
        // Sales table
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->string('sale_number')->unique();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // Employee

            // Customer Info
            $table->string('customer_name');
            $table->string('contact_number');

            // Vehicle Info
            $table->string('engine_number');
            $table->string('chassis_number');
            $table->string('plate_number');

            // Totals
            $table->decimal('subtotal', 12, 2);
            $table->decimal('total', 12, 2);

            // Payment
            $table->enum('payment_method', ['cash', 'gcash', 'maya']);
            $table->decimal('amount_paid', 12, 2);
            $table->decimal('change', 12, 2)->default(0);
            $table->string('reference_number')->nullable(); // For GCash/Maya

            // QR Token for public receipt
            $table->string('qr_token', 64)->unique();

            // Status
            $table->enum('status', ['completed', 'returned', 'partial_return'])->default('completed');

            $table->timestamps();
        });

        // Sale Items table
        Schema::create('sale_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sale_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();

            // Snapshot at time of sale
            $table->string('product_name');
            $table->integer('quantity');
            $table->decimal('unit_price', 10, 2);
            $table->decimal('total', 12, 2);

            $table->timestamps();
        });

        // Sales Returns table
        Schema::create('sales_returns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sale_id')->constrained()->cascadeOnDelete();
            $table->foreignId('sale_item_id')->constrained()->cascadeOnDelete();
            $table->integer('quantity');
            $table->text('reason');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales_returns');
        Schema::dropIfExists('sale_items');
        Schema::dropIfExists('sales');
    }
};

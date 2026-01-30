<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Create mechanics table
        Schema::create('mechanics', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('specialization')->nullable();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Enhance job_orders table
        Schema::table('job_orders', function (Blueprint $table) {
            $table->foreignId('sale_id')->nullable()->constrained()->nullOnDelete()->after('branch_id');
            $table->foreignId('mechanic_id')->nullable()->constrained()->nullOnDelete()->after('branch_id');
            $table->string('contact_number')->nullable()->after('customer_name');
            $table->string('engine_number')->nullable()->after('vehicle_details');
            $table->string('chassis_number')->nullable()->after('engine_number');
            $table->string('plate_number')->nullable()->after('chassis_number');
            $table->decimal('labor_cost', 10, 2)->default(0)->after('description');
            $table->decimal('parts_cost', 10, 2)->default(0)->after('labor_cost');
            $table->decimal('total_cost', 10, 2)->default(0)->after('parts_cost');
            $table->text('notes')->nullable()->after('total_cost');
            $table->timestamp('started_at')->nullable()->after('status');
            $table->timestamp('completed_at')->nullable()->after('started_at');
        });

        // Create job_order_parts table for parts tracking
        Schema::create('job_order_parts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('part_name');
            $table->integer('quantity')->default(1);
            $table->decimal('unit_price', 10, 2);
            $table->decimal('total_price', 10, 2);
            $table->enum('source', ['purchased', 'manual'])->default('purchased');
            $table->timestamps();
        });

        // Add mechanic_id to sales table
        Schema::table('sales', function (Blueprint $table) {
            $table->foreignId('mechanic_id')->nullable()->constrained()->nullOnDelete()->after('user_id');
        });
    }

    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->dropForeign(['mechanic_id']);
            $table->dropColumn('mechanic_id');
        });

        Schema::dropIfExists('job_order_parts');

        Schema::table('job_orders', function (Blueprint $table) {
            $table->dropForeign(['sale_id']);
            $table->dropForeign(['mechanic_id']);
            $table->dropColumn([
                'sale_id',
                'mechanic_id',
                'contact_number',
                'engine_number',
                'chassis_number',
                'plate_number',
                'labor_cost',
                'parts_cost',
                'total_cost',
                'notes',
                'started_at',
                'completed_at',
            ]);
        });

        Schema::dropIfExists('mechanics');
    }
};

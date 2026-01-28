<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('sku')->nullable()->unique();
            $table->string('barcode')->nullable()->unique();
            $table->text('description')->nullable();
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->decimal('price', 12, 2);
            $table->decimal('cost', 12, 2)->nullable();
            $table->integer('stock_quantity')->default(0);
            $table->integer('min_stock_level')->default(0);
            $table->string('unit')->default('pcs');
            $table->json('images')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('track_inventory')->default(true);
            $table->json('custom_fields')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};

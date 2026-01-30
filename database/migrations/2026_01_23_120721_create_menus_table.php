<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('menus', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('route')->nullable(); // Allow null for parent menus
            $table->string('icon'); // Lucide icon name
            $table->string('group')->nullable()->default('Essentials'); // Sidebar group
            $table->integer('order')->default(0);
            $table->foreignId('parent_id')->nullable()->constrained('menus')->cascadeOnDelete(); // For sub-menus
            $table->timestamps();
        });

        Schema::create('menu_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('menu_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menu_user');
        Schema::dropIfExists('menus');
    }
};

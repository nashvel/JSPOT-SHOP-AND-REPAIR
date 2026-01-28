<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('display_name');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Seed default roles
        DB::table('roles')->insert([
            ['name' => 'admin', 'display_name' => 'Admin', 'description' => 'Full system access', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'sub_admin', 'display_name' => 'Sub Admin', 'description' => 'Limited admin access', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'cashier', 'display_name' => 'Cashier', 'description' => 'POS and sales access', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Add role_id to users table (nullable for existing users)
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('role_id')->nullable()->after('role')->constrained()->nullOnDelete();
        });

        // Migrate existing role strings to role_id
        $adminRole = DB::table('roles')->where('name', 'admin')->first();
        if ($adminRole) {
            DB::table('users')->where('role', 'admin')->update(['role_id' => $adminRole->id]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['role_id']);
            $table->dropColumn('role_id');
        });

        Schema::dropIfExists('roles');
    }
};

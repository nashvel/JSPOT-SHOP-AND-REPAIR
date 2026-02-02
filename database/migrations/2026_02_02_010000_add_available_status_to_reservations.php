<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // Modify ENUM to add 'available' status
        DB::statement("ALTER TABLE reservations MODIFY COLUMN status ENUM('pending', 'available', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending'");
    }

    public function down(): void
    {
        // Remove 'available' from ENUM
        DB::statement("ALTER TABLE reservations MODIFY COLUMN status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending'");
    }
};

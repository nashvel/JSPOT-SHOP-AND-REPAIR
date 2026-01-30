<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mechanics', function (Blueprint $table) {
            // Check if hourly_rate exists and drop it
            if (Schema::hasColumn('mechanics', 'hourly_rate')) {
                $table->dropColumn('hourly_rate');
            }
            
            // Check if total_labor_earned doesn't exist, then add it
            if (!Schema::hasColumn('mechanics', 'total_labor_earned')) {
                $table->decimal('total_labor_earned', 10, 2)->default(0)->after('specialization');
            }
        });
    }

    public function down(): void
    {
        Schema::table('mechanics', function (Blueprint $table) {
            if (Schema::hasColumn('mechanics', 'total_labor_earned')) {
                $table->dropColumn('total_labor_earned');
            }
            if (!Schema::hasColumn('mechanics', 'hourly_rate')) {
                $table->decimal('hourly_rate', 10, 2)->nullable()->after('specialization');
            }
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mechanics', function (Blueprint $table) {
            $table->string('email')->nullable()->after('name');
            $table->string('phone')->nullable()->after('email');
            $table->text('address')->nullable()->after('phone');
            $table->date('date_of_birth')->nullable()->after('address');
            $table->date('hire_date')->nullable()->after('date_of_birth');
            $table->string('emergency_contact_name')->nullable()->after('hire_date');
            $table->string('emergency_contact_phone')->nullable()->after('emergency_contact_name');
            $table->decimal('hourly_rate', 10, 2)->nullable()->after('specialization');
            $table->string('photo')->nullable()->after('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('mechanics', function (Blueprint $table) {
            $table->dropColumn([
                'email',
                'phone',
                'address',
                'date_of_birth',
                'hire_date',
                'emergency_contact_name',
                'emergency_contact_phone',
                'hourly_rate',
                'photo',
            ]);
        });
    }
};

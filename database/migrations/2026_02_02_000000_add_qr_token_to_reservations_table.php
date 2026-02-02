<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->string('qr_token', 64)->nullable()->unique()->after('status');
        });

        // Generate tokens for existing reservations
        $reservations = DB::table('reservations')->whereNull('qr_token')->get();
        foreach ($reservations as $reservation) {
            DB::table('reservations')
                ->where('id', $reservation->id)
                ->update(['qr_token' => Str::random(32)]);
        }
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn('qr_token');
        });
    }
};

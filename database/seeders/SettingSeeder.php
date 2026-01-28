<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        Setting::updateOrCreate(['key' => 'revenue_goal_daily'], [
            'value' => '5000',
            'type' => 'integer',
            'group' => 'dashboard'
        ]);

        Setting::updateOrCreate(['key' => 'revenue_goal_monthly'], [
            'value' => '150000',
            'type' => 'integer',
            'group' => 'dashboard'
        ]);

        Setting::updateOrCreate(['key' => 'revenue_goal_yearly'], [
            'value' => '2000000',
            'type' => 'integer',
            'group' => 'dashboard'
        ]);
    }
}

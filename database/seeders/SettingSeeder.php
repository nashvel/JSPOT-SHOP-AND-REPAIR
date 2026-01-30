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

        Setting::updateOrCreate(['key' => 'company_email'], [
            'value' => 'info@jspotmotors.com',
            'type' => 'string',
            'group' => 'contact'
        ]);

        // Theme Colors
        Setting::updateOrCreate(['key' => 'theme_primary_color'], [
            'value' => 'purple',
            'type' => 'string',
            'group' => 'theme'
        ]);

        Setting::updateOrCreate(['key' => 'theme_secondary_color'], [
            'value' => 'gray',
            'type' => 'string',
            'group' => 'theme'
        ]);

        Setting::updateOrCreate(['key' => 'theme_accent_color'], [
            'value' => 'red',
            'type' => 'string',
            'group' => 'theme'
        ]);

        // Site Tagline
        Setting::updateOrCreate(['key' => 'site_tagline'], [
            'value' => 'Your Trusted Auto Parts Dealer',
            'type' => 'string',
            'group' => 'branding'
        ]);
    }
}

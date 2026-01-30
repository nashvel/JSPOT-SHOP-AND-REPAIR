<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\JobOrder;
use Illuminate\Database\Seeder;

class JobOrderSeeder extends Seeder
{
    public function run(): void
    {
        $branches = Branch::all();

        if ($branches->isEmpty()) {
            return;
        }

        // Sample Data
        $datasets = [
            [
                'customer_name' => 'John Doe',
                'vehicle_details' => 'Toyota Vios 2020 (ABC 1234)',
                'description' => 'Change Oil and Brake Check',
                'status' => 'completed',
            ],
            [
                'customer_name' => 'Jane Smith',
                'vehicle_details' => 'Honda Click 150i',
                'description' => 'CVT Cleaning and FI Cleaning',
                'status' => 'in_progress',
            ],
            [
                'customer_name' => 'Robert Johnson',
                'vehicle_details' => 'Mitsubishi Mirage G4',
                'description' => 'Aircon Not Cooling',
                'status' => 'pending',
            ],
            [
                'customer_name' => 'Maria Garcia',
                'vehicle_details' => 'Yamaha NMAX v2',
                'description' => 'Change Belt and Rollers',
                'status' => 'completed',
            ],
            [
                'customer_name' => 'Alex Lee',
                'vehicle_details' => 'Suzuki Raider 150',
                'description' => 'Engine Noise Inspection',
                'status' => 'pending',
            ],
        ];

        foreach ($datasets as $data) {
            JobOrder::create([
                'tracking_code' => 'JO-' . strtoupper(uniqid()),
                'branch_id' => $branches->random()->id,
                'customer_name' => $data['customer_name'],
                'vehicle_details' => $data['vehicle_details'],
                'description' => $data['description'],
                'status' => $data['status'],
            ]);
        }
    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Branch;
use App\Models\ProductSection;
use App\Models\Category;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // Create categories first
        $oilCategory = Category::firstOrCreate(
            ['name' => 'Oils & Lubricants'],
            ['name' => 'Oils & Lubricants', 'type' => 'product']
        );
        $partsCategory = Category::firstOrCreate(
            ['name' => 'Parts & Accessories'],
            ['name' => 'Parts & Accessories', 'type' => 'product']
        );
        $serviceCategory = Category::firstOrCreate(
            ['name' => 'Services'],
            ['name' => 'Services', 'type' => 'service']
        );

        // Products (physical items with stock)
        $products = [
            // Engine Parts (10 products)
            ['name' => 'Premium Engine Oil 10W-40', 'description' => 'Synthetic 4T Oil', 'price' => 250.00, 'sku' => 'OIL-001', 'type' => 'product'],
            ['name' => ' Racing Engine Oil 20W-50', 'description' => 'High performance racing oil', 'price' => 350.00, 'sku' => 'OIL-002', 'type' => 'product'],
            ['name' => 'Piston Ring Set', 'description' => 'Standard size piston rings', 'price' => 850.00, 'sku' => 'PST-001', 'type' => 'product'],
            ['name' => 'Cylinder Head Gasket', 'description' => 'OEM quality gasket', 'price' => 450.00, 'sku' => 'GSK-001', 'type' => 'product'],
            ['name' => 'Camshaft Assembly', 'description' => 'Performance camshaft', 'price' => 3500.00, 'sku' => 'CAM-001', 'type' => 'product'],
            ['name' => 'Crankshaft Bearing', 'description' => 'Heavy duty bearing', 'price' => 1200.00, 'sku' => 'BRG-001', 'type' => 'product'],
            ['name' => 'Valve Spring Set', 'description' => 'High tensile springs', 'price' => 650.00, 'sku' => 'VLV-001', 'type' => 'product'],
            ['name' => 'Oil Filter Premium', 'description' => 'High flow oil filter', 'price' => 180.00, 'sku' => 'FLT-001', 'type' => 'product'],
            ['name' => 'Air Filter Racing', 'description' => 'High performance air filter', 'price' => 390.00, 'sku' => 'FLT-002', 'type' => 'product'],
            ['name' => 'Spark Plug Iridium', 'description' => 'Long-life iridium plug', 'price' => 120.00, 'sku' => 'SPK-001', 'type' => 'product'],

            // Brake Systems (8 products)
            ['name' => 'Ceramic Brake Pads Front', 'description' => 'Low dust ceramic pads', 'price' => 450.00, 'sku' => 'BRK-001', 'type' => 'product'],
            ['name' => 'Ceramic Brake Pads Rear', 'description' => 'Low dust ceramic pads', 'price' => 420.00, 'sku' => 'BRK-002', 'type' => 'product'],
            ['name' => 'Brake Disc Rotors Front', 'description' => 'Ventilated rotors', 'price' => 1800.00, 'sku' => 'BRK-003', 'type' => 'product'],
            ['name' => 'Brake Fluid DOT 4', 'description' => 'High performance brake fluid', 'price' => 280.00, 'sku' => 'FLD-001', 'type' => 'product'],
            ['name' => 'Brake Caliper Assembly', 'description' => 'Complete caliper unit', 'price' => 2500.00, 'sku' => 'BRK-004', 'type' => 'product'],
            ['name' => 'Brake Lines Stainless Steel', 'description' => 'Braided brake lines', 'price' => 950.00, 'sku' => 'BRK-005', 'type' => 'product'],
            ['name' => 'Master Cylinder', 'description' => 'Brake master cylinder', 'price' => 1500.00, 'sku' => 'BRK-006', 'type' => 'product'],
            ['name' => 'Parking Brake Cable', 'description' => 'Heavy duty cable', 'price' => 380.00, 'sku' => 'BRK-007', 'type' => 'product'],

            // Oils & Lubricants (10 products)
            ['name' => 'Chain Lube Pro', 'description' => 'Professional grade chain lube', 'price' => 150.00, 'sku' => 'LUB-001', 'type' => 'product'],
            ['name' => 'Transmission Fluid ATF', 'description' => 'Automatic transmission fluid', 'price' => 320.00, 'sku' => 'FLD-002', 'type' => 'product'],
            ['name' => 'Engine Coolant 50/50', 'description' => 'Pre-mixed coolant', 'price' => 240.00, 'sku' => 'FLD-003', 'type' => 'product'],
            ['name' => 'Gear Oil 80W-90', 'description' => 'Differential gear oil', 'price' => 290.00, 'sku' => 'OIL-003', 'type' => 'product'],
            ['name' => 'Multi-Purpose Grease', 'description' => 'Lithium grease', 'price' => 180.00, 'sku' => 'GRS-001', 'type' => 'product'],
            ['name' => 'Power Steering Fluid', 'description' => 'Hydraulic fluid', 'price' => 220.00, 'sku' => 'FLD-004', 'type' => 'product'],
            ['name' => 'Fuel System Cleaner', 'description' => 'Injector cleaner', 'price' => 350.00, 'sku' => 'CLN-001', 'type' => 'product'],
            ['name' => 'Engine Degreaser', 'description' => 'Heavy duty degreaser', 'price' => 180.00, 'sku' => 'CLN-002', 'type' => 'product'],
            ['name' => 'Penetrating Oil', 'description' => 'Rust remover and lubricant', 'price' => 140.00, 'sku' => 'LUB-002', 'type' => 'product'],
            ['name' => 'Assembly Lube', 'description' => 'Engine assembly lubricant', 'price' => 280.00, 'sku' => 'LUB-003', 'type' => 'product'],

            // Accessories (15 products)
            ['name' => 'Full Face Helmet Premium', 'description' => 'DOT certified helmet', 'price' => 2500.00, 'sku' => 'HLM-001', 'type' => 'product'],
            ['name' => 'Half Face Helmet', 'description' => 'Lightweight helmet', 'price' => 1200.00, 'sku' => 'HLM-002', 'type' => 'product'],
            ['name' => 'Floor Mats Rubber', 'description' => 'All-weather floor mats', 'price' => 850.00, 'sku' => 'MAT-001', 'type' => 'product'],
            ['name' => 'Seat Covers Leather', 'description' => 'Premium leather covers', 'price' => 3500.00, 'sku' => 'CVR-001', 'type' => 'product'],
            ['name' => 'Steering Wheel Cover', 'description' => 'Ergonomic grip cover', 'price' => 450.00, 'sku' => 'CVR-002', 'type' => 'product'],
            ['name' => 'Air Freshener Set', 'description' => 'Multiple scents pack', 'price' => 180.00, 'sku' => 'ACC-001', 'type' => 'product'],
            ['name' => 'Phone Holder Magnetic', 'description' => 'Strong magnetic mount', 'price' => 380.00, 'sku' => 'ACC-002', 'type' => 'product'],
            ['name' => 'Dash Cam Full HD', 'description' => '1080p dash camera', 'price' => 4500.00, 'sku' => 'CAM-002', 'type' => 'product'],
            ['name' => 'Tool Kit Premium', 'description' => '50-piece tool set', 'price' => 2800.00, 'sku' => 'TLS-001', 'type' => 'product'],
            ['name' => 'Jump Starter Power Bank', 'description' => 'Portable jump starter', 'price' => 3200.00, 'sku' => 'PWR-001', 'type' => 'product'],
            ['name' => 'Tire Pressure Gauge Digital', 'description' => 'LCD display gauge', 'price' => 420.00, 'sku' => 'GAU-001', 'type' => 'product'],
            ['name' => 'LED Underglow Lights', 'description' => 'RGB LED strips', 'price' => 1800.00, 'sku' => 'LIT-001', 'type' => 'product'],
            ['name' => 'Car Cover Waterproof', 'description' => 'UV protective cover', 'price' => 1500.00, 'sku' => 'CVR-003', 'type' => 'product'],
            ['name' => 'Sunshade Windshield', 'description' => 'Foldable sun shade', 'price' => 320.00, 'sku' => 'SHD-001', 'type' => 'product'],
            ['name' => 'Bluetooth OBD2 Scanner', 'description' => 'Diagnostic scanner', 'price' => 1200.00, 'sku' => 'DGN-001', 'type' => 'product'],

            // More Engine & Performance (7 products)
            ['name' => 'Performance Exhaust System', 'description' => 'Stainless steel exhaust', 'price' => 12000.00, 'sku' => 'EXH-001', 'type' => 'product'],
            ['name' => 'Cold Air Intake Kit', 'description' => 'Increases horsepower', 'price' => 5500.00, 'sku' => 'INT-001', 'type' => 'product'],
            ['name' => 'Turbocharger Kit', 'description' => 'Bolt-on turbo kit', 'price' => 25000.00, 'sku' => 'TUR-001', 'type' => 'product'],
            ['name' => 'ECU Tuning Chip', 'description' => 'Performance chip', 'price' => 8500.00, 'sku' => 'ECU-001', 'type' => 'product'],
            ['name' => 'Racing Suspension Kit', 'description' => 'Adjustable coilovers', 'price' => 15000.00, 'sku' => 'SUS-001', 'type' => 'product'],
            ['name' => 'Performance Clutch Kit', 'description' => 'Heavy duty clutch', 'price' => 6500.00, 'sku' => 'CLT-001', 'type' => 'product'],
            ['name' => 'Racing Seats Carbon Fiber', 'description' => 'Lightweight bucket seats', 'price' => 18000.00, 'sku' => 'ST-001', 'type' => 'product'],

            // Electrical & Lighting (5 products)
            ['name' => 'LED Headlights', 'description' => 'Super bright LED', 'price' => 3500.00, 'sku' => 'LIT-002', 'type' => 'product'],
            ['name' => 'Battery AGM 12V', 'description' => 'Maintenance-free battery', 'price' => 4500.00, 'sku' => 'BAT-001', 'type' => 'product'],
            ['name' => 'Alternator High Output', 'description' => '150A alternator', 'price' => 5500.00, 'sku' => 'ALT-001', 'type' => 'product'],
            ['name' => 'Starter Motor', 'description' => 'High torque starter', 'price' => 2800.00, 'sku' => 'STR-001', 'type' => 'product'],
            ['name' => 'Fog Lights LED', 'description' => 'Waterproof fog lamps', 'price' => 1800.00, 'sku' => 'LIT-003', 'type' => 'product'],

            // Tires & Wheels (10 products)
            ['name' => 'All-Season Tire 195/65R15', 'description' => 'Standard touring tire', 'price' => 3500.00, 'sku' => 'TIR-001', 'type' => 'product'],
            ['name' => 'Performance Tire 245/40R19', 'description' => 'High grip compound', 'price' => 9500.00, 'sku' => 'TIR-002', 'type' => 'product'],
            ['name' => 'Off-Road Tire 265/70R17', 'description' => 'Mud terrain tread', 'price' => 12000.00, 'sku' => 'TIR-003', 'type' => 'product'],
            ['name' => 'Alloy Wheel 17-inch', 'description' => 'Matte black finish', 'price' => 8500.00, 'sku' => 'WHL-001', 'type' => 'product'],
            ['name' => 'Forged Wheel 19-inch', 'description' => 'Lightweight racing wheel', 'price' => 25000.00, 'sku' => 'WHL-002', 'type' => 'product'],
            ['name' => 'Tire Sealant Kit', 'description' => 'Emergency puncture repair', 'price' => 450.00, 'sku' => 'TIR-004', 'type' => 'product'],
            ['name' => 'Wheel Lug Nuts Black', 'description' => 'Set of 20 locking nuts', 'price' => 1200.00, 'sku' => 'WHL-003', 'type' => 'product'],
            ['name' => 'Wheel Spacer 15mm', 'description' => 'Hub centric spacers', 'price' => 2500.00, 'sku' => 'WHL-004', 'type' => 'product'],
            ['name' => 'Tire Inflator 12V', 'description' => 'Portable digital compressor', 'price' => 1800.00, 'sku' => 'TIR-005', 'type' => 'product'],
            ['name' => 'Valve Stem Caps', 'description' => 'Aluminum red caps', 'price' => 150.00, 'sku' => 'WHL-005', 'type' => 'product'],

            // Interior Accessories (10 products)
            ['name' => 'Leather Steering Wrap', 'description' => 'Stitched steering cover', 'price' => 850.00, 'sku' => 'IAC-001', 'type' => 'product'],
            ['name' => 'RGB Footwell Lights', 'description' => 'App controlled lighting', 'price' => 1200.00, 'sku' => 'IAC-002', 'type' => 'product'],
            ['name' => 'Trunk Organizer', 'description' => 'Collapsible storage bin', 'price' => 950.00, 'sku' => 'IAC-003', 'type' => 'product'],
            ['name' => 'Memory Foam Neck Pillow', 'description' => 'Ergonomic neck support', 'price' => 450.00, 'sku' => 'IAC-004', 'type' => 'product'],
            ['name' => 'Sun Shift Knob', 'description' => 'Universal fit knob', 'price' => 1500.00, 'sku' => 'IAC-005', 'type' => 'product'],
            ['name' => 'Pet Seat Cover', 'description' => 'Waterproof rear seat cover', 'price' => 1100.00, 'sku' => 'IAC-006', 'type' => 'product'],
            ['name' => 'Car Vacuum Cleaner', 'description' => 'High power portable vacuum', 'price' => 2200.00, 'sku' => 'IAC-007', 'type' => 'product'],
            ['name' => 'Dashboard Mat', 'description' => 'Non-slip dash cover', 'price' => 350.00, 'sku' => 'IAC-008', 'type' => 'product'],
            ['name' => 'Seat Belt Pads', 'description' => 'Soft cushioned pads', 'price' => 250.00, 'sku' => 'IAC-009', 'type' => 'product'],
            ['name' => 'Rear View Mirror Wide', 'description' => 'Panoramic clip-on mirror', 'price' => 550.00, 'sku' => 'IAC-010', 'type' => 'product'],

            // Car Care & Detailing (10 products)
            ['name' => 'Carnauba Wax Liquid', 'description' => 'High gloss finish wax', 'price' => 850.00, 'sku' => 'CAR-001', 'type' => 'product'],
            ['name' => 'Microfiber Towel Set', 'description' => 'Pack of 5 plush towels', 'price' => 350.00, 'sku' => 'CAR-002', 'type' => 'product'],
            ['name' => 'Clay Bar Kit', 'description' => 'Decontamination clay', 'price' => 900.00, 'sku' => 'CAR-003', 'type' => 'product'],
            ['name' => 'Ceramic Coating Spray', 'description' => 'Hydrophobic coating', 'price' => 1500.00, 'sku' => 'CAR-004', 'type' => 'product'],
            ['name' => 'Leather Conditioner', 'description' => 'Restores leather seats', 'price' => 650.00, 'sku' => 'CAR-005', 'type' => 'product'],
            ['name' => 'Wheel Cleaner', 'description' => 'Iron fallout remover', 'price' => 550.00, 'sku' => 'CAR-006', 'type' => 'product'],
            ['name' => 'Glass Cleaner', 'description' => 'Streak-free formula', 'price' => 280.00, 'sku' => 'CAR-007', 'type' => 'product'],
            ['name' => 'Foam Cannon', 'description' => 'Snow foam lance', 'price' => 1800.00, 'sku' => 'CAR-008', 'type' => 'product'],
            ['name' => 'Car Wash Shampoo', 'description' => 'pH neutral soap', 'price' => 450.00, 'sku' => 'CAR-009', 'type' => 'product'],
            ['name' => 'Tire Shine Spray', 'description' => 'Wet look tire dressing', 'price' => 320.00, 'sku' => 'CAR-010', 'type' => 'product'],

            // Tools & Equipment (10 products)
            ['name' => 'Hydraulic Floor Jack', 'description' => '3-ton low profile jack', 'price' => 8500.00, 'sku' => 'TOL-001', 'type' => 'product'],
            ['name' => 'Jack Stands Pair', 'description' => '3-ton locking stands', 'price' => 2500.00, 'sku' => 'TOL-002', 'type' => 'product'],
            ['name' => 'Torque Wrench 1/2', 'description' => 'Click type torque wrench', 'price' => 3200.00, 'sku' => 'TOL-003', 'type' => 'product'],
            ['name' => 'Impact Wrench Cordless', 'description' => '18V high torque impact', 'price' => 12000.00, 'sku' => 'TOL-004', 'type' => 'product'],
            ['name' => 'Socket Set 100pcs', 'description' => 'Metric and SAE sockets', 'price' => 6500.00, 'sku' => 'TOL-005', 'type' => 'product'],
            ['name' => 'OBD2 Scanner Pro', 'description' => 'Advanced diagnostics', 'price' => 4500.00, 'sku' => 'TOL-006', 'type' => 'product'],
            ['name' => 'Mechanic Creep', 'description' => 'Padded rolling creeper', 'price' => 3800.00, 'sku' => 'TOL-007', 'type' => 'product'],
            ['name' => 'Oil Drain Pan', 'description' => '15L capacity pan', 'price' => 650.00, 'sku' => 'TOL-008', 'type' => 'product'],
            ['name' => 'Funnel Set', 'description' => 'Multi-size funnels', 'price' => 150.00, 'sku' => 'TOL-009', 'type' => 'product'],
            ['name' => 'Work Light LED', 'description' => 'Rechargeable magnetic light', 'price' => 1200.00, 'sku' => 'TOL-010', 'type' => 'product'],

            // Suspension & Handling (10 products)
            ['name' => 'Lowering Springs', 'description' => '1.5 inch drop', 'price' => 8500.00, 'sku' => 'SUS-002', 'type' => 'product'],
            ['name' => 'Sway Bar Front', 'description' => 'Thicker anti-roll bar', 'price' => 6500.00, 'sku' => 'SUS-003', 'type' => 'product'],
            ['name' => 'Strut Bar', 'description' => 'Front tower brace', 'price' => 3500.00, 'sku' => 'SUS-004', 'type' => 'product'],
            ['name' => 'Control Arms Lower', 'description' => 'Aluminum control arms', 'price' => 5500.00, 'sku' => 'SUS-005', 'type' => 'product'],
            ['name' => 'Camber Kit', 'description' => 'Adjustable camber bolts', 'price' => 1200.00, 'sku' => 'SUS-006', 'type' => 'product'],
            ['name' => 'Polyurethane Bushings', 'description' => 'Complete bushing kit', 'price' => 4500.00, 'sku' => 'SUS-007', 'type' => 'product'],
            ['name' => 'Subframe Collars', 'description' => 'Rigid collar kit', 'price' => 2200.00, 'sku' => 'SUS-008', 'type' => 'product'],
            ['name' => 'Tie Rod Ends', 'description' => 'Heavy duty rod ends', 'price' => 1800.00, 'sku' => 'SUS-009', 'type' => 'product'],
            ['name' => 'Ball Joints', 'description' => 'Extended ball joints', 'price' => 2500.00, 'sku' => 'SUS-010', 'type' => 'product'],
            ['name' => 'Shock Absorbers Rear', 'description' => 'Gas charged shocks', 'price' => 3800.00, 'sku' => 'SUS-011', 'type' => 'product'],
        ];

        // ALGORITHMIC GENERATION to reach ~250 products
        // We need 240 products to give each of the 3 branches 80 products (20 per section * 4 sections).
        // Current hardcoded list is ~105. We need ~140 more.
        
        $adjectives = ['Premium', 'Heavy Duty', 'Racing', 'Advanced', 'Pro', 'Elite', 'Ultra', 'Sport', 'Durable', 'High Performance', 'Eco', 'Max', 'Super', 'Titanium', 'Carbon', 'Extreme'];
        $parts = ['Oil Filter', 'Cabin Filter', 'Wiper Blade', 'Spark Plug', 'Brake Pad', 'Brake Rotor', 'Headlight Bulb', 'Tail Light', 'Fog Light', 'Battery Cable', 'Fuse Set', 'Relay', 'Switch', 'Sensor', 'Gasket', 'Seal', 'Bearing', 'Bushing', 'Mount', 'Hose', 'Belt', 'Clamp', 'Clip', 'Fastener', 'Nut', 'Bolt', 'Washer', 'Stud', 'Pin', 'Cap'];
        $brandSuffixes = ['X1', 'Pro', 'Plus', 'V2', 'Mk3', 'Gen4', 'Series 5', 'Edition', 'Sport', 'Elite', 'Max', 'Prime', 'Select', 'Ultra', 'Turbo', 'GT'];

        $generatedCount = 0;
        $targetTotal = 250;
        $currentCount = count($products);

        while ($currentCount + $generatedCount < $targetTotal) {
            $adj = $adjectives[array_rand($adjectives)];
            $part = $parts[array_rand($parts)];
            $suffix = $brandSuffixes[array_rand($brandSuffixes)];
            
            $name = "$adj $part $suffix";
            $sku = strtoupper(substr($part, 0, 3)) . '-' . rand(1000, 9999);
            
            // Avoid duplicates in current batch (basic check)
            $isDuplicate = false;
            foreach ($products as $p) {
                if ($p['name'] === $name) { $isDuplicate = true; break; }
            }
            if ($isDuplicate) continue;

            $products[] = [
                'name' => $name,
                'description' => "High quality $part for automotive use.",
                'price' => rand(500, 5000), // Random price
                'sku' => $sku,
                'type' => 'product'
            ];
            $generatedCount++;
        }

        // Truncate tables to prevent duplicates
        \DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        \DB::table('product_section_pins')->truncate();
        \DB::table('branch_product')->truncate();
        Product::truncate();
        \DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $branches = Branch::all();
        $premiumSection = ProductSection::where('slug', 'premium-parts-accessories')->first();
        $bestSellersSection = ProductSection::where('slug', 'best-sellers')->first();
        $newArrivalsSection = ProductSection::where('slug', 'new-arrivals')->first();
        $budgetSection = ProductSection::where('slug', 'budget-friendly')->first();

        $branchProducts = [];
        foreach ($branches as $branch) {
            $branchProducts[$branch->id] = [];
        }

        foreach ($products as $index => $prod) {
            $product = Product::updateOrCreate(
                ['sku' => $prod['sku']],
                $prod
            );
            
            // Round-robin assignment
            $targetBranchIndex = $index % $branches->count();
            $targetBranch = $branches[$targetBranchIndex];

            // Assign to target branch ONLY
            $targetBranch->products()->attach($product->id, ['stock_quantity' => rand(10, 50)]);
            
            // Track for pinning
            $branchProducts[$targetBranch->id][] = $product;
        }

        // Pin products to sections SPECIFIC TO EACH BRANCH
        foreach ($branches as $branch) {
            $myProducts = $branchProducts[$branch->id];
            
            // Distribute my products across the 4 sections
            // We now aim for ~20 products per section.
            
            $premiumSlice = array_slice($myProducts, 0, 20);
            $bestSellersSlice = array_slice($myProducts, 20, 20);
            $newArrivalsSlice = array_slice($myProducts, 40, 20);
            $budgetSlice = array_slice($myProducts, 60);

            // Premium Auto Parts & Accessories
            if ($premiumSection) {
                foreach ($premiumSlice as $order => $product) {
                    $premiumSection->products()->attach($product->id, [
                        'branch_id' => $branch->id,
                        'order' => $order + 1
                    ]);
                }
            }

            // Best Sellers
            if ($bestSellersSection) {
                foreach ($bestSellersSlice as $order => $product) {
                    $bestSellersSection->products()->attach($product->id, [
                        'branch_id' => $branch->id,
                        'order' => $order + 1
                    ]);
                }
            }

            // New Arrivals
            if ($newArrivalsSection) {
                foreach ($newArrivalsSlice as $order => $product) {
                    $newArrivalsSection->products()->attach($product->id, [
                        'branch_id' => $branch->id,
                        'order' => $order + 1
                    ]);
                }
            }

            // Budget-Friendly
            if ($budgetSection) {
                foreach ($budgetSlice as $order => $product) {
                    $budgetSection->products()->attach($product->id, [
                        'branch_id' => $branch->id,
                        'order' => $order + 1
                    ]);
                }
            }
        }

        $productCount = Product::where('type', 'product')->count();
        $serviceCount = Product::where('type', 'service')->count();
        $this->command->info("Created {$productCount} products and {$serviceCount} services.");
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        // KPI Cards
        $totalRevenue = 1250000; // Mocked for now (in real app: Order::sum('total'))
        $totalOrders = \App\Models\JobOrder::count(); // Using Job Orders as proxies for sales for now
        $totalProducts = \App\Models\Product::count();
        $totalBranches = \App\Models\Branch::count();

        // 1. Revenue Trend (Area Chart)
        $revenueTrend = [
            ['name' => 'Mon', 'revenue' => 4000, 'orders' => 24],
            ['name' => 'Tue', 'revenue' => 3000, 'orders' => 13],
            ['name' => 'Wed', 'revenue' => 2000, 'orders' => 98],
            ['name' => 'Thu', 'revenue' => 2780, 'orders' => 39],
            ['name' => 'Fri', 'revenue' => 1890, 'orders' => 48],
            ['name' => 'Sat', 'revenue' => 2390, 'orders' => 38],
            ['name' => 'Sun', 'revenue' => 3490, 'orders' => 43],
        ];

        // 2. Top Products (Bar Chart)
        $topProducts = \App\Models\Product::withCount('branches') // Mocking "popularity" by availability for now
            ->orderBy('branches_count', 'desc')
            ->take(5)
            ->get()
            ->map(function($p) {
                return ['name' => $p->name, 'sales' => rand(50, 200)];
            });

        // 3. Branch Performance (Pie Chart)
        $branchDistribution = \App\Models\Branch::withCount('products') // Mocking activity by inventory size
            ->get()
            ->map(function($b) {
                return ['name' => $b->name, 'value' => $b->products_count + rand(10, 50)];
            });

        // 4. Revenue Goal
        $timeframe = request('timeframe', 'monthly');
        
        // Fetch goals from DB or fallback
        $goals = [
            'daily' => \App\Models\Setting::where('key', 'revenue_goal_daily')->value('value') ?? 5000,
            'monthly' => \App\Models\Setting::where('key', 'revenue_goal_monthly')->value('value') ?? 150000,
            'yearly' => \App\Models\Setting::where('key', 'revenue_goal_yearly')->value('value') ?? 2000000,
        ];
        $currentGoal = (int) ($goals[$timeframe] ?? 150000);
        
        // Mock current revenue based on timeframe
        $currentRevenue = match($timeframe) {
            'daily' => 4500,
            'monthly' => 125000,
            'yearly' => 1100000,
            default => 125000
        };

        return \Inertia\Inertia::render('Admin/Dashboard', [
            'stats' => [
                'revenue' => $totalRevenue,
                'orders' => $totalOrders,
                'products' => $totalProducts,
                'branches' => $totalBranches,
            ],
            'goals' => [
                'timeframe' => $timeframe,
                'target' => $currentGoal,
                'current' => $currentRevenue,
                'percentage' => round(($currentRevenue / $currentGoal) * 100),
            ],
            'charts' => [
                'revenue' => $revenueTrend,
                'topProducts' => $topProducts,
                'branchDistribution' => $branchDistribution,
            ]
        ]);
    }

    public function updateGoal(Request $request)
    {
        $request->validate([
            'timeframe' => 'required|in:daily,monthly,yearly',
            'target' => 'required|integer|min:1'
        ]);

        \App\Models\Setting::updateOrCreate(
            ['key' => 'revenue_goal_' . $request->timeframe],
            ['value' => $request->target, 'type' => 'integer']
        );

        return back()->with('success', 'Revenue goal updated successfully.');
    }
}

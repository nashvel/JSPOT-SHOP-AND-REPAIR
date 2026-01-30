<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\JobOrder;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        // Determine branch filter
        // System Admin (no branch_id) can filter by any branch or see all
        // Branch users are locked to their own branch
        $selectedBranchId = null;
        $canFilterBranches = $user->branch_id === null; // System admin

        if ($canFilterBranches) {
            $selectedBranchId = $request->query('branch') ?: null;
        } else {
            $selectedBranchId = $user->branch_id;
        }

        // Build base queries with branch filter
        $salesQuery = Sale::query();
        $jobOrdersQuery = JobOrder::query();
        $productsQuery = Product::query();

        if ($selectedBranchId) {
            $salesQuery->where('branch_id', $selectedBranchId);
            $jobOrdersQuery->where('branch_id', $selectedBranchId);
            // Products are branch-scoped via pivot
            $productsQuery->whereHas('branches', fn($q) => $q->where('branches.id', $selectedBranchId));
        }

        // KPI Cards - Real Data
        $totalRevenue = (clone $salesQuery)->sum('total') ?? 0;
        $totalOrders = (clone $salesQuery)->count();
        $totalJobOrders = (clone $jobOrdersQuery)->count();
        $totalProducts = (clone $productsQuery)->count();
        $totalBranches = $canFilterBranches ? Branch::count() : 1;

        // Revenue Trend (Last 7 days)
        $revenueTrend = Sale::query()
            ->when($selectedBranchId, fn($q) => $q->where('branch_id', $selectedBranchId))
            ->where('created_at', '>=', now()->subDays(6)->startOfDay())
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total) as revenue'),
                DB::raw('COUNT(*) as orders')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn($row) => [
                'name' => \Carbon\Carbon::parse($row->date)->format('D'),
                'revenue' => (float) $row->revenue,
                'orders' => (int) $row->orders,
            ]);

        // Fill in missing days with zero values
        $last7Days = collect(range(6, 0))->map(fn($i) => [
            'name' => now()->subDays($i)->format('D'),
            'revenue' => 0,
            'orders' => 0,
        ]);

        $revenueTrend = $last7Days->map(function ($day) use ($revenueTrend) {
            $found = $revenueTrend->firstWhere('name', $day['name']);
            return $found ?: $day;
        });

        // Top Products by Sales Quantity
        $topProducts = SaleItem::query()
            ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->when($selectedBranchId, fn($q) => $q->where('sales.branch_id', $selectedBranchId))
            ->select('products.name', DB::raw('SUM(sale_items.quantity) as total_quantity'))
            ->whereNotNull('sale_items.product_id')
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('total_quantity')
            ->take(5)
            ->get()
            ->map(fn($row) => ['name' => $row->name, 'sales' => (int) $row->total_quantity]);

        // Branch Distribution (Pie Chart) - Only for admin
        $branchDistribution = collect();
        if ($canFilterBranches && !$selectedBranchId) {
            $branchDistribution = Sale::query()
                ->join('branches', 'sales.branch_id', '=', 'branches.id')
                ->select('branches.name', DB::raw('SUM(sales.total) as value'))
                ->groupBy('branches.id', 'branches.name')
                ->get()
                ->map(fn($row) => ['name' => $row->name, 'value' => (float) $row->value]);
        }

        // Revenue Goal
        $timeframe = $request->query('timeframe', 'monthly');
        $goals = [
            'daily' => Setting::where('key', 'revenue_goal_daily')->value('value') ?? 5000,
            'monthly' => Setting::where('key', 'revenue_goal_monthly')->value('value') ?? 150000,
            'yearly' => Setting::where('key', 'revenue_goal_yearly')->value('value') ?? 2000000,
        ];
        $currentGoal = (int) ($goals[$timeframe] ?? 150000);

        // Real current revenue based on timeframe
        $currentRevenueQuery = Sale::query()
            ->when($selectedBranchId, fn($q) => $q->where('branch_id', $selectedBranchId));

        $currentRevenue = match ($timeframe) {
            'daily' => (float) (clone $currentRevenueQuery)->whereDate('created_at', today())->sum('total'),
            'monthly' => (float) (clone $currentRevenueQuery)->whereMonth('created_at', now()->month)->whereYear('created_at', now()->year)->sum('total'),
            'yearly' => (float) (clone $currentRevenueQuery)->whereYear('created_at', now()->year)->sum('total'),
            default => (float) (clone $currentRevenueQuery)->whereMonth('created_at', now()->month)->sum('total'),
        };

        // Branches list for dropdown (admin only)
        $branches = $canFilterBranches ? Branch::select('id', 'name')->get() : collect();

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'revenue' => $totalRevenue,
                'orders' => $totalOrders,
                'jobOrders' => $totalJobOrders,
                'products' => $totalProducts,
                'branches' => $totalBranches,
            ],
            'goals' => [
                'timeframe' => $timeframe,
                'target' => $currentGoal,
                'current' => $currentRevenue,
                'percentage' => $currentGoal > 0 ? round(($currentRevenue / $currentGoal) * 100) : 0,
            ],
            'charts' => [
                'revenue' => $revenueTrend,
                'topProducts' => $topProducts,
                'branchDistribution' => $branchDistribution,
            ],
            // Branch filter data
            'branches' => $branches,
            'selectedBranch' => $selectedBranchId,
            'canFilterBranches' => $canFilterBranches,
        ]);
    }

    public function updateGoal(Request $request)
    {
        $request->validate([
            'timeframe' => 'required|in:daily,monthly,yearly',
            'target' => 'required|integer|min:1'
        ]);

        Setting::updateOrCreate(
            ['key' => 'revenue_goal_' . $request->timeframe],
            ['value' => $request->target, 'type' => 'integer']
        );

        return back()->with('success', 'Revenue goal updated successfully.');
    }
}

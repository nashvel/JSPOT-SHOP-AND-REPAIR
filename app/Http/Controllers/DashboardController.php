<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $branchId = $user->branch_id;
        $isMain = $user->branch?->is_main ?? false;

        $query = Order::with(['branch', 'customer']);
        
        if (!$isMain && $branchId) {
            $query->where('branch_id', $branchId);
        }

        $todaySales = (clone $query)->whereDate('created_at', today())->sum('total');
        $monthSales = (clone $query)->whereMonth('created_at', now()->month)->sum('total');
        $totalOrders = (clone $query)->count();
        $pendingOrders = (clone $query)->where('status', 'pending')->count();

        $recentOrders = $query->latest()->take(10)->get();
        
        $lowStockProducts = Product::where('stock_quantity', '<=', 'min_stock_level')
            ->where('track_inventory', true)
            ->take(10)
            ->get();

        return Inertia::render('Dashboard', [
            'stats' => [
                'todaySales' => $todaySales,
                'monthSales' => $monthSales,
                'totalOrders' => $totalOrders,
                'pendingOrders' => $pendingOrders,
            ],
            'recentOrders' => $recentOrders,
            'lowStockProducts' => $lowStockProducts,
        ]);
    }
}

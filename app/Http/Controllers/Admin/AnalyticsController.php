<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\JobOrder;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    /**
     * Unified Analytics Dashboard - All reports in one page
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $branchId = $this->getBranchFilter($request);
        $canFilterBranches = $this->canFilterBranches();

        return Inertia::render('Admin/Analytics/Index', [
            'branches' => $canFilterBranches ? Branch::select('id', 'name')->get() : collect(),
            'selectedBranch' => $branchId,
            'canFilterBranches' => $canFilterBranches,
        ]);
    }

    /**
     * Get branch filter value based on user permissions
     */
    private function getBranchFilter(Request $request): ?int
    {
        $user = Auth::user();

        // System Admin can filter by any branch
        if ($user->branch_id === null) {
            return $request->query('branch') ? (int) $request->query('branch') : null;
        }

        // Branch users are locked to their branch
        return $user->branch_id;
    }

    /**
     * Check if user can filter branches (is system admin)
     */
    private function canFilterBranches(): bool
    {
        return Auth::user()->branch_id === null;
    }

    /**
     * Inventory Report - Low Stock & In Stock
     */
    public function inventory(Request $request)
    {
        $branchId = $this->getBranchFilter($request);
        $filter = $request->query('filter', 'all'); // all, low_stock, out_of_stock, in_stock
        $lowStockThreshold = (int) $request->query('threshold', 10);

        // Base query for products with branch stock
        $query = DB::table('branch_product')
            ->join('products', 'branch_product.product_id', '=', 'products.id')
            ->join('branches', 'branch_product.branch_id', '=', 'branches.id')
            ->leftJoin('categories', 'products.category_id', '=', 'categories.id')
            ->select(
                'products.id',
                'products.name',
                'products.sku',
                'products.price',
                'products.cost',
                'products.type',
                'categories.name as category_name',
                'branches.id as branch_id',
                'branches.name as branch_name',
                'branch_product.stock_quantity'
            )
            ->where('products.type', 'product'); // Only products, not services

        // Apply branch filter
        if ($branchId) {
            $query->where('branch_product.branch_id', $branchId);
        }

        // Apply stock filter
        switch ($filter) {
            case 'low_stock':
                $query->where('branch_product.stock_quantity', '>', 0)
                    ->where('branch_product.stock_quantity', '<=', $lowStockThreshold);
                break;
            case 'out_of_stock':
                $query->where('branch_product.stock_quantity', '=', 0);
                break;
            case 'in_stock':
                $query->where('branch_product.stock_quantity', '>', $lowStockThreshold);
                break;
        }

        $inventory = $query->orderBy('branch_product.stock_quantity', 'asc')->get();

        // Summary stats
        $baseQuery = DB::table('branch_product')
            ->join('products', 'branch_product.product_id', '=', 'products.id')
            ->where('products.type', 'product');

        if ($branchId) {
            $baseQuery->where('branch_product.branch_id', $branchId);
        }

        $stats = [
            'total_products' => (clone $baseQuery)->count(),
            'out_of_stock' => (clone $baseQuery)->where('stock_quantity', 0)->count(),
            'low_stock' => (clone $baseQuery)->where('stock_quantity', '>', 0)->where('stock_quantity', '<=', $lowStockThreshold)->count(),
            'in_stock' => (clone $baseQuery)->where('stock_quantity', '>', $lowStockThreshold)->count(),
            'total_value' => (clone $baseQuery)->sum(DB::raw('stock_quantity * products.cost')),
        ];

        return Inertia::render('Admin/Analytics/Inventory', [
            'inventory' => $inventory,
            'stats' => $stats,
            'filter' => $filter,
            'threshold' => $lowStockThreshold,
            'branches' => $this->canFilterBranches() ? Branch::select('id', 'name')->get() : collect(),
            'selectedBranch' => $branchId,
            'canFilterBranches' => $this->canFilterBranches(),
        ]);
    }

    /**
     * Sales Report - With Date Filtering
     */
    public function sales(Request $request)
    {
        $branchId = $this->getBranchFilter($request);
        $dateFilter = $request->query('date', 'today'); // today, week, month, year, custom
        $startDate = $request->query('start');
        $endDate = $request->query('end');

        // Determine date range
        $dateRange = match ($dateFilter) {
            'today' => [Carbon::today(), Carbon::today()->endOfDay()],
            'week' => [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()],
            'month' => [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()],
            'year' => [Carbon::now()->startOfYear(), Carbon::now()->endOfYear()],
            'custom' => [
                $startDate ? Carbon::parse($startDate)->startOfDay() : Carbon::today()->subMonth(),
                $endDate ? Carbon::parse($endDate)->endOfDay() : Carbon::today()->endOfDay(),
            ],
            default => [Carbon::today(), Carbon::today()->endOfDay()],
        };

        // Sales query
        $salesQuery = Sale::query()
            ->with(['branch:id,name', 'user:id,name', 'items.product:id,name'])
            ->whereBetween('created_at', $dateRange);

        if ($branchId) {
            $salesQuery->where('branch_id', $branchId);
        }

        $sales = $salesQuery->orderBy('created_at', 'desc')->get();

        // Summary stats
        $statsQuery = Sale::query()->whereBetween('created_at', $dateRange);
        if ($branchId) {
            $statsQuery->where('branch_id', $branchId);
        }

        $stats = [
            'total_sales' => (clone $statsQuery)->count(),
            'total_revenue' => (clone $statsQuery)->sum('total'),
            'avg_sale' => (clone $statsQuery)->avg('total') ?? 0,
            'total_items' => SaleItem::whereIn('sale_id', (clone $statsQuery)->pluck('id'))->sum('quantity'),
        ];

        // Top products for this period
        $topProducts = SaleItem::query()
            ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->whereBetween('sales.created_at', $dateRange)
            ->when($branchId, fn($q) => $q->where('sales.branch_id', $branchId))
            ->whereNotNull('sale_items.product_id')
            ->select('products.name', DB::raw('SUM(sale_items.quantity) as quantity'), DB::raw('SUM(sale_items.total) as revenue'))
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('revenue')
            ->take(10)
            ->get();

        // Daily breakdown
        $dailyBreakdown = Sale::query()
            ->whereBetween('created_at', $dateRange)
            ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(total) as revenue')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return Inertia::render('Admin/Analytics/Sales', [
            'sales' => $sales,
            'stats' => $stats,
            'topProducts' => $topProducts,
            'dailyBreakdown' => $dailyBreakdown,
            'dateFilter' => $dateFilter,
            'dateRange' => [
                'start' => $dateRange[0]->format('Y-m-d'),
                'end' => $dateRange[1]->format('Y-m-d'),
            ],
            'branches' => $this->canFilterBranches() ? Branch::select('id', 'name')->get() : collect(),
            'selectedBranch' => $branchId,
            'canFilterBranches' => $this->canFilterBranches(),
        ]);
    }

    /**
     * Job Orders Report
     */
    public function jobOrders(Request $request)
    {
        $branchId = $this->getBranchFilter($request);
        $status = $request->query('status', 'all'); // all, pending, in_progress, completed, cancelled
        $dateFilter = $request->query('date', 'all');

        // Date range
        $dateRange = null;
        if ($dateFilter !== 'all') {
            $dateRange = match ($dateFilter) {
                'today' => [Carbon::today(), Carbon::today()->endOfDay()],
                'week' => [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()],
                'month' => [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()],
                default => null,
            };
        }

        // Job Orders query
        $query = JobOrder::query()
            ->with(['branch:id,name'])
            ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
            ->when($status !== 'all', fn($q) => $q->where('status', $status))
            ->when($dateRange, fn($q) => $q->whereBetween('created_at', $dateRange));

        $jobOrders = $query->orderBy('created_at', 'desc')->get();

        // Stats
        $baseStats = JobOrder::query()
            ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
            ->when($dateRange, fn($q) => $q->whereBetween('created_at', $dateRange));

        $stats = [
            'total' => (clone $baseStats)->count(),
            'pending' => (clone $baseStats)->where('status', 'pending')->count(),
            'in_progress' => (clone $baseStats)->where('status', 'in_progress')->count(),
            'completed' => (clone $baseStats)->where('status', 'completed')->count(),
            'cancelled' => (clone $baseStats)->where('status', 'cancelled')->count(),
        ];

        return Inertia::render('Admin/Analytics/JobOrders', [
            'jobOrders' => $jobOrders,
            'stats' => $stats,
            'status' => $status,
            'dateFilter' => $dateFilter,
            'branches' => $this->canFilterBranches() ? Branch::select('id', 'name')->get() : collect(),
            'selectedBranch' => $branchId,
            'canFilterBranches' => $this->canFilterBranches(),
        ]);
    }

    /**
     * Export Sales Data
     */
    public function exportSales(Request $request)
    {
        $branchId = $this->getBranchFilter($request);
        // Allows forcing a specific branch from the modal if user is admin
        if ($this->canFilterBranches() && $request->has('branch_id')) {
            $branchId = $request->input('branch_id') === 'null' ? null : (int) $request->input('branch_id');
        }

        $dateFilter = $request->query('date', 'today');
        $startDate = $request->query('start');
        $endDate = $request->query('end');

        // Determine date range (reusing logic or simplified)
        $dateRange = match ($dateFilter) {
            'today' => [Carbon::today(), Carbon::today()->endOfDay()],
            'week' => [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()],
            'month' => [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()],
            'year' => [Carbon::now()->startOfYear(), Carbon::now()->endOfYear()],
            'custom' => [
                $startDate ? Carbon::parse($startDate)->startOfDay() : Carbon::today()->subMonth(),
                $endDate ? Carbon::parse($endDate)->endOfDay() : Carbon::today()->endOfDay(),
            ],
            default => [Carbon::today(), Carbon::today()->endOfDay()],
        };

        $salesQuery = Sale::query()
            ->with(['branch:id,name', 'user:id,name', 'items.product:id,name'])
            ->whereBetween('created_at', $dateRange);

        if ($branchId) {
            $salesQuery->where('branch_id', $branchId);
        }

        $sales = $salesQuery->orderBy('created_at', 'desc')->get();

        $filename = 'sales_report_' . Carbon::now()->format('Ymd_His') . '.csv';

        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $callback = function () use ($sales) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Sale Number', 'Date', 'Customer', 'Branch', 'Items', 'Total', 'Payment Method', 'Processed By']);

            foreach ($sales as $sale) {
                $itemNames = $sale->items->map(fn($item) => $item->product->name . ' (' . $item->quantity . ')')->implode(', ');

                fputcsv($file, [
                    $sale->sale_number,
                    $sale->created_at->format('Y-m-d H:i:s'),
                    $sale->customer_name ?? 'Walk-in',
                    $sale->branch->name ?? 'N/A',
                    $itemNames,
                    $sale->total,
                    $sale->payment_method,
                    $sale->user->name ?? 'Unknown'
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export Inventory Data
     */
    public function exportInventory(Request $request)
    {
        $branchId = $this->getBranchFilter($request);
        // Allows forcing a specific branch from the modal if user is admin
        if ($this->canFilterBranches() && $request->has('branch_id')) {
            $branchId = $request->input('branch_id') === 'null' ? null : (int) $request->input('branch_id');
        }

        $filter = $request->query('filter', 'all');
        $lowStockThreshold = (int) $request->query('threshold', 10);

        $query = DB::table('branch_product')
            ->join('products', 'branch_product.product_id', '=', 'products.id')
            ->join('branches', 'branch_product.branch_id', '=', 'branches.id')
            ->leftJoin('categories', 'products.category_id', '=', 'categories.id')
            ->select(
                'products.name',
                'products.sku',
                'products.price',
                'products.cost',
                'categories.name as category_name',
                'branches.name as branch_name',
                'branch_product.stock_quantity'
            )
            ->where('products.type', 'product');

        if ($branchId) {
            $query->where('branch_product.branch_id', $branchId);
        }

        switch ($filter) {
            case 'low_stock':
                $query->where('branch_product.stock_quantity', '>', 0)
                    ->where('branch_product.stock_quantity', '<=', $lowStockThreshold);
                break;
            case 'out_of_stock':
                $query->where('branch_product.stock_quantity', '=', 0);
                break;
            case 'in_stock':
                $query->where('branch_product.stock_quantity', '>', $lowStockThreshold);
                break;
        }

        $inventory = $query->orderBy('branches.name')->orderBy('products.name')->get();

        $filename = 'inventory_report_' . Carbon::now()->format('Ymd_His') . '.csv';

        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $callback = function () use ($inventory) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Product Name', 'SKU', 'Category', 'Branch', 'Stock Quantity', 'Cost', 'Price', 'Total Value']);

            foreach ($inventory as $item) {
                fputcsv($file, [
                    $item->name,
                    $item->sku,
                    $item->category_name ?? 'Uncategorized',
                    $item->branch_name,
                    $item->stock_quantity,
                    $item->cost,
                    $item->price,
                    $item->stock_quantity * $item->cost
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export Job Orders Data
     */
    public function exportJobOrders(Request $request)
    {
        $branchId = $this->getBranchFilter($request);
        // Allows forcing a specific branch from the modal if user is admin
        if ($this->canFilterBranches() && $request->has('branch_id')) {
            $branchId = $request->input('branch_id') === 'null' ? null : (int) $request->input('branch_id');
        }

        $status = $request->query('status', 'all');
        $dateFilter = $request->query('date', 'all');

        $dateRange = null;
        if ($dateFilter !== 'all') {
            $dateRange = match ($dateFilter) {
                'today' => [Carbon::today(), Carbon::today()->endOfDay()],
                'week' => [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()],
                'month' => [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()],
                default => null,
            };
        }

        $query = JobOrder::query()
            ->with(['branch:id,name', 'mechanic:id,name'])
            ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
            ->when($status !== 'all', fn($q) => $q->where('status', $status))
            ->when($dateRange, fn($q) => $q->whereBetween('created_at', $dateRange));

        $jobOrders = $query->orderBy('created_at', 'desc')->get();

        $filename = 'job_orders_report_' . Carbon::now()->format('Ymd_His') . '.csv';

        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $callback = function () use ($jobOrders) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Tracking Code', 'Date', 'Customer', 'Device', 'Issue', 'Branch', 'Mechanic', 'Status', 'Cost']);

            foreach ($jobOrders as $job) {
                fputcsv($file, [
                    $job->tracking_code,
                    $job->created_at->format('Y-m-d H:i:s'),
                    $job->customer_name,
                    ($job->device_brand ?? '') . ' ' . ($job->device_type ?? ''),
                    $job->issue_description,
                    $job->branch->name ?? 'N/A',
                    $job->mechanic->name ?? 'Unassigned',
                    ucfirst(str_replace('_', ' ', $job->status)),
                    $job->estimated_cost ?? 0
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}

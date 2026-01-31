<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\JobOrder;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SyncController extends Controller
{
    /**
     * Push sales from offline to server
     */
    public function pushSales(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'sales' => 'required|array',
            'sales.*.local_id' => 'required|string',
            'sales.*.branch_id' => 'required|integer',
            'sales.*.items' => 'required|array',
            'sales.*.total' => 'required|numeric',
            'sales.*.payment_method' => 'required|string',
        ]);

        $mappings = [];
        $errors = [];

        DB::beginTransaction();
        try {
            foreach ($validated['sales'] as $saleData) {
                // Check if already synced (by local_id in notes or duplicates)
                $existingSale = Sale::where('notes', 'LIKE', '%local_id:' . $saleData['local_id'] . '%')->first();

                if ($existingSale) {
                    // Already synced, return existing mapping
                    $mappings[] = [
                        'localId' => $saleData['local_id'],
                        'serverId' => $existingSale->id,
                    ];
                    continue;
                }

                // Create new sale
                $sale = Sale::create([
                    'sale_number' => $saleData['sale_number'] ?? $this->generateSaleNumber($saleData['branch_id']),
                    'branch_id' => $saleData['branch_id'],
                    'mechanic_id' => $saleData['mechanic_id'] ?? null,
                    'customer_id' => $saleData['customer_id'] ?? null,
                    'subtotal' => $saleData['subtotal'] ?? $saleData['total'],
                    'tax_amount' => $saleData['tax_amount'] ?? 0,
                    'discount_amount' => $saleData['discount_amount'] ?? 0,
                    'total' => $saleData['total'],
                    'amount_paid' => $saleData['amount_paid'] ?? $saleData['total'],
                    'change_amount' => $saleData['change_amount'] ?? 0,
                    'payment_method' => $saleData['payment_method'],
                    'reference_number' => $saleData['reference_number'] ?? null,
                    'status' => $saleData['status'] ?? 'completed',
                    'notes' => 'local_id:' . $saleData['local_id'],
                    'created_at' => $saleData['created_at'] ?? now(),
                ]);

                // Create sale items
                foreach ($saleData['items'] as $itemData) {
                    $sale->items()->create([
                        'product_id' => $this->getProductServerId($itemData['product_id']),
                        'product_name' => $itemData['product_name'],
                        'product_type' => $itemData['product_type'] ?? 'product',
                        'category_name' => $itemData['category_name'] ?? null,
                        'quantity' => $itemData['quantity'],
                        'unit_price' => $itemData['unit_price'],
                        'total' => $itemData['total'],
                        'payment_method' => $itemData['payment_method'] ?? $saleData['payment_method'],
                        'reference_number' => $itemData['reference_number'] ?? null,
                        'transactions' => $itemData['transactions'] ?? null,
                    ]);

                    // Deduct stock for products
                    if (($itemData['product_type'] ?? 'product') === 'product') {
                        $product = Product::find($this->getProductServerId($itemData['product_id']));
                        if ($product) {
                            $product->branches()->updateExistingPivot($saleData['branch_id'], [
                                'stock_quantity' => DB::raw("stock_quantity - {$itemData['quantity']}"),
                            ]);
                        }
                    }
                }

                $mappings[] = [
                    'localId' => $saleData['local_id'],
                    'serverId' => $sale->id,
                ];
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'mappings' => $mappings,
                'synced_count' => count($mappings),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Sync push sales failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Push job orders from offline to server
     */
    public function pushJobOrders(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'jobOrders' => 'required|array',
            'jobOrders.*.local_id' => 'required|string',
            'jobOrders.*.branch_id' => 'required|integer',
            'jobOrders.*.customer_name' => 'required|string',
        ]);

        $mappings = [];

        DB::beginTransaction();
        try {
            foreach ($validated['jobOrders'] as $jobData) {
                // Check if already synced
                $existing = JobOrder::where('notes', 'LIKE', '%local_id:' . $jobData['local_id'] . '%')->first();

                if ($existing) {
                    $mappings[] = [
                        'localId' => $jobData['local_id'],
                        'serverId' => $existing->id,
                    ];
                    continue;
                }

                $jobOrder = JobOrder::create([
                    'job_order_number' => $jobData['job_order_number'] ?? $this->generateJobOrderNumber($jobData['branch_id']),
                    'branch_id' => $jobData['branch_id'],
                    'customer_name' => $jobData['customer_name'],
                    'customer_phone' => $jobData['customer_phone'] ?? null,
                    'vehicle_type' => $jobData['vehicle_type'] ?? null,
                    'vehicle_plate' => $jobData['vehicle_plate'] ?? null,
                    'vehicle_model' => $jobData['vehicle_model'] ?? null,
                    'mechanic_id' => $jobData['mechanic_id'] ?? null,
                    'labor_cost' => $jobData['labor_cost'] ?? 0,
                    'parts_total' => $jobData['parts_total'] ?? 0,
                    'total' => $jobData['total'] ?? 0,
                    'status' => $jobData['status'] ?? 'pending',
                    'notes' => 'local_id:' . $jobData['local_id'] . ($jobData['notes'] ? "\n" . $jobData['notes'] : ''),
                    'created_at' => $jobData['created_at'] ?? now(),
                ]);

                $mappings[] = [
                    'localId' => $jobData['local_id'],
                    'serverId' => $jobOrder->id,
                ];
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'mappings' => $mappings,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Sync push job orders failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Push attendance from offline to server
     */
    public function pushAttendance(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'attendance' => 'required|array',
            'attendance.*.local_id' => 'required|string',
            'attendance.*.user_id' => 'required|integer',
            'attendance.*.branch_id' => 'required|integer',
            'attendance.*.clock_in' => 'required|string',
        ]);

        $mappings = [];

        DB::beginTransaction();
        try {
            foreach ($validated['attendance'] as $attData) {
                // Check if already synced
                $existing = Attendance::where('notes', 'LIKE', '%local_id:' . $attData['local_id'] . '%')->first();

                if ($existing) {
                    $mappings[] = [
                        'localId' => $attData['local_id'],
                        'serverId' => $existing->id,
                    ];
                    continue;
                }

                $attendance = Attendance::create([
                    'user_id' => $attData['user_id'],
                    'branch_id' => $attData['branch_id'],
                    'clock_in' => $attData['clock_in'],
                    'clock_out' => $attData['clock_out'] ?? null,
                    'notes' => 'local_id:' . $attData['local_id'],
                    'created_at' => $attData['created_at'] ?? now(),
                ]);

                $mappings[] = [
                    'localId' => $attData['local_id'],
                    'serverId' => $attendance->id,
                ];
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'mappings' => $mappings,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Sync push attendance failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Pull categories for offline cache
     */
    public function pullCategories(): JsonResponse
    {
        $categories = Category::all(['id', 'name', 'type', 'created_at', 'updated_at']);

        return response()->json([
            'success' => true,
            'categories' => $categories,
        ]);
    }

    /**
     * Pull products for a specific branch
     */
    public function pullProducts(Request $request): JsonResponse
    {
        $branchId = $request->query('branch_id');

        $query = Product::with([
            'category',
            'branches' => function ($q) use ($branchId) {
                if ($branchId) {
                    $q->where('branches.id', $branchId);
                }
            }
        ]);

        $products = $query->get()->map(function ($product) use ($branchId) {
            $stock = 0;
            if ($branchId && $product->branches->isNotEmpty()) {
                $stock = $product->branches->first()->pivot->stock_quantity ?? 0;
            }

            return [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'type' => $product->type,
                'category_id' => $product->category_id,
                'category' => $product->category,
                'price' => $product->price,
                'cost' => $product->cost,
                'description' => $product->description,
                'stock' => $stock,
                'low_stock_threshold' => $product->low_stock_threshold,
                'created_at' => $product->created_at,
                'updated_at' => $product->updated_at,
            ];
        });

        return response()->json([
            'success' => true,
            'products' => $products,
        ]);
    }

    /**
     * Helper: Generate sale number
     */
    private function generateSaleNumber(int $branchId): string
    {
        $date = now()->format('Ymd');
        $count = Sale::whereDate('created_at', today())
            ->where('branch_id', $branchId)
            ->count() + 1;

        return "SALE-{$branchId}-{$date}-" . str_pad($count, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Helper: Generate job order number
     */
    private function generateJobOrderNumber(int $branchId): string
    {
        $date = now()->format('Ymd');
        $count = JobOrder::whereDate('created_at', today())
            ->where('branch_id', $branchId)
            ->count() + 1;

        return "JO-{$branchId}-{$date}-" . str_pad($count, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Helper: Get server product ID from local ID
     */
    private function getProductServerId($productId): ?int
    {
        // If already a number, it's a server ID
        if (is_numeric($productId)) {
            return (int) $productId;
        }

        // Otherwise, try to find by UUID in notes or return null
        return null;
    }
}

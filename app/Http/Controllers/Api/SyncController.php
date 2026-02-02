<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\JobOrder;
use App\Models\Attendance;
use App\Models\Reservation;
use App\Models\ReservationItem;
use Illuminate\Support\Str;
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
                    'user_id' => auth()->id(), // Use authenticated user
                    'employee_name' => auth()->user()->name ?? 'Unknown', // Required field
                    'mechanic_id' => $saleData['mechanic_id'] ?? null,
                    'customer_name' => $saleData['customer_name'] ?? 'Walk-in', // Handle missing customer name
                    'contact_number' => $saleData['contact_number'] ?? 'N/A', // Handle missing contact
                    'engine_number' => $saleData['engine_number'] ?? 'N/A',
                    'chassis_number' => $saleData['chassis_number'] ?? 'N/A',
                    'plate_number' => $saleData['plate_number'] ?? 'N/A',
                    'subtotal' => $saleData['subtotal'] ?? $saleData['total'],
                    'total' => $saleData['total'],
                    'amount_paid' => $saleData['amount_paid'] ?? $saleData['total'],
                    'change' => $saleData['change_amount'] ?? 0,
                    'payment_method' => $saleData['payment_method'],
                    'reference_number' => $saleData['reference_number'] ?? null,
                    'qr_token' => Str::random(64),
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
                        'quantity' => $itemData['quantity'],
                        'unit_price' => $itemData['unit_price'],
                        'total' => $itemData['total'],
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
                    'contact_number' => $jobData['customer_phone'] ?? null,
                    'vehicle_details' => ($jobData['vehicle_type'] ?? '') . ' ' . ($jobData['vehicle_model'] ?? ''),
                    'plate_number' => $jobData['vehicle_plate'] ?? null,
                    'mechanic_id' => $jobData['mechanic_id'] ?? null,
                    'labor_cost' => $jobData['labor_cost'] ?? 0,
                    'parts_cost' => $jobData['parts_total'] ?? 0,
                    'total_cost' => $jobData['total'] ?? 0,
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
            'attendance.*.branch_id' => 'required|integer',
            'attendance.*.clock_in' => 'required|string',
        ]);

        $mappings = [];

        DB::beginTransaction();
        try {
            foreach ($validated['attendance'] as $attData) {
                // Check if already synced
                $existing = Attendance::where('remarks', 'LIKE', '%local_id:' . $attData['local_id'] . '%')->first();

                if ($existing) {
                    $mappings[] = [
                        'localId' => $attData['local_id'],
                        'serverId' => $existing->id,
                    ];
                    continue;
                }

                $clockIn = \Carbon\Carbon::parse($attData['clock_in']);
                $clockOut = isset($attData['clock_out']) ? \Carbon\Carbon::parse($attData['clock_out']) : null;

                $attendance = Attendance::create([
                    'attendable_type' => \App\Models\User::class,
                    'attendable_id' => auth()->id(),
                    'branch_id' => $attData['branch_id'],
                    'date' => $clockIn->toDateString(),
                    'time_in' => $clockIn->toTimeString(),
                    'time_out' => $clockOut ? $clockOut->toTimeString() : null,
                    'status' => 'present',
                    'remarks' => 'local_id:' . $attData['local_id'],
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
     * Push reservations from offline to server
     */
    public function pushReservations(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'reservations' => 'required|array',
            'reservations.*.local_id' => 'required|string',
            'reservations.*.branch_id' => 'required|integer',
            'reservations.*.customer_name' => 'required|string',
            'reservations.*.items' => 'required|array',
        ]);

        $mappings = [];

        DB::beginTransaction();
        try {
            foreach ($validated['reservations'] as $resData) {
                // Check if already synced
                $existing = Reservation::where('notes', 'LIKE', '%local_id:' . $resData['local_id'] . '%')->first();

                if ($existing) {
                    // Update status if changed
                    if (isset($resData['status']) && $existing->status !== $resData['status']) {
                        $existing->update(['status' => $resData['status']]);
                    }

                    $mappings[] = [
                        'localId' => $resData['local_id'],
                        'serverId' => $existing->id,
                        'reservationNumber' => $existing->reservation_number,
                        'qrToken' => $existing->qr_token,
                    ];
                    continue;
                }

                // Create new reservation
                $reservation = Reservation::create([
                    'reservation_number' => $resData['reservation_number'] ?? $this->generateReservationNumber($resData['branch_id']),
                    'branch_id' => $resData['branch_id'],
                    'customer_name' => $resData['customer_name'],
                    'customer_contact' => $resData['customer_contact'] ?? null,
                    'vehicle_engine' => $resData['vehicle_engine'] ?? null,
                    'vehicle_chassis' => $resData['vehicle_chassis'] ?? null,
                    'vehicle_plate' => $resData['vehicle_plate'] ?? null,
                    'reservation_date' => $resData['reservation_date'] ?? now(),
                    'issue_description' => $resData['issue_description'] ?? null,
                    'notes' => 'local_id:' . $resData['local_id'] . ($resData['notes'] ? "\n" . $resData['notes'] : ''),
                    'status' => $resData['status'] ?? 'pending',
                    'qr_token' => Str::random(32),
                    'created_at' => $resData['created_at'] ?? now(),
                ]);

                // Attach mechanics if any using pivot
                if (!empty($resData['mechanic_ids'])) {
                    $reservation->mechanics()->sync($resData['mechanic_ids']);
                }

                // Create reservation items
                foreach ($resData['items'] as $itemData) {
                    ReservationItem::create([
                        'reservation_id' => $reservation->id,
                        'product_id' => $this->getProductServerId($itemData['product_id']),
                        'product_name' => $itemData['product_name'],
                        'product_type' => $itemData['product_type'] ?? 'product',
                        'category_name' => $itemData['category_name'] ?? null,
                        'quantity' => $itemData['quantity'],
                        'unit_price' => $itemData['unit_price'],
                        'total' => $itemData['total'],
                    ]);
                }

                $mappings[] = [
                    'localId' => $resData['local_id'],
                    'serverId' => $reservation->id,
                    'reservationNumber' => $reservation->reservation_number,
                    'qrToken' => $reservation->qr_token,
                ];
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'mappings' => $mappings,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Sync push reservations failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Pull reservations for offline cache (active only)
     */
    public function pullReservations(Request $request): JsonResponse
    {
        $branchId = $request->query('branch_id');

        $query = Reservation::with(['items', 'mechanics'])
            ->whereIn('status', ['pending', 'available', 'in_progress']);

        if ($branchId) {
            $query->where('branch_id', $branchId);
        }

        $reservations = $query->get()->map(function ($res) {
            return [
                'id' => $res->id,
                'reservation_number' => $res->reservation_number,
                'branch_id' => $res->branch_id,
                'customer_name' => $res->customer_name,
                'customer_contact' => $res->customer_contact,
                'vehicle_engine' => $res->vehicle_engine,
                'vehicle_chassis' => $res->vehicle_chassis,
                'vehicle_plate' => $res->vehicle_plate,
                'reservation_date' => $res->reservation_date,
                'issue_description' => $res->issue_description,
                'notes' => $res->notes,
                'status' => $res->status,
                'qr_token' => $res->qr_token,
                'created_at' => $res->created_at,
                'updated_at' => $res->updated_at,
                'mechanic_ids' => $res->mechanics->pluck('id')->toArray(),
                'items' => $res->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'product_id' => $item->product_id,
                        'product_name' => $item->product_name,
                        'product_type' => $item->product_type,
                        'category_name' => $item->category_name,
                        'quantity' => $item->quantity,
                        'unit_price' => $item->unit_price,
                        'total' => $item->total,
                    ];
                }),
            ];
        });

        return response()->json([
            'success' => true,
            'reservations' => $reservations,
        ]);
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
     * Helper: Generate reservation number
     */
    private function generateReservationNumber(int $branchId): string
    {
        $date = now()->format('Ymd');
        $count = Reservation::whereDate('created_at', today())
            ->where('branch_id', $branchId)
            ->count() + 1;

        return "RES-{$branchId}-{$date}-" . str_pad($count, 4, '0', STR_PAD_LEFT);
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

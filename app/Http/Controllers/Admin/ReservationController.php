<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\ReservationItem;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Product;
use App\Models\Mechanic;
use App\Models\Branch;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ReservationController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();

        $query = Reservation::with(['branch', 'mechanics', 'items', 'sale'])
            ->when($user->branch_id, fn($q) => $q->where('branch_id', $user->branch_id))
            ->when($request->branch_id, fn($q, $id) => $q->where('branch_id', $id))
            ->when($request->status, fn($q, $status) => $q->where('status', $status))
            ->when($request->search, fn($q, $s) => $q->where(function ($q2) use ($s) {
                $q2->where('customer_name', 'like', "%{$s}%")
                    ->orWhere('reservation_number', 'like', "%{$s}%")
                    ->orWhere('vehicle_plate', 'like', "%{$s}%");
            }))
            ->latest();

        $reservations = $query->paginate(15)->withQueryString();
        $branches = Branch::all();
        $mechanics = Mechanic::where('is_active', true)->get();
        $products = Product::with(['category', 'branches'])->get();

        return Inertia::render('Admin/Reservations/Index', [
            'reservations' => $reservations,
            'branches' => $branches,
            'mechanics' => $mechanics,
            'products' => $products,
            'filters' => $request->only(['search', 'status', 'branch_id']),
            'userBranchId' => $user->branch_id,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'customer_name' => 'required|string|max:255',
            'customer_contact' => 'nullable|string|max:50',
            'vehicle_engine' => 'nullable|string|max:100',
            'vehicle_chassis' => 'nullable|string|max:100',
            'vehicle_plate' => 'nullable|string|max:20',
            'reservation_date' => 'required|date',
            'issue_description' => 'nullable|string',
            'notes' => 'nullable|string',
            'mechanic_ids' => 'nullable|array',
            'mechanic_ids.*' => 'exists:mechanics,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'nullable|exists:products,id',
            'items.*.product_name' => 'required|string',
            'items.*.product_type' => 'required|string',
            'items.*.category_name' => 'nullable|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated, $request) {
            $reservation = Reservation::create([
                'branch_id' => $validated['branch_id'],
                'reservation_number' => Reservation::generateReservationNumber($validated['branch_id']),
                'customer_name' => $validated['customer_name'],
                'customer_contact' => $validated['customer_contact'] ?? null,
                'vehicle_engine' => $validated['vehicle_engine'] ?? null,
                'vehicle_chassis' => $validated['vehicle_chassis'] ?? null,
                'vehicle_plate' => $validated['vehicle_plate'] ?? null,
                'reservation_date' => $validated['reservation_date'],
                'issue_description' => $validated['issue_description'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'status' => 'pending',
                'payment_method' => $request->input('payment_method'),
                'amount_paid' => $request->input('amount_paid', 0),
                'reference_number' => $request->input('reference_number'),
                // Calculate change if needed, though usually 0 for reservations unless paid upfront
                'change' => max(0, $request->input('amount_paid', 0) - collect($validated['items'])->sum(fn($i) => $i['unit_price'] * $i['quantity'])),
            ]);

            // Add items
            foreach ($validated['items'] as $item) {
                $reservation->items()->create([
                    'product_id' => $item['product_id'] ?? null,
                    'product_name' => $item['product_name'],
                    'product_type' => $item['product_type'],
                    'category_name' => $item['category_name'] ?? null,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total' => $item['unit_price'] * $item['quantity'],
                    // If the item itself tracks payment method (unlikely for initial create, usually batch)
                    'payment_method' => $request->input('payment_method'),
                ]);
            }

            // Attach mechanics
            if (!empty($validated['mechanic_ids'])) {
                $reservation->mechanics()->attach($validated['mechanic_ids']);
            }
        });

        return redirect()->route('admin.reservations.index')
            ->with('success', 'Reservation created successfully.');
    }

    public function show(Reservation $reservation)
    {
        $reservation->load(['branch', 'mechanics', 'items', 'sale']);

        // Fetch data for Mini POS modal (adding items)
        $branchId = $reservation->branch_id;

        // Get products with stock for the reservation's branch
        $products = Product::where('type', 'product')
            ->whereHas('branches', function ($query) use ($branchId) {
                $query->where('branch_id', $branchId);
            })
            ->with([
                'branches' => function ($query) use ($branchId) {
                    $query->where('branch_id', $branchId);
                },
                'category'
            ])
            ->get();

        // Get services for the reservation's branch
        $services = Product::where('type', 'service')
            ->whereHas('branches', function ($query) use ($branchId) {
                $query->where('branch_id', $branchId);
            })
            ->with('category')
            ->get();

        $categories = \App\Models\Category::all();

        // Get mechanics for the reservation's branch
        $mechanics = Mechanic::where('branch_id', $branchId)
            ->where('is_active', true)
            ->get();

        return Inertia::render('Admin/Reservations/Show', [
            'reservation' => $reservation,
            'posData' => [
                'products' => $products,
                'services' => $services,
                'categories' => $categories,
                'mechanics' => $mechanics,
            ]
        ]);
    }

    public function ticket(Reservation $reservation)
    {
        $reservation->load(['branch', 'mechanics', 'items']);

        return Inertia::render('Admin/Reservations/Ticket', [
            'reservation' => $reservation,
        ]);
    }

    public function addItems(Request $request, Reservation $reservation)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'nullable|exists:products,id',
            'items.*.product_name' => 'required|string',
            'items.*.product_type' => 'required|string',
            'items.*.category_name' => 'nullable|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.payment_method' => 'nullable|string',
            'items.*.reference_number' => 'nullable|string',
        ]);

        foreach ($validated['items'] as $item) {
            $reservation->items()->create([
                'product_id' => $item['product_id'] ?? null,
                'product_name' => $item['product_name'],
                'product_type' => $item['product_type'],
                'category_name' => $item['category_name'] ?? null,
                'quantity' => $item['quantity'],
                'unit_price' => $item['unit_price'],
                'total' => $item['unit_price'] * $item['quantity'],
                'payment_method' => $item['payment_method'] ?? null,
                'reference_number' => $item['reference_number'] ?? null,
            ]);
        }

        // Update reservation payment details if provided
        if ($request->filled('payment_method')) {
            $currentTotal = $reservation->items()->sum('total');
            $amountPaid = $request->input('amount_paid', 0);

            $reservation->update([
                'payment_method' => $request->input('payment_method'),
                'amount_paid' => $reservation->amount_paid + $amountPaid,
                'change' => max(0, ($reservation->amount_paid + $amountPaid) - $currentTotal),
                'reference_number' => $request->input('reference_number'),
            ]);
        }

        return back()->with('success', 'Items added to reservation.');
    }

    public function updateMechanics(Request $request, Reservation $reservation)
    {
        $validated = $request->validate([
            'mechanic_ids' => 'nullable|array',
            'mechanic_ids.*' => 'exists:mechanics,id',
        ]);

        $reservation->mechanics()->sync($validated['mechanic_ids'] ?? []);

        return back()->with('success', 'Mechanics updated.');
    }

    public function updateStatus(Request $request, Reservation $reservation)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,available,in_progress,completed,cancelled',
        ]);

        $oldStatus = $reservation->status;
        $newStatus = $validated['status'];

        // If completing, create a sale
        if ($newStatus === 'completed' && $oldStatus !== 'completed') {
            DB::transaction(function () use ($reservation, $newStatus) {
                // Calculate totals
                $subtotal = $reservation->items->sum('total');

                // Create sale
                $sale = Sale::create([
                    'sale_number' => Sale::generateSaleNumber(),
                    'branch_id' => $reservation->branch_id,
                    'user_id' => auth()->id(),
                    'employee_name' => auth()->user()->name,
                    'customer_name' => $reservation->customer_name,
                    'contact_number' => $reservation->customer_contact ?? '',
                    'engine_number' => $reservation->vehicle_engine,
                    'chassis_number' => $reservation->vehicle_chassis,
                    'plate_number' => $reservation->vehicle_plate,
                    'subtotal' => $subtotal,
                    'total' => $subtotal,
                    'payment_method' => 'cash',
                    'amount_paid' => $subtotal,
                    'change' => 0,
                    'qr_token' => Sale::generateQrToken(),
                    'status' => 'completed',
                ]);

                // Copy items to sale
                foreach ($reservation->items as $item) {
                    SaleItem::create([
                        'sale_id' => $sale->id,
                        'product_id' => $item->product_id,
                        'product_name' => $item->product_name,
                        'product_type' => $item->product_type,
                        'category_name' => $item->category_name,
                        'quantity' => $item->quantity,
                        'unit_price' => $item->unit_price,
                        'total' => $item->total,
                    ]);
                }

                // Transfer mechanics to sale
                $mechanicIds = $reservation->mechanics->pluck('id')->toArray();
                if (!empty($mechanicIds)) {
                    $sale->mechanics()->attach($mechanicIds);
                }

                // Link reservation to sale
                $reservation->update([
                    'status' => $newStatus,
                    'sale_id' => $sale->id,
                ]);
            });
        } else {
            $reservation->update(['status' => $newStatus]);
        }

        return back()->with('success', 'Reservation status updated.');
    }

    public function destroy(Reservation $reservation)
    {
        $reservation->delete();
        return back()->with('success', 'Reservation deleted.');
    }
}

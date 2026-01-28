<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Product;
use App\Models\JobOrder;
use App\Models\Reservation;
use App\Http\Requests\StoreReservationRequest;
use App\Http\Requests\TrackJobRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Route;

class PublicController extends Controller
{
    public function index(Request $request)
    {
        $branchId = $request->query('branch');
        
        $products = Product::query()
            ->when($branchId, function ($query, $branchId) {
                $query->whereHas('branches', function ($q) use ($branchId) {
                    $q->where('branches.id', $branchId);
                });
            })
            ->with(['branches' => function($q) {
                $q->select('branches.id', 'name')->withPivot('stock_quantity');
            }])
            ->get();

        return Inertia::render('Public/Index', [
            'products' => $products,
            'branches' => Branch::select('id', 'name')->get(),
            'currentBranch' => $branchId,
            'canLogin' => Route::has('login'),
        ]);
    }

    public function track()
    {
        return Inertia::render('Public/Tracker');
    }

    public function searchJob(TrackJobRequest $request)
    {
        $job = JobOrder::where('tracking_code', $request->tracking_code)
            ->with('branch:id,name')
            ->first();

        // Since validation passes, we know tracking_code exists, 
        // but double check if it returns a model just in case of race condition or soft deletes logic
        if (!$job) {
             return back()->withErrors(['tracking_code' => 'Job order not found.']);
        }

        return back()->with('job', $job);
    }

    public function storeReservation(StoreReservationRequest $request)
    {
        $validated = $request->validated();

        Reservation::create([
            'branch_id' => $validated['branch_id'],
            'customer_name' => $validated['customer_name'],
            'customer_contact' => $validated['customer_contact'],
            'items' => $validated['items'],
            'status' => 'pending'
        ]);

        return back()->with('success', 'Reservation submitted successfully!');
    }
}

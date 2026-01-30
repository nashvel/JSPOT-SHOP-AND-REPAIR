<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use Inertia\Inertia;

class PublicReceiptController extends Controller
{
    public function show(string $token)
    {
        $sale = Sale::where('qr_token', $token)
            ->with(['branch', 'user', 'items'])
            ->firstOrFail();

        // Get job order if exists (when services were purchased)
        $jobOrder = \App\Models\JobOrder::where('sale_id', $sale->id)
            ->with(['mechanic', 'parts.product'])
            ->first();

        return Inertia::render('Public/Receipt', [
            'sale' => $sale,
            'jobOrder' => $jobOrder,
        ]);
    }
}

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

        return Inertia::render('Public/Receipt', [
            'sale' => $sale,
        ]);
    }
}

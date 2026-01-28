<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\POSController;
use App\Http\Controllers\PublicController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::get('/', [PublicController::class, 'index'])->name('public.shop');
Route::get('/order/{orderNumber}', [PublicController::class, 'checkOrder'])->name('public.order');
Route::post('/api/public/reservations', [PublicController::class, 'createReservation']);

// Authenticated routes
Route::middleware(['auth', 'impersonate'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // POS routes
    Route::get('/pos', [POSController::class, 'index'])->name('pos.index');
    Route::post('/pos', [POSController::class, 'store'])->name('pos.store');
    Route::get('/api/pos/search-barcode', [POSController::class, 'searchByBarcode']);
    
    // User management
    Route::middleware('role:admin|developer')->group(function () {
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
    });
    
    // Impersonation (developer only)
    Route::middleware('role:developer')->group(function () {
        Route::post('/users/{user}/impersonate', [UserController::class, 'impersonate'])->name('users.impersonate');
        Route::post('/stop-impersonating', [UserController::class, 'stopImpersonating'])->name('users.stop-impersonating');
    });
});

require __DIR__.'/auth.php';

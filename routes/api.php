<?php

use App\Http\Controllers\Api\SyncController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

/*
|--------------------------------------------------------------------------
| Sync Routes (for offline/online synchronization)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->prefix('sync')->group(function () {
    // Push endpoints (upload offline data to server)
    Route::post('/push/sales', [SyncController::class, 'pushSales']);
    Route::post('/push/job-orders', [SyncController::class, 'pushJobOrders']);
    Route::post('/push/reservations', [SyncController::class, 'pushReservations']);
    Route::post('/push/attendance', [SyncController::class, 'pushAttendance']);

    // Pull endpoints (download data for offline cache)
    Route::get('/pull/categories', [SyncController::class, 'pullCategories']);
    Route::get('/pull/products', [SyncController::class, 'pullProducts']);
    Route::get('/pull/reservations', [SyncController::class, 'pullReservations']);
});

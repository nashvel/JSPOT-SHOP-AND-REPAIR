<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public Portal Routes
Route::get('/', [\App\Http\Controllers\PublicController::class, 'index'])->name('public.index');
Route::get('/track', [\App\Http\Controllers\PublicController::class, 'track'])->name('public.track');
Route::post('/track/search', [\App\Http\Controllers\PublicController::class, 'searchJob'])->name('public.track.search');
Route::post('/reserve', [\App\Http\Controllers\PublicController::class, 'storeReservation'])->name('public.reserve');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', \App\Http\Controllers\DashboardRedirectController::class)->name('dashboard');

    Route::get('/admin/dashboard', [\App\Http\Controllers\Admin\DashboardController::class, 'index'])->name('admin.dashboard');
    Route::post('/admin/dashboard/goal', [\App\Http\Controllers\Admin\DashboardController::class, 'updateGoal'])->name('admin.dashboard.goal.update');

    Route::resource('admin/users', \App\Http\Controllers\Admin\UserController::class)
        ->names('admin.users');

    Route::resource('admin/menus', \App\Http\Controllers\Admin\MenuController::class)
        ->names('admin.menus');
    
    // Menu Access Audit
    Route::get('admin/menus/users', [\App\Http\Controllers\Admin\MenuAccessController::class, 'index'])->name('admin.menus.users.index');
    Route::get('admin/menus/users/{id}', [\App\Http\Controllers\Admin\MenuAccessController::class, 'show'])->name('admin.menus.users.show');

    // File Manager
    Route::get('admin/file-manager', [\App\Http\Controllers\Admin\FileManagerController::class, 'index'])->name('admin.file-manager.index');

    // POS System Routes
    Route::get('admin/pos', function () { return Inertia::render('Admin/POS/Index'); })->name('admin.pos.index');
    Route::get('admin/job-orders', function () { return Inertia::render('Admin/JobOrders/Index'); })->name('admin.job-orders.index');
    
    // Product Management
    Route::get('admin/products', [\App\Http\Controllers\Admin\ProductController::class, 'index'])->name('admin.products.index');
    Route::post('admin/products', [\App\Http\Controllers\Admin\ProductController::class, 'store'])->name('admin.products.store');
    Route::put('admin/products/{product}', [\App\Http\Controllers\Admin\ProductController::class, 'update'])->name('admin.products.update');
    Route::delete('admin/products/{product}', [\App\Http\Controllers\Admin\ProductController::class, 'destroy'])->name('admin.products.destroy');

    Route::get('admin/inventory/stocks', function () { return Inertia::render('Admin/Stocks/Index'); })->name('admin.stocks.index');
    Route::get('admin/branches', function () { return Inertia::render('Admin/Branches/Index'); })->name('admin.branches.index');
    Route::get('admin/settings', function () { return Inertia::render('Admin/Settings/Index'); })->name('admin.settings.index');

    Route::get('/director/dashboard', function () {
        return Inertia::render('Director/Dashboard');
    })->name('director.dashboard');

    Route::get('/overall/dashboard', function () {
        return Inertia::render('Overall/Dashboard');
    })->name('overall.dashboard');

    Route::get('/area/dashboard', function () {
        return Inertia::render('Area/Dashboard');
    })->name('area.dashboard');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

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
Route::get('/receipt/{token}', [\App\Http\Controllers\PublicReceiptController::class, 'show'])->name('public.receipt');
Route::get('/section/{slug}', [\App\Http\Controllers\PublicController::class, 'section'])->name('public.section');
Route::get('/cart', [\App\Http\Controllers\PublicController::class, 'cart'])->name('public.cart');
Route::get('/wishlist', [\App\Http\Controllers\PublicController::class, 'wishlist'])->name('public.wishlist');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', \App\Http\Controllers\DashboardRedirectController::class)->name('dashboard');

    Route::get('/admin/dashboard', [\App\Http\Controllers\Admin\DashboardController::class, 'index'])->name('admin.dashboard');
    Route::post('/admin/dashboard/goal', [\App\Http\Controllers\Admin\DashboardController::class, 'updateGoal'])->name('admin.dashboard.goal.update');

    Route::resource('admin/users', \App\Http\Controllers\Admin\UserController::class)
        ->names('admin.users');

    // Roles Management
    Route::get('admin/roles', [\App\Http\Controllers\Admin\RoleController::class, 'index'])->name('admin.roles.index');
    Route::post('admin/roles', [\App\Http\Controllers\Admin\RoleController::class, 'store'])->name('admin.roles.store');
    Route::put('admin/roles/{role}', [\App\Http\Controllers\Admin\RoleController::class, 'update'])->name('admin.roles.update');
    Route::delete('admin/roles/{role}', [\App\Http\Controllers\Admin\RoleController::class, 'destroy'])->name('admin.roles.destroy');

    Route::resource('admin/menus', \App\Http\Controllers\Admin\MenuController::class)
        ->names('admin.menus');

    // Menu Access Audit
    Route::get('admin/menus/users', [\App\Http\Controllers\Admin\MenuAccessController::class, 'index'])->name('admin.menus.users.index');
    Route::get('admin/menus/users/{id}', [\App\Http\Controllers\Admin\MenuAccessController::class, 'show'])->name('admin.menus.users.show');

    // File Manager
    Route::get('admin/file-manager', [\App\Http\Controllers\Admin\FileManagerController::class, 'index'])->name('admin.file-manager.index');

    // POS System
    Route::get('admin/pos', [\App\Http\Controllers\Admin\SaleController::class, 'create'])->name('admin.pos.index');
    Route::get('admin/job-orders', [\App\Http\Controllers\Admin\JobOrderController::class, 'index'])->name('admin.job-orders.index');
    Route::get('admin/job-orders/{jobOrder}/edit', [\App\Http\Controllers\Admin\JobOrderController::class, 'edit'])->name('admin.job-orders.edit');
    Route::put('admin/job-orders/{jobOrder}', [\App\Http\Controllers\Admin\JobOrderController::class, 'update'])->name('admin.job-orders.update');

    // Sales Management
    Route::get('admin/sales', [\App\Http\Controllers\Admin\SaleController::class, 'index'])->name('admin.sales.index');
    Route::post('admin/sales', [\App\Http\Controllers\Admin\SaleController::class, 'store'])->name('admin.sales.store');
    Route::get('admin/sales/{sale}', [\App\Http\Controllers\Admin\SaleController::class, 'show'])->name('admin.sales.show');

    // Returns Management
    Route::get('admin/returns', [\App\Http\Controllers\Admin\ReturnController::class, 'index'])->name('admin.returns.index');
    Route::post('admin/returns', [\App\Http\Controllers\Admin\ReturnController::class, 'store'])->name('admin.returns.store');
    Route::post('admin/returns/{return}/approve', [\App\Http\Controllers\Admin\ReturnController::class, 'approve'])->name('admin.returns.approve');
    Route::post('admin/returns/{return}/reject', [\App\Http\Controllers\Admin\ReturnController::class, 'reject'])->name('admin.returns.reject');

    // Product & Service Management (no delete here - only in inventory)
    Route::resource('admin/categories', \App\Http\Controllers\Admin\CategoryController::class)->except(['create', 'edit', 'show']);
    Route::get('admin/products', [\App\Http\Controllers\Admin\ProductController::class, 'index'])->name('admin.products.index');
    Route::post('admin/products', [\App\Http\Controllers\Admin\ProductController::class, 'store'])->name('admin.products.store');
    Route::put('admin/products/{product}', [\App\Http\Controllers\Admin\ProductController::class, 'update'])->name('admin.products.update');

    // Inventory Management (products only - add/subtract stock, delete)
    Route::get('admin/inventory/stocks', [\App\Http\Controllers\Admin\InventoryController::class, 'index'])->name('admin.stocks.index');
    Route::post('admin/inventory/stocks/{product}/adjust', [\App\Http\Controllers\Admin\InventoryController::class, 'adjustStock'])->name('admin.stocks.adjust');
    Route::delete('admin/inventory/stocks/{product}', [\App\Http\Controllers\Admin\InventoryController::class, 'destroy'])->name('admin.stocks.destroy');

    // Branch Management
    Route::get('admin/branch-locations', [\App\Http\Controllers\Admin\BranchController::class, 'locations'])->name('admin.branch-locations.index');
    Route::get('admin/branches', [\App\Http\Controllers\Admin\BranchController::class, 'index'])->name('admin.branches.index');
    Route::get('admin/branches/create', [\App\Http\Controllers\Admin\BranchController::class, 'create'])->name('admin.branches.create');
    Route::post('admin/branches', [\App\Http\Controllers\Admin\BranchController::class, 'store'])->name('admin.branches.store');
    Route::get('admin/branches/{branch}/edit', [\App\Http\Controllers\Admin\BranchController::class, 'edit'])->name('admin.branches.edit');
    Route::put('admin/branches/{branch}', [\App\Http\Controllers\Admin\BranchController::class, 'update'])->name('admin.branches.update');
    Route::delete('admin/branches/{branch}', [\App\Http\Controllers\Admin\BranchController::class, 'destroy'])->name('admin.branches.destroy');
    Route::post('admin/branches/{branch}/staff', [\App\Http\Controllers\Admin\BranchController::class, 'addStaff'])->name('admin.branches.staff.add');
    Route::delete('admin/branches/{branch}/staff/{user}', [\App\Http\Controllers\Admin\BranchController::class, 'removeStaff'])->name('admin.branches.staff.remove');
    Route::post('admin/branches/{branch}/staff/{user}/menus', [\App\Http\Controllers\Admin\BranchController::class, 'updateStaffMenus'])->name('admin.branches.staff.menus.update');

    // Mechanics Management
    Route::get('admin/mechanics', [\App\Http\Controllers\Admin\MechanicController::class, 'index'])->name('admin.mechanics.index');
    Route::get('admin/mechanics/create', [\App\Http\Controllers\Admin\MechanicController::class, 'create'])->name('admin.mechanics.create');
    Route::post('admin/mechanics', [\App\Http\Controllers\Admin\MechanicController::class, 'store'])->name('admin.mechanics.store');
    Route::get('admin/mechanics/{mechanic}/edit', [\App\Http\Controllers\Admin\MechanicController::class, 'edit'])->name('admin.mechanics.edit');
    Route::put('admin/mechanics/{mechanic}', [\App\Http\Controllers\Admin\MechanicController::class, 'update'])->name('admin.mechanics.update');
    Route::delete('admin/mechanics/{mechanic}', [\App\Http\Controllers\Admin\MechanicController::class, 'destroy'])->name('admin.mechanics.destroy');
    Route::post('admin/mechanics/{mechanic}/toggle-status', [\App\Http\Controllers\Admin\MechanicController::class, 'toggleStatus'])->name('admin.mechanics.toggle-status');
    Route::get('admin/mechanics/{mechanic}/labor-history', [\App\Http\Controllers\Admin\MechanicController::class, 'laborHistory'])->name('admin.mechanics.labor-history');

    // Analytics & Reports
    Route::get('admin/analytics', [\App\Http\Controllers\Admin\AnalyticsController::class, 'index'])->name('admin.analytics.index');
    Route::get('admin/analytics/inventory', [\App\Http\Controllers\Admin\AnalyticsController::class, 'inventory'])->name('admin.analytics.inventory');
    Route::get('admin/analytics/sales', [\App\Http\Controllers\Admin\AnalyticsController::class, 'sales'])->name('admin.analytics.sales');
    Route::get('admin/analytics/job-orders', [\App\Http\Controllers\Admin\AnalyticsController::class, 'jobOrders'])->name('admin.analytics.job-orders');

    // Super Admin Panel (only accessible by super admins)
    Route::get('admin/super-admin', [\App\Http\Controllers\Admin\SuperAdminController::class, 'index'])->name('admin.super-admin.index');
    Route::post('admin/super-admin', [\App\Http\Controllers\Admin\SuperAdminController::class, 'store'])->name('admin.super-admin.store');
    Route::put('admin/super-admin/{user}', [\App\Http\Controllers\Admin\SuperAdminController::class, 'update'])->name('admin.super-admin.update');
    Route::delete('admin/super-admin/{user}', [\App\Http\Controllers\Admin\SuperAdminController::class, 'destroy'])->name('admin.super-admin.destroy');

    // Impersonation Routes
    Route::post('admin/impersonate/{branch}', [\App\Http\Controllers\Admin\ImpersonationController::class, 'impersonate'])->name('admin.impersonate');
    Route::post('admin/stop-impersonating', [\App\Http\Controllers\Admin\ImpersonationController::class, 'stopImpersonating'])->name('admin.stop-impersonating');

    Route::get('admin/settings', function () {
        return Inertia::render('Admin/Settings/Index');
    })->name('admin.settings.index');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';

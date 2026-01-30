<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use Illuminate\Http\Request;

class ImpersonationController extends Controller
{
    /**
     * Start impersonating a branch
     */
    public function impersonate(Branch $branch)
    {
        // Only allow system admin to impersonate
        $user = auth()->user();

        // Store impersonation in session
        session(['impersonating_branch_id' => $branch->id]);
        session(['impersonating_branch_name' => $branch->name]);

        return redirect()->route('admin.dashboard')
            ->with('success', "Now viewing as {$branch->name}");
    }

    /**
     * Stop impersonating and return to admin view
     */
    public function stopImpersonating()
    {
        session()->forget('impersonating_branch_id');
        session()->forget('impersonating_branch_name');

        return redirect()->route('admin.branches.index')
            ->with('success', 'Returned to System Admin view');
    }
}

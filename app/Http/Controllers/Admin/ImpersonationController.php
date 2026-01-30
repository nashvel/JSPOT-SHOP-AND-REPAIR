<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use Illuminate\Http\Request;

class ImpersonationController extends Controller
{
    /**
     * Start impersonating a branch (Login as a user of that branch)
     */
    public function impersonate(Branch $branch)
    {
        // Only allow system admin to impersonate
        // This check is arguably handled by middleware/routes, but good to have.
        if (auth()->user()->branch_id) {
            return back()->with('error', 'Only System Administrators can impersonate.');
        }

        // Find a suitable user to impersonate for this branch.
        // We prefer a user with a role like 'admin' or 'staff' for that branch.
        // For now, we take the first user associated with the branch.
        $targetUser = $branch->users()->first();

        if (!$targetUser) {
            return back()->with('error', 'No users found for this branch to impersonate.');
        }

        // store original admin id
        session(['impersonator_id' => auth()->id()]);

        // Log in as the target user
        auth()->login($targetUser);
        session()->regenerate();

        return redirect()->route('admin.dashboard')
            ->with('success', "Now logged in as {$targetUser->name} ({$branch->name})");
    }

    /**
     * Stop impersonating and return to admin view
     */
    public function stopImpersonating()
    {
        $impersonatorId = session('impersonator_id');

        if (!$impersonatorId) {
            return redirect()->route('admin.dashboard');
        }

        // Logout current user (impersonated)
        auth()->logout();

        // Login back as original admin
        $originalUser = \App\Models\User::find($impersonatorId);

        if ($originalUser) {
            auth()->login($originalUser);
            session()->regenerate();
            session()->forget('impersonator_id');

            return redirect()->route('admin.branches.index')
                ->with('success', 'Returned to System Admin view');
        }

        // Fallback if original user not found (should be rare)
        return redirect()->route('login')
            ->with('error', 'Original session lost. Please login again.');
    }
}

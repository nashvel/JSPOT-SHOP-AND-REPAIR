<?php

namespace App\Http\Middleware;

use App\Models\Branch;
use App\Models\Menu;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $impersonatingBranchId = $request->session()->get('impersonating_branch_id');
        $impersonatingBranchName = $request->session()->get('impersonating_branch_name');

        // Active branch context - used for filtering data in controllers
        $activeBranchId = null;
        $activeBranchName = null;
        $isSystemAdmin = false;

        // Determine which menus to load and active branch
        $menus = [];
        if ($user) {
            // Load role relationship for all users
            $user->load('role');
            
            // Check if user is system admin (no branch_id)
            $isSystemAdmin = !$user->branch_id;

            if ($impersonatingBranchId) {
                // System admin is impersonating a branch
                $branch = Branch::with('menus')->find($impersonatingBranchId);
                $menus = $branch ? $branch->menus->toArray() : [];
                $activeBranchId = $impersonatingBranchId;
                $activeBranchName = $impersonatingBranchName;

                // Menus are already loaded from the branch relationship
                // No need to merge admin menus to keep the view authentic to the branch

            } elseif ($user->branch_id) {
                // Branch account or staff
                $user->load(['branch.menus', 'menus']);

                // Prioritize user-specific menus if assigned, otherwise fall back to branch menus
                if ($user->menus && $user->menus->count() > 0) {
                    $menus = $user->menus->toArray();
                } else {
                    $menus = $user->branch ? $user->branch->menus->toArray() : [];
                }

                $activeBranchId = $user->branch_id;
                $activeBranchName = $user->branch?->name;

            } else {
                // System admin with no impersonation - load user's assigned menus
                $user->load('menus');
                $menus = $user->menus->toArray();
            }
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
                'menus' => $menus,
                'isSystemAdmin' => $isSystemAdmin,
            ],
            'activeBranch' => [
                'id' => $activeBranchId,
                'name' => $activeBranchName,
            ],
            'impersonating' => [
                'active' => $impersonatingBranchId !== null,
                'branch_id' => $impersonatingBranchId,
                'branch_name' => $impersonatingBranchName,
            ],
            'flash' => [
                'success' => fn() => $request->session()->get('success'),
                'error' => fn() => $request->session()->get('error'),
            ],
        ];
    }
}

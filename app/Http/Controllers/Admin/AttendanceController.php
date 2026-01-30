<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();

        // If user is admin/superadmin, they can select branch. 
        // If branch manager/staff, they are locked to their branch.
        // Assuming roles; for now we'll rely on branch_id passed or default to user's branch.

        $branchId = $request->input('branch_id');

        if (!$branchId) {
            $branchId = $user->branch_id;
        }

        // If still no branch ID (e.g. super admin with no branch), default to first branch or null
        if (!$branchId) {
            $branchId = \App\Models\Branch::first()?->id;
        }

        $date = $request->input('date', now()->format('Y-m-d'));

        $users = [];
        $mechanics = [];

        if ($branchId) {
            $users = \App\Models\User::where('branch_id', $branchId)
                ->with([
                    'attendances' => function ($query) use ($date) {
                        $query->whereDate('date', $date);
                    }
                ])
                ->get()
                ->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'type' => 'App\\Models\\User',
                        'role' => $user->role->name ?? 'Staff',
                        'attendance' => $user->attendances->first(),
                    ];
                });

            $mechanics = \App\Models\Mechanic::where('branch_id', $branchId)
                ->with([
                    'attendances' => function ($query) use ($date) {
                        $query->whereDate('date', $date);
                    }
                ])
                ->get()
                ->map(function ($mechanic) {
                    return [
                        'id' => $mechanic->id,
                        'name' => $mechanic->name,
                        'type' => 'App\\Models\\Mechanic',
                        'role' => 'Mechanic',
                        'attendance' => $mechanic->attendances->first(),
                    ];
                });
        }

        return inertia('Admin/Attendance/Index', [
            'users' => $users,
            'mechanics' => $mechanics,
            'branches' => \App\Models\Branch::all(['id', 'name']),
            'filters' => [
                'branch_id' => (int) $branchId,
                'date' => $date,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'attendable_id' => 'required',
            'attendable_type' => 'required',
            'date' => 'required|date',
            'status' => 'required|string',
            'time_in' => 'nullable',
            'time_out' => 'nullable',
            'remarks' => 'nullable|string',
        ]);

        \App\Models\Attendance::updateOrCreate(
            [
                'attendable_id' => $validated['attendable_id'],
                'attendable_type' => $validated['attendable_type'],
                'date' => $validated['date'],
            ],
            [
                'branch_id' => $validated['branch_id'],
                'status' => $validated['status'],
                'time_in' => $validated['time_in'],
                'time_out' => $validated['time_out'],
                'remarks' => $validated['remarks'],
            ]
        );

        return back()->with('success', 'Attendance updated successfully.');
    }
}

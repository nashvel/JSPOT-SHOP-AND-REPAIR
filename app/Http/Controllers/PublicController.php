<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Product;
use App\Models\JobOrder;
use App\Models\Reservation;
use App\Http\Requests\StoreReservationRequest;
use App\Http\Requests\TrackJobRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Route;

class PublicController extends Controller
{
    public function index(Request $request)
    {
        $branchName = $request->query('branch');
        $branch = $branchName ? Branch::where('name', $branchName)->first() : null;
        
        if (!$branchName) {
            $products = collect([]);
        } else {
            $products = Product::query()
                ->whereHas('branches', function ($q) use ($branchName) {
                    $q->where('branches.name', $branchName);
                })
                ->with(['branches' => function ($q) {
                    $q->select('branches.id', 'name')->withPivot('stock_quantity');
                }])
                ->get();
        }

        // Fetch product sections with pinned products
        $sections = \App\Models\ProductSection::orderBy('order')
            ->get()
            ->map(function ($section) use ($branch) {
                $pinnedProducts = $section->products()
                    ->when($branch, function ($query) use ($branch) {
                        // Get products pinned to this section for this branch OR site-wide
                        $query->where(function($q) use ($branch) {
                            $q->where('product_section_pins.branch_id', $branch->id)
                              ->orWhereNull('product_section_pins.branch_id');
                        });
                    }, function ($query) {
                        // No branch selected, show only site-wide pins
                        $query->whereNull('product_section_pins.branch_id');
                    })
                    ->with(['branches' => function($q) {
                        $q->select('branches.id', 'name')->withPivot('stock_quantity');
                    }])
                    ->get();

                return [
                    'id' => $section->id,
                    'name' => $section->name,
                    'slug' => $section->slug,
                    'description' => $section->description,
                    'products' => $pinnedProducts
                ];
            });

        // Get company email from settings
        $companyEmail = \App\Models\Setting::where('key', 'company_email')->value('value') ?? 'info@jspotmotors.com';
        
        // Get theme colors from settings
        $themeColors = [
            'primary' => \App\Models\Setting::where('key', 'theme_primary_color')->value('value') ?? 'purple',
            'secondary' => \App\Models\Setting::where('key', 'theme_secondary_color')->value('value') ?? 'gray',
            'accent' => \App\Models\Setting::where('key', 'theme_accent_color')->value('value') ?? 'red',
        ];

        // Get site tagline from settings
        $tagline = \App\Models\Setting::where('key', 'site_tagline')->value('value') ?? 'Your Trusted Auto Parts Dealer';

        // Fetch global search index (all products with branches)
        $searchIndex = Product::with(['branches' => function ($q) {
            $q->select('branches.id', 'name');
        }])->select('id', 'name', 'price', 'description')->get();

        return Inertia::render('Public/Index', [
            'products' => $products,
            'searchIndex' => $searchIndex,
            'sections' => $sections,
            'branches' => Branch::select('id', 'name', 'contact_number')->get(),
            'currentBranch' => $branchName,
            'companyEmail' => $companyEmail,
            'themeColors' => $themeColors,
            'tagline' => $tagline,
            'canLogin' => Route::has('login'),
        ]);
    }

    public function section(Request $request, $slug)
    {
        $branchName = $request->query('branch');
        $branch = $branchName ? Branch::where('name', $branchName)->first() : null;

        $section = \App\Models\ProductSection::where('slug', $slug)->firstOrFail();

        if (!$branch) {
            $products = collect([]);
        } else {
            $products = $section->products()
                ->where(function ($q) use ($branch) {
                    $q->where('product_section_pins.branch_id', $branch->id)
                        ->orWhereNull('product_section_pins.branch_id');
                })
                ->with(['branches' => function ($q) {
                    $q->select('branches.id', 'name')->withPivot('stock_quantity');
                }])
                ->get();
        }

        // Get company email from settings
        $companyEmail = \App\Models\Setting::where('key', 'company_email')->value('value') ?? 'info@jspotmotors.com';
        
        // Get theme colors from settings
        $themeColors = [
            'primary' => \App\Models\Setting::where('key', 'theme_primary_color')->value('value') ?? 'purple',
            'secondary' => \App\Models\Setting::where('key', 'theme_secondary_color')->value('value') ?? 'gray',
            'accent' => \App\Models\Setting::where('key', 'theme_accent_color')->value('value') ?? 'red',
        ];

        // Get site tagline from settings
        $tagline = \App\Models\Setting::where('key', 'site_tagline')->value('value') ?? 'Your Trusted Auto Parts Dealer';

        // Fetch global search index (all products with branches)
        $searchIndex = \App\Models\Product::with(['branches' => function ($q) {
            $q->select('branches.id', 'name');
        }])->select('id', 'name', 'price', 'description')->get();

        return Inertia::render('Public/Section', [
            'section' => $section,
            'products' => $products,
            'searchIndex' => $searchIndex,
            'branches' => Branch::select('id', 'name', 'contact_number')->get(),
            'currentBranch' => $branchName,
            'companyEmail' => $companyEmail,
            'themeColors' => $themeColors,
            'tagline' => $tagline,
            'canLogin' => Route::has('login'),
        ]);
    }

    public function track()
    {
        return Inertia::render('Public/Tracker');
    }

    public function searchJob(TrackJobRequest $request)
    {
        $job = JobOrder::where('tracking_code', $request->tracking_code)
            ->with('branch:id,name')
            ->first();

        // Since validation passes, we know tracking_code exists, 
        // but double check if it returns a model just in case of race condition or soft deletes logic
        if (!$job) {
             return back()->withErrors(['tracking_code' => 'Job order not found.']);
        }

        return back()->with('job', $job);
    }

    public function storeReservation(StoreReservationRequest $request)
    {
        $validated = $request->validated();

        Reservation::create([
            'branch_id' => $validated['branch_id'],
            'customer_name' => $validated['customer_name'],
            'customer_contact' => $validated['customer_contact'],
            'items' => $validated['items'],
            'status' => 'pending'
        ]);

        return back()->with('success', 'Reservation submitted successfully!');
    }

    public function cart()
    {
        $branches = Branch::select('id', 'name', 'contact_number')->get();
        $companyEmail = \App\Models\Setting::where('key', 'company_email')->value('value') ?? 'info@jspotmotors.com';
        $themeColors = [
            'primary' => \App\Models\Setting::where('key', 'theme_primary_color')->value('value') ?? 'purple',
            'secondary' => \App\Models\Setting::where('key', 'theme_secondary_color')->value('value') ?? 'gray',
            'accent' => \App\Models\Setting::where('key', 'theme_accent_color')->value('value') ?? 'red',
        ];
        $tagline = \App\Models\Setting::where('key', 'site_tagline')->value('value') ?? 'Your Trusted Auto Parts Dealer';

        return Inertia::render('Public/Cart', [
            'branches' => $branches,
            'companyEmail' => $companyEmail,
            'themeColors' => $themeColors,
            'tagline' => $tagline,
        ]);
    }

    public function wishlist()
    {
        $branches = Branch::select('id', 'name', 'contact_number')->get();
        $companyEmail = \App\Models\Setting::where('key', 'company_email')->value('value') ?? 'info@jspotmotors.com';
        $themeColors = [
            'primary' => \App\Models\Setting::where('key', 'theme_primary_color')->value('value') ?? 'purple',
            'secondary' => \App\Models\Setting::where('key', 'theme_secondary_color')->value('value') ?? 'gray',
            'accent' => \App\Models\Setting::where('key', 'theme_accent_color')->value('value') ?? 'red',
        ];
        $tagline = \App\Models\Setting::where('key', 'site_tagline')->value('value') ?? 'Your Trusted Auto Parts Dealer';

        return Inertia::render('Public/Wishlist', [
            'branches' => $branches,
            'companyEmail' => $companyEmail,
            'themeColors' => $themeColors,
            'tagline' => $tagline,
        ]);
    }
}

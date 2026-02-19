<?php

namespace App\Http\Controllers;

use App\Jobs\GenerateReportJob;
use App\Models\Report;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(): Response
    {
        $reports = Report::with('project')
            ->orderBy('last_generated_at', 'desc')
            ->get()
            ->groupBy('project_id')
            ->map(fn($projectReports) => $projectReports->first());

        return Inertia::render('Reports/Index', [
            'reports' => $reports->values(),
        ]);
    }

    public function generate(): RedirectResponse
    {
        GenerateReportJob::dispatch();

        return back()->with('success', 'Report generation job has been queued.');
    }
}
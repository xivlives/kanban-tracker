<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $projects = Project::withCount([
            'tasks',
            'tasks as pending_tasks_count' => fn($query) => $query->where('status', 'pending'),
            'tasks as in_progress_tasks_count' => fn($query) => $query->where('status', 'in-progress'),
            'tasks as done_tasks_count' => fn($query) => $query->where('status', 'done'),
        ])->get();

        return Inertia::render('Dashboard', [
            'projects' => $projects,
        ]);
    }
}
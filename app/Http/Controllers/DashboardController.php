<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    public function index(): Response
    {
        Log::info('Dashboard accessed');
        
        $projects = Project::withCount([
            'tasks',
            'tasks as pending_tasks_count' => fn($query) => $query->where('status', 'pending'),
            'tasks as in_progress_tasks_count' => fn($query) => $query->where('status', 'in-progress'),
            'tasks as done_tasks_count' => fn($query) => $query->where('status', 'done'),
        ])->get();

        Log::info('Projects loaded', ['count' => $projects->count()]);

        $myTasks = \App\Models\Task::where('assigned_to', auth()->id())
            ->where('status', '!=', 'done')
            ->with('project')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Dashboard', [
            'projects' => $projects,
            'myTasks' => $myTasks,
        ]);
    }
}
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
        $team = auth()->user()->currentTeam();
        $projectIds = $team ? $team->projects()->pluck('id') : collect();

        $projects = Project::whereIn('id', $projectIds)
            ->withCount([
                'tasks',
                'tasks as pending_tasks_count' => fn($query) => $query->where('status', 'pending'),
                'tasks as in_progress_tasks_count' => fn($query) => $query->where('status', 'in-progress'),
                'tasks as in_review_tasks_count' => fn($query) => $query->where('status', 'in-review'),
                'tasks as done_tasks_count' => fn($query) => $query->where('status', 'done'),
            ])->get();

        // My open tasks within the current team.
        $myTasks = \App\Models\Task::where('assigned_to', auth()->id())
            ->whereIn('project_id', $projectIds)
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
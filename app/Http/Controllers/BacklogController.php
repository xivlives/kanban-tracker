<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BacklogController extends Controller
{
    /**
     * The Backlog shows all tasks across the user's projects that are still
     * in "pending" status — essentially work that hasn't been started yet.
     * Users can drag tasks from here into the board or bulk-manage them.
     */
    public function index(Request $request): Response
    {
        $team = $request->user()->currentTeam();
        $projectIds = $team ? $team->projects()->pluck('id') : collect();

        $tasks = Task::whereIn('project_id', $projectIds)
            ->where('status', 'pending')
            ->with(['project:id,name', 'assignedUser:id,name'])
            ->orderBy('sort_order', 'asc')
            ->orderBy('created_at', 'desc')
            ->get();

        $labels = Task::whereIn('project_id', $projectIds)
            ->whereNotNull('label')
            ->distinct()
            ->pluck('label')
            ->sort()
            ->values();

        $projects = $team ? $team->projects()->get(['id', 'name']) : collect();

        return Inertia::render('Backlog/Index', [
            'tasks' => $tasks,
            'labels' => $labels,
            'projects' => $projects,
        ]);
    }
}

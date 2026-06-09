<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class IssueController extends Controller
{
    /**
     * Issues view — a flat, filterable list of ALL tasks across all of the
     * user's projects (like Jira's Issues page). Supports server-side
     * filtering by status, label, assignee, priority, and project.
     */
    public function index(Request $request): Response
    {
        $team = $request->user()->currentTeam();
        $projectIds = $team ? $team->projects()->pluck('id') : collect();

        $query = Task::whereIn('project_id', $projectIds)
            ->with(['project:id,name', 'assignedUser:id,name']);

        // Filters
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }
        if ($request->filled('label')) {
            $query->where('label', $request->input('label'));
        }
        if ($request->filled('priority')) {
            $query->where('priority', $request->input('priority'));
        }
        if ($request->filled('assigned_to')) {
            $query->where('assigned_to', $request->input('assigned_to'));
        }
        if ($request->filled('project_id')) {
            $query->where('project_id', $request->input('project_id'));
        }
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('task_key', 'like', "%{$search}%");
            });
        }

        $tasks = $query->orderBy('created_at', 'desc')->paginate(50)->withQueryString();

        // Filter options
        $labels = Task::whereIn('project_id', $projectIds)
            ->whereNotNull('label')
            ->distinct()
            ->pluck('label')
            ->sort()
            ->values();

        $projects = $team ? $team->projects()->get(['id', 'name']) : collect();

        // Assignee filter options = the current team's members.
        $users = $team ? $team->users()->get(['users.id', 'users.name']) : collect();

        return Inertia::render('Issues/Index', [
            'tasks'    => $tasks,
            'labels'   => $labels,
            'projects' => $projects,
            'users'    => $users,
            'filters'  => $request->only(['status', 'label', 'priority', 'assigned_to', 'project_id', 'search']),
        ]);
    }
}

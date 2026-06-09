<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function index(Request $request): Response
    {
        $team = $request->user()->currentTeam();
        $projects = $team ? $team->projects()->withCount('tasks')->get() : collect();

        return Inertia::render('Projects/Index', [
            'projects' => $projects,
        ]);
    }

    public function show(Project $project): Response
    {
        abort_unless(auth()->user()->belongsToTeam($project->team), 403);

        $tasks = $project->tasks()
            ->with('assignedUser')
            ->orderBy('sort_order', 'asc')
            ->get()
            ->groupBy('status');

        // Assignee options are scoped to the project's team members.
        $users = $project->team->users()->get(['users.id', 'users.name', 'users.email']);

        // Collect all distinct labels used in this project for the filter dropdown
        $labels = $project->tasks()
            ->whereNotNull('label')
            ->distinct()
            ->pluck('label')
            ->sort()
            ->values();

        return Inertia::render('Projects/Show', [
            'project' => $project,
            'tasks' => [
                'pending'     => $tasks->get('pending', collect())->values(),
                'in-progress' => $tasks->get('in-progress', collect())->values(),
                'in-review'   => $tasks->get('in-review', collect())->values(),
                'done'        => $tasks->get('done', collect())->values(),
            ],
            'users' => $users,
            'labels' => $labels,
        ]);
    }

    /** Summary: project overview — counts, progress, breakdowns, recent activity. */
    public function summary(Project $project): Response
    {
        abort_unless(auth()->user()->belongsToTeam($project->team), 403);

        $tasks = $project->tasks()->with('assignedUser')->get();

        $byStatus = $tasks->groupBy('status')->map->count();
        $byPriority = $tasks->groupBy('priority')->map->count();
        $byAssignee = $tasks->groupBy(fn ($t) => $t->assignedUser?->name ?? 'Unassigned')->map->count();
        $done = (int) ($byStatus['done'] ?? 0);

        return Inertia::render('Projects/Summary', [
            'project' => $project,
            'stats' => [
                'total' => $tasks->count(),
                'done' => $done,
                'in_progress' => (int) ($byStatus['in-progress'] ?? 0),
                'todo' => (int) ($byStatus['pending'] ?? 0),
                'in_review' => (int) ($byStatus['in-review'] ?? 0),
                'progress' => $tasks->count() ? (int) round($done / $tasks->count() * 100) : 0,
            ],
            'byStatus' => $byStatus,
            'byPriority' => $byPriority,
            'byAssignee' => $byAssignee,
            'recent' => $tasks->sortByDesc('updated_at')->take(6)->values(),
        ]);
    }

    /** Timeline (roadmap) — backed by due/created dates. */
    public function timeline(Project $project): Response
    {
        abort_unless(auth()->user()->belongsToTeam($project->team), 403);

        $tasks = $project->tasks()->with('assignedUser')->orderBy('due_date')->get();

        return Inertia::render('Projects/Timeline', [
            'project' => $project,
            'tasks' => $tasks,
        ]);
    }

    /** Backlog: everything not yet Done, prioritised. */
    public function backlog(Project $project): Response
    {
        abort_unless(auth()->user()->belongsToTeam($project->team), 403);

        $tasks = $project->tasks()
            ->with('assignedUser')
            ->where('status', '!=', 'done')
            ->orderByRaw("FIELD(priority,'urgent','high','medium','low')")
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('Projects/Backlog', [
            'project' => $project,
            'tasks' => $tasks,
        ]);
    }

    /** Calendar/agenda: tasks that have a due date. */
    public function calendar(Project $project): Response
    {
        abort_unless(auth()->user()->belongsToTeam($project->team), 403);

        $tasks = $project->tasks()
            ->with('assignedUser')
            ->whereNotNull('due_date')
            ->orderBy('due_date')
            ->get();

        return Inertia::render('Projects/Calendar', [
            'project' => $project,
            'tasks' => $tasks,
        ]);
    }

    /** Flat list (table) of every task in the project. */
    public function list(Project $project): Response
    {
        abort_unless(auth()->user()->belongsToTeam($project->team), 403);

        $tasks = $project->tasks()
            ->with('assignedUser')
            ->orderByRaw("FIELD(status,'pending','in-progress','in-review','done')")
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('Projects/List', [
            'project' => $project,
            'tasks' => $tasks,
        ]);
    }

    /** Goals — placeholder until a goals model exists. */
    public function goals(Project $project): Response
    {
        abort_unless(auth()->user()->belongsToTeam($project->team), 403);

        return Inertia::render('Projects/Goals', [
            'project' => $project,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $team = $request->user()->currentTeam();
        $project = $team->projects()->create(array_merge($validated, [
            'user_id' => $request->user()->id,
        ]));

        return redirect()->route('projects.show', $project)
            ->with('success', 'Project created successfully.');
    }

    public function update(Request $request, Project $project): RedirectResponse
    {
        abort_unless(auth()->user()->belongsToTeam($project->team), 403);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $project->update($validated);

        return back()->with('success', 'Project updated successfully.');
    }

    public function destroy(Project $project): RedirectResponse
    {
        abort_unless(auth()->user()->belongsToTeam($project->team), 403);

        $project->delete();

        return redirect()->route('dashboard')
            ->with('success', 'Project deleted successfully.');
    }
}
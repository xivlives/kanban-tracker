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
        $projects = $request->user()->projects()->withCount('tasks')->get();

        return Inertia::render('Projects/Index', [
            'projects' => $projects,
        ]);
    }

    public function show(Project $project): Response
    {
        abort_unless($project->user_id === auth()->id(), 403);

        $tasks = $project->tasks()
            ->with('assignedUser')
            ->orderBy('sort_order', 'asc')
            ->get()
            ->groupBy('status');

        $users = User::select('id', 'name', 'email')->get();

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

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $project = $request->user()->projects()->create($validated);

        return redirect()->route('projects.show', $project)
            ->with('success', 'Project created successfully.');
    }

    public function update(Request $request, Project $project): RedirectResponse
    {
        abort_unless($project->user_id === auth()->id(), 403);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $project->update($validated);

        return back()->with('success', 'Project updated successfully.');
    }

    public function destroy(Project $project): RedirectResponse
    {
        abort_unless($project->user_id === auth()->id(), 403);

        $project->delete();

        return redirect()->route('dashboard')
            ->with('success', 'Project deleted successfully.');
    }
}
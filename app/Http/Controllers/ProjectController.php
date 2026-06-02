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
        // Only the authenticated user's projects (also enforced by the model's global scope).
        $projects = $request->user()->projects()->withCount('tasks')->get();

        return Inertia::render('Projects/Index', [
            'projects' => $projects,
        ]);
    }

    public function show(Project $project): Response
    {
        // The 'owner' global scope already 404s another user's project on route binding;
        // this is an explicit defence-in-depth guard.
        abort_unless($project->user_id === auth()->id(), 403);

        $tasks = $project->tasks()
            ->with('assignedUser')
            ->orderBy('created_at', 'desc')
            ->get()
            ->groupBy('status');

        $users = User::select('id', 'name')->get();

        return Inertia::render('Projects/Show', [
            'project' => $project,
            'tasks' => [
                'pending' => $tasks->get('pending', collect())->values(),
                'in-progress' => $tasks->get('in-progress', collect())->values(),
                'done' => $tasks->get('done', collect())->values(),
            ],
            'users' => $users,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        // Always own the project to the authenticated user.
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
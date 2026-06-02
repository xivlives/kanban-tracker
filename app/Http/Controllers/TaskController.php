<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Services\TaskService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function __construct(
        protected TaskService $taskService
    ) {}

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:pending,in-progress,done',
            'assigned_to' => 'nullable|exists:users,id',
            'due_date' => 'nullable|date',
        ]);

        // 'exists' validation bypasses Eloquent global scopes, so confirm the target
        // project actually belongs to the authenticated user (404s otherwise).
        $request->user()->projects()->findOrFail($validated['project_id']);

        $this->taskService->createTask($validated);

        return back()->with('success', 'Task created successfully.');
    }

    public function update(Request $request, Task $task): RedirectResponse
    {
        $this->authorizeTaskOwnership($request, $task);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|required|in:pending,in-progress,done',
            'assigned_to' => 'nullable|exists:users,id',
            'due_date' => 'nullable|date',
        ]);

        $this->taskService->updateTask($task, $validated);

        return back()->with('success', 'Task updated successfully.');
    }

    public function updateStatus(Request $request, Task $task): RedirectResponse
    {
        $this->authorizeTaskOwnership($request, $task);

        $validated = $request->validate([
            'status' => 'required|in:pending,in-progress,done',
        ]);

        $this->taskService->updateTaskStatus($task, $validated['status']);

        return back();
    }

    public function destroy(Request $request, Task $task): RedirectResponse
    {
        $this->authorizeTaskOwnership($request, $task);

        $this->taskService->deleteTask($task);

        return back()->with('success', 'Task deleted successfully.');
    }

    /**
     * A task belongs to a user only through its project. Tasks have no global scope,
     * so a direct /tasks/{task} URL must be checked against the user's own projects.
     */
    protected function authorizeTaskOwnership(Request $request, Task $task): void
    {
        abort_unless(
            $request->user()->projects()->whereKey($task->project_id)->exists(),
            403
        );
    }
}
<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use App\Services\TaskService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function __construct(
        protected TaskService $taskService
    ) {}

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'project_id'  => 'required|exists:projects,id',
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'status'      => 'required|in:pending,in-progress,in-review,done',
            'label'       => 'nullable|string|max:50',
            'priority'    => 'nullable|in:low,medium,high,urgent',
            'assigned_to' => 'nullable|exists:users,id',
            'due_date'    => 'nullable|date',
        ]);

        // Team-scoped: findOrFail honours the Project global scope (404 if not in
        // one of the user's teams). Assignee must belong to that project's team.
        $project = Project::findOrFail($validated['project_id']);
        $this->assertAssigneeInTeam($project, $validated['assigned_to'] ?? null);

        $this->taskService->createTask($validated);

        return back()->with('success', 'Task created successfully.');
    }

    public function update(Request $request, Task $task): RedirectResponse
    {
        $this->authorizeTaskOwnership($request, $task);

        $validated = $request->validate([
            'title'       => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'status'      => 'sometimes|required|in:pending,in-progress,in-review,done',
            'label'       => 'nullable|string|max:50',
            'priority'    => 'nullable|in:low,medium,high,urgent',
            'assigned_to' => 'nullable|exists:users,id',
            'due_date'    => 'nullable|date',
        ]);

        $this->assertAssigneeInTeam($task->project, $validated['assigned_to'] ?? null);

        $this->taskService->updateTask($task, $validated);

        return back()->with('success', 'Task updated successfully.');
    }

    public function updateStatus(Request $request, Task $task): RedirectResponse
    {
        $this->authorizeTaskOwnership($request, $task);

        $validated = $request->validate([
            'status' => 'required|in:pending,in-progress,in-review,done',
        ]);

        $this->taskService->updateTaskStatus($task, $validated['status']);

        return back();
    }

    /**
     * Reorder tasks within a column after a drag & drop.
     * Accepts an array of { id, sort_order } for the destination column.
     */
    public function reorder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tasks'              => 'required|array',
            'tasks.*.id'         => 'required|integer|exists:tasks,id',
            'tasks.*.sort_order' => 'required|integer|min:0',
        ]);

        foreach ($validated['tasks'] as $item) {
            $task = Task::find($item['id']);
            if ($task) {
                // Verify access through the project's team (global scope applies)
                $ownsProject = Project::whereKey($task->project_id)->exists();
                if ($ownsProject) {
                    $task->update(['sort_order' => $item['sort_order']]);
                }
            }
        }

        return response()->json(['status' => 'ok']);
    }

    public function destroy(Request $request, Task $task): RedirectResponse
    {
        $this->authorizeTaskOwnership($request, $task);

        $this->taskService->deleteTask($task);

        return back()->with('success', 'Task deleted successfully.');
    }

    protected function authorizeTaskOwnership(Request $request, Task $task): void
    {
        // Project global scope means this only matches projects in the user's teams.
        abort_unless(Project::whereKey($task->project_id)->exists(), 403);
    }

    /** A task's assignee, if set, must be a member of the project's team. */
    protected function assertAssigneeInTeam(Project $project, $assigneeId): void
    {
        if (! empty($assigneeId)) {
            abort_unless(
                $project->team->users()->whereKey($assigneeId)->exists(),
                422,
                'Assignee must be a member of this project\'s team.'
            );
        }
    }
}
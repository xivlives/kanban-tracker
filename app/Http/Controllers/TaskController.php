<?php

namespace App\Http\Controllers;

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

        $request->user()->projects()->findOrFail($validated['project_id']);

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
                // Verify ownership through project
                $ownsProject = $request->user()->projects()->whereKey($task->project_id)->exists();
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
        abort_unless(
            $request->user()->projects()->whereKey($task->project_id)->exists(),
            403
        );
    }
}
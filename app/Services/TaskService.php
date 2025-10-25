<?php

namespace App\Services;

use App\Models\Task;
use Illuminate\Support\Facades\Log;

class TaskService
{
    public function createTask(array $data): Task
    {
        Log::info('Creating task', ['data' => $data]);
        
        $task = Task::create($data);
        
        Log::info('Task created successfully', ['task_id' => $task->id]);
        
        return $task->load(['project', 'assignedUser']);
    }

    public function updateTask(Task $task, array $data): Task
    {
        Log::info('Updating task', ['task_id' => $task->id, 'data' => $data]);
        
        $task->update($data);
        
        Log::info('Task updated successfully', ['task_id' => $task->id]);
        
        return $task->fresh(['project', 'assignedUser']);
    }

    public function updateTaskStatus(Task $task, string $status): Task
    {
        Log::info('Updating task status', [
            'task_id' => $task->id,
            'old_status' => $task->status,
            'new_status' => $status
        ]);
        
        $task->update(['status' => $status]);
        
        Log::info('Task status updated successfully', ['task_id' => $task->id]);
        
        return $task->fresh(['project', 'assignedUser']);
    }

    public function deleteTask(Task $task): bool
    {
        Log::info('Deleting task', ['task_id' => $task->id]);
        
        $deleted = $task->delete();
        
        Log::info('Task deleted successfully', ['task_id' => $task->id]);
        
        return $deleted;
    }
}
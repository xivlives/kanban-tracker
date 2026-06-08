<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'title',
        'description',
        'status',
        'label',
        'task_key',
        'priority',
        'sort_order',
        'assigned_to',
        'due_date',
        'source_app',
        'source_ref',
        'external_id',
    ];

    protected $casts = [
        'due_date' => 'date',
        'source_ref' => 'array',
        'sort_order' => 'integer',
    ];

    /**
     * Auto-generate a human-readable task_key on creation (e.g. PRJ-001).
     */
    protected static function booted(): void
    {
        static::creating(function (Task $task) {
            if (empty($task->task_key) && $task->project_id) {
                $project = Project::find($task->project_id);
                if ($project) {
                    // Build prefix from first 3 uppercase chars of project name
                    $prefix = strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $project->name), 0, 3));
                    if (strlen($prefix) < 2) {
                        $prefix = strtoupper(substr($project->name, 0, 3));
                    }

                    // Find the next sequential number for this project
                    $maxKey = static::where('project_id', $task->project_id)
                        ->whereNotNull('task_key')
                        ->count();

                    $task->task_key = $prefix . '-' . ($maxKey + 1);
                }
            }

            // Auto-set sort_order to end of column
            if ($task->sort_order === 0 || $task->sort_order === null) {
                $maxOrder = static::where('project_id', $task->project_id)
                    ->where('status', $task->status ?? 'pending')
                    ->max('sort_order');
                $task->sort_order = ($maxOrder ?? 0) + 1;
            }
        });
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'total_tasks',
        'completed_tasks',
        'pending_tasks',
        'in_progress_tasks',
        'last_generated_at',
    ];

    protected $casts = [
        'last_generated_at' => 'datetime',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }
}
<?php

namespace App\Services;

use App\Models\Project;
use App\Models\Report;
use Illuminate\Support\Facades\Log;

class ReportService
{
    public function generateReportForProject(Project $project): Report
    {
        Log::info('Generating report for project', ['project_id' => $project->id]);
        
        $taskStats = $this->aggregateTaskStats($project);
        
        $report = Report::updateOrCreate(
            ['project_id' => $project->id],
            [
                'total_tasks' => $taskStats['total'],
                'completed_tasks' => $taskStats['completed'],
                'pending_tasks' => $taskStats['pending'],
                'in_progress_tasks' => $taskStats['in_progress'],
                'last_generated_at' => now(),
            ]
        );
        
        Log::info('Report generated successfully', [
            'project_id' => $project->id,
            'report_id' => $report->id,
            'stats' => $taskStats
        ]);
        
        return $report;
    }

    public function generateAllReports(): array
    {
        Log::info('Generating reports for all projects');
        
        $projects = Project::all();
        $reports = [];
        
        foreach ($projects as $project) {
            $reports[] = $this->generateReportForProject($project);
        }
        
        Log::info('All reports generated successfully', ['count' => count($reports)]);
        
        return $reports;
    }

    protected function aggregateTaskStats(Project $project): array
    {
        $tasks = $project->tasks;
        
        return [
            'total' => $tasks->count(),
            'completed' => $tasks->where('status', 'done')->count(),
            'pending' => $tasks->where('status', 'pending')->count(),
            'in_progress' => $tasks->where('status', 'in-progress')->count(),
        ];
    }
}
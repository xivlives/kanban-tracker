<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Inbound integration API for MeenitsApp.
 *
 * Authenticated by a Sanctum personal access token the MeenitsTrac user pastes
 * into their MeenitsApp org integration settings. MeenitsApp pushes meeting
 * action items here; they land as kanban tasks in the user's "Action Items from
 * Meenits" project. Idempotent on `external_id` so re-pushes update, not duplicate.
 */
class TaskIntegrationController extends Controller
{
    private const DEFAULT_PROJECT = 'Action Items from Meenits';

    /** Identify the token owner — used by MeenitsApp to validate a pasted token. */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'product' => 'meenitstrac',
        ]);
    }

    /** Create/update kanban tasks from a batch of meeting action items. */
    public function bulkTasks(Request $request): JsonResponse
    {
        $data = $request->validate([
            'tasks' => ['required', 'array', 'min:1', 'max:100'],
            'tasks.*.title' => ['required', 'string', 'max:255'],
            'tasks.*.description' => ['nullable', 'string'],
            'tasks.*.status' => ['nullable', 'in:pending,in-progress,done'],
            'tasks.*.due_date' => ['nullable', 'date'],
            'tasks.*.external_id' => ['nullable', 'string', 'max:191'],
            'tasks.*.source_ref' => ['nullable', 'array'],
            // Optional project name override; defaults to the Meenits inbox project.
            'project' => ['nullable', 'string', 'max:255'],
        ]);

        $tokenUser = $request->user();
        // Pushed action items land in the token user's current team (their personal
        // workspace by default). The Project 'team' global scope keys off the web
        // guard, which is absent on a token request, so we bypass it explicitly.
        $team = $tokenUser->currentTeam();

        $project = Project::withoutGlobalScope('team')->firstOrCreate(
            ['team_id' => $team->id, 'name' => $data['project'] ?? self::DEFAULT_PROJECT],
            ['user_id' => $tokenUser->id, 'description' => 'Action items synced from your Meenits meetings.'],
        );

        $results = [];
        foreach ($data['tasks'] as $t) {
            $attrs = [
                'title' => $t['title'],
                'description' => $t['description'] ?? null,
                'status' => $t['status'] ?? 'pending',
                'due_date' => $t['due_date'] ?? null,
                'source_app' => 'meenits',
                'source_ref' => $t['source_ref'] ?? null,
                'external_id' => $t['external_id'] ?? null,
            ];

            $existing = ! empty($t['external_id'])
                ? Task::where('project_id', $project->id)->where('external_id', $t['external_id'])->first()
                : null;

            if ($existing) {
                $existing->update($attrs);
                $results[] = ['id' => $existing->id, 'action' => 'updated', 'external_id' => $existing->external_id];
            } else {
                $task = $project->tasks()->create($attrs);
                $results[] = ['id' => $task->id, 'action' => 'created', 'external_id' => $task->external_id];
            }
        }

        return response()->json([
            'project' => ['id' => $project->id, 'name' => $project->name],
            'board_url' => url('/projects/' . $project->id),
            'tasks' => $results,
            'count' => count($results),
        ], 201);
    }
}

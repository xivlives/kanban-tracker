<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Task;
use App\Models\Team;
use App\Models\User;
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
            'tasks.*.status' => ['nullable', 'in:pending,in-progress,in-review,done'],
            'tasks.*.due_date' => ['nullable', 'date'],
            'tasks.*.external_id' => ['nullable', 'string', 'max:191'],
            'tasks.*.source_ref' => ['nullable', 'array'],
            'tasks.*.assignee_email' => ['nullable', 'email', 'max:255'],
            'tasks.*.assignee_name' => ['nullable', 'string', 'max:255'],
            // Exact assignee match by Meenits identity (preferred over email).
            'tasks.*.assignee_meenits_user_id' => ['nullable', 'integer'],
            // Optional project name override; defaults to the Meenits inbox project.
            'project' => ['nullable', 'string', 'max:255'],
            // Source Meenits workspace — routes tasks to the matching Trac team
            // (personal → owner's personal team; team → a team keyed by the org uuid).
            'workspace' => ['nullable', 'array'],
            'workspace.meenits_org_uuid' => ['nullable', 'string', 'max:191'],
            'workspace.type' => ['nullable', 'in:personal,team'],
            'workspace.name' => ['nullable', 'string', 'max:255'],
        ]);

        $tokenUser = $request->user();
        // Route to the Trac team that mirrors the source Meenits workspace (auto-
        // provisioned for team orgs). Falls back to the token user's personal team
        // for personal workspaces or legacy pushes with no workspace descriptor.
        $team = $this->resolveTargetTeam($tokenUser, $data['workspace'] ?? null);

        // The Project 'team' global scope keys off the web guard, which is absent on a
        // token request, so we bypass it explicitly.
        $project = Project::withoutGlobalScope('team')->firstOrCreate(
            ['team_id' => $team->id, 'name' => $data['project'] ?? self::DEFAULT_PROJECT],
            ['user_id' => $tokenUser->id, 'description' => 'Action items synced from your Meenits meetings.'],
        );

        // Pre-load team members (keyed by email) for fallback assignee resolution.
        $teamMembers = $team->users()->get()->keyBy(fn ($u) => strtolower($u->email));

        $results = [];
        foreach ($data['tasks'] as $t) {
            $sourceRef = $t['source_ref'] ?? [];

            // Resolve assignee by Meenits identity first (auto-adding them to the team),
            // then by an existing team member's email; else stash for visibility.
            $assignee = $this->resolveAssignee($team, $t, $teamMembers);
            $assignedTo = $assignee?->id;

            if (! $assignee && ! empty($t['assignee_email'])) {
                $sourceRef['assignee_email'] = $t['assignee_email'];
                $sourceRef['assignee_name'] = $t['assignee_name'] ?? null;
            }

            $attrs = [
                'title' => $t['title'],
                'description' => $t['description'] ?? null,
                'status' => $t['status'] ?? 'pending',
                'due_date' => $t['due_date'] ?? null,
                'assigned_to' => $assignedTo,
                'source_app' => 'meenits',
                'source_ref' => $sourceRef ?: null,
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

    /**
     * Resolve the Trac team a batch should land in, from the source Meenits workspace.
     *
     * - team workspace (with org uuid) → a Trac team keyed by that uuid (auto-provisioned,
     *   connector = owner);
     * - personal workspace, or a legacy push with no descriptor → the token user's
     *   personal team.
     */
    private function resolveTargetTeam(User $tokenUser, ?array $workspace): Team
    {
        if (($workspace['type'] ?? null) === 'team' && ! empty($workspace['meenits_org_uuid'])) {
            return Team::findOrCreateForMeenitsOrg(
                $workspace['meenits_org_uuid'],
                $workspace['name'] ?? 'Meenits Workspace',
                $tokenUser,
            );
        }

        return $tokenUser->currentTeam() ?? Team::createPersonalFor($tokenUser);
    }

    /**
     * Resolve a task's assignee to a local user:
     *  1. exact match by Meenits identity (meenits_user_id) — auto-added to the team if
     *     not already a member (identity-based member sync);
     *  2. else an existing team member matched by email.
     *
     * @param  \Illuminate\Support\Collection<string,User>  $teamMembersByEmail
     */
    private function resolveAssignee(Team $team, array $t, $teamMembersByEmail): ?User
    {
        if (! empty($t['assignee_meenits_user_id'])) {
            $user = User::where('meenits_user_id', $t['assignee_meenits_user_id'])->first();

            if ($user) {
                if (! $team->hasMember($user)) {
                    $team->users()->attach($user->id, ['role' => 'member', 'joined_at' => now()]);
                }

                return $user;
            }
        }

        if (! empty($t['assignee_email'])) {
            return $teamMembersByEmail->get(strtolower($t['assignee_email']));
        }

        return null;
    }
}

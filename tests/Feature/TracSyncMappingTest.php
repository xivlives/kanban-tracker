<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * SSO Stage E — workspace-aware action-item sync (MeenitsApp → MeenitsTrac).
 * A team Meenits org auto-provisions a matching Trac team (keyed by org uuid);
 * personal orgs land in the connector's personal team; assignees resolve by
 * meenits_user_id and are auto-added to the team.
 */
class TracSyncMappingTest extends TestCase
{
    use RefreshDatabase;

    /** The integration-token user (connector) with a personal team, acting via Sanctum. */
    private function connector(): User
    {
        $user = User::factory()->create();
        Team::createPersonalFor($user);
        Sanctum::actingAs($user, ['*']);

        return $user;
    }

    public function test_team_workspace_auto_provisions_a_trac_team_keyed_by_org_uuid(): void
    {
        $connector = $this->connector();

        $response = $this->postJson('/api/tasks/bulk', [
            'workspace' => ['type' => 'team', 'meenits_org_uuid' => 'org-uuid-1', 'name' => 'Acme Inc'],
            'tasks' => [['title' => 'Ship it', 'external_id' => 'meenits:actionitem:1']],
        ]);

        $response->assertCreated();

        $team = Team::where('meenits_org_uuid', 'org-uuid-1')->first();
        $this->assertNotNull($team);
        $this->assertSame('Acme Inc', $team->name);
        $this->assertTrue($team->hasMember($connector), 'connector should own the provisioned team');

        $project = Project::withoutGlobalScope('team')->where('team_id', $team->id)->first();
        $this->assertNotNull($project);
        $this->assertDatabaseHas('tasks', ['title' => 'Ship it', 'project_id' => $project->id]);

        // Idempotent on the org uuid: a second push reuses the same team.
        $this->postJson('/api/tasks/bulk', [
            'workspace' => ['type' => 'team', 'meenits_org_uuid' => 'org-uuid-1', 'name' => 'Acme Inc'],
            'tasks' => [['title' => 'Another', 'external_id' => 'meenits:actionitem:2']],
        ])->assertCreated();

        $this->assertSame(1, Team::where('meenits_org_uuid', 'org-uuid-1')->count());
    }

    public function test_personal_workspace_lands_in_the_connectors_personal_team(): void
    {
        $connector = $this->connector();
        $personalTeam = $connector->currentTeam();

        $this->postJson('/api/tasks/bulk', [
            'workspace' => ['type' => 'personal', 'meenits_org_uuid' => 'PER-abc', 'name' => 'My Workspace'],
            'tasks' => [['title' => 'Personal task', 'external_id' => 'meenits:actionitem:3']],
        ])->assertCreated();

        // No team got tagged with the personal org uuid.
        $this->assertNull(Team::where('meenits_org_uuid', 'PER-abc')->first());

        $project = Project::withoutGlobalScope('team')->where('team_id', $personalTeam->id)->first();
        $this->assertNotNull($project);
        $this->assertDatabaseHas('tasks', ['title' => 'Personal task', 'project_id' => $project->id]);
    }

    public function test_assignee_matched_by_meenits_identity_is_added_to_the_team_and_assigned(): void
    {
        $this->connector();
        $assignee = User::factory()->create(['meenits_user_id' => 4242, 'email' => 'a@example.com']);

        $this->postJson('/api/tasks/bulk', [
            'workspace' => ['type' => 'team', 'meenits_org_uuid' => 'org-uuid-2', 'name' => 'Beta'],
            'tasks' => [[
                'title' => 'Assigned task',
                'external_id' => 'meenits:actionitem:4',
                'assignee_meenits_user_id' => 4242,
                'assignee_email' => 'a@example.com',
            ]],
        ])->assertCreated();

        $team = Team::where('meenits_org_uuid', 'org-uuid-2')->first();
        $this->assertTrue($team->hasMember($assignee), 'matched assignee should be auto-added to the team');
        $this->assertDatabaseHas('tasks', ['title' => 'Assigned task', 'assigned_to' => $assignee->id]);
    }

    public function test_legacy_push_without_workspace_falls_back_to_personal_team(): void
    {
        $connector = $this->connector();
        $personalTeam = $connector->currentTeam();

        $this->postJson('/api/tasks/bulk', [
            'tasks' => [['title' => 'Legacy', 'external_id' => 'meenits:actionitem:5']],
        ])->assertCreated();

        $project = Project::withoutGlobalScope('team')->where('team_id', $personalTeam->id)->first();
        $this->assertNotNull($project);
        $this->assertDatabaseHas('tasks', ['title' => 'Legacy', 'project_id' => $project->id]);
    }
}

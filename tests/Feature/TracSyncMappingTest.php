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

    // ── Part 2: identity-routed push over the platform service credential ──

    public function test_team_push_is_owned_by_the_org_owner_identity_not_the_caller(): void
    {
        $this->connector(); // the (service/system) caller
        $owner = User::factory()->create(['meenits_user_id' => 7001]);

        $this->postJson('/api/tasks/bulk', [
            'workspace' => [
                'type' => 'team', 'meenits_org_uuid' => 'org-id-7', 'name' => 'Acme',
                'owner_meenits_user_id' => 7001,
            ],
            'tasks' => [['title' => 'X', 'external_id' => 'e7']],
        ])->assertCreated();

        $team = Team::where('meenits_org_uuid', 'org-id-7')->first();
        $this->assertSame($owner->id, $team->owner_id, 'team is owned by the Meenits owner, not the service caller');
    }

    public function test_personal_push_routes_to_the_owner_personal_team_by_identity(): void
    {
        $this->connector();
        $owner = User::factory()->create(['meenits_user_id' => 7002]);
        $ownerTeam = Team::createPersonalFor($owner);

        $this->postJson('/api/tasks/bulk', [
            'workspace' => [
                'type' => 'personal', 'meenits_org_uuid' => 'PER-7', 'name' => 'Mine',
                'owner_meenits_user_id' => 7002,
            ],
            'tasks' => [['title' => 'P', 'external_id' => 'e8']],
        ])->assertCreated();

        $project = Project::withoutGlobalScope('team')->where('team_id', $ownerTeam->id)->first();
        $this->assertNotNull($project);
        $this->assertDatabaseHas('tasks', ['title' => 'P', 'project_id' => $project->id]);
    }

    public function test_personal_push_for_a_user_without_a_trac_account_is_skipped(): void
    {
        $this->connector();

        $response = $this->postJson('/api/tasks/bulk', [
            'workspace' => [
                'type' => 'personal', 'meenits_org_uuid' => 'PER-9', 'name' => 'Ghost',
                'owner_meenits_user_id' => 999999, // no Trac user with this identity
            ],
            'tasks' => [['title' => 'Should not land', 'external_id' => 'e9']],
        ]);

        $response->assertOk(); // graceful skip, not an error
        $response->assertJson(['count' => 0]);
        $this->assertDatabaseMissing('tasks', ['title' => 'Should not land']);
    }
}

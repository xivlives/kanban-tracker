<?php

namespace Tests\Feature;

use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

/**
 * SSO Stage F — unified org workspaces. A Meenits org member who signs into Trac is
 * offered to join the org's Trac workspace; joining provisions/links the team and adds
 * them with a mapped role. The session `meenits_orgs` (set at SSO login) is the gate.
 */
class WorkspaceJoinTest extends TestCase
{
    use RefreshDatabase;

    private function member(): User
    {
        $user = User::factory()->create();
        Team::createPersonalFor($user);

        return $user;
    }

    public function test_pending_invites_lists_only_unjoined_team_orgs(): void
    {
        $user = $this->member();

        $response = $this->actingAs($user)
            ->withSession(['meenits_orgs' => [
                ['uuid' => 'org-1', 'name' => 'Acme', 'type' => 'team', 'role' => 'admin'],
                ['uuid' => 'PER-x', 'name' => 'Mine', 'type' => 'personal', 'role' => 'owner'],
            ]])
            ->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->has('pendingWorkspaceInvites', 1) // personal excluded
            ->where('pendingWorkspaceInvites.0.uuid', 'org-1')
            ->where('pendingWorkspaceInvites.0.name', 'Acme'));
    }

    public function test_joining_provisions_the_team_and_adds_the_user_with_mapped_role(): void
    {
        $user = $this->member();

        $response = $this->actingAs($user)
            ->withSession(['meenits_orgs' => [
                ['uuid' => 'org-1', 'name' => 'Acme', 'type' => 'team', 'role' => 'admin'],
            ]])
            ->post(route('workspaces.join', 'org-1'));

        $response->assertRedirect(route('dashboard'));

        $team = Team::where('meenits_org_uuid', 'org-1')->first();
        $this->assertNotNull($team);
        $this->assertSame('Acme', $team->name);
        $this->assertTrue($team->hasMember($user));
        $this->assertSame('admin', $team->memberRole($user)); // Meenits admin → Trac admin
        $this->assertSame($team->id, session('current_team_id'));
    }

    public function test_cannot_join_an_org_not_in_your_session_membership(): void
    {
        $user = $this->member();

        $this->actingAs($user)
            ->withSession(['meenits_orgs' => []])
            ->post(route('workspaces.join', 'org-x'))
            ->assertForbidden();

        $this->assertNull(Team::where('meenits_org_uuid', 'org-x')->first());
    }

    public function test_joining_an_already_provisioned_team_does_not_duplicate(): void
    {
        $owner = $this->member();
        $existing = Team::findOrCreateForMeenitsOrg('org-2', 'Beta', $owner, 'owner');

        $joiner = $this->member();
        $this->actingAs($joiner)
            ->withSession(['meenits_orgs' => [
                ['uuid' => 'org-2', 'name' => 'Beta', 'type' => 'team', 'role' => 'member'],
            ]])
            ->post(route('workspaces.join', 'org-2'))
            ->assertRedirect(route('dashboard'));

        $this->assertSame(1, Team::where('meenits_org_uuid', 'org-2')->count());
        $this->assertTrue($existing->fresh()->hasMember($joiner));
        $this->assertSame('member', $existing->fresh()->memberRole($joiner));
    }
}

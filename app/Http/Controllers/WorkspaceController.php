<?php

namespace App\Http\Controllers;

use App\Models\Team;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/**
 * Joining a Meenits org's Trac workspace (Stage F). The Meenits org is the canonical,
 * suite-wide workspace; here a member who signed in via SSO claims their seat on the
 * matching Trac team. Gated by the session org list (set at login) so a user can only
 * join workspaces they actually belong to on Meenits.
 */
class WorkspaceController extends Controller
{
    public function join(Request $request, string $meenitsOrgUuid): RedirectResponse
    {
        $user = $request->user();

        // The org must be one of the user's Meenits team workspaces (captured at SSO login).
        $org = collect(session('meenits_orgs', []))->first(
            fn ($o) => ($o['uuid'] ?? null) === $meenitsOrgUuid && ($o['type'] ?? null) === 'team'
        );

        abort_unless($org, 403, 'You are not a member of that workspace.');

        $role = Team::mapMeenitsRole($org['role'] ?? 'member');

        // Provision the team on first join (this user becomes its owner), or reuse it.
        $team = Team::findOrCreateForMeenitsOrg($meenitsOrgUuid, $org['name'] ?? 'Workspace', $user, $role);

        if (! $team->hasMember($user)) {
            $team->users()->attach($user->id, ['role' => $role, 'joined_at' => now()]);
        }

        session(['current_team_id' => $team->id]);

        return redirect()->route('dashboard')->with('success', "You've joined {$team->name}.");
    }
}

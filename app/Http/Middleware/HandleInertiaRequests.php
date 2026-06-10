<?php

namespace App\Http\Middleware;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $currentTeam = $user?->currentTeam();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
            ],
            // Active team + the user's teams, for the sidebar team switcher.
            'currentTeam' => $currentTeam ? [
                'id' => $currentTeam->id,
                'name' => $currentTeam->name,
                'personal' => $currentTeam->isPersonal(),
                'role' => $currentTeam->memberRole($user),
            ] : null,
            'teams' => fn () => $user
                ? $user->teams()->orderBy('name')->get(['teams.id', 'teams.name'])
                : [],
            // Current team's projects, for the sidebar "Boards" dropdown.
            'sidebarProjects' => fn () => $currentTeam
                ? $currentTeam->projects()->orderBy('name')->get(['id', 'name'])
                : [],
            // Meenits org workspaces the user belongs to but hasn't joined on Trac yet —
            // surfaced as "Join {Org} workspace" prompts (Stage F).
            'pendingWorkspaceInvites' => fn () => $this->pendingWorkspaceInvites($user),
        ];
    }

    /**
     * Team-type Meenits orgs (from the session, populated at SSO login) whose Trac team
     * the user is not yet a member of. {@see Auth\MeenitsSsoController::cacheMeenitsOrganizations}
     *
     * @return list<array{uuid:string,name:string,role:string}>
     */
    private function pendingWorkspaceInvites(?User $user): array
    {
        $orgs = session('meenits_orgs');
        if (! $user || ! is_array($orgs) || $orgs === []) {
            return [];
        }

        $joinedOrgUuids = $user->teams()
            ->whereNotNull('meenits_org_uuid')
            ->pluck('meenits_org_uuid')
            ->all();

        $pending = [];
        foreach ($orgs as $org) {
            if (($org['type'] ?? null) !== 'team' || empty($org['uuid'])) {
                continue;
            }
            if (in_array($org['uuid'], $joinedOrgUuids, true)) {
                continue; // already a member of this org's Trac team
            }
            $pending[] = [
                'uuid' => $org['uuid'],
                'name' => $org['name'] ?? 'Workspace',
                'role' => $org['role'] ?? 'member',
            ];
        }

        return $pending;
    }
}

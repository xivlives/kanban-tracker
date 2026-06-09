<?php

namespace App\Http\Middleware;

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
        ];
    }
}

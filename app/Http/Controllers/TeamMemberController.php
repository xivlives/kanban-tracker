<?php

namespace App\Http\Controllers;

use App\Models\Team;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TeamMemberController extends Controller
{
    /** Team settings → members page. */
    public function index(Request $request)
    {
        $team = $request->user()->currentTeam();
        abort_unless($team, 404);

        $role = $team->memberRole($request->user());
        $canManage = in_array($role, ['owner', 'admin']);

        $members = $team->users()
            ->orderByRaw("FIELD(team_user.role, 'owner', 'admin', 'member')")
            ->get()
            ->map(fn ($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->pivot->role,
                'joined_at' => $u->pivot->joined_at,
            ]);

        $invitations = $canManage
            ? $team->invitations()
                ->whereNull('accepted_at')
                ->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))
                ->with('inviter:id,name')
                ->latest()
                ->get()
                ->map(fn ($i) => [
                    'id' => $i->id,
                    'email' => $i->email,
                    'role' => $i->role,
                    'inviter_name' => $i->inviter?->name,
                    'created_at' => $i->created_at,
                    'expires_at' => $i->expires_at,
                ])
            : [];

        return Inertia::render('Teams/Members', [
            'team' => [
                'id' => $team->id,
                'name' => $team->name,
                'is_personal' => $team->isPersonal(),
            ],
            'members' => $members,
            'invitations' => $invitations,
            'canManage' => $canManage,
            'currentUserId' => $request->user()->id,
        ]);
    }

    /** Change a member's role (owner/admin only). */
    public function updateRole(Request $request, int $userId)
    {
        $team = $request->user()->currentTeam();
        abort_unless($team, 404);

        $role = $team->memberRole($request->user());
        abort_unless(in_array($role, ['owner', 'admin']), 403, 'Not authorized to manage members.');

        $data = $request->validate([
            'role' => ['required', 'in:admin,member'],
        ]);

        // Cannot change the owner's role.
        $target = $team->users()->whereKey($userId)->first();
        abort_unless($target, 404, 'User is not a member of this team.');
        abort_if($target->pivot->role === 'owner', 403, 'Cannot change the owner\'s role.');

        // Only the owner can promote to admin.
        if ($data['role'] === 'admin' && $role !== 'owner') {
            abort(403, 'Only the team owner can promote to admin.');
        }

        $team->users()->updateExistingPivot($userId, ['role' => $data['role']]);

        return back()->with('success', "{$target->name}'s role updated to {$data['role']}.");
    }

    /** Remove a member from the team (owner/admin only). */
    public function destroy(Request $request, int $userId)
    {
        $team = $request->user()->currentTeam();
        abort_unless($team, 404);

        $role = $team->memberRole($request->user());
        abort_unless(in_array($role, ['owner', 'admin']), 403, 'Not authorized to manage members.');

        $target = $team->users()->whereKey($userId)->first();
        abort_unless($target, 404, 'User is not a member of this team.');
        abort_if($target->pivot->role === 'owner', 403, 'Cannot remove the team owner.');

        // Admins cannot remove other admins (only owner can).
        if ($target->pivot->role === 'admin' && $role !== 'owner') {
            abort(403, 'Only the team owner can remove admins.');
        }

        $team->users()->detach($userId);

        return back()->with('success', "{$target->name} has been removed from the team.");
    }
}

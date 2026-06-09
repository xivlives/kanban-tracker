<?php

namespace App\Http\Controllers;

use App\Mail\TeamInvitationMail;
use App\Models\Team;
use App\Models\TeamInvitation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;

class TeamInvitationController extends Controller
{
    /** Send an invitation to join the current team. */
    public function store(Request $request)
    {
        $team = $request->user()->currentTeam();
        abort_unless($team, 404);

        $role = $team->memberRole($request->user());
        abort_unless(in_array($role, ['owner', 'admin']), 403, 'Not authorized to invite members.');

        $data = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'role' => ['required', 'in:admin,member'],
        ]);

        // Already a member?
        if ($team->users()->where('email', $data['email'])->exists()) {
            return back()->withErrors(['email' => 'This person is already a member of the team.']);
        }

        // Pending invitation already exists?
        $existing = $team->invitations()
            ->where('email', $data['email'])
            ->whereNull('accepted_at')
            ->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))
            ->first();

        if ($existing) {
            return back()->withErrors(['email' => 'An invitation has already been sent to this email.']);
        }

        $invitation = TeamInvitation::create([
            'team_id' => $team->id,
            'email' => $data['email'],
            'role' => $data['role'],
            'token' => Str::random(64),
            'invited_by' => $request->user()->id,
            'expires_at' => now()->addDays(7),
        ]);

        try {
            $invitation->load(['team', 'inviter']);
            Mail::to($data['email'])->send(new TeamInvitationMail($invitation));
        } catch (\Throwable $e) {
            Log::warning('Failed to send team invitation email', [
                'email' => $data['email'],
                'invitation_id' => $invitation->id,
                'error' => $e->getMessage(),
            ]);
        }

        return back()->with('success', "Invitation sent to {$data['email']}.");
    }

    /** Cancel/revoke a pending invitation. */
    public function destroy(Request $request, int $invitationId)
    {
        $team = $request->user()->currentTeam();
        abort_unless($team, 404);

        $role = $team->memberRole($request->user());
        abort_unless(in_array($role, ['owner', 'admin']), 403);

        $invitation = $team->invitations()->findOrFail($invitationId);
        $invitation->delete();

        return back()->with('success', 'Invitation cancelled.');
    }

    // ── Accept flow ─────────────────────────────────────────────────────

    /** Show the invitation accept page (public, no auth required). */
    public function show(string $token)
    {
        $invitation = TeamInvitation::where('token', $token)
            ->with('team:id,name')
            ->firstOrFail();

        if (! $invitation->isPending()) {
            return Inertia::render('Teams/InvitationInvalid', [
                'reason' => $invitation->accepted_at ? 'accepted' : 'expired',
            ]);
        }

        return Inertia::render('Teams/InvitationAccept', [
            'invitation' => [
                'token' => $invitation->token,
                'email' => $invitation->email,
                'role' => $invitation->role,
                'team_name' => $invitation->team->name,
                'expires_at' => $invitation->expires_at?->toDateTimeString(),
            ],
            'hasAccount' => User::where('email', $invitation->email)->exists(),
            'isLoggedIn' => Auth::check(),
            'currentUserEmail' => Auth::user()?->email,
        ]);
    }

    /** Accept the invitation (must be authenticated). */
    public function accept(Request $request, string $token)
    {
        $invitation = TeamInvitation::where('token', $token)
            ->with('team')
            ->firstOrFail();

        if (! $invitation->isPending()) {
            return redirect()->route('login')->with('error', 'This invitation is no longer valid.');
        }

        $user = $request->user();
        if (! $user) {
            // Redirect to login/register with the invitation token preserved.
            return redirect()->route('login', ['invitation' => $token]);
        }

        // Verify email match.
        if (strtolower($user->email) !== strtolower($invitation->email)) {
            return back()->with('error', 'This invitation was sent to a different email address. Please log in with the correct account.');
        }

        // Already a member?
        if ($invitation->team->hasMember($user)) {
            $invitation->update(['accepted_at' => now()]);
            session(['current_team_id' => $invitation->team_id]);

            return redirect()->route('dashboard')->with('success', "You're already a member of {$invitation->team->name}.");
        }

        // Join the team.
        $invitation->team->users()->attach($user->id, [
            'role' => $invitation->role,
            'joined_at' => now(),
        ]);
        $invitation->update(['accepted_at' => now()]);

        // Switch to the new team.
        session(['current_team_id' => $invitation->team_id]);

        return redirect()->route('dashboard')->with('success', "Welcome to {$invitation->team->name}!");
    }
}

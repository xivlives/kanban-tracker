<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('Auth/Register', [
            'invitation' => $request->query('invitation'),
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'invitation' => ['nullable', 'string', 'max:64'],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'member', // Default role
        ]);

        // Every user starts in their own one-person workspace (team).
        \App\Models\Team::createPersonalFor($user);

        event(new Registered($user));

        Auth::login($user);

        // If the user registered via an invitation link, auto-join the team.
        if ($request->filled('invitation')) {
            $invitation = \App\Models\TeamInvitation::where('token', $request->invitation)->first();
            if ($invitation && $invitation->isPending() && strtolower($invitation->email) === strtolower($user->email)) {
                $invitation->team->users()->attach($user->id, [
                    'role' => $invitation->role,
                    'joined_at' => now(),
                ]);
                $invitation->update(['accepted_at' => now()]);
                session(['current_team_id' => $invitation->team_id]);

                return redirect(route('dashboard', absolute: false))
                    ->with('success', "Welcome to {$invitation->team->name}!");
            }
        }

        return redirect(route('dashboard', absolute: false));
    }
}

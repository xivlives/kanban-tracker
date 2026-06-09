<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

/**
 * "Login with Meenits" — OAuth2 client flow against the MeenitsApp identity
 * provider. MeenitsApp owns identity; this controller mirrors a local Trac user
 * keyed by meenits_user_id and logs them in. See SSO_PLAN.md (Stages B & D).
 */
class MeenitsSsoController extends Controller
{
    /** Kick off the OAuth2 handshake (redirect to MeenitsApp /oauth/authorize). */
    public function redirect(): RedirectResponse
    {
        return Socialite::driver('meenits')->redirect();
    }

    /**
     * Handle the callback: resolve the local user, then log them in.
     *
     * Resolution order (identity-first):
     *   1. existing user by meenits_user_id (already linked);
     *   2. else existing user by email → link it (set meenits_user_id);  [Stage D]
     *   3. else create a new user + personal team.
     */
    public function callback(): RedirectResponse
    {
        try {
            $meenitsUser = Socialite::driver('meenits')->user();
        } catch (Throwable $e) {
            Log::warning('Meenits SSO callback failed', ['error' => $e->getMessage()]);

            return redirect()->route('login')
                ->withErrors(['email' => 'Could not sign in with Meenits. Please try again.']);
        }

        $meenitsId = $meenitsUser->getId();
        $email = $meenitsUser->getEmail();

        if (! $meenitsId || ! $email) {
            return redirect()->route('login')
                ->withErrors(['email' => 'Meenits did not return a usable profile.']);
        }

        $user = User::where('meenits_user_id', $meenitsId)->first();

        if (! $user) {
            // Link an existing local account by email (first SSO login), or create one.
            $user = DB::transaction(function () use ($meenitsUser, $meenitsId, $email) {
                $existing = User::where('email', $email)->lockForUpdate()->first();

                if ($existing) {
                    $existing->forceFill([
                        'meenits_user_id' => $meenitsId,
                        'email_verified_at' => $existing->email_verified_at ?? now(),
                    ])->save();

                    return $existing;
                }

                $created = User::create([
                    'name' => $meenitsUser->getName() ?: $email,
                    'email' => $email,
                    'meenits_user_id' => $meenitsId,
                ]);

                // password (none — SSO user) + email_verified_at (Meenits already
                // verified them) are not mass-fillable, so set them explicitly.
                $created->forceFill([
                    'password' => null,
                    'email_verified_at' => now(),
                ])->save();

                Team::createPersonalFor($created);

                return $created;
            });
        }

        Auth::login($user, remember: true);

        return redirect()->intended(route('dashboard', absolute: false));
    }
}

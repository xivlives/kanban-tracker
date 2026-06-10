<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Auth\MeenitsSsoController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\VerifyEmailController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Auth routes — SSO-only (Atlassian model)
|--------------------------------------------------------------------------
| MeenitsApp is the single identity provider; MeenitsTrac has NO local password.
| The login/register GET routes render the "Log in with Meenits" screens and keep
| route('login')/route('register') resolvable (middleware + redirects target them).
| The local-password handlers (POST login/register, password reset/confirm/update)
| are intentionally removed to close that attack surface. See SSO_PLAN.md (Stage C).
*/

Route::middleware('guest')->group(function () {
    // "Login with Meenits" — OAuth2 SSO against MeenitsApp.
    Route::get('auth/meenits/redirect', [MeenitsSsoController::class, 'redirect'])
        ->name('auth.meenits.redirect');
    Route::get('auth/meenits/callback', [MeenitsSsoController::class, 'callback'])
        ->name('auth.meenits.callback');

    // SSO-only auth screens (no POST / password handlers by design).
    Route::get('login', [AuthenticatedSessionController::class, 'create'])
        ->name('login');

    Route::get('register', [RegisteredUserController::class, 'create'])
        ->name('register');
});

Route::middleware('auth')->group(function () {
    // Email verification kept for completeness; SSO users arrive pre-verified, so the
    // `verified` middleware never bounces here — but the named route must still exist.
    Route::get('verify-email', EmailVerificationPromptController::class)
        ->name('verification.notice');

    Route::get('verify-email/{id}/{hash}', VerifyEmailController::class)
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');

    Route::post('email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('verification.send');

    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');
});

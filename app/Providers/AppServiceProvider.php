<?php

namespace App\Providers;

use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use SocialiteProviders\Manager\SocialiteWasCalled;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Register the custom "Login with Meenits" Socialite provider so
        // Socialite::driver('meenits') resolves. See SSO_PLAN.md (Stage B).
        Event::listen(function (SocialiteWasCalled $event) {
            $event->extendSocialite('meenits', \App\Socialite\MeenitsProvider::class);
        });
    }
}

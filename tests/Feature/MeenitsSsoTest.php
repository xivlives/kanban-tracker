<?php

namespace Tests\Feature;

use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Contracts\Provider;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Mockery;
use Tests\TestCase;

/**
 * SSO Stage B/D — "Login with Meenits" OAuth2 client on MeenitsTrac.
 * Covers the three identity-resolution paths in the callback plus the redirect.
 */
class MeenitsSsoTest extends TestCase
{
    use RefreshDatabase;

    /** Stub Socialite so the callback gets a fixed Meenits identity (no real IdP). */
    private function fakeMeenitsUser(int $id, string $name, string $email): void
    {
        $socialiteUser = (new SocialiteUser)->map([
            'id' => $id,
            'name' => $name,
            'email' => $email,
            'avatar' => null,
        ]);

        $provider = Mockery::mock(Provider::class);
        $provider->shouldReceive('user')->andReturn($socialiteUser);
        Socialite::shouldReceive('driver')->with('meenits')->andReturn($provider);
    }

    public function test_redirect_route_sends_user_to_meenits_authorize_url(): void
    {
        config([
            'services.meenits.client_id' => 'test-client',
            'services.meenits.authorize_url' => 'https://app.meenits.app/oauth/authorize',
            'services.meenits.redirect' => 'https://trac.meenits.app/auth/meenits/callback',
        ]);

        $response = $this->get(route('auth.meenits.redirect'));

        $response->assertredirectContains('https://app.meenits.app/oauth/authorize');
        $response->assertredirectContains('client_id=test-client');
    }

    public function test_new_meenits_user_is_created_with_a_personal_team_and_logged_in(): void
    {
        $this->fakeMeenitsUser(555, 'Grace Hopper', 'grace@example.com');

        $response = $this->get(route('auth.meenits.callback', ['code' => 'abc', 'state' => 'xyz']));

        $response->assertRedirect(route('dashboard', absolute: false));
        $this->assertAuthenticated();

        $user = User::where('email', 'grace@example.com')->first();
        $this->assertNotNull($user);
        $this->assertSame(555, (int) $user->meenits_user_id);
        $this->assertNull($user->password);
        $this->assertNotNull($user->email_verified_at);

        // A personal team was provisioned and the user owns it.
        $team = Team::where('owner_id', $user->id)->first();
        $this->assertNotNull($team);
        $this->assertTrue($team->isPersonal());
        $this->assertTrue($team->hasMember($user));
    }

    public function test_existing_local_user_is_linked_by_email_on_first_sso_login(): void
    {
        $existing = User::factory()->create([
            'email' => 'ada@example.com',
            'meenits_user_id' => null,
        ]);

        $this->fakeMeenitsUser(777, 'Ada Lovelace', 'ada@example.com');

        $response = $this->get(route('auth.meenits.callback', ['code' => 'abc']));

        $response->assertRedirect(route('dashboard', absolute: false));
        $this->assertAuthenticatedAs($existing->fresh());

        // Linked, not duplicated.
        $this->assertSame(1, User::where('email', 'ada@example.com')->count());
        $this->assertSame(777, (int) $existing->fresh()->meenits_user_id);
    }

    public function test_already_linked_user_is_just_logged_in(): void
    {
        $linked = User::factory()->create([
            'email' => 'linked@example.com',
            'meenits_user_id' => 999,
        ]);

        $this->fakeMeenitsUser(999, 'Linked User', 'linked@example.com');

        $response = $this->get(route('auth.meenits.callback', ['code' => 'abc']));

        $response->assertRedirect(route('dashboard', absolute: false));
        $this->assertAuthenticatedAs($linked->fresh());
        $this->assertSame(1, User::count());
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}

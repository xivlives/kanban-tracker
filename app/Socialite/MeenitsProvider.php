<?php

namespace App\Socialite;

use GuzzleHttp\RequestOptions;
use Laravel\Socialite\Two\ProviderInterface;
use Laravel\Socialite\Two\User;
use SocialiteProviders\Manager\OAuth2\AbstractProvider;

/**
 * "Login with Meenits" — OAuth2 client for the MeenitsApp identity provider
 * (Laravel Passport). MeenitsApp owns identity; MeenitsTrac mirrors a local user
 * linked by meenits_user_id. See SSO_PLAN.md (Stage B).
 *
 * Endpoints come from config('services.meenits.*') so the same code points at
 * local / staging / prod without edits.
 */
class MeenitsProvider extends AbstractProvider implements ProviderInterface
{
    public const IDENTIFIER = 'MEENITS';

    /** Minimal scope — matches the single `identity` scope exposed by MeenitsApp. */
    protected $scopes = ['identity'];

    protected $scopeSeparator = ' ';

    protected function getAuthUrl($state): string
    {
        return $this->buildAuthUrlFromBase(config('services.meenits.authorize_url'), $state);
    }

    protected function getTokenUrl(): string
    {
        return config('services.meenits.token_url');
    }

    /**
     * Fetch the identity from MeenitsApp's userinfo endpoint (GET /api/user).
     *
     * @return array{id:int|string, name:?string, email:?string, avatar:?string}
     */
    protected function getUserByToken($token): array
    {
        $response = $this->getHttpClient()->get(config('services.meenits.userinfo_url'), [
            RequestOptions::HEADERS => [
                'Authorization' => 'Bearer '.$token,
                'Accept' => 'application/json',
            ],
        ]);

        return json_decode((string) $response->getBody(), true) ?: [];
    }

    protected function mapUserToObject(array $user): User
    {
        return (new User)->setRaw($user)->map([
            'id' => $user['id'] ?? null,
            'name' => $user['name'] ?? null,
            'email' => $user['email'] ?? null,
            'avatar' => $user['avatar'] ?? null,
        ]);
    }
}

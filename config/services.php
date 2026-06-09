<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | "Login with Meenits" — OAuth2 client (SSO)
    |--------------------------------------------------------------------------
    |
    | MeenitsApp (Laravel Passport) is the identity provider; MeenitsTrac is the
    | client. client_id/secret/redirect come from the first-party trusted client
    | registered in MeenitsApp. URLs default to prod but are env-overridable for
    | local/staging. Consumed by App\Socialite\MeenitsProvider. See SSO_PLAN.md.
    |
    */
    'meenits' => [
        'client_id' => env('MEENITS_CLIENT_ID'),
        'client_secret' => env('MEENITS_CLIENT_SECRET'),
        'redirect' => env('MEENITS_REDIRECT_URI', 'https://trac.meenits.app/auth/meenits/callback'),
        'authorize_url' => env('MEENITS_AUTHORIZE_URL', 'https://app.meenits.app/oauth/authorize'),
        'token_url' => env('MEENITS_TOKEN_URL', 'https://app.meenits.app/oauth/token'),
        'userinfo_url' => env('MEENITS_USERINFO_URL', 'https://app.meenits.app/api/user'),
    ],

];

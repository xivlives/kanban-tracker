<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

/**
 * Mint the platform service token MeenitsApp uses to push action items (Stage F, Part 2).
 *
 * Replaces the per-user "paste a token" model: one system credential trusts MeenitsApp at
 * the platform level; the push payload carries the workspace + owner identity so tasks
 * route/own without a human connector. Run once per environment; set the printed token as
 * MEENITSTRAC_SERVICE_TOKEN in MeenitsApp.
 */
class MeenitsServiceToken extends Command
{
    protected $signature = 'meenits:service-token {--name=meenits-platform : Label for the minted token}';

    protected $description = 'Create/reuse the Meenits System user and mint a platform service token for the MeenitsApp integration push.';

    private const SYSTEM_EMAIL = 'system@meenitstrac.internal';

    public function handle(): int
    {
        $user = User::firstOrCreate(
            ['email' => self::SYSTEM_EMAIL],
            ['name' => 'Meenits System'],
        );

        // System account: verified, no password (never logs in interactively).
        $user->forceFill([
            'email_verified_at' => $user->email_verified_at ?? now(),
            'password' => null,
        ])->save();

        $token = $user->createToken($this->option('name'));

        $this->newLine();
        $this->info('Platform service token — set this as MEENITSTRAC_SERVICE_TOKEN in MeenitsApp:');
        $this->line($token->plainTextToken);
        $this->newLine();
        $this->warn('Shown once. Re-running this command mints a new token (old ones keep working until revoked).');

        return self::SUCCESS;
    }
}

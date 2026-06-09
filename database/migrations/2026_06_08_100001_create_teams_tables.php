<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

/**
 * Teams foundation. A team owns projects; membership grants access. Every
 * existing user is backfilled with a personal ("{First}'s Workspace") team and
 * their projects are reassigned to it, so nothing breaks for solo users.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teams', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->json('settings')->nullable(); // { personal: true } for solo teams
            $table->timestamps();
        });

        Schema::create('team_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('role')->default('member'); // owner | admin | member
            $table->timestamp('joined_at')->nullable();
            $table->timestamps();
            $table->unique(['team_id', 'user_id']);
        });

        Schema::create('team_invitations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->string('email');
            $table->string('role')->default('member');
            $table->string('token', 64)->unique();
            $table->foreignId('invited_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamps();
            $table->index(['team_id', 'email']);
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->foreignId('team_id')->nullable()->after('user_id')->constrained()->nullOnDelete();
        });

        // ── Backfill: one personal team per user; assign their projects to it ──
        foreach (DB::table('users')->get() as $u) {
            $first = trim(explode(' ', (string) $u->name)[0]) ?: 'My';
            $teamId = DB::table('teams')->insertGetId([
                'name' => $first . "'s Workspace",
                'slug' => Str::slug($first . '-workspace') . '-' . Str::lower(Str::random(6)),
                'owner_id' => $u->id,
                'settings' => json_encode(['personal' => true]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('team_user')->insert([
                'team_id' => $teamId,
                'user_id' => $u->id,
                'role' => 'owner',
                'joined_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('projects')->where('user_id', $u->id)->update(['team_id' => $teamId]);
        }
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropConstrainedForeignId('team_id');
        });
        Schema::dropIfExists('team_invitations');
        Schema::dropIfExists('team_user');
        Schema::dropIfExists('teams');
    }
};

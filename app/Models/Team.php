<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Team extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug', 'owner_id', 'settings', 'meenits_org_uuid'];

    protected $casts = ['settings' => 'array'];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'team_user')
            ->withPivot('role', 'joined_at')
            ->withTimestamps();
    }

    public function projects()
    {
        return $this->hasMany(Project::class);
    }

    public function invitations()
    {
        return $this->hasMany(TeamInvitation::class);
    }

    public function isPersonal(): bool
    {
        return (bool) data_get($this->settings, 'personal');
    }

    public function hasMember(User $user): bool
    {
        return $this->users()->whereKey($user->id)->exists();
    }

    public function memberRole(User $user): ?string
    {
        return $this->users()->whereKey($user->id)->first()?->pivot->role;
    }

    /**
     * Resolve (or auto-provision) the Trac team that mirrors a Meenits org/workspace.
     *
     * Idempotent on meenits_org_uuid. On first sync the team is created and the
     * connector ($owner, the integration-token user) becomes its owner + member.
     * Used by the action-item sync to route org meetings to a shared team workspace
     * (SSO Stage E).
     */
    public static function findOrCreateForMeenitsOrg(string $meenitsOrgUuid, string $name, User $owner): self
    {
        $team = static::where('meenits_org_uuid', $meenitsOrgUuid)->first();

        if ($team) {
            return $team;
        }

        $team = static::create([
            'name' => $name ?: 'Meenits Workspace',
            'slug' => Str::slug($name ?: 'meenits-workspace') . '-' . Str::lower(Str::random(6)),
            'owner_id' => $owner->id,
            'meenits_org_uuid' => $meenitsOrgUuid,
            'settings' => ['source' => 'meenits'],
        ]);

        $team->users()->attach($owner->id, ['role' => 'owner', 'joined_at' => now()]);

        return $team;
    }

    /** Create a one-person "personal" team for a user and make them owner. */
    public static function createPersonalFor(User $user): self
    {
        $first = trim(explode(' ', (string) $user->name)[0]) ?: 'My';

        $team = static::create([
            'name' => $first . "'s Workspace",
            'slug' => Str::slug($first . '-workspace') . '-' . Str::lower(Str::random(6)),
            'owner_id' => $user->id,
            'settings' => ['personal' => true],
        ]);

        $team->users()->attach($user->id, ['role' => 'owner', 'joined_at' => now()]);

        return $team;
    }
}

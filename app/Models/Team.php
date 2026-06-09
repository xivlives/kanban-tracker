<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Team extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug', 'owner_id', 'settings'];

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

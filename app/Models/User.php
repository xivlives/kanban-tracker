<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function projects()
    {
        return $this->hasMany(Project::class);
    }

    public function tasks()
    {
        return $this->hasMany(Task::class, 'assigned_to');
    }

    // ── Teams ──────────────────────────────────────────────────────────

    public function teams()
    {
        return $this->belongsToMany(Team::class, 'team_user')
            ->withPivot('role', 'joined_at')
            ->withTimestamps();
    }

    public function ownedTeams()
    {
        return $this->hasMany(Team::class, 'owner_id');
    }

    /** IDs of teams this user belongs to (uses the cached relation — one query/request). */
    public function teamIds(): array
    {
        return $this->teams->pluck('id')->all();
    }

    /** The active team: the session's current_team_id (if a member), else the first team. */
    public function currentTeam(): ?Team
    {
        $id = session('current_team_id');

        if ($id) {
            $team = $this->teams()->where('teams.id', $id)->first();
            if ($team) {
                return $team;
            }
        }

        // Default to a team the user owns (their personal workspace), not the
        // oldest team they merely belong to.
        return $this->teams()
            ->orderByRaw('teams.owner_id = ? desc', [$this->id])
            ->orderBy('teams.created_at')
            ->first();
    }

    public function belongsToTeam(Team $team): bool
    {
        return $this->teams()->whereKey($team->id)->exists();
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isMember(): bool
    {
        return $this->role === 'member';
    }
}
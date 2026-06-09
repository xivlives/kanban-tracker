<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'team_id',
        'name',
        'description',
    ];

    /**
     * Global scope (security chokepoint): a user can only ever query projects
     * belonging to a team they're a member of. Applied on every authenticated
     * web request — so route-model binding, relations and ad-hoc queries are
     * all team-bounded automatically. Skipped when no web user is authenticated
     * (e.g. the token API / queue jobs), which scope by team explicitly instead.
     */
    protected static function booted(): void
    {
        static::addGlobalScope('team', function (Builder $query) {
            if (Auth::check()) {
                $query->whereIn($query->getModel()->getTable() . '.team_id', Auth::user()->teamIds());
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    public function reports()
    {
        return $this->hasMany(Report::class);
    }

    public function latestReport()
    {
        return $this->hasOne(Report::class)->latestOfMany('last_generated_at');
    }
}
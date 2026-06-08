<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * MeenitsTrac side of the Meenits integration: lets a user mint a personal
 * access token to paste into their Meenits organization settings, so Meenits
 * can push meeting action items into their kanban board.
 */
class IntegrationController extends Controller
{
    public function index(Request $request): Response
    {
        $tokens = $request->user()->tokens()
            ->latest()
            ->get(['id', 'name', 'last_used_at', 'created_at'])
            ->map(fn ($t) => [
                'id' => $t->id,
                'name' => $t->name,
                'last_used_at' => optional($t->last_used_at)->diffForHumans(),
                'created_at' => optional($t->created_at)->toDayDateString(),
            ]);

        return Inertia::render('Integration/Index', [
            'tokens' => $tokens,
            // The plaintext token is shown exactly once, right after creation.
            'newToken' => session('newToken'),
            'meenitsUrl' => 'https://org.meenits.app',
        ]);
    }

    public function storeToken(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['nullable', 'string', 'max:60'],
        ]);

        $token = $request->user()->createToken($data['name'] ?: 'Meenits Integration');

        return back()->with('newToken', $token->plainTextToken);
    }

    public function destroyToken(Request $request, int $id): RedirectResponse
    {
        $request->user()->tokens()->where('id', $id)->delete();

        return back()->with('status', 'Token revoked.');
    }
}

<?php

use App\Http\Controllers\BacklogController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\IntegrationController;
use App\Http\Controllers\IssueController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TeamController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Landing page (public)
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('welcome');

// Protected routes (requires authentication)
Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // Profile Management
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // Teams
    Route::post('teams/{team}/switch', [TeamController::class, 'switch'])->name('teams.switch');

    // Projects
    Route::resource('projects', ProjectController::class);
    // Project-scoped views (Jira-style tabs): Summary · Timeline · Board · Calendar · List · Goals
    Route::get('projects/{project}/summary', [ProjectController::class, 'summary'])->name('projects.summary');
    Route::get('projects/{project}/timeline', [ProjectController::class, 'timeline'])->name('projects.timeline');
    Route::get('projects/{project}/backlog', [ProjectController::class, 'backlog'])->name('projects.backlog');
    Route::get('projects/{project}/calendar', [ProjectController::class, 'calendar'])->name('projects.calendar');
    Route::get('projects/{project}/list', [ProjectController::class, 'list'])->name('projects.list');
    Route::get('projects/{project}/goals', [ProjectController::class, 'goals'])->name('projects.goals');
    
    // Tasks
    Route::post('tasks', [TaskController::class, 'store'])->name('tasks.store');
    Route::put('tasks/{task}', [TaskController::class, 'update'])->name('tasks.update');
    Route::patch('tasks/{task}/status', [TaskController::class, 'updateStatus'])->name('tasks.updateStatus');
    Route::delete('tasks/{task}', [TaskController::class, 'destroy'])->name('tasks.destroy');
    Route::post('tasks/reorder', [TaskController::class, 'reorder'])->name('tasks.reorder');
    
    // Reports
    Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
    Route::post('reports/generate', [ReportController::class, 'generate'])->name('reports.generate');

    // Backlog — all pending tasks across projects
    Route::get('backlog', [BacklogController::class, 'index'])->name('backlog.index');

    // Issues — flat list of all tasks with filters
    Route::get('issues', [IssueController::class, 'index'])->name('issues.index');

    // Meenits integration — mint/revoke API tokens for the action-item push
    Route::get('integration', [IntegrationController::class, 'index'])->name('integration.index');
    Route::post('integration/tokens', [IntegrationController::class, 'storeToken'])->name('integration.tokens.store');
    Route::delete('integration/tokens/{id}', [IntegrationController::class, 'destroyToken'])->name('integration.tokens.destroy');
});

require __DIR__.'/auth.php';
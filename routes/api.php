<?php

use App\Http\Controllers\Api\TaskIntegrationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Integration API (MeenitsApp → MeenitsTrac)
|--------------------------------------------------------------------------
| Token-authenticated (Sanctum personal access token). MeenitsApp pushes
| meeting action items here; they become kanban tasks for the token owner.
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [TaskIntegrationController::class, 'me'])->name('api.me');
    Route::post('/tasks/bulk', [TaskIntegrationController::class, 'bulkTasks'])->name('api.tasks.bulk');
});

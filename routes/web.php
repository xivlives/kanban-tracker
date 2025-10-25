<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\TaskController;
use Illuminate\Support\Facades\Route;

Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

Route::resource('projects', ProjectController::class);

Route::post('tasks', [TaskController::class, 'store'])->name('tasks.store');
Route::put('tasks/{task}', [TaskController::class, 'update'])->name('tasks.update');
Route::patch('tasks/{task}/status', [TaskController::class, 'updateStatus'])->name('tasks.updateStatus');
Route::delete('tasks/{task}', [TaskController::class, 'destroy'])->name('tasks.destroy');

Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
Route::post('reports/generate', [ReportController::class, 'generate'])->name('reports.generate');
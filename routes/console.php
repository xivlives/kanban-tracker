<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Jobs\GenerateReportJob;
use Illuminate\Support\Facades\Log;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

// Schedule the report generation job
Schedule::job(new GenerateReportJob())
    ->dailyAt('00:00')
    ->before(function () {
        Log::channel('scheduler')->info('Starting scheduled report generation');
    })
    ->after(function () {
        Log::channel('scheduler')->info('Scheduled report generation completed');
    });
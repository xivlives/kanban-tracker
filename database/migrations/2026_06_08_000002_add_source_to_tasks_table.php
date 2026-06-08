<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Source/linking columns for tasks created by an external app (MeenitsApp).
 * `external_id` makes the push idempotent (re-pushing an action item updates,
 * not duplicates); `source_ref` holds the originating meeting metadata.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->string('source_app')->nullable()->after('status');   // e.g. "meenits"
            $table->json('source_ref')->nullable()->after('source_app');  // { meeting_id, meeting_title, ... }
            $table->string('external_id')->nullable()->index()->after('source_ref'); // "meenits:actionitem:{id}"
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn(['source_app', 'source_ref', 'external_id']);
        });
    }
};

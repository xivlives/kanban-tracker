<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * SSO Stage E: map a Meenits org/workspace to a Trac team.
 *
 * meenits_org_uuid is the UUID of the MeenitsApp organization this team mirrors
 * (nullable so local/personal teams are unaffected; unique so one Meenits org maps
 * to exactly one Trac team). Action-item sync auto-provisions/links by this key.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('teams', function (Blueprint $table) {
            $table->string('meenits_org_uuid')->nullable()->unique()->after('owner_id');
        });
    }

    public function down(): void
    {
        Schema::table('teams', function (Blueprint $table) {
            $table->dropUnique(['meenits_org_uuid']);
            $table->dropColumn('meenits_org_uuid');
        });
    }
};

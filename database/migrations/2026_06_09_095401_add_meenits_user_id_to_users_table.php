<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * SSO Stage B: link Trac users to their central Meenits identity.
 *
 * - meenits_user_id: the MeenitsApp user id this local user mirrors (nullable so
 *   pre-existing/local-only users are unaffected; unique so one Meenits identity
 *   maps to at most one Trac user).
 * - password becomes nullable: SSO users never set a Trac password.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('meenits_user_id')->nullable()->unique()->after('email');
            $table->string('password')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['meenits_user_id']);
            $table->dropColumn('meenits_user_id');
            // Note: leaving password nullable on rollback is safe; tightening it
            // back would fail if any SSO-only (password-null) users exist.
        });
    }
};

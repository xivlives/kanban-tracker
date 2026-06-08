<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // 1. Expand the status enum to include 'in-review'
        DB::statement("ALTER TABLE tasks MODIFY COLUMN status ENUM('pending','in-progress','in-review','done') NOT NULL DEFAULT 'pending'");

        // 2. Add new columns
        Schema::table('tasks', function (Blueprint $table) {
            $table->string('label', 50)->nullable()->after('status');
            $table->string('task_key', 20)->nullable()->unique()->after('id');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium')->after('label');
            $table->unsignedInteger('sort_order')->default(0)->after('priority');
        });
    }

    public function down(): void
    {
        // Move any 'in-review' tasks back to 'in-progress' before shrinking the enum
        DB::table('tasks')->where('status', 'in-review')->update(['status' => 'in-progress']);

        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn(['label', 'task_key', 'priority', 'sort_order']);
        });

        DB::statement("ALTER TABLE tasks MODIFY COLUMN status ENUM('pending','in-progress','done') NOT NULL DEFAULT 'pending'");
    }
};

<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create users
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        $member1 = User::create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => bcrypt('password'),
            'role' => 'member',
        ]);

        $member2 = User::create([
            'name' => 'Jane Smith',
            'email' => 'jane@example.com',
            'password' => bcrypt('password'),
            'role' => 'member',
        ]);

        // Create projects
        $project1 = Project::create([
            'name' => 'Website Redesign',
            'description' => 'Complete overhaul of the company website with modern UI/UX',
        ]);

        $project2 = Project::create([
            'name' => 'Mobile App Development',
            'description' => 'Build a cross-platform mobile application',
        ]);

        // Create tasks for project 1
        Task::create([
            'project_id' => $project1->id,
            'title' => 'Design mockups',
            'description' => 'Create initial design mockups for the homepage',
            'status' => 'done',
            'assigned_to' => $member1->id,
            'due_date' => now()->subDays(5),
        ]);

        Task::create([
            'project_id' => $project1->id,
            'title' => 'Implement responsive layout',
            'description' => 'Code the responsive grid system',
            'status' => 'in-progress',
            'assigned_to' => $member2->id,
            'due_date' => now()->addDays(3),
        ]);

        Task::create([
            'project_id' => $project1->id,
            'title' => 'User testing',
            'description' => 'Conduct user testing sessions',
            'status' => 'pending',
            'assigned_to' => $member1->id,
            'due_date' => now()->addDays(7),
        ]);

        // Create tasks for project 2
        Task::create([
            'project_id' => $project2->id,
            'title' => 'Setup development environment',
            'description' => 'Configure React Native environment',
            'status' => 'done',
            'assigned_to' => $member2->id,
            'due_date' => now()->subDays(3),
        ]);

        Task::create([
            'project_id' => $project2->id,
            'title' => 'Build authentication module',
            'description' => 'Implement login and registration',
            'status' => 'in-progress',
            'assigned_to' => $member1->id,
            'due_date' => now()->addDays(5),
        ]);

        Task::create([
            'project_id' => $project2->id,
            'title' => 'API integration',
            'description' => 'Connect to backend APIs',
            'status' => 'pending',
            'assigned_to' => null,
            'due_date' => now()->addDays(10),
        ]);
    }
}
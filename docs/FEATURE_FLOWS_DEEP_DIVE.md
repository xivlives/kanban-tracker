# MeenitsTrac — Feature Flows Deep Dive

> Principal Engineer-level documentation of end-to-end feature flows, coupling points, edge cases, and silent failure modes.
>
> Generated from source code analysis on 17 February 2026.

---

## Architecture Overview

MeenitsTrac is a Laravel 11 + Inertia.js + React Kanban-style project/task tracker.

**Stack layers:**

```
React (JSX)  ←→  Inertia.js  ←→  Laravel Controllers  ←→  Services  ←→  Eloquent Models  ←→  Database
                                                              ↕
                                                         Jobs (Queue)
```

**Key files map:**

| Layer         | Files                                                                                 |
| ------------- | ------------------------------------------------------------------------------------- |
| Routes        | `routes/web.php`, `routes/auth.php`, `routes/console.php`                             |
| Controllers   | `app/Http/Controllers/{Dashboard,Project,Task,Report}Controller.php`                  |
| Services      | `app/Services/{TaskService,ReportService}.php`                                        |
| Models        | `app/Models/{User,Project,Task,Report}.php`                                           |
| Jobs          | `app/Jobs/GenerateReportJob.php`                                                      |
| Middleware    | `app/Http/Middleware/HandleInertiaRequests.php`, `bootstrap/app.php`                  |
| Pages (React) | `resources/js/Pages/{Dashboard,Projects/Index,Projects/Show,Reports/Index}.jsx`       |
| Layout        | `resources/js/Layouts/AuthenticatedLayout.jsx`                                        |
| Migrations    | `database/migrations/2025_10_25_17062{1,2}_create_{projects,tasks,reports}_table.php` |

---

## Flow 1: Kanban Drag-and-Drop

### Complete Path

```
User drags task card
  → @hello-pangea/dnd <DragDropContext onDragEnd={handleDragEnd}>
    → handleDragEnd(result)                              [Projects/Show.jsx:24-37]
      → router.patch(route('tasks.updateStatus', taskId), { status: newStatus })
        → PATCH /tasks/{task}/status                     [routes/web.php:39]
          → TaskController::updateStatus($request, $task)  [TaskController.php:52-60]
            → $request->validate(['status' => 'required|in:pending,in-progress,done'])
            → TaskService::updateTaskStatus($task, $status)  [TaskService.php:34-46]
              → $task->update(['status' => $status])       [Eloquent UPDATE]
              → $task->fresh(['project', 'assignedUser'])  [reload from DB]
            → return back()                                [Inertia redirect]
              → Inertia re-renders Projects/Show with fresh data from ProjectController::show()
```

### Files Involved

| Step       | File                                      | Method/Line                                     |
| ---------- | ----------------------------------------- | ----------------------------------------------- |
| Drag event | `resources/js/Pages/Projects/Show.jsx`    | `handleDragEnd()` (L24-37)                      |
| Route      | `routes/web.php`                          | L39: `Route::patch('tasks/{task}/status', ...)` |
| Controller | `app/Http/Controllers/TaskController.php` | `updateStatus()` (L52-60)                       |
| Service    | `app/Services/TaskService.php`            | `updateTaskStatus()` (L34-46)                   |
| Model      | `app/Models/Task.php`                     | Eloquent `update()`                             |

### How the Drag Handler Works

```javascript
// Projects/Show.jsx:24-37
const handleDragEnd = (result) => {
    if (!result.destination) return; // Dropped outside a column — bail

    const { draggableId, destination } = result;
    const taskId = draggableId.replace("task-", ""); // Extract numeric ID
    const newStatus = destination.droppableId; // Column ID = status string

    router.patch(
        route("tasks.updateStatus", taskId),
        { status: newStatus },
        {
            preserveScroll: true, // Don't scroll to top after response
            preserveState: true, // Keep local component state
        },
    );
};
```

The `<Droppable droppableId={status}>` for each column means the `destination.droppableId` directly maps to `'pending' | 'in-progress' | 'done'` — validated server-side.

### Coupling Points

1. **No optimistic UI update.** The drag completes, Inertia fires a PATCH, and the UI waits for the server round-trip before re-rendering. On slow connections, the card visually snaps back to its original position, then re-renders into the new column. This is jarring but data-safe.

2. **Reports are NOT regenerated on status change.** `TaskService::updateTaskStatus()` does not call `ReportService`. Reports become stale the moment any task changes status. They stay stale until the next manual "Generate Reports" click or the midnight scheduler.

3. **No authorization check.** `TaskController::updateStatus()` uses Laravel route model binding (`Task $task`) but has no policy or gate check. Any authenticated user can change any task's status, even tasks in projects they didn't create.

### Edge Cases & Debugging Scenarios

| Scenario                              | What happens                                                                                                                       |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Drag to same column                   | `destination.droppableId` equals current status → unnecessary PATCH sent → DB update is a no-op (same value) → wasted round-trip   |
| Rapid successive drags                | Multiple PATCH requests fire simultaneously → race condition → last write wins → UI may show intermediate states during re-renders |
| Task deleted by another user mid-drag | Route model binding throws `ModelNotFoundException` → Laravel returns 404 → Inertia shows error page                               |
| Network failure during PATCH          | Inertia has no `onError` handler in this call → card snaps back with no user feedback                                              |
| `draggableId` format mismatch         | If `draggableId` isn't `task-{id}`, `replace('task-', '')` produces garbage → 404 from route model binding                         |

### What's Missing

- **Optimistic updates**: Card should visually move immediately, rollback on error
- **Same-column guard**: Check `if (source.droppableId === destination.droppableId && source.index === destination.index) return;`
- **Error handling**: `onError` callback in `router.patch()` options
- **Within-column reordering**: No `position`/`order` column on tasks — cards can only move between columns, not be reordered within a column

---

## Flow 2: Project Lifecycle

### Create Project

```
Dashboard.jsx "Create Project" button
  → setShowCreateModal(true)                         [Dashboard.jsx:10]
  → form submit → handleCreateProject(e)             [Dashboard.jsx:13-22]
    → router.post(route('projects.store'), formData)
      → POST /projects                               [routes/web.php:34 — resource route]
        → ProjectController::store($request)          [ProjectController.php:49-58]
          → $request->validate(['name' => 'required|string|max:255', ...])
          → Project::create($validated)               [Eloquent INSERT]
          → redirect()->route('projects.show', $project)
            → ProjectController::show($project)       [ProjectController.php:28-45]
              → Inertia renders Projects/Show with empty task columns
```

### Create Tasks Within Project

```
Projects/Show.jsx "Add Task" button
  → setShowCreateModal(true)                          [Show.jsx:7]
  → form submit → handleCreateTask(e)                [Show.jsx:39-57]
    → router.post(route('tasks.store'), { ...formData, project_id: project.id })
      → POST /tasks                                  [routes/web.php:37]
        → TaskController::store($request)             [TaskController.php:17-30]
          → validate: project_id (exists:projects,id), title, status, assigned_to (exists:users,id)
          → TaskService::createTask($validated)        [TaskService.php:10-19]
            → Task::create($data)                     [Eloquent INSERT]
          → return back() with success flash
```

### Task Assignment

Task creation form includes an `assigned_to` select populated by `users` prop from `ProjectController::show()`:

```php
// ProjectController.php:42
$users = User::select('id', 'name')->get();
```

This fetches **ALL users** in the system — no project-level membership filtering.

### Status Transitions

The only status transition mechanism is drag-and-drop (Flow 1) or the task create form's initial status dropdown. There is **no edit task UI** in `Projects/Show.jsx` — only create and delete.

### Project Deletion — Cascade Behavior

```
ProjectController::destroy($project)                  [ProjectController.php:69-74]
  → $project->delete()                                [Eloquent DELETE]
    → DB cascade: tasks table has onDelete('cascade')   [migration]
    → DB cascade: reports table has onDelete('cascade') [migration]
```

**What happens:**

1. All tasks belonging to the project are **cascade-deleted** at the database level
2. All reports for the project are **cascade-deleted** at the database level
3. Redirect to dashboard

**Critical observation:** The cascade happens at the DB level, bypassing Eloquent model events. If you add `deleting` observers on `Task` or `Report` later, they won't fire during project deletion.

### What's Missing

- **No project edit UI**: `ProjectController::update()` exists but there's no UI that calls it — dead code
- **No project ownership**: Projects have no `user_id`/`created_by` — any authenticated user sees and can delete any project
- **No soft deletes**: Once deleted, projects/tasks/reports are gone permanently
- **No confirmation modal for project deletion**: The destroy route exists but the Dashboard/Index UI doesn't expose a delete button (only the resource route). If someone crafts a DELETE request, the project and all data vanish.

---

## Flow 3: Report Generation

### Two Trigger Paths

#### Path A: Manual Trigger (Dashboard Button)

```
Dashboard.jsx "Generate Reports" button
  → handleGenerateReports()                           [Dashboard.jsx:24-29]
    → router.post(route('reports.generate'))
      → POST /reports/generate                        [routes/web.php:43]
        → ReportController::generate()                [ReportController.php:25-30]
          → GenerateReportJob::dispatch()              [QUEUED job]
          → return back() with flash "Report generation job has been queued."
```

#### Path B: Scheduled Job (Midnight)

```
routes/console.php
  → Schedule::job(new GenerateReportJob())->dailyAt('00:00')
    → GenerateReportJob::handle(ReportService)        [GenerateReportJob.php:23-37]
      → ReportService::generateAllReports()           [ReportService.php:36-49]
        → Project::all()                              [fetches ALL projects]
        → foreach project:
            → ReportService::generateReportForProject($project)  [ReportService.php:12-33]
              → aggregateTaskStats($project)           [ReportService.php:51-59]
                → $project->tasks (lazy load all tasks)
                → count by status: total, done, pending, in-progress
              → Report::updateOrCreate(                [UPSERT]
                  ['project_id' => $project->id],      [match key]
                  [stats + 'last_generated_at' => now()] [update values]
                )
```

### Scheduler vs. Manual — Can They Conflict?

**Yes, they can overlap.** Both paths dispatch the same `GenerateReportJob`. If a user clicks "Generate Reports" at 11:59 PM and the scheduler fires at midnight:

1. Two `GenerateReportJob` instances enter the queue
2. Both call `ReportService::generateAllReports()`
3. Both iterate all projects and call `Report::updateOrCreate()`
4. `updateOrCreate` uses `project_id` as the match key — so the second execution simply overwrites the first's results
5. **No data corruption**, but wasted compute and potential for confusing `last_generated_at` timestamps (two reports generated seconds apart)

**The job has no `ShouldBeUnique` implementation.** Adding `implements ShouldBeUnique` to `GenerateReportJob` would prevent overlapping queue execution.

### Report Data Staleness

Reports are **point-in-time snapshots**. The `ReportService::aggregateTaskStats()` method counts tasks at generation time:

```php
protected function aggregateTaskStats(Project $project): array
{
    $tasks = $project->tasks;  // Lazy-loads ALL tasks (N+1 risk at scale)
    return [
        'total' => $tasks->count(),
        'completed' => $tasks->where('status', 'done')->count(),
        'pending' => $tasks->where('status', 'pending')->count(),
        'in_progress' => $tasks->where('status', 'in-progress')->count(),
    ];
}
```

**No automatic recalculation happens when:**

- A task is created
- A task changes status (drag-and-drop)
- A task is deleted
- A user is deleted (assigned_to → null)

Reports remain stale until the next manual trigger or midnight run.

### ReportController::index() — Deduplication Logic

```php
$reports = Report::with('project')
    ->orderBy('last_generated_at', 'desc')
    ->get()
    ->groupBy('project_id')
    ->map(fn($projectReports) => $projectReports->first());
```

This groups all reports by project and takes only the latest per project. But since `updateOrCreate` already ensures one report per project (matched on `project_id`), the `groupBy` → `first()` logic is **redundant defensive code**. It would only matter if the `updateOrCreate` constraint were ever bypassed.

### What Could Break Silently

| Scenario                                | Impact                                                                                                                                             |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Queue worker not running                | Manual "Generate Reports" click succeeds (flash message shown) but job never executes → reports never update → user thinks generation worked       |
| Project created after report generation | New project has no report until next generation cycle                                                                                              |
| All tasks deleted from a project        | Next report shows `total_tasks: 0` — correct but potentially confusing                                                                             |
| `$project->tasks` N+1 query             | `generateAllReports()` loads ALL projects, then for each calls `$project->tasks` — each is a separate query. With 100 projects, that's 101 queries |

---

## Flow 4: Task Assignment & User Deletion

### Task Creation with Assignee

```
Projects/Show.jsx task creation form
  → assigned_to select (populated from `users` prop)  [Show.jsx:201-212]
    → value sent as formData.assigned_to
      → TaskController::store() validates: 'assigned_to' => 'nullable|exists:users,id'
        → TaskService::createTask() → Task::create(['assigned_to' => userId])
```

### User Deletion → Task Orphaning

The `tasks` migration defines:

```php
$table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
```

When a user is deleted:

1. `ProfileController::destroy()` calls `$user->delete()` — which is a standard Eloquent soft/hard delete
2. The DB FK constraint fires `ON DELETE SET NULL`
3. All tasks where `assigned_to = deleted_user_id` are updated to `assigned_to = NULL`
4. The task remains in its project, just unassigned

**The flow through `ProfileController::destroy()`:**

```php
// ProfileController.php:49-63
public function destroy(Request $request): RedirectResponse
{
    $request->validate(['password' => ['required', 'current_password']]);
    $user = $request->user();
    Auth::logout();
    $user->delete();                    // ← triggers ON DELETE SET NULL for tasks
    $request->session()->invalidate();
    $request->session()->regenerateToken();
    return Redirect::to('/');
}
```

### Impact on Reports

Reports store **static snapshot counts** (`total_tasks`, `completed_tasks`, etc.) — they don't reference individual tasks or users. So:

- **User deletion**: No impact on existing reports (they're already point-in-time snapshots)
- **Task status change**: No impact on existing reports (reports are NOT regenerated automatically)
- **Task deletion**: No impact on existing reports (stale until next generation)

**This is a design gap.** Reports should arguably be regenerated (or invalidated) when task states change, but the current architecture treats them as batch-generated snapshots only.

### Debugging Scenario: "Report shows 10 tasks but project only has 8"

This is expected behavior — someone deleted 2 tasks after the last report generation. The report is a frozen-in-time snapshot. No mechanism exists to flag reports as stale.

---

## Flow 5: Authentication

### Registration Flow

```
/register (guest route)
  → RegisteredUserController::create()               [Auth/RegisteredUserController.php:22-25]
    → Inertia::render('Auth/Register')
      → Register.jsx form submit                     [Auth/Register.jsx:17-21]
        → useForm.post(route('register'))
          → POST /register                           [routes/auth.php:18]
            → RegisteredUserController::store()       [Auth/RegisteredUserController.php:33-51]
              → validate name, email, password (confirmed)
              → User::create([..., 'role' => 'member'])  ← hardcoded default role
              → event(new Registered($user))          [fires email verification if configured]
              → Auth::login($user)                    [session-based login]
              → redirect to /dashboard
```

### Login Flow

```
/login (guest route)
  → AuthenticatedSessionController::create()
    → Inertia::render('Auth/Login')
      → Login.jsx form submit
        → POST /login
          → LoginRequest::authenticate()              [credential verification]
          → $request->session()->regenerate()          [session fixation protection]
          → redirect()->intended(route('dashboard'))
```

### Session & Middleware Chain

```
bootstrap/app.php middleware stack:
  1. Laravel default web middleware (session, CSRF, etc.)
  2. HandleInertiaRequests::class                      [ADDED TWICE — BUG]
  3. AddLinkHeadersForPreloadedAssets::class
```

**BUG: `HandleInertiaRequests` is appended twice in `bootstrap/app.php`:**

```php
$middleware->web(append: [
    \App\Http\Middleware\HandleInertiaRequests::class,    // First time
    \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
]);

$middleware->web(append: [
    HandleInertiaRequests::class,                         // Second time — duplicate!
]);
```

This means the Inertia `share()` method runs twice per request. The `auth.user` data is shared both times (idempotent, so no data corruption), but it's wasted processing.

### Auth Data Sharing

```php
// HandleInertiaRequests.php:33-37
public function share(Request $request): array
{
    return [
        ...parent::share($request),
        'auth' => [
            'user' => $request->user(),  // Full User model serialized to JSON
        ],
    ];
}
```

Every Inertia page receives `auth.user` containing the full user object. The `AuthenticatedLayout` consumes this:

```javascript
// AuthenticatedLayout.jsx:9
const user = usePage().props.auth.user;
```

**Security note:** `User::$hidden = ['password', 'remember_token']` prevents these from being serialized, but `role`, `email`, `email_verified_at`, and `id` are all exposed to the client.

### Admin/Member Role System

The `User` model defines:

```php
public function isAdmin(): bool { return $this->role === 'admin'; }
public function isMember(): bool { return $this->role === 'member'; }
```

**However, these methods are NEVER called anywhere in the codebase.** There are:

- No role-based middleware
- No policy checks
- No gate definitions
- No UI differences based on role
- No admin-only routes

The `role` column exists in the database, defaults to `'member'` on registration, but is **completely unused**. This is dead infrastructure — either planned for future use or abandoned.

### Route Protection

All protected routes use `['auth', 'verified']` middleware:

```php
Route::middleware(['auth', 'verified'])->group(function () { ... });
```

- `auth` — requires authenticated session
- `verified` — requires email verification (if `MustVerifyEmail` interface is implemented on `User` model)

**The `User` model does NOT implement `MustVerifyEmail`**, so the `verified` middleware is effectively a no-op. Users can access the dashboard immediately after registration without verifying their email.

### Access Control Gap

Any authenticated user can:

- View ALL projects (no per-user filtering)
- Create/delete ANY project
- Create/update/delete ANY task in ANY project
- Trigger report generation
- View all reports

There is **zero authorization** beyond "is the user logged in?"

---

## Flow 6: Dashboard Data Aggregation

### Data Source: Controller-Side Aggregation

```php
// DashboardController.php:14-25
$projects = Project::withCount([
    'tasks',                                                    // → tasks_count
    'tasks as pending_tasks_count' => fn($q) => $q->where('status', 'pending'),
    'tasks as in_progress_tasks_count' => fn($q) => $q->where('status', 'in-progress'),
    'tasks as done_tasks_count' => fn($q) => $q->where('status', 'done'),
])->get();
```

This generates a single SQL query with correlated subqueries:

```sql
SELECT projects.*,
  (SELECT COUNT(*) FROM tasks WHERE tasks.project_id = projects.id) as tasks_count,
  (SELECT COUNT(*) FROM tasks WHERE tasks.project_id = projects.id AND status = 'pending') as pending_tasks_count,
  (SELECT COUNT(*) FROM tasks WHERE tasks.project_id = projects.id AND status = 'in-progress') as in_progress_tasks_count,
  (SELECT COUNT(*) FROM tasks WHERE tasks.project_id = projects.id AND status = 'done') as done_tasks_count
FROM projects
```

This is **efficient** — all data computed server-side in one query, no N+1.

### Client-Side Rendering

`Dashboard.jsx` receives `projects` prop (array of project objects with `*_count` attributes) and does minimal client computation:

```javascript
// Dashboard.jsx — Progress calculation (inline in JSX, L141-148)
{project.tasks_count > 0
    ? Math.round(((project.done_tasks_count || 0) / project.tasks_count) * 100)
    : 0}%
```

The progress bar width uses the same formula. This is **purely presentational math** — no data fetching or aggregation on the client.

### Dashboard vs. Reports Page — Data Source Difference

| View         | Data Source               | Freshness                                               |
| ------------ | ------------------------- | ------------------------------------------------------- |
| Dashboard    | Live `withCount` queries  | Always fresh (computed on page load)                    |
| Reports page | `reports` table snapshots | Stale (only updated on manual trigger or midnight cron) |

**This creates a confusing UX:** The Dashboard shows real-time task counts, but the Reports page can show different numbers if tasks changed after the last report generation. Users may think there's a bug.

### Project Cards on Dashboard

Each project card is a `<Link>` (Inertia navigation) to `route('projects.show', project.id)`. The card displays:

- Project name and description
- Task counts (total, pending, in-progress, done)
- Progress bar (% done)

### What's Missing

- **No pagination**: `Project::withCount(...)->get()` loads ALL projects. With hundreds of projects, this query and the resulting JSON payload will be slow.
- **No search/filter**: Can't filter projects by name, status, or date
- **No loading state**: Inertia handles page transitions, but there's no skeleton/spinner while the dashboard loads
- **No real-time updates**: Dashboard data is snapshot-on-load. If another user creates a task, the dashboard won't reflect it until the next page navigation.

---

## Cross-Cutting Concerns & System-Wide Coupling Map

### Feature Coupling Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                        DASHBOARD                                  │
│  DashboardController::index()                                     │
│  → Project::withCount(tasks by status)                            │
│  → Inertia::render('Dashboard', projects)                         │
│                                                                    │
│  "Create Project" → ProjectController::store()                    │
│  "Generate Reports" → ReportController::generate()                │
│                         → GenerateReportJob::dispatch()            │
│                           → ReportService::generateAllReports()   │
│                             → Report::updateOrCreate(...)          │
└────────────────────────────┬──────────────────┬───────────────────┘
                             │                  │
              ┌──────────────▼──────┐    ┌──────▼──────────────────┐
              │   PROJECT BOARD     │    │    REPORTS PAGE         │
              │  ProjectController  │    │  ReportController       │
              │  ::show()           │    │  ::index()              │
              │  → tasks grouped    │    │  → Report::with(project)│
              │    by status        │    │  → grouped by project   │
              │  → users for assign │    │                         │
              │                     │    │  Data: STALE SNAPSHOTS  │
              │  Drag-and-drop:     │    │  (no auto-refresh link  │
              │  → TaskController   │    │   to task changes)      │
              │    ::updateStatus() │    └─────────────────────────┘
              │  → TaskService      │
              │    ::updateTask     │
              │    Status()         │
              │  → NO report regen  │ ← DECOUPLED (gap)
              │                     │
              │  Task CRUD:         │
              │  → TaskController   │
              │    ::store/destroy  │
              │  → TaskService      │
              └─────────────────────┘
```

### Where Bugs Would Cascade

| Root Cause                                                        | Cascade                                                                                                                                                     |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Task` model `$fillable` missing a field                          | `Task::create()` silently ignores the field → task saved without it → UI shows `null`/`undefined`                                                           |
| `tasks` migration `onDelete('cascade')` removed                   | Project deletion leaves orphan tasks → `generateAllReports()` still counts them → report numbers correct but tasks are inaccessible                         |
| Queue worker dies                                                 | Report generation jobs never execute → reports page shows stale/no data → "Generate Reports" button appears broken → no error visible to user               |
| `HandleInertiaRequests` middleware removed                        | `auth.user` not shared → `AuthenticatedLayout` throws `Cannot read properties of null (reading 'name')` → every authenticated page crashes                  |
| `User::$hidden` accidentally clears `password`                    | Password hash exposed in every Inertia response via `auth.user` sharing → security vulnerability                                                            |
| `status` enum values change (e.g., 'completed' instead of 'done') | Migration enum constraint rejects writes → drag-and-drop breaks → `ReportService` counts wrong column → dashboard `withCount` returns 0 for affected status |

### Silent Failure Modes

1. **Queue not running:** The "Generate Reports" button dispatches a job and shows a success flash. If no queue worker is active (`php artisan queue:work`), the job sits in the `jobs` table forever. The user sees "success" but reports never update. **No health check or feedback mechanism exists.**

2. **Scheduler not running:** `Schedule::job(new GenerateReportJob())->dailyAt('00:00')` only works if `php artisan schedule:run` is executed via cron. If the cron is missing, midnight reports just don't happen — silently.

3. **Project without tasks:** `Report::updateOrCreate` will create a report with all zeros. The Reports page shows a 0% progress card — technically correct but could be misinterpreted.

4. **Concurrent report generation:** No mutex/lock on `GenerateReportJob`. Two overlapping runs produce correct results (updateOrCreate is idempotent by project_id) but waste resources.

5. **User deletion during active session:** `ProfileController::destroy()` deletes the user, invalidates the session, but if the user has another browser tab open, subsequent requests will fail with auth errors. The `assigned_to` FK sets to null silently — no notification to project owners.

---

## Summary of Architectural Gaps

| Gap                                                     | Severity   | Impact                                                           |
| ------------------------------------------------------- | ---------- | ---------------------------------------------------------------- |
| No authorization/policies                               | **HIGH**   | Any user can modify/delete any project or task                   |
| Reports not auto-regenerated on task changes            | **MEDIUM** | Stale data on Reports page, confusing vs. Dashboard              |
| No optimistic UI for drag-and-drop                      | **LOW**    | Janky UX on slow connections                                     |
| `HandleInertiaRequests` registered twice                | **LOW**    | Wasted processing per request                                    |
| Role system (`admin`/`member`) unused                   | **LOW**    | Dead code, confusing for maintainers                             |
| No pagination on Dashboard                              | **MEDIUM** | Performance degrades with many projects                          |
| No `ShouldBeUnique` on report job                       | **LOW**    | Wasted compute on overlapping runs                               |
| No project ownership (`user_id`)                        | **HIGH**   | Multi-tenancy impossible                                         |
| `verified` middleware is no-op                          | **LOW**    | Email verification not enforced despite middleware               |
| No edit task UI (only create + delete)                  | **MEDIUM** | Users must delete and recreate tasks to change title/description |
| `Project::update()` route exists but no UI calls it     | **LOW**    | Dead code                                                        |
| N+1 query risk in `ReportService::aggregateTaskStats()` | **MEDIUM** | `$project->tasks` lazy-loads per project in a loop               |

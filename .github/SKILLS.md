# Principal Engineer Skills — MeenitsTrac (TRIGO)

> Skills demonstrated in the architecture, design, and implementation of **MeenitsTrac (TRIGO)** — a Kanban task tracker for engineering teams, built with Laravel 12, Inertia.js, React, and Tailwind CSS.

---

## 1. System Architecture & Design

### 1.1 Monolith SPA Architecture

- Built a clean **server-driven SPA** using the Inertia.js pattern:
    ```
    Browser ↔ Inertia.js ↔ Laravel Controllers ↔ Services ↔ Eloquent Models ↔ Database
    ```
- **No separate REST API** — all communication flows through Inertia.js server-side props, eliminating API versioning and serialization overhead.
- This demonstrates understanding of when a monolith is the right choice: for internal tools with single-deployment targets and tightly coupled frontend/backend concerns.

### 1.2 Service-Controller Pattern

- Clean **separation of business logic** from HTTP handling:
    - **Controllers** — request validation, authorization, Inertia responses
    - **Services** (`TaskService`, `ReportService`) — business logic, logging, data aggregation
    - **Jobs** (`GenerateReportJob`) — async background processing
- This pattern keeps controllers thin and testable while concentrating domain logic in focused service classes.

### 1.3 Domain Model Design

- 4 core entities with clear boundaries:
    - **Project** — top-level container for tasks and reports
    - **Task** — work items with status, assignee, due date
    - **Report** — automated aggregation snapshots per project
    - **User** — operators with role-based access (admin/member)

---

## 2. Database Engineering

### 2.1 Schema Design

- **Normalized relational schema** with proper foreign key constraints:
    - `tasks.project_id` → cascade delete (project deletion removes tasks)
    - `tasks.assigned_to` → set null on delete (user deletion orphans tasks rather than destroying them)
- **Infrastructure tables** for queue processing: `jobs`, `job_batches`, `failed_jobs` — demonstrating production-ready queue architecture.

### 2.2 Status Enum Modeling

- Task status modeled as a database enum: `pending`, `in-progress`, `done`.
- Maps directly to Kanban board columns, enabling **bidirectional sync** between database state and UI state.

### 2.3 Report Aggregation Storage

- Reports stored as **precomputed snapshots** (`total_tasks`, `completed_tasks`, `pending_tasks`, `in_progress_tasks`, `last_generated_at`) rather than computed on-the-fly.
- This demonstrates understanding of the **read-heavy optimization** pattern — trade storage for query performance.

---

## 3. Background Processing & Scheduling

### 3.1 Queue-Based Report Generation

- `GenerateReportJob` implements `ShouldQueue` for async processing via database queue driver.
- Dispatched both manually (from dashboard) and automatically via scheduler.

### 3.2 Task Scheduling

- Laravel scheduler configured for **daily midnight report generation** via `routes/console.php`.
- Pre/post execution logging to `scheduler` channel for observability.
- This demonstrates cron-free scheduling using Laravel's built-in scheduler.

---

## 4. Frontend Engineering

### 4.1 Kanban Board Implementation

- **3-column drag-and-drop Kanban board** powered by `@hello-pangea/dnd`:
    - Columns: Pending → In Progress → Done
    - Drag between columns triggers `PATCH /tasks/{task}/status` for instant status updates
    - Task cards display assignee, due date, and description
- Per-status column rendering with dynamic task sorting.

### 4.2 Accessible UI Architecture

- **@headlessui/react** for accessible UI primitives (dropdowns, modal transitions).
- **@heroicons/react** for consistent iconography.
- **Ziggy** route generation — Laravel named routes available in JS via `route()` helper, eliminating URL string duplication.

### 4.3 Layout System

- **3 layout components** for different contexts:
    - `AuthenticatedLayout` — full navigation with dashboard, projects, reports links, user dropdown, responsive hamburger menu
    - `GuestLayout` — centered card for auth forms
    - `AppLayout` — alternative authenticated layout with admin badge
- Responsive design with mobile hamburger menu navigation.

### 4.4 Page Architecture

- **10+ pages** covering the full application surface:
    - `Welcome.jsx` — public landing with hero section and feature grid
    - `Dashboard.jsx` — project cards with task breakdown, progress bars, create project modal, report generation
    - `Projects/Show.jsx` — core Kanban board with drag-and-drop
    - `Reports/Index.jsx` — report cards with completion rates and progress visualization
    - Full authentication flow (login, register, forgot/reset password, email verification)
    - Profile management with info, password, and account deletion partials

### 4.5 Reusable Component Library

- **12 shared components**: `ApplicationLogo`, `Checkbox`, `DangerButton`, `Dropdown`, `InputError`, `InputLabel`, `Modal`, `NavLink`, `PrimaryButton`, `ResponsiveNavLink`, `SecondaryButton`, `TextInput`.
- Demonstrates component-driven development with consistent styling and behavior.

---

## 5. Authentication & Authorization

### 5.1 Full Authentication Flow

- **Laravel Breeze** with Inertia.js + React stack providing:
    - Registration with automatic role assignment (default: `member`)
    - Login with session persistence
    - Password reset flow (forgot → email token → reset form)
    - Email verification support (`verified` middleware on protected routes)
    - Password confirmation for sensitive operations
    - Account deletion with confirmation

### 5.2 Role-Based Access

- **Role enum** on users table: `admin` / `member`
- Helper methods: `isAdmin()`, `isMember()`
- `HandleInertiaRequests` middleware shares `auth.user` to all pages for frontend role-aware rendering.

---

## 6. Service Layer Design

### 6.1 TaskService

- `createTask(array $data)` — creates task with eager-loaded relationships and structured logging
- `updateTask(Task, array $data)` — full update with relationship refresh
- `updateTaskStatus(Task, string $status)` — status-only update optimized for drag-and-drop operations
- `deleteTask(Task)` — soft logic with audit logging

### 6.2 ReportService

- `generateReportForProject(Project)` — aggregates task counts per status, upserts report snapshot
- `generateAllReports()` — iterates all projects for batch report generation
- `aggregateTaskStats(Project)` — returns `[total, completed, pending, in_progress]` counts
- **Upsert pattern**: Reports are created or updated (not duplicated) per generation run.

---

## 7. Cross-Product Integration Readiness

### 7.1 MeenitsForOrgs Action Item Sync

- MeenitsTrac's task status model (`pending`, `in-progress`, `done`) maps directly to MeenitsForOrgs' `ActionItem` model.
- MeenitsForOrgs includes bidirectional status mapping constants:
    - `STATUS_TO_COLUMN`: `todo → pending`, `in_progress → in-progress`, `done → done`
    - `COLUMN_TO_STATUS`: reverse mapping
- MeenitsForOrgs' `action_items` table includes `board_column` and `board_position` fields for Kanban board position tracking.
- This demonstrates **cross-product architectural planning** — building integration touchpoints in both codebases before the integration exists.

---

## 8. DevOps & Production Readiness

### 8.1 Queue Infrastructure

- Database queue driver with `jobs`, `job_batches`, and `failed_jobs` tables.
- Queue worker management via `php artisan queue:listen`.
- No external queue dependency (Redis/SQS) — appropriate for the application's scale.

### 8.2 Testing Framework

- PHPUnit 11 with SQLite in-memory database for fast, isolated tests.
- Feature tests for authentication flow and profile management.
- Test infrastructure ready for `TaskTest`, `ReportGenerationTest`, `SchedulerTest` expansion.

### 8.3 Development Tooling

- **Laravel Pint** — code style enforcement (PHP-CS-Fixer)
- **Laravel Pail** — real-time log tailing
- **Laravel Sail** — Docker development environment
- **Vite** — fast HMR for frontend development

---

## 9. Code Quality Patterns

### 9.1 Middleware Architecture

- `HandleInertiaRequests` shares authentication state to all pages — single source of truth for frontend auth data.
- Standard Laravel middleware stack for throttling, CSRF, session management.

### 9.2 Logging Strategy

- Services log all CRUD operations with structured context.
- Scheduler logs pre/post execution to dedicated channel.
- Failed jobs tracked in `failed_jobs` table for post-mortem analysis.

### 9.3 Data Integrity

- Foreign key constraints enforce referential integrity at the database level.
- Cascade delete for project → tasks (clean teardown).
- Set null for user → tasks (preserve work when removing users).
- Report timestamps (`last_generated_at`) provide audit trail for automated processes.

---

## 10. Design & Style Uniformity

### 10.1 Consistent Architectural Patterns

- **Every controller** delegates to a service for business logic — no controller contains direct database queries or complex data manipulation.
- **Every service method** follows the same pattern: receive data → perform operation → log result → return response. `TaskService` and `ReportService` use identical logging and error handling conventions.
- **Every CRUD operation** follows the same lifecycle: validate → service call → Inertia redirect with flash message.

### 10.2 Frontend Uniformity

- **Layout selection** is consistent by context: `AuthenticatedLayout` for all protected pages, `GuestLayout` for all auth forms — no page renders outside its designated layout.
- **12 shared components** (`PrimaryButton`, `DangerButton`, `SecondaryButton`, `Modal`, `TextInput`, `InputLabel`, `InputError`, etc.) used uniformly across all pages — no one-off form elements or button styles.
- **Kanban board** uses a single drag-and-drop pattern (`@hello-pangea/dnd`) with consistent card rendering across all 3 columns — task cards look and behave identically regardless of status column.
- **Dashboard project cards** follow the same visual template: project name, task count breakdown, progress bar, action buttons — every project is rendered identically.

### 10.3 Visual Design Consistency

- **Tailwind CSS utility classes** are the styling approach — unlike MeenitsForOrgs (native CSS) and MeenitsAI (CSS modules + MUI). All styling is done through Tailwind utility composition directly in JSX. No custom CSS file or `app.css` design system exists. This distinction is critical: adding semantic CSS classes or a custom stylesheet would violate the project's convention.
- **Heroicons** used as the single icon set — no mixing of icon libraries.
- **Headless UI** used for all interactive overlays (modals, dropdowns) — consistent transition animations and accessibility.
- **Progress bars** for task completion use the same color coding and percentage calculation across dashboard and reports.

### 10.4 Naming & Organization Conventions

- **PascalCase** for React components (`Dashboard.jsx`, `ApplicationLogo.jsx`).
- **camelCase** for JS functions.
- **snake_case** for PHP methods and database columns.
- **Laravel conventions** followed without deviation: `app/Models/`, `app/Services/`, `app/Jobs/`, `database/migrations/`, `resources/js/Pages/`, `resources/js/Components/`, `resources/js/Layouts/`.
- **Ziggy route helper** used everywhere for URL generation — no hardcoded URL strings in the frontend.

---

## 11. Core Development & Debugging — Feature Flow Mastery

### 11.1 Kanban Drag-and-Drop — Full Round-Trip Flow

```
Projects/Show.jsx: user drags task card from "Pending" to "In Progress"
  → @hello-pangea/dnd onDragEnd callback
    → Extract: source.droppableId (column), destination.droppableId (column), draggableId (task ID)
    → Map column name to status enum: "In Progress" → "in-progress"
    → router.patch(route('tasks.updateStatus', task.id), { status: 'in-progress' })
      → TaskController::updateStatus(Request, Task)
        → Validate: status ∈ ['pending', 'in-progress', 'done']
        → TaskService::updateTaskStatus(task, status)
          → task.update(['status' => $status])
          → Log: "Task {id} status updated to {status}"
        → return back() (Inertia redirect → re-renders page with fresh data)
  → Card appears in new column with fresh server data
```

**Debugging implications**:

- **No optimistic UI**: The card snaps back to its original position during the server round-trip, then jumps to the new column on response. Users may perceive this as a bug ("card flickered").
- **No same-column guard**: Dropping a card back in its own column fires a PATCH request with the same status — a wasted HTTP call that still triggers logging.
- **No error handler**: The `router.patch()` call has no `.onError()` callback. A 500 response silently fails — the card appears to snap back with no explanation.
- **No authorization**: `TaskController::updateStatus` doesn't check task ownership or project membership. Any authenticated user can change any task's status.

### 11.2 Report Generation — Dual Trigger Race Condition

```
Path 1 — Manual trigger:
  Dashboard.jsx → "Generate Reports" button
    → router.post(route('reports.generate'))
      → ReportController::generate()
        → GenerateReportJob::dispatch()
        → Flash: "Report generation started"
        → redirect back()

Path 2 — Scheduled trigger:
  routes/console.php → Schedule::job(GenerateReportJob)->daily()->at('00:00')
    → GenerateReportJob::handle()
      → ReportService::generateAllReports()
        → foreach Project → aggregateTaskStats() → Report::updateOrCreate()
```

**Cross-cutting concerns**:

- **Race condition**: Manual trigger and midnight scheduler can overlap. Both dispatch `GenerateReportJob` without deduplication (`ShouldBeUnique` is not implemented). However, `Report::updateOrCreate()` keyed on `project_id` makes concurrent runs **idempotent** — they produce the same result but waste queue worker time.
- **Silent failure**: If the queue worker isn't running (`php artisan queue:listen` not started), the "Generate Reports" button shows a success flash message but **nothing actually happens**. The job sits in the `jobs` table indefinitely. Debugging "reports not updating" requires checking queue worker status, not application code.
- **Data staleness**: Reports are **point-in-time snapshots**, not live views. The Dashboard shows live `withCount` queries while the Reports page shows frozen snapshots. A user seeing "3 completed tasks" on the Dashboard but "1 completed task" on Reports isn't experiencing a bug — it's the intentional snapshot design, but it creates confusing UX.

### 11.3 Task ↔ Report — Missing Reactivity Chain

```
Task status change:
  TaskController::updateStatus() → TaskService::updateTaskStatus() → DB update → return
  ❌ No report regeneration triggered
  ❌ No event dispatched
  ❌ No cache invalidation

Report generation:
  ReportService::aggregateTaskStats() → DB query at generation time
  ✅ Reads current task state when manually triggered
```

**Debugging implication**: Task status changes and report data are **eventually consistent** — but only when someone triggers report generation. Between triggers, reports show stale data. A principal engineer understands this is a design decision (reports as historical snapshots) but must recognize it creates user confusion when Dashboard counts and Report counts diverge.

### 11.4 Project Deletion — Cascade Chain

```
ProjectController::destroy(Project $project)
  → $project->delete()
    → DB cascade: tasks WHERE project_id = $project->id → DELETED
    → DB cascade: reports WHERE project_id = $project->id → DELETED
    → No soft delete — permanent destruction
```

**Cross-cutting**: Deleting a project also destroys all its tasks, which means `tasks.assigned_to` references to users are severed. The user's task count drops instantly, but if a stale report snapshot exists in another project referencing the same user, it still shows the old count. The cascade is correct at the DB level but has no application-layer side effects (no notifications, no audit log, no confirmation beyond the UI modal).

### 11.5 User Deletion → Task Orphaning

```
ProfileController::destroy()
  → User::delete()
    → DB FK: tasks.assigned_to SET NULL (tasks survive, become unassigned)
    → DB FK: sessions table → CASCADE (session destroyed)
    → No cascade to reports (reports don't reference users directly)
```

**Debugging implication**: After user deletion, tasks appear as "Unassigned" in the Kanban board — this is correct behavior. But if a report was generated before the deletion, it still reflects the old assignment counts. And since no code notifies other users about orphaned tasks, team members may not notice that tasks lost their assignee.

### 11.6 Authentication → Authorization Gap

```
User registration:
  RegisteredUserController::store()
    → User::create(['role' => 'member'])  // default role
    → Login
    → Redirect to /dashboard

Role usage:
  User model: isAdmin(), isMember() helpers → EXIST
  Controllers: → NEVER call isAdmin() or isMember()
  Middleware: 'auth', 'verified' → but NOT role-based
  Policies: → NONE registered
```

**Debugging implication**: The role column and helper methods exist but are **never enforced**. Any authenticated user has full CRUD access to all projects, tasks, and reports. A bug report saying "member can delete projects" is not a bug — it's the current architecture. The role infrastructure is laid but the authorization layer is unimplemented. A principal engineer recognizes this as a planned-but-incomplete feature, not a misconfiguration.

### 11.7 Dashboard Data Flow — Server vs. Client Aggregation

```
DashboardController::index()
  → Project::withCount([
      'tasks',
      'tasks as completed_tasks_count' => fn($q) => $q->where('status', 'done'),
      'tasks as pending_tasks_count' => fn($q) => $q->where('status', 'pending'),
      'tasks as in_progress_tasks_count' => fn($q) => $q->where('status', 'in-progress')
    ])->get()
  → Inertia::render('Dashboard', ['projects' => $projects])

Dashboard.jsx:
  → Receives projects with pre-computed counts as props
  → Renders project cards with progress bars
  → Progress = completed_tasks_count / tasks_count * 100
```

**Performance insight**: All aggregation happens in a **single SQL query** using `withCount` subqueries — no N+1 problem. But `->get()` loads ALL projects without pagination. At scale, this becomes a single-query bottleneck that returns an unbounded result set. A principal engineer identifies this as fine for current usage but flags it as a scaling concern.

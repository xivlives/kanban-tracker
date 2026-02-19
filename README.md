# TRIGO. Kanban Task Tracker

A full-featured Kanban board application built with Laravel 11, Inertia.js, and React. Designed for small to medium engineering teams to manage projects, track tasks with drag-and-drop functionality, and generate automated daily reports.

## 🎯 Features

- **User Authentication**: Secure registration and login system with role-based access (Admin/Member)
- **Project Management**: Create and manage multiple projects
- **Kanban Board**: Intuitive drag-and-drop interface with three columns (Pending, In Progress, Done)
- **Task Management**: Create, update, assign, and delete tasks with due dates
- **Automated Reports**: Daily scheduled job generates project statistics and completion rates
- **Real-time Updates**: Instant UI updates when tasks are moved between columns
- **Responsive Design**: Clean, modern UI built with Tailwind CSS

## 🛠 Tech Stack

### Backend
- **Laravel 11**: PHP framework
- **MySQL/SQLite**: Database
- **Inertia.js**: Modern monolith architecture
- **Laravel Breeze**: Authentication scaffolding
- **Queue System**: Background job processing

### Frontend
- **React 18**: UI library
- **Tailwind CSS v4**: Utility-first CSS framework
- **@hello-pangea/dnd**: Drag-and-drop functionality
- **Vite**: Fast build tool and dev server

### Testing
- **PHPUnit**: Unit and feature testing
- **SQLite (in-memory)**: Fast test database

## 📋 Requirements

- PHP 8.2 or higher
- Composer 2.x
- Node.js 18.x or higher
- npm 9.x or higher
- MySQL 8.0 or higher (or SQLite for development)
- Git

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/kanban-tracker.git
cd kanban-tracker
```

### 2. Install PHP Dependencies
```bash
composer install
```

### 3. Install Node Dependencies
```bash
npm install
```

### 4. Environment Setup
```bash
# Copy the environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

### 5. Configure Database

Edit `.env` file with your database credentials:

#### Option A: MySQL (Production)
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=tracklyy
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

#### Option B: SQLite (Quick Setup)
```env
DB_CONNECTION=sqlite
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=tracklyy
# DB_USERNAME=root
# DB_PASSWORD=
```

For SQLite, create the database file:
```bash
touch database/database.sqlite
```

### 6. Configure Queue Connection
```env
QUEUE_CONNECTION=database
```

### 7. Run Migrations
```bash
php artisan migrate
```

### 8. Seed Database (Optional)

Populate with sample data for testing:
```bash
php artisan db:seed
```

This creates:
- 3 users (1 admin, 2 members)
- 2 projects
- 6 tasks with various statuses

**Default Users:**
- Admin: `admin@example.com` / `password`
- Member 1: `john@example.com` / `password`
- Member 2: `jane@example.com` / `password`

### 9. Build Frontend Assets
```bash
# Development
npm run dev

# Production
npm run build
```

## 🎬 Running the Application

You need **THREE separate terminals** running simultaneously:

### Terminal 1: Vite Dev Server (Frontend)
```bash
npm run dev
```
Keep this running for hot-module-replacement and asset compilation.

### Terminal 2: Laravel Development Server (Backend)
```bash
php artisan serve
```
Default: http://localhost:8000

### Terminal 3: Queue Worker (Background Jobs)
```bash
php artisan queue:work
```
Required for report generation and other queued jobs.

### Access the Application

Open your browser and visit: **http://localhost:8000**

## 📅 Scheduled Tasks (Cron Jobs)

The application generates reports automatically every night at midnight.

### Development Setup

Test the scheduler manually:
```bash
php artisan schedule:run
```

Check the scheduler log:
```bash
tail -f storage/logs/scheduler.log
```

### Production Setup

Add this to your server's crontab:
```bash
# Edit crontab
crontab -e

# Add this line
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

To verify cron is set up correctly:
```bash
crontab -l
```

## 🧪 Testing

### Setup Test Environment

The project uses SQLite in-memory database for testing (configured in `phpunit.xml`).

### Run All Tests
```bash
php artisan test
```

### Run Specific Test Suite
```bash
# Run only feature tests
php artisan test tests/Feature

# Run only unit tests
php artisan test tests/Unit

# Run specific test file
php artisan test tests/Feature/TaskTest.php

# Run specific test method
php artisan test --filter test_can_create_task
```

### Run Tests with Coverage
```bash
php artisan test --coverage
```

### Run Tests in Parallel (Faster)
```bash
php artisan test --parallel
```

### Available Test Suites

1. **TaskTest**: Tests task creation, updating, status changes, and deletion
2. **ReportGenerationTest**: Tests report generation logic and job dispatching
3. **SchedulerTest**: Tests scheduled job execution

### Test Database Configuration

Tests use SQLite in-memory database by default (see `phpunit.xml`):
```xml
<env name="DB_CONNECTION" value="sqlite"/>
<env name="DB_DATABASE" value=":memory:"/>
```

To use MySQL for testing, create a test database:
```sql
CREATE DATABASE kanban_tracker_test;
```

Then update `phpunit.xml`:
```xml
<env name="DB_CONNECTION" value="mysql"/>
<env name="DB_DATABASE" value="kanban_tracker_test"/>
```

## 📁 Project Structure
```
kanban-tracker/
├── app/
│   ├── Console/
│   │   └── Kernel.php (removed in Laravel 11, see routes/console.php)
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── DashboardController.php
│   │   │   ├── ProjectController.php
│   │   │   ├── TaskController.php
│   │   │   └── ReportController.php
│   │   └── Middleware/
│   │       └── HandleInertiaRequests.php
│   ├── Jobs/
│   │   └── GenerateReportJob.php
│   ├── Models/
│   │   ├── User.php
│   │   ├── Project.php
│   │   ├── Task.php
│   │   └── Report.php
│   └── Services/
│       ├── TaskService.php
│       └── ReportService.php
├── database/
│   ├── factories/
│   │   ├── ProjectFactory.php
│   │   └── TaskFactory.php
│   ├── migrations/
│   └── seeders/
│       └── DatabaseSeeder.php
├── resources/
│   ├── css/
│   │   └── app.css
│   ├── js/
│   │   ├── Components/
│   │   │   └── ApplicationLogo.jsx
│   │   ├── Layouts/
│   │   │   └── AuthenticatedLayout.jsx
│   │   ├── Pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Welcome.jsx
│   │   │   ├── Projects/
│   │   │   │   ├── Index.jsx
│   │   │   │   └── Show.jsx (Kanban Board)
│   │   │   └── Reports/
│   │   │       └── Index.jsx
│   │   └── app.jsx
│   └── views/
│       └── app.blade.php
├── routes/
│   ├── web.php
│   ├── console.php (scheduler configuration)
│   └── auth.php
├── tests/
│   ├── Feature/
│   │   ├── TaskTest.php
│   │   ├── ReportGenerationTest.php
│   │   └── SchedulerTest.php
│   └── Unit/
├── .env.example
├── composer.json
├── package.json
├── phpunit.xml
├── vite.config.js
└── tailwind.config.js (not needed for Tailwind v4)
```

## 🏗 Architecture

### Service-Controller Pattern

The application follows a clean architecture pattern:

- **Controllers**: Handle HTTP requests, validation, and responses
- **Services**: Contain business logic (TaskService, ReportService)
- **Jobs**: Handle background processing (GenerateReportJob)
- **Models**: Define data structure and relationships

### Example Flow:
```
User clicks "Move Task" 
    → TaskController receives request
    → TaskService updates task status
    → Database updated
    → Inertia returns updated data to React
    → UI updates instantly
```

## 🔄 Key Workflows

### Task Management Flow

1. User creates task via modal form
2. TaskController validates input
3. TaskService creates task with logging
4. Task appears on Kanban board
5. User drags task to new column
6. Frontend calls `tasks.updateStatus` endpoint
7. TaskService updates status
8. UI reflects change immediately

### Report Generation Flow

**Manual Trigger:**
1. User clicks "Generate Reports"
2. ReportController dispatches GenerateReportJob
3. Queue worker picks up job
4. ReportService aggregates task statistics for all projects
5. Reports saved to database with timestamp
6. User can view reports on Reports page

**Automatic (Scheduled):**
1. Cron runs `php artisan schedule:run` every minute
2. At midnight, scheduler dispatches GenerateReportJob
3. Job processes in background
4. Logs written to `storage/logs/scheduler.log`

## 🔐 Authentication & Roles

### User Roles

- **Admin**: Can manage all projects and generate reports
- **Member**: Can create tasks and update task status

### Role Implementation
```php
// User Model
public function isAdmin(): bool
{
    return $this->role === 'admin';
}

public function isMember(): bool
{
    return $this->role === 'member';
}
```

### Protected Routes

All application routes except landing page require authentication:
```php
Route::middleware(['auth', 'verified'])->group(function () {
    // All protected routes here
});
```

## 📊 Database Schema

### Users
- id, name, email, password, role (admin/member), timestamps

### Projects
- id, name, description, timestamps

### Tasks
- id, project_id, title, description, status (pending/in-progress/done)
- assigned_to (user_id), due_date, timestamps

### Reports
- id, project_id, total_tasks, completed_tasks, pending_tasks
- in_progress_tasks, last_generated_at, timestamps

### Relationships
- Project → has many Tasks
- Project → has many Reports
- Task → belongs to Project
- Task → belongs to User (assigned_to)
- Report → belongs to Project

## 🎨 Customization

### Change Application Name

Edit `.env`:
```env
APP_NAME="Your App Name"
```

### Modify Task Statuses

Update in three places:

1. **Migration**: `database/migrations/xxxx_create_tasks_table.php`
```php
$table->enum('status', ['pending', 'in-progress', 'done', 'your-new-status']);
```

2. **Frontend**: `resources/js/Pages/Projects/Show.jsx`
```jsx
const columns = {
    pending: { title: 'Pending', color: 'bg-yellow-50' },
    'in-progress': { title: 'In Progress', color: 'bg-blue-50' },
    done: { title: 'Done', color: 'bg-green-50' },
    'your-new-status': { title: 'Your Status', color: 'bg-purple-50' },
};
```

3. **Validation**: Update controller validation rules

### Add Custom Logo

Place your logo in `public/images/logo.png`, then update:

`resources/js/Components/ApplicationLogo.jsx`:
```jsx
export default function ApplicationLogo(props) {
    return (
        <img
            {...props}
            src="/images/logo.png"
            alt="Logo"
            className="h-10 w-auto"
        />
    );
}
```

## 🐛 Troubleshooting

### Issue: Blank White Screen

**Solution:**
```bash
# Clear all caches
php artisan optimize:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Rebuild frontend
npm run dev -- --force
```

Check browser console (F12) for JavaScript errors.

### Issue: Reports Not Generating

**Solution:**
1. Ensure queue worker is running: `php artisan queue:work`
2. Check queue connection in `.env`: `QUEUE_CONNECTION=database`
3. Verify jobs table exists: `php artisan migrate`
4. Check logs: `tail -f storage/logs/laravel.log`

### Issue: Drag and Drop Not Working

**Solution:**
1. Ensure `@hello-pangea/dnd` is installed: `npm install`
2. Check browser console for errors
3. Verify tasks have unique IDs
4. Clear browser cache

### Issue: Vite Connection Error

**Solution:**
```bash
# Stop Vite
# Delete node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
npm run dev
```

### Issue: Permission Denied on storage/logs

**Solution:**
```bash
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

### Issue: Tests Failing

**Solution:**
```bash
# Ensure test database is set up
php artisan migrate --env=testing

# Clear test cache
php artisan config:clear
php artisan cache:clear

# Run specific test to debug
php artisan test --filter test_name --verbose
```

## 📝 Logging

### Application Logs
```bash
# Main application log
tail -f storage/logs/laravel.log

# Scheduler log
tail -f storage/logs/scheduler.log
```

### Log Channels

Configured in `config/logging.php`:
- **default**: General application logs
- **scheduler**: Scheduled job execution logs

## 🚀 Deployment

### Production Checklist

1. **Environment Configuration**
```bash
# Set to production
APP_ENV=production
APP_DEBUG=false

# Set your production URL
APP_URL=https://yourdomain.com

# Use secure database credentials
DB_PASSWORD=strong_secure_password
```

2. **Optimize Application**
```bash
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
npm run build
```

3. **Set Permissions**
```bash
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

4. **Configure Web Server**

**Nginx Example:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/kanban-tracker/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

5. **Set Up Supervisor for Queue Worker**

Create `/etc/supervisor/conf.d/kanban-tracker.conf`:
```ini
[program:kanban-tracker-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/kanban-tracker/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/kanban-tracker/storage/logs/worker.log
stopwaitsecs=3600
```

Reload supervisor:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start kanban-tracker-worker:*
```

6. **Configure Cron**
```bash
* * * * * cd /var/www/kanban-tracker && php artisan schedule:run >> /dev/null 2>&1
```

7. **SSL Certificate (Let's Encrypt)**
```bash
sudo certbot --nginx -d yourdomain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards

- Follow PSR-12 for PHP code
- Use ESLint/Prettier for JavaScript/React
- Write tests for new features
- Update documentation

## 📄 License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## 👥 Credits

Developed as a technical assessment project demonstrating:
- Laravel 11 + Inertia.js + React integration
- Service-Controller architecture pattern
- Queue-based background job processing
- Automated scheduled tasks
- Comprehensive testing practices

## 📧 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Built with ❤️ using Laravel, React, and Inertia.js**
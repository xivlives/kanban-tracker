import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { Inbox, Flag, Zap, ArrowRight } from 'lucide-react';

export default function Index({ tasks = [], labels = [], projects = [] }) {
    const [filterLabel, setFilterLabel] = useState('');
    const [filterProject, setFilterProject] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const filtered = useMemo(() => {
        return tasks.filter(task => {
            if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())
                && !(task.task_key || '').toLowerCase().includes(searchQuery.toLowerCase())) return false;
            if (filterLabel && task.label !== filterLabel) return false;
            if (filterProject && String(task.project_id) !== filterProject) return false;
            return true;
        });
    }, [tasks, searchQuery, filterLabel, filterProject]);

    const handleMoveToBoard = (taskId) => {
        router.patch(route('tasks.updateStatus', taskId), { status: 'in-progress' }, {
            preserveScroll: true,
        });
    };

    return (
        <SidebarLayout header="Backlog">
            <Head title="Backlog" />

            {/* Info banner */}
            <div className="mb-6 rounded-xl border border-[var(--trac-primary-200)] bg-[var(--trac-primary-50)] p-4">
                <div className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--trac-primary-600)' }}>
                    <Inbox size={16} />
                    Backlog — {tasks.length} pending {tasks.length === 1 ? 'task' : 'tasks'} across all projects
                </div>
                <p className="mt-1 text-xs text-gray-500">
                    These tasks are in the "To Do" column. Move them to "In Progress" when you're ready to start.
                </p>
            </div>

            {/* Filters */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search backlog..."
                    className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 w-56 focus:border-[var(--trac-primary)] focus:ring-1 focus:ring-[var(--trac-primary)] focus:outline-none"
                />
                {labels.length > 0 && (
                    <select value={filterLabel} onChange={(e) => setFilterLabel(e.target.value)}
                            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:border-[var(--trac-primary)] focus:ring-1 focus:ring-[var(--trac-primary)]">
                        <option value="">All labels</option>
                        {labels.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                )}
                {projects.length > 1 && (
                    <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)}
                            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:border-[var(--trac-primary)] focus:ring-1 focus:ring-[var(--trac-primary)]">
                        <option value="">All projects</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                )}
            </div>

            {/* Task list */}
            {filtered.length === 0 ? (
                <div className="rounded-xl bg-white py-16 text-center shadow-sm ring-1 ring-gray-100">
                    <Inbox className="mx-auto h-10 w-10 text-gray-300" />
                    <h3 className="mt-3 text-sm font-medium text-gray-900">Backlog is empty</h3>
                    <p className="mt-1 text-sm text-gray-500">No pending tasks found.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filtered.map(task => (
                        <div key={task.id} className="flex items-center gap-4 rounded-lg bg-white px-4 py-3 shadow-sm ring-1 ring-gray-100 hover:shadow-md transition-shadow group">
                            {/* Priority indicator */}
                            <div className="w-1 self-stretch rounded-full shrink-0" style={{
                                backgroundColor: task.priority === 'urgent' ? 'var(--trac-danger)' :
                                    task.priority === 'high' ? 'var(--trac-orange)' :
                                    task.priority === 'medium' ? 'oklch(80% 0 0)' : 'oklch(90% 0 0)'
                            }} />

                            {/* Key */}
                            <span className="text-xs font-mono font-semibold text-gray-400 w-16 shrink-0">
                                {task.task_key || `#${task.id}`}
                            </span>

                            {/* Title & label */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <Link href={route('projects.show', task.project_id)} className="text-sm font-medium text-gray-900 truncate hover:text-[var(--trac-primary)] transition-colors">
                                        {task.title}
                                    </Link>
                                    {task.source_app === 'MeenitsApp' && (
                                        <Zap size={12} className="shrink-0" style={{ color: 'var(--trac-accent)' }} fill="currentColor" />
                                    )}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs text-gray-400">{task.project?.name}</span>
                                    {task.label && (
                                        <span className="trac-label" style={{ fontSize: '0.6rem', padding: '0 0.4rem' }}>
                                            {task.label}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Assignee */}
                            {task.assigned_user && (
                                <span className="trac-avatar trac-avatar-sm shrink-0" style={{ backgroundColor: 'var(--trac-primary)' }}>
                                    {task.assigned_user.name.charAt(0)}
                                </span>
                            )}

                            {/* Move to board button */}
                            <button
                                onClick={() => handleMoveToBoard(task.id)}
                                className="shrink-0 opacity-0 group-hover:opacity-100 text-xs font-semibold text-[var(--trac-primary)] hover:text-[var(--trac-primary-600)] transition-all flex items-center gap-1"
                            >
                                Start <ArrowRight size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </SidebarLayout>
    );
}

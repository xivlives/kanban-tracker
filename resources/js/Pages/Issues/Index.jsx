import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { AlertCircle, Search, Flag, Zap, ChevronLeft, ChevronRight } from 'lucide-react';

const STATUS_MAP = {
    'pending': { label: 'To Do', bg: 'bg-gray-100', text: 'text-gray-700' },
    'in-progress': { label: 'In Progress', bg: 'bg-blue-50', text: 'text-blue-700' },
    'in-review': { label: 'In Review', bg: 'bg-yellow-50', text: 'text-yellow-700' },
    'done': { label: 'Done', bg: 'bg-green-50', text: 'text-green-700' },
};

const PRIORITY_MAP = {
    'urgent': { label: 'Urgent', color: 'var(--trac-danger)' },
    'high': { label: 'High', color: 'var(--trac-orange)' },
    'medium': { label: 'Medium', color: 'oklch(60% 0 0)' },
    'low': { label: 'Low', color: 'oklch(75% 0 0)' },
};

export default function Index({ tasks, labels = [], projects = [], users = [], filters = {} }) {
    const [form, setForm] = useState({
        search: filters.search || '',
        status: filters.status || '',
        label: filters.label || '',
        priority: filters.priority || '',
        assigned_to: filters.assigned_to || '',
        project_id: filters.project_id || '',
    });

    const applyFilters = (newFilters) => {
        const updated = { ...form, ...newFilters };
        setForm(updated);
        // Strip empty values
        const params = Object.fromEntries(Object.entries(updated).filter(([_, v]) => v));
        router.get(route('issues.index'), params, { preserveState: true, preserveScroll: true });
    };

    const clearFilters = () => {
        const cleared = { search: '', status: '', label: '', priority: '', assigned_to: '', project_id: '' };
        setForm(cleared);
        router.get(route('issues.index'), {}, { preserveState: true });
    };

    const hasFilters = Object.values(form).some(v => v);

    return (
        <SidebarLayout header="Issues">
            <Head title="Issues" />

            {/* Filters bar */}
            <div className="mb-6 flex flex-wrap items-center gap-3">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={form.search}
                        onChange={(e) => setForm({ ...form, search: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && applyFilters({ search: form.search })}
                        placeholder="Search issues..."
                        className="pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg w-56 focus:border-[var(--trac-primary)] focus:ring-1 focus:ring-[var(--trac-primary)] focus:outline-none"
                    />
                </div>

                <select value={form.status} onChange={(e) => applyFilters({ status: e.target.value })}
                        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:border-[var(--trac-primary)] focus:ring-1 focus:ring-[var(--trac-primary)]">
                    <option value="">All statuses</option>
                    {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>

                {labels.length > 0 && (
                    <select value={form.label} onChange={(e) => applyFilters({ label: e.target.value })}
                            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:border-[var(--trac-primary)] focus:ring-1 focus:ring-[var(--trac-primary)]">
                        <option value="">All labels</option>
                        {labels.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                )}

                <select value={form.priority} onChange={(e) => applyFilters({ priority: e.target.value })}
                        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:border-[var(--trac-primary)] focus:ring-1 focus:ring-[var(--trac-primary)]">
                    <option value="">All priorities</option>
                    {Object.entries(PRIORITY_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>

                {projects.length > 1 && (
                    <select value={form.project_id} onChange={(e) => applyFilters({ project_id: e.target.value })}
                            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:border-[var(--trac-primary)] focus:ring-1 focus:ring-[var(--trac-primary)]">
                        <option value="">All projects</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                )}

                {users.length > 0 && (
                    <select value={form.assigned_to} onChange={(e) => applyFilters({ assigned_to: e.target.value })}
                            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:border-[var(--trac-primary)] focus:ring-1 focus:ring-[var(--trac-primary)]">
                        <option value="">All assignees</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                )}

                {hasFilters && (
                    <button onClick={clearFilters} className="text-xs font-medium text-[var(--trac-primary)] hover:underline">
                        Clear all
                    </button>
                )}
            </div>

            {/* Issues table */}
            <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead>
                        <tr className="bg-gray-50/80">
                            <th className="px-4 py-3 text-left text-[0.65rem] font-bold uppercase tracking-wider text-gray-400">Key</th>
                            <th className="px-4 py-3 text-left text-[0.65rem] font-bold uppercase tracking-wider text-gray-400">Title</th>
                            <th className="px-4 py-3 text-left text-[0.65rem] font-bold uppercase tracking-wider text-gray-400 hidden md:table-cell">Project</th>
                            <th className="px-4 py-3 text-left text-[0.65rem] font-bold uppercase tracking-wider text-gray-400">Status</th>
                            <th className="px-4 py-3 text-left text-[0.65rem] font-bold uppercase tracking-wider text-gray-400 hidden lg:table-cell">Priority</th>
                            <th className="px-4 py-3 text-left text-[0.65rem] font-bold uppercase tracking-wider text-gray-400 hidden lg:table-cell">Label</th>
                            <th className="px-4 py-3 text-left text-[0.65rem] font-bold uppercase tracking-wider text-gray-400 hidden md:table-cell">Assignee</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {tasks.data?.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-4 py-12 text-center">
                                    <AlertCircle className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                                    <p className="text-sm text-gray-500">No issues found.</p>
                                </td>
                            </tr>
                        ) : (
                            tasks.data?.map(task => {
                                const status = STATUS_MAP[task.status] || STATUS_MAP.pending;
                                const priority = PRIORITY_MAP[task.priority] || PRIORITY_MAP.medium;
                                return (
                                    <tr key={task.id} className="hover:bg-gray-50/60 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5">
                                                {task.source_app === 'MeenitsApp' && (
                                                    <Zap size={10} style={{ color: 'var(--trac-accent)' }} fill="currentColor" />
                                                )}
                                                <span className="text-xs font-mono font-semibold text-gray-400">{task.task_key || `#${task.id}`}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Link href={route('projects.show', task.project_id)} className="text-sm font-medium text-gray-900 hover:text-[var(--trac-primary)] transition-colors">
                                                {task.title}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            <span className="text-xs text-gray-500">{task.project?.name}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[0.65rem] font-bold ${status.bg} ${status.text}`}>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 hidden lg:table-cell">
                                            <div className="flex items-center gap-1.5">
                                                <Flag size={12} style={{ color: priority.color }} fill="currentColor" />
                                                <span className="text-xs" style={{ color: priority.color }}>{priority.label}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 hidden lg:table-cell">
                                            {task.label && (
                                                <span className="trac-label" style={{ fontSize: '0.6rem' }}>{task.label}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            {task.assigned_user ? (
                                                <span className="text-xs text-gray-600">{task.assigned_user.name}</span>
                                            ) : (
                                                <span className="text-xs text-gray-300">—</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {tasks.last_page > 1 && (
                <div className="mt-4 flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                        Showing {tasks.from}–{tasks.to} of {tasks.total} issues
                    </p>
                    <div className="flex gap-2">
                        {tasks.prev_page_url && (
                            <Link href={tasks.prev_page_url} className="flex items-center gap-1 text-xs font-medium text-[var(--trac-primary)] hover:underline">
                                <ChevronLeft size={14} /> Previous
                            </Link>
                        )}
                        {tasks.next_page_url && (
                            <Link href={tasks.next_page_url} className="flex items-center gap-1 text-xs font-medium text-[var(--trac-primary)] hover:underline">
                                Next <ChevronRight size={14} />
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </SidebarLayout>
    );
}

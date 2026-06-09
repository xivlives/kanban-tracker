import { Head } from "@inertiajs/react";
import ProjectLayout from "@/Layouts/ProjectLayout";
import { StatusBadge, TaskKey, Assignee, STATUS } from "@/Components/TaskMeta";

function StatCard({ label, value, accent }) {
    return (
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <div className="text-2xl font-bold" style={{ color: accent }}>{value}</div>
            <div className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-400">{label}</div>
        </div>
    );
}

function Breakdown({ title, data, colorFor }) {
    const entries = Object.entries(data || {});
    const total = entries.reduce((s, [, v]) => s + v, 0) || 1;
    return (
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <h3 className="mb-3 text-sm font-bold text-gray-900">{title}</h3>
            {entries.length === 0 ? (
                <p className="text-sm text-gray-400">No data.</p>
            ) : (
                <div className="space-y-2.5">
                    {entries.map(([k, v]) => (
                        <div key={k}>
                            <div className="mb-1 flex items-center justify-between text-xs">
                                <span className="capitalize text-gray-600">{STATUS[k]?.label || k}</span>
                                <span className="font-semibold text-gray-500">{v}</span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                                <div className="h-1.5 rounded-full" style={{ width: `${(v / total) * 100}%`, background: colorFor(k) }} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function Summary({ project, stats, byStatus, byPriority, byAssignee, recent = [] }) {
    const statusColor = (k) => STATUS[k]?.color || "var(--trac-primary)";
    const priorityColor = (k) => ({ urgent: "var(--trac-danger)", high: "var(--trac-orange)", medium: "#9ca3af", low: "#cbd5e1" }[k] || "#9ca3af");

    return (
        <ProjectLayout project={project} tab="summary" title="Summary">
            <Head title={`${project.name} — Summary`} />

            {/* progress banner */}
            <div className="mb-6 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900">Overall progress</h3>
                    <span className="text-sm font-bold" style={{ color: "var(--trac-success)" }}>{stats.progress}%</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <div className="h-2.5 rounded-full" style={{ width: `${stats.progress}%`, background: "linear-gradient(90deg, var(--trac-primary), var(--trac-accent))" }} />
                </div>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">
                <StatCard label="Total" value={stats.total} accent="var(--trac-ink)" />
                <StatCard label="To Do" value={stats.todo} accent="var(--trac-orange)" />
                <StatCard label="In Progress" value={stats.in_progress} accent="var(--trac-primary)" />
                <StatCard label="In Review" value={stats.in_review} accent="var(--trac-accent)" />
                <StatCard label="Done" value={stats.done} accent="var(--trac-success)" />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Breakdown title="By status" data={byStatus} colorFor={statusColor} />
                <Breakdown title="By priority" data={byPriority} colorFor={priorityColor} />
                <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                    <h3 className="mb-3 text-sm font-bold text-gray-900">By assignee</h3>
                    {Object.keys(byAssignee || {}).length === 0 ? (
                        <p className="text-sm text-gray-400">No data.</p>
                    ) : (
                        <ul className="space-y-2 text-sm">
                            {Object.entries(byAssignee).map(([name, count]) => (
                                <li key={name} className="flex items-center justify-between">
                                    <span className="text-gray-600">{name}</span>
                                    <span className="font-semibold text-gray-500">{count}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* recent activity */}
            <div className="mt-6 rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
                <div className="border-b border-gray-100 px-5 py-3">
                    <h3 className="text-sm font-bold text-gray-900">Recent activity</h3>
                </div>
                {recent.length === 0 ? (
                    <p className="px-5 py-8 text-center text-sm text-gray-400">No activity yet.</p>
                ) : (
                    <ul className="divide-y divide-gray-50">
                        {recent.map((t) => (
                            <li key={t.id} className="flex items-center gap-3 px-5 py-3">
                                <TaskKey value={t.task_key} />
                                <span className="flex-1 truncate font-medium text-gray-900">{t.title}</span>
                                <StatusBadge status={t.status} />
                                <Assignee user={t.assigned_user} />
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </ProjectLayout>
    );
}

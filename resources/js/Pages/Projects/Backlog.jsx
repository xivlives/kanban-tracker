import { Head } from "@inertiajs/react";
import ProjectLayout from "@/Layouts/ProjectLayout";
import { StatusBadge, PriorityFlag, TaskKey, Assignee } from "@/Components/TaskMeta";

export default function Backlog({ project, tasks = [] }) {
    return (
        <ProjectLayout project={project} tab="backlog" title="Backlog">
            <Head title={`${project.name} — Backlog`} />

            <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
                    <h3 className="text-sm font-semibold text-gray-700">Backlog</h3>
                    <span className="text-xs text-gray-400">{tasks.length} open item{tasks.length !== 1 ? "s" : ""}</span>
                </div>

                {tasks.length === 0 ? (
                    <p className="px-5 py-10 text-center text-sm text-gray-400">Nothing in the backlog — all caught up.</p>
                ) : (
                    <ul className="divide-y divide-gray-50">
                        {tasks.map((t) => (
                            <li key={t.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/60">
                                <TaskKey value={t.task_key} />
                                <span className="flex-1 truncate font-medium text-gray-900">{t.title}</span>
                                <PriorityFlag priority={t.priority} />
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

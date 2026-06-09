import { Head } from "@inertiajs/react";
import ProjectLayout from "@/Layouts/ProjectLayout";
import { StatusBadge, PriorityFlag, TaskKey, Assignee } from "@/Components/TaskMeta";

export default function List({ project, tasks = [] }) {
    return (
        <ProjectLayout project={project} tab="list" title="List">
            <Head title={`${project.name} — List`} />

            <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
                            <th className="px-4 py-3 font-semibold">Key</th>
                            <th className="px-4 py-3 font-semibold">Summary</th>
                            <th className="px-4 py-3 font-semibold">Status</th>
                            <th className="px-4 py-3 font-semibold">Priority</th>
                            <th className="px-4 py-3 font-semibold">Assignee</th>
                            <th className="px-4 py-3 font-semibold">Due</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.length === 0 && (
                            <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">No tasks yet.</td></tr>
                        )}
                        {tasks.map((t) => (
                            <tr key={t.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                                <td className="px-4 py-3"><TaskKey value={t.task_key} /></td>
                                <td className="px-4 py-3 font-medium text-gray-900">{t.title}</td>
                                <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                                <td className="px-4 py-3"><PriorityFlag priority={t.priority} /></td>
                                <td className="px-4 py-3"><Assignee user={t.assigned_user} /></td>
                                <td className="px-4 py-3 text-gray-500">
                                    {t.due_date ? new Date(t.due_date).toLocaleDateString() : "—"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </ProjectLayout>
    );
}

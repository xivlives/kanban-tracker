import { Head } from "@inertiajs/react";
import ProjectLayout from "@/Layouts/ProjectLayout";
import { StatusBadge, TaskKey, Assignee } from "@/Components/TaskMeta";
import { GanttChartSquare } from "lucide-react";

export default function Timeline({ project, tasks = [] }) {
    const dated = tasks.filter((t) => t.due_date);

    return (
        <ProjectLayout project={project} tab="timeline" title="Timeline">
            <Head title={`${project.name} — Timeline`} />

            {dated.length === 0 ? (
                <div className="rounded-xl bg-white py-16 text-center shadow-sm ring-1 ring-gray-100">
                    <GanttChartSquare className="mx-auto h-10 w-10 text-gray-300" />
                    <p className="mt-3 text-sm text-gray-500">Give tasks due dates to see them on the timeline.</p>
                </div>
            ) : (
                <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                    <ol className="relative border-l-2 border-gray-100 pl-6">
                        {dated.map((t) => (
                            <li key={t.id} className="mb-5 last:mb-0">
                                <span
                                    className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full ring-4 ring-white"
                                    style={{ background: "var(--trac-primary)" }}
                                />
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="text-xs font-semibold" style={{ color: "var(--trac-primary-800)" }}>
                                        {new Date(t.due_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                                    </span>
                                    <TaskKey value={t.task_key} />
                                    <span className="flex-1 truncate font-medium text-gray-900">{t.title}</span>
                                    <StatusBadge status={t.status} />
                                    <Assignee user={t.assigned_user} />
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            )}
        </ProjectLayout>
    );
}

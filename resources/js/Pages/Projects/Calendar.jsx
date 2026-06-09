import { Head } from "@inertiajs/react";
import ProjectLayout from "@/Layouts/ProjectLayout";
import { StatusBadge, PriorityFlag, TaskKey, Assignee } from "@/Components/TaskMeta";
import { CalendarDays } from "lucide-react";

export default function Calendar({ project, tasks = [] }) {
    // Group by due date (YYYY-MM-DD)
    const groups = {};
    for (const t of tasks) {
        const key = t.due_date ? new Date(t.due_date).toDateString() : "No date";
        (groups[key] ||= []).push(t);
    }
    const dates = Object.keys(groups);
    const today = new Date().toDateString();

    return (
        <ProjectLayout project={project} tab="calendar" title="Calendar">
            <Head title={`${project.name} — Calendar`} />

            {tasks.length === 0 ? (
                <div className="rounded-xl bg-white py-16 text-center shadow-sm ring-1 ring-gray-100">
                    <CalendarDays className="mx-auto h-10 w-10 text-gray-300" />
                    <p className="mt-3 text-sm text-gray-500">No tasks have a due date yet.</p>
                </div>
            ) : (
                <div className="space-y-5">
                    {dates.map((d) => {
                        const isToday = d === today;
                        const isPast = d !== "No date" && new Date(d) < new Date(today);
                        return (
                            <div key={d}>
                                <div className="mb-2 flex items-center gap-2">
                                    <h3 className="text-sm font-bold" style={{ color: isToday ? "var(--trac-primary)" : "var(--trac-ink)" }}>
                                        {d === "No date" ? "No due date" : d}
                                    </h3>
                                    {isToday && <span className="rounded px-1.5 py-0.5 text-[0.6rem] font-bold uppercase text-white" style={{ background: "var(--trac-primary)" }}>Today</span>}
                                    {isPast && <span className="rounded px-1.5 py-0.5 text-[0.6rem] font-bold uppercase text-white" style={{ background: "var(--trac-danger)" }}>Overdue</span>}
                                </div>
                                <div className="space-y-2">
                                    {groups[d].map((t) => (
                                        <div key={t.id} className="flex items-center gap-3 rounded-lg bg-white px-4 py-2.5 shadow-sm ring-1 ring-gray-100">
                                            <TaskKey value={t.task_key} />
                                            <span className="flex-1 truncate font-medium text-gray-900">{t.title}</span>
                                            <PriorityFlag priority={t.priority} />
                                            <StatusBadge status={t.status} />
                                            <Assignee user={t.assigned_user} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </ProjectLayout>
    );
}

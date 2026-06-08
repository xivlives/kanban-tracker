import { Link, router } from "@inertiajs/react";
import SidebarLayout from "@/Layouts/SidebarLayout";
import { Head } from "@inertiajs/react";
import { useState } from "react";
import { Plus, BarChart3, Zap, FolderKanban } from "lucide-react";

export default function Dashboard({ projects = [], myTasks = [] }) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({ name: "", description: "" });
    const [processing, setProcessing] = useState(false);

    const handleCreateProject = (e) => {
        e.preventDefault();
        setProcessing(true);
        router.post(route("projects.store"), formData, {
            onSuccess: () => { setShowCreateModal(false); setFormData({ name: "", description: "" }); },
            onFinish: () => setProcessing(false),
        });
    };

    const handleGenerateReports = () => {
        router.post(route("reports.generate"), {}, {
            onSuccess: () => alert("Report generation job has been queued!"),
        });
    };

    const pct = (p) =>
        p.tasks_count > 0 ? Math.round(((p.done_tasks_count || 0) / p.tasks_count) * 100) : 0;

    const totalTasks = projects.reduce((s, p) => s + (p.tasks_count || 0), 0);
    const totalDone = projects.reduce((s, p) => s + (p.done_tasks_count || 0), 0);

    return (
        <SidebarLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>
                    <div className="flex gap-3">
                        <button
                            onClick={handleGenerateReports}
                            className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                            style={{ background: "var(--trac-orange)" }}
                        >
                            <BarChart3 size={14} className="inline mr-1.5 -mt-0.5" />
                            Reports
                        </button>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="trac-btn-primary rounded-lg px-4 py-2 text-sm font-semibold flex items-center gap-1.5"
                        >
                            <Plus size={16} strokeWidth={2.5} />
                            New Project
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard label="Projects" value={projects.length} accent="var(--trac-primary)" />
                <StatCard label="Total Tasks" value={totalTasks} accent="var(--trac-ink)" />
                <StatCard label="Completed" value={totalDone} accent="var(--trac-success)" />
                <StatCard label="My Open" value={myTasks.length} accent="var(--trac-orange)" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left column: Projects (2/3 width) */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Your boards</h3>
                        <span className="text-xs text-gray-400">{projects.length} project{projects.length !== 1 ? 's' : ''}</span>
                    </div>

                    {projects.length === 0 ? (
                        <div className="rounded-xl bg-white py-16 text-center shadow-sm ring-1 ring-gray-100">
                            <FolderKanban className="mx-auto h-10 w-10 text-gray-300" />
                            <h3 className="mt-3 text-sm font-medium text-gray-900">No projects yet</h3>
                            <p className="mt-1 text-sm text-gray-500">Get started by creating a new project.</p>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="trac-btn-primary mt-6 inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold gap-1.5"
                            >
                                <Plus size={16} /> New Project
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {projects.map((project) => (
                                <Link
                                    key={project.id}
                                    href={route("projects.show", project.id)}
                                    className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100 transition hover:shadow-md hover:ring-gray-200"
                                >
                                    <h3 className="mb-1 text-base font-semibold text-gray-900">{project.name}</h3>
                                    <p className="mb-4 line-clamp-1 text-sm text-gray-500">
                                        {project.description || "No description"}
                                    </p>

                                    <div className="grid grid-cols-5 gap-1 text-center">
                                        <MiniStat label="Total" value={project.tasks_count || 0} color="var(--trac-ink)" />
                                        <MiniStat label="To Do" value={project.pending_tasks_count || 0} color="var(--trac-orange)" />
                                        <MiniStat label="Active" value={project.in_progress_tasks_count || 0} color="var(--trac-primary)" />
                                        <MiniStat label="Review" value={project.in_review_tasks_count || 0} color="var(--trac-accent)" />
                                        <MiniStat label="Done" value={project.done_tasks_count || 0} color="var(--trac-success)" />
                                    </div>

                                    <div className="mt-3">
                                        <div className="mb-1 flex items-center justify-between text-xs text-gray-400">
                                            <span>Progress</span>
                                            <span className="font-semibold">{pct(project)}%</span>
                                        </div>
                                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                                            <div
                                                className="h-1.5 rounded-full transition-all"
                                                style={{
                                                    width: `${pct(project)}%`,
                                                    background: "linear-gradient(90deg, var(--trac-primary), var(--trac-accent))",
                                                }}
                                            />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right column: My Focus (1/3 width) */}
                <div className="lg:col-span-1">
                    <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden sticky top-6">
                        <div className="border-b border-gray-100 bg-gray-50/50 px-5 py-4 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-gray-900">My Focus</h3>
                            <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded-full"
                                  style={{ backgroundColor: 'var(--trac-primary-100)', color: 'var(--trac-primary-800)' }}>
                                {myTasks.length}
                            </span>
                        </div>
                        <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto trac-scroll">
                            {myTasks.length === 0 ? (
                                <div className="p-8 text-center text-gray-400 text-sm">
                                    All caught up! 🎉
                                </div>
                            ) : (
                                myTasks.map(task => (
                                    <Link key={task.id} href={route("projects.show", task.project_id)} className="block px-5 py-3 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start gap-2 mb-1">
                                            <h4 className="text-sm font-medium text-gray-900 leading-snug flex-1">{task.title}</h4>
                                            {task.source_app === 'MeenitsApp' && (
                                                <Zap size={12} className="shrink-0 mt-0.5" style={{ color: 'var(--trac-accent)' }} fill="currentColor" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[0.65rem] text-gray-400">{task.project?.name}</span>
                                            {task.priority === 'urgent' && <span className="text-[0.6rem] font-bold text-[var(--trac-danger)]">URGENT</span>}
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Project Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-[10vh] backdrop-blur-sm" onClick={() => setShowCreateModal(false)}>
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <h2 className="mb-5 text-xl font-bold text-gray-900">Create New Project</h2>
                        <form onSubmit={handleCreateProject} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Project Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="trac-input w-full rounded-lg border-gray-200 text-sm"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Description (Optional)</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="trac-input w-full rounded-lg border-gray-200 text-sm"
                                    rows="2"
                                    placeholder="What is this project about?"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-1">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200">Cancel</button>
                                <button type="submit" disabled={processing} className="trac-btn-primary rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50">
                                    {processing ? "Creating..." : "Create Project"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </SidebarLayout>
    );
}

function StatCard({ label, value, accent }) {
    return (
        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
            <div className="text-2xl font-bold" style={{ color: accent }}>{value}</div>
            <div className="text-xs text-gray-400 font-medium mt-0.5">{label}</div>
        </div>
    );
}

function MiniStat({ label, value, color }) {
    return (
        <div className="flex flex-col">
            <span className="text-base font-bold" style={{ color }}>{value}</span>
            <span className="text-[0.55rem] uppercase tracking-wide text-gray-400 font-medium">{label}</span>
        </div>
    );
}

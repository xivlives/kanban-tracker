import { Link, router } from "@inertiajs/react";
import SidebarLayout from "@/Layouts/SidebarLayout";
import { Head } from "@inertiajs/react";
import { useState } from "react";

export default function Dashboard({ projects = [], myTasks = [] }) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({ name: "", description: "" });
    const [processing, setProcessing] = useState(false);

    const handleCreateProject = (e) => {
        e.preventDefault();
        setProcessing(true);
        router.post(route("projects.store"), formData, {
            onSuccess: () => {
                setShowCreateModal(false);
                setFormData({ name: "", description: "" });
            },
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

    return (
        <SidebarLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">Dashboard</h2>
                    <div className="flex gap-3">
                        <button
                            onClick={handleGenerateReports}
                            className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition"
                            style={{ background: "var(--trac-orange)" }}
                        >
                            Generate Reports
                        </button>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="trac-btn-primary rounded-lg px-4 py-2 text-sm font-semibold"
                        >
                            Create Project
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Banner */}
                    <div className="trac-brand-gradient mb-8 overflow-hidden rounded-2xl p-7 text-white">
                        <h3 className="text-2xl font-bold">Your boards</h3>
                        <p className="mt-1 text-sm text-white/75">
                            {projects.length
                                ? `${projects.length} project${projects.length > 1 ? "s" : ""} in motion.`
                                : "Create your first project to start tracking."}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left column: Projects (2/3 width) */}
                        <div className="lg:col-span-2 space-y-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Your boards</h3>
                            {projects.length === 0 ? (
                        <div className="rounded-2xl bg-white py-16 text-center shadow-sm ring-1 ring-gray-100">
                            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                            </svg>
                            <h3 className="mt-3 text-sm font-medium text-gray-900">No projects yet</h3>
                            <p className="mt-1 text-sm text-gray-500">Get started by creating a new project.</p>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="trac-btn-primary mt-6 inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold"
                            >
                                New Project
                            </button>
                        </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {projects.map((project) => (
                                <Link
                                    key={project.id}
                                    href={route("projects.show", project.id)}
                                    className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition hover:shadow-md"
                                >
                                    <h3 className="mb-1 text-lg font-semibold text-gray-900">{project.name}</h3>
                                    <p className="mb-4 line-clamp-2 text-sm text-gray-500">
                                        {project.description || "No description"}
                                    </p>

                                    <div className="grid grid-cols-4 gap-2 text-center">
                                        <Stat label="Total" value={project.tasks_count || 0} color="var(--trac-ink)" />
                                        <Stat label="Pending" value={project.pending_tasks_count || 0} color="var(--trac-orange)" />
                                        <Stat label="Active" value={project.in_progress_tasks_count || 0} color="var(--trac-primary)" />
                                        <Stat label="Done" value={project.done_tasks_count || 0} color="oklch(60% 0.17 150)" />
                                    </div>

                                    <div className="mt-4">
                                        <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
                                            <span>Progress</span>
                                            <span>{pct(project)}%</span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                                            <div
                                                className="h-2 rounded-full transition-all"
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
                            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden sticky top-6">
                                <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-5 flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-[var(--trac-ink)]">My Focus</h3>
                                    <span className="bg-[var(--trac-primary-100)] text-[var(--trac-primary-800)] text-xs font-bold px-2 py-1 rounded-full">
                                        {myTasks.length} pending
                                    </span>
                                </div>
                                <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                                    {myTasks.length === 0 ? (
                                        <div className="p-8 text-center text-gray-500 text-sm">
                                            You have no pending tasks. Great job!
                                        </div>
                                    ) : (
                                        myTasks.map(task => (
                                            <Link key={task.id} href={route("projects.show", task.project_id)} className="block p-5 hover:bg-gray-50 transition-colors">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="font-semibold text-gray-900 text-sm leading-snug">{task.title}</h4>
                                                    {task.source_app === 'MeenitsApp' && (
                                                        <span title="From Meenits Meeting" className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-[var(--trac-accent)] text-[var(--trac-ink)]">
                                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                            </svg>
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500 mb-2 line-clamp-1">{task.project?.name}</div>
                                                {task.due_date && (
                                                    <div className="inline-flex items-center text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                                                        Due: {task.due_date}
                                                    </div>
                                                )}
                                            </Link>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Project Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6">
                        <h2 className="mb-4 text-xl font-bold text-gray-900">Create New Project</h2>
                        <form onSubmit={handleCreateProject}>
                            <div className="mb-4">
                                <label className="mb-2 block text-sm font-medium text-gray-700">Project Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="trac-input w-full rounded-lg border-gray-300"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="mb-6">
                                <label className="mb-2 block text-sm font-medium text-gray-700">Description (Optional)</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="trac-input w-full rounded-lg border-gray-300"
                                    rows="3"
                                    placeholder="What is this project about?"
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="trac-btn-primary rounded-lg px-4 py-2 font-semibold disabled:opacity-50"
                                >
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

function Stat({ label, value, color }) {
    return (
        <div className="flex flex-col">
            <span className="text-lg font-semibold" style={{ color }}>{value}</span>
            <span className="text-[0.65rem] uppercase tracking-wide text-gray-400">{label}</span>
        </div>
    );
}

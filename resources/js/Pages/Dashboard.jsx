import { Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

export default function Dashboard({ projects = [] }) {  // Default to empty array
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [processing, setProcessing] = useState(false);

    const handleCreateProject = (e) => {
        e.preventDefault();
        setProcessing(true);

        router.post(route('projects.store'), formData, {
            onSuccess: () => {
                setShowCreateModal(false);
                setFormData({ name: '', description: '' });
            },
            onFinish: () => setProcessing(false),
        });
    };

    const handleGenerateReports = () => {
        router.post(route('reports.generate'), {}, {
            onSuccess: () => {
                alert('Report generation job has been queued!');
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Dashboard
                    </h2>
                    <div className="flex gap-3">
                        <button
                            onClick={handleGenerateReports}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                        >
                            Generate Reports
                        </button>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            Create Project
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {projects.length === 0 ? (
                                <div className="text-center py-12">
                                    <svg
                                        className="mx-auto h-12 w-12 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                                        />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                                        No projects
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Get started by creating a new project.
                                    </p>
                                    <div className="mt-6">
                                        <button
                                            onClick={() => setShowCreateModal(true)}
                                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                        >
                                            <svg
                                                className="-ml-1 mr-2 h-5 w-5"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            New Project
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {projects.map((project) => (
                                        <Link
                                            key={project.id}
                                            href={route('projects.show', project.id)}
                                            className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md hover:border-blue-300 transition-all"
                                        >
                                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                {project.name}
                                            </h3>
                                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                                {project.description || 'No description'}
                                            </p>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div className="flex flex-col">
                                                    <span className="text-gray-500 text-xs">Total</span>
                                                    <span className="font-semibold text-lg">
                                                        {project.tasks_count || 0}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-gray-500 text-xs">Pending</span>
                                                    <span className="font-semibold text-lg text-yellow-600">
                                                        {project.pending_tasks_count || 0}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-gray-500 text-xs">In Progress</span>
                                                    <span className="font-semibold text-lg text-blue-600">
                                                        {project.in_progress_tasks_count || 0}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-gray-500 text-xs">Done</span>
                                                    <span className="font-semibold text-lg text-green-600">
                                                        {project.done_tasks_count || 0}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="mt-4">
                                                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                                    <span>Progress</span>
                                                    <span>
                                                        {project.tasks_count > 0
                                                            ? Math.round(
                                                                  ((project.done_tasks_count || 0) /
                                                                      project.tasks_count) *
                                                                      100
                                                              )
                                                            : 0}
                                                        %
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-green-600 h-2 rounded-full transition-all"
                                                        style={{
                                                            width: `${
                                                                project.tasks_count > 0
                                                                    ? ((project.done_tasks_count || 0) /
                                                                          project.tasks_count) *
                                                                      100
                                                                    : 0
                                                            }%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Project Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-4">Create New Project</h2>
                        <form onSubmit={handleCreateProject}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Project Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description (Optional)
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows="3"
                                    placeholder="What is this project about?"
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    {processing ? 'Creating...' : 'Create Project'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
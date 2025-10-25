import { Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useState } from 'react';

export default function Dashboard({ projects }) {
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
        <AppLayout>
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <div className="flex gap-3">
                    <button
                        onClick={handleGenerateReports}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                        Generate Reports
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Create Project
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                    <Link
                        key={project.id}
                        href={route('projects.show', project.id)}
                        className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
                    >
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {project.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {project.description || 'No description'}
                        </p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">Total Tasks:</span>
                                <span className="ml-2 font-semibold">{project.tasks_count}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Pending:</span>
                                <span className="ml-2 font-semibold text-yellow-600">
                                    {project.pending_tasks_count}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500">In Progress:</span>
                                <span className="ml-2 font-semibold text-blue-600">
                                    {project.in_progress_tasks_count}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500">Done:</span>
                                <span className="ml-2 font-semibold text-green-600">
                                    {project.done_tasks_count}
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {projects.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">No projects yet. Create your first project!</p>
                </div>
            )}

            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-4">Create Project</h2>
                        <form onSubmit={handleCreateProject}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Project Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {processing ? 'Creating...' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
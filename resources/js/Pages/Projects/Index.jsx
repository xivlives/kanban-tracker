import { Link } from '@inertiajs/react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head } from '@inertiajs/react';
import { FolderKanban } from 'lucide-react';

export default function Index({ projects }) {
    return (
        <SidebarLayout header="All Projects">
            <Head title="Projects" />

            <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead>
                        <tr className="bg-gray-50/80">
                            <th className="px-5 py-3 text-left text-[0.65rem] font-bold uppercase tracking-wider text-gray-400">Name</th>
                            <th className="px-5 py-3 text-left text-[0.65rem] font-bold uppercase tracking-wider text-gray-400 hidden md:table-cell">Description</th>
                            <th className="px-5 py-3 text-left text-[0.65rem] font-bold uppercase tracking-wider text-gray-400">Tasks</th>
                            <th className="px-5 py-3 text-right text-[0.65rem] font-bold uppercase tracking-wider text-gray-400">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {projects.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-5 py-12 text-center">
                                    <FolderKanban className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                                    <p className="text-sm text-gray-500">No projects found.</p>
                                </td>
                            </tr>
                        ) : (
                            projects.map((project) => (
                                <tr key={project.id} className="hover:bg-gray-50/60 transition-colors">
                                    <td className="px-5 py-3 whitespace-nowrap">
                                        <div className="text-sm font-semibold text-gray-900">{project.name}</div>
                                    </td>
                                    <td className="px-5 py-3 hidden md:table-cell">
                                        <div className="text-sm text-gray-500 line-clamp-1">{project.description || 'No description'}</div>
                                    </td>
                                    <td className="px-5 py-3 whitespace-nowrap">
                                        <span className="inline-flex text-xs font-bold rounded-full px-2.5 py-0.5"
                                              style={{ backgroundColor: 'var(--trac-primary-100)', color: 'var(--trac-primary-800)' }}>
                                            {project.tasks_count} tasks
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 whitespace-nowrap text-right">
                                        <Link
                                            href={route('projects.show', project.id)}
                                            className="text-sm font-semibold transition-colors hover:underline"
                                            style={{ color: 'var(--trac-primary)' }}
                                        >
                                            View Board →
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </SidebarLayout>
    );
}
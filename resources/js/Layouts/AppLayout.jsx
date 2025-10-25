import { Link } from '@inertiajs/react';

export default function AppLayout({ children }) {
    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="shrink-0 flex items-center">
                                <Link href="/" className="text-xl font-bold text-gray-800">
                                    Kanban Tracker
                                </Link>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                <Link
                                    href={route('dashboard')}
                                    className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href={route('projects.index')}
                                    className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                >
                                    Projects
                                </Link>
                                <Link
                                    href={route('reports.index')}
                                    className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                >
                                    Reports
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
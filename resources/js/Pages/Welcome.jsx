import { Link } from '@inertiajs/react';

export default function Welcome({ auth }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800">
            {/* Navigation */}
            <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-white">
                                Kanban Tracker
                            </h1>
                        </div>
                        <div className="flex items-center gap-4">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="px-4 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="px-4 py-2 text-white font-semibold hover:text-blue-200 transition"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="px-4 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition"
                                    >
                                        Sign up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center">
                    <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-6">
                        Manage Your Projects
                        <span className="block text-blue-200">Like a Pro</span>
                    </h2>
                    <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                        A powerful Kanban board to track tasks, collaborate with your team, 
                        and get automated daily reports. Built for engineering teams.
                    </p>
                    <div className="flex justify-center gap-4">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="px-8 py-4 bg-white text-blue-600 font-bold text-lg rounded-lg hover:bg-blue-50 transition shadow-lg"
                            >
                                Go to Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('register')}
                                    className="px-8 py-4 bg-white text-blue-600 font-bold text-lg rounded-lg hover:bg-blue-50 transition shadow-lg"
                                >
                                    Get Started Free
                                </Link>
                                <Link
                                    href={route('login')}
                                    className="px-8 py-4 bg-blue-500/20 backdrop-blur text-white font-bold text-lg rounded-lg hover:bg-blue-500/30 transition border-2 border-white/30"
                                >
                                    Sign In
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Features Grid */}
                <div className="mt-24 grid md:grid-cols-3 gap-8">
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
                        <div className="w-12 h-12 bg-blue-400 rounded-lg flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Drag & Drop Kanban</h3>
                        <p className="text-blue-100">
                            Intuitive kanban boards with drag-and-drop functionality. Move tasks between Pending, In Progress, and Done columns effortlessly.
                        </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
                        <div className="w-12 h-12 bg-purple-400 rounded-lg flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Team Collaboration</h3>
                        <p className="text-blue-100">
                            Assign tasks to team members, set due dates, and track progress. Perfect for small to medium engineering teams.
                        </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
                        <div className="w-12 h-12 bg-green-400 rounded-lg flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Automated Reports</h3>
                        <p className="text-blue-100">
                            Daily automated reports generated at midnight. Get insights on project progress, completion rates, and team productivity.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
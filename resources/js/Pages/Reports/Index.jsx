import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Index({ reports }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Project Reports
                </h2>
            }
        >
            <Head title="Reports" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {reports.length === 0 ? (
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
                                            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                                        No reports available
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Reports haven't been generated yet. Go to Dashboard and click
                                        "Generate Reports".
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {reports.map((report) => (
                                        <div
                                            key={report.id}
                                            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
                                        >
                                            <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                                {report.project.name}
                                            </h3>

                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center pb-2 border-b">
                                                    <span className="text-gray-600 font-medium">
                                                        Total Tasks
                                                    </span>
                                                    <span className="font-semibold text-xl">
                                                        {report.total_tasks}
                                                    </span>
                                                </div>

                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600">Completed</span>
                                                    <span className="font-semibold text-green-600">
                                                        {report.completed_tasks}
                                                    </span>
                                                </div>

                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600">In Progress</span>
                                                    <span className="font-semibold text-blue-600">
                                                        {report.in_progress_tasks}
                                                    </span>
                                                </div>

                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600">Pending</span>
                                                    <span className="font-semibold text-yellow-600">
                                                        {report.pending_tasks}
                                                    </span>
                                                </div>

                                                <div className="mt-4 pt-4 border-t">
                                                    <div className="flex justify-between items-center text-sm mb-2">
                                                        <span className="text-gray-500 font-medium">
                                                            Completion Rate
                                                        </span>
                                                        <span className="font-semibold">
                                                            {report.total_tasks > 0
                                                                ? Math.round(
                                                                      (report.completed_tasks /
                                                                          report.total_tasks) *
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
                                                                    report.total_tasks > 0
                                                                        ? (report.completed_tasks /
                                                                              report.total_tasks) *
                                                                          100
                                                                        : 0
                                                                }%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                                                <span className="font-medium">Last generated: </span>
                                                {new Date(report.last_generated_at).toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
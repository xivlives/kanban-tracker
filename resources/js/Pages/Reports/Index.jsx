import AppLayout from '@/Layouts/AppLayout';

export default function Index({ reports }) {
    return (
        <AppLayout>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Project Reports</h1>
                <p className="text-gray-600 mt-1">Latest generated reports for all projects</p>
            </div>

            {reports.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <p className="text-gray-500">No reports generated yet.</p>
                    <p className="text-sm text-gray-400 mt-2">
                        Go to Dashboard and click "Generate Reports"
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reports.map((report) => (
                        <div key={report.id} className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                {report.project.name}
                            </h3>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between items-center pb-2 border-b">
                                    <span className="text-gray-600">Total Tasks</span>
                                    <span className="font-semibold text-lg">{report.total_tasks}</span>
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
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Completion Rate</span>
                                        <span className="font-semibold">
                                            {report.total_tasks > 0
                                                ? Math.round(
                                                      (report.completed_tasks / report.total_tasks) * 100
                                                  )
                                                : 0}
                                            %
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                        <div
                                            className="bg-green-600 h-2 rounded-full"
                                            style={{
                                                width: `${
                                                    report.total_tasks > 0
                                                        ? (report.completed_tasks / report.total_tasks) *
                                                          100
                                                        : 0
                                                }%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 text-xs text-gray-500">
                                Last generated:{' '}
                                {new Date(report.last_generated_at).toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
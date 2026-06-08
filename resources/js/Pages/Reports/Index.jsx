import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head } from '@inertiajs/react';

export default function Index({ reports }) {
    return (
        <SidebarLayout header="Project Reports">
            <Head title="Reports" />

            {reports.length === 0 ? (
                <div className="rounded-xl bg-white py-16 text-center shadow-sm ring-1 ring-gray-100">
                    <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-3 text-sm font-medium text-gray-900">No reports available</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Go to Dashboard and click "Reports" to generate.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reports.map((report) => {
                        const completionRate = report.total_tasks > 0
                            ? Math.round((report.completed_tasks / report.total_tasks) * 100)
                            : 0;
                        return (
                            <div key={report.id} className="bg-white rounded-xl p-5 shadow-sm ring-1 ring-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">{report.project.name}</h3>

                                <div className="space-y-2">
                                    <ReportRow label="Total Tasks" value={report.total_tasks} color="var(--trac-ink)" bold />
                                    <ReportRow label="Completed" value={report.completed_tasks} color="var(--trac-success)" />
                                    <ReportRow label="In Progress" value={report.in_progress_tasks} color="var(--trac-primary)" />
                                    <ReportRow label="Pending" value={report.pending_tasks} color="var(--trac-orange)" />
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <div className="flex justify-between items-center text-sm mb-2">
                                        <span className="text-xs font-medium text-gray-400">Completion</span>
                                        <span className="text-sm font-bold" style={{ color: 'var(--trac-primary)' }}>{completionRate}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                                        <div
                                            className="h-1.5 rounded-full transition-all"
                                            style={{
                                                width: `${completionRate}%`,
                                                background: 'linear-gradient(90deg, var(--trac-primary), var(--trac-accent))',
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="mt-3 pt-3 border-t border-gray-50 text-xs text-gray-400">
                                    <span className="font-medium">Generated: </span>
                                    {new Date(report.last_generated_at).toLocaleString()}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </SidebarLayout>
    );
}

function ReportRow({ label, value, color, bold }) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{label}</span>
            <span className={`text-sm ${bold ? 'font-bold text-lg' : 'font-semibold'}`} style={{ color }}>{value}</span>
        </div>
    );
}
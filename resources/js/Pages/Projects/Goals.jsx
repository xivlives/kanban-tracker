import { Head } from "@inertiajs/react";
import ProjectLayout from "@/Layouts/ProjectLayout";
import { Target } from "lucide-react";

export default function Goals({ project }) {
    return (
        <ProjectLayout project={project} tab="goals" title="Goals">
            <Head title={`${project.name} — Goals`} />

            <div className="rounded-xl bg-white py-16 text-center shadow-sm ring-1 ring-gray-100">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: "color-mix(in srgb, var(--trac-primary) 14%, white)" }}>
                    <Target style={{ color: "var(--trac-primary)" }} />
                </span>
                <h3 className="mt-4 text-base font-semibold text-gray-900">Goals are coming soon</h3>
                <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">
                    Set measurable objectives for <span className="font-medium">{project.name}</span> and link tasks to them to track progress toward outcomes.
                </p>
            </div>
        </ProjectLayout>
    );
}

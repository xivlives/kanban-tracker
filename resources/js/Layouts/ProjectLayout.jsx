import SidebarLayout from "@/Layouts/SidebarLayout";
import { Link } from "@inertiajs/react";
import {
    LayoutDashboard, GanttChartSquare, KanbanSquare, Inbox,
    CalendarDays, List as ListIcon, Target,
} from "lucide-react";

/**
 * Wraps a single-project view: SidebarLayout (global nav) + the project header
 * (project name + tab bar of views). `tab` is the active view key; `actions`
 * renders on the right of the title row.
 */
export default function ProjectLayout({ project, tab = "board", actions = null, children }) {
    const tabs = [
        { key: "summary", name: "Summary", icon: LayoutDashboard, href: route("projects.summary", project.id) },
        { key: "timeline", name: "Timeline", icon: GanttChartSquare, href: route("projects.timeline", project.id) },
        { key: "board", name: "Board", icon: KanbanSquare, href: route("projects.show", project.id) },
        { key: "backlog", name: "Backlog", icon: Inbox, href: route("projects.backlog", project.id) },
        { key: "calendar", name: "Calendar", icon: CalendarDays, href: route("projects.calendar", project.id) },
        { key: "list", name: "List", icon: ListIcon, href: route("projects.list", project.id) },
        { key: "goals", name: "Goals", icon: Target, href: route("projects.goals", project.id) },
    ];

    const header = (
        <div>
            {/* Identity + actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white"
                        style={{ background: "var(--trac-primary)" }}
                    >
                        {project.name?.charAt(0)?.toUpperCase()}
                    </span>
                    <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
                </div>
                {actions}
            </div>

            {/* Tab bar — sits on the header's bottom border */}
            <nav className="-mb-4 mt-4 flex gap-1 overflow-x-auto">
                {tabs.map((t) => {
                    const active = t.key === tab;
                    const Icon = t.icon;
                    return (
                        <Link
                            key={t.key}
                            href={t.href}
                            className="flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors"
                            style={
                                active
                                    ? { borderColor: "var(--trac-primary)", color: "var(--trac-primary-800)" }
                                    : { borderColor: "transparent", color: "#6b7280" }
                            }
                        >
                            <Icon size={15} strokeWidth={active ? 2.2 : 1.8} />
                            {t.name}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );

    return <SidebarLayout header={header}>{children}</SidebarLayout>;
}

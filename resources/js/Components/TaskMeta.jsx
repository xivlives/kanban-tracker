import { Flag } from "lucide-react";

export const STATUS = {
    pending: { label: "To Do", color: "var(--trac-orange)" },
    "in-progress": { label: "In Progress", color: "var(--trac-primary)" },
    "in-review": { label: "In Review", color: "var(--trac-accent)" },
    done: { label: "Done", color: "var(--trac-success)" },
};

const PRIORITY = {
    urgent: { label: "Urgent", color: "var(--trac-danger)" },
    high: { label: "High", color: "var(--trac-orange)" },
    medium: { label: "Medium", color: "#9ca3af" },
    low: { label: "Low", color: "#cbd5e1" },
};

// Stable avatar color from a name
const AVATAR_COLORS = [
    "var(--trac-primary)", "var(--trac-orange)", "var(--trac-danger)",
    "var(--trac-primary-600)", "oklch(60% 0.15 300)", "oklch(62% 0.16 160)",
];
export function avatarColor(name = "") {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
    return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

export function StatusBadge({ status }) {
    const s = STATUS[status] || STATUS.pending;
    return (
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-gray-700">
            <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
            {s.label}
        </span>
    );
}

export function PriorityFlag({ priority }) {
    const p = PRIORITY[priority] || PRIORITY.medium;
    return (
        <span className="inline-flex items-center gap-1 text-xs text-gray-600" title={`${p.label} priority`}>
            <Flag size={13} style={{ color: p.color }} fill={p.color} />
            {p.label}
        </span>
    );
}

export function TaskKey({ value }) {
    if (!value) return null;
    return <span className="font-mono text-xs font-semibold text-gray-400">{value}</span>;
}

export function Assignee({ user, size = "sm" }) {
    const px = size === "md" ? "h-7 w-7 text-xs" : "h-6 w-6 text-[0.65rem]";
    if (!user) {
        return <span className={`inline-flex ${px} items-center justify-center rounded-full bg-gray-100 text-gray-400`}>–</span>;
    }
    return (
        <span
            className={`inline-flex ${px} items-center justify-center rounded-full font-bold text-white`}
            style={{ background: avatarColor(user.name) }}
            title={user.name}
        >
            {user.name?.charAt(0)?.toUpperCase()}
        </span>
    );
}

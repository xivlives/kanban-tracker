import { Link } from "@inertiajs/react";
import TracLogo from "@/Components/TracLogo";

const FEATURES = [
    { title: "Kanban boards", body: "Drag tasks from Pending to Done.", dot: "var(--trac-primary)" },
    { title: "Action items from meetings", body: "Synced straight from Meenits.", dot: "var(--trac-accent)" },
    { title: "Progress & reports", body: "See what's moving at a glance.", dot: "var(--trac-orange)" },
];

function Wordmark({ light }) {
    return (
        <Link href="/" className="inline-flex items-center gap-2">
            <span style={{ color: light ? "#fff" : "var(--trac-primary)" }}>
                <TracLogo size={32} />
            </span>
            <span
                className="text-xl font-bold tracking-tight"
                style={{ color: light ? "#fff" : "var(--trac-ink)" }}
            >
                MeenitsTrac
            </span>
        </Link>
    );
}

export default function GuestLayout({ children }) {
    return (
        <div className="auth-split">
            {/* LEFT — brand panel (md+) */}
            <aside className="auth-split-brand trac-brand-gradient relative w-[44%] flex-col justify-between overflow-hidden p-10 text-white">
                <div
                    aria-hidden
                    className="pointer-events-none absolute -left-16 -top-16 h-72 w-72 rounded-full opacity-30 blur-2xl"
                    style={{ background: "radial-gradient(circle, var(--trac-primary), transparent 70%)" }}
                />
                <div
                    aria-hidden
                    className="pointer-events-none absolute -bottom-20 right-0 h-80 w-80 rounded-full opacity-20 blur-3xl"
                    style={{ background: "radial-gradient(circle, var(--trac-accent), transparent 70%)" }}
                />

                <div className="relative z-10">
                    <Wordmark light />
                </div>

                <div className="relative z-10 max-w-sm">
                    <h2 className="text-3xl font-extrabold leading-tight">
                        Track every task.<br />Close every loop.
                    </h2>
                    <p className="mt-3 text-sm text-white/75">
                        The kanban tracker that turns your meeting action items into done work.
                    </p>

                    <ul className="mt-8 space-y-4">
                        {FEATURES.map((f) => (
                            <li key={f.title} className="flex items-start gap-3">
                                <span
                                    className="mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full"
                                    style={{ background: f.dot }}
                                />
                                <span>
                                    <span className="block text-sm font-semibold">{f.title}</span>
                                    <span className="block text-sm text-white/70">{f.body}</span>
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                <p className="relative z-10 text-xs text-white/55">Part of the Meenits suite.</p>
            </aside>

            {/* MOBILE — brand strip */}
            <header className="auth-split-strip trac-brand-gradient flex items-center justify-between px-6 py-5 text-white">
                <Wordmark light />
            </header>

            {/* RIGHT — form */}
            <main className="flex flex-1 items-center justify-center bg-gray-50 px-6 py-10">
                <div className="w-full max-w-md">
                    <div className="overflow-hidden rounded-2xl bg-white px-7 py-8 shadow-sm ring-1 ring-gray-100">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}

import { Head, Link } from "@inertiajs/react";
import TracLogo from "@/Components/TracLogo";

const FEATURES = [
    {
        title: "Drag & drop kanban",
        body: "Move tasks across Pending, In Progress and Done. Your whole workload, at a glance.",
        color: "var(--trac-primary)",
        icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    },
    {
        title: "Action items from meetings",
        body: "Connect Meenits and your meeting to-dos land on the board automatically — assigned and tracked.",
        color: "var(--trac-accent)",
        icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
        title: "Automated reports",
        body: "Daily progress reports on completion rates and momentum, generated for you overnight.",
        color: "var(--trac-orange)",
        icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    },
];

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="MeenitsTrac — Track every task" />
            <div className="min-h-screen bg-gray-50">
                {/* HERO (brand gradient) */}
                <div className="trac-brand-gradient relative overflow-hidden text-white">
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full opacity-25 blur-3xl"
                        style={{ background: "radial-gradient(circle, var(--trac-accent), transparent 70%)" }}
                    />
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full opacity-20 blur-3xl"
                        style={{ background: "radial-gradient(circle, var(--trac-primary), transparent 70%)" }}
                    />

                    <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
                        <span className="inline-flex items-center gap-2 text-white">
                            <TracLogo size={32} />
                            <span className="text-xl font-bold tracking-tight">MeenitsTrac</span>
                        </span>
                        <div className="flex items-center gap-3">
                            {auth?.user ? (
                                <Link href={route("dashboard")} className="rounded-lg bg-white px-4 py-2 text-sm font-semibold" style={{ color: "var(--trac-primary-800)" }}>
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link href={route("login")} className="px-4 py-2 text-sm font-semibold text-white/90 hover:text-white">
                                        Log in
                                    </Link>
                                    <Link href={route("register")} className="rounded-lg bg-white px-4 py-2 text-sm font-semibold" style={{ color: "var(--trac-primary-800)" }}>
                                        Sign up
                                    </Link>
                                </>
                            )}
                        </div>
                    </nav>

                    <div className="relative z-10 mx-auto max-w-7xl px-4 pb-24 pt-16 text-center sm:px-6 lg:px-8">
                        <h1 className="text-4xl font-extrabold leading-tight sm:text-6xl">
                            Track every task.
                            <span className="block" style={{ color: "var(--trac-accent)" }}>Close every loop.</span>
                        </h1>
                        <p className="mx-auto mt-5 max-w-2xl text-lg text-white/80">
                            A clean Kanban tracker for projects and tasks. Use it on its own — or connect
                            Meenits and turn your meeting action items into done work.
                        </p>
                        <div className="mt-8 flex justify-center gap-3">
                            <Link
                                href={auth?.user ? route("dashboard") : route("register")}
                                className="rounded-lg bg-white px-7 py-3.5 text-base font-bold shadow-lg transition hover:shadow-xl"
                                style={{ color: "var(--trac-primary-800)" }}
                            >
                                {auth?.user ? "Go to dashboard" : "Get started free"}
                            </Link>
                            {!auth?.user && (
                                <Link href={route("login")} className="rounded-lg border-2 border-white/30 bg-white/10 px-7 py-3.5 text-base font-bold text-white backdrop-blur transition hover:bg-white/20">
                                    Sign in
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* FEATURES */}
                <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                    <div className="grid gap-8 md:grid-cols-3">
                        {FEATURES.map((f) => (
                            <div key={f.title} className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
                                <div
                                    className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl"
                                    style={{ background: f.color, color: "#10302f" }}
                                >
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={f.icon} />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold" style={{ color: "var(--trac-ink)" }}>{f.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-gray-600">{f.body}</p>
                            </div>
                        ))}
                    </div>

                    {/* Standalone / connected band */}
                    <div className="mt-12 rounded-2xl p-8 text-white trac-brand-gradient sm:flex sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-xl font-bold">Works on its own — or with Meenits.</h3>
                            <p className="mt-1 text-sm text-white/75">
                                Sign up and start tracking today. Already use Meenits? Connect it to auto-sync action items.
                            </p>
                        </div>
                        {!auth?.user && (
                            <Link href={route("register")} className="mt-4 inline-block rounded-lg bg-white px-6 py-3 text-sm font-bold sm:mt-0" style={{ color: "var(--trac-primary-800)" }}>
                                Create your account
                            </Link>
                        )}
                    </div>
                </div>

                <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
                    MeenitsTrac · part of the Meenits suite
                </footer>
            </div>
        </>
    );
}

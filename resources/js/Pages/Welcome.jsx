import { Head, Link } from "@inertiajs/react";
import TracLogo from "@/Components/TracLogo";

const FEATURES = [
    {
        title: "Drag & drop kanban",
        body: "Move tasks across Pending, In Progress and Done. Your whole workload at a glance, without the overhead.",
        color: "var(--trac-primary)",
        icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    },
    {
        title: "Action items from meetings",
        body: "Connect Meenits and your meeting to-dos land on the board automatically — assigned, labelled, and tracked.",
        color: "var(--trac-accent)",
        icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
        title: "Automated reports",
        body: "Daily progress reports on completion rates and momentum, generated overnight and ready each morning.",
        color: "var(--trac-orange)",
        icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    },
    {
        title: "Team workspaces",
        body: "Every team member lands in their own project view. Invite colleagues, assign tasks, and see who's doing what.",
        color: "var(--trac-primary)",
        icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
    },
    {
        title: "Project timelines",
        body: "See every project's tasks mapped across time. Spot what's overdue, what's coming up, and what's already shipped.",
        color: "var(--trac-orange)",
        icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    },
    {
        title: "Backlog management",
        body: "Park ideas and unprioritised work in the backlog. Pull them into active sprints when the time is right.",
        color: "var(--trac-accent)",
        icon: "M4 6h16M4 10h16M4 14h16M4 18h16",
    },
];

const HOW_IT_WORKS = [
    {
        number: "01",
        title: "Create a project",
        body: "Set up a project in seconds — name it, describe it, and invite your team. No configuration maze required.",
        color: "var(--trac-primary)",
    },
    {
        number: "02",
        title: "Add & assign tasks",
        body: "Break the project into tasks. Assign owners, set due dates, and drag them through your kanban board as work progresses.",
        color: "var(--trac-accent)",
    },
    {
        number: "03",
        title: "Connect Meenits (optional)",
        body: "Link your Meenits account once. Every action item from your meetings lands directly on the right board — zero copy-pasting.",
        color: "var(--trac-orange)",
    },
];

const USE_CASES = [
    {
        label: "Students",
        headline: "Turn lecture action items into study tasks",
        body: "Meenits captures your class discussion and generates to-do items. MeenitsTrac turns them into a revision board so nothing falls through before the exam.",
        icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.75 0-3.332.477-4.5 1.253",
    },
    {
        label: "Freelancers",
        headline: "Client calls → tasks in seconds",
        body: "Record the client briefing in Meenits, let it extract deliverables, and watch them appear as an assigned task list in Trac — ready to ship.",
        icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    },
    {
        label: "Teams",
        headline: "Never lose a meeting decision again",
        body: "Stand-ups, retros, planning sessions — every decision becomes a tracked task with an owner and a due date, synced across the whole team instantly.",
        icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
    },
];

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="MeenitsTrac — Track every task" />
            <div className="min-h-screen bg-gray-50">

                {/* ── HERO ── */}
                <div className="trac-brand-gradient relative overflow-hidden text-white">
                    {/* Ambient glows */}
                    <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full opacity-25 blur-3xl" style={{ background: "radial-gradient(circle, var(--trac-accent), transparent 70%)" }} />
                    <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, var(--trac-primary), transparent 70%)" }} />

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
                                    <Link href={route("login")} className="px-4 py-2 text-sm font-semibold text-white/90 hover:text-white transition">
                                        Log in
                                    </Link>
                                    <Link href={route("register")} className="rounded-lg bg-white px-4 py-2 text-sm font-semibold transition hover:bg-white/90" style={{ color: "var(--trac-primary-800)" }}>
                                        Sign up free
                                    </Link>
                                </>
                            )}
                        </div>
                    </nav>

                    <div className="relative z-10 mx-auto max-w-7xl px-4 pb-28 pt-16 text-center sm:px-6 lg:px-8">
                        <span className="mb-5 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/80 backdrop-blur">
                            Part of the Meenits suite
                        </span>
                        <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-6xl">
                            Track every task.
                            <span className="block" style={{ color: "var(--trac-accent)" }}>Close every loop.</span>
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/80">
                            A clean kanban tracker for projects and tasks — built for individuals, freelancers, and teams. Use it standalone or connect Meenits to turn meeting action items into tracked work automatically.
                        </p>
                        <div className="mt-10 flex flex-wrap justify-center gap-4">
                            <Link
                                href={auth?.user ? route("dashboard") : route("register")}
                                className="rounded-lg bg-white px-7 py-3.5 text-base font-bold shadow-lg transition hover:shadow-xl hover:-translate-y-0.5"
                                style={{ color: "var(--trac-primary-800)" }}
                            >
                                {auth?.user ? "Go to dashboard" : "Get started free"}
                            </Link>
                            {!auth?.user && (
                                <Link
                                    href={route("login")}
                                    className="rounded-lg border-2 border-white/30 bg-white/10 px-7 py-3.5 text-base font-bold text-white backdrop-blur transition hover:bg-white/20"
                                >
                                    Sign in
                                </Link>
                            )}
                        </div>

                        {/* Social proof strip */}
                        <div className="mt-14 flex flex-wrap justify-center gap-x-10 gap-y-3 text-sm text-white/60">
                            {["No credit card required", "Free tier available", "Works with Google Meet, Zoom & Teams"].map((item) => (
                                <span key={item} className="flex items-center gap-1.5">
                                    <svg className="h-4 w-4 shrink-0 text-trac-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ color: "var(--trac-accent)" }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── HOW IT WORKS ── */}
                <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mb-12 text-center">
                        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--trac-primary)" }}>How it works</span>
                        <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl" style={{ color: "var(--trac-ink)" }}>Three steps. Zero overhead.</h2>
                        <p className="mx-auto mt-3 max-w-xl text-base text-gray-500">From project idea to shipped work — without the setup tax.</p>
                    </div>
                    <div className="grid gap-8 md:grid-cols-3">
                        {HOW_IT_WORKS.map((step, i) => (
                            <div key={step.number} className="relative rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
                                {/* connector line (desktop) */}
                                {i < HOW_IT_WORKS.length - 1 && (
                                    <div className="absolute -right-4 top-10 hidden h-0.5 w-8 md:block" style={{ background: "var(--trac-primary-100)" }} />
                                )}
                                <span className="mb-4 inline-block rounded-xl px-3 py-1 text-xs font-bold uppercase tracking-widest text-white" style={{ background: step.color }}>
                                    {step.number}
                                </span>
                                <h3 className="text-lg font-bold" style={{ color: "var(--trac-ink)" }}>{step.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-gray-500">{step.body}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── FEATURES ── */}
                <div className="border-t border-gray-100 bg-white">
                    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                        <div className="mb-12 text-center">
                            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--trac-primary)" }}>Features</span>
                            <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl" style={{ color: "var(--trac-ink)" }}>Everything you need to ship</h2>
                            <p className="mx-auto mt-3 max-w-xl text-base text-gray-500">Kanban, reports, timelines, backlogs — and a direct line from your meetings to your task board.</p>
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {FEATURES.map((f) => (
                                <div key={f.title} className="rounded-2xl bg-gray-50 p-7 ring-1 ring-gray-100 transition hover:shadow-md hover:-translate-y-0.5">
                                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: f.color }}>
                                        <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={f.icon} />
                                        </svg>
                                    </div>
                                    <h3 className="font-bold" style={{ color: "var(--trac-ink)" }}>{f.title}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-gray-500">{f.body}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── WHO IS IT FOR ── */}
                <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mb-12 text-center">
                        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--trac-primary)" }}>Who it's for</span>
                        <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl" style={{ color: "var(--trac-ink)" }}>Built for how you actually work</h2>
                    </div>
                    <div className="grid gap-6 md:grid-cols-3">
                        {USE_CASES.map((uc) => (
                            <div key={uc.label} className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100 transition hover:shadow-md">
                                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl trac-brand-gradient">
                                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={uc.icon} />
                                    </svg>
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--trac-primary)" }}>{uc.label}</span>
                                <h3 className="mt-1 text-base font-bold" style={{ color: "var(--trac-ink)" }}>{uc.headline}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-gray-500">{uc.body}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── MEENITS CONNECT BAND ── */}
                <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
                    <div className="rounded-2xl p-8 text-white trac-brand-gradient sm:flex sm:items-center sm:justify-between">
                        <div className="max-w-lg">
                            <h3 className="text-xl font-bold">Works on its own — or with Meenits.</h3>
                            <p className="mt-2 text-sm leading-relaxed text-white/75">
                                Sign up and start tracking today. Already use Meenits? Connect once and every meeting action item lands on the right board, assigned to the right person, automatically.
                            </p>
                        </div>
                        <div className="mt-6 flex flex-col gap-3 sm:mt-0 sm:ml-8 sm:shrink-0">
                            {!auth?.user && (
                                <Link href={route("register")} className="rounded-lg bg-white px-6 py-3 text-center text-sm font-bold transition hover:bg-white/90" style={{ color: "var(--trac-primary-800)" }}>
                                    Create your account
                                </Link>
                            )}
                            <a href="https://meenits.app" target="_blank" rel="noopener" className="rounded-lg border border-white/30 bg-white/10 px-6 py-3 text-center text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20">
                                Learn about Meenits →
                            </a>
                        </div>
                    </div>
                </div>

                {/* ── FOOTER ── */}
                <footer className="border-t border-gray-100 bg-white">
                    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
                        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

                            {/* Brand */}
                            <div className="lg:col-span-1">
                                <span className="inline-flex items-center gap-2">
                                    <TracLogo size={28} />
                                    <span className="text-lg font-bold tracking-tight" style={{ color: "var(--trac-ink)" }}>MeenitsTrac</span>
                                </span>
                                <p className="mt-3 text-sm leading-relaxed text-gray-500">
                                    A clean kanban tracker for projects and teams. Part of the Meenits suite.
                                </p>
                                <div className="mt-5 flex gap-4">
                                    <a href="https://twitter.com/meenitsapp" target="_blank" rel="noopener" className="text-gray-400 transition hover:text-gray-600" aria-label="Twitter">
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" /></svg>
                                    </a>
                                    <a href="https://linkedin.com/company/meenits" target="_blank" rel="noopener" className="text-gray-400 transition hover:text-gray-600" aria-label="LinkedIn">
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                                    </a>
                                </div>
                            </div>

                            {/* Product */}
                            <div>
                                <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-400">Product</h4>
                                <ul className="space-y-3 text-sm">
                                    {[
                                        { label: "Features", href: "#features", external: false },
                                        { label: "How it works", href: "#how-it-works", external: false },
                                        { label: "Pricing", href: "https://meenits.app/#pricing", external: true },
                                        { label: "Dashboard", href: route("dashboard"), external: false },
                                    ].map((l) => (
                                        <li key={l.label}>
                                            <a href={l.href} target={l.external ? "_blank" : undefined} rel={l.external ? "noopener" : undefined} className="text-gray-500 transition hover:text-gray-800">{l.label}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* The Meenits Suite */}
                            <div>
                                <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-400">Meenits Suite</h4>
                                <ul className="space-y-3 text-sm">
                                    {[
                                        { label: "Meenits (Personal)", href: "https://app.meenits.app" },
                                        { label: "Meenits for Teams", href: "https://org.meenits.app" },
                                        { label: "meenits.app", href: "https://meenits.app" },
                                    ].map((l) => (
                                        <li key={l.label}>
                                            <a href={l.href} target="_blank" rel="noopener" className="text-gray-500 transition hover:text-gray-800">{l.label}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Legal & Account */}
                            <div>
                                <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-400">Company</h4>
                                <ul className="space-y-3 text-sm">
                                    {[
                                        { label: "Privacy Policy", href: "https://meenits.app/privacy" },
                                        { label: "Terms of Service", href: "https://meenits.app/terms" },
                                        { label: "Sign up", href: route("register") },
                                        { label: "Log in", href: route("login") },
                                    ].map((l) => (
                                        <li key={l.label}>
                                            <a href={l.href} className="text-gray-500 transition hover:text-gray-800">{l.label}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-8 sm:flex-row">
                            <p className="text-sm text-gray-400">
                                &copy; {new Date().getFullYear()} Meenits. All rights reserved.
                            </p>
                            <p className="text-sm text-gray-400">
                                MeenitsTrac · part of the <a href="https://meenits.app" target="_blank" rel="noopener" className="transition hover:text-gray-600">Meenits suite</a>
                            </p>
                        </div>
                    </div>
                </footer>

            </div>
        </>
    );
}

import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    Menu, LayoutDashboard, FolderKanban, BarChart3, Settings2,
    LogOut, User, ListTodo, AlertCircle, Inbox, ChevronDown, Plus, Check, Building2, Users2,
} from 'lucide-react';
import TracLogo from '@/Components/TracLogo';
import Dropdown from '@/Components/Dropdown';
import CreateProjectModal from '@/Components/CreateProjectModal';

export default function SidebarLayout({ header, children }) {
    const page = usePage().props;
    const { auth } = page;
    const user = auth.user;
    const projects = page.sidebarProjects ?? [];
    const currentTeam = page.currentTeam ?? null;
    const teams = page.teams ?? [];
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showCreateProject, setShowCreateProject] = useState(false);
    const [boardsOpen, setBoardsOpen] = useState(route().current('projects.*'));

    // Dashboard sits above the Boards dropdown; the rest below it.
    const dashboardItem = { name: 'Dashboard', href: route('dashboard'), icon: LayoutDashboard, active: route().current('dashboard') };
    const planningNav = [
        { name: 'Backlog', href: route('backlog.index'), icon: Inbox, active: route().current('backlog.*') },
        { name: 'Issues', href: route('issues.index'), icon: AlertCircle, active: route().current('issues.*') },
        { name: 'Reports', href: route('reports.index'), icon: BarChart3, active: route().current('reports.*') },
    ];

    const settingsNav = [
        { name: 'Members', href: route('team.members.index'), icon: Users2, active: route().current('team.members.*') },
        { name: 'Integration', href: route('integration.index'), icon: Settings2, active: route().current('integration.*') },
        { name: 'Profile', href: route('profile.edit'), icon: User, active: route().current('profile.*') },
    ];

    const NavSection = ({ title, items }) => (
        <div className="mb-4">
            <div className="px-3 mb-2">
                <span className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-white/40">
                    {title}
                </span>
            </div>
            <nav className="space-y-0.5">
                {items.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${item.active
                                ? 'bg-white/15 text-white'
                                : 'text-white/70 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            <Icon
                                className={`mr-3 h-[18px] w-[18px] flex-shrink-0 ${item.active ? 'text-[var(--trac-accent)]' : 'text-white/50 group-hover:text-white/70'
                                    }`}
                                strokeWidth={item.active ? 2.2 : 1.8}
                            />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );

    const itemClass = (active) =>
        `group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${active
            ? 'bg-white/15 text-white'
            : 'text-white/70 hover:bg-white/10 hover:text-white'}`;

    const NavItem = ({ item }) => {
        const Icon = item.icon;
        return (
            <Link href={item.href} onClick={() => setMobileMenuOpen(false)} className={itemClass(item.active)}>
                <Icon
                    className={`mr-3 h-[18px] w-[18px] flex-shrink-0 ${item.active ? 'text-[var(--trac-accent)]' : 'text-white/50 group-hover:text-white/70'}`}
                    strokeWidth={item.active ? 2.2 : 1.8}
                />
                {item.name}
            </Link>
        );
    };

    const openCreate = () => { setShowCreateProject(true); setMobileMenuOpen(false); };

    const BoardsDropdown = () => {
        const active = route().current('projects.*');
        const currentId = route().params?.project;
        return (
            <div>
                <button type="button" onClick={() => setBoardsOpen((o) => !o)} className={`w-full ${itemClass(active)}`}>
                    <FolderKanban
                        className={`mr-3 h-[18px] w-[18px] flex-shrink-0 ${active ? 'text-[var(--trac-accent)]' : 'text-white/50 group-hover:text-white/70'}`}
                        strokeWidth={active ? 2.2 : 1.8}
                    />
                    <span className="flex-1 text-left">Boards</span>
                    <ChevronDown size={15} className={`text-white/50 transition-transform ${boardsOpen ? 'rotate-180' : ''}`} />
                </button>

                {boardsOpen && (
                    <div className="mt-0.5 space-y-0.5 pl-7">
                        {projects.length === 0 ? (
                            <button type="button" onClick={openCreate} className="flex w-full items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white">
                                <Plus size={14} /> Create project
                            </button>
                        ) : (
                            <>
                                {projects.map((p) => {
                                    const isCurrent = active && String(currentId) === String(p.id);
                                    return (
                                        <Link
                                            key={p.id}
                                            href={route('projects.show', p.id)}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`block truncate rounded-lg px-3 py-1.5 text-sm transition-colors ${isCurrent ? 'bg-white/10 font-medium text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                                            title={p.name}
                                        >
                                            {p.name}
                                        </Link>
                                    );
                                })}
                                <button type="button" onClick={openCreate} className="flex w-full items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white/45 transition-colors hover:text-white">
                                    <Plus size={13} /> New project
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const SidebarContent = () => (
        <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-16 shrink-0 items-center px-6">
                <Link href="/" className="flex items-center gap-2">
                    <TracLogo size={28} />
                    <span className="text-xl font-bold tracking-tight text-white">MeenitsTrac</span>
                </Link>
            </div>

            {/* Team switcher */}
            <div className="px-4 pb-3">
                <Dropdown>
                    <Dropdown.Trigger>
                        <button className="flex w-full items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-left transition-colors hover:bg-white/15">
                            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-xs font-bold" style={{ background: 'var(--trac-accent)', color: 'var(--trac-ink)' }}>
                                {currentTeam?.name?.charAt(0)?.toUpperCase() ?? 'T'}
                            </span>
                            <span className="flex-1 truncate text-sm font-semibold text-white">{currentTeam?.name ?? 'No team'}</span>
                            <ChevronDown size={14} className="flex-shrink-0 text-white/50" />
                        </button>
                    </Dropdown.Trigger>
                    <Dropdown.Content width="60">
                        <div className="px-3 pb-1 pt-2 text-[0.6rem] font-bold uppercase tracking-wider text-gray-400">Your teams</div>
                        {teams.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => router.post(route('teams.switch', t.id))}
                                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100"
                            >
                                <span className="flex items-center gap-2 truncate">
                                    <Building2 size={14} className="flex-shrink-0 text-gray-400" />
                                    <span className="truncate">{t.name}</span>
                                </span>
                                {currentTeam?.id === t.id && <Check size={15} style={{ color: 'var(--trac-primary)' }} />}
                            </button>
                        ))}
                    </Dropdown.Content>
                </Dropdown>
            </div>

            {/* Navigation sections */}
            <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4">
                <div className="mb-4">
                    <div className="px-3 mb-2">
                        <span className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-white/40">Planning</span>
                    </div>
                    <nav className="space-y-0.5">
                        <NavItem item={dashboardItem} />
                        <BoardsDropdown />
                        {planningNav.map((item) => <NavItem key={item.name} item={item} />)}
                    </nav>
                </div>
                <div className="my-3 border-t border-white/10" />
                <NavSection title="Settings" items={settingsNav} />
            </div>

            {/* Bottom Profile */}
            <div className="border-t border-white/10 p-4">
                <Dropdown>
                    <Dropdown.Trigger>
                        <button className="flex w-full items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-white/10">
                            <div className="flex items-center truncate">
                                <div className="trac-avatar trac-avatar-md" style={{ backgroundColor: 'var(--trac-accent)', color: 'var(--trac-ink)' }}>
                                    {user.name.charAt(0)}
                                </div>
                                <span className="ml-3 truncate text-sm font-medium text-white">
                                    {user.name}
                                </span>
                            </div>
                        </button>
                    </Dropdown.Trigger>
                    <Dropdown.Content align="top" width="48">
                        <Dropdown.Link href={route('profile.edit')} className="flex items-center gap-2 text-sm text-gray-700">
                            <User size={16} /> Profile
                        </Dropdown.Link>
                        <Dropdown.Link href={route('logout')} method="post" as="button" className="flex items-center gap-2 text-sm text-red-600">
                            <LogOut size={16} /> Log Out
                        </Dropdown.Link>
                    </Dropdown.Content>
                </Dropdown>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Mobile menu backdrop */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-900/80 backdrop-blur-sm transition-opacity lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-[var(--trac-primary-950)] trac-brand-gradient transition-transform duration-300 ease-in-out lg:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <SidebarContent />
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 trac-brand-gradient border-r border-[var(--trac-primary-800)]">
                <SidebarContent />
            </div>

            {/* Main Content wrapper */}
            <div className="flex flex-1 flex-col lg:pl-64 overflow-hidden">
                {/* Mobile Header */}
                <div className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm lg:hidden">
                    <button
                        type="button"
                        className="-m-2.5 p-2.5 text-gray-700 lg:hidden hover:text-gray-900 transition-colors"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <span className="sr-only">Open sidebar</span>
                        <Menu className="h-6 w-6" aria-hidden="true" />
                    </button>
                    <div className="flex flex-1 justify-between gap-x-4 lg:hidden">
                        <div className="font-semibold text-gray-900 truncate">
                            {header}
                        </div>
                    </div>
                </div>

                {/* Main scrollable area */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden">
                    {/* Desktop Header Slot */}
                    {header && (
                        <div className="hidden lg:block border-b border-gray-200 bg-white px-8 py-4">
                            {typeof header === 'string' ? (
                                <h1 className="text-xl font-bold tracking-tight text-gray-900">{header}</h1>
                            ) : header}
                        </div>
                    )}

                    <div className="px-4 py-6 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>

            <CreateProjectModal show={showCreateProject} onClose={() => setShowCreateProject(false)} />
        </div>
    );
}

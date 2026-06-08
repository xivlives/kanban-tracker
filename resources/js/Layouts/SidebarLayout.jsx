import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    Menu, LayoutDashboard, FolderKanban, BarChart3, Settings2,
    LogOut, User, ListTodo, AlertCircle, Inbox,
} from 'lucide-react';
import TracLogo from '@/Components/TracLogo';
import Dropdown from '@/Components/Dropdown';

export default function SidebarLayout({ header, children }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const planningNav = [
        { name: 'Dashboard', href: route('dashboard'), icon: LayoutDashboard, active: route().current('dashboard') },
        { name: 'Board', href: route('projects.index'), icon: FolderKanban, active: route().current('projects.*') },
        { name: 'Backlog', href: route('backlog.index'), icon: Inbox, active: route().current('backlog.*') },
        { name: 'Issues', href: route('issues.index'), icon: AlertCircle, active: route().current('issues.*') },
        { name: 'Reports', href: route('reports.index'), icon: BarChart3, active: route().current('reports.*') },
    ];

    const settingsNav = [
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
                            className={`group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                item.active
                                    ? 'bg-white/15 text-white'
                                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            <Icon
                                className={`mr-3 h-[18px] w-[18px] flex-shrink-0 ${
                                    item.active ? 'text-[var(--trac-accent)]' : 'text-white/50 group-hover:text-white/70'
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

    const SidebarContent = () => (
        <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-16 shrink-0 items-center px-6">
                <Link href="/" className="flex items-center gap-2">
                    <TracLogo size={28} />
                    <span className="text-xl font-bold tracking-tight text-white">MeenitsTrac</span>
                </Link>
            </div>

            {/* Navigation sections */}
            <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4">
                <NavSection title="Planning" items={planningNav} />
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
            <div className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-[var(--trac-primary-950)] trac-brand-gradient transition-transform duration-300 ease-in-out lg:hidden ${
                mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
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
        </div>
    );
}

import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Users2, Mail, Shield, ShieldCheck, Crown, Trash2, UserPlus, X, Clock } from 'lucide-react';

const ROLE_CONFIG = {
    owner: { label: 'Owner', icon: Crown, color: 'var(--trac-accent)', bg: 'oklch(95% .1 100)' },
    admin: { label: 'Admin', icon: ShieldCheck, color: 'var(--trac-primary)', bg: 'var(--trac-primary-100)' },
    member: { label: 'Member', icon: Shield, color: 'oklch(55% 0 0)', bg: 'oklch(95% 0 0)' },
};

export default function Members({ team, members = [], invitations = [], canManage, currentUserId }) {
    const [showInvite, setShowInvite] = useState(false);

    const inviteForm = useForm({ email: '', role: 'member' });

    const sendInvite = (e) => {
        e.preventDefault();
        inviteForm.post(route('team.invitations.store'), {
            preserveScroll: true,
            onSuccess: () => { inviteForm.reset(); setShowInvite(false); },
        });
    };

    const changeRole = (userId, newRole) => {
        router.patch(route('team.members.updateRole', userId), { role: newRole }, { preserveScroll: true });
    };

    const removeMember = (userId, name) => {
        if (!confirm(`Remove ${name} from ${team.name}?`)) return;
        router.delete(route('team.members.destroy', userId), { preserveScroll: true });
    };

    const cancelInvitation = (id) => {
        if (!confirm('Cancel this invitation?')) return;
        router.delete(route('team.invitations.destroy', id), { preserveScroll: true });
    };

    return (
        <SidebarLayout header="Team Members">
            <Head title="Team Members" />

            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">{team.name}</h2>
                    <p className="text-sm text-gray-500">{members.length} member{members.length !== 1 ? 's' : ''}</p>
                </div>
                {canManage && (
                    <button
                        onClick={() => setShowInvite(true)}
                        className="trac-btn-primary flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold"
                    >
                        <UserPlus size={16} />
                        Invite
                    </button>
                )}
            </div>

            {/* Members list */}
            <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead>
                        <tr className="bg-gray-50/80">
                            <th className="px-5 py-3 text-left text-[0.65rem] font-bold uppercase tracking-wider text-gray-400">Member</th>
                            <th className="px-5 py-3 text-left text-[0.65rem] font-bold uppercase tracking-wider text-gray-400 hidden md:table-cell">Email</th>
                            <th className="px-5 py-3 text-left text-[0.65rem] font-bold uppercase tracking-wider text-gray-400">Role</th>
                            {canManage && (
                                <th className="px-5 py-3 text-right text-[0.65rem] font-bold uppercase tracking-wider text-gray-400">Actions</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {members.map((m) => {
                            const cfg = ROLE_CONFIG[m.role] || ROLE_CONFIG.member;
                            const RoleIcon = cfg.icon;
                            const isOwner = m.role === 'owner';
                            const isSelf = m.id === currentUserId;
                            return (
                                <tr key={m.id} className="hover:bg-gray-50/60 transition-colors">
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-3">
                                            <span
                                                className="trac-avatar trac-avatar-md shrink-0"
                                                style={{ backgroundColor: cfg.color, color: '#fff' }}
                                            >
                                                {m.name.charAt(0).toUpperCase()}
                                            </span>
                                            <div>
                                                <span className="text-sm font-semibold text-gray-900">{m.name}</span>
                                                {isSelf && <span className="ml-1.5 text-[0.6rem] font-bold text-[var(--trac-primary)]">(you)</span>}
                                                <p className="text-xs text-gray-400 md:hidden">{m.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 hidden md:table-cell">
                                        <span className="text-sm text-gray-500">{m.email}</span>
                                    </td>
                                    <td className="px-5 py-3">
                                        {canManage && !isOwner && !isSelf ? (
                                            <select
                                                value={m.role}
                                                onChange={(e) => changeRole(m.id, e.target.value)}
                                                className="text-xs font-bold rounded-full px-2.5 py-1 border-0 focus:ring-1 focus:ring-[var(--trac-primary)]"
                                                style={{ backgroundColor: cfg.bg, color: cfg.color }}
                                            >
                                                <option value="admin">Admin</option>
                                                <option value="member">Member</option>
                                            </select>
                                        ) : (
                                            <span
                                                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold"
                                                style={{ backgroundColor: cfg.bg, color: cfg.color }}
                                            >
                                                <RoleIcon size={12} />
                                                {cfg.label}
                                            </span>
                                        )}
                                    </td>
                                    {canManage && (
                                        <td className="px-5 py-3 text-right">
                                            {!isOwner && !isSelf && (
                                                <button
                                                    onClick={() => removeMember(m.id, m.name)}
                                                    className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors"
                                                    title="Remove member"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pending invitations */}
            {canManage && invitations.length > 0 && (
                <div className="mt-8">
                    <h3 className="mb-3 text-sm font-bold text-gray-700">Pending Invitations</h3>
                    <div className="space-y-2">
                        {invitations.map((inv) => (
                            <div key={inv.id} className="flex items-center justify-between rounded-lg bg-white px-4 py-3 shadow-sm ring-1 ring-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                                        <Mail size={14} className="text-gray-400" />
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-900">{inv.email}</span>
                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                            <span className="capitalize">{inv.role}</span>
                                            <span>·</span>
                                            <span>Invited by {inv.inviter_name}</span>
                                            {inv.expires_at && (
                                                <>
                                                    <span>·</span>
                                                    <Clock size={10} />
                                                    <span>Expires {new Date(inv.expires_at).toLocaleDateString()}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => cancelInvitation(inv.id)}
                                    className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Invite modal */}
            {showInvite && (
                <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-[10vh] backdrop-blur-sm" onClick={() => setShowInvite(false)}>
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-gray-900">Invite a team member</h2>
                            <button onClick={() => setShowInvite(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={sendInvite} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Email address</label>
                                <input
                                    type="email"
                                    value={inviteForm.data.email}
                                    onChange={(e) => inviteForm.setData('email', e.target.value)}
                                    className="trac-input w-full rounded-lg border-gray-200 text-sm"
                                    placeholder="colleague@example.com"
                                    required
                                    autoFocus
                                />
                                {inviteForm.errors.email && (
                                    <p className="mt-1 text-xs text-[var(--trac-danger)]">{inviteForm.errors.email}</p>
                                )}
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Role</label>
                                <select
                                    value={inviteForm.data.role}
                                    onChange={(e) => inviteForm.setData('role', e.target.value)}
                                    className="trac-input w-full rounded-lg border-gray-200 text-sm"
                                >
                                    <option value="member">Member — can view/edit tasks</option>
                                    <option value="admin">Admin — can manage members & settings</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 pt-1">
                                <button type="button" onClick={() => setShowInvite(false)} className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200">
                                    Cancel
                                </button>
                                <button type="submit" disabled={inviteForm.processing} className="trac-btn-primary rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50">
                                    {inviteForm.processing ? 'Sending…' : 'Send Invitation'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </SidebarLayout>
    );
}

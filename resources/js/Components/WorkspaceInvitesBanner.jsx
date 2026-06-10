import { usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import { Building2, X } from 'lucide-react';

/**
 * "Join {Org} workspace" prompts (Stage F). Lists Meenits org workspaces the user belongs
 * to but hasn't joined on Trac yet (from the shared `pendingWorkspaceInvites` prop, set at
 * SSO login). Joining adds them to the org's Trac team. The org is the suite-wide workspace.
 */
export default function WorkspaceInvitesBanner() {
    const { pendingWorkspaceInvites = [] } = usePage().props;
    const [dismissed, setDismissed] = useState([]);
    const [joining, setJoining] = useState(null);

    const invites = pendingWorkspaceInvites.filter((i) => !dismissed.includes(i.uuid));
    if (invites.length === 0) return null;

    const join = (uuid) => {
        setJoining(uuid);
        router.post(route('workspaces.join', uuid), {}, { onFinish: () => setJoining(null) });
    };

    return (
        <div className="mb-6 space-y-3">
            {invites.map((inv) => (
                <div
                    key={inv.uuid}
                    className="flex items-center gap-3 rounded-xl border px-4 py-3"
                    style={{ borderColor: 'var(--trac-primary-200)', background: 'var(--trac-primary-50)' }}
                >
                    <span
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-white"
                        style={{ background: 'var(--trac-primary)' }}
                    >
                        <Building2 size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-900">
                            Join “{inv.name}” on MeenitsTrac
                        </p>
                        <p className="text-xs text-gray-500">
                            You’re a member of this workspace on Meenits — join its Trac board to track its tasks.
                        </p>
                    </div>
                    <button
                        onClick={() => join(inv.uuid)}
                        disabled={joining === inv.uuid}
                        className="trac-btn-primary flex-shrink-0 rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60"
                    >
                        {joining === inv.uuid ? 'Joining…' : 'Join'}
                    </button>
                    <button
                        onClick={() => setDismissed((d) => [...d, inv.uuid])}
                        className="flex-shrink-0 text-gray-400 transition hover:text-gray-600"
                        aria-label="Dismiss"
                    >
                        <X size={16} />
                    </button>
                </div>
            ))}
        </div>
    );
}

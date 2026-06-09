import { Head, Link, router } from '@inertiajs/react';
import TracLogo from '@/Components/TracLogo';

export default function InvitationAccept({ invitation, hasAccount, isLoggedIn, currentUserEmail }) {
    const emailMatch = isLoggedIn && currentUserEmail?.toLowerCase() === invitation.email.toLowerCase();

    const handleAccept = () => {
        router.post(route('team.invitations.accept', invitation.token));
    };

    return (
        <>
            <Head title={`Join ${invitation.team_name}`} />
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--trac-primary-950)] to-[#0f1922] p-4">
                <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl text-center">
                    <div className="mb-6 flex justify-center">
                        <TracLogo />
                    </div>

                    <h1 className="text-xl font-bold text-gray-900 mb-2">
                        You've been invited!
                    </h1>
                    <p className="text-sm text-gray-500 mb-6">
                        Join <strong className="text-gray-900">{invitation.team_name}</strong> as a
                        <span className="mx-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold"
                              style={{ backgroundColor: 'var(--trac-primary-100)', color: 'var(--trac-primary-800)' }}>
                            {invitation.role}
                        </span>
                    </p>

                    <div className="rounded-lg bg-gray-50 p-4 mb-6">
                        <p className="text-xs text-gray-500">Invitation sent to</p>
                        <p className="text-sm font-semibold text-gray-900">{invitation.email}</p>
                    </div>

                    {isLoggedIn && emailMatch ? (
                        /* Logged in with matching email — accept directly */
                        <button
                            onClick={handleAccept}
                            className="trac-btn-primary w-full rounded-lg px-4 py-3 text-sm font-bold"
                        >
                            Accept & Join Team
                        </button>
                    ) : isLoggedIn && !emailMatch ? (
                        /* Logged in with wrong email */
                        <div>
                            <p className="text-sm text-[var(--trac-danger)] mb-4">
                                You're logged in as <strong>{currentUserEmail}</strong>, but this invitation was sent to <strong>{invitation.email}</strong>.
                            </p>
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="trac-btn-primary w-full rounded-lg px-4 py-3 text-sm font-bold"
                            >
                                Log out & switch account
                            </Link>
                        </div>
                    ) : hasAccount ? (
                        /* Has account, not logged in — go to login */
                        <Link
                            href={route('login', { invitation: invitation.token })}
                            className="trac-btn-primary inline-flex w-full justify-center rounded-lg px-4 py-3 text-sm font-bold"
                        >
                            Log in to accept
                        </Link>
                    ) : (
                        /* No account — go to register */
                        <Link
                            href={route('register', { invitation: invitation.token })}
                            className="trac-btn-primary inline-flex w-full justify-center rounded-lg px-4 py-3 text-sm font-bold"
                        >
                            Create account & join
                        </Link>
                    )}

                    {invitation.expires_at && (
                        <p className="mt-4 text-xs text-gray-400">
                            Expires {new Date(invitation.expires_at).toLocaleDateString()}
                        </p>
                    )}
                </div>
            </div>
        </>
    );
}

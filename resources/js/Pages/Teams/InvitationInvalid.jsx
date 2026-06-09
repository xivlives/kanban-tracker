import { Head, Link } from '@inertiajs/react';
import TracLogo from '@/Components/TracLogo';

export default function InvitationInvalid({ reason }) {
    return (
        <>
            <Head title="Invitation Invalid" />
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--trac-primary-950)] to-[#0f1922] p-4">
                <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl text-center">
                    <div className="mb-6 flex justify-center">
                        <TracLogo />
                    </div>

                    <h1 className="text-xl font-bold text-gray-900 mb-2">
                        {reason === 'expired' ? 'Invitation Expired' : 'Already Accepted'}
                    </h1>
                    <p className="text-sm text-gray-500 mb-6">
                        {reason === 'expired'
                            ? 'This invitation has expired. Please ask the team admin to send a new one.'
                            : 'This invitation has already been accepted.'}
                    </p>

                    <Link
                        href={route('login')}
                        className="trac-btn-primary inline-flex w-full justify-center rounded-lg px-4 py-3 text-sm font-bold"
                    >
                        Go to Login
                    </Link>
                </div>
            </div>
        </>
    );
}

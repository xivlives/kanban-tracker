import MeenitsSsoButton from '@/Components/MeenitsSsoButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head } from '@inertiajs/react';

/**
 * SSO-only login (Atlassian model): MeenitsTrac has no local password. Identity is
 * owned by MeenitsApp — you sign in with your one Meenits account. See SSO_PLAN.md.
 */
export default function Login({ status }) {
    return (
        <GuestLayout>
            <Head title="Log in" />

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <div className="mb-6">
                <h1 className="text-lg font-semibold text-gray-900">Welcome back</h1>
                <p className="mt-1 text-sm text-gray-500">
                    One account for all of Meenits — sign in with Meenits to continue.
                </p>
            </div>

            <MeenitsSsoButton label="Log in with Meenits" />
        </GuestLayout>
    );
}

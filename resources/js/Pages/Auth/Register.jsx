import MeenitsSsoButton from '@/Components/MeenitsSsoButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link } from '@inertiajs/react';

/**
 * SSO-only registration (Atlassian model): there is no local Trac password. Signing up
 * creates / links your one Meenits account; a personal Trac workspace is provisioned on
 * first sign-in (see Auth\MeenitsSsoController). See SSO_PLAN.md.
 */
export default function Register() {
    return (
        <GuestLayout>
            <Head title="Sign up" />

            <div className="mb-6">
                <h1 className="text-lg font-semibold text-gray-900">Create your account</h1>
                <p className="mt-1 text-sm text-gray-500">
                    One account for all of Meenits. Sign up with Meenits and your
                    MeenitsTrac workspace is ready instantly.
                </p>
            </div>

            <MeenitsSsoButton label="Sign up with Meenits" />

            <p className="mt-6 text-center text-sm text-gray-500">
                Already have an account?{' '}
                <Link
                    href={route('login')}
                    className="font-medium text-[color:var(--trac-primary)] hover:underline"
                >
                    Log in
                </Link>
            </p>
        </GuestLayout>
    );
}

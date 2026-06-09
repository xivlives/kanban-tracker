/**
 * "Continue with Meenits" — kicks off the OAuth2 SSO handshake against MeenitsApp
 * (the identity provider). This is a full-page navigation that leaves the SPA, so
 * it's a plain <a>, not an Inertia <Link>. See SSO_PLAN.md (Stage C).
 */
export default function MeenitsSsoButton({ label = 'Continue with Meenits' }) {
    return (
        <a
            href={route('auth.meenits.redirect')}
            className="trac-btn-primary inline-flex w-full items-center justify-center gap-2.5 rounded-md px-4 py-2.5 text-sm font-semibold transition duration-150 ease-in-out"
        >
            {/* Meenits "M" mark */}
            <span
                aria-hidden
                className="flex h-5 w-5 items-center justify-center rounded-[5px] bg-white/20 text-[13px] font-extrabold leading-none"
            >
                M
            </span>
            {label}
        </a>
    );
}

/**
 * Clean placeholder mark for MeenitsTrac — a small kanban glyph (three columns).
 * Swap for the real logo asset when ready.
 */
export default function TracLogo({ size = 34, className = "" }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 32 32"
            fill="none"
            className={className}
            aria-hidden="true"
        >
            <rect x="2" y="2" width="28" height="28" rx="8" fill="currentColor" opacity="0.16" />
            <rect x="7" y="9" width="4.5" height="14" rx="2" fill="currentColor" />
            <rect x="13.75" y="9" width="4.5" height="9" rx="2" fill="currentColor" />
            <rect x="20.5" y="9" width="4.5" height="11" rx="2" fill="currentColor" />
        </svg>
    );
}

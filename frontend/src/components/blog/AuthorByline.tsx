/**
 * Author byline rendered directly under the blog post H1 / hero.
 *
 * Mirrors the Mailivery pattern: monogram avatar + author name + role +
 * "Last updated" date + read time. Visible content; the Person JSON-LD
 * schema lives in AeoGeoSchema.tsx separately.
 */

interface AuthorBylineProps {
    name: string;
    role: string;
    /** ISO YYYY-MM-DD; rendered as "Updated <Mon DD, YYYY>" */
    dateModified: string;
    /** e.g. "12 min read" */
    readTime?: string;
    /** Optional accent color override (defaults to brand green) */
    avatarBg?: string;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(iso: string): string {
    const [y, m, d] = iso.split('-').map(Number);
    if (!y || !m || !d) return iso;
    return `${MONTH_NAMES[m - 1]} ${d}, ${y}`;
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

export default function AuthorByline({ name, role, dateModified, readTime, avatarBg = '#1C4532' }: AuthorBylineProps) {
    const initials = getInitials(name);

    return (
        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-200">
            {/* Monogram avatar */}
            <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                style={{ background: avatarBg }}
                aria-hidden="true"
            >
                {initials}
            </div>

            {/* Author meta */}
            <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 leading-tight">{name}</div>
                <div className="text-xs text-gray-500 mt-0.5">{role}</div>
            </div>

            {/* Date + read time */}
            <div className="text-xs text-gray-500 text-right shrink-0">
                <div className="font-medium text-gray-700">Updated {formatDate(dateModified)}</div>
                {readTime && <div className="mt-0.5">{readTime}</div>}
            </div>
        </div>
    );
}

/**
 * Mailivery-style blog post header.
 *
 * Layout (top to bottom):
 *   1. Small black tag pill (category)
 *   2. HUGE H1 in black on white
 *   3. "Last updated: Mon DD, YYYY" line
 *   4. Author row (photo + name + role)
 *   5. Thin black horizontal divider
 *
 * Used inside the centered (white background, no sidebars) post variant.
 */

import AuthorByline from './AuthorByline';

interface BlogHeaderProps {
    tag: string;
    title: string;
    /** ISO YYYY-MM-DD; rendered as "Mon DD, YYYY" */
    dateModified: string;
    authorName: string;
    authorRole: string;
    authorPhotoSrc?: string;
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function formatLongDate(iso: string): string {
    const [y, m, d] = iso.split('-').map(Number);
    if (!y || !m || !d) return iso;
    return `${MONTH_NAMES[m - 1]} ${d}, ${y}`;
}

export default function BlogHeader({ tag, title, dateModified, authorName, authorRole, authorPhotoSrc }: BlogHeaderProps) {
    return (
        <header className="mb-12">
            {/* Tag pill */}
            <div className="mb-8">
                <span className="inline-block px-5 py-1.5 rounded-full bg-gray-900 text-white text-sm font-medium">
                    {tag}
                </span>
            </div>

            {/* Huge H1 — Mailivery uses an oversized weight to dominate the viewport */}
            <h1
                className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.1] mb-8"
                style={{ letterSpacing: '-0.02em' }}
            >
                {title}
            </h1>

            {/* Last updated */}
            <p className="text-base text-gray-600 mb-6">
                Last updated:{' '}
                <span className="font-semibold text-gray-900">{formatLongDate(dateModified)}</span>
            </p>

            {/* Author row */}
            <AuthorByline name={authorName} role={authorRole} photoSrc={authorPhotoSrc} />

            {/* Black divider */}
            <hr className="mt-10 border-0 border-t border-gray-900" />
        </header>
    );
}

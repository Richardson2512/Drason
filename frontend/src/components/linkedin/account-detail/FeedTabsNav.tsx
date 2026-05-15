'use client';

/**
 * Five-tab navigation strip for the account-detail feed surfaces:
 *
 *   /accounts/[id]                       - All
 *   /accounts/[id]/posts                 - Posts (excludes thought-leadership)
 *   /accounts/[id]/articles              - Articles
 *   /accounts/[id]/reposts               - Reposts
 *   /accounts/[id]/thought-leadership    - Thought leadership (derived)
 *
 * Active tab is highlighted; clicking another tab swaps the route. The
 * URL is the source of truth for which kind is being viewed - no local
 * state in the parent, which means the back/forward buttons + sharable
 * links work without extra glue.
 */

import Link from 'next/link';
import { Newspaper, Repeat2, FileText, Lightbulb, LayoutGrid } from 'lucide-react';

export type FeedKind = 'all' | 'post' | 'article' | 'repost' | 'thought_leadership';

const TABS: Array<{ kind: FeedKind; label: string; href: (id: string) => string; icon: React.ReactNode }> = [
    { kind: 'all',                label: 'All',                href: id => `/dashboard/linkedin/accounts/${id}`,                    icon: <LayoutGrid className="w-3 h-3" /> },
    { kind: 'post',               label: 'Posts',              href: id => `/dashboard/linkedin/accounts/${id}/posts`,              icon: <FileText className="w-3 h-3" /> },
    { kind: 'article',            label: 'Articles',           href: id => `/dashboard/linkedin/accounts/${id}/articles`,           icon: <Newspaper className="w-3 h-3" /> },
    { kind: 'repost',             label: 'Reposts',            href: id => `/dashboard/linkedin/accounts/${id}/reposts`,            icon: <Repeat2 className="w-3 h-3" /> },
    { kind: 'thought_leadership', label: 'Thought leadership', href: id => `/dashboard/linkedin/accounts/${id}/thought-leadership`, icon: <Lightbulb className="w-3 h-3" /> },
];

export default function FeedTabsNav({
    accountId, activeKind,
}: {
    accountId: string;
    activeKind: FeedKind;
}) {
    return (
        <div
            className="premium-card !py-2 flex items-center gap-1 flex-wrap"
        >
            <div className="flex items-center gap-1 rounded-lg p-0.5" style={{ background: '#FAFAF8', border: '1px solid #D1CBC5' }}>
                {TABS.map(t => {
                    const active = t.kind === activeKind;
                    return (
                        <Link
                            key={t.kind}
                            href={t.href(accountId)}
                            prefetch={false}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer no-underline ${
                                active ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            {t.icon}
                            {t.label}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

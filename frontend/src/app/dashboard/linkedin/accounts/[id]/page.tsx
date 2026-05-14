'use client';

/**
 * Account detail — "All" feed view.
 *
 * Subpages live alongside this route:
 *   /accounts/[id]/posts                — plain posts (excludes thought leadership)
 *   /accounts/[id]/articles             — LinkedIn long-form articles
 *   /accounts/[id]/reposts              — reshared content
 *   /accounts/[id]/thought-leadership   — derived bucket of high-signal posts
 *
 * Each renders the same AccountHeader + FeedTabsNav chrome and a
 * PostsFeed scoped to one `kind`. The URL is the source of truth for
 * the active filter, so back/forward + shareable links work.
 */

import { use } from 'react';
import AccountHeader from '@/components/linkedin/account-detail/AccountHeader';
import FeedTabsNav from '@/components/linkedin/account-detail/FeedTabsNav';
import PostsFeed from '@/components/linkedin/account-detail/PostsFeed';

export default function LinkedInAccountAllPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    return (
        <div className="p-4 flex flex-col gap-4">
            <AccountHeader accountId={id} />
            <FeedTabsNav accountId={id} activeKind="all" />
            <PostsFeed accountId={id} kind="all" />
        </div>
    );
}

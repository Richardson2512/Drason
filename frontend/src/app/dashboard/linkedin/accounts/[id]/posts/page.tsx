'use client';

/**
 * Posts subpage - plain LinkedIn posts authored by this account,
 * excluding articles, reposts, and thought-leadership pieces (those
 * each live on their own tab).
 */

import { use } from 'react';
import AccountHeader from '@/components/linkedin/account-detail/AccountHeader';
import FeedTabsNav from '@/components/linkedin/account-detail/FeedTabsNav';
import PostsFeed from '@/components/linkedin/account-detail/PostsFeed';

export default function LinkedInAccountPostsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    return (
        <div className="p-4 flex flex-col gap-4">
            <AccountHeader accountId={id} />
            <FeedTabsNav accountId={id} activeKind="post" />
            <PostsFeed accountId={id} kind="post" />
        </div>
    );
}

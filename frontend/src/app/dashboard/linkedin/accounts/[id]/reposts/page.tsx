'use client';

import { use } from 'react';
import AccountHeader from '@/components/linkedin/account-detail/AccountHeader';
import FeedTabsNav from '@/components/linkedin/account-detail/FeedTabsNav';
import PostsFeed from '@/components/linkedin/account-detail/PostsFeed';

export default function LinkedInAccountRepostsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    return (
        <div className="p-4 flex flex-col gap-4">
            <AccountHeader accountId={id} />
            <FeedTabsNav accountId={id} activeKind="repost" />
            <PostsFeed accountId={id} kind="repost" />
        </div>
    );
}

'use client';

import { use } from 'react';
import AccountHeader from '@/components/linkedin/account-detail/AccountHeader';
import FeedTabsNav from '@/components/linkedin/account-detail/FeedTabsNav';
import PostsFeed from '@/components/linkedin/account-detail/PostsFeed';

export default function LinkedInAccountArticlesPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    return (
        <div className="p-4 flex flex-col gap-4">
            <AccountHeader accountId={id} />
            <FeedTabsNav accountId={id} activeKind="article" />
            <PostsFeed accountId={id} kind="article" />
        </div>
    );
}

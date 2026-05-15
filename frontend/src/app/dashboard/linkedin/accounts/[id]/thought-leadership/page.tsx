'use client';

/**
 * Thought-leadership subpage - derived bucket. A post qualifies when
 * it's a plain post (not an article or repost), is ≥ 500 characters,
 * and earned ≥ 25 reactions. Heuristic lives on the backend
 * (isThoughtLeadership in linkedinAccountController) and can be tuned
 * later from a workspace setting.
 */

import { use } from 'react';
import AccountHeader from '@/components/linkedin/account-detail/AccountHeader';
import FeedTabsNav from '@/components/linkedin/account-detail/FeedTabsNav';
import PostsFeed from '@/components/linkedin/account-detail/PostsFeed';

export default function LinkedInAccountThoughtLeadershipPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    return (
        <div className="p-4 flex flex-col gap-4">
            <AccountHeader accountId={id} />
            <FeedTabsNav accountId={id} activeKind="thought_leadership" />
            <PostsFeed accountId={id} kind="thought_leadership" />
        </div>
    );
}

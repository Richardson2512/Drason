'use client';

/**
 * Single fetch for the account-detail surface.
 *
 * Why this exists: the five feed views (All / Posts / Articles / Reposts /
 * Thought leadership) each used to render <AccountHeader accountId>, and
 * AccountHeader fetched /api/linkedin/accounts/:id on mount. Navigating
 * between tabs re-fetched the same account row every click.
 *
 * The layout now fetches once and exposes the result via
 * AccountDetailContext. AccountHeader reads from context, so tab nav
 * within the same account is free (Next.js layouts persist across child
 * route swaps).
 *
 * Falls back to component-local fetch if for some reason the context is
 * missing — see AccountHeader.tsx.
 */

import { use, useEffect, useState, createContext } from 'react';
import { apiClient } from '@/lib/api';

export interface AccountDetailData {
    id: string;
    display_name: string;
    account_type: string;
    status: string;
    invites_today: number;
    invites_this_week: number;
    messages_today: number;
    inmails_today: number;
    profile_views_today: number;
    max_invites_per_day: number;
    max_invites_per_week: number;
    max_messages_per_day: number;
    max_inmails_per_day: number;
    max_profile_views_per_day: number;
    connected_at: string | null;
}

export interface AccountPostStats {
    cached_post_count: number;
}

export interface UnipileRateLimitStats {
    count_60m: number;
    count_5m: number;
    last_at: string | null;
}

export interface AccountDetailContextValue {
    accountId: string;
    account: AccountDetailData | null;
    postStats: AccountPostStats | null;
    unipileRateLimit: UnipileRateLimitStats | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export const AccountDetailContext = createContext<AccountDetailContextValue | null>(null);

export default function AccountDetailLayout({
    params,
    children,
}: {
    params: Promise<{ id: string }>;
    children: React.ReactNode;
}) {
    const { id } = use(params);
    const [account, setAccount] = useState<AccountDetailData | null>(null);
    const [postStats, setPostStats] = useState<AccountPostStats | null>(null);
    const [unipileRateLimit, setUnipileRateLimit] = useState<UnipileRateLimitStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    interface DetailResponse {
        account: AccountDetailData;
        post_stats: AccountPostStats;
        unipile_rate_limit?: UnipileRateLimitStats;
    }

    const fetchAccount = async () => {
        setLoading(true);
        try {
            const data = await apiClient<DetailResponse>(`/api/linkedin/accounts/${id}`);
            setAccount(data.account);
            setPostStats(data.post_stats);
            setUnipileRateLimit(data.unipile_rate_limit ?? null);
            setError(null);
        } catch (err: any) {
            setError(err?.message || 'Failed to load account');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        apiClient<DetailResponse>(`/api/linkedin/accounts/${id}`)
            .then(data => {
                if (cancelled) return;
                setAccount(data.account);
                setPostStats(data.post_stats);
                setUnipileRateLimit(data.unipile_rate_limit ?? null);
                setError(null);
            })
            .catch(err => { if (!cancelled) setError(err?.message || 'Failed to load account'); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [id]);

    return (
        <AccountDetailContext.Provider value={{ accountId: id, account, postStats, unipileRateLimit, loading, error, refetch: fetchAccount }}>
            {children}
        </AccountDetailContext.Provider>
    );
}

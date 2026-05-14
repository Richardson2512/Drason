'use client';

/**
 * AccountHeader — top-of-page card for /dashboard/linkedin/accounts/[id]
 * and its post-type subpages (posts / articles / reposts /
 * thought-leadership). Fetches the account once per mount and renders:
 *   - avatar + display name + status pill + account-type pill
 *   - "Connected X ago · N posts tracked for signals" subtitle
 *   - capacity strip (invites today/week, messages, inmails, profile views)
 *
 * Kept dumb on the fetch side — no caching between routes; the response
 * is small so a re-fetch per nav is fine. If we later want to dedupe,
 * lift to a React Query layer.
 */

import { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Linkedin, Loader2, AlertTriangle } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { AccountDetailContext } from '@/app/dashboard/linkedin/accounts/[id]/layout';

interface AccountDetail {
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

interface PostStats {
    cached_post_count: number;
}

const TYPE_LABEL: Record<string, string> = {
    CLASSIC: 'Classic',
    PREMIUM: 'Premium',
    SALES_NAV: 'Sales Navigator',
    RECRUITER: 'Recruiter',
};

const STATUS_PILL: Record<string, { bg: string; fg: string; label: string }> = {
    OK:            { bg: '#DCFCE7', fg: '#15803D', label: 'OK' },
    CONNECTING:    { bg: '#DBEAFE', fg: '#1D4ED8', label: 'Connecting' },
    CREDENTIALS:   { bg: '#FEF3C7', fg: '#B45309', label: 'Credentials' },
    ERROR:         { bg: '#FEE2E2', fg: '#B91C1C', label: 'Error' },
    SYNC_SUCCESS:  { bg: '#E0F2FE', fg: '#075985', label: 'Synced' },
    DELETED:       { bg: '#F3F4F6', fg: '#6B7280', label: 'Deleted' },
};

function relativeTime(iso: string | null): string {
    if (!iso) return '';
    const ms = Date.now() - new Date(iso).getTime();
    const min = Math.floor(ms / 60_000);
    if (min < 1) return 'just now';
    if (min < 60) return `${min}m`;
    const h = Math.floor(min / 60);
    if (h < 24) return `${h}h`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d}d`;
    const w = Math.floor(d / 7);
    if (w < 5) return `${w}w`;
    return new Date(iso).toLocaleDateString();
}

function initials(name: string): string {
    return name.split(' ').filter(Boolean).map(p => p[0]).join('').slice(0, 2).toUpperCase() || 'LI';
}

function CapacityTile({ label, used, cap }: { label: string; used: number; cap: number }) {
    const ratio = cap > 0 ? used / cap : 0;
    const color = ratio >= 0.9 ? '#DC2626' : ratio >= 0.7 ? '#F59E0B' : '#16A34A';
    return (
        <div className="rounded-lg px-3 py-2" style={{ background: '#FAFAF8', border: '1px solid #E8E3DC' }}>
            <div className="text-[10px] font-semibold text-gray-500">{label}</div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-sm font-bold text-gray-900 tabular-nums">{used.toLocaleString()}</span>
                <span className="text-[10px] text-gray-500 tabular-nums">/ {cap.toLocaleString()}</span>
            </div>
            <div className="h-1 rounded-full mt-1.5 overflow-hidden" style={{ background: '#F3F4F6' }}>
                <div className="h-full" style={{ width: `${Math.min(100, ratio * 100)}%`, background: color }} />
            </div>
        </div>
    );
}

export default function AccountHeader({ accountId }: { accountId: string }) {
    // Prefer the layout-level fetch (AccountDetailContext). The route's
    // [id]/layout.tsx wraps this header in the provider, so in the
    // normal page flow the local fetch below NEVER runs (the useEffect
    // bails on `if (ctx) return`, and localLoading is initialized to
    // !ctx === false so we go straight to the render path that reads
    // from context). The local fetch is a defensive fallback for callers
    // that render AccountHeader outside the layout — admin pages,
    // standalone debug surfaces, future embedded contexts.
    const ctx = useContext(AccountDetailContext);

    const [localAccount, setLocalAccount] = useState<AccountDetail | null>(null);
    const [localStats, setLocalStats] = useState<PostStats | null>(null);
    const [localLoading, setLocalLoading] = useState(!ctx);
    const [localError, setLocalError] = useState<string | null>(null);

    useEffect(() => {
        if (ctx) return; // Layout owns the fetch — see docstring above.
        let cancelled = false;
        setLocalLoading(true);
        apiClient<{ account: AccountDetail; post_stats: PostStats }>(`/api/linkedin/accounts/${accountId}`)
            .then(data => {
                if (cancelled) return;
                setLocalAccount(data.account);
                setLocalStats(data.post_stats);
                setLocalError(null);
            })
            .catch(err => { if (!cancelled) setLocalError(err?.message || 'Failed to load account'); })
            .finally(() => { if (!cancelled) setLocalLoading(false); });
        return () => { cancelled = true; };
    }, [accountId, ctx]);

    const account = ctx ? ctx.account : localAccount;
    const stats = ctx ? ctx.postStats : localStats;
    const loading = ctx ? ctx.loading : localLoading;
    const error = ctx ? ctx.error : localError;

    if (loading) {
        return (
            <div className="premium-card flex items-center justify-center py-8 text-xs text-gray-500">
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> Loading account…
            </div>
        );
    }

    if (error || !account) {
        return (
            <div className="premium-card flex items-center justify-center py-8 text-xs text-rose-600">
                {error || 'Account not found'}
            </div>
        );
    }

    const status = STATUS_PILL[account.status] ?? null;
    const rateLimit = ctx?.unipileRateLimit ?? null;
    // Banner shows only on sustained throttling — a single 429 retried
    // successfully isn't worth alarming the operator. Threshold tuned to:
    //   - count_5m >= 3 (Unipile is *currently* throttling, retries
    //     not catching up)
    //   - or count_60m >= 5 (multiple distinct hits over the last hour
    //     suggesting the account is over its Unipile quota)
    // A single isolated 429 that the client recovered from on retry stays
    // silent — the operator doesn't need to see those.
    const showRateLimitBanner = Boolean(rateLimit && (rateLimit.count_5m >= 3 || rateLimit.count_60m >= 5));

    return (
        <>
            <div className="flex items-center gap-2 flex-wrap">
                <Link
                    href="/dashboard/linkedin/accounts"
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900"
                >
                    <ArrowLeft className="w-3 h-3" /> Accounts
                </Link>
            </div>

            <div className="premium-card">
                <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-sm font-bold text-gray-700 shrink-0">
                        {initials(account.display_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Linkedin size={16} className="text-[#0A66C2]" />
                                {account.display_name}
                            </h1>
                            {status && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold" style={{ background: status.bg, color: status.fg }}>
                                    {status.label}
                                </span>
                            )}
                            <span className="text-[11px] text-gray-500 px-1.5 py-0.5 rounded-md bg-gray-100">
                                {TYPE_LABEL[account.account_type] ?? account.account_type}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Connected {relativeTime(account.connected_at)} ago
                            {stats?.cached_post_count !== undefined && stats.cached_post_count > 0 && (
                                <> · {stats.cached_post_count} posts tracked for signals</>
                            )}
                        </p>
                    </div>
                </div>

                {showRateLimitBanner && rateLimit && (
                    <div className="mt-3 flex items-start gap-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-[0.7rem]">
                        <AlertTriangle size={12} className="text-amber-700 mt-0.5 shrink-0" />
                        <div className="text-amber-900">
                            <span className="font-semibold">Unipile is throttling this account.</span>{' '}
                            {rateLimit.count_5m > 0
                                ? `${rateLimit.count_5m} rate-limit event${rateLimit.count_5m === 1 ? '' : 's'} in the last 5 min `
                                : `${rateLimit.count_60m} rate-limit event${rateLimit.count_60m === 1 ? '' : 's'} in the last hour `}
                            — expect delayed polling and sends. The client will retry with backoff automatically.
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-4">
                    <CapacityTile label="Invites today"     used={account.invites_today}        cap={account.max_invites_per_day} />
                    <CapacityTile label="Invites this week" used={account.invites_this_week}    cap={account.max_invites_per_week} />
                    <CapacityTile label="Messages today"    used={account.messages_today}      cap={account.max_messages_per_day} />
                    <CapacityTile label="InMails today"     used={account.inmails_today}       cap={account.max_inmails_per_day} />
                    <CapacityTile label="Profile views"     used={account.profile_views_today} cap={account.max_profile_views_per_day} />
                </div>
            </div>
        </>
    );
}

export { TYPE_LABEL, relativeTime, initials };

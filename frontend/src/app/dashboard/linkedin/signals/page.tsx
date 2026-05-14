'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Radar, Heart, MessageCircle, Repeat2, ThumbsUp, Sparkles, Plus, Target, Search, ChevronLeft, ChevronRight, Hash, ChevronRight as ArrowRightIcon, Loader2, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

function initials(name: string): string {
    return name.split(' ').filter(Boolean).map(p => p[0]).join('').slice(0, 2).toUpperCase() || '??';
}

const MODES = [
    { key: 'OBSERVE', label: 'Observe', desc: 'Log + notify only', tint: 'bg-gray-100 text-gray-700' },
    { key: 'SUGGEST', label: 'Suggest', desc: 'Queue for approval', tint: 'bg-amber-50 text-amber-700' },
    { key: 'ENFORCE', label: 'Enforce', desc: 'Auto-route to list / campaign', tint: 'bg-emerald-50 text-emerald-700' },
];

const REACTIONS = {
    LIKE:         { icon: <ThumbsUp size={11} className="text-blue-400" />,    label: 'Like' },
    PRAISE:       { icon: <Heart size={11} className="text-amber-500" />,      label: 'Celebrate' },
    EMPATHY:      { icon: <Heart size={11} className="text-rose-500" />,       label: 'Love' },
    INTEREST:     { icon: <Sparkles size={11} className="text-violet-500" />,  label: 'Insightful' },
    APPRECIATION: { icon: <Heart size={11} className="text-pink-500" />,       label: 'Support' },
    MAYBE:        { icon: <ThumbsUp size={11} className="text-gray-400" />,    label: 'Maybe' },
    FUNNY:        { icon: <ThumbsUp size={11} className="text-orange-400" />,  label: 'Funny' },
    COMMENT:      { icon: <MessageCircle size={11} className="text-blue-500" />, label: 'Comment' },
    SHARE:        { icon: <Repeat2 size={11} className="text-emerald-500" />,  label: 'Share' },
    REPOST:       { icon: <Repeat2 size={11} className="text-emerald-500" />,  label: 'Repost' },
};

interface SignalRow {
    id: string;
    name: string;
    headline: string;
    reaction: string;
    post: string;
    icp: string | null;
    score: number | null;
    mode: string;
    action: string;
    time: string;
    avatar: string;
    tint: string;
}

interface ApiSignalRow {
    id: string;
    event_type: string;
    reaction_type: string | null;
    occurred_at: string;
    mode: 'OBSERVE' | 'SUGGEST' | 'ENFORCE';
    outcome: string | null;
    target_id: string | null;
    comment_text: string | null;
    actor: {
        id: string;
        name: string;
        headline: string | null;
        company: string | null;
        position: string | null;
        public_identifier: string;
        icp_match_score: number | null;
        lead_id: string | null;
    } | null;
    post: {
        id: string;
        text: string | null;
        post_kind: string | null;
        article_title: string | null;
        posted_at: string;
        account: { id: string; name: string } | null;
    } | null;
}

function actionForOutcome(outcome: string | null, mode: string): string {
    switch (outcome) {
        case 'added_to_campaign':         return 'Enrolled in matched campaign';
        case 'added_to_cold_call_list':   return 'Added to cold-call list · enriched via waterfall';
        case 'suggested_for_review':      return 'Queued for review (mode = SUGGEST)';
        case 'no_icp_match':               return 'No ICP match — logged only';
        case 'observed':                   return 'Observed (logged only)';
        case 'profile_not_found':
        case 'post_not_found':            return `Skipped — ${outcome.replace(/_/g, ' ')}`;
        default:
            if (mode === 'OBSERVE') return 'Observed (logged only)';
            if (mode === 'SUGGEST') return 'Queued for review';
            if (mode === 'ENFORCE') return 'Routing in progress…';
            return '—';
    }
}

function minutesAgoLabel(iso: string): string {
    const ms = Date.now() - new Date(iso).getTime();
    const mins = Math.max(0, Math.round(ms / 60000));
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.round(hrs / 24);
    return `${days}d ago`;
}

function postTitleFromRow(post: ApiSignalRow['post']): string {
    if (!post) return '';
    if (post.post_kind === 'article' && post.article_title) return post.article_title;
    const t = (post.text || '').trim();
    if (!t) return 'Untitled post';
    return t.length > 120 ? t.slice(0, 117) + '…' : t;
}

function apiToRow(e: ApiSignalRow): SignalRow {
    const reaction = e.event_type === 'REACTION' ? (e.reaction_type || 'LIKE') : e.event_type;
    const actor = e.actor;
    const score = actor?.icp_match_score ?? null;
    return {
        id: e.id,
        name: actor?.name || 'Unknown',
        headline: actor?.headline || actor?.position || '',
        reaction,
        post: postTitleFromRow(e.post),
        // ICP name not surfaced by the feed today — keep null and only show
        // a score chip when score is present.
        icp: score !== null ? 'ICP match' : null,
        score,
        mode: e.mode,
        action: actionForOutcome(e.outcome, e.mode),
        time: minutesAgoLabel(e.occurred_at),
        avatar: initials(actor?.name || '??'),
        tint: 'from-gray-100 to-gray-200',
    };
}

const PAGE_SIZE = 10;

export default function LinkedInSignalsPage() {
    const [search, setSearch] = useState('');
    const [reactionFilter, setReactionFilter] = useState('all');
    const [modeFilter, setModeFilter] = useState('all');
    const [icpFilter, setIcpFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [events, setEvents] = useState<SignalRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [icpOptions, setIcpOptions] = useState<Array<{ id: string; name: string }>>([]);

    // ── Re-evaluate stuck SUGGEST events ─────────────────────────────
    // When an operator broadens an ICP, previously-skipped events stay
    // marked processed_at=now with outcome='no_icp_match'. This button
    // resets processed_at on those events so the supervisor's next
    // tick re-runs ICP matching under the new (broader) policy.
    const [reevaluating, setReevaluating] = useState(false);
    const runReevaluate = async () => {
        if (!window.confirm('Re-evaluate engagement events from the last 7 days that failed ICP matching? They\'ll be re-checked against your current ICP filters on the next supervisor tick (within 30 seconds).')) return;
        setReevaluating(true);
        try {
            const resp = await apiClient<{ data: { reset_count: number } }>('/api/linkedin/icp/reevaluate-no-match', {
                method: 'POST',
                body: JSON.stringify({ lookback_days: 7 }),
            });
            toast.success(`${resp.data.reset_count} event${resp.data.reset_count === 1 ? '' : 's'} queued for re-evaluation — refresh in ~30s to see new matches.`);
        } catch (err: any) {
            toast.error(err?.message || 'Re-evaluate failed');
        } finally {
            setReevaluating(false);
        }
    };

    // ── SUGGEST review queue ────────────────────────────────────────
    // Rows from /api/linkedin/signals/review-queue waiting for operator
    // approval. Banner at the top of the page shows the count and
    // expands inline into a panel with approve / dismiss actions.
    interface ReviewRow {
        agent_run_id: string;
        event_id: string;
        event: {
            actor: { name: string; headline: string | null; public_identifier: string; icp_match_score: number | null } | null;
            post: { text: string | null; article_title: string | null; account: { name: string } | null } | null;
            event_type: string;
            reaction_type: string | null;
        } | null;
    }
    const [reviewQueue, setReviewQueue] = useState<ReviewRow[]>([]);
    const [reviewExpanded, setReviewExpanded] = useState(false);
    const [reviewBusy, setReviewBusy] = useState<string | null>(null);
    const [linkedInCampaigns, setLinkedInCampaigns] = useState<Array<{ id: string; name: string }>>([]);

    const fetchReviewQueue = useCallback(async () => {
        try {
            const resp = await apiClient<{ data: ReviewRow[] }>('/api/linkedin/signals/review-queue?limit=50');
            setReviewQueue(Array.isArray(resp?.data) ? resp.data : []);
        } catch { setReviewQueue([]); }
    }, []);
    useEffect(() => { void fetchReviewQueue(); }, [fetchReviewQueue]);

    useEffect(() => {
        if (!reviewExpanded || linkedInCampaigns.length > 0) return;
        apiClient<{ data: Array<{ id: string; name: string }> } | Array<{ id: string; name: string }>>(
            '/api/sequencer/campaigns?channel=linkedin&limit=100',
        ).then(resp => {
            const list = Array.isArray(resp) ? resp : (resp as any)?.data ?? [];
            setLinkedInCampaigns(list);
        }).catch(() => setLinkedInCampaigns([]));
    }, [reviewExpanded, linkedInCampaigns.length]);

    const approveReview = async (eventId: string, campaignId: string | null) => {
        setReviewBusy(eventId);
        try {
            await apiClient(`/api/linkedin/signals/review-queue/${eventId}/approve`, {
                method: 'POST',
                body: JSON.stringify(campaignId ? { campaign_id: campaignId } : {}),
            });
            setReviewQueue(prev => prev.filter(r => r.event_id !== eventId));
        } catch { /* surface via toast in caller if needed */ }
        finally { setReviewBusy(null); }
    };
    const dismissReview = async (eventId: string) => {
        setReviewBusy(eventId);
        try {
            await apiClient(`/api/linkedin/signals/review-queue/${eventId}/dismiss`, { method: 'POST' });
            setReviewQueue(prev => prev.filter(r => r.event_id !== eventId));
        } catch { /* swallow */ }
        finally { setReviewBusy(null); }
    };

    useEffect(() => {
        apiClient<{ success: boolean; data: Array<{ id: string; name: string }> } | Array<{ id: string; name: string }>>(
            '/api/linkedin/icp',
        ).then(resp => {
            const list = Array.isArray(resp) ? resp : (resp as any)?.data ?? [];
            setIcpOptions(list);
        }).catch(() => setIcpOptions([]));
    }, []);

    // ── Rule health (dangling refs) ──────────────────────────────────
    interface RuleIssue { rule_id: string; mode: string; scope: string; kind: 'missing_campaign' | 'missing_list' | 'missing_icp'; ref_id: string }
    const [ruleIssues, setRuleIssues] = useState<RuleIssue[]>([]);
    useEffect(() => {
        apiClient<{ data: { rules_checked: number; issues: RuleIssue[] } }>('/api/linkedin/signals/rule-health')
            .then(resp => setRuleIssues(resp?.data?.issues ?? []))
            .catch(() => setRuleIssues([]));
    }, []);

    const fetchFeed = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({ limit: '200' });
            if (reactionFilter !== 'all') params.set('reaction', reactionFilter);
            if (modeFilter !== 'all') params.set('mode', modeFilter);
            const resp = await apiClient<{ data: ApiSignalRow[]; total: number } | ApiSignalRow[]>(
                `/api/linkedin/signals/feed?${params.toString()}`,
            );
            const list: ApiSignalRow[] = Array.isArray(resp) ? resp : (resp?.data ?? []);
            setEvents(list.map(apiToRow));
        } catch (err: any) {
            setError(err?.message || 'Failed to load signal feed');
            setEvents([]);
        } finally {
            setLoading(false);
        }
    }, [reactionFilter, modeFilter]);

    useEffect(() => { fetchFeed(); }, [fetchFeed]);

    const filtered = useMemo(() => events.filter(e => {
        if (search && !e.name.toLowerCase().includes(search.toLowerCase()) && !e.headline.toLowerCase().includes(search.toLowerCase())) return false;
        if (reactionFilter !== 'all' && e.reaction !== reactionFilter) return false;
        if (modeFilter !== 'all' && e.mode !== modeFilter) return false;
        if (icpFilter !== 'all' && e.icp !== icpFilter) return false;
        return true;
    }), [events, search, reactionFilter, modeFilter, icpFilter]);

    // Snap back to page 1 whenever the active filter set changes so the
    // user isn't stranded on an empty page after narrowing the results.
    useEffect(() => { setPage(1); }, [search, reactionFilter, modeFilter, icpFilter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const pageStart = (safePage - 1) * PAGE_SIZE;
    const pageItems = filtered.slice(pageStart, pageStart + PAGE_SIZE);

    return (
        <div className="p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Radar size={18} strokeWidth={1.75} /> Signal feed
                        {loading && <Loader2 size={14} className="animate-spin text-gray-400" />}
                    </h1>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {events.length} engagement events · polled 3–6× daily
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={runReevaluate}
                        disabled={reevaluating}
                        title="Re-run ICP matching on engagement events from the last 7 days that previously didn't match. Useful after you broadened an ICP."
                        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 disabled:opacity-50"
                        style={{ border: '1px solid #D1CBC5' }}
                    >
                        {reevaluating ? 'Queuing…' : 'Re-evaluate (7d)'}
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors">
                        <Plus size={14} /> New monitoring rule
                    </button>
                </div>
            </div>

            {/* Topics-watchlist entry card — links into the dedicated
                /signals/watchlists subpage where operators configure
                keyword-driven monitoring. Kept compact on this main
                Signals page so it doesn't dominate the engagement feed. */}
            <Link
                href="/dashboard/linkedin/signals/watchlists"
                className="premium-card !bg-amber-50/40 !border-amber-200 flex items-center justify-between gap-3 !py-3 no-underline hover:!bg-amber-50/60 transition-colors cursor-pointer"
            >
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-md bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
                        <Hash size={14} />
                    </div>
                    <div>
                        <div className="text-[0.8rem] font-bold text-amber-950 flex items-center gap-2">
                            Topics watchlists
                            <span className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-amber-200/60 text-amber-900">New</span>
                        </div>
                        <div className="text-[0.7rem] text-amber-800">
                            Monitor LinkedIn for posts about keywords you care about — ICP-filter the engagers, push into a campaign. No per-signal cost.
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1 text-[0.75rem] font-semibold text-amber-900">
                    Configure <ArrowRightIcon size={12} />
                </div>
            </Link>

            <div className="premium-card !bg-blue-50/40 !border-blue-200 flex items-center justify-between gap-3 !py-2.5">
                <div className="flex items-center gap-2">
                    <Target size={14} className="text-blue-700 shrink-0" />
                    <div>
                        <div className="text-[0.75rem] font-bold text-blue-900">{icpOptions.length} ICP{icpOptions.length === 1 ? '' : 's'} configured</div>
                        <div className="text-[0.65rem] text-blue-700">Set monitoring modes per workspace, account, or post in Settings.</div>
                    </div>
                </div>
                <a href="/dashboard/linkedin/settings" className="text-[0.7rem] text-blue-700 hover:text-blue-900 font-semibold underline decoration-dotted">
                    Configure modes →
                </a>
            </div>

            {ruleIssues.length > 0 && (() => {
                const camp = ruleIssues.filter(i => i.kind === 'missing_campaign').length;
                const icp  = ruleIssues.filter(i => i.kind === 'missing_icp').length;
                return (
                    <div className="premium-card !bg-rose-50/60 !border-rose-200 flex items-start gap-2 !py-2.5 text-[0.75rem] text-rose-900">
                        <span className="font-bold">⚠ Monitoring rules have broken references:</span>
                        <span className="text-rose-800">
                            {camp > 0 && (<>{camp} reference{camp === 1 ? 's' : ''} a deleted campaign. </>)}
                            {icp > 0 && (<>{icp} reference{icp === 1 ? 's' : ''} a deleted ICP. </>)}
                            ENFORCE actions for those rules will skip silently — fix in Settings → Monitoring rules.
                        </span>
                    </div>
                );
            })()}

            {/* SUGGEST review queue — engagers the supervisor ICP-matched
                under a SUGGEST-mode rule that need operator approval
                before enrollment. Collapsed by default; expands inline
                with per-row approve / dismiss buttons + optional
                campaign picker. */}
            {reviewQueue.length > 0 && (
                <div className="premium-card !bg-violet-50/50 !border-violet-200 !py-0 overflow-hidden">
                    <button
                        onClick={() => setReviewExpanded(v => !v)}
                        className="w-full px-4 py-2.5 flex items-center justify-between gap-3 text-left hover:bg-violet-100/50 transition-colors cursor-pointer"
                    >
                        <div className="flex items-center gap-2">
                            <Sparkles size={14} className="text-violet-700 shrink-0" />
                            <div>
                                <div className="text-[0.75rem] font-bold text-violet-900">
                                    {reviewQueue.length} engager{reviewQueue.length === 1 ? '' : 's'} pending review
                                </div>
                                <div className="text-[0.65rem] text-violet-700">
                                    ICP-matched under a SUGGEST rule. Approve to enroll in a LinkedIn campaign, dismiss to skip.
                                </div>
                            </div>
                        </div>
                        <span className="text-[0.7rem] font-semibold text-violet-900">{reviewExpanded ? 'Hide' : 'Open'} →</span>
                    </button>
                    {reviewExpanded && (
                        <div className="border-t border-violet-200 divide-y divide-violet-100">
                            {reviewQueue.map(r => {
                                const score = r.event?.actor?.icp_match_score ?? null;
                                const post = r.event?.post?.article_title || r.event?.post?.text || '';
                                return (
                                    <div key={r.agent_run_id} className="px-4 py-3 flex items-start gap-3 bg-white/60">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-sm font-semibold text-gray-900">{r.event?.actor?.name ?? 'Unknown'}</span>
                                                {score !== null && (
                                                    <span className="text-[10px] text-violet-700 bg-violet-100 px-1.5 py-0.5 rounded font-semibold">
                                                        ICP {Math.round(score * 100)}%
                                                    </span>
                                                )}
                                                <span className="text-[10px] text-gray-500">
                                                    {r.event?.event_type === 'REACTION'
                                                        ? `${r.event?.reaction_type ?? 'LIKE'} on`
                                                        : `${r.event?.event_type ?? 'engaged with'}`}{' '}
                                                    {r.event?.post?.account?.name ? `${r.event.post.account.name}'s post` : 'a post'}
                                                </span>
                                            </div>
                                            <div className="text-[0.7rem] text-gray-500 mt-0.5">{r.event?.actor?.headline ?? ''}</div>
                                            {post && (
                                                <div className="text-[0.7rem] text-gray-600 mt-1 italic line-clamp-2">
                                                    &ldquo;{post.length > 140 ? post.slice(0, 137) + '…' : post}&rdquo;
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <select
                                                id={`camp-${r.event_id}`}
                                                defaultValue=""
                                                className="text-[10px] px-2 py-1 rounded bg-white"
                                                style={{ border: '1px solid #DDD6FE' }}
                                            >
                                                <option value="">Enroll only (no campaign)</option>
                                                {linkedInCampaigns.map(c => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={() => {
                                                    const sel = document.getElementById(`camp-${r.event_id}`) as HTMLSelectElement | null;
                                                    void approveReview(r.event_id, sel?.value || null);
                                                }}
                                                disabled={reviewBusy === r.event_id}
                                                className="px-2.5 py-1 text-[10px] font-semibold bg-violet-700 text-white rounded disabled:opacity-50 hover:bg-violet-800"
                                            >
                                                {reviewBusy === r.event_id ? '…' : 'Approve'}
                                            </button>
                                            <button
                                                onClick={() => void dismissReview(r.event_id)}
                                                disabled={reviewBusy === r.event_id}
                                                className="px-2.5 py-1 text-[10px] font-semibold text-gray-600 hover:bg-gray-100 rounded"
                                            >
                                                Dismiss
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            <div className="flex items-center gap-2 flex-wrap">
                <div className="relative flex-1 max-w-md">
                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search by profile name or headline…"
                        className="w-full pl-7 pr-3 py-1.5 text-xs rounded-lg outline-none bg-white"
                        style={{ border: '1px solid #D1CBC5' }}
                    />
                </div>
                <select value={reactionFilter} onChange={e => setReactionFilter(e.target.value)}
                    className="text-xs px-3 py-1.5 rounded-lg outline-none bg-white cursor-pointer"
                    style={{ border: '1px solid #D1CBC5' }}>
                    <option value="all">All reactions</option>
                    {Object.entries(REACTIONS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <select value={modeFilter} onChange={e => setModeFilter(e.target.value)}
                    className="text-xs px-3 py-1.5 rounded-lg outline-none bg-white cursor-pointer"
                    style={{ border: '1px solid #D1CBC5' }}>
                    <option value="all">All modes</option>
                    <option value="OBSERVE">Observe</option>
                    <option value="SUGGEST">Suggest</option>
                    <option value="ENFORCE">Enforce</option>
                </select>
                <select value={icpFilter} onChange={e => setIcpFilter(e.target.value)}
                    className="text-xs px-3 py-1.5 rounded-lg outline-none bg-white cursor-pointer"
                    style={{ border: '1px solid #D1CBC5' }}>
                    <option value="all">All ICPs</option>
                    {icpOptions.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
                {(search || reactionFilter !== 'all' || modeFilter !== 'all' || icpFilter !== 'all') && (
                    <button onClick={() => { setSearch(''); setReactionFilter('all'); setModeFilter('all'); setIcpFilter('all'); }}
                        className="text-[11px] text-gray-500 hover:text-gray-900 underline decoration-dotted">Clear</button>
                )}
            </div>

            <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3 premium-card !p-0 overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#D1CBC5] flex items-center justify-between">
                        <h2 className="text-sm font-bold text-gray-900">Recent engagement events</h2>
                        <span className="text-[0.65rem] text-gray-500">
                            {filtered.length === 0
                                ? 'No events'
                                : `Showing ${pageStart + 1}–${Math.min(pageStart + PAGE_SIZE, filtered.length)} of ${filtered.length}`}
                        </span>
                    </div>
                    {error && (
                        <div className="px-4 py-3 bg-rose-50 border-b border-rose-200 flex items-start gap-2 text-xs text-rose-800">
                            <AlertCircle size={12} className="mt-0.5 shrink-0" />
                            <div>
                                <div className="font-semibold">Couldn&apos;t load engagement events</div>
                                <div className="text-rose-700 mt-0.5">{error}</div>
                                <button onClick={fetchFeed} className="mt-1 text-rose-900 underline decoration-dotted">Retry</button>
                            </div>
                        </div>
                    )}
                    <div className="divide-y divide-gray-100">
                        {pageItems.length === 0 ? (
                            <div className="px-4 py-10 text-center text-xs text-gray-500">
                                {events.length === 0
                                    ? 'No engagement events yet. Once a connected account’s posts get reactions or comments, they’ll surface here.'
                                    : 'No events match the current filters.'}
                            </div>
                        ) : pageItems.map((e, i) => {
                            const r = REACTIONS[e.reaction as keyof typeof REACTIONS];
                            return (
                                <div key={pageStart + i} className="px-4 py-3 hover:bg-gray-50/50 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${e.tint} flex items-center justify-center text-xs font-semibold text-gray-700 shrink-0`}>{e.avatar}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-sm font-semibold text-gray-900">{e.name}</span>
                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-50 text-[0.65rem] text-gray-700 font-medium">{r.icon} {r.label}</span>
                                                {e.score !== null ? (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[0.65rem] text-violet-700 bg-violet-50 font-semibold">
                                                        ICP {(e.score * 100).toFixed(0)}% · {e.icp}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[0.65rem] text-gray-500 bg-gray-100">no ICP match</span>
                                                )}
                                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[0.6rem] uppercase tracking-wide font-semibold ${MODES.find(m => m.key === e.mode)?.tint}`}>{e.mode}</span>
                                            </div>
                                            <div className="text-[0.7rem] text-gray-500 mt-0.5">{e.headline}</div>
                                            <div className="text-[0.7rem] text-gray-600 mt-1.5">On post: <span className="italic">&ldquo;{e.post}&rdquo;</span></div>
                                            <div className="text-[0.7rem] text-gray-700 mt-1">→ {e.action}</div>
                                        </div>
                                        <div className="text-[0.65rem] text-gray-400 shrink-0">{e.time}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {totalPages > 1 && (
                        <div className="px-4 py-2.5 border-t border-[#D1CBC5] flex items-center justify-between">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={safePage === 1}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md hover:bg-gray-100 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={12} /> Prev
                            </button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                                    <button
                                        key={n}
                                        onClick={() => setPage(n)}
                                        className={`w-7 h-7 rounded-md text-xs font-semibold transition-colors ${n === safePage ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                                    >
                                        {n}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={safePage === totalPages}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md hover:bg-gray-100 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Next <ChevronRight size={12} />
                            </button>
                        </div>
                    )}
                </div>

                <div className="premium-card !p-0 overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#D1CBC5]">
                        <h2 className="text-sm font-bold text-gray-900">Monitoring rules</h2>
                    </div>
                    <div className="p-3 flex flex-col items-center justify-center text-center py-6">
                        <Target size={18} className="text-gray-300 mb-2" />
                        <p className="text-[0.7rem] text-gray-500 max-w-[180px] leading-snug">
                            No monitoring rules configured. Configure workspace, account, or post-level modes in Settings.
                        </p>
                        <a href="/dashboard/linkedin/settings" className="text-[0.7rem] text-blue-700 hover:text-blue-900 font-semibold underline decoration-dotted mt-2">
                            Open Settings →
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

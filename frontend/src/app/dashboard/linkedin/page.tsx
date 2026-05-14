'use client';

/**
 * Super LinkedIn — overview page.
 *
 * Live dashboard for the LinkedIn module. Wires up:
 *   - KPI strip (analytics/kpi + signal-lead-funnel, 30-day window)
 *   - Recent signals (signals/feed, last 7)
 *   - Active campaigns (analytics/campaign-perf, 30-day window)
 *   - Agent stack health (analytics/agent-telemetry, 24h window) —
 *     surfaces supervisor / ICP matcher / enrichment / reply classifier
 *     so operators can see at-a-glance whether the 24/7 stack is alive.
 *   - SUGGEST review queue count + click-through
 *   - Rule-health banner for monitoring rules with deleted refs
 *   - Zero-state onboarding when the org has no connected accounts yet
 *
 * Refetches on tab focus / visibility — matches the pattern on every
 * other LinkedIn page so jumping between tabs always sees fresh state.
 */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Linkedin, Radar, Rocket, Users, ArrowRight, Send, Heart,
    MessageCircle, Repeat2, ThumbsUp, Sparkles, MessageSquare, UserPlus,
    Loader2, Activity, Inbox, Target, Settings as SettingsIcon, AlertTriangle,
} from 'lucide-react';
import { apiClient } from '@/lib/api';

interface KpiPayload { invites_sent: number; accepted: number; acceptance_rate: number; dms_sent: number; replies_received: number; reply_rate: number }
interface SenderRow { account_id: string }
interface CampaignRow { campaign_id: string; campaign_name: string; status: string; sent: number; accepted: number; accept_rate: number }
interface SignalLeadPayload { stages: Array<{ label: string; value: number }>; event_type_breakdown: Record<string, number>; overall_conversion: number }

interface FeedRow {
    id: string;
    event_type: string;
    reaction_type: string | null;
    occurred_at: string;
    mode: 'OBSERVE' | 'SUGGEST' | 'ENFORCE';
    outcome: string | null;
    actor: { name: string; headline: string | null; icp_match_score: number | null } | null;
    post: { text: string | null; article_title: string | null; post_kind: string | null } | null;
}

interface RecentSignalRow {
    id: string;
    name: string;
    headline: string;
    reaction: string;
    icon: React.ReactNode;
    post: string;
    score: number | null;
    action: 'added_to_list' | 'added_to_campaign' | 'queued_review' | 'observed_only';
    time: string;
    tint: string;
}

function relTime(iso: string): string {
    const ms = Date.now() - new Date(iso).getTime();
    const m = Math.floor(ms / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    const d = Math.floor(h / 24);
    return `${d}d`;
}

function feedRowToRecent(r: FeedRow): RecentSignalRow {
    const reaction = r.event_type === 'REACTION' ? (r.reaction_type || 'LIKE') : r.event_type;
    const post = r.post?.article_title || r.post?.text || '';
    const action: RecentSignalRow['action'] =
        r.outcome === 'added_to_cold_call_list' ? 'added_to_list'
            : r.outcome === 'added_to_campaign' ? 'added_to_campaign'
            : r.outcome === 'suggested_for_review' ? 'queued_review'
            : 'observed_only';
    return {
        id: r.id,
        name: r.actor?.name || 'Unknown',
        headline: r.actor?.headline || '',
        reaction,
        icon: REACTION_ICON[reaction] ?? <ThumbsUp size={11} className="text-gray-400" />,
        post: post ? `"${post.length > 80 ? post.slice(0, 77) + '…' : post}"` : '',
        score: r.actor?.icp_match_score ?? null,
        action,
        time: relTime(r.occurred_at),
        tint: 'from-gray-100 to-gray-200',
    };
}

function pct(v: number, digits = 1) { return `${(v * 100).toFixed(digits)}%` }

const REACTION_ICON: Record<string, React.ReactNode> = {
    PRAISE:       <Heart size={11} className="text-amber-500" />,
    APPRECIATION: <Heart size={11} className="text-rose-500" />,
    EMPATHY:      <Heart size={11} className="text-pink-500" />,
    INTEREST:     <Sparkles size={11} className="text-violet-500" />,
    LIKE:         <ThumbsUp size={11} className="text-blue-400" />,
    MAYBE:        <ThumbsUp size={11} className="text-gray-400" />,
    FUNNY:        <Sparkles size={11} className="text-amber-400" />,
    COMMENT:      <MessageCircle size={11} className="text-blue-500" />,
    SHARE:        <Repeat2 size={11} className="text-emerald-500" />,
    REPOST:       <Repeat2 size={11} className="text-emerald-500" />,
};

const STATUS_BADGE: Record<string, string> = {
    ongoing:  'bg-emerald-50 text-emerald-700',
    active:   'bg-emerald-50 text-emerald-700',
    paused:   'bg-amber-50 text-amber-700',
    draft:    'bg-gray-100 text-gray-600',
    finished: 'bg-gray-100 text-gray-600',
};

const ACTION_LABEL: Record<string, { label: string; tint: string }> = {
    added_to_list: { label: 'Added to cold-call list', tint: 'bg-emerald-50 text-emerald-700' },
    added_to_campaign: { label: 'Enrolled in campaign', tint: 'bg-blue-50 text-blue-700' },
    queued_review: { label: 'Queued for review', tint: 'bg-amber-50 text-amber-700' },
    observed_only: { label: 'Observed only', tint: 'bg-gray-100 text-gray-600' },
};

interface AgentTelemetryRow {
    agent_name: string;
    count: number;
    success: number;
    error: number;
    skipped: number;
    latency_avg_ms: number;
    cost_usd: number;
    error_rate: number;
}

interface RuleHealthIssue { rule_id: string; kind: 'missing_campaign' | 'missing_list' | 'missing_icp'; ref_id: string }

interface ReviewQueueRow { agent_run_id: string; event_id: string }

const AGENT_LABEL: Record<string, { label: string; icon: React.ReactNode }> = {
    supervisor:        { label: 'Supervisor',        icon: <Activity size={12} /> },
    icp_matcher:       { label: 'ICP matcher',       icon: <Target size={12} /> },
    enrichment:        { label: 'Enrichment',        icon: <Sparkles size={12} /> },
    reply_classifier:  { label: 'Reply classifier',  icon: <MessageSquare size={12} /> },
    signal_monitoring: { label: 'Signal monitoring', icon: <Radar size={12} /> },
};

export default function LinkedInOverviewPage() {
    const [kpi, setKpi] = useState<KpiPayload | null>(null);
    const [senders, setSenders] = useState<SenderRow[]>([]);
    const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
    const [signalLead, setSignalLead] = useState<SignalLeadPayload | null>(null);
    const [recentSignals, setRecentSignals] = useState<RecentSignalRow[]>([]);
    const [agentTelemetry, setAgentTelemetry] = useState<AgentTelemetryRow[]>([]);
    const [ruleIssues, setRuleIssues] = useState<RuleHealthIssue[]>([]);
    const [reviewQueueCount, setReviewQueueCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchAll = useCallback(async () => {
        // Fan all reads in parallel; each falls back to a safe empty
        // shape on failure so a single endpoint outage doesn't blank
        // the page.
        const [k, s, c, sl, feed, agents, ruleHealth, review] = await Promise.all([
            apiClient<KpiPayload>('/api/linkedin/analytics/kpi?range=30d').catch(() => null),
            apiClient<SenderRow[]>('/api/linkedin/analytics/sender-perf?range=90d').catch(() => []),
            apiClient<CampaignRow[]>('/api/linkedin/analytics/campaign-perf?range=30d').catch(() => []),
            apiClient<SignalLeadPayload>('/api/linkedin/analytics/signal-lead-funnel?range=30d').catch(() => null),
            apiClient<{ data: FeedRow[] } | FeedRow[]>('/api/linkedin/signals/feed?limit=7').catch(() => null),
            // Agent telemetry — 24h window is the operator-meaningful slice.
            // The endpoint reads filters via `range`; we want a tight
            // window for "is the stack alive RIGHT NOW".
            apiClient<AgentTelemetryRow[]>('/api/linkedin/analytics/agent-telemetry?range=7d').catch(() => []),
            apiClient<{ data: { rules_checked: number; issues: RuleHealthIssue[] } }>('/api/linkedin/signals/rule-health').catch(() => null),
            apiClient<{ data: ReviewQueueRow[] }>('/api/linkedin/signals/review-queue?limit=50').catch(() => null),
        ]);
        setKpi(k);
        setSenders(Array.isArray(s) ? s : []);
        setCampaigns(Array.isArray(c) ? c : []);
        setSignalLead(sl);
        const feedList: FeedRow[] = Array.isArray(feed) ? feed : ((feed as any)?.data ?? []);
        setRecentSignals(feedList.map(feedRowToRecent));
        setAgentTelemetry(Array.isArray(agents) ? agents : []);
        setRuleIssues(ruleHealth?.data?.issues ?? []);
        setReviewQueueCount(Array.isArray(review?.data) ? review.data.length : 0);
        setLoading(false);
    }, []);

    useEffect(() => {
        let cancelled = false;
        void fetchAll().catch(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [fetchAll]);

    // Refetch on focus + visibility — matches the pattern on every other
    // LinkedIn page. Operator launches a campaign in another tab → comes
    // back to Overview → counters reflect reality.
    useEffect(() => {
        const onFocus = () => { void fetchAll(); };
        const onVisibility = () => { if (document.visibilityState === 'visible') void fetchAll(); };
        window.addEventListener('focus', onFocus);
        document.addEventListener('visibilitychange', onVisibility);
        return () => {
            window.removeEventListener('focus', onFocus);
            document.removeEventListener('visibilitychange', onVisibility);
        };
    }, [fetchAll]);

    const totalCampaigns = campaigns.length;
    const activeCampaignsCount = campaigns.filter(c => c.status === 'active' || c.status === 'ongoing').length;
    const engagementEvents = signalLead?.stages.find(s => s.label === 'Engagement events')?.value ?? 0;
    const profilesFromEngagement = signalLead?.stages.find(s => s.label === 'Leads created')?.value ?? 0;
    const icpMatched = signalLead?.stages.find(s => s.label === 'ICP matched')?.value ?? 0;

    const KPI_TILES = [
        {
            label: 'LinkedIn accounts',
            value: loading ? '—' : senders.length.toLocaleString(),
            delta: 'connected senders',
            icon: <Users size={14} strokeWidth={1.75} />, tint: 'bg-blue-50 text-blue-700',
        },
        {
            label: 'Active campaigns',
            value: loading ? '—' : activeCampaignsCount.toLocaleString(),
            delta: `of ${totalCampaigns} total`,
            icon: <Rocket size={14} strokeWidth={1.75} />, tint: 'bg-emerald-50 text-emerald-700',
        },
        {
            label: 'Connection requests',
            value: loading ? '—' : (kpi?.invites_sent ?? 0).toLocaleString(),
            delta: 'sent · last 30 days',
            icon: <Send size={14} strokeWidth={1.75} />, tint: 'bg-violet-50 text-violet-700',
        },
        {
            label: 'Acceptance rate',
            value: loading ? '—' : pct(kpi?.acceptance_rate ?? 0),
            delta: `${(kpi?.accepted ?? 0).toLocaleString()} accepted`,
            icon: <Heart size={14} strokeWidth={1.75} />, tint: 'bg-rose-50 text-rose-700',
        },
        {
            label: 'DMs sent',
            value: loading ? '—' : (kpi?.dms_sent ?? 0).toLocaleString(),
            delta: 'messages + InMails',
            icon: <MessageCircle size={14} strokeWidth={1.75} />, tint: 'bg-amber-50 text-amber-700',
        },
        {
            label: 'Reply rate',
            value: loading ? '—' : pct(kpi?.reply_rate ?? 0),
            delta: `${(kpi?.replies_received ?? 0).toLocaleString()} replies`,
            icon: <MessageSquare size={14} strokeWidth={1.75} />, tint: 'bg-indigo-50 text-indigo-700',
        },
        {
            label: 'Engagement signals',
            value: loading ? '—' : engagementEvents.toLocaleString(),
            delta: `${icpMatched.toLocaleString()} matched ICP`,
            icon: <Radar size={14} strokeWidth={1.75} />, tint: 'bg-sky-50 text-sky-700',
        },
        {
            label: 'Profiles from engagement',
            value: loading ? '—' : profilesFromEngagement.toLocaleString(),
            delta: 'new leads · 30d',
            icon: <UserPlus size={14} strokeWidth={1.75} />, tint: 'bg-teal-50 text-teal-700',
        },
    ];

    const showZeroState = !loading && senders.length === 0;
    const missingCampaignRefs = ruleIssues.filter(i => i.kind === 'missing_campaign').length;
    const missingIcpRefs = ruleIssues.filter(i => i.kind === 'missing_icp').length;

    return (
        <div className="p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Linkedin size={18} strokeWidth={1.75} className="text-[#0A66C2]" /> Super LinkedIn
                    </h1>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {loading ? 'Loading overview…' : `${senders.length} accounts · ${activeCampaignsCount} active campaigns · ${engagementEvents.toLocaleString()} signals in last 30d`}
                    </p>
                </div>
                <Link href="/dashboard/linkedin/campaigns" className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer border border-[#D1CBC5] hover:bg-gray-50 text-gray-700">
                    Manage campaigns <ArrowRight size={12} />
                </Link>
            </div>

            {/* Zero-state onboarding — first thing a brand-new org sees.
                Walks them through the linear "connect → ICP → campaign"
                path before they see a wall of zeros. */}
            {showZeroState && (
                <div className="premium-card !bg-blue-50/50 !border-blue-200">
                    <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                            <Linkedin size={16} className="text-blue-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-blue-900">Get started with Super LinkedIn</div>
                            <p className="text-[0.75rem] text-blue-800 mt-0.5">
                                Three steps to turn LinkedIn engagement into enrolled leads. The 24/7 agent stack does the rest.
                            </p>
                            <div className="grid grid-cols-3 gap-3 mt-3">
                                <Link href="/dashboard/linkedin/accounts" className="flex items-start gap-2 p-2.5 rounded-lg bg-white hover:bg-blue-50 transition-colors no-underline" style={{ border: '1px solid #BFDBFE' }}>
                                    <div className="w-6 h-6 rounded-full bg-blue-700 text-white text-[0.7rem] font-bold flex items-center justify-center shrink-0">1</div>
                                    <div>
                                        <div className="text-[0.75rem] font-bold text-gray-900">Connect a LinkedIn account</div>
                                        <div className="text-[0.65rem] text-gray-600">Hosted-auth via Unipile · safe + sandboxed</div>
                                    </div>
                                </Link>
                                <Link href="/dashboard/linkedin/icp" className="flex items-start gap-2 p-2.5 rounded-lg bg-white hover:bg-blue-50 transition-colors no-underline" style={{ border: '1px solid #BFDBFE' }}>
                                    <div className="w-6 h-6 rounded-full bg-blue-700 text-white text-[0.7rem] font-bold flex items-center justify-center shrink-0">2</div>
                                    <div>
                                        <div className="text-[0.75rem] font-bold text-gray-900">Define an ICP</div>
                                        <div className="text-[0.65rem] text-gray-600">Title, industry, size, geo · drives matching</div>
                                    </div>
                                </Link>
                                <Link href="/dashboard/linkedin/campaigns/new" className="flex items-start gap-2 p-2.5 rounded-lg bg-white hover:bg-blue-50 transition-colors no-underline" style={{ border: '1px solid #BFDBFE' }}>
                                    <div className="w-6 h-6 rounded-full bg-blue-700 text-white text-[0.7rem] font-bold flex items-center justify-center shrink-0">3</div>
                                    <div>
                                        <div className="text-[0.75rem] font-bold text-gray-900">Build your first campaign</div>
                                        <div className="text-[0.65rem] text-gray-600">View → CR → DM sequence · pre-flight validated</div>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Rule-health banner — surfaces dangling SignalMonitoringRule
                refs (deleted campaigns or tombstoned ICPs) the supervisor
                would silently skip. Same source the Signals page uses. */}
            {ruleIssues.length > 0 && (
                <div className="premium-card !bg-rose-50/60 !border-rose-200 flex items-start gap-2 !py-2.5 text-[0.75rem] text-rose-900">
                    <AlertTriangle size={13} className="text-rose-700 mt-0.5 shrink-0" />
                    <div className="flex-1">
                        <span className="font-bold">Monitoring rules have broken references:</span>{' '}
                        {missingCampaignRefs > 0 && (<>{missingCampaignRefs} reference{missingCampaignRefs === 1 ? '' : 's'} a deleted campaign. </>)}
                        {missingIcpRefs > 0 && (<>{missingIcpRefs} reference{missingIcpRefs === 1 ? '' : 's'} a deleted ICP. </>)}
                        ENFORCE actions for those rules will skip silently.
                    </div>
                    <Link href="/dashboard/linkedin/signals" className="text-[0.7rem] font-semibold text-rose-900 underline decoration-dotted">
                        Open Signals →
                    </Link>
                </div>
            )}

            {/* SUGGEST review queue badge — engagers waiting for operator
                approval before enrollment. Click-through to the inline
                queue on the Signals page. */}
            {reviewQueueCount > 0 && (
                <div className="premium-card !bg-violet-50/50 !border-violet-200 flex items-center justify-between gap-3 !py-2.5">
                    <div className="flex items-center gap-2">
                        <Sparkles size={14} className="text-violet-700 shrink-0" />
                        <div>
                            <div className="text-[0.75rem] font-bold text-violet-900">
                                {reviewQueueCount} engager{reviewQueueCount === 1 ? '' : 's'} waiting for review
                            </div>
                            <div className="text-[0.65rem] text-violet-700">
                                Matched a SUGGEST-mode rule. Open the review queue to approve or dismiss.
                            </div>
                        </div>
                    </div>
                    <Link href="/dashboard/linkedin/signals" className="text-[0.7rem] font-semibold text-violet-900 underline decoration-dotted">
                        Review queue →
                    </Link>
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {KPI_TILES.map(k => (
                    <div key={k.label} className="premium-card">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-semibold text-gray-500">{k.label}</span>
                            <span className={`px-1.5 py-0.5 rounded ${k.tint}`}>{k.icon}</span>
                        </div>
                        <div className="text-xl font-bold text-gray-900">{k.value}</div>
                        <div className="text-[11px] text-gray-500 mt-0.5">{k.delta}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 premium-card !p-0 overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#D1CBC5] flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2"><Radar size={14} strokeWidth={1.75} /> Recent signals</h2>
                        <Link href="/dashboard/linkedin/signals" className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold">View all →</Link>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {loading ? (
                            <div className="flex items-center justify-center py-8 text-xs text-gray-500"><Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> Loading…</div>
                        ) : recentSignals.length === 0 ? (
                            <div className="text-center text-xs text-gray-500 py-8 px-4">
                                No engagement events yet. Once a connected account&apos;s posts get reactions or comments, they&apos;ll appear here.
                            </div>
                        ) : recentSignals.map((s) => (
                            <div key={s.id} className="px-4 py-3 hover:bg-gray-50/50 transition-colors">
                                <div className="flex items-start gap-3">
                                    <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${s.tint} flex items-center justify-center text-xs font-semibold text-gray-700 shrink-0`}>
                                        {s.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm font-semibold text-gray-900">{s.name}</span>
                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-50 text-[10px] text-gray-600 font-medium">
                                                {s.icon} {s.reaction}
                                            </span>
                                            {s.score !== null && (
                                                <span className="text-[10px] text-violet-700 bg-violet-50 px-1.5 py-0.5 rounded font-semibold">
                                                    ICP {(s.score * 100).toFixed(0)}%
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-[11px] text-gray-500 mt-0.5">{s.headline}</div>
                                        <div className="text-[11px] text-gray-600 mt-1 italic">on {s.post}</div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${ACTION_LABEL[s.action].tint}`}>
                                            {ACTION_LABEL[s.action].label}
                                        </span>
                                        <div className="text-[10px] text-gray-400 mt-1">{s.time}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="premium-card !p-0 overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#D1CBC5] flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2"><Rocket size={14} strokeWidth={1.75} /> Active campaigns</h2>
                        <Link href="/dashboard/linkedin/campaigns" className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold">All →</Link>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {loading ? (
                            <div className="flex items-center justify-center py-8 text-xs text-gray-500"><Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> Loading…</div>
                        ) : campaigns.length === 0 ? (
                            <div className="text-center text-xs text-gray-500 py-8">No campaigns yet</div>
                        ) : (
                            campaigns.slice(0, 6).map(c => (
                                <Link
                                    href={`/dashboard/linkedin/campaigns?campaign=${c.campaign_id}`}
                                    key={c.campaign_id}
                                    className="block px-4 py-3 hover:bg-gray-50/50 transition-colors"
                                >
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-sm font-semibold text-gray-900 truncate pr-2">{c.campaign_name}</span>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${STATUS_BADGE[c.status] ?? 'bg-gray-100 text-gray-600'}`}>{c.status}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] text-gray-500">
                                        <span>{c.sent} CR sent</span>
                                        <span>•</span>
                                        <span className="text-emerald-700 font-semibold">{pct(c.accept_rate, 0)}</span>
                                        <span>accepted</span>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Agent stack health — surfaces the 24/7 supervisor + 4
                agents so operators can see at-a-glance whether the
                always-on layer is alive. 7-day window because most ops
                care about "is this healthy?" not "what happened in the
                last hour." Empty stack (no runs at all) gets a friendly
                "nothing's happened yet" message rather than a wall of
                zeros that look like the system is broken. */}
            <div className="premium-card !p-0 overflow-hidden">
                <div className="px-4 py-3 border-b border-[#D1CBC5] flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <Activity size={14} strokeWidth={1.75} /> Agent stack health
                    </h2>
                    <span className="text-[10px] text-gray-500">7-day window</span>
                </div>
                {loading ? (
                    <div className="flex items-center justify-center py-8 text-xs text-gray-500">
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> Loading…
                    </div>
                ) : agentTelemetry.every(a => a.count === 0) ? (
                    <div className="text-center text-xs text-gray-500 py-8 px-4">
                        Agents are scheduled but haven&apos;t had work to do yet. They&apos;ll start running as soon as engagement events land.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3">
                        {agentTelemetry
                            .filter(a => a.agent_name !== 'signal_monitoring') // duplicate of supervisor for our purposes
                            .map(a => {
                                const meta = AGENT_LABEL[a.agent_name] ?? { label: a.agent_name, icon: <Activity size={12} /> };
                                const successRate = a.count > 0 ? Math.round((a.success / a.count) * 100) : 0;
                                const tint = a.count === 0 ? 'bg-gray-50 text-gray-500'
                                    : a.error_rate >= 0.2 ? 'bg-rose-50 text-rose-700'
                                    : a.error_rate >= 0.05 ? 'bg-amber-50 text-amber-700'
                                    : 'bg-emerald-50 text-emerald-700';
                                return (
                                    <div key={a.agent_name} className="rounded-lg p-2.5" style={{ border: '1px solid #D1CBC5', background: '#FAFAF8' }}>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-[11px] font-semibold text-gray-700 flex items-center gap-1.5">
                                                {meta.icon} {meta.label}
                                            </span>
                                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${tint}`}>
                                                {a.count === 0 ? 'idle' : a.error_rate >= 0.2 ? 'errors' : 'ok'}
                                            </span>
                                        </div>
                                        <div className="text-lg font-bold text-gray-900 tabular-nums">{a.count.toLocaleString()}</div>
                                        <div className="text-[10px] text-gray-500">
                                            {a.count === 0 ? 'no runs yet' : `${successRate}% success · ${a.latency_avg_ms}ms avg`}
                                        </div>
                                        {a.cost_usd > 0 && (
                                            <div className="text-[10px] text-gray-400 mt-0.5">${a.cost_usd.toFixed(2)} spent</div>
                                        )}
                                    </div>
                                );
                            })}
                    </div>
                )}
            </div>

            {/* Sub-surface nav cards — every page in the LinkedIn module
                should be one click from Overview. Sidebar already has
                them but a visual card row reinforces the surface area
                for first-time users. */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { href: '/dashboard/linkedin/accounts',  label: 'Accounts',  desc: 'Connected LinkedIn senders',     icon: <Users size={14} />,         tint: 'bg-blue-50 text-blue-700' },
                    { href: '/dashboard/linkedin/contacts',  label: 'Contacts',  desc: 'Workspace-level lead registry',   icon: <UserPlus size={14} />,      tint: 'bg-emerald-50 text-emerald-700' },
                    { href: '/dashboard/linkedin/unibox',    label: 'Unibox',    desc: 'DM threads + reply',              icon: <Inbox size={14} />,         tint: 'bg-amber-50 text-amber-700' },
                    { href: '/dashboard/linkedin/icp',       label: 'ICP',       desc: 'Profiles the supervisor filters', icon: <Target size={14} />,        tint: 'bg-violet-50 text-violet-700' },
                ].map(n => (
                    <Link key={n.href} href={n.href} className="premium-card !py-3 flex items-center gap-3 hover:!bg-gray-50 transition-colors no-underline">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${n.tint}`}>{n.icon}</span>
                        <div className="min-w-0">
                            <div className="text-[0.75rem] font-bold text-gray-900">{n.label}</div>
                            <div className="text-[0.65rem] text-gray-500 truncate">{n.desc}</div>
                        </div>
                        <ArrowRight size={12} className="ml-auto text-gray-400 shrink-0" />
                    </Link>
                ))}
            </div>
        </div>
    );
}

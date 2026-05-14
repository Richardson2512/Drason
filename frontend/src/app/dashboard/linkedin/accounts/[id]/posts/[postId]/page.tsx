'use client';

/**
 * Per-post engagement drill-down. Reached by clicking a post card on
 * the account-detail page. Shows the list of profiles who engaged with
 * this post (reactions / comments / shares), each rendered as a rich
 * profile card with ICP match, auto-tag, connection state, engagement
 * recency, and per-actor event summary.
 *
 * Data: backend joins EngagementEvent → LinkedInProfile → connection
 * edge, collapses one row per actor with an events[] array. We do no
 * additional client-side merging beyond sorting + filtering.
 */

import { useEffect, useState, useCallback, useMemo, use } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Loader2, AlertTriangle, Heart, MessageCircle, Repeat2,
    Sparkles, ThumbsUp, Linkedin, Building2, MapPin, Briefcase,
    UserCheck, Clock, ExternalLink, Filter as FilterIcon, Tag,
    TrendingUp, Target, Calendar,
} from 'lucide-react';
import { apiClient } from '@/lib/api';

interface PostMeta {
    unipile_post_id: string;
    posted_at: string;
    last_polled_at: string | null;
    last_reaction_count: number;
    last_comment_count: number;
    last_share_count: number;
}

interface EngagerEvent {
    event_type: 'REACTION' | 'COMMENT' | 'SHARE' | 'REPOST';
    reaction_type: string | null;
    occurred_at: string;
}

type EngagerRelationship = 'customer' | 'active_prospect' | 'past_lead' | 'new';

interface Engager {
    actor_profile_id: string;
    name: string;
    headline: string | null;
    company: string | null;
    position: string | null;
    location: string | null;
    industry: string | null;
    profile_picture_url: string | null;
    public_identifier: string;
    icp_match_score: number | null;
    icp_matched_at: string | null;
    linkedin_auto_tag: string | null;
    lead_id: string | null;
    last_engaged_at: string | null;
    engagement_count_30d: number;
    engagement_score: number | null;
    connection_status: string;
    connection_accepted_at: string | null;
    relationship: EngagerRelationship;
    relationship_note: string;
    customer_source: string | null;
    events: EngagerEvent[];
}

interface EngagementsPayload {
    post: PostMeta | null;
    engagers: Engager[];
    totals: { unique_actors: number; reactions: number; comments: number; shares: number; reposts: number };
    note?: string;
}

const REACTION_ICON: Record<string, React.ReactNode> = {
    LIKE:          <ThumbsUp className="w-3 h-3 text-blue-500" />,
    PRAISE:        <Heart className="w-3 h-3 text-amber-500" />,
    EMPATHY:       <Heart className="w-3 h-3 text-rose-500" />,
    INTEREST:      <Sparkles className="w-3 h-3 text-violet-500" />,
    APPRECIATION:  <Heart className="w-3 h-3 text-pink-500" />,
    MAYBE:         <ThumbsUp className="w-3 h-3 text-gray-400" />,
    FUNNY:         <Sparkles className="w-3 h-3 text-amber-400" />,
};

const STATUS_PILL: Record<string, { bg: string; fg: string; label: string }> = {
    CONNECTED:         { bg: '#DCFCE7', fg: '#15803D', label: 'Connected' },
    INVITE_SENT:       { bg: '#DBEAFE', fg: '#1D4ED8', label: 'Invite sent' },
    INVITE_ACCEPTED:   { bg: '#DCFCE7', fg: '#15803D', label: 'Connected' },
    INVITE_REJECTED:   { bg: '#FEE2E2', fg: '#B91C1C', label: 'Rejected' },
    INVITE_WITHDRAWN:  { bg: '#FEF3C7', fg: '#B45309', label: 'Withdrawn' },
    NOT_CONNECTED:     { bg: '#F3F4F6', fg: '#6B7280', label: 'Not connected' },
    NOT_DETERMINED:    { bg: '#F3F4F6', fg: '#6B7280', label: 'Unknown' },
};

const TAG_PILL: Record<string, { bg: string; fg: string }> = {
    'Interested':     { bg: '#DCFCE7', fg: '#15803D' },
    'Not Interested': { bg: '#FEE2E2', fg: '#B91C1C' },
    'Generic':        { bg: '#F3F4F6', fg: '#6B7280' },
};

const RELATIONSHIP_PILL: Record<EngagerRelationship, { bg: string; fg: string; label: string }> = {
    customer:        { bg: '#FAE8FF', fg: '#86198F', label: 'Customer' },
    active_prospect: { bg: '#DBEAFE', fg: '#1D4ED8', label: 'Active prospect' },
    past_lead:       { bg: '#FEF3C7', fg: '#B45309', label: 'Past lead' },
    new:             { bg: '#F3F4F6', fg: '#374151', label: 'Net-new' },
};

function initials(name: string): string {
    return name.split(' ').filter(Boolean).map(p => p[0]).join('').slice(0, 2).toUpperCase() || 'LI';
}

function relativeTime(iso: string | null): string {
    if (!iso) return '';
    const ms = Date.now() - new Date(iso).getTime();
    const min = Math.floor(ms / 60_000);
    if (min < 1) return 'just now';
    if (min < 60) return `${min}m ago`;
    const h = Math.floor(min / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d}d ago`;
    const w = Math.floor(d / 7);
    if (w < 5) return `${w}w ago`;
    return new Date(iso).toLocaleDateString();
}

type EventTypeFilter = 'all' | 'REACTION' | 'COMMENT' | 'SHARE' | 'REPOST';
type IcpFilter = 'all' | 'matched' | 'unmatched';
type ConnFilter = 'all' | 'connected' | 'invite_sent' | 'not_connected';
type RelationshipFilter = 'all' | 'customer' | 'active_prospect' | 'past_lead' | 'new';
type SortMode = 'most_engaged' | 'icp_score' | 'recent';

export default function PostEngagementsPage({ params }: { params: Promise<{ id: string; postId: string }> }) {
    const { id: accountId, postId } = use(params);
    const [data, setData] = useState<EngagementsPayload | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [eventType, setEventType] = useState<EventTypeFilter>('all');
    const [icpFilter, setIcpFilter] = useState<IcpFilter>('all');
    const [connFilter, setConnFilter] = useState<ConnFilter>('all');
    const [relationshipFilter, setRelationshipFilter] = useState<RelationshipFilter>('all');
    const [sortMode, setSortMode] = useState<SortMode>('most_engaged');

    const fetchEngagements = useCallback(async () => {
        setLoading(true);
        try {
            const d = await apiClient<EngagementsPayload>(`/api/linkedin/accounts/${accountId}/posts/${postId}/engagements`);
            setData(d);
            setError(null);
        } catch (err: any) {
            setError(err?.message || 'Failed to load engagements');
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [accountId, postId]);

    useEffect(() => { fetchEngagements(); }, [fetchEngagements]);

    const filtered = useMemo(() => {
        if (!data) return [];
        let rows = data.engagers;
        if (eventType !== 'all') rows = rows.filter(r => r.events.some(e => e.event_type === eventType));
        if (icpFilter === 'matched')   rows = rows.filter(r => r.icp_match_score !== null && r.icp_match_score >= 0.7);
        if (icpFilter === 'unmatched') rows = rows.filter(r => r.icp_match_score === null || r.icp_match_score < 0.7);
        if (connFilter === 'connected')     rows = rows.filter(r => r.connection_status === 'CONNECTED' || r.connection_status === 'INVITE_ACCEPTED');
        if (connFilter === 'invite_sent')   rows = rows.filter(r => r.connection_status === 'INVITE_SENT');
        if (connFilter === 'not_connected') rows = rows.filter(r => r.connection_status === 'NOT_CONNECTED' || r.connection_status === 'NOT_DETERMINED');
        if (relationshipFilter !== 'all')   rows = rows.filter(r => r.relationship === relationshipFilter);

        const sorted = [...rows];
        if (sortMode === 'icp_score') {
            sorted.sort((a, b) => (b.icp_match_score ?? 0) - (a.icp_match_score ?? 0));
        } else if (sortMode === 'recent') {
            sorted.sort((a, b) => {
                const aT = a.events[0]?.occurred_at ?? '';
                const bT = b.events[0]?.occurred_at ?? '';
                return bT.localeCompare(aT);
            });
        }
        // 'most_engaged' is the API default — no resort needed.
        return sorted;
    }, [data, eventType, icpFilter, connFilter, relationshipFilter, sortMode]);

    // Per-bucket counts so the filter chip can show "Customer (3)".
    const relationshipCounts = useMemo(() => {
        const c = { customer: 0, active_prospect: 0, past_lead: 0, new: 0 };
        for (const r of data?.engagers ?? []) c[r.relationship] = (c[r.relationship] ?? 0) + 1;
        return c;
    }, [data]);

    return (
        <div className="p-4 flex flex-col gap-4">
            <div>
                <Link
                    href={`/dashboard/linkedin/accounts/${accountId}`}
                    className="inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-900 mb-2 no-underline"
                >
                    <ArrowLeft size={11} /> Back to account
                </Link>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp size={18} strokeWidth={1.75} className="text-[#0A66C2]" /> Post engagement
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                    Profiles who reacted, commented, shared, or reposted this content. Use the filters to isolate ICP-matched engagers and turn them into outbound targets.
                </p>
            </div>

            {loading ? (
                <div className="premium-card flex items-center justify-center py-12 text-xs text-gray-500">
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> Loading engagement…
                </div>
            ) : error ? (
                <div className="premium-card flex flex-col items-center justify-center py-12">
                    <AlertTriangle className="w-6 h-6 text-rose-600 mb-2" />
                    <p className="text-sm text-rose-600 mb-3">{error}</p>
                    <button onClick={fetchEngagements} className="px-3 py-1.5 bg-gray-900 text-white rounded-md text-xs font-semibold">Retry</button>
                </div>
            ) : data && data.note ? (
                <div className="premium-card flex flex-col items-center justify-center py-12 text-center">
                    <Clock className="w-7 h-7 text-gray-300 mb-2" />
                    <p className="text-sm font-semibold text-gray-900 mb-1">Engagement data pending</p>
                    <p className="text-xs text-gray-500 max-w-md">{data.note}</p>
                </div>
            ) : data ? (
                <>
                    {/* Totals strip */}
                    <div className="premium-card flex items-center gap-4 flex-wrap !py-3">
                        <div>
                            <div className="text-[10px] font-semibold text-gray-500">Posted</div>
                            <div className="text-xs font-semibold text-gray-900">{data.post && new Date(data.post.posted_at).toLocaleString()}</div>
                        </div>
                        <div className="w-px h-7 bg-gray-200" />
                        <TotalsStat label="Unique engagers" value={data.totals.unique_actors} icon={<UserCheck className="w-3 h-3 text-gray-700" />} />
                        <TotalsStat label="Reactions"       value={data.totals.reactions}     icon={<Heart className="w-3 h-3 text-rose-500" />} />
                        <TotalsStat label="Comments"        value={data.totals.comments}      icon={<MessageCircle className="w-3 h-3 text-blue-500" />} />
                        <TotalsStat label="Shares"          value={data.totals.shares}        icon={<Repeat2 className="w-3 h-3 text-emerald-500" />} />
                        {data.totals.reposts > 0 && (
                            <TotalsStat label="Reposts" value={data.totals.reposts} icon={<Repeat2 className="w-3 h-3 text-violet-500" />} />
                        )}
                        {data.post?.last_polled_at && (
                            <div className="ml-auto text-[10px] text-gray-500">
                                <Clock className="w-3 h-3 inline mr-0.5" />
                                Last polled {relativeTime(data.post.last_polled_at)}
                            </div>
                        )}
                    </div>

                    {/* Filters strip */}
                    <div className="premium-card flex items-center gap-2 flex-wrap !py-2.5">
                        <FilterIcon className="w-3 h-3 text-gray-500" />
                        <span className="text-[11px] font-semibold text-gray-700">Filters:</span>

                        <select value={eventType} onChange={e => setEventType(e.target.value as EventTypeFilter)}
                            className="text-[11px] px-2 py-1 rounded-md outline-none bg-white cursor-pointer"
                            style={{ border: '1px solid #D1CBC5' }}>
                            <option value="all">All event types</option>
                            <option value="REACTION">Reactions</option>
                            <option value="COMMENT">Comments</option>
                            <option value="SHARE">Shares</option>
                            <option value="REPOST">Reposts</option>
                        </select>

                        <select value={icpFilter} onChange={e => setIcpFilter(e.target.value as IcpFilter)}
                            className="text-[11px] px-2 py-1 rounded-md outline-none bg-white cursor-pointer"
                            style={{ border: '1px solid #D1CBC5' }}>
                            <option value="all">All ICPs</option>
                            <option value="matched">ICP-matched (≥70%)</option>
                            <option value="unmatched">Unmatched / low</option>
                        </select>

                        <select value={connFilter} onChange={e => setConnFilter(e.target.value as ConnFilter)}
                            className="text-[11px] px-2 py-1 rounded-md outline-none bg-white cursor-pointer"
                            style={{ border: '1px solid #D1CBC5' }}>
                            <option value="all">Any connection state</option>
                            <option value="connected">Connected</option>
                            <option value="invite_sent">Invite sent</option>
                            <option value="not_connected">Not connected</option>
                        </select>

                        <select value={relationshipFilter} onChange={e => setRelationshipFilter(e.target.value as RelationshipFilter)}
                            className="text-[11px] px-2 py-1 rounded-md outline-none bg-white cursor-pointer"
                            style={{ border: '1px solid #D1CBC5' }}>
                            <option value="all">Any relationship</option>
                            <option value="customer">Customer ({relationshipCounts.customer})</option>
                            <option value="active_prospect">Active prospect ({relationshipCounts.active_prospect})</option>
                            <option value="past_lead">Past lead ({relationshipCounts.past_lead})</option>
                            <option value="new">Net-new ({relationshipCounts.new})</option>
                        </select>

                        <div className="ml-auto flex items-center gap-1">
                            <span className="text-[11px] text-gray-500">Sort:</span>
                            <select value={sortMode} onChange={e => setSortMode(e.target.value as SortMode)}
                                className="text-[11px] px-2 py-1 rounded-md outline-none bg-white cursor-pointer"
                                style={{ border: '1px solid #D1CBC5' }}>
                                <option value="most_engaged">Most engaged</option>
                                <option value="icp_score">Highest ICP score</option>
                                <option value="recent">Most recent</option>
                            </select>
                        </div>
                    </div>

                    {/* Engagers grid */}
                    {filtered.length === 0 ? (
                        <div className="premium-card flex flex-col items-center justify-center py-12 text-center">
                            <Filter className="w-7 h-7 text-gray-300 mb-2" />
                            <p className="text-sm font-semibold text-gray-900 mb-1">No engagers match the current filters</p>
                            <p className="text-xs text-gray-500 max-w-sm">Try widening the event-type, ICP, or connection-state filters.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {filtered.map(e => <EngagerCard key={e.actor_profile_id} engager={e} />)}
                        </div>
                    )}
                </>
            ) : null}
        </div>
    );
}

function Filter(props: { className?: string }) {
    return <FilterIcon {...props} />;
}

function TotalsStat({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
    return (
        <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gray-50 flex items-center justify-center shrink-0">{icon}</div>
            <div>
                <div className="text-[10px] font-semibold text-gray-500">{label}</div>
                <div className="text-sm font-bold text-gray-900 tabular-nums">{value.toLocaleString()}</div>
            </div>
        </div>
    );
}

function EngagerCard({ engager }: { engager: Engager }) {
    const status = STATUS_PILL[engager.connection_status] ?? STATUS_PILL.NOT_CONNECTED;
    const tag = engager.linkedin_auto_tag ? TAG_PILL[engager.linkedin_auto_tag] : null;
    const relationship = RELATIONSHIP_PILL[engager.relationship] ?? RELATIONSHIP_PILL.new;
    const icpPct = engager.icp_match_score != null ? Math.round(engager.icp_match_score * 100) : null;

    return (
        <article className="premium-card !p-0 overflow-hidden">
            <div className="p-4 flex items-start gap-3">
                {engager.profile_picture_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={engager.profile_picture_url} alt={engager.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-xs font-bold text-gray-700 shrink-0">
                        {initials(engager.name)}
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <a
                            href={`https://www.linkedin.com/in/${engager.public_identifier}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-semibold text-gray-900 hover:underline truncate"
                        >
                            {engager.name}
                        </a>
                        <span
                            className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold cursor-help"
                            style={{ background: relationship.bg, color: relationship.fg }}
                            title={engager.relationship_note || relationship.label}
                        >
                            {relationship.label}
                        </span>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold" style={{ background: status.bg, color: status.fg }}>
                            {status.label}
                        </span>
                        {tag && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold" style={{ background: tag.bg, color: tag.fg }}>
                                <Tag className="w-2.5 h-2.5" /> {engager.linkedin_auto_tag}
                            </span>
                        )}
                    </div>
                    {engager.headline && (
                        <p className="text-[11px] text-gray-600 mt-0.5 truncate">{engager.headline}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-500 flex-wrap">
                        {engager.company && (
                            <span className="flex items-center gap-1"><Building2 className="w-2.5 h-2.5" /> {engager.company}</span>
                        )}
                        {engager.position && (
                            <span className="flex items-center gap-1"><Briefcase className="w-2.5 h-2.5" /> {engager.position}</span>
                        )}
                        {engager.location && (
                            <span className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5" /> {engager.location}</span>
                        )}
                    </div>
                </div>
                <a
                    href={`https://www.linkedin.com/in/${engager.public_identifier}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                    title="Open on LinkedIn"
                >
                    <ExternalLink className="w-3.5 h-3.5" />
                </a>
            </div>

            {/* Events row */}
            <div className="px-4 pb-3 flex items-center gap-1.5 flex-wrap">
                {engager.events.map((ev, idx) => {
                    if (ev.event_type === 'REACTION') {
                        const reactionIcon = REACTION_ICON[ev.reaction_type ?? 'LIKE'] ?? <ThumbsUp className="w-3 h-3 text-gray-400" />;
                        return (
                            <span key={idx} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-gray-50 text-[10px] text-gray-700 font-medium">
                                {reactionIcon}
                                {ev.reaction_type ?? 'LIKE'}
                                <span className="text-gray-400">· {relativeTime(ev.occurred_at)}</span>
                            </span>
                        );
                    }
                    const ic = ev.event_type === 'COMMENT' ? <MessageCircle className="w-3 h-3 text-blue-500" />
                             : <Repeat2 className="w-3 h-3 text-emerald-500" />;
                    return (
                        <span key={idx} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-gray-50 text-[10px] text-gray-700 font-medium">
                            {ic}
                            {ev.event_type}
                            <span className="text-gray-400">· {relativeTime(ev.occurred_at)}</span>
                        </span>
                    );
                })}
            </div>

            {/* Signal strip */}
            <div className="px-4 py-2.5 flex items-center justify-between gap-2 text-[10px]" style={{ borderTop: '1px solid #E8E3DC', background: '#FAFAF8' }}>
                <div className="flex items-center gap-3 text-gray-600">
                    {icpPct !== null && (
                        <span className="flex items-center gap-1" title="ICP match score">
                            <Target className="w-3 h-3 text-violet-500" />
                            <span className="tabular-nums font-semibold text-gray-900">{icpPct}%</span>
                            <span className="text-gray-400">ICP</span>
                        </span>
                    )}
                    {engager.engagement_score !== null && (
                        <span className="flex items-center gap-1" title="Recency-weighted engagement score (0-100)">
                            <TrendingUp className="w-3 h-3 text-emerald-500" />
                            <span className="tabular-nums font-semibold text-gray-900">{engager.engagement_score.toFixed(0)}</span>
                            <span className="text-gray-400">score</span>
                        </span>
                    )}
                    {engager.engagement_count_30d > 0 && (
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gray-500" />
                            <span className="tabular-nums">{engager.engagement_count_30d}</span>
                            <span className="text-gray-400">in 30d</span>
                        </span>
                    )}
                </div>
                {engager.lead_id && (
                    <Link
                        href={`/dashboard/leads?focus=${engager.lead_id}`}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold text-blue-700 hover:bg-blue-50 no-underline"
                    >
                        <Linkedin className="w-2.5 h-2.5" /> Open lead
                    </Link>
                )}
            </div>
        </article>
    );
}

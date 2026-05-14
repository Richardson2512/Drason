'use client';

/**
 * Watchlist detail — header + stats + matches table.
 *
 * Manual review surface: every match landed by the scanner appears here
 * with the engager's profile and the post context. Operators can push a
 * match into a LinkedIn campaign one click at a time (or skip it).
 * Auto-push watchlists still surface the audit trail here so the
 * operator can sanity-check what got enrolled.
 */

import { useEffect, useState, useCallback, use } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Hash, Loader2, Play, Pause, Trash2, AlertTriangle,
    Radar, ExternalLink, ThumbsUp, MessageCircle, Send, Sparkles,
    CheckCircle2, X, Building2, Briefcase, Target,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api';

interface WatchlistDetail {
    id: string;
    name: string;
    keywords: string[];
    icp_profile_id: string | null;
    excluded_profile_slugs: string[];
    excluded_company_terms: string[];
    min_reaction_count: number;
    daily_signal_budget: number;
    routing_mode: 'manual_review' | 'auto_push';
    target_campaign_id: string | null;
    enabled: boolean;
    last_run_at: string | null;
    last_run_summary: {
        keywords_searched?: number;
        posts_examined?: number;
        posts_skipped_low_engagement?: number;
        engagers_hydrated?: number;
        engagers_skipped_excluded?: number;
        engagers_skipped_icp?: number;
        matches_recorded?: number;
        matches_auto_pushed?: number;
        stopped_reason?: string;
    } | null;
    _stats: { by_status: Record<string, number>; total: number };
}

interface MatchRow {
    id: string;
    matched_keyword: string;
    source_post_unipile_id: string;
    source_post_url: string | null;
    source_post_preview: string | null;
    engager_profile_id: string;
    engagement_type: string;
    reaction_type: string | null;
    comment_text: string | null;
    status: string;
    pushed_campaign_id: string | null;
    pushed_at: string | null;
    created_at: string;
    engager: {
        id: string;
        name: string;
        public_identifier: string;
        headline: string | null;
        company: string | null;
        position: string | null;
        icp_match_score: number | null;
        lead_id: string | null;
    } | null;
}

const STATUS_META: Record<string, { label: string; bg: string; fg: string }> = {
    pending_review: { label: 'Pending', bg: '#FEF3C7', fg: '#92400E' },
    pushed:         { label: 'Pushed',  bg: '#DCFCE7', fg: '#15803D' },
    skipped_icp:    { label: 'Skipped (ICP miss)', bg: '#F3F4F6', fg: '#6B7280' },
    skipped_dup:    { label: 'Skipped (dup)', bg: '#F3F4F6', fg: '#6B7280' },
    manual_skipped: { label: 'Dismissed', bg: '#FEE2E2', fg: '#B91C1C' },
};

export default function WatchlistDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [data, setData] = useState<WatchlistDetail | null>(null);
    const [matches, setMatches] = useState<MatchRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [running, setRunning] = useState(false);
    const [working, setWorking] = useState<string | null>(null); // match id being acted on

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [d, ms] = await Promise.all([
                apiClient<WatchlistDetail>(`/api/linkedin/watchlists/${id}`),
                apiClient<MatchRow[]>(`/api/linkedin/watchlists/${id}/matches${statusFilter ? `?status=${statusFilter}` : ''}`),
            ]);
            setData(d);
            setMatches(Array.isArray(ms) ? ms : []);
        } catch (err: any) {
            toast.error(err?.message || 'Failed to load watchlist');
        } finally {
            setLoading(false);
        }
    }, [id, statusFilter]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const runNow = async () => {
        setRunning(true);
        try {
            // Async-queue semantics: server sets next_run_at=now and returns
            // 202. The watchlist runner worker picks it up within ~5 min;
            // we surface that wait time honestly rather than spinning a
            // long-lived request that gets killed by proxies.
            const resp = await apiClient<{ status: string; message?: string }>(
                `/api/linkedin/watchlists/${id}/run-now`,
                { method: 'POST' },
            );
            toast.success(resp?.message || 'Scan queued — refresh in a few minutes to see new matches.');
            await fetchAll();

            // Snapshot the current last_run_at so the auto-poll loop
            // below can detect when the worker actually ran (last_run_at
            // moves forward). Polls every 15s for up to 6 minutes —
            // covers the runner's 5-min tick plus a little headroom.
            const startedLastRunAt = data?.last_run_at ?? null;
            const deadline = Date.now() + 6 * 60 * 1000;
            const pollInterval = setInterval(async () => {
                if (Date.now() > deadline) {
                    clearInterval(pollInterval);
                    return;
                }
                try {
                    const fresh = await apiClient<{ data: { last_run_at: string | null; last_run_summary: unknown } }>(
                        `/api/linkedin/watchlists/${id}`,
                    );
                    const newLastRunAt = fresh?.data?.last_run_at ?? null;
                    if (newLastRunAt && newLastRunAt !== startedLastRunAt) {
                        clearInterval(pollInterval);
                        toast.success('Scan complete — refreshing matches.');
                        void fetchAll();
                    }
                } catch {
                    // ignore transient failures — the next tick retries
                }
            }, 15_000);
        } catch (err: any) {
            toast.error(err?.message || 'Failed to queue scan');
        } finally {
            setRunning(false);
        }
    };

    const pushMatch = async (matchId: string) => {
        if (!data?.target_campaign_id && data?.routing_mode !== 'auto_push') {
            // No default campaign — could prompt for campaign id, but for v1 require it on the watchlist.
            toast.error('No target campaign on this watchlist. Set one in settings or use auto-push.');
            return;
        }
        setWorking(matchId);
        try {
            await apiClient(`/api/linkedin/watchlists/${id}/matches/${matchId}/push`, { method: 'POST' });
            toast.success('Engager pushed to campaign');
            await fetchAll();
        } catch (err: any) {
            toast.error(err?.message || 'Push failed');
        } finally {
            setWorking(null);
        }
    };

    const skipMatch = async (matchId: string) => {
        setWorking(matchId);
        try {
            await apiClient(`/api/linkedin/watchlists/${id}/matches/${matchId}/skip`, { method: 'POST' });
            await fetchAll();
        } catch (err: any) {
            toast.error(err?.message || 'Skip failed');
        } finally {
            setWorking(null);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Delete this watchlist? Matches stay in the audit log but no new scans will run.')) return;
        try {
            await apiClient(`/api/linkedin/watchlists/${id}`, { method: 'DELETE' });
            toast.success('Watchlist deleted');
            window.location.href = '/dashboard/linkedin/signals/watchlists';
        } catch (err: any) {
            toast.error(err?.message || 'Delete failed');
        }
    };

    if (loading) {
        return (
            <div className="p-4 flex items-center justify-center min-h-[60vh]">
                <Loader2 size={20} className="animate-spin text-gray-400" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] gap-2">
                <p className="text-sm text-rose-600">Watchlist not found</p>
                <Link href="/dashboard/linkedin/signals/watchlists" className="text-xs text-gray-600 underline">← Back</Link>
            </div>
        );
    }

    const stats = data._stats?.by_status ?? {};

    return (
        <div className="p-4 flex flex-col gap-4">
            <div>
                <Link
                    href="/dashboard/linkedin/signals/watchlists"
                    className="inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-900 mb-2 no-underline"
                >
                    <ArrowLeft size={11} /> Watchlists
                </Link>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Radar size={18} strokeWidth={1.75} className="text-[#0A66C2]" /> {data.name}
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider" style={{ background: data.enabled ? '#DCFCE7' : '#F3F4F6', color: data.enabled ? '#15803D' : '#6B7280' }}>
                                {data.enabled ? 'Active' : 'Disabled'}
                            </span>
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: data.routing_mode === 'auto_push' ? '#EFF6FF' : '#F3F4F6', color: data.routing_mode === 'auto_push' ? '#1D4ED8' : '#374151' }}>
                                {data.routing_mode === 'auto_push' ? 'Auto-push' : 'Manual review'}
                            </span>
                        </h1>
                        <p className="text-xs text-gray-500 mt-1">
                            Min {data.min_reaction_count} reactions · Budget {data.daily_signal_budget}/day · Last scan {data.last_run_at ? new Date(data.last_run_at).toLocaleString() : 'never'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={runNow}
                            disabled={running || !data.enabled}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gray-900 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                        >
                            {running ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                            {running ? 'Queuing…' : 'Scan now'}
                        </button>
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-red-600 text-xs font-semibold cursor-pointer hover:bg-red-50"
                            style={{ border: '1px solid #FCA5A5' }}
                        >
                            <Trash2 size={12} /> Delete
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <StatTile label="Total matches"    value={data._stats?.total ?? 0} />
                <StatTile label="Pending review"   value={stats.pending_review ?? 0} accent="#B45309" />
                <StatTile label="Pushed"           value={stats.pushed ?? 0}         accent="#15803D" />
                <StatTile label="Skipped (ICP)"    value={stats.skipped_icp ?? 0} />
                <StatTile label="Dismissed"        value={stats.manual_skipped ?? 0} />
            </div>

            {/* Last-run summary */}
            {data.last_run_summary && (
                <div className="premium-card !py-2 text-[11px] text-gray-600">
                    <strong>Last scan:</strong>
                    {' '}{data.last_run_summary.keywords_searched ?? 0} keywords · {data.last_run_summary.posts_examined ?? 0} posts examined ·
                    {' '}{data.last_run_summary.posts_skipped_low_engagement ?? 0} below threshold ·
                    {' '}{data.last_run_summary.engagers_hydrated ?? 0} engagers hydrated ·
                    {' '}{data.last_run_summary.matches_recorded ?? 0} matches recorded
                    {data.last_run_summary.stopped_reason && <> · stopped: <em>{data.last_run_summary.stopped_reason.replace(/_/g, ' ')}</em></>}
                </div>
            )}

            {/* Keyword chips */}
            <div className="premium-card !py-2.5">
                <div className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 mb-1.5">Keywords ({data.keywords.length})</div>
                <div className="flex flex-wrap gap-1.5">
                    {data.keywords.map(k => (
                        <span key={k} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-800">
                            <Hash size={10} /> {k}
                        </span>
                    ))}
                </div>
            </div>

            {/* Filter chips + matches table */}
            <div className="premium-card flex items-center gap-2 flex-wrap !py-2">
                {['', 'pending_review', 'pushed', 'skipped_icp', 'manual_skipped'].map(s => (
                    <button
                        key={s || 'all'}
                        onClick={() => setStatusFilter(s)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer ${statusFilter === s ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                        style={{ border: '1px solid #D1CBC5' }}
                    >
                        {s === '' ? 'All' : STATUS_META[s]?.label ?? s}
                    </button>
                ))}
            </div>

            {matches.length === 0 ? (
                <div className="premium-card flex flex-col items-center justify-center py-10 text-center">
                    <Sparkles size={24} className="text-gray-300 mb-2" />
                    <p className="text-sm font-semibold text-gray-900 mb-1">No matches yet</p>
                    <p className="text-xs text-gray-500 max-w-md">Hit "Scan now" to run an immediate check, or wait for the next cycle.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {matches.map(m => {
                        const meta = STATUS_META[m.status] ?? { label: m.status, bg: '#F3F4F6', fg: '#374151' };
                        const isPending = m.status === 'pending_review';
                        return (
                            <div key={m.id} className="premium-card flex items-start gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-[11px] font-bold text-gray-700 shrink-0">
                                    {(m.engager?.name ?? '?').split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <a
                                            href={`https://www.linkedin.com/in/${m.engager?.public_identifier ?? ''}`}
                                            target="_blank" rel="noopener noreferrer"
                                            className="text-sm font-semibold text-gray-900 hover:underline"
                                        >
                                            {m.engager?.name ?? '(unknown)'}
                                        </a>
                                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: meta.bg, color: meta.fg }}>
                                            {meta.label}
                                        </span>
                                        <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                            {m.engagement_type === 'COMMENT' ? <><MessageCircle size={10} /> commented</>
                                              : m.engagement_type === 'REACTION' ? <><ThumbsUp size={10} /> {m.reaction_type?.toLowerCase() ?? 'reacted'}</>
                                              : <><Send size={10} /> {m.engagement_type.toLowerCase()}</>}
                                            <span className="text-gray-400">· keyword "{m.matched_keyword}"</span>
                                        </span>
                                        {m.engager?.icp_match_score != null && m.engager.icp_match_score >= 0.7 && (
                                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 flex items-center gap-1">
                                                <Target size={9} /> ICP {Math.round(m.engager.icp_match_score * 100)}%
                                            </span>
                                        )}
                                    </div>
                                    {m.engager?.headline && (
                                        <p className="text-[11px] text-gray-600 mt-0.5">{m.engager.headline}</p>
                                    )}
                                    <div className="flex items-center gap-3 mt-0.5 text-[10px] text-gray-500">
                                        {m.engager?.company && <span className="flex items-center gap-1"><Building2 size={9} /> {m.engager.company}</span>}
                                        {m.engager?.position && <span className="flex items-center gap-1"><Briefcase size={9} /> {m.engager.position}</span>}
                                    </div>
                                    {(m.comment_text || m.source_post_preview) && (
                                        <div
                                            className="mt-2 rounded-md p-2 text-[11px] leading-relaxed"
                                            style={{ background: '#FAFAF8', border: '1px solid #F0EBE3' }}
                                        >
                                            {m.comment_text ? (
                                                <><strong className="text-gray-700">Comment:</strong> <span className="text-gray-700">{m.comment_text}</span></>
                                            ) : (
                                                <><strong className="text-gray-700">Post:</strong> <span className="text-gray-600">{m.source_post_preview}</span></>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    {m.source_post_url && (
                                        <a
                                            href={m.source_post_url}
                                            target="_blank" rel="noopener noreferrer"
                                            className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                                            title="Open post on LinkedIn"
                                        >
                                            <ExternalLink size={12} />
                                        </a>
                                    )}
                                    {isPending && (
                                        <>
                                            <button
                                                onClick={() => pushMatch(m.id)}
                                                disabled={working === m.id || !data.target_campaign_id}
                                                title={!data.target_campaign_id ? 'Set a target campaign on this watchlist first' : 'Push to campaign'}
                                                className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-600 text-white text-[10px] font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {working === m.id ? <Loader2 size={10} className="animate-spin" /> : <CheckCircle2 size={10} />}
                                                Push
                                            </button>
                                            <button
                                                onClick={() => skipMatch(m.id)}
                                                disabled={working === m.id}
                                                className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold text-gray-500 hover:text-gray-900 cursor-pointer bg-white"
                                                style={{ border: '1px solid #E8E3DC' }}
                                            >
                                                <X size={10} /> Skip
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function StatTile({ label, value, accent }: { label: string; value: number; accent?: string }) {
    return (
        <div className="premium-card !p-2.5">
            <div className="text-[10px] font-semibold text-gray-500">{label}</div>
            <div className="text-lg font-bold tabular-nums mt-0.5" style={{ color: accent ?? '#111827' }}>{value.toLocaleString()}</div>
        </div>
    );
}

'use client';

/**
 * Topics watchlists list - entry point under /dashboard/linkedin/signals.
 *
 * Lemlist-style signal monitoring: each watchlist watches LinkedIn for
 * posts matching configured keywords, hydrates engagers, ICP-filters,
 * and routes into a LinkedIn campaign (auto or manual review).
 *
 * Zero incremental vendor cost - uses our existing flat Unipile plan.
 * Per-watchlist daily-budget + min-reactions threshold keep us inside
 * LinkedIn's 100/day per-account action ceiling.
 */

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Plus, Radar, Play, Pause, MoreHorizontal, Loader2,
    Hash, Users, Rocket, Target, AlertTriangle, ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api';

interface Watchlist {
    id: string;
    name: string;
    keywords: string[];
    icp_profile_id: string | null;
    daily_signal_budget: number;
    min_reaction_count: number;
    routing_mode: 'manual_review' | 'auto_push';
    target_campaign_id: string | null;
    enabled: boolean;
    last_run_at: string | null;
    last_run_summary: { matches_recorded?: number; matches_auto_pushed?: number; stopped_reason?: string } | null;
    created_at: string;
}

function relativeTime(iso: string | null): string {
    if (!iso) return 'never';
    const ms = Date.now() - new Date(iso).getTime();
    const min = Math.floor(ms / 60_000);
    if (min < 1) return 'just now';
    if (min < 60) return `${min}m ago`;
    const h = Math.floor(min / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
}

export default function LinkedInWatchlistsPage() {
    const [rows, setRows] = useState<Watchlist[]>([]);
    const [loading, setLoading] = useState(true);
    const [runningId, setRunningId] = useState<string | null>(null);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiClient<Watchlist[]>('/api/linkedin/watchlists');
            setRows(Array.isArray(data) ? data : []);
        } catch (err: any) {
            toast.error(err?.message || 'Failed to load watchlists');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const runNow = async (id: string) => {
        setRunningId(id);
        try {
            const summary = await apiClient<{ matches_recorded: number; matches_auto_pushed: number; stopped_reason?: string }>(
                `/api/linkedin/watchlists/${id}/run-now`,
                { method: 'POST' },
            );
            const msg = summary.matches_recorded > 0
                ? `${summary.matches_recorded} match${summary.matches_recorded === 1 ? '' : 'es'} found${summary.matches_auto_pushed > 0 ? ` · ${summary.matches_auto_pushed} pushed` : ''}`
                : (summary.stopped_reason ? `No new matches (${summary.stopped_reason.replace(/_/g, ' ')})` : 'No new matches');
            toast.success(msg);
            await fetchAll();
        } catch (err: any) {
            toast.error(err?.message || 'Scan failed');
        } finally {
            setRunningId(null);
        }
    };

    const toggleEnabled = async (id: string, enabled: boolean) => {
        try {
            await apiClient(`/api/linkedin/watchlists/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ enabled }),
            });
            await fetchAll();
        } catch (err: any) {
            toast.error(err?.message || 'Toggle failed');
        }
    };

    return (
        <div className="p-4 flex flex-col gap-4">
            <div>
                <Link
                    href="/dashboard/linkedin/signals"
                    className="inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-900 mb-2 no-underline"
                >
                    <ArrowLeft size={11} /> Signals
                </Link>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Radar size={18} strokeWidth={1.75} className="text-[#0A66C2]" /> Topics watchlists
                        </h1>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Watch LinkedIn for posts matching keywords you care about, ICP-filter the engagers, and route into a LinkedIn campaign. Uses your existing Unipile plan - no per-signal charges.
                        </p>
                    </div>
                    <Link
                        href="/dashboard/linkedin/signals/watchlists/new"
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg cursor-pointer hover:bg-gray-800 transition-colors no-underline"
                    >
                        <Plus size={14} /> New watchlist
                    </Link>
                </div>
            </div>

            {/* Rate-limit banner - always visible so operators understand the constraints */}
            <div
                className="rounded-lg p-3 flex items-start gap-3"
                style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}
            >
                <AlertTriangle size={14} className="text-amber-700 mt-0.5 shrink-0" />
                <div className="text-[11px] text-amber-900 leading-relaxed">
                    <strong>Why the conservative defaults?</strong> LinkedIn caps automated actions at ~100/day per connected account. Each watchlist runs 1 search call per keyword + 2 hydration calls per high-engagement post.
                    A watchlist with 5 keywords + 5-account workspace can comfortably scan 30 high-engagement posts/day. Push higher and your accounts risk a LinkedIn restriction.
                </div>
            </div>

            {loading ? (
                <div className="premium-card flex items-center justify-center py-12 text-xs text-gray-500">
                    <Loader2 size={14} className="animate-spin mr-2" /> Loading watchlists…
                </div>
            ) : rows.length === 0 ? (
                <div className="premium-card flex flex-col items-center justify-center py-12 text-center">
                    <Radar size={28} className="text-gray-300 mb-2" />
                    <p className="text-sm font-semibold text-gray-900 mb-1">No watchlists yet</p>
                    <p className="text-xs text-gray-500 max-w-md mb-4">
                        Create one to start monitoring LinkedIn for posts about topics relevant to your business. Engagers who match your ICP are surfaced for review or pushed straight to a campaign.
                    </p>
                    <Link
                        href="/dashboard/linkedin/signals/watchlists/new"
                        className="px-3 py-1.5 rounded-md bg-gray-900 text-white text-xs font-semibold no-underline"
                    >
                        Create your first watchlist
                    </Link>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {rows.map(w => (
                        <Link
                            key={w.id}
                            href={`/dashboard/linkedin/signals/watchlists/${w.id}`}
                            className="premium-card flex items-center gap-3 hover:bg-[#FAFAF8] cursor-pointer no-underline transition-colors"
                        >
                            <div
                                className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
                                style={{ background: w.enabled ? '#DBEAFE' : '#F3F4F6', color: w.enabled ? '#1D4ED8' : '#6B7280' }}
                            >
                                <Hash size={14} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-bold text-gray-900">{w.name}</span>
                                    {!w.enabled && <span className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">Disabled</span>}
                                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: w.routing_mode === 'auto_push' ? '#DCFCE7' : '#F3F4F6', color: w.routing_mode === 'auto_push' ? '#15803D' : '#374151' }}>
                                        {w.routing_mode === 'auto_push' ? 'Auto-push' : 'Manual review'}
                                    </span>
                                </div>
                                <div className="text-[11px] text-gray-500 mt-0.5 truncate">
                                    {w.keywords.slice(0, 3).map(k => `"${k}"`).join(', ')}{w.keywords.length > 3 && ` · +${w.keywords.length - 3} more`}
                                </div>
                                <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-500">
                                    <span className="flex items-center gap-1"><Target size={9} /> min {w.min_reaction_count} reactions</span>
                                    <span className="flex items-center gap-1"><Users size={9} /> budget {w.daily_signal_budget}/day</span>
                                    <span>Last scan {relativeTime(w.last_run_at)}</span>
                                    {w.last_run_summary?.matches_recorded != null && (
                                        <span className="text-emerald-700 font-semibold">
                                            · {w.last_run_summary.matches_recorded} matches
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={(e) => { e.preventDefault(); runNow(w.id); }}
                                disabled={runningId === w.id || !w.enabled}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-semibold cursor-pointer bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ border: '1px solid #D1CBC5' }}
                                title="Scan now"
                            >
                                {runningId === w.id ? <Loader2 size={11} className="animate-spin" /> : <Play size={11} />}
                                Scan
                            </button>
                            <button
                                onClick={(e) => { e.preventDefault(); toggleEnabled(w.id, !w.enabled); }}
                                className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 cursor-pointer bg-transparent border-none"
                                title={w.enabled ? 'Disable' : 'Enable'}
                            >
                                {w.enabled ? <Pause size={12} /> : <Play size={12} />}
                            </button>
                            <ChevronRight size={12} className="text-gray-300 shrink-0" />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

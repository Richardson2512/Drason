'use client';

import { useEffect, useState } from 'react';
import { Gauge, AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';

/**
 * Forward-looking projection of how many emails the org CAN send over the
 * next 7 days. The hero stat is the weekly capacity total — that's the
 * forecast number the user is asking the page about. Today's used quota
 * is a small footer detail, not the headline.
 *
 * All stats sourced from `/api/sequencer/analytics/forecast`:
 *
 *   today_remaining       = sum(daily_send_limit - sends_today) for eligible mailboxes
 *   daily_capacity        = sum(daily_send_limit) for eligible mailboxes
 *   weekly_capacity       = today_remaining + (daily_capacity * 6)
 *                          (today already accounts for what's been used; future
 *                           days reset overnight at midnight per provider rules)
 *   eligible_mailboxes    = active connection + Protection-layer NOT IN
 *                           {paused, quarantine, restricted_send}
 *   excluded_mailboxes    = active connection but Protection-excluded
 *   bottleneck_mailboxes  = top 3 by daily_send_limit, with % of total each contributes
 *   projection            = 7-day array; day 0 carries today_remaining
 */

interface ForecastResponse {
    today_remaining: number;
    daily_capacity: number;
    weekly_capacity: number;
    eligible_mailboxes: number;
    excluded_mailboxes: number;
    projection: { date: string; capacity: number; isToday: boolean }[];
    bottleneck_mailboxes: {
        id: string;
        email: string;
        daily_send_limit: number;
        sends_today: number;
        percent_of_total: number;
    }[];
}

export default function SendVolumeForecast() {
    const [data, setData] = useState<ForecastResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient<ForecastResponse>('/api/sequencer/analytics/forecast')
            .then(setData)
            .catch(() => setData(null))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="premium-card p-4">
                <div className="text-xs text-gray-400">Loading capacity…</div>
            </div>
        );
    }
    if (!data) {
        return (
            <div className="premium-card p-4">
                <div className="text-xs text-gray-400">Couldn&apos;t load capacity forecast</div>
            </div>
        );
    }

    // Headline = projected total over the 7-day window. Day 0 carries today's
    // remaining quota; days 1–6 carry the full daily_capacity (post-midnight reset).
    const projectionTotal = data.projection.reduce((sum, p) => sum + p.capacity, 0);

    return (
        <div className="premium-card p-4 flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                    <Gauge size={14} strokeWidth={1.75} className="text-gray-700" />
                    <h2 className="text-sm font-semibold text-gray-900 m-0">Capacity ahead</h2>
                    <span className="text-xs text-gray-400">next 7 days · projection</span>
                </div>
                {data.excluded_mailboxes > 0 && (
                    <Link
                        href="/dashboard/sequencer/accounts"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-700 px-2 py-0.5 rounded-md bg-gray-50 border border-gray-200 hover:bg-gray-100 cursor-pointer no-underline"
                    >
                        <AlertTriangle size={10} className="text-amber-500" />
                        {data.excluded_mailboxes} mailbox{data.excluded_mailboxes === 1 ? '' : 'es'} excluded
                        <ArrowRight size={10} />
                    </Link>
                )}
            </div>

            {/* Hero — 7-day total */}
            <div>
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gray-900 tabular-nums">{projectionTotal.toLocaleString()}</span>
                    <span className="text-sm text-gray-500">emails over the next 7 days</span>
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                    Across {data.eligible_mailboxes} eligible mailbox{data.eligible_mailboxes === 1 ? '' : 'es'}
                    {' · '}
                    {data.daily_capacity.toLocaleString()}/day average
                </div>
            </div>

            {/* 7-day chart — the hero visual */}
            {(() => {
                const max = Math.max(...data.projection.map((p) => p.capacity), 1);
                return (
                    <div className="grid grid-cols-7 gap-2">
                        {data.projection.map((p) => {
                            const heightPct = Math.max((p.capacity / max) * 100, p.capacity > 0 ? 8 : 0);
                            const isToday = p.isToday;
                            return (
                                <div key={p.date} className="flex flex-col items-center gap-1.5">
                                    <div
                                        className={`text-[10px] tabular-nums font-semibold ${isToday ? 'text-amber-700' : 'text-gray-700'}`}
                                    >
                                        {p.capacity.toLocaleString()}
                                    </div>
                                    <div className="w-full h-24 flex items-end">
                                        <div
                                            className="w-full rounded-md transition-opacity hover:opacity-80"
                                            style={{
                                                height: `${heightPct}%`,
                                                background: isToday ? '#F59E0B' : '#111827',
                                            }}
                                            title={`${p.date} · ${p.capacity.toLocaleString()} capacity`}
                                        />
                                    </div>
                                    <div className={`text-[10px] tabular-nums ${isToday ? 'text-amber-700 font-semibold' : 'text-gray-500'}`}>
                                        {formatDayLabel(p.date, isToday)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                );
            })()}

            {/* Bottleneck mailboxes */}
            {data.bottleneck_mailboxes.length > 0 && (
                <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                            Top capacity contributors
                        </span>
                        <span className="text-[10px] text-gray-400">% of daily total</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        {data.bottleneck_mailboxes.map((m) => (
                            <div key={m.id} className="flex items-center gap-3">
                                <div className="text-xs text-gray-700 font-medium truncate flex-1 min-w-0">{m.email}</div>
                                <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden max-w-[140px]">
                                    <div
                                        className="h-full bg-gray-700 rounded-full"
                                        style={{ width: `${m.percent_of_total}%` }}
                                    />
                                </div>
                                <div className="text-[11px] text-gray-500 tabular-nums w-16 text-right">
                                    {m.daily_send_limit.toLocaleString()}/day
                                </div>
                                <div className="text-[11px] font-bold text-gray-900 tabular-nums w-10 text-right">
                                    {m.percent_of_total}%
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Today footer — small, secondary */}
            <div className="text-[11px] text-gray-400 italic">
                Today: {data.today_remaining.toLocaleString()} of {data.daily_capacity.toLocaleString()} remaining
                {data.eligible_mailboxes === 0 && ' · No eligible mailboxes — connect or resume to start sending.'}
            </div>
        </div>
    );
}

function formatDayLabel(iso: string, isToday: boolean): string {
    if (isToday) return 'Today';
    const d = new Date(iso + 'T00:00:00Z');
    return d.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
}

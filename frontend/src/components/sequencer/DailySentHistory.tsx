'use client';

import { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { apiClient } from '@/lib/api';

/**
 * Backward-looking history of how many emails actually went out each day.
 * Source: `SendEvent` (one row per delivered message). Distinct from the
 * forward-looking SendCapacityForecast — this shows what was, not what could be.
 */

type Range = '7d' | '14d' | '30d' | '90d';

interface VolumeResponse {
    points: { date: string; count: number }[];
    total: number;
    daily_average: number;
    peak_day: { date: string; count: number } | null;
    range_start: string;
    range_end: string;
}

const RANGES: { key: Range; label: string }[] = [
    { key: '7d', label: '7 days' },
    { key: '14d', label: '14 days' },
    { key: '30d', label: '30 days' },
    { key: '90d', label: '90 days' },
];

export default function DailySentHistory() {
    const [range, setRange] = useState<Range>('30d');
    const [data, setData] = useState<VolumeResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        apiClient<VolumeResponse>(`/api/sequencer/analytics/volume?range=${range}`)
            .then(setData)
            .catch(() => setData(null))
            .finally(() => setLoading(false));
    }, [range]);

    return (
        <div className="premium-card p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                    <TrendingUp size={14} strokeWidth={1.75} className="text-gray-700" />
                    <h2 className="text-sm font-semibold text-gray-900 m-0">Sent per day</h2>
                    <span className="text-xs text-gray-400">historical</span>
                </div>
                <div className="flex items-center gap-1">
                    {RANGES.map((r) => (
                        <button
                            key={r.key}
                            onClick={() => setRange(r.key)}
                            className="px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-colors"
                            style={{
                                background: range === r.key ? '#111827' : '#F3F4F6',
                                color: range === r.key ? '#FFFFFF' : '#4B5563',
                                border: '1px solid',
                                borderColor: range === r.key ? '#111827' : '#E5E7EB',
                            }}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading && <div className="h-32 flex items-center justify-center text-xs text-gray-400">Loading…</div>}

            {!loading && data && (() => {
                // Hoist optional-chain reads out of JSX — Turbopack sometimes mis-
                // transpiles `data.peak_day?.count ?? 0` inline as a JSX prop
                // expression, throwing "_ref is not defined" at runtime.
                const peakCount = data.peak_day ? data.peak_day.count : 0;
                const peakDateLabel = data.peak_day ? formatShortDate(data.peak_day.date) : '—';
                return (
                    <>
                        {/* Three top-line stats */}
                        <div className="grid grid-cols-3 gap-3">
                            <Stat label="Total sent" value={data.total} />
                            <Stat label="Daily average" value={data.daily_average} />
                            <Stat
                                label="Peak day"
                                value={peakCount}
                                sub={peakDateLabel}
                            />
                        </div>

                    {/* Bar chart */}
                    <div className="flex items-end gap-px h-32 px-1 pt-2 pb-3 rounded-lg bg-gray-50/40 border border-gray-100">
                        {(() => {
                            const max = Math.max(...data.points.map((p) => p.count), 1);
                            return data.points.map((p) => {
                                const heightPct = (p.count / max) * 100;
                                return (
                                    <div
                                        key={p.date}
                                        className="flex-1 min-w-[3px] flex items-end justify-center group relative"
                                        title={`${p.date} · ${p.count.toLocaleString()} sent`}
                                    >
                                        <div
                                            className="w-full bg-gray-900 rounded-t-sm transition-opacity group-hover:opacity-80"
                                            style={{ height: `${Math.max(heightPct, p.count > 0 ? 2 : 0)}%`, minHeight: p.count > 0 ? 2 : 0 }}
                                        />
                                    </div>
                                );
                            });
                        })()}
                    </div>

                        {/* Axis labels — start, middle, end */}
                        {data.points.length > 1 && (
                            <div className="flex items-center justify-between text-[10px] text-gray-400 px-1 -mt-2 tabular-nums">
                                <span>{formatShortDate(data.points[0].date)}</span>
                                <span>{formatShortDate(data.points[Math.floor(data.points.length / 2)].date)}</span>
                                <span>{formatShortDate(data.points[data.points.length - 1].date)}</span>
                            </div>
                        )}
                    </>
                );
            })()}

            {!loading && !data && (
                <div className="h-32 flex items-center justify-center">
                    <p className="text-xs text-gray-400">Couldn&apos;t load send history</p>
                </div>
            )}

            {!loading && data && data.total === 0 && (
                <p className="text-[11px] text-gray-400 italic">
                    No sends recorded in this window. Once campaigns start dispatching, daily counts will populate here.
                </p>
            )}
        </div>
    );
}

function Stat({ label, value, sub }: { label: string; value: number; sub?: string }) {
    return (
        <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">{label}</div>
            <div className="text-2xl font-bold text-gray-900 tabular-nums">{value.toLocaleString()}</div>
            {sub && <div className="text-[10px] text-gray-400 mt-0.5">{sub}</div>}
        </div>
    );
}

function formatShortDate(iso: string): string {
    const d = new Date(iso + 'T00:00:00Z');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

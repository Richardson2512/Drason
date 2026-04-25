'use client';

/**
 * ReplyQualityPanel — Sequencer Analytics → Reply Quality tab.
 *
 * Three sections, all driven by GET /api/sequencer/analytics/reply-quality:
 *   1. Class breakdown — donut + count list of all 9 classes
 *   2. What works    — top 10 outbound subjects by % positive replies
 *   3. What hurts    — top 10 outbound subjects by % hard-no / angry replies
 *   4. Drill-down    — click a class chip to see 5 example replies with
 *                      their classification signals (audit trail)
 *
 * No charting library — the donut is a custom SVG. Keeps the page free of
 * a recharts dependency for one chart, and the donut already aligns with
 * the dashboard's monochrome aesthetic.
 */

import { useEffect, useState, useMemo } from 'react';
import { apiClient } from '@/lib/api';
import { Loader2, Heart, ThumbsUp, MessageCircleQuestion, Users, Hourglass, X, AngryIcon, Clock4, HelpCircle, Flame, ArrowUpRight, ArrowDownRight, ChevronRight } from 'lucide-react';

// ────────────────────────────────────────────────────────────────────
// Types — mirror the backend payload shape
// ────────────────────────────────────────────────────────────────────

type ReplyClass =
    | 'positive' | 'qualified' | 'objection' | 'referral'
    | 'soft_no' | 'hard_no' | 'angry' | 'auto' | 'unclassified';

interface SubjectCorrelation {
    subject: string;
    total_replies: number;
    class_counts: Record<string, number>;
    positive_rate: number;
    negative_rate: number;
    soft_no_rate: number;
    objection_rate: number;
}

interface ReplySample {
    id: string;
    subject: string;
    from_email: string;
    snippet: string;
    confidence: 'high' | 'medium' | 'low';
    signals: string[];
    received_at: string;
}

interface ReplyQualityResponse {
    success: boolean;
    data?: {
        window_days: number;
        total_replies: number;
        breakdown: Record<ReplyClass, number>;
        what_works: SubjectCorrelation[];
        what_hurts: SubjectCorrelation[];
        samples: Record<ReplyClass, ReplySample[]>;
    };
    error?: string;
}

// ────────────────────────────────────────────────────────────────────
// Class metadata — keep in sync with backend REPLY_CLASSES
// ────────────────────────────────────────────────────────────────────

const CLASS_META: Record<ReplyClass, { label: string; color: string; icon: React.ComponentType<any>; description: string }> = {
    positive:     { label: 'Positive',     color: '#10B981', icon: Heart,                  description: 'Clearly interested — "yes let\'s chat", "send me more"' },
    qualified:    { label: 'Qualified',    color: '#059669', icon: ThumbsUp,               description: 'Booking-intent — calendar links, explicit "let\'s schedule"' },
    objection:    { label: 'Objection',    color: '#3B82F6', icon: MessageCircleQuestion,  description: 'Questions about pricing, integrations, security, fit' },
    referral:     { label: 'Referral',     color: '#8B5CF6', icon: Users,                  description: '"Talk to Sarah, she handles this" — points to a colleague' },
    soft_no:      { label: 'Soft no',      color: '#F59E0B', icon: Clock4,                 description: '"Not now, ping me in Q3" — bad timing or already using a competitor' },
    hard_no:      { label: 'Hard no',      color: '#EF4444', icon: X,                      description: 'Firm refusal — "remove me", "not interested", "we\'re set"' },
    angry:        { label: 'Angry',        color: '#991B1B', icon: Flame,                  description: 'Hostile or profane reply — needs immediate operator review' },
    auto:         { label: 'Auto-reply',   color: '#94A3B8', icon: Hourglass,              description: 'Out-of-office, vacation, autoresponder' },
    unclassified: { label: 'Unclassified', color: '#9CA3AF', icon: HelpCircle,             description: 'Rules couldn\'t place this with confidence' },
};

const CLASS_ORDER: ReplyClass[] = [
    'positive', 'qualified', 'objection', 'referral',
    'soft_no', 'hard_no', 'angry', 'auto', 'unclassified',
];

// ────────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────────

export default function ReplyQualityPanel({ days }: { days: number }) {
    const [data, setData] = useState<ReplyQualityResponse['data'] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [drillIntoClass, setDrillIntoClass] = useState<ReplyClass | null>(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        (async () => {
            try {
                const res = await apiClient<ReplyQualityResponse>(`/api/sequencer/analytics/reply-quality?days=${days}`);
                if (cancelled) return;
                // apiClient may unwrap success+data shapes inconsistently across the codebase;
                // accept either the inner data object or the full response.
                const payload = (res as any)?.data?.breakdown ? (res as any).data : (res as any);
                if (payload && payload.breakdown) setData(payload);
                else setError('Unexpected response shape');
            } catch (e: any) {
                if (!cancelled) setError(e?.message || 'Failed to load reply quality');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [days]);

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-sm text-gray-500 p-6">
                <Loader2 size={14} className="animate-spin" /> Loading reply quality…
            </div>
        );
    }
    if (error) {
        return <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</div>;
    }
    if (!data || data.total_replies === 0) {
        return (
            <div className="premium-card p-8 text-center">
                <p className="text-sm font-semibold text-gray-900 mb-1">No replies yet</p>
                <p className="text-xs text-gray-500">Once leads start replying, this tab classifies them and highlights which subject lines drive positive vs. negative responses.</p>
            </div>
        );
    }

    const drillSamples = drillIntoClass ? data.samples[drillIntoClass] || [] : [];

    return (
        <div className="flex flex-col gap-4">
            {/* Top row: donut + summary */}
            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4">
                <div className="premium-card p-4">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Reply quality</h2>
                    <ReplyDonut breakdown={data.breakdown} total={data.total_replies} />
                    <p className="text-[10px] text-gray-400 mt-3">
                        {data.total_replies.toLocaleString()} replies analyzed · last {data.window_days} days
                    </p>
                </div>

                <div className="premium-card p-4">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Classes</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {CLASS_ORDER.map(cls => {
                            const meta = CLASS_META[cls];
                            const count = data.breakdown[cls] || 0;
                            const pct = data.total_replies > 0 ? Math.round((count / data.total_replies) * 100) : 0;
                            const Icon = meta.icon;
                            return (
                                <button
                                    key={cls}
                                    type="button"
                                    onClick={() => count > 0 && setDrillIntoClass(cls)}
                                    disabled={count === 0}
                                    className="text-left px-3 py-2 rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:border-gray-400 enabled:cursor-pointer"
                                    style={{ borderColor: count > 0 ? meta.color + '40' : '#E5E7EB' }}
                                    title={meta.description}
                                >
                                    <div className="flex items-center gap-1.5">
                                        <Icon size={11} style={{ color: meta.color }} />
                                        <span className="text-[10px] font-semibold text-gray-700">{meta.label}</span>
                                        {count > 0 && <ChevronRight size={10} className="text-gray-300 ml-auto" />}
                                    </div>
                                    <div className="mt-1 flex items-baseline gap-1.5">
                                        <span className="text-base font-bold text-gray-900 tabular-nums">{count}</span>
                                        <span className="text-[9px] text-gray-400">{pct}%</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* What works / what hurts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <SubjectTable
                    title="What works"
                    subtitle="Subject lines with the highest positive + qualified rate"
                    icon={<ArrowUpRight size={12} className="text-emerald-600" />}
                    rows={data.what_works}
                    rateKind="positive"
                    emptyMessage="Need at least 3 replies on a subject before it shows up here."
                />
                <SubjectTable
                    title="What hurts"
                    subtitle="Subject lines with the highest hard-no + angry rate"
                    icon={<ArrowDownRight size={12} className="text-red-600" />}
                    rows={data.what_hurts}
                    rateKind="negative"
                    emptyMessage="Nothing's drawing meaningful negative reactions yet."
                />
            </div>

            {/* Drill-down modal (samples) */}
            {drillIntoClass && (
                <DrillDownModal
                    cls={drillIntoClass}
                    samples={drillSamples}
                    onClose={() => setDrillIntoClass(null)}
                />
            )}
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────
// Subject table — used twice (works + hurts), differs only in which
// rate column it highlights.
// ────────────────────────────────────────────────────────────────────

function SubjectTable({
    title, subtitle, icon, rows, rateKind, emptyMessage,
}: {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    rows: SubjectCorrelation[];
    rateKind: 'positive' | 'negative';
    emptyMessage: string;
}) {
    return (
        <div className="premium-card p-4">
            <div className="flex items-center justify-between mb-1">
                <h2 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    {icon} {title}
                </h2>
                <span className="text-[10px] text-gray-400">top {rows.length}</span>
            </div>
            <p className="text-[10px] text-gray-500 mb-3">{subtitle}</p>
            {rows.length === 0 ? (
                <p className="text-[11px] text-gray-400 italic py-4 text-center">{emptyMessage}</p>
            ) : (
                <div className="flex flex-col gap-1">
                    {rows.map((row, i) => (
                        <SubjectRow key={`${row.subject}-${i}`} row={row} rateKind={rateKind} />
                    ))}
                </div>
            )}
        </div>
    );
}

function SubjectRow({ row, rateKind }: { row: SubjectCorrelation; rateKind: 'positive' | 'negative' }) {
    const rate = rateKind === 'positive' ? row.positive_rate : row.negative_rate;
    const tone = rateKind === 'positive' ? '#10B981' : '#EF4444';

    // Render the per-class mini bar so users see the FULL distribution, not
    // just the headline rate. Stops "62% positive" from hiding "but also 30%
    // angry" on the same subject.
    const segments = useMemo(() => {
        const total = row.total_replies;
        return CLASS_ORDER
            .filter(c => row.class_counts[c] > 0)
            .map(c => ({
                cls: c,
                pct: (row.class_counts[c] / total) * 100,
                color: CLASS_META[c].color,
            }));
    }, [row]);

    return (
        <div className="border border-[#E8E3DC] rounded-md px-3 py-2">
            <div className="flex items-baseline justify-between gap-2 mb-1">
                <span className="text-[11px] text-gray-900 font-medium truncate flex-1" title={row.subject}>
                    {row.subject}
                </span>
                <span className="text-[11px] font-bold tabular-nums shrink-0" style={{ color: tone }}>
                    {rate}%
                </span>
            </div>
            <div className="flex h-1.5 rounded-full overflow-hidden bg-gray-100" title={`${row.total_replies} replies`}>
                {segments.map((s, i) => (
                    <div
                        key={`${row.subject}-${s.cls}-${i}`}
                        style={{ width: `${s.pct}%`, background: s.color }}
                        title={`${CLASS_META[s.cls].label}: ${row.class_counts[s.cls]} (${s.pct.toFixed(0)}%)`}
                    />
                ))}
            </div>
            <div className="text-[9px] text-gray-400 mt-1">{row.total_replies} replies</div>
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────
// Donut chart — pure SVG, no charting lib
// ────────────────────────────────────────────────────────────────────

function ReplyDonut({ breakdown, total }: { breakdown: Record<string, number>; total: number }) {
    const SIZE = 180;
    const STROKE = 24;
    const RADIUS = (SIZE - STROKE) / 2;
    const CIRC = 2 * Math.PI * RADIUS;
    const cx = SIZE / 2;
    const cy = SIZE / 2;

    let cumulative = 0;
    const arcs: { cls: string; offset: number; length: number; color: string }[] = [];
    for (const cls of CLASS_ORDER) {
        const count = breakdown[cls] || 0;
        if (count === 0) continue;
        const length = (count / total) * CIRC;
        arcs.push({
            cls,
            offset: -cumulative,
            length,
            color: CLASS_META[cls as ReplyClass].color,
        });
        cumulative += length;
    }

    // Headline number = positive + qualified rate (the "good replies" metric
    // that contradicts the vanity reply-rate).
    const goodReplies = (breakdown.positive || 0) + (breakdown.qualified || 0);
    const goodPct = total > 0 ? Math.round((goodReplies / total) * 100) : 0;

    return (
        <div className="flex items-center justify-center">
            <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90">
                {/* Background ring */}
                <circle cx={cx} cy={cy} r={RADIUS} fill="none" stroke="#F3F4F6" strokeWidth={STROKE} />
                {arcs.map((a, i) => (
                    <circle
                        key={`${a.cls}-${i}`}
                        cx={cx}
                        cy={cy}
                        r={RADIUS}
                        fill="none"
                        stroke={a.color}
                        strokeWidth={STROKE}
                        strokeDasharray={`${a.length} ${CIRC - a.length}`}
                        strokeDashoffset={a.offset}
                    />
                ))}
                {/* Center label — render via foreignObject so we can use Tailwind */}
                <foreignObject x={0} y={0} width={SIZE} height={SIZE} className="rotate-90 origin-center" transform={`rotate(90 ${cx} ${cy})`}>
                    <div className="w-full h-full flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-gray-900 tabular-nums leading-none">{goodPct}%</span>
                        <span className="text-[9px] text-gray-400 uppercase tracking-wider mt-1">good replies</span>
                    </div>
                </foreignObject>
            </svg>
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────
// Drill-down modal — sample replies for a class
// ────────────────────────────────────────────────────────────────────

function DrillDownModal({
    cls, samples, onClose,
}: {
    cls: ReplyClass;
    samples: ReplySample[];
    onClose: () => void;
}) {
    const meta = CLASS_META[cls];
    const Icon = meta.icon;
    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: meta.color + '15' }}>
                            <Icon size={13} style={{ color: meta.color }} />
                        </span>
                        <div>
                            <h2 className="text-sm font-bold text-gray-900">{meta.label} replies</h2>
                            <p className="text-[10px] text-gray-500">{meta.description}</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={16} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                    {samples.length === 0 ? (
                        <p className="text-xs text-gray-400 italic text-center py-6">No examples available.</p>
                    ) : (
                        samples.map(s => (
                            <div key={s.id} className="border border-[#E8E3DC] rounded-lg p-3">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <span className="text-[11px] font-semibold text-gray-900 truncate">{s.from_email}</span>
                                    <span className="text-[9px] text-gray-400 tabular-nums shrink-0">{new Date(s.received_at).toLocaleDateString()}</span>
                                </div>
                                <div className="text-[10px] text-gray-500 mb-1.5 truncate" title={s.subject}>Re: {s.subject}</div>
                                <p className="text-xs text-gray-800 leading-relaxed">{s.snippet}</p>
                                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                                    <span
                                        className="text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold"
                                        style={{ background: meta.color + '15', color: meta.color }}
                                    >
                                        {s.confidence} confidence
                                    </span>
                                    {s.signals.map(sig => (
                                        <span key={sig} className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-mono">
                                            {sig}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

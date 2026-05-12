'use client';

/**
 * MailboxComparisonPanel — protection analytics surface for comparing
 * mailbox health across the org. Two views via internal sub-tabs:
 *
 *   1. Mailboxes  — per-mailbox comparison table + a top-5 health-score
 *                   bar chart so the operator can spot the best and
 *                   worst performers at a glance.
 *   2. Providers  — Gmail vs Outlook vs SMTP rollup, with the same row
 *                   shape but summed across the bucket. Bounce/reply
 *                   rates here are computed on the SUMS (not averages
 *                   of rates) so volume-weights stay correct.
 *
 * Data: GET /api/analytics/mailbox-comparison returns both shapes in one
 * payload — sub-tab switch is instant, no refetch.
 */

import { useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/lib/api';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import MultiSelectDropdown from '@/components/ui/MultiSelectDropdown';
import { BarChart, Bar, XAxis, YAxis, Cell, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface MailboxRow {
    id: string;
    email: string;
    display_name: string | null;
    provider: 'google' | 'microsoft' | 'smtp';
    connection_status: string;
    daily_send_limit: number;
    sends_today: number;
    warmup_complete: boolean;
    status: string;
    recovery_phase: string;
    last_activity_at: string | null;
    total_sent: number;
    total_replied: number;
    total_bounced: number;
    total_delivered: number;
    reply_rate: number;
    bounce_rate: number;
    delivery_rate: number;
    health_score: number;
}

interface ProviderRow {
    provider: 'google' | 'microsoft' | 'smtp';
    mailbox_count: number;
    total_sent: number;
    total_replied: number;
    total_bounced: number;
    total_delivered: number;
    reply_rate: number;
    bounce_rate: number;
    delivery_rate: number;
    healthy_count: number;
    in_recovery_count: number;
    paused_count: number;
    warmup_complete_count: number;
    avg_health_score: number;
}

interface ComparisonPayload {
    mailboxes: MailboxRow[];
    providers: ProviderRow[];
    window: { start: string; end: string };
}

const PROVIDER_LABEL: Record<ProviderRow['provider'], string> = {
    google: 'Gmail',
    microsoft: 'Outlook',
    smtp: 'SMTP / Relay',
};

const PROVIDER_COLOR: Record<ProviderRow['provider'], string> = {
    google: '#EA4335',
    microsoft: '#0078D4',
    smtp: '#8B5CF6',
};

export default function MailboxComparisonPanel({
    startDate, endDate,
}: {
    startDate: string;
    endDate: string;
}) {
    const [data, setData] = useState<ComparisonPayload | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [view, setView] = useState<'mailboxes' | 'providers'>('mailboxes');
    // Multi-select filters — empty array means "include all" on that axis.
    // Filters apply to BOTH views; the provider rollup is recomputed
    // client-side from the filtered mailbox subset so the bucket totals
    // stay consistent with what the user is looking at.
    const [providerFilter, setProviderFilter] = useState<string[]>([]);
    const [mailboxFilter, setMailboxFilter] = useState<string[]>([]);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        (async () => {
            try {
                const params = new URLSearchParams({ start_date: startDate, end_date: endDate });
                const res = await apiClient<ComparisonPayload>(`/api/analytics/mailbox-comparison?${params}`);
                if (!cancelled && res && Array.isArray(res.mailboxes)) setData(res);
            } catch (e) {
                if (!cancelled) setError((e as Error)?.message || 'Failed to load comparison');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [startDate, endDate]);

    if (loading) {
        return (
            <div className="premium-card">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Mailbox Comparison</h2>
                <LoadingSkeleton type="table" rows={5} />
            </div>
        );
    }
    if (error || !data) {
        return (
            <div className="premium-card">
                <h2 className="text-lg font-bold text-gray-900 mb-2">Mailbox Comparison</h2>
                <p className="text-xs text-red-700">{error || 'No data'}</p>
            </div>
        );
    }
    if (data.mailboxes.length === 0) {
        return (
            <div className="premium-card">
                <h2 className="text-lg font-bold text-gray-900 mb-2">Mailbox Comparison</h2>
                <p className="text-xs text-gray-500">No mailboxes connected yet — connect at least one to see comparison data.</p>
            </div>
        );
    }

    // Filter the mailbox list per the user's selections. The provider
    // rollup is then RE-COMPUTED on the filtered subset (rather than
    // pulling the server's full-org rollup) so the two views never disagree.
    const filteredMailboxes = data.mailboxes.filter(m => {
        if (providerFilter.length > 0 && !providerFilter.includes(m.provider)) return false;
        if (mailboxFilter.length > 0 && !mailboxFilter.includes(m.id)) return false;
        return true;
    });
    const filteredProviders = recomputeProviderRollup(filteredMailboxes);

    return (
        <div className="premium-card">
            <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 m-0">Mailbox Comparison</h2>
                    <p className="text-xs text-gray-500 mt-0.5 m-0">
                        See which mailboxes are performing best — by sender or by provider bucket.
                    </p>
                </div>
                {/* Sub-tab toggle. Keeps the chrome tight; matches the
                    inline-tab pattern used elsewhere on this page. */}
                <div className="inline-flex rounded-lg border bg-white p-0.5" style={{ border: '1px solid #D1CBC5' }}>
                    {([
                        { key: 'mailboxes', label: 'By mailbox' },
                        { key: 'providers', label: 'By provider' },
                    ] as const).map(t => {
                        const active = view === t.key;
                        return (
                            <button
                                key={t.key}
                                onClick={() => setView(t.key)}
                                className="px-3 py-1 text-xs font-semibold rounded-md cursor-pointer border-none"
                                style={{
                                    background: active ? '#111827' : 'transparent',
                                    color: active ? '#FFFFFF' : '#4B5563',
                                }}
                            >
                                {t.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Filters — provider + per-mailbox. Both multi-select and
                use the canonical MultiSelectDropdown so they match every
                other filter surface in the app. */}
            <div className="flex items-center gap-2 flex-wrap mb-4">
                <div className="w-[180px]">
                    <MultiSelectDropdown
                        placeholder="All providers"
                        selected={providerFilter}
                        onChange={setProviderFilter}
                        options={[
                            { value: 'google',    label: 'Gmail',        icon: <ProviderDot provider="google" /> },
                            { value: 'microsoft', label: 'Outlook',      icon: <ProviderDot provider="microsoft" /> },
                            { value: 'smtp',      label: 'SMTP / Relay', icon: <ProviderDot provider="smtp" /> },
                        ]}
                    />
                </div>
                <div className="w-[260px]">
                    <MultiSelectDropdown
                        placeholder="All mailboxes"
                        selected={mailboxFilter}
                        onChange={setMailboxFilter}
                        searchable
                        searchPlaceholder="Search mailboxes…"
                        options={data.mailboxes.map(m => ({
                            value: m.id,
                            label: m.email,
                            icon: <ProviderDot provider={m.provider} />,
                        }))}
                    />
                </div>
                {(providerFilter.length > 0 || mailboxFilter.length > 0) && (
                    <button
                        type="button"
                        onClick={() => { setProviderFilter([]); setMailboxFilter([]); }}
                        className="text-[11px] font-semibold text-gray-500 hover:text-gray-900 bg-transparent border-none cursor-pointer underline"
                    >
                        Clear filters
                    </button>
                )}
                <span className="ml-auto text-[11px] text-gray-400">
                    Showing {filteredMailboxes.length} of {data.mailboxes.length} mailbox{data.mailboxes.length === 1 ? '' : 'es'}
                </span>
            </div>

            {filteredMailboxes.length === 0 ? (
                <p className="text-xs text-gray-500 py-8 text-center">
                    No mailboxes match these filters.
                </p>
            ) : view === 'mailboxes' ? (
                <MailboxView mailboxes={filteredMailboxes} />
            ) : (
                <ProviderView providers={filteredProviders} />
            )}
        </div>
    );
}

/** Small colored dot — the canonical visual identifier for a provider.
 *  Reused in the dropdowns, the table rows, and (indirectly via fill)
 *  every chart on this panel. Keeping it as a single component means
 *  "if google is red, google is red everywhere." */
function ProviderDot({ provider }: { provider: keyof typeof PROVIDER_COLOR }) {
    return (
        <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: PROVIDER_COLOR[provider], display: 'inline-block' }}
        />
    );
}

/** Recompute provider rollups from a filtered mailbox subset. Mirrors the
 *  server-side logic in analyticsController.getMailboxComparison so the
 *  client-filtered view shows the same shape the server would. */
function recomputeProviderRollup(mailboxes: MailboxRow[]): ProviderRow[] {
    const buckets = new Map<string, {
        provider: ProviderRow['provider'];
        mailbox_count: number;
        total_sent: number;
        total_replied: number;
        total_bounced: number;
        healthy_count: number;
        in_recovery_count: number;
        paused_count: number;
        warmup_complete_count: number;
        health_score_sum: number;
    }>();
    for (const m of mailboxes) {
        const b = buckets.get(m.provider) || {
            provider: m.provider, mailbox_count: 0,
            total_sent: 0, total_replied: 0, total_bounced: 0,
            healthy_count: 0, in_recovery_count: 0, paused_count: 0,
            warmup_complete_count: 0, health_score_sum: 0,
        };
        b.mailbox_count += 1;
        b.total_sent += m.total_sent;
        b.total_replied += m.total_replied;
        b.total_bounced += m.total_bounced;
        if (m.recovery_phase === 'paused' || m.status === 'paused') b.paused_count += 1;
        else if (m.recovery_phase !== 'healthy') b.in_recovery_count += 1;
        else b.healthy_count += 1;
        if (m.warmup_complete) b.warmup_complete_count += 1;
        b.health_score_sum += m.health_score;
        buckets.set(m.provider, b);
    }
    const pct = (n: number, d: number) => (d > 0 ? parseFloat(((n / d) * 100).toFixed(2)) : 0);
    return Array.from(buckets.values()).map(b => {
        const delivered = Math.max(0, b.total_sent - b.total_bounced);
        return {
            provider: b.provider,
            mailbox_count: b.mailbox_count,
            total_sent: b.total_sent,
            total_replied: b.total_replied,
            total_bounced: b.total_bounced,
            total_delivered: delivered,
            reply_rate: pct(b.total_replied, b.total_sent),
            bounce_rate: pct(b.total_bounced, b.total_sent),
            delivery_rate: pct(delivered, b.total_sent),
            healthy_count: b.healthy_count,
            in_recovery_count: b.in_recovery_count,
            paused_count: b.paused_count,
            warmup_complete_count: b.warmup_complete_count,
            avg_health_score: b.mailbox_count > 0 ? Math.round(b.health_score_sum / b.mailbox_count) : 0,
        };
    }).sort((a, b) => b.total_sent - a.total_sent);
}

// ────────────────────────────────────────────────────────────────────
// By-mailbox view: top-5 health chart + table (paged 10/page)
// ────────────────────────────────────────────────────────────────────

function MailboxView({ mailboxes }: { mailboxes: MailboxRow[] }) {
    const PAGE_SIZE = 10;
    const [page, setPage] = useState(1);
    const totalPages = Math.max(1, Math.ceil(mailboxes.length / PAGE_SIZE));
    const slice = mailboxes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const topFive = useMemo(() => mailboxes.slice(0, 5).map(m => ({
        name: m.email.split('@')[0],
        score: m.health_score,
        provider: m.provider,
    })), [mailboxes]);

    return (
        <div className="flex flex-col gap-4">
            {/* Top 5 health chart */}
            <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Top performers · health score</h3>
                <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topFive} layout="vertical" margin={{ top: 4, right: 36, left: 16, bottom: 0 }}>
                            <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="#F0EBE3" />
                            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                            <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11, fill: '#374151' }} />
                            <Tooltip contentStyle={{ background: '#fff', border: 'none', borderRadius: 12, boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: 12 }} />
                            <Bar dataKey="score" radius={[0, 4, 4, 0]} label={{ position: 'right', fill: '#374151', fontSize: 10 }}>
                                {topFive.map((entry, idx) => (
                                    <Cell key={idx} fill={PROVIDER_COLOR[entry.provider]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Mailbox table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead>
                        <tr style={{ borderBottom: '1px solid #D1CBC5', background: '#F7F2EB' }}>
                            <th className="px-3 py-2 text-[10px] font-semibold text-gray-500">Mailbox</th>
                            <th className="px-3 py-2 text-[10px] font-semibold text-gray-500">Provider</th>
                            <th className="px-3 py-2 text-[10px] font-semibold text-gray-500 text-right">Health</th>
                            <th className="px-3 py-2 text-[10px] font-semibold text-gray-500 text-right">Sent</th>
                            <th className="px-3 py-2 text-[10px] font-semibold text-gray-500 text-right">Reply %</th>
                            <th className="px-3 py-2 text-[10px] font-semibold text-gray-500 text-right">Bounce %</th>
                            <th className="px-3 py-2 text-[10px] font-semibold text-gray-500 text-right">Delivery %</th>
                            <th className="px-3 py-2 text-[10px] font-semibold text-gray-500">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {slice.map(m => (
                            <MailboxComparisonRow key={m.id} m={m} />
                        ))}
                    </tbody>
                </table>
            </div>

            {mailboxes.length > PAGE_SIZE && (
                <Pager
                    page={page}
                    totalPages={totalPages}
                    rangeStart={(page - 1) * PAGE_SIZE + 1}
                    rangeEnd={Math.min(page * PAGE_SIZE, mailboxes.length)}
                    total={mailboxes.length}
                    onPrev={() => setPage(p => Math.max(1, p - 1))}
                    onNext={() => setPage(p => Math.min(totalPages, p + 1))}
                />
            )}
        </div>
    );
}

function MailboxComparisonRow({ m }: { m: MailboxRow }) {
    const tone = statusTone(m);
    const scoreTone = m.health_score >= 75
        ? { bg: '#ECFDF5', fg: '#059669' }
        : m.health_score >= 50
        ? { bg: '#FEF3C7', fg: '#92400E' }
        : { bg: '#FEE2E2', fg: '#991B1B' };
    return (
        <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
            <td className="px-3 py-2">
                <div className="text-gray-900 font-medium">{m.email}</div>
                {m.display_name && <div className="text-[10px] text-gray-500 truncate">{m.display_name}</div>}
            </td>
            <td className="px-3 py-2 text-gray-700">{PROVIDER_LABEL[m.provider]}</td>
            <td className="px-3 py-2 text-right">
                <span
                    className="inline-flex items-center justify-center text-[10px] font-bold rounded-full px-2 py-0.5 min-w-[36px] tabular-nums"
                    style={{ background: scoreTone.bg, color: scoreTone.fg }}
                >
                    {m.health_score}
                </span>
            </td>
            <td className="px-3 py-2 text-right text-gray-700 tabular-nums">{m.total_sent.toLocaleString()}</td>
            <td className="px-3 py-2 text-right text-gray-700 tabular-nums">{m.reply_rate}%</td>
            <td className="px-3 py-2 text-right tabular-nums" style={{ color: m.bounce_rate >= 5 ? '#DC2626' : m.bounce_rate >= 2 ? '#D97706' : '#374151' }}>
                {m.bounce_rate}%
            </td>
            <td className="px-3 py-2 text-right text-gray-700 tabular-nums">{m.delivery_rate}%</td>
            <td className="px-3 py-2">
                <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
                    style={{ background: tone.bg, color: tone.fg }}
                >
                    {tone.label}
                </span>
            </td>
        </tr>
    );
}

function statusTone(m: MailboxRow): { label: string; bg: string; fg: string } {
    if (m.recovery_phase === 'paused' || m.status === 'paused') return { label: 'Paused', bg: '#FEE2E2', fg: '#991B1B' };
    if (m.recovery_phase === 'quarantine') return { label: 'Quarantine', bg: '#FEE2E2', fg: '#991B1B' };
    if (m.recovery_phase === 'restricted_send' || m.recovery_phase === 'warm_recovery') return { label: 'Healing', bg: '#FEF3C7', fg: '#92400E' };
    if (m.connection_status !== 'active') return { label: m.connection_status, bg: '#FEF3C7', fg: '#92400E' };
    if (m.status === 'warning') return { label: 'Warning', bg: '#FEF3C7', fg: '#92400E' };
    return { label: 'Healthy', bg: '#ECFDF5', fg: '#059669' };
}

// ────────────────────────────────────────────────────────────────────
// By-provider view: bar chart + bucket table
// ────────────────────────────────────────────────────────────────────

type ProviderMetric = 'total_sent' | 'total_replied' | 'total_bounced' | 'total_delivered' | 'avg_health_score';

const METRIC_OPTIONS: { key: ProviderMetric; label: string }[] = [
    { key: 'total_sent',       label: 'Sent' },
    { key: 'total_replied',    label: 'Replied' },
    { key: 'total_bounced',    label: 'Bounced' },
    { key: 'total_delivered',  label: 'Delivered' },
    { key: 'avg_health_score', label: 'Avg health' },
];

function ProviderView({ providers }: { providers: ProviderRow[] }) {
    const [metric, setMetric] = useState<ProviderMetric>('total_sent');

    if (providers.length === 0) {
        return <p className="text-xs text-gray-500">No provider data yet.</p>;
    }

    const activeMetric = METRIC_OPTIONS.find(o => o.key === metric) ?? METRIC_OPTIONS[0];
    // One bar per provider, colored by provider — the canonical visual
    // identity stays consistent across every chart on the panel ("if
    // Gmail is red, every Gmail bar is red"). Switching metrics keeps
    // the same colors and just retargets the y value.
    const chartData = providers.map(p => ({
        provider: PROVIDER_LABEL[p.provider],
        value: p[activeMetric.key] as number,
        providerKey: p.provider,
    }));

    return (
        <div className="flex flex-col gap-4">
            {/* Per-provider bar chart with a metric toggle. */}
            <div>
                <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 m-0">
                        {activeMetric.label} by provider
                    </h3>
                    <div className="inline-flex rounded-md bg-gray-100 p-0.5">
                        {METRIC_OPTIONS.map(o => {
                            const active = metric === o.key;
                            return (
                                <button
                                    key={o.key}
                                    onClick={() => setMetric(o.key)}
                                    className="px-2 py-1 text-[10px] font-semibold rounded cursor-pointer border-none"
                                    style={{
                                        background: active ? '#FFFFFF' : 'transparent',
                                        color: active ? '#111827' : '#6B7280',
                                        boxShadow: active ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                                    }}
                                >
                                    {o.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 12, right: 8, left: -8, bottom: 4 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE3" />
                            <XAxis dataKey="provider" tick={{ fontSize: 11, fill: '#374151' }} />
                            <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                            <Tooltip
                                contentStyle={{ background: '#fff', border: 'none', borderRadius: 12, boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: 12 }}
                                formatter={(value) => {
                                    const n = typeof value === 'number' ? value : Number(value);
                                    return Number.isFinite(n) ? n.toLocaleString() : String(value ?? '');
                                }}
                            />
                            <Bar dataKey="value" name={activeMetric.label} radius={[4, 4, 0, 0]}>
                                {chartData.map((entry, idx) => (
                                    <Cell key={idx} fill={PROVIDER_COLOR[entry.providerKey]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Provider table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead>
                        <tr style={{ borderBottom: '1px solid #D1CBC5', background: '#F7F2EB' }}>
                            <th className="px-3 py-2 text-[10px] font-semibold text-gray-500">Provider</th>
                            <th className="px-3 py-2 text-[10px] font-semibold text-gray-500 text-right">Mailboxes</th>
                            <th className="px-3 py-2 text-[10px] font-semibold text-gray-500 text-right">Avg health</th>
                            <th className="px-3 py-2 text-[10px] font-semibold text-gray-500 text-right">Sent</th>
                            <th className="px-3 py-2 text-[10px] font-semibold text-gray-500 text-right">Reply %</th>
                            <th className="px-3 py-2 text-[10px] font-semibold text-gray-500 text-right">Bounce %</th>
                            <th className="px-3 py-2 text-[10px] font-semibold text-gray-500 text-right">Delivery %</th>
                            <th className="px-3 py-2 text-[10px] font-semibold text-gray-500 text-right">Healthy / Recovery / Paused</th>
                        </tr>
                    </thead>
                    <tbody>
                        {providers.map(p => {
                            const scoreTone = p.avg_health_score >= 75
                                ? { bg: '#ECFDF5', fg: '#059669' }
                                : p.avg_health_score >= 50
                                ? { bg: '#FEF3C7', fg: '#92400E' }
                                : { bg: '#FEE2E2', fg: '#991B1B' };
                            return (
                                <tr key={p.provider} style={{ borderBottom: '1px solid #E5E7EB' }}>
                                    <td className="px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full" style={{ background: PROVIDER_COLOR[p.provider], display: 'inline-block' }} />
                                            <span className="text-gray-900 font-medium">{PROVIDER_LABEL[p.provider]}</span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 text-right text-gray-700 tabular-nums">{p.mailbox_count}</td>
                                    <td className="px-3 py-2 text-right">
                                        <span
                                            className="inline-flex items-center justify-center text-[10px] font-bold rounded-full px-2 py-0.5 min-w-[36px] tabular-nums"
                                            style={{ background: scoreTone.bg, color: scoreTone.fg }}
                                        >
                                            {p.avg_health_score}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-right text-gray-700 tabular-nums">{p.total_sent.toLocaleString()}</td>
                                    <td className="px-3 py-2 text-right text-gray-700 tabular-nums">{p.reply_rate}%</td>
                                    <td
                                        className="px-3 py-2 text-right tabular-nums"
                                        style={{ color: p.bounce_rate >= 5 ? '#DC2626' : p.bounce_rate >= 2 ? '#D97706' : '#374151' }}
                                    >
                                        {p.bounce_rate}%
                                    </td>
                                    <td className="px-3 py-2 text-right text-gray-700 tabular-nums">{p.delivery_rate}%</td>
                                    <td className="px-3 py-2 text-right text-[11px] tabular-nums">
                                        <span style={{ color: '#059669' }}>{p.healthy_count}</span>
                                        <span className="text-gray-400 mx-1">/</span>
                                        <span style={{ color: '#92400E' }}>{p.in_recovery_count}</span>
                                        <span className="text-gray-400 mx-1">/</span>
                                        <span style={{ color: '#991B1B' }}>{p.paused_count}</span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────
// Shared pager — same shape as the sequencer analytics page so the
// pagination affordance is identical across all in-card tables.
// ────────────────────────────────────────────────────────────────────

function Pager({
    page, totalPages, rangeStart, rangeEnd, total, onPrev, onNext,
}: {
    page: number;
    totalPages: number;
    rangeStart: number;
    rangeEnd: number;
    total: number;
    onPrev: () => void;
    onNext: () => void;
}) {
    return (
        <div className="flex items-center justify-between gap-3 px-3 py-2 mt-2 rounded-lg" style={{ background: '#FAFAF8', border: '1px solid #E8E3DC' }}>
            <span className="text-[11px] text-gray-500 tabular-nums">
                {rangeStart}&ndash;{rangeEnd} of {total.toLocaleString()}
            </span>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={onPrev}
                    disabled={page <= 1}
                    aria-label="Previous page"
                    className="w-7 h-7 inline-flex items-center justify-center rounded-md bg-white cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50"
                    style={{ border: '1px solid #D1CBC5' }}
                >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>
                <span className="text-[11px] text-gray-700 tabular-nums">Page <strong>{page}</strong> of {totalPages}</span>
                <button
                    type="button"
                    onClick={onNext}
                    disabled={page >= totalPages}
                    aria-label="Next page"
                    className="w-7 h-7 inline-flex items-center justify-center rounded-md bg-white cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50"
                    style={{ border: '1px solid #D1CBC5' }}
                >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

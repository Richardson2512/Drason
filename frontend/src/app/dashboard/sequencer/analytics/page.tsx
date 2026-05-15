'use client';

import { useState, useEffect } from 'react';
import { Send, Eye, MousePointer, MessageSquare, AlertTriangle, UserMinus, TrendingUp, ArrowUpRight, ArrowDownRight, Activity, Heart, FlaskConical } from 'lucide-react';
import { apiClient } from '@/lib/api';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import DatePicker from '@/components/ui/DatePicker';
import Tabs, { useTabState, type TabItem } from '@/components/ui/Tabs';
import SendVolumeForecast from '@/components/sequencer/SendVolumeForecast';
import ReplyQualityPanel from '@/components/sequencer/ReplyQualityPanel';

const TABS: TabItem[] = [
    { key: 'live',          label: 'Live',          icon: <Activity size={12} strokeWidth={1.75} /> },
    { key: 'reply-quality', label: 'Reply Quality', icon: <Heart size={12} strokeWidth={1.75} /> },
    { key: 'variants',      label: 'Variants',      icon: <FlaskConical size={12} strokeWidth={1.75} /> },
];

interface OverviewData {
    totalSent: number;
    totalOpened: number;
    totalClicked: number;
    totalReplied: number;
    totalBounced: number;
    totalUnsubscribed: number;
    openRate: number;
    clickRate: number;
    replyRate: number;
    bounceRate: number;
}

interface CampaignRow {
    id: string;
    name: string;
    status: string;
    total_sent: number;
    total_opened: number;
    total_clicked: number;
    total_replied: number;
    total_bounced: number;
    open_rate: number;
    click_rate: number;
    reply_rate: number;
    bounce_rate: number;
}

interface MailboxRow {
    id: string;
    email: string;
    display_name: string | null;
    provider: 'google' | 'microsoft' | 'smtp';
    connection_status: string;
    daily_send_limit: number;
    sends_today: number;
    utilization_pct: number;
    status: string;
    recovery_phase: string;
    last_activity_at: string | null;
    total_sent: number;
    total_replied: number;
    total_bounced: number;
    reply_rate: number;
    bounce_rate: number;
}

export default function SequencerAnalyticsPage() {
    const [activeTab, setActiveTab] = useTabState(TABS, 'live');
    const [timeRange, setTimeRange] = useState('30d');
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');
    const [showCustom, setShowCustom] = useState(false);
    const [loading, setLoading] = useState(true);
    const [overview, setOverview] = useState<OverviewData>({
        totalSent: 0,
        totalOpened: 0,
        totalClicked: 0,
        totalReplied: 0,
        totalBounced: 0,
        totalUnsubscribed: 0,
        openRate: 0,
        clickRate: 0,
        replyRate: 0,
        bounceRate: 0,
    });
    const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
    const [mailboxes, setMailboxes] = useState<MailboxRow[]>([]);
    // Pagination inside each performance card. 10 rows per page keeps the
    // analytics page scannable; full lists live one drill-down away on the
    // campaigns / mailboxes pages.
    const PAGE_SIZE = 10;
    const [campaignsPage, setCampaignsPage] = useState(1);
    const [mailboxesPage, setMailboxesPage] = useState(1);
    // Reset page index when the underlying dataset changes (timeRange swap,
    // refetch). Without this a user sitting on page 3 with 25 rows would
    // see an empty table if the new dataset is shorter.
    useEffect(() => { setCampaignsPage(1); }, [campaigns.length]);
    useEffect(() => { setMailboxesPage(1); }, [mailboxes.length]);

    const campaignsTotalPages = Math.max(1, Math.ceil(campaigns.length / PAGE_SIZE));
    const mailboxesTotalPages = Math.max(1, Math.ceil(mailboxes.length / PAGE_SIZE));
    const campaignsPageSlice = campaigns.slice((campaignsPage - 1) * PAGE_SIZE, campaignsPage * PAGE_SIZE);
    const mailboxesPageSlice = mailboxes.slice((mailboxesPage - 1) * PAGE_SIZE, mailboxesPage * PAGE_SIZE);

    useEffect(() => {
        async function fetchAnalytics() {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (timeRange === 'custom' && customFrom && customTo) {
                    params.set('from', customFrom);
                    params.set('to', customTo);
                } else {
                    params.set('timeRange', timeRange);
                }
                const qs = params.toString();
                // apiClient auto-unwraps the backend's `data` key. Both endpoints return
                // `{success, data}`, so `overviewRes` is the overview object directly and
                // `campaignsRes` is the campaigns array. Backend uses snake_case keys;
                // map into the camelCase state shape used by the UI.
                const [overviewRes, campaignsRes, mailboxesRes] = await Promise.all([
                    apiClient<any>(`/api/sequencer/analytics?${qs}`),
                    apiClient<any>(`/api/sequencer/analytics/campaigns?${qs}`),
                    apiClient<any>(`/api/sequencer/analytics/mailboxes?${qs}`),
                ]);

                if (overviewRes && typeof overviewRes === 'object') {
                    setOverview({
                        totalSent: overviewRes.total_sent ?? overviewRes.totalSent ?? 0,
                        totalOpened: overviewRes.total_opened ?? overviewRes.totalOpened ?? 0,
                        totalClicked: overviewRes.total_clicked ?? overviewRes.totalClicked ?? 0,
                        totalReplied: overviewRes.total_replied ?? overviewRes.totalReplied ?? 0,
                        totalBounced: overviewRes.total_bounced ?? overviewRes.totalBounced ?? 0,
                        totalUnsubscribed: overviewRes.total_unsubscribed ?? overviewRes.totalUnsubscribed ?? 0,
                        openRate: overviewRes.open_rate ?? overviewRes.openRate ?? 0,
                        clickRate: overviewRes.click_rate ?? overviewRes.clickRate ?? 0,
                        replyRate: overviewRes.reply_rate ?? overviewRes.replyRate ?? 0,
                        bounceRate: overviewRes.bounce_rate ?? overviewRes.bounceRate ?? 0,
                    });
                }
                const campaignsList = Array.isArray(campaignsRes)
                    ? campaignsRes
                    : (campaignsRes?.campaigns ?? campaignsRes?.data ?? []);
                setCampaigns(campaignsList);

                const mailboxesList = Array.isArray(mailboxesRes)
                    ? mailboxesRes
                    : (mailboxesRes?.data ?? []);
                setMailboxes(mailboxesList);
            } catch (err) {
                console.error('Failed to fetch sequencer analytics:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeRange, customFrom, customTo]);

    const statCards = [
        { label: 'Emails Sent', value: overview.totalSent, icon: <Send size={14} />, color: '#111827' },
        { label: 'Opened', value: overview.totalOpened, rate: overview.openRate, icon: <Eye size={14} />, color: '#059669' },
        { label: 'Clicked', value: overview.totalClicked, rate: overview.clickRate, icon: <MousePointer size={14} />, color: '#2563EB' },
        { label: 'Replied', value: overview.totalReplied, rate: overview.replyRate, icon: <MessageSquare size={14} />, color: '#7C3AED' },
        { label: 'Bounced', value: overview.totalBounced, rate: overview.bounceRate, icon: <AlertTriangle size={14} />, color: '#DC2626' },
        { label: 'Unsubscribed', value: overview.totalUnsubscribed, icon: <UserMinus size={14} />, color: '#D97706' },
    ];

    // Map the existing time-range buttons to a day count for the Reply
    // Quality endpoint, which takes ?days=N. Custom ranges fall back to 90.
    const replyQualityDays = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;

    return (
        <div className="p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Sending Analytics</h1>
                    <p className="text-xs text-gray-500 mt-0.5">Performance metrics across all campaigns</p>
                </div>
                <div className="flex items-center gap-2">
                    {[{ k: '7d', l: '7 days' }, { k: '30d', l: '30 days' }, { k: '90d', l: '90 days' }].map(r => (
                        <button key={r.k} onClick={() => { setTimeRange(r.k); setCustomFrom(''); setCustomTo(''); }} className="px-2.5 py-1 rounded-md text-[10px] font-semibold cursor-pointer" style={{ background: timeRange === r.k ? '#111827' : '#F3F4F6', color: timeRange === r.k ? '#FFF' : '#4B5563' }}>
                            {r.l}
                        </button>
                    ))}
                    {activeTab === 'live' && (
                        <>
                            <div className="w-px h-5 bg-gray-200" />
                            <div className="w-36">
                                <DatePicker
                                    value={customFrom}
                                    onChange={v => { setCustomFrom(v); if (customTo) setTimeRange('custom'); }}
                                    placeholder="From"
                                />
                            </div>
                            <span className="text-[10px] text-gray-400">to</span>
                            <div className="w-36">
                                <DatePicker
                                    value={customTo}
                                    onChange={v => { setCustomTo(v); if (customFrom) setTimeRange('custom'); }}
                                    placeholder="To"
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>

            <Tabs tabs={TABS} defaultTab="live" activeTab={activeTab} onChange={setActiveTab} />

            {activeTab === 'reply-quality' && <ReplyQualityPanel days={replyQualityDays} />}

            {activeTab === 'variants' && (
                <div className="premium-card p-8 text-center">
                    <FlaskConical size={20} className="text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-gray-900 mb-1">A/B Variant analysis</p>
                    <p className="text-xs text-gray-500 max-w-md mx-auto">
                        Per-variant open / click / reply / bounce performance with weight-adjusted significance testing.
                        Coming soon - the data is already being captured on every send.
                    </p>
                </div>
            )}

            {activeTab === 'live' && (<>

            {/* Stat cards */}
            {loading ? (
                <LoadingSkeleton type="stat" rows={6} className="!grid-cols-2 !md:grid-cols-3 !lg:grid-cols-6" />
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {statCards.map(s => (
                        <div key={s.label} className="premium-card">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${s.color}10`, color: s.color }}>{s.icon}</div>
                            </div>
                            <div className="text-lg font-bold text-gray-900">{s.value.toLocaleString()}</div>
                            <div className="flex items-center justify-between mt-0.5">
                                <span className="text-[10px] text-gray-500">{s.label}</span>
                                {s.rate !== undefined && <span className="text-[10px] font-semibold" style={{ color: s.color }}>{s.rate}%</span>}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Campaign Performance Table */}
            <div className="premium-card">
                <h2 className="text-sm font-bold text-gray-900 mb-3">Campaign Performance</h2>
                {loading ? (
                    <LoadingSkeleton type="table" rows={5} />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr style={{ borderBottom: '1px solid #D1CBC5', background: '#F7F2EB' }}>
                                    <th className="px-3 py-2 text-[10px] font-semibold text-gray-500">Campaign</th>
                                    <th className="px-3 py-2 text-[10px] font-semibold text-gray-500 text-right">Sent</th>
                                    <th className="px-3 py-2 text-[10px] font-semibold text-gray-500 text-right">Open %</th>
                                    <th className="px-3 py-2 text-[10px] font-semibold text-gray-500 text-right">Click %</th>
                                    <th className="px-3 py-2 text-[10px] font-semibold text-gray-500 text-right">Reply %</th>
                                    <th className="px-3 py-2 text-[10px] font-semibold text-gray-500 text-right">Bounce %</th>
                                    <th className="px-3 py-2 text-[10px] font-semibold text-gray-500">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {campaigns.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-3 py-8 text-center text-gray-400 text-xs">
                                            No campaign data yet. Analytics will populate once campaigns start sending.
                                        </td>
                                    </tr>
                                ) : (
                                    campaignsPageSlice.map(c => (
                                        <tr key={c.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                                            <td className="px-3 py-2 font-medium text-gray-900">{c.name}</td>
                                            <td className="px-3 py-2 text-right text-gray-700">{c.total_sent.toLocaleString()}</td>
                                            <td className="px-3 py-2 text-right text-gray-700">{c.open_rate}%</td>
                                            <td className="px-3 py-2 text-right text-gray-700">{c.click_rate}%</td>
                                            <td className="px-3 py-2 text-right text-gray-700">{c.reply_rate}%</td>
                                            <td className="px-3 py-2 text-right text-gray-700">{c.bounce_rate}%</td>
                                            <td className="px-3 py-2">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{
                                                    background: c.status === 'STARTED' ? '#ECFDF5' : c.status === 'PAUSED' ? '#FEF3C7' : '#F3F4F6',
                                                    color: c.status === 'STARTED' ? '#059669' : c.status === 'PAUSED' ? '#D97706' : '#6B7280',
                                                }}>
                                                    {c.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
                {!loading && campaigns.length > PAGE_SIZE && (
                    <Pager
                        page={campaignsPage}
                        totalPages={campaignsTotalPages}
                        rangeStart={(campaignsPage - 1) * PAGE_SIZE + 1}
                        rangeEnd={Math.min(campaignsPage * PAGE_SIZE, campaigns.length)}
                        total={campaigns.length}
                        onPrev={() => setCampaignsPage(p => Math.max(1, p - 1))}
                        onNext={() => setCampaignsPage(p => Math.min(campaignsTotalPages, p + 1))}
                    />
                )}
            </div>

            {/* Mailbox Performance Table - per-mailbox aggregates over the
                current time range. Mirrors the Campaign Performance card's
                shape so users can scan both with the same mental model. */}
            <div className="premium-card">
                <h2 className="text-sm font-bold text-gray-900 mb-3">Mailbox Performance</h2>
                {loading ? (
                    <LoadingSkeleton type="table" rows={5} />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr style={{ borderBottom: '1px solid #D1CBC5', background: '#F7F2EB' }}>
                                    <th className="px-3 py-2 text-[10px] font-semibold text-gray-500">Mailbox</th>
                                    <th className="px-3 py-2 text-[10px] font-semibold text-gray-500">Provider</th>
                                    <th className="px-3 py-2 text-[10px] font-semibold text-gray-500 text-right">Sent</th>
                                    <th className="px-3 py-2 text-[10px] font-semibold text-gray-500 text-right">Reply %</th>
                                    <th className="px-3 py-2 text-[10px] font-semibold text-gray-500 text-right">Bounce %</th>
                                    <th className="px-3 py-2 text-[10px] font-semibold text-gray-500 text-right">Today / Cap</th>
                                    <th className="px-3 py-2 text-[10px] font-semibold text-gray-500">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mailboxes.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-3 py-8 text-center text-gray-400 text-xs">
                                            No mailboxes connected. Connect a mailbox in Sequencer → Mailboxes to see per-mailbox analytics.
                                        </td>
                                    </tr>
                                ) : (
                                    mailboxesPageSlice.map(m => {
                                        // Surface the most actionable status - recovery phase trumps
                                        // raw status (a 'healthy' mailbox in 'quarantine' phase is
                                        // not actually healthy from a sending standpoint).
                                        const tone =
                                            m.recovery_phase === 'paused' || m.status === 'paused'
                                                ? { label: 'Paused',     bg: '#FEE2E2', fg: '#991B1B' }
                                                : m.recovery_phase === 'quarantine'
                                                ? { label: 'Quarantine', bg: '#FEE2E2', fg: '#991B1B' }
                                                : m.recovery_phase === 'restricted_send' || m.recovery_phase === 'warm_recovery'
                                                ? { label: 'Healing',    bg: '#FEF3C7', fg: '#92400E' }
                                                : m.connection_status !== 'active'
                                                ? { label: m.connection_status, bg: '#FEF3C7', fg: '#92400E' }
                                                : m.status === 'warning'
                                                ? { label: 'Warning',    bg: '#FEF3C7', fg: '#92400E' }
                                                : { label: 'Healthy',    bg: '#ECFDF5', fg: '#059669' };
                                        const utilTone = m.utilization_pct >= 90
                                            ? '#DC2626'
                                            : m.utilization_pct >= 70 ? '#D97706' : '#374151';
                                        const providerLabel = m.provider === 'google' ? 'Gmail' : m.provider === 'microsoft' ? 'Outlook' : 'SMTP';
                                        return (
                                            <tr key={m.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                                                <td className="px-3 py-2">
                                                    <div className="text-gray-900 font-medium">{m.email}</div>
                                                    {m.display_name && (
                                                        <div className="text-[10px] text-gray-500 truncate">{m.display_name}</div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-gray-700">{providerLabel}</td>
                                                <td className="px-3 py-2 text-right text-gray-700 tabular-nums">{m.total_sent.toLocaleString()}</td>
                                                <td className="px-3 py-2 text-right text-gray-700 tabular-nums">{m.reply_rate}%</td>
                                                <td
                                                    className="px-3 py-2 text-right tabular-nums"
                                                    style={{ color: m.bounce_rate >= 5 ? '#DC2626' : m.bounce_rate >= 2 ? '#D97706' : '#374151' }}
                                                >
                                                    {m.bounce_rate}%
                                                </td>
                                                <td className="px-3 py-2 text-right tabular-nums" style={{ color: utilTone }}>
                                                    {m.sends_today} / {m.daily_send_limit}
                                                    <span className="text-[9px] text-gray-400 ml-1">({m.utilization_pct}%)</span>
                                                </td>
                                                <td className="px-3 py-2">
                                                    <span
                                                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize"
                                                        style={{ background: tone.bg, color: tone.fg }}
                                                    >
                                                        {tone.label}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
                {!loading && mailboxes.length > PAGE_SIZE && (
                    <Pager
                        page={mailboxesPage}
                        totalPages={mailboxesTotalPages}
                        rangeStart={(mailboxesPage - 1) * PAGE_SIZE + 1}
                        rangeEnd={Math.min(mailboxesPage * PAGE_SIZE, mailboxes.length)}
                        total={mailboxes.length}
                        onPrev={() => setMailboxesPage(p => Math.max(1, p - 1))}
                        onNext={() => setMailboxesPage(p => Math.min(mailboxesTotalPages, p + 1))}
                    />
                )}
            </div>

            {/* Capacity ahead - forward-looking, source: ConnectedAccount.daily_send_limit. */}
            <SendVolumeForecast />

            <div className="premium-card">
                <h2 className="text-sm font-bold text-gray-900 mb-3">Step-Level Performance</h2>
                <p className="text-xs text-gray-400">See which sequence steps and A/B variants perform best across all campaigns.</p>
                <div className="h-32 flex items-center justify-center">
                    <p className="text-xs text-gray-300">Data appears after campaigns complete at least one full sequence cycle</p>
                </div>
            </div>
            </>)}
        </div>
    );
}

/**
 * Pager - compact in-card pagination footer for the performance tables.
 *
 * Shows "X–Y of N" with prev/next chevrons. Both tables on this page
 * use this same shape so the analytics surface reads consistently.
 */
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
                <span className="text-[11px] text-gray-700 tabular-nums">
                    Page <strong>{page}</strong> of {totalPages}
                </span>
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

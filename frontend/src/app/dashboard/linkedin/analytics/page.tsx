'use client';

/**
 * Super LinkedIn analytics — 6-tab dashboard.
 *
 * Tabs:
 *   Live              — KPIs, daily sent, campaign performance
 *   Acceptance funnel — 4-stage waterfall: Invites → Accepted → DMs → Replies
 *   Signals & ICP     — signal-to-lead funnel, event-type breakdown, auto-tag mix
 *   Reply quality     — 9-class DM reply classification with samples
 *   Senders           — capacity heatmap, account status, type benchmarks,
 *                       working-hours compliance, comparison panel
 *   Step-level        — per-step send/skip/fail/branch, failure taxonomy,
 *                       agent telemetry
 *
 * All tabs share one filter bar at the top: date range (custom + presets),
 * campaign, sender, account type, connection state, engagement event type.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Activity, TrendingUp, Radio, MessageSquare, Users, ListChecks,
    Send, Heart, MessageCircle, Loader2, Filter as FilterIcon,
    AlertTriangle, XCircle, Clock, Linkedin,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import Tabs, { useTabState, type TabItem } from '@/components/ui/Tabs';
import DatePicker from '@/components/ui/DatePicker';
import MultiSelectDropdown from '@/components/ui/MultiSelectDropdown';
import CustomSelect from '@/components/ui/CustomSelect';
import LinkedInSenderComparisonPanel from '@/components/analytics/LinkedInSenderComparisonPanel';
import {
    BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend,
} from 'recharts';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Filters {
    startDate: string;
    endDate: string;
    campaignIds: string[];
    senderIds: string[];
    accountTypes: string[];
    eventTypes: string[];
    connectionStates: string[];
}

interface KpiData { invites_sent: number; accepted: number; acceptance_rate: number; dms_sent: number; replies_received: number; reply_rate: number }
interface SenderPerf { account_id: string; display_name: string; account_type: string; status: string; sent: number; accepted: number; failed: number; dms_sent: number; accept_rate: number; fail_rate: number; capacity: { invites: { today: number; cap: number }; messages: { today: number; cap: number }; inmails: { today: number; cap: number } } }
interface CampaignPerf { campaign_id: string; campaign_name: string; status: string; sent: number; dms_sent: number; accepted: number; accept_rate: number; skipped: number; failed: number }
interface DailyPoint { day: string; count: number }
interface FunnelStage { label: string; value: number; conversion_from_prev?: number; drop_off_from_prev?: number }
interface AcceptanceFunnel { stages: FunnelStage[]; overall_conversion: number }
interface ReplyQualityPayload {
    total_replies: number;
    breakdown: Record<string, number>;
    breakdown_pct: Record<string, number>;
    samples: Record<string, Array<{ agent_run_id: string; trigger_ref_id: string | null; confidence: number | null; signals: string[]; created_at: string }>>;
}
interface StepLevelPayload {
    steps: Array<{ step_type: string; sent: number; skipped: number; failed: number; branched: number; total: number; send_rate: number; fail_rate: number; skip_rate: number }>;
    branched: number;
}
interface CapacityCell { used: number; cap: number; ratio: number }
interface CapacityRow { account_id: string; display_name: string; account_type: string; status: string; cells: { invites_day: CapacityCell; invites_week: CapacityCell; messages: CapacityCell; inmails: CapacityCell; profile_views: CapacityCell } }
interface AutoTagPayload { buckets: Record<string, number>; total_profiles: number; tagged_in_window: number }
interface SignalLeadPayload { stages: FunnelStage[]; event_type_breakdown: Record<string, number>; overall_conversion: number }
interface AccountStatusPayload { buckets: Record<string, number>; total_accounts: number; accounts: Array<{ account_id: string; display_name: string; account_type: string; status: string; status_detail: string | null; last_status_at: string | null; connected_at: string | null }> }
interface AcceptanceByTypeRow { account_type: string; account_count: number; sent: number; accepted: number; accept_rate: number }
interface WorkingHoursRow { account_id: string; display_name: string; account_type: string; total_sends: number; in_hours: number; out_of_hours: number; compliance_rate: number }
interface AffinityPayload { campaigns: Array<{ id: string; name: string }>; senders: Array<{ id: string; name: string }>; cells: Array<{ campaign_id: string; sender_id: string; sent: number; failed: number; skipped: number; accepted: number; accept_rate: number }> }
interface FailureTaxonomy { skip_reasons: Array<{ reason: string; count: number }>; errors: Array<{ message: string; count: number }> }

// ── Constants ─────────────────────────────────────────────────────────────────

const TABS: TabItem[] = [
    { key: 'live',              label: 'Live',              icon: <Activity size={12} strokeWidth={1.75} /> },
    { key: 'acceptance-funnel', label: 'Acceptance funnel', icon: <TrendingUp size={12} strokeWidth={1.75} /> },
    { key: 'signals-icp',       label: 'Signals & ICP',     icon: <Radio size={12} strokeWidth={1.75} /> },
    { key: 'reply-quality',     label: 'Reply quality',     icon: <MessageSquare size={12} strokeWidth={1.75} /> },
    { key: 'senders',           label: 'Senders',           icon: <Users size={12} strokeWidth={1.75} /> },
    { key: 'step-level',        label: 'Step-level',        icon: <ListChecks size={12} strokeWidth={1.75} /> },
];

const ACCOUNT_TYPE_OPTIONS = [
    { value: 'CLASSIC',    label: 'Classic' },
    { value: 'PREMIUM',    label: 'Premium' },
    { value: 'SALES_NAV',  label: 'Sales Navigator' },
    { value: 'RECRUITER',  label: 'Recruiter' },
];

const EVENT_TYPE_OPTIONS = [
    { value: 'REACTION', label: 'Reactions' },
    { value: 'COMMENT',  label: 'Comments' },
    { value: 'SHARE',    label: 'Shares' },
    { value: 'REPOST',   label: 'Reposts' },
];

const CONNECTION_STATE_OPTIONS = [
    { value: 'CONNECTED',         label: 'Connected' },
    { value: 'INVITE_SENT',       label: 'Invite sent' },
    { value: 'INVITE_ACCEPTED',   label: 'Invite accepted' },
    { value: 'INVITE_WITHDRAWN',  label: 'Invite withdrawn' },
    { value: 'INVITE_REJECTED',   label: 'Invite rejected' },
    { value: 'NOT_CONNECTED',     label: 'Not connected' },
];

const REPLY_CLASS_META: Array<{ key: string; label: string; color: string }> = [
    { key: 'positive',     label: 'Positive',     color: '#16A34A' },
    { key: 'qualified',    label: 'Qualified',    color: '#0EA5E9' },
    { key: 'objection',    label: 'Objection',    color: '#F59E0B' },
    { key: 'referral',     label: 'Referral',     color: '#8B5CF6' },
    { key: 'soft_no',      label: 'Soft no',      color: '#94A3B8' },
    { key: 'hard_no',      label: 'Hard no',      color: '#EF4444' },
    { key: 'angry',        label: 'Angry',        color: '#B91C1C' },
    { key: 'auto',         label: 'Auto-reply',   color: '#A78BFA' },
    { key: 'unclassified', label: 'Unclassified', color: '#9CA3AF' },
];

const AUTO_TAG_COLORS: Record<string, string> = {
    'Interested': '#16A34A',
    'Not Interested': '#EF4444',
    'Generic': '#F59E0B',
    'Untagged': '#9CA3AF',
};

const STATUS_PILL: Record<string, { bg: string; fg: string; label: string }> = {
    OK:            { bg: '#DCFCE7', fg: '#15803D', label: 'OK' },
    CONNECTING:    { bg: '#DBEAFE', fg: '#1D4ED8', label: 'Connecting' },
    CREDENTIALS:   { bg: '#FEF3C7', fg: '#B45309', label: 'Credentials' },
    ERROR:         { bg: '#FEE2E2', fg: '#B91C1C', label: 'Error' },
    SYNC_SUCCESS:  { bg: '#E0F2FE', fg: '#075985', label: 'Synced' },
    DELETED:       { bg: '#F3F4F6', fg: '#6B7280', label: 'Deleted' },
};

function presetDates(preset: '7d' | '30d' | '90d' | 'ytd'): { startDate: string; endDate: string } {
    const end = new Date();
    let start = new Date();
    if (preset === '7d') start.setDate(end.getDate() - 7);
    else if (preset === '30d') start.setDate(end.getDate() - 30);
    else if (preset === '90d') start.setDate(end.getDate() - 90);
    else if (preset === 'ytd') start = new Date(end.getFullYear(), 0, 1);
    return {
        startDate: start.toISOString().slice(0, 10),
        endDate: end.toISOString().slice(0, 10),
    };
}

function pct(v: number, digits = 1): string { return `${(v * 100).toFixed(digits)}%` }
function pctColor(v: number, warn = 0.7, danger = 0.9): string {
    return v >= danger ? '#DC2626' : v >= warn ? '#F59E0B' : '#16A34A';
}

function buildQs(f: Filters, extra: Record<string, string> = {}): string {
    const qs = new URLSearchParams();
    if (f.startDate) qs.set('start_date', f.startDate);
    if (f.endDate) qs.set('end_date', f.endDate);
    if (f.campaignIds.length > 0) qs.set('campaign_ids', f.campaignIds.join(','));
    if (f.senderIds.length > 0) qs.set('sender_ids', f.senderIds.join(','));
    if (f.accountTypes.length > 0) qs.set('account_types', f.accountTypes.join(','));
    if (f.eventTypes.length > 0) qs.set('event_types', f.eventTypes.join(','));
    if (f.connectionStates.length > 0) qs.set('connection_states', f.connectionStates.join(','));
    for (const [k, v] of Object.entries(extra)) qs.set(k, v);
    return qs.toString();
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function LinkedInAnalyticsPage() {
    const initial = presetDates('30d');
    const [filters, setFilters] = useState<Filters>({
        startDate: initial.startDate,
        endDate: initial.endDate,
        campaignIds: [],
        senderIds: [],
        accountTypes: [],
        eventTypes: [],
        connectionStates: [],
    });
    const [activePreset, setActivePreset] = useState<'7d' | '30d' | '90d' | 'ytd' | 'custom'>('30d');
    const [activeTab, setActiveTab] = useTabState(TABS, 'live');

    const [campaignOptions, setCampaignOptions] = useState<Array<{ value: string; label: string }>>([]);
    const [senderOptions, setSenderOptions] = useState<Array<{ value: string; label: string }>>([]);

    // Bootstrap filter dropdown options once.
    useEffect(() => {
        let cancelled = false;
        Promise.all([
            apiClient<any>('/api/linkedin/analytics/campaign-perf?range=90d').catch(() => []),
            apiClient<any>('/api/linkedin/analytics/sender-perf?range=90d').catch(() => []),
        ]).then(([camps, snds]) => {
            if (cancelled) return;
            setCampaignOptions((Array.isArray(camps) ? camps : []).map((c: any) => ({ value: c.campaign_id, label: c.campaign_name })));
            setSenderOptions((Array.isArray(snds) ? snds : []).map((s: any) => ({ value: s.account_id, label: s.display_name })));
        });
        return () => { cancelled = true; };
    }, []);

    const applyPreset = (p: '7d' | '30d' | '90d' | 'ytd') => {
        const d = presetDates(p);
        setFilters(f => ({ ...f, startDate: d.startDate, endDate: d.endDate }));
        setActivePreset(p);
    };

    const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
    const advancedFilterCount =
        filters.campaignIds.length + filters.senderIds.length + filters.accountTypes.length +
        filters.eventTypes.length + filters.connectionStates.length;

    return (
        <div className="p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Linkedin size={18} strokeWidth={1.75} className="text-[#0A66C2]" /> LinkedIn analytics
                    </h1>
                    <p className="text-xs text-gray-500 mt-0.5">Outreach, signals, and pipeline across your LinkedIn surface.</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {[{ k: '7d', l: '7 days' }, { k: '30d', l: '30 days' }, { k: '90d', l: '90 days' }].map(r => (
                        <button
                            key={r.k}
                            onClick={() => { const d = presetDates(r.k as '7d' | '30d' | '90d'); setFilters(f => ({ ...f, startDate: d.startDate, endDate: d.endDate })); setActivePreset(r.k as '7d' | '30d' | '90d'); }}
                            className="px-2.5 py-1 rounded-md text-[10px] font-semibold cursor-pointer"
                            style={{ background: activePreset === r.k ? '#111827' : '#F3F4F6', color: activePreset === r.k ? '#FFF' : '#4B5563' }}
                        >
                            {r.l}
                        </button>
                    ))}
                    <div className="w-px h-5 bg-gray-200" />
                    <div className="w-36">
                        <DatePicker
                            value={filters.startDate}
                            onChange={(v) => { setFilters(f => ({ ...f, startDate: v })); setActivePreset('custom'); }}
                            placeholder="From"
                        />
                    </div>
                    <span className="text-[10px] text-gray-400">to</span>
                    <div className="w-36">
                        <DatePicker
                            value={filters.endDate}
                            onChange={(v) => { setFilters(f => ({ ...f, endDate: v })); setActivePreset('custom'); }}
                            placeholder="To"
                        />
                    </div>
                    <div className="w-px h-5 bg-gray-200" />
                    <div className="relative">
                        <button
                            onClick={() => setMoreFiltersOpen(o => !o)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-semibold cursor-pointer"
                            style={{ background: moreFiltersOpen || advancedFilterCount > 0 ? '#111827' : '#F3F4F6', color: moreFiltersOpen || advancedFilterCount > 0 ? '#FFF' : '#4B5563' }}
                        >
                            <FilterIcon className="w-3 h-3" />
                            More filters
                            {advancedFilterCount > 0 && (
                                <span className="ml-1 px-1 rounded text-[9px] font-bold" style={{ background: '#FFFFFF', color: '#111827' }}>{advancedFilterCount}</span>
                            )}
                        </button>
                        {moreFiltersOpen && (
                            <MoreFiltersPopover
                                filters={filters}
                                setFilters={setFilters}
                                campaignOptions={campaignOptions}
                                senderOptions={senderOptions}
                                onClose={() => setMoreFiltersOpen(false)}
                            />
                        )}
                    </div>
                </div>
            </div>

            <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

            {activeTab === 'live'              && <LiveTab filters={filters} />}
            {activeTab === 'acceptance-funnel' && <AcceptanceFunnelTab filters={filters} />}
            {activeTab === 'signals-icp'       && <SignalsIcpTab filters={filters} />}
            {activeTab === 'reply-quality'     && <ReplyQualityTab filters={filters} />}
            {activeTab === 'senders'           && <SendersTab filters={filters} />}
            {activeTab === 'step-level'        && <StepLevelTab filters={filters} />}
        </div>
    );
}

// Popover for the multi-select filters (campaigns / senders / account type /
// event type / connection state). Keeps the main header line tight while
// preserving rich filtering for power users.
function MoreFiltersPopover({
    filters, setFilters, campaignOptions, senderOptions, onClose,
}: {
    filters: Filters;
    setFilters: (f: Filters | ((prev: Filters) => Filters)) => void;
    campaignOptions: Array<{ value: string; label: string }>;
    senderOptions: Array<{ value: string; label: string }>;
    onClose: () => void;
}) {
    return (
        <div
            className="absolute right-0 top-full mt-1 z-50 w-[360px] rounded-lg p-3 flex flex-col gap-2.5"
            style={{ background: '#FFFFFF', border: '1px solid #D1CBC5', boxShadow: '0 6px 18px rgba(0,0,0,0.08)' }}
        >
            <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-gray-700">Advanced filters</span>
                <button
                    onClick={() => setFilters(f => ({ ...f, campaignIds: [], senderIds: [], accountTypes: [], eventTypes: [], connectionStates: [] }))}
                    className="text-[10px] font-semibold text-gray-500 hover:text-gray-900 cursor-pointer"
                >
                    Clear all
                </button>
            </div>
            <div>
                <label className="block text-[10px] font-semibold text-gray-600 mb-1">Campaigns</label>
                <MultiSelectDropdown
                    placeholder={campaignOptions.length === 0 ? 'No campaigns' : 'All campaigns'}
                    selected={filters.campaignIds}
                    onChange={(v) => setFilters(f => ({ ...f, campaignIds: v }))}
                    searchable
                    searchPlaceholder="Search campaigns…"
                    options={campaignOptions}
                />
            </div>
            <div>
                <label className="block text-[10px] font-semibold text-gray-600 mb-1">Senders</label>
                <MultiSelectDropdown
                    placeholder={senderOptions.length === 0 ? 'No senders' : 'All senders'}
                    selected={filters.senderIds}
                    onChange={(v) => setFilters(f => ({ ...f, senderIds: v }))}
                    searchable
                    searchPlaceholder="Search senders…"
                    options={senderOptions}
                />
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="block text-[10px] font-semibold text-gray-600 mb-1">Account type</label>
                    <MultiSelectDropdown
                        placeholder="All types"
                        selected={filters.accountTypes}
                        onChange={(v) => setFilters(f => ({ ...f, accountTypes: v }))}
                        options={ACCOUNT_TYPE_OPTIONS}
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-semibold text-gray-600 mb-1">Engagement event</label>
                    <MultiSelectDropdown
                        placeholder="All events"
                        selected={filters.eventTypes}
                        onChange={(v) => setFilters(f => ({ ...f, eventTypes: v }))}
                        options={EVENT_TYPE_OPTIONS}
                    />
                </div>
            </div>
            <div>
                <label className="block text-[10px] font-semibold text-gray-600 mb-1">Connection state</label>
                <MultiSelectDropdown
                    placeholder="Any state"
                    selected={filters.connectionStates}
                    onChange={(v) => setFilters(f => ({ ...f, connectionStates: v }))}
                    options={CONNECTION_STATE_OPTIONS}
                />
            </div>
            <div className="flex justify-end pt-1">
                <button
                    onClick={onClose}
                    className="px-3 py-1.5 rounded-md bg-gray-900 text-white text-[11px] font-semibold hover:bg-gray-800 cursor-pointer"
                >
                    Done
                </button>
            </div>
        </div>
    );
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function useFetch<T>(url: string | null, deps: unknown[]): { data: T | null; loading: boolean; error: string | null } {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        if (!url) { setData(null); return; }
        let cancelled = false;
        setLoading(true);
        setError(null);
        apiClient<T>(url)
            .then(d => { if (!cancelled) setData(d); })
            .catch(err => { if (!cancelled) setError(err?.message || 'Failed to load'); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
    return { data, loading, error };
}

function PanelShell({ title, subtitle, children, action }: { title: string; subtitle?: string; children: React.ReactNode; action?: React.ReactNode }) {
    return (
        <div className="premium-card !p-0 overflow-hidden">
            <div className="px-4 py-3 flex items-center justify-between gap-2 flex-wrap" style={{ borderBottom: '1px solid #D1CBC5' }}>
                <div>
                    <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
                    {subtitle && <p className="text-[11px] text-gray-500 mt-0.5">{subtitle}</p>}
                </div>
                {action}
            </div>
            <div className="p-4">{children}</div>
        </div>
    );
}

function StatusPill({ value }: { value: string }) {
    const meta = STATUS_PILL[value] ?? { bg: '#F3F4F6', fg: '#374151', label: value };
    return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold" style={{ background: meta.bg, color: meta.fg }}>
            {meta.label}
        </span>
    );
}

function CenteredEmpty({ text }: { text: string }) {
    return <div className="text-center text-xs text-gray-500 py-8">{text}</div>;
}

function LoadingBlock() {
    return (
        <div className="flex items-center justify-center py-12 text-xs text-gray-500">
            <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> Loading…
        </div>
    );
}

// ── Tab: Live ─────────────────────────────────────────────────────────────────

function LiveTab({ filters }: { filters: Filters }) {
    const qs = useMemo(() => buildQs(filters), [filters]);
    const kpi = useFetch<KpiData>(`/api/linkedin/analytics/kpi?${qs}`, [qs]);
    const daily = useFetch<DailyPoint[]>(`/api/linkedin/analytics/daily-sent?${qs}`, [qs]);
    const campaigns = useFetch<CampaignPerf[]>(`/api/linkedin/analytics/campaign-perf?${qs}`, [qs]);

    const peak = Math.max(0, ...(daily.data ?? []).map(d => d.count));
    const maxDaily = Math.max(1, peak);

    const KPI_TILES = kpi.data ? [
        { label: 'Invites sent',     value: kpi.data.invites_sent.toLocaleString(),     icon: <Send size={14} />,           tint: 'bg-blue-50 text-blue-700' },
        { label: 'Acceptance rate',  value: pct(kpi.data.acceptance_rate),              icon: <Heart size={14} />,          tint: 'bg-emerald-50 text-emerald-700' },
        { label: 'Reply rate',       value: pct(kpi.data.reply_rate),                   icon: <MessageCircle size={14} />,  tint: 'bg-violet-50 text-violet-700' },
        { label: 'Replies received', value: kpi.data.replies_received.toLocaleString(), icon: <MessageSquare size={14} />,  tint: 'bg-amber-50 text-amber-700' },
    ] : [];

    return (
        <div className="flex flex-col gap-3">
            {kpi.loading || daily.loading ? <LoadingBlock /> : (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {KPI_TILES.map(k => (
                            <div key={k.label} className="premium-card">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[11px] font-semibold text-gray-500">{k.label}</span>
                                    <span className={`px-1.5 py-0.5 rounded ${k.tint}`}>{k.icon}</span>
                                </div>
                                <div className="text-xl font-bold text-gray-900">{k.value}</div>
                            </div>
                        ))}
                    </div>

                    <PanelShell title="Daily invites sent" subtitle={`peak ${peak}/day`}>
                        {!daily.data || daily.data.length === 0 ? <CenteredEmpty text="No invites in this window" /> : (
                            <>
                                <div className="flex items-end gap-1 h-32">
                                    {daily.data!.map(p => {
                                        const d = new Date(p.day);
                                        const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                                        return (
                                            <div key={p.day} className="flex-1 flex flex-col justify-end h-full">
                                                <div
                                                    className="rounded-t"
                                                    style={{ height: `${(p.count / maxDaily) * 100}%`, minHeight: p.count > 0 ? 2 : 0, background: isWeekend ? '#E5E7EB' : '#0A66C2' }}
                                                    title={`${p.day}: ${p.count}`}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="flex items-center gap-4 mt-3 text-[10px] text-gray-500">
                                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm" style={{ background: '#0A66C2' }} /> Weekday</span>
                                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-gray-200" /> Weekend</span>
                                </div>
                            </>
                        )}
                    </PanelShell>

                    <PanelShell title="Campaign performance">
                        {!campaigns.data || campaigns.data.length === 0 ? <CenteredEmpty text="No campaigns with activity" /> : (
                            <CampaignTable rows={campaigns.data!} />
                        )}
                    </PanelShell>
                </>
            )}
        </div>
    );
}

function CampaignTable({ rows }: { rows: CampaignPerf[] }) {
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 10;
    const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    const pageRows = rows.slice(start, start + PAGE_SIZE);
    return (
        <div>
            <table className="w-full">
                <thead>
                    <tr style={{ borderBottom: '1px solid #E8E3DC' }}>
                        <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Campaign</th>
                        <th className="text-right px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Sent</th>
                        <th className="text-right px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">DMs</th>
                        <th className="text-right px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Accept</th>
                        <th className="text-right px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Accept %</th>
                        <th className="text-right px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Skip</th>
                        <th className="text-right px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Fail</th>
                        <th className="text-center px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {pageRows.map(c => (
                        <tr key={c.campaign_id} className="hover:bg-gray-50/50">
                            <td className="px-3 py-2 text-xs font-semibold text-gray-900 max-w-[280px] truncate">{c.campaign_name}</td>
                            <td className="px-3 py-2 text-right text-xs tabular-nums text-gray-700">{c.sent}</td>
                            <td className="px-3 py-2 text-right text-xs tabular-nums text-gray-700">{c.dms_sent}</td>
                            <td className="px-3 py-2 text-right text-xs tabular-nums text-gray-700">{c.accepted}</td>
                            <td className="px-3 py-2 text-right text-xs tabular-nums font-semibold" style={{ color: pctColor(1 - c.accept_rate, 0.7, 0.85) }}>{pct(c.accept_rate)}</td>
                            <td className="px-3 py-2 text-right text-xs tabular-nums text-gray-500">{c.skipped}</td>
                            <td className="px-3 py-2 text-right text-xs tabular-nums text-rose-600">{c.failed}</td>
                            <td className="px-3 py-2 text-center"><span className="text-[10px] text-gray-600 capitalize">{c.status}</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-3 mt-2" style={{ borderTop: '1px solid #E8E3DC' }}>
                    <span className="text-[11px] text-gray-500">Page {safePage} of {totalPages} · {rows.length} campaigns</span>
                    <div className="flex items-center gap-1">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1} className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white text-gray-700 hover:bg-[#FAFAF8] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed" style={{ border: '1px solid #D1CBC5' }}>Prev</button>
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white text-gray-700 hover:bg-[#FAFAF8] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed" style={{ border: '1px solid #D1CBC5' }}>Next</button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Tab: Acceptance funnel ────────────────────────────────────────────────────

function AcceptanceFunnelTab({ filters }: { filters: Filters }) {
    const qs = useMemo(() => buildQs(filters), [filters]);
    const f = useFetch<AcceptanceFunnel>(`/api/linkedin/analytics/acceptance-funnel?${qs}`, [qs]);

    if (f.loading) return <LoadingBlock />;
    if (!f.data || f.data.stages[0].value === 0) return <PanelShell title="Acceptance funnel"><CenteredEmpty text="No funnel data in this window" /></PanelShell>;
    const max = Math.max(1, ...f.data.stages.map(s => s.value));

    return (
        <div className="flex flex-col gap-3">
            <PanelShell title="Acceptance funnel" subtitle={`Overall conversion: ${pct(f.data.overall_conversion, 2)}`}>
                <div className="flex flex-col gap-3">
                    {f.data.stages.map((s, idx) => {
                        const width = (s.value / max) * 100;
                        const prev = idx > 0 ? f.data!.stages[idx - 1] : null;
                        return (
                            <div key={s.label}>
                                <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="font-semibold text-gray-900">{s.label}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="tabular-nums text-gray-700">{s.value.toLocaleString()}</span>
                                        {prev && (
                                            <span className="tabular-nums" style={{ color: pctColor(s.drop_off_from_prev ?? 0) }}>
                                                {pct(s.conversion_from_prev ?? 0)} ↗ · {pct(s.drop_off_from_prev ?? 0)} ↘
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="h-9 rounded-md overflow-hidden" style={{ background: '#F3F4F6' }}>
                                    <div className="h-full transition-all" style={{ width: `${width}%`, background: ['#0A66C2', '#16A34A', '#8B5CF6', '#F59E0B'][idx] }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </PanelShell>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {f.data.stages.map((s, idx) => (
                    <div key={s.label} className="premium-card">
                        <div className="text-[11px] font-semibold text-gray-500">{s.label}</div>
                        <div className="text-xl font-bold text-gray-900 mt-1">{s.value.toLocaleString()}</div>
                        {idx > 0 && (
                            <div className="text-[10px] text-gray-500 mt-1">vs prev: <span style={{ color: pctColor(s.drop_off_from_prev ?? 0) }}>{pct(s.conversion_from_prev ?? 0)}</span></div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Tab: Signals & ICP ────────────────────────────────────────────────────────

function SignalsIcpTab({ filters }: { filters: Filters }) {
    const qs = useMemo(() => buildQs(filters), [filters]);
    const sig = useFetch<SignalLeadPayload>(`/api/linkedin/analytics/signal-lead-funnel?${qs}`, [qs]);
    const tag = useFetch<AutoTagPayload>(`/api/linkedin/analytics/auto-tag-distribution?${qs}`, [qs]);

    if (sig.loading || tag.loading) return <LoadingBlock />;

    const eventEntries = sig.data ? Object.entries(sig.data.event_type_breakdown).map(([k, v]) => ({ name: k, value: v })) : [];
    const eventColors: Record<string, string> = { REACTION: '#0A66C2', COMMENT: '#16A34A', SHARE: '#F59E0B', REPOST: '#8B5CF6' };

    const tagEntries = tag.data ? Object.entries(tag.data.buckets).map(([k, v]) => ({ name: k, value: v })) : [];
    const totalTagged = tagEntries.reduce((s, e) => s + e.value, 0);

    return (
        <div className="flex flex-col gap-3">
            <PanelShell title="Signal → Lead funnel" subtitle={sig.data ? `Overall conversion: ${pct(sig.data.overall_conversion, 3)}` : ''}>
                {!sig.data || sig.data.stages[0].value === 0 ? <CenteredEmpty text="No signal data in this window" /> : (
                    <div className="flex flex-col gap-2.5">
                        {sig.data.stages.map((s, idx) => {
                            const max = Math.max(1, sig.data!.stages[0].value);
                            const width = (s.value / max) * 100;
                            const prev = idx > 0 ? sig.data!.stages[idx - 1] : null;
                            const conv = prev && prev.value > 0 ? s.value / prev.value : null;
                            return (
                                <div key={s.label}>
                                    <div className="flex items-center justify-between text-xs mb-1">
                                        <span className="font-semibold text-gray-900">{s.label}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="tabular-nums text-gray-700">{s.value.toLocaleString()}</span>
                                            {conv !== null && <span className="tabular-nums" style={{ color: pctColor(1 - conv) }}>{pct(conv)}</span>}
                                        </div>
                                    </div>
                                    <div className="h-8 rounded-md overflow-hidden" style={{ background: '#F3F4F6' }}>
                                        <div className="h-full" style={{ width: `${width}%`, background: ['#0A66C2', '#0EA5E9', '#16A34A', '#F59E0B', '#8B5CF6'][idx] }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </PanelShell>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <PanelShell title="Engagement events by type">
                    {eventEntries.every(e => e.value === 0) ? <CenteredEmpty text="No engagement events" /> : (
                        <div style={{ width: '100%', height: 220 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={eventEntries} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40} label={(d: any) => `${d.name} ${d.value}`}>
                                        {eventEntries.map((e, i) => <Cell key={i} fill={eventColors[e.name] ?? '#9CA3AF'} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </PanelShell>

                <PanelShell title="Auto-tag distribution" subtitle={tag.data ? `${totalTagged.toLocaleString()} profiles · ${tag.data.tagged_in_window.toLocaleString()} tagged in window` : ''}>
                    {tagEntries.every(e => e.value === 0) ? <CenteredEmpty text="No tagged profiles" /> : (
                        <div style={{ width: '100%', height: 220 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={tagEntries} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40} label={(d: any) => `${d.name} ${d.value}`}>
                                        {tagEntries.map((e, i) => <Cell key={i} fill={AUTO_TAG_COLORS[e.name] ?? '#9CA3AF'} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </PanelShell>
            </div>
        </div>
    );
}

// ── Tab: Reply quality ────────────────────────────────────────────────────────

function ReplyQualityTab({ filters }: { filters: Filters }) {
    const qs = useMemo(() => buildQs(filters), [filters]);
    const rq = useFetch<ReplyQualityPayload>(`/api/linkedin/analytics/reply-quality?${qs}`, [qs]);
    const [drillClass, setDrillClass] = useState<string | null>(null);

    if (rq.loading) return <LoadingBlock />;
    if (!rq.data || rq.data.total_replies === 0) {
        return <PanelShell title="Reply quality"><CenteredEmpty text="No classified replies in this window" /></PanelShell>;
    }

    const total = rq.data.total_replies;
    const breakdownData = REPLY_CLASS_META.map(m => ({
        ...m, count: rq.data!.breakdown[m.key] || 0, pct: rq.data!.breakdown_pct[m.key] || 0,
    }));

    return (
        <div className="flex flex-col gap-3">
            <PanelShell title="Reply classification" subtitle={`${total.toLocaleString()} total replies in window`}>
                <div className="flex flex-col gap-2">
                    {breakdownData.map(b => (
                        <button
                            key={b.key}
                            onClick={() => setDrillClass(b.key === drillClass ? null : b.key)}
                            className="text-left flex items-center gap-3 rounded-lg p-2 hover:bg-[#FAFAF8] cursor-pointer transition-colors"
                            style={{ border: drillClass === b.key ? '1px solid #111827' : '1px solid #E8E3DC' }}
                        >
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: b.color }} />
                            <div className="w-24 text-xs font-semibold text-gray-900">{b.label}</div>
                            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#F3F4F6' }}>
                                <div className="h-full" style={{ width: `${b.pct * 100}%`, background: b.color }} />
                            </div>
                            <div className="text-xs tabular-nums text-gray-700 w-12 text-right">{b.count}</div>
                            <div className="text-xs tabular-nums font-semibold text-gray-900 w-14 text-right">{pct(b.pct)}</div>
                        </button>
                    ))}
                </div>
            </PanelShell>

            {drillClass && rq.data.samples[drillClass] && (
                <PanelShell title={`Examples — ${REPLY_CLASS_META.find(m => m.key === drillClass)?.label ?? drillClass}`}>
                    {rq.data.samples[drillClass].length === 0 ? <CenteredEmpty text="No samples available" /> : (
                        <div className="flex flex-col gap-2">
                            {rq.data.samples[drillClass].map(s => (
                                <div key={s.agent_run_id} className="rounded-lg p-2.5" style={{ background: '#FAFAF8', border: '1px solid #E8E3DC' }}>
                                    <div className="flex items-center gap-2 text-[11px] text-gray-500 mb-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(s.created_at).toLocaleString()}
                                        {s.confidence != null && <span className="ml-auto font-semibold text-gray-700">conf: {(s.confidence * 100).toFixed(0)}%</span>}
                                    </div>
                                    {s.signals.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {s.signals.map((sig, i) => (
                                                <span key={i} className="text-[10px] font-semibold text-gray-700 rounded-md px-1.5 py-0.5" style={{ background: '#FFFFFF', border: '1px solid #E8E3DC' }}>{sig}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </PanelShell>
            )}
        </div>
    );
}

// ── Tab: Senders ──────────────────────────────────────────────────────────────

function SendersTab({ filters }: { filters: Filters }) {
    const qs = useMemo(() => buildQs(filters), [filters]);
    const cap = useFetch<CapacityRow[]>(`/api/linkedin/analytics/sender-capacity?${qs}`, [qs]);
    const status = useFetch<AccountStatusPayload>(`/api/linkedin/analytics/account-status?${qs}`, [qs]);
    const byType = useFetch<AcceptanceByTypeRow[]>(`/api/linkedin/analytics/acceptance-by-type?${qs}`, [qs]);
    const compliance = useFetch<WorkingHoursRow[]>(`/api/linkedin/analytics/working-hours-compliance?${qs}`, [qs]);
    const perf = useFetch<SenderPerf[]>(`/api/linkedin/analytics/sender-perf?${qs}`, [qs]);
    const affinity = useFetch<AffinityPayload>(`/api/linkedin/analytics/campaign-sender-affinity?${qs}`, [qs]);

    return (
        <div className="flex flex-col gap-3">
            <PanelShell title="Sender capacity" subtitle="today usage / configured cap">
                {cap.loading ? <LoadingBlock /> : !cap.data || cap.data.length === 0 ? <CenteredEmpty text="No senders" /> : (
                    <CapacityHeatmap rows={cap.data!} />
                )}
            </PanelShell>

            <PanelShell title="Account status" subtitle={status.data ? `${status.data.total_accounts} accounts` : ''}>
                {status.loading ? <LoadingBlock /> : !status.data ? <CenteredEmpty text="No status data" /> : (
                    <AccountStatusBlock data={status.data} />
                )}
            </PanelShell>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <PanelShell title="Acceptance by account type">
                    {byType.loading ? <LoadingBlock /> : !byType.data || byType.data.length === 0 ? <CenteredEmpty text="No data" /> : (
                        <div style={{ width: '100%', height: 220 }}>
                            <ResponsiveContainer>
                                <BarChart data={byType.data!} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                                    <XAxis dataKey="account_type" stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                                    <Tooltip formatter={(v: any, n: any) => n === 'accept_rate' ? `${(Number(v) * 100).toFixed(1)}%` : v} />
                                    <Legend wrapperStyle={{ fontSize: 11 }} />
                                    <Bar dataKey="sent" name="Sent" fill="#0A66C2" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="accepted" name="Accepted" fill="#16A34A" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </PanelShell>

                <PanelShell title="Working-hours compliance">
                    {compliance.loading ? <LoadingBlock /> : !compliance.data || compliance.data.length === 0 ? <CenteredEmpty text="No sends in window" /> : (
                        <table className="w-full">
                            <thead>
                                <tr style={{ borderBottom: '1px solid #E8E3DC' }}>
                                    <th className="text-left px-2 py-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Sender</th>
                                    <th className="text-right px-2 py-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">In-hours</th>
                                    <th className="text-right px-2 py-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Out</th>
                                    <th className="text-right px-2 py-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Rate</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {compliance.data!.map(r => (
                                    <tr key={r.account_id}>
                                        <td className="px-2 py-1.5 text-xs text-gray-900 font-semibold truncate max-w-[180px]">{r.display_name}</td>
                                        <td className="px-2 py-1.5 text-right text-xs tabular-nums text-emerald-700">{r.in_hours}</td>
                                        <td className="px-2 py-1.5 text-right text-xs tabular-nums text-rose-600">{r.out_of_hours}</td>
                                        <td className="px-2 py-1.5 text-right text-xs tabular-nums font-semibold" style={{ color: pctColor(1 - r.compliance_rate) }}>{pct(r.compliance_rate)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </PanelShell>
            </div>

            <PanelShell title="Sender performance">
                {perf.loading ? <LoadingBlock /> : !perf.data || perf.data.length === 0 ? <CenteredEmpty text="No senders with activity" /> : (
                    <table className="w-full">
                        <thead>
                            <tr style={{ borderBottom: '1px solid #E8E3DC' }}>
                                <th className="text-left px-2 py-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Sender</th>
                                <th className="text-center px-2 py-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                                <th className="text-right px-2 py-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Sent</th>
                                <th className="text-right px-2 py-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Accepted</th>
                                <th className="text-right px-2 py-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">DMs</th>
                                <th className="text-right px-2 py-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Failed</th>
                                <th className="text-right px-2 py-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Accept %</th>
                                <th className="text-right px-2 py-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Fail %</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {perf.data!.map(s => (
                                <tr key={s.account_id} className="hover:bg-gray-50/50">
                                    <td className="px-2 py-1.5">
                                        <div className="text-xs font-semibold text-gray-900">{s.display_name}</div>
                                        <div className="text-[10px] text-gray-500">{s.account_type.replace(/_/g, ' ')}</div>
                                    </td>
                                    <td className="px-2 py-1.5 text-center"><StatusPill value={s.status} /></td>
                                    <td className="px-2 py-1.5 text-right text-xs tabular-nums text-gray-700">{s.sent}</td>
                                    <td className="px-2 py-1.5 text-right text-xs tabular-nums text-emerald-700">{s.accepted}</td>
                                    <td className="px-2 py-1.5 text-right text-xs tabular-nums text-gray-700">{s.dms_sent}</td>
                                    <td className="px-2 py-1.5 text-right text-xs tabular-nums text-rose-600">{s.failed}</td>
                                    <td className="px-2 py-1.5 text-right text-xs tabular-nums font-semibold" style={{ color: pctColor(1 - s.accept_rate, 0.7, 0.85) }}>{pct(s.accept_rate)}</td>
                                    <td className="px-2 py-1.5 text-right text-xs tabular-nums font-semibold" style={{ color: pctColor(s.fail_rate, 0.05, 0.10) }}>{pct(s.fail_rate)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </PanelShell>

            <PanelShell title="Campaign × sender affinity">
                {affinity.loading ? <LoadingBlock /> : !affinity.data || affinity.data.cells.length === 0 ? <CenteredEmpty text="No activity to map" /> : (
                    <AffinityHeatmap data={affinity.data} />
                )}
            </PanelShell>

            <LinkedInSenderComparisonPanel startDate={filters.startDate} endDate={filters.endDate} />
        </div>
    );
}

function CapacityHeatmap({ rows }: { rows: CapacityRow[] }) {
    const COLS: Array<{ key: keyof CapacityRow['cells']; label: string }> = [
        { key: 'invites_day',   label: 'Invites/day' },
        { key: 'invites_week',  label: 'Invites/week' },
        { key: 'messages',      label: 'Messages' },
        { key: 'inmails',       label: 'InMails' },
        { key: 'profile_views', label: 'Profile views' },
    ];
    const cellColor = (ratio: number) => {
        if (ratio >= 0.9) return { bg: '#FEE2E2', fg: '#B91C1C' };
        if (ratio >= 0.7) return { bg: '#FEF3C7', fg: '#B45309' };
        if (ratio > 0)    return { bg: '#DCFCE7', fg: '#166534' };
        return { bg: '#F3F4F6', fg: '#6B7280' };
    };
    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr style={{ borderBottom: '1px solid #E8E3DC' }}>
                        <th className="text-left px-2 py-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Sender</th>
                        <th className="text-center px-2 py-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                        {COLS.map(c => (
                            <th key={c.key} className="text-center px-2 py-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{c.label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {rows.map(r => (
                        <tr key={r.account_id}>
                            <td className="px-2 py-1.5">
                                <div className="text-xs font-semibold text-gray-900 truncate max-w-[160px]">{r.display_name}</div>
                                <div className="text-[10px] text-gray-500">{r.account_type.replace(/_/g, ' ')}</div>
                            </td>
                            <td className="px-2 py-1.5 text-center"><StatusPill value={r.status} /></td>
                            {COLS.map(c => {
                                const cell = r.cells[c.key];
                                const colors = cellColor(cell.ratio);
                                return (
                                    <td key={c.key} className="px-1 py-1.5 text-center">
                                        <div className="rounded-md px-1.5 py-1 inline-block" style={{ background: colors.bg, color: colors.fg }}>
                                            <div className="text-[10px] tabular-nums font-semibold">{cell.used}/{cell.cap}</div>
                                            <div className="text-[9px] tabular-nums">{(cell.ratio * 100).toFixed(0)}%</div>
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function AccountStatusBlock({ data }: { data: AccountStatusPayload }) {
    const STATUS_KEYS = ['OK', 'CONNECTING', 'CREDENTIALS', 'ERROR', 'SYNC_SUCCESS', 'DELETED'];
    return (
        <div className="flex flex-col gap-3">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {STATUS_KEYS.map(k => {
                    const meta = STATUS_PILL[k];
                    return (
                        <div key={k} className="rounded-lg p-2.5 text-center" style={{ background: meta.bg, border: `1px solid ${meta.fg}22` }}>
                            <div className="text-[10px] font-semibold" style={{ color: meta.fg }}>{meta.label}</div>
                            <div className="text-lg font-bold mt-0.5" style={{ color: meta.fg }}>{data.buckets[k] ?? 0}</div>
                        </div>
                    );
                })}
            </div>
            <table className="w-full">
                <thead>
                    <tr style={{ borderBottom: '1px solid #E8E3DC' }}>
                        <th className="text-left px-2 py-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Account</th>
                        <th className="text-center px-2 py-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                        <th className="text-left px-2 py-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Detail</th>
                        <th className="text-right px-2 py-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Last update</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {data.accounts.slice(0, 15).map(a => (
                        <tr key={a.account_id}>
                            <td className="px-2 py-1.5">
                                <div className="text-xs font-semibold text-gray-900 truncate max-w-[200px]">{a.display_name}</div>
                                <div className="text-[10px] text-gray-500">{a.account_type.replace(/_/g, ' ')}</div>
                            </td>
                            <td className="px-2 py-1.5 text-center"><StatusPill value={a.status} /></td>
                            <td className="px-2 py-1.5 text-[11px] text-gray-600 max-w-[300px] truncate">{a.status_detail ?? '—'}</td>
                            <td className="px-2 py-1.5 text-right text-[11px] text-gray-500">{a.last_status_at ? new Date(a.last_status_at).toLocaleString() : '—'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function AffinityHeatmap({ data }: { data: AffinityPayload }) {
    const max = Math.max(1, ...data.cells.map(c => c.sent));
    const getCell = (campId: string, senderId: string) => data.cells.find(c => c.campaign_id === campId && c.sender_id === senderId);
    return (
        <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: 2 }}>
                <thead>
                    <tr>
                        <th className="text-left px-2 py-1 text-[10px] font-semibold text-gray-500">Campaign \ Sender</th>
                        {data.senders.map(s => (
                            <th key={s.id} className="text-center px-2 py-1 text-[10px] font-semibold text-gray-500 max-w-[120px] truncate">{s.name}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.campaigns.map(c => (
                        <tr key={c.id}>
                            <td className="px-2 py-1 text-xs font-semibold text-gray-900 max-w-[200px] truncate">{c.name}</td>
                            {data.senders.map(s => {
                                const cell = getCell(c.id, s.id);
                                const sent = cell?.sent ?? 0;
                                const intensity = sent / max;
                                const bg = sent === 0 ? '#F9FAFB' : `rgba(10, 102, 194, ${0.15 + intensity * 0.6})`;
                                return (
                                    <td key={s.id} className="px-2 py-1 text-center rounded-md" style={{ background: bg }}>
                                        {sent === 0 ? <span className="text-[10px] text-gray-400">—</span> : (
                                            <>
                                                <div className="text-[10px] tabular-nums font-semibold text-gray-900">{sent}</div>
                                                <div className="text-[9px] tabular-nums text-gray-600">{pct(cell?.accept_rate ?? 0, 0)}</div>
                                            </>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
            <p className="text-[10px] text-gray-500 mt-2">Cell intensity = volume sent · text shows sent + accept %.</p>
        </div>
    );
}

// ── Tab: Step-level ───────────────────────────────────────────────────────────

function StepLevelTab({ filters }: { filters: Filters }) {
    const qs = useMemo(() => buildQs(filters), [filters]);
    const steps = useFetch<StepLevelPayload>(`/api/linkedin/analytics/step-level?${qs}`, [qs]);
    const fails = useFetch<FailureTaxonomy>(`/api/linkedin/analytics/failure-taxonomy?${qs}`, [qs]);

    return (
        <div className="flex flex-col gap-3">
            <PanelShell title="Step execution breakdown" subtitle={steps.data ? `${steps.data.branched} branched executions` : ''}>
                {steps.loading ? <LoadingBlock /> : !steps.data || steps.data.steps.every(s => s.total === 0) ? <CenteredEmpty text="No step executions in window" /> : (
                    <div style={{ width: '100%', height: 280 }}>
                        <ResponsiveContainer>
                            <BarChart data={steps.data.steps.map(s => ({ ...s, label: s.step_type.replace('linkedin_', '').replace('_', ' ') }))} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                                <XAxis dataKey="label" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                                <Tooltip />
                                <Legend wrapperStyle={{ fontSize: 11 }} />
                                <Bar dataKey="sent"     name="Sent"     fill="#16A34A" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="skipped"  name="Skipped"  fill="#94A3B8" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="failed"   name="Failed"   fill="#EF4444" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="branched" name="Branched" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </PanelShell>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <PanelShell title="Skip reasons">
                    {fails.loading ? <LoadingBlock /> : !fails.data || fails.data.skip_reasons.length === 0 ? <CenteredEmpty text="No skips in window" /> : (
                        <FailureList rows={fails.data.skip_reasons.map(r => ({ key: r.reason, count: r.count }))} icon={<AlertTriangle className="w-3 h-3 text-amber-600" />} />
                    )}
                </PanelShell>
                <PanelShell title="Errors">
                    {fails.loading ? <LoadingBlock /> : !fails.data || fails.data.errors.length === 0 ? <CenteredEmpty text="No errors in window" /> : (
                        <FailureList rows={fails.data.errors.map(r => ({ key: r.message, count: r.count }))} icon={<XCircle className="w-3 h-3 text-rose-600" />} />
                    )}
                </PanelShell>
            </div>
        </div>
    );
}

function FailureList({ rows, icon }: { rows: Array<{ key: string; count: number }>; icon: React.ReactNode }) {
    const max = Math.max(1, ...rows.map(r => r.count));
    return (
        <div className="flex flex-col gap-1.5">
            {rows.slice(0, 12).map((r, i) => (
                <div key={i} className="flex items-center gap-2">
                    {icon}
                    <div className="text-[11px] text-gray-700 truncate flex-1" title={r.key}>{r.key}</div>
                    <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: '#F3F4F6' }}>
                        <div className="h-full" style={{ width: `${(r.count / max) * 100}%`, background: '#94A3B8' }} />
                    </div>
                    <div className="text-[11px] font-semibold text-gray-900 tabular-nums w-10 text-right">{r.count}</div>
                </div>
            ))}
        </div>
    );
}

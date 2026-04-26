'use client';

/**
 * Cold Call List page.
 *
 * Two sections:
 *   1. Today's Call List — auto-generated daily, top 100 prospects, CSV download.
 *      Read from a server-side snapshot (cron at 06:00 workspace-local).
 *   2. Custom List — user-defined rules, run-on-demand. CSV download persists
 *      a snapshot for the user's exclude_recent_days dedup.
 *
 * Page header pattern matches the rest of the app post-normalization
 * (`text-xl font-bold` + `text-xs text-gray-500 mt-0.5`).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    PhoneCall,
    Download,
    RefreshCw,
    ChevronDown,
    ChevronRight,
    Loader2,
    Sparkles,
    AlertTriangle,
    Info,
    CheckCircle2,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Prospect {
    campaign_lead_id: string;
    email: string;
    full_name: string | null;
    company: string | null;
    title: string | null;
    phone: string | null;
    linkedin_url: string | null;
    score: number;
    total_opens: number;
    total_clicks: number;
    last_open_at: string | null;
    last_click_at: string | null;
    last_activity_at: string | null;
    reply_status: 'none' | 'replied';
    bounced: boolean;
    unsubscribed: boolean;
    campaign_id: string;
    campaign_name: string;
    last_email_sent_at: string | null;
    subjects_sent: string[];
    reason: string;
}

interface SystemListResponse {
    snapshot_date: string;
    timezone: string;
    generated_at: string | null;
    status: 'success' | 'no_campaigns' | 'no_engagement' | 'error' | 'missing';
    error_message: string | null;
    prospects: Prospect[];
}

interface Settings {
    id: string;
    organization_id: string;
    min_opens: number;
    time_window_days: number;
    require_click: boolean;
    require_no_reply: boolean;
    exclude_recent_days: number;
    title_filter: string | null;
    campaign_filter: string[] | null;
    max_list_size: number;
}

interface CampaignOption {
    id: string;
    name: string;
}

const DEFAULT_SETTINGS: Omit<Settings, 'id' | 'organization_id'> = {
    min_opens: 3,
    time_window_days: 7,
    require_click: false,
    require_no_reply: true,
    exclude_recent_days: 7,
    title_filter: null,
    campaign_filter: null,
    max_list_size: 200,
};

const TIME_WINDOW_OPTIONS = [
    { value: 1, label: 'Last 24 hours' },
    { value: 2, label: 'Last 48 hours' },
    { value: 7, label: 'Last 7 days' },
    { value: 14, label: 'Last 14 days' },
    { value: 30, label: 'Last 30 days' },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ColdCallListPage() {
    const [systemList, setSystemList] = useState<SystemListResponse | null>(null);
    const [systemLoading, setSystemLoading] = useState(true);

    const [settings, setSettings] = useState<Settings | null>(null);
    const [campaigns, setCampaigns] = useState<CampaignOption[]>([]);
    const [rulesOpen, setRulesOpen] = useState(false);

    const [customList, setCustomList] = useState<Prospect[] | null>(null);
    const [customLoading, setCustomLoading] = useState(false);
    const [customGeneratedAt, setCustomGeneratedAt] = useState<string | null>(null);
    const [customDownloadLoading, setCustomDownloadLoading] = useState(false);

    const fetchSystemList = useCallback(async () => {
        setSystemLoading(true);
        try {
            const r = await apiClient<{ success: boolean } & SystemListResponse>('/api/cold-call-list/system');
            setSystemList(r);
        } catch (err) {
            toast.error((err as Error).message || 'Failed to load today’s list');
        } finally {
            setSystemLoading(false);
        }
    }, []);

    const fetchSettings = useCallback(async () => {
        try {
            const r = await apiClient<{ success: boolean; settings: Settings }>('/api/cold-call-list/settings');
            setSettings(r.settings);
            // Auto-expand the rules panel if non-default rules are saved.
            const hasCustomization =
                r.settings.min_opens !== DEFAULT_SETTINGS.min_opens ||
                r.settings.time_window_days !== DEFAULT_SETTINGS.time_window_days ||
                r.settings.require_click !== DEFAULT_SETTINGS.require_click ||
                r.settings.exclude_recent_days !== DEFAULT_SETTINGS.exclude_recent_days ||
                r.settings.title_filter ||
                (r.settings.campaign_filter && r.settings.campaign_filter.length > 0) ||
                r.settings.max_list_size !== DEFAULT_SETTINGS.max_list_size;
            if (hasCustomization) setRulesOpen(true);
        } catch (err) {
            toast.error((err as Error).message || 'Failed to load custom rules');
        }
    }, []);

    const fetchCampaigns = useCallback(async () => {
        try {
            const r = await apiClient<{ success: boolean; campaigns: CampaignOption[] }>('/api/cold-call-list/active-campaigns');
            setCampaigns(r.campaigns);
        } catch {
            // Non-fatal — campaign filter UI will degrade to "all campaigns".
            setCampaigns([]);
        }
    }, []);

    useEffect(() => {
        fetchSystemList();
        fetchSettings();
        fetchCampaigns();
    }, [fetchSystemList, fetchSettings, fetchCampaigns]);

    const downloadSystemCsv = () => {
        // Direct browser navigation triggers the file save dialog and lets
        // express set Content-Disposition headers without us juggling Blobs.
        window.location.href = '/api/cold-call-list/system/csv';
    };

    const saveSettings = useCallback(
        async (next: Partial<Settings>) => {
            if (!settings) return;
            const merged = { ...settings, ...next };
            setSettings(merged);
            try {
                const r = await apiClient<{ success: boolean; settings: Settings }>('/api/cold-call-list/settings', {
                    method: 'PATCH',
                    body: JSON.stringify({
                        min_opens: merged.min_opens,
                        time_window_days: merged.time_window_days,
                        require_click: merged.require_click,
                        require_no_reply: merged.require_no_reply,
                        exclude_recent_days: merged.exclude_recent_days,
                        title_filter: merged.title_filter,
                        campaign_filter: merged.campaign_filter,
                        max_list_size: merged.max_list_size,
                    }),
                });
                setSettings(r.settings);
            } catch (err) {
                toast.error((err as Error).message || 'Failed to save settings');
                fetchSettings();
            }
        },
        [settings, fetchSettings],
    );

    const resetToDefaults = async () => {
        if (!settings) return;
        await saveSettings({
            min_opens: DEFAULT_SETTINGS.min_opens,
            time_window_days: DEFAULT_SETTINGS.time_window_days,
            require_click: DEFAULT_SETTINGS.require_click,
            require_no_reply: DEFAULT_SETTINGS.require_no_reply,
            exclude_recent_days: DEFAULT_SETTINGS.exclude_recent_days,
            title_filter: null,
            campaign_filter: null,
            max_list_size: DEFAULT_SETTINGS.max_list_size,
        });
        toast.success('Reset to defaults');
    };

    const generateCustom = async () => {
        setCustomLoading(true);
        try {
            const r = await apiClient<{ success: boolean; prospects: Prospect[]; generated_at: string }>(
                '/api/cold-call-list/custom/generate',
                { method: 'POST' },
            );
            setCustomList(r.prospects);
            setCustomGeneratedAt(r.generated_at);
        } catch (err) {
            toast.error((err as Error).message || 'Failed to generate list');
        } finally {
            setCustomLoading(false);
        }
    };

    const downloadCustomCsv = async () => {
        // Persist a snapshot, then trigger the actual download by navigating.
        // We can't use window.location for POST, so we fetch + create a Blob.
        setCustomDownloadLoading(true);
        try {
            const res = await fetch('/api/cold-call-list/custom/csv', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const blob = await res.blob();
            const cd = res.headers.get('Content-Disposition') ?? '';
            const m = cd.match(/filename="([^"]+)"/);
            const filename = m ? m[1] : 'superkabe-custom-call-list.csv';
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            toast.success('Downloaded — snapshot saved for dedup');
        } catch (err) {
            toast.error((err as Error).message || 'Failed to download CSV');
        } finally {
            setCustomDownloadLoading(false);
        }
    };

    return (
        <div className="px-6 py-6 max-w-[1400px] mx-auto flex flex-col gap-8">
            {/* Page header */}
            <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <PhoneCall size={18} strokeWidth={1.75} />
                    Cold Call List
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                    High-intent prospects from your active campaigns, ready to dial. Download a CSV for any sales engagement tool.
                </p>
            </div>

            {/* Section 1: Today's Call List */}
            <SystemListSection
                data={systemList}
                loading={systemLoading}
                onDownload={downloadSystemCsv}
                onRefresh={fetchSystemList}
            />

            {/* Section 2: Custom List */}
            <CustomListSection
                settings={settings}
                campaigns={campaigns}
                rulesOpen={rulesOpen}
                onToggleRules={() => setRulesOpen((o) => !o)}
                onChangeSetting={saveSettings}
                onResetDefaults={resetToDefaults}
                customList={customList}
                customLoading={customLoading}
                customGeneratedAt={customGeneratedAt}
                customDownloadLoading={customDownloadLoading}
                onGenerate={generateCustom}
                onDownload={downloadCustomCsv}
            />
        </div>
    );
}

// ─── Section 1 ───────────────────────────────────────────────────────────────

function SystemListSection({
    data,
    loading,
    onDownload,
    onRefresh,
}: {
    data: SystemListResponse | null;
    loading: boolean;
    onDownload: () => void;
    onRefresh: () => void;
}) {
    const generatedHuman = useMemo(() => {
        if (!data?.generated_at) return null;
        const d = new Date(data.generated_at);
        return d.toLocaleString(undefined, {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    }, [data?.generated_at]);

    return (
        <section className="rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        Today’s Call List
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                            <Sparkles size={10} /> Auto-generated
                        </span>
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {generatedHuman
                            ? `Generated automatically at ${generatedHuman}`
                            : data?.status === 'missing'
                              ? 'Today’s list will be generated at 6:00 AM in your timezone.'
                              : 'Generated daily at 6:00 AM in your workspace timezone.'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onRefresh}
                        disabled={loading}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
                        title="Re-read today’s snapshot"
                    >
                        {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                        Refresh
                    </button>
                    <button
                        onClick={onDownload}
                        disabled={!data || data.prospects.length === 0}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 text-white px-3 py-1.5 text-xs font-medium hover:bg-neutral-800 disabled:opacity-50"
                    >
                        <Download size={12} />
                        Download CSV
                    </button>
                </div>
            </div>

            <div className="mt-4">
                {loading && !data ? (
                    <ListSkeleton />
                ) : !data ? (
                    <EmptyState
                        kind="info"
                        title="Couldn’t load today’s list"
                        message="Try refreshing in a moment."
                    />
                ) : data.status === 'no_campaigns' ? (
                    <EmptyState
                        kind="info"
                        title="No active campaigns"
                        message="Create a campaign to start generating daily call lists."
                    />
                ) : data.status === 'error' ? (
                    <EmptyState
                        kind="error"
                        title="Today’s list couldn’t be generated"
                        message={data.error_message || 'Our team has been notified.'}
                    />
                ) : data.status === 'missing' ? (
                    <EmptyState
                        kind="info"
                        title="Today’s list isn’t ready yet"
                        message="The daily generator runs at 6:00 AM in your workspace timezone. Check back shortly."
                    />
                ) : data.prospects.length === 0 ? (
                    <EmptyState
                        kind="info"
                        title="Today’s list is empty"
                        message="Your campaigns are still warming up — high-intent signals (3+ opens or 1 click) haven’t accumulated yet. Check back tomorrow."
                    />
                ) : (
                    <>
                        <div className="text-xs text-gray-500 mb-2">
                            <span className="text-gray-900 font-semibold">{data.prospects.length}</span> prospect{data.prospects.length === 1 ? '' : 's'} ready to call today
                        </div>
                        <ProspectTable prospects={data.prospects} />
                    </>
                )}
            </div>
        </section>
    );
}

// ─── Section 2 ───────────────────────────────────────────────────────────────

function CustomListSection({
    settings,
    campaigns,
    rulesOpen,
    onToggleRules,
    onChangeSetting,
    onResetDefaults,
    customList,
    customLoading,
    customGeneratedAt,
    customDownloadLoading,
    onGenerate,
    onDownload,
}: {
    settings: Settings | null;
    campaigns: CampaignOption[];
    rulesOpen: boolean;
    onToggleRules: () => void;
    onChangeSetting: (next: Partial<Settings>) => void;
    onResetDefaults: () => void;
    customList: Prospect[] | null;
    customLoading: boolean;
    customGeneratedAt: string | null;
    customDownloadLoading: boolean;
    onGenerate: () => void;
    onDownload: () => void;
}) {
    return (
        <section className="rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h2 className="text-base font-bold text-gray-900">Custom List</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Build a list with your own criteria.</p>
                </div>
                <div className="flex items-center gap-2">
                    {customGeneratedAt && (
                        <span className="text-[11px] text-gray-500">
                            Last generated {new Date(customGeneratedAt).toLocaleString(undefined, { hour: 'numeric', minute: '2-digit', month: 'short', day: 'numeric' })}
                        </span>
                    )}
                    {customGeneratedAt && (
                        <button
                            onClick={onGenerate}
                            disabled={customLoading}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
                        >
                            {customLoading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                            Refresh
                        </button>
                    )}
                </div>
            </div>

            {/* Rules panel */}
            <div className="mt-4 rounded-lg border border-neutral-200 overflow-hidden">
                <button
                    onClick={onToggleRules}
                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-neutral-50 cursor-pointer bg-transparent border-none"
                >
                    <span className="text-xs font-semibold text-gray-700 inline-flex items-center gap-1.5">
                        {rulesOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        Rules
                    </span>
                    <span className="text-[10px] text-gray-500">
                        {settings ? rulesSummary(settings) : '…'}
                    </span>
                </button>
                {rulesOpen && settings && (
                    <RulesPanel
                        settings={settings}
                        campaigns={campaigns}
                        onChange={onChangeSetting}
                        onReset={onResetDefaults}
                    />
                )}
            </div>

            {/* Generate / table area */}
            <div className="mt-4">
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={onGenerate}
                        disabled={customLoading || !settings}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 text-white px-3 py-1.5 text-xs font-medium hover:bg-neutral-800 disabled:opacity-50"
                    >
                        {customLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                        {customList ? 'Re-generate' : 'Generate List'}
                    </button>
                    <button
                        onClick={onDownload}
                        disabled={!customList || customList.length === 0 || customDownloadLoading}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
                    >
                        {customDownloadLoading ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                        Download CSV
                    </button>
                </div>

                <div className="mt-3">
                    {customList === null ? (
                        <EmptyState
                            kind="placeholder"
                            title="Click Generate List to see results"
                            message="Your rules will run against today’s engagement data."
                        />
                    ) : customList.length === 0 ? (
                        <EmptyState
                            kind="info"
                            title="No prospects match your criteria"
                            message="Try loosening the rules, or wait for more campaign activity."
                        />
                    ) : (
                        <>
                            <div className="text-xs text-gray-500 mb-2">
                                <span className="text-gray-900 font-semibold">{customList.length}</span> prospect{customList.length === 1 ? '' : 's'} matched
                            </div>
                            <ProspectTable prospects={customList} />
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}

function rulesSummary(s: Settings): string {
    const parts: string[] = [];
    parts.push(`min ${s.min_opens} open${s.min_opens === 1 ? '' : 's'}`);
    parts.push(timeWindowLabel(s.time_window_days).toLowerCase());
    if (s.require_click) parts.push('clicks required');
    if (s.title_filter) parts.push(`title: ${s.title_filter}`);
    const cf = Array.isArray(s.campaign_filter) ? s.campaign_filter : [];
    if (cf.length > 0) parts.push(`${cf.length} campaign${cf.length === 1 ? '' : 's'}`);
    parts.push(`top ${s.max_list_size}`);
    return parts.join(' · ');
}

function timeWindowLabel(days: number): string {
    return TIME_WINDOW_OPTIONS.find((o) => o.value === days)?.label ?? `${days}d`;
}

// ─── Rules panel ─────────────────────────────────────────────────────────────

function RulesPanel({
    settings,
    campaigns,
    onChange,
    onReset,
}: {
    settings: Settings;
    campaigns: CampaignOption[];
    onChange: (next: Partial<Settings>) => void;
    onReset: () => void;
}) {
    // Destructure with explicit defaults. Inline `settings.title_filter ?? ''`
    // tripped a Turbopack TDZ bug ("_settings_title_filter is not defined").
    const minOpens = settings.min_opens ?? 0;
    const timeWindowDays = settings.time_window_days ?? 7;
    const requireClick = settings.require_click ?? false;
    const requireNoReply = settings.require_no_reply ?? true;
    const excludeRecentDays = settings.exclude_recent_days ?? 7;
    const maxListSize = settings.max_list_size ?? 200;
    const titleFilter = settings.title_filter ?? '';

    // campaign_filter is JSONB on the backend — coerce to array to survive
    // any stale {} or non-array shape that might be returned.
    const selectedCampaigns: string[] = Array.isArray(settings.campaign_filter) ? settings.campaign_filter : [];
    const allCampaignsSelected = selectedCampaigns.length === 0;

    return (
        <div className="px-4 py-4 border-t border-neutral-200 bg-neutral-50/40">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Minimum email opens" hint="At least this many opens within the time window.">
                    <input
                        type="number"
                        min={0}
                        max={50}
                        value={minOpens}
                        onChange={(e) => onChange({ min_opens: parseInt(e.target.value || '0', 10) || 0 })}
                        className="w-24 rounded-md border border-neutral-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-400"
                    />
                </Field>

                <Field label="Time window for opens">
                    <select
                        value={timeWindowDays}
                        onChange={(e) => onChange({ time_window_days: parseInt(e.target.value, 10) })}
                        className="rounded-md border border-neutral-200 px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-neutral-400"
                    >
                        {TIME_WINDOW_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                </Field>

                <Field label="Require at least one link click" hint="When on, only prospects with a click qualify.">
                    <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
                        <input
                            type="checkbox"
                            checked={requireClick}
                            onChange={(e) => onChange({ require_click: e.target.checked })}
                            className="rounded border-neutral-300"
                        />
                        Require click
                    </label>
                </Field>

                <Field label="Require no reply received" hint="Excludes prospects who already replied.">
                    <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
                        <input
                            type="checkbox"
                            checked={requireNoReply}
                            onChange={(e) => onChange({ require_no_reply: e.target.checked })}
                            className="rounded border-neutral-300"
                        />
                        Exclude repliers
                    </label>
                </Field>

                <Field label="Exclude prospects from prior custom lists" hint="Days. Avoids redialing the same prospects too often.">
                    <input
                        type="number"
                        min={0}
                        max={90}
                        value={excludeRecentDays}
                        onChange={(e) => onChange({ exclude_recent_days: parseInt(e.target.value || '0', 10) || 0 })}
                        className="w-24 rounded-md border border-neutral-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-400"
                    />
                </Field>

                <Field label="Maximum list size" hint="Range 10–1000.">
                    <input
                        type="number"
                        min={10}
                        max={1000}
                        value={maxListSize}
                        onChange={(e) => onChange({ max_list_size: parseInt(e.target.value || '0', 10) || 0 })}
                        className="w-24 rounded-md border border-neutral-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-400"
                    />
                </Field>

                <Field label="Title contains (optional)" hint="Comma-separated, case-insensitive.">
                    <input
                        type="text"
                        placeholder='e.g. "VP, Director, Head, Chief"'
                        value={titleFilter}
                        onChange={(e) => onChange({ title_filter: e.target.value || null })}
                        className="w-full rounded-md border border-neutral-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-400"
                    />
                </Field>

                <Field label="Campaigns" hint={allCampaignsSelected ? 'All active campaigns' : `${selectedCampaigns.length} selected`}>
                    <div className="flex flex-wrap gap-1.5">
                        <button
                            onClick={() => onChange({ campaign_filter: null })}
                            className={`px-2 py-0.5 rounded text-[10px] font-medium border ${allCampaignsSelected ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'}`}
                        >
                            All
                        </button>
                        {campaigns.map((c) => {
                            const sel = selectedCampaigns.includes(c.id);
                            return (
                                <button
                                    key={c.id}
                                    onClick={() => {
                                        const next = sel ? selectedCampaigns.filter((x) => x !== c.id) : [...selectedCampaigns, c.id];
                                        onChange({ campaign_filter: next.length > 0 ? next : null });
                                    }}
                                    className={`px-2 py-0.5 rounded text-[10px] font-medium border ${sel ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'}`}
                                >
                                    {c.name}
                                </button>
                            );
                        })}
                        {campaigns.length === 0 && (
                            <span className="text-[10px] text-gray-400 italic">No active sequencer campaigns</span>
                        )}
                    </div>
                </Field>
            </div>

            <div className="mt-4 flex items-center justify-between">
                <p className="text-[10px] text-gray-400">Suppression list (unsubscribed / bounced) is always applied.</p>
                <button
                    onClick={onReset}
                    className="text-xs text-gray-600 hover:text-gray-900 underline cursor-pointer bg-transparent border-none"
                >
                    Reset to defaults
                </button>
            </div>
        </div>
    );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-[11px] font-semibold text-gray-700 mb-1">{label}</label>
            {children}
            {hint && <p className="text-[10px] text-gray-400 mt-1">{hint}</p>}
        </div>
    );
}

// ─── Prospect table ──────────────────────────────────────────────────────────

function ProspectTable({ prospects }: { prospects: Prospect[] }) {
    return (
        <div className="overflow-x-auto rounded-lg border border-neutral-200">
            <table className="min-w-full text-xs">
                <thead className="bg-neutral-50">
                    <tr className="text-left text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                        <th className="px-3 py-2">Prospect</th>
                        <th className="px-3 py-2">Company</th>
                        <th className="px-3 py-2">Title</th>
                        <th className="px-3 py-2 text-right">Score</th>
                        <th className="px-3 py-2">Last activity</th>
                        <th className="px-3 py-2">Reason on list</th>
                        <th className="px-3 py-2">Campaign</th>
                        <th className="px-3 py-2"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 bg-white">
                    {prospects.map((p) => (
                        <tr key={p.campaign_lead_id} className={p.bounced || p.unsubscribed || p.reply_status === 'replied' ? 'bg-amber-50/40' : undefined}>
                            <td className="px-3 py-2">
                                <div className="font-semibold text-gray-900">{p.full_name || p.email}</div>
                                <div className="text-[10px] text-gray-500">{p.email}</div>
                            </td>
                            <td className="px-3 py-2 text-gray-700">{p.company || '—'}</td>
                            <td className="px-3 py-2 text-gray-700">{p.title || '—'}</td>
                            <td className="px-3 py-2 text-right">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-100 font-bold text-gray-900 tabular-nums">
                                    {p.score}
                                </span>
                            </td>
                            <td className="px-3 py-2 text-gray-500">{relativeTime(p.last_open_at, p.last_click_at)}</td>
                            <td className="px-3 py-2 text-gray-700">
                                {p.reason}
                                {p.reply_status === 'replied' && (
                                    <span className="ml-1 inline-flex items-center gap-0.5 text-[10px] font-semibold uppercase text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                                        <CheckCircle2 size={10} /> replied
                                    </span>
                                )}
                                {p.unsubscribed && (
                                    <span className="ml-1 inline-flex items-center gap-0.5 text-[10px] font-semibold uppercase text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                                        unsubscribed
                                    </span>
                                )}
                                {p.bounced && (
                                    <span className="ml-1 inline-flex items-center gap-0.5 text-[10px] font-semibold uppercase text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                                        bounced
                                    </span>
                                )}
                            </td>
                            <td className="px-3 py-2 text-gray-700 truncate max-w-[180px]" title={p.campaign_name}>
                                {p.campaign_name}
                            </td>
                            <td className="px-3 py-2">
                                <a
                                    href={`/dashboard/leads?email=${encodeURIComponent(p.email)}`}
                                    className="text-[11px] text-neutral-600 hover:text-neutral-900 underline"
                                >
                                    View
                                </a>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function relativeTime(openIso: string | null, clickIso: string | null): string {
    const ts = [openIso, clickIso].filter(Boolean).map((s) => new Date(s as string).getTime()).sort((a, b) => b - a)[0];
    if (!ts) return '—';
    const diffMs = Date.now() - ts;
    const m = Math.round(diffMs / 60_000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.round(m / 60);
    if (h < 48) return `${h}h ago`;
    const d = Math.round(h / 24);
    return `${d}d ago`;
}

// ─── Empty / loading states ──────────────────────────────────────────────────

function EmptyState({ kind, title, message }: { kind: 'info' | 'error' | 'placeholder'; title: string; message: string }) {
    const Icon = kind === 'error' ? AlertTriangle : kind === 'placeholder' ? Sparkles : Info;
    const tint =
        kind === 'error'
            ? 'border-rose-200 bg-rose-50 text-rose-900'
            : kind === 'placeholder'
              ? 'border-dashed border-neutral-300 bg-neutral-50 text-neutral-700'
              : 'border-neutral-200 bg-neutral-50 text-neutral-700';
    return (
        <div className={`rounded-lg border ${tint} px-4 py-8 text-center`}>
            <Icon size={20} className="mx-auto mb-2 opacity-70" />
            <div className="text-sm font-semibold">{title}</div>
            <div className="text-xs mt-1 opacity-80 max-w-md mx-auto">{message}</div>
        </div>
    );
}

function ListSkeleton() {
    return (
        <div className="space-y-2">
            {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-10 rounded-md bg-neutral-100 animate-pulse" />
            ))}
        </div>
    );
}

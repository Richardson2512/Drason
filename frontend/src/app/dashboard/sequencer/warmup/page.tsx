'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import {
    Flame, Mail, Activity, Pause, Play, Settings as SettingsIcon,
    AlertTriangle, Inbox, MessagesSquare, Shield, Search, ChevronDown,
    LayoutGrid, List as ListIcon, X, ArrowUpDown, RefreshCw, MoreHorizontal,
    Download, Check, Filter, Loader2, ShieldCheck,
} from 'lucide-react';

// ────────────────────────────────────────────────────────────────────────────
// Types - wire the previous mock-driven UI to the real backend shape.
// Backend `health` ∈ {warming, maintenance, paused, error} maps to UI
// `status` ∈ {warming, complete, paused, cooling} (where cooling = error
// state, since the surface visually communicates "needs attention").
// ────────────────────────────────────────────────────────────────────────────

type Status = 'warming' | 'paused' | 'complete' | 'cooling';
type Provider = 'google' | 'microsoft' | 'smtp';
type Health = 'warming' | 'maintenance' | 'paused' | 'error';

interface ConsentResponse { consent: boolean; consentAt: string | null }

interface OverviewResponse {
    consent: ConsentResponse;
    limits: { max_target_daily_per_mailbox: number };
    counts: {
        memberships_total: number;
        memberships_enabled: number;
        memberships_warming: number;
        memberships_maintenance: number;
        memberships_paused: number;
        memberships_error: number;
    };
    today: { sent: number; opened: number; recovered_from_spam: number };
    lifetime: {
        sent: number;
        received: number;
        opened: number;
        replied: number;
        recovered_from_spam: number;
    };
}

interface Membership {
    id: string;
    mailbox_id: string;
    mailbox_email: string;
    mailbox_status: string;
    mailbox_recovery_phase: string;
    provider: Provider;
    enabled: boolean;
    receive_enabled: boolean;
    health: Health;
    start_daily: number;
    target_daily: number;
    ramp_days: number;
    current_daily: number;
    ramp_step: number;
    maintenance_daily: number;
    spam_rate_30d: number | null;
    reputation_score: number;
    inbox_rate: number | null;
    sent_today: number;
    received_today: number;
    total_sent: number;
    total_received: number;
    total_opened: number;
    total_replied: number;
    total_recovered_from_spam: number;
    last_error: string | null;
    joined_at: string;
    updated_at: string;
}

const STATUS_STYLE: Record<Status, { dot: string; bg: string; border: string; text: string; label: string }> = {
    warming:  { dot: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF', label: 'Warming' },
    paused:   { dot: '#9CA3AF', bg: '#F3F4F6', border: '#E5E7EB', text: '#374151', label: 'Paused' },
    complete: { dot: '#10B981', bg: '#ECFDF5', border: '#A7F3D0', text: '#065F46', label: 'Complete' },
    cooling:  { dot: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A', text: '#92400E', label: 'Cooling' },
};

const PROVIDER_LABEL: Record<Provider, string> = { google: 'Google', microsoft: 'Microsoft', smtp: 'SMTP' };

function healthToStatus(h: Health): Status {
    // 'maintenance' → 'complete' because from the operator's UI POV the
    // mailbox has graduated from the ramp; 'error' → 'cooling' because
    // the visual treatment (amber) signals "needs attention" without
    // implying the mailbox is unrecoverable.
    if (h === 'maintenance') return 'complete';
    if (h === 'error') return 'cooling';
    return h;
}

// Provider logos - same inline SVGs as the Sequencer accounts page so they're
// visually consistent across the dashboard.
const GoogleIcon = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

const MicrosoftIcon = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="1" width="10" height="10" fill="#F25022" />
        <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
        <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
        <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
    </svg>
);

const SmtpIcon = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
);

function ProviderAvatar({ provider, size = 28 }: { provider: Provider; size?: number }) {
    const Icon = provider === 'google' ? GoogleIcon : provider === 'microsoft' ? MicrosoftIcon : SmtpIcon;
    const iconSize = Math.max(12, Math.floor(size * 0.6));
    return (
        <span
            className="rounded-md bg-white border border-gray-200 flex items-center justify-center shrink-0"
            style={{ width: size, height: size }}
            title={PROVIDER_LABEL[provider]}
        >
            <Icon size={iconSize} />
        </span>
    );
}

// Relative-time formatter for "last update" - keeps the UX feel of the
// previous mock without bringing in date-fns.
function relativeTime(iso: string): string {
    const ms = Date.now() - new Date(iso).getTime();
    if (ms < 60_000) return 'just now';
    const m = Math.floor(ms / 60_000);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
}

type SortKey = 'last_update' | 'reputation_desc' | 'reputation_asc' | 'days_warmed' | 'daily_limit' | 'email_az';
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: 'last_update',     label: 'Last update'        },
    { key: 'reputation_desc', label: 'Reputation: high → low' },
    { key: 'reputation_asc',  label: 'Reputation: low → high' },
    { key: 'days_warmed',     label: 'Days warmed'        },
    { key: 'daily_limit',     label: 'Daily volume'       },
    { key: 'email_az',        label: 'Email A → Z'        },
];

const STATUS_FILTER_OPTIONS: { key: Status | 'all'; label: string; tone?: 'green' | 'amber' | 'gray' | 'blue' }[] = [
    { key: 'all',      label: 'All statuses' },
    { key: 'warming',  label: 'Warming',  tone: 'blue' },
    { key: 'cooling',  label: 'Cooling',  tone: 'amber' },
    { key: 'paused',   label: 'Paused',   tone: 'gray' },
    { key: 'complete', label: 'Complete', tone: 'green' },
];

const PROVIDER_FILTER_OPTIONS: { key: Provider | 'all'; label: string }[] = [
    { key: 'all',       label: 'All providers' },
    { key: 'google',    label: 'Google' },
    { key: 'microsoft', label: 'Microsoft' },
    { key: 'smtp',      label: 'SMTP' },
];

// ────────────────────────────────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────────────────────────────────

export default function WarmupPage() {
    const [overview, setOverview] = useState<OverviewResponse | null>(null);
    const [memberships, setMemberships] = useState<Membership[]>([]);
    const [loading, setLoading] = useState(true);
    const [busyConsent, setBusyConsent] = useState(false);

    // Filters / sort / view (UI state - same shape as before)
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
    const [providerFilter, setProviderFilter] = useState<Provider | 'all'>('all');
    const [sortKey, setSortKey] = useState<SortKey>('last_update');
    const [view, setView] = useState<'grid' | 'list'>('list');
    const [showSideRail, setShowSideRail] = useState(false);

    // Selection
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Per-mailbox config modal
    const [editingId, setEditingId] = useState<string | null>(null);
    // Org-wide pool config modal - single-click bulk update for every mailbox
    const [showPoolConfig, setShowPoolConfig] = useState(false);

    const refresh = useCallback(async () => {
        try {
            const [ov, ms] = await Promise.all([
                apiClient<OverviewResponse>('/api/sequencer/warmup/overview'),
                apiClient<Membership[]>('/api/sequencer/warmup/memberships'),
            ]);
            setOverview(ov);
            setMemberships(ms);
        } catch (err: any) {
            toast.error(err?.message || 'Failed to load warmup data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    const setConsent = async (consent: boolean) => {
        setBusyConsent(true);
        try {
            await apiClient('/api/sequencer/warmup/consent', {
                method: 'POST',
                body: JSON.stringify({ consent }),
            });
            toast.success(consent ? 'Joined warmup pool' : 'Left warmup pool');
            await refresh();
        } catch (err: any) {
            toast.error(err?.message || 'Failed to update consent');
        } finally {
            setBusyConsent(false);
        }
    };

    const toggleMembership = async (id: string, current: boolean) => {
        try {
            await apiClient(`/api/sequencer/warmup/memberships/${id}/toggle`, {
                method: 'POST',
                body: JSON.stringify({ enabled: !current }),
            });
            await refresh();
        } catch (err: any) {
            toast.error(err?.message || 'Toggle failed');
        }
    };

    // Bulk actions - call toggle in parallel.
    const bulkSetEnabled = async (ids: string[], enabled: boolean) => {
        await Promise.all(
            ids.map(id => apiClient(`/api/sequencer/warmup/memberships/${id}/toggle`, {
                method: 'POST',
                body: JSON.stringify({ enabled }),
            }).catch(() => null)),
        );
        toast.success(`${enabled ? 'Resumed' : 'Paused'} ${ids.length} mailbox${ids.length === 1 ? '' : 'es'}`);
        setSelectedIds(new Set());
        await refresh();
    };

    // ── Filtered + sorted view (uses real membership data) ──────────────
    const visibleMailboxes = useMemo(() => {
        let rows = memberships;
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            rows = rows.filter(m => m.mailbox_email.toLowerCase().includes(q));
        }
        if (statusFilter !== 'all') {
            rows = rows.filter(m => healthToStatus(m.health) === statusFilter);
        }
        if (providerFilter !== 'all') {
            rows = rows.filter(m => m.provider === providerFilter);
        }

        const sorted = [...rows];
        switch (sortKey) {
            case 'reputation_desc': sorted.sort((a, b) => b.reputation_score - a.reputation_score); break;
            case 'reputation_asc':  sorted.sort((a, b) => a.reputation_score - b.reputation_score); break;
            case 'days_warmed':     sorted.sort((a, b) => b.ramp_step - a.ramp_step); break;
            case 'daily_limit':     sorted.sort((a, b) => b.current_daily - a.current_daily); break;
            case 'email_az':        sorted.sort((a, b) => a.mailbox_email.localeCompare(b.mailbox_email)); break;
            case 'last_update':
            default:                sorted.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()); break;
        }
        return sorted;
    }, [memberships, search, statusFilter, providerFilter, sortKey]);

    const isFiltered = search.trim() !== '' || statusFilter !== 'all' || providerFilter !== 'all';
    const statsSource = isFiltered ? visibleMailboxes : memberships;
    const warmingCount  = statsSource.filter(m => healthToStatus(m.health) === 'warming').length;
    const completeCount = statsSource.filter(m => healthToStatus(m.health) === 'complete').length;
    const coolingCount  = statsSource.filter(m => healthToStatus(m.health) === 'cooling').length;
    const pausedCount   = statsSource.filter(m => healthToStatus(m.health) === 'paused').length;
    const totalSentToday = statsSource.reduce((s, m) => s + m.sent_today, 0);
    const avgReputation = statsSource.length > 0 ? statsSource.reduce((s, m) => s + m.reputation_score, 0) / statsSource.length : 0;
    const inboxes = statsSource.map(m => m.inbox_rate).filter((v): v is number => v != null);
    const avgInboxRate = inboxes.length > 0 ? inboxes.reduce((s, v) => s + v, 0) / inboxes.length : 0;

    // Selection helpers
    const allSelected = visibleMailboxes.length > 0 && visibleMailboxes.every(m => selectedIds.has(m.id));
    const someSelected = !allSelected && visibleMailboxes.some(m => selectedIds.has(m.id));
    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedIds(prev => {
                const next = new Set(prev);
                visibleMailboxes.forEach(m => next.delete(m.id));
                return next;
            });
        } else {
            setSelectedIds(prev => {
                const next = new Set(prev);
                visibleMailboxes.forEach(m => next.add(m.id));
                return next;
            });
        }
    };
    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const resetFilters = () => {
        setSearch('');
        setStatusFilter('all');
        setProviderFilter('all');
        setSortKey('last_update');
    };

    // Pre-compute filter labels - extracted out of JSX template literals
    // to dodge a Turbopack/SWC bug where `?.x ?? y` inside template strings
    // emits a reference to an undefined `_ref`.
    const statusOption = STATUS_FILTER_OPTIONS.find(o => o.key === statusFilter);
    const statusFilterLabel = statusFilter === 'all' ? 'Status' : (statusOption ? statusOption.label : 'Status');
    const providerFilterLabel = providerFilter === 'all' ? 'Provider' : PROVIDER_LABEL[providerFilter];
    const sortOption = SORT_OPTIONS.find(s => s.key === sortKey);
    const sortLabel = `Sort: ${sortOption ? sortOption.label : ''}`;

    if (loading) {
        return (
            <div className="p-8 flex items-center gap-2 text-sm text-gray-500">
                <Loader2 size={14} className="animate-spin" /> Loading warmup data…
            </div>
        );
    }

    const consentOn = !!overview?.consent?.consent;

    return (
        <div className="px-6 py-6">
            {/* ── Header ───────────────────────────────────────────────────── */}
            <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Flame size={20} className="text-orange-500" />
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Warmup</h1>
                    </div>
                    <p className="text-xs text-gray-500 max-w-2xl">
                        Each mailbox sends and receives synthetic templated emails inside our cross-tenant warmup network - recipients open, reply, and rescue from spam to build sender reputation gradually.
                    </p>
                </div>
                <div className="flex gap-1.5">
                    <button
                        onClick={() => setShowSideRail(!showSideRail)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                        <Activity size={11} />
                        How it works
                    </button>
                    <button
                        onClick={() => setShowPoolConfig(true)}
                        disabled={memberships.length === 0}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        title={memberships.length === 0 ? 'No mailboxes to configure' : 'Apply ramp config to every mailbox in this workspace'}
                    >
                        <SettingsIcon size={11} />
                        Pool config
                    </button>
                    <button
                        onClick={() => refresh()}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                        <RefreshCw size={11} /> Refresh
                    </button>
                </div>
            </div>

            {/* ── Workspace consent gate ────────────────────────────────────── */}
            {!consentOn && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                        <ShieldCheck size={14} className="text-amber-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-xs font-bold text-amber-900 m-0 mb-0.5">Join the cross-tenant warmup pool</h2>
                        <p className="text-[11px] text-amber-900/80 m-0 mb-2 leading-relaxed">
                            Mailboxes are auto-enrolled but won&apos;t send or receive warmup traffic until you opt in. By joining, your mailboxes exchange synthetic templated emails with other Superkabe customers&apos; mailboxes - content is templated and synthetic, never customer data. You can leave anytime.
                        </p>
                        <button
                            onClick={() => setConsent(true)}
                            disabled={busyConsent}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-full bg-amber-700 hover:bg-amber-800 text-white disabled:opacity-50"
                        >
                            {busyConsent && <Loader2 size={10} className="animate-spin" />}
                            Join warmup pool
                        </button>
                    </div>
                </div>
            )}

            {/* ── Aggregate stats ─────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <StatCard
                    label={isFiltered ? 'Warming (filtered)' : 'Warming'}
                    value={warmingCount}
                    icon={<Flame size={14} />}
                    sub={coolingCount > 0 ? `${coolingCount} cooling · ${pausedCount} paused` : pausedCount > 0 ? `${pausedCount} paused` : 'all on ramp'}
                    subTone={coolingCount > 0 ? 'amber' : pausedCount > 0 ? 'gray' : 'green'}
                />
                <StatCard
                    label="Avg reputation"
                    value={avgReputation.toFixed(0)}
                    icon={<Shield size={14} />}
                    sub={avgReputation >= 80 ? 'strong fleet' : avgReputation >= 60 ? 'building' : 'attention needed'}
                    subTone={avgReputation >= 80 ? 'green' : avgReputation >= 60 ? 'amber' : 'red'}
                />
                <StatCard
                    label="Inbox placement"
                    value={inboxes.length === 0 ? '-' : `${(avgInboxRate * 100).toFixed(1)}%`}
                    icon={<Inbox size={14} />}
                    sub={inboxes.length === 0 ? 'no signal yet' : avgInboxRate >= 0.9 ? 'within target' : 'below target'}
                    subTone={inboxes.length === 0 ? 'gray' : avgInboxRate >= 0.9 ? 'green' : 'amber'}
                />
                <StatCard
                    label="Warmup sends · today"
                    value={totalSentToday.toLocaleString()}
                    icon={<Mail size={14} />}
                    sub={`${completeCount} mailbox${completeCount === 1 ? '' : 'es'} graduated`}
                    subTone="green"
                />
            </div>

            {/* ── Toolbar (search · filters · sort · view) ─────────────────── */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
                <div className="relative flex-1 min-w-[220px]">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by email…"
                        className="w-full pl-9 pr-8 py-2 text-[12px] border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 bg-white"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-700 rounded"
                        >
                            <X size={12} />
                        </button>
                    )}
                </div>

                <FilterDropdown
                    icon={<Filter size={11} />}
                    label={statusFilterLabel}
                    active={statusFilter !== 'all'}
                    options={STATUS_FILTER_OPTIONS.map(o => ({
                        key: o.key,
                        label: o.label,
                        leading: o.key !== 'all' ? (
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_STYLE[o.key as Status].dot }} />
                        ) : undefined,
                    }))}
                    selected={statusFilter}
                    onSelect={k => setStatusFilter(k as Status | 'all')}
                />

                <FilterDropdown
                    label={providerFilterLabel}
                    active={providerFilter !== 'all'}
                    options={PROVIDER_FILTER_OPTIONS.map(o => ({ key: o.key, label: o.label }))}
                    selected={providerFilter}
                    onSelect={k => setProviderFilter(k as Provider | 'all')}
                />

                <FilterDropdown
                    icon={<ArrowUpDown size={11} />}
                    label={sortLabel}
                    options={SORT_OPTIONS.map(o => ({ key: o.key, label: o.label }))}
                    selected={sortKey}
                    onSelect={k => setSortKey(k as SortKey)}
                />

                <div className="inline-flex items-center rounded-lg border border-gray-200 bg-white overflow-hidden">
                    <button
                        onClick={() => setView('list')}
                        className={`px-2.5 py-1.5 transition-colors ${view === 'list' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                        title="List view"
                    >
                        <ListIcon size={12} />
                    </button>
                    <button
                        onClick={() => setView('grid')}
                        className={`px-2.5 py-1.5 transition-colors ${view === 'grid' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                        title="Grid view"
                    >
                        <LayoutGrid size={12} />
                    </button>
                </div>
            </div>

            {/* ── Active filter chips ─────────────────────────────────────── */}
            {isFiltered && (
                <div className="flex flex-wrap items-center gap-1.5 mb-3 text-[10px]">
                    <span className="font-bold text-gray-500 uppercase tracking-wider">Filters:</span>
                    {search.trim() && <FilterChip label={`"${search}"`} onClear={() => setSearch('')} />}
                    {statusFilter !== 'all' && <FilterChip label={`Status: ${STATUS_STYLE[statusFilter as Status].label}`} onClear={() => setStatusFilter('all')} />}
                    {providerFilter !== 'all' && <FilterChip label={`Provider: ${PROVIDER_LABEL[providerFilter]}`} onClear={() => setProviderFilter('all')} />}
                    <button
                        onClick={resetFilters}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-gray-500 hover:bg-gray-100 transition-colors font-semibold"
                    >
                        <RefreshCw size={9} />
                        Reset all
                    </button>
                    <span className="ml-auto text-gray-400 font-medium">
                        Showing {visibleMailboxes.length} of {memberships.length}
                    </span>
                </div>
            )}

            {/* ── Bulk actions bar ────────────────────────────────────────── */}
            {selectedIds.size > 0 && (
                <div className="flex items-center justify-between gap-3 px-4 py-2.5 mb-3 rounded-xl bg-gray-900 text-white shadow-sm sticky top-2 z-20">
                    <div className="text-[12px] font-semibold">
                        {selectedIds.size} mailbox{selectedIds.size === 1 ? '' : 'es'} selected
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => bulkSetEnabled(Array.from(selectedIds), false)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/10 hover:bg-white/20 transition-colors"
                        >
                            <Pause size={10} /> Pause
                        </button>
                        <button
                            onClick={() => bulkSetEnabled(Array.from(selectedIds), true)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/10 hover:bg-white/20 transition-colors"
                        >
                            <Play size={10} /> Resume
                        </button>
                        <span className="w-px h-4 bg-white/20 mx-0.5" />
                        <button
                            onClick={() => setSelectedIds(new Set())}
                            className="px-2 py-1 rounded-full text-[10px] font-semibold hover:bg-white/10 transition-colors"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )}

            {/* ── Body grid: list/grid + optional side rail ────────────────── */}
            <div className={`grid gap-4 ${showSideRail ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
                <div className={showSideRail ? 'lg:col-span-2' : ''}>
                    {visibleMailboxes.length === 0 ? (
                        <EmptyResults onReset={resetFilters} />
                    ) : view === 'list' ? (
                        <ListView
                            mailboxes={visibleMailboxes}
                            selectedIds={selectedIds}
                            allSelected={allSelected}
                            someSelected={someSelected}
                            onToggleSelectAll={toggleSelectAll}
                            onToggleSelect={toggleSelect}
                            expandedId={expandedId}
                            onToggleExpand={id => setExpandedId(expandedId === id ? null : id)}
                            onToggleEnabled={toggleMembership}
                            onConfigure={id => setEditingId(id)}
                        />
                    ) : (
                        <GridView
                            mailboxes={visibleMailboxes}
                            selectedIds={selectedIds}
                            onToggleSelect={toggleSelect}
                            onToggleEnabled={toggleMembership}
                            onConfigure={id => setEditingId(id)}
                        />
                    )}
                </div>

                {showSideRail && (
                    <div className="space-y-3">
                        <div className="bg-white rounded-2xl border border-gray-200 p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Activity size={14} className="text-gray-700" />
                                    <h3 className="text-xs font-bold text-gray-900">How warmup works</h3>
                                </div>
                                <button onClick={() => setShowSideRail(false)} className="p-0.5 text-gray-400 hover:text-gray-700">
                                    <X size={12} />
                                </button>
                            </div>
                            <ol className="space-y-2.5 text-[11px] text-gray-600 leading-relaxed">
                                <Step n={1}>
                                    <strong className="text-gray-900">Connect a mailbox.</strong> Provider OAuth or SMTP creds - we auto-enroll on connection.
                                </Step>
                                <Step n={2}>
                                    <strong className="text-gray-900">Join the cross-tenant pool.</strong> Your mailboxes exchange synthetic templated emails with other Superkabe customers&apos; mailboxes - opens, replies, spam-rescues.
                                </Step>
                                <Step n={3}>
                                    <strong className="text-gray-900">Ramp daily volume.</strong> Default 5 → 50 emails/day over 21 days. Spam-folder drops slow the ramp.
                                </Step>
                                <Step n={4}>
                                    <strong className="text-gray-900">Maintenance.</strong> After ramp completes, mailbox drops to ~10/day indefinitely to keep reputation warm.
                                </Step>
                            </ol>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-200 p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <MessagesSquare size={14} className="text-gray-700" />
                                <h3 className="text-xs font-bold text-gray-900">Pool stats</h3>
                            </div>
                            {(() => {
                                // Hoisted outside JSX expressions to dodge a Turbopack/SWC
                                // transpile bug where optional-chaining inside `v={...}` emits
                                // an undeclared `_ref` temporary.
                                const counts = overview?.counts;
                                const lifetime = overview?.lifetime;
                                const today = overview?.today;
                                const membershipsTotal = counts ? counts.memberships_total : 0;
                                const membershipsEnabled = counts ? counts.memberships_enabled : 0;
                                const recovered = lifetime ? lifetime.recovered_from_spam : 0;
                                const sentToday = today ? today.sent : 0;
                                return (
                                    <div className="space-y-2 text-[11px]">
                                        <KvRow k="Mailboxes (this org)" v={String(membershipsTotal ?? 0)} />
                                        <KvRow k="Active senders" v={String(membershipsEnabled ?? 0)} />
                                        <KvRow k="Spam recovered (lifetime)" v={String(recovered ?? 0)} />
                                        <KvRow k="Sent today (org-wide)" v={String(sentToday ?? 0)} />
                                    </div>
                                );
                            })()}
                        </div>

                        {overview?.consent?.consent && (
                            <button
                                onClick={() => setConsent(false)}
                                disabled={busyConsent}
                                className="w-full text-[11px] text-gray-500 hover:text-red-700 font-semibold py-2 border border-dashed border-gray-200 rounded-xl"
                            >
                                Leave warmup pool
                            </button>
                        )}
                    </div>
                )}
            </div>

            {editingId && overview && memberships.find(m => m.id === editingId) && (
                <ConfigModal
                    membership={memberships.find(m => m.id === editingId)!}
                    maxTargetDaily={overview.limits.max_target_daily_per_mailbox}
                    onClose={() => setEditingId(null)}
                    onSaved={async () => { setEditingId(null); await refresh(); }}
                />
            )}

            {showPoolConfig && overview && (
                <PoolConfigModal
                    mailboxCount={memberships.length}
                    maxTargetDaily={overview.limits.max_target_daily_per_mailbox}
                    onClose={() => setShowPoolConfig(false)}
                    onSaved={async () => { setShowPoolConfig(false); await refresh(); }}
                />
            )}
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────────────
// List view
// ────────────────────────────────────────────────────────────────────────────

interface ListViewProps {
    mailboxes: Membership[];
    selectedIds: Set<string>;
    allSelected: boolean;
    someSelected: boolean;
    onToggleSelectAll: () => void;
    onToggleSelect: (id: string) => void;
    expandedId: string | null;
    onToggleExpand: (id: string) => void;
    onToggleEnabled: (id: string, current: boolean) => void;
    onConfigure: (id: string) => void;
}

function ListView({ mailboxes, selectedIds, allSelected, someSelected, onToggleSelectAll, onToggleSelect, expandedId, onToggleExpand, onToggleEnabled, onConfigure }: ListViewProps) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-12 gap-3 px-4 py-2.5 border-b border-gray-100 bg-gray-50/60 text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                <div className="col-span-5 flex items-center gap-2.5">
                    <Checkbox checked={allSelected} indeterminate={someSelected} onChange={onToggleSelectAll} />
                    <span>Mailbox</span>
                </div>
                <div className="col-span-1">Status</div>
                <div className="col-span-2">Reputation</div>
                <div className="col-span-2">Days on ramp</div>
                <div className="col-span-2">Daily volume</div>
            </div>

            {mailboxes.map(m => {
                const status = healthToStatus(m.health);
                const style = STATUS_STYLE[status];
                const isSelected = selectedIds.has(m.id);
                const isExpanded = expandedId === m.id;
                const progress = m.ramp_days > 0 ? (m.ramp_step / m.ramp_days) * 100 : 100;
                const dailyProgress = m.target_daily > 0 ? (m.current_daily / m.target_daily) * 100 : 0;
                return (
                    <div key={m.id} className={`border-b border-gray-100 last:border-0 ${isSelected ? 'bg-blue-50/30' : 'hover:bg-gray-50/50'} transition-colors`}>
                        <div
                            onClick={() => onToggleExpand(m.id)}
                            className="grid grid-cols-12 gap-3 px-4 py-3 items-center cursor-pointer"
                        >
                            <div className="col-span-5 flex items-center gap-2.5 min-w-0">
                                <span onClick={e => e.stopPropagation()}>
                                    <Checkbox checked={isSelected} onChange={() => onToggleSelect(m.id)} />
                                </span>
                                <ProviderAvatar provider={m.provider} size={28} />
                                <div className="min-w-0">
                                    <div className="text-[12px] font-semibold text-gray-900 truncate">{m.mailbox_email}</div>
                                    <div className="text-[10px] text-gray-500 truncate">
                                        {PROVIDER_LABEL[m.provider]} · {relativeTime(m.updated_at)}
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-1">
                                <span
                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                                    style={{ background: style.bg, color: style.text, border: `1px solid ${style.border}` }}
                                >
                                    <span className="w-1 h-1 rounded-full" style={{ background: style.dot }} />
                                    {style.label}
                                </span>
                            </div>
                            <div className="col-span-2">
                                <div className="flex items-baseline gap-1.5">
                                    <span
                                        className="text-sm font-bold"
                                        style={{
                                            color: m.reputation_score >= 80 ? '#065F46' : m.reputation_score >= 60 ? '#92400E' : '#991B1B',
                                        }}
                                    >
                                        {m.reputation_score}
                                    </span>
                                    <span className="text-[9px] text-gray-400">/ 100</span>
                                </div>
                            </div>
                            <div className="col-span-2">
                                <Bar progress={progress} color={style.dot} />
                                <div className="text-[9px] text-gray-500 mt-0.5">{m.ramp_step}/{m.ramp_days}d</div>
                            </div>
                            <div className="col-span-2 flex items-center gap-2">
                                <div className="flex-1">
                                    <Bar progress={dailyProgress} color={style.dot} />
                                    <div className="text-[9px] text-gray-500 mt-0.5">{m.current_daily}/{m.target_daily}</div>
                                </div>
                                <ChevronDown
                                    size={12}
                                    className={`text-gray-400 transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                                />
                            </div>
                        </div>

                        {isExpanded && (
                            <div className="px-4 pb-3 pt-1 bg-gray-50/40 grid grid-cols-2 md:grid-cols-6 gap-3 border-t border-gray-100">
                                <MiniStat label="Inbox" value={m.inbox_rate == null ? '-' : `${(m.inbox_rate * 100).toFixed(1)}%`} accent={m.inbox_rate == null ? undefined : m.inbox_rate >= 0.9 ? 'green' : 'amber'} />
                                <MiniStat label="Spam (30d)" value={m.spam_rate_30d == null ? '-' : `${(m.spam_rate_30d * 100).toFixed(1)}%`} accent={m.spam_rate_30d == null ? undefined : m.spam_rate_30d < 0.05 ? 'green' : 'red'} />
                                <MiniStat label="Sent today" value={String(m.sent_today)} />
                                <MiniStat label="Received today" value={String(m.received_today)} />
                                <MiniStat label="Recovered (life)" value={String(m.total_recovered_from_spam)} accent="green" />
                                <div className="flex items-center gap-1.5 justify-end" onClick={e => e.stopPropagation()}>
                                    <button
                                        onClick={() => onToggleEnabled(m.id, m.enabled)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold text-gray-700 border border-gray-200 hover:bg-white transition-colors"
                                    >
                                        {!m.enabled ? <><Play size={10} /> Resume</> : <><Pause size={10} /> Pause</>}
                                    </button>
                                    <button
                                        onClick={() => onConfigure(m.id)}
                                        className="p-1 rounded-md hover:bg-gray-100 text-gray-500"
                                        title="Configure ramp"
                                    >
                                        <SettingsIcon size={12} />
                                    </button>
                                    <button className="p-1 rounded-md hover:bg-gray-100 text-gray-500" title="More">
                                        <MoreHorizontal size={12} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────────────
// Grid view (richer cards)
// ────────────────────────────────────────────────────────────────────────────

interface GridViewProps {
    mailboxes: Membership[];
    selectedIds: Set<string>;
    onToggleSelect: (id: string) => void;
    onToggleEnabled: (id: string, current: boolean) => void;
    onConfigure: (id: string) => void;
}

function GridView({ mailboxes, selectedIds, onToggleSelect, onToggleEnabled, onConfigure }: GridViewProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {mailboxes.map(m => {
                const status = healthToStatus(m.health);
                const style = STATUS_STYLE[status];
                const isSelected = selectedIds.has(m.id);
                const progress = m.ramp_days > 0 ? (m.ramp_step / m.ramp_days) * 100 : 100;
                const dailyProgress = m.target_daily > 0 ? (m.current_daily / m.target_daily) * 100 : 0;
                return (
                    <div
                        key={m.id}
                        className={`bg-white rounded-2xl border p-4 transition-all ${
                            isSelected ? 'border-gray-900 shadow-sm' : 'border-gray-200 hover:border-gray-400'
                        }`}
                    >
                        <div className="flex items-start gap-2.5 mb-3">
                            <div onClick={e => e.stopPropagation()}>
                                <Checkbox checked={isSelected} onChange={() => onToggleSelect(m.id)} />
                            </div>
                            <ProviderAvatar provider={m.provider} size={32} />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                    <span className="text-[12px] font-bold text-gray-900 truncate">{m.mailbox_email}</span>
                                </div>
                                <div className="text-[10px] text-gray-500">{PROVIDER_LABEL[m.provider]} · {relativeTime(m.updated_at)}</div>
                            </div>
                            <span
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0"
                                style={{ background: style.bg, color: style.text, border: `1px solid ${style.border}` }}
                            >
                                <span className="w-1 h-1 rounded-full" style={{ background: style.dot }} />
                                {style.label}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-3 pb-3 border-b border-gray-100">
                            <div>
                                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Reputation</div>
                                <div className="flex items-baseline gap-1">
                                    <span
                                        className="text-lg font-bold"
                                        style={{
                                            color: m.reputation_score >= 80 ? '#065F46' : m.reputation_score >= 60 ? '#92400E' : '#991B1B',
                                        }}
                                    >
                                        {m.reputation_score}
                                    </span>
                                    <span className="text-[9px] text-gray-400">/ 100</span>
                                </div>
                            </div>
                            <div>
                                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Inbox</div>
                                <div className={`text-lg font-bold ${m.inbox_rate == null ? 'text-gray-400' : m.inbox_rate >= 0.9 ? 'text-emerald-700' : 'text-amber-700'}`}>
                                    {m.inbox_rate == null ? '-' : `${(m.inbox_rate * 100).toFixed(0)}%`}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2.5 mb-3">
                            <ProgressMeter label="Days on ramp" current={`${m.ramp_step}/${m.ramp_days}d`} progress={progress} color={style.dot} />
                            <ProgressMeter label="Daily volume" current={`${m.current_daily}/${m.target_daily}`} progress={dailyProgress} color={style.dot} />
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
                            <div className="flex items-center gap-3 text-[10px] text-gray-500">
                                <span><span className="font-bold text-gray-700">{m.sent_today}</span> sent</span>
                                <span><span className="font-bold text-gray-700">{m.received_today}</span> recvd</span>
                                {m.total_recovered_from_spam > 0 && (
                                    <span className="text-emerald-700"><span className="font-bold">{m.total_recovered_from_spam}</span> rescued</span>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => onToggleEnabled(m.id, m.enabled)}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    {!m.enabled ? <><Play size={10} /> Resume</> : <><Pause size={10} /> Pause</>}
                                </button>
                                <button onClick={() => onConfigure(m.id)} className="p-1 rounded-md hover:bg-gray-100 text-gray-500" title="Configure">
                                    <SettingsIcon size={12} />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────────────
// Filter dropdown
// ────────────────────────────────────────────────────────────────────────────

interface DropdownOption {
    key: string;
    label: string;
    leading?: React.ReactNode;
}

function FilterDropdown({ label, icon, active, options, selected, onSelect }: {
    label: string;
    icon?: React.ReactNode;
    active?: boolean;
    options: DropdownOption[];
    selected: string;
    onSelect: (key: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const onClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, [open]);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold transition-colors ${
                    active
                        ? 'bg-gray-900 text-white border border-gray-900 hover:bg-black'
                        : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-400'
                }`}
            >
                {icon}
                <span className="truncate max-w-[180px]">{label}</span>
                <ChevronDown size={11} className={`transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-30 overflow-hidden min-w-[180px]">
                    {options.map(opt => (
                        <button
                            key={opt.key}
                            onClick={() => { onSelect(opt.key); setOpen(false); }}
                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors text-left"
                        >
                            {opt.leading}
                            <span className="text-[11px] text-gray-800 flex-1">{opt.label}</span>
                            {selected === opt.key && <Check size={11} className="text-emerald-600 shrink-0" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────────────
// Atoms
// ────────────────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, sub, subTone }: { label: string; value: string | number; icon: React.ReactNode; sub: string; subTone: 'green' | 'amber' | 'red' | 'gray' }) {
    const subColor = subTone === 'green' ? 'text-emerald-700' : subTone === 'amber' ? 'text-amber-700' : subTone === 'red' ? 'text-red-700' : 'text-gray-500';
    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <div className="flex items-center gap-1.5 mb-1.5 text-gray-500">
                {icon}
                <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
            </div>
            <div className="text-xl font-bold text-gray-900 mb-0.5 tracking-tight">{value}</div>
            <div className={`text-[10px] font-medium ${subColor}`}>{sub}</div>
        </div>
    );
}

function ProgressMeter({ label, current, progress, color }: { label: string; current: string; progress: number; color: string }) {
    return (
        <div>
            <div className="flex items-baseline justify-between mb-1">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
                <span className="text-[10px] font-bold text-gray-700">{current}</span>
            </div>
            <Bar progress={progress} color={color} />
        </div>
    );
}

function Bar({ progress, color }: { progress: number; color: string }) {
    return (
        <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, progress)}%`, background: color }} />
        </div>
    );
}

function MiniStat({ label, value, accent }: { label: string; value: string; accent?: 'amber' | 'green' | 'red' }) {
    const valColor = accent === 'amber' ? 'text-amber-700' : accent === 'green' ? 'text-emerald-700' : accent === 'red' ? 'text-red-700' : 'text-gray-900';
    return (
        <div>
            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{label}</div>
            <div className={`text-sm font-bold ${valColor}`}>{value}</div>
        </div>
    );
}

function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-semibold">
            {label}
            <button onClick={onClear} className="text-gray-400 hover:text-gray-700">
                <X size={9} />
            </button>
        </span>
    );
}

function Checkbox({ checked, indeterminate, onChange }: { checked: boolean; indeterminate?: boolean; onChange: () => void }) {
    const ref = useRef<HTMLInputElement>(null);
    useEffect(() => {
        if (ref.current) ref.current.indeterminate = !!indeterminate;
    }, [indeterminate]);
    return (
        <label className="inline-flex items-center cursor-pointer">
            <input
                ref={ref}
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="sr-only"
            />
            <span
                className="w-3.5 h-3.5 rounded-sm border-[1.5px] flex items-center justify-center transition-colors"
                style={{
                    background: checked || indeterminate ? '#111827' : '#FFFFFF',
                    borderColor: checked || indeterminate ? '#111827' : '#D1D5DB',
                }}
            >
                {checked && <Check size={9} className="text-white" strokeWidth={3} />}
                {indeterminate && !checked && <span className="w-1.5 h-[1.5px] bg-white" />}
            </span>
        </label>
    );
}

function EmptyResults({ onReset }: { onReset: () => void }) {
    return (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-10 text-center">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <Search size={20} className="text-gray-400" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 mb-1">No mailboxes match these filters</h3>
            <p className="text-[11px] text-gray-500 mb-4 max-w-md mx-auto">
                Try widening the filters or resetting them. If you haven&apos;t connected any mailboxes yet, add one to start warmup.
            </p>
            <button
                onClick={onReset}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-900 text-white text-[11px] font-semibold hover:bg-black transition-colors"
            >
                <RefreshCw size={11} />
                Reset filters
            </button>
        </div>
    );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
    return (
        <li className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-gray-900 text-white flex items-center justify-center text-[8px] font-bold shrink-0 mt-0.5">{n}</span>
            <span className="flex-1">{children}</span>
        </li>
    );
}

function KvRow({ k, v }: { k: string; v: string }) {
    return (
        <div className="flex items-center justify-between gap-2">
            <span className="text-gray-500">{k}</span>
            <span className="font-bold text-gray-900">{v}</span>
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────────────
// Per-mailbox config modal
// ────────────────────────────────────────────────────────────────────────────

function ConfigModal({ membership, maxTargetDaily, onClose, onSaved }: {
    membership: Membership;
    maxTargetDaily: number;
    onClose: () => void;
    onSaved: () => void;
}) {
    const [start, setStart] = useState(membership.start_daily);
    const [target, setTarget] = useState(membership.target_daily);
    const [days, setDays] = useState(membership.ramp_days);
    const [maintenance, setMaintenance] = useState(membership.maintenance_daily);
    const [saving, setSaving] = useState(false);

    const save = async () => {
        if (target > maxTargetDaily) {
            toast.error(`Target cannot exceed ${maxTargetDaily} (per-mailbox cap)`);
            return;
        }
        if (start > target) {
            toast.error('Start volume must be ≤ target');
            return;
        }
        setSaving(true);
        try {
            await apiClient(`/api/sequencer/warmup/memberships/${membership.id}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    start_daily: start,
                    target_daily: target,
                    ramp_days: days,
                    maintenance_daily: maintenance,
                }),
            });
            toast.success('Saved');
            onSaved();
        } catch (err: any) {
            toast.error(err?.message || 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative"
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" aria-label="Close">
                    <X size={18} />
                </button>
                <h2 className="text-base font-bold text-gray-900 mb-1">Warmup configuration</h2>
                <p className="text-xs text-gray-500 mb-5 truncate">{membership.mailbox_email}</p>

                <div className="space-y-4">
                    <NumberField label="Start volume (emails/day)" value={start} onChange={setStart} min={1} max={maxTargetDaily} />
                    <NumberField label="Target volume (emails/day)" value={target} onChange={setTarget} min={1} max={maxTargetDaily} hint={`Max ${maxTargetDaily}`} />
                    <NumberField label="Ramp duration (days)" value={days} onChange={setDays} min={1} max={90} hint="Default 21" />
                    <NumberField label="Maintenance volume (after ramp)" value={maintenance} onChange={setMaintenance} min={5} max={20} hint="Continues indefinitely once ramped" />
                </div>

                {membership.last_error && (
                    <div className="mt-4 text-[11px] text-red-700 flex items-start gap-1.5 bg-red-50 border border-red-100 rounded-lg p-2.5">
                        <AlertTriangle size={11} className="mt-0.5 shrink-0" />
                        <span>{membership.last_error}</span>
                    </div>
                )}

                <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
                    <button onClick={onClose} disabled={saving} className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900">Cancel</button>
                    <button
                        onClick={save}
                        disabled={saving}
                        className="px-4 py-1.5 text-xs font-bold rounded-lg bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50 flex items-center gap-1.5"
                    >
                        {saving && <Loader2 size={11} className="animate-spin" />}
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────────────
// Pool config modal - bulk-apply ramp config to every mailbox in the org.
// Backed by PATCH /api/sequencer/warmup/pool-config which is a single
// atomic SQL UPDATE on the server. ramp_step / current_daily / counters
// are NOT reset; existing progress is preserved.
// ────────────────────────────────────────────────────────────────────────────

function PoolConfigModal({ mailboxCount, maxTargetDaily, onClose, onSaved }: {
    mailboxCount: number;
    maxTargetDaily: number;
    onClose: () => void;
    onSaved: () => void;
}) {
    const [start, setStart] = useState(5);
    const [target, setTarget] = useState(50);
    const [days, setDays] = useState(21);
    const [maintenance, setMaintenance] = useState(10);
    const [saving, setSaving] = useState(false);
    const [confirming, setConfirming] = useState(false);

    const save = async () => {
        if (target > maxTargetDaily) {
            toast.error(`Target cannot exceed ${maxTargetDaily} (per-mailbox cap)`);
            return;
        }
        if (start > target) {
            toast.error('Start volume must be ≤ target');
            return;
        }
        setSaving(true);
        try {
            const result = await apiClient<{ updated: number }>('/api/sequencer/warmup/pool-config', {
                method: 'PATCH',
                body: JSON.stringify({
                    start_daily: start,
                    target_daily: target,
                    ramp_days: days,
                    maintenance_daily: maintenance,
                }),
            });
            toast.success(`Updated ${result.updated} mailbox${result.updated === 1 ? '' : 'es'}`);
            onSaved();
        } catch (err: any) {
            toast.error(err?.message || 'Bulk update failed');
        } finally {
            setSaving(false);
            setConfirming(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative"
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" aria-label="Close">
                    <X size={18} />
                </button>
                <div className="flex items-center gap-2 mb-1">
                    <SettingsIcon size={16} className="text-orange-500" />
                    <h2 className="text-base font-bold text-gray-900">Pool config</h2>
                </div>
                <p className="text-xs text-gray-500 mb-5">
                    Bulk-apply ramp settings to <strong>all {mailboxCount} mailbox{mailboxCount === 1 ? '' : 'es'}</strong> in this workspace. Per-mailbox progress (days completed, current daily volume, lifetime counters) is preserved - only the ramp curve changes.
                </p>

                <div className="space-y-4">
                    <NumberField label="Start volume (emails/day)" value={start} onChange={setStart} min={1} max={maxTargetDaily} hint="Default 5" />
                    <NumberField label="Target volume (emails/day)" value={target} onChange={setTarget} min={1} max={maxTargetDaily} hint={`Default 50, max ${maxTargetDaily}`} />
                    <NumberField label="Ramp duration (days)" value={days} onChange={setDays} min={1} max={90} hint="Default 21" />
                    <NumberField label="Maintenance volume (after ramp)" value={maintenance} onChange={setMaintenance} min={5} max={20} hint="Default 10 - continues indefinitely" />
                </div>

                {/* Two-step confirmation - bulk operations should not be one
                    click. Click "Apply" once to reveal the confirm button so
                    the operator gets a final visual diff of what they're
                    about to do. */}
                {confirming ? (
                    <div className="mt-5 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="text-[11px] text-orange-900 leading-relaxed mb-2">
                            <strong>Apply to all {mailboxCount} mailbox{mailboxCount === 1 ? '' : 'es'}?</strong> This overwrites individual ramp settings. Already-graduated mailboxes stay graduated.
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setConfirming(false)}
                                disabled={saving}
                                className="px-3 py-1.5 text-[11px] font-semibold text-orange-900 hover:bg-orange-100 rounded-md"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={save}
                                disabled={saving}
                                className="ml-auto px-4 py-1.5 text-[11px] font-bold rounded-md bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50 flex items-center gap-1.5"
                            >
                                {saving && <Loader2 size={11} className="animate-spin" />}
                                Confirm - apply to all
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
                        <button onClick={onClose} disabled={saving} className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900">Cancel</button>
                        <button
                            onClick={() => setConfirming(true)}
                            disabled={saving || mailboxCount === 0}
                            className="px-4 py-1.5 text-xs font-bold rounded-lg bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50 flex items-center gap-1.5"
                        >
                            Apply to all
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function NumberField({ label, value, onChange, min, max, hint }: {
    label: string;
    value: number;
    onChange: (n: number) => void;
    min: number;
    max: number;
    hint?: string;
}) {
    return (
        <label className="block">
            <span className="text-[11px] font-semibold text-gray-700 flex items-center gap-1">
                {label}
                {hint && <span className="text-[10px] font-normal text-gray-400">({hint})</span>}
            </span>
            <input
                type="number"
                value={value}
                min={min}
                max={max}
                onChange={e => onChange(parseInt(e.target.value) || 0)}
                className="w-full mt-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400"
            />
        </label>
    );
}

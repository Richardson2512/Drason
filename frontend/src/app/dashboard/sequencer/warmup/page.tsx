'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import {
    Flame, Mail, Activity, Pause, Play, Settings as SettingsIcon,
    AlertTriangle, Inbox, MessagesSquare, Shield, Search, ChevronDown,
    LayoutGrid, List as ListIcon, X, ArrowUpDown, RefreshCw, MoreHorizontal,
    Plus, Download, Check, Filter,
} from 'lucide-react';

// ────────────────────────────────────────────────────────────────────────────
// Types & placeholder data
// ────────────────────────────────────────────────────────────────────────────

type Status = 'warming' | 'paused' | 'complete' | 'cooling';
type Provider = 'google' | 'microsoft' | 'smtp';

interface MockMailboxWarmup {
    id: string;
    email: string;
    provider: Provider;
    status: Status;
    daysWarmed: number;
    targetDays: number;
    dailyLimit: number;
    targetDailyLimit: number;
    reputationScore: number;
    inboxRate: number;
    spamRate: number;
    sentToday: number;
    receivedToday: number;
    lastUpdate: string;
}

const PLACEHOLDER_MAILBOXES: MockMailboxWarmup[] = [
    { id: 'mb-1',  email: 'alex@acme-demo.com',     provider: 'google',    status: 'warming',  daysWarmed: 14, targetDays: 30, dailyLimit: 28,  targetDailyLimit: 50,  reputationScore: 84, inboxRate: 0.91, spamRate: 0.04, sentToday: 26,  receivedToday: 31,  lastUpdate: '4m ago' },
    { id: 'mb-2',  email: 'jordan@acme-demo.com',   provider: 'google',    status: 'warming',  daysWarmed: 8,  targetDays: 30, dailyLimit: 17,  targetDailyLimit: 50,  reputationScore: 72, inboxRate: 0.86, spamRate: 0.07, sentToday: 15,  receivedToday: 19,  lastUpdate: '8m ago' },
    { id: 'mb-3',  email: 'taylor@beta-outreach.io',provider: 'microsoft', status: 'cooling',  daysWarmed: 22, targetDays: 30, dailyLimit: 12,  targetDailyLimit: 50,  reputationScore: 58, inboxRate: 0.74, spamRate: 0.18, sentToday: 8,   receivedToday: 14,  lastUpdate: '21m ago' },
    { id: 'mb-4',  email: 'sam@beta-outreach.io',   provider: 'microsoft', status: 'paused',   daysWarmed: 6,  targetDays: 30, dailyLimit: 0,   targetDailyLimit: 50,  reputationScore: 41, inboxRate: 0.62, spamRate: 0.27, sentToday: 0,   receivedToday: 0,   lastUpdate: '2h ago' },
    { id: 'mb-5',  email: 'priya@stelo.dev',        provider: 'smtp',      status: 'complete', daysWarmed: 30, targetDays: 30, dailyLimit: 200, targetDailyLimit: 200, reputationScore: 96, inboxRate: 0.97, spamRate: 0.01, sentToday: 142, receivedToday: 156, lastUpdate: '1m ago' },
    { id: 'mb-6',  email: 'mark@stelo.dev',         provider: 'smtp',      status: 'complete', daysWarmed: 30, targetDays: 30, dailyLimit: 200, targetDailyLimit: 200, reputationScore: 92, inboxRate: 0.95, spamRate: 0.02, sentToday: 187, receivedToday: 162, lastUpdate: '3m ago' },
    { id: 'mb-7',  email: 'kai@northbound.run',     provider: 'google',    status: 'warming',  daysWarmed: 3,  targetDays: 30, dailyLimit: 6,   targetDailyLimit: 50,  reputationScore: 65, inboxRate: 0.83, spamRate: 0.09, sentToday: 6,   receivedToday: 9,   lastUpdate: '12m ago' },
    { id: 'mb-8',  email: 'erin@northbound.run',    provider: 'google',    status: 'warming',  daysWarmed: 18, targetDays: 30, dailyLimit: 35,  targetDailyLimit: 50,  reputationScore: 80, inboxRate: 0.89, spamRate: 0.05, sentToday: 33,  receivedToday: 36,  lastUpdate: '6m ago' },
    { id: 'mb-9',  email: 'devon@aperture-ai.com',  provider: 'microsoft', status: 'cooling',  daysWarmed: 26, targetDays: 30, dailyLimit: 18,  targetDailyLimit: 80,  reputationScore: 64, inboxRate: 0.78, spamRate: 0.14, sentToday: 14,  receivedToday: 17,  lastUpdate: '32m ago' },
    { id: 'mb-10', email: 'mei@aperture-ai.com',    provider: 'microsoft', status: 'paused',   daysWarmed: 11, targetDays: 30, dailyLimit: 0,   targetDailyLimit: 80,  reputationScore: 38, inboxRate: 0.55, spamRate: 0.31, sentToday: 0,   receivedToday: 0,   lastUpdate: '4h ago' },
    { id: 'mb-11', email: 'rina@oddwave.studio',    provider: 'smtp',      status: 'warming',  daysWarmed: 12, targetDays: 30, dailyLimit: 23,  targetDailyLimit: 100, reputationScore: 76, inboxRate: 0.88, spamRate: 0.06, sentToday: 21,  receivedToday: 25,  lastUpdate: '9m ago' },
    { id: 'mb-12', email: 'theo@oddwave.studio',    provider: 'smtp',      status: 'complete', daysWarmed: 30, targetDays: 30, dailyLimit: 100, targetDailyLimit: 100, reputationScore: 89, inboxRate: 0.93, spamRate: 0.03, sentToday: 87,  receivedToday: 91,  lastUpdate: '2m ago' },
];

const STATUS_STYLE: Record<Status, { dot: string; bg: string; border: string; text: string; label: string }> = {
    warming:  { dot: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF', label: 'Warming' },
    paused:   { dot: '#9CA3AF', bg: '#F3F4F6', border: '#E5E7EB', text: '#374151', label: 'Paused' },
    complete: { dot: '#10B981', bg: '#ECFDF5', border: '#A7F3D0', text: '#065F46', label: 'Complete' },
    cooling:  { dot: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A', text: '#92400E', label: 'Cooling' },
};

const PROVIDER_LABEL: Record<Provider, string> = { google: 'Google', microsoft: 'Microsoft', smtp: 'SMTP' };

// Provider logos — same inline SVGs as the Sequencer accounts page so they're
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
// Page component
// ────────────────────────────────────────────────────────────────────────────

export default function WarmupPage() {
    const allMailboxes = PLACEHOLDER_MAILBOXES;

    // Filters / sort / view
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
    const [providerFilter, setProviderFilter] = useState<Provider | 'all'>('all');
    const [sortKey, setSortKey] = useState<SortKey>('last_update');
    const [view, setView] = useState<'grid' | 'list'>('list');
    const [showSideRail, setShowSideRail] = useState(false);

    // Selection
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Expanded row in list view
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Filtered + sorted
    const visibleMailboxes = useMemo(() => {
        let rows = allMailboxes;
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            rows = rows.filter((m) => m.email.toLowerCase().includes(q));
        }
        if (statusFilter !== 'all') rows = rows.filter((m) => m.status === statusFilter);
        if (providerFilter !== 'all') rows = rows.filter((m) => m.provider === providerFilter);

        const sorted = [...rows];
        switch (sortKey) {
            case 'reputation_desc': sorted.sort((a, b) => b.reputationScore - a.reputationScore); break;
            case 'reputation_asc':  sorted.sort((a, b) => a.reputationScore - b.reputationScore); break;
            case 'days_warmed':     sorted.sort((a, b) => b.daysWarmed - a.daysWarmed); break;
            case 'daily_limit':     sorted.sort((a, b) => b.dailyLimit - a.dailyLimit); break;
            case 'email_az':        sorted.sort((a, b) => a.email.localeCompare(b.email)); break;
            case 'last_update':
            default:                /* keep insertion order — placeholder data is roughly in time-order */ break;
        }
        return sorted;
    }, [allMailboxes, search, statusFilter, providerFilter, sortKey]);

    // Aggregate stats reflect FILTERED set when something is filtered, else full set
    const isFiltered = search.trim() !== '' || statusFilter !== 'all' || providerFilter !== 'all';
    const statsSource = isFiltered ? visibleMailboxes : allMailboxes;
    const warmingCount  = statsSource.filter((m) => m.status === 'warming').length;
    const completeCount = statsSource.filter((m) => m.status === 'complete').length;
    const coolingCount  = statsSource.filter((m) => m.status === 'cooling').length;
    const pausedCount   = statsSource.filter((m) => m.status === 'paused').length;
    const totalSentToday = statsSource.reduce((s, m) => s + m.sentToday, 0);
    const avgReputation = statsSource.length > 0 ? statsSource.reduce((s, m) => s + m.reputationScore, 0) / statsSource.length : 0;
    const avgInboxRate = statsSource.length > 0 ? statsSource.reduce((s, m) => s + m.inboxRate, 0) / statsSource.length : 0;

    // Selection helpers
    const allSelected = visibleMailboxes.length > 0 && visibleMailboxes.every((m) => selectedIds.has(m.id));
    const someSelected = !allSelected && visibleMailboxes.some((m) => selectedIds.has(m.id));
    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedIds((prev) => {
                const next = new Set(prev);
                visibleMailboxes.forEach((m) => next.delete(m.id));
                return next;
            });
        } else {
            setSelectedIds((prev) => {
                const next = new Set(prev);
                visibleMailboxes.forEach((m) => next.add(m.id));
                return next;
            });
        }
    };
    const toggleSelect = (id: string) => {
        setSelectedIds((prev) => {
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

    // Pre-compute filter labels — extracted out of JSX template literals
    // to dodge a Turbopack/SWC bug where `?.x ?? y` inside template strings
    // emits a reference to an undefined `_ref`.
    const statusOption = STATUS_FILTER_OPTIONS.find((o) => o.key === statusFilter);
    const statusFilterLabel = statusFilter === 'all' ? 'Status' : (statusOption ? statusOption.label : 'Status');
    const providerFilterLabel = providerFilter === 'all' ? 'Provider' : PROVIDER_LABEL[providerFilter];
    const sortOption = SORT_OPTIONS.find((s) => s.key === sortKey);
    const sortLabel = `Sort: ${sortOption ? sortOption.label : ''}`;

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
                        Each mailbox sends and receives automated, human-like emails inside our private warmup network to build
                        sender reputation gradually.
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
                    <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors">
                        <SettingsIcon size={11} />
                        Pool config
                    </button>
                    <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-semibold bg-gray-900 text-white hover:bg-black transition-colors">
                        <Plus size={11} />
                        Add mailbox
                    </button>
                </div>
            </div>

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
                    value={`${(avgInboxRate * 100).toFixed(1)}%`}
                    icon={<Inbox size={14} />}
                    sub={avgInboxRate >= 0.9 ? 'within target' : 'below target'}
                    subTone={avgInboxRate >= 0.9 ? 'green' : 'amber'}
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
                {/* Search */}
                <div className="relative flex-1 min-w-[220px]">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
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

                {/* Status filter */}
                <FilterDropdown
                    icon={<Filter size={11} />}
                    label={statusFilterLabel}
                    active={statusFilter !== 'all'}
                    options={STATUS_FILTER_OPTIONS.map((o) => ({
                        key: o.key,
                        label: o.label,
                        leading: o.key !== 'all' ? (
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_STYLE[o.key as Status].dot }} />
                        ) : undefined,
                    }))}
                    selected={statusFilter}
                    onSelect={(k) => setStatusFilter(k as Status | 'all')}
                />

                {/* Provider filter */}
                <FilterDropdown
                    label={providerFilterLabel}
                    active={providerFilter !== 'all'}
                    options={PROVIDER_FILTER_OPTIONS.map((o) => ({ key: o.key, label: o.label }))}
                    selected={providerFilter}
                    onSelect={(k) => setProviderFilter(k as Provider | 'all')}
                />

                {/* Sort */}
                <FilterDropdown
                    icon={<ArrowUpDown size={11} />}
                    label={sortLabel}
                    options={SORT_OPTIONS.map((o) => ({ key: o.key, label: o.label }))}
                    selected={sortKey}
                    onSelect={(k) => setSortKey(k as SortKey)}
                />

                {/* View toggle */}
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
                    {search.trim() && (
                        <FilterChip label={`"${search}"`} onClear={() => setSearch('')} />
                    )}
                    {statusFilter !== 'all' && (
                        <FilterChip label={`Status: ${STATUS_STYLE[statusFilter].label}`} onClear={() => setStatusFilter('all')} />
                    )}
                    {providerFilter !== 'all' && (
                        <FilterChip label={`Provider: ${PROVIDER_LABEL[providerFilter]}`} onClear={() => setProviderFilter('all')} />
                    )}
                    <button
                        onClick={resetFilters}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-gray-500 hover:bg-gray-100 transition-colors font-semibold"
                    >
                        <RefreshCw size={9} />
                        Reset all
                    </button>
                    <span className="ml-auto text-gray-400 font-medium">
                        Showing {visibleMailboxes.length} of {allMailboxes.length}
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
                        <button className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/10 hover:bg-white/20 transition-colors">
                            <Pause size={10} />
                            Pause
                        </button>
                        <button className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/10 hover:bg-white/20 transition-colors">
                            <Play size={10} />
                            Resume
                        </button>
                        <button className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/10 hover:bg-white/20 transition-colors">
                            <SettingsIcon size={10} />
                            Adjust ramp
                        </button>
                        <button className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/10 hover:bg-white/20 transition-colors">
                            <Download size={10} />
                            Export
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
                            onToggleExpand={(id) => setExpandedId(expandedId === id ? null : id)}
                        />
                    ) : (
                        <GridView
                            mailboxes={visibleMailboxes}
                            selectedIds={selectedIds}
                            onToggleSelect={toggleSelect}
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
                                    <strong className="text-gray-900">Connect a mailbox.</strong> Provider OAuth or SMTP creds.
                                </Step>
                                <Step n={2}>
                                    <strong className="text-gray-900">Join the private pool.</strong> Your mailbox starts sending and receiving
                                    human-like emails to other mailboxes — opens, replies, spam-rescues.
                                </Step>
                                <Step n={3}>
                                    <strong className="text-gray-900">Ramp daily volume.</strong> Daily limit grows on a deterministic schedule
                                    (default 30 days). Bounces or spam-folder drops slow the ramp.
                                </Step>
                                <Step n={4}>
                                    <strong className="text-gray-900">Graduate.</strong> Once reputation is stable above 80 and inbox rate ≥90%
                                    for 7 consecutive days, the mailbox is marked complete.
                                </Step>
                            </ol>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-200 p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <MessagesSquare size={14} className="text-gray-700" />
                                <h3 className="text-xs font-bold text-gray-900">Pool stats</h3>
                            </div>
                            <div className="space-y-2 text-[11px]">
                                <KvRow k="Pool size" v="12,400 mailboxes" />
                                <KvRow k="Avg conversation depth" v="3.4 messages" />
                                <KvRow k="Spam-rescue rate" v="98.2%" />
                                <KvRow k="ESP coverage" v="Gmail · M365 · Yahoo · Other" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Footer prototype banner ─────────────────────────────────── */}
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/50 p-3">
                <div className="flex items-start gap-2">
                    <AlertTriangle size={12} className="text-amber-700 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-amber-800 leading-relaxed">
                        <span className="font-semibold text-amber-900">Frontend prototype.</span> Numbers shown are placeholder data.
                        Live warmup orchestration (pool peering, automated reply bots, ramp scheduler, spam-rescue) is part of the
                        protection backend.
                    </p>
                </div>
            </div>
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────────────
// List view (compact rows)
// ────────────────────────────────────────────────────────────────────────────

interface ListViewProps {
    mailboxes: MockMailboxWarmup[];
    selectedIds: Set<string>;
    allSelected: boolean;
    someSelected: boolean;
    onToggleSelectAll: () => void;
    onToggleSelect: (id: string) => void;
    expandedId: string | null;
    onToggleExpand: (id: string) => void;
}

function ListView({ mailboxes, selectedIds, allSelected, someSelected, onToggleSelectAll, onToggleSelect, expandedId, onToggleExpand }: ListViewProps) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {/* Table header */}
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

            {/* Rows */}
            {mailboxes.map((m) => {
                const style = STATUS_STYLE[m.status];
                const isSelected = selectedIds.has(m.id);
                const isExpanded = expandedId === m.id;
                const progress = (m.daysWarmed / m.targetDays) * 100;
                const dailyProgress = (m.dailyLimit / m.targetDailyLimit) * 100;
                return (
                    <div key={m.id} className={`border-b border-gray-100 last:border-0 ${isSelected ? 'bg-blue-50/30' : 'hover:bg-gray-50/50'} transition-colors`}>
                        <div
                            onClick={() => onToggleExpand(m.id)}
                            className="grid grid-cols-12 gap-3 px-4 py-3 items-center cursor-pointer"
                        >
                            <div className="col-span-5 flex items-center gap-2.5 min-w-0">
                                <span onClick={(e) => e.stopPropagation()}>
                                    <Checkbox checked={isSelected} onChange={() => onToggleSelect(m.id)} />
                                </span>
                                <ProviderAvatar provider={m.provider} size={28} />
                                <div className="min-w-0">
                                    <div className="text-[12px] font-semibold text-gray-900 truncate">{m.email}</div>
                                    <div className="text-[10px] text-gray-500 truncate">
                                        {PROVIDER_LABEL[m.provider]} · {m.lastUpdate}
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
                                            color: m.reputationScore >= 80 ? '#065F46' : m.reputationScore >= 60 ? '#92400E' : '#991B1B',
                                        }}
                                    >
                                        {m.reputationScore}
                                    </span>
                                    <span className="text-[9px] text-gray-400">/ 100</span>
                                </div>
                            </div>
                            <div className="col-span-2">
                                <Bar progress={progress} color={style.dot} />
                                <div className="text-[9px] text-gray-500 mt-0.5">{m.daysWarmed}/{m.targetDays}d</div>
                            </div>
                            <div className="col-span-2 flex items-center gap-2">
                                <div className="flex-1">
                                    <Bar progress={dailyProgress} color={style.dot} />
                                    <div className="text-[9px] text-gray-500 mt-0.5">{m.dailyLimit}/{m.targetDailyLimit}</div>
                                </div>
                                <ChevronDown
                                    size={12}
                                    className={`text-gray-400 transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                                />
                            </div>
                        </div>

                        {/* Expanded detail */}
                        {isExpanded && (
                            <div className="px-4 pb-3 pt-1 bg-gray-50/40 grid grid-cols-2 md:grid-cols-5 gap-3 border-t border-gray-100">
                                <MiniStat label="Inbox" value={`${(m.inboxRate * 100).toFixed(1)}%`} accent={m.inboxRate >= 0.9 ? 'green' : 'amber'} />
                                <MiniStat label="Spam" value={`${(m.spamRate * 100).toFixed(1)}%`} accent={m.spamRate < 0.05 ? 'green' : 'red'} />
                                <MiniStat label="Sent today" value={String(m.sentToday)} />
                                <MiniStat label="Received today" value={String(m.receivedToday)} />
                                <div className="flex items-center gap-1.5 justify-end" onClick={(e) => e.stopPropagation()}>
                                    <button className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold text-gray-700 border border-gray-200 hover:bg-white transition-colors">
                                        {m.status === 'paused' ? <><Play size={10} /> Resume</> : <><Pause size={10} /> Pause</>}
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
    mailboxes: MockMailboxWarmup[];
    selectedIds: Set<string>;
    onToggleSelect: (id: string) => void;
}

function GridView({ mailboxes, selectedIds, onToggleSelect }: GridViewProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {mailboxes.map((m) => {
                const style = STATUS_STYLE[m.status];
                const isSelected = selectedIds.has(m.id);
                const progress = (m.daysWarmed / m.targetDays) * 100;
                const dailyProgress = (m.dailyLimit / m.targetDailyLimit) * 100;
                return (
                    <div
                        key={m.id}
                        className={`bg-white rounded-2xl border p-4 transition-all ${
                            isSelected ? 'border-gray-900 shadow-sm' : 'border-gray-200 hover:border-gray-400'
                        }`}
                    >
                        <div className="flex items-start gap-2.5 mb-3">
                            <div onClick={(e) => e.stopPropagation()}>
                                <Checkbox checked={isSelected} onChange={() => onToggleSelect(m.id)} />
                            </div>
                            <ProviderAvatar provider={m.provider} size={32} />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                    <span className="text-[12px] font-bold text-gray-900 truncate">{m.email}</span>
                                </div>
                                <div className="text-[10px] text-gray-500">{PROVIDER_LABEL[m.provider]} · {m.lastUpdate}</div>
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
                                            color: m.reputationScore >= 80 ? '#065F46' : m.reputationScore >= 60 ? '#92400E' : '#991B1B',
                                        }}
                                    >
                                        {m.reputationScore}
                                    </span>
                                    <span className="text-[9px] text-gray-400">/ 100</span>
                                </div>
                            </div>
                            <div>
                                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Inbox</div>
                                <div className={`text-lg font-bold ${m.inboxRate >= 0.9 ? 'text-emerald-700' : 'text-amber-700'}`}>
                                    {(m.inboxRate * 100).toFixed(0)}%
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2.5 mb-3">
                            <ProgressMeter label="Days on ramp" current={`${m.daysWarmed}/${m.targetDays}d`} progress={progress} color={style.dot} />
                            <ProgressMeter label="Daily volume" current={`${m.dailyLimit}/${m.targetDailyLimit}`} progress={dailyProgress} color={style.dot} />
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
                            <div className="flex items-center gap-3 text-[10px] text-gray-500">
                                <span><span className="font-bold text-gray-700">{m.sentToday}</span> sent</span>
                                <span><span className="font-bold text-gray-700">{m.receivedToday}</span> recvd</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <button className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold text-gray-700 hover:bg-gray-100 transition-colors">
                                    {m.status === 'paused' ? <><Play size={10} /> Resume</> : <><Pause size={10} /> Pause</>}
                                </button>
                                <button className="p-1 rounded-md hover:bg-gray-100 text-gray-500">
                                    <MoreHorizontal size={12} />
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
// Filter dropdown component
// ────────────────────────────────────────────────────────────────────────────

interface DropdownOption {
    key: string;
    label: string;
    leading?: React.ReactNode;
}

interface FilterDropdownProps {
    label: string;
    icon?: React.ReactNode;
    active?: boolean;
    options: DropdownOption[];
    selected: string;
    onSelect: (key: string) => void;
}

function FilterDropdown({ label, icon, active, options, selected, onSelect }: FilterDropdownProps) {
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
                    {options.map((opt) => (
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
                Try widening the filters or resetting them. If you haven't connected any mailboxes yet, add one to start warmup.
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

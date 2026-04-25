'use client';

/**
 * Webhooks management — under Integrations because customer webhooks
 * cross-cut sending and protection events. Two-pane layout: endpoint list
 * on the left, selected endpoint detail (with delivery log + actions) on
 * the right. Modal overlay for create + secret-display flows.
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import {
    Plus, Webhook, Copy, Check, RefreshCw, Trash2, Play, RotateCw, AlertTriangle,
    CircleDot, Loader2, X, ExternalLink, ChevronLeft, Eye, EyeOff,
} from 'lucide-react';

// ────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────

interface WebhookEndpoint {
    id: string;
    name: string;
    url: string;
    events: string[];
    active: boolean;
    provider: 'generic' | 'slack' | 'discord';
    failure_count: number;
    disabled_at: string | null;
    disabled_reason: string | null;
    last_delivery_at: string | null;
    created_at: string;
    updated_at: string;
    secret?: string;
}

interface DeliveryRow {
    id: string;
    event_type: string;
    event_id: string;
    status: 'pending' | 'success' | 'failed' | 'dead_letter';
    attempt_count: number;
    next_attempt_at: string | null;
    response_code: number | null;
    duration_ms: number | null;
    last_error: string | null;
    delivered_at: string | null;
    created_at: string;
}

interface DeliveryDetail extends DeliveryRow {
    payload: any;
    response_body: string | null;
    request_headers: Record<string, string> | null;
}

// ────────────────────────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────────────────────────

export default function WebhooksPage() {
    const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([]);
    const [limits, setLimits] = useState<{ used: number; max: number | null }>({ used: 0, max: null });
    const [allEvents, setAllEvents] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [secretReveal, setSecretReveal] = useState<{ id: string; secret: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const selectedEndpoint = useMemo(
        () => endpoints.find(e => e.id === selectedId) || null,
        [endpoints, selectedId]
    );

    const loadEndpoints = useCallback(async () => {
        try {
            const res = await apiClient<any>('/api/webhooks');
            if (res.success) {
                setEndpoints(res.data.endpoints);
                setLimits(res.data.limits);
            }
        } catch (e: any) {
            setError(e?.message || 'Failed to load webhooks');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadEndpoints();
        apiClient<any>('/api/webhooks/events')
            .then(r => r.success && setAllEvents(r.data.events))
            .catch(() => { /* non-blocking */ });
    }, [loadEndpoints]);

    const limitReached = limits.max !== null && limits.used >= limits.max;

    return (
        <div className="px-6 py-6">
            {/* Header */}
            <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                    <Link
                        href="/dashboard/integrations"
                        className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 mb-2"
                    >
                        <ChevronLeft size={12} /> Back to Integrations
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <Webhook size={20} className="text-gray-500" />
                        Webhooks
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Get real-time POST callbacks for sending and protection events. Power Zapier, internal automations, and your own ops tooling.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {limits.max !== null && (
                        <span className="text-xs text-gray-500">
                            <span className={limitReached ? 'text-red-600 font-semibold' : 'font-semibold text-gray-700'}>
                                {limits.used}
                            </span>
                            <span className="text-gray-400"> / </span>
                            <span>{limits.max}</span>
                            <span className="ml-1">used</span>
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={() => setShowCreateModal(true)}
                        disabled={limitReached}
                        className="inline-flex items-center gap-1.5 bg-gray-900 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-black disabled:bg-gray-300"
                    >
                        <Plus size={12} /> New endpoint
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-4 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>
            )}

            {/* Two-pane layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-4 mt-4">
                {/* List */}
                <div className="bg-white border border-[#D1CBC5] rounded-xl overflow-hidden">
                    {loading ? (
                        <div className="p-6 text-xs text-gray-500 flex items-center gap-2">
                            <Loader2 size={12} className="animate-spin" /> Loading…
                        </div>
                    ) : endpoints.length === 0 ? (
                        <EmptyState onCreate={() => setShowCreateModal(true)} />
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {endpoints.map(ep => (
                                <li key={ep.id}>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedId(ep.id)}
                                        className={`w-full text-left px-4 py-3 transition-colors ${selectedId === ep.id ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                                    >
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <span className="text-xs font-semibold text-gray-900 truncate">{ep.name}</span>
                                            <StatusPill ep={ep} />
                                        </div>
                                        <div className="text-[10px] text-gray-500 truncate font-mono">{ep.url}</div>
                                        <div className="text-[10px] text-gray-400 mt-1">
                                            {ep.events.length === 0 ? 'All events' : `${ep.events.length} event${ep.events.length === 1 ? '' : 's'}`}
                                            {ep.last_delivery_at && (
                                                <> · last delivered {timeAgo(ep.last_delivery_at)}</>
                                            )}
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Detail */}
                <div className="bg-white border border-[#D1CBC5] rounded-xl">
                    {selectedEndpoint ? (
                        <EndpointDetail
                            endpoint={selectedEndpoint}
                            allEvents={allEvents}
                            onChange={loadEndpoints}
                            onDeleted={() => { setSelectedId(null); loadEndpoints(); }}
                            onSecretRevealed={(secret) => setSecretReveal({ id: selectedEndpoint.id, secret })}
                        />
                    ) : (
                        <div className="p-10 text-center text-xs text-gray-400">
                            {loading ? '' : 'Select an endpoint to view its delivery log and settings.'}
                        </div>
                    )}
                </div>
            </div>

            {/* Create modal */}
            {showCreateModal && (
                <CreateEndpointModal
                    allEvents={allEvents}
                    onClose={() => setShowCreateModal(false)}
                    onCreated={(endpoint) => {
                        setShowCreateModal(false);
                        if (endpoint.secret) setSecretReveal({ id: endpoint.id, secret: endpoint.secret });
                        setSelectedId(endpoint.id);
                        loadEndpoints();
                    }}
                />
            )}

            {/* Secret reveal modal — shown ONCE per create / rotate */}
            {secretReveal && (
                <SecretRevealModal
                    secret={secretReveal.secret}
                    onClose={() => setSecretReveal(null)}
                />
            )}
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────
// Empty state
// ────────────────────────────────────────────────────────────────────

function EmptyState({ onCreate }: { onCreate: () => void }) {
    return (
        <div className="p-10 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 mb-3">
                <Webhook size={20} className="text-gray-400" />
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-1">No webhooks yet</p>
            <p className="text-xs text-gray-500 mb-4">Get notified instantly when events happen in your org.</p>
            <button
                type="button"
                onClick={onCreate}
                className="bg-gray-900 hover:bg-black text-white text-xs font-semibold px-3 py-2 rounded-lg"
            >
                Create your first endpoint
            </button>
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────
// Status pill
// ────────────────────────────────────────────────────────────────────

function StatusPill({ ep }: { ep: WebhookEndpoint }) {
    if (ep.disabled_at) {
        return <Pill tone="red">Disabled</Pill>;
    }
    if (!ep.active) {
        return <Pill tone="gray">Paused</Pill>;
    }
    if (ep.failure_count > 0) {
        return <Pill tone="amber">Failing</Pill>;
    }
    return <Pill tone="green">Active</Pill>;
}

function Pill({ children, tone }: { children: React.ReactNode; tone: 'green' | 'amber' | 'red' | 'gray' | 'blue' }) {
    const tones: Record<string, string> = {
        green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        amber: 'bg-amber-50 text-amber-700 border-amber-200',
        red: 'bg-red-50 text-red-700 border-red-200',
        gray: 'bg-gray-100 text-gray-600 border-gray-200',
        blue: 'bg-blue-50 text-blue-700 border-blue-200',
    };
    return <span className={`inline-block text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 border rounded ${tones[tone]}`}>{children}</span>;
}

// ────────────────────────────────────────────────────────────────────
// Endpoint detail (right pane)
// ────────────────────────────────────────────────────────────────────

function EndpointDetail({
    endpoint, allEvents, onChange, onDeleted, onSecretRevealed,
}: {
    endpoint: WebhookEndpoint;
    allEvents: string[];
    onChange: () => void;
    onDeleted: () => void;
    onSecretRevealed: (secret: string) => void;
}) {
    const [tab, setTab] = useState<'overview' | 'events' | 'log'>('overview');
    const [busy, setBusy] = useState<string | null>(null);

    const action = async (label: string, fn: () => Promise<any>) => {
        setBusy(label);
        try { await fn(); onChange(); } finally { setBusy(null); }
    };

    const toggleActive = () => action('toggle', () =>
        apiClient(`/api/webhooks/${endpoint.id}`, { method: 'PATCH', body: JSON.stringify({ active: !endpoint.active }) }));

    const reactivate = () => action('reactivate', () =>
        apiClient(`/api/webhooks/${endpoint.id}/reactivate`, { method: 'POST' }));

    const rotate = () => action('rotate', async () => {
        if (!confirm('Generate a new secret? The old one stops working immediately.')) return;
        const res = await apiClient<any>(`/api/webhooks/${endpoint.id}/rotate`, { method: 'POST' });
        if (res.success && res.data.secret) onSecretRevealed(res.data.secret);
    });

    const test = () => action('test', () =>
        apiClient(`/api/webhooks/${endpoint.id}/test`, { method: 'POST' }));

    const remove = () => action('delete', async () => {
        if (!confirm(`Delete "${endpoint.name}"? This cannot be undone.`)) return;
        await apiClient(`/api/webhooks/${endpoint.id}`, { method: 'DELETE' });
        onDeleted();
    });

    return (
        <div>
            {/* Header strip */}
            <div className="px-5 py-4 border-b border-gray-100">
                <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-sm font-bold text-gray-900 truncate">{endpoint.name}</h2>
                            <StatusPill ep={endpoint} />
                        </div>
                        <a
                            href={endpoint.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-gray-500 hover:text-blue-600 truncate font-mono"
                        >
                            {endpoint.url}
                            <ExternalLink size={10} />
                        </a>
                    </div>
                </div>

                {endpoint.disabled_at && (
                    <div className="mt-2 text-[11px] text-red-700 bg-red-50 border border-red-200 rounded-md px-2 py-1.5 flex items-start gap-1.5">
                        <AlertTriangle size={11} className="mt-0.5 flex-shrink-0" />
                        <span>Auto-disabled {timeAgo(endpoint.disabled_at)} — {endpoint.disabled_reason}</span>
                    </div>
                )}

                {/* Action row */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                    <ActionBtn icon={<Play size={11} />} label="Test" onClick={test} busy={busy === 'test'} />
                    {endpoint.disabled_at ? (
                        <ActionBtn icon={<RotateCw size={11} />} label="Reactivate" onClick={reactivate} busy={busy === 'reactivate'} primary />
                    ) : (
                        <ActionBtn
                            icon={<CircleDot size={11} />}
                            label={endpoint.active ? 'Pause' : 'Resume'}
                            onClick={toggleActive}
                            busy={busy === 'toggle'}
                        />
                    )}
                    <ActionBtn icon={<RefreshCw size={11} />} label="Rotate secret" onClick={rotate} busy={busy === 'rotate'} />
                    <ActionBtn icon={<Trash2 size={11} />} label="Delete" onClick={remove} busy={busy === 'delete'} danger />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-gray-100 px-5">
                {(['overview', 'events', 'log'] as const).map(t => (
                    <button
                        key={t}
                        type="button"
                        onClick={() => setTab(t)}
                        className={`relative px-3 py-2 text-xs font-semibold transition-colors ${tab === t ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                        {t === 'overview' ? 'Overview' : t === 'events' ? 'Events' : 'Delivery log'}
                        {tab === t && <span className="absolute -bottom-px left-0 right-0 h-[2px] bg-gray-900" />}
                    </button>
                ))}
            </div>

            <div className="p-5">
                {tab === 'overview' && <OverviewTab endpoint={endpoint} />}
                {tab === 'events' && <EventsTab endpoint={endpoint} allEvents={allEvents} onSaved={onChange} />}
                {tab === 'log' && <DeliveryLogTab endpointId={endpoint.id} />}
            </div>
        </div>
    );
}

function ActionBtn({
    icon, label, onClick, busy, primary, danger,
}: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    busy?: boolean;
    primary?: boolean;
    danger?: boolean;
}) {
    const base = 'inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded transition-colors disabled:opacity-50';
    const tone = danger
        ? 'text-red-600 hover:bg-red-50 border border-red-100'
        : primary
            ? 'bg-gray-900 text-white hover:bg-black border border-gray-900'
            : 'text-gray-700 hover:bg-gray-50 border border-gray-200';
    return (
        <button type="button" onClick={onClick} disabled={!!busy} className={`${base} ${tone}`}>
            {busy ? <Loader2 size={11} className="animate-spin" /> : icon}
            {label}
        </button>
    );
}

// ── Overview tab ──

function OverviewTab({ endpoint }: { endpoint: WebhookEndpoint }) {
    return (
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-xs">
            <Detail label="Provider" value={<code className="text-gray-700">{endpoint.provider}</code>} />
            <Detail label="Failures (consecutive)" value={endpoint.failure_count.toString()} />
            <Detail label="Created" value={new Date(endpoint.created_at).toLocaleString()} />
            <Detail label="Last delivery" value={endpoint.last_delivery_at ? new Date(endpoint.last_delivery_at).toLocaleString() : '—'} />
            <Detail
                label="Subscribed events"
                value={endpoint.events.length === 0 ? <Pill tone="blue">All events</Pill> : `${endpoint.events.length} selected`}
            />
            <Detail label="Status" value={<StatusPill ep={endpoint} />} />
        </dl>
    );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div>
            <dt className="text-[9px] uppercase tracking-wider font-semibold text-gray-500">{label}</dt>
            <dd className="text-gray-800 mt-0.5">{value}</dd>
        </div>
    );
}

// ── Events tab ──

function EventsTab({
    endpoint, allEvents, onSaved,
}: {
    endpoint: WebhookEndpoint;
    allEvents: string[];
    onSaved: () => void;
}) {
    const [selected, setSelected] = useState<Set<string>>(new Set(endpoint.events));
    const [allMode, setAllMode] = useState(endpoint.events.length === 0);
    const [saving, setSaving] = useState(false);

    const groups = useMemo(() => {
        const byPrefix: Record<string, string[]> = {};
        for (const e of allEvents) {
            const prefix = e.split('.')[0];
            (byPrefix[prefix] = byPrefix[prefix] || []).push(e);
        }
        return byPrefix;
    }, [allEvents]);

    const toggle = (e: string) => {
        const next = new Set(selected);
        next.has(e) ? next.delete(e) : next.add(e);
        setSelected(next);
    };

    const save = async () => {
        setSaving(true);
        try {
            const events = allMode ? [] : Array.from(selected);
            await apiClient(`/api/webhooks/${endpoint.id}`, { method: 'PATCH', body: JSON.stringify({ events }) });
            onSaved();
        } finally { setSaving(false); }
    };

    return (
        <div>
            <label className="flex items-center gap-2 text-xs mb-3 cursor-pointer">
                <input
                    type="checkbox"
                    checked={allMode}
                    onChange={e => setAllMode(e.target.checked)}
                    className="accent-gray-900"
                />
                <span className="font-semibold text-gray-900">Subscribe to all events</span>
                <span className="text-gray-500">— including events added in the future</span>
            </label>

            {!allMode && (
                <div className="space-y-3">
                    {Object.entries(groups).map(([prefix, events]) => (
                        <div key={prefix} className="border border-gray-100 rounded-lg p-3">
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">{prefix}</div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                                {events.map(e => (
                                    <label key={e} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-gray-50 px-1 py-0.5 rounded">
                                        <input
                                            type="checkbox"
                                            checked={selected.has(e)}
                                            onChange={() => toggle(e)}
                                            className="accent-gray-900"
                                        />
                                        <code className="text-gray-700">{e}</code>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-4 flex justify-end">
                <button
                    type="button"
                    onClick={save}
                    disabled={saving}
                    className="bg-gray-900 hover:bg-black text-white text-xs font-semibold px-3 py-1.5 rounded-lg disabled:bg-gray-300"
                >
                    {saving ? 'Saving…' : 'Save events'}
                </button>
            </div>
        </div>
    );
}

// ── Delivery log tab ──

function DeliveryLogTab({ endpointId }: { endpointId: string }) {
    const [rows, setRows] = useState<DeliveryRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [expanded, setExpanded] = useState<string | null>(null);
    const [detail, setDetail] = useState<DeliveryDetail | null>(null);
    const [replaying, setReplaying] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const qs = statusFilter ? `?status=${statusFilter}` : '';
            const res = await apiClient<any>(`/api/webhooks/${endpointId}/deliveries${qs}`);
            if (res.success) setRows(res.data);
        } finally { setLoading(false); }
    }, [endpointId, statusFilter]);

    useEffect(() => { load(); }, [load]);

    const expand = async (id: string) => {
        if (expanded === id) { setExpanded(null); setDetail(null); return; }
        setExpanded(id);
        setDetail(null);
        const res = await apiClient<any>(`/api/webhooks/${endpointId}/deliveries/${id}`);
        if (res.success) setDetail(res.data);
    };

    const replay = async (id: string) => {
        setReplaying(id);
        try {
            await apiClient(`/api/webhooks/${endpointId}/deliveries/${id}/replay`, { method: 'POST' });
            await load();
        } finally { setReplaying(null); }
    };

    return (
        <div>
            <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Filter</span>
                {(['', 'pending', 'success', 'failed', 'dead_letter'] as const).map(s => (
                    <button
                        key={s || 'all'}
                        type="button"
                        onClick={() => setStatusFilter(s)}
                        className={`text-[10px] px-2 py-0.5 border rounded transition-colors ${statusFilter === s ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                        {s ? s.replace('_', ' ') : 'All'}
                    </button>
                ))}
                <button type="button" onClick={load} className="ml-auto text-[10px] text-gray-500 hover:text-gray-800 inline-flex items-center gap-1">
                    <RefreshCw size={10} /> Refresh
                </button>
            </div>

            {loading ? (
                <div className="text-xs text-gray-500 flex items-center gap-2"><Loader2 size={12} className="animate-spin" /> Loading…</div>
            ) : rows.length === 0 ? (
                <div className="text-xs text-gray-400 py-6 text-center">No deliveries yet — fire a Test event from the action row above.</div>
            ) : (
                <div className="text-xs">
                    {rows.map(row => (
                        <div key={row.id} className="border-b border-gray-100 last:border-b-0">
                            <button
                                type="button"
                                onClick={() => expand(row.id)}
                                className="w-full text-left py-2 px-1 hover:bg-gray-50 grid grid-cols-[auto_auto_1fr_auto_auto] gap-3 items-center"
                            >
                                <DeliveryStatusDot status={row.status} />
                                <code className="text-gray-700 text-[11px]">{row.event_type}</code>
                                <span className="text-[10px] text-gray-400 truncate">{row.event_id}</span>
                                <span className="text-[10px] text-gray-500">
                                    {row.response_code ? `HTTP ${row.response_code}` : row.last_error?.slice(0, 40) || '—'}
                                </span>
                                <span className="text-[10px] text-gray-400">{timeAgo(row.created_at)}</span>
                            </button>
                            {expanded === row.id && (
                                <div className="bg-gray-50 px-4 py-3 space-y-3">
                                    {!detail ? (
                                        <div className="text-[11px] text-gray-500"><Loader2 size={10} className="animate-spin inline" /> Loading…</div>
                                    ) : (
                                        <>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                <Detail label="Attempts" value={detail.attempt_count.toString()} />
                                                <Detail label="Duration" value={detail.duration_ms ? `${detail.duration_ms} ms` : '—'} />
                                                <Detail label="Delivered" value={detail.delivered_at ? new Date(detail.delivered_at).toLocaleString() : '—'} />
                                                <Detail label="Next attempt" value={detail.next_attempt_at ? new Date(detail.next_attempt_at).toLocaleString() : '—'} />
                                            </div>
                                            <div>
                                                <div className="text-[9px] uppercase tracking-wider font-semibold text-gray-500 mb-1">Payload</div>
                                                <pre className="text-[10px] bg-white border border-gray-200 rounded p-2 overflow-x-auto whitespace-pre">{JSON.stringify(detail.payload, null, 2)}</pre>
                                            </div>
                                            {detail.response_body && (
                                                <div>
                                                    <div className="text-[9px] uppercase tracking-wider font-semibold text-gray-500 mb-1">Response body (truncated)</div>
                                                    <pre className="text-[10px] bg-white border border-gray-200 rounded p-2 overflow-x-auto whitespace-pre-wrap">{detail.response_body}</pre>
                                                </div>
                                            )}
                                            {(detail.status === 'failed' || detail.status === 'dead_letter') && (
                                                <button
                                                    type="button"
                                                    onClick={() => replay(detail.id)}
                                                    disabled={replaying === detail.id}
                                                    className="bg-gray-900 hover:bg-black text-white text-[11px] font-semibold px-3 py-1 rounded-lg inline-flex items-center gap-1 disabled:bg-gray-300"
                                                >
                                                    {replaying === detail.id ? <Loader2 size={11} className="animate-spin" /> : <RotateCw size={11} />}
                                                    Replay
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function DeliveryStatusDot({ status }: { status: DeliveryRow['status'] }) {
    const colors: Record<DeliveryRow['status'], string> = {
        pending: 'bg-blue-400',
        success: 'bg-emerald-500',
        failed: 'bg-amber-500',
        dead_letter: 'bg-red-500',
    };
    return <span className={`inline-block w-1.5 h-1.5 rounded-full ${colors[status]}`} title={status} />;
}

// ────────────────────────────────────────────────────────────────────
// Create modal
// ────────────────────────────────────────────────────────────────────

function CreateEndpointModal({
    allEvents, onClose, onCreated,
}: {
    allEvents: string[];
    onClose: () => void;
    onCreated: (endpoint: WebhookEndpoint) => void;
}) {
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [provider, setProvider] = useState<'generic' | 'slack' | 'discord'>('generic');
    const [allMode, setAllMode] = useState(true);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const groups = useMemo(() => {
        const byPrefix: Record<string, string[]> = {};
        for (const e of allEvents) {
            const prefix = e.split('.')[0];
            (byPrefix[prefix] = byPrefix[prefix] || []).push(e);
        }
        return byPrefix;
    }, [allEvents]);

    const toggle = (e: string) => {
        const next = new Set(selected);
        next.has(e) ? next.delete(e) : next.add(e);
        setSelected(next);
    };

    const submit = async () => {
        setError(null);
        if (!name.trim()) { setError('Name is required'); return; }
        if (!url.trim()) { setError('URL is required'); return; }

        setSaving(true);
        try {
            const body = {
                name: name.trim(),
                url: url.trim(),
                provider,
                events: allMode ? [] : Array.from(selected),
            };
            const res = await apiClient<any>('/api/webhooks', { method: 'POST', body: JSON.stringify(body) });
            if (res.success) {
                onCreated(res.data);
            } else {
                setError(res.error || 'Failed to create endpoint');
            }
        } catch (e: any) {
            setError(e?.message || 'Failed to create endpoint');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-base font-bold text-gray-900">New webhook endpoint</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={16} /></button>
                </div>

                <div className="px-6 py-5 space-y-4">
                    <Field label="Name" hint="Internal label so you can identify this endpoint later.">
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Zapier production"
                            maxLength={120}
                            className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-gray-500"
                        />
                    </Field>

                    <Field label="URL" hint="Where Superkabe will POST events. Must be publicly reachable.">
                        <input
                            type="url"
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                            placeholder="https://example.com/webhooks/superkabe"
                            className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-gray-500 font-mono"
                        />
                    </Field>

                    <Field label="Provider" hint="Generic = JSON envelope with HMAC signature. Slack = Slack-blocks payload, no signature.">
                        <div className="flex gap-2">
                            {(['generic', 'slack', 'discord'] as const).map(p => (
                                <label key={p} className={`flex-1 text-center text-xs border rounded-lg px-3 py-2 cursor-pointer transition-colors ${provider === p ? 'border-gray-900 bg-gray-50 font-semibold' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <input
                                        type="radio"
                                        name="provider"
                                        value={p}
                                        checked={provider === p}
                                        onChange={() => setProvider(p)}
                                        className="sr-only"
                                    />
                                    {p === 'generic' ? 'Generic' : p === 'slack' ? 'Slack incoming webhook' : 'Discord webhook'}
                                </label>
                            ))}
                        </div>
                    </Field>

                    <Field label="Events">
                        <label className="flex items-center gap-2 text-xs mb-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={allMode}
                                onChange={e => setAllMode(e.target.checked)}
                                className="accent-gray-900"
                            />
                            <span className="font-semibold text-gray-900">All events</span>
                            <span className="text-gray-500">— including future ones</span>
                        </label>
                        {!allMode && (
                            <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-100 rounded-lg p-3">
                                {Object.entries(groups).map(([prefix, events]) => (
                                    <div key={prefix}>
                                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">{prefix}</div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0.5">
                                            {events.map(e => (
                                                <label key={e} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-gray-50 px-1 py-0.5 rounded">
                                                    <input
                                                        type="checkbox"
                                                        checked={selected.has(e)}
                                                        onChange={() => toggle(e)}
                                                        className="accent-gray-900"
                                                    />
                                                    <code className="text-gray-700">{e}</code>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Field>

                    {error && <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
                </div>

                <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="text-xs text-gray-600 hover:text-gray-900 px-3 py-1.5">
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={submit}
                        disabled={saving}
                        className="bg-gray-900 hover:bg-black text-white text-xs font-semibold px-4 py-1.5 rounded-lg disabled:bg-gray-300"
                    >
                        {saving ? 'Creating…' : 'Create endpoint'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-gray-900 mb-1">{label}</label>
            {hint && <p className="text-[11px] text-gray-500 mb-2">{hint}</p>}
            {children}
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────
// Secret reveal modal — shown ONCE
// ────────────────────────────────────────────────────────────────────

function SecretRevealModal({ secret, onClose }: { secret: string; onClose: () => void }) {
    const [copied, setCopied] = useState(false);
    const [revealed, setRevealed] = useState(false);

    const copy = () => {
        navigator.clipboard.writeText(secret);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6">
                <h2 className="text-base font-bold text-gray-900 mb-1">Save this secret now</h2>
                <p className="text-xs text-gray-600 mb-4">
                    This is the only time we&apos;ll show the secret. Use it to verify the HMAC-SHA256 signature on every incoming request from Superkabe. If you lose it, rotate to generate a new one.
                </p>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center gap-2">
                    <code className="text-[11px] flex-1 break-all text-gray-800">
                        {revealed ? secret : '•'.repeat(48)}
                    </code>
                    <button
                        type="button"
                        onClick={() => setRevealed(r => !r)}
                        className="text-gray-500 hover:text-gray-900 p-1"
                        aria-label={revealed ? 'Hide' : 'Reveal'}
                    >
                        {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button
                        type="button"
                        onClick={copy}
                        className="text-gray-500 hover:text-gray-900 p-1"
                        aria-label="Copy"
                    >
                        {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </button>
                </div>

                <div className="mt-5 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-gray-900 hover:bg-black text-white text-xs font-semibold px-4 py-1.5 rounded-lg"
                    >
                        I&apos;ve saved it
                    </button>
                </div>
            </div>
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
    const ms = Date.now() - new Date(iso).getTime();
    const s = Math.floor(ms / 1000);
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { apiClient } from '@/lib/api';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { ChevronLeft, ExternalLink, Trash2, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import ConfirmActionModal from '@/components/modals/ConfirmActionModal';

type Provider = 'apollo' | 'zoominfo';
type ConnStatus = 'active' | 'error' | 'expired' | 'disconnected' | 'not_connected';

interface LeadSourceConnection {
    id: string;
    provider: Provider;
    status: ConnStatus;
    external_account_name: string | null;
    external_account_id: string | null;
    connected_at: string;
    last_validated_at: string | null;
    last_used_at: string | null;
    last_error: string | null;
    disconnected_at: string | null;
}

const PROVIDER_META: Record<Provider, { name: string; description: string; logo: string; comingSoon?: boolean }> = {
    apollo: {
        name: 'Apollo.io',
        description: 'Paste an Apollo people-search, saved-search, or list URL — Superkabe replays the search via the official Apollo API and imports contacts as leads. Idempotent on email, capped per import, credit-aware.',
        logo: '/brands/apollo.svg',
    },
    zoominfo: {
        name: 'ZoomInfo',
        description: 'Coming soon — paste a ZoomInfo Search URL to import enriched contacts and intent signals.',
        logo: '/brands/zoominfo.svg',
        comingSoon: true,
    },
};

const STATUS_STYLE: Record<ConnStatus, { label: string; bg: string; fg: string; dot: string }> = {
    active:        { label: 'Connected',     bg: '#D1FAE5', fg: '#065F46', dot: '#10B981' },
    error:         { label: 'Error',         bg: '#FEE2E2', fg: '#991B1B', dot: '#EF4444' },
    expired:       { label: 'Reconnect',     bg: '#FEF3C7', fg: '#92400E', dot: '#F59E0B' },
    disconnected:  { label: 'Disconnected',  bg: '#F3F4F6', fg: '#6B7280', dot: '#9CA3AF' },
    not_connected: { label: 'Not Connected', bg: '#F3F4F6', fg: '#6B7280', dot: '#9CA3AF' },
};

function formatDate(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit',
    });
}

function ApolloConnectInline({ onConnected }: { onConnected: () => void }) {
    const [open, setOpen] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const submit = async () => {
        const trimmed = apiKey.trim();
        if (!trimmed) {
            setErr('API key is required');
            return;
        }
        setBusy(true);
        setErr(null);
        try {
            await apiClient('/api/integrations/apollo/connect', {
                method: 'POST',
                body: JSON.stringify({ api_key: trimmed }),
                headers: { 'Content-Type': 'application/json' },
            });
            setApiKey('');
            setOpen(false);
            onConnected();
        } catch (e: any) {
            setErr(e?.message || 'Connection failed');
        } finally {
            setBusy(false);
        }
    };

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5"
            >
                Connect Apollo
                <ExternalLink size={10} />
            </button>
        );
    }

    return (
        <div className="w-full">
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Apollo API key
            </label>
            <div className="flex items-center gap-2">
                <input
                    type="password"
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder="paste from Apollo › Settings › Integrations › API"
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400"
                    disabled={busy}
                />
                <button
                    onClick={submit}
                    disabled={busy}
                    className="px-3 py-1.5 text-xs font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5"
                >
                    {busy && <Loader2 size={12} className="animate-spin" />}
                    Connect
                </button>
                <button
                    onClick={() => { setOpen(false); setErr(null); }}
                    disabled={busy}
                    className="text-[11px] text-slate-500 hover:text-slate-800 disabled:opacity-50"
                >
                    Cancel
                </button>
            </div>
            {err && (
                <div className="mt-1.5 text-[11px] text-red-700 flex items-start gap-1">
                    <AlertTriangle size={11} className="mt-0.5 shrink-0" />
                    {err}
                </div>
            )}
            <p className="text-[10px] text-slate-500 mt-1.5">
                Your key is encrypted at rest and never exposed in the dashboard. Apollo requires a paid plan with API access.
            </p>
        </div>
    );
}

export default function LeadSourcesPage() {
    const [connections, setConnections] = useState<LeadSourceConnection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [pendingDisconnect, setPendingDisconnect] = useState<LeadSourceConnection | null>(null);

    const refresh = async () => {
        try {
            const data = await apiClient<LeadSourceConnection[]>('/api/integrations/lead-sources/connections');
            setConnections(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err: any) {
            setError(err?.message || 'Failed to load lead-source connections');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { refresh(); }, []);

    const sortedConnections = useMemo(() => {
        const order: Record<ConnStatus, number> = {
            active: 0, error: 1, expired: 2, not_connected: 3, disconnected: 4,
        };
        return [...connections].sort((a, b) => order[a.status] - order[b.status]);
    }, [connections]);

    const confirmDisconnect = async () => {
        if (!pendingDisconnect?.id) return;
        const conn = pendingDisconnect;
        setBusyId(conn.id);
        try {
            await apiClient(`/api/integrations/lead-sources/connections/${conn.id}/disconnect`, { method: 'POST' });
            await refresh();
            setPendingDisconnect(null);
        } catch (err: any) {
            alert(err?.message || 'Failed to disconnect');
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-6">
                <Link
                    href="/dashboard/integrations"
                    className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 mb-3"
                >
                    <ChevronLeft size={14} />
                    Back to Integrations
                </Link>
                <h1 className="text-xl font-bold text-gray-900 mb-0.5">Contact Database Connections</h1>
                <p className="text-xs text-slate-500">
                    Pull contacts from paid databases like Apollo and ZoomInfo into Superkabe leads. One connection per provider per workspace.
                </p>
            </div>

            <div className="bg-blue-50 border border-blue-100 px-4 py-3 mb-6 text-xs text-blue-900 rounded-xl flex items-start gap-2">
                <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                <div>
                    <strong>How import works.</strong> Once connected, you paste a search URL from Apollo&apos;s app
                    (people search, saved search, or saved list). Superkabe parses the filters, previews the result count,
                    and replays the search via the official API — credits only flow when you start the import. See the
                    <Link href="/docs/integrations/apollo" className="underline mx-1">Apollo</Link> docs for details.
                </div>
            </div>

            {loading && <LoadingSkeleton type="card" rows={2} />}

            {!loading && error && (
                <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl text-sm">
                    {error}
                </div>
            )}

            {!loading && !error && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {sortedConnections.map((conn, i) => {
                        const meta = PROVIDER_META[conn.provider];
                        if (!meta) return null;
                        const statusStyle = STATUS_STYLE[conn.status];
                        const isLive = conn.status === 'active' || conn.status === 'error' || conn.status === 'expired';
                        const cardKey = conn.id || `${conn.provider}-${i}`;

                        return (
                            <div
                                key={cardKey}
                                className="bg-white rounded-xl p-5 border flex flex-col gap-4"
                                style={{
                                    borderColor: conn.status === 'active' ? '#A7F3D0' : conn.status === 'error' ? '#FCA5A5' : '#E2E8F0',
                                    opacity: meta.comingSoon ? 0.7 : 1,
                                }}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={meta.logo} alt={meta.name} width={22} height={22} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-gray-900">{meta.name}</div>
                                            {conn.external_account_name ? (
                                                <div className="text-[11px] text-slate-500">{conn.external_account_name}</div>
                                            ) : (
                                                <div className="text-[11px] text-slate-400">Not connected</div>
                                            )}
                                        </div>
                                    </div>
                                    <span
                                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold shrink-0"
                                        style={{ background: statusStyle.bg, color: statusStyle.fg }}
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusStyle.dot }} />
                                        {meta.comingSoon ? 'Coming Soon' : statusStyle.label}
                                    </span>
                                </div>

                                <p className="text-xs text-slate-500 leading-relaxed m-0">{meta.description}</p>

                                {isLive && (
                                    <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 border border-slate-100 rounded-lg p-3">
                                        <div>
                                            <div className="text-slate-400 text-[10px] uppercase tracking-wider mb-0.5">Connected</div>
                                            <div className="text-slate-700">{formatDate(conn.connected_at)}</div>
                                        </div>
                                        <div>
                                            <div className="text-slate-400 text-[10px] uppercase tracking-wider mb-0.5">Last used</div>
                                            <div className="text-slate-700">{formatDate(conn.last_used_at)}</div>
                                        </div>
                                    </div>
                                )}

                                {conn.last_error && (
                                    <div className="text-[11px] bg-red-50 border border-red-100 rounded-lg p-2.5 text-red-700 flex items-start gap-1.5">
                                        <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                                        <span>{conn.last_error}</span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100 gap-3">
                                    {meta.comingSoon ? (
                                        <span className="text-[11px] text-slate-400">Available soon</span>
                                    ) : (conn.status === 'not_connected' || conn.status === 'disconnected') ? (
                                        conn.provider === 'apollo' ? (
                                            <ApolloConnectInline onConnected={refresh} />
                                        ) : null
                                    ) : (
                                        <Link
                                            href={`/dashboard/integrations/lead-sources/${conn.id}`}
                                            className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5"
                                        >
                                            Manage import
                                            <ExternalLink size={10} />
                                        </Link>
                                    )}

                                    {isLive && conn.id && (
                                        <button
                                            onClick={() => setPendingDisconnect(conn)}
                                            disabled={busyId === conn.id}
                                            className="text-[11px] font-semibold text-red-600 hover:text-red-700 disabled:opacity-50 flex items-center gap-1"
                                        >
                                            <Trash2 size={11} />
                                            {busyId === conn.id ? 'Disconnecting…' : 'Disconnect'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <ConfirmActionModal
                isOpen={!!pendingDisconnect}
                title={pendingDisconnect ? `Disconnect ${PROVIDER_META[pendingDisconnect.provider]?.name ?? 'lead source'}?` : ''}
                icon="🔌"
                message={pendingDisconnect ? `You're about to disconnect ${PROVIDER_META[pendingDisconnect.provider]?.name ?? 'this lead source'} from this Superkabe workspace.` : ''}
                consequences={[
                    'Pending import jobs will be cancelled',
                    'The encrypted API key will be wiped from our database',
                    'Imported leads stay — only the connection is removed',
                    'You can reconnect anytime by pasting the API key again',
                ]}
                confirmLabel={busyId === pendingDisconnect?.id ? 'Disconnecting…' : 'Disconnect'}
                cancelLabel="Cancel"
                variant="danger"
                loading={busyId === pendingDisconnect?.id}
                onConfirm={confirmDisconnect}
                onCancel={() => setPendingDisconnect(null)}
            />
        </div>
    );
}

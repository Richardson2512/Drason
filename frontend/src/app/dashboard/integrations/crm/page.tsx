'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { ChevronLeft, ExternalLink, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import ConfirmActionModal from '@/components/modals/ConfirmActionModal';

type Provider = 'hubspot' | 'salesforce';
type ConnStatus = 'active' | 'error' | 'expired' | 'disconnected' | 'not_connected';

interface ActivityPushSummary {
    pending: number;
    pushed: number;
    failed: number;
    skipped: number;
}

interface CrmConnection {
    id: string;
    provider: Provider;
    status: ConnStatus;
    external_account_name: string | null;
    external_account_id: string | null;
    instance_url: string | null;
    scopes: string[];
    connected_at: string;
    last_sync_at: string | null;
    last_error: string | null;
    disconnected_at: string | null;
    activity_push: ActivityPushSummary;
}

const PROVIDER_META: Record<Provider, { name: string; description: string; logo: string; brandColor: string }> = {
    hubspot: {
        name: 'HubSpot',
        description: 'Import contacts from HubSpot lists, push send/open/click/reply events to the contact timeline, and sync the suppression list.',
        logo: '/brands/hubspot.svg',
        brandColor: '#FF7A59',
    },
    salesforce: {
        name: 'Salesforce',
        description: 'Import contacts via SOQL or list view, write activities to the Salesforce Task object, and pull do-not-contact flags.',
        logo: '/brands/salesforce.svg',
        brandColor: '#00A1E0',
    },
};

const STATUS_STYLE: Record<ConnStatus, { label: string; bg: string; fg: string; dot: string }> = {
    active:        { label: 'Connected',     bg: '#D1FAE5', fg: '#065F46', dot: '#10B981' },
    error:         { label: 'Error',         bg: '#FEE2E2', fg: '#991B1B', dot: '#EF4444' },
    expired:       { label: 'Reconnect',     bg: '#FEF3C7', fg: '#92400E', dot: '#F59E0B' },
    disconnected: { label: 'Disconnected',  bg: '#F3F4F6', fg: '#6B7280', dot: '#9CA3AF' },
    not_connected: { label: 'Not Connected', bg: '#F3F4F6', fg: '#6B7280', dot: '#9CA3AF' },
};

function SalesforceConnectButton() {
    const [open, setOpen] = useState(false);
    return (
        <div className="relative inline-block">
            <button
                onClick={() => setOpen(o => !o)}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5"
            >
                Connect Salesforce
                <ExternalLink size={10} />
            </button>
            {open && (
                <div className="absolute left-0 top-5 z-10 bg-white border border-[#E2E8F0] rounded-lg shadow-lg p-2 w-44">
                    <a
                        href="/api/integrations/salesforce/authorize?env=production"
                        className="block px-3 py-1.5 text-xs hover:bg-slate-50 rounded text-slate-700"
                    >
                        Production org
                    </a>
                    <a
                        href="/api/integrations/salesforce/authorize?env=sandbox"
                        className="block px-3 py-1.5 text-xs hover:bg-slate-50 rounded text-slate-700"
                    >
                        Sandbox org
                    </a>
                </div>
            )}
        </div>
    );
}

function formatDate(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit',
    });
}

export default function CrmIntegrationsPage() {
    const [connections, setConnections] = useState<CrmConnection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [pendingDisconnect, setPendingDisconnect] = useState<CrmConnection | null>(null);

    const refresh = async () => {
        try {
            const data = await apiClient<CrmConnection[]>('/api/integrations/crm/connections');
            setConnections(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to load CRM connections');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh();
    }, []);

    const sortedConnections = useMemo(() => {
        // Active connections first, then placeholders, then disconnected
        const order: Record<ConnStatus, number> = {
            active: 0, error: 1, expired: 2, not_connected: 3, disconnected: 4,
        };
        return [...connections].sort((a, b) => order[a.status] - order[b.status]);
    }, [connections]);

    const handleDisconnect = async (conn: CrmConnection) => {
        if (!conn.id) return;
        setPendingDisconnect(conn);
    };

    const confirmDisconnect = async () => {
        if (!pendingDisconnect?.id) return;
        const conn = pendingDisconnect;
        setBusyId(conn.id);
        try {
            await apiClient(`/api/integrations/crm/connections/${conn.id}/disconnect`, { method: 'POST' });
            await refresh();
            setPendingDisconnect(null);
        } catch (err: any) {
            toast.error(err.message || 'Failed to disconnect');
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
                <h1 className="text-xl font-bold text-gray-900 mb-0.5">CRM Connections</h1>
                <p className="text-xs text-slate-500">
                    Sync contacts and push activity from Superkabe to your CRM. One connection per provider per workspace.
                </p>
            </div>

            <div className="bg-blue-50 border border-blue-100 px-4 py-3 mb-6 text-xs text-blue-900 rounded-xl flex items-start gap-2">
                <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                <div>
                    <strong>How sync works.</strong> Once connected, Superkabe pulls contacts via OAuth and pushes
                    every send/open/click/reply/bounce event to the contact&apos;s timeline. See the
                    <Link href="/docs/integrations/hubspot" className="underline mx-1">HubSpot</Link> /
                    <Link href="/docs/integrations/salesforce" className="underline mx-1">Salesforce</Link>
                    docs for setup details.
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
                        const statusStyle = STATUS_STYLE[conn.status];
                        const isLive = conn.status === 'active' || conn.status === 'error' || conn.status === 'expired';
                        const cardKey = conn.id || `${conn.provider}-${i}`;

                        return (
                            <div
                                key={cardKey}
                                className="bg-white rounded-xl p-5 border border-[#E2E8F0] flex flex-col gap-4"
                                style={{
                                    borderColor: conn.status === 'active' ? '#A7F3D0' : conn.status === 'error' ? '#FCA5A5' : '#E2E8F0',
                                }}
                            >
                                {/* Top row */}
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                                            <Image src={meta.logo} alt={meta.name} width={22} height={22} />
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
                                        {statusStyle.label}
                                    </span>
                                </div>

                                {/* Description */}
                                <p className="text-xs text-slate-500 leading-relaxed m-0">{meta.description}</p>

                                {/* Connection metadata (when live) */}
                                {isLive && (
                                    <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 border border-slate-100 rounded-lg p-3">
                                        <div>
                                            <div className="text-slate-400 text-[10px] uppercase tracking-wider mb-0.5">Connected</div>
                                            <div className="text-slate-700">{formatDate(conn.connected_at)}</div>
                                        </div>
                                        <div>
                                            <div className="text-slate-400 text-[10px] uppercase tracking-wider mb-0.5">Last sync</div>
                                            <div className="text-slate-700">{formatDate(conn.last_sync_at)}</div>
                                        </div>
                                        <div className="col-span-2">
                                            <div className="text-slate-400 text-[10px] uppercase tracking-wider mb-0.5">Activity push queue</div>
                                            <div className="text-slate-700 flex items-center gap-3 flex-wrap">
                                                <span><strong>{conn.activity_push.pending}</strong> pending</span>
                                                <span className="text-emerald-700"><strong>{conn.activity_push.pushed}</strong> pushed</span>
                                                {conn.activity_push.failed > 0 && (
                                                    <span className="text-red-700"><strong>{conn.activity_push.failed}</strong> failed</span>
                                                )}
                                                {conn.activity_push.skipped > 0 && (
                                                    <span className="text-slate-500"><strong>{conn.activity_push.skipped}</strong> skipped</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Error banner */}
                                {conn.last_error && (
                                    <div className="text-[11px] bg-red-50 border border-red-100 rounded-lg p-2.5 text-red-700 flex items-start gap-1.5">
                                        <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                                        <span>{conn.last_error}</span>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100">
                                    {conn.status === 'not_connected' || conn.status === 'disconnected' ? (
                                        conn.provider === 'salesforce' ? (
                                            <SalesforceConnectButton />
                                        ) : (
                                            <a
                                                href="/api/integrations/hubspot/authorize"
                                                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5"
                                            >
                                                Connect HubSpot
                                                <ExternalLink size={10} />
                                            </a>
                                        )
                                    ) : (
                                        <Link
                                            href={`/dashboard/integrations/crm/${conn.id}`}
                                            className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5"
                                        >
                                            Manage import
                                            <ExternalLink size={10} />
                                        </Link>
                                    )}

                                    {isLive && conn.id && (
                                        <button
                                            onClick={() => handleDisconnect(conn)}
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
                title={pendingDisconnect ? `Disconnect ${PROVIDER_META[pendingDisconnect.provider].name}?` : ''}
                icon="🔌"
                message={pendingDisconnect ? `You're about to disconnect ${PROVIDER_META[pendingDisconnect.provider].name} from this Superkabe workspace.` : ''}
                consequences={[
                    'Pending activity pushes will be cancelled',
                    'OAuth tokens will be wiped from our database',
                    'Imported leads stay — only the connection mapping is removed',
                    'You can reconnect anytime by clicking Connect again',
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

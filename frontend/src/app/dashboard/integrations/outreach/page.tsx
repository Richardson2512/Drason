'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { ChevronLeft, ExternalLink, Trash2, AlertTriangle, CheckCircle2, RotateCw } from 'lucide-react';
import ConfirmActionModal from '@/components/modals/ConfirmActionModal';

interface RecentExport {
    id: string;
    source_kind: string;
    source_label: string | null;
    sequence_id: string;
    sequence_name: string | null;
    created_sequence: boolean;
    state: string;
    total: number;
    total_processed: number;
    total_prospects_created: number;
    total_prospects_updated: number;
    total_added_to_sequence: number;
    total_skipped: number;
    total_failed: number;
    started_at: string | null;
    finished_at: string | null;
    error_message: string | null;
    created_at: string;
}

interface OutreachConnection {
    id: string;
    status: 'active' | 'error' | 'expired' | 'disconnected';
    outreach_user_email: string | null;
    outreach_user_id: string | null;
    outreach_org_name: string | null;
    connected_at: string;
    last_validated_at: string | null;
    last_used_at: string | null;
    last_error: string | null;
    disconnected_at: string | null;
    recent_exports: RecentExport[];
}

const STATE_STYLE: Record<string, { bg: string; fg: string }> = {
    pending:   { bg: '#F3F4F6', fg: '#6B7280' },
    running:   { bg: '#DBEAFE', fg: '#1E40AF' },
    completed: { bg: '#D1FAE5', fg: '#065F46' },
    failed:    { bg: '#FEE2E2', fg: '#991B1B' },
    cancelled: { bg: '#F3F4F6', fg: '#6B7280' },
};

const STATUS_STYLE: Record<string, { label: string; bg: string; fg: string; dot: string }> = {
    active:        { label: 'Connected',     bg: '#D1FAE5', fg: '#065F46', dot: '#10B981' },
    error:         { label: 'Error',         bg: '#FEE2E2', fg: '#991B1B', dot: '#EF4444' },
    expired:       { label: 'Reconnect',     bg: '#FEF3C7', fg: '#92400E', dot: '#F59E0B' },
    disconnected:  { label: 'Disconnected',  bg: '#F3F4F6', fg: '#6B7280', dot: '#9CA3AF' },
};

function formatDate(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit',
    });
}

export default function OutreachIntegrationPage() {
    const [conn, setConn] = useState<OutreachConnection | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pendingDisconnect, setPendingDisconnect] = useState(false);
    const [busy, setBusy] = useState(false);

    const refresh = useCallback(async () => {
        try {
            const data = await apiClient<OutreachConnection | null>('/api/integrations/outreach/connection');
            setConn(data);
            setError(null);
        } catch (err: any) {
            setError(err?.message || 'Failed to load connection');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    // Poll while exports are in flight.
    const hasActive = (conn?.recent_exports ?? []).some(j => j.state === 'pending' || j.state === 'running');
    useEffect(() => {
        if (!hasActive) return;
        const t = setInterval(refresh, 5000);
        return () => clearInterval(t);
    }, [hasActive, refresh]);

    const confirmDisconnect = async () => {
        setBusy(true);
        try {
            await apiClient('/api/integrations/outreach/disconnect', { method: 'POST' });
            await refresh();
            setPendingDisconnect(false);
        } catch (err: any) {
            alert(err?.message || 'Failed to disconnect');
        } finally {
            setBusy(false);
        }
    };

    if (loading) {
        return <div className="p-8"><LoadingSkeleton type="card" rows={2} /></div>;
    }

    return (
        <div className="p-8 max-w-4xl">
            <div className="mb-6">
                <Link
                    href="/dashboard/integrations"
                    className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 mb-3"
                >
                    <ChevronLeft size={14} /> Back to Integrations
                </Link>
                <h1 className="text-xl font-bold text-gray-900 mb-0.5">Outreach</h1>
                <p className="text-xs text-slate-500">
                    Push your cold call list into an Outreach sequence. One connection per workspace.
                </p>
            </div>

            <div className="bg-blue-50 border border-blue-100 px-4 py-3 mb-6 text-xs text-blue-900 rounded-xl flex items-start gap-2">
                <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                <div>
                    <strong>How export works.</strong> Once connected, the cold-call list page gets an{' '}
                    <strong>Export to Outreach</strong> button. Pick (or create) a sequence and a mailbox,
                    and Superkabe upserts each lead as a Prospect on email and adds it to the sequence.
                    Re-exports are idempotent — already-in prospects aren&apos;t duplicated. See the{' '}
                    <Link href="/docs/integrations/outreach" className="underline">Outreach docs</Link>{' '}
                    for setup details.
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl text-sm mb-4">
                    {error}
                </div>
            )}

            {/* Connection card */}
            {!conn ? (
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 mb-6">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <div className="text-sm font-bold text-gray-900 mb-0.5">Not connected</div>
                            <p className="text-xs text-slate-500">Connect via OAuth to enable exports from the cold call list.</p>
                        </div>
                        <a
                            href="/api/integrations/outreach/authorize"
                            className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1.5"
                        >
                            Connect Outreach
                            <ExternalLink size={11} />
                        </a>
                    </div>
                </div>
            ) : (
                <div
                    className="bg-white rounded-xl p-5 border mb-6 flex flex-col gap-4"
                    style={{
                        borderColor:
                            conn.status === 'active' ? '#A7F3D0'
                            : conn.status === 'error' ? '#FCA5A5'
                            : '#E2E8F0',
                    }}
                >
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src="/logos/outreach-icon.png" alt="Outreach" width={22} height={22} />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-gray-900">Outreach</div>
                                {conn.outreach_user_email ? (
                                    <div className="text-[11px] text-slate-500">Connected as {conn.outreach_user_email}</div>
                                ) : (
                                    <div className="text-[11px] text-slate-400">Account info unavailable</div>
                                )}
                            </div>
                        </div>
                        <span
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold shrink-0"
                            style={{
                                background: STATUS_STYLE[conn.status]?.bg ?? '#F3F4F6',
                                color: STATUS_STYLE[conn.status]?.fg ?? '#6B7280',
                            }}
                        >
                            <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ background: STATUS_STYLE[conn.status]?.dot ?? '#9CA3AF' }}
                            />
                            {STATUS_STYLE[conn.status]?.label ?? conn.status}
                        </span>
                    </div>

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

                    {conn.last_error && (
                        <div className="text-[11px] bg-red-50 border border-red-100 rounded-lg p-2.5 text-red-700 flex items-start gap-1.5">
                            <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                            <span>{conn.last_error}</span>
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-3">
                        <Link
                            href="/dashboard/cold-call-list"
                            className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5"
                        >
                            Go to cold call list
                            <ExternalLink size={10} />
                        </Link>

                        <div className="flex items-center gap-3">
                            {conn.status !== 'active' && (
                                <a
                                    href="/api/integrations/outreach/authorize"
                                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                >
                                    Reconnect
                                </a>
                            )}
                            <button
                                onClick={() => setPendingDisconnect(true)}
                                disabled={busy}
                                className="text-[11px] font-semibold text-red-600 hover:text-red-700 disabled:opacity-50 flex items-center gap-1"
                            >
                                <Trash2 size={11} />
                                Disconnect
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Recent exports */}
            {conn && (
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-bold text-gray-900">Recent exports</div>
                        <button
                            onClick={refresh}
                            className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1"
                        >
                            <RotateCw size={11} /> Refresh
                        </button>
                    </div>

                    {conn.recent_exports.length === 0 ? (
                        <div className="text-xs text-slate-500 py-6 text-center">
                            No exports yet. Head over to the cold call list to push your first one.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                                        <th className="py-2 pr-3">Started</th>
                                        <th className="py-2 pr-3">Source</th>
                                        <th className="py-2 pr-3">Sequence</th>
                                        <th className="py-2 pr-3">State</th>
                                        <th className="py-2 pr-3">Processed</th>
                                        <th className="py-2 pr-3">Created</th>
                                        <th className="py-2 pr-3">In sequence</th>
                                        <th className="py-2 pr-3">Failed</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {conn.recent_exports.map(j => {
                                        const style = STATE_STYLE[j.state] || STATE_STYLE.pending;
                                        return (
                                            <tr key={j.id} className="border-b border-slate-50">
                                                <td className="py-2 pr-3 text-slate-700">{formatDate(j.started_at ?? j.created_at)}</td>
                                                <td className="py-2 pr-3 text-slate-700">
                                                    {j.source_label || j.source_kind}
                                                </td>
                                                <td className="py-2 pr-3 text-slate-700">
                                                    {j.sequence_name ?? j.sequence_id}
                                                    {j.created_sequence && (
                                                        <span className="ml-1 text-[10px] text-emerald-700">(new)</span>
                                                    )}
                                                </td>
                                                <td className="py-2 pr-3">
                                                    <span
                                                        className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                                        style={{ background: style.bg, color: style.fg }}
                                                    >
                                                        {j.state}
                                                    </span>
                                                </td>
                                                <td className="py-2 pr-3 text-slate-700">
                                                    {j.total_processed.toLocaleString()}
                                                    <span className="text-slate-400"> / {j.total.toLocaleString()}</span>
                                                </td>
                                                <td className="py-2 pr-3 text-emerald-700">{j.total_prospects_created.toLocaleString()}</td>
                                                <td className="py-2 pr-3 text-slate-700">{j.total_added_to_sequence.toLocaleString()}</td>
                                                <td className="py-2 pr-3 text-red-700">
                                                    {j.total_failed > 0 ? j.total_failed.toLocaleString() : '—'}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            <ConfirmActionModal
                isOpen={pendingDisconnect}
                title="Disconnect Outreach?"
                icon="🔌"
                message="You're about to disconnect Outreach from this Superkabe workspace."
                consequences={[
                    'Pending export jobs will be cancelled',
                    'OAuth tokens will be wiped from our database',
                    'Prospects already pushed to Outreach stay where they are',
                    'You can reconnect anytime by clicking Connect Outreach',
                ]}
                confirmLabel={busy ? 'Disconnecting…' : 'Disconnect'}
                cancelLabel="Cancel"
                variant="danger"
                loading={busy}
                onConfirm={confirmDisconnect}
                onCancel={() => setPendingDisconnect(false)}
            />
        </div>
    );
}

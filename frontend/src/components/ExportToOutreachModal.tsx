'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/lib/api';
import { Loader2, AlertTriangle, ChevronDown, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface SequenceItem {
    id: string;
    name: string;
    enabled: boolean;
    sequenceStateActiveCount: number | null;
    shareType: string | null;
}

interface MailboxItem {
    id: string;
    email: string;
}

export interface ExportToOutreachProps {
    /** CampaignLead.id values to push as prospects + add to sequence. */
    prospectIds: string[];
    /** 'todays_list' | 'custom_list' | 'campaign' — for audit + UI. */
    sourceKind: string;
    /** Human-readable label shown in the recent-exports table. */
    sourceLabel?: string;
    isOpen: boolean;
    onClose: () => void;
    /** Called after a job is enqueued (with the job id). */
    onEnqueued?: (jobId: string) => void;
}

type ConnectionState =
    | { kind: 'loading' }
    | { kind: 'not_connected' }
    | { kind: 'inactive'; status: string; lastError: string | null }
    | { kind: 'ready' };

export default function ExportToOutreachModal(props: ExportToOutreachProps) {
    const { prospectIds, sourceKind, sourceLabel, isOpen, onClose, onEnqueued } = props;

    const [connState, setConnState] = useState<ConnectionState>({ kind: 'loading' });
    const [sequences, setSequences] = useState<SequenceItem[]>([]);
    const [mailboxes, setMailboxes] = useState<MailboxItem[]>([]);
    const [loadingLists, setLoadingLists] = useState(false);
    const [refreshError, setRefreshError] = useState<string | null>(null);

    const [selectedSequenceId, setSelectedSequenceId] = useState<string>('');
    const [selectedMailboxId, setSelectedMailboxId] = useState<string>('');

    const [createMode, setCreateMode] = useState(false);
    const [newSequenceName, setNewSequenceName] = useState('');
    const [newSequenceShare, setNewSequenceShare] = useState<'private' | 'shared'>('shared');
    const [creatingSequence, setCreatingSequence] = useState(false);

    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Reset transient state on open/close.
    useEffect(() => {
        if (!isOpen) {
            setSubmitError(null);
            setCreateMode(false);
            setNewSequenceName('');
        }
    }, [isOpen]);

    // Probe connection + load sequences/mailboxes when opened.
    useEffect(() => {
        if (!isOpen) return;
        let cancelled = false;
        (async () => {
            setConnState({ kind: 'loading' });
            setRefreshError(null);
            try {
                const conn = await apiClient<{ status: string; last_error: string | null } | null>(
                    '/api/integrations/outreach/connection',
                );
                if (cancelled) return;
                if (!conn) {
                    setConnState({ kind: 'not_connected' });
                    return;
                }
                if (conn.status !== 'active') {
                    setConnState({ kind: 'inactive', status: conn.status, lastError: conn.last_error });
                    return;
                }
                setConnState({ kind: 'ready' });
                setLoadingLists(true);
                const [seqRes, mbxRes] = await Promise.all([
                    apiClient<{ items: SequenceItem[] }>('/api/integrations/outreach/sequences'),
                    apiClient<MailboxItem[]>('/api/integrations/outreach/mailboxes'),
                ]);
                if (cancelled) return;
                setSequences(Array.isArray(seqRes?.items) ? seqRes.items : []);
                setMailboxes(Array.isArray(mbxRes) ? mbxRes : []);
                if (Array.isArray(mbxRes) && mbxRes.length === 1) {
                    setSelectedMailboxId(mbxRes[0].id);
                }
            } catch (err: any) {
                if (!cancelled) setRefreshError(err?.message || 'Failed to load Outreach data');
            } finally {
                if (!cancelled) setLoadingLists(false);
            }
        })();
        return () => { cancelled = true; };
    }, [isOpen]);

    const sequenceLabel = useMemo(() => {
        if (createMode) return '+ Create new sequence…';
        if (!selectedSequenceId) return 'Pick a sequence…';
        const s = sequences.find(s => s.id === selectedSequenceId);
        return s?.name ?? selectedSequenceId;
    }, [createMode, selectedSequenceId, sequences]);

    const handleCreateSequence = async () => {
        const name = newSequenceName.trim();
        if (!name) {
            toast.error('Sequence name is required');
            return;
        }
        setCreatingSequence(true);
        try {
            const seq = await apiClient<SequenceItem>('/api/integrations/outreach/sequences', {
                method: 'POST',
                body: JSON.stringify({ name, share_type: newSequenceShare }),
            });
            setSequences(prev => [seq, ...prev]);
            setSelectedSequenceId(seq.id);
            setCreateMode(false);
            setNewSequenceName('');
            toast.success(`Created "${seq.name}" — add steps inside Outreach when ready`);
        } catch (err: any) {
            toast.error(err?.message || 'Failed to create sequence');
        } finally {
            setCreatingSequence(false);
        }
    };

    const handleSubmit = async () => {
        setSubmitError(null);
        if (!selectedSequenceId) {
            setSubmitError('Pick a sequence');
            return;
        }
        if (!selectedMailboxId) {
            setSubmitError('Pick a mailbox');
            return;
        }
        if (prospectIds.length === 0) {
            setSubmitError('No prospects to export');
            return;
        }
        setSubmitting(true);
        try {
            const seq = sequences.find(s => s.id === selectedSequenceId);
            const r = await apiClient<{ export_job_id: string }>(
                '/api/integrations/outreach/exports',
                {
                    method: 'POST',
                    body: JSON.stringify({
                        prospect_ids: prospectIds,
                        sequence_id: selectedSequenceId,
                        sequence_name: seq?.name ?? null,
                        created_sequence: false, // create step happened in a separate API call
                        mailbox_id: selectedMailboxId,
                        source_kind: sourceKind,
                        source_label: sourceLabel ?? null,
                    }),
                },
            );
            toast.success(`Export queued — ${prospectIds.length} prospect${prospectIds.length === 1 ? '' : 's'}`);
            onEnqueued?.(r.export_job_id);
            onClose();
        } catch (err: any) {
            setSubmitError(err?.message || 'Failed to start export');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
                    aria-label="Close"
                >
                    <X size={18} />
                </button>

                <div className="mb-4">
                    <h2 className="text-base font-bold text-gray-900">Export to Outreach</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Push <strong>{prospectIds.length}</strong> prospect{prospectIds.length === 1 ? '' : 's'} as Outreach prospects and add them to a sequence.
                    </p>
                </div>

                {/* Connection states */}
                {connState.kind === 'loading' && (
                    <div className="text-xs text-gray-500 py-6 text-center flex items-center justify-center gap-2">
                        <Loader2 size={12} className="animate-spin" />
                        Checking Outreach connection…
                    </div>
                )}

                {connState.kind === 'not_connected' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
                        <div className="font-semibold mb-1 flex items-center gap-1.5">
                            <AlertTriangle size={14} /> Outreach isn&apos;t connected yet
                        </div>
                        <p className="text-xs mb-3">
                            Connect via OAuth on the integrations page, then come back here to export.
                        </p>
                        <Link
                            href="/dashboard/integrations/outreach"
                            className="inline-block px-3 py-1.5 text-xs font-semibold rounded-md bg-amber-900 text-white hover:bg-amber-800"
                        >
                            Connect Outreach
                        </Link>
                    </div>
                )}

                {connState.kind === 'inactive' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-900">
                        <div className="font-semibold mb-1 flex items-center gap-1.5">
                            <AlertTriangle size={14} /> Connection is {connState.status}
                        </div>
                        {connState.lastError && (
                            <p className="text-xs mb-3 break-words">{connState.lastError}</p>
                        )}
                        <Link
                            href="/dashboard/integrations/outreach"
                            className="inline-block px-3 py-1.5 text-xs font-semibold rounded-md bg-red-900 text-white hover:bg-red-800"
                        >
                            Reconnect
                        </Link>
                    </div>
                )}

                {connState.kind === 'ready' && (
                    <>
                        {refreshError && (
                            <div className="mb-3 text-xs text-red-700 flex items-start gap-1">
                                <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                                {refreshError}
                            </div>
                        )}

                        {loadingLists && (
                            <div className="text-xs text-gray-500 py-4 text-center flex items-center justify-center gap-2">
                                <Loader2 size={12} className="animate-spin" />
                                Loading sequences and mailboxes…
                            </div>
                        )}

                        {!loadingLists && (
                            <div className="space-y-4">
                                {/* Sequence picker */}
                                <div>
                                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                                        Sequence
                                    </label>
                                    {!createMode ? (
                                        <div className="relative">
                                            <select
                                                value={selectedSequenceId}
                                                onChange={(e) => {
                                                    if (e.target.value === '__create__') {
                                                        setCreateMode(true);
                                                        return;
                                                    }
                                                    setSelectedSequenceId(e.target.value);
                                                }}
                                                className="w-full pl-3 pr-9 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400 bg-white appearance-none"
                                            >
                                                <option value="">Pick a sequence…</option>
                                                <option value="__create__">+ Create new sequence…</option>
                                                {sequences.length > 0 && (
                                                    <option disabled>──────────</option>
                                                )}
                                                {sequences.map(s => (
                                                    <option key={s.id} value={s.id}>
                                                        {s.name}
                                                        {s.sequenceStateActiveCount != null
                                                            ? ` · ${s.sequenceStateActiveCount.toLocaleString()} active`
                                                            : ''}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        </div>
                                    ) : (
                                        <div className="border border-blue-200 bg-blue-50/40 rounded-md p-3 space-y-2">
                                            <div className="text-[11px] font-semibold text-blue-900 flex items-center gap-1">
                                                <Plus size={11} /> New sequence
                                            </div>
                                            <input
                                                type="text"
                                                value={newSequenceName}
                                                onChange={(e) => setNewSequenceName(e.target.value)}
                                                placeholder="e.g. Apr cold call follow-ups"
                                                disabled={creatingSequence}
                                                className="w-full px-3 py-1.5 text-xs border border-blue-200 rounded-md focus:outline-none focus:border-blue-400 bg-white"
                                            />
                                            <label className="flex items-center gap-2 text-[11px] text-blue-900">
                                                <input
                                                    type="checkbox"
                                                    checked={newSequenceShare === 'shared'}
                                                    onChange={(e) => setNewSequenceShare(e.target.checked ? 'shared' : 'private')}
                                                    disabled={creatingSequence}
                                                />
                                                Share with team
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={handleCreateSequence}
                                                    disabled={creatingSequence || !newSequenceName.trim()}
                                                    className="px-3 py-1.5 text-xs font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5"
                                                >
                                                    {creatingSequence && <Loader2 size={11} className="animate-spin" />}
                                                    Create
                                                </button>
                                                <button
                                                    onClick={() => { setCreateMode(false); setNewSequenceName(''); }}
                                                    disabled={creatingSequence}
                                                    className="text-[11px] text-slate-500 hover:text-slate-800 disabled:opacity-50"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                            <p className="text-[10px] text-blue-800 leading-relaxed">
                                                The sequence is created empty — add steps inside Outreach&apos;s sequence editor.
                                                Prospects you export now will be queued and start sending once you publish at least one step.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Mailbox picker */}
                                <div>
                                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                                        Send from mailbox
                                    </label>
                                    {mailboxes.length === 0 ? (
                                        <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-2.5">
                                            No mailboxes found. Connect a mailbox in Outreach first, then refresh this dialog.
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <select
                                                value={selectedMailboxId}
                                                onChange={(e) => setSelectedMailboxId(e.target.value)}
                                                className="w-full pl-3 pr-9 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400 bg-white appearance-none"
                                            >
                                                <option value="">Pick a mailbox…</option>
                                                {mailboxes.map(m => (
                                                    <option key={m.id} value={m.id}>{m.email}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        </div>
                                    )}
                                </div>

                                {submitError && (
                                    <div className="text-[11px] text-red-700 flex items-start gap-1">
                                        <AlertTriangle size={11} className="mt-0.5 shrink-0" />
                                        {submitError}
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                    <span className="text-[11px] text-slate-500">
                                        {sequenceLabel}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={onClose}
                                            disabled={submitting}
                                            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            disabled={submitting || !selectedSequenceId || !selectedMailboxId || createMode}
                                            className="px-4 py-1.5 text-xs font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5"
                                        >
                                            {submitting && <Loader2 size={11} className="animate-spin" />}
                                            Export {prospectIds.length}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

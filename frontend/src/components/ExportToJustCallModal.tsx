'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/lib/api';
import { Loader2, AlertTriangle, ChevronDown, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface CampaignItem {
    id: string;
    name: string;
    type: string | null;
    status: string | null;
    contactCount: number | null;
}

export interface ExportToJustCallProps {
    /** CampaignLead.id values to push as JustCall sales-dialer contacts. */
    prospectIds: string[];
    /** 'todays_list' | 'custom_list' | 'campaign' — for audit + UI. */
    sourceKind: string;
    /** Human-readable label shown in the recent-exports table. */
    sourceLabel?: string;
    isOpen: boolean;
    onClose: () => void;
    onEnqueued?: (jobId: string) => void;
}

type ConnectionState =
    | { kind: 'loading' }
    | { kind: 'not_connected' }
    | { kind: 'inactive'; status: string; lastError: string | null }
    | { kind: 'ready' };

/**
 * Sales-dialer campaigns require a default country_code so JustCall can
 * format E.164 numbers when one is missing the prefix. We don't assume —
 * just default to US and let the user change it before creating.
 */
const COUNTRY_DEFAULT = 'US';

export default function ExportToJustCallModal(props: ExportToJustCallProps) {
    const { prospectIds, sourceKind, sourceLabel, isOpen, onClose, onEnqueued } = props;

    const [connState, setConnState] = useState<ConnectionState>({ kind: 'loading' });
    const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
    const [loadingLists, setLoadingLists] = useState(false);
    const [refreshError, setRefreshError] = useState<string | null>(null);

    const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');

    const [createMode, setCreateMode] = useState(false);
    const [newCampaignName, setNewCampaignName] = useState('');
    const [newCampaignCountry, setNewCampaignCountry] = useState(COUNTRY_DEFAULT);
    const [creatingCampaign, setCreatingCampaign] = useState(false);
    /** Tracks whether the currently-selected campaign was just created in
     *  this session — surfaced in the audit row so the recent-exports list
     *  can show "(new)" alongside the campaign name. */
    const [createdInSession, setCreatedInSession] = useState(false);

    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Reset transient state on open/close.
    useEffect(() => {
        if (!isOpen) {
            setSubmitError(null);
            setCreateMode(false);
            setNewCampaignName('');
            setNewCampaignCountry(COUNTRY_DEFAULT);
            setCreatedInSession(false);
        }
    }, [isOpen]);

    // Probe connection + load campaigns when opened.
    useEffect(() => {
        if (!isOpen) return;
        let cancelled = false;
        (async () => {
            setConnState({ kind: 'loading' });
            setRefreshError(null);
            try {
                const conn = await apiClient<{ status: string; last_error: string | null } | null>(
                    '/api/integrations/justcall/connection',
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
                const res = await apiClient<{ items: CampaignItem[] }>(
                    '/api/integrations/justcall/campaigns',
                );
                if (cancelled) return;
                setCampaigns(Array.isArray(res?.items) ? res.items : []);
            } catch (err: any) {
                if (!cancelled) setRefreshError(err?.message || 'Failed to load JustCall data');
            } finally {
                if (!cancelled) setLoadingLists(false);
            }
        })();
        return () => { cancelled = true; };
    }, [isOpen]);

    const campaignLabel = useMemo(() => {
        if (createMode) return '+ Create new campaign…';
        if (!selectedCampaignId) return 'Pick a campaign…';
        const c = campaigns.find(c => c.id === selectedCampaignId);
        return c?.name ?? selectedCampaignId;
    }, [createMode, selectedCampaignId, campaigns]);

    const handleCreateCampaign = async () => {
        const name = newCampaignName.trim();
        const country = newCampaignCountry.trim().toUpperCase();
        if (!name) {
            toast.error('Campaign name is required');
            return;
        }
        if (country.length < 2 || country.length > 3) {
            toast.error('Country code must be a 2- or 3-letter ISO code (e.g. US, GB)');
            return;
        }
        setCreatingCampaign(true);
        try {
            const c = await apiClient<CampaignItem>('/api/integrations/justcall/campaigns', {
                method: 'POST',
                body: JSON.stringify({ name, country_code: country }),
            });
            setCampaigns(prev => [c, ...prev]);
            setSelectedCampaignId(c.id);
            setCreatedInSession(true);
            setCreateMode(false);
            setNewCampaignName('');
            toast.success(`Created "${c.name}" — assign agents inside JustCall when ready`);
        } catch (err: any) {
            toast.error(err?.message || 'Failed to create campaign');
        } finally {
            setCreatingCampaign(false);
        }
    };

    const handleSubmit = async () => {
        setSubmitError(null);
        if (!selectedCampaignId) {
            setSubmitError('Pick a campaign');
            return;
        }
        if (prospectIds.length === 0) {
            setSubmitError('No prospects to export');
            return;
        }
        setSubmitting(true);
        try {
            const c = campaigns.find(c => c.id === selectedCampaignId);
            const r = await apiClient<{ export_job_id: string }>(
                '/api/integrations/justcall/exports',
                {
                    method: 'POST',
                    body: JSON.stringify({
                        prospect_ids: prospectIds,
                        campaign_id: selectedCampaignId,
                        campaign_name: c?.name ?? null,
                        created_campaign: createdInSession,
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
                    <h2 className="text-base font-bold text-gray-900">Export to JustCall</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Push <strong>{prospectIds.length}</strong> prospect{prospectIds.length === 1 ? '' : 's'} into a JustCall sales-dialer campaign.
                        Leads without a phone number will be skipped — JustCall dedupes by phone.
                    </p>
                </div>

                {/* Connection states */}
                {connState.kind === 'loading' && (
                    <div className="text-xs text-gray-500 py-6 text-center flex items-center justify-center gap-2">
                        <Loader2 size={12} className="animate-spin" />
                        Checking JustCall connection…
                    </div>
                )}

                {connState.kind === 'not_connected' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
                        <div className="font-semibold mb-1 flex items-center gap-1.5">
                            <AlertTriangle size={14} /> JustCall isn&apos;t connected yet
                        </div>
                        <p className="text-xs mb-3">
                            Paste your API key + secret on the integrations page, then come back here to export.
                        </p>
                        <Link
                            href="/dashboard/integrations/justcall"
                            className="inline-block px-3 py-1.5 text-xs font-semibold rounded-md bg-amber-900 text-white hover:bg-amber-800"
                        >
                            Connect JustCall
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
                            href="/dashboard/integrations/justcall"
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
                                Loading sales-dialer campaigns…
                            </div>
                        )}

                        {!loadingLists && (
                            <div className="space-y-4">
                                {/* Campaign picker */}
                                <div>
                                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                                        Sales dialer campaign
                                    </label>
                                    {!createMode ? (
                                        <div className="relative">
                                            <select
                                                value={selectedCampaignId}
                                                onChange={(e) => {
                                                    if (e.target.value === '__create__') {
                                                        setCreateMode(true);
                                                        return;
                                                    }
                                                    setSelectedCampaignId(e.target.value);
                                                    setCreatedInSession(false);
                                                }}
                                                className="w-full pl-3 pr-9 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400 bg-white appearance-none"
                                            >
                                                <option value="">Pick a campaign…</option>
                                                <option value="__create__">+ Create new campaign…</option>
                                                {campaigns.length > 0 && (
                                                    <option disabled>──────────</option>
                                                )}
                                                {campaigns.map(c => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.name}
                                                        {c.contactCount != null
                                                            ? ` · ${c.contactCount.toLocaleString()} contacts`
                                                            : ''}
                                                        {c.type ? ` · ${c.type}` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        </div>
                                    ) : (
                                        <div className="border border-blue-200 bg-blue-50/40 rounded-md p-3 space-y-2">
                                            <div className="text-[11px] font-semibold text-blue-900 flex items-center gap-1">
                                                <Plus size={11} /> New campaign
                                            </div>
                                            <input
                                                type="text"
                                                value={newCampaignName}
                                                onChange={(e) => setNewCampaignName(e.target.value)}
                                                placeholder="e.g. Apr cold call follow-ups"
                                                disabled={creatingCampaign}
                                                className="w-full px-3 py-1.5 text-xs border border-blue-200 rounded-md focus:outline-none focus:border-blue-400 bg-white"
                                            />
                                            <div className="flex items-center gap-2">
                                                <label className="text-[11px] text-blue-900 shrink-0">Country</label>
                                                <input
                                                    type="text"
                                                    value={newCampaignCountry}
                                                    onChange={(e) => setNewCampaignCountry(e.target.value.toUpperCase().slice(0, 3))}
                                                    placeholder="US"
                                                    disabled={creatingCampaign}
                                                    className="w-20 px-2 py-1 text-xs border border-blue-200 rounded-md focus:outline-none focus:border-blue-400 bg-white font-mono"
                                                />
                                                <span className="text-[10px] text-blue-700">2- or 3-letter ISO code; used to format phone numbers without a prefix.</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={handleCreateCampaign}
                                                    disabled={creatingCampaign || !newCampaignName.trim()}
                                                    className="px-3 py-1.5 text-xs font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5"
                                                >
                                                    {creatingCampaign && <Loader2 size={11} className="animate-spin" />}
                                                    Create
                                                </button>
                                                <button
                                                    onClick={() => { setCreateMode(false); setNewCampaignName(''); }}
                                                    disabled={creatingCampaign}
                                                    className="text-[11px] text-slate-500 hover:text-slate-800 disabled:opacity-50"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                            <p className="text-[10px] text-blue-800 leading-relaxed">
                                                The campaign is created in Autodial mode with no agents assigned. Open it inside JustCall
                                                to assign agents and start dialing once contacts arrive.
                                            </p>
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
                                        {campaignLabel}
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
                                            disabled={submitting || !selectedCampaignId || createMode}
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

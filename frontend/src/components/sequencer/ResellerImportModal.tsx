'use client';

/**
 * ResellerImportModal — bulk import Gmail/Outlook mailboxes from
 * mailbox resellers (Zapmail, Premium Inboxes, Mission Inbox, Scaled Mail).
 *
 * Flow:
 *   1. Pick a provider (registry returned by GET /mailbox-import/providers).
 *      Providers with isImplemented=false render as "Coming soon" entries.
 *   2. If the org hasn't connected the provider, prompt for API key.
 *      Submitting calls POST /:provider/connect → validates against the
 *      reseller's API → stores encrypted.
 *   3. Once connected, fetch the mailbox list via GET /:provider/mailboxes.
 *      Each row shows ready/imported/warmup state. User multi-selects.
 *   4. Submit kicks POST /:provider/import → server pulls credentials
 *      from the reseller (server-side, never trusted from the client),
 *      encrypts, creates ConnectedAccount rows, kicks off provisioning.
 *   5. Show per-mailbox results — imported/updated/skipped/failed counts.
 *
 * The credentials NEVER touch the wire toward the browser. Listing
 * returns ready=true|false; import operates on remoteIds. Server fetches
 * fresh credentials from the reseller right before persisting.
 */

import { useEffect, useState, useMemo } from 'react';
import { X, CheckCircle2, AlertCircle, Loader2, Inbox, Search, ArrowLeft, Zap } from 'lucide-react';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

// Maps each provider key to its official logo path under /public/logos.
// File-naming convention: `${key-with-hyphen}-icon.png`.
//
// Today only zapmail-icon.png and scaledmail-icon.png ship in the repo
// (mapped explicitly below). To add Premium Inboxes / Mission Inbox
// official logos: drop the PNG files at the listed paths — the component
// will pick them up automatically with no code change. Until then, the
// `onError` fallback renders a clean initials-in-a-circle so the grid
// stays visually consistent.
const PROVIDER_LOGOS: Record<string, string> = {
    zapmail: '/logos/zapmail-icon.png',
    premium_inboxes: '/logos/premium-inboxes-icon.png',
    mission_inbox: '/logos/mission-inbox-icon.png',
    scaled_mail: '/logos/scaledmail-icon.png',
};

interface ProviderInfo {
    key: string;
    displayName: string;
    isImplemented: boolean;
    connected: boolean;
}

interface RemoteMailbox {
    remoteId: string;
    email: string;
    displayName?: string | null;
    provider: 'google' | 'microsoft';
    domain?: string | null;
    ready: boolean;
    alreadyImported: boolean;
    remoteStatus?: string | null;
    isWarmedUp?: boolean;
}

interface ImportResultItem {
    remoteId: string;
    email: string;
    status: 'imported' | 'updated' | 'skipped' | 'failed';
    error?: string;
}

interface ImportResult {
    total: number;
    imported: number;
    updated: number;
    skipped: number;
    failed: number;
    items: ImportResultItem[];
}

type Step = 'pick-provider' | 'enter-key' | 'select-mailboxes' | 'show-results';

interface ResellerImportModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function ResellerImportModal({ onClose, onSuccess }: ResellerImportModalProps) {
    const [step, setStep] = useState<Step>('pick-provider');
    const [providers, setProviders] = useState<ProviderInfo[]>([]);
    const [providerLoading, setProviderLoading] = useState(true);
    const [activeProvider, setActiveProvider] = useState<ProviderInfo | null>(null);

    // Connect-key state
    const [apiKey, setApiKey] = useState('');
    const [connecting, setConnecting] = useState(false);

    // Mailbox listing state
    const [mailboxes, setMailboxes] = useState<RemoteMailbox[]>([]);
    const [mailboxLoading, setMailboxLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<Set<string>>(new Set());

    // Import state
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState<ImportResult | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await apiClient<{ providers: ProviderInfo[] }>(
                    '/api/sequencer/mailbox-import/providers',
                );
                setProviders(res?.providers || []);
            } catch {
                // apiClient auto-toasts mutations; for GETs stay silent
                setProviders([]);
            } finally {
                setProviderLoading(false);
            }
        })();
    }, []);

    const startProvider = async (p: ProviderInfo) => {
        if (!p.isImplemented) {
            toast(`${p.displayName} integration is coming soon.`, { icon: '⏳' });
            return;
        }
        setActiveProvider(p);
        if (p.connected) {
            // Skip the key-entry step and go straight to mailbox listing.
            await loadMailboxesFor(p);
            setStep('select-mailboxes');
        } else {
            setApiKey('');
            setStep('enter-key');
        }
    };

    const loadMailboxesFor = async (p: ProviderInfo) => {
        setMailboxLoading(true);
        try {
            const res = await apiClient<{ mailboxes: RemoteMailbox[] }>(
                `/api/sequencer/mailbox-import/${p.key}/mailboxes`,
            );
            setMailboxes(res?.mailboxes || []);
            // Pre-select all ready, not-yet-imported mailboxes — operator can deselect.
            const preselected = new Set(
                (res?.mailboxes || [])
                    .filter(m => m.ready && !m.alreadyImported)
                    .map(m => m.remoteId),
            );
            setSelected(preselected);
        } catch {
            setMailboxes([]);
        } finally {
            setMailboxLoading(false);
        }
    };

    const submitKey = async () => {
        if (!activeProvider) return;
        const trimmed = apiKey.trim();
        if (!trimmed) {
            toast.error('API key is required');
            return;
        }
        setConnecting(true);
        try {
            await apiClient(
                `/api/sequencer/mailbox-import/${activeProvider.key}/connect`,
                {
                    method: 'POST',
                    body: JSON.stringify({ apiKey: trimmed }),
                },
            );
            toast.success(`${activeProvider.displayName} connected`);
            // Refresh provider list so connected=true for this provider.
            const provRes = await apiClient<{ providers: ProviderInfo[] }>(
                '/api/sequencer/mailbox-import/providers',
            );
            setProviders(provRes?.providers || []);
            const refreshed = (provRes?.providers || []).find(p => p.key === activeProvider.key);
            const next = refreshed || { ...activeProvider, connected: true };
            setActiveProvider(next);
            await loadMailboxesFor(next);
            setStep('select-mailboxes');
        } catch {
            // apiClient already toasted the validation error
        } finally {
            setConnecting(false);
        }
    };

    const filteredMailboxes = useMemo(() => {
        const q = search.toLowerCase().trim();
        if (!q) return mailboxes;
        return mailboxes.filter(
            m =>
                m.email.toLowerCase().includes(q) ||
                m.domain?.toLowerCase().includes(q) ||
                m.displayName?.toLowerCase().includes(q),
        );
    }, [mailboxes, search]);

    const toggleOne = (remoteId: string, ready: boolean) => {
        if (!ready) return;
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(remoteId)) next.delete(remoteId);
            else next.add(remoteId);
            return next;
        });
    };

    const allFilteredReadyIds = useMemo(
        () => filteredMailboxes.filter(m => m.ready && !m.alreadyImported).map(m => m.remoteId),
        [filteredMailboxes],
    );
    const allFilteredSelected =
        allFilteredReadyIds.length > 0 && allFilteredReadyIds.every(id => selected.has(id));
    const toggleSelectAllFiltered = () => {
        setSelected(prev => {
            const next = new Set(prev);
            if (allFilteredSelected) {
                allFilteredReadyIds.forEach(id => next.delete(id));
            } else {
                allFilteredReadyIds.forEach(id => next.add(id));
            }
            return next;
        });
    };

    const submitImport = async () => {
        if (!activeProvider || selected.size === 0) return;
        setImporting(true);
        try {
            const res = await apiClient<ImportResult & { success: boolean }>(
                `/api/sequencer/mailbox-import/${activeProvider.key}/import`,
                {
                    method: 'POST',
                    body: JSON.stringify({ remoteIds: Array.from(selected) }),
                },
            );
            setResult({
                total: res.total,
                imported: res.imported,
                updated: res.updated,
                skipped: res.skipped,
                failed: res.failed,
                items: res.items,
            });
            setStep('show-results');
            // Surface a top-line toast right away so the operator can dismiss
            // the modal at any time and still know how it went.
            const movedCount = res.imported + res.updated;
            if (movedCount > 0 && res.failed === 0) {
                toast.success(`Imported ${movedCount} mailbox${movedCount === 1 ? '' : 'es'}`);
            } else if (res.failed > 0) {
                toast.error(`${res.failed} import${res.failed === 1 ? '' : 's'} failed; see details`);
            }
        } catch {
            // apiClient auto-toasts
        } finally {
            setImporting(false);
        }
    };

    const finishAndClose = () => {
        onSuccess();
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
            onClick={e => { if (e.target === e.currentTarget && !connecting && !importing) onClose(); }}
        >
            <div
                className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
                style={{ border: '1px solid #D1CBC5' }}
            >
                {/* Header */}
                <div className="px-4 py-3 flex items-center justify-between shrink-0" style={{ borderBottom: '1px solid #D1CBC5' }}>
                    <div className="flex items-center gap-2">
                        {step !== 'pick-provider' && step !== 'show-results' && (
                            <button
                                onClick={() => {
                                    if (step === 'enter-key') setStep('pick-provider');
                                    else if (step === 'select-mailboxes') {
                                        // If they connected this session, drop them back to picker
                                        // — easier UX than expecting them to switch providers manually.
                                        setStep('pick-provider');
                                    }
                                }}
                                className="text-gray-500 hover:text-gray-900 cursor-pointer"
                                title="Back"
                            >
                                <ArrowLeft size={14} />
                            </button>
                        )}
                        <Zap size={14} className="text-gray-500" />
                        <h2 className="text-sm font-bold text-gray-900">
                            {step === 'pick-provider' && 'Import mailboxes from a reseller'}
                            {step === 'enter-key' && `Connect ${activeProvider?.displayName}`}
                            {step === 'select-mailboxes' && `${activeProvider?.displayName} mailboxes`}
                            {step === 'show-results' && 'Import complete'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={connecting || importing}
                        className="text-gray-400 hover:text-gray-600 cursor-pointer disabled:opacity-50"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 min-h-0 overflow-y-auto">
                    {step === 'pick-provider' && (
                        <div className="p-4 flex flex-col gap-3">
                            <p className="text-xs text-gray-600">
                                Pick a reseller you bought mailboxes from. Superkabe will pull credentials directly via their API — no Google OAuth, no per-mailbox consent screens.
                            </p>
                            {providerLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 size={18} className="animate-spin text-gray-400" />
                                </div>
                            ) : providers.length === 0 ? (
                                <div className="text-xs text-gray-400 text-center py-12">
                                    No providers available.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {providers.map(p => (
                                        <button
                                            key={p.key}
                                            onClick={() => startProvider(p)}
                                            disabled={!p.isImplemented}
                                            className={`relative flex items-center gap-3 p-3 text-left rounded-lg transition-colors ${
                                                p.isImplemented
                                                    ? 'cursor-pointer hover:bg-[#FAF7F1] bg-white'
                                                    : 'cursor-not-allowed opacity-60 bg-gray-50'
                                            }`}
                                            style={{ border: '1px solid #D1CBC5' }}
                                        >
                                            <ProviderLogo providerKey={p.key} displayName={p.displayName} />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-gray-900 truncate">{p.displayName}</span>
                                                    {p.connected && (
                                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold uppercase tracking-wider">
                                                            Connected
                                                        </span>
                                                    )}
                                                    {!p.isImplemented && (
                                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-semibold uppercase tracking-wider">
                                                            Soon
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-gray-500 block mt-0.5">
                                                    {p.isImplemented
                                                        ? p.connected
                                                            ? 'Browse + import mailboxes'
                                                            : 'Paste API key, then 1-click import'
                                                        : 'Coming soon — share API docs to enable'}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {step === 'enter-key' && activeProvider && (
                        <div className="p-4 flex flex-col gap-3">
                            <p className="text-xs text-gray-600">
                                Paste your <strong>{activeProvider.displayName}</strong> API key. Superkabe stores it encrypted and uses it only to list and import your mailboxes.
                            </p>
                            <div>
                                <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">
                                    API key
                                </label>
                                <input
                                    type="password"
                                    value={apiKey}
                                    onChange={e => setApiKey(e.target.value)}
                                    placeholder={`${activeProvider.displayName} API key`}
                                    autoFocus
                                    onKeyDown={e => { if (e.key === 'Enter') submitKey(); }}
                                    className="w-full px-3 py-2 text-xs rounded-lg outline-none"
                                    style={{ border: '1px solid #D1CBC5' }}
                                />
                                <p className="text-[10px] text-gray-400 mt-1.5">
                                    Find your key in {activeProvider.displayName} → Settings → Integrations / API.
                                </p>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    onClick={() => setStep('pick-provider')}
                                    disabled={connecting}
                                    className="px-4 py-1.5 text-xs text-gray-600 rounded-lg cursor-pointer disabled:opacity-50"
                                    style={{ border: '1px solid #D1CBC5' }}
                                >
                                    Back
                                </button>
                                <button
                                    onClick={submitKey}
                                    disabled={connecting || !apiKey.trim()}
                                    className="px-4 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg cursor-pointer hover:bg-gray-800 disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    {connecting && <Loader2 size={11} className="animate-spin" />}
                                    {connecting ? 'Validating…' : 'Connect'}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'select-mailboxes' && activeProvider && (
                        <div className="p-4 flex flex-col gap-3">
                            <div className="flex items-center justify-between gap-2">
                                <div className="relative flex-1 max-w-sm">
                                    <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        placeholder="Search by email, domain, or name…"
                                        className="w-full pl-7 pr-2 py-1.5 text-xs rounded-lg outline-none"
                                        style={{ border: '1px solid #D1CBC5' }}
                                    />
                                </div>
                                <span className="text-[10px] text-gray-500 tabular-nums">
                                    {selected.size} of {mailboxes.length} selected
                                </span>
                            </div>

                            {mailboxLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 size={18} className="animate-spin text-gray-400" />
                                </div>
                            ) : mailboxes.length === 0 ? (
                                <div className="text-center py-12">
                                    <Inbox size={20} className="text-gray-300 mx-auto mb-2" />
                                    <p className="text-xs text-gray-500">
                                        No mailboxes found in your {activeProvider.displayName} account.
                                    </p>
                                </div>
                            ) : (
                                <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #E8E3DC' }}>
                                    <table className="w-full text-left text-xs">
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid #E8E3DC', background: '#F7F2EB' }}>
                                                <th className="px-3 py-2 w-8">
                                                    <input
                                                        type="checkbox"
                                                        checked={allFilteredSelected}
                                                        onChange={toggleSelectAllFiltered}
                                                        className="cursor-pointer"
                                                        title="Select all ready, not-yet-imported"
                                                    />
                                                </th>
                                                <th className="px-3 py-2 text-[10px] font-semibold text-gray-500">Email</th>
                                                <th className="px-3 py-2 text-[10px] font-semibold text-gray-500">Domain</th>
                                                <th className="px-3 py-2 text-[10px] font-semibold text-gray-500">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredMailboxes.map(m => {
                                                const isChecked = selected.has(m.remoteId);
                                                const disabled = !m.ready || m.alreadyImported;
                                                return (
                                                    <tr
                                                        key={m.remoteId}
                                                        className={`${disabled ? '' : 'hover:bg-[#F5F1EA] cursor-pointer'} transition-colors`}
                                                        style={{ borderBottom: '1px solid #F0EBE3' }}
                                                        onClick={() => toggleOne(m.remoteId, m.ready && !m.alreadyImported)}
                                                    >
                                                        <td className="px-3 py-1.5">
                                                            <input
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                onChange={() => toggleOne(m.remoteId, m.ready && !m.alreadyImported)}
                                                                onClick={e => e.stopPropagation()}
                                                                disabled={disabled}
                                                                className="cursor-pointer disabled:cursor-not-allowed"
                                                            />
                                                        </td>
                                                        <td className="px-3 py-1.5 text-gray-900 font-medium">{m.email}</td>
                                                        <td className="px-3 py-1.5 text-gray-500">{m.domain || '—'}</td>
                                                        <td className="px-3 py-1.5">
                                                            <MailboxStatusPill
                                                                ready={m.ready}
                                                                alreadyImported={m.alreadyImported}
                                                                isWarmedUp={m.isWarmedUp}
                                                                remoteStatus={m.remoteStatus}
                                                            />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            <div className="flex justify-between items-center pt-1">
                                <p className="text-[10px] text-gray-400">
                                    Provisioning mailboxes (no app password yet) and already-connected ones can&apos;t be selected.
                                </p>
                                <button
                                    onClick={submitImport}
                                    disabled={importing || selected.size === 0}
                                    className="px-4 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg cursor-pointer hover:bg-gray-800 disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    {importing && <Loader2 size={11} className="animate-spin" />}
                                    {importing
                                        ? 'Importing…'
                                        : `Import ${selected.size} mailbox${selected.size === 1 ? '' : 'es'}`}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'show-results' && result && (
                        <div className="p-4 flex flex-col gap-3">
                            <div className="grid grid-cols-4 gap-2">
                                <ResultStat label="Imported" value={result.imported} color="#15803D" bg="#F0FDF4" />
                                <ResultStat label="Updated" value={result.updated} color="#1D4ED8" bg="#EFF6FF" />
                                <ResultStat label="Skipped" value={result.skipped} color="#B45309" bg="#FFFBEB" />
                                <ResultStat label="Failed" value={result.failed} color="#B91C1C" bg="#FEF2F2" />
                            </div>

                            {(result.skipped > 0 || result.failed > 0) && (
                                <div className="rounded-lg overflow-hidden max-h-64 overflow-y-auto" style={{ border: '1px solid #E8E3DC' }}>
                                    <table className="w-full text-left text-xs">
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid #E8E3DC', background: '#F7F2EB' }}>
                                                <th className="px-3 py-2 text-[10px] font-semibold text-gray-500">Mailbox</th>
                                                <th className="px-3 py-2 text-[10px] font-semibold text-gray-500">Result</th>
                                                <th className="px-3 py-2 text-[10px] font-semibold text-gray-500">Reason</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {result.items
                                                .filter(i => i.status === 'skipped' || i.status === 'failed')
                                                .map(i => (
                                                    <tr key={i.remoteId} style={{ borderBottom: '1px solid #F0EBE3' }}>
                                                        <td className="px-3 py-1.5 text-gray-900">{i.email}</td>
                                                        <td className="px-3 py-1.5">
                                                            <span className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                                                i.status === 'failed'
                                                                    ? 'bg-red-50 text-red-700'
                                                                    : 'bg-amber-50 text-amber-700'
                                                            }`}>
                                                                {i.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-1.5 text-gray-600">{i.error || '—'}</td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            <div className="flex justify-end pt-1">
                                <button
                                    onClick={finishAndClose}
                                    className="px-4 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg cursor-pointer hover:bg-gray-800 flex items-center gap-1.5"
                                >
                                    <CheckCircle2 size={11} /> Done
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/**
 * ProviderLogo — renders the official logo from /public/logos/${key}-icon.png
 * if it exists. On 404 (img onError), falls back to a clean initials-in-a-circle
 * tile so the grid stays visually consistent. Drop the missing PNG into
 * /public/logos using the path in PROVIDER_LOGOS and the swap is automatic.
 */
function ProviderLogo({ providerKey, displayName }: { providerKey: string; displayName: string }) {
    const [errored, setErrored] = useState(false);
    const src = PROVIDER_LOGOS[providerKey];

    if (!src || errored) {
        // Two-letter initials, hashed-to-hue background. Stable across renders.
        const initials = displayName
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map(w => w[0]?.toUpperCase() || '')
            .join('') || '?';
        const hue = Array.from(displayName).reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
        return (
            <div
                className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center font-bold text-sm"
                style={{
                    background: `hsl(${hue} 65% 92%)`,
                    color: `hsl(${hue} 50% 30%)`,
                }}
                aria-label={`${displayName} logo`}
            >
                {initials}
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={`${displayName} logo`}
            onError={() => setErrored(true)}
            className="w-10 h-10 rounded-lg object-contain shrink-0 bg-white"
            style={{ border: '1px solid #F0EBE3' }}
        />
    );
}

function MailboxStatusPill({
    ready,
    alreadyImported,
    isWarmedUp,
    remoteStatus,
}: {
    ready: boolean;
    alreadyImported: boolean;
    isWarmedUp?: boolean;
    remoteStatus?: string | null;
}) {
    if (alreadyImported) {
        return (
            <span className="inline-block text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                Already imported
            </span>
        );
    }
    if (!ready) {
        return (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-50 text-amber-700" title={remoteStatus || ''}>
                <AlertCircle size={9} /> Not ready
            </span>
        );
    }
    return (
        <span className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${
            isWarmedUp ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
        }`}>
            {isWarmedUp ? 'Ready • Warmed' : 'Ready'}
        </span>
    );
}

function ResultStat({ label, value, color, bg }: { label: string; value: number; color: string; bg: string }) {
    return (
        <div className="rounded-lg p-3 text-center" style={{ background: bg }}>
            <p className="text-lg font-bold tabular-nums" style={{ color }}>
                {value}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color }}>
                {label}
            </p>
        </div>
    );
}

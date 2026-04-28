'use client';

/**
 * Instantly one-time import wizard.
 *
 * Four steps:
 *   1. Paste API key → POST /validate-key (whoami), then /store-key
 *   2. Preview      → POST /preview (read-only counts + warnings), confirm
 *   3. Import       → POST /start, poll GET /status until terminal
 *   4. Mailbox handoff → list imported mailboxes (all need re-authentication)
 *
 * Page is feature-flag gated client-side (probes /feature on mount).
 * Specific to Instantly:
 *   • Whoami returns the workspace name — we surface it so the user can
 *     confirm they pasted the right key for the right workspace.
 *   • Every mailbox lands disconnected (Instantly does not export creds), so
 *     the handoff step is universal: every imported mailbox needs reconnection.
 *   • 402 status from Instantly is a real "plan inactive" state — surfaced
 *     with explicit copy rather than a generic error.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api';

type Step = 'key' | 'preview' | 'importing' | 'handoff';
type ImportMode = 'conservative' | 'aggressive';

interface PreviewData {
    workspace: { id: string; name: string };
    campaigns: { total: number; byStatus: Record<string, number> };
    mailboxes: { total: number; byProvider: Record<string, number>; reconnectRequired: number };
    leads: {
        total: number;
        neverContacted: number;
        staleContact: number;
        recentContact: number;
        completed: number;
        optedOut: number;
    };
    sequenceSteps: number;
    blockListEntries: number;
    customTags: number;
    leadLabels: number;
    recentContactThresholdDays: number;
    warnings: string[];
}

interface ImportJob {
    id: string;
    platform: string;
    status: string;
    stats: Record<string, unknown> | null;
    error: string | null;
    started_at: string | null;
    completed_at: string | null;
    created_at: string;
}

interface KeyStatus {
    connected: boolean;
    platform: string | null;
    expiresAt: string | null;
    minutesRemaining: number | null;
}

const POLL_INTERVAL_MS = 2500;

const formatMinutesRemaining = (mins: number | null): string => {
    if (mins == null) return '—';
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    return `${h}h ${mins % 60}m`;
};

const providerLabel = (p: string): string => {
    if (p === 'google') return 'Google';
    if (p === 'microsoft') return 'Microsoft';
    if (p === 'smtp') return 'SMTP';
    return p;
};

const STATUS_CODE_LABEL: Record<string, string> = {
    '0': 'Draft',
    '1': 'Active',
    '2': 'Paused',
    '3': 'Completed',
    '4': 'Running Subsequences',
    '-1': 'Accounts Unhealthy',
    '-2': 'Bounce Protect',
    '-99': 'Account Suspended',
};

export default function ImportFromInstantlyPage() {
    const [enabled, setEnabled] = useState<boolean | null>(null);
    const [step, setStep] = useState<Step>('key');
    const [keyStatus, setKeyStatus] = useState<KeyStatus | null>(null);

    const [apiKey, setApiKey] = useState('');
    const [validatingKey, setValidatingKey] = useState(false);
    const [acknowledged, setAcknowledged] = useState(false);

    const [preview, setPreview] = useState<PreviewData | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [confirmedAck, setConfirmedAck] = useState(false);
    const [starting, setStarting] = useState(false);
    const [mode, setMode] = useState<ImportMode>('aggressive');
    const [includeRecentContacts, setIncludeRecentContacts] = useState(false);

    const [job, setJob] = useState<ImportJob | null>(null);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // ── Initial probe ───────────────────────────────────────────────────────
    useEffect(() => {
        (async () => {
            try {
                const flag = await apiClient<{ enabled: boolean }>('/api/migration/from-instantly/feature');
                setEnabled(!!flag?.enabled);
                if (!flag?.enabled) return;

                const [ks, jobRes] = await Promise.all([
                    apiClient<KeyStatus & { success: boolean }>('/api/migration/from-instantly/key-status').catch(() => null),
                    apiClient<{ success: boolean; job: ImportJob | null }>('/api/migration/from-instantly/status').catch(() => null),
                ]);
                if (ks) setKeyStatus(ks);

                const j = jobRes?.job || null;
                if (j) {
                    setJob(j);
                    if (j.status === 'pending' || j.status === 'running' || j.status === 'paused_source') {
                        setStep('importing');
                    } else if (j.status === 'complete') {
                        setStep('handoff');
                    }
                } else if (ks?.connected) {
                    setStep('preview');
                }
            } catch {
                setEnabled(false);
            }
        })();
        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, []);

    // ── Status polling for in-flight job ────────────────────────────────────
    const startPolling = useCallback(() => {
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = setInterval(async () => {
            try {
                const res = await apiClient<{ success: boolean; job: ImportJob | null }>('/api/migration/from-instantly/status');
                const j = res?.job;
                if (!j) return;
                setJob(j);
                if (j.status === 'complete' || j.status === 'failed' || j.status === 'cancelled') {
                    if (pollRef.current) clearInterval(pollRef.current);
                    pollRef.current = null;
                    if (j.status === 'complete') {
                        setStep('handoff');
                        toast.success('Import complete');
                    } else if (j.status === 'failed') {
                        toast.error(`Import failed: ${j.error || 'unknown error'}`);
                    }
                }
            } catch { /* keep polling */ }
        }, POLL_INTERVAL_MS);
    }, []);

    // ── Key step ────────────────────────────────────────────────────────────
    const handleStoreKey = async () => {
        const trimmed = apiKey.trim();
        if (!trimmed) { toast.error('Paste your Instantly API key first'); return; }
        if (!acknowledged) { toast.error('Acknowledge the import behavior to continue'); return; }
        setValidatingKey(true);
        try {
            const res = await apiClient<{ success: boolean; expiresAt: string; workspace: { id: string; name: string } }>('/api/migration/from-instantly/store-key', {
                method: 'POST',
                body: JSON.stringify({ apiKey: trimmed, acknowledged: true }),
            });
            toast.success(`Key stored — workspace "${res.workspace.name}"`);
            const ks = await apiClient<KeyStatus & { success: boolean }>('/api/migration/from-instantly/key-status');
            setKeyStatus(ks);
            setApiKey('');
            setStep('preview');
        } catch (err: any) {
            toast.error(err?.message || 'Could not store key');
        } finally {
            setValidatingKey(false);
        }
    };

    const handleDiscardKey = async () => {
        if (!confirm('Discard the stored Instantly API key now? You\'ll need to paste it again to retry the import.')) return;
        try {
            await apiClient('/api/migration/from-instantly/discard-key', { method: 'POST' });
            toast.success('Key discarded');
            setKeyStatus({ connected: false, platform: null, expiresAt: null, minutesRemaining: null });
            setStep('key');
        } catch (err: any) {
            toast.error(err?.message || 'Discard failed');
        }
    };

    // ── Preview step ────────────────────────────────────────────────────────
    const handlePreview = async () => {
        setPreviewLoading(true);
        try {
            const res = await apiClient<{ success: boolean; data: PreviewData }>('/api/migration/from-instantly/preview', { method: 'POST' });
            setPreview(res.data);
        } catch (err: any) {
            toast.error(err?.message || 'Preview failed');
        } finally {
            setPreviewLoading(false);
        }
    };

    useEffect(() => {
        if (step === 'preview' && !preview && keyStatus?.connected) {
            handlePreview();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step, keyStatus]);

    // ── Start import ────────────────────────────────────────────────────────
    const handleStart = async () => {
        if (!confirmedAck) { toast.error('Confirm the migration policy first'); return; }
        setStarting(true);
        try {
            const res = await apiClient<{ success: boolean; jobId: string }>('/api/migration/from-instantly/start', {
                method: 'POST',
                body: JSON.stringify({ mode, includeRecentContacts }),
            });
            toast.success('Import started');
            setStep('importing');
            const jobRes = await apiClient<{ success: boolean; job: ImportJob | null }>('/api/migration/from-instantly/status');
            if (jobRes?.job) setJob(jobRes.job);
            startPolling();
            void res;
        } catch (err: any) {
            toast.error(err?.message || 'Could not start import');
        } finally {
            setStarting(false);
        }
    };

    // ── Render ──────────────────────────────────────────────────────────────
    if (enabled === null) {
        return <div className="p-8 text-sm text-gray-500">Loading…</div>;
    }
    if (!enabled) {
        return (
            <div className="p-8">
                <h1 className="text-xl font-bold text-gray-900">Import from Instantly</h1>
                <p className="text-sm text-gray-500 mt-2">This feature isn&apos;t enabled in your environment yet. Contact your admin.</p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Import from Instantly</h1>
                    <p className="text-sm text-gray-500 mt-1">One-time import of campaigns, leads, mailboxes, and block list. Your API key auto-discards after the import completes.</p>
                </div>
                <Link href="/dashboard/integrations" className="text-xs text-gray-500 hover:text-gray-900">← Integrations</Link>
            </div>

            {/* Stepper */}
            <div className="flex items-center gap-2 mb-6 text-xs">
                {(['key', 'preview', 'importing', 'handoff'] as Step[]).map((s, i) => (
                    <div key={s} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${step === s ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200'}`}>
                        <span className="font-bold">{i + 1}</span>
                        <span className="capitalize">{s === 'handoff' ? 'Reconnect mailboxes' : s}</span>
                    </div>
                ))}
            </div>

            {/* ────── Step 1: Key ────── */}
            {step === 'key' && (
                <section className="bg-white border border-gray-200 rounded-xl p-6">
                    <h2 className="text-base font-bold text-gray-900 mb-1">1. Paste your Instantly API key</h2>
                    <p className="text-xs text-gray-500 mb-4">
                        Generate a key inside <a href="https://app.instantly.ai" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Instantly → Integrations → API Keys</a> with read access to <code className="px-1 bg-gray-100 rounded">campaigns</code>, <code className="px-1 bg-gray-100 rounded">leads</code>, <code className="px-1 bg-gray-100 rounded">accounts</code>, <code className="px-1 bg-gray-100 rounded">block_lists</code>, <code className="px-1 bg-gray-100 rounded">custom_tags</code>, and <code className="px-1 bg-gray-100 rounded">lead_labels</code>. We never write to your Instantly workspace.
                    </p>

                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="instantly_xxx..."
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono mb-4"
                        autoComplete="off"
                    />

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                        <h3 className="text-xs font-bold text-amber-900 mb-1">Before you proceed</h3>
                        <ul className="text-[11px] text-amber-900 list-disc pl-4 space-y-0.5">
                            <li>Instantly does <strong>not</strong> export mailbox passwords or OAuth tokens. After the import, every mailbox lands disconnected and you must re-authenticate it in Superkabe before it can send.</li>
                            <li>Bounce reasons and per-event open/click history are not exposed by Instantly&apos;s API. We can mark a lead as bounced but can&apos;t reconstruct hard-vs-soft classifications.</li>
                            <li>Your key is stored encrypted, never logged in plaintext, and auto-deleted within 24 hours of completion (72-hour hard ceiling).</li>
                        </ul>
                    </div>

                    <label className="flex items-start gap-2 mb-4 text-xs text-gray-700 cursor-pointer">
                        <input type="checkbox" checked={acknowledged} onChange={(e) => setAcknowledged(e.target.checked)} className="mt-0.5" />
                        <span>I understand Superkabe will read campaigns, leads, mailbox metadata, block list, and tags from my Instantly workspace, and that imported mailboxes will need re-authentication.</span>
                    </label>

                    <button
                        onClick={handleStoreKey}
                        disabled={!apiKey.trim() || !acknowledged || validatingKey}
                        className="px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-lg disabled:opacity-30"
                    >
                        {validatingKey ? 'Validating…' : 'Validate & store key'}
                    </button>
                </section>
            )}

            {/* ────── Step 2: Preview ────── */}
            {step === 'preview' && (
                <section className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-bold text-gray-900">2. Preview what we&apos;ll import</h2>
                        {keyStatus?.connected && (
                            <button onClick={handleDiscardKey} className="text-xs text-rose-600 hover:underline">Discard key</button>
                        )}
                    </div>

                    {keyStatus?.minutesRemaining != null && (
                        <p className="text-[11px] text-gray-500 mb-4">Key expires in {formatMinutesRemaining(keyStatus.minutesRemaining)}.</p>
                    )}

                    {previewLoading && <p className="text-sm text-gray-500">Reading from Instantly…</p>}

                    {preview && (
                        <>
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                                <div className="text-[10px] font-bold uppercase text-gray-500">Workspace</div>
                                <div className="text-sm font-semibold text-gray-900">{preview.workspace.name}</div>
                                <div className="text-[10px] text-gray-400 font-mono mt-0.5">{preview.workspace.id}</div>
                            </div>

                            {preview.warnings.length > 0 && (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                                    <h3 className="text-xs font-bold text-amber-900 mb-1.5">What Instantly does NOT export</h3>
                                    <ul className="text-[11px] text-amber-900 list-disc pl-4 space-y-1">
                                        {preview.warnings.map((w, i) => <li key={i}>{w}</li>)}
                                    </ul>
                                </div>
                            )}

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                <Stat label="Campaigns" value={preview.campaigns.total} />
                                <Stat label="Sequence steps" value={preview.sequenceSteps} />
                                <Stat label="Mailboxes" value={preview.mailboxes.total} sub="all need re-auth" />
                                <Stat label="Leads" value={preview.leads.total} />
                                <Stat label="Block list" value={preview.blockListEntries} />
                                <Stat label="Custom tags" value={preview.customTags} />
                                <Stat label="Lead labels" value={preview.leadLabels} />
                            </div>

                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4 text-[11px] text-gray-700">
                                <div className="font-bold mb-1.5">Lead breakdown</div>
                                <div className="grid grid-cols-2 gap-1">
                                    <span>Never contacted</span><span className="font-mono">{preview.leads.neverContacted}</span>
                                    <span>Stale contact (&gt;{preview.recentContactThresholdDays}d)</span><span className="font-mono">{preview.leads.staleContact}</span>
                                    <span>Recent contact (≤{preview.recentContactThresholdDays}d)</span><span className="font-mono">{preview.leads.recentContact}</span>
                                    <span>Sequence completed</span><span className="font-mono">{preview.leads.completed}</span>
                                    <span>Opted out / Bounced (skipped)</span><span className="font-mono">{preview.leads.optedOut}</span>
                                </div>
                            </div>

                            {Object.keys(preview.campaigns.byStatus).length > 0 && (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4 text-[11px] text-gray-700">
                                    <div className="font-bold mb-1.5">Campaigns by status</div>
                                    <div className="grid grid-cols-2 gap-1">
                                        {Object.entries(preview.campaigns.byStatus).map(([s, n]) => (
                                            <>
                                                <span key={`${s}-l`}>{STATUS_CODE_LABEL[s] || `Status ${s}`}</span>
                                                <span key={`${s}-v`} className="font-mono">{n}</span>
                                            </>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {Object.keys(preview.mailboxes.byProvider).length > 0 && (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4 text-[11px] text-gray-700">
                                    <div className="font-bold mb-1.5">Mailboxes by provider</div>
                                    <div className="grid grid-cols-2 gap-1">
                                        {Object.entries(preview.mailboxes.byProvider).map(([p, n]) => (
                                            <>
                                                <span key={`${p}-l`}>{providerLabel(p)}</span>
                                                <span key={`${p}-v`} className="font-mono">{n}</span>
                                            </>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Mode selector */}
                            <div className="border border-gray-200 rounded-lg p-4 mb-4">
                                <h3 className="text-xs font-bold text-gray-900 mb-2">Migration mode</h3>
                                <label className="flex items-start gap-2 mb-2 cursor-pointer">
                                    <input type="radio" name="mode" checked={mode === 'aggressive'} onChange={() => setMode('aggressive')} className="mt-0.5" />
                                    <div>
                                        <div className="text-xs font-semibold text-gray-900">Full migration <span className="ml-1 text-[10px] text-gray-500">(recommended)</span></div>
                                        <div className="text-[11px] text-gray-500">Import every lead with status preserved (current step, replied/bounced flags, last-contact timestamp). Best when you intend to retire your Instantly account.</div>
                                    </div>
                                </label>
                                <label className="flex items-start gap-2 mb-1 cursor-pointer">
                                    <input type="radio" name="mode" checked={mode === 'conservative'} onChange={() => setMode('conservative')} className="mt-0.5" />
                                    <div>
                                        <div className="text-xs font-semibold text-gray-900">Conservative</div>
                                        <div className="text-[11px] text-gray-500">Only import leads that haven&apos;t been contacted yet. Safest if you plan to keep Instantly running in parallel.</div>
                                    </div>
                                </label>
                                {mode === 'aggressive' && preview.leads.recentContact > 0 && (
                                    <label className="flex items-center gap-2 mt-3 ml-5 text-[11px] cursor-pointer">
                                        <input type="checkbox" checked={includeRecentContacts} onChange={(e) => setIncludeRecentContacts(e.target.checked)} />
                                        <span className="text-gray-700">Also include {preview.leads.recentContact} leads contacted in the last {preview.recentContactThresholdDays} days (higher risk of duplicate outreach)</span>
                                    </label>
                                )}
                            </div>

                            <label className="flex items-start gap-2 mb-4 text-xs text-gray-700 cursor-pointer">
                                <input type="checkbox" checked={confirmedAck} onChange={(e) => setConfirmedAck(e.target.checked)} className="mt-0.5" />
                                <span>I&apos;ve reviewed the counts above. I understand campaigns will land paused in Superkabe and mailboxes will need re-authentication before any sending happens.</span>
                            </label>

                            <button
                                onClick={handleStart}
                                disabled={!confirmedAck || starting}
                                className="px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-lg disabled:opacity-30"
                            >
                                {starting ? 'Starting…' : 'Start import'}
                            </button>
                        </>
                    )}
                </section>
            )}

            {/* ────── Step 3: Importing ────── */}
            {step === 'importing' && (
                <section className="bg-white border border-gray-200 rounded-xl p-6">
                    <h2 className="text-base font-bold text-gray-900 mb-1">3. Importing…</h2>
                    <p className="text-xs text-gray-500 mb-4">Don&apos;t close this tab — we&apos;ll show progress as the worker pulls each campaign.</p>

                    {job ? (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                                <Stat label="Status" value={job.status} />
                                {job.stats && Object.entries(job.stats).filter(([k]) => typeof (job.stats as any)[k] === 'number').map(([k, v]) => (
                                    <Stat key={k} label={k.replace(/_/g, ' ')} value={Number(v)} />
                                ))}
                            </div>
                            {job.error && (
                                <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-900">
                                    <div className="font-bold mb-1">Error</div>
                                    <div>{job.error}</div>
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="text-sm text-gray-500">Waiting for worker…</p>
                    )}
                </section>
            )}

            {/* ────── Step 4: Handoff ────── */}
            {step === 'handoff' && (
                <section className="bg-white border border-gray-200 rounded-xl p-6">
                    <h2 className="text-base font-bold text-gray-900 mb-1">4. Reconnect your mailboxes</h2>
                    <p className="text-xs text-gray-500 mb-4">
                        The import finished. Every imported campaign is paused, and every mailbox is currently disconnected (Instantly does not export sender credentials). Reconnect each mailbox to start sending from Superkabe.
                    </p>

                    {job?.stats && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                            {['leadsImported', 'mailboxesImported', 'campaignsFound', 'sequenceStepsImported', 'variantsImported', 'blockListImported'].map(k => (
                                ((job.stats as any)[k] != null) ? (
                                    <Stat key={k} label={k.replace(/([A-Z])/g, ' $1').toLowerCase()} value={Number((job.stats as any)[k])} />
                                ) : null
                            ))}
                        </div>
                    )}

                    <div className="flex gap-2">
                        <Link href="/dashboard/sequencer/accounts" className="px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-lg">Reconnect mailboxes →</Link>
                        <Link href="/dashboard/sequencer/campaigns" className="px-4 py-2 bg-white text-gray-700 text-xs font-semibold rounded-lg border border-gray-200">Review imported campaigns</Link>
                    </div>
                </section>
            )}
        </div>
    );
}

function Stat({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
    return (
        <div className="border border-gray-200 rounded-lg p-3">
            <div className="text-[10px] font-bold uppercase text-gray-500">{label}</div>
            <div className="text-lg font-bold text-gray-900 tabular-nums">{value}</div>
            {sub && <div className="text-[10px] text-gray-400">{sub}</div>}
        </div>
    );
}

'use client';

/**
 * Smartlead one-time import wizard.
 *
 * Four steps:
 *   1. Paste API key → POST /validate-key, then POST /store-key
 *   2. Preview      → POST /preview (read-only counts), confirm + checkbox
 *   3. Import       → POST /start, then poll GET /status until terminal
 *   4. Mailbox handoff → list imported mailboxes with native-connect CTAs
 *
 * The whole page is feature-flag gated client-side (probes /feature on mount;
 * server returns 404 when MIGRATION_TOOL_ENABLED is unset).
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api';

type Step = 'key' | 'preview' | 'importing' | 'handoff';

interface PreviewData {
    campaigns:    { total: number; byStatus: Record<string, number> };
    mailboxes:    { total: number; byProvider: Record<string, number> };
    leads: {
        total: number;
        neverContacted: number;     // last_sent_time = null — always imported
        staleContact: number;       // last contact older than threshold
        recentContact: number;      // last contact within threshold (default skip even in aggressive)
        completed: number;          // sequence finished without reply
        optedOut: number;           // PAUSED / STOPPED — never imported
    };
    sequenceSteps: number;
    recentContactThresholdDays: number;
}

type ImportMode = 'conservative' | 'aggressive';

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
    const m = mins % 60;
    return `${h}h ${m}m`;
};

const providerLabel = (p: string): string => {
    const u = (p || '').toUpperCase();
    if (u === 'GMAIL') return 'Google';
    if (u === 'OUTLOOK') return 'Microsoft';
    if (u === 'SMTP') return 'SMTP';
    return p;
};

export default function ImportFromSmartleadPage() {
    const [enabled, setEnabled] = useState<boolean | null>(null);
    const [step, setStep] = useState<Step>('key');
    const [keyStatus, setKeyStatus] = useState<KeyStatus | null>(null);

    const [apiKey, setApiKey] = useState('');
    const [validatingKey, setValidatingKey] = useState(false);
    const [acknowledgedAuthorization, setAcknowledgedAuthorization] = useState(false);

    const [preview, setPreview] = useState<PreviewData | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [confirmedPause, setConfirmedPause] = useState(false);
    const [starting, setStarting] = useState(false);
    // Aggressive default per Profile-1 majority (most customers migrating want
    // to fully decommission Smartlead). Conservative remains one click away.
    const [mode, setMode] = useState<ImportMode>('aggressive');
    const [includeRecentContacts, setIncludeRecentContacts] = useState(false);

    const [job, setJob] = useState<ImportJob | null>(null);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // ── Initial probe: feature flag + key/job state ──────────────────────────
    useEffect(() => {
        (async () => {
            try {
                const flag = await apiClient<{ enabled: boolean }>('/api/migration/from-smartlead/feature');
                setEnabled(!!flag?.enabled);
                if (!flag?.enabled) return;

                const [ks, jobRes] = await Promise.all([
                    apiClient<KeyStatus & { success: boolean }>('/api/migration/from-smartlead/key-status').catch(() => null),
                    apiClient<{ success: boolean; job: ImportJob | null }>('/api/migration/from-smartlead/status').catch(() => null),
                ]);
                if (ks) setKeyStatus(ks);

                // Decide entry step from server state.
                if (jobRes?.job) {
                    setJob(jobRes.job);
                    if (jobRes.job.status === 'complete') {
                        setStep('handoff');
                    } else if (['running', 'pending', 'paused_source'].includes(jobRes.job.status)) {
                        setStep('importing');
                    } else if (ks?.connected) {
                        setStep('preview');
                    }
                } else if (ks?.connected) {
                    setStep('preview');
                }
            } catch {
                // 404 from feature endpoint → treat as disabled.
                setEnabled(false);
            }
        })();
    }, []);

    // ── Step 3: poll job status ──────────────────────────────────────────────
    useEffect(() => {
        if (step !== 'importing') return;
        const tick = async () => {
            try {
                const r = await apiClient<{ success: boolean; job: ImportJob | null }>('/api/migration/from-smartlead/status');
                if (r?.job) setJob(r.job);
                if (r?.job?.status === 'complete') {
                    setStep('handoff');
                } else if (r?.job?.status === 'failed' || r?.job?.status === 'cancelled') {
                    // Stop polling — error renders in step 3.
                    if (pollRef.current) clearInterval(pollRef.current);
                }
            } catch {
                /* poll errors are non-fatal */
            }
        };
        tick();
        pollRef.current = setInterval(tick, POLL_INTERVAL_MS);
        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, [step]);

    // ── Action handlers ──────────────────────────────────────────────────────
    const handleValidateAndStore = useCallback(async () => {
        if (!apiKey.trim()) {
            toast.error('Paste your Smartlead admin API key first');
            return;
        }
        if (!acknowledgedAuthorization) {
            toast.error('Please confirm authorization before continuing');
            return;
        }
        setValidatingKey(true);
        try {
            const stored = await apiClient<{ success: boolean; expiresAt: string }>(
                '/api/migration/from-smartlead/store-key',
                {
                    method: 'POST',
                    body: JSON.stringify({
                        apiKey: apiKey.trim(),
                        platform: 'smartlead',
                        acknowledged: true,
                    }),
                },
            );
            if (!stored?.success) throw new Error('store-key returned unsuccessful');
            toast.success('API key stored — fetching preview…');
            setApiKey('');
            // Refresh key status, then move to preview.
            const ks = await apiClient<KeyStatus & { success: boolean }>('/api/migration/from-smartlead/key-status');
            setKeyStatus(ks);
            setStep('preview');
        } catch (err: any) {
            toast.error(err?.message || 'Failed to validate key');
        } finally {
            setValidatingKey(false);
        }
    }, [apiKey, acknowledgedAuthorization]);

    const handleLoadPreview = useCallback(async () => {
        setPreviewLoading(true);
        try {
            const r = await apiClient<{ success: boolean; data: PreviewData }>(
                '/api/migration/from-smartlead/preview',
                { method: 'POST' },
            );
            setPreview(r.data);
        } catch (err: any) {
            toast.error(err?.message || 'Preview failed');
        } finally {
            setPreviewLoading(false);
        }
    }, []);

    useEffect(() => {
        if (step === 'preview' && !preview && !previewLoading) {
            handleLoadPreview();
        }
    }, [step, preview, previewLoading, handleLoadPreview]);

    const handleStart = useCallback(async () => {
        if (!confirmedPause) {
            toast.error('Confirm that active Smartlead campaigns will be paused first');
            return;
        }
        setStarting(true);
        try {
            const r = await apiClient<{ success: boolean; jobId: string }>(
                '/api/migration/from-smartlead/start',
                {
                    method: 'POST',
                    body: JSON.stringify({
                        mode,
                        includeRecentContacts: mode === 'aggressive' && includeRecentContacts,
                    }),
                },
            );
            if (!r?.success) throw new Error('start returned unsuccessful');
            setStep('importing');
        } catch (err: any) {
            toast.error(err?.message || 'Failed to start import');
        } finally {
            setStarting(false);
        }
    }, [confirmedPause, mode, includeRecentContacts]);

    const handleDiscardKey = useCallback(async () => {
        if (!confirm('Discard your Smartlead API key now? You can paste it again later.')) return;
        try {
            await apiClient('/api/migration/from-smartlead/discard-key', { method: 'POST' });
            toast.success('Key discarded');
            setKeyStatus({ connected: false, platform: null, expiresAt: null, minutesRemaining: null });
            setStep('key');
        } catch (err: any) {
            toast.error(err?.message || 'Failed to discard key');
        }
    }, []);

    // ── Loading / disabled gates ─────────────────────────────────────────────
    if (enabled === null) {
        return <div className="px-6 py-10"><p className="text-sm text-gray-500">Loading…</p></div>;
    }
    if (enabled === false) {
        return (
            <div className="px-6 py-10 max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Migration tool unavailable</h1>
                <p className="text-sm text-gray-500">
                    The Smartlead import wizard is not enabled in this environment.
                </p>
            </div>
        );
    }

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="px-6 py-8 max-w-3xl mx-auto">
            <Link
                href="/dashboard/integrations"
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 mb-4"
            >
                <span aria-hidden>←</span>
                Back to Integrations
            </Link>
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Import from Smartlead</h1>
                <p className="text-sm text-gray-500 mt-1">
                    One-time migration. Your campaigns, sequences, leads, and mailbox metadata
                    move to Superkabe. Your Smartlead admin API key is held encrypted for at most
                    72 hours, then automatically wiped.
                </p>
            </header>

            <Stepper currentStep={step} />

            {keyStatus?.connected && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3">
                    <div className="text-sm text-amber-900">
                        <span className="font-semibold">Key on file</span> — auto-discards in{' '}
                        <span className="font-mono">{formatMinutesRemaining(keyStatus.minutesRemaining)}</span>
                    </div>
                    <button
                        onClick={handleDiscardKey}
                        className="text-xs font-semibold text-amber-900 underline hover:text-amber-700"
                    >
                        Discard now
                    </button>
                </div>
            )}

            {step === 'key' && (
                <StepKey
                    apiKey={apiKey}
                    setApiKey={setApiKey}
                    acknowledged={acknowledgedAuthorization}
                    setAcknowledged={setAcknowledgedAuthorization}
                    validating={validatingKey}
                    onSubmit={handleValidateAndStore}
                />
            )}

            {step === 'preview' && (
                <StepPreview
                    preview={preview}
                    loading={previewLoading}
                    mode={mode}
                    setMode={setMode}
                    includeRecentContacts={includeRecentContacts}
                    setIncludeRecentContacts={setIncludeRecentContacts}
                    confirmedPause={confirmedPause}
                    setConfirmedPause={setConfirmedPause}
                    starting={starting}
                    onStart={handleStart}
                    onReload={handleLoadPreview}
                />
            )}

            {step === 'importing' && <StepImporting job={job} />}

            {step === 'handoff' && <StepHandoff job={job} />}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stepper (visual only)
// ─────────────────────────────────────────────────────────────────────────────

function Stepper({ currentStep }: { currentStep: Step }) {
    const steps: { id: Step; label: string }[] = [
        { id: 'key',       label: '1. API key' },
        { id: 'preview',   label: '2. Preview' },
        { id: 'importing', label: '3. Import' },
        { id: 'handoff',   label: '4. Connect mailboxes' },
    ];
    const idx = steps.findIndex(s => s.id === currentStep);
    return (
        <ol className="flex items-center gap-2 mb-8 text-xs font-semibold">
            {steps.map((s, i) => {
                const done = i < idx;
                const active = i === idx;
                return (
                    <li
                        key={s.id}
                        className={`px-3 py-1.5 rounded-full border ${
                            done
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : active
                                    ? 'bg-gray-900 text-white border-gray-900'
                                    : 'bg-white text-gray-400 border-gray-200'
                        }`}
                    >
                        {s.label}
                    </li>
                );
            })}
        </ol>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1 — paste API key
// ─────────────────────────────────────────────────────────────────────────────

function StepKey(props: {
    apiKey: string;
    setApiKey: (v: string) => void;
    acknowledged: boolean;
    setAcknowledged: (v: boolean) => void;
    validating: boolean;
    onSubmit: () => void;
}) {
    const { apiKey, setApiKey, acknowledged, setAcknowledged, validating, onSubmit } = props;
    return (
        <section className="bg-white rounded-2xl p-8 border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Paste your Smartlead admin API key</h2>
            <p className="text-sm text-gray-500 mb-6">
                Find it in Smartlead under{' '}
                <span className="font-mono text-gray-700">Settings → API Keys</span>. We validate it
                immediately, encrypt at rest, and auto-discard 24 hours after import completes (or
                72 hours after paste, whichever comes first).
            </p>
            <input
                type="password"
                autoComplete="off"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="sl_admin_..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm font-mono focus:outline-none focus:border-gray-700 mb-4"
            />

            {/* Required authorization acknowledgment — recorded as a Consent
                row so we have explicit, audit-grade evidence the customer
                authorized us to act on their behalf with this key. */}
            <label className="flex items-start gap-2 p-4 bg-amber-50 border border-amber-200 rounded-xl cursor-pointer mb-4">
                <input
                    type="checkbox"
                    checked={acknowledged}
                    onChange={(e) => setAcknowledged(e.target.checked)}
                    className="mt-0.5 shrink-0"
                />
                <span className="text-sm text-amber-900">
                    <strong>I authorize Superkabe</strong> to use this API key on my behalf to: read
                    campaigns, sequences, leads, and email-account metadata; pause active campaigns
                    in Smartlead at the start of import to prevent duplicate sends. Authorization
                    expires automatically when the key is wiped.
                </span>
            </label>

            <button
                onClick={onSubmit}
                disabled={validating || !apiKey.trim() || !acknowledged}
                className="px-5 py-2.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {validating ? 'Validating…' : 'Validate & continue'}
            </button>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2 — preview
// ─────────────────────────────────────────────────────────────────────────────

function StepPreview(props: {
    preview: PreviewData | null;
    loading: boolean;
    mode: ImportMode;
    setMode: (m: ImportMode) => void;
    includeRecentContacts: boolean;
    setIncludeRecentContacts: (v: boolean) => void;
    confirmedPause: boolean;
    setConfirmedPause: (v: boolean) => void;
    starting: boolean;
    onStart: () => void;
    onReload: () => void;
}) {
    const {
        preview, loading, mode, setMode,
        includeRecentContacts, setIncludeRecentContacts,
        confirmedPause, setConfirmedPause, starting, onStart, onReload,
    } = props;

    if (loading || !preview) {
        return (
            <section className="bg-white rounded-2xl p-8 border border-gray-200">
                <p className="text-sm text-gray-500">Reading your Smartlead workspace…</p>
            </section>
        );
    }

    const L = preview.leads;
    const threshold = preview.recentContactThresholdDays;

    // What gets imported under the current selections — single source of truth.
    const importing = (() => {
        if (mode === 'conservative') return L.neverContacted;
        const base = L.neverContacted + L.staleContact + L.completed;
        return base + (includeRecentContacts ? L.recentContact : 0);
    })();

    return (
        <section className="bg-white rounded-2xl p-8 border border-gray-200 space-y-6">
            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">Preview</h2>
                <p className="text-sm text-gray-500">Here's what we found in your Smartlead workspace.</p>
            </div>

            {/* Top totals */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Stat label="Campaigns" value={preview.campaigns.total} />
                <Stat label="Mailboxes" value={preview.mailboxes.total} />
                <Stat label="Sequence steps" value={preview.sequenceSteps} />
                <Stat label="Leads (total)" value={L.total} />
            </div>

            {/* Lead-bucket breakdown — informational, not interactive */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-600 uppercase tracking-wide">
                    Lead breakdown
                </div>
                <ul className="divide-y divide-gray-100 text-sm">
                    <BucketRow
                        label="Never contacted"
                        sublabel="No email has gone out yet — always safe to import"
                        value={L.neverContacted}
                        tag="always imports"
                        tagColor="emerald"
                    />
                    <BucketRow
                        label={`Last contacted more than ${threshold} days ago`}
                        sublabel="Recipients unlikely to remember — safe to restart fresh from step 1"
                        value={L.staleContact}
                        tag={mode === 'aggressive' ? 'aggressive only' : 'skipped'}
                        tagColor={mode === 'aggressive' ? 'blue' : 'gray'}
                    />
                    <BucketRow
                        label={`Last contacted in the last ${threshold} days`}
                        sublabel="Recipients likely to remember — duplicate first-touch may hurt reply rate"
                        value={L.recentContact}
                        tag={
                            mode === 'aggressive' && includeRecentContacts
                                ? 'aggressive + recent'
                                : 'skipped'
                        }
                        tagColor={mode === 'aggressive' && includeRecentContacts ? 'amber' : 'gray'}
                    />
                    <BucketRow
                        label="Sequence completed"
                        sublabel="Worked the lead, no reply — restart counts as a fresh outreach"
                        value={L.completed}
                        tag={mode === 'aggressive' ? 'aggressive only' : 'skipped'}
                        tagColor={mode === 'aggressive' ? 'blue' : 'gray'}
                    />
                    <BucketRow
                        label="Paused or stopped"
                        sublabel="You explicitly halted these — never imported"
                        value={L.optedOut}
                        tag="never imports"
                        tagColor="rose"
                    />
                </ul>
            </div>

            {/* Mode picker — the core decision */}
            <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-900">How should we handle in-flight leads?</h3>
                <ModeRadio
                    selected={mode === 'aggressive'}
                    onSelect={() => setMode('aggressive')}
                    title="Aggressive — import everything, restart from step 1"
                    body={
                        <>
                            Best when you want to <strong>fully decommission Smartlead</strong> and
                            stop paying for two platforms. We import never-contacted, stale, and completed
                            leads (recent contacts default to <strong>skipped</strong>). Every imported
                            lead starts at step 1 in Superkabe — recipients who already received emails
                            in Smartlead may receive step 1 again, possibly from a different mailbox.
                            Threading on existing sequences is broken.
                        </>
                    }
                    badge="Most common"
                />
                <ModeRadio
                    selected={mode === 'conservative'}
                    onSelect={() => setMode('conservative')}
                    title="Conservative — only never-contacted leads"
                    body={
                        <>
                            Best when you want <strong>existing sequences to finish on Smartlead</strong>{' '}
                            and start fresh on Superkabe with new leads. Mid-sequence leads stay in Smartlead
                            until they finish naturally — recipients keep receiving follow-ups from the
                            original sender in the original thread. You'll keep Smartlead live for 1-3 months
                            until those sequences drain.
                        </>
                    }
                />
            </div>

            {/* Recent-contact toggle — only relevant in aggressive mode */}
            {mode === 'aggressive' && L.recentContact > 0 && (
                <label className="flex items-start gap-3 p-4 border border-amber-200 bg-amber-50 rounded-xl cursor-pointer hover:bg-amber-100/50">
                    <input
                        type="checkbox"
                        checked={includeRecentContacts}
                        onChange={e => setIncludeRecentContacts(e.target.checked)}
                        className="mt-0.5"
                    />
                    <div className="text-sm text-amber-900">
                        <div className="font-semibold">
                            Also import the {L.recentContact.toLocaleString()} leads contacted in the last {threshold} days
                        </div>
                        <div className="text-xs text-amber-800 mt-1">
                            They'll restart at step 1 in Superkabe. Recipients are likely to remember
                            the prior outreach — leave this off if you have any high-touch / named accounts
                            in this bucket.
                        </div>
                    </div>
                </label>
            )}

            {/* Mode-aware summary */}
            <div className="p-5 bg-gray-900 rounded-xl text-white">
                <div className="text-xs uppercase tracking-wide font-bold opacity-60 mb-1">
                    To import
                </div>
                <div className="text-3xl font-bold">{importing.toLocaleString()} leads</div>
                <div className="text-xs opacity-75 mt-1">
                    {mode === 'aggressive'
                        ? `Aggressive mode${includeRecentContacts ? ' + recent contacts' : ''} — imported leads start at step 1.`
                        : 'Conservative mode — only never-contacted leads.'}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
                <Bucket label="Campaigns by status" data={preview.campaigns.byStatus} />
                <Bucket label="Mailboxes by provider" data={preview.mailboxes.byProvider} />
            </div>

            <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                <input
                    type="checkbox"
                    checked={confirmedPause}
                    onChange={e => setConfirmedPause(e.target.checked)}
                    className="mt-0.5"
                />
                <span className="text-sm text-gray-700">
                    I understand that <strong>active Smartlead campaigns will be paused</strong> in
                    Smartlead at the start of this import to prevent duplicate sends.
                </span>
            </label>

            <div className="flex justify-between gap-3">
                <button
                    onClick={onReload}
                    className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900"
                >
                    Refresh preview
                </button>
                <button
                    onClick={onStart}
                    disabled={!confirmedPause || starting}
                    className="px-5 py-2.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 disabled:opacity-50"
                >
                    {starting ? 'Starting…' : `Import ${importing.toLocaleString()} lead${importing === 1 ? '' : 's'}`}
                </button>
            </div>
        </section>
    );
}

function BucketRow(props: {
    label: string;
    sublabel: string;
    value: number;
    tag: string;
    tagColor: 'emerald' | 'blue' | 'amber' | 'rose' | 'gray';
}) {
    const colors: Record<typeof props.tagColor, string> = {
        emerald: 'bg-emerald-100 text-emerald-800',
        blue:    'bg-blue-100 text-blue-800',
        amber:   'bg-amber-100 text-amber-800',
        rose:    'bg-rose-100 text-rose-800',
        gray:    'bg-gray-100 text-gray-600',
    };
    return (
        <li className="px-4 py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
                <div className="font-semibold text-gray-900">{props.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{props.sublabel}</div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${colors[props.tagColor]}`}>
                    {props.tag}
                </span>
                <span className="font-mono font-semibold text-gray-900 w-16 text-right">
                    {props.value.toLocaleString()}
                </span>
            </div>
        </li>
    );
}

function ModeRadio(props: {
    selected: boolean;
    onSelect: () => void;
    title: string;
    body: React.ReactNode;
    badge?: string;
}) {
    return (
        <button
            type="button"
            onClick={props.onSelect}
            className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${
                props.selected
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
        >
            <div className="flex items-start gap-3">
                <div
                    className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 ${
                        props.selected ? 'border-gray-900 bg-gray-900' : 'border-gray-300'
                    }`}
                >
                    {props.selected && <div className="w-1.5 h-1.5 bg-white rounded-full m-auto mt-[3px]" />}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">{props.title}</span>
                        {props.badge && (
                            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                                {props.badge}
                            </span>
                        )}
                    </div>
                    <div className="text-xs text-gray-600 mt-1 leading-relaxed">{props.body}</div>
                </div>
            </div>
        </button>
    );
}

function Stat({ label, value }: { label: string; value: number }) {
    return (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
            <div className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
        </div>
    );
}

function Bucket({ label, data }: { label: string; data: Record<string, number> }) {
    const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
    if (entries.length === 0) return null;
    return (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
            <div className="text-xs font-semibold text-gray-600 mb-2">{label}</div>
            <ul className="space-y-1">
                {entries.map(([k, v]) => (
                    <li key={k} className="flex items-center justify-between text-gray-700">
                        <span>{k}</span>
                        <span className="font-mono">{v.toLocaleString()}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 3 — importing (poll loop)
// ─────────────────────────────────────────────────────────────────────────────

const STAT_LABELS: Record<string, string> = {
    mode: 'Migration mode',
    includeRecentContacts: 'Includes recent contacts',
    campaignsFound: 'Campaigns discovered',
    sourceActiveCount: 'Smartlead campaigns ACTIVE',
    sourcePausedCount: 'Smartlead campaigns paused by us',
    mailboxesImported: 'Mailboxes imported',
    warmupSnapshotsMissing: 'Mailboxes with no warmup data',
    sequenceStepsImported: 'Sequence steps imported',
    variantsImported: 'A/B variants imported',
    leadsImported: 'Leads imported',
    leadsSkippedRecentContact: 'Leads skipped (recent contact)',
    leadsSkippedInFlight: 'Leads skipped (mid-sequence — conservative)',
    leadsSkippedOptedOut: 'Leads skipped (paused/stopped)',
    leadsSkippedInvalidEmail: 'Leads skipped (invalid email)',
};

function StepImporting({ job }: { job: ImportJob | null }) {
    if (!job) {
        return (
            <section className="bg-white rounded-2xl p-8 border border-gray-200">
                <p className="text-sm text-gray-500">Connecting…</p>
            </section>
        );
    }

    const stats = (job.stats || {}) as Record<string, number | string | undefined>;
    const failed = job.status === 'failed';
    const cancelled = job.status === 'cancelled';

    return (
        <section className="bg-white rounded-2xl p-8 border border-gray-200 space-y-6">
            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">
                    {failed ? 'Import failed' : cancelled ? 'Import cancelled' : 'Importing…'}
                </h2>
                <p className="text-sm text-gray-500">
                    Status: <span className="font-mono">{job.status}</span>
                </p>
            </div>

            {failed && job.error && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
                    <div className="text-sm font-semibold text-rose-900 mb-1">Error</div>
                    <pre className="text-xs text-rose-800 whitespace-pre-wrap break-words">{job.error}</pre>
                </div>
            )}

            <ul className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
                {Object.entries(STAT_LABELS).map(([key, label]) => {
                    const v = stats[key];
                    if (v === undefined) return null;
                    return (
                        <li key={key} className="flex items-center justify-between px-4 py-3 text-sm">
                            <span className="text-gray-700">{label}</span>
                            <span className="font-mono text-gray-900">
                                {typeof v === 'number' ? v.toLocaleString() : String(v)}
                            </span>
                        </li>
                    );
                })}
            </ul>

            {!failed && !cancelled && (
                <p className="text-xs text-gray-400">Auto-refreshing every {POLL_INTERVAL_MS / 1000}s…</p>
            )}
        </section>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 4 — mailbox handoff
// ─────────────────────────────────────────────────────────────────────────────

function StepHandoff({ job }: { job: ImportJob | null }) {
    const stats = (job?.stats || {}) as Record<string, unknown>;
    const importedEmails: string[] = Array.isArray(stats.importedMailboxEmails)
        ? (stats.importedMailboxEmails as string[])
        : [];

    return (
        <section className="bg-white rounded-2xl p-8 border border-gray-200 space-y-6">
            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">Connect your mailboxes</h2>
                <p className="text-sm text-gray-500">
                    Import is complete. To start sending from Superkabe, connect each of these mailboxes
                    natively — we can't import OAuth tokens or SMTP passwords from Smartlead. Any mailbox
                    you don't reconnect will sit idle; campaigns won't send through it.
                </p>
            </div>

            {importedEmails.length === 0 ? (
                <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500">
                    No mailbox metadata was imported. You can still connect mailboxes the normal way.
                </div>
            ) : (
                <ul className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
                    {importedEmails.map(email => {
                        const domain = email.split('@')[1] || '';
                        const provider = guessProviderFromDomain(domain);
                        return (
                            <li key={email} className="flex items-center justify-between gap-3 px-4 py-3">
                                <div>
                                    <div className="text-sm font-semibold text-gray-900 font-mono">{email}</div>
                                    <div className="text-xs text-gray-500">Suggested provider: {providerLabel(provider)}</div>
                                </div>
                                <Link
                                    href="/dashboard/sequencer/accounts"
                                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                                >
                                    Connect →
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
                <Link
                    href="/dashboard/sequencer/accounts"
                    className="px-5 py-2.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800"
                >
                    Connect mailboxes
                </Link>
                <Link
                    href="/dashboard/campaigns"
                    className="px-5 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50"
                >
                    View imported campaigns
                </Link>
            </div>
        </section>
    );
}

function guessProviderFromDomain(domain: string): string {
    const d = domain.toLowerCase();
    if (d === 'gmail.com' || d.endsWith('.google.com')) return 'GMAIL';
    if (d === 'outlook.com' || d === 'hotmail.com' || d.endsWith('.microsoft.com')) return 'OUTLOOK';
    return 'SMTP';
}

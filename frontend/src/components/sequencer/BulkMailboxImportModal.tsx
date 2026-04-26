'use client';

import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { X, Upload, Download, FileText, CheckCircle2, AlertTriangle, XCircle, Loader2, Key, Inbox, Zap, RefreshCw, ExternalLink } from 'lucide-react';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

/**
 * Bulk mailbox import — paste / upload a CSV, preview parsed rows, submit
 * to /api/sequencer/accounts/bulk, then show per-row results so the user
 * can resolve duplicates / OAuth-pending rows / failures inline.
 *
 * CSV format (header row required):
 *   email,provider,displayName,dailySendLimit,smtpHost,smtpPort,smtpUsername,smtpPassword,imapHost,imapPort
 *
 *   - email      (required)
 *   - provider   (required: smtp | google | microsoft)
 *   - SMTP rows must include smtpHost / smtpPort / smtpUsername / smtpPassword
 *   - google / microsoft rows are created in oauth_pending state — the user
 *     authorizes them individually after import via the existing OAuth flow.
 *
 * Hard cap: 200 rows per submission (matches backend MAX_BULK_ROWS).
 */

const MAX_ROWS = 200;
const TEMPLATE_CSV =
    'email,provider,displayName,dailySendLimit,smtpHost,smtpPort,smtpUsername,smtpPassword,imapHost,imapPort\n' +
    'jane@example.com,google,Jane Smith,150,,,,,,\n' +
    'john@example.com,microsoft,John Doe,150,,,,,,\n' +
    'sender@mydomain.com,smtp,Outbound,200,smtp.mydomain.com,587,sender@mydomain.com,changeme,imap.mydomain.com,993\n';

interface ParsedRow {
    email: string;
    provider: string;
    displayName?: string;
    dailySendLimit?: number;
    smtpHost?: string;
    smtpPort?: number;
    smtpUsername?: string;
    smtpPassword?: string;
    imapHost?: string;
    imapPort?: number;
    /** Local pre-flight validation issue, if any. Backend re-validates. */
    localError?: string;
}

interface BulkResult {
    row: number;
    email: string | null;
    status: 'created' | 'skipped' | 'failed';
    accountId?: string;
    error_code?: string;
    error_message?: string;
    requires_oauth?: boolean;
}

interface BulkResponse {
    results: BulkResult[];
    summary: { total: number; created: number; skipped: number; failed: number; requires_oauth: number };
}

const VALID_PROVIDERS = new Set(['smtp', 'google', 'microsoft']);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseCsv(raw: string): ParsedRow[] {
    const text = raw.trim();
    if (!text) return [];
    const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length < 2) return [];

    const header = splitLine(lines[0]).map(h => h.trim().toLowerCase());
    const idx = (name: string) => header.indexOf(name.toLowerCase());

    const iEmail = idx('email');
    const iProvider = idx('provider');
    const iDisplayName = idx('displayname');
    const iDailyLimit = idx('dailysendlimit');
    const iSmtpHost = idx('smtphost');
    const iSmtpPort = idx('smtpport');
    const iSmtpUser = idx('smtpusername');
    const iSmtpPass = idx('smtppassword');
    const iImapHost = idx('imaphost');
    const iImapPort = idx('imapport');

    const rows: ParsedRow[] = [];
    for (let i = 1; i < lines.length; i++) {
        const cells = splitLine(lines[i]);
        const email = (iEmail >= 0 ? cells[iEmail] : '').trim().toLowerCase();
        const provider = (iProvider >= 0 ? cells[iProvider] : '').trim().toLowerCase();
        const row: ParsedRow = {
            email,
            provider,
            displayName: iDisplayName >= 0 ? cells[iDisplayName]?.trim() || undefined : undefined,
            dailySendLimit: iDailyLimit >= 0 && cells[iDailyLimit] ? Number(cells[iDailyLimit]) || undefined : undefined,
            smtpHost: iSmtpHost >= 0 ? cells[iSmtpHost]?.trim() || undefined : undefined,
            smtpPort: iSmtpPort >= 0 && cells[iSmtpPort] ? Number(cells[iSmtpPort]) || undefined : undefined,
            smtpUsername: iSmtpUser >= 0 ? cells[iSmtpUser]?.trim() || undefined : undefined,
            smtpPassword: iSmtpPass >= 0 ? cells[iSmtpPass]?.trim() || undefined : undefined,
            imapHost: iImapHost >= 0 ? cells[iImapHost]?.trim() || undefined : undefined,
            imapPort: iImapPort >= 0 && cells[iImapPort] ? Number(cells[iImapPort]) || undefined : undefined,
        };

        if (!email) row.localError = 'email is required';
        else if (!EMAIL_RE.test(email)) row.localError = 'invalid email format';
        else if (!provider) row.localError = 'provider is required';
        else if (!VALID_PROVIDERS.has(provider)) row.localError = 'provider must be smtp / google / microsoft';
        else if (provider === 'smtp' && (!row.smtpHost || !row.smtpPort || !row.smtpUsername || !row.smtpPassword)) {
            row.localError = 'SMTP needs host, port, username, password';
        }

        rows.push(row);
    }
    return rows;
}

/** Minimal CSV splitter — handles quoted cells with commas, no streaming. */
function splitLine(line: string): string[] {
    const out: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
            else inQuotes = !inQuotes;
        } else if (ch === ',' && !inQuotes) {
            out.push(cur);
            cur = '';
        } else {
            cur += ch;
        }
    }
    out.push(cur);
    return out;
}

// ─── Zapmail integration types ──────────────────────────────────────────────

interface ZapmailMailbox {
    id: string;
    email: string;
    provider: 'google' | 'microsoft';
    domain?: string;
    displayName?: string;
    alreadyImported: boolean;
    connectionStatus?: string | null;
}

interface ZapmailImportResponse {
    results: Array<{
        email: string;
        status: 'queued' | 'skipped' | 'failed';
        provider?: string;
        accountId?: string;
        error_code?: string;
        error_message?: string;
    }>;
    exportId: number | null;
    summary: { total: number; queued: number; skipped: number; failed: number };
}

interface ZapmailImportStatusResponse {
    exportId: number;
    zapmailStatus: string;
    zapmailProgress?: { total?: number; completed?: number; failed?: number };
    recentAccounts: Array<{
        email: string;
        connection_status: string;
        last_error: string | null;
    }>;
}

type ImportSource = 'csv' | 'zapmail';

export default function BulkMailboxImportModal({ onClose, onSuccess }: {
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [source, setSource] = useState<ImportSource>('csv');
    const [csv, setCsv] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);
    const [results, setResults] = useState<BulkResponse | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    // ─── Zapmail state ──────────────────────────────────────────────────────
    const [zmConnected, setZmConnected] = useState<boolean | null>(null);
    const [zmApiKey, setZmApiKey] = useState('');
    const [zmConnecting, setZmConnecting] = useState(false);
    const [zmMailboxes, setZmMailboxes] = useState<ZapmailMailbox[] | null>(null);
    const [zmLoading, setZmLoading] = useState(false);
    const [zmSelected, setZmSelected] = useState<Set<string>>(new Set());
    const [zmResults, setZmResults] = useState<ZapmailImportResponse | null>(null);
    const [zmFilter, setZmFilter] = useState('');

    // Polling state for the orchestrated import progress screen
    const [zmExportId, setZmExportId] = useState<number | null>(null);
    const [zmProgress, setZmProgress] = useState<ZapmailImportStatusResponse | null>(null);
    const zmPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const loadZmMailboxes = useCallback(async () => {
        setZmLoading(true);
        try {
            const res = await apiClient<{ mailboxes: ZapmailMailbox[]; total: number; errors: { provider: string; message: string }[] }>(
                '/api/sequencer/integrations/zapmail/mailboxes',
            );
            setZmMailboxes(res.mailboxes);
            if (res.errors && res.errors.length > 0) {
                for (const e of res.errors) {
                    toast.error(`Zapmail ${e.provider}: ${e.message}`);
                }
            }
            const auto = new Set<string>();
            for (const m of res.mailboxes) {
                if (!m.alreadyImported) auto.add(m.email);
            }
            setZmSelected(auto);
        } catch (err: unknown) {
            const e = err as { message?: string };
            toast.error(e?.message || 'Failed to load Zapmail mailboxes');
        } finally {
            setZmLoading(false);
        }
    }, []);

    const refreshZmStatus = useCallback(async () => {
        try {
            const res = await apiClient<{ connected: boolean }>('/api/sequencer/integrations/zapmail/status');
            setZmConnected(res.connected);
            if (res.connected) {
                await loadZmMailboxes();
            }
        } catch {
            setZmConnected(false);
        }
    }, [loadZmMailboxes]);

    const connectZapmail = async () => {
        const trimmed = zmApiKey.trim();
        if (!trimmed) return;
        setZmConnecting(true);
        try {
            await apiClient<{ connected: boolean }>(
                '/api/sequencer/integrations/zapmail/connect',
                { method: 'POST', body: JSON.stringify({ apiKey: trimmed }) },
            );
            toast.success('Connected to Zapmail');
            setZmApiKey('');
            setZmConnected(true);
            await loadZmMailboxes();
        } catch (err: unknown) {
            const e = err as { message?: string };
            toast.error(e?.message || 'Failed to connect Zapmail');
        } finally {
            setZmConnecting(false);
        }
    };

    const disconnectZapmail = async () => {
        try {
            await apiClient('/api/sequencer/integrations/zapmail/connect', { method: 'DELETE' });
            setZmConnected(false);
            setZmMailboxes(null);
            setZmSelected(new Set());
            toast.success('Zapmail disconnected');
        } catch (err: unknown) {
            const e = err as { message?: string };
            toast.error(e?.message || 'Failed to disconnect');
        }
    };

    const importFromZapmail = async () => {
        if (zmSelected.size === 0) return;
        setSubmitting(true);
        try {
            const res = await apiClient<ZapmailImportResponse>('/api/sequencer/integrations/zapmail/import', {
                method: 'POST',
                body: JSON.stringify({ emails: Array.from(zmSelected) }),
            });
            setZmResults(res);
            if (res.summary.queued > 0) {
                toast.success(`Zapmail is authorizing ${res.summary.queued} mailbox${res.summary.queued === 1 ? '' : 'es'}`);
                onSuccess();
                if (res.exportId) {
                    setZmExportId(res.exportId);
                }
            }
        } catch (err: unknown) {
            const e = err as { message?: string };
            toast.error(e?.message || 'Zapmail import failed');
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (source === 'zapmail' && zmConnected === null) {
            refreshZmStatus();
        }
    }, [source, zmConnected, refreshZmStatus]);

    // Poll Zapmail export status + our local ConnectedAccount rows so the user
    // sees mailboxes flip from "Authorizing…" to "Connected" / "Failed" without
    // refreshing. Stops once the orchestration is done OR after 5 minutes.
    useEffect(() => {
        if (!zmExportId) return;
        let elapsed = 0;
        const tick = async () => {
            try {
                const res = await apiClient<ZapmailImportStatusResponse>(
                    `/api/sequencer/integrations/zapmail/import/${zmExportId}`,
                );
                setZmProgress(res);
                const allDone =
                    res.zapmailStatus === 'completed' || res.zapmailStatus === 'failed' ||
                    (res.zapmailProgress?.total !== undefined &&
                        (res.zapmailProgress?.completed || 0) + (res.zapmailProgress?.failed || 0) >= res.zapmailProgress.total);
                if (allDone) {
                    if (zmPollRef.current) clearInterval(zmPollRef.current);
                    zmPollRef.current = null;
                    onSuccess();
                }
            } catch {
                /* swallow — keep polling */
            }
            elapsed += 4;
            if (elapsed >= 300 && zmPollRef.current) {
                clearInterval(zmPollRef.current);
                zmPollRef.current = null;
            }
        };
        tick();
        zmPollRef.current = setInterval(tick, 4000);
        return () => {
            if (zmPollRef.current) {
                clearInterval(zmPollRef.current);
                zmPollRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [zmExportId]);

    const zmFilteredMailboxes = useMemo(() => {
        if (!zmMailboxes) return [];
        const q = zmFilter.trim().toLowerCase();
        if (!q) return zmMailboxes;
        return zmMailboxes.filter(
            (m) =>
                m.email.toLowerCase().includes(q) ||
                (m.domain && m.domain.toLowerCase().includes(q)) ||
                (m.displayName && m.displayName.toLowerCase().includes(q)),
        );
    }, [zmMailboxes, zmFilter]);

    const zmSelectableCount = useMemo(
        () => (zmMailboxes || []).filter((m) => !m.alreadyImported).length,
        [zmMailboxes],
    );

    const parsed = useMemo(() => parseCsv(csv), [csv]);
    const validRows = useMemo(() => parsed.filter(r => !r.localError), [parsed]);
    const overCap = parsed.length > MAX_ROWS;

    const handleFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => setCsv(String(e.target?.result || ''));
        reader.readAsText(file);
    };

    const downloadTemplate = () => {
        const blob = new Blob([TEMPLATE_CSV], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'superkabe-mailboxes-template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const submit = async () => {
        if (validRows.length === 0 || overCap) return;
        setSubmitting(true);
        try {
            const payload = { rows: validRows.map(r => ({ ...r, localError: undefined })) };
            const res = await apiClient<BulkResponse>('/api/sequencer/accounts/bulk', {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            setResults(res);
            if (res.summary.created > 0) {
                toast.success(`Imported ${res.summary.created} mailbox${res.summary.created === 1 ? '' : 'es'}`);
                onSuccess();
            }
        } catch (err: unknown) {
            const e = err as { message?: string };
            toast.error(e?.message || 'Bulk import failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white w-full max-w-3xl max-h-[88vh] flex flex-col rounded-2xl overflow-hidden" style={{ border: '1px solid #D1CBC5' }}>
                {/* Header */}
                <div className="px-5 py-3 flex items-center justify-between shrink-0" style={{ borderBottom: '1px solid #D1CBC5' }}>
                    <div className="flex items-center gap-2">
                        <Upload size={14} strokeWidth={1.75} className="text-gray-700" />
                        <h2 className="text-sm font-semibold text-gray-900">Bulk import mailboxes</h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-100 cursor-pointer text-gray-500" title="Close">
                        <X size={14} />
                    </button>
                </div>

                {/* Source tabs */}
                <div className="px-5 pt-3 shrink-0 flex items-center gap-1" style={{ borderBottom: '1px solid #E8E3DC' }}>
                    <button
                        onClick={() => { setSource('csv'); setResults(null); setZmResults(null); }}
                        className={`px-3 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer border-b-2 -mb-px transition-colors ${source === 'csv' ? 'text-gray-900 border-gray-900' : 'text-gray-500 border-transparent hover:text-gray-700'}`}
                    >
                        <FileText size={12} /> Paste CSV
                    </button>
                    <button
                        onClick={() => { setSource('zapmail'); setResults(null); setZmResults(null); }}
                        className={`px-3 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer border-b-2 -mb-px transition-colors ${source === 'zapmail' ? 'text-gray-900 border-gray-900' : 'text-gray-500 border-transparent hover:text-gray-700'}`}
                    >
                        <Zap size={12} /> Zapmail
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 min-h-0 overflow-y-auto p-5 flex flex-col gap-4">
                    {source === 'csv' && !results && (
                        <>
                            {/* Step 1: get a template */}
                            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
                                <div className="flex items-center gap-2">
                                    <FileText size={14} strokeWidth={1.75} className="text-gray-600" />
                                    <span className="text-xs font-medium text-gray-700">Don&apos;t have a CSV ready?</span>
                                </div>
                                <button
                                    onClick={downloadTemplate}
                                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900 cursor-pointer"
                                >
                                    <Download size={11} /> Download template
                                </button>
                            </div>

                            {/* Step 2: paste or upload */}
                            <div>
                                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                    Paste CSV or upload file
                                </label>
                                <textarea
                                    value={csv}
                                    onChange={(e) => setCsv(e.target.value)}
                                    placeholder="email,provider,displayName,dailySendLimit,smtpHost,smtpPort,smtpUsername,smtpPassword,imapHost,imapPort
jane@example.com,google,Jane,150,,,,,,
..."
                                    className="w-full min-h-[140px] px-3 py-2 rounded-lg text-xs font-mono outline-none resize-y"
                                    style={{ border: '1px solid #D1CBC5', background: '#FAFAF8' }}
                                />
                                <div className="flex items-center justify-between mt-2">
                                    <input
                                        ref={fileRef}
                                        type="file"
                                        accept=".csv,text/csv"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleFile(file);
                                            e.target.value = '';
                                        }}
                                    />
                                    <button
                                        onClick={() => fileRef.current?.click()}
                                        className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900 cursor-pointer"
                                    >
                                        <Upload size={11} /> Upload .csv
                                    </button>
                                    <span className="text-[10px] text-gray-400">
                                        Up to {MAX_ROWS} rows per import
                                    </span>
                                </div>
                            </div>

                            {/* Preview */}
                            {parsed.length > 0 && (
                                <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #D1CBC5' }}>
                                    <div className="px-3 py-2 bg-gray-50 flex items-center justify-between" style={{ borderBottom: '1px solid #E8E3DC' }}>
                                        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                                            Preview · {parsed.length} row{parsed.length === 1 ? '' : 's'}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-700">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                {validRows.length} valid
                                            </span>
                                            {parsed.length - validRows.length > 0 && (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-700">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                                    {parsed.length - validRows.length} need fixing
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="max-h-[220px] overflow-y-auto">
                                        <table className="w-full text-xs">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-3 py-1.5 text-left font-semibold text-gray-500 uppercase tracking-wider text-[10px] w-8">#</th>
                                                    <th className="px-3 py-1.5 text-left font-semibold text-gray-500 uppercase tracking-wider text-[10px]">Email</th>
                                                    <th className="px-3 py-1.5 text-left font-semibold text-gray-500 uppercase tracking-wider text-[10px]">Provider</th>
                                                    <th className="px-3 py-1.5 text-left font-semibold text-gray-500 uppercase tracking-wider text-[10px]">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {parsed.map((row, i) => (
                                                    <tr key={i} className="border-t border-gray-100">
                                                        <td className="px-3 py-1.5 text-gray-400 tabular-nums">{i + 1}</td>
                                                        <td className="px-3 py-1.5 text-gray-700 font-medium truncate max-w-[200px]">{row.email || '—'}</td>
                                                        <td className="px-3 py-1.5 text-gray-500 capitalize">{row.provider || '—'}</td>
                                                        <td className="px-3 py-1.5">
                                                            {row.localError ? (
                                                                <span className="inline-flex items-center gap-1 text-[11px] text-red-600">
                                                                    <AlertTriangle size={11} /> {row.localError}
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700">
                                                                    <CheckCircle2 size={11} /> Ready
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {overCap && (
                                <div className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-[12px] text-amber-900">
                                    Maximum {MAX_ROWS} rows per import. Split your CSV into batches and run multiple imports.
                                </div>
                            )}
                        </>
                    )}

                    {source === 'csv' && results && (
                        <>
                            <div className="grid grid-cols-4 gap-2">
                                <ResultStat label="Created" value={results.summary.created} dot="#22c55e" />
                                <ResultStat label="Skipped" value={results.summary.skipped} dot="#9ca3af" />
                                <ResultStat label="Failed"  value={results.summary.failed}  dot="#ef4444" />
                                <ResultStat label="Needs OAuth" value={results.summary.requires_oauth} dot="#3b82f6" />
                            </div>
                            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #D1CBC5' }}>
                                <div className="max-h-[300px] overflow-y-auto">
                                    <table className="w-full text-xs">
                                        <thead className="bg-gray-50 sticky top-0">
                                            <tr>
                                                <th className="px-3 py-1.5 text-left font-semibold text-gray-500 uppercase tracking-wider text-[10px] w-8">#</th>
                                                <th className="px-3 py-1.5 text-left font-semibold text-gray-500 uppercase tracking-wider text-[10px]">Email</th>
                                                <th className="px-3 py-1.5 text-left font-semibold text-gray-500 uppercase tracking-wider text-[10px]">Status</th>
                                                <th className="px-3 py-1.5 text-left font-semibold text-gray-500 uppercase tracking-wider text-[10px]">Detail</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {results.results.map((r) => (
                                                <tr key={r.row} className="border-t border-gray-100">
                                                    <td className="px-3 py-1.5 text-gray-400 tabular-nums">{r.row}</td>
                                                    <td className="px-3 py-1.5 text-gray-700 font-medium truncate max-w-[200px]">{r.email || '—'}</td>
                                                    <td className="px-3 py-1.5">
                                                        {r.status === 'created' && (
                                                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700">
                                                                <CheckCircle2 size={11} /> Created
                                                            </span>
                                                        )}
                                                        {r.status === 'skipped' && (
                                                            <span className="inline-flex items-center gap-1 text-[11px] text-gray-600">
                                                                <AlertTriangle size={11} /> Skipped
                                                            </span>
                                                        )}
                                                        {r.status === 'failed' && (
                                                            <span className="inline-flex items-center gap-1 text-[11px] text-red-600">
                                                                <XCircle size={11} /> Failed
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-1.5 text-gray-500 text-[11px]">
                                                        {r.requires_oauth ? 'Authorize from list →' : (r.error_message || '')}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ─── Zapmail panel ────────────────────────────────────── */}
                    {source === 'zapmail' && (
                        <>
                            {zmConnected === null && (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 size={16} className="animate-spin text-gray-400" />
                                </div>
                            )}

                            {zmConnected === false && (
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
                                        <Zap size={16} className="text-amber-700 mt-0.5 shrink-0" />
                                        <div className="text-xs text-amber-900 leading-relaxed">
                                            Connect your Zapmail account once and import every mailbox you&apos;ve provisioned. Generate an API key inside Zapmail at{' '}
                                            <span className="font-mono text-[11px] bg-amber-100 px-1 py-0.5 rounded">Settings → Integrations → API</span>{' '}
                                            and paste it below.
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                            Zapmail API key
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg" style={{ border: '1px solid #D1CBC5', background: '#FAFAF8' }}>
                                                <Key size={12} className="text-gray-400" />
                                                <input
                                                    type="password"
                                                    value={zmApiKey}
                                                    onChange={(e) => setZmApiKey(e.target.value)}
                                                    onKeyDown={(e) => { if (e.key === 'Enter' && zmApiKey.trim()) connectZapmail(); }}
                                                    placeholder="zm_live_…"
                                                    className="flex-1 bg-transparent text-xs font-mono outline-none text-gray-800 placeholder-gray-400"
                                                    autoFocus
                                                />
                                            </div>
                                            <button
                                                onClick={connectZapmail}
                                                disabled={zmConnecting || !zmApiKey.trim()}
                                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-900 text-white text-xs font-semibold cursor-pointer hover:bg-gray-800 disabled:opacity-30"
                                            >
                                                {zmConnecting ? <Loader2 size={11} className="animate-spin" /> : <Zap size={11} />}
                                                Connect
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-1.5 leading-relaxed">
                                            We store the key encrypted. We don&apos;t pull credentials from Zapmail — each mailbox still gets standard Google/Microsoft OAuth (with the email pre-filled, so it&apos;s one click).
                                        </p>
                                    </div>
                                </div>
                            )}

                            {zmConnected === true && !zmResults && (
                                <>
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                                        <div className="flex items-center gap-2 text-xs text-emerald-900">
                                            <CheckCircle2 size={14} className="text-emerald-600" />
                                            <span className="font-medium">Connected to Zapmail</span>
                                            {zmMailboxes && <span className="text-emerald-700">· {zmMailboxes.length} mailbox{zmMailboxes.length === 1 ? '' : 'es'} found</span>}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button onClick={loadZmMailboxes} disabled={zmLoading} className="p-1.5 rounded-md hover:bg-emerald-100 cursor-pointer text-emerald-800 disabled:opacity-50" title="Refresh">
                                                <RefreshCw size={11} className={zmLoading ? 'animate-spin' : ''} />
                                            </button>
                                            <button onClick={disconnectZapmail} className="text-[11px] text-emerald-800 hover:text-emerald-900 font-semibold cursor-pointer ml-2 px-2">
                                                Disconnect
                                            </button>
                                        </div>
                                    </div>

                                    {zmLoading && (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 size={16} className="animate-spin text-gray-400" />
                                        </div>
                                    )}

                                    {!zmLoading && zmMailboxes && zmMailboxes.length === 0 && (
                                        <div className="text-center py-8 text-xs text-gray-500">
                                            No mailboxes found in your Zapmail account.
                                        </div>
                                    )}

                                    {!zmLoading && zmMailboxes && zmMailboxes.length > 0 && (
                                        <>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    value={zmFilter}
                                                    onChange={(e) => setZmFilter(e.target.value)}
                                                    placeholder="Filter by email or domain…"
                                                    className="flex-1 px-3 py-1.5 rounded-lg text-xs outline-none"
                                                    style={{ border: '1px solid #D1CBC5', background: '#FAFAF8' }}
                                                />
                                                <button
                                                    onClick={() => {
                                                        const all = new Set<string>();
                                                        for (const m of zmFilteredMailboxes) {
                                                            if (!m.alreadyImported) all.add(m.email);
                                                        }
                                                        setZmSelected(all);
                                                    }}
                                                    className="text-[11px] font-semibold text-gray-700 hover:text-gray-900 cursor-pointer px-2"
                                                >
                                                    Select all
                                                </button>
                                                <button
                                                    onClick={() => setZmSelected(new Set())}
                                                    className="text-[11px] font-semibold text-gray-500 hover:text-gray-700 cursor-pointer px-2"
                                                >
                                                    Clear
                                                </button>
                                            </div>

                                            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #D1CBC5' }}>
                                                <div className="px-3 py-2 bg-gray-50 flex items-center justify-between" style={{ borderBottom: '1px solid #E8E3DC' }}>
                                                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                                                        {zmFilteredMailboxes.length} mailbox{zmFilteredMailboxes.length === 1 ? '' : 'es'}
                                                    </span>
                                                    <span className="text-[10px] font-semibold text-gray-700">
                                                        {zmSelected.size} selected · {zmSelectableCount} importable
                                                    </span>
                                                </div>
                                                <div className="max-h-[320px] overflow-y-auto">
                                                    <table className="w-full text-xs">
                                                        <tbody>
                                                            {zmFilteredMailboxes.map((m) => {
                                                                const disabled = m.alreadyImported;
                                                                const checked = zmSelected.has(m.email);
                                                                return (
                                                                    <tr key={m.email} className={`border-t border-gray-100 ${disabled ? 'opacity-50' : 'hover:bg-gray-50 cursor-pointer'}`}
                                                                        onClick={() => {
                                                                            if (disabled) return;
                                                                            const next = new Set(zmSelected);
                                                                            if (checked) next.delete(m.email); else next.add(m.email);
                                                                            setZmSelected(next);
                                                                        }}
                                                                    >
                                                                        <td className="px-3 py-1.5 w-8">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={checked}
                                                                                disabled={disabled}
                                                                                onChange={() => { /* row click handles it */ }}
                                                                                className="cursor-pointer"
                                                                            />
                                                                        </td>
                                                                        <td className="px-3 py-1.5 text-gray-700 font-medium">
                                                                            <div className="truncate max-w-[260px]">{m.email}</div>
                                                                            {m.displayName && <div className="text-[10px] text-gray-400 truncate max-w-[260px]">{m.displayName}</div>}
                                                                        </td>
                                                                        <td className="px-3 py-1.5">
                                                                            {m.provider === 'google' && <span className="text-[10px] font-semibold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">Google</span>}
                                                                            {m.provider === 'microsoft' && <span className="text-[10px] font-semibold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">Microsoft</span>}
                                                                        </td>
                                                                        <td className="px-3 py-1.5 text-right">
                                                                            {m.alreadyImported && <span className="text-[10px] text-gray-500">Already imported</span>}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                            <div className="text-[10px] text-gray-400 leading-relaxed">
                                                We&apos;ll create a mailbox record for each selected entry. After import, click <span className="font-semibold">Authorize</span> next to each one — Google/Microsoft will skip the account picker because we pre-fill the email.
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {zmResults && (() => {
                                // Merge our pre-create results with live status from polling so each
                                // row shows current state: queued → authorizing → connected/failed.
                                const liveByEmail = new Map(
                                    (zmProgress?.recentAccounts || []).map((a) => [a.email, a]),
                                );
                                const totalQueued = zmResults.summary.queued;
                                const completed = zmProgress?.zapmailProgress?.completed ?? 0;
                                const failed = zmProgress?.zapmailProgress?.failed ?? 0;
                                const totalDone = completed + failed;
                                const pct = totalQueued > 0 ? Math.min(100, Math.round((totalDone / totalQueued) * 100)) : 0;

                                return (
                                    <>
                                        <div className="grid grid-cols-4 gap-2">
                                            <ResultStat label="Queued"   value={zmResults.summary.queued}  dot="#3b82f6" />
                                            <ResultStat label="Connected" value={completed}                 dot="#22c55e" />
                                            <ResultStat label="Failed"   value={failed + zmResults.summary.failed}    dot="#ef4444" />
                                            <ResultStat label="Skipped"  value={zmResults.summary.skipped} dot="#9ca3af" />
                                        </div>

                                        {zmExportId && totalQueued > 0 && (
                                            <div className="px-3 py-2 rounded-lg bg-blue-50 border border-blue-200">
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="text-[11px] font-semibold text-blue-900 inline-flex items-center gap-1.5">
                                                        <Loader2 size={11} className={pct < 100 ? 'animate-spin' : ''} />
                                                        Zapmail is authorizing your mailboxes
                                                    </span>
                                                    <span className="text-[11px] font-semibold text-blue-900 tabular-nums">{totalDone} / {totalQueued}</span>
                                                </div>
                                                <div className="h-1 rounded-full bg-blue-100 overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-500 transition-all"
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                                <p className="text-[10px] text-blue-800 mt-1.5 leading-relaxed">
                                                    Zapmail logs into each mailbox and walks the OAuth consent for you. Tokens land here automatically. This usually takes 1–3 minutes per mailbox.
                                                </p>
                                            </div>
                                        )}

                                        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #D1CBC5' }}>
                                            <div className="max-h-[320px] overflow-y-auto">
                                                <table className="w-full text-xs">
                                                    <thead className="bg-gray-50 sticky top-0">
                                                        <tr>
                                                            <th className="px-3 py-1.5 text-left font-semibold text-gray-500 uppercase tracking-wider text-[10px]">Email</th>
                                                            <th className="px-3 py-1.5 text-left font-semibold text-gray-500 uppercase tracking-wider text-[10px]">Status</th>
                                                            <th className="px-3 py-1.5 text-left font-semibold text-gray-500 uppercase tracking-wider text-[10px]">Detail</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {zmResults.results.map((r) => {
                                                            const live = liveByEmail.get(r.email);
                                                            const liveStatus = live?.connection_status;
                                                            const isConnected = liveStatus === 'active';
                                                            const isAuthFailed = liveStatus && liveStatus !== 'active' && liveStatus !== 'oauth_pending';
                                                            return (
                                                                <tr key={r.email} className="border-t border-gray-100">
                                                                    <td className="px-3 py-1.5 text-gray-700 font-medium truncate max-w-[260px]">{r.email}</td>
                                                                    <td className="px-3 py-1.5">
                                                                        {r.status === 'failed' && (
                                                                            <span className="inline-flex items-center gap-1 text-[11px] text-red-600">
                                                                                <XCircle size={11} /> Failed
                                                                            </span>
                                                                        )}
                                                                        {r.status === 'skipped' && (
                                                                            <span className="inline-flex items-center gap-1 text-[11px] text-gray-600">
                                                                                <AlertTriangle size={11} /> Skipped
                                                                            </span>
                                                                        )}
                                                                        {r.status === 'queued' && isConnected && (
                                                                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700">
                                                                                <CheckCircle2 size={11} /> Connected
                                                                            </span>
                                                                        )}
                                                                        {r.status === 'queued' && isAuthFailed && (
                                                                            <span className="inline-flex items-center gap-1 text-[11px] text-red-600">
                                                                                <XCircle size={11} /> OAuth failed
                                                                            </span>
                                                                        )}
                                                                        {r.status === 'queued' && !isConnected && !isAuthFailed && (
                                                                            <span className="inline-flex items-center gap-1 text-[11px] text-blue-700">
                                                                                <Loader2 size={11} className="animate-spin" /> Authorizing…
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-3 py-1.5 text-gray-500 text-[11px]">
                                                                        {r.error_message || (isAuthFailed ? (live?.last_error || 'OAuth handoff failed') : '')}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                        <div className="text-[10px] text-gray-400 leading-relaxed flex items-start gap-1.5">
                                            <Inbox size={11} className="mt-0.5 shrink-0" />
                                            You can close this dialog and come back — the orchestration runs server-side. Mailboxes flip to <span className="font-semibold">Connected</span> on the accounts page once Zapmail finishes the consent walk.
                                        </div>
                                    </>
                                );
                            })()}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="px-5 py-3 flex items-center justify-between shrink-0 bg-gray-50" style={{ borderTop: '1px solid #D1CBC5' }}>
                    <span className="text-[10px] text-gray-400">
                        {source === 'csv' && !results && parsed.length > 0 && `${validRows.length} valid · ${parsed.length - validRows.length} blocked`}
                        {source === 'csv' && results && `Done · ${results.summary.created} of ${results.summary.total} imported`}
                        {source === 'zapmail' && !zmResults && zmConnected && zmMailboxes && `${zmSelected.size} selected · ${zmMailboxes.length} total`}
                        {source === 'zapmail' && zmResults && `Queued · ${zmResults.summary.queued} of ${zmResults.summary.total} authorizing`}
                    </span>
                    <div className="flex items-center gap-2">
                        <button onClick={onClose} className="px-4 py-1.5 rounded-lg text-xs text-gray-700 hover:bg-white cursor-pointer" style={{ border: '1px solid #D1CBC5' }}>
                            {(results || zmResults) ? 'Done' : 'Cancel'}
                        </button>
                        {source === 'csv' && !results && (
                            <button
                                onClick={submit}
                                disabled={submitting || validRows.length === 0 || overCap}
                                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-semibold cursor-pointer hover:bg-gray-800 disabled:opacity-30"
                            >
                                {submitting ? <Loader2 size={11} className="animate-spin" /> : <Upload size={11} />}
                                {submitting ? 'Importing…' : `Import ${validRows.length} mailbox${validRows.length === 1 ? '' : 'es'}`}
                            </button>
                        )}
                        {source === 'zapmail' && zmConnected && !zmResults && (
                            <button
                                onClick={importFromZapmail}
                                disabled={submitting || zmSelected.size === 0}
                                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-semibold cursor-pointer hover:bg-gray-800 disabled:opacity-30"
                            >
                                {submitting ? <Loader2 size={11} className="animate-spin" /> : <Zap size={11} />}
                                {submitting ? 'Importing…' : `Import ${zmSelected.size} mailbox${zmSelected.size === 1 ? '' : 'es'}`}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ResultStat({ label, value, dot }: { label: string; value: number; dot: string }) {
    return (
        <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
            <div className="flex items-center gap-1.5 mb-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: dot }} />
                <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">{label}</div>
            </div>
            <div className="text-xl font-bold text-gray-900 tabular-nums">{value.toLocaleString()}</div>
        </div>
    );
}

'use client';

import { useState, useRef, useMemo } from 'react';
import { X, Upload, Download, FileText, CheckCircle2, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
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

export default function BulkMailboxImportModal({ onClose, onSuccess }: {
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [csv, setCsv] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);
    const [results, setResults] = useState<BulkResponse | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

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

                {/* Body */}
                <div className="flex-1 min-h-0 overflow-y-auto p-5 flex flex-col gap-4">
                    {!results && (
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

                    {results && (
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
                </div>

                {/* Footer */}
                <div className="px-5 py-3 flex items-center justify-between shrink-0 bg-gray-50" style={{ borderTop: '1px solid #D1CBC5' }}>
                    <span className="text-[10px] text-gray-400">
                        {!results && parsed.length > 0 && `${validRows.length} valid · ${parsed.length - validRows.length} blocked`}
                        {results && `Done · ${results.summary.created} of ${results.summary.total} imported`}
                    </span>
                    <div className="flex items-center gap-2">
                        <button onClick={onClose} className="px-4 py-1.5 rounded-lg text-xs text-gray-700 hover:bg-white cursor-pointer" style={{ border: '1px solid #D1CBC5' }}>
                            {results ? 'Done' : 'Cancel'}
                        </button>
                        {!results && (
                            <button
                                onClick={submit}
                                disabled={submitting || validRows.length === 0 || overCap}
                                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-semibold cursor-pointer hover:bg-gray-800 disabled:opacity-30"
                            >
                                {submitting ? <Loader2 size={11} className="animate-spin" /> : <Upload size={11} />}
                                {submitting ? 'Importing…' : `Import ${validRows.length} mailbox${validRows.length === 1 ? '' : 'es'}`}
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

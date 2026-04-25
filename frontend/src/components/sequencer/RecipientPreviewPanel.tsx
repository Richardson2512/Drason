'use client';

/**
 * RecipientPreviewPanel
 *
 * Drives the recipient-preview experience: calls the backend, manages the
 * client + device + view pickers, renders a pixel-tuned device replica.
 *
 * Today only Gmail · MacBook Air 13" is fully built. Other client/device
 * combinations are surfaced in the picker as "Coming soon" so the user
 * can see the full surface area we're building toward.
 */

import { useCallback, useEffect, useState } from 'react';
import { Sparkles, Loader2, AlertTriangle, Info, Eye, Mail, Lock } from 'lucide-react';
import { apiClient } from '@/lib/api';
import MacbookGmailPreview from './MacbookGmailPreview';
import MacbookAppleMailPreview from './MacbookAppleMailPreview';
import IphoneGmailPreview from './IphoneGmailPreview';
import IphoneAppleMailPreview from './IphoneAppleMailPreview';
import SamsungOutlookPreview from './SamsungOutlookPreview';

type ClientId = 'gmail' | 'outlook' | 'apple_mail' | 'superhuman';
type DeviceId = 'laptop' | 'mobile';

interface ClientPreview {
    key: string;
    label: string;
    inbox: { sender: string; subject: string; preview: string };
    openedHtml: string;
    aiSummary?: string;
}

interface PreviewIssue {
    code: string;
    severity: 'info' | 'warn' | 'error';
    message: string;
}

interface PreviewResult {
    clients: ClientPreview[];
    issues: PreviewIssue[];
    plainText: string;
}

interface Props {
    subject: string;
    bodyHtml: string;
    senderName?: string;
    senderEmail?: string;
    /** Hide the issues panel (when host renders issues separately). */
    hideIssues?: boolean;
}

const CLIENT_OPTIONS: { id: ClientId; label: string }[] = [
    { id: 'gmail', label: 'Gmail' },
    { id: 'outlook', label: 'Outlook' },
    { id: 'apple_mail', label: 'Apple Mail' },
    { id: 'superhuman', label: 'Superhuman' },
];

const DEVICE_OPTIONS: { id: DeviceId; label: string }[] = [
    { id: 'laptop', label: 'Laptop' },
    { id: 'mobile', label: 'Mobile' },
];

// Implemented combinations today. Each entry maps a client+device to the
// backend ClientKey we'll request and the rendering surface used.
const isImplemented = (c: ClientId, d: DeviceId) =>
    (c === 'gmail' && d === 'laptop') ||
    (c === 'gmail' && d === 'mobile') ||
    (c === 'apple_mail' && d === 'laptop') ||
    (c === 'apple_mail' && d === 'mobile') ||
    (c === 'outlook' && d === 'mobile');

const backendClientKey = (c: ClientId, d: DeviceId): string => {
    if (c === 'gmail' && d === 'laptop') return 'gmail_desktop';
    if (c === 'gmail' && d === 'mobile') return 'gmail_mobile';
    if (c === 'apple_mail' && d === 'laptop') return 'apple_mail_macos';
    if (c === 'apple_mail' && d === 'mobile') return 'apple_mail_ios';
    if (c === 'outlook') return d === 'mobile' ? 'outlook_mobile' : 'outlook_desktop';
    if (c === 'superhuman') return 'superhuman';
    return 'gmail_desktop';
};

export default function RecipientPreviewPanel({
    subject,
    bodyHtml,
    senderName = '',
    senderEmail = '',
    hideIssues = false,
}: Props) {
    const [result, setResult] = useState<PreviewResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [includeAiSummary, setIncludeAiSummary] = useState(false);
    const [view, setView] = useState<'inbox' | 'opened'>('inbox');
    const [client, setClient] = useState<ClientId>('gmail');
    const [device, setDevice] = useState<DeviceId>('laptop');

    const generate = useCallback(async () => {
        if (!subject && !bodyHtml) {
            setResult(null);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            // Request all currently-implemented client keys at once so swapping
            // the picker is instant and doesn't require another round-trip.
            const data = await apiClient<PreviewResult & { success?: boolean }>(
                '/api/sequencer/recipient-preview',
                {
                    method: 'POST',
                    body: JSON.stringify({
                        subject,
                        bodyHtml,
                        senderName,
                        senderEmail,
                        clients: ['gmail_desktop', 'gmail_mobile', 'apple_mail_macos', 'apple_mail_ios', 'outlook_mobile'],
                        includeAiSummary,
                    }),
                },
            );
            setResult({ clients: data.clients, issues: data.issues, plainText: data.plainText });
        } catch (e: any) {
            setError(e?.message || 'Failed to generate preview');
        } finally {
            setLoading(false);
        }
    }, [subject, bodyHtml, senderName, senderEmail, includeAiSummary]);

    useEffect(() => {
        generate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const wantedKey = backendClientKey(client, device);
    const previewData = result?.clients.find((c) => c.key === wantedKey) || result?.clients[0];
    const implemented = isImplemented(client, device);

    return (
        <div className="flex flex-col gap-4">
            {/* Picker bar */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                    {/* Client picker */}
                    <div className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-white p-0.5">
                        {CLIENT_OPTIONS.map((c) => {
                            const enabledForCurrentDevice = isImplemented(c.id, device);
                            const isActive = client === c.id;
                            return (
                                <button
                                    key={c.id}
                                    onClick={() => setClient(c.id)}
                                    className={`px-3 py-1.5 rounded-md text-[12px] font-medium inline-flex items-center gap-1.5 ${
                                        isActive ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                                    }`}
                                >
                                    {c.label}
                                    {!enabledForCurrentDevice && !isActive && (
                                        <Lock size={10} className="opacity-60" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Device picker */}
                    <div className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-white p-0.5">
                        {DEVICE_OPTIONS.map((d) => {
                            const enabledForCurrentClient = isImplemented(client, d.id);
                            const isActive = device === d.id;
                            return (
                                <button
                                    key={d.id}
                                    onClick={() => setDevice(d.id)}
                                    className={`px-3 py-1.5 rounded-md text-[12px] font-medium inline-flex items-center gap-1.5 ${
                                        isActive ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                                    }`}
                                >
                                    {d.label}
                                    {!enabledForCurrentClient && !isActive && (
                                        <Lock size={10} className="opacity-60" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* View toggle (only when implemented) */}
                    {implemented && (
                        <div className="inline-flex rounded-lg border border-neutral-200 bg-white p-0.5">
                            {(['inbox', 'opened'] as const).map((v) => (
                                <button
                                    key={v}
                                    onClick={() => setView(v)}
                                    className={`px-3 py-1.5 rounded-md text-[12px] font-medium ${
                                        view === v ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:text-neutral-900'
                                    }`}
                                >
                                    {v === 'inbox' ? 'Inbox list' : 'Opened email'}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-[11px] text-neutral-600 select-none cursor-pointer">
                        <input
                            type="checkbox"
                            checked={includeAiSummary}
                            onChange={(e) => setIncludeAiSummary(e.target.checked)}
                            className="rounded border-neutral-300"
                        />
                        Predict Gemini summary
                    </label>
                    <button
                        onClick={generate}
                        disabled={loading}
                        className="inline-flex items-center gap-1 rounded-md bg-neutral-900 text-white px-3 py-1.5 text-[12px] font-medium hover:bg-neutral-800 disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                        {result ? 'Refresh' : 'Generate'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-700">
                    {error}
                </div>
            )}

            {!result && loading && (
                <div className="rounded-md border border-neutral-200 bg-white px-3 py-12 text-center text-[12px] text-neutral-500">
                    <Loader2 size={20} className="mx-auto mb-2 animate-spin" />
                    Generating preview…
                </div>
            )}

            {!result && !loading && (
                <div className="rounded-md border border-dashed border-neutral-300 bg-neutral-50 px-3 py-12 text-center text-[12px] text-neutral-500">
                    <Eye size={20} className="mx-auto mb-2 text-neutral-400" />
                    Click <span className="font-semibold">Generate</span> to render this email.
                </div>
            )}

            {result && implemented && previewData && client === 'gmail' && device === 'laptop' && (
                <MacbookGmailPreview
                    view={view}
                    subject={previewData.inbox.subject || subject}
                    bodyHtml={previewData.openedHtml}
                    senderName={senderName}
                    senderEmail={senderEmail}
                    inboxPreview={previewData.inbox.preview}
                    aiSummary={previewData.aiSummary}
                />
            )}
            {result && implemented && previewData && client === 'gmail' && device === 'mobile' && (
                <IphoneGmailPreview
                    view={view}
                    subject={previewData.inbox.subject || subject}
                    bodyHtml={previewData.openedHtml}
                    senderName={senderName}
                    senderEmail={senderEmail}
                    inboxPreview={previewData.inbox.preview}
                    aiSummary={previewData.aiSummary}
                />
            )}
            {result && implemented && previewData && client === 'apple_mail' && device === 'laptop' && (
                <MacbookAppleMailPreview
                    view={view}
                    subject={previewData.inbox.subject || subject}
                    bodyHtml={previewData.openedHtml}
                    senderName={senderName}
                    senderEmail={senderEmail}
                    inboxPreview={previewData.inbox.preview}
                    aiSummary={previewData.aiSummary}
                />
            )}
            {result && implemented && previewData && client === 'apple_mail' && device === 'mobile' && (
                <IphoneAppleMailPreview
                    view={view}
                    subject={previewData.inbox.subject || subject}
                    bodyHtml={previewData.openedHtml}
                    senderName={senderName}
                    senderEmail={senderEmail}
                    inboxPreview={previewData.inbox.preview}
                    aiSummary={previewData.aiSummary}
                />
            )}
            {result && implemented && previewData && client === 'outlook' && device === 'mobile' && (
                <SamsungOutlookPreview
                    view={view}
                    subject={previewData.inbox.subject || subject}
                    bodyHtml={previewData.openedHtml}
                    senderName={senderName}
                    senderEmail={senderEmail}
                    inboxPreview={previewData.inbox.preview}
                    aiSummary={previewData.aiSummary}
                />
            )}

            {result && !implemented && (
                <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-16 text-center">
                    <Mail size={28} className="mx-auto mb-3 text-neutral-400" />
                    <h3 className="text-sm font-semibold text-neutral-700">
                        {CLIENT_OPTIONS.find((c) => c.id === client)?.label} ·{' '}
                        {DEVICE_OPTIONS.find((d) => d.id === device)?.label} — coming soon
                    </h3>
                    <p className="text-[12px] text-neutral-500 mt-1.5 max-w-md mx-auto">
                        We're rolling out devices and clients one at a time so each one is pixel-tuned.
                        Gmail · Laptop is live now. The next ones will follow shortly.
                    </p>
                </div>
            )}

            {result && !hideIssues && (
                <div className="rounded-md border border-neutral-200 bg-white p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-neutral-700 mb-1.5">
                        What might trip them up
                    </div>
                    {result.issues.length === 0 ? (
                        <p className="text-[12px] text-emerald-700">No issues detected. Looks clean.</p>
                    ) : (
                        <ul className="space-y-1.5">
                            {result.issues.map((iss, idx) => (
                                <li key={idx} className="flex items-start gap-1.5 text-[12px]">
                                    {iss.severity === 'error' ? (
                                        <AlertTriangle size={12} className="mt-0.5 text-rose-600 shrink-0" />
                                    ) : iss.severity === 'warn' ? (
                                        <AlertTriangle size={12} className="mt-0.5 text-amber-600 shrink-0" />
                                    ) : (
                                        <Info size={12} className="mt-0.5 text-neutral-500 shrink-0" />
                                    )}
                                    <span className="text-neutral-700">{iss.message}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}

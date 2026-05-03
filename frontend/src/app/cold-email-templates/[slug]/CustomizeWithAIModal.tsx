'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Loader2, Copy, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { useIsAuthenticated } from '@/lib/auth-client';

interface CustomizeWithAIModalProps {
    open: boolean;
    onClose: () => void;
    templateSlug: string;
    templateTitle: string;
    defaultTone?: string;
}

interface GenerationMeta {
    /** True when the request was made by an authenticated user (no quota). */
    authed?: boolean;
    remaining: number;
    limit: number;
    resetAt: number;
}

export default function CustomizeWithAIModal({
    open,
    onClose,
    templateSlug,
    templateTitle,
    defaultTone,
}: CustomizeWithAIModalProps) {
    const [yourCompany, setYourCompany] = useState('');
    const [yourValueProp, setYourValueProp] = useState('');
    const [targetIndustry, setTargetIndustry] = useState('');
    const [targetRole, setTargetRole] = useState('');
    const [tone, setTone] = useState(defaultTone || '');

    const [generating, setGenerating] = useState(false);
    const [output, setOutput] = useState('');
    const [meta, setMeta] = useState<GenerationMeta | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [rateLimited, setRateLimited] = useState(false);
    const [copied, setCopied] = useState(false);

    const { isAuthenticated } = useIsAuthenticated();

    const abortRef = useRef<AbortController | null>(null);

    // Reset transient state when modal opens
    useEffect(() => {
        if (open) {
            setOutput('');
            setError(null);
            setRateLimited(false);
            setCopied(false);
        } else {
            // Cancel any in-flight generation when modal closes
            abortRef.current?.abort();
            abortRef.current = null;
            setGenerating(false);
        }
    }, [open]);

    // Close on Esc
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    async function handleGenerate() {
        if (!yourCompany.trim() || !yourValueProp.trim()) {
            setError('Please fill in your company and value proposition.');
            return;
        }
        setGenerating(true);
        setOutput('');
        setError(null);
        setRateLimited(false);
        setCopied(false);

        const controller = new AbortController();
        abortRef.current = controller;

        try {
            const res = await fetch('/api/cold-email-templates/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mode: 'customize',
                    templateSlug,
                    yourCompany: yourCompany.trim(),
                    yourValueProp: yourValueProp.trim(),
                    targetIndustry: targetIndustry.trim() || undefined,
                    targetRole: targetRole.trim() || undefined,
                    tone: tone.trim() || undefined,
                }),
                signal: controller.signal,
            });

            if (res.status === 429) {
                const data = await res.json().catch(() => ({}));
                setRateLimited(true);
                setError(data.error || 'Daily free generation limit reached.');
                if (data.resetAt) setMeta({ remaining: 0, limit: data.limit ?? 3, resetAt: data.resetAt });
                return;
            }
            if (!res.ok || !res.body) {
                const data = await res.json().catch(() => ({}));
                setError(data.error || `Generation failed (${res.status}).`);
                return;
            }

            await readSseStream(res.body, {
                onMeta: (m) => setMeta(m),
                onToken: (delta) => setOutput((prev) => prev + delta),
                onError: (msg) => setError(msg),
            });
        } catch (err) {
            if ((err as Error).name === 'AbortError') return;
            setError(err instanceof Error ? err.message : 'Network error');
        } finally {
            setGenerating(false);
            abortRef.current = null;
        }
    }

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(output);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch {
            /* clipboard blocked */
        }
    }

    if (!open) return null;

    const parsed = parseSubjectAndBody(output);

    return (
        <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={onClose}
        >
            <div
                className="bg-[#F7F2EB] rounded-2xl w-full max-w-3xl my-8 max-h-[90vh] flex flex-col border border-[#D1CBC5]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-[#D1CBC5]">
                    <div>
                        <h2 className="text-xl font-semibold text-[#1E1E2F] flex items-center gap-2">
                            <Sparkles size={18} strokeWidth={2} />
                            Customize with AI
                        </h2>
                        <p className="text-sm text-[#6B5E4F] mt-1">
                            Adapting <span className="font-medium text-[#1E1E2F]">{templateTitle}</span> for your business
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-[#6B5E4F] hover:text-[#1E1E2F]"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <Field
                            label="What does your company do? *"
                            placeholder="e.g., AI cold email platform with built-in deliverability protection"
                            value={yourCompany}
                            onChange={setYourCompany}
                            required
                            disabled={generating}
                        />
                        <Field
                            label="One-line value proposition *"
                            placeholder="e.g., Cut bounce rates 60%+ without rebuilding your stack"
                            value={yourValueProp}
                            onChange={setYourValueProp}
                            required
                            disabled={generating}
                        />
                        <Field
                            label="Target industry (optional)"
                            placeholder="e.g., B2B SaaS, ecommerce, agencies"
                            value={targetIndustry}
                            onChange={setTargetIndustry}
                            disabled={generating}
                        />
                        <Field
                            label="Target role (optional)"
                            placeholder="e.g., VP Sales, founder, CMO"
                            value={targetRole}
                            onChange={setTargetRole}
                            disabled={generating}
                        />
                        <Field
                            label="Tone override (optional)"
                            placeholder={`Default: ${defaultTone || 'inherits from template'}`}
                            value={tone}
                            onChange={setTone}
                            disabled={generating}
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className={`mb-4 p-3 rounded-lg flex items-start gap-2 text-sm ${
                            rateLimited ? 'bg-[#FDF3E2] text-[#8B5A1A]' : 'bg-[#FDEAEA] text-[#8B1F1F]'
                        }`}>
                            <AlertCircle size={16} strokeWidth={2} className="shrink-0 mt-0.5" />
                            <div>
                                <p>{error}</p>
                                {rateLimited && !isAuthenticated && (
                                    <a
                                        href={`/signup?from=${encodeURIComponent(`/cold-email-templates/${templateSlug}`)}&intent=ai-customize`}
                                        className="underline font-medium mt-1 inline-block"
                                    >
                                        Sign up for unlimited generations →
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Output */}
                    {(generating || output) && (
                        <div className="mb-4 rounded-xl bg-white border border-[#D1CBC5] overflow-hidden">
                            <div className="px-4 py-2.5 border-b border-[#F0EBE3] flex items-center justify-between">
                                <span className="text-xs uppercase tracking-wide text-[#6B5E4F] font-semibold">
                                    Generated email
                                </span>
                                {generating && (
                                    <span className="inline-flex items-center gap-1.5 text-xs text-[#6B5E4F]">
                                        <Loader2 size={12} className="animate-spin" /> Generating…
                                    </span>
                                )}
                            </div>
                            <div className="p-5">
                                {parsed.subject && (
                                    <>
                                        <p className="text-xs uppercase tracking-wide text-[#6B5E4F] mb-1">Subject</p>
                                        <p className="text-base font-medium text-[#1E1E2F] mb-4">{parsed.subject}</p>
                                    </>
                                )}
                                {parsed.body ? (
                                    <pre className="font-sans text-base leading-relaxed whitespace-pre-wrap text-[#1E1E2F]">
{parsed.body}
                                    </pre>
                                ) : !parsed.subject && (
                                    <pre className="font-sans text-sm text-[#6B5E4F] whitespace-pre-wrap">{output}</pre>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Quota indicator — hidden for authed users (unlimited) */}
                    {meta && !meta.authed && !isAuthenticated && (
                        <p className="text-xs text-[#6B5E4F] mb-1">
                            {meta.remaining > 0
                                ? `${meta.remaining} of ${meta.limit} free generations remaining today`
                                : `Daily limit reached — resets ${formatResetTime(meta.resetAt)}`}
                            {' · '}
                            <a
                                href={`/signup?from=${encodeURIComponent(`/cold-email-templates/${templateSlug}`)}&intent=ai-customize`}
                                className="underline hover:text-[#1E1E2F]"
                            >
                                Sign up for unlimited
                            </a>
                        </p>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-[#D1CBC5] p-4 flex items-center justify-end gap-2">
                    {output && !generating && (
                        <button
                            onClick={handleCopy}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#D1CBC5] text-sm font-medium text-[#1E1E2F] hover:border-[#1E1E2F] transition"
                        >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                    )}
                    <button
                        onClick={handleGenerate}
                        disabled={generating || rateLimited || !yourCompany.trim() || !yourValueProp.trim()}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1E1E2F] text-white text-sm font-semibold hover:bg-[#2A2A3F] disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        {generating ? <Loader2 size={14} className="animate-spin" />
                            : output ? <RefreshCw size={14} />
                            : <Sparkles size={14} />}
                        {generating ? 'Generating…' : output ? 'Regenerate' : 'Generate'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// HELPERS
// ============================================================================

function Field({
    label,
    placeholder,
    value,
    onChange,
    required,
    disabled,
}: {
    label: string;
    placeholder?: string;
    value: string;
    onChange: (v: string) => void;
    required?: boolean;
    disabled?: boolean;
}) {
    return (
        <label className="block">
            <span className="text-xs font-medium text-[#4A3F30] mb-1 block">{label}</span>
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                disabled={disabled}
                maxLength={280}
                className="w-full px-3 py-2.5 rounded-lg bg-white border border-[#D1CBC5] focus:outline-none focus:ring-2 focus:ring-[#1E1E2F]/15 text-sm disabled:opacity-60"
            />
        </label>
    );
}

function parseSubjectAndBody(raw: string): { subject: string; body: string } {
    const trimmed = raw.trim();
    if (!trimmed) return { subject: '', body: '' };
    const subjectMatch = trimmed.match(/^SUBJECT:\s*(.+?)(?:\n|$)/i);
    if (!subjectMatch) return { subject: '', body: trimmed };
    const subject = subjectMatch[1].trim();
    const afterSubject = trimmed.slice(subjectMatch[0].length).trim();
    const body = afterSubject.replace(/^BODY:\s*/i, '').trim();
    return { subject, body };
}

function formatResetTime(resetAt: number): string {
    const date = new Date(resetAt);
    const now = new Date();
    const sameDay = date.toDateString() === now.toDateString();
    if (sameDay) {
        return `at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return 'tomorrow at midnight UTC';
}

interface SseHandlers {
    onMeta?: (meta: GenerationMeta) => void;
    onToken?: (delta: string) => void;
    onError?: (msg: string) => void;
    onDone?: () => void;
}

export async function readSseStream(
    body: ReadableStream<Uint8Array>,
    handlers: SseHandlers,
): Promise<void> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // SSE messages are separated by blank lines
        let idx;
        while ((idx = buffer.indexOf('\n\n')) !== -1) {
            const message = buffer.slice(0, idx);
            buffer = buffer.slice(idx + 2);
            const lines = message.split('\n');
            let event = 'message';
            let data = '';
            for (const line of lines) {
                if (line.startsWith('event: ')) event = line.slice(7).trim();
                else if (line.startsWith('data: ')) data += line.slice(6);
            }
            if (!data) continue;
            try {
                const parsed = JSON.parse(data);
                if (event === 'meta') handlers.onMeta?.(parsed);
                else if (event === 'token') handlers.onToken?.(parsed.delta || '');
                else if (event === 'error') handlers.onError?.(parsed.error || 'unknown error');
                else if (event === 'done') handlers.onDone?.();
            } catch {
                /* malformed frame — skip */
            }
        }
    }
}

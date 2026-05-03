'use client';

import { useState, useRef } from 'react';
import { Sparkles, Loader2, Copy, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { readSseStream } from '../[slug]/CustomizeWithAIModal';
import { useIsAuthenticated } from '@/lib/auth-client';
import CustomSelect from '@/components/ui/CustomSelect';

interface Option {
    value: string;
    label: string;
    description?: string;
}

interface StandaloneGeneratorClientProps {
    goalOptions: Option[];
    frameworkOptions: Option[];
}

interface GenerationMeta {
    /** True when the request was made by an authenticated user (no quota). */
    authed?: boolean;
    remaining: number;
    limit: number;
    resetAt: number;
}

const TONE_OPTIONS = ['direct', 'casual', 'witty', 'formal', 'personal', 'provocative'];
const LENGTH_OPTIONS: Array<{ value: 'micro' | 'short' | 'medium'; label: string; words: string }> = [
    { value: 'micro',  label: 'Micro',  words: 'under 50 words' },
    { value: 'short',  label: 'Short',  words: '50–120 words' },
    { value: 'medium', label: 'Medium', words: '120–180 words' },
];

export default function StandaloneGeneratorClient({
    goalOptions,
    frameworkOptions,
}: StandaloneGeneratorClientProps) {
    const [goal, setGoal] = useState(goalOptions[0]?.value || 'introduction');
    const [framework, setFramework] = useState('');
    const [yourCompany, setYourCompany] = useState('');
    const [yourValueProp, setYourValueProp] = useState('');
    const [targetIndustry, setTargetIndustry] = useState('');
    const [targetRole, setTargetRole] = useState('');
    const [tone, setTone] = useState('direct');
    const [length, setLength] = useState<'micro' | 'short' | 'medium'>('short');

    const [generating, setGenerating] = useState(false);
    const [output, setOutput] = useState('');
    const [meta, setMeta] = useState<GenerationMeta | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [rateLimited, setRateLimited] = useState(false);
    const [copied, setCopied] = useState(false);

    const { isAuthenticated } = useIsAuthenticated();

    const abortRef = useRef<AbortController | null>(null);

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
                    mode: 'standalone',
                    goal,
                    framework: framework || undefined,
                    yourCompany: yourCompany.trim(),
                    yourValueProp: yourValueProp.trim(),
                    targetIndustry: targetIndustry.trim() || undefined,
                    targetRole: targetRole.trim() || undefined,
                    tone,
                    length,
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

    const parsed = parseSubjectAndBody(output);

    return (
        <div className="grid lg:grid-cols-[1fr,1fr] gap-6">
            {/* ─── FORM ───────────────────────────────────────────────── */}
            <div className="rounded-2xl bg-white border border-[#D1CBC5] p-6">
                <h2 className="text-base font-semibold text-[#1E1E2F] mb-5">Tell us about the email</h2>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-medium text-[#4A3F30] mb-1 block">Goal</label>
                        <div className={generating ? 'opacity-60 pointer-events-none' : ''}>
                            <CustomSelect
                                value={goal}
                                onChange={setGoal}
                                options={goalOptions.map((o) => ({ value: o.value, label: o.label }))}
                                searchable={goalOptions.length > 8}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-medium text-[#4A3F30] mb-1 block">Framework (optional)</label>
                        <div className={generating ? 'opacity-60 pointer-events-none' : ''}>
                            <CustomSelect
                                value={framework}
                                onChange={setFramework}
                                options={[
                                    { value: '', label: 'Auto — let AI choose' },
                                    ...frameworkOptions.map((o) => ({ value: o.value, label: o.label })),
                                ]}
                                placeholder="Auto — let AI choose"
                            />
                        </div>
                    </div>

                    <Field
                        label="What does your company do? *"
                        placeholder="e.g., AI cold email platform with built-in deliverability protection"
                        value={yourCompany}
                        onChange={setYourCompany}
                        disabled={generating}
                    />

                    <Field
                        label="One-line value proposition *"
                        placeholder="e.g., Cut bounce rates 60%+ without rebuilding your stack"
                        value={yourValueProp}
                        onChange={setYourValueProp}
                        disabled={generating}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field
                            label="Target industry (optional)"
                            placeholder="e.g., B2B SaaS"
                            value={targetIndustry}
                            onChange={setTargetIndustry}
                            disabled={generating}
                        />
                        <Field
                            label="Target role (optional)"
                            placeholder="e.g., VP Sales"
                            value={targetRole}
                            onChange={setTargetRole}
                            disabled={generating}
                        />
                    </div>

                    {/* Tone — chip selector */}
                    <div>
                        <label className="text-xs font-medium text-[#4A3F30] mb-1.5 block">Tone</label>
                        <div className="flex flex-wrap gap-2">
                            {TONE_OPTIONS.map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setTone(t)}
                                    disabled={generating}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                                        tone === t
                                            ? 'bg-[#1E1E2F] text-white border-[#1E1E2F]'
                                            : 'bg-white border-[#D1CBC5] text-[#4A3F30] hover:border-[#1E1E2F]'
                                    }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Length */}
                    <div>
                        <label className="text-xs font-medium text-[#4A3F30] mb-1.5 block">Length</label>
                        <div className="grid grid-cols-3 gap-2">
                            {LENGTH_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setLength(opt.value)}
                                    disabled={generating}
                                    className={`px-3 py-2 rounded-lg text-xs font-medium border transition text-center ${
                                        length === opt.value
                                            ? 'bg-[#1E1E2F] text-white border-[#1E1E2F]'
                                            : 'bg-white border-[#D1CBC5] text-[#4A3F30] hover:border-[#1E1E2F]'
                                    }`}
                                >
                                    <div className="font-semibold">{opt.label}</div>
                                    <div className={`text-[10px] mt-0.5 ${length === opt.value ? 'text-white/70' : 'text-[#6B5E4F]'}`}>
                                        {opt.words}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={generating || rateLimited || !yourCompany.trim() || !yourValueProp.trim()}
                    className="mt-6 w-full inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-lg bg-[#1E1E2F] text-white text-sm font-semibold hover:bg-[#2A2A3F] disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    {generating ? <Loader2 size={14} className="animate-spin" />
                        : output ? <RefreshCw size={14} />
                        : <Sparkles size={14} />}
                    {generating ? 'Generating…' : output ? 'Regenerate' : 'Generate cold email'}
                </button>
            </div>

            {/* ─── OUTPUT ─────────────────────────────────────────────── */}
            <div className="rounded-2xl bg-white border border-[#D1CBC5] p-6 flex flex-col">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-semibold text-[#1E1E2F]">Generated email</h2>
                    {output && !generating && (
                        <button
                            onClick={handleCopy}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#D1CBC5] text-xs font-medium text-[#1E1E2F] hover:border-[#1E1E2F] transition"
                        >
                            {copied ? <Check size={12} /> : <Copy size={12} />}
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                    )}
                </div>

                {error && (
                    <div className={`mb-4 p-3 rounded-lg flex items-start gap-2 text-sm ${
                        rateLimited ? 'bg-[#FDF3E2] text-[#8B5A1A]' : 'bg-[#FDEAEA] text-[#8B1F1F]'
                    }`}>
                        <AlertCircle size={16} strokeWidth={2} className="shrink-0 mt-0.5" />
                        <div>
                            <p>{error}</p>
                            {rateLimited && !isAuthenticated && (
                                <a
                                    href="/signup?from=/cold-email-templates/generate&intent=ai-customize"
                                    className="underline font-medium mt-1 inline-block"
                                >
                                    Sign up for unlimited generations →
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {!output && !generating && !error && (
                    <div className="flex-1 flex items-center justify-center text-center text-sm text-[#6B5E4F] py-12">
                        Fill out the form and hit generate.
                    </div>
                )}

                {(generating || output) && (
                    <div className="flex-1">
                        {generating && !output && (
                            <div className="flex items-center gap-2 text-sm text-[#6B5E4F] mb-4">
                                <Loader2 size={14} className="animate-spin" />
                                Generating…
                            </div>
                        )}
                        {parsed.subject && (
                            <>
                                <p className="text-xs uppercase tracking-wide text-[#6B5E4F] mb-1">Subject</p>
                                <p className="text-base font-medium text-[#1E1E2F] mb-4">{parsed.subject}</p>
                            </>
                        )}
                        {parsed.body ? (
                            <>
                                <p className="text-xs uppercase tracking-wide text-[#6B5E4F] mb-1">Body</p>
                                <pre className="font-sans text-base leading-relaxed whitespace-pre-wrap text-[#1E1E2F]">
{parsed.body}
                                </pre>
                            </>
                        ) : !parsed.subject && output && (
                            <pre className="font-sans text-sm text-[#6B5E4F] whitespace-pre-wrap">{output}</pre>
                        )}
                    </div>
                )}

                {meta && !meta.authed && !isAuthenticated && (
                    <p className="text-xs text-[#6B5E4F] mt-4 pt-4 border-t border-[#F0EBE3]">
                        {meta.remaining > 0
                            ? `${meta.remaining} of ${meta.limit} free generations remaining today`
                            : `Daily limit reached — resets ${formatResetTime(meta.resetAt)}`}
                    </p>
                )}
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
    disabled,
}: {
    label: string;
    placeholder?: string;
    value: string;
    onChange: (v: string) => void;
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

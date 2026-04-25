'use client';

/**
 * AIAssistPanel — shared AI copy generator used in:
 *   • Sequencer → Templates (inside the template editor modal)
 *   • Sequencer → Campaigns → New (inside each sequence step editor)
 *
 * Flow:
 *   1. On mount, check for an existing BusinessProfile (GET /api/ai/profile).
 *   2. If none, show a "set your company URL" prompt → POST /api/ai/profile.
 *   3. Once profile exists, show the generation controls:
 *      intent dropdown, tone, custom instructions, Generate button.
 *   4. On success, surface subject+body and call onInsert(subject, body_html).
 *
 * The panel is self-contained — parent only needs to pass an onInsert callback.
 */

import { useEffect, useState, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { Sparkles, RefreshCw, Globe, ChevronDown, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';

// ────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────

type StepIntent = 'intro' | 'follow_up' | 'value_add' | 'social_proof' | 'breakup' | 'custom';
type Tone = 'casual' | 'neutral' | 'professional' | 'direct';

interface BusinessProfile {
    schema_version: 1;
    company: { name: string; url: string; one_liner: string; tagline?: string };
    offering: { category: string; products: string[]; differentiators: string[] };
    icp: { roles: string[]; industries: string[]; pain_points: string[] };
    value_prop: { primary: string; proof_points: string[] };
    voice: { tone: string; formality: string; distinctive_phrases: string[] };
}

interface ProfileResponse {
    success: boolean;
    data?: { source_url: string; profile: BusinessProfile; extracted_at: string; model_used: string };
    error?: string;
}

interface GeneratedEmail {
    subject: string;
    body_html: string;
    body_text: string;
    intent: string;
    reasoning?: string;
}

interface GenerateResponse {
    success: boolean;
    data?: { email: GeneratedEmail; usage: { prompt_tokens: number; completion_tokens: number } };
    error?: string;
    code?: string;
}

interface AIAssistPanelProps {
    onInsert: (subject: string, body_html: string) => void;
    /** Default step intent (e.g. campaign step 2 → 'follow_up'). */
    defaultIntent?: StepIntent;
    /** Step position for sequence context (optional). */
    stepNumber?: number;
    totalSteps?: number;
    /** If the user is generating a B variant, pass the A version. */
    variantOf?: { subject: string; body_html: string };
    /** Compact mode — smaller padding for inline use in step editors. */
    compact?: boolean;
}

const INTENT_OPTIONS: { value: StepIntent; label: string; hint: string }[] = [
    { value: 'intro', label: 'Intro (first touch)', hint: 'Introduce + hook + low-friction CTA' },
    { value: 'follow_up', label: 'Follow-up', hint: 'Re-ping politely with a fresh angle' },
    { value: 'value_add', label: 'Value-add', hint: 'Share a useful insight — standalone message' },
    { value: 'social_proof', label: 'Social proof', hint: 'Reference a concrete customer outcome' },
    { value: 'breakup', label: 'Breakup', hint: 'Final message — door open, no pressure' },
    { value: 'custom', label: 'Custom instructions', hint: 'Follow your instructions verbatim' },
];

const TONE_OPTIONS: { value: Tone; label: string }[] = [
    { value: 'casual', label: 'Casual' },
    { value: 'neutral', label: 'Neutral' },
    { value: 'professional', label: 'Professional' },
    { value: 'direct', label: 'Direct' },
];

// ────────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────────

export default function AIAssistPanel({
    onInsert,
    defaultIntent = 'intro',
    stepNumber,
    totalSteps,
    variantOf,
    compact = false,
}: AIAssistPanelProps) {
    // Profile state
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [profile, setProfile] = useState<BusinessProfile | null>(null);
    const [sourceUrl, setSourceUrl] = useState<string | null>(null);
    const [urlInput, setUrlInput] = useState('');
    const [profileError, setProfileError] = useState<string | null>(null);
    const [extracting, setExtracting] = useState(false);

    // Generation state
    const [intent, setIntent] = useState<StepIntent>(defaultIntent);
    const [tone, setTone] = useState<Tone>('direct');
    const [customInstructions, setCustomInstructions] = useState('');
    const [wordBudget, setWordBudget] = useState(100);
    const [generating, setGenerating] = useState(false);
    const [result, setResult] = useState<GeneratedEmail | null>(null);
    const [genError, setGenError] = useState<string | null>(null);

    // UI state
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [editingUrl, setEditingUrl] = useState(false);

    // ── Load profile on mount ──
    // apiClient unwraps `{success, data}` to just `data` on 200 responses, so
    // we get the inner ProfileData shape directly. On 404 (no profile yet) it
    // throws with the API's error string — which is the expected "first time
    // user" state, not an actual error to surface.
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await apiClient<{ source_url: string; profile: BusinessProfile; extracted_at: string; model_used: string }>('/api/ai/profile');
                if (cancelled) return;
                if (res?.profile) {
                    setProfile(res.profile);
                    setSourceUrl(res.source_url || '');
                }
            } catch (err: unknown) {
                if (cancelled) return;
                const msg = String((err as Error)?.message || '');
                // "No business profile yet" is the normal first-time state — silent.
                // "404" appears in some status-formatted variants — also silent.
                // Anything else is a real failure worth showing.
                const isNoProfileYet =
                    msg.includes('404') ||
                    msg.toLowerCase().includes('no business profile') ||
                    msg.toLowerCase().includes('not found');
                if (!isNoProfileYet) {
                    setProfileError('Could not load profile');
                }
            } finally {
                if (!cancelled) setLoadingProfile(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    // ── Extract profile from URL ──
    const extractProfile = useCallback(async (url: string) => {
        setExtracting(true);
        setProfileError(null);
        try {
            // apiClient unwraps the `{success, data}` envelope on 200 → `res` is the
            // inner ProfileData. Errors throw with the API's message.
            const res = await apiClient<{ source_url: string; profile: BusinessProfile; extracted_at: string; model_used: string }>('/api/ai/profile', {
                method: 'POST',
                body: JSON.stringify({ url: url.trim() }),
            });
            if (res?.profile) {
                setProfile(res.profile);
                setSourceUrl(res.source_url || '');
                setEditingUrl(false);
                setUrlInput('');
            } else {
                setProfileError('Failed to build profile');
            }
        } catch (err: unknown) {
            setProfileError((err as Error)?.message || 'Failed to build profile');
        } finally {
            setExtracting(false);
        }
    }, []);

    const handleExtract = () => {
        if (!urlInput.trim()) return;
        extractProfile(urlInput);
    };

    const handleRefresh = () => {
        if (!sourceUrl) return;
        (async () => {
            setExtracting(true);
            try {
                const res = await apiClient<{ source_url: string; profile: BusinessProfile; extracted_at: string; model_used: string }>('/api/ai/profile/refresh', { method: 'POST' });
                if (res?.profile) {
                    setProfile(res.profile);
                }
            } finally { setExtracting(false); }
        })();
    };

    // ── Generate email ──
    const handleGenerate = useCallback(async () => {
        setGenerating(true);
        setGenError(null);
        setResult(null);
        try {
            const body: any = {
                step_intent: intent,
                tone,
                word_budget: wordBudget,
            };
            if (stepNumber) body.step_number = stepNumber;
            if (totalSteps) body.total_steps = totalSteps;
            if (customInstructions.trim()) body.custom_instructions = customInstructions.trim();
            if (variantOf) body.variant_of = variantOf;

            const res = await apiClient<{ email: GeneratedEmail; usage: { prompt_tokens: number; completion_tokens: number } }>('/api/ai/generate-step', {
                method: 'POST',
                body: JSON.stringify(body),
                timeout: 60_000, // OpenAI can be slow; extend default
            });
            if (res?.email) {
                setResult(res.email);
            } else {
                setGenError('Generation failed');
            }
        } catch (err: unknown) {
            const msg = (err as Error)?.message || 'Generation failed';
            // PROFILE_REQUIRED is a backend error code shipped through apiClient's
            // throw path. Detect it by message contents and surface as a profile prompt.
            if (msg.toLowerCase().includes('profile') && msg.toLowerCase().includes('required')) {
                setProfile(null);
                setProfileError('Add your company URL first');
            } else {
                setGenError(msg);
            }
        } finally {
            setGenerating(false);
        }
    }, [intent, tone, wordBudget, customInstructions, stepNumber, totalSteps, variantOf]);

    const handleInsert = () => {
        if (!result) return;
        onInsert(result.subject, result.body_html);
        setResult(null);
    };

    // ──────────────────────────────────────────────────────────────
    // Rendering
    // ──────────────────────────────────────────────────────────────

    const padding = compact ? 'p-3' : 'p-4';

    return (
        <div className={`bg-gradient-to-br from-violet-50 to-blue-50 border border-violet-200 rounded-xl ${padding}`}>
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-violet-600" />
                <span className="text-xs font-bold text-violet-900 uppercase tracking-wider">AI Assist</span>
                {profile && !editingUrl && (
                    <span className="ml-auto text-[10px] text-violet-700 bg-white/70 px-2 py-0.5 rounded-full truncate max-w-[50%]">
                        {profile.company.name || sourceUrl}
                    </span>
                )}
            </div>

            {/* Profile setup / display */}
            {loadingProfile ? (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Loader2 size={12} className="animate-spin" /> Loading profile…
                </div>
            ) : !profile || editingUrl ? (
                <ProfileSetup
                    urlInput={urlInput}
                    setUrlInput={setUrlInput}
                    extracting={extracting}
                    error={profileError}
                    onExtract={handleExtract}
                    onCancel={profile ? () => { setEditingUrl(false); setProfileError(null); } : undefined}
                />
            ) : (
                <>
                    <ProfileBadge
                        profile={profile}
                        sourceUrl={sourceUrl}
                        onEdit={() => setEditingUrl(true)}
                        onRefresh={handleRefresh}
                        refreshing={extracting}
                    />

                    {/* Generation controls */}
                    <div className="space-y-2 mt-3">
                        <div className="grid grid-cols-2 gap-2">
                            <LabelSelect
                                label="Intent"
                                value={intent}
                                onChange={v => setIntent(v as StepIntent)}
                                options={INTENT_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
                            />
                            <LabelSelect
                                label="Tone"
                                value={tone}
                                onChange={v => setTone(v as Tone)}
                                options={TONE_OPTIONS}
                            />
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowAdvanced(s => !s)}
                            className="text-[10px] text-violet-700 hover:text-violet-900 flex items-center gap-1"
                        >
                            <ChevronDown size={10} className={`transition-transform ${showAdvanced ? '' : '-rotate-90'}`} />
                            Advanced
                        </button>

                        {showAdvanced && (
                            <div className="space-y-2 pt-1">
                                <div>
                                    <label className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                                        Custom instructions (optional)
                                    </label>
                                    <textarea
                                        value={customInstructions}
                                        onChange={e => setCustomInstructions(e.target.value)}
                                        rows={2}
                                        placeholder="e.g. Mention our Q3 launch · Skip the value prop · Reference their blog"
                                        className="w-full mt-1 text-xs bg-white border border-gray-200 rounded-lg px-2 py-1.5 resize-none focus:outline-none focus:border-violet-400"
                                        maxLength={2000}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                                        Word budget: {wordBudget}
                                    </label>
                                    <input
                                        type="range"
                                        min={40}
                                        max={200}
                                        step={10}
                                        value={wordBudget}
                                        onChange={e => setWordBudget(Number(e.target.value))}
                                        className="w-full accent-violet-500"
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleGenerate}
                            disabled={generating}
                            className="w-full mt-2 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                        >
                            {generating ? <><Loader2 size={12} className="animate-spin" /> Generating…</> : <><Sparkles size={12} /> {variantOf ? 'Generate B variant' : 'Generate email'}</>}
                        </button>

                        {genError && (
                            <div className="flex items-start gap-1.5 text-[11px] text-red-700 bg-red-50 border border-red-200 rounded-lg px-2 py-1.5">
                                <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
                                <span>{genError}</span>
                            </div>
                        )}

                        {result && (
                            <ResultPreview
                                email={result}
                                onInsert={handleInsert}
                                onDiscard={() => setResult(null)}
                            />
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────
// Subcomponents
// ────────────────────────────────────────────────────────────────────

function ProfileSetup({
    urlInput, setUrlInput, extracting, error, onExtract, onCancel,
}: {
    urlInput: string;
    setUrlInput: (v: string) => void;
    extracting: boolean;
    error: string | null;
    onExtract: () => void;
    onCancel?: () => void;
}) {
    return (
        <div className="space-y-2">
            <p className="text-[11px] text-gray-700 leading-relaxed">
                Paste your company&apos;s website URL. The AI will read it and use it as context for every email generation across your templates and campaigns.
            </p>
            <div className="flex gap-1.5">
                <div className="flex-1 relative">
                    <Globe size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="url"
                        value={urlInput}
                        onChange={e => setUrlInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && onExtract()}
                        disabled={extracting}
                        placeholder="https://yourcompany.com"
                        className="w-full pl-7 pr-2 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-violet-400"
                    />
                </div>
                <button
                    type="button"
                    onClick={onExtract}
                    disabled={extracting || !urlInput.trim()}
                    className="bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 text-white text-xs font-semibold px-3 rounded-lg"
                >
                    {extracting ? <Loader2 size={12} className="animate-spin" /> : 'Scan'}
                </button>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={extracting}
                        className="text-gray-500 hover:text-gray-700 px-2"
                        aria-label="Cancel"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>
            {extracting && (
                <p className="text-[10px] text-violet-700">Reading and extracting — usually 5–15 seconds…</p>
            )}
            {error && (
                <div className="flex items-start gap-1.5 text-[11px] text-red-700 bg-red-50 border border-red-200 rounded-lg px-2 py-1.5">
                    <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}

function ProfileBadge({
    profile, sourceUrl, onEdit, onRefresh, refreshing,
}: {
    profile: BusinessProfile;
    sourceUrl: string | null;
    onEdit: () => void;
    onRefresh: () => void;
    refreshing: boolean;
}) {
    return (
        <div className="bg-white/70 border border-violet-100 rounded-lg px-2.5 py-2 text-[11px] text-gray-700">
            <div className="flex items-start gap-2">
                <CheckCircle2 size={12} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">{profile.company.name || 'Your company'}</div>
                    <div className="text-gray-600 line-clamp-2 mt-0.5">{profile.company.one_liner}</div>
                </div>
                <div className="flex gap-0.5 flex-shrink-0">
                    <button
                        type="button"
                        onClick={onRefresh}
                        disabled={refreshing}
                        title="Re-scan website"
                        className="text-gray-500 hover:text-violet-700 p-1 disabled:opacity-50"
                    >
                        <RefreshCw size={11} className={refreshing ? 'animate-spin' : ''} />
                    </button>
                    <button
                        type="button"
                        onClick={onEdit}
                        title="Change URL"
                        className="text-gray-500 hover:text-violet-700 p-1 text-[10px] font-semibold"
                    >
                        Edit
                    </button>
                </div>
            </div>
        </div>
    );
}

function LabelSelect({
    label, value, onChange, options,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
}) {
    return (
        <label className="block">
            <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider">{label}</span>
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full mt-1 text-xs bg-white border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-violet-400"
            >
                {options.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>
        </label>
    );
}

function ResultPreview({
    email, onInsert, onDiscard,
}: {
    email: GeneratedEmail;
    onInsert: () => void;
    onDiscard: () => void;
}) {
    return (
        <div className="bg-white border border-violet-200 rounded-lg p-2.5 space-y-2 mt-2">
            <div>
                <div className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">Subject</div>
                <div className="text-xs text-gray-900 font-medium mt-0.5">{email.subject}</div>
            </div>
            <div>
                <div className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">Body preview</div>
                <div
                    className="text-xs text-gray-700 mt-0.5 line-clamp-5 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: email.body_html }}
                />
            </div>
            {email.reasoning && (
                <div className="text-[10px] text-violet-700 italic border-t border-violet-100 pt-1.5">
                    {email.reasoning}
                </div>
            )}
            <div className="flex gap-1.5 pt-1">
                <button
                    type="button"
                    onClick={onInsert}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-2 py-1.5 rounded-md"
                >
                    Use this
                </button>
                <button
                    type="button"
                    onClick={onDiscard}
                    className="text-gray-500 hover:text-gray-700 text-xs px-2 py-1.5 rounded-md"
                >
                    Discard
                </button>
            </div>
        </div>
    );
}

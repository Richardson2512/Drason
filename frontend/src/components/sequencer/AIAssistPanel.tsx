'use client';

/**
 * AIAssistPanel - shared AI copy generator used in:
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
 * The panel is self-contained - parent only needs to pass an onInsert callback.
 */

import { useEffect, useState, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { sanitizeEmailHtml } from '@/lib/sanitizeEmailHtml';
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
    /** Compact mode - smaller padding for inline use in step editors. */
    compact?: boolean;
}

const INTENT_OPTIONS: { value: StepIntent; label: string; hint: string }[] = [
    { value: 'intro', label: 'Intro (first touch)', hint: 'Introduce + hook + low-friction CTA' },
    { value: 'follow_up', label: 'Follow-up', hint: 'Re-ping politely with a fresh angle' },
    { value: 'value_add', label: 'Value-add', hint: 'Share a useful insight - standalone message' },
    { value: 'social_proof', label: 'Social proof', hint: 'Reference a concrete customer outcome' },
    { value: 'breakup', label: 'Breakup', hint: 'Final message - door open, no pressure' },
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
    const [editingFields, setEditingFields] = useState(false);

    // ── Load profile on mount ──
    // apiClient unwraps `{success, data}` to just `data` on 200 responses, so
    // we get the inner ProfileData shape directly. On 404 (no profile yet) it
    // throws with the API's error string - which is the expected "first time
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
                // "No business profile yet" is the normal first-time state - silent.
                // "404" appears in some status-formatted variants - also silent.
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

    // ── Extract profile from one or more URLs ──
    //
    // Path: enqueue an async BullMQ job (POST /api/ai/profile/jobs), then
    // poll GET /api/ai/profile/jobs/:id until state === 'completed' or
    // 'failed'. The frontend never holds an HTTP connection across the
    // Jina + OpenAI round-trip, so the page stays responsive even if 100
    // other orgs are extracting at the same moment.
    //
    // Up to 5 URLs are supported (backend caps at MAX_URLS_PER_PROFILE).
    // The extractor synthesizes across all sources - homepage + pricing
    // + case-study, etc.
    const extractProfile = useCallback(async (rawInput: string) => {
        const urls = rawInput
            .split(/[\s,]+/)
            .map(u => u.trim())
            .filter(Boolean);
        if (urls.length === 0) {
            setProfileError('Paste at least one URL');
            return;
        }
        if (urls.length > 5) {
            setProfileError('At most 5 URLs per profile');
            return;
        }

        setExtracting(true);
        setProfileError(null);
        try {
            const enqueue = await apiClient<{ job_id: string; source_urls: string[] }>('/api/ai/profile/jobs', {
                method: 'POST',
                body: JSON.stringify(urls.length === 1 ? { url: urls[0] } : { urls }),
            });
            if (!enqueue?.job_id) {
                setProfileError('Failed to enqueue extraction');
                return;
            }

            // Poll. Backoff schedule: 1s × 5 → 2s × 10 → 4s × 30 - caps at
            // ~2 minutes total before giving up so a stuck job doesn't
            // hang the panel forever.
            const delays = [
                ...Array(5).fill(1_000),
                ...Array(10).fill(2_000),
                ...Array(30).fill(4_000),
            ];
            // 'unknown' = BullMQ can't resolve the job state (job evicted /
            // retention expired / queue connection blip). Tolerate a few
            // transients but bail rather than burning the full 2-minute
            // budget on a job that's effectively lost.
            const MAX_UNKNOWN_TICKS = 3;
            let unknownTicks = 0;
            for (const delay of delays) {
                await new Promise(resolve => setTimeout(resolve, delay));
                const status = await apiClient<{
                    state: string;
                    finished: boolean;
                    result?: { profile: BusinessProfile; source_urls: string[] };
                    error?: string;
                }>(`/api/ai/profile/jobs/${enqueue.job_id}`).catch(() => null);

                if (!status) continue;
                if (status.state === 'completed' && status.result?.profile) {
                    setProfile(status.result.profile);
                    setSourceUrl(status.result.source_urls?.[0] || urls[0]);
                    setEditingUrl(false);
                    setUrlInput('');
                    return;
                }
                if (status.state === 'failed') {
                    setProfileError(status.error || 'Extraction failed');
                    return;
                }
                if (status.state === 'unknown') {
                    unknownTicks += 1;
                    if (unknownTicks >= MAX_UNKNOWN_TICKS) {
                        setProfileError('Extraction job was lost. Please try again.');
                        return;
                    }
                    continue;
                }
                // 'waiting' / 'active' / 'delayed' → keep polling
            }
            setProfileError('Extraction is taking longer than expected - check back in a moment.');
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
                        onRefine={() => setEditingFields(v => !v)}
                        refining={editingFields}
                        onRefresh={handleRefresh}
                        refreshing={extracting}
                    />

                    {editingFields && (
                        <ManualProfileEditor
                            profile={profile}
                            onSaved={(merged) => { setProfile(merged); setEditingFields(false); }}
                            onCancel={() => setEditingFields(false)}
                        />
                    )}

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
                For richer output, paste up to <strong>5 URLs</strong> (homepage + pricing + a case study) separated by commas, spaces, or new lines - they&apos;ll be synthesized into one profile.
            </p>
            <div className="flex gap-1.5 items-start">
                <div className="flex-1 relative">
                    <Globe size={12} className="absolute left-2.5 top-2 text-gray-400" />
                    <textarea
                        value={urlInput}
                        onChange={e => setUrlInput(e.target.value)}
                        onKeyDown={e => {
                            // Cmd/Ctrl+Enter submits without inserting a newline.
                            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                e.preventDefault();
                                onExtract();
                            }
                        }}
                        disabled={extracting}
                        rows={2}
                        placeholder={'https://yourcompany.com\nhttps://yourcompany.com/pricing'}
                        className="w-full pl-7 pr-2 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-violet-400 resize-y font-mono"
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
                <p className="text-[10px] text-violet-700">Reading and extracting - usually 5–15 seconds…</p>
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
    profile, sourceUrl, onEdit, onRefine, refining, onRefresh, refreshing,
}: {
    profile: BusinessProfile;
    sourceUrl: string | null;
    onEdit: () => void;
    /** Toggle the manual-edit panel for refining individual fields. */
    onRefine: () => void;
    refining: boolean;
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
                        onClick={onRefine}
                        title="Refine fields manually"
                        className={`p-1 text-[10px] font-semibold ${refining ? 'text-violet-700' : 'text-gray-500 hover:text-violet-700'}`}
                    >
                        Refine
                    </button>
                    <button
                        type="button"
                        onClick={onEdit}
                        title="Change URL(s)"
                        className="text-gray-500 hover:text-violet-700 p-1 text-[10px] font-semibold"
                    >
                        URL
                    </button>
                </div>
            </div>
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────
// Manual edit panel - refine fields the AI got wrong without re-scraping.
// PATCHes /api/ai/profile with whatever subset the operator changed; the
// backend deep-merges into the cached row.
// ────────────────────────────────────────────────────────────────────

function ManualProfileEditor({
    profile, onSaved, onCancel,
}: {
    profile: BusinessProfile;
    onSaved: (merged: BusinessProfile) => void;
    onCancel: () => void;
}) {
    // Local working copy. Sections are edited in place; on save we send
    // the whole shape (the backend deep-merges per-section). Keeping the
    // form simple beats trying to track per-field dirty bits.
    const [draft, setDraft] = useState<BusinessProfile>(profile);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateCompany = (k: keyof BusinessProfile['company'], v: string) =>
        setDraft(d => ({ ...d, company: { ...d.company, [k]: v } as BusinessProfile['company'] }));
    const updateOffering = <K extends keyof BusinessProfile['offering']>(k: K, v: BusinessProfile['offering'][K]) =>
        setDraft(d => ({ ...d, offering: { ...d.offering, [k]: v } }));
    const updateIcp = <K extends keyof BusinessProfile['icp']>(k: K, v: BusinessProfile['icp'][K]) =>
        setDraft(d => ({ ...d, icp: { ...d.icp, [k]: v } }));
    const updateValueProp = <K extends keyof BusinessProfile['value_prop']>(k: K, v: BusinessProfile['value_prop'][K]) =>
        setDraft(d => ({ ...d, value_prop: { ...d.value_prop, [k]: v } }));
    const updateVoice = <K extends keyof BusinessProfile['voice']>(k: K, v: BusinessProfile['voice'][K]) =>
        setDraft(d => ({ ...d, voice: { ...d.voice, [k]: v } }));

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            const res = await apiClient<{ profile: BusinessProfile }>('/api/ai/profile', {
                method: 'PATCH',
                body: JSON.stringify({
                    company: draft.company,
                    offering: draft.offering,
                    icp: draft.icp,
                    value_prop: draft.value_prop,
                    voice: draft.voice,
                }),
            });
            if (res?.profile) onSaved(res.profile);
            else setError('Save failed');
        } catch (err) {
            setError((err as Error)?.message || 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="mt-2 bg-white border border-violet-200 rounded-lg p-3 space-y-3 text-[11px]">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700">Refine profile fields</span>
                <button onClick={onCancel} className="text-gray-400 hover:text-gray-600" aria-label="Close"><X size={12} /></button>
            </div>

            <FieldSection title="Company">
                <FieldInput label="Name" value={draft.company.name} onChange={v => updateCompany('name', v)} />
                <FieldInput label="One-liner (≤ 20 words)" value={draft.company.one_liner} onChange={v => updateCompany('one_liner', v)} />
                <FieldInput label="Tagline" value={draft.company.tagline ?? ''} onChange={v => updateCompany('tagline', v)} optional />
            </FieldSection>

            <FieldSection title="Offering">
                <FieldInput label="Category" value={draft.offering.category} onChange={v => updateOffering('category', v)} />
                <ListInput label="Products" values={draft.offering.products} onChange={v => updateOffering('products', v)} />
                <ListInput label="Differentiators" values={draft.offering.differentiators} onChange={v => updateOffering('differentiators', v)} />
            </FieldSection>

            <FieldSection title="Ideal Customer Profile">
                <ListInput label="Roles" values={draft.icp.roles} onChange={v => updateIcp('roles', v)} />
                <ListInput label="Industries" values={draft.icp.industries} onChange={v => updateIcp('industries', v)} />
                <ListInput label="Pain points" values={draft.icp.pain_points} onChange={v => updateIcp('pain_points', v)} />
            </FieldSection>

            <FieldSection title="Value proposition">
                <FieldInput label="Primary (≤ 30 words)" value={draft.value_prop.primary} onChange={v => updateValueProp('primary', v)} />
                <ListInput label="Proof points" values={draft.value_prop.proof_points} onChange={v => updateValueProp('proof_points', v)} />
            </FieldSection>

            <FieldSection title="Voice">
                <FieldInput label="Tone" value={draft.voice.tone} onChange={v => updateVoice('tone', v)} hint="casual / neutral / professional / direct" />
                <FieldInput label="Formality" value={draft.voice.formality} onChange={v => updateVoice('formality', v)} hint="low / medium / high" />
                <ListInput label="Distinctive phrases" values={draft.voice.distinctive_phrases} onChange={v => updateVoice('distinctive_phrases', v)} />
            </FieldSection>

            {error && <div className="text-[11px] text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1">{error}</div>}

            <div className="flex items-center justify-end gap-2">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={saving}
                    className="text-[11px] text-gray-600 hover:text-gray-900 px-2 py-1 rounded"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                >
                    {saving && <Loader2 size={11} className="animate-spin" />}
                    Save changes
                </button>
            </div>
        </div>
    );
}

function FieldSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{title}</div>
            {children}
        </div>
    );
}

function FieldInput({ label, value, onChange, hint, optional }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    hint?: string;
    optional?: boolean;
}) {
    return (
        <label className="block">
            <span className="text-[10px] text-gray-600 flex items-center gap-1">
                {label}
                {optional && <span className="text-gray-400">(optional)</span>}
                {hint && <span className="text-gray-400 text-[9px] italic">{hint}</span>}
            </span>
            <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full mt-0.5 text-xs bg-white border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-violet-400"
            />
        </label>
    );
}

/** Edit a string-array field as a multi-line textarea - one entry per line.
 *  Trade-off: doesn't allow reorder by drag. The operator can rearrange by
 *  cutting + pasting lines, which beats building a real chip editor. */
function ListInput({ label, values, onChange }: {
    label: string;
    values: string[];
    onChange: (v: string[]) => void;
}) {
    const [text, setText] = useState(values.join('\n'));
    // Keep local text in sync if parent values change (e.g. cancel/reload).
    useEffect(() => { setText(values.join('\n')); }, [values.join('|')]); // eslint-disable-line react-hooks/exhaustive-deps

    const commit = (v: string) => {
        setText(v);
        onChange(v.split('\n').map(s => s.trim()).filter(Boolean));
    };

    return (
        <label className="block">
            <span className="text-[10px] text-gray-600">{label} <span className="text-gray-400">(one per line)</span></span>
            <textarea
                value={text}
                onChange={e => commit(e.target.value)}
                rows={Math.max(2, Math.min(5, text.split('\n').length))}
                className="w-full mt-0.5 text-xs bg-white border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-violet-400 resize-y"
            />
        </label>
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
                    dangerouslySetInnerHTML={{ __html: sanitizeEmailHtml(email.body_html) }}
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

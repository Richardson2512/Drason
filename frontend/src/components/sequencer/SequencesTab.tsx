'use client';

/**
 * SequencesTab - saved-sequence management surface.
 *
 * Rendered inside the templates page alongside Templates + Signatures.
 * Three modes:
 *   - 'list'   - table of saved sequences with row actions
 *   - 'edit'   - full multi-step editor with optional AI assist drawer
 *   - 'ai'     - modal-style AI generator (URL paste + custom instructions)
 *
 * Signatures are picked from the existing /api/sequencer/signatures list
 * and inserted inline into body_html via the existing RichTextEditor -
 * same pattern as the campaign wizard. No separate signature_id column.
 */

import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import {
    Plus, Trash2, Copy, Sparkles, Loader2, X as XIcon,
    ArrowLeft, FileText, ChevronDown, ChevronRight, Wand2, Clock,
} from 'lucide-react';

const RichTextEditor = dynamic(() => import('@/components/sequencer/RichTextEditor'), { ssr: false });

// ────────────────────────────────────────────────────────────────────
// Types - mirror the backend payload shape
// ────────────────────────────────────────────────────────────────────

interface SequenceStep {
    id?: string;
    step_number: number;
    delay_days: number;
    delay_hours: number;
    subject: string;
    preheader: string;
    body_html: string;
}

interface SequenceSummary {
    id: string;
    name: string;
    description: string | null;
    category: string;
    ai_source_urls: string[];
    ai_custom_instructions: string | null;
    ai_model_used: string | null;
    created_at: string;
    updated_at: string;
    step_count: number;
}

interface SequenceFull extends SequenceSummary {
    steps: SequenceStep[];
}

interface Signature {
    id: string;
    name: string;
    html_content: string;
    is_default: boolean;
}

type ViewMode = { kind: 'list' } | { kind: 'edit'; sequenceId: string | null };

const CATEGORIES = ['general', 'introduction', 'follow-up', 'breakup', 'meeting', 'referral'];

// ────────────────────────────────────────────────────────────────────
// Top-level component
// ────────────────────────────────────────────────────────────────────

/**
 * Imperative handle the parent (templates page) calls to trigger the
 * "New sequence" and "Generate with AI" actions from buttons that live
 * in the page header - above the search bar - alongside the New Template
 * / New Signature buttons for the other tabs.
 */
export interface SequencesTabHandle {
    openNew: () => void;
    openAi: () => void;
}

const SequencesTab = forwardRef<SequencesTabHandle, { searchQuery: string }>(function SequencesTab(
    { searchQuery },
    ref,
) {
    const [view, setView] = useState<ViewMode>({ kind: 'list' });
    const [sequences, setSequences] = useState<SequenceSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [signatures, setSignatures] = useState<Signature[]>([]);
    const [aiModalOpen, setAiModalOpen] = useState(false);

    // Expose action triggers so the templates page header can render the
    // "New sequence" + "Generate with AI" buttons above the search bar
    // (the natural slot for tab-specific primary actions).
    useImperativeHandle(ref, () => ({
        openNew: () => setView({ kind: 'edit', sequenceId: null }),
        openAi: () => setAiModalOpen(true),
    }), []);

    const fetchSequences = async () => {
        try {
            const data = await apiClient<SequenceSummary[]>('/api/sequencer/sequences');
            setSequences(Array.isArray(data) ? data : []);
        } catch (err) {
            toast.error((err as Error)?.message || 'Failed to load sequences');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSequences();
        apiClient<Signature[]>('/api/sequencer/signatures')
            .then(r => setSignatures(Array.isArray(r) ? r : []))
            .catch(() => setSignatures([]));
    }, []);

    const filtered = useMemo(() => {
        if (!searchQuery.trim()) return sequences;
        const q = searchQuery.toLowerCase();
        return sequences.filter(s =>
            s.name.toLowerCase().includes(q) ||
            (s.description || '').toLowerCase().includes(q) ||
            s.category.toLowerCase().includes(q),
        );
    }, [sequences, searchQuery]);

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this sequence? This cannot be undone.')) return;
        try {
            await apiClient(`/api/sequencer/sequences/${id}`, { method: 'DELETE' });
            await fetchSequences();
            toast.success('Sequence deleted');
        } catch (err) {
            toast.error((err as Error)?.message || 'Failed to delete');
        }
    };

    const handleDuplicate = async (id: string) => {
        try {
            await apiClient<SequenceFull>(`/api/sequencer/sequences/${id}/duplicate`, { method: 'POST' });
            await fetchSequences();
            toast.success('Sequence duplicated');
        } catch (err) {
            toast.error((err as Error)?.message || 'Failed to duplicate');
        }
    };

    if (view.kind === 'edit') {
        return (
            <SequenceEditor
                sequenceId={view.sequenceId}
                signatures={signatures}
                onClose={async () => {
                    setView({ kind: 'list' });
                    await fetchSequences();
                }}
            />
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {/* Action buttons live in the templates-page header (above the
                search bar) via the SequencesTabHandle imperative ref. */}
            {loading ? (
                <div className="flex items-center gap-2 text-sm text-gray-500 py-8">
                    <Loader2 size={14} className="animate-spin" /> Loading sequences…
                </div>
            ) : filtered.length === 0 ? (
                <EmptyState
                    onNew={() => setView({ kind: 'edit', sequenceId: null })}
                    onAi={() => setAiModalOpen(true)}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {filtered.map(s => (
                        <SequenceCard
                            key={s.id}
                            sequence={s}
                            onOpen={() => setView({ kind: 'edit', sequenceId: s.id })}
                            onDelete={() => handleDelete(s.id)}
                            onDuplicate={() => handleDuplicate(s.id)}
                        />
                    ))}
                </div>
            )}

            {aiModalOpen && (
                <AiGenerateModal
                    onClose={() => setAiModalOpen(false)}
                    onCreated={async (id) => {
                        setAiModalOpen(false);
                        await fetchSequences();
                        setView({ kind: 'edit', sequenceId: id });
                    }}
                />
            )}
        </div>
    );
});

export default SequencesTab;

// ────────────────────────────────────────────────────────────────────
// Empty state
// ────────────────────────────────────────────────────────────────────

function EmptyState({ onNew, onAi }: { onNew: () => void; onAi: () => void }) {
    return (
        <div className="premium-card p-12 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gray-50">
                <FileText size={20} className="text-gray-400" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 m-0">No sequences yet</h3>
            <p className="text-xs text-gray-500 m-0 max-w-md">
                Save a multi-step sequence once, load it into any campaign with one click. Build by hand, or let AI draft from your website URLs.
            </p>
            <div className="flex items-center gap-2 mt-2">
                <button
                    onClick={onAi}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 cursor-pointer border-none"
                >
                    <Sparkles size={12} /> Generate with AI
                </button>
                <button
                    onClick={onNew}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer bg-white hover:bg-gray-50"
                    style={{ border: '1px solid #D1CBC5' }}
                >
                    <Plus size={12} /> Create manually
                </button>
            </div>
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────
// List card
// ────────────────────────────────────────────────────────────────────

function SequenceCard({
    sequence: s,
    onOpen,
    onDelete,
    onDuplicate,
}: {
    sequence: SequenceSummary;
    onOpen: () => void;
    onDelete: () => void;
    onDuplicate: () => void;
}) {
    return (
        <div
            className="premium-card p-4 cursor-pointer hover:border-gray-400 transition-colors"
            onClick={onOpen}
        >
            <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 m-0 truncate">{s.name}</h3>
                    {s.description && (
                        <p className="text-[11px] text-gray-500 mt-1 m-0 line-clamp-2">{s.description}</p>
                    )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <button
                        onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-900 bg-transparent border-none cursor-pointer"
                        title="Duplicate"
                    >
                        <Copy size={12} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 bg-transparent border-none cursor-pointer"
                        title="Delete"
                    >
                        <Trash2 size={12} />
                    </button>
                </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap mt-3">
                <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: '#F3F4F6', color: '#374151' }}
                >
                    {s.step_count} {s.step_count === 1 ? 'step' : 'steps'}
                </span>
                <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: '#EFF6FF', color: '#1D4ED8' }}
                >
                    {s.category}
                </span>
                {s.ai_model_used && (
                    <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                        style={{ background: '#EEF2FF', color: '#4F46E5' }}
                    >
                        <Sparkles size={9} /> AI
                    </span>
                )}
            </div>
            <div className="text-[10px] text-gray-400 mt-2">Updated {new Date(s.updated_at).toLocaleDateString()}</div>
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────
// Editor - multi-step, signature insertion, add/remove
// ────────────────────────────────────────────────────────────────────

function SequenceEditor({
    sequenceId,
    signatures,
    onClose,
}: {
    sequenceId: string | null;
    signatures: Signature[];
    onClose: () => void;
}) {
    const [loading, setLoading] = useState(sequenceId !== null);
    const [saving, setSaving] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('general');
    const [steps, setSteps] = useState<SequenceStep[]>([
        { step_number: 1, delay_days: 0, delay_hours: 0, subject: '', preheader: '', body_html: '' },
    ]);
    const [activeIdx, setActiveIdx] = useState(0);
    const [aiMeta, setAiMeta] = useState<{ urls: string[]; instructions: string | null } | null>(null);

    useEffect(() => {
        if (!sequenceId) return;
        (async () => {
            try {
                const data = await apiClient<SequenceFull>(`/api/sequencer/sequences/${sequenceId}`);
                setName(data.name);
                setDescription(data.description || '');
                setCategory(data.category);
                setSteps(data.steps?.length ? data.steps : [{ step_number: 1, delay_days: 0, delay_hours: 0, subject: '', preheader: '', body_html: '' }]);
                if (data.ai_model_used) {
                    setAiMeta({ urls: data.ai_source_urls || [], instructions: data.ai_custom_instructions });
                }
            } catch (err) {
                toast.error((err as Error)?.message || 'Failed to load sequence');
                onClose();
            } finally {
                setLoading(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sequenceId]);

    const updateStep = (idx: number, patch: Partial<SequenceStep>) => {
        setSteps(prev => prev.map((s, i) => i === idx ? { ...s, ...patch } : s));
    };
    const addStep = () => {
        setSteps(prev => [...prev, {
            step_number: prev.length + 1,
            delay_days: 3, delay_hours: 0,
            subject: '', preheader: '', body_html: '',
        }]);
        setActiveIdx(steps.length);
    };
    const removeStep = (idx: number) => {
        if (steps.length <= 1) {
            toast.error('A sequence must have at least one step');
            return;
        }
        setSteps(prev => prev
            .filter((_, i) => i !== idx)
            .map((s, i) => ({ ...s, step_number: i + 1 })),
        );
        if (activeIdx >= idx && activeIdx > 0) setActiveIdx(activeIdx - 1);
    };
    const handleSave = async () => {
        if (!name.trim()) { toast.error('Name is required'); return; }
        if (steps.some(s => !s.subject.trim() || !s.body_html.trim())) {
            toast.error('Every step needs a subject and body');
            return;
        }
        setSaving(true);
        try {
            const payload = {
                name: name.trim(),
                description: description.trim() || null,
                category,
                steps: steps.map((s, i) => ({
                    step_number: i + 1,
                    delay_days: s.delay_days,
                    delay_hours: s.delay_hours,
                    subject: s.subject,
                    preheader: s.preheader,
                    body_html: s.body_html,
                })),
            };
            if (sequenceId) {
                await apiClient(`/api/sequencer/sequences/${sequenceId}`, { method: 'PATCH', body: JSON.stringify(payload) });
                toast.success('Sequence saved');
            } else {
                await apiClient('/api/sequencer/sequences', { method: 'POST', body: JSON.stringify(payload) });
                toast.success('Sequence created');
            }
            onClose();
        } catch (err) {
            toast.error((err as Error)?.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-sm text-gray-500 py-8">
                <Loader2 size={14} className="animate-spin" /> Loading sequence…
            </div>
        );
    }

    const active = steps[activeIdx];

    return (
        <div className="flex flex-col gap-3">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <button
                    onClick={onClose}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 bg-transparent border-none cursor-pointer"
                >
                    <ArrowLeft size={12} /> Back to sequences
                </button>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 cursor-pointer disabled:opacity-50 border-none"
                    >
                        {saving ? <Loader2 size={12} className="animate-spin" /> : null}
                        {saving ? 'Saving…' : (sequenceId ? 'Save changes' : 'Create sequence')}
                    </button>
                </div>
            </div>

            {/* Metadata */}
            <div className="premium-card p-4">
                <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-3">
                    <div>
                        <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Sequence name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Founder-led intro · 4-touch"
                            className="w-full px-3 py-1.5 text-xs rounded-lg outline-none"
                            style={{ border: '1px solid #D1CBC5' }}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs rounded-lg outline-none bg-white"
                            style={{ border: '1px solid #D1CBC5' }}
                        >
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
                <div className="mt-3">
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Description (optional)</label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What angle does this sequence take?"
                        className="w-full px-3 py-1.5 text-xs rounded-lg outline-none"
                        style={{ border: '1px solid #D1CBC5' }}
                    />
                </div>
                {aiMeta && (
                    <div className="mt-3 px-3 py-2 rounded-lg text-[11px] text-indigo-900 flex items-start gap-2" style={{ background: '#EEF2FF', border: '1px solid #C7D2FE' }}>
                        <Sparkles size={11} className="mt-0.5 shrink-0" />
                        <div className="min-w-0">
                            <div className="font-semibold">Generated by AI</div>
                            <div className="text-[10px] text-indigo-700 truncate">Sources: {aiMeta.urls.join(', ')}</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Steps tabs */}
            <div className="flex items-center gap-1.5 flex-wrap">
                {steps.map((s, i) => (
                    <button
                        key={i}
                        onClick={() => setActiveIdx(i)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors border-none"
                        style={{
                            background: activeIdx === i ? '#111827' : '#F3F4F6',
                            color: activeIdx === i ? '#FFFFFF' : '#374151',
                        }}
                    >
                        Step {s.step_number}
                        {s.subject && <span className={`text-[10px] truncate max-w-[120px] ${activeIdx === i ? 'opacity-70' : 'opacity-50'}`}>· {s.subject}</span>}
                    </button>
                ))}
                <button
                    onClick={addStep}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer bg-white hover:bg-gray-50 border"
                    style={{ border: '1px dashed #D1CBC5', color: '#6B7280' }}
                >
                    <Plus size={11} /> Add step
                </button>
            </div>

            {/* Active step editor */}
            <div className="premium-card p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-900">Step {active.step_number}</span>
                        {activeIdx > 0 && (
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                                <Clock size={10} />
                                <span>Send</span>
                                <input
                                    type="number"
                                    min={0}
                                    max={60}
                                    value={active.delay_days}
                                    onChange={(e) => updateStep(activeIdx, { delay_days: parseInt(e.target.value) || 0 })}
                                    className="w-12 px-1.5 py-0.5 text-[10px] rounded outline-none text-center"
                                    style={{ border: '1px solid #D1CBC5' }}
                                />
                                <span>days</span>
                                <input
                                    type="number"
                                    min={0}
                                    max={23}
                                    value={active.delay_hours}
                                    onChange={(e) => updateStep(activeIdx, { delay_hours: parseInt(e.target.value) || 0 })}
                                    className="w-12 px-1.5 py-0.5 text-[10px] rounded outline-none text-center"
                                    style={{ border: '1px solid #D1CBC5' }}
                                />
                                <span>hours after step {active.step_number - 1}</span>
                            </div>
                        )}
                    </div>
                    {steps.length > 1 && (
                        <button
                            onClick={() => removeStep(activeIdx)}
                            className="text-[10px] text-red-600 hover:text-red-800 bg-transparent border-none cursor-pointer flex items-center gap-1"
                        >
                            <Trash2 size={10} /> Remove step
                        </button>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <input
                        type="text"
                        value={active.subject}
                        onChange={(e) => updateStep(activeIdx, { subject: e.target.value })}
                        placeholder="Subject line · use {{first_name}} for personalization"
                        className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                        style={{ border: '1px solid #D1CBC5' }}
                    />
                    <div className="relative">
                        <input
                            type="text"
                            value={active.preheader}
                            onChange={(e) => updateStep(activeIdx, { preheader: e.target.value })}
                            placeholder="Preheader shown next to subject in inbox (optional)"
                            className="w-full px-3 py-1.5 pr-12 rounded-lg text-xs outline-none"
                            style={{ border: '1px dashed #D1CBC5', background: '#FAFAF8' }}
                        />
                        <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] tabular-nums ${active.preheader.length > 100 ? 'text-amber-600' : 'text-gray-400'}`}>
                            {active.preheader.length}
                        </span>
                    </div>
                    <RichTextEditor
                        content={active.body_html}
                        onChange={(html) => updateStep(activeIdx, { body_html: html })}
                        placeholder="Write the email body. Use the signature button to insert one of your saved signatures."
                        personalizationTokens={['first_name', 'last_name', 'full_name', 'company', 'title', 'email']}
                        signatures={signatures}
                    />
                </div>
            </div>
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────
// AI generator modal
// ────────────────────────────────────────────────────────────────────

interface AiGenerateResultShape {
    name: string;
    description: string;
    steps: SequenceStep[];
    sources: Array<{ url: string; ok: boolean; error?: string }>;
    modelUsed: string;
}

function AiGenerateModal({
    onClose,
    onCreated,
}: {
    onClose: () => void;
    onCreated: (id: string) => void;
}) {
    const [urlsRaw, setUrlsRaw] = useState('');
    const [customInstructions, setCustomInstructions] = useState('');
    const [stepCount, setStepCount] = useState(4);
    const [tone, setTone] = useState<'casual' | 'neutral' | 'professional' | 'direct'>('neutral');
    const [audience, setAudience] = useState('');
    const [generating, setGenerating] = useState(false);
    const [savingDraft, setSavingDraft] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<AiGenerateResultShape | null>(null);
    const [expanded, setExpanded] = useState<Set<number>>(new Set([0]));

    const handleGenerate = async () => {
        const urls = urlsRaw.split(/[\s,]+/).map(u => u.trim()).filter(Boolean);
        if (urls.length === 0) { setError('Paste at least one URL'); return; }
        if (urls.length > 5) { setError('At most 5 URLs per generation'); return; }

        setError(null);
        setGenerating(true);
        try {
            const data = await apiClient<AiGenerateResultShape>('/api/sequencer/sequences/generate', {
                method: 'POST',
                body: JSON.stringify({ urls, customInstructions, stepCount, tone, audience }),
            });
            setResult(data);
            setExpanded(new Set([0]));
        } catch (err) {
            setError((err as Error)?.message || 'Generation failed');
        } finally {
            setGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!result) return;
        setSavingDraft(true);
        try {
            const urls = urlsRaw.split(/[\s,]+/).map(u => u.trim()).filter(Boolean);
            const created = await apiClient<SequenceFull>('/api/sequencer/sequences', {
                method: 'POST',
                body: JSON.stringify({
                    name: result.name,
                    description: result.description,
                    category: 'general',
                    steps: result.steps,
                    ai_source_urls: urls,
                    ai_custom_instructions: customInstructions || null,
                    ai_model_used: result.modelUsed,
                }),
            });
            toast.success('Sequence saved - opening editor');
            onCreated(created.id);
        } catch (err) {
            setError((err as Error)?.message || 'Failed to save sequence');
        } finally {
            setSavingDraft(false);
        }
    };

    const toggleExpand = (i: number) => {
        const next = new Set(expanded);
        if (next.has(i)) next.delete(i); else next.add(i);
        setExpanded(next);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-5 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <Wand2 size={16} className="text-indigo-600" />
                        <div>
                            <h2 className="text-base font-bold text-gray-900 m-0">Generate sequence with AI</h2>
                            <p className="text-[11px] text-gray-500 m-0 mt-0.5">Paste your URLs + custom instructions. AI scrapes the pages and drafts a multi-step sequence.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 bg-transparent border-none cursor-pointer p-1">
                        <XIcon size={18} />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
                    {!result ? (
                        <>
                            <div>
                                <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">URLs (one per line, up to 5)</label>
                                <textarea
                                    value={urlsRaw}
                                    onChange={(e) => setUrlsRaw(e.target.value)}
                                    placeholder={'https://yourcompany.com\nhttps://yourcompany.com/pricing\nhttps://case-study-url'}
                                    rows={4}
                                    className="w-full px-3 py-2 text-xs rounded-lg outline-none font-mono"
                                    style={{ border: '1px solid #D1CBC5' }}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Custom instructions (optional)</label>
                                <textarea
                                    value={customInstructions}
                                    onChange={(e) => setCustomInstructions(e.target.value)}
                                    placeholder='e.g. "Focus on SOC-2 compliance buyers. Keep emails short. Mention our integrations with Salesforce."'
                                    rows={3}
                                    className="w-full px-3 py-2 text-xs rounded-lg outline-none"
                                    style={{ border: '1px solid #D1CBC5' }}
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Steps</label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={10}
                                        value={stepCount}
                                        onChange={(e) => setStepCount(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                                        className="w-full px-3 py-1.5 text-xs rounded-lg outline-none"
                                        style={{ border: '1px solid #D1CBC5' }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Tone</label>
                                    <select
                                        value={tone}
                                        onChange={(e) => setTone(e.target.value as 'casual' | 'neutral' | 'professional' | 'direct')}
                                        className="w-full px-3 py-1.5 text-xs rounded-lg outline-none bg-white"
                                        style={{ border: '1px solid #D1CBC5' }}
                                    >
                                        <option value="casual">Casual</option>
                                        <option value="neutral">Neutral</option>
                                        <option value="professional">Professional</option>
                                        <option value="direct">Direct</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Audience (optional)</label>
                                    <input
                                        type="text"
                                        value={audience}
                                        onChange={(e) => setAudience(e.target.value)}
                                        placeholder="e.g. CTOs at Series B SaaS"
                                        className="w-full px-3 py-1.5 text-xs rounded-lg outline-none"
                                        style={{ border: '1px solid #D1CBC5' }}
                                    />
                                </div>
                            </div>
                            {error && <div className="text-xs text-red-700">{error}</div>}
                        </>
                    ) : (
                        <>
                            <div>
                                <div className="text-xs font-bold text-gray-900">{result.name}</div>
                                <div className="text-[11px] text-gray-500 mt-0.5">{result.description}</div>
                                <div className="mt-2 flex items-center gap-2 flex-wrap">
                                    {result.sources.map(s => (
                                        <span
                                            key={s.url}
                                            className="text-[9px] font-mono px-1.5 py-0.5 rounded inline-flex items-center gap-1"
                                            style={{
                                                background: s.ok ? '#D1FAE5' : '#FEE2E2',
                                                color: s.ok ? '#065F46' : '#7F1D1D',
                                            }}
                                            title={s.error || ''}
                                        >
                                            {s.ok ? '✓' : '×'} {s.url}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                {result.steps.map((s, i) => {
                                    const isOpen = expanded.has(i);
                                    return (
                                        <div key={i} className="rounded-lg" style={{ border: '1px solid #E8E3DC' }}>
                                            <button
                                                onClick={() => toggleExpand(i)}
                                                className="w-full text-left px-3 py-2 flex items-center gap-2 cursor-pointer bg-white hover:bg-gray-50 border-none"
                                            >
                                                {isOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                                                <span className="text-[10px] font-bold text-gray-500">STEP {s.step_number}</span>
                                                <span className="text-xs font-semibold text-gray-900 truncate flex-1">{s.subject}</span>
                                                <span className="text-[10px] text-gray-400 tabular-nums shrink-0">
                                                    {s.step_number === 1 ? 'Day 1' : `+${s.delay_days}d`}
                                                </span>
                                            </button>
                                            {isOpen && (
                                                <div className="px-3 pb-3 border-t border-gray-100">
                                                    {s.preheader && (
                                                        <div className="text-[10px] text-gray-500 italic mt-2">Preheader: {s.preheader}</div>
                                                    )}
                                                    <div
                                                        className="mt-2 text-xs text-gray-800 leading-relaxed"
                                                        dangerouslySetInnerHTML={{ __html: s.body_html }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            {error && <div className="text-xs text-red-700">{error}</div>}
                        </>
                    )}
                </div>

                <footer className="border-t border-gray-100 p-4 flex items-center justify-between gap-3">
                    {!result ? (
                        <>
                            <button
                                onClick={onClose}
                                className="text-xs text-gray-700 hover:text-gray-900 bg-transparent border-none cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleGenerate}
                                disabled={generating || !urlsRaw.trim()}
                                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer border-none disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                            >
                                {generating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                {generating ? 'Generating…' : 'Generate'}
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setResult(null)}
                                className="text-xs text-gray-700 hover:text-gray-900 bg-transparent border-none cursor-pointer"
                            >
                                ← Try again
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={savingDraft}
                                className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer border-none disabled:opacity-50"
                            >
                                {savingDraft ? <Loader2 size={12} className="animate-spin" /> : null}
                                {savingDraft ? 'Saving…' : 'Save & open in editor'}
                            </button>
                        </>
                    )}
                </footer>
            </div>
        </div>
    );
}

// Used elsewhere - re-exported sentinel so the templates page typings line up.
export type { SequenceSummary };

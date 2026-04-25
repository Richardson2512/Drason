'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit3, Trash2, Copy, FileText, PenLine, Star, Loader2, Sparkles, X, Save, CheckCircle2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { apiClient } from '@/lib/api';
import CustomSelect from '@/components/ui/CustomSelect';
import AIAssistPanel from '@/components/sequencer/AIAssistPanel';

const RichTextEditor = dynamic(() => import('@/components/sequencer/RichTextEditor'), { ssr: false });

// ============================================================================
// TYPES
// ============================================================================

interface Template {
    id: string;
    name: string;
    subject: string;
    body_html: string;
    category: string;
    created_at: string;
}

interface Signature {
    id: string;
    name: string;
    html_content: string;
    is_default: boolean;
    created_at: string;
    updated_at: string;
}

type EditorMode =
    | { kind: 'none' }
    | { kind: 'template'; editing: Template | null }
    | { kind: 'signature'; editing: Signature | null };

// ============================================================================
// PAGE
// ============================================================================

export default function TemplatesPage() {
    const [activeTab, setActiveTab] = useState<'templates' | 'signatures'>('templates');
    const [templates, setTemplates] = useState<Template[]>([]);
    const [signatures, setSignatures] = useState<Signature[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [categories, setCategories] = useState<string[]>(['general', 'introduction', 'follow-up', 'breakup', 'meeting', 'referral']);

    // Unified editor state — replaces the two modal popups.
    // `mode` drives which form is shown in the right split pane.
    const [mode, setMode] = useState<EditorMode>({ kind: 'none' });

    // Template form fields
    const [templateName, setTemplateName] = useState('');
    const [templateSubject, setTemplateSubject] = useState('');
    const [templateBody, setTemplateBody] = useState('');
    const [templateCategory, setTemplateCategory] = useState('general');
    const [showAiAssist, setShowAiAssist] = useState(false);

    // Signature form fields
    const [sigName, setSigName] = useState('');
    const [sigHtml, setSigHtml] = useState('');
    const [sigIsDefault, setSigIsDefault] = useState(false);

    const [saving, setSaving] = useState(false);
    const [savedFlash, setSavedFlash] = useState(false);

    // ─── Data ───────────────────────────────────────────────────────────

    const fetchTemplates = useCallback(async () => {
        try {
            const res = await apiClient<any>('/api/sequencer/templates');
            setTemplates(Array.isArray(res) ? res : (res?.templates || res?.data || []));
        } catch { setTemplates([]); }
    }, []);

    const fetchSignatures = useCallback(async () => {
        try {
            const res = await apiClient<any>('/api/sequencer/signatures');
            setSignatures(Array.isArray(res) ? res : (res?.signatures || res?.data || []));
        } catch { setSignatures([]); }
    }, []);

    useEffect(() => {
        (async () => {
            await Promise.all([fetchTemplates(), fetchSignatures()]);
            setLoading(false);
        })();
        apiClient<any>('/api/sequencer/templates/categories')
            .then(res => {
                const list = Array.isArray(res) ? res : (res?.categories || res?.data || []);
                if (Array.isArray(list) && list.length > 0) setCategories(list);
            })
            .catch(() => { /* keep fallback */ });
    }, [fetchTemplates, fetchSignatures]);

    // Esc closes the editor pane, giving the list back its full width.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && mode.kind !== 'none') {
                closeEditor();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [mode]);

    // ─── Editor control ─────────────────────────────────────────────────

    const resetTemplateForm = () => {
        setTemplateName('');
        setTemplateSubject('');
        setTemplateBody('');
        setTemplateCategory('general');
        setShowAiAssist(false);
    };

    const resetSignatureForm = () => {
        setSigName('');
        setSigHtml('');
        setSigIsDefault(false);
    };

    const openTemplateEditor = (t: Template | null) => {
        if (t) {
            setTemplateName(t.name);
            setTemplateSubject(t.subject);
            setTemplateBody(t.body_html);
            setTemplateCategory(t.category);
        } else {
            resetTemplateForm();
        }
        setShowAiAssist(false);
        setMode({ kind: 'template', editing: t });
    };

    const openSignatureEditor = (s: Signature | null) => {
        if (s) {
            setSigName(s.name);
            setSigHtml(s.html_content);
            setSigIsDefault(s.is_default);
        } else {
            resetSignatureForm();
            setSigIsDefault(signatures.length === 0);
        }
        setMode({ kind: 'signature', editing: s });
    };

    const closeEditor = () => {
        setMode({ kind: 'none' });
        setSavedFlash(false);
    };

    const flashSaved = () => {
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 1800);
    };

    // ─── Save / delete ──────────────────────────────────────────────────

    const saveTemplate = async () => {
        if (!templateName.trim() || !templateSubject.trim() || mode.kind !== 'template') return;
        setSaving(true);
        try {
            const body = { name: templateName, subject: templateSubject, body_html: templateBody, category: templateCategory };
            if (mode.editing) {
                await apiClient(`/api/sequencer/templates/${mode.editing.id}`, { method: 'PATCH', body: JSON.stringify(body) });
            } else {
                await apiClient('/api/sequencer/templates', { method: 'POST', body: JSON.stringify(body) });
            }
            await fetchTemplates();
            flashSaved();
            if (!mode.editing) closeEditor(); // close after creation, keep open after edit
        } catch { /* toast */ }
        finally { setSaving(false); }
    };

    const saveSignature = async () => {
        if (!sigName.trim() || !sigHtml.trim() || mode.kind !== 'signature') return;
        setSaving(true);
        try {
            const body = { name: sigName.trim(), html_content: sigHtml, is_default: sigIsDefault };
            if (mode.editing) {
                await apiClient(`/api/sequencer/signatures/${mode.editing.id}`, { method: 'PATCH', body: JSON.stringify(body) });
            } else {
                await apiClient('/api/sequencer/signatures', { method: 'POST', body: JSON.stringify(body) });
            }
            await fetchSignatures();
            flashSaved();
            if (!mode.editing) closeEditor();
        } catch { /* toast */ }
        finally { setSaving(false); }
    };

    const duplicateTemplate = async (t: Template) => {
        try {
            await apiClient(`/api/sequencer/templates/${t.id}/duplicate`, { method: 'POST' });
            await fetchTemplates();
        } catch { /* */ }
    };

    const deleteTemplate = async (id: string) => {
        try {
            await apiClient(`/api/sequencer/templates/${id}`, { method: 'DELETE' });
            await fetchTemplates();
            if (mode.kind === 'template' && mode.editing?.id === id) closeEditor();
        } catch { /* */ }
    };

    const deleteSignature = async (id: string) => {
        if (!confirm('Delete this signature?')) return;
        try {
            await apiClient(`/api/sequencer/signatures/${id}`, { method: 'DELETE' });
            await fetchSignatures();
            if (mode.kind === 'signature' && mode.editing?.id === id) closeEditor();
        } catch { /* */ }
    };

    const setDefaultSignature = async (sig: Signature) => {
        try {
            await apiClient(`/api/sequencer/signatures/${sig.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ is_default: true }),
            });
            await fetchSignatures();
        } catch { /* */ }
    };

    // ─── Filtering ──────────────────────────────────────────────────────

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const filteredSignatures = signatures.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // ─── Render ─────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="p-4 flex items-center justify-center h-64">
                <Loader2 size={20} className="animate-spin text-gray-400" />
            </div>
        );
    }

    const isEditing = mode.kind !== 'none';
    const selectedTemplateId = mode.kind === 'template' ? mode.editing?.id : null;
    const selectedSignatureId = mode.kind === 'signature' ? mode.editing?.id : null;

    const handleNew = () => {
        if (activeTab === 'templates') openTemplateEditor(null);
        else openSignatureEditor(null);
    };

    return (
        <div className="p-4 flex flex-col gap-3" style={{ minHeight: 'calc(100vh - 4rem)' }}>
            {/* ─── Header ─── */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Templates & Signatures</h1>
                    <p className="text-xs text-gray-500 mt-0.5">Reusable email templates and signatures for your campaigns</p>
                </div>
                <button
                    onClick={handleNew}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 cursor-pointer"
                >
                    <Plus size={13} /> New {activeTab === 'templates' ? 'Template' : 'Signature'}
                </button>
            </div>

            {/* ─── Tabs + Search ─── */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-0.5 p-0.5 bg-gray-100 rounded-xl w-fit">
                    {[
                        { key: 'templates', label: 'Templates', icon: <FileText size={13} strokeWidth={1.75} />, count: templates.length },
                        { key: 'signatures', label: 'Signatures', icon: <PenLine size={13} strokeWidth={1.75} />, count: signatures.length },
                    ].map(tab => {
                        const isActive = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => { setActiveTab(tab.key as 'templates' | 'signatures'); setSearchQuery(''); closeEditor(); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-semibold cursor-pointer transition-colors"
                                style={{
                                    background: isActive ? '#FFFFFF' : 'transparent',
                                    color: isActive ? '#111827' : '#6B7280',
                                    boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                                }}
                            >
                                {tab.icon}
                                {tab.label}
                                <span className="text-[10px] opacity-50">({tab.count})</span>
                            </button>
                        );
                    })}
                </div>

                <div className="relative">
                    <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder={`Search ${activeTab}...`}
                        className="w-[260px] pl-8 pr-3 py-1.5 rounded-lg text-xs outline-none bg-white"
                        style={{ border: '1px solid #D1CBC5' }}
                    />
                </div>
            </div>

            {/* ─── Body: list (left) + editor (right, when open) ─── */}
            <div className="flex gap-3 flex-1 min-h-0">
                {/* ═══ LIST ═══ */}
                <div className={isEditing ? 'w-[360px] shrink-0' : 'flex-1'}>
                    {activeTab === 'templates' && (
                        templates.length === 0 ? (
                            <EmptyState
                                icon={<FileText size={28} className="text-gray-300 mb-3" />}
                                title="No templates yet"
                                description="Create reusable email templates to speed up campaign creation. Templates can be inserted into any campaign step."
                                cta="Create First Template"
                                onCta={() => openTemplateEditor(null)}
                            />
                        ) : isEditing ? (
                            <CompactList
                                items={filteredTemplates}
                                renderItem={(t) => (
                                    <ListRow
                                        key={t.id}
                                        active={selectedTemplateId === t.id}
                                        onClick={() => openTemplateEditor(t)}
                                        title={t.name}
                                        subtitle={t.subject}
                                        meta={<span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 capitalize">{t.category}</span>}
                                        onDelete={() => deleteTemplate(t.id)}
                                        onDuplicate={() => duplicateTemplate(t)}
                                    />
                                )}
                                emptyText="No templates match your search"
                            />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                {filteredTemplates.map(t => (
                                    <TemplateCard
                                        key={t.id}
                                        template={t}
                                        onEdit={() => openTemplateEditor(t)}
                                        onDuplicate={() => duplicateTemplate(t)}
                                        onDelete={() => deleteTemplate(t.id)}
                                    />
                                ))}
                            </div>
                        )
                    )}

                    {activeTab === 'signatures' && (
                        signatures.length === 0 ? (
                            <EmptyState
                                icon={<PenLine size={28} className="text-gray-300 mb-3" />}
                                title="No signatures yet"
                                description="Create reusable email signatures with logo, links, and contact info. Insert them into any email with one click."
                                cta="Create First Signature"
                                onCta={() => openSignatureEditor(null)}
                            />
                        ) : isEditing ? (
                            <CompactList
                                items={filteredSignatures}
                                renderItem={(s) => (
                                    <ListRow
                                        key={s.id}
                                        active={selectedSignatureId === s.id}
                                        onClick={() => openSignatureEditor(s)}
                                        title={s.name}
                                        subtitle={s.html_content.replace(/<[^>]*>/g, '').slice(0, 60)}
                                        meta={s.is_default ? <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">DEFAULT</span> : null}
                                        onDelete={() => deleteSignature(s.id)}
                                    />
                                )}
                                emptyText="No signatures match your search"
                            />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                {filteredSignatures.map(s => (
                                    <SignatureCard
                                        key={s.id}
                                        signature={s}
                                        onEdit={() => openSignatureEditor(s)}
                                        onDelete={() => deleteSignature(s.id)}
                                        onSetDefault={() => setDefaultSignature(s)}
                                    />
                                ))}
                            </div>
                        )
                    )}
                </div>

                {/* ═══ EDITOR PANE ═══ */}
                {isEditing && (
                    <div className="flex-1 min-w-0 bg-white flex flex-col rounded-xl overflow-hidden" style={{ border: '1px solid #D1CBC5' }}>
                        <div className="px-4 py-3 flex items-center justify-between shrink-0" style={{ borderBottom: '1px solid #D1CBC5' }}>
                            <div className="flex items-center gap-2">
                                {mode.kind === 'template' ? <FileText size={14} strokeWidth={1.75} className="text-gray-600" /> : <PenLine size={14} strokeWidth={1.75} className="text-gray-600" />}
                                <h2 className="text-sm font-semibold text-gray-900">
                                    {mode.kind === 'template'
                                        ? (mode.editing ? 'Edit Template' : 'New Template')
                                        : (mode.editing ? 'Edit Signature' : 'New Signature')}
                                </h2>
                                {savedFlash && (
                                    <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md" style={{ border: '1px solid #BBF7D0' }}>
                                        <CheckCircle2 size={10} /> Saved
                                    </span>
                                )}
                            </div>
                            <button onClick={closeEditor} className="p-1 rounded-md hover:bg-gray-100 cursor-pointer text-gray-500 hover:text-gray-900" title="Close (Esc)">
                                <X size={14} />
                            </button>
                        </div>

                        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide p-4">
                            {mode.kind === 'template' && (
                                <div className="flex flex-col gap-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <Field label="Template Name">
                                            <input
                                                type="text"
                                                value={templateName}
                                                onChange={e => setTemplateName(e.target.value)}
                                                placeholder="e.g. Cold Intro - SaaS"
                                                className="w-full px-3 py-1.5 text-xs outline-none"
                                                style={{ border: '1px solid #D1CBC5' }}
                                                autoFocus
                                            />
                                        </Field>
                                        <Field label="Category">
                                            <CustomSelect
                                                value={templateCategory}
                                                onChange={setTemplateCategory}
                                                options={categories.map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))}
                                            />
                                        </Field>
                                    </div>

                                    <Field label="Subject Line">
                                        <input
                                            type="text"
                                            value={templateSubject}
                                            onChange={e => setTemplateSubject(e.target.value)}
                                            placeholder="e.g. Quick question about {{company}}"
                                            className="w-full px-3 py-1.5 rounded-lg text-xs outline-none"
                                            style={{ border: '1px solid #D1CBC5' }}
                                        />
                                    </Field>

                                    <div>
                                        <button
                                            onClick={() => setShowAiAssist(v => !v)}
                                            className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 cursor-pointer bg-transparent border-none p-0"
                                        >
                                            <Sparkles size={11} />
                                            {showAiAssist ? 'Hide AI assistant' : 'Write with AI'}
                                        </button>
                                        {showAiAssist && (
                                            <div className="mt-2">
                                                <AIAssistPanel
                                                    onInsert={(subject, body_html) => {
                                                        setTemplateSubject(subject);
                                                        setTemplateBody(body_html);
                                                        setShowAiAssist(false);
                                                    }}
                                                    defaultIntent="intro"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <Field label="Email Body">
                                        <RichTextEditor
                                            content={templateBody}
                                            onChange={setTemplateBody}
                                            placeholder="Write your template..."
                                            personalizationTokens={['first_name', 'last_name', 'full_name', 'company', 'website', 'email']}
                                            signatures={signatures}
                                        />
                                    </Field>
                                </div>
                            )}

                            {mode.kind === 'signature' && (
                                <div className="flex flex-col gap-3">
                                    <Field label="Signature Name">
                                        <input
                                            type="text"
                                            value={sigName}
                                            onChange={e => setSigName(e.target.value)}
                                            placeholder="e.g. Primary, Sales, Support"
                                            className="w-full px-3 py-1.5 rounded-lg text-xs outline-none"
                                            style={{ border: '1px solid #D1CBC5' }}
                                            autoFocus
                                        />
                                    </Field>

                                    <Field label="Signature Content" helper="Click the image icon in the toolbar to add a logo or photo (max 2MB).">
                                        <RichTextEditor
                                            content={sigHtml}
                                            onChange={setSigHtml}
                                            placeholder="Name, title, company, contact info..."
                                            enableImages
                                        />
                                    </Field>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={sigIsDefault} onChange={e => setSigIsDefault(e.target.checked)} className="w-3.5 h-3.5 accent-gray-900" />
                                        <span className="text-xs text-gray-700">Set as default signature</span>
                                    </label>
                                </div>
                            )}
                        </div>

                        <div className="px-4 py-3 flex items-center justify-between shrink-0 bg-gray-50" style={{ borderTop: '1px solid #D1CBC5' }}>
                            <div className="text-[10px] text-gray-400">
                                Press <kbd className="px-1.5 py-0.5 bg-white border rounded text-[10px] font-mono" style={{ borderColor: '#D1CBC5' }}>Esc</kbd> to close
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={closeEditor} className="px-4 py-1.5 rounded-lg text-xs text-gray-700 hover:bg-white cursor-pointer" style={{ border: '1px solid #D1CBC5' }}>
                                    Cancel
                                </button>
                                <button
                                    onClick={mode.kind === 'template' ? saveTemplate : saveSignature}
                                    disabled={
                                        saving ||
                                        (mode.kind === 'template' && (!templateName.trim() || !templateSubject.trim())) ||
                                        (mode.kind === 'signature' && (!sigName.trim() || !sigHtml.trim()))
                                    }
                                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-semibold cursor-pointer hover:bg-gray-800 disabled:opacity-30"
                                >
                                    {saving ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />}
                                    {saving ? 'Saving...' : (mode.kind === 'template'
                                        ? (mode.editing ? 'Save Changes' : 'Create Template')
                                        : (mode.editing ? 'Save Changes' : 'Create Signature'))}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================================================
// PRESENTATIONAL PRIMITIVES
// ============================================================================

function Field({ label, helper, children }: { label: string; helper?: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</label>
            {children}
            {helper && <p className="text-[10px] text-gray-400 mt-1">{helper}</p>}
        </div>
    );
}

function EmptyState({ icon, title, description, cta, onCta }: { icon: React.ReactNode; title: string; description: string; cta: string; onCta: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl" style={{ border: '1px solid #D1CBC5' }}>
            {icon}
            <h2 className="text-sm font-bold text-gray-900 mb-1">{title}</h2>
            <p className="text-xs text-gray-500 text-center max-w-md mb-4">{description}</p>
            <button onClick={onCta} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 cursor-pointer">
                <Plus size={13} /> {cta}
            </button>
        </div>
    );
}

function CompactList<T>({ items, renderItem, emptyText }: { items: T[]; renderItem: (item: T) => React.ReactNode; emptyText: string }) {
    if (items.length === 0) {
        return <div className="text-xs text-gray-400 text-center py-8 bg-white h-full flex items-center justify-center rounded-xl" style={{ border: '1px solid #D1CBC5' }}>{emptyText}</div>;
    }
    return (
        <div className="bg-white h-full flex flex-col rounded-xl overflow-hidden" style={{ border: '1px solid #D1CBC5' }}>
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
                {items.map(item => renderItem(item))}
            </div>
        </div>
    );
}

function ListRow({ active, onClick, title, subtitle, meta, onDelete, onDuplicate }: {
    active: boolean;
    onClick: () => void;
    title: string;
    subtitle: string;
    meta?: React.ReactNode;
    onDelete?: () => void;
    onDuplicate?: () => void;
}) {
    return (
        <div
            className="flex items-start gap-2 px-3 py-2.5 cursor-pointer transition-colors"
            style={{
                background: active ? '#F5F1EA' : 'transparent',
                borderBottom: '1px solid #F0EBE3',
                borderLeft: active ? '3px solid #1C4532' : '3px solid transparent',
            }}
            onClick={onClick}
        >
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-gray-900 truncate">{title}</span>
                    {meta}
                </div>
                <div className="text-[10px] text-gray-500 truncate mt-0.5">{subtitle || '—'}</div>
            </div>
            <div className="flex items-center gap-0.5 shrink-0" onClick={e => e.stopPropagation()}>
                {onDuplicate && (
                    <button onClick={onDuplicate} className="p-1 rounded-md hover:bg-gray-100 cursor-pointer" title="Duplicate">
                        <Copy size={11} className="text-gray-400" />
                    </button>
                )}
                {onDelete && (
                    <button onClick={onDelete} className="p-1 rounded-md hover:bg-red-50 cursor-pointer" title="Delete">
                        <Trash2 size={11} className="text-red-400" />
                    </button>
                )}
            </div>
        </div>
    );
}

function TemplateCard({ template, onEdit, onDuplicate, onDelete }: {
    template: Template;
    onEdit: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
}) {
    return (
        <button onClick={onEdit} className="text-left flex flex-col cursor-pointer transition-colors bg-white hover:bg-[#FAF7F1] p-3 rounded-xl" style={{ border: '1px solid #D1CBC5' }}>
            <div className="flex items-start justify-between mb-2">
                <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-bold text-gray-900 truncate">{template.name}</h3>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 capitalize mt-1 inline-block">{template.category}</span>
                </div>
                <div className="flex items-center gap-0.5 shrink-0" onClick={e => e.stopPropagation()}>
                    <button onClick={onDuplicate} className="p-1 rounded-md hover:bg-gray-100 cursor-pointer" title="Duplicate"><Copy size={11} className="text-gray-400" /></button>
                    <button onClick={onDelete} className="p-1 rounded-md hover:bg-red-50 cursor-pointer" title="Delete"><Trash2 size={11} className="text-red-400" /></button>
                </div>
            </div>
            <div className="text-[10px] text-gray-700 font-medium mb-1 truncate">Subject: {template.subject}</div>
            <div className="text-[10px] text-gray-400 line-clamp-3 flex-1" dangerouslySetInnerHTML={{ __html: template.body_html.replace(/<[^>]*>/g, '').slice(0, 150) }} />
            <div className="text-[9px] text-gray-300 mt-2 flex items-center gap-1">
                <Edit3 size={9} /> Click to edit · {new Date(template.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
        </button>
    );
}

function SignatureCard({ signature, onEdit, onDelete, onSetDefault }: {
    signature: Signature;
    onEdit: () => void;
    onDelete: () => void;
    onSetDefault: () => void;
}) {
    return (
        <button onClick={onEdit} className="text-left flex flex-col cursor-pointer transition-colors bg-white hover:bg-[#FAF7F1] p-3 rounded-xl" style={{ border: '1px solid #D1CBC5' }}>
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <h3 className="text-xs font-bold text-gray-900 truncate">{signature.name}</h3>
                    {signature.is_default && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold shrink-0">DEFAULT</span>}
                </div>
                <div className="flex items-center gap-0.5 shrink-0" onClick={e => e.stopPropagation()}>
                    {!signature.is_default && (
                        <button onClick={onSetDefault} className="p-1 rounded-md hover:bg-amber-50 cursor-pointer" title="Set as default"><Star size={11} className="text-amber-400" /></button>
                    )}
                    <button onClick={onDelete} className="p-1 rounded-md hover:bg-red-50 cursor-pointer" title="Delete"><Trash2 size={11} className="text-red-400" /></button>
                </div>
            </div>
            <div className="text-[10px] text-gray-600 flex-1 overflow-hidden pt-2 mt-1 max-h-[120px]" style={{ borderTop: '1px solid #F0EBE3' }} dangerouslySetInnerHTML={{ __html: signature.html_content }} />
            <div className="text-[9px] text-gray-300 mt-2 flex items-center gap-1">
                <Edit3 size={9} /> Click to edit · {new Date(signature.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
        </button>
    );
}

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Search, Edit3, Trash2, Copy, FileText, PenLine, Star, Loader2, Sparkles, X, Save, CheckCircle2, Eye, Folder, FolderPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { apiClient } from '@/lib/api';
import CustomSelect from '@/components/ui/CustomSelect';
import AIAssistPanel from '@/components/sequencer/AIAssistPanel';
import RecipientPreviewPanel from '@/components/sequencer/RecipientPreviewPanel';

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
    folder_id?: string | null;
    created_at: string;
}

interface FolderItem {
    id: string;
    name: string;
    count: number;
}

// 'all' = show every template; 'uncategorized' = templates with folder_id=null;
// any other string = folder id.
type FolderSelection = 'all' | 'uncategorized' | string;

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
    const [templateFolderId, setTemplateFolderId] = useState<string | null>(null);
    const [showAiAssist, setShowAiAssist] = useState(false);

    // Folders
    const [folders, setFolders] = useState<FolderItem[]>([]);
    const [uncategorizedCount, setUncategorizedCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [activeFolder, setActiveFolder] = useState<FolderSelection>('all');
    const [showNewFolderInput, setShowNewFolderInput] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const newFolderInputRef = useRef<HTMLInputElement>(null);

    // Bulk-select state for "move to folder" action.
    const [selectedTemplateIds, setSelectedTemplateIds] = useState<Set<string>>(new Set());
    const [movingToFolder, setMovingToFolder] = useState(false);
    const [showMoveMenu, setShowMoveMenu] = useState(false);
    const moveMenuRef = useRef<HTMLDivElement>(null);

    // Folder delete confirmation — replaces native confirm() so the prompt
    // actually appears (Chrome/Safari silently swallow it on some sites).
    const [pendingDeleteFolder, setPendingDeleteFolder] = useState<{ id: string; name: string; count: number } | null>(null);
    const [deletingFolder, setDeletingFolder] = useState(false);

    // Signature form fields
    const [sigName, setSigName] = useState('');
    const [sigHtml, setSigHtml] = useState('');
    const [sigIsDefault, setSigIsDefault] = useState(false);

    const [saving, setSaving] = useState(false);
    const [savedFlash, setSavedFlash] = useState(false);

    // Recipient-preview modal — opened from any template card or list row.
    // Shows the template rendered exactly as it would appear in the prospect's
    // inbox. Read-only; doesn't replace the editor.
    const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
    useEffect(() => {
        if (!previewTemplate) return;
        // Tells DashboardShell to collapse the sidebar so the preview gets
        // full canvas. Same convention used by the campaign detail page.
        window.dispatchEvent(new Event('recipient-preview-open'));
        return () => {
            window.dispatchEvent(new Event('recipient-preview-close'));
        };
    }, [previewTemplate]);

    // ─── Data ───────────────────────────────────────────────────────────

    // Note: caller MUST pass the folder explicitly. Earlier this defaulted to
    // `activeFolder` and listed the state in useCallback deps — but that made
    // the function identity change every time the folder did, which then
    // triggered the init useEffect (which depends on this callback) and
    // silently re-fetched with 'all', blowing away the user's folder filter.
    const fetchTemplates = useCallback(async (folder: FolderSelection) => {
        try {
            const url = folder === 'all'
                ? '/api/sequencer/templates'
                : `/api/sequencer/templates?folder=${encodeURIComponent(folder)}`;
            const res = await apiClient<any>(url);
            setTemplates(Array.isArray(res) ? res : (res?.templates || res?.data || []));
        } catch { setTemplates([]); }
    }, []);

    const fetchFolders = useCallback(async () => {
        try {
            const res = await apiClient<any>('/api/sequencer/template-folders');
            setFolders(res?.folders || []);
            setUncategorizedCount(res?.uncategorized_count || 0);
            setTotalCount(res?.total_count || 0);
        } catch { /* keep prior state */ }
    }, []);

    const fetchSignatures = useCallback(async () => {
        try {
            const res = await apiClient<any>('/api/sequencer/signatures');
            setSignatures(Array.isArray(res) ? res : (res?.signatures || res?.data || []));
        } catch { setSignatures([]); }
    }, []);

    useEffect(() => {
        (async () => {
            await Promise.all([fetchTemplates('all'), fetchSignatures(), fetchFolders()]);
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
        // When creating from inside a folder view, pre-select that folder so
        // the new template lands where the operator was browsing.
        setTemplateFolderId(activeFolder === 'all' || activeFolder === 'uncategorized' ? null : activeFolder);
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
            setTemplateFolderId(t.folder_id ?? null);
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
            // Backend templateController takes camelCase on input (bodyHtml /
            // bodyText) even though list responses return snake_case body_html
            // straight from Prisma. Don't 'normalize' this without checking
            // the controller — silently drops the body update if mismatched.
            const body = {
                name: templateName,
                subject: templateSubject,
                bodyHtml: templateBody,
                category: templateCategory,
                folder_id: templateFolderId,
            };
            if (mode.editing) {
                await apiClient(`/api/sequencer/templates/${mode.editing.id}`, { method: 'PATCH', body: JSON.stringify(body) });
            } else {
                await apiClient('/api/sequencer/templates', { method: 'POST', body: JSON.stringify(body) });
            }
            await Promise.all([fetchTemplates(activeFolder), fetchFolders()]);
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
            await Promise.all([fetchTemplates(activeFolder), fetchFolders()]);
        } catch { /* */ }
    };

    const deleteTemplate = async (id: string) => {
        try {
            await apiClient(`/api/sequencer/templates/${id}`, { method: 'DELETE' });
            await Promise.all([fetchTemplates(activeFolder), fetchFolders()]);
            if (mode.kind === 'template' && mode.editing?.id === id) closeEditor();
        } catch { /* */ }
    };

    // ─── Bulk-select + bulk move ───────────────────────────────────────

    const toggleSelectTemplate = (id: string) => {
        setSelectedTemplateIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const clearSelection = () => setSelectedTemplateIds(new Set());

    const moveSelectedToFolder = async (folderId: string | null) => {
        if (selectedTemplateIds.size === 0) return;
        setMovingToFolder(true);
        setShowMoveMenu(false);
        try {
            await Promise.all(
                Array.from(selectedTemplateIds).map(id =>
                    apiClient(`/api/sequencer/templates/${id}`, {
                        method: 'PATCH',
                        body: JSON.stringify({ folder_id: folderId }),
                    })
                )
            );
            const targetName = folderId === null ? 'Uncategorized' : (folders.find(f => f.id === folderId)?.name || 'folder');
            toast.success(`Moved ${selectedTemplateIds.size} template${selectedTemplateIds.size === 1 ? '' : 's'} to ${targetName}`);
            clearSelection();
            await Promise.all([fetchTemplates(activeFolder), fetchFolders()]);
        } catch { /* auto-toast */ }
        finally { setMovingToFolder(false); }
    };

    useEffect(() => {
        if (!showMoveMenu) return;
        const handler = (e: MouseEvent) => {
            if (moveMenuRef.current && !moveMenuRef.current.contains(e.target as Node)) {
                setShowMoveMenu(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showMoveMenu]);

    // Switching folder views or tabs clears any in-progress selection so it
    // doesn't silently carry across to templates the user can no longer see.
    useEffect(() => { clearSelection(); }, [activeFolder, activeTab]);

    // ─── Folder ops ─────────────────────────────────────────────────────

    const selectFolder = async (sel: FolderSelection) => {
        setActiveFolder(sel);
        await fetchTemplates(sel);
    };

    const createFolder = async () => {
        const name = newFolderName.trim();
        if (!name) return;
        try {
            const res = await apiClient<any>('/api/sequencer/template-folders', {
                method: 'POST',
                body: JSON.stringify({ name }),
            });
            await fetchFolders();
            setNewFolderName('');
            setShowNewFolderInput(false);
            // Auto-switch to the new folder so the operator sees it.
            if (res?.folder?.id) await selectFolder(res.folder.id);
        } catch { /* auto-toast */ }
    };

    const requestDeleteFolder = (id: string, name: string) => {
        const count = folders.find(f => f.id === id)?.count ?? 0;
        setPendingDeleteFolder({ id, name, count });
    };

    const confirmDeleteFolder = async () => {
        if (!pendingDeleteFolder || deletingFolder) return;
        const { id, name } = pendingDeleteFolder;
        setDeletingFolder(true);
        try {
            await apiClient(`/api/sequencer/template-folders/${id}`, { method: 'DELETE' });
            await Promise.all([fetchFolders(), fetchTemplates(activeFolder === id ? 'all' : activeFolder)]);
            if (activeFolder === id) setActiveFolder('all');
            toast.success(`Folder "${name}" deleted`);
            setPendingDeleteFolder(null);
        } catch { /* auto-toast */ }
        finally { setDeletingFolder(false); }
    };

    useEffect(() => {
        if (showNewFolderInput && newFolderInputRef.current) {
            newFolderInputRef.current.focus();
        }
    }, [showNewFolderInput]);

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

            {/* ─── Folder pills (templates tab only) ─── */}
            {activeTab === 'templates' && (
                <div className="flex items-center gap-1.5 flex-wrap">
                    <FolderPill
                        active={activeFolder === 'all'}
                        onClick={() => selectFolder('all')}
                        label="All"
                        count={totalCount}
                    />
                    <FolderPill
                        active={activeFolder === 'uncategorized'}
                        onClick={() => selectFolder('uncategorized')}
                        label="Uncategorized"
                        count={uncategorizedCount}
                    />
                    {folders.map(f => (
                        <FolderPill
                            key={f.id}
                            active={activeFolder === f.id}
                            onClick={() => selectFolder(f.id)}
                            label={f.name}
                            count={f.count}
                            onDelete={() => requestDeleteFolder(f.id, f.name)}
                            withFolderIcon
                        />
                    ))}
                    {showNewFolderInput ? (
                        <div className="flex items-center gap-1">
                            <input
                                ref={newFolderInputRef}
                                type="text"
                                value={newFolderName}
                                onChange={e => setNewFolderName(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') createFolder();
                                    else if (e.key === 'Escape') { setShowNewFolderInput(false); setNewFolderName(''); }
                                }}
                                onBlur={() => { if (!newFolderName.trim()) { setShowNewFolderInput(false); } }}
                                placeholder="Folder name"
                                className="px-2 py-1 text-[11px] rounded-md outline-none"
                                style={{ border: '1px solid #D1CBC5' }}
                            />
                            <button
                                onClick={createFolder}
                                className="px-2 py-1 text-[11px] font-semibold bg-gray-900 text-white rounded-md hover:bg-gray-800"
                            >
                                Add
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowNewFolderInput(true)}
                            className="flex items-center gap-1 px-2.5 py-1 text-[11px] text-gray-600 rounded-full hover:bg-gray-50 cursor-pointer"
                            style={{ border: '1px dashed #D1CBC5' }}
                            title="Create folder"
                        >
                            <FolderPlus size={11} /> New folder
                        </button>
                    )}
                </div>
            )}

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
                                        onPreview={() => setPreviewTemplate(t)}
                                    />
                                )}
                                emptyText="No templates match your search"
                            />
                        ) : (
                            <>
                            {selectedTemplateIds.size > 0 && (
                                <div
                                    className="flex items-center gap-2 px-3 py-2 mb-3 rounded-lg bg-gray-900 text-white"
                                >
                                    <span className="text-xs font-semibold">
                                        {selectedTemplateIds.size} selected
                                    </span>
                                    <div ref={moveMenuRef} className="relative ml-auto">
                                        <button
                                            type="button"
                                            onClick={() => setShowMoveMenu(v => !v)}
                                            disabled={movingToFolder}
                                            className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold bg-white text-gray-900 rounded-md hover:bg-gray-100 disabled:opacity-50"
                                        >
                                            {movingToFolder ? <Loader2 size={11} className="animate-spin" /> : <Folder size={11} />}
                                            Move to folder
                                        </button>
                                        {showMoveMenu && (
                                            <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg z-50 max-h-72 overflow-y-auto" style={{ border: '1px solid #D1CBC5' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => moveSelectedToFolder(null)}
                                                    className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 cursor-pointer text-gray-900"
                                                >
                                                    Uncategorized
                                                </button>
                                                {folders.length > 0 && (
                                                    <div className="px-3 py-1 text-[10px] font-semibold text-gray-400 uppercase" style={{ borderTop: '1px solid #E8E3DC' }}>
                                                        Folders
                                                    </div>
                                                )}
                                                {folders.map(f => (
                                                    <button
                                                        key={f.id}
                                                        type="button"
                                                        onClick={() => moveSelectedToFolder(f.id)}
                                                        className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 cursor-pointer text-gray-900 flex items-center gap-2"
                                                    >
                                                        <Folder size={10} className="text-gray-400" />
                                                        {f.name}
                                                        <span className="ml-auto text-[10px] text-gray-400">({f.count})</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={clearSelection}
                                        className="text-[11px] text-gray-300 hover:text-white"
                                    >
                                        Clear
                                    </button>
                                </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                {filteredTemplates.map(t => (
                                    <TemplateCard
                                        key={t.id}
                                        template={t}
                                        onEdit={() => openTemplateEditor(t)}
                                        onDuplicate={() => duplicateTemplate(t)}
                                        onDelete={() => deleteTemplate(t.id)}
                                        onPreview={() => setPreviewTemplate(t)}
                                        selected={selectedTemplateIds.has(t.id)}
                                        onToggleSelect={() => toggleSelectTemplate(t.id)}
                                    />
                                ))}
                            </div>
                            </>
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

                                    <Field label="Folder">
                                        <CustomSelect
                                            value={templateFolderId || ''}
                                            onChange={(v) => setTemplateFolderId(v || null)}
                                            options={[
                                                { value: '', label: 'Uncategorized' },
                                                ...folders.map(f => ({ value: f.id, label: f.name })),
                                            ]}
                                        />
                                    </Field>

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

            {/* ─── Delete folder confirmation ───────────────────────────── */}
            {pendingDeleteFolder && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-[9999] p-4"
                    onClick={(e) => { if (e.target === e.currentTarget && !deletingFolder) setPendingDeleteFolder(null); }}
                >
                    <div className="bg-white rounded-xl w-full max-w-md" style={{ border: '1px solid #D1CBC5' }}>
                        <div className="p-5">
                            <h3 className="text-sm font-bold text-gray-900 mb-2">
                                Delete folder &ldquo;{pendingDeleteFolder.name}&rdquo;?
                            </h3>
                            <p className="text-xs text-gray-600">
                                {pendingDeleteFolder.count === 0
                                    ? 'This folder is empty.'
                                    : `${pendingDeleteFolder.count} template${pendingDeleteFolder.count === 1 ? '' : 's'} will move to Uncategorized — none will be deleted.`}
                            </p>
                        </div>
                        <div className="flex justify-end gap-2 p-3" style={{ borderTop: '1px solid #E8E3DC', background: '#FAF7F1' }}>
                            <button
                                onClick={() => setPendingDeleteFolder(null)}
                                disabled={deletingFolder}
                                className="px-4 py-1.5 text-xs font-semibold text-gray-700 rounded-lg cursor-pointer hover:bg-white disabled:opacity-50"
                                style={{ border: '1px solid #D1CBC5' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteFolder}
                                disabled={deletingFolder}
                                className="flex items-center gap-1.5 px-4 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg cursor-pointer hover:bg-red-700 disabled:opacity-50"
                            >
                                {deletingFolder && <Loader2 size={11} className="animate-spin" />}
                                Delete folder
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Recipient Preview Modal ───────────────────────────────────
                Mirrors the campaign-detail preview UX. Read-only render of the
                template's subject + body in an inbox simulation. */}
            {previewTemplate && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-[4px] flex items-center justify-center z-[9998] p-4"
                    onClick={(e) => { if (e.target === e.currentTarget) setPreviewTemplate(null); }}
                >
                    <div
                        className="bg-white rounded-2xl w-full max-w-[1480px] h-[94vh] flex flex-col shadow-2xl overflow-hidden"
                        style={{ border: '1px solid #E5E5E5' }}
                    >
                        <div className="px-6 py-4 flex items-center justify-between bg-white" style={{ borderBottom: '1px solid #E5E5E5' }}>
                            <div className="flex items-center gap-4">
                                <div className="w-9 h-9 rounded-lg bg-neutral-900 text-white flex items-center justify-center">
                                    <Eye size={16} />
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold text-neutral-900">Preview as recipient</h2>
                                    <p className="text-xs text-neutral-500 mt-0.5">
                                        Template: <span className="font-medium">{previewTemplate.name}</span> · this is exactly how it will render in your prospect&apos;s inbox.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setPreviewTemplate(null)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                            >
                                <X size={14} />
                                Close
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto bg-neutral-50 px-6 py-6">
                            <RecipientPreviewPanel
                                subject={previewTemplate.subject || ''}
                                bodyHtml={previewTemplate.body_html || ''}
                                senderName="You"
                                senderEmail="you@yourdomain.com"
                            />
                        </div>
                    </div>
                </div>
            )}
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

function ListRow({ active, onClick, title, subtitle, meta, onDelete, onDuplicate, onPreview }: {
    active: boolean;
    onClick: () => void;
    title: string;
    subtitle: string;
    meta?: React.ReactNode;
    onDelete?: () => void;
    onDuplicate?: () => void;
    onPreview?: () => void;
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
                {onPreview && (
                    <button onClick={onPreview} className="p-1 rounded-md hover:bg-gray-100 cursor-pointer" title="Preview as recipient">
                        <Eye size={11} className="text-gray-400" />
                    </button>
                )}
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

function TemplateCard({ template, onEdit, onDuplicate, onDelete, onPreview, selected, onToggleSelect }: {
    template: Template;
    onEdit: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
    onPreview: () => void;
    selected: boolean;
    onToggleSelect: () => void;
}) {
    // Outer container is role="button" instead of <button> because nesting
    // <button> inside <button> is invalid HTML and React 19 throws a
    // hydration error. Inner action buttons (Duplicate / Delete) keep their
    // <button> semantics; their onClick stops propagation so the outer
    // edit-handler doesn't fire when they're clicked.
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onEdit();
        }
    };
    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onEdit}
            onKeyDown={handleKeyDown}
            className="text-left flex flex-col cursor-pointer transition-colors bg-white hover:bg-[#FAF7F1] p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            style={{ border: '1px solid #D1CBC5' }}
        >
            <div className="flex items-start justify-between mb-2 gap-2">
                <input
                    type="checkbox"
                    checked={selected}
                    onChange={onToggleSelect}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-0.5 cursor-pointer shrink-0"
                    title="Select to move"
                />
                <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-bold text-gray-900 truncate">{template.name}</h3>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 capitalize mt-1 inline-block">{template.category}</span>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onPreview(); }}
                        className="p-1 rounded-md hover:bg-gray-100 cursor-pointer"
                        title="Preview as recipient"
                    >
                        <Eye size={11} className="text-gray-400" />
                    </button>
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
                        className="p-1 rounded-md hover:bg-gray-100 cursor-pointer"
                        title="Duplicate"
                    >
                        <Copy size={11} className="text-gray-400" />
                    </button>
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="p-1 rounded-md hover:bg-red-50 cursor-pointer"
                        title="Delete"
                    >
                        <Trash2 size={11} className="text-red-400" />
                    </button>
                </div>
            </div>
            <div className="text-[10px] text-gray-700 font-medium mb-1 truncate">Subject: {template.subject}</div>
            <div className="text-[10px] text-gray-400 line-clamp-3 flex-1" dangerouslySetInnerHTML={{ __html: template.body_html.replace(/<[^>]*>/g, '').slice(0, 150) }} />
            <div className="text-[9px] text-gray-300 mt-2 flex items-center gap-1">
                <Edit3 size={9} /> Click to edit · {new Date(template.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
        </div>
    );
}

function SignatureCard({ signature, onEdit, onDelete, onSetDefault }: {
    signature: Signature;
    onEdit: () => void;
    onDelete: () => void;
    onSetDefault: () => void;
}) {
    // role="button" wrapper — see TemplateCard above for why.
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onEdit();
        }
    };
    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onEdit}
            onKeyDown={handleKeyDown}
            className="text-left flex flex-col cursor-pointer transition-colors bg-white hover:bg-[#FAF7F1] p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            style={{ border: '1px solid #D1CBC5' }}
        >
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <h3 className="text-xs font-bold text-gray-900 truncate">{signature.name}</h3>
                    {signature.is_default && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold shrink-0">DEFAULT</span>}
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                    {!signature.is_default && (
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onSetDefault(); }}
                            className="p-1 rounded-md hover:bg-amber-50 cursor-pointer"
                            title="Set as default"
                        >
                            <Star size={11} className="text-amber-400" />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="p-1 rounded-md hover:bg-red-50 cursor-pointer"
                        title="Delete"
                    >
                        <Trash2 size={11} className="text-red-400" />
                    </button>
                </div>
            </div>
            <div className="text-[10px] text-gray-600 flex-1 overflow-hidden pt-2 mt-1 max-h-[120px]" style={{ borderTop: '1px solid #F0EBE3' }} dangerouslySetInnerHTML={{ __html: signature.html_content }} />
            <div className="text-[9px] text-gray-300 mt-2 flex items-center gap-1">
                <Edit3 size={9} /> Click to edit · {new Date(signature.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────
// FolderPill — selector chip for the templates folder bar.
// User-defined folders surface a delete button on hover; the All /
// Uncategorized pseudo-buckets do not.
// ────────────────────────────────────────────────────────────────────
function FolderPill({
    active,
    onClick,
    label,
    count,
    onDelete,
    withFolderIcon,
}: {
    active: boolean;
    onClick: () => void;
    label: string;
    count: number;
    onDelete?: () => void;
    withFolderIcon?: boolean;
}) {
    return (
        <div
            className="group relative inline-flex items-center"
        >
            <button
                onClick={onClick}
                className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold rounded-full cursor-pointer transition-colors"
                style={{
                    background: active ? '#111827' : '#FFFFFF',
                    color: active ? '#FFFFFF' : '#374151',
                    border: active ? '1px solid #111827' : '1px solid #D1CBC5',
                }}
            >
                {withFolderIcon && <Folder size={10} />}
                {label}
                <span className="text-[10px] opacity-60">({count})</span>
            </button>
            {onDelete && (
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="opacity-0 group-hover:opacity-100 ml-1 p-0.5 rounded text-gray-400 hover:text-red-600 transition-opacity"
                    title="Delete folder"
                >
                    <X size={10} />
                </button>
            )}
        </div>
    );
}


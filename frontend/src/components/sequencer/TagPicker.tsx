'use client';

/**
 * TagPicker — multi-select dropdown for picking tags on a single contact.
 *
 * Used in two places:
 *   - Contacts page (per-row, opens on click of "+ tag" button)
 *   - Lead detail page (header tag editor)
 *
 * Behavior:
 *   - Shows ALL the org's tags as togglable rows.
 *   - "Create new tag" inline at the bottom — never forces the operator
 *     to leave the page just to add a missing tag.
 *   - Saves the FULL tag set on every change (PUT semantics) — backend
 *     handles the diff. Optimistic update on the parent so the row
 *     reflects the change before the network round-trip lands.
 */

import { useEffect, useRef, useState } from 'react';
import { Plus, Check, X as XIcon, Loader2, Tag as TagIcon, Search } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { tagPillColors, TAG_PALETTE, TagIconShape, type TagItem } from './TagManagerModal';

interface TagPickerProps {
    /** All tags in the org. Caller fetches once and passes the same list
     *  to every TagPicker so we don't refetch per row. */
    allTags: TagItem[];
    /** Tag IDs currently applied to this contact. */
    selectedIds: string[];
    /** Called after the new tag set is persisted. Pass the new full ID
     *  list so the parent can update its row optimistically. */
    onChange: (newSelectedIds: string[]) => Promise<void> | void;
    /** Called when the picker creates a new tag (so parent can refresh
     *  allTags). The new tag's id is added to selectedIds automatically. */
    onTagCreated?: () => Promise<void> | void;
    /** Trigger element. If omitted, renders a default "+ Add tag" pill. */
    trigger?: React.ReactNode;
    /** Position the dropdown — 'right' anchors the menu to the trigger's
     *  right edge so it doesn't run off-screen on right-aligned columns. */
    align?: 'left' | 'right';
}

export default function TagPicker({
    allTags,
    selectedIds,
    onChange,
    onTagCreated,
    trigger,
    align = 'left',
}: TagPickerProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [creating, setCreating] = useState(false);
    const [pending, setPending] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setOpen(false);
                setSearch('');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const filtered = search.trim()
        ? allTags.filter(t => t.name.toLowerCase().includes(search.trim().toLowerCase()))
        : allTags;

    const toggleTag = async (id: string) => {
        const next = selectedIds.includes(id)
            ? selectedIds.filter(x => x !== id)
            : [...selectedIds, id];
        setPending(true);
        try {
            await onChange(next);
        } finally {
            setPending(false);
        }
    };

    const createInline = async () => {
        const name = search.trim();
        if (!name || creating) return;
        setCreating(true);
        try {
            // Pick a color the user hasn't already used heavily (best-effort).
            const used = new Set(allTags.map(t => t.color).filter(Boolean));
            const fresh = TAG_PALETTE.find(c => !used.has(c)) || TAG_PALETTE[0];
            const res = await apiClient<{ tag: TagItem }>('/api/sequencer/tags', {
                method: 'POST',
                body: JSON.stringify({ name, color: fresh }),
            });
            await onTagCreated?.();
            // Auto-apply the new tag to this contact.
            if (res?.tag?.id) {
                await onChange([...selectedIds, res.tag.id]);
            }
            setSearch('');
        } catch { /* auto-toast */ }
        finally { setCreating(false); }
    };

    const exactNameMatch = allTags.some(t => t.name.toLowerCase() === search.trim().toLowerCase());
    const showCreateRow = search.trim().length > 0 && !exactNameMatch;

    return (
        <div ref={wrapperRef} className="relative inline-block">
            {trigger ? (
                <span onClick={() => setOpen(v => !v)} className="cursor-pointer">{trigger}</span>
            ) : (
                <button
                    type="button"
                    onClick={() => setOpen(v => !v)}
                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-500 px-1.5 py-0.5 rounded-full hover:bg-gray-100 cursor-pointer"
                    style={{ border: '1px dashed #D1CBC5' }}
                    title="Add tag"
                >
                    <Plus size={9} /> Tag
                </button>
            )}

            {open && (
                <div
                    className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} top-full mt-1 w-64 bg-white rounded-lg shadow-lg z-[100]`}
                    style={{ border: '1px solid #D1CBC5' }}
                >
                    <div className="p-2" style={{ borderBottom: '1px solid #E8E3DC' }}>
                        <div className="relative">
                            <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter' && showCreateRow) createInline(); }}
                                placeholder="Search or create tag…"
                                autoFocus
                                className="w-full pl-6 pr-2 py-1 text-xs outline-none rounded-md"
                                style={{ border: '1px solid #E8E3DC' }}
                            />
                        </div>
                    </div>

                    <div className="max-h-64 overflow-y-auto">
                        {filtered.length === 0 && !showCreateRow && (
                            <div className="px-3 py-3 text-center">
                                <TagIcon size={14} className="text-gray-300 mx-auto mb-1" />
                                <p className="text-[10px] text-gray-400">No tags yet</p>
                            </div>
                        )}
                        {filtered.map(t => {
                            const checked = selectedIds.includes(t.id);
                            return (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => toggleTag(t.id)}
                                    disabled={pending}
                                    className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs cursor-pointer transition-colors hover:bg-[#F5F1EA] disabled:opacity-50"
                                    style={{
                                        borderBottom: '1px solid #F0EBE3',
                                        background: checked ? '#F5F1EA' : 'transparent',
                                        fontWeight: checked ? 600 : 400,
                                        color: checked ? '#111827' : '#4B5563',
                                    }}
                                >
                                    {/* Square checkbox + colored tag-shape icon
                                        + plain name. Same visual pattern as the
                                        All-tags filter and bulk-tag dropdowns. */}
                                    <span className="w-3.5 h-3.5 rounded-sm shrink-0 flex items-center justify-center" style={{ background: checked ? '#111827' : 'transparent', border: `1.5px solid ${checked ? '#111827' : '#D1CBC5'}` }}>
                                        {checked && <Check size={9} className="text-white" />}
                                    </span>
                                    <span className="shrink-0 flex items-center">
                                        <TagIconShape color={t.color || '#6B7280'} size={12} />
                                    </span>
                                    <span className="truncate">{t.name}</span>
                                </button>
                            );
                        })}

                        {showCreateRow && (
                            <button
                                type="button"
                                onClick={createInline}
                                disabled={creating}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-[#F5F1EA] disabled:opacity-50 cursor-pointer"
                                style={{ borderTop: '1px solid #E8E3DC' }}
                            >
                                {creating ? <Loader2 size={11} className="animate-spin text-gray-400" /> : <Plus size={11} className="text-gray-400" />}
                                <span className="text-gray-700">Create &ldquo;{search.trim()}&rdquo;</span>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

/** Renders the list of tag pills for a contact, with each pill removable. */
export function TagPillList({
    tags,
    onRemove,
    compact,
}: {
    tags: Array<{ id: string; name: string; color: string | null }>;
    onRemove?: (tagId: string) => void;
    compact?: boolean;
}) {
    if (tags.length === 0) return null;
    return (
        <div className="inline-flex items-center gap-1 flex-wrap">
            {tags.map(t => {
                const colors = tagPillColors(t.color);
                return (
                    <span
                        key={t.id}
                        className={`inline-flex items-center gap-1 ${compact ? 'text-[9px] px-1.5 py-0.5' : 'text-[10px] px-2 py-0.5'} font-semibold rounded-full`}
                        style={{ background: colors.bg, color: colors.fg }}
                    >
                        {t.name}
                        {onRemove && (
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onRemove(t.id); }}
                                className="hover:opacity-70"
                                title={`Remove ${t.name}`}
                            >
                                <XIcon size={compact ? 8 : 9} />
                            </button>
                        )}
                    </span>
                );
            })}
        </div>
    );
}

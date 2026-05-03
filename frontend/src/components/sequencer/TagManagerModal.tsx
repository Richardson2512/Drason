'use client';

/**
 * TagManagerModal — create / rename / recolor / delete tags.
 *
 * Org-scoped: lists every tag the org has defined, with a count of how
 * many contacts each tag is applied to. Inline rename + color picker.
 *
 * Used by:
 *   - Contacts page header ("Manage tags" button)
 *   - Tag picker dropdown ("+ New tag" → opens this modal in create mode)
 */

import { useEffect, useState } from 'react';
import { X, Plus, Tag as TagIcon, Trash2, Loader2, Check, Edit3 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

export interface TagItem {
    id: string;
    name: string;
    color: string | null;
    /** Total surfaces (contacts + campaigns) carrying this tag. Backward-
     *  compat alias for any caller that just wants a single number. */
    count: number;
    /** How many contacts carry this tag. */
    contact_count: number;
    /** How many campaigns carry this tag. */
    campaign_count: number;
}

// Curated palette for the color picker. Matches the rest of the platform's
// pill colors (lead status, source, validation). Keep these as hex so the
// backend stores them as-is.
export const TAG_PALETTE = [
    '#3B82F6', // blue
    '#10B981', // emerald
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#0EA5E9', // sky
    '#84CC16', // lime
    '#F97316', // orange
    '#6B7280', // gray
];

export function tagPillColors(color: string | null): { bg: string; fg: string } {
    // Light pastel background derived from the saturated tag color, with
    // the saturated color as the foreground. Covers any hex color the
    // operator picked, including ones outside our palette.
    const hex = color && /^#[0-9a-fA-F]{6}$/.test(color) ? color : '#6B7280';
    // Append "20" to the 6-char hex for ~12.5% alpha as the background.
    return { bg: `${hex}20`, fg: hex };
}

/**
 * Price-tag silhouette filled with the given color. Same shape as the
 * Lucide Tag icon used in the modal header. Re-used in:
 *   - The color picker (ColorRow below) so swatches match the tag shape
 *   - The "All tags" filter dropdown so each option has a colored icon
 *
 * Stroke matches the fill so the icon reads as a single colored shape;
 * the small "string hole" stays white for legibility.
 */
export function TagIconShape({ color, size = 16 }: { color: string; size?: number }) {
    const hex = /^#[0-9a-fA-F]{6}$/.test(color) ? color : '#6B7280';
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={hex} stroke={hex} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <circle cx="7" cy="7" r="1.5" fill="white" stroke="white" />
        </svg>
    );
}

interface TagManagerModalProps {
    onClose: () => void;
    /** Called whenever the tag set changes (create/rename/delete) so
     *  parent can refresh its tag dropdowns and contact tag pills. */
    onChanged?: () => void;
}

export default function TagManagerModal({ onClose, onChanged }: TagManagerModalProps) {
    const [tags, setTags] = useState<TagItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Create-row state
    const [newName, setNewName] = useState('');
    const [newColor, setNewColor] = useState<string>(TAG_PALETTE[0]);
    const [creating, setCreating] = useState(false);

    // Inline edit state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editColor, setEditColor] = useState<string | null>(null);
    const [savingEdit, setSavingEdit] = useState(false);

    const refresh = async () => {
        try {
            const res = await apiClient<{ tags: TagItem[] }>('/api/sequencer/tags');
            setTags(res?.tags || []);
        } catch {
            setTags([]);
        }
    };

    useEffect(() => {
        (async () => {
            await refresh();
            setLoading(false);
        })();
    }, []);

    // Lock background scroll while the modal is open. The dashboard's
    // actual scroll container is `<main id="main-content">` (set in
    // DashboardShell), NOT the body — so setting body overflow does
    // nothing. We lock both for safety; the main element is the one
    // that actually matters in this app.
    useEffect(() => {
        const main = document.getElementById('main-content');
        const prevBody = document.body.style.overflow;
        const prevMain = main?.style.overflow ?? '';
        document.body.style.overflow = 'hidden';
        if (main) main.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prevBody;
            if (main) main.style.overflow = prevMain;
        };
    }, []);

    const create = async () => {
        const name = newName.trim();
        if (!name) return;
        setCreating(true);
        try {
            await apiClient('/api/sequencer/tags', {
                method: 'POST',
                body: JSON.stringify({ name, color: newColor }),
            });
            setNewName('');
            setNewColor(TAG_PALETTE[0]);
            await refresh();
            onChanged?.();
        } catch { /* auto-toast */ }
        finally { setCreating(false); }
    };

    const startEdit = (tag: TagItem) => {
        setEditingId(tag.id);
        setEditName(tag.name);
        setEditColor(tag.color);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditName('');
        setEditColor(null);
    };

    const saveEdit = async () => {
        if (!editingId) return;
        const name = editName.trim();
        if (!name) return;
        setSavingEdit(true);
        try {
            await apiClient(`/api/sequencer/tags/${editingId}`, {
                method: 'PATCH',
                body: JSON.stringify({ name, color: editColor }),
            });
            cancelEdit();
            await refresh();
            onChanged?.();
        } catch { /* auto-toast */ }
        finally { setSavingEdit(false); }
    };

    const removeTag = async (tag: TagItem) => {
        const parts: string[] = [];
        if (tag.contact_count > 0) parts.push(`${tag.contact_count} contact${tag.contact_count === 1 ? '' : 's'}`);
        if (tag.campaign_count > 0) parts.push(`${tag.campaign_count} campaign${tag.campaign_count === 1 ? '' : 's'}`);
        const msg = parts.length > 0
            ? `Delete "${tag.name}"? It's currently applied to ${parts.join(' and ')} — they will lose this tag.`
            : `Delete "${tag.name}"?`;
        if (!confirm(msg)) return;
        try {
            await apiClient(`/api/sequencer/tags/${tag.id}`, { method: 'DELETE' });
            toast.success(`Deleted "${tag.name}"`);
            await refresh();
            onChanged?.();
        } catch { /* auto-toast */ }
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white w-full max-w-lg max-h-[88vh] flex flex-col rounded-xl overflow-hidden" style={{ border: '1px solid #D1CBC5' }}>
                {/* Header */}
                <div className="px-4 py-3 flex items-center justify-between shrink-0" style={{ borderBottom: '1px solid #D1CBC5' }}>
                    <div className="flex items-center gap-2">
                        <TagIcon size={14} className="text-gray-700" />
                        <h2 className="text-sm font-bold text-gray-900">Manage tags</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                        <X size={16} />
                    </button>
                </div>

                {/* Create row */}
                <div className="px-4 py-3 flex flex-col gap-2" style={{ borderBottom: '1px solid #E8E3DC', background: '#FAFAF8' }}>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                        Create a new tag
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') create(); }}
                            maxLength={40}
                            placeholder="e.g. Hot lead, Decision maker, Replied"
                            className="flex-1 px-2.5 py-1.5 text-xs rounded-lg outline-none"
                            style={{ border: '1px solid #D1CBC5' }}
                        />
                        <button
                            onClick={create}
                            disabled={creating || !newName.trim()}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg cursor-pointer hover:bg-gray-800 disabled:opacity-50"
                        >
                            {creating ? <Loader2 size={11} className="animate-spin" /> : <Plus size={11} />}
                            Add
                        </button>
                    </div>
                    {/* Inline color row — no popover. Click a dot to pick.
                        Active dot gets a dark ring. Same pattern as
                        GitHub/Linear label pickers. */}
                    <ColorRow value={newColor} onChange={setNewColor} />
                </div>

                {/* Tag list */}
                <div className="flex-1 min-h-0 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 size={18} className="animate-spin text-gray-400" />
                        </div>
                    ) : tags.length === 0 ? (
                        <div className="text-center py-12">
                            <TagIcon size={20} className="text-gray-300 mx-auto mb-2" />
                            <p className="text-xs text-gray-500">No tags yet. Create your first tag above.</p>
                        </div>
                    ) : (
                        <ul>
                            {tags.map(tag => {
                                const isEditing = editingId === tag.id;
                                const colors = tagPillColors(isEditing ? editColor : tag.color);
                                return (
                                    <li
                                        key={tag.id}
                                        className={`px-4 py-2 ${isEditing ? 'flex flex-col gap-2' : 'flex items-center gap-2'}`}
                                        style={{ borderBottom: '1px solid #F0EBE3' }}
                                    >
                                        {isEditing ? (
                                            <>
                                                <div className="flex items-center gap-2 w-full">
                                                    <input
                                                        type="text"
                                                        value={editName}
                                                        onChange={e => setEditName(e.target.value)}
                                                        onKeyDown={e => {
                                                            if (e.key === 'Enter') saveEdit();
                                                            else if (e.key === 'Escape') cancelEdit();
                                                        }}
                                                        autoFocus
                                                        maxLength={40}
                                                        className="flex-1 px-2.5 py-1 text-xs rounded-md outline-none"
                                                        style={{ border: '1px solid #D1CBC5' }}
                                                    />
                                                    <button
                                                        onClick={saveEdit}
                                                        disabled={savingEdit || !editName.trim()}
                                                        className="p-1 text-gray-400 hover:text-emerald-600 disabled:opacity-50"
                                                        title="Save"
                                                    >
                                                        {savingEdit ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                                                    </button>
                                                    <button
                                                        onClick={cancelEdit}
                                                        className="p-1 text-gray-400 hover:text-gray-700"
                                                        title="Cancel"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                                <ColorRow
                                                    value={editColor || TAG_PALETTE[0]}
                                                    onChange={setEditColor}
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <span
                                                    className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full"
                                                    style={{ background: colors.bg, color: colors.fg }}
                                                >
                                                    {tag.name}
                                                </span>
                                                <span className="text-[10px] text-gray-400 ml-auto tabular-nums">
                                                    {tag.contact_count} contact{tag.contact_count === 1 ? '' : 's'}
                                                    {' · '}
                                                    {tag.campaign_count} campaign{tag.campaign_count === 1 ? '' : 's'}
                                                </span>
                                                <button
                                                    onClick={() => startEdit(tag)}
                                                    className="p-1 text-gray-400 hover:text-gray-700"
                                                    title="Edit"
                                                >
                                                    <Edit3 size={11} />
                                                </button>
                                                <button
                                                    onClick={() => removeTag(tag)}
                                                    className="p-1 text-gray-400 hover:text-red-600"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={11} />
                                                </button>
                                            </>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2 shrink-0" style={{ borderTop: '1px solid #E8E3DC', background: '#FAFAF8' }}>
                    <p className="text-[10px] text-gray-400">
                        Deleting a tag removes it from every contact — no contact data is lost.
                    </p>
                </div>
            </div>
        </div>
    );
}

/** Inline horizontal row of tag-shape swatches — the simplest possible
 *  color picker. No popover, no overlap. Active swatch gets a dark ring;
 *  hover gets a soft ring. */
function ColorRow({
    value,
    onChange,
}: {
    value: string;
    onChange: (color: string) => void;
}) {
    return (
        <div className="flex items-center gap-1.5 flex-wrap" role="radiogroup" aria-label="Tag color">
            {TAG_PALETTE.map(c => {
                const isActive = c === value;
                return (
                    <button
                        key={c}
                        type="button"
                        onClick={() => onChange(c)}
                        className={`w-7 h-7 rounded-md cursor-pointer flex items-center justify-center transition-colors ${
                            isActive
                                ? 'bg-gray-100 ring-2 ring-gray-900'
                                : 'hover:bg-gray-50'
                        }`}
                        aria-label={c}
                        aria-checked={isActive}
                        role="radio"
                        title={c}
                    >
                        <TagIconShape color={c} size={18} />
                    </button>
                );
            })}
        </div>
    );
}

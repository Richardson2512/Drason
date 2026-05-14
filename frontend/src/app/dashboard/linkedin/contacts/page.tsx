'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
    Search, Upload, Download, Trash2, ChevronLeft, ChevronRight, Plus, X, Linkedin,
    Tag as TagIcon, Columns3, FileSpreadsheet, ArrowRightLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';
import CustomSelect from '@/components/ui/CustomSelect';
import MultiSelectDropdown from '@/components/ui/MultiSelectDropdown';
import TagManagerModal, { type TagItem, TagIconShape } from '@/components/sequencer/TagManagerModal';
import TagPicker, { TagPillList } from '@/components/sequencer/TagPicker';
import { apiClient } from '@/lib/api';

/**
 * Super LinkedIn Contacts — feature-parity with /dashboard/sequencer/contacts:
 * columns toggler, CSV export, Add Contact, tag picker, paginated table,
 * bulk-select action bar. Adds a new "From Super Sequencer" import path
 * (reuse email-side contacts that already carry a linkedin_url) on top
 * of the standard sources.
 *
 * Tags use the org-wide /api/sequencer/tags surface — same table the
 * email contacts page reads from, so a tag created here also appears
 * there. Workspace-scoped, not channel-scoped.
 */

// ────────────────────────────────────────────────────────────────────
// Types + column registry
// ────────────────────────────────────────────────────────────────────

interface Contact {
    id: string;
    name: string;
    headline: string | null;
    company: string | null;
    title: string | null;
    linkedin_url: string;
    email: string | null;
    phone: string | null;
    connection_status: 'connected' | 'invite_sent' | 'not_connected' | 'unknown';
    via_account: string | null;
    source: 'csv' | 'clay' | 'apollo' | 'surfe' | 'lusha' | 'hunter' | 'zoominfo' | 'sequencer' | 'signal' | 'manual';
    campaign_count: number;
    lead_score: number;
    tags: Array<{ id: string; name: string; color: string | null }>;
    created_at: string;
}

const COLUMN_PREF_KEY = 'linkedin.contacts.visibleColumns.v1';
const ALL_COLUMNS = [
    { key: 'name',         label: 'Name + LinkedIn', defaultVisible: true,  width: 'min-w-[240px]', align: 'left'   as const },
    { key: 'company',      label: 'Company / Title', defaultVisible: true,  width: 'min-w-[180px]', align: 'left'   as const },
    { key: 'connection',   label: 'Connection',      defaultVisible: true,  width: 'min-w-[150px]', align: 'left'   as const },
    { key: 'email',        label: 'Email',           defaultVisible: false, width: 'min-w-[200px]', align: 'left'   as const },
    { key: 'phone',        label: 'Phone',           defaultVisible: false, width: 'min-w-[140px]', align: 'left'   as const },
    { key: 'source',       label: 'Source',          defaultVisible: true,  width: 'min-w-[110px]', align: 'left'   as const },
    { key: 'lead_score',   label: 'Lead score',      defaultVisible: false, width: 'min-w-[110px]', align: 'center' as const },
    { key: 'tags',         label: 'Tags',            defaultVisible: true,  width: 'min-w-[180px]', align: 'left'   as const },
    { key: 'campaigns',    label: 'Campaigns',       defaultVisible: true,  width: 'min-w-[90px]',  align: 'center' as const },
    { key: 'created',      label: 'Added',           defaultVisible: false, width: 'min-w-[100px]', align: 'left'   as const },
] as const;
type ColumnKey = typeof ALL_COLUMNS[number]['key'];
const DEFAULT_VISIBLE_COLS: ColumnKey[] = ALL_COLUMNS.filter(c => c.defaultVisible).map(c => c.key);

const STATUS_BADGE: Record<Contact['connection_status'], { label: string; tint: string }> = {
    connected:     { label: 'Connected',     tint: 'bg-emerald-50 text-emerald-700' },
    invite_sent:   { label: 'Invite sent',   tint: 'bg-blue-50 text-blue-700' },
    not_connected: { label: 'Not connected', tint: 'bg-gray-100 text-gray-600' },
    unknown:       { label: 'Unknown',       tint: 'bg-gray-100 text-gray-500' },
};

const SOURCE_BADGE: Record<Contact['source'], string> = {
    csv:       'bg-violet-50 text-violet-700',
    clay:      'bg-amber-50 text-amber-700',
    apollo:    'bg-orange-50 text-orange-700',
    surfe:     'bg-cyan-50 text-cyan-700',
    lusha:     'bg-rose-50 text-rose-700',
    hunter:    'bg-yellow-50 text-yellow-700',
    zoominfo:  'bg-indigo-50 text-indigo-700',
    sequencer: 'bg-blue-50 text-blue-700',
    signal:    'bg-emerald-50 text-emerald-700',
    manual:    'bg-gray-100 text-gray-600',
};


const STATUS_OPTIONS = [
    { value: 'all', label: 'Connection: any' },
    { value: 'connected', label: 'Connected' },
    { value: 'invite_sent', label: 'Invite sent' },
    { value: 'not_connected', label: 'Not connected' },
];

const SOURCE_OPTIONS = [
    { value: 'all', label: 'Source: any' },
    { value: 'csv', label: 'CSV upload' },
    { value: 'apollo', label: 'Apollo' },
    { value: 'clay', label: 'Clay' },
    { value: 'surfe', label: 'Surfe' },
    { value: 'lusha', label: 'Lusha' },
    { value: 'hunter', label: 'Hunter' },
    { value: 'zoominfo', label: 'ZoomInfo' },
    { value: 'sequencer', label: 'Super Sequencer' },
    { value: 'signal', label: 'Signal monitoring' },
    { value: 'manual', label: 'Manual' },
];

// Sequence-status options mirror /dashboard/sequencer/contacts for parity.
// LinkedIn campaigns share the same status lifecycle as email campaigns.
const SEQUENCE_STATUS_OPTIONS = [
    { value: 'all', label: 'Sequence status: any' },
    { value: 'held', label: 'Held' },
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'replied', label: 'Replied' },
    { value: 'completed', label: 'Completed' },
    { value: 'blocked', label: 'Blocked' },
];

const PAGE_SIZE = 25;

// ────────────────────────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────────────────────────

export default function LinkedInContactsPage() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sourceFilter, setSourceFilter] = useState('all');
    const [tagFilter, setTagFilter] = useState<string[]>([]);
    // LinkedIn-specific filters that aren't on the sequencer side because
    // LinkedIn data is title/company-rich — even when the columns aren't
    // visible users still want to narrow by these.
    const [sequenceStatusFilter, setSequenceStatusFilter] = useState('all');
    const [companyFilter, setCompanyFilter] = useState('');
    const [titleFilter, setTitleFilter] = useState('');
    const [allTags, setAllTags] = useState<TagItem[]>([]);
    const [showImport, setShowImport] = useState(false);
    const [showTagManager, setShowTagManager] = useState(false);
    const [showAddContact, setShowAddContact] = useState(false);
    const [showColumnMenu, setShowColumnMenu] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [page, setPage] = useState(1);
    const columnMenuRef = useRef<HTMLDivElement>(null);

    const [visibleCols, setVisibleCols] = useState<ColumnKey[]>(() => {
        if (typeof window === 'undefined') return DEFAULT_VISIBLE_COLS;
        try {
            const raw = localStorage.getItem(COLUMN_PREF_KEY);
            if (!raw) return DEFAULT_VISIBLE_COLS;
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_VISIBLE_COLS;
        } catch { return DEFAULT_VISIBLE_COLS; }
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(COLUMN_PREF_KEY, JSON.stringify(visibleCols));
        }
    }, [visibleCols]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (columnMenuRef.current && !columnMenuRef.current.contains(e.target as Node)) setShowColumnMenu(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        apiClient<{ tags: TagItem[] }>('/api/sequencer/tags')
            .then(res => setAllTags(res?.tags || []))
            .catch(() => { /* keep empty */ });
    }, []);

    // ── Contacts fetch ───────────────────────────────────────────────
    // Backend filters do the heavy lifting (status, source, tags, search,
    // company/title facets). Client-side filtering is only used for the
    // "sequence status" pseudo-filter that's derived from
    // connection_status + campaign_count — no SQL column for that.
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState(0);

    const fetchContacts = useCallback(async () => {
        setLoading(true);
        setFetchError(null);
        try {
            const params = new URLSearchParams();
            if (search.trim()) params.set('search', search.trim());
            if (sourceFilter !== 'all') params.set('sources', sourceFilter);
            if (statusFilter !== 'all') params.set('connection_status', statusFilter);
            if (tagFilter.length > 0) params.set('tag_ids', tagFilter.join(','));
            if (companyFilter.trim()) params.set('companies', companyFilter.trim());
            if (titleFilter.trim()) params.set('titles', titleFilter.trim());
            params.set('page', String(page));
            params.set('limit', '50');
            const resp = await apiClient<{ contacts: Contact[]; meta: { total: number } }>(
                `/api/linkedin/contacts?${params.toString()}`,
            );
            setContacts(Array.isArray(resp?.contacts) ? resp.contacts : []);
            setTotalCount(resp?.meta?.total ?? 0);
        } catch (err: any) {
            setFetchError(err?.message || 'Failed to load contacts');
            setContacts([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter, sourceFilter, tagFilter, companyFilter, titleFilter, page]);

    useEffect(() => { void fetchContacts(); }, [fetchContacts]);

    // Refetch when the tab regains focus — picks up contacts added by
    // the supervisor agent (signal monitor → enrichment → CampaignLead
    // upsert) or by other operators editing in another tab.
    useEffect(() => {
        const onFocus = () => { void fetchContacts(); };
        const onVisibility = () => { if (document.visibilityState === 'visible') void fetchContacts(); };
        window.addEventListener('focus', onFocus);
        document.addEventListener('visibilitychange', onVisibility);
        return () => {
            window.removeEventListener('focus', onFocus);
            document.removeEventListener('visibilitychange', onVisibility);
        };
    }, [fetchContacts]);

    // Lightweight mapping from connection_status / campaign_count → sequence
    // status bucket (mirrors how the sequencer page derives status from
    // CampaignLead state).
    const inferSequenceStatus = (c: Contact): string => {
        if (c.campaign_count === 0) return 'held';
        if (c.connection_status === 'invite_sent') return 'active';
        if (c.connection_status === 'connected' && c.campaign_count > 0) return 'active';
        return 'held';
    };

    const filtered = useMemo(() => contacts.filter(c => {
        if (search) {
            const q = search.toLowerCase();
            if (!c.name.toLowerCase().includes(q)
                && !(c.headline?.toLowerCase().includes(q))
                && !(c.company?.toLowerCase().includes(q))
                && !(c.email?.toLowerCase().includes(q))) return false;
        }
        if (statusFilter !== 'all' && c.connection_status !== statusFilter) return false;
        if (sourceFilter !== 'all' && c.source !== sourceFilter) return false;
        if (tagFilter.length > 0 && !c.tags.some(t => tagFilter.includes(t.id))) return false;
        if (sequenceStatusFilter !== 'all' && inferSequenceStatus(c) !== sequenceStatusFilter) return false;
        if (companyFilter && !(c.company?.toLowerCase().includes(companyFilter.toLowerCase()))) return false;
        if (titleFilter && !((c.title || c.headline)?.toLowerCase().includes(titleFilter.toLowerCase()))) return false;
        return true;
    }), [contacts, search, statusFilter, sourceFilter, tagFilter, sequenceStatusFilter, companyFilter, titleFilter]);

    useEffect(() => { setPage(1); }, [search, statusFilter, sourceFilter, tagFilter, sequenceStatusFilter, companyFilter, titleFilter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const pageStart = (safePage - 1) * PAGE_SIZE;
    const pageItems = filtered.slice(pageStart, pageStart + PAGE_SIZE);

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
    };
    const toggleSelectAllVisible = () => {
        setSelectedIds(prev => {
            const n = new Set(prev);
            const allSelected = pageItems.every(c => n.has(c.id));
            for (const c of pageItems) (allSelected ? n.delete(c.id) : n.add(c.id));
            return n;
        });
    };

    const toggleColumn = (key: ColumnKey) => {
        setVisibleCols(prev => {
            if (prev.includes(key)) {
                // never let the user hide the last column
                return prev.length === 1 ? prev : prev.filter(k => k !== key);
            }
            return [...prev, key];
        });
    };

    const exportCSV = () => {
        const rows = filtered;
        if (rows.length === 0) { toast('No contacts to export', { icon: 'ℹ️' }); return; }
        const cols = ['name', 'company', 'title', 'linkedin_url', 'email', 'phone', 'connection_status', 'source', 'campaign_count', 'lead_score', 'tags', 'created_at'];
        const escape = (v: unknown) => {
            const s = v == null ? '' : String(v);
            return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        };
        const lines = [
            cols.join(','),
            ...rows.map(r => cols.map(c => {
                if (c === 'tags') return escape(r.tags.map(t => t.name).join('|'));
                return escape((r as unknown as Record<string, unknown>)[c]);
            }).join(',')),
        ];
        const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `linkedin-contacts-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`Exported ${rows.length} contact${rows.length === 1 ? '' : 's'}`);
    };

    // ── Bulk action bar state ────────────────────────────────────────
    const [bulkAction, setBulkAction] = useState<'tag' | 'campaign' | null>(null);
    const [bulkTagging, setBulkTagging] = useState(false);
    const [bulkEnrolling, setBulkEnrolling] = useState(false);
    const [bulkDeleting, setBulkDeleting] = useState(false);
    const [bulkCampaignId, setBulkCampaignId] = useState('');
    const [bulkCampaignOpts, setBulkCampaignOpts] = useState<Array<{ id: string; name: string; status: string }>>([]);

    // Lazy-load the campaign list when the operator opens the
    // bulk-campaign popover. We don't pre-fetch on page mount because
    // most operators never use this action.
    useEffect(() => {
        if (bulkAction !== 'campaign' || bulkCampaignOpts.length > 0) return;
        apiClient<{ data: Array<{ id: string; name: string; status: string }> } | Array<{ id: string; name: string; status: string }>>(
            '/api/sequencer/campaigns?channel=linkedin&limit=100',
        ).then(resp => {
            const list = Array.isArray(resp) ? resp : ((resp as any)?.data ?? []);
            setBulkCampaignOpts(list);
        }).catch(() => setBulkCampaignOpts([]));
    }, [bulkAction, bulkCampaignOpts.length]);

    const handleBulkTag = async (tagId: string) => {
        if (selectedIds.size === 0) return;
        setBulkTagging(true);
        try {
            await apiClient('/api/sequencer/contacts/bulk-tag', {
                method: 'POST',
                body: JSON.stringify({
                    contactIds: Array.from(selectedIds),
                    tagId,
                    action: 'add',
                }),
            });
            toast.success(`Tagged ${selectedIds.size} contact${selectedIds.size === 1 ? '' : 's'}`);
            setBulkAction(null);
            setSelectedIds(new Set());
            void fetchContacts();
        } catch (err: any) {
            toast.error(err?.message || 'Failed to apply tag');
        } finally {
            setBulkTagging(false);
        }
    };

    const handleBulkEnroll = async () => {
        if (selectedIds.size === 0 || !bulkCampaignId) return;
        setBulkEnrolling(true);
        try {
            const resp = await apiClient<{ data: { enrolled: number; already_in_campaign: number; skipped_no_linkedin: number } }>(
                '/api/linkedin/contacts/enroll-in-campaign',
                {
                    method: 'POST',
                    body: JSON.stringify({
                        lead_ids: Array.from(selectedIds),
                        campaign_id: bulkCampaignId,
                    }),
                },
            );
            const { enrolled, already_in_campaign, skipped_no_linkedin } = resp.data;
            toast.success(`Enrolled ${enrolled} · ${already_in_campaign} already in · ${skipped_no_linkedin} skipped`);
            setBulkAction(null);
            setSelectedIds(new Set());
            void fetchContacts();
        } catch (err: any) {
            toast.error(err?.message || 'Enroll failed');
        } finally {
            setBulkEnrolling(false);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!window.confirm(`Remove ${selectedIds.size} contact${selectedIds.size === 1 ? '' : 's'}? This deletes the Lead row from the workspace — both Super LinkedIn and Super Sequencer will lose it.`)) return;
        setBulkDeleting(true);
        try {
            const resp = await apiClient<{ data: { deleted: number } }>(
                '/api/linkedin/contacts/delete',
                { method: 'POST', body: JSON.stringify({ ids: Array.from(selectedIds) }) },
            );
            toast.success(`Removed ${resp.data.deleted} contact${resp.data.deleted === 1 ? '' : 's'}`);
            setSelectedIds(new Set());
            void fetchContacts();
        } catch (err: any) {
            toast.error(err?.message || 'Remove failed');
        } finally {
            setBulkDeleting(false);
        }
    };

    // Per-row tag update. The underlying Lead row is shared between
    // Super LinkedIn and Super Sequencer, so we call the unified
    // /api/sequencer/contacts/:id/tags endpoint — a tag added here also
    // shows up on the email-side contact view, which is what operators
    // expect from a "workspace-level lead" model. The list is
    // optimistically updated, then reconciled from the server response.
    const updateContactTags = async (contactId: string, tagIds: string[]) => {
        const newTagSet = allTags.filter(t => tagIds.includes(t.id))
            .map(t => ({ id: t.id, name: t.name, color: t.color }));
        setContacts(prev => prev.map(c => c.id === contactId ? { ...c, tags: newTagSet } : c));
        try {
            await apiClient(`/api/sequencer/contacts/${contactId}/tags`, {
                method: 'PUT',
                body: JSON.stringify({ tagIds }),
            });
        } catch (err: any) {
            toast.error(err?.message || 'Failed to update tags');
            // Revert by refetching.
            void fetchContacts();
        }
    };

    const showCol = (k: ColumnKey) => visibleCols.includes(k);

    return (
        <div className="p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Contacts</h1>
                    <p className="text-xs text-gray-500 mt-0.5">{contacts.length.toLocaleString()} contacts</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setShowTagManager(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer border border-[#D1CBC5] hover:bg-gray-50"
                        title="Create, rename, or delete tags"
                    >
                        <TagIcon size={12} /> Manage tags
                    </button>
                    <div ref={columnMenuRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setShowColumnMenu(v => !v)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer border border-[#D1CBC5] hover:bg-gray-50"
                            title="Choose visible columns"
                        >
                            <Columns3 size={12} /> Columns
                        </button>
                        {showColumnMenu && (
                            <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg z-50" style={{ border: '1px solid #D1CBC5' }}>
                                <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-500 uppercase" style={{ borderBottom: '1px solid #E8E3DC' }}>
                                    Visible columns
                                </div>
                                {ALL_COLUMNS.map(col => {
                                    const checked = visibleCols.includes(col.key);
                                    const isLast = checked && visibleCols.length === 1;
                                    return (
                                        <label
                                            key={col.key}
                                            className={`flex items-center gap-2 px-3 py-1.5 text-xs ${isLast ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                disabled={isLast}
                                                onChange={() => toggleColumn(col.key)}
                                                className="cursor-pointer"
                                            />
                                            <span className="text-gray-900">{col.label}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    <button onClick={exportCSV}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer border border-[#D1CBC5] hover:bg-gray-50">
                        <Upload size={12} /> Export
                    </button>
                    <button
                        onClick={() => setShowImport(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer border border-[#D1CBC5] hover:bg-gray-50"
                    >
                        <Download size={12} /> Import contacts
                    </button>
                    <button
                        onClick={() => setShowAddContact(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg cursor-pointer hover:bg-gray-800"
                    >
                        <Plus size={12} /> Add Contact
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
                <div className="relative flex-1 max-w-sm min-w-[220px]">
                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search by name, headline, company, or email…"
                        className="w-full pl-7 pr-3 py-1.5 text-xs rounded-lg outline-none border border-[#D1CBC5]"
                    />
                </div>
                <div className="w-[180px]">
                    <CustomSelect value={sequenceStatusFilter} onChange={v => setSequenceStatusFilter(v)} options={SEQUENCE_STATUS_OPTIONS} />
                </div>
                <div className="w-[180px]">
                    <CustomSelect value={statusFilter} onChange={v => setStatusFilter(v)} options={STATUS_OPTIONS} />
                </div>
                <div className="w-[180px]">
                    <CustomSelect value={sourceFilter} onChange={v => setSourceFilter(v)} options={SOURCE_OPTIONS} />
                </div>
                <input
                    type="text" value={companyFilter} onChange={e => setCompanyFilter(e.target.value)}
                    placeholder="Company…"
                    className="w-[140px] px-3 py-1.5 text-xs rounded-lg outline-none bg-white border border-[#D1CBC5]"
                />
                <input
                    type="text" value={titleFilter} onChange={e => setTitleFilter(e.target.value)}
                    placeholder="Title…"
                    className="w-[140px] px-3 py-1.5 text-xs rounded-lg outline-none bg-white border border-[#D1CBC5]"
                />
                <div className="w-[180px]">
                    <MultiSelectDropdown
                        options={allTags.map(t => ({
                            value: t.id,
                            label: t.name,
                            icon: <TagIconShape color={t.color || '#6B7280'} size={12} />,
                        }))}
                        selected={tagFilter}
                        onChange={setTagFilter}
                        placeholder="All tags"
                        searchable
                        searchPlaceholder="Search tags…"
                    />
                </div>
                {(search || statusFilter !== 'all' || sourceFilter !== 'all' || tagFilter.length > 0 || sequenceStatusFilter !== 'all' || companyFilter || titleFilter) && (
                    <button onClick={() => { setSearch(''); setStatusFilter('all'); setSourceFilter('all'); setTagFilter([]); setSequenceStatusFilter('all'); setCompanyFilter(''); setTitleFilter(''); }}
                        className="text-[11px] text-gray-500 hover:text-gray-900 underline decoration-dotted">Clear</button>
                )}
            </div>

            {selectedIds.size > 0 && (
                <div className="rounded-lg" style={{ border: '1px solid #D1CBC5', background: '#FFFBEB' }}>
                    <div className="flex items-center justify-between p-2.5">
                        <span className="text-xs text-gray-700"><strong>{selectedIds.size}</strong> contact{selectedIds.size === 1 ? '' : 's'} selected</span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setBulkAction(bulkAction === 'tag' ? null : 'tag')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border ${bulkAction === 'tag' ? 'bg-gray-900 text-white border-gray-900' : 'border-[#D1CBC5] hover:bg-white'}`}
                            >
                                <TagIcon size={11} /> Tag
                            </button>
                            <button
                                onClick={() => setBulkAction(bulkAction === 'campaign' ? null : 'campaign')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border ${bulkAction === 'campaign' ? 'bg-gray-900 text-white border-gray-900' : 'border-[#D1CBC5] hover:bg-white'}`}
                            >
                                <ArrowRightLeft size={11} /> Add to campaign
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                disabled={bulkDeleting}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-rose-200 hover:bg-rose-50 text-rose-700 disabled:opacity-50"
                            >
                                <Trash2 size={11} /> {bulkDeleting ? 'Removing…' : 'Remove'}
                            </button>
                            <button onClick={() => { setSelectedIds(new Set()); setBulkAction(null); }} className="p-1 rounded hover:bg-gray-100 text-gray-400">
                                <X size={12} />
                            </button>
                        </div>
                    </div>

                    {bulkAction === 'tag' && (
                        <div className="px-3 py-2.5 border-t border-[#E8E3DC] bg-white rounded-b-lg">
                            <div className="text-[0.65rem] text-gray-500 mb-1.5 font-semibold uppercase tracking-wide">Pick a tag to add</div>
                            {allTags.length === 0 ? (
                                <div className="text-xs text-gray-500">No tags created yet. Open the tag manager to create one.</div>
                            ) : (
                                <div className="flex flex-wrap gap-1.5">
                                    {allTags.map(t => (
                                        <button
                                            key={t.id}
                                            onClick={() => handleBulkTag(t.id)}
                                            disabled={bulkTagging}
                                            className="px-2 py-0.5 text-[0.7rem] rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                                        >
                                            {t.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {bulkAction === 'campaign' && (
                        <div className="px-3 py-2.5 border-t border-[#E8E3DC] bg-white rounded-b-lg flex items-center gap-2 flex-wrap">
                            <div className="text-[0.7rem] text-gray-700 font-semibold">Enroll in:</div>
                            <select
                                value={bulkCampaignId}
                                onChange={e => setBulkCampaignId(e.target.value)}
                                className="text-xs px-3 py-1.5 rounded-md bg-white"
                                style={{ border: '1px solid #D1CBC5' }}
                            >
                                <option value="">Select a LinkedIn campaign…</option>
                                {bulkCampaignOpts.map(c => (
                                    <option key={c.id} value={c.id}>{c.name} · {c.status}</option>
                                ))}
                            </select>
                            <button
                                onClick={handleBulkEnroll}
                                disabled={!bulkCampaignId || bulkEnrolling}
                                className="px-3 py-1.5 bg-gray-900 text-white rounded-md text-xs font-semibold disabled:opacity-50"
                            >
                                {bulkEnrolling ? 'Enrolling…' : 'Enroll'}
                            </button>
                        </div>
                    )}
                </div>
            )}

            <div className="premium-card !p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#D1CBC5]">
                                <th className="w-10 px-3 py-3">
                                    <input
                                        type="checkbox"
                                        checked={pageItems.length > 0 && pageItems.every(c => selectedIds.has(c.id))}
                                        onChange={toggleSelectAllVisible}
                                        className="cursor-pointer"
                                    />
                                </th>
                                {ALL_COLUMNS.filter(c => showCol(c.key)).map(c => (
                                    <th key={c.key}
                                        className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider ${c.width} ${c.align === 'center' ? 'text-center' : 'text-left'}`}>
                                        {c.label}
                                    </th>
                                ))}
                                <th className="w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={visibleCols.length + 2} className="px-4 py-10 text-center text-xs text-gray-500">
                                    Loading contacts…
                                </td></tr>
                            ) : fetchError ? (
                                <tr><td colSpan={visibleCols.length + 2} className="px-4 py-10 text-center text-xs text-rose-700">
                                    {fetchError} · <button onClick={() => void fetchContacts()} className="underline decoration-dotted">Retry</button>
                                </td></tr>
                            ) : pageItems.length === 0 ? (
                                <tr><td colSpan={visibleCols.length + 2} className="px-4 py-10 text-center text-xs text-gray-500">
                                    {filtered.length === 0 && contacts.length > 0
                                        ? 'No contacts match the current filters.'
                                        : 'No contacts yet — click Import contacts to add some.'}
                                </td></tr>
                            ) : pageItems.map(c => {
                                const status = STATUS_BADGE[c.connection_status];
                                return (
                                    <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-3 py-3">
                                            <input type="checkbox" checked={selectedIds.has(c.id)} onChange={() => toggleSelect(c.id)} className="cursor-pointer" />
                                        </td>
                                        {showCol('name') && (
                                            <td className="px-4 py-3">
                                                <div className="text-sm font-semibold text-gray-900">{c.name}</div>
                                                <a href={c.linkedin_url} target="_blank" rel="noreferrer"
                                                    className="text-[0.7rem] text-blue-600 hover:underline flex items-center gap-1 mt-0.5">
                                                    <Linkedin size={9} /> {c.linkedin_url.replace('https://linkedin.com/in/', '/in/')}
                                                </a>
                                            </td>
                                        )}
                                        {showCol('company') && (
                                            <td className="px-4 py-3">
                                                <div className="text-sm text-gray-900">{c.company || '—'}</div>
                                                <div className="text-[0.7rem] text-gray-500">{c.title || c.headline || ''}</div>
                                            </td>
                                        )}
                                        {showCol('connection') && (
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${status.tint}`}>
                                                    {status.label}
                                                </span>
                                                {c.via_account && (
                                                    <div className="text-[0.65rem] text-gray-500 mt-0.5">via {c.via_account}</div>
                                                )}
                                            </td>
                                        )}
                                        {showCol('email') && (
                                            <td className="px-4 py-3">
                                                <span className="text-xs text-gray-700 font-mono">{c.email || '—'}</span>
                                            </td>
                                        )}
                                        {showCol('phone') && (
                                            <td className="px-4 py-3">
                                                <span className="text-xs text-gray-700 font-mono">{c.phone || '—'}</span>
                                            </td>
                                        )}
                                        {showCol('source') && (
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.65rem] font-medium uppercase tracking-wide ${SOURCE_BADGE[c.source]}`}>
                                                    {c.source === 'sequencer' ? 'Sequencer' : c.source}
                                                </span>
                                            </td>
                                        )}
                                        {showCol('lead_score') && (
                                            <td className="px-4 py-3 text-center">
                                                <span className="text-sm font-semibold text-gray-900 tabular-nums">{c.lead_score}</span>
                                            </td>
                                        )}
                                        {showCol('tags') && (
                                            <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                                                <div className="flex items-center gap-1 flex-wrap">
                                                    <TagPillList
                                                        tags={c.tags}
                                                        onRemove={tid => updateContactTags(c.id, c.tags.filter(t => t.id !== tid).map(t => t.id))}
                                                        compact
                                                    />
                                                    <TagPicker
                                                        allTags={allTags}
                                                        selectedIds={c.tags.map(t => t.id)}
                                                        onChange={next => updateContactTags(c.id, next)}
                                                        onTagCreated={() => apiClient<{ tags: TagItem[] }>('/api/sequencer/tags').then(r => setAllTags(r?.tags || []))}
                                                        align="left"
                                                    />
                                                </div>
                                            </td>
                                        )}
                                        {showCol('campaigns') && (
                                            <td className="px-4 py-3 text-center">
                                                {c.campaign_count > 0
                                                    ? <span className="text-sm font-semibold text-blue-700">{c.campaign_count}</span>
                                                    : <span className="text-gray-400">—</span>}
                                            </td>
                                        )}
                                        {showCol('created') && (
                                            <td className="px-4 py-3">
                                                <span className="text-[0.7rem] text-gray-500">{new Date(c.created_at).toLocaleDateString()}</span>
                                            </td>
                                        )}
                                        <td className="px-2 py-3 text-right">
                                            <button className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700" title="Remove">
                                                <Trash2 size={12} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="px-4 py-2.5 border-t border-[#D1CBC5] flex items-center justify-between">
                        <span className="text-[0.65rem] text-gray-500">Showing {pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, filtered.length)} of {filtered.length}</span>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md hover:bg-gray-100 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed">
                                <ChevronLeft size={12} /> Prev
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                                <button key={n} onClick={() => setPage(n)}
                                    className={`w-7 h-7 rounded-md text-xs font-semibold transition-colors ${n === safePage ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
                                    {n}
                                </button>
                            ))}
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md hover:bg-gray-100 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed">
                                Next <ChevronRight size={12} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {showImport && (
                <ImportContactsModal
                    onClose={() => setShowImport(false)}
                    onImported={() => { setShowImport(false); void fetchContacts(); }}
                />
            )}
            {showTagManager && (
                <TagManagerModal
                    onClose={() => setShowTagManager(false)}
                    onChanged={() => { void apiClient<{ tags: TagItem[] }>('/api/sequencer/tags').then(r => setAllTags(r?.tags || [])); }}
                />
            )}
            {showAddContact && (
                <AddContactModal
                    onClose={() => setShowAddContact(false)}
                    onAdded={() => { setShowAddContact(false); void fetchContacts(); toast.success('Contact added'); }}
                    allTags={allTags}
                />
            )}
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────
// Import modal — direct sources (CSV), 6 contact databases (Apollo,
// Clay, Surfe, Lusha, Hunter, ZoomInfo), CRM (HubSpot/Salesforce), and
// the LinkedIn-specific "From Super Sequencer" pull.
// ────────────────────────────────────────────────────────────────────

interface ProviderCard {
    key: string;
    label: string;
    /** Path to an SVG under /public/brands. NULL falls back to the lucide icon. */
    logo?: string;
    /** Optional lucide icon used when there's no brand SVG (CSV upload). */
    fallbackIcon?: React.ReactNode;
    available: boolean;
    subtitle: string;
}

interface SequencerLead {
    id: string;
    email: string;
    full_name: string | null;
    company: string | null;
    title: string | null;
    linkedin_url: string | null;
}

interface LinkedInCampaignOpt {
    id: string;
    name: string;
    status: string;
}

function ImportContactsModal({ onClose, onImported }: { onClose: () => void; onImported: () => void }) {
    const [stage, setStage] = useState<'pick' | 'csv' | 'provider' | 'sequencer' | 'crm'>('pick');
    const [pickedProvider, setPickedProvider] = useState<string | null>(null);
    const [pickedCrm, setPickedCrm] = useState<Set<string>>(new Set());

    // CSV state.
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [csvParsing, setCsvParsing] = useState(false);
    const [csvUploading, setCsvUploading] = useState(false);

    // Sequencer-import state.
    const [seqLoading, setSeqLoading] = useState(false);
    const [seqLeads, setSeqLeads] = useState<SequencerLead[]>([]);
    const [seqSelectedIds, setSeqSelectedIds] = useState<Set<string>>(new Set());
    const [seqCampaigns, setSeqCampaigns] = useState<LinkedInCampaignOpt[]>([]);
    const [seqTargetCampaignId, setSeqTargetCampaignId] = useState<string>('');
    const [seqEnrolling, setSeqEnrolling] = useState(false);

    // Load sequencer-side leads + LinkedIn campaigns when the user picks
    // the "From Super Sequencer" stage. Both calls are cheap enough that
    // we hit them on every open of that stage — operator-facing fresh
    // data beats a stale cache.
    useEffect(() => {
        if (stage !== 'sequencer') return;
        let cancelled = false;
        setSeqLoading(true);
        Promise.all([
            apiClient<{ contacts: SequencerLead[]; meta: { total: number } }>(
                '/api/sequencer/contacts?limit=200',
            ),
            apiClient<{ data: LinkedInCampaignOpt[] } | LinkedInCampaignOpt[]>(
                '/api/sequencer/campaigns?channel=linkedin&limit=100',
            ).catch(() => ({ data: [] })),
        ]).then(([leadsResp, campResp]) => {
            if (cancelled) return;
            const list = Array.isArray(leadsResp?.contacts) ? leadsResp.contacts : [];
            // Only LinkedIn-targetable leads (must have a linkedin_url).
            setSeqLeads(list.filter(l => !!l.linkedin_url));
            const camps = Array.isArray(campResp) ? campResp : ((campResp as any)?.data ?? []);
            setSeqCampaigns(camps);
            if (camps.length > 0 && !seqTargetCampaignId) setSeqTargetCampaignId(camps[0].id);
        }).catch(() => {
            if (!cancelled) {
                setSeqLeads([]);
                setSeqCampaigns([]);
            }
        }).finally(() => { if (!cancelled) setSeqLoading(false); });
        return () => { cancelled = true; };
    // We intentionally don't depend on seqTargetCampaignId — it's set
    // inside this effect and we don't want a loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stage]);

    // ── CSV parse + upload ──────────────────────────────────────────
    // Minimal CSV parser: splits on newlines, expects header row with
    // at least `linkedin_url` (case-insensitive, snake-case). All
    // other columns are optional. Encoding is whatever the browser
    // hands us via FileReader — Excel-saved UTF-16 CSVs will land
    // here as garbled bytes, which is fine to fail loudly on.
    const parseCsv = (text: string): Array<Record<string, string>> => {
        const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
        if (lines.length < 2) return [];
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'));
        const rows: Array<Record<string, string>> = [];
        for (let i = 1; i < lines.length; i++) {
            // Naive split — doesn't handle commas inside quoted fields.
            // For richer CSVs we'd reach for papaparse; this covers the
            // vast majority of operator-pasted exports.
            const cells = lines[i].split(',').map(c => c.trim());
            const row: Record<string, string> = {};
            headers.forEach((h, idx) => { row[h] = cells[idx] ?? ''; });
            rows.push(row);
        }
        return rows;
    };

    const handleCsvUpload = async () => {
        if (!csvFile) return;
        setCsvParsing(true);
        try {
            const text = await csvFile.text();
            const rows = parseCsv(text);
            const valid = rows
                .filter(r => r.linkedin_url && /linkedin\.com\/in\//i.test(r.linkedin_url))
                .map(r => ({
                    linkedin_url: r.linkedin_url,
                    first_name: r.first_name || undefined,
                    last_name: r.last_name || undefined,
                    full_name: r.full_name || undefined,
                    company: r.company || undefined,
                    title: r.title || undefined,
                    email: r.email || undefined,
                    phone: r.phone || undefined,
                    source: 'csv',
                }));
            if (valid.length === 0) {
                toast.error('No valid rows found — every row must have a linkedin.com/in/<slug> URL.');
                setCsvParsing(false);
                return;
            }
            setCsvParsing(false);
            setCsvUploading(true);
            const resp = await apiClient<{ data: { created: number; updated: number; skipped: number } }>(
                '/api/linkedin/contacts/bulk',
                { method: 'POST', body: JSON.stringify({ contacts: valid }) },
            );
            toast.success(`Imported ${resp.data.created} new · ${resp.data.updated} updated · ${resp.data.skipped} skipped`);
            onImported();
        } catch (err: any) {
            toast.error(err?.message || 'CSV upload failed');
        } finally {
            setCsvParsing(false);
            setCsvUploading(false);
        }
    };

    // ── Sequencer enroll ────────────────────────────────────────────
    const handleSeqEnroll = async () => {
        if (seqSelectedIds.size === 0 || !seqTargetCampaignId) return;
        setSeqEnrolling(true);
        try {
            const resp = await apiClient<{ data: { enrolled: number; already_in_campaign: number; skipped_no_linkedin: number } }>(
                '/api/linkedin/contacts/enroll-in-campaign',
                {
                    method: 'POST',
                    body: JSON.stringify({
                        lead_ids: Array.from(seqSelectedIds),
                        campaign_id: seqTargetCampaignId,
                    }),
                },
            );
            const { enrolled, already_in_campaign, skipped_no_linkedin } = resp.data;
            toast.success(`Enrolled ${enrolled} · ${already_in_campaign} already in campaign · ${skipped_no_linkedin} skipped`);
            onImported();
        } catch (err: any) {
            toast.error(err?.message || 'Enroll failed');
        } finally {
            setSeqEnrolling(false);
        }
    };

    // Direct sources — CSV uses the lucide spreadsheet icon since it
    // isn't a vendor brand.
    const DIRECT: ProviderCard[] = [
        { key: 'csv',       label: 'Upload CSV',  available: true, subtitle: 'Drop a CSV file', fallbackIcon: <FileSpreadsheet size={20} className="text-emerald-600" /> },
    ];
    // Contact databases — official SVG logos under /brands/. Cards are
    // disabled until each provider's connection wizard ships; clicking
    // a not-connected card surfaces the same "Connect under Integrations"
    // pattern the sequencer modal uses.
    const DATABASES: ProviderCard[] = [
        { key: 'apollo',    label: 'Apollo',    logo: '/brands/apollo.svg',    available: false, subtitle: 'Not connected' },
        { key: 'clay',      label: 'Clay',      logo: '/brands/clay.svg',      available: false, subtitle: 'Not connected' },
        { key: 'surfe',     label: 'Surfe',     logo: '/brands/surfe.svg',     available: false, subtitle: 'Not connected' },
        { key: 'lusha',     label: 'Lusha',     logo: '/brands/lusha.svg',     available: false, subtitle: 'Not connected' },
        { key: 'hunter',    label: 'Hunter',    logo: '/brands/hunter.svg',    available: false, subtitle: 'Not connected' },
        { key: 'zoominfo',  label: 'ZoomInfo',  logo: '/brands/zoominfo.svg',  available: false, subtitle: 'Not connected' },
    ];
    const CRM: ProviderCard[] = [
        { key: 'hubspot',    label: 'HubSpot',    logo: '/brands/hubspot.svg',    available: false, subtitle: 'Not connected' },
        { key: 'salesforce', label: 'Salesforce', logo: '/brands/salesforce.svg', available: false, subtitle: 'Not connected' },
    ];
    const INTERNAL: ProviderCard[] = [
        { key: 'sequencer', label: 'From Super Sequencer', logo: '/brands/sequencer.svg', available: true, subtitle: 'Reuse contacts that have a LinkedIn URL' },
    ];

    const handlePick = (key: string) => {
        if (key === 'csv') setStage('csv');
        else if (key === 'sequencer') setStage('sequencer');
        else if (key === 'hubspot' || key === 'salesforce') {
            const n = new Set(pickedCrm); if (n.has(key)) n.delete(key); else n.add(key); setPickedCrm(n);
        } else {
            setPickedProvider(key);
            setStage('provider');
        }
    };

    const Card = ({ p, isToggle }: { p: ProviderCard; isToggle?: boolean }) => {
        const isPicked = isToggle && pickedCrm.has(p.key);
        return (
            <button
                onClick={() => p.available && handlePick(p.key)}
                disabled={!p.available}
                className="text-left p-3 rounded-xl hover:shadow-md transition-shadow flex flex-col gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none relative bg-white"
                style={{
                    border: `1px solid ${isPicked ? '#3B82F6' : '#D1CBC5'}`,
                    background: isPicked ? '#EFF6FF' : '#FFFFFF',
                }}
                title={!p.available ? `Connect ${p.label} under Integrations` : ''}
            >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden bg-white" style={{ border: '1px solid #F0EBE3' }}>
                    {p.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.logo} alt={p.label} className="w-7 h-7 object-contain" />
                    ) : (
                        p.fallbackIcon
                    )}
                </div>
                <div className="text-sm font-bold text-gray-900">{p.label}</div>
                <div className="text-[0.65rem] text-gray-500">{p.subtitle}</div>
            </button>
        );
    };

    if (typeof document === 'undefined') return null;
    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(15, 15, 15, 0.55)', backdropFilter: 'blur(2px)' }} onClick={onClose}>
            <div className="bg-white rounded-2xl w-[920px] max-w-[96vw] max-h-[92vh] overflow-hidden flex flex-col"
                style={{ border: '1px solid #D1CBC5', boxShadow: '0 12px 40px rgba(0,0,0,0.22), 0 4px 12px rgba(0,0,0,0.08)' }} onClick={e => e.stopPropagation()}>
                <div className="px-5 py-4 border-b border-[#D1CBC5] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {stage !== 'pick' && (
                            <button onClick={() => setStage('pick')} className="text-gray-400 hover:text-gray-700">
                                <ChevronLeft size={14} />
                            </button>
                        )}
                        <h2 className="text-base font-bold text-gray-900">
                            {stage === 'pick' ? 'Import contacts'
                                : stage === 'csv' ? 'Upload CSV'
                                : stage === 'sequencer' ? 'Pull from Super Sequencer'
                                : stage === 'crm' ? 'Pull from CRM'
                                : `Import from ${pickedProvider ? pickedProvider.charAt(0).toUpperCase() + pickedProvider.slice(1) : ''}`}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 text-gray-500"><X size={14} /></button>
                </div>

                <div className="flex-1 overflow-auto p-5">
                    {stage === 'pick' && (
                        <div className="flex flex-col gap-4">
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">Direct</div>
                                <div className="grid grid-cols-3 gap-2.5">{DIRECT.map(p => <Card key={p.key} p={p} />)}</div>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">Contact databases</div>
                                <div className="grid grid-cols-3 gap-2.5">{DATABASES.map(p => <Card key={p.key} p={p} />)}</div>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center justify-between">
                                    <span>CRM</span>
                                    <span className="text-[10px] text-gray-400 normal-case">Pick one or both</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2.5">{CRM.map(p => <Card key={p.key} p={p} isToggle />)}</div>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">Internal</div>
                                <div className="grid grid-cols-3 gap-2.5">{INTERNAL.map(p => <Card key={p.key} p={p} />)}</div>
                            </div>
                        </div>
                    )}

                    {stage === 'csv' && (
                        <div className="space-y-3">
                            <label className="block p-6 rounded-xl border-2 border-dashed border-[#D1CBC5] text-center cursor-pointer hover:bg-gray-50/50">
                                <FileSpreadsheet size={28} className="mx-auto text-gray-400 mb-2" />
                                <p className="text-sm font-medium text-gray-700">
                                    {csvFile ? csvFile.name : 'Click to select a CSV file'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Required: <code>linkedin_url</code>. Optional: <code>first_name</code>, <code>last_name</code>, <code>company</code>, <code>title</code>, <code>email</code>, <code>phone</code>.
                                </p>
                                <input
                                    type="file"
                                    accept=".csv,text/csv"
                                    onChange={e => setCsvFile(e.target.files?.[0] ?? null)}
                                    className="hidden"
                                />
                            </label>
                            {csvFile && (
                                <div className="text-[0.7rem] text-gray-500 px-1">
                                    {(csvFile.size / 1024).toFixed(1)} KB · Click upload to import
                                </div>
                            )}
                        </div>
                    )}

                    {stage === 'sequencer' && (
                        <div className="space-y-3">
                            <p className="text-sm text-gray-700">
                                Pick contacts from Super Sequencer (they already have a LinkedIn URL) and enroll them into a LinkedIn campaign.
                            </p>
                            <div className="rounded-lg p-3 bg-blue-50/60" style={{ border: '1px solid #BFDBFE' }}>
                                <p className="text-[0.75rem] text-blue-900">
                                    The Lead row is shared — tags, score, and history carry over automatically.
                                    Enrolling just upserts a CampaignLead row for each selected contact.
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-700 font-semibold">Target LinkedIn campaign:</label>
                                <select
                                    value={seqTargetCampaignId}
                                    onChange={e => setSeqTargetCampaignId(e.target.value)}
                                    className="text-xs px-3 py-1.5 rounded-lg bg-white"
                                    style={{ border: '1px solid #D1CBC5' }}
                                    disabled={seqCampaigns.length === 0}
                                >
                                    {seqCampaigns.length === 0 ? (
                                        <option value="">No LinkedIn campaigns yet</option>
                                    ) : seqCampaigns.map(c => (
                                        <option key={c.id} value={c.id}>{c.name} · {c.status}</option>
                                    ))}
                                </select>
                            </div>
                            {seqLoading ? (
                                <div className="text-xs text-gray-500 py-4 text-center">Loading eligible contacts…</div>
                            ) : seqLeads.length === 0 ? (
                                <div className="text-xs text-gray-500 py-4 text-center">
                                    No eligible contacts in Super Sequencer. Add contacts with LinkedIn URLs on the email side first.
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between text-xs text-gray-700">
                                        <span><strong>{seqLeads.length}</strong> eligible · <strong>{seqSelectedIds.size}</strong> selected</span>
                                        <button
                                            onClick={() => setSeqSelectedIds(seqSelectedIds.size === seqLeads.length ? new Set() : new Set(seqLeads.map(l => l.id)))}
                                            className="text-xs underline decoration-dotted"
                                        >
                                            {seqSelectedIds.size === seqLeads.length ? 'Clear' : 'Select all'}
                                        </button>
                                    </div>
                                    <div className="border border-[#D1CBC5] rounded-lg max-h-[300px] overflow-y-auto divide-y divide-gray-100">
                                        {seqLeads.map(l => {
                                            const checked = seqSelectedIds.has(l.id);
                                            return (
                                                <label key={l.id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={() => {
                                                            const n = new Set(seqSelectedIds);
                                                            if (checked) n.delete(l.id); else n.add(l.id);
                                                            setSeqSelectedIds(n);
                                                        }}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-xs font-semibold text-gray-900 truncate">
                                                            {l.full_name || l.email}
                                                        </div>
                                                        <div className="text-[0.65rem] text-gray-500 truncate">
                                                            {[l.title, l.company].filter(Boolean).join(' · ') || l.linkedin_url}
                                                        </div>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {stage === 'provider' && pickedProvider && (
                        <div className="space-y-3">
                            <p className="text-sm text-gray-700">
                                <strong className="capitalize">{pickedProvider}</strong> is not yet connected on this workspace.
                            </p>
                            <div className="p-3 rounded-lg bg-amber-50/60" style={{ border: '1px solid #FCD34D' }}>
                                <p className="text-[0.75rem] text-amber-900">
                                    Connect <strong className="capitalize">{pickedProvider}</strong> under <a href="/dashboard/integrations" className="underline font-semibold">Integrations → Contact Databases</a>.
                                    Once connected, you can pull lists, run searches, or trigger enrichment from here.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-5 py-3 border-t border-[#D1CBC5] flex items-center justify-end gap-2 bg-[#F7F2EB]/40">
                    <button onClick={onClose} className="px-3 py-2 text-sm font-semibold rounded-lg hover:bg-gray-100 text-gray-700">Cancel</button>
                    {stage === 'csv' && (
                        <button
                            onClick={handleCsvUpload}
                            disabled={!csvFile || csvParsing || csvUploading}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus size={13} /> {csvUploading ? 'Uploading…' : csvParsing ? 'Parsing…' : 'Upload CSV'}
                        </button>
                    )}
                    {stage === 'sequencer' && (
                        <button
                            onClick={handleSeqEnroll}
                            disabled={seqSelectedIds.size === 0 || !seqTargetCampaignId || seqEnrolling}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus size={13} /> {seqEnrolling ? 'Enrolling…' : `Enroll ${seqSelectedIds.size} contact${seqSelectedIds.size === 1 ? '' : 's'}`}
                        </button>
                    )}
                    {stage === 'provider' && (
                        <button disabled className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold opacity-50 cursor-not-allowed">
                            Connect under Integrations
                        </button>
                    )}
                </div>
            </div>
        </div>,
        document.body,
    );
}

// ────────────────────────────────────────────────────────────────────
// Add Contact modal — single-row create form. Mirrors the sequencer
// Add Contact UX: name + linkedin URL required, company/title/email/phone
// optional. Tag picker inline so the contact lands in the right buckets
// immediately.
// ────────────────────────────────────────────────────────────────────

function AddContactModal({ onClose, onAdded, allTags }: { onClose: () => void; onAdded: () => void; allTags: TagItem[] }) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [linkedinUrl, setLinkedinUrl] = useState('');
    const [company, setCompany] = useState('');
    const [title, setTitle] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [tagIds, setTagIds] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const valid = firstName.trim() && linkedinUrl.trim();

    const submit = async () => {
        if (!valid) return;
        setSubmitting(true);
        try {
            await apiClient('/api/linkedin/contacts', {
                method: 'POST',
                body: JSON.stringify({
                    first_name: firstName.trim(),
                    last_name: lastName.trim() || undefined,
                    full_name: (firstName.trim() + ' ' + lastName.trim()).trim(),
                    linkedin_url: linkedinUrl.trim(),
                    company: company.trim() || undefined,
                    title: title.trim() || undefined,
                    email: email.trim() || undefined,
                    phone: phone.trim() || undefined,
                    source: 'manual',
                    tags: tagIds,
                }),
            });
            onAdded();
        } catch (err: any) {
            toast.error(err?.message || 'Failed to add contact');
        } finally {
            setSubmitting(false);
        }
    };

    if (typeof document === 'undefined') return null;
    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(15, 15, 15, 0.55)', backdropFilter: 'blur(2px)' }} onClick={onClose}>
            <div className="bg-white rounded-2xl w-[520px] max-w-[92vw] overflow-hidden flex flex-col"
                style={{ border: '1px solid #D1CBC5', boxShadow: '0 12px 40px rgba(0,0,0,0.22), 0 4px 12px rgba(0,0,0,0.08)' }} onClick={e => e.stopPropagation()}>
                <div className="px-5 py-4 border-b border-[#D1CBC5] flex items-center justify-between">
                    <h2 className="text-base font-bold text-gray-900">Add Contact</h2>
                    <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 text-gray-500"><X size={14} /></button>
                </div>
                <div className="p-5 grid grid-cols-2 gap-3 text-xs">
                    <Field label="First name *" value={firstName} onChange={setFirstName} />
                    <Field label="Last name" value={lastName} onChange={setLastName} />
                    <div className="col-span-2">
                        <Field label="LinkedIn URL *" value={linkedinUrl} onChange={setLinkedinUrl} placeholder="https://linkedin.com/in/…" />
                    </div>
                    <Field label="Company" value={company} onChange={setCompany} />
                    <Field label="Title" value={title} onChange={setTitle} />
                    <Field label="Email" value={email} onChange={setEmail} />
                    <Field label="Phone" value={phone} onChange={setPhone} />
                    {allTags.length > 0 && (
                        <div className="col-span-2">
                            <div className="text-[0.65rem] uppercase tracking-wide text-gray-500 font-semibold mb-1">Tags</div>
                            <div className="flex flex-wrap gap-1.5">
                                {allTags.map(t => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => setTagIds(prev => prev.includes(t.id) ? prev.filter(x => x !== t.id) : [...prev, t.id])}
                                        className={`px-2 py-0.5 text-[0.65rem] rounded-full border ${tagIds.includes(t.id) ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300'}`}
                                    >
                                        {t.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="px-5 py-3 border-t border-[#D1CBC5] flex items-center justify-end gap-2 bg-[#F7F2EB]/40">
                    <button onClick={onClose} className="px-3 py-2 text-sm font-semibold rounded-lg hover:bg-gray-100 text-gray-700">Cancel</button>
                    <button onClick={submit} disabled={!valid || submitting}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed">
                        <Plus size={13} /> {submitting ? 'Adding…' : 'Add Contact'}
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
    return (
        <label className="flex flex-col gap-1">
            <span className="text-[0.65rem] uppercase tracking-wide text-gray-500 font-semibold">{label}</span>
            <input
                type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
                className="px-3 py-2 rounded-lg outline-none bg-white"
                style={{ border: '1px solid #D1CBC5' }}
            />
        </label>
    );
}

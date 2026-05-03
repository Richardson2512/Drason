'use client';

import { Suspense, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Upload, Download, Users, Trash2, ChevronLeft, ChevronRight, Loader2, Plus, X, ShieldCheck, Send, ChevronDown, Filter, Columns3, Tag as TagIcon } from 'lucide-react';
import { apiClient } from '@/lib/api';
import CustomSelect from '@/components/ui/CustomSelect';
import MultiSelectDropdown from '@/components/ui/MultiSelectDropdown';
import { DualEnrollmentModal, type DualEnrollmentReport } from '@/components/sequencer/DualEnrollmentModal';
import ImportLeadsModal, { type SpawnedJob } from '@/components/contacts/ImportLeadsModal';
import ImportProgressTray from '@/components/contacts/ImportProgressTray';
import TagManagerModal, { type TagItem, TagIconShape } from '@/components/sequencer/TagManagerModal';
import TagPicker, { TagPillList } from '@/components/sequencer/TagPicker';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
    { value: 'all', label: 'Sequence status: any' },
    { value: 'held', label: 'Held' },
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'replied', label: 'Replied' },
    { value: 'completed', label: 'Completed' },
    { value: 'blocked', label: 'Blocked' },
    { value: 'bounced', label: 'Bounced' },
];

const VALIDATION_OPTIONS = [
    { value: 'all', label: 'Email validation: any' },
    { value: 'valid', label: 'Valid' },
    { value: 'risky', label: 'Risky' },
    { value: 'invalid', label: 'Invalid' },
    { value: 'unknown', label: 'Unknown' },
    { value: 'pending', label: 'Pending' },
];

// Column registry. `defaultVisible` is the out-of-the-box set; user-customised
// visibility persists in localStorage under COLUMN_PREF_KEY.
const COLUMN_PREF_KEY = 'contacts.visibleColumns.v1';
const ALL_COLUMNS = [
    { key: 'email',       label: 'Email',             defaultVisible: true,  width: 'min-w-[220px]' },
    { key: 'name',        label: 'Name',              defaultVisible: true,  width: 'min-w-[140px]' },
    { key: 'company',     label: 'Company',           defaultVisible: true,  width: 'min-w-[140px]' },
    { key: 'title',       label: 'Title',             defaultVisible: true,  width: 'min-w-[140px]' },
    { key: 'source',      label: 'Source',            defaultVisible: false, width: 'min-w-[100px]' },
    { key: 'status',      label: 'Status',            defaultVisible: true,  width: 'min-w-[110px]' },
    { key: 'validation',  label: 'Validation',        defaultVisible: true,  width: 'min-w-[110px]' },
    { key: 'tags',        label: 'Tags',              defaultVisible: true,  width: 'min-w-[180px]' },
    { key: 'campaigns',   label: 'Campaigns history', defaultVisible: true,  width: 'min-w-[100px]' },
    { key: 'created',     label: 'Added',             defaultVisible: true,  width: 'min-w-[80px]'  },
] as const;
type ColumnKey = typeof ALL_COLUMNS[number]['key'];
const DEFAULT_VISIBLE_COLS: ColumnKey[] = ALL_COLUMNS.filter(c => c.defaultVisible).map(c => c.key);

interface Contact {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    full_name?: string | null;
    company: string | null;
    website?: string | null;
    title: string | null;
    persona?: string;
    source?: string;
    status: string;
    esp_bucket: string | null;
    validation_status?: string | null;
    validation_score?: number | null;
    lead_score?: number;
    campaign_count: number;
    current_step: number | null;
    tags?: Array<{ id: string; name: string; color: string | null }>;
    created_at: string;
}

interface ContactsMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

interface ContactsResponse {
    contacts: Contact[];
    meta: ContactsMeta;
}

const PAGE_SIZE = 50;

function ContactsPageContent() {
    const searchParams = useSearchParams();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [meta, setMeta] = useState<ContactsMeta>({ total: 0, page: 1, limit: PAGE_SIZE, totalPages: 1 });
    const [searchQuery, setSearchQuery] = useState(() => searchParams?.get('email') ?? '');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [statusFilter, setStatusFilter] = useState('all');
    const [validationFilter, setValidationFilter] = useState('all');
    const [companyFilter, setCompanyFilter] = useState<string[]>([]);
    const [titleFilter, setTitleFilter] = useState<string[]>([]);
    const [sourceFilter, setSourceFilter] = useState<string[]>([]);
    const [companyFacets, setCompanyFacets] = useState<Array<{ value: string; count: number }>>([]);
    const [titleFacets, setTitleFacets] = useState<Array<{ value: string; count: number }>>([]);
    const [sourceFacets, setSourceFacets] = useState<Array<{ value: string; count: number }>>([]);
    const [tagFilter, setTagFilter] = useState<string[]>([]);
    const [allTags, setAllTags] = useState<TagItem[]>([]);
    const [showTagManager, setShowTagManager] = useState(false);
    const [showBulkTagMenu, setShowBulkTagMenu] = useState(false);
    const bulkTagMenuRef = useRef<HTMLDivElement>(null);
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const filterMenuRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!showFilterMenu) return;
        const handler = (e: MouseEvent) => {
            if (filterMenuRef.current && !filterMenuRef.current.contains(e.target as Node)) {
                setShowFilterMenu(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showFilterMenu]);

    // Column picker — visibility persisted to localStorage.
    const [visibleCols, setVisibleCols] = useState<ColumnKey[]>(DEFAULT_VISIBLE_COLS);
    const [showColumnMenu, setShowColumnMenu] = useState(false);
    const columnMenuRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        try {
            const raw = localStorage.getItem(COLUMN_PREF_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw) as string[];
            const valid = parsed.filter((k): k is ColumnKey => ALL_COLUMNS.some(c => c.key === k));
            if (valid.length > 0) setVisibleCols(valid);
        } catch { /* ignore — fall back to defaults */ }
    }, []);
    const toggleColumn = (key: ColumnKey) => {
        setVisibleCols(prev => {
            const next = prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key];
            // Preserve the ALL_COLUMNS canonical order so the table doesn't reshuffle.
            const ordered = ALL_COLUMNS.filter(c => next.includes(c.key)).map(c => c.key);
            try { localStorage.setItem(COLUMN_PREF_KEY, JSON.stringify(ordered)); } catch { /* quota / private mode */ }
            return ordered;
        });
    };
    useEffect(() => {
        if (!showColumnMenu) return;
        const handler = (e: MouseEvent) => {
            if (columnMenuRef.current && !columnMenuRef.current.contains(e.target as Node)) {
                setShowColumnMenu(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showColumnMenu]);
    const visibleColDefs = useMemo(
        () => ALL_COLUMNS.filter(c => visibleCols.includes(c.key)),
        [visibleCols],
    );
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [assigning, setAssigning] = useState(false);

    // Add to Campaign dropdown
    const [showCampaignMenu, setShowCampaignMenu] = useState(false);
    const [campaignsList, setCampaignsList] = useState<Array<{ id: string; name: string; status: string }>>([]);
    const [loadingCampaigns, setLoadingCampaigns] = useState(false);
    const campaignMenuRef = useRef<HTMLDivElement>(null);

    // Dual-enrollment preview modal
    const [dualReport, setDualReport] = useState<DualEnrollmentReport | null>(null);
    const [pendingAssignCampaign, setPendingAssignCampaign] = useState<{ id: string; name: string } | null>(null);

    // Import Leads modal + progress tray
    const [showImportModal, setShowImportModal] = useState(false);
    const [importJobs, setImportJobs] = useState<SpawnedJob[]>([]);

    // Add Contact modal
    const [showAddModal, setShowAddModal] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [newFirstName, setNewFirstName] = useState('');
    const [newLastName, setNewLastName] = useState('');
    const [newCompany, setNewCompany] = useState('');
    const [newWebsite, setNewWebsite] = useState('');
    const [newTitle, setNewTitle] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newLinkedin, setNewLinkedin] = useState('');
    const [newSource, setNewSource] = useState('manual');
    const [creatingContact, setCreatingContact] = useState(false);

    // Debounce ref for search
    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchContacts = useCallback(async (
        page = 1,
        search = searchQuery,
        status = statusFilter,
        validation = validationFilter,
        companies = companyFilter,
        titles = titleFilter,
        sources = sourceFilter,
        tagIds = tagFilter,
    ) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(page),
                limit: String(PAGE_SIZE),
                search,
                status: status === 'all' ? '' : status,
                validation_status: validation === 'all' ? '' : validation,
                companies: companies.join(','),
                titles: titles.join(','),
                sources: sources.join(','),
                tag_ids: tagIds.join(','),
            });
            const res = await apiClient<any>(`/api/sequencer/contacts?${params}`);
            // Backend now returns { contacts, meta }. Fall back to other shapes just in case.
            const list = Array.isArray(res)
                ? res
                : (res?.contacts || res?.data || []);
            setContacts(list);
            setMeta(res?.meta || { total: list.length, page: 1, limit: PAGE_SIZE, totalPages: 1 });
            setSelectedIds(new Set());
        } catch {
            // apiClient handles toasts for mutations; for GET we stay silent
        } finally {
            setLoading(false);
        }
    }, [searchQuery, statusFilter, validationFilter, companyFilter, titleFilter, sourceFilter, tagFilter]);

    const fetchTags = useCallback(async () => {
        try {
            const res = await apiClient<{ tags: TagItem[] }>('/api/sequencer/tags');
            setAllTags(res?.tags || []);
        } catch {
            // non-fatal — tag UI just shows empty
        }
    }, []);

    // Facet loader — populates the company / title dropdowns with distinct values
    // from the org's contact pool. Refetches after CSV imports / bulk creates so
    // newly-added companies appear in the dropdown without a page reload.
    const fetchFacets = useCallback(async () => {
        try {
            const res = await apiClient<any>('/api/sequencer/contacts/facets');
            const data = res?.data || res;
            setCompanyFacets(data?.companies || []);
            setTitleFacets(data?.titles || []);
            setSourceFacets(data?.sources || []);
        } catch {
            // non-fatal — filter dropdowns just stay empty
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchContacts(1, '', 'all', 'all', [], [], [], []);
        fetchFacets();
        fetchTags();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Per-row tag mutation. Optimistic so the row visibly updates before
    // the network round-trip completes. Reverts and toasts on error.
    const setContactTags = async (contactId: string, tagIds: string[]) => {
        // Optimistic update
        const prev = contacts;
        const newTagSet = allTags.filter(t => tagIds.includes(t.id))
            .map(t => ({ id: t.id, name: t.name, color: t.color }));
        setContacts(curr => curr.map(c => c.id === contactId ? { ...c, tags: newTagSet } : c));
        try {
            await apiClient(`/api/sequencer/contacts/${contactId}/tags`, {
                method: 'PUT',
                body: JSON.stringify({ tagIds }),
            });
            // Refresh tag counts so the manager modal stays accurate
            fetchTags();
        } catch {
            setContacts(prev);
        }
    };

    const handleTagFilterChange = (next: string[]) => {
        setTagFilter(next);
        fetchContacts(1, searchQuery, statusFilter, validationFilter, companyFilter, titleFilter, sourceFilter, next);
    };

    const bulkApplyTag = async (tagId: string) => {
        if (selectedIds.size === 0) return;
        setShowBulkTagMenu(false);
        try {
            const res = await apiClient<{ affected: number }>('/api/sequencer/contacts/bulk-tag', {
                method: 'POST',
                body: JSON.stringify({ ids: Array.from(selectedIds), tagId, action: 'add' }),
            });
            const tag = allTags.find(t => t.id === tagId);
            toast.success(`Tagged ${res?.affected ?? 0} contact${res?.affected === 1 ? '' : 's'} with "${tag?.name || 'tag'}"`);
            await fetchContacts(meta.page);
            await fetchTags();
        } catch { /* auto-toast */ }
    };

    useEffect(() => {
        if (!showBulkTagMenu) return;
        const handler = (e: MouseEvent) => {
            if (bulkTagMenuRef.current && !bulkTagMenuRef.current.contains(e.target as Node)) {
                setShowBulkTagMenu(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showBulkTagMenu]);

    // Debounced search
    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
            fetchContacts(1, value, statusFilter, validationFilter, companyFilter, titleFilter, sourceFilter);
        }, 400);
    };

    // Status filter change
    const handleStatusFilterChange = (value: string) => {
        setStatusFilter(value);
        fetchContacts(1, searchQuery, value, validationFilter, companyFilter, titleFilter, sourceFilter);
    };

    const handleValidationFilterChange = (value: string) => {
        setValidationFilter(value);
        fetchContacts(1, searchQuery, statusFilter, value, companyFilter, titleFilter, sourceFilter);
    };

    const handleCompanyFilterChange = (next: string[]) => {
        setCompanyFilter(next);
        fetchContacts(1, searchQuery, statusFilter, validationFilter, next, titleFilter, sourceFilter);
    };

    const handleTitleFilterChange = (next: string[]) => {
        setTitleFilter(next);
        fetchContacts(1, searchQuery, statusFilter, validationFilter, companyFilter, next, sourceFilter);
    };

    const handleSourceFilterChange = (next: string[]) => {
        setSourceFilter(next);
        fetchContacts(1, searchQuery, statusFilter, validationFilter, companyFilter, titleFilter, next);
    };

    const clearFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setValidationFilter('all');
        setCompanyFilter([]);
        setTitleFilter([]);
        setSourceFilter([]);
        setTagFilter([]);
        fetchContacts(1, '', 'all', 'all', [], [], [], []);
    };

    const exportCSV = () => {
        const headers = ['email', 'first_name', 'last_name', 'company', 'title', 'status'];
        const rows = contacts.map(c => [c.email, c.first_name, c.last_name, c.company, c.title, c.status]);
        const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${(v || '').replace(/"/g, '""')}"`).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'contacts.csv'; a.click();
        URL.revokeObjectURL(url);
    };

    const toggleSelect = (id: string) => setSelectedIds(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
    });

    const toggleSelectAll = () => setSelectedIds(prev =>
        prev.size === contacts.length ? new Set() : new Set(contacts.map(c => c.id))
    );

    const createContact = async () => {
        if (!newEmail.trim() || !newEmail.includes('@')) {
            toast.error('Valid email address is required');
            return;
        }
        setCreatingContact(true);
        try {
            await apiClient('/api/sequencer/contacts', {
                method: 'POST',
                body: JSON.stringify({
                    email: newEmail.trim(),
                    first_name: newFirstName.trim() || undefined,
                    last_name: newLastName.trim() || undefined,
                    company: newCompany.trim() || undefined,
                    website: newWebsite.trim() || undefined,
                    title: newTitle.trim() || undefined,
                    phone: newPhone.trim() || undefined,
                    linkedin_url: newLinkedin.trim() || undefined,
                    source: newSource,
                }),
            });
            toast.success('Contact added to lead database');
            setShowAddModal(false);
            setNewEmail('');
            setNewFirstName('');
            setNewLastName('');
            setNewCompany('');
            setNewWebsite('');
            setNewTitle('');
            setNewPhone('');
            setNewLinkedin('');
            setNewSource('manual');
            await fetchContacts(1, searchQuery, statusFilter);
            fetchFacets();
        } catch {
            // apiClient auto-toasts the error (e.g. health gate rejection, duplicate email)
        } finally {
            setCreatingContact(false);
        }
    };

    const verifySelected = async () => {
        if (selectedIds.size === 0) return;
        setVerifying(true);
        try {
            const res = await apiClient<any>('/api/sequencer/contacts/validate', {
                method: 'POST',
                body: JSON.stringify({ ids: Array.from(selectedIds) }),
            });
            const valid = res?.valid ?? 0;
            const risky = res?.risky ?? 0;
            const invalid = res?.invalid ?? 0;
            const remaining = res?.credits_remaining;
            const summary = `Verified ${res?.processed || 0} — ${valid} valid, ${risky} risky, ${invalid} invalid`;
            toast.success(remaining !== null && remaining !== undefined ? `${summary}. ${remaining} credits left.` : summary);
            await fetchContacts(meta.page, searchQuery, statusFilter);
        } catch {
            // apiClient auto-toasts credit-exhausted (402) and other errors
        } finally {
            setVerifying(false);
        }
    };

    const openCampaignMenu = async () => {
        setShowCampaignMenu(v => !v);
        if (!showCampaignMenu && campaignsList.length === 0) {
            setLoadingCampaigns(true);
            try {
                const res = await apiClient<any>('/api/sequencer/campaigns?limit=100');
                const list = Array.isArray(res) ? res : (res?.campaigns || res?.data || []);
                setCampaignsList(list.filter((c: any) => c.status !== 'archived' && c.status !== 'completed'));
            } catch {
                // auto-toast
            } finally {
                setLoadingCampaigns(false);
            }
        }
    };

    /**
     * Two-step flow: preview first to surface dual-enrollment conflicts, then
     * commit with the operator's exclude_dual_enrolled choice. If the preview
     * shows zero conflicts and zero suppressed leads, we skip the modal and
     * commit immediately.
     */
    const assignToCampaign = async (campaignId: string) => {
        if (selectedIds.size === 0) return;
        const campaign = campaignsList.find(c => c.id === campaignId);
        if (!campaign) return;

        setAssigning(true);
        setShowCampaignMenu(false);
        try {
            const preview = await apiClient<{ report: DualEnrollmentReport }>(
                '/api/sequencer/contacts/assign-campaign/preview',
                {
                    method: 'POST',
                    body: JSON.stringify({ ids: Array.from(selectedIds), campaign_id: campaignId }),
                }
            );
            const report = preview?.report;
            if (!report) {
                throw new Error('Empty preview response');
            }

            const hasConflicts =
                report.activeConflictCount > 0 ||
                report.historicalConflictCount > 0 ||
                report.suppressedCount > 0;

            if (!hasConflicts) {
                // No conflicts — commit directly with default exclude=true (no-op anyway)
                await commitAssign(campaignId, true);
                return;
            }

            // Show modal — operator decides
            setDualReport(report);
            setPendingAssignCampaign({ id: campaignId, name: campaign.name });
        } catch {
            // auto-toast
            setAssigning(false);
        }
    };

    const commitAssign = async (campaignId: string, excludeDualEnrolled: boolean) => {
        try {
            const res = await apiClient<any>('/api/sequencer/contacts/assign-campaign', {
                method: 'POST',
                body: JSON.stringify({
                    ids: Array.from(selectedIds),
                    campaign_id: campaignId,
                    exclude_dual_enrolled: excludeDualEnrolled,
                }),
            });
            const added = res?.added ?? 0;
            const skipped = res?.skipped_duplicates ?? 0;
            const blocked = res?.blocked_red ?? 0;
            const excludedDual = res?.excluded_dual_enrolled ?? 0;
            const parts = [`${added} added`];
            if (skipped > 0) parts.push(`${skipped} already in campaign`);
            if (blocked > 0) parts.push(`${blocked} blocked (health)`);
            if (excludedDual > 0) parts.push(`${excludedDual} excluded (dual-enrolled)`);
            toast.success(parts.join(', '));
            setDualReport(null);
            setPendingAssignCampaign(null);
            await fetchContacts(meta.page, searchQuery, statusFilter);
        } catch {
            // auto-toast
        } finally {
            setAssigning(false);
        }
    };

    const cancelDualEnrollment = () => {
        setDualReport(null);
        setPendingAssignCampaign(null);
        setAssigning(false);
    };

    // Close campaign menu on outside click
    useEffect(() => {
        if (!showCampaignMenu) return;
        const handler = (e: MouseEvent) => {
            if (campaignMenuRef.current && !campaignMenuRef.current.contains(e.target as Node)) {
                setShowCampaignMenu(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showCampaignMenu]);

    const deleteSelected = async () => {
        if (selectedIds.size === 0) return;
        setDeleting(true);
        try {
            await apiClient('/api/sequencer/contacts/delete', {
                method: 'POST',
                body: JSON.stringify({ ids: Array.from(selectedIds) }),
            });
            // Refetch current page after deletion
            await fetchContacts(meta.page, searchQuery, statusFilter);
            fetchFacets();
        } catch {
            // apiClient auto-toasts on mutation errors
        } finally {
            setDeleting(false);
        }
    };

    const goToPage = (page: number) => {
        if (page < 1 || page > meta.totalPages) return;
        fetchContacts(page, searchQuery, statusFilter);
    };

    const displayName = (c: Contact) => {
        const name = [c.first_name, c.last_name].filter(Boolean).join(' ');
        return name || '—';
    };

    return (
        <div className="p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Contacts</h1>
                    <p className="text-xs text-gray-500 mt-0.5">{meta.total.toLocaleString()} contacts</p>
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
                    <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer border border-[#D1CBC5] hover:bg-gray-50">
                        <Upload size={12} /> Export
                    </button>
                    <button
                        onClick={() => setShowImportModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer border border-[#D1CBC5] hover:bg-gray-50"
                    >
                        <Download size={12} />
                        Import Leads
                    </button>
                    <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg cursor-pointer hover:bg-gray-800">
                        <Plus size={12} /> Add Contact
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
                <div className="relative flex-1 max-w-sm min-w-[220px]">
                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => handleSearchChange(e.target.value)}
                        placeholder="Search by email, name, or company..."
                        className="w-full pl-7 pr-7 py-1.5 text-xs rounded-lg outline-none border border-[#D1CBC5]"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => handleSearchChange('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                            aria-label="Clear search"
                        >
                            <X size={11} />
                        </button>
                    )}
                </div>

                {/* Filter button — opens a popover with the categorical
                    enum filters (Sequence status + Email validation). Keeps
                    the main row uncluttered for the high-cardinality entity
                    filters next to it. Active count badge appears when any
                    enum filter is set so the operator can see at a glance. */}
                <div ref={filterMenuRef} className="relative">
                    {(() => {
                        const activeCount =
                            (statusFilter !== 'all' ? 1 : 0) +
                            (validationFilter !== 'all' ? 1 : 0);
                        return (
                            <button
                                type="button"
                                onClick={() => setShowFilterMenu(v => !v)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer hover:bg-gray-50 ${
                                    activeCount > 0 ? 'text-gray-900' : 'text-gray-700'
                                }`}
                                style={{ border: `1px solid ${activeCount > 0 ? '#111827' : '#D1CBC5'}` }}
                            >
                                <Filter size={12} /> Filter
                                {activeCount > 0 && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-900 text-white tabular-nums">
                                        {activeCount}
                                    </span>
                                )}
                                <ChevronDown size={11} style={{ transform: showFilterMenu ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }} />
                            </button>
                        );
                    })()}
                    {showFilterMenu && (
                        <div
                            className="absolute left-0 top-full mt-1 w-72 bg-white rounded-lg shadow-lg z-50 p-3 flex flex-col gap-3"
                            style={{ border: '1px solid #D1CBC5' }}
                        >
                            <div>
                                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                    Sequence status
                                </label>
                                <CustomSelect
                                    value={statusFilter}
                                    onChange={handleStatusFilterChange}
                                    options={STATUS_OPTIONS}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                    Email validation
                                </label>
                                <CustomSelect
                                    value={validationFilter}
                                    onChange={handleValidationFilterChange}
                                    options={VALIDATION_OPTIONS}
                                />
                            </div>
                            {(statusFilter !== 'all' || validationFilter !== 'all') && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleStatusFilterChange('all');
                                        handleValidationFilterChange('all');
                                    }}
                                    className="text-[11px] text-gray-500 hover:text-gray-900 underline decoration-dotted self-start"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="w-[180px]">
                    <MultiSelectDropdown
                        options={companyFacets.map(f => ({ value: f.value, label: `${f.value} (${f.count})` }))}
                        selected={companyFilter}
                        onChange={handleCompanyFilterChange}
                        placeholder="All companies"
                        searchable
                        searchPlaceholder="Search companies…"
                    />
                </div>
                <div className="w-[180px]">
                    <MultiSelectDropdown
                        options={titleFacets.map(f => ({ value: f.value, label: `${f.value} (${f.count})` }))}
                        selected={titleFilter}
                        onChange={handleTitleFilterChange}
                        placeholder="All titles"
                        searchable
                        searchPlaceholder="Search titles…"
                    />
                </div>
                <div className="w-[160px]">
                    <MultiSelectDropdown
                        options={sourceFacets.map(f => ({ value: f.value, label: `${sourceMeta(f.value).label} (${f.count})` }))}
                        selected={sourceFilter}
                        onChange={handleSourceFilterChange}
                        placeholder="All sources"
                        searchable
                        searchPlaceholder="Search sources…"
                    />
                </div>
                <div className="w-[160px]">
                    <MultiSelectDropdown
                        options={allTags.map(t => ({
                            value: t.id,
                            // Surface-specific count: this is the contacts
                            // page, so the parenthetical reflects how many
                            // CONTACTS carry the tag. Campaigns page uses
                            // campaign_count for the same dropdown.
                            label: `${t.name} (${t.contact_count})`,
                            icon: <TagIconShape color={t.color || '#6B7280'} size={12} />,
                        }))}
                        selected={tagFilter}
                        onChange={handleTagFilterChange}
                        placeholder="All tags"
                        searchable
                        searchPlaceholder="Search tags…"
                    />
                </div>

                {(statusFilter !== 'all' || validationFilter !== 'all' || searchQuery || companyFilter.length > 0 || titleFilter.length > 0 || sourceFilter.length > 0 || tagFilter.length > 0) && (
                    <button
                        type="button"
                        onClick={clearFilters}
                        className="text-[11px] text-gray-500 hover:text-gray-900 underline decoration-dotted"
                    >
                        Clear
                    </button>
                )}

            </div>

            {/* Bulk-action row — only renders when contacts are selected.
                Lives on its own line below the filters so it doesn't compete
                with the filter dropdowns for horizontal space. Pre-pends a
                "N selected" indicator so the operator sees the scope of the
                action they're about to apply. */}
            {selectedIds.size > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-semibold text-gray-700 mr-1">
                        {selectedIds.size} selected
                    </span>
                    <div ref={bulkTagMenuRef} className="relative">
                        <button
                            onClick={() => setShowBulkTagMenu(v => !v)}
                            disabled={verifying || assigning || allTags.length === 0}
                            title={allTags.length === 0 ? 'No tags yet — create one in "Manage tags" first' : 'Apply a tag to selected'}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-700 rounded-lg cursor-pointer border border-[#D1CBC5] hover:bg-gray-50 disabled:opacity-50"
                        >
                            <TagIcon size={11} /> Tag
                            <ChevronDown size={11} />
                        </button>
                        {showBulkTagMenu && (
                            <div className="absolute left-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg z-50 max-h-72 overflow-y-auto" style={{ border: '1px solid #D1CBC5' }}>
                                <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-500 uppercase" style={{ borderBottom: '1px solid #E8E3DC' }}>
                                    Apply tag to {selectedIds.size}
                                </div>
                                {allTags.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => bulkApplyTag(t.id)}
                                        className="w-full text-left px-3 py-2 text-xs cursor-pointer transition-colors hover:bg-[#F5F1EA] flex items-center gap-2.5"
                                        style={{ borderBottom: '1px solid #F0EBE3', color: '#4B5563' }}
                                    >
                                        <span className="shrink-0 flex items-center">
                                            <TagIconShape color={t.color || '#6B7280'} size={12} />
                                        </span>
                                        <span className="truncate">{t.name} ({t.contact_count})</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={verifySelected}
                        disabled={verifying || assigning}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-700 rounded-lg cursor-pointer border border-[#D1CBC5] hover:bg-gray-50 disabled:opacity-50"
                    >
                        {verifying ? <Loader2 size={11} className="animate-spin" /> : <ShieldCheck size={11} />} Verify Email
                    </button>
                    <div ref={campaignMenuRef} className="relative">
                        <button
                            onClick={openCampaignMenu}
                            disabled={verifying || assigning}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-800 disabled:opacity-50"
                        >
                            {assigning ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />} Add to Campaign
                            <ChevronDown size={11} />
                        </button>
                        {showCampaignMenu && (
                            <div className="absolute left-0 top-full mt-1 w-64 bg-white rounded-lg shadow-lg z-50 max-h-72 overflow-y-auto" style={{ border: '1px solid #D1CBC5' }}>
                                {loadingCampaigns ? (
                                    <div className="flex items-center justify-center py-6">
                                        <Loader2 size={14} className="animate-spin text-gray-400" />
                                    </div>
                                ) : campaignsList.length === 0 ? (
                                    <div className="p-3 text-[11px] text-gray-500 text-center">
                                        No campaigns available. Create one first.
                                    </div>
                                ) : (
                                    <>
                                        <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-500 uppercase" style={{ borderBottom: '1px solid #E8E3DC' }}>
                                            Select Campaign
                                        </div>
                                        {campaignsList.map(c => (
                                            <button
                                                key={c.id}
                                                onClick={() => assignToCampaign(c.id)}
                                                className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 cursor-pointer flex items-center justify-between gap-2"
                                            >
                                                <span className="truncate text-gray-900">{c.name}</span>
                                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold capitalize flex-shrink-0 ${
                                                    c.status === 'active' ? 'bg-green-50 text-green-700' :
                                                    c.status === 'paused' ? 'bg-yellow-50 text-yellow-700' :
                                                    'bg-gray-100 text-gray-600'
                                                }`}>{c.status}</span>
                                            </button>
                                        ))}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                    <button onClick={deleteSelected} disabled={deleting || verifying || assigning} className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-600 rounded-lg cursor-pointer border border-red-200 hover:bg-red-50 disabled:opacity-50">
                        {deleting ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />} Delete
                    </button>
                </div>
            )}

            {/* Table */}
            {loading && contacts.length === 0 ? (
                <div className="premium-card flex flex-col items-center justify-center py-16">
                    <Loader2 size={24} className="text-gray-400 animate-spin mb-3" />
                    <p className="text-xs text-gray-500">Loading contacts...</p>
                </div>
            ) : !loading && contacts.length === 0 && !searchQuery ? (
                <div className="premium-card flex flex-col items-center justify-center py-16">
                    <Users size={28} className="text-gray-300 mb-3" />
                    <h2 className="text-sm font-bold text-gray-900 mb-1">No contacts yet</h2>
                    <p className="text-xs text-gray-500 text-center max-w-md mb-4">Import leads from CSV, Apollo, or your CRM, or add contacts when creating campaigns. All contacts across campaigns are accessible here.</p>
                    <button
                        onClick={() => setShowImportModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-semibold cursor-pointer hover:bg-gray-800"
                    >
                        <Download size={13} />
                        Import Leads
                    </button>
                </div>
            ) : !loading && contacts.length === 0 && searchQuery ? (
                <div className="premium-card flex flex-col items-center justify-center py-16">
                    <Search size={28} className="text-gray-300 mb-3" />
                    <h2 className="text-sm font-bold text-gray-900 mb-1">No results</h2>
                    <p className="text-xs text-gray-500 text-center max-w-md">No contacts match &ldquo;{searchQuery}&rdquo;. Try a different search term.</p>
                </div>
            ) : (
                <>
                    <div className="premium-card p-0 overflow-hidden relative">
                        {loading && (
                            <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
                                <Loader2 size={20} className="text-gray-400 animate-spin" />
                            </div>
                        )}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #D1CBC5', background: '#F7F2EB' }}>
                                        <th className="px-3 py-2 w-8"><input type="checkbox" checked={selectedIds.size === contacts.length && contacts.length > 0} onChange={toggleSelectAll} className="cursor-pointer" /></th>
                                        {visibleColDefs.map(col => (
                                            <th
                                                key={col.key}
                                                className={`px-3 py-2 text-[10px] font-semibold text-gray-500 ${col.width}`}
                                                title={col.key === 'campaigns' ? 'Number of campaigns this contact has ever been enrolled in (lifetime, not concurrent)' : undefined}
                                            >
                                                {col.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {contacts.map(c => (
                                        <tr key={c.id} className="hover:bg-[#F5F1EA] transition-colors" style={{ borderBottom: '1px solid #E8E3DC' }}>
                                            <td className="px-3 py-1.5">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.has(c.id)}
                                                    onChange={() => toggleSelect(c.id)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="cursor-pointer"
                                                />
                                            </td>
                                            {visibleColDefs.map(col => (
                                                <td key={col.key} className={`px-3 py-1.5 ${col.width}`}>
                                                    {renderCell(col.key, c, displayName, {
                                                        allTags,
                                                        onTagsChange: setContactTags,
                                                        onTagCreated: fetchTags,
                                                    })}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {meta.totalPages > 1 && (
                        <div className="flex items-center justify-between px-1">
                            <p className="text-[10px] text-gray-500">
                                Showing {((meta.page - 1) * meta.limit) + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total.toLocaleString()}
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => goToPage(meta.page - 1)}
                                    disabled={meta.page <= 1 || loading}
                                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    <ChevronLeft size={14} className="text-gray-600" />
                                </button>
                                <span className="text-[10px] text-gray-600 px-2">
                                    Page {meta.page} of {meta.totalPages}
                                </span>
                                <button
                                    onClick={() => goToPage(meta.page + 1)}
                                    disabled={meta.page >= meta.totalPages || loading}
                                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    <ChevronRight size={14} className="text-gray-600" />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Add Contact Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" onClick={e => { if (e.target === e.currentTarget && !creatingContact) setShowAddModal(false); }}>
                    <div className="bg-white rounded-xl w-[90%] max-w-xl max-h-[90vh] overflow-y-auto" style={{ border: '1px solid #D1CBC5' }}>
                        <div className="p-4 flex items-center justify-between sticky top-0 bg-white z-10" style={{ borderBottom: '1px solid #D1CBC5' }}>
                            <h2 className="text-sm font-bold text-gray-900">Add Contact</h2>
                            <button onClick={() => !creatingContact && setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer bg-transparent border-none"><X size={16} /></button>
                        </div>
                        <div className="p-4 flex flex-col gap-3">
                            <div>
                                <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Email *</label>
                                <input
                                    type="email"
                                    value={newEmail}
                                    onChange={e => setNewEmail(e.target.value)}
                                    placeholder="john@acme.com"
                                    autoFocus
                                    className="w-full px-3 py-2 text-xs rounded-lg outline-none"
                                    style={{ border: '1px solid #D1CBC5' }}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">First Name</label>
                                    <input
                                        type="text"
                                        value={newFirstName}
                                        onChange={e => setNewFirstName(e.target.value)}
                                        placeholder="John"
                                        className="w-full px-3 py-2 text-xs rounded-lg outline-none"
                                        style={{ border: '1px solid #D1CBC5' }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        value={newLastName}
                                        onChange={e => setNewLastName(e.target.value)}
                                        placeholder="Smith"
                                        className="w-full px-3 py-2 text-xs rounded-lg outline-none"
                                        style={{ border: '1px solid #D1CBC5' }}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Company</label>
                                    <input
                                        type="text"
                                        value={newCompany}
                                        onChange={e => setNewCompany(e.target.value)}
                                        placeholder="Acme Corp"
                                        className="w-full px-3 py-2 text-xs rounded-lg outline-none"
                                        style={{ border: '1px solid #D1CBC5' }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={newTitle}
                                        onChange={e => setNewTitle(e.target.value)}
                                        placeholder="Head of Sales"
                                        className="w-full px-3 py-2 text-xs rounded-lg outline-none"
                                        style={{ border: '1px solid #D1CBC5' }}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Website</label>
                                    <input
                                        type="text"
                                        value={newWebsite}
                                        onChange={e => setNewWebsite(e.target.value)}
                                        placeholder="acme.com"
                                        className="w-full px-3 py-2 text-xs rounded-lg outline-none"
                                        style={{ border: '1px solid #D1CBC5' }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Source</label>
                                    <input
                                        type="text"
                                        value={newSource}
                                        onChange={e => setNewSource(e.target.value)}
                                        placeholder="manual, referral, linkedin..."
                                        className="w-full px-3 py-2 text-xs rounded-lg outline-none"
                                        style={{ border: '1px solid #D1CBC5' }}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        value={newPhone}
                                        onChange={e => setNewPhone(e.target.value)}
                                        placeholder="+1 555 123 4567"
                                        className="w-full px-3 py-2 text-xs rounded-lg outline-none"
                                        style={{ border: '1px solid #D1CBC5' }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">LinkedIn</label>
                                    <input
                                        type="url"
                                        value={newLinkedin}
                                        onChange={e => setNewLinkedin(e.target.value)}
                                        placeholder="https://linkedin.com/in/..."
                                        className="w-full px-3 py-2 text-xs rounded-lg outline-none"
                                        style={{ border: '1px solid #D1CBC5' }}
                                    />
                                </div>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">
                                Contact runs through the health gate (syntax + disposable + role check) on save. It becomes available in the campaign creation wizard&apos;s &ldquo;From Lead Database&rdquo; tab.
                            </p>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    disabled={creatingContact}
                                    className="px-4 py-1.5 text-xs text-gray-600 rounded-lg cursor-pointer disabled:opacity-50"
                                    style={{ border: '1px solid #D1CBC5' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={createContact}
                                    disabled={creatingContact || !newEmail.trim()}
                                    className="px-4 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg cursor-pointer hover:bg-gray-800 disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    {creatingContact && <Loader2 size={11} className="animate-spin" />}
                                    {creatingContact ? 'Adding...' : 'Add Contact'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {dualReport && pendingAssignCampaign && (
                <DualEnrollmentModal
                    open
                    campaignName={pendingAssignCampaign.name}
                    report={dualReport}
                    submitting={assigning}
                    onConfirm={(excludeDualEnrolled) => commitAssign(pendingAssignCampaign.id, excludeDualEnrolled)}
                    onCancel={cancelDualEnrollment}
                />
            )}

            <ImportLeadsModal
                open={showImportModal}
                onClose={() => setShowImportModal(false)}
                onCsvImported={() => {
                    fetchContacts(1, searchQuery, statusFilter);
                    fetchFacets();
                }}
                onJobsSpawned={(spawned) => setImportJobs((prev) => [...prev, ...spawned])}
            />

            <ImportProgressTray
                jobs={importJobs}
                onRemove={(id) => setImportJobs((prev) => prev.filter((j) => j.id !== id))}
                onAnyCompleted={() => {
                    fetchContacts(meta.page, searchQuery, statusFilter);
                    fetchFacets();
                }}
            />

            {showTagManager && (
                <TagManagerModal
                    onClose={() => setShowTagManager(false)}
                    onChanged={() => { fetchTags(); fetchContacts(meta.page); }}
                />
            )}
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────
// Cell renderer — single source of truth for how each column displays.
// Keeps the table JSX flat and lets new columns be added by extending
// ALL_COLUMNS + this switch, no other changes required.
// ────────────────────────────────────────────────────────────────────

interface RenderCellContext {
    allTags: TagItem[];
    onTagsChange: (contactId: string, tagIds: string[]) => Promise<void>;
    onTagCreated: () => Promise<void>;
}

function renderCell(
    key: ColumnKey,
    c: Contact,
    displayName: (c: Contact) => string,
    ctx: RenderCellContext,
) {
    switch (key) {
        case 'email':
            return (
                <Link
                    href={`/dashboard/sequencer/contacts/${c.id}`}
                    className="text-gray-900 font-medium hover:text-blue-700 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                >
                    {c.email}
                </Link>
            );
        case 'name':
            return <span className="text-gray-600">{displayName(c)}</span>;
        case 'company':
            return <span className="text-gray-600">{c.company || '—'}</span>;
        case 'title':
            return <span className="text-gray-600">{c.title || '—'}</span>;
        case 'source':
            return <SourcePill source={c.source} />;
        case 'status':
            return (
                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold capitalize ${
                    c.status === 'active' ? 'bg-green-50 text-green-700' :
                    c.status === 'bounced' ? 'bg-red-50 text-red-600' :
                    c.status === 'replied' ? 'bg-blue-50 text-blue-700' :
                    c.status === 'unsubscribed' ? 'bg-orange-50 text-orange-600' :
                    c.status === 'held' ? 'bg-blue-50 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                }`}>{c.status === 'held' ? 'Available' : c.status}</span>
            );
        case 'validation':
            return <ValidationPill status={c.validation_status} score={c.validation_score} />;
        case 'tags': {
            const tags = c.tags || [];
            const tagIds = tags.map(t => t.id);
            // The trigger overlays the existing pills so the operator can
            // click anywhere in the cell to open the picker.
            return (
                <div className="flex items-center gap-1 flex-wrap" onClick={e => e.stopPropagation()}>
                    {tags.length > 0 && (
                        <TagPillList
                            tags={tags}
                            onRemove={(id) => ctx.onTagsChange(c.id, tagIds.filter(t => t !== id))}
                            compact
                        />
                    )}
                    <TagPicker
                        allTags={ctx.allTags}
                        selectedIds={tagIds}
                        onChange={(next) => ctx.onTagsChange(c.id, next)}
                        onTagCreated={ctx.onTagCreated}
                        align="left"
                    />
                </div>
            );
        }
        case 'campaigns':
            return <span className="text-gray-500">{c.campaign_count || 0}</span>;
        case 'created':
            return <span className="text-gray-400">{new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>;
        default:
            return null;
    }
}

function ValidationPill({ status, score }: { status?: string | null; score?: number | null }) {
    if (!status) return <span className="text-gray-300 text-[11px]">—</span>;
    const colors: Record<string, { bg: string; fg: string }> = {
        valid:   { bg: '#F0FDF4', fg: '#15803D' },
        risky:   { bg: '#FFFBEB', fg: '#B45309' },
        invalid: { bg: '#FEF2F2', fg: '#B91C1C' },
        unknown: { bg: '#F1F5F9', fg: '#475569' },
        pending: { bg: '#EFF6FF', fg: '#1D4ED8' },
    };
    const c = colors[status] || colors.unknown;
    return (
        <span
            className="inline-block text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
            style={{ background: c.bg, color: c.fg }}
            title={typeof score === 'number' ? `Score: ${score}` : status}
        >
            {status}
        </span>
    );
}

// ────────────────────────────────────────────────────────────────────
// Source pill — color-coded provenance indicator on each contact row.
// Mirrors the labels used on the campaign detail page's Lead Sources panel
// so the same source reads the same way across the sequencer.
// ────────────────────────────────────────────────────────────────────

function SourcePill({ source }: { source?: string }) {
    if (!source) return <span className="text-gray-300 text-[11px]">—</span>;
    const meta = sourceMeta(source);
    return (
        <span
            className="inline-block text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border"
            style={{ background: meta.bg, color: meta.fg, borderColor: meta.border }}
            title={source}
        >
            {meta.label}
        </span>
    );
}

function sourceMeta(source: string): { label: string; bg: string; fg: string; border: string } {
    // Worker-side imports tag rows with `${provider}_import` (e.g. apollo_import,
    // hubspot_import). Strip the suffix so the pill colour matches the provider.
    const normalized = source.toLowerCase().replace(/_import$/, '');
    switch (normalized) {
        case 'csv':       return { label: 'CSV',      bg: '#EFF6FF', fg: '#1D4ED8', border: '#BFDBFE' };
        case 'clay':      return { label: 'Clay',     bg: '#F0FDF4', fg: '#15803D', border: '#BBF7D0' };
        case 'database':
        case 'library':   return { label: 'Library',  bg: '#F5F3FF', fg: '#6D28D9', border: '#DDD6FE' };
        case 'crm':       return { label: 'CRM',      bg: '#FEF3C7', fg: '#92400E', border: '#FDE68A' };
        case 'hubspot':   return { label: 'HubSpot',  bg: '#FEF3C7', fg: '#92400E', border: '#FDE68A' };
        case 'salesforce':return { label: 'Salesforce', bg: '#FEF3C7', fg: '#92400E', border: '#FDE68A' };
        case 'api':       return { label: 'API',      bg: '#F1F5F9', fg: '#334155', border: '#E2E8F0' };
        case 'manual':    return { label: 'Manual',   bg: '#F5F5F4', fg: '#57534E', border: '#E7E5E4' };
        case 'apollo':    return { label: 'Apollo',   bg: '#FEF2F2', fg: '#9F1239', border: '#FECDD3' };
        case 'zoominfo':  return { label: 'ZoomInfo', bg: '#FEF2F2', fg: '#9F1239', border: '#FECDD3' };
        default:          return { label: source.length > 12 ? source.slice(0, 10) + '…' : source.toUpperCase(), bg: '#F5F5F4', fg: '#57534E', border: '#E7E5E4' };
    }
}

// Suspense wrapper — required by Next.js 16 because ContactsPageContent calls
// useSearchParams() (to pre-fill the search box from `?email=` when the user
// arrives from the cold-call-list View link). Without the boundary, the
// production build's static-page generator (`next build`) bails out with
// "useSearchParams() should be wrapped in a suspense boundary at page".
export default function ContactsPage() {
    return (
        <Suspense fallback={null}>
            <ContactsPageContent />
        </Suspense>
    );
}

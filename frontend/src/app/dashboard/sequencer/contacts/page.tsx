'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Upload, Download, Users, Trash2, ChevronLeft, ChevronRight, Loader2, Plus, X, ShieldCheck, Send, ChevronDown, Filter } from 'lucide-react';
import { apiClient } from '@/lib/api';
import CustomSelect from '@/components/ui/CustomSelect';
import MultiSelectDropdown from '@/components/ui/MultiSelectDropdown';
import toast from 'react-hot-toast';
import Papa from 'papaparse';

const STATUS_OPTIONS = [
    { value: 'all', label: 'All statuses' },
    { value: 'held', label: 'Held' },
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'replied', label: 'Replied' },
    { value: 'completed', label: 'Completed' },
    { value: 'blocked', label: 'Blocked' },
    { value: 'bounced', label: 'Bounced' },
];

const VALIDATION_OPTIONS = [
    { value: 'all', label: 'All validations' },
    { value: 'valid', label: 'Valid' },
    { value: 'risky', label: 'Risky' },
    { value: 'invalid', label: 'Invalid' },
    { value: 'unknown', label: 'Unknown' },
    { value: 'pending', label: 'Pending' },
];

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

export default function ContactsPage() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [meta, setMeta] = useState<ContactsMeta>({ total: 0, page: 1, limit: PAGE_SIZE, totalPages: 1 });
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [statusFilter, setStatusFilter] = useState('all');
    const [validationFilter, setValidationFilter] = useState('all');
    const [companyFilter, setCompanyFilter] = useState<string[]>([]);
    const [titleFilter, setTitleFilter] = useState<string[]>([]);
    const [companyFacets, setCompanyFacets] = useState<Array<{ value: string; count: number }>>([]);
    const [titleFacets, setTitleFacets] = useState<Array<{ value: string; count: number }>>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [importing, setImporting] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [assigning, setAssigning] = useState(false);

    // Add to Campaign dropdown
    const [showCampaignMenu, setShowCampaignMenu] = useState(false);
    const [campaignsList, setCampaignsList] = useState<Array<{ id: string; name: string; status: string }>>([]);
    const [loadingCampaigns, setLoadingCampaigns] = useState(false);
    const campaignMenuRef = useRef<HTMLDivElement>(null);

    // Add Contact modal
    const [showAddModal, setShowAddModal] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [newFirstName, setNewFirstName] = useState('');
    const [newLastName, setNewLastName] = useState('');
    const [newCompany, setNewCompany] = useState('');
    const [newWebsite, setNewWebsite] = useState('');
    const [newTitle, setNewTitle] = useState('');
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
    }, [searchQuery, statusFilter, validationFilter, companyFilter, titleFilter]);

    // Facet loader — populates the company / title dropdowns with distinct values
    // from the org's contact pool. Refetches after CSV imports / bulk creates so
    // newly-added companies appear in the dropdown without a page reload.
    const fetchFacets = useCallback(async () => {
        try {
            const res = await apiClient<any>('/api/sequencer/contacts/facets');
            const data = res?.data || res;
            setCompanyFacets(data?.companies || []);
            setTitleFacets(data?.titles || []);
        } catch {
            // non-fatal — filter dropdowns just stay empty
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchContacts(1, '', 'all', 'all', [], []);
        fetchFacets();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Debounced search
    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
            fetchContacts(1, value, statusFilter, validationFilter, companyFilter, titleFilter);
        }, 400);
    };

    // Status filter change
    const handleStatusFilterChange = (value: string) => {
        setStatusFilter(value);
        fetchContacts(1, searchQuery, value, validationFilter, companyFilter, titleFilter);
    };

    const handleValidationFilterChange = (value: string) => {
        setValidationFilter(value);
        fetchContacts(1, searchQuery, statusFilter, value, companyFilter, titleFilter);
    };

    const handleCompanyFilterChange = (next: string[]) => {
        setCompanyFilter(next);
        fetchContacts(1, searchQuery, statusFilter, validationFilter, next, titleFilter);
    };

    const handleTitleFilterChange = (next: string[]) => {
        setTitleFilter(next);
        fetchContacts(1, searchQuery, statusFilter, validationFilter, companyFilter, next);
    };

    const clearFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setValidationFilter('all');
        setCompanyFilter([]);
        setTitleFilter([]);
        fetchContacts(1, '', 'all', 'all', [], []);
    };

    // Parse CSV and POST to the bulk-import endpoint. Each row runs through the
    // health gate on the backend — invalid emails / disposable domains are rejected,
    // existing contacts are updated (not duplicated), and results are surfaced via toast.
    const handleCSVUpload = (file: File) => {
        setImporting(true);
        const pick = (row: Record<string, string>, ...names: string[]) => {
            for (const n of names) {
                if (row[n] !== undefined && String(row[n]).trim() !== '') return String(row[n]).trim();
            }
            return '';
        };

        Papa.parse<Record<string, string>>(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (result) => {
                const rows = (result.data || []) as Record<string, string>[];
                const contactsPayload = rows.map((row) => {
                    const email = pick(row, 'email', 'Email', 'E-mail', 'EMAIL').toLowerCase();
                    return {
                        email,
                        first_name: pick(row, 'first_name', 'firstname', 'First Name', 'FirstName', 'first name'),
                        last_name: pick(row, 'last_name', 'lastname', 'Last Name', 'LastName', 'last name'),
                        full_name: pick(row, 'full_name', 'fullname', 'Full Name', 'name', 'Name'),
                        company: pick(row, 'company', 'Company', 'company_name', 'Company Name', 'organization'),
                        website: pick(row, 'website', 'Website', 'url', 'URL', 'domain'),
                        title: pick(row, 'title', 'Title', 'job_title', 'Job Title', 'role'),
                        persona: pick(row, 'persona', 'Persona'),
                        source: pick(row, 'source', 'Source') || 'csv',
                    };
                }).filter(c => c.email.includes('@'));

                if (contactsPayload.length === 0) {
                    toast.error('No valid email addresses found. Make sure your CSV has an "email" column.');
                    setImporting(false);
                    return;
                }

                try {
                    const res = await apiClient<any>('/api/sequencer/contacts/bulk', {
                        method: 'POST',
                        body: JSON.stringify({ contacts: contactsPayload }),
                    });
                    const created = res?.created ?? 0;
                    const updated = res?.updated ?? 0;
                    const duplicates = res?.duplicates ?? 0;
                    const rejected = res?.rejected ?? 0;
                    const parts: string[] = [];
                    if (created > 0) parts.push(`${created} added`);
                    if (updated > 0 && updated !== duplicates) parts.push(`${updated} updated`);
                    if (duplicates > 0) parts.push(`${duplicates} already existed`);
                    if (rejected > 0) parts.push(`${rejected} rejected`);
                    const msg = parts.length > 0 ? `Imported ${res?.total ?? contactsPayload.length} contacts — ${parts.join(', ')}` : `Processed ${res?.total ?? contactsPayload.length} rows`;
                    if (created > 0 || updated > 0) toast.success(msg);
                    else toast(msg);
                    await fetchContacts(1, searchQuery, statusFilter);
                    fetchFacets();
                } catch {
                    // apiClient auto-toasts errors (413 too big, 400 no emails, etc.)
                } finally {
                    setImporting(false);
                }
            },
            error: (err) => {
                toast.error(`Failed to parse CSV: ${err.message}`);
                setImporting(false);
            },
        });
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

    const assignToCampaign = async (campaignId: string) => {
        if (selectedIds.size === 0) return;
        setAssigning(true);
        setShowCampaignMenu(false);
        try {
            const res = await apiClient<any>('/api/sequencer/contacts/assign-campaign', {
                method: 'POST',
                body: JSON.stringify({ ids: Array.from(selectedIds), campaign_id: campaignId }),
            });
            const added = res?.added ?? 0;
            const skipped = res?.skipped_duplicates ?? 0;
            const blocked = res?.blocked_red ?? 0;
            const parts = [`${added} added`];
            if (skipped > 0) parts.push(`${skipped} already in campaign`);
            if (blocked > 0) parts.push(`${blocked} blocked (health)`);
            toast.success(parts.join(', '));
            await fetchContacts(meta.page, searchQuery, statusFilter);
        } catch {
            // auto-toast
        } finally {
            setAssigning(false);
        }
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
                    <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer border border-[#D1CBC5] hover:bg-gray-50">
                        <Download size={12} /> Export
                    </button>
                    <button
                        onClick={() => document.getElementById('contact-csv')?.click()}
                        disabled={importing}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer border border-[#D1CBC5] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-wait"
                    >
                        {importing ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                        {importing ? 'Importing…' : 'Import CSV'}
                    </button>
                    <input id="contact-csv" type="file" accept=".csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleCSVUpload(f); e.target.value = ''; }} />
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

                <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                    <Filter size={11} />
                    <span className="font-semibold uppercase tracking-wider">Filter</span>
                </div>

                <div className="w-[140px]">
                    <CustomSelect
                        value={statusFilter}
                        onChange={handleStatusFilterChange}
                        options={STATUS_OPTIONS}
                    />
                </div>
                <div className="w-[160px]">
                    <CustomSelect
                        value={validationFilter}
                        onChange={handleValidationFilterChange}
                        options={VALIDATION_OPTIONS}
                    />
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

                {(statusFilter !== 'all' || validationFilter !== 'all' || searchQuery || companyFilter.length > 0 || titleFilter.length > 0) && (
                    <button
                        type="button"
                        onClick={clearFilters}
                        className="text-[11px] text-gray-500 hover:text-gray-900 underline decoration-dotted"
                    >
                        Clear
                    </button>
                )}

                <span className="ml-auto text-[11px] text-gray-500 tabular-nums">
                    {meta.total.toLocaleString()} contact{meta.total === 1 ? '' : 's'}
                </span>
                {selectedIds.size > 0 && (
                    <>
                        <button
                            onClick={verifySelected}
                            disabled={verifying || assigning}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-700 rounded-lg cursor-pointer border border-[#D1CBC5] hover:bg-gray-50 disabled:opacity-50"
                        >
                            {verifying ? <Loader2 size={11} className="animate-spin" /> : <ShieldCheck size={11} />} Verify Email {selectedIds.size > 1 ? `(${selectedIds.size})` : ''}
                        </button>
                        <div ref={campaignMenuRef} className="relative">
                            <button
                                onClick={openCampaignMenu}
                                disabled={verifying || assigning}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-800 disabled:opacity-50"
                            >
                                {assigning ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />} Add to Campaign {selectedIds.size > 1 ? `(${selectedIds.size})` : ''}
                                <ChevronDown size={11} />
                            </button>
                            {showCampaignMenu && (
                                <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-lg shadow-lg z-50 max-h-72 overflow-y-auto" style={{ border: '1px solid #D1CBC5' }}>
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
                            {deleting ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />} Delete {selectedIds.size}
                        </button>
                    </>
                )}
            </div>

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
                    <p className="text-xs text-gray-500 text-center max-w-md mb-4">Import a CSV or add contacts when creating campaigns. All contacts across campaigns are accessible here.</p>
                    <button
                        onClick={() => document.getElementById('contact-csv')?.click()}
                        disabled={importing}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-semibold cursor-pointer hover:bg-gray-800 disabled:opacity-50 disabled:cursor-wait"
                    >
                        {importing ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                        {importing ? 'Importing…' : 'Import CSV'}
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
                                        <th className="px-3 py-2 text-[10px] font-semibold text-gray-500">Email</th>
                                        <th className="px-3 py-2 text-[10px] font-semibold text-gray-500">Name</th>
                                        <th className="px-3 py-2 text-[10px] font-semibold text-gray-500">Company</th>
                                        <th className="px-3 py-2 text-[10px] font-semibold text-gray-500">Title</th>
                                        <th className="px-3 py-2 text-[10px] font-semibold text-gray-500">Source</th>
                                        <th className="px-3 py-2 text-[10px] font-semibold text-gray-500">Status</th>
                                        <th className="px-3 py-2 text-[10px] font-semibold text-gray-500">Campaigns</th>
                                        <th className="px-3 py-2 text-[10px] font-semibold text-gray-500">Added</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contacts.map(c => (
                                        <tr key={c.id} className="hover:bg-[#F5F1EA] transition-colors" style={{ borderBottom: '1px solid #E8E3DC' }}>
                                            <td className="px-3 py-1.5"><input type="checkbox" checked={selectedIds.has(c.id)} onChange={() => toggleSelect(c.id)} className="cursor-pointer" /></td>
                                            <td className="px-3 py-1.5 text-gray-900 font-medium">{c.email}</td>
                                            <td className="px-3 py-1.5 text-gray-600">{displayName(c)}</td>
                                            <td className="px-3 py-1.5 text-gray-600">{c.company || '—'}</td>
                                            <td className="px-3 py-1.5 text-gray-600">{c.title || '—'}</td>
                                            <td className="px-3 py-1.5"><SourcePill source={c.source} /></td>
                                            <td className="px-3 py-1.5">
                                                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold capitalize ${
                                                    c.status === 'active' ? 'bg-green-50 text-green-700' :
                                                    c.status === 'bounced' ? 'bg-red-50 text-red-600' :
                                                    c.status === 'replied' ? 'bg-blue-50 text-blue-700' :
                                                    c.status === 'unsubscribed' ? 'bg-orange-50 text-orange-600' :
                                                    c.status === 'held' ? 'bg-blue-50 text-blue-700' :
                                                    'bg-gray-100 text-gray-600'
                                                }`}>{c.status === 'held' ? 'Available' : c.status}</span>
                                            </td>
                                            <td className="px-3 py-1.5 text-gray-500 text-center">{c.campaign_count || 0}</td>
                                            <td className="px-3 py-1.5 text-gray-400">{new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
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
        </div>
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
    switch (source.toLowerCase()) {
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

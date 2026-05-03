'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Plus, Mail, Shield, Wifi, WifiOff, Trash2, RefreshCw, Settings, X, Upload, Download, Loader2, Search, Zap } from 'lucide-react';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import CustomSelect from '@/components/ui/CustomSelect';
import BulkMailboxImportModal from '@/components/sequencer/BulkMailboxImportModal';
import ResellerImportModal from '@/components/sequencer/ResellerImportModal';
import MailboxSettingsModal from '@/components/sequencer/MailboxSettingsModal';

// Stable source codes — keep in sync with backend ConnectedAccount.source.
// Adding a new reseller? Update both this list AND the SOURCE_META map below.
type AccountSource = 'oauth' | 'manual' | 'csv' | 'zapmail' | 'premium_inboxes' | 'mission_inbox' | 'scaled_mail' | null;

const SOURCE_META: Record<Exclude<AccountSource, null>, { label: string; bg: string; fg: string }> = {
    oauth:           { label: 'OAuth',            bg: '#EFF6FF', fg: '#1D4ED8' },
    manual:          { label: 'Manual',           bg: '#F5F5F4', fg: '#57534E' },
    csv:             { label: 'CSV import',       bg: '#FEF3C7', fg: '#92400E' },
    zapmail:         { label: 'Zapmail',          bg: '#EFF6FF', fg: '#1E40AF' },
    premium_inboxes: { label: 'Premium Inboxes',  bg: '#FFFBEB', fg: '#92400E' },
    mission_inbox:   { label: 'Mission Inbox',    bg: '#EFF6FF', fg: '#1D4ED8' },
    scaled_mail:     { label: 'Scaled Mail',      bg: '#F0FDF4', fg: '#15803D' },
};

interface ConnectedAccount {
    id: string;
    email: string;
    displayName: string;
    provider: 'google' | 'microsoft' | 'smtp';
    source: AccountSource;
    status: 'active' | 'error' | 'expired';
    dailySendLimit: number;
    sendsToday: number;
    createdAt: string;
}

interface ApiAccount {
    id: string;
    email: string;
    display_name: string;
    provider: 'google' | 'microsoft' | 'smtp';
    source: AccountSource;
    connection_status: 'active' | 'error' | 'expired';
    daily_send_limit: number;
    sends_today: number;
    created_at: string;
}

function mapApiAccount(a: ApiAccount): ConnectedAccount {
    return {
        id: a.id,
        email: a.email,
        displayName: a.display_name,
        provider: a.provider,
        source: a.source ? a.source : null,
        status: a.connection_status,
        dailySendLimit: a.daily_send_limit,
        sendsToday: a.sends_today,
        createdAt: a.created_at,
    };
}

const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
);

const MicrosoftIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="1" width="10" height="10" fill="#F25022"/>
        <rect x="13" y="1" width="10" height="10" fill="#7FBA00"/>
        <rect x="1" y="13" width="10" height="10" fill="#00A4EF"/>
        <rect x="13" y="13" width="10" height="10" fill="#FFB900"/>
    </svg>
);

const SmtpIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
);

const PROVIDER_META = {
    google: { label: 'Google Workspace', color: '#EA4335', Icon: GoogleIcon },
    microsoft: { label: 'Microsoft 365', color: '#0078D4', Icon: MicrosoftIcon },
    smtp: { label: 'Custom SMTP', color: '#6B7280', Icon: SmtpIcon },
};

export default function ConnectedAccountsPage() {
    const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [showResellerModal, setShowResellerModal] = useState(false);
    const [settingsAccountId, setSettingsAccountId] = useState<string | null>(null);
    const [addType, setAddType] = useState<'google' | 'microsoft' | 'smtp' | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // SMTP form state
    const [smtpForm, setSmtpForm] = useState({ email: '', displayName: '', host: '', port: '587', username: '', password: '', imapHost: '', imapPort: '993' });

    const [oauthMessage, setOauthMessage] = useState<string | null>(null);

    // Bulk-import via CSV and via Zapmail/resellers each have dedicated modals
    // (BulkMailboxImportModal + ResellerImportModal). The Connect Mailbox modal
    // is for single-mailbox connections only; we deliberately don't duplicate
    // bulk options here.

    // Search + provider filter + bulk selection — mirrors the Contacts page pattern
    const [searchQuery, setSearchQuery] = useState('');
    const [providerFilter, setProviderFilter] = useState<'all' | 'google' | 'microsoft' | 'smtp'>('all');
    const [sourceFilter, setSourceFilter] = useState<'all' | Exclude<AccountSource, null> | 'unknown'>('all');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [deleting, setDeleting] = useState(false);
    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounced search — avoid re-filtering on every keystroke
    useEffect(() => {
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => setDebouncedSearch(searchQuery.trim().toLowerCase()), 250);
        return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
    }, [searchQuery]);

    // Filtered view used by the list + select-all + bulk actions
    const filteredAccounts = accounts.filter(a => {
        if (providerFilter !== 'all' && a.provider !== providerFilter) return false;
        if (sourceFilter !== 'all') {
            // 'unknown' is the synthetic bucket for legacy rows with null source.
            // Explicit ternary, not ??, to dodge the Turbopack nullish-coalescing
            // miscompile that hits this file (see availableSources comment).
            const effective = a.source ? a.source : 'unknown';
            if (effective !== sourceFilter) return false;
        }
        if (debouncedSearch) {
            const sourceLabel = a.source ? SOURCE_META[a.source].label : '';
            const hay = `${a.email} ${a.displayName} ${PROVIDER_META[a.provider]?.label || ''} ${sourceLabel}`.toLowerCase();
            if (!hay.includes(debouncedSearch)) return false;
        }
        return true;
    });

    // Show only the sources actually present in the org's mailboxes — keeps
    // the dropdown short for new orgs that haven't used every reseller.
    //
    // Note: written with an explicit ternary instead of `a.source ?? 'unknown'`
    // because Turbopack 16.x miscompiles the nullish-coalescing form here
    // ("ReferenceError: _a_source is not defined"). Same class of bug we
    // hit earlier on cold-call-list — see feedback_turbopack_cache memory.
    const availableSources = useMemo(() => {
        const set = new Set<string>();
        for (const a of accounts) {
            const key = a.source ? a.source : 'unknown';
            set.add(key);
        }
        return set;
    }, [accounts]);

    const toggleSelect = (id: string) => setSelectedIds(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
    });

    const toggleSelectAll = () => setSelectedIds(prev => {
        const allIds = new Set(filteredAccounts.map(a => a.id));
        const allSelected = filteredAccounts.length > 0 && filteredAccounts.every(a => prev.has(a.id));
        return allSelected ? new Set() : allIds;
    });

    const allFilteredSelected = filteredAccounts.length > 0 && filteredAccounts.every(a => selectedIds.has(a.id));

    // Platform-themed confirm modal for bulk disconnect
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

    const requestBulkDelete = () => {
        if (selectedIds.size === 0) return;
        setShowBulkDeleteConfirm(true);
    };

    const confirmBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        setDeleting(true);
        const ids = Array.from(selectedIds);
        let ok = 0, fail = 0;
        for (const id of ids) {
            try {
                await apiClient(`/api/sequencer/accounts/${id}`, { method: 'DELETE' });
                ok++;
            } catch {
                fail++;
            }
        }
        setDeleting(false);
        setShowBulkDeleteConfirm(false);
        setSelectedIds(new Set());
        if (ok > 0) toast.success(`Disconnected ${ok} mailbox${ok === 1 ? '' : 'es'}${fail > 0 ? ` · ${fail} failed` : ''}`);
        else if (fail > 0) toast.error(`Failed to disconnect ${fail} mailbox${fail === 1 ? '' : 'es'}`);
        await fetchAccounts();
    };


    const fetchAccounts = async () => {
        try {
            const res = await apiClient<any>('/api/sequencer/accounts');
            // apiClient unwraps { success, data } → data could be array directly or { accounts: [...] }
            const list = Array.isArray(res) ? res : (res?.accounts || res?.data || []);
            setAccounts(list.map(mapApiAccount));
        } catch {
            setAccounts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();

        // Handle OAuth callback results
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        const connected = params.get('connected');
        const error = params.get('error');
        const email = params.get('email');

        if (connected === 'google' || connected === 'microsoft') {
            const providerName = connected === 'google' ? 'Google Workspace' : 'Microsoft 365';
            toast.success(`${providerName} mailbox${email ? ` (${email})` : ''} connected successfully`);
            // Clean up URL
            window.history.replaceState({}, '', '/dashboard/sequencer/accounts');
        } else if (error) {
            toast.error(`Connection failed: ${decodeURIComponent(error)}`, { duration: 8000 });
            window.history.replaceState({}, '', '/dashboard/sequencer/accounts');
        }
    }, []);

    const connectGoogle = () => {
        // Redirect to backend OAuth authorize endpoint — backend will redirect to Google
        const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
        window.location.href = `${apiBase}/api/sequencer/accounts/google/authorize`;
    };

    const connectMicrosoft = () => {
        // Redirect to backend OAuth authorize endpoint — backend will redirect to Microsoft
        const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
        window.location.href = `${apiBase}/api/sequencer/accounts/microsoft/authorize`;
    };

    const connectSMTP = async () => {
        if (!smtpForm.email || !smtpForm.host || !smtpForm.username || !smtpForm.password) {
            alert('Fill in all required SMTP fields');
            return;
        }
        setSubmitting(true);
        try {
            await apiClient('/api/sequencer/accounts', {
                method: 'POST',
                body: JSON.stringify({
                    email: smtpForm.email,
                    display_name: smtpForm.displayName || smtpForm.email,
                    provider: 'smtp',
                    smtp_host: smtpForm.host,
                    smtp_port: smtpForm.port,
                    smtp_username: smtpForm.username,
                    smtp_password: smtpForm.password,
                    imap_host: smtpForm.imapHost,
                    imap_port: smtpForm.imapPort,
                }),
            });
            await fetchAccounts();
            setShowAddModal(false);
            setAddType(null);
            setSmtpForm({ email: '', displayName: '', host: '', port: '587', username: '', password: '', imapHost: '', imapPort: '993' });
        } catch {
            // apiClient already handles error toasts
        } finally {
            setSubmitting(false);
        }
    };

    const removeAccount = async (id: string) => {
        try {
            await apiClient(`/api/sequencer/accounts/${id}`, { method: 'DELETE' });
            await fetchAccounts();
        } catch {
            // apiClient already handles error toasts
        }
    };

    return (
        <div className="p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Mailboxes</h1>
                    <p className="text-xs text-gray-500 mt-0.5">{accounts.length.toLocaleString()} mailbox{accounts.length === 1 ? '' : 'es'}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowResellerModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer text-gray-700 hover:bg-gray-50"
                        style={{ border: '1px solid #D1CBC5' }}
                        title="Bulk-import mailboxes from Zapmail and other inbox providers"
                    >
                        <Zap size={13} /> Import mailboxes
                    </button>
                    <button
                        onClick={() => setShowBulkModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer text-gray-700 hover:bg-gray-50"
                        style={{ border: '1px solid #D1CBC5' }}
                        title="Import many mailboxes from a CSV"
                    >
                        <Download size={13} /> CSV import
                    </button>
                    <button onClick={() => { setShowAddModal(true); setAddType(null); }} className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-gray-800 cursor-pointer">
                        <Plus size={13} /> Connect Mailbox
                    </button>
                </div>
            </div>

            {/* Filter bar — search, provider filter, select-all, bulk delete */}
            {accounts.length > 0 && (
                <div className="flex items-center gap-3 flex-wrap">
                    <label className="flex items-center gap-1.5 pl-1 cursor-pointer" title={allFilteredSelected ? 'Deselect all' : 'Select all visible'}>
                        <input
                            type="checkbox"
                            checked={allFilteredSelected}
                            onChange={toggleSelectAll}
                            className="cursor-pointer"
                        />
                        <span className="text-[10px] text-gray-500 font-semibold uppercase">All</span>
                    </label>
                    <div className="relative flex-1 max-w-sm">
                        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search by email, name, or provider..."
                            className="w-full pl-7 pr-3 py-1.5 text-xs rounded-lg outline-none border border-[#D1CBC5]"
                        />
                    </div>
                    <div className="w-44">
                        <CustomSelect
                            value={providerFilter}
                            onChange={(v) => setProviderFilter(v as any)}
                            options={[
                                { value: 'all', label: 'All providers' },
                                { value: 'google', label: 'Google Workspace' },
                                { value: 'microsoft', label: 'Microsoft 365' },
                                { value: 'smtp', label: 'Custom SMTP' },
                            ]}
                        />
                    </div>
                    <div className="w-44">
                        <CustomSelect
                            value={sourceFilter}
                            onChange={(v) => setSourceFilter(v as any)}
                            options={[
                                { value: 'all', label: 'All sources' },
                                ...(Object.entries(SOURCE_META) as Array<[Exclude<AccountSource, null>, { label: string }]>)
                                    .filter(([k]) => availableSources.has(k))
                                    .map(([k, m]) => ({ value: k, label: m.label })),
                                ...(availableSources.has('unknown') ? [{ value: 'unknown', label: 'Unknown / legacy' }] : []),
                            ]}
                        />
                    </div>
                    {selectedIds.size > 0 && (
                        <button
                            onClick={requestBulkDelete}
                            disabled={deleting}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-600 rounded-lg cursor-pointer border border-red-200 hover:bg-red-50 disabled:opacity-50"
                        >
                            {deleting ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />} Disconnect {selectedIds.size}
                        </button>
                    )}
                </div>
            )}

            {/* Accounts list */}
            {loading ? (
                <div className="premium-card flex flex-col items-center justify-center py-16">
                    <Loader2 size={24} className="text-gray-400 animate-spin mb-3" />
                    <p className="text-xs text-gray-500">Loading mailboxes...</p>
                </div>
            ) : accounts.length === 0 ? (
                <div className="premium-card flex flex-col items-center justify-center py-16">
                    <Mail size={28} className="text-gray-300 mb-3" />
                    <h2 className="text-sm font-bold text-gray-900 mb-1">No mailboxes connected</h2>
                    <p className="text-xs text-gray-500 text-center max-w-md mb-4">Connect your Google Workspace, Microsoft 365, or custom SMTP mailboxes to start sending emails from Superkabe.</p>
                    <button onClick={() => { setShowAddModal(true); setAddType(null); }} className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-semibold cursor-pointer hover:bg-gray-800">
                        <Plus size={13} /> Connect First Mailbox
                    </button>
                </div>
            ) : filteredAccounts.length === 0 ? (
                <div className="premium-card flex flex-col items-center justify-center py-16">
                    <Search size={28} className="text-gray-300 mb-3" />
                    <h2 className="text-sm font-bold text-gray-900 mb-1">No mailboxes match your filters</h2>
                    <p className="text-xs text-gray-500 text-center max-w-md mb-4">Try clearing the search or changing the provider filter.</p>
                    <button onClick={() => { setSearchQuery(''); setProviderFilter('all'); setSourceFilter('all'); }} className="px-3 py-1.5 text-xs text-gray-700 rounded-lg cursor-pointer border border-[#D1CBC5] hover:bg-gray-50">
                        Clear filters
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {filteredAccounts.map(account => {
                        const meta = PROVIDER_META[account.provider];
                        const selected = selectedIds.has(account.id);
                        return (
                            <div
                                key={account.id}
                                className={`premium-card flex items-center justify-between transition-colors ${selected ? 'bg-[#F5F1EA]' : ''}`}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <input
                                        type="checkbox"
                                        checked={selected}
                                        onChange={() => toggleSelect(account.id)}
                                        onClick={e => e.stopPropagation()}
                                        className="cursor-pointer shrink-0"
                                        aria-label={`Select ${account.email}`}
                                    />
                                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${meta.color}10` }}>
                                        <meta.Icon />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-xs font-semibold text-gray-900 truncate">{account.displayName}</div>
                                        <div className="text-[10px] text-gray-500 truncate">{account.email}</div>
                                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: meta.color + '15', color: meta.color }}>{meta.label}</span>
                                            <span className="flex items-center gap-1 text-[9px]" style={{ color: account.status === 'active' ? '#059669' : '#DC2626' }}>
                                                {account.status === 'active' ? <Wifi size={8} /> : <WifiOff size={8} />}
                                                {account.status}
                                            </span>
                                            {account.source && SOURCE_META[account.source] ? (
                                                <span
                                                    className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                                                    style={{ background: SOURCE_META[account.source].bg, color: SOURCE_META[account.source].fg }}
                                                    title={`Imported via ${SOURCE_META[account.source].label}`}
                                                >
                                                    {SOURCE_META[account.source].label}
                                                </span>
                                            ) : (
                                                // Legacy rows (created before the source field existed) get
                                                // a neutral pill so the column is still visible. Real
                                                // sources show with their distinct color above.
                                                <span
                                                    className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                                                    style={{ background: '#F3F4F6', color: '#9CA3AF' }}
                                                    title="Legacy mailbox — added before source tracking"
                                                >
                                                    Legacy
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 shrink-0">
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-gray-900">{account.sendsToday} / {account.dailySendLimit}</div>
                                        <div className="text-[9px] text-gray-400">sends today</div>
                                    </div>
                                    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full" style={{ width: `${Math.min((account.sendsToday / account.dailySendLimit) * 100, 100)}%`, background: account.sendsToday > account.dailySendLimit * 0.8 ? '#DC2626' : '#059669' }} />
                                    </div>
                                    <button onClick={() => setSettingsAccountId(account.id)} className="p-1.5 rounded-md hover:bg-gray-100 cursor-pointer" title="Mailbox settings">
                                        <Settings size={12} className="text-gray-400 hover:text-gray-700" />
                                    </button>
                                    <button onClick={() => removeAccount(account.id)} className="p-1.5 rounded-md hover:bg-red-50 cursor-pointer" title="Disconnect">
                                        <Trash2 size={12} className="text-gray-400 hover:text-red-500" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Reseller Import Modal — Zapmail / Premium Inboxes / etc.
                One-click bulk import via reseller API. SMTP/IMAP only — no
                Google OAuth scopes required. */}
            {showResellerModal && (
                <ResellerImportModal
                    onClose={() => setShowResellerModal(false)}
                    onSuccess={() => { setShowResellerModal(false); fetchAccounts(); }}
                />
            )}

            {/* CSV Bulk Import Modal — paste/upload a CSV with credentials. */}
            {showBulkModal && (
                <BulkMailboxImportModal
                    onClose={() => setShowBulkModal(false)}
                    onSuccess={() => { setShowBulkModal(false); fetchAccounts(); }}
                />
            )}

            {/* Per-mailbox settings (tracking domain etc.) */}
            {settingsAccountId && (
                <MailboxSettingsModal
                    accountId={settingsAccountId}
                    onClose={() => { setSettingsAccountId(null); fetchAccounts(); }}
                />
            )}

            {/* Add Account Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" onClick={e => { if (e.target === e.currentTarget) { setShowAddModal(false); setAddType(null); } }}>
                    <div className="bg-white rounded-xl w-[90%] max-h-[80vh] overflow-y-auto" style={{ border: '1px solid #D1CBC5', maxWidth: '512px' }}>
                        <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid #D1CBC5' }}>
                            <h2 className="text-sm font-bold text-gray-900">{addType ? `Connect ${PROVIDER_META[addType].label}` : 'Connect Mailbox'}</h2>
                            <button onClick={() => { setShowAddModal(false); setAddType(null); }} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X size={16} /></button>
                        </div>
                        <div className="p-4">
                            {/* OAuth setup message */}
                            {oauthMessage && !addType && (
                                <div className="mb-4 p-3 rounded-lg text-xs text-amber-800 leading-relaxed" style={{ background: '#FEF3C7', border: '1px solid #FDE68A' }}>
                                    {oauthMessage}
                                    <button onClick={() => setOauthMessage(null)} className="block mt-2 text-[10px] text-amber-600 hover:text-amber-800 cursor-pointer font-semibold">Dismiss</button>
                                </div>
                            )}

                            {!addType ? (
                                <div className="flex flex-col gap-3">
                                    <p className="text-xs text-gray-500 mb-1">Pick a provider</p>

                                    {/* Single connection options. For bulk import use the
                                        "Import mailboxes" or "CSV import" buttons in the
                                        page header — those flows live in dedicated modals. */}
                                    {(['google', 'microsoft', 'smtp'] as const).map(p => {
                                        const meta = PROVIDER_META[p];
                                        return (
                                            <button key={p} onClick={() => p === 'smtp' ? setAddType('smtp') : p === 'google' ? connectGoogle() : connectMicrosoft()} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-[#F5F1EA] text-left w-full" style={{ border: '1px solid #D1CBC5' }}>
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${meta.color}10` }}>
                                                    <meta.Icon />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-semibold text-gray-900">{meta.label}</div>
                                                    <div className="text-[10px] text-gray-500">{p === 'google' ? 'Connect via OAuth' : p === 'microsoft' ? 'Connect via OAuth' : 'Enter SMTP credentials manually'}</div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : addType === 'smtp' ? (
                                <div className="flex flex-col gap-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Email Address *</label>
                                            <input type="email" value={smtpForm.email} onChange={e => setSmtpForm(f => ({ ...f, email: e.target.value }))} placeholder="sender@yourdomain.com" className="w-full px-3 py-1.5 text-xs rounded-lg outline-none border border-[#D1CBC5]" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Display Name</label>
                                            <input type="text" value={smtpForm.displayName} onChange={e => setSmtpForm(f => ({ ...f, displayName: e.target.value }))} placeholder="John Smith" className="w-full px-3 py-1.5 text-xs rounded-lg outline-none border border-[#D1CBC5]" />
                                        </div>
                                    </div>
                                    <div className="text-[10px] font-semibold text-gray-400 uppercase mt-1">SMTP (Outgoing)</div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="col-span-2">
                                            <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">SMTP Host *</label>
                                            <input type="text" value={smtpForm.host} onChange={e => setSmtpForm(f => ({ ...f, host: e.target.value }))} placeholder="smtp.gmail.com" className="w-full px-3 py-1.5 text-xs rounded-lg outline-none border border-[#D1CBC5]" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Port</label>
                                            <input type="text" value={smtpForm.port} onChange={e => setSmtpForm(f => ({ ...f, port: e.target.value }))} className="w-full px-3 py-1.5 text-xs rounded-lg outline-none border border-[#D1CBC5]" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Username *</label>
                                            <input type="text" value={smtpForm.username} onChange={e => setSmtpForm(f => ({ ...f, username: e.target.value }))} placeholder="sender@yourdomain.com" className="w-full px-3 py-1.5 text-xs rounded-lg outline-none border border-[#D1CBC5]" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Password *</label>
                                            <input type="password" value={smtpForm.password} onChange={e => setSmtpForm(f => ({ ...f, password: e.target.value }))} placeholder="App password" className="w-full px-3 py-1.5 text-xs rounded-lg outline-none border border-[#D1CBC5]" />
                                        </div>
                                    </div>
                                    <div className="text-[10px] font-semibold text-gray-400 uppercase mt-1">IMAP (Incoming — for reply detection)</div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="col-span-2">
                                            <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">IMAP Host</label>
                                            <input type="text" value={smtpForm.imapHost} onChange={e => setSmtpForm(f => ({ ...f, imapHost: e.target.value }))} placeholder="imap.gmail.com" className="w-full px-3 py-1.5 text-xs rounded-lg outline-none border border-[#D1CBC5]" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Port</label>
                                            <input type="text" value={smtpForm.imapPort} onChange={e => setSmtpForm(f => ({ ...f, imapPort: e.target.value }))} className="w-full px-3 py-1.5 text-xs rounded-lg outline-none border border-[#D1CBC5]" />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-2">
                                        <button onClick={() => setAddType(null)} className="px-4 py-1.5 text-xs text-gray-600 rounded-lg cursor-pointer border border-[#D1CBC5]">Back</button>
                                        <button onClick={connectSMTP} disabled={submitting} className="px-4 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg cursor-pointer hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2">
                                            {submitting && <Loader2 size={12} className="animate-spin" />}
                                            Connect
                                        </button>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk disconnect confirmation — platform-themed */}
            {showBulkDeleteConfirm && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-[4px] flex items-center justify-center z-[9998] p-4"
                    onClick={(e) => { if (e.target === e.currentTarget && !deleting) setShowBulkDeleteConfirm(false); }}
                >
                    <div className="bg-white rounded-xl w-full max-w-md" style={{ border: '1px solid #D1CBC5', boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}>
                        <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid #D1CBC5' }}>
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center">
                                    <Trash2 size={13} className="text-red-600" />
                                </div>
                                <h2 className="text-sm font-bold text-gray-900">Disconnect mailboxes</h2>
                            </div>
                            <button
                                onClick={() => { if (!deleting) setShowBulkDeleteConfirm(false); }}
                                disabled={deleting}
                                className="text-gray-400 hover:text-gray-600 cursor-pointer bg-transparent border-none disabled:opacity-50"
                                aria-label="Close"
                            >
                                <X size={14} />
                            </button>
                        </div>
                        <div className="p-4">
                            <p className="text-xs text-gray-700 mb-1">
                                You&apos;re about to disconnect <span className="font-semibold text-gray-900">{selectedIds.size} mailbox{selectedIds.size === 1 ? '' : 'es'}</span>.
                            </p>
                            <p className="text-[11px] text-gray-500">
                                Any active campaign still using these mailboxes will stop sending through them. Campaigns themselves are not affected. This can&apos;t be undone.
                            </p>
                        </div>
                        <div className="p-3 flex justify-end gap-2" style={{ borderTop: '1px solid #E8E3DC', background: '#FAFAF8' }}>
                            <button
                                onClick={() => setShowBulkDeleteConfirm(false)}
                                disabled={deleting}
                                className="px-4 py-1.5 text-xs text-gray-700 rounded-lg cursor-pointer hover:bg-white disabled:opacity-50"
                                style={{ border: '1px solid #D1CBC5' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmBulkDelete}
                                disabled={deleting}
                                className="flex items-center gap-1.5 px-4 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg cursor-pointer hover:bg-red-700 disabled:opacity-50"
                            >
                                {deleting ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
                                {deleting ? 'Disconnecting...' : `Disconnect ${selectedIds.size}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

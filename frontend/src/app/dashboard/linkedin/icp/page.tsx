'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
    Plus, Target, Briefcase, Building2, Users, Globe, TrendingUp,
    MoreHorizontal, Search, X, Loader2, Pencil, Trash2, Power, PowerOff,
    UserCircle2, Upload, Database, CheckCircle2,
} from 'lucide-react';
import Papa from 'papaparse';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api';
import ConfirmActionModal from '@/components/modals/ConfirmActionModal';

interface IcpProfile {
    id: string;
    name: string;
    description: string | null;
    titles: string[];
    industries: string[];
    company_sizes: string[];
    geos: string[];
    enabled: boolean;
    matched_30d: number;
}

const SIZE_OPTIONS = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+'];

interface CustomerSummary {
    total: number;
    by_source: Record<string, number>;
    crm: {
        connected: boolean;
        provider: string | null;
        account_name: string | null;
        last_sync_at: string | null;
    };
}

function Chip({ label, icon }: { label: string; icon?: React.ReactNode }) {
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs text-gray-700 bg-gray-100 font-medium">{icon} {label}</span>;
}

export default function LinkedInIcpPage() {
    const [icps, setIcps] = useState<IcpProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [enabledFilter, setEnabledFilter] = useState<'all' | 'enabled' | 'disabled'>('all');
    const [industryFilter, setIndustryFilter] = useState('all');
    const [editorOpen, setEditorOpen] = useState<{ mode: 'create' } | { mode: 'edit'; row: IcpProfile } | null>(null);
    const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);
    const [pendingDelete, setPendingDelete] = useState<{ id: string; consequences: string[] } | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Customer registry — drives the "differentiate customers vs prospects"
    // banner and the CSV-upload modal. Loaded once on mount; refreshed
    // after a successful CSV import.
    const [customers, setCustomers] = useState<CustomerSummary | null>(null);
    const [csvModalOpen, setCsvModalOpen] = useState(false);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const rows = await apiClient<IcpProfile[]>('/api/linkedin/icp');
            setIcps(Array.isArray(rows) ? rows : []);
        } catch (err: any) {
            toast.error(err?.message || 'Failed to load ICPs');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const fetchCustomers = useCallback(async () => {
        try {
            const res = await apiClient<CustomerSummary>('/api/linkedin/customers');
            const empty: CustomerSummary = { total: 0, by_source: {}, crm: { connected: false, provider: null, account_name: null, last_sync_at: null } };
            setCustomers(res || empty);
        } catch {
            setCustomers({ total: 0, by_source: {}, crm: { connected: false, provider: null, account_name: null, last_sync_at: null } });
        }
    }, []);

    useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

    const allIndustries = Array.from(new Set(icps.flatMap(i => i.industries))).sort();

    const filtered = icps.filter(icp => {
        if (search && !icp.name.toLowerCase().includes(search.toLowerCase()) && !(icp.description ?? '').toLowerCase().includes(search.toLowerCase())) return false;
        if (enabledFilter === 'enabled' && !icp.enabled) return false;
        if (enabledFilter === 'disabled' && icp.enabled) return false;
        if (industryFilter !== 'all' && !icp.industries.includes(industryFilter)) return false;
        return true;
    });

    const handleToggle = async (id: string) => {
        try {
            await apiClient(`/api/linkedin/icp/${id}/toggle`, { method: 'POST' });
            await fetchAll();
            setMenuOpenFor(null);
        } catch (err: any) {
            toast.error(err?.message || 'Failed to toggle ICP');
        }
    };

    const requestDelete = async (id: string) => {
        // Fetch the delete-impact report so the operator sees what
        // gets affected. We tombstone the ICP (soft-delete) so the
        // audit rows survive, but a referencing rule will silently
        // stop matching on this ICP — worth surfacing.
        const consequences: string[] = [];
        try {
            const resp = await apiClient<{ data: { recent_matches_30d: number; total_matches: number; referencing_rules: Array<{ id: string }> } }>(
                `/api/linkedin/icp/${id}/delete-impact`,
            );
            const { recent_matches_30d, total_matches, referencing_rules } = resp.data;
            if (recent_matches_30d > 0) consequences.push(`${recent_matches_30d} match${recent_matches_30d === 1 ? '' : 'es'} in the last 30 days will retain their audit rows.`);
            if (total_matches > 0 && total_matches > recent_matches_30d) consequences.push(`${total_matches} total audit rows are preserved (soft-delete).`);
            if (referencing_rules.length > 0) consequences.push(`${referencing_rules.length} monitoring rule${referencing_rules.length === 1 ? '' : 's'} reference this ICP and will silently no-op on this filter.`);
        } catch { /* impact fetch is best-effort */ }
        consequences.push('Tombstoned, not hard-deleted — contact support to restore.');
        setMenuOpenFor(null);
        setPendingDelete({ id, consequences });
    };

    const confirmDelete = async () => {
        if (!pendingDelete) return;
        setDeleting(true);
        try {
            await apiClient(`/api/linkedin/icp/${pendingDelete.id}`, { method: 'DELETE' });
            toast.success('ICP deleted');
            await fetchAll();
            setPendingDelete(null);
        } catch (err: any) {
            toast.error(err?.message || 'Failed to delete ICP');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="p-4 flex flex-col gap-4">
            <ConfirmActionModal
                isOpen={!!pendingDelete}
                title="Delete ICP profile?"
                icon="🗑️"
                message="This ICP will be tombstoned. Audit history is preserved, but referencing monitoring rules will silently stop matching on this filter."
                consequences={pendingDelete?.consequences ?? []}
                confirmLabel="Delete ICP"
                variant="danger"
                loading={deleting}
                onConfirm={confirmDelete}
                onCancel={() => !deleting && setPendingDelete(null)}
            />
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Target size={18} strokeWidth={1.75} /> ICP Profiles</h1>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {loading ? 'Loading…' : `${icps.length} profiles · ${icps.filter(i => i.enabled).length} enabled`}
                    </p>
                </div>
                <button
                    onClick={() => setEditorOpen({ mode: 'create' })}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors cursor-pointer"
                >
                    <Plus size={14} /> New ICP
                </button>
            </div>

            {/* Customer-source banner — Superkabe doesn't natively know who
                is already a customer vs a prospect. The engager-relationship
                resolver only flags "Customer" when this registry has a
                match (by email or LinkedIn slug). Two ways to populate it:
                connect a CRM, or upload a CSV. The banner shows the current
                state + CTAs to either path. */}
            <CustomerSourceBanner
                summary={customers}
                onUploadClick={() => setCsvModalOpen(true)}
            />

            <div className="flex items-center gap-2 flex-wrap">
                <div className="relative flex-1 max-w-md">
                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search ICPs by name or description…"
                        className="w-full pl-7 pr-3 py-1.5 text-xs rounded-lg outline-none bg-white"
                        style={{ border: '1px solid #D1CBC5' }}
                    />
                </div>
                <select value={enabledFilter} onChange={e => setEnabledFilter(e.target.value as 'all' | 'enabled' | 'disabled')}
                    className="text-xs px-3 py-1.5 rounded-lg outline-none bg-white cursor-pointer"
                    style={{ border: '1px solid #D1CBC5' }}>
                    <option value="all">All ICPs</option>
                    <option value="enabled">Enabled only</option>
                    <option value="disabled">Disabled only</option>
                </select>
                {allIndustries.length > 0 && (
                    <select value={industryFilter} onChange={e => setIndustryFilter(e.target.value)}
                        className="text-xs px-3 py-1.5 rounded-lg outline-none bg-white cursor-pointer"
                        style={{ border: '1px solid #D1CBC5' }}>
                        <option value="all">All industries</option>
                        {allIndustries.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                )}
                {(search || enabledFilter !== 'all' || industryFilter !== 'all') && (
                    <button onClick={() => { setSearch(''); setEnabledFilter('all'); setIndustryFilter('all'); }}
                        className="text-[11px] text-gray-500 hover:text-gray-900 underline decoration-dotted cursor-pointer">Clear</button>
                )}
            </div>

            {loading ? (
                <div className="premium-card flex items-center justify-center py-12 text-sm text-gray-500">
                    <Loader2 size={14} className="animate-spin mr-2" /> Loading ICPs…
                </div>
            ) : filtered.length === 0 ? (
                <div className="premium-card flex flex-col items-center justify-center py-12 text-center">
                    <Target size={28} className="text-gray-300 mb-2" />
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                        {icps.length === 0 ? 'No ICPs yet' : 'No ICPs match your filters'}
                    </p>
                    <p className="text-xs text-gray-500 mb-3 max-w-sm">
                        {icps.length === 0
                            ? 'Define your ideal customer profile so the signal monitoring agent can route the right LinkedIn engagements into campaigns and lists.'
                            : 'Adjust the filters above to see other ICPs.'}
                    </p>
                    {icps.length === 0 && (
                        <button
                            onClick={() => setEditorOpen({ mode: 'create' })}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 cursor-pointer"
                        >
                            <Plus size={14} /> Create your first ICP
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filtered.map(icp => (
                        <div key={icp.id} className={`premium-card !p-0 overflow-hidden ${icp.enabled ? '' : 'opacity-60'}`}>
                            <div className="px-4 py-3 border-b border-[#D1CBC5]">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-bold text-gray-900 truncate">{icp.name}</h3>
                                            {!icp.enabled && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.6rem] uppercase font-semibold bg-gray-100 text-gray-600">Disabled</span>}
                                        </div>
                                        {icp.description && <p className="text-[0.7rem] text-gray-500 mt-0.5">{icp.description}</p>}
                                    </div>
                                    <div className="relative shrink-0">
                                        <button
                                            onClick={() => setMenuOpenFor(menuOpenFor === icp.id ? null : icp.id)}
                                            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 cursor-pointer"
                                        >
                                            <MoreHorizontal size={14} />
                                        </button>
                                        {menuOpenFor === icp.id && (
                                            <>
                                                <div className="fixed inset-0 z-40" onClick={() => setMenuOpenFor(null)} />
                                                <div className="absolute right-0 top-full mt-1 z-50 w-44 rounded-lg overflow-hidden bg-white" style={{ border: '1px solid #D1CBC5', boxShadow: '0 6px 18px rgba(0,0,0,0.08)' }}>
                                                    <button onClick={() => { setEditorOpen({ mode: 'edit', row: icp }); setMenuOpenFor(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-[#FAFAF8] cursor-pointer">
                                                        <Pencil size={12} /> Edit
                                                    </button>
                                                    <button onClick={() => handleToggle(icp.id)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-[#FAFAF8] cursor-pointer">
                                                        {icp.enabled ? <><PowerOff size={12} /> Disable</> : <><Power size={12} /> Enable</>}
                                                    </button>
                                                    <button onClick={() => requestDelete(icp.id)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 cursor-pointer">
                                                        <Trash2 size={12} /> Delete
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 space-y-3">
                                <div>
                                    <div className="text-[0.6rem] uppercase tracking-wide text-gray-500 font-semibold mb-1.5 flex items-center gap-1"><Briefcase size={9} /> Titles</div>
                                    <div className="flex flex-wrap gap-1.5">{icp.titles.length === 0 ? <span className="text-[11px] text-gray-400">No titles set</span> : icp.titles.map(t => <Chip key={t} label={t} />)}</div>
                                </div>

                                <div>
                                    <div className="text-[0.6rem] uppercase tracking-wide text-gray-500 font-semibold mb-1.5 flex items-center gap-1"><Building2 size={9} /> Industries</div>
                                    <div className="flex flex-wrap gap-1.5">{icp.industries.length === 0 ? <span className="text-[11px] text-gray-400">No industries set</span> : icp.industries.map(t => <Chip key={t} label={t} />)}</div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <div className="text-[0.6rem] uppercase tracking-wide text-gray-500 font-semibold mb-1.5 flex items-center gap-1"><Users size={9} /> Company size</div>
                                        <div className="flex flex-wrap gap-1.5">{icp.company_sizes.length === 0 ? <span className="text-[11px] text-gray-400">Any size</span> : icp.company_sizes.map(t => <Chip key={t} label={t} />)}</div>
                                    </div>
                                    <div>
                                        <div className="text-[0.6rem] uppercase tracking-wide text-gray-500 font-semibold mb-1.5 flex items-center gap-1"><Globe size={9} /> Geos</div>
                                        <div className="flex flex-wrap gap-1.5">{icp.geos.length === 0 ? <span className="text-[11px] text-gray-400">Any geo</span> : icp.geos.map(t => <Chip key={t} label={t} />)}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="px-4 py-2.5 bg-[#F7F2EB]/50 border-t border-[#D1CBC5] flex items-center justify-between text-[0.7rem]">
                                <span className="text-gray-500 flex items-center gap-1"><TrendingUp size={10} /> Workspace ICP matches (30d)</span>
                                <span className="font-bold text-gray-900 tabular-nums">{icp.matched_30d.toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {editorOpen && (
                <IcpEditorModal
                    mode={editorOpen.mode}
                    initial={editorOpen.mode === 'edit' ? editorOpen.row : undefined}
                    onClose={() => setEditorOpen(null)}
                    onSaved={async () => { setEditorOpen(null); await fetchAll(); }}
                />
            )}

            {csvModalOpen && (
                <CustomerCsvUploadModal
                    onClose={() => setCsvModalOpen(false)}
                    onImported={async () => { await fetchCustomers(); setCsvModalOpen(false); }}
                />
            )}
        </div>
    );
}

// ── Customer-source banner ───────────────────────────────────────────────────

function CustomerSourceBanner({
    summary, onUploadClick,
}: {
    summary: CustomerSummary | null;
    onUploadClick: () => void;
}) {
    const total = summary?.total ?? 0;
    const sources = summary?.by_source ?? {};
    const hasCrm = (sources.hubspot ?? 0) > 0 || (sources.salesforce ?? 0) > 0;
    const hasCsv = (sources.csv ?? 0) > 0;
    const crm = summary?.crm;
    const crmConnected = !!crm?.connected;
    const providerLabel = crm?.provider === 'hubspot' ? 'HubSpot'
        : crm?.provider === 'salesforce' ? 'Salesforce'
        : 'your CRM';

    // STATE 1 — Customer registry has rows. Green "loaded" banner.
    if (total > 0) {
        return (
            <div
                className="rounded-lg flex items-center gap-3 px-3 py-2"
                style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}
            >
                <CheckCircle2 size={14} className="text-emerald-700 shrink-0" />
                <div className="flex-1 text-[11px] text-emerald-900 leading-snug">
                    <span className="font-semibold">Customer registry loaded</span> — {total.toLocaleString()} customer {total === 1 ? 'company' : 'companies'} tracked
                    {hasCrm && hasCsv ? ' via CRM + CSV.'
                        : hasCrm ? ` via ${sources.hubspot ? 'HubSpot' : 'Salesforce'}.`
                        : hasCsv ? ' via CSV upload.'
                        : '.'}
                    {' '}Engagers from these companies show a <em>Customer</em> badge on signal pages, and the dispatcher will skip them when classifying net-new contacts to import.
                </div>
                <button
                    onClick={onUploadClick}
                    className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 bg-transparent border-none cursor-pointer underline"
                >
                    Upload more →
                </button>
            </div>
        );
    }

    // STATE 2 — CRM is connected but the first sync hasn't populated the
    // registry yet. Reassurance + offer CSV as a bootstrap path.
    if (crmConnected) {
        return (
            <div
                className="rounded-lg p-3.5"
                style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}
            >
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md bg-blue-100 flex items-center justify-center shrink-0">
                        <Database size={16} className="text-blue-700" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-bold text-blue-900 m-0">
                            {providerLabel} connected{crm?.account_name ? ` — ${crm.account_name}` : ''}
                        </p>
                        <p className="text-[11px] text-blue-900 mt-1 mb-2 leading-relaxed">
                            Customer accounts from {providerLabel} will be pulled in automatically so we never enroll your existing customers in cold-outreach sequences. The first sync runs within a few minutes of connection; once it completes, customer engagers will start showing the <em>Customer</em> badge on signal pages.
                            {' '}If you want to label engagers immediately, you can also upload a CSV of customer companies as a bootstrap — anything synced from {providerLabel} later will merge cleanly.
                        </p>
                        <div className="flex items-center gap-2 flex-wrap mt-1.5">
                            <button
                                onClick={onUploadClick}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white text-blue-900 text-[11px] font-semibold cursor-pointer hover:bg-blue-50"
                                style={{ border: '1px solid #BFDBFE' }}
                            >
                                <Upload size={11} /> Bootstrap with CSV
                            </button>
                            <a
                                href="/dashboard/integrations"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold text-blue-700 hover:text-blue-900 no-underline"
                            >
                                Manage {providerLabel} →
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // STATE 3 — No CRM, no customers. Amber prompt with both paths.
    return (
        <div
            className="rounded-lg p-3.5"
            style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}
        >
            <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-amber-100 flex items-center justify-center shrink-0">
                    <UserCircle2 size={16} className="text-amber-700" />
                </div>
                <div className="flex-1">
                    <p className="text-xs font-bold text-amber-900 m-0">
                        Tell Superkabe which companies are already your customers
                    </p>
                    <p className="text-[11px] text-amber-900 mt-1 mb-2 leading-relaxed">
                        When someone engages with your LinkedIn posts, we can only label them <em>Customer</em> when their current employer matches a company in your customer list. Customer tracking is company-level (B2B) — we use company name and optionally the company's LinkedIn page (e.g. <code className="px-1 rounded bg-amber-100 text-[10px]">linkedin.com/company/acme</code>) as the match keys.
                        Connect a CRM (HubSpot / Salesforce) so we pull customer accounts automatically — or upload a CSV with company names and LinkedIn URLs if you don't run a CRM. Without one of these, every engager will show up as a net-new prospect.
                    </p>
                    <div className="flex items-center gap-2 flex-wrap mt-1.5">
                        <a
                            href="/dashboard/integrations"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-700 text-white text-[11px] font-semibold no-underline hover:bg-amber-800"
                        >
                            <Database size={11} /> Connect a CRM
                        </a>
                        <button
                            onClick={onUploadClick}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white text-amber-900 text-[11px] font-semibold cursor-pointer hover:bg-amber-50"
                            style={{ border: '1px solid #FDE68A' }}
                        >
                            <Upload size={11} /> Upload customer CSV
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Customer CSV upload modal ────────────────────────────────────────────────

interface ParsedCustomerRow {
    company_name: string | null;
    company_linkedin_url: string | null;
    domain: string | null;
}

function CustomerCsvUploadModal({
    onClose, onImported,
}: {
    onClose: () => void;
    onImported: () => Promise<void> | void;
}) {
    const [rows, setRows] = useState<ParsedCustomerRow[]>([]);
    const [fileName, setFileName] = useState<string | null>(null);
    const [parseError, setParseError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const parseFile = (file: File) => {
        setFileName(file.name);
        setParseError(null);
        setRows([]);
        Papa.parse<Record<string, string>>(file, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => {
                const fields = result.meta.fields || [];
                const headers = fields.map(h => h.trim().toLowerCase());
                const companyKey = fields.find(h => ['company', 'company_name', 'company name', 'account', 'account_name', 'organisation', 'organization'].includes(h.trim().toLowerCase()));
                const liKey = fields.find(h => ['company_linkedin_url', 'company linkedin', 'linkedin_url', 'linkedin url', 'linkedin', 'company_url', 'company linkedin url'].includes(h.trim().toLowerCase()));
                const domainKey = fields.find(h => ['domain', 'website', 'company_domain', 'company domain'].includes(h.trim().toLowerCase()));
                if (!companyKey) {
                    setParseError(`Could not find a "company" or "company_name" column in this file. Found: ${headers.join(', ') || '(no headers)'}`);
                    return;
                }
                const parsed: ParsedCustomerRow[] = result.data.map(r => ({
                    company_name: companyKey ? (r[companyKey] || '').trim() || null : null,
                    company_linkedin_url: liKey ? (r[liKey] || '').trim() || null : null,
                    domain: domainKey ? (r[domainKey] || '').trim() || null : null,
                })).filter(r => r.company_name);
                if (parsed.length === 0) {
                    setParseError('Every row was missing a company_name — at least one company is required per row.');
                    return;
                }
                setRows(parsed);
            },
            error: (err) => setParseError(err.message || 'Failed to parse CSV'),
        });
    };

    const handleImport = async () => {
        if (rows.length === 0) return;
        setSubmitting(true);
        try {
            const result = await apiClient<{ inserted: number; updated: number; skipped: number }>(
                '/api/linkedin/customers/import',
                { method: 'POST', body: JSON.stringify({ rows }) },
            );
            toast.success(`Imported ${result.inserted} new + ${result.updated} updated${result.skipped > 0 ? `, ${result.skipped} skipped` : ''}`);
            await onImported();
        } catch (err: any) {
            toast.error(err?.message || 'Failed to import customers');
        } finally {
            setSubmitting(false);
        }
    };

    return createPortal(
        <div
            className="fixed inset-0 flex items-center justify-center z-[9999] p-4"
            style={{ background: 'rgba(15, 15, 15, 0.55)', backdropFilter: 'blur(2px)' }}
            onClick={(e) => { if (e.target === e.currentTarget && !submitting) onClose(); }}
        >
            <div
                className="bg-white rounded-2xl w-full max-w-lg overflow-hidden"
                style={{ border: '1px solid #D1CBC5', boxShadow: '0 12px 40px rgba(0,0,0,0.22)' }}
            >
                <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid #D1CBC5' }}>
                    <div className="flex items-center gap-2">
                        <Upload size={14} className="text-gray-700" />
                        <h3 className="text-sm font-bold text-gray-900 m-0">Upload customer list (CSV)</h3>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        className="text-gray-400 hover:text-gray-700 bg-transparent border-none cursor-pointer p-1 disabled:cursor-not-allowed"
                    >
                        <X size={14} />
                    </button>
                </div>

                <div className="p-4 flex flex-col gap-3">
                    <p className="text-[11px] text-gray-600 leading-relaxed m-0">
                        Customers are tracked at the <strong>company</strong> level (B2B). Your CSV needs a <code className="px-1 rounded bg-gray-100 text-[10px]">company_name</code> column. An optional <code className="px-1 rounded bg-gray-100 text-[10px]">company_linkedin_url</code> column (e.g. <code className="px-1 rounded bg-gray-100 text-[10px]">linkedin.com/company/acme</code>) disambiguates same-name companies, and <code className="px-1 rounded bg-gray-100 text-[10px]">domain</code> is reserved for future email-based matching.
                        Engagers whose current employer matches any entry on this list will be labelled <em>Customer</em> on signal pages.
                    </p>

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-lg flex flex-col items-center justify-center gap-1 py-6 cursor-pointer hover:bg-gray-50 bg-white"
                        style={{ border: '1px dashed #D1CBC5' }}
                    >
                        <Upload size={18} className="text-gray-400" />
                        <span className="text-xs font-semibold text-gray-700">
                            {fileName || 'Click to choose a CSV'}
                        </span>
                        {fileName && rows.length > 0 && (
                            <span className="text-[10px] text-gray-500">{rows.length} valid row{rows.length === 1 ? '' : 's'} ready to import</span>
                        )}
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,text/csv"
                        className="hidden"
                        onChange={e => {
                            const f = e.target.files?.[0];
                            if (f) parseFile(f);
                        }}
                    />

                    {parseError && (
                        <div className="rounded-md p-2.5 text-[11px]" style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B' }}>
                            {parseError}
                        </div>
                    )}
                </div>

                <div className="p-3 flex items-center justify-end gap-2" style={{ borderTop: '1px solid #D1CBC5', background: '#FAFAF8' }}>
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        className="px-3 py-1.5 rounded-md text-xs font-semibold text-gray-700 hover:bg-white bg-transparent border-none cursor-pointer disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={submitting || rows.length === 0}
                        className="px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-gray-900 hover:bg-gray-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                        {submitting && <Loader2 size={11} className="animate-spin" />}
                        Import {rows.length > 0 ? `${rows.length} ` : ''}{rows.length === 1 ? 'company' : 'companies'}
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
}

// ── Editor modal ─────────────────────────────────────────────────────────────

interface EditorForm {
    name: string;
    description: string;
    titles: string;
    industries: string;
    company_sizes: string[];
    geos: string;
    enabled: boolean;
}

function IcpEditorModal({
    mode, initial, onClose, onSaved,
}: {
    mode: 'create' | 'edit';
    initial?: IcpProfile;
    onClose: () => void;
    onSaved: () => void;
}) {
    const [form, setForm] = useState<EditorForm>({
        name: initial?.name ?? '',
        description: initial?.description ?? '',
        titles: (initial?.titles ?? []).join(', '),
        industries: (initial?.industries ?? []).join(', '),
        company_sizes: initial?.company_sizes ?? [],
        geos: (initial?.geos ?? []).join(', '),
        enabled: initial?.enabled ?? true,
    });
    const [saving, setSaving] = useState(false);

    // ── Test/preview state ─────────────────────────────────────────
    // Only available in edit mode (we need a saved ICP id to call
    // /test against; for create-mode, save first then test). The
    // panel renders a sample-profile form and a per-filter breakdown
    // so the operator can verify their ICP catches what they expect
    // before walking away.
    const [testOpen, setTestOpen] = useState(false);
    const [testForm, setTestForm] = useState({
        title: '', company: '', industry: '', company_size_raw: '', location: '',
    });
    const [testRunning, setTestRunning] = useState(false);
    interface TestResult {
        matched: boolean;
        score: number;
        rationale: string;
        breakdown: { title: 'hit' | 'miss' | 'no_filter'; industry: 'hit' | 'miss' | 'no_filter'; company_size: 'hit' | 'miss' | 'no_filter'; geo: 'hit' | 'miss' | 'no_filter' };
    }
    const [testResult, setTestResult] = useState<TestResult | null>(null);

    const runTest = async () => {
        if (!initial) return;
        setTestRunning(true);
        try {
            const resp = await apiClient<{ data: TestResult }>(`/api/linkedin/icp/${initial.id}/test`, {
                method: 'POST',
                body: JSON.stringify({ profile: {
                    title: testForm.title || undefined,
                    company: testForm.company || undefined,
                    industry: testForm.industry || undefined,
                    company_size_raw: testForm.company_size_raw || undefined,
                    location: testForm.location || undefined,
                } }),
            });
            setTestResult(resp.data);
        } catch (err: any) {
            toast.error(err?.message || 'Test failed');
        } finally {
            setTestRunning(false);
        }
    };

    // Detect "no filters at all" state so we can warn before save.
    const splitList = (s: string) => s.split(',').map(x => x.trim()).filter(Boolean);
    const isEmptyFilters = (
        splitList(form.titles).length === 0 &&
        splitList(form.industries).length === 0 &&
        form.company_sizes.length === 0 &&
        splitList(form.geos).length === 0
    );

    const toggleSize = (s: string) => {
        setForm(f => ({
            ...f,
            company_sizes: f.company_sizes.includes(s)
                ? f.company_sizes.filter(x => x !== s)
                : [...f.company_sizes, s],
        }));
    };

    const handleSubmit = async () => {
        const name = form.name.trim();
        if (!name) { toast.error('Name is required'); return; }
        if (isEmptyFilters) {
            // Hard-block client-side; the backend also rejects with
            // code='icp_empty_filters' so this is double protection.
            // Operator can override by setting `match_all: true` via
            // direct API; the UI doesn't expose that path because in
            // practice it's almost always a mistake.
            toast.error('Add at least one title, industry, company size, or geo. Otherwise this ICP would match everyone.');
            return;
        }
        setSaving(true);
        try {
            const payload = {
                name,
                description: form.description.trim() || null,
                titles: splitList(form.titles),
                industries: splitList(form.industries),
                company_sizes: form.company_sizes,
                geos: splitList(form.geos),
                enabled: form.enabled,
            };
            let resp: { _ignored_invalid_sizes?: string[] };
            if (mode === 'create') {
                resp = await apiClient('/api/linkedin/icp', { method: 'POST', body: JSON.stringify(payload) });
                toast.success('ICP created');
            } else if (initial) {
                resp = await apiClient(`/api/linkedin/icp/${initial.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
                toast.success('ICP updated');
            } else {
                resp = {};
            }
            // Backend silently drops company_size values not in the
            // enum set. Surface anything dropped so the operator
            // doesn't think they saved a filter that didn't persist.
            if (resp?._ignored_invalid_sizes && resp._ignored_invalid_sizes.length > 0) {
                toast(`${resp._ignored_invalid_sizes.length} invalid company size${resp._ignored_invalid_sizes.length === 1 ? '' : 's'} ignored: ${resp._ignored_invalid_sizes.join(', ')}`, { icon: 'ℹ️', duration: 5000 });
            }
            onSaved();
        } catch (err: any) {
            toast.error(err?.message || 'Failed to save ICP');
        } finally {
            setSaving(false);
        }
    };

    if (typeof document === 'undefined') return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{ background: 'rgba(15, 15, 15, 0.55)', backdropFilter: 'blur(2px)' }}
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl flex flex-col w-full max-w-xl overflow-hidden"
                style={{ maxHeight: '85vh', border: '1px solid #D1CBC5', boxShadow: '0 12px 40px rgba(0,0,0,0.22), 0 4px 12px rgba(0,0,0,0.08)' }}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #D1CBC5', background: '#FAF7F1' }}>
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <Target size={14} strokeWidth={1.75} /> {mode === 'create' ? 'New ICP' : `Edit ${initial?.name}`}
                    </h3>
                    <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 text-gray-500 cursor-pointer">
                        <X size={14} />
                    </button>
                </div>

                <div className="flex-1 min-h-0 overflow-auto p-4 flex flex-col gap-3">
                    <div>
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">Name *</label>
                        <input
                            value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            placeholder="e.g. B2B SaaS founders (Series A-C)"
                            className="w-full px-3 py-2 text-xs rounded-lg outline-none bg-white"
                            style={{ border: '1px solid #D1CBC5' }}
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">Description</label>
                        <textarea
                            value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            rows={2}
                            placeholder="What this ICP captures and why it matters."
                            className="w-full px-3 py-2 text-xs rounded-lg outline-none bg-white resize-y"
                            style={{ border: '1px solid #D1CBC5' }}
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">Titles · comma-separated</label>
                        <input
                            value={form.titles} onChange={e => setForm(f => ({ ...f, titles: e.target.value }))}
                            placeholder="Founder, CEO, Co-Founder"
                            className="w-full px-3 py-2 text-xs rounded-lg outline-none bg-white"
                            style={{ border: '1px solid #D1CBC5' }}
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">Industries · comma-separated</label>
                        <input
                            value={form.industries} onChange={e => setForm(f => ({ ...f, industries: e.target.value }))}
                            placeholder="B2B SaaS, Sales Tech"
                            className="w-full px-3 py-2 text-xs rounded-lg outline-none bg-white"
                            style={{ border: '1px solid #D1CBC5' }}
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">Company size</label>
                        <div className="flex flex-wrap gap-1.5">
                            {SIZE_OPTIONS.map(s => {
                                const active = form.company_sizes.includes(s);
                                return (
                                    <button
                                        key={s} type="button" onClick={() => toggleSize(s)}
                                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-colors ${active ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-[#FAFAF8]'}`}
                                        style={{ border: '1px solid #D1CBC5' }}
                                    >
                                        {s}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">Geos · comma-separated</label>
                        <input
                            value={form.geos} onChange={e => setForm(f => ({ ...f, geos: e.target.value }))}
                            placeholder="United States, Canada, UK"
                            className="w-full px-3 py-2 text-xs rounded-lg outline-none bg-white"
                            style={{ border: '1px solid #D1CBC5' }}
                        />
                    </div>
                    <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                        <input
                            type="checkbox" checked={form.enabled}
                            onChange={e => setForm(f => ({ ...f, enabled: e.target.checked }))}
                        />
                        Enabled — the signal monitoring agent will route engagements matching this ICP.
                    </label>

                    {/* Empty-filter warning */}
                    {isEmptyFilters && (
                        <div className="text-[0.7rem] px-3 py-2 rounded-md bg-amber-50 border border-amber-200 text-amber-900">
                            <strong>No filters set.</strong> This ICP would match every profile — usually a misconfiguration. Add at least one title / industry / company size / geo.
                        </div>
                    )}

                    {/* Test / preview panel — only in edit mode (we need a
                        saved id to call the test endpoint). For create
                        mode, the operator can save and re-open to test. */}
                    {mode === 'edit' && initial && (
                        <div className="border-t border-gray-200 mt-2 pt-3">
                            <button
                                type="button"
                                onClick={() => setTestOpen(o => !o)}
                                className="text-[11px] font-semibold text-violet-700 hover:text-violet-900 cursor-pointer"
                            >
                                {testOpen ? '— Hide' : '+ Test this ICP against a sample profile'}
                            </button>
                            {testOpen && (
                                <div className="mt-2 p-3 rounded-md bg-violet-50/40 border border-violet-200 flex flex-col gap-2">
                                    <div className="text-[0.65rem] uppercase tracking-wide text-violet-900 font-bold">Sample profile (any fields you have)</div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {([
                                            ['title', 'Title (e.g. VP Sales)'],
                                            ['company', 'Company'],
                                            ['industry', 'Industry'],
                                            ['company_size_raw', 'Company size (e.g. 51-200)'],
                                            ['location', 'Location'],
                                        ] as const).map(([key, placeholder]) => (
                                            <input
                                                key={key}
                                                value={testForm[key]}
                                                onChange={e => setTestForm(f => ({ ...f, [key]: e.target.value }))}
                                                placeholder={placeholder}
                                                className="px-2 py-1 text-xs rounded-md outline-none bg-white"
                                                style={{ border: '1px solid #C4B5FD' }}
                                            />
                                        ))}
                                    </div>
                                    <button
                                        onClick={runTest}
                                        disabled={testRunning}
                                        className="self-start px-3 py-1 text-[11px] font-semibold rounded-md bg-violet-700 text-white hover:bg-violet-800 disabled:opacity-50"
                                    >
                                        {testRunning ? 'Testing…' : 'Run test'}
                                    </button>
                                    {testResult && (
                                        <div className="text-[0.7rem]">
                                            <div className={`font-bold ${testResult.matched ? 'text-emerald-800' : 'text-rose-800'}`}>
                                                {testResult.matched ? '✓ Matches' : '✗ Does not match'}
                                                <span className="ml-2 font-normal text-gray-700">score {Math.round(testResult.score * 100)}%</span>
                                            </div>
                                            <ul className="mt-1 space-y-0.5">
                                                {(['title', 'industry', 'company_size', 'geo'] as const).map(k => (
                                                    <li key={k}>
                                                        <span className="font-semibold capitalize">{k.replace('_', ' ')}:</span>{' '}
                                                        {testResult.breakdown[k] === 'hit'    && <span className="text-emerald-700">✓ matched</span>}
                                                        {testResult.breakdown[k] === 'miss'   && <span className="text-rose-700">✗ no match</span>}
                                                        {testResult.breakdown[k] === 'no_filter' && <span className="text-gray-500">no filter set</span>}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-2 px-4 py-3" style={{ borderTop: '1px solid #D1CBC5', background: '#FAF7F1' }}>
                    <button
                        onClick={onClose} disabled={saving}
                        className="px-3 py-1.5 rounded-md text-xs font-semibold bg-white text-gray-700 hover:bg-[#FAFAF8] cursor-pointer disabled:opacity-50"
                        style={{ border: '1px solid #D1CBC5' }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit} disabled={saving}
                        className="px-4 py-1.5 rounded-md text-xs font-semibold bg-gray-900 text-white hover:bg-gray-800 cursor-pointer disabled:opacity-50"
                    >
                        {saving ? 'Saving…' : mode === 'create' ? 'Create ICP' : 'Save changes'}
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
}

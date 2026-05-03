'use client';

/**
 * ImportLeadsModal — unified entry point for pulling leads into the contacts
 * page from CSV, Apollo, HubSpot, and Salesforce.
 *
 * Flow:
 *   1. pick-source: CSV / Apollo / CRM card grid (CRM = HubSpot + Salesforce)
 *   2. configure:
 *        - CSV → file picker, parse client-side, POST /api/sequencer/contacts/bulk
 *        - Apollo → URL paste + parse-url + cap → POST /api/integrations/apollo/import
 *        - CRM → checkbox grid of HubSpot lists + Salesforce list-views,
 *                multi-select across both providers; spawns one job per item
 *   3. dispatch: CSV resolves synchronously and refetches contacts.
 *      Apollo/CRM emit job descriptors via onJobsSpawned and the modal closes —
 *      ImportProgressTray takes over from there.
 *
 * Per-source field-mapping is intentionally NOT in this modal — power-users
 * who need custom field mapping use the per-connection wizards under
 * /dashboard/integrations/{lead-sources,crm}/[id]. This modal sends no
 * field_mapping override, so the worker uses whatever's already saved on
 * the connection (or its defaults).
 */

import { useEffect, useMemo, useState } from 'react';
import {
    X,
    Upload,
    Loader2,
    FileSpreadsheet,
    ChevronLeft,
    AlertTriangle,
    CheckCircle2,
    Search,
    Eye,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import Papa from 'papaparse';

// ─── Types ───────────────────────────────────────────────────────────────

export type SpawnedJobSource = 'apollo' | 'hubspot' | 'salesforce';

export interface SpawnedJob {
    id: string;
    source: SpawnedJobSource;
    /**
     * For Apollo this is the lead-source connection id; for CRM jobs it's the
     * crm-connection id. The progress tray uses it to poll status (Apollo has
     * a per-job endpoint, CRM polls the connection detail and finds the job
     * by id in `recent_sync_jobs`).
     */
    connectionId: string;
    label: string;
}

interface Props {
    open: boolean;
    onClose: () => void;
    onJobsSpawned: (jobs: SpawnedJob[]) => void;
    onCsvImported: () => void;
}

type Stage = 'pick-source' | 'configure-csv' | 'configure-apollo' | 'configure-crm';

interface ApolloConn { id: string; provider: string; status: string; external_account_name: string | null }
interface CrmConn { id: string; provider: 'hubspot' | 'salesforce'; status: string; external_account_name: string | null }

interface HubSpotList { id: string; name: string; size?: number | null }
interface SalesforceView { id: string; label: string; soql?: string | null }

interface ApolloPreview {
    kind: 'people_search' | 'saved_list' | 'saved_search';
    summary: string[];
    estimated_count: number | null;
}

// `selected[provider]` holds the picked list/view ids the user wants to import.
type CrmSelection = {
    hubspot: Set<string>;
    salesforce: Set<string>;
};

// ─── Component ───────────────────────────────────────────────────────────

export default function ImportLeadsModal({ open, onClose, onJobsSpawned, onCsvImported }: Props) {
    const [stage, setStage] = useState<Stage>('pick-source');

    // Connection inventory (lazy-loaded when modal opens)
    const [loadingConns, setLoadingConns] = useState(false);
    const [apolloConns, setApolloConns] = useState<ApolloConn[]>([]);
    const [crmConns, setCrmConns] = useState<CrmConn[]>([]);

    // CSV state
    const [csvImporting, setCsvImporting] = useState(false);

    // Apollo state
    const [apolloConnId, setApolloConnId] = useState<string>('');
    const [apolloUrl, setApolloUrl] = useState('');
    const [apolloPreview, setApolloPreview] = useState<ApolloPreview | null>(null);
    const [apolloPreviewErr, setApolloPreviewErr] = useState<string | null>(null);
    const [parsing, setParsing] = useState(false);
    const [apolloCap, setApolloCap] = useState<string>('');
    const [apolloReveal, setApolloReveal] = useState(true);
    const [apolloSubmitting, setApolloSubmitting] = useState(false);

    // CRM step-1 picks: which providers the user wants to pull from. Drives
    // whether the configure-crm step renders one column or both.
    const [crmPicked, setCrmPicked] = useState<{ hubspot: boolean; salesforce: boolean }>({ hubspot: false, salesforce: false });

    // CRM state
    const [hubspotLists, setHubspotLists] = useState<HubSpotList[]>([]);
    const [hubspotListsErr, setHubspotListsErr] = useState<string | null>(null);
    const [loadingHubspot, setLoadingHubspot] = useState(false);
    const [salesforceViews, setSalesforceViews] = useState<SalesforceView[]>([]);
    const [salesforceViewsErr, setSalesforceViewsErr] = useState<string | null>(null);
    const [loadingSalesforce, setLoadingSalesforce] = useState(false);
    const [crmSelection, setCrmSelection] = useState<CrmSelection>({
        hubspot: new Set(),
        salesforce: new Set(),
    });
    const [crmSearch, setCrmSearch] = useState('');
    const [crmSubmitting, setCrmSubmitting] = useState(false);

    // ── Lifecycle ────────────────────────────────────────────────────────

    useEffect(() => {
        if (!open) return;

        // Reset transient state every time the modal opens, so a previous run
        // doesn't leak into the next one.
        setStage('pick-source');
        setApolloConnId('');
        setApolloUrl('');
        setApolloPreview(null);
        setApolloPreviewErr(null);
        setApolloCap('');
        setApolloReveal(true);
        setHubspotLists([]);
        setSalesforceViews([]);
        setHubspotListsErr(null);
        setSalesforceViewsErr(null);
        setCrmSelection({ hubspot: new Set(), salesforce: new Set() });
        setCrmSearch('');
        setCrmPicked({ hubspot: false, salesforce: false });

        let cancelled = false;
        setLoadingConns(true);
        Promise.all([
            apiClient<{ data: ApolloConn[] }>('/api/integrations/lead-sources/connections').catch(() => ({ data: [] as ApolloConn[] })),
            apiClient<{ data: CrmConn[] }>('/api/integrations/crm/connections').catch(() => ({ data: [] as CrmConn[] })),
        ]).then(([apollo, crm]) => {
            if (cancelled) return;
            const allApollo = Array.isArray(apollo?.data) ? apollo.data : [];
            const allCrm = Array.isArray(crm?.data) ? crm.data : [];
            setApolloConns(allApollo.filter(c => c.id && c.status === 'active' && c.provider === 'apollo'));
            setCrmConns(allCrm.filter(c => c.id && c.status === 'active'));
            // Auto-select the first Apollo connection if there's exactly one.
            const activeApollo = allApollo.filter(c => c.id && c.status === 'active' && c.provider === 'apollo');
            if (activeApollo.length === 1) setApolloConnId(activeApollo[0]!.id);
        }).finally(() => {
            if (!cancelled) setLoadingConns(false);
        });

        return () => { cancelled = true; };
    }, [open]);

    const hubspotConn = useMemo(() => crmConns.find(c => c.provider === 'hubspot') || null, [crmConns]);
    const salesforceConn = useMemo(() => crmConns.find(c => c.provider === 'salesforce') || null, [crmConns]);
    const apolloAvailable = apolloConns.length > 0;
    const crmAvailable = !!hubspotConn || !!salesforceConn;

    // ── Source picker ────────────────────────────────────────────────────

    const pickCsv = () => setStage('configure-csv');
    const pickApollo = () => {
        if (!apolloAvailable) {
            toast.error('Connect Apollo first under Integrations → Contact Databases.');
            return;
        }
        setStage('configure-apollo');
    };
    const toggleCrmPick = (provider: 'hubspot' | 'salesforce') => {
        // Don't let the user pick a provider that's not connected.
        if (provider === 'hubspot' && !hubspotConn) return;
        if (provider === 'salesforce' && !salesforceConn) return;
        setCrmPicked(prev => ({ ...prev, [provider]: !prev[provider] }));
    };

    const proceedToCrm = async () => {
        const wantHubspot = crmPicked.hubspot && !!hubspotConn;
        const wantSalesforce = crmPicked.salesforce && !!salesforceConn;
        if (!wantHubspot && !wantSalesforce) return;

        setStage('configure-crm');

        // Lazy-load only the providers the user picked.
        if (wantHubspot) {
            setLoadingHubspot(true);
            setHubspotListsErr(null);
            try {
                const res = await apiClient<{ data: HubSpotList[] } | { lists: HubSpotList[] } | HubSpotList[]>('/api/integrations/hubspot/lists');
                const lists = extractList<HubSpotList>(res, ['data', 'lists']);
                setHubspotLists(lists);
            } catch (err: any) {
                setHubspotListsErr(err?.message || 'Failed to load HubSpot lists');
            } finally {
                setLoadingHubspot(false);
            }
        }
        if (wantSalesforce) {
            setLoadingSalesforce(true);
            setSalesforceViewsErr(null);
            try {
                const res = await apiClient<{ data: SalesforceView[] } | { views: SalesforceView[] } | SalesforceView[]>('/api/integrations/salesforce/list-views');
                const views = extractList<SalesforceView>(res, ['data', 'views']);
                setSalesforceViews(views);
            } catch (err: any) {
                setSalesforceViewsErr(err?.message || 'Failed to load Salesforce list views');
            } finally {
                setLoadingSalesforce(false);
            }
        }
    };

    // ── CSV ──────────────────────────────────────────────────────────────

    const handleCsv = (file: File) => {
        setCsvImporting(true);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (parsed) => {
                const rows = (parsed.data as Record<string, string>[]) || [];
                const pick = (row: Record<string, string>, ...keys: string[]): string => {
                    for (const k of keys) {
                        const v = row?.[k];
                        if (v && String(v).trim()) return String(v).trim();
                    }
                    return '';
                };
                const payload = rows.map(row => {
                    const email = pick(row, 'email', 'Email', 'E-mail', 'EMAIL').toLowerCase();
                    return {
                        email,
                        first_name: pick(row, 'first_name', 'firstname', 'First Name', 'FirstName', 'first name'),
                        last_name: pick(row, 'last_name', 'lastname', 'Last Name', 'LastName', 'last name'),
                        full_name: pick(row, 'full_name', 'fullname', 'Full Name', 'name', 'Name'),
                        company: pick(row, 'company', 'Company', 'company_name', 'Company Name', 'organization'),
                        website: pick(row, 'website', 'Website', 'url', 'URL', 'domain'),
                        title: pick(row, 'title', 'Title', 'job_title', 'Job Title', 'role'),
                        phone: pick(row, 'phone', 'Phone', 'phone_number', 'Phone Number', 'mobile', 'Mobile', 'mobile_number', 'Mobile Number', 'cell', 'Cell'),
                        linkedin_url: pick(row, 'linkedin_url', 'linkedin', 'LinkedIn', 'LinkedIn URL', 'LinkedIn Profile', 'linkedin profile', 'linkedin_profile'),
                        persona: pick(row, 'persona', 'Persona'),
                        source: pick(row, 'source', 'Source') || 'csv',
                    };
                }).filter(c => c.email.includes('@'));

                if (payload.length === 0) {
                    toast.error('No valid email addresses found. Make sure your CSV has an "email" column.');
                    setCsvImporting(false);
                    return;
                }
                try {
                    const res = await apiClient<any>('/api/sequencer/contacts/bulk', {
                        method: 'POST',
                        body: JSON.stringify({ contacts: payload }),
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
                    const msg = parts.length > 0 ? `Imported ${res?.total ?? payload.length} — ${parts.join(', ')}` : `Processed ${res?.total ?? payload.length} rows`;
                    if (created > 0 || updated > 0) toast.success(msg); else toast(msg);
                    onCsvImported();
                    onClose();
                } catch {
                    // apiClient auto-toasts the error
                } finally {
                    setCsvImporting(false);
                }
            },
            error: (err) => {
                toast.error(`Failed to parse CSV: ${err.message}`);
                setCsvImporting(false);
            },
        });
    };

    // ── Apollo ───────────────────────────────────────────────────────────

    const onApolloPreview = async () => {
        const trimmed = apolloUrl.trim();
        if (!trimmed) {
            setApolloPreviewErr('Paste an Apollo URL first');
            return;
        }
        setParsing(true);
        setApolloPreviewErr(null);
        setApolloPreview(null);
        try {
            const res = await apiClient<ApolloPreview>('/api/integrations/apollo/parse-url', {
                method: 'POST',
                body: JSON.stringify({ url: trimmed }),
            });
            setApolloPreview(res);
        } catch (err: any) {
            setApolloPreviewErr(err?.message || 'Could not parse this URL');
        } finally {
            setParsing(false);
        }
    };

    const onApolloStart = async () => {
        if (!apolloPreview || !apolloConnId) return;
        setApolloSubmitting(true);
        try {
            const capNum = apolloCap.trim() === '' ? undefined : Number(apolloCap);
            const res = await apiClient<{ data?: { id: string } } | { id: string }>('/api/integrations/apollo/import', {
                method: 'POST',
                body: JSON.stringify({
                    url: apolloUrl.trim(),
                    reveal_personal_emails: apolloReveal,
                    cap: capNum,
                }),
            });
            const jobId = (res as any)?.data?.id ?? (res as any)?.id;
            if (!jobId) {
                throw new Error('Backend did not return a job id');
            }
            const label = `Apollo · ${apolloPreview.kind.replace('_', ' ')}` + (apolloPreview.estimated_count ? ` (~${apolloPreview.estimated_count.toLocaleString()})` : '');
            onJobsSpawned([{ id: String(jobId), source: 'apollo', connectionId: apolloConnId, label }]);
            toast.success('Apollo import started');
            onClose();
        } catch {
            // apiClient auto-toasts
        } finally {
            setApolloSubmitting(false);
        }
    };

    // ── CRM ──────────────────────────────────────────────────────────────

    const toggleHubspot = (id: string) => {
        setCrmSelection(prev => {
            const next = new Set(prev.hubspot);
            next.has(id) ? next.delete(id) : next.add(id);
            return { ...prev, hubspot: next };
        });
    };
    const toggleSalesforce = (id: string) => {
        setCrmSelection(prev => {
            const next = new Set(prev.salesforce);
            next.has(id) ? next.delete(id) : next.add(id);
            return { ...prev, salesforce: next };
        });
    };

    const totalCrmSelected = crmSelection.hubspot.size + crmSelection.salesforce.size;

    const onCrmStart = async () => {
        if (totalCrmSelected === 0) return;
        setCrmSubmitting(true);
        const spawned: SpawnedJob[] = [];
        const failures: string[] = [];

        // HubSpot — one job per selected list
        if (hubspotConn && crmSelection.hubspot.size > 0) {
            for (const listId of crmSelection.hubspot) {
                const list = hubspotLists.find(l => l.id === listId);
                try {
                    const res = await apiClient<{ data?: { sync_job_id: string } }>('/api/integrations/hubspot/import', {
                        method: 'POST',
                        body: JSON.stringify({ list_id: listId }),
                    });
                    const jobId = (res as any)?.data?.sync_job_id ?? (res as any)?.sync_job_id;
                    if (!jobId) throw new Error('Backend did not return a job id');
                    spawned.push({
                        id: String(jobId),
                        source: 'hubspot',
                        connectionId: hubspotConn.id,
                        label: `HubSpot · ${list?.name ?? listId}`,
                    });
                } catch (err: any) {
                    failures.push(`HubSpot list "${list?.name ?? listId}": ${err?.message || 'failed'}`);
                }
            }
        }

        // Salesforce — one job per selected view
        if (salesforceConn && crmSelection.salesforce.size > 0) {
            for (const viewId of crmSelection.salesforce) {
                const view = salesforceViews.find(v => v.id === viewId);
                try {
                    const res = await apiClient<{ data?: { sync_job_id: string } }>('/api/integrations/salesforce/import', {
                        method: 'POST',
                        body: JSON.stringify({ view_id: viewId }),
                    });
                    const jobId = (res as any)?.data?.sync_job_id ?? (res as any)?.sync_job_id;
                    if (!jobId) throw new Error('Backend did not return a job id');
                    spawned.push({
                        id: String(jobId),
                        source: 'salesforce',
                        connectionId: salesforceConn.id,
                        label: `Salesforce · ${view?.label ?? viewId}`,
                    });
                } catch (err: any) {
                    failures.push(`Salesforce view "${view?.label ?? viewId}": ${err?.message || 'failed'}`);
                }
            }
        }

        setCrmSubmitting(false);

        if (spawned.length > 0) {
            onJobsSpawned(spawned);
            toast.success(`Started ${spawned.length} import${spawned.length === 1 ? '' : 's'}`);
        }
        if (failures.length > 0) {
            toast.error(failures[0]!);
        }
        if (spawned.length > 0) {
            onClose();
        }
    };

    // ── Render ───────────────────────────────────────────────────────────

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                style={{ border: '1px solid #D1CBC5' }}
            >
                {/* Header */}
                <div
                    className="px-5 py-3 flex items-center justify-between sticky top-0 bg-white"
                    style={{ borderBottom: '1px solid #D1CBC5' }}
                >
                    <div className="flex items-center gap-2">
                        {stage !== 'pick-source' && (
                            <button
                                onClick={() => setStage('pick-source')}
                                className="text-gray-400 hover:text-gray-700 cursor-pointer bg-transparent border-none p-0.5"
                                aria-label="Back"
                            >
                                <ChevronLeft size={16} />
                            </button>
                        )}
                        <h2 className="text-sm font-bold text-gray-900">{titleFor(stage)}</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 cursor-pointer bg-transparent border-none">
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 overflow-y-auto flex-1">
                    {stage === 'pick-source' && (
                        <SourcePicker
                            loadingConns={loadingConns}
                            apolloAvailable={apolloAvailable}
                            apolloConns={apolloConns}
                            hubspotConn={hubspotConn}
                            salesforceConn={salesforceConn}
                            crmPicked={crmPicked}
                            onToggleCrm={toggleCrmPick}
                            onPickCsv={pickCsv}
                            onPickApollo={pickApollo}
                            onProceedCrm={proceedToCrm}
                        />
                    )}

                    {stage === 'configure-csv' && (
                        <CsvStep importing={csvImporting} onFile={handleCsv} />
                    )}

                    {stage === 'configure-apollo' && (
                        <ApolloStep
                            connections={apolloConns}
                            connId={apolloConnId}
                            onConnId={setApolloConnId}
                            url={apolloUrl}
                            onUrl={setApolloUrl}
                            preview={apolloPreview}
                            previewErr={apolloPreviewErr}
                            parsing={parsing}
                            onPreview={onApolloPreview}
                            cap={apolloCap}
                            onCap={setApolloCap}
                            reveal={apolloReveal}
                            onReveal={setApolloReveal}
                            submitting={apolloSubmitting}
                            onStart={onApolloStart}
                        />
                    )}

                    {stage === 'configure-crm' && (
                        <CrmStep
                            hubspotConn={hubspotConn}
                            salesforceConn={salesforceConn}
                            picked={crmPicked}
                            hubspotLists={hubspotLists}
                            salesforceViews={salesforceViews}
                            loadingHubspot={loadingHubspot}
                            loadingSalesforce={loadingSalesforce}
                            hubspotErr={hubspotListsErr}
                            salesforceErr={salesforceViewsErr}
                            selection={crmSelection}
                            onToggleHubspot={toggleHubspot}
                            onToggleSalesforce={toggleSalesforce}
                            search={crmSearch}
                            onSearch={setCrmSearch}
                            submitting={crmSubmitting}
                            totalSelected={totalCrmSelected}
                            onStart={onCrmStart}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Sub-views ──────────────────────────────────────────────────────────

function titleFor(stage: Stage): string {
    switch (stage) {
        case 'pick-source':       return 'Import Leads';
        case 'configure-csv':     return 'Import from CSV';
        case 'configure-apollo':  return 'Import from Apollo';
        case 'configure-crm':     return 'Import from CRM';
    }
}

function SourcePicker(props: {
    loadingConns: boolean;
    apolloAvailable: boolean;
    apolloConns: ApolloConn[];
    hubspotConn: CrmConn | null;
    salesforceConn: CrmConn | null;
    crmPicked: { hubspot: boolean; salesforce: boolean };
    onToggleCrm: (provider: 'hubspot' | 'salesforce') => void;
    onPickCsv: () => void;
    onPickApollo: () => void;
    onProceedCrm: () => void;
}) {
    const {
        loadingConns, apolloAvailable, apolloConns,
        hubspotConn, salesforceConn,
        crmPicked, onToggleCrm,
        onPickCsv, onPickApollo, onProceedCrm,
    } = props;

    const anyCrmPicked = crmPicked.hubspot || crmPicked.salesforce;

    return (
        <div className="flex flex-col gap-4">
            {/* Direct sources — single-action cards */}
            <div className="flex flex-col gap-2">
                <SectionHeader label="Direct" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <ActionCard
                        icon={<FileSpreadsheet size={20} className="text-emerald-600" />}
                        title="Upload CSV"
                        subtitle="Drop a CSV file"
                        available
                        onClick={onPickCsv}
                    />
                    <ActionCard
                        icon={<BrandLogo src="/brands/apollo.svg" alt="Apollo" />}
                        title="Apollo"
                        subtitle={
                            loadingConns
                                ? 'Loading…'
                                : apolloAvailable
                                    ? `${apolloConns.length} connection${apolloConns.length === 1 ? '' : 's'}`
                                    : 'Not connected'
                        }
                        available={!loadingConns && apolloAvailable}
                        disabledReason={!apolloAvailable && !loadingConns ? 'Connect Apollo under Integrations → Contact Databases' : undefined}
                        onClick={onPickApollo}
                    />
                </div>
            </div>

            {/* CRM — multi-select cards */}
            <div className="flex flex-col gap-2">
                <SectionHeader label="CRM" hint="Pick one or both" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <ToggleCard
                        icon={<BrandLogo src="/brands/hubspot.svg" alt="HubSpot" />}
                        title="HubSpot"
                        subtitle={
                            loadingConns
                                ? 'Loading…'
                                : hubspotConn
                                    ? hubspotConn.external_account_name || 'Connected'
                                    : 'Not connected'
                        }
                        checked={crmPicked.hubspot}
                        available={!loadingConns && !!hubspotConn}
                        disabledReason={!hubspotConn && !loadingConns ? 'Connect HubSpot under Integrations → CRM' : undefined}
                        onToggle={() => onToggleCrm('hubspot')}
                    />
                    <ToggleCard
                        icon={<BrandLogo src="/brands/salesforce.svg" alt="Salesforce" />}
                        title="Salesforce"
                        subtitle={
                            loadingConns
                                ? 'Loading…'
                                : salesforceConn
                                    ? salesforceConn.external_account_name || 'Connected'
                                    : 'Not connected'
                        }
                        checked={crmPicked.salesforce}
                        available={!loadingConns && !!salesforceConn}
                        disabledReason={!salesforceConn && !loadingConns ? 'Connect Salesforce under Integrations → CRM' : undefined}
                        onToggle={() => onToggleCrm('salesforce')}
                    />
                </div>

                <div className="flex justify-end pt-1">
                    <button
                        type="button"
                        onClick={onProceedCrm}
                        disabled={!anyCrmPicked}
                        className="px-4 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg cursor-pointer hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Continue with CRM
                    </button>
                </div>
            </div>
        </div>
    );
}

function SectionHeader({ label, hint }: { label: string; hint?: string }) {
    return (
        <div className="flex items-center justify-between px-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{label}</span>
            {hint && <span className="text-[10px] text-gray-400">{hint}</span>}
        </div>
    );
}

function BrandLogo({ src, alt }: { src: string; alt: string }) {
    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} width={20} height={20} className="object-contain" />
    );
}

/** Single-action card — clicking advances the modal to the per-source step. */
function ActionCard(props: { icon: React.ReactNode; title: string; subtitle: string; available: boolean; disabledReason?: string; onClick: () => void }) {
    const { icon, title, subtitle, available, disabledReason, onClick } = props;
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={!available}
            title={disabledReason}
            className={`text-left p-3 rounded-xl flex items-center gap-3 transition-colors ${available ? 'hover:bg-gray-50 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
            style={{ border: '1px solid #D1CBC5' }}
        >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#F7F2EB' }}>
                {icon}
            </div>
            <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-gray-900">{title}</div>
                <div className="text-[11px] text-gray-500 truncate">{subtitle}</div>
            </div>
        </button>
    );
}

/** Multi-select card — clicking toggles the checkbox; user proceeds via the CRM "Continue" button below. */
function ToggleCard(props: { icon: React.ReactNode; title: string; subtitle: string; checked: boolean; available: boolean; disabledReason?: string; onToggle: () => void }) {
    const { icon, title, subtitle, checked, available, disabledReason, onToggle } = props;
    return (
        <button
            type="button"
            onClick={onToggle}
            disabled={!available}
            title={disabledReason}
            aria-pressed={checked}
            className={`text-left p-3 rounded-xl flex items-center gap-3 transition-colors relative ${available ? 'hover:bg-gray-50 cursor-pointer' : 'opacity-50 cursor-not-allowed'} ${checked ? 'bg-[#F7F2EB]' : ''}`}
            style={{ border: checked ? '1px solid #111827' : '1px solid #D1CBC5' }}
        >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#FFFFFF', border: '1px solid #E8E3DC' }}>
                {icon}
            </div>
            <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-gray-900">{title}</div>
                <div className="text-[11px] text-gray-500 truncate">{subtitle}</div>
            </div>
            <div
                className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${checked ? 'bg-gray-900 border-gray-900' : 'bg-white border-gray-300'}`}
            >
                {checked && <CheckCircle2 size={10} className="text-white" />}
            </div>
        </button>
    );
}

function CsvStep({ importing, onFile }: { importing: boolean; onFile: (f: File) => void }) {
    return (
        <div className="flex flex-col gap-3">
            <p className="text-xs text-gray-500">
                CSV must have an <code className="px-1 rounded bg-gray-100">email</code> column. Optional columns:
                {' '}<code className="px-1 rounded bg-gray-100">first_name</code>, <code className="px-1 rounded bg-gray-100">last_name</code>, <code className="px-1 rounded bg-gray-100">company</code>, <code className="px-1 rounded bg-gray-100">title</code>, <code className="px-1 rounded bg-gray-100">website</code>, <code className="px-1 rounded bg-gray-100">phone</code>, <code className="px-1 rounded bg-gray-100">linkedin_url</code>, <code className="px-1 rounded bg-gray-100">source</code>.
            </p>
            <label
                className={`flex flex-col items-center justify-center gap-2 py-10 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${importing ? 'opacity-50 cursor-wait' : 'hover:bg-gray-50'}`}
                style={{ borderColor: '#D1CBC5' }}
            >
                <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    disabled={importing}
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ''; }}
                />
                {importing ? <Loader2 size={20} className="animate-spin text-gray-400" /> : <Upload size={20} className="text-gray-400" />}
                <span className="text-xs font-semibold text-gray-700">{importing ? 'Importing…' : 'Click to choose a CSV'}</span>
                <span className="text-[10px] text-gray-400">Max 5,000 contacts per upload</span>
            </label>
            <p className="text-[10px] text-gray-400">
                Each row runs through the health gate (syntax + disposable + role check). RED leads are rejected.
            </p>
        </div>
    );
}

function ApolloStep(props: {
    connections: ApolloConn[];
    connId: string;
    onConnId: (v: string) => void;
    url: string;
    onUrl: (v: string) => void;
    preview: ApolloPreview | null;
    previewErr: string | null;
    parsing: boolean;
    onPreview: () => void;
    cap: string;
    onCap: (v: string) => void;
    reveal: boolean;
    onReveal: (v: boolean) => void;
    submitting: boolean;
    onStart: () => void;
}) {
    const { connections, connId, onConnId, url, onUrl, preview, previewErr, parsing, onPreview, cap, onCap, reveal, onReveal, submitting, onStart } = props;
    return (
        <div className="flex flex-col gap-3">
            {connections.length > 1 && (
                <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Apollo Connection</label>
                    <select
                        value={connId}
                        onChange={(e) => onConnId(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg outline-none"
                        style={{ border: '1px solid #D1CBC5' }}
                    >
                        <option value="">Select…</option>
                        {connections.map(c => (
                            <option key={c.id} value={c.id}>{c.external_account_name || c.id}</option>
                        ))}
                    </select>
                </div>
            )}

            <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Apollo URL</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => onUrl(e.target.value)}
                        placeholder="https://app.apollo.io/#/people?…"
                        className="flex-1 px-2.5 py-1.5 text-xs rounded-lg outline-none"
                        style={{ border: '1px solid #D1CBC5' }}
                    />
                    <button
                        onClick={onPreview}
                        disabled={parsing || !url.trim()}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer border border-[#D1CBC5] hover:bg-gray-50 disabled:opacity-50 flex items-center gap-1.5"
                    >
                        {parsing ? <Loader2 size={11} className="animate-spin" /> : <Eye size={11} />}
                        Preview
                    </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Paste a People Search, Saved List, or Saved Search URL.</p>
            </div>

            {previewErr && (
                <div className="flex items-start gap-2 px-3 py-2 rounded-lg text-[11px] bg-red-50 text-red-700 border border-red-100">
                    <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
                    <span>{previewErr}</span>
                </div>
            )}

            {preview && (
                <div className="px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-200 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold uppercase text-gray-500">{preview.kind.replace('_', ' ')}</span>
                        {preview.estimated_count !== null && preview.estimated_count !== undefined && (
                            <span className="text-[11px] tabular-nums text-gray-700">~{preview.estimated_count.toLocaleString()} contacts</span>
                        )}
                    </div>
                    {preview.summary?.length > 0 && (
                        <ul className="text-[11px] text-gray-600 list-disc pl-4">
                            {preview.summary.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                    )}
                </div>
            )}

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Cap (optional)</label>
                    <input
                        type="number"
                        value={cap}
                        onChange={(e) => onCap(e.target.value)}
                        placeholder="e.g. 500"
                        min={1}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg outline-none"
                        style={{ border: '1px solid #D1CBC5' }}
                    />
                </div>
                <label className="flex items-end gap-1.5 cursor-pointer pb-1.5 select-none">
                    <input
                        type="checkbox"
                        checked={reveal}
                        onChange={(e) => onReveal(e.target.checked)}
                        className="cursor-pointer"
                    />
                    <span className="text-[11px] text-gray-700">Reveal personal emails</span>
                </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
                <button
                    onClick={onStart}
                    disabled={submitting || !preview || !connId}
                    className="px-4 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg cursor-pointer hover:bg-gray-800 disabled:opacity-50 flex items-center gap-1.5"
                >
                    {submitting && <Loader2 size={11} className="animate-spin" />}
                    {submitting ? 'Starting…' : 'Start Import'}
                </button>
            </div>
        </div>
    );
}

function CrmStep(props: {
    hubspotConn: CrmConn | null;
    salesforceConn: CrmConn | null;
    picked: { hubspot: boolean; salesforce: boolean };
    hubspotLists: HubSpotList[];
    salesforceViews: SalesforceView[];
    loadingHubspot: boolean;
    loadingSalesforce: boolean;
    hubspotErr: string | null;
    salesforceErr: string | null;
    selection: CrmSelection;
    onToggleHubspot: (id: string) => void;
    onToggleSalesforce: (id: string) => void;
    search: string;
    onSearch: (v: string) => void;
    submitting: boolean;
    totalSelected: number;
    onStart: () => void;
}) {
    const {
        hubspotConn, salesforceConn, picked,
        hubspotLists, salesforceViews,
        loadingHubspot, loadingSalesforce,
        hubspotErr, salesforceErr,
        selection,
        onToggleHubspot, onToggleSalesforce,
        search, onSearch,
        submitting, totalSelected, onStart,
    } = props;

    const filterFn = (label: string) => !search || label.toLowerCase().includes(search.toLowerCase());
    const showHubspot = picked.hubspot && !!hubspotConn;
    const showSalesforce = picked.salesforce && !!salesforceConn;
    // Single-column layout when only one provider is in scope, two-column otherwise.
    const gridCols = showHubspot && showSalesforce ? 'md:grid-cols-2' : 'md:grid-cols-1';

    return (
        <div className="flex flex-col gap-3">
            <p className="text-xs text-gray-500">
                Pick lists and list views to import. Each selection becomes its own background import job.
            </p>

            <div className="relative">
                <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => onSearch(e.target.value)}
                    placeholder="Filter lists and views…"
                    className="w-full pl-7 pr-2.5 py-1.5 text-xs rounded-lg outline-none"
                    style={{ border: '1px solid #D1CBC5' }}
                />
            </div>

            <div className={`grid grid-cols-1 ${gridCols} gap-3`}>
                {showHubspot && (
                    <CrmProviderColumn
                        title="HubSpot"
                        logoSrc="/brands/hubspot.svg"
                        connected
                        loading={loadingHubspot}
                        error={hubspotErr}
                        items={hubspotLists.filter(l => filterFn(l.name)).map(l => ({
                            id: l.id,
                            label: l.name,
                            meta: l.size != null ? `${l.size.toLocaleString()} contacts` : null,
                        }))}
                        selected={selection.hubspot}
                        onToggle={onToggleHubspot}
                        emptyMsg="No lists in this HubSpot account."
                    />
                )}
                {showSalesforce && (
                    <CrmProviderColumn
                        title="Salesforce"
                        logoSrc="/brands/salesforce.svg"
                        connected
                        loading={loadingSalesforce}
                        error={salesforceErr}
                        items={salesforceViews.filter(v => filterFn(v.label)).map(v => ({
                            id: v.id,
                            label: v.label,
                            meta: null,
                        }))}
                        selected={selection.salesforce}
                        onToggle={onToggleSalesforce}
                        emptyMsg="No list views available."
                    />
                )}
            </div>

            <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-gray-500 tabular-nums">
                    {totalSelected} selected
                </span>
                <button
                    onClick={onStart}
                    disabled={submitting || totalSelected === 0}
                    className="px-4 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg cursor-pointer hover:bg-gray-800 disabled:opacity-50 flex items-center gap-1.5"
                >
                    {submitting && <Loader2 size={11} className="animate-spin" />}
                    {submitting ? 'Starting…' : `Start Import${totalSelected > 1 ? ` (${totalSelected})` : ''}`}
                </button>
            </div>
        </div>
    );
}

function CrmProviderColumn(props: {
    title: string;
    logoSrc?: string;
    connected: boolean;
    loading: boolean;
    error: string | null;
    items: { id: string; label: string; meta: string | null }[];
    selected: Set<string>;
    onToggle: (id: string) => void;
    emptyMsg: string;
}) {
    const { title, logoSrc, connected, loading, error, items, selected, onToggle, emptyMsg } = props;
    return (
        <div className="rounded-xl flex flex-col" style={{ border: '1px solid #D1CBC5' }}>
            <div
                className="px-3 py-2 flex items-center justify-between"
                style={{ borderBottom: '1px solid #E8E3DC', background: '#F7F2EB' }}
            >
                <span className="flex items-center gap-1.5">
                    {logoSrc && <BrandLogo src={logoSrc} alt={title} />}
                    <span className="text-[11px] font-bold text-gray-900">{title}</span>
                </span>
                <span className="text-[10px] text-gray-500">
                    {connected ? `${selected.size} of ${items.length}` : 'Not connected'}
                </span>
            </div>

            <div className="max-h-64 overflow-y-auto">
                {!connected ? (
                    <div className="p-3 text-[11px] text-gray-400">Connect under Integrations → CRM to import.</div>
                ) : loading ? (
                    <div className="flex items-center justify-center py-6">
                        <Loader2 size={14} className="animate-spin text-gray-400" />
                    </div>
                ) : error ? (
                    <div className="m-2 px-2.5 py-2 rounded-lg text-[11px] bg-red-50 text-red-700 border border-red-100 flex items-start gap-1.5">
                        <AlertTriangle size={11} className="mt-0.5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                ) : items.length === 0 ? (
                    <div className="p-3 text-[11px] text-gray-400">{emptyMsg}</div>
                ) : (
                    items.map(item => (
                        <label
                            key={item.id}
                            className="px-3 py-1.5 flex items-center gap-2 hover:bg-gray-50 cursor-pointer"
                            style={{ borderBottom: '1px solid #F0EBE3' }}
                        >
                            <input
                                type="checkbox"
                                checked={selected.has(item.id)}
                                onChange={() => onToggle(item.id)}
                                className="cursor-pointer"
                            />
                            <span className="text-[11px] text-gray-900 truncate flex-1">{item.label}</span>
                            {item.meta && <span className="text-[10px] text-gray-400 tabular-nums">{item.meta}</span>}
                            {selected.has(item.id) && <CheckCircle2 size={11} className="text-green-600 flex-shrink-0" />}
                        </label>
                    ))
                )}
            </div>
        </div>
    );
}

// ─── Helpers ─────────────────────────────────────────────────────────────

/**
 * Tolerant unwrapper for backend list endpoints that may return one of:
 *   - { data: [...] }
 *   - { lists: [...] } / { views: [...] }
 *   - [...] (raw array)
 *
 * Each list endpoint we hit was documented inconsistently in earlier phases,
 * so this avoids special-casing per provider.
 */
function extractList<T>(res: unknown, keys: string[]): T[] {
    if (Array.isArray(res)) return res as T[];
    if (res && typeof res === 'object') {
        for (const k of keys) {
            const v = (res as Record<string, unknown>)[k];
            if (Array.isArray(v)) return v as T[];
        }
    }
    return [];
}

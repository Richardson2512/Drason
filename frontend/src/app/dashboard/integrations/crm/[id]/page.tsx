'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { apiClient } from '@/lib/api';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { ChevronLeft, AlertTriangle, Trash2, RefreshCw, Play, CheckCircle2 } from 'lucide-react';
import ConfirmActionModal from '@/components/modals/ConfirmActionModal';
import CustomSelect from '@/components/ui/CustomSelect';

type Provider = 'hubspot' | 'salesforce';
type SyncJobState = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

interface SyncJob {
    id: string;
    type: string;
    state: SyncJobState;
    total_records: number;
    records_processed: number;
    records_created: number;
    records_updated: number;
    records_failed: number;
    started_at: string | null;
    finished_at: string | null;
    error_message: string | null;
    created_at: string;
}

interface ConnectionDetail {
    id: string;
    provider: Provider;
    status: 'active' | 'error' | 'expired' | 'disconnected';
    external_account_name: string | null;
    external_account_id: string | null;
    instance_url: string | null;
    scopes: string[];
    connected_at: string;
    last_sync_at: string | null;
    last_error: string | null;
    disconnected_at: string | null;
    activity_push: { pending: number; pushed: number; failed: number; skipped: number };
    recent_sync_jobs: SyncJob[];
}

interface CrmField {
    name: string;
    label: string;
    type: string;
    capability: 'read' | 'write' | 'read_write';
}

interface HubSpotList { id: string; name: string; size: number; processing_type: string | null }
interface SalesforceListView { id: string; name: string; describe_url: string | null }

interface SuperkabeFieldDef {
    key: string;
    label: string;
    required?: boolean;
}
const SUPERKABE_FIELDS: SuperkabeFieldDef[] = [
    { key: 'email', label: 'Email', required: true },
    { key: 'first_name', label: 'First name' },
    { key: 'last_name', label: 'Last name' },
    { key: 'company', label: 'Company' },
    { key: 'title', label: 'Job title / persona' },
    { key: 'phone', label: 'Phone' },
];

const PROVIDER_META: Record<Provider, { name: string; logo: string }> = {
    hubspot: { name: 'HubSpot', logo: '/brands/hubspot.svg' },
    salesforce: { name: 'Salesforce', logo: '/brands/salesforce.svg' },
};

function formatDate(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit',
    });
}

function StateBadge({ state }: { state: SyncJobState }) {
    const styles: Record<SyncJobState, { bg: string; fg: string }> = {
        pending:   { bg: '#F3F4F6', fg: '#6B7280' },
        running:   { bg: '#DBEAFE', fg: '#1E40AF' },
        completed: { bg: '#D1FAE5', fg: '#065F46' },
        failed:    { bg: '#FEE2E2', fg: '#991B1B' },
        cancelled: { bg: '#F3F4F6', fg: '#6B7280' },
    };
    const s = styles[state];
    return (
        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: s.bg, color: s.fg }}>
            {state}
        </span>
    );
}

export default function CrmConnectionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = String(params?.id ?? '');

    const [conn, setConn] = useState<ConnectionDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Import wizard state
    const [fields, setFields] = useState<CrmField[]>([]);
    const [hubspotLists, setHubspotLists] = useState<HubSpotList[]>([]);
    const [sfViews, setSfViews] = useState<SalesforceListView[]>([]);
    const [selectedSource, setSelectedSource] = useState<string>('');
    const [sfMode, setSfMode] = useState<'view' | 'soql'>('view');
    const [sfSoql, setSfSoql] = useState('SELECT Id, Email, FirstName, LastName FROM Contact WHERE Email != NULL LIMIT 200');
    const [mappings, setMappings] = useState<Record<string, string>>({});
    const [importing, setImporting] = useState(false);
    const [importMessage, setImportMessage] = useState<string | null>(null);
    const [confirmingDisconnect, setConfirmingDisconnect] = useState(false);
    const [disconnecting, setDisconnecting] = useState(false);

    const refresh = async () => {
        try {
            const data = await apiClient<ConnectionDetail>(`/api/integrations/crm/connections/${id}`);
            setConn(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to load connection');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { refresh(); }, [id]);

    // Load source lists + fields once we know the provider
    useEffect(() => {
        if (!conn || conn.status !== 'active') return;
        if (conn.provider === 'hubspot') {
            apiClient<HubSpotList[]>('/api/integrations/hubspot/lists').then(setHubspotLists).catch(() => setHubspotLists([]));
            apiClient<CrmField[]>('/api/integrations/hubspot/fields').then(setFields).catch(() => setFields([]));
        } else {
            apiClient<SalesforceListView[]>('/api/integrations/salesforce/list-views').then(setSfViews).catch(() => setSfViews([]));
            apiClient<CrmField[]>('/api/integrations/salesforce/fields').then(setFields).catch(() => setFields([]));
        }
    }, [conn?.provider, conn?.status]);

    // Default field-mapping suggestions when fields load
    useEffect(() => {
        if (!fields.length || Object.keys(mappings).length) return;
        const guess = (key: string, candidates: string[]): string | undefined => {
            for (const c of candidates) {
                const f = fields.find(f => f.name.toLowerCase() === c.toLowerCase());
                if (f) return f.name;
            }
            return undefined;
        };
        const next: Record<string, string> = {};
        for (const sk of SUPERKABE_FIELDS) {
            const candidates: Record<string, string[]> = {
                email:      ['email', 'Email'],
                first_name: ['firstname', 'FirstName'],
                last_name:  ['lastname', 'LastName'],
                company:    ['company', 'Account.Name', 'Company'],
                title:      ['jobtitle', 'Title'],
                phone:      ['phone', 'Phone'],
            };
            const m = guess(sk.key, candidates[sk.key] || []);
            if (m) next[sk.key] = m;
        }
        setMappings(next);
    }, [fields]);

    const handleStartImport = async () => {
        if (!conn) return;
        setImporting(true);
        setImportMessage(null);
        try {
            const fieldMapping = Object.entries(mappings)
                .filter(([, v]) => !!v)
                .map(([sk, crm]) => ({ superkabe_field: sk, crm_field: crm, direction: 'import' }));

            if (conn.provider === 'hubspot') {
                if (!selectedSource) throw new Error('Pick a HubSpot list to import');
                await apiClient('/api/integrations/hubspot/import', {
                    method: 'POST',
                    body: JSON.stringify({ list_id: selectedSource, field_mapping: fieldMapping }),
                });
            } else {
                const body = sfMode === 'view'
                    ? { view_id: selectedSource, field_mapping: fieldMapping }
                    : { soql: sfSoql, field_mapping: fieldMapping };
                if (sfMode === 'view' && !selectedSource) throw new Error('Pick a Salesforce list view');
                if (sfMode === 'soql' && !sfSoql.trim()) throw new Error('Provide a SOQL query');
                await apiClient('/api/integrations/salesforce/import', {
                    method: 'POST',
                    body: JSON.stringify(body),
                });
            }
            setImportMessage('Import started. The worker will process contacts in batches.');
            await refresh();
        } catch (err: any) {
            setImportMessage(err.message || 'Failed to start import');
        } finally {
            setImporting(false);
        }
    };

    const handleDisconnect = () => {
        if (!conn) return;
        setConfirmingDisconnect(true);
    };

    const confirmDisconnect = async () => {
        if (!conn) return;
        setDisconnecting(true);
        try {
            await apiClient(`/api/integrations/crm/connections/${conn.id}/disconnect`, { method: 'POST' });
            router.push('/dashboard/integrations/crm');
        } catch (err: any) {
            alert(err.message || 'Failed to disconnect');
            setDisconnecting(false);
        }
    };

    if (loading) return <div className="p-8"><LoadingSkeleton type="card" rows={3} /></div>;
    if (error || !conn) {
        return (
            <div className="p-8">
                <Link href="/dashboard/integrations/crm" className="text-xs text-slate-500 hover:underline inline-flex items-center gap-1 mb-4">
                    <ChevronLeft size={14} /> Back to CRM
                </Link>
                <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl text-sm">
                    {error || 'Connection not found'}
                </div>
            </div>
        );
    }

    const meta = PROVIDER_META[conn.provider];
    const isLive = conn.status === 'active';

    return (
        <div className="p-8 max-w-5xl">
            {/* Header */}
            <Link href="/dashboard/integrations/crm" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 mb-3">
                <ChevronLeft size={14} /> Back to CRM
            </Link>
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                    <Image src={meta.logo} alt={meta.name} width={28} height={28} />
                </div>
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-bold text-gray-900">{meta.name}</h1>
                    <p className="text-xs text-slate-500 truncate">
                        {conn.external_account_name || meta.name} · connected {formatDate(conn.connected_at)}
                    </p>
                </div>
                {isLive && (
                    <button onClick={handleDisconnect} className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1.5">
                        <Trash2 size={12} /> Disconnect
                    </button>
                )}
            </div>

            {!isLive && (
                <div className="bg-amber-50 border border-amber-100 text-amber-900 p-4 rounded-xl text-sm mb-6 flex items-start gap-2">
                    <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                    <div>
                        Connection is <strong>{conn.status}</strong>. {conn.last_error && <span className="block text-xs mt-1">{conn.last_error}</span>}
                    </div>
                </div>
            )}

            {isLive && (
                <>
                    {/* Activity-push summary */}
                    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-bold text-gray-900 m-0">Activity push queue</h2>
                            <button onClick={refresh} className="text-[11px] text-slate-500 hover:text-slate-700 flex items-center gap-1">
                                <RefreshCw size={11} /> Refresh
                            </button>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-center">
                            <Stat label="Pending" value={conn.activity_push.pending} />
                            <Stat label="Pushed" value={conn.activity_push.pushed} tone="ok" />
                            <Stat label="Failed" value={conn.activity_push.failed} tone="bad" />
                            <Stat label="Skipped" value={conn.activity_push.skipped} tone="neutral" />
                        </div>
                    </div>

                    {/* Import wizard */}
                    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 mb-6">
                        <h2 className="text-sm font-bold text-gray-900 mb-1">Import contacts</h2>
                        <p className="text-xs text-slate-500 mb-4">
                            Pick a {conn.provider === 'hubspot' ? 'HubSpot list' : 'Salesforce list view or SOQL query'}, map fields,
                            and start the import. The worker pulls 100–200 contacts per tick and creates Superkabe leads.
                        </p>

                        {/* Source picker */}
                        {conn.provider === 'hubspot' ? (
                            <div className="mb-4">
                                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">List</label>
                                <CustomSelect
                                    value={selectedSource}
                                    onChange={setSelectedSource}
                                    placeholder="Choose a HubSpot list…"
                                    searchable={hubspotLists.length > 6}
                                    options={hubspotLists.map(l => ({
                                        value: l.id,
                                        label: l.size ? `${l.name} (${l.size.toLocaleString()})` : l.name,
                                    }))}
                                />
                            </div>
                        ) : (
                            <div className="mb-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <label className="flex items-center gap-1.5 text-xs">
                                        <input type="radio" checked={sfMode === 'view'} onChange={() => setSfMode('view')} /> List view
                                    </label>
                                    <label className="flex items-center gap-1.5 text-xs">
                                        <input type="radio" checked={sfMode === 'soql'} onChange={() => setSfMode('soql')} /> Custom SOQL
                                    </label>
                                </div>
                                {sfMode === 'view' ? (
                                    <CustomSelect
                                        value={selectedSource}
                                        onChange={setSelectedSource}
                                        placeholder="Choose a Salesforce list view…"
                                        searchable={sfViews.length > 6}
                                        options={sfViews.map(v => ({ value: v.id, label: v.name }))}
                                    />
                                ) : (
                                    <textarea
                                        value={sfSoql}
                                        onChange={e => setSfSoql(e.target.value)}
                                        rows={4}
                                        spellCheck={false}
                                        className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-xs font-mono focus:outline-none focus:border-gray-400"
                                    />
                                )}
                            </div>
                        )}

                        {/* Field mapping */}
                        <div className="mb-4">
                            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Field mapping</div>
                            <div className="grid grid-cols-2 gap-2">
                                {SUPERKABE_FIELDS.map(sk => (
                                    <div key={sk.key} className="flex items-center gap-2 text-xs">
                                        <span className="w-32 shrink-0 text-slate-700">
                                            {sk.label}{sk.required && <span className="text-red-500"> *</span>}
                                        </span>
                                        <span className="text-slate-300">→</span>
                                        <div className="flex-1 min-w-0">
                                            <CustomSelect
                                                value={mappings[sk.key] || ''}
                                                onChange={(v) => setMappings({ ...mappings, [sk.key]: v })}
                                                placeholder="Skip"
                                                searchable={fields.length > 8}
                                                options={[
                                                    { value: '', label: 'Skip' },
                                                    ...fields.map(f => ({ value: f.name, label: `${f.label} (${f.name})` })),
                                                ]}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            disabled={importing}
                            onClick={handleStartImport}
                            className="bg-[#1C4532] hover:bg-[#143324] text-white text-xs font-bold px-4 py-2 rounded-lg disabled:opacity-50 inline-flex items-center gap-1.5"
                        >
                            <Play size={11} />
                            {importing ? 'Starting…' : 'Start import'}
                        </button>

                        {importMessage && (
                            <div className="mt-3 text-xs flex items-start gap-1.5 text-slate-600">
                                <CheckCircle2 size={12} className="mt-0.5 shrink-0 text-emerald-600" />
                                {importMessage}
                            </div>
                        )}
                    </div>

                    {/* Sync history */}
                    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5">
                        <h2 className="text-sm font-bold text-gray-900 mb-3">Recent sync jobs</h2>
                        {conn.recent_sync_jobs.length === 0 ? (
                            <p className="text-xs text-slate-500 m-0">No sync jobs yet.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="text-left border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400">
                                            <th className="py-2 pr-3">Type</th>
                                            <th className="py-2 pr-3">State</th>
                                            <th className="py-2 pr-3 text-right">Created</th>
                                            <th className="py-2 pr-3 text-right">Updated</th>
                                            <th className="py-2 pr-3 text-right">Failed</th>
                                            <th className="py-2 pr-3">Started</th>
                                            <th className="py-2 pr-3">Finished</th>
                                            <th className="py-2 pr-3">Error</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {conn.recent_sync_jobs.map(j => (
                                            <tr key={j.id} className="border-b border-slate-50">
                                                <td className="py-2 pr-3 text-slate-700">{j.type}</td>
                                                <td className="py-2 pr-3"><StateBadge state={j.state} /></td>
                                                <td className="py-2 pr-3 text-right">{j.records_created.toLocaleString()}</td>
                                                <td className="py-2 pr-3 text-right">{j.records_updated.toLocaleString()}</td>
                                                <td className="py-2 pr-3 text-right text-red-700">{j.records_failed.toLocaleString()}</td>
                                                <td className="py-2 pr-3 text-slate-500">{formatDate(j.started_at)}</td>
                                                <td className="py-2 pr-3 text-slate-500">{formatDate(j.finished_at)}</td>
                                                <td className="py-2 pr-3 text-red-700 max-w-[200px] truncate" title={j.error_message || ''}>{j.error_message || '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}

            <ConfirmActionModal
                isOpen={confirmingDisconnect}
                title={conn ? `Disconnect ${PROVIDER_META[conn.provider].name}?` : ''}
                icon="🔌"
                message={conn ? `You're about to disconnect ${PROVIDER_META[conn.provider].name} from this Superkabe workspace.` : ''}
                consequences={[
                    'Pending activity pushes will be cancelled',
                    'OAuth tokens will be wiped from our database',
                    'Imported leads stay — only the connection mapping is removed',
                    'You can reconnect anytime from the CRM dashboard',
                ]}
                confirmLabel={disconnecting ? 'Disconnecting…' : 'Disconnect'}
                cancelLabel="Cancel"
                variant="danger"
                loading={disconnecting}
                onConfirm={confirmDisconnect}
                onCancel={() => setConfirmingDisconnect(false)}
            />
        </div>
    );
}

function Stat({ label, value, tone = 'default' }: { label: string; value: number; tone?: 'default' | 'ok' | 'bad' | 'neutral' }) {
    const colors: Record<string, string> = {
        default: 'text-gray-900',
        ok: 'text-emerald-700',
        bad: 'text-red-700',
        neutral: 'text-slate-500',
    };
    return (
        <div>
            <div className={`text-2xl font-bold ${colors[tone]}`}>{value.toLocaleString()}</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400 mt-0.5">{label}</div>
        </div>
    );
}

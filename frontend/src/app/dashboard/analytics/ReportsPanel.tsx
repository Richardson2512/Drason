'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useCampaignList } from '@/hooks/useCampaignList';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import DatePicker from '@/components/ui/DatePicker';
import MultiSelectDropdown from '@/components/ui/MultiSelectDropdown';

// ---- Types ----

interface ReportTypeOption {
    key: string;
    label: string;
    icon: string;
    description: string;
}

interface RecentReport {
    id: string;
    type: string;
    label: string;
    filterSummary: string;
    timestamp: string;
}

interface DomainOption {
    id: string;
    domain: string;
}

// ---- Constants ----

const REPORT_TYPES: ReportTypeOption[] = [
    { key: 'leads', label: 'Leads Report', icon: '\u{1F465}', description: 'All leads with scores, validation status, engagement metrics' },
    { key: 'campaigns', label: 'Campaigns Report', icon: '\u{1F680}', description: 'Campaign performance, mailbox counts, send volumes' },
    { key: 'mailboxes', label: 'Mailboxes Report', icon: '\u{1F4EB}', description: 'Mailbox health, recovery phases, bounce rates' },
    { key: 'domains', label: 'Domains Report', icon: '\u{1F310}', description: 'Domain health, DNS status, mailbox distribution' },
    { key: 'analytics', label: 'Analytics Report', icon: '\u{1F4C8}', description: 'Daily campaign metrics over time' },
    { key: 'audit_logs', label: 'Audit Log Report', icon: '\u{1F4DC}', description: 'Complete action history and system events' },
    { key: 'load_balancing', label: 'Load Balancing Report', icon: '⚖️', description: 'Mailbox load distribution across campaigns' },
    { key: 'sequences', label: 'Sequences Report', icon: '\u{1F4DD}', description: 'Saved multi-step sequences with AI provenance' },
    { key: 'super_sender', label: 'Super Sender Report', icon: '⚡', description: 'Dedicated IPs — state, warmup day, daily cap, 24h bounce/complaint stats' },
    { key: 'reply_quality', label: 'Reply Quality Report', icon: '\u{1F4AC}', description: 'Classified inbound replies (positive / hard_no / OOO / etc.) with AI re-classification trail' },
    { key: 'suppression', label: 'Suppression Report', icon: '\u{1F6AB}', description: 'Org-wide reply suppressions + per-campaign suppression rules' },
    { key: 'warmup', label: 'Warmup Pool Report', icon: '\u{1F525}', description: 'Mailboxes in the cross-tenant warmup pool, ramp progress, spam recovery' },
    { key: 'full', label: 'Full Report', icon: '\u{1F4CB}', description: 'Everything — all data across all sections' },
];

const STATUS_OPTIONS: Record<string, string[]> = {
    leads: ['held', 'active', 'paused', 'bounced', 'invalid', 'unsubscribed', 'opted_out', 'completed'],
    campaigns: ['draft', 'active', 'paused', 'completed', 'archived', 'STARTED', 'INPROGRESS', 'COMPLETED', 'PAUSED', 'STOPPED'],
    mailboxes: ['healthy', 'warning', 'paused', 'quarantine', 'restricted_send', 'warm_recovery'],
    domains: ['healthy', 'warning', 'paused', 'quarantine'],
    analytics: [],
    audit_logs: [],
    load_balancing: [],
    sequences: [],
    super_sender: ['pending_payment', 'provisioning', 'warming', 'active', 'failed', 'canceled'],
    reply_quality: ['positive', 'qualified', 'objection', 'referral', 'soft_no', 'hard_no', 'angry', 'auto', 'unclassified'],
    suppression: [],
    warmup: ['warming', 'maintenance', 'paused', 'error'],
    full: [],
};

const STORAGE_KEY = 'superkabe_recent_reports';
const PREVIEW_ROW_LIMIT = 50;

// Minimal RFC 4180-ish CSV parser — handles quoted fields and "" escapes,
// which is enough for the backend's csv-stringify output.
function parseCsvRows(text: string, maxRows: number): { header: string[]; rows: string[][]; totalDataRows: number } {
    const rawLines = text.split(/\r?\n/);
    const dataLines: string[] = [];
    for (const l of rawLines) {
        const t = l.trim();
        if (!t) continue;
        // Skip section dividers from the "full" report. We preview the first
        // section only — the divider marks the start of the next section.
        if (t.startsWith('---') && dataLines.length > 0) break;
        if (t.startsWith('---')) continue;
        dataLines.push(l);
    }
    if (dataLines.length === 0) return { header: [], rows: [], totalDataRows: 0 };

    const parseLine = (line: string): string[] => {
        const out: string[] = [];
        let cur = '';
        let inQ = false;
        for (let i = 0; i < line.length; i++) {
            const c = line[i];
            if (inQ) {
                if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
                else if (c === '"') { inQ = false; }
                else cur += c;
            } else {
                if (c === ',') { out.push(cur); cur = ''; }
                else if (c === '"') { inQ = true; }
                else cur += c;
            }
        }
        out.push(cur);
        return out;
    };

    const header = parseLine(dataLines[0]);
    const rowSource = dataLines.slice(1);
    const rows = rowSource.slice(0, maxRows).map(parseLine);
    return { header, rows, totalDataRows: rowSource.length };
}

function getDefaultDates() {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
    };
}

function loadRecentReports(): RecentReport[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveRecentReport(report: RecentReport) {
    const existing = loadRecentReports();
    // Keep up to 25 globally so per-type slices still have something to show
    // even for less-used report types. The header modal shows all; the inline
    // section on each report filters down to that type.
    const updated = [report, ...existing].slice(0, 25);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

// ---- Component ----

export default function ReportsPage() {
    const defaults = getDefaultDates();
    const { campaigns } = useCampaignList();

    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [startDate, setStartDate] = useState(defaults.startDate);
    const [endDate, setEndDate] = useState(defaults.endDate);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [selectedCampaignIds, setSelectedCampaignIds] = useState<string[]>([]);
    const [selectedDomainIds, setSelectedDomainIds] = useState<string[]>([]);
    const [selectedEngagement, setSelectedEngagement] = useState<string>('');
    const [domains, setDomains] = useState<DomainOption[]>([]);
    const [recentReports, setRecentReports] = useState<RecentReport[]>([]);
    const [generating, setGenerating] = useState(false);
    const [previewing, setPreviewing] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [preview, setPreview] = useState<{ header: string[]; rows: string[][]; totalDataRows: number } | null>(null);
    const [recentOpen, setRecentOpen] = useState(false);

    useEffect(() => {
        setRecentReports(loadRecentReports());
    }, []);

    useEffect(() => {
        apiClient<any>('/api/dashboard/domains?limit=200')
            .then(result => {
                const list = Array.isArray(result) ? result : result?.data || [];
                setDomains(list.map((d: any) => ({ id: d.id, domain: d.domain })));
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        setSelectedStatuses([]);
        setSelectedCampaignIds([]);
        setSelectedDomainIds([]);
        setSelectedEngagement('');
    }, [selectedType]);

    const selectedReport = selectedType ? REPORT_TYPES.find(r => r.key === selectedType) : null;

    const showCampaignFilter = selectedType === 'leads' || selectedType === 'analytics' || selectedType === 'reply_quality' || selectedType === 'full';
    const showDomainFilter = selectedType === 'mailboxes' || selectedType === 'domains' || selectedType === 'full';
    const showStatusFilter = selectedType && (STATUS_OPTIONS[selectedType]?.length || 0) > 0;
    const showEngagementFilter = selectedType === 'leads';

    const ENGAGEMENT_OPTIONS: { value: string; label: string }[] = [
        { value: 'replied',         label: 'Replied' },
        { value: 'opened',          label: 'Opened' },
        { value: 'clicked',         label: 'Clicked' },
        { value: 'bounced',         label: 'Bounced' },
        { value: 'unsubscribed',    label: 'Unsubscribed' },
        { value: 'no_engagement',   label: 'Sent · no engagement' },
        { value: 'not_sent',        label: 'Not yet sent' },
    ];

    const buildParams = useCallback(() => {
        if (!selectedType) return null;
        const params = new URLSearchParams({ report_type: selectedType });
        if (startDate) params.set('start_date', startDate);
        if (endDate) params.set('end_date', endDate);
        if (selectedStatuses.length > 0) params.set('status', selectedStatuses.join(','));
        if (selectedCampaignIds.length > 0) params.set('campaign_id', selectedCampaignIds.join(','));
        if (selectedDomainIds.length > 0) params.set('domain_id', selectedDomainIds.join(','));
        if (selectedEngagement) params.set('engagement', selectedEngagement);
        params.set('format', 'csv');
        return params;
    }, [selectedType, startDate, endDate, selectedStatuses, selectedCampaignIds, selectedDomainIds, selectedEngagement]);

    const handlePreview = useCallback(async () => {
        const params = buildParams();
        if (!params) return;
        setPreviewing(true);
        setPreviewOpen(true);
        setPreview(null);
        try {
            const response = await fetch(`/api/dashboard/reports/generate?${params}`, {
                credentials: 'include',
            });
            if (!response.ok) {
                const errData = await response.json().catch(() => null);
                throw new Error(errData?.error || `Request failed with status ${response.status}`);
            }
            const csv = await response.text();
            setPreview(parseCsvRows(csv, PREVIEW_ROW_LIMIT));
        } catch (err: any) {
            toast.error(err.message || 'Failed to load preview');
            setPreviewOpen(false);
        } finally {
            setPreviewing(false);
        }
    }, [buildParams]);

    const handleGenerate = useCallback(async () => {
        if (!selectedType) return;
        const params = buildParams();
        if (!params) return;
        setGenerating(true);

        try {
            const response = await fetch(`/api/dashboard/reports/generate?${params}`, {
                credentials: 'include',
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => null);
                throw new Error(errData?.error || `Request failed with status ${response.status}`);
            }

            const blob = await response.blob();
            const disposition = response.headers.get('content-disposition') || '';
            const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
            const filename = filenameMatch?.[1] || `superkabe-${selectedType}-report.csv`;

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            const typeLabel = REPORT_TYPES.find(t => t.key === selectedType)?.label || selectedType;
            const filterParts: string[] = [];
            if (startDate && endDate) filterParts.push(`${startDate} to ${endDate}`);
            if (selectedStatuses.length > 0) filterParts.push(`Status: ${selectedStatuses.join(', ')}`);
            if (selectedCampaignIds.length > 0) filterParts.push(`${selectedCampaignIds.length} campaign(s)`);
            if (selectedDomainIds.length > 0) filterParts.push(`${selectedDomainIds.length} domain(s)`);
            if (selectedEngagement) {
                const lab = ENGAGEMENT_OPTIONS.find(o => o.value === selectedEngagement)?.label ?? selectedEngagement;
                filterParts.push(`Engagement: ${lab}`);
            }

            const newReport: RecentReport = {
                id: Date.now().toString(),
                type: selectedType,
                label: typeLabel,
                filterSummary: filterParts.join(' | ') || 'No filters',
                timestamp: new Date().toISOString(),
            };
            saveRecentReport(newReport);
            setRecentReports(loadRecentReports());
        } catch (err: any) {
            toast.error(err.message || 'Failed to generate report');
        } finally {
            setGenerating(false);
        }
    }, [selectedType, startDate, endDate, selectedStatuses, selectedCampaignIds, selectedDomainIds, selectedEngagement]);

    return (
        <div className="p-4 flex flex-col gap-3" style={{ minHeight: 'calc(100vh - 4rem)' }}>
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Reports</h1>
                    <p className="text-xs text-gray-500 mt-1">
                        {selectedReport
                            ? 'Pick a different report on the left, or configure filters on the right'
                            : 'Generate and download CSV reports for your data'}
                    </p>
                </div>
                <button
                    onClick={() => setRecentOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white text-gray-900 hover:bg-[#FAFAF8] cursor-pointer"
                    style={{ border: '1px solid #D1CBC5' }}
                >
                    <span aria-hidden>{'\u{1F552}'}</span>
                    Recent reports
                    {recentReports.length > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 rounded-md bg-gray-900 text-white text-[10px]">
                            {recentReports.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Index view — original grid of report cards. As soon as a report is
                picked, this swaps for the split layout (left rail + right panel). */}
            {!selectedReport ? (
                <div className="premium-card">
                    <h2 className="text-sm font-semibold text-gray-900 mb-3">Select Report Type</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                        {REPORT_TYPES.map(rt => (
                            <button
                                key={rt.key}
                                onClick={() => setSelectedType(rt.key)}
                                className="text-left p-3 rounded-lg bg-white hover:bg-[#FAFAF8] transition-colors cursor-pointer"
                                style={{ border: '1px solid #D1CBC5' }}
                            >
                                <div className="text-xl mb-1.5">{rt.icon}</div>
                                <div className="font-semibold text-gray-900 text-xs">{rt.label}</div>
                                <div className="text-[11px] text-gray-500 mt-1 leading-relaxed">{rt.description}</div>
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
            <div className="flex flex-col md:flex-row gap-3 flex-1 min-h-0">
                {/* ── Left rail: report type picker ─────────────────── */}
                <div className="md:w-[280px] md:shrink-0">
                    <div className="premium-card !p-2 flex flex-col gap-1 h-full">
                        <div className="px-2 py-1.5 text-[11px] font-semibold text-gray-500">
                            Report type
                        </div>
                        <div
                            className="
                                flex md:flex-col gap-1
                                overflow-x-auto md:overflow-x-visible md:overflow-y-auto
                                snap-x snap-mandatory md:snap-none
                                scrollbar-hide
                            "
                        >
                            {REPORT_TYPES.map(rt => {
                                const isActive = selectedType === rt.key;
                                return (
                                    <button
                                        key={rt.key}
                                        onClick={() => setSelectedType(rt.key)}
                                        title={rt.description}
                                        className={`
                                            text-left rounded-lg px-2.5 py-2 transition-colors cursor-pointer
                                            flex items-center gap-2 shrink-0 md:w-full
                                            snap-start
                                            ${isActive
                                                ? 'bg-gray-900 text-white'
                                                : 'bg-white text-gray-700 hover:bg-[#FAFAF8]'}
                                        `}
                                    >
                                        <span className="text-sm leading-none shrink-0">{rt.icon}</span>
                                        <span className="text-xs font-semibold leading-tight md:truncate md:min-w-0">
                                            {rt.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ── Right panel: filters + recent reports ─────────── */}
                <div className="flex-1 min-w-0 flex flex-col gap-3">
                            <div className="premium-card">
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="text-2xl leading-none">{selectedReport.icon}</div>
                                    <div className="min-w-0">
                                        <h2 className="text-sm font-semibold text-gray-900">{selectedReport.label}</h2>
                                        <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{selectedReport.description}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-5">
                                    {/* Date Range */}
                                    <div className="flex items-end gap-4 flex-wrap">
                                        <div className="flex-1 min-w-[180px]">
                                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                                Start Date
                                            </label>
                                            <DatePicker value={startDate} onChange={setStartDate} />
                                        </div>
                                        <div className="flex-1 min-w-[180px]">
                                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                                End Date
                                            </label>
                                            <DatePicker value={endDate} onChange={setEndDate} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {showStatusFilter && (
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                                    Status filter
                                                </label>
                                                <MultiSelectDropdown
                                                    placeholder="All statuses"
                                                    selected={selectedStatuses}
                                                    onChange={setSelectedStatuses}
                                                    searchable="auto"
                                                    searchPlaceholder="Search statuses…"
                                                    options={(STATUS_OPTIONS[selectedType!] || []).map(s => ({
                                                        value: s,
                                                        label: s.replace(/_/g, ' '),
                                                    }))}
                                                />
                                            </div>
                                        )}

                                        {showCampaignFilter && (
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                                    Campaign filter
                                                </label>
                                                <MultiSelectDropdown
                                                    placeholder={campaigns.length === 0 ? 'No campaigns' : 'All campaigns'}
                                                    selected={selectedCampaignIds}
                                                    onChange={setSelectedCampaignIds}
                                                    searchable
                                                    searchPlaceholder="Search campaigns…"
                                                    options={campaigns.map(c => ({ value: c.id, label: c.name }))}
                                                />
                                            </div>
                                        )}

                                        {showDomainFilter && (
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                                    Domain filter
                                                </label>
                                                <MultiSelectDropdown
                                                    placeholder={domains.length === 0 ? 'No domains' : 'All domains'}
                                                    selected={selectedDomainIds}
                                                    onChange={setSelectedDomainIds}
                                                    searchable
                                                    searchPlaceholder="Search domains…"
                                                    options={domains.map(d => ({ value: d.id, label: d.domain }))}
                                                />
                                            </div>
                                        )}

                                        {showEngagementFilter && (
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                                    Engagement
                                                </label>
                                                <MultiSelectDropdown
                                                    placeholder="All engagement states"
                                                    selected={selectedEngagement ? [selectedEngagement] : []}
                                                    onChange={(arr) => {
                                                        const next = arr.find(v => v !== selectedEngagement) ?? arr[arr.length - 1] ?? '';
                                                        setSelectedEngagement(next || '');
                                                    }}
                                                    options={ENGAGEMENT_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-1 flex flex-wrap gap-2">
                                        <button
                                            onClick={handlePreview}
                                            disabled={previewing || generating}
                                            className="px-4 py-2 bg-white text-gray-900 text-xs font-semibold rounded-lg hover:bg-[#FAFAF8] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                            style={{ border: '1px solid #D1CBC5' }}
                                        >
                                            {previewing ? 'Loading preview…' : 'Preview'}
                                        </button>
                                        <button
                                            onClick={handleGenerate}
                                            disabled={generating || previewing}
                                            className="px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {generating ? (
                                                <span className="flex items-center gap-2">
                                                    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                    </svg>
                                                    Generating…
                                                </span>
                                            ) : (
                                                'Generate & Download CSV'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                    {(() => {
                        // Inline section scoped to the currently-selected report
                        // type. The global "Recent reports" button in the header
                        // still shows everything across all types.
                        const scoped = recentReports.filter(r => r.type === selectedType).slice(0, 5);
                        if (scoped.length === 0) return null;
                        return (
                        <div className="premium-card">
                            <h2 className="text-sm font-semibold text-gray-900 mb-3">Recent {selectedReport?.label}</h2>
                            <div className="flex flex-col gap-1.5">
                                {scoped.map(r => {
                                    const rt = REPORT_TYPES.find(t => t.key === r.type);
                                    const formattedDate = new Date(r.timestamp).toLocaleString('en-US', {
                                        month: 'short', day: 'numeric', year: 'numeric',
                                        hour: '2-digit', minute: '2-digit',
                                    });
                                    return (
                                        <div
                                            key={r.id}
                                            className="flex items-center gap-3 p-2.5 rounded-lg bg-[#FAFAF8]"
                                            style={{ border: '1px solid #E8E3DC' }}
                                        >
                                            <span className="text-base">{rt?.icon || '\u{1F4C4}'}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs font-semibold text-gray-900">{r.label}</div>
                                                <div className="text-[11px] text-gray-500 truncate">{r.filterSummary}</div>
                                            </div>
                                            <div className="text-[11px] text-gray-400 whitespace-nowrap">{formattedDate}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        );
                    })()}
                </div>
            </div>
            )}

            {/* Preview modal — portalled to body so it's never clipped by the
                dashboard's overflow:hidden shells. Renders the first N rows of
                exactly what the CSV download would contain, parsed client-side
                so there's no backend change. */}
            {previewOpen && typeof document !== 'undefined' && createPortal(
                <div
                    className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4"
                    onClick={() => setPreviewOpen(false)}
                >
                    <div
                        className="bg-white rounded-xl flex flex-col w-full max-w-6xl"
                        style={{ maxHeight: '85vh', border: '1px solid #D1CBC5', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div
                            className="flex items-start justify-between gap-3 px-4 py-3"
                            style={{ borderBottom: '1px solid #D1CBC5', background: '#FAF7F1' }}
                        >
                            <div className="min-w-0">
                                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                    <span className="text-base leading-none">{selectedReport?.icon}</span>
                                    {selectedReport?.label} — Preview
                                </h3>
                                <p className="text-[11px] text-gray-500 mt-0.5">
                                    {previewing
                                        ? 'Fetching report…'
                                        : preview
                                            ? `Showing first ${preview.rows.length} of ${preview.totalDataRows} row${preview.totalDataRows === 1 ? '' : 's'}`
                                            : ''}
                                    {selectedType === 'full' && preview && (
                                        <span className="ml-1 text-amber-700">· Full report has multiple sections — only the first is shown</span>
                                    )}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={() => { setPreviewOpen(false); handleGenerate(); }}
                                    disabled={generating || previewing || !preview}
                                    className="px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Download CSV
                                </button>
                                <button
                                    onClick={() => setPreviewOpen(false)}
                                    className="px-3 py-1.5 rounded-lg bg-white text-gray-900 text-xs font-semibold hover:bg-[#FAFAF8] cursor-pointer"
                                    style={{ border: '1px solid #D1CBC5' }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 min-h-0 overflow-auto">
                            {previewing && (
                                <div className="p-10 text-center text-xs text-gray-500">Loading preview…</div>
                            )}
                            {!previewing && preview && preview.header.length === 0 && (
                                <div className="p-10 text-center text-xs text-gray-500">
                                    Report is empty for the current filters.
                                </div>
                            )}
                            {!previewing && preview && preview.header.length > 0 && (
                                <table className="w-full text-xs border-collapse">
                                    <thead className="sticky top-0 z-10" style={{ background: '#FAF7F1' }}>
                                        <tr>
                                            {preview.header.map((h, i) => (
                                                <th
                                                    key={i}
                                                    className="text-left font-semibold text-gray-700 px-3 py-2 whitespace-nowrap"
                                                    style={{ borderBottom: '1px solid #D1CBC5' }}
                                                >
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {preview.rows.length === 0 ? (
                                            <tr>
                                                <td colSpan={preview.header.length} className="px-3 py-8 text-center text-xs text-gray-500">
                                                    No data rows for the current filters.
                                                </td>
                                            </tr>
                                        ) : (
                                            preview.rows.map((row, ri) => (
                                                <tr key={ri} style={{ background: ri % 2 === 0 ? '#FFFFFF' : '#FAFAF8' }}>
                                                    {preview.header.map((_, ci) => (
                                                        <td
                                                            key={ci}
                                                            className="px-3 py-1.5 text-gray-800 align-top max-w-[280px] truncate"
                                                            style={{ borderBottom: '1px solid #F0EBE3' }}
                                                            title={row[ci] ?? ''}
                                                        >
                                                            {row[ci] ?? ''}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>,
                document.body,
            )}

            {/* Recent reports modal — accessible from the page header so users
                can pull up history without first picking a report type. */}
            {recentOpen && typeof document !== 'undefined' && createPortal(
                <div
                    className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4"
                    onClick={() => setRecentOpen(false)}
                >
                    <div
                        className="bg-white rounded-xl flex flex-col w-full max-w-xl"
                        style={{ maxHeight: '80vh', border: '1px solid #D1CBC5', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div
                            className="flex items-start justify-between gap-3 px-4 py-3"
                            style={{ borderBottom: '1px solid #D1CBC5', background: '#FAF7F1' }}
                        >
                            <div className="min-w-0">
                                <h3 className="text-sm font-semibold text-gray-900">Recent reports</h3>
                                <p className="text-[11px] text-gray-500 mt-0.5">
                                    {recentReports.length === 0
                                        ? 'No reports generated yet'
                                        : `Last ${recentReports.length} report${recentReports.length === 1 ? '' : 's'} you generated on this device`}
                                </p>
                            </div>
                            <button
                                onClick={() => setRecentOpen(false)}
                                className="px-3 py-1.5 rounded-lg bg-white text-gray-900 text-xs font-semibold hover:bg-[#FAFAF8] cursor-pointer shrink-0"
                                style={{ border: '1px solid #D1CBC5' }}
                            >
                                Close
                            </button>
                        </div>

                        <div className="flex-1 min-h-0 overflow-auto p-3 flex flex-col gap-1.5">
                            {recentReports.length === 0 ? (
                                <div className="p-10 text-center text-xs text-gray-500">
                                    Generate a report to see it listed here.
                                </div>
                            ) : (
                                recentReports.map(r => {
                                    const rt = REPORT_TYPES.find(t => t.key === r.type);
                                    const formattedDate = new Date(r.timestamp).toLocaleString('en-US', {
                                        month: 'short', day: 'numeric', year: 'numeric',
                                        hour: '2-digit', minute: '2-digit',
                                    });
                                    return (
                                        <button
                                            key={r.id}
                                            onClick={() => {
                                                setSelectedType(r.type);
                                                setRecentOpen(false);
                                            }}
                                            className="text-left flex items-center gap-3 p-2.5 rounded-lg bg-[#FAFAF8] hover:bg-[#F5F1EA] cursor-pointer"
                                            style={{ border: '1px solid #E8E3DC' }}
                                            title="Open this report type"
                                        >
                                            <span className="text-base">{rt?.icon || '\u{1F4C4}'}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs font-semibold text-gray-900">{r.label}</div>
                                                <div className="text-[11px] text-gray-500 truncate">{r.filterSummary}</div>
                                            </div>
                                            <div className="text-[11px] text-gray-400 whitespace-nowrap">{formattedDate}</div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>,
                document.body,
            )}
        </div>
    );
}

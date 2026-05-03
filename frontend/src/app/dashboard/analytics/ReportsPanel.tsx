'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCampaignList } from '@/hooks/useCampaignList';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import DatePicker from '@/components/ui/DatePicker';

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
    { key: 'load_balancing', label: 'Load Balancing Report', icon: '\u2696\uFE0F', description: 'Mailbox load distribution across campaigns' },
    { key: 'full', label: 'Full Report', icon: '\u{1F4CB}', description: 'Everything \u2014 all data across all sections' },
];

const STATUS_OPTIONS: Record<string, string[]> = {
    leads: ['held', 'active', 'paused', 'bounced', 'invalid', 'completed'],
    campaigns: ['active', 'paused', 'completed'],
    mailboxes: ['healthy', 'warning', 'paused', 'quarantine', 'restricted_send', 'warm_recovery'],
    domains: ['healthy', 'warning', 'paused', 'quarantine'],
    analytics: [],
    audit_logs: [],
    load_balancing: [],
    full: [],
};

import { PROTECTION_PLATFORMS } from '@/lib/constants';
const PLATFORM_OPTIONS = [...PROTECTION_PLATFORMS];

const STORAGE_KEY = 'superkabe_recent_reports';

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
    const updated = [report, ...existing].slice(0, 5);
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
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
    const [domains, setDomains] = useState<DomainOption[]>([]);
    const [recentReports, setRecentReports] = useState<RecentReport[]>([]);
    const [generating, setGenerating] = useState(false);

    // Load recent reports from localStorage
    useEffect(() => {
        setRecentReports(loadRecentReports());
    }, []);

    // Fetch domains list
    useEffect(() => {
        apiClient<any>('/api/dashboard/domains?limit=200')
            .then(result => {
                const list = Array.isArray(result) ? result : result?.data || [];
                setDomains(list.map((d: any) => ({ id: d.id, domain: d.domain })));
            })
            .catch(() => {});
    }, []);

    // Reset filters when report type changes
    useEffect(() => {
        setSelectedStatuses([]);
        setSelectedCampaignIds([]);
        setSelectedDomainIds([]);
        setSelectedPlatforms([]);
    }, [selectedType]);

    const toggleInArray = (arr: string[], val: string): string[] =>
        arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];

    const showCampaignFilter = selectedType === 'leads' || selectedType === 'analytics' || selectedType === 'full';
    const showDomainFilter = selectedType === 'mailboxes' || selectedType === 'domains' || selectedType === 'full';
    const showStatusFilter = selectedType && (STATUS_OPTIONS[selectedType]?.length || 0) > 0;

    const handleGenerate = useCallback(async () => {
        if (!selectedType) return;
        setGenerating(true);

        try {
            const params = new URLSearchParams({ report_type: selectedType });
            if (startDate) params.set('start_date', startDate);
            if (endDate) params.set('end_date', endDate);
            if (selectedStatuses.length > 0) params.set('status', selectedStatuses.join(','));
            if (selectedCampaignIds.length > 0) params.set('campaign_id', selectedCampaignIds.join(','));
            if (selectedDomainIds.length > 0) params.set('domain_id', selectedDomainIds.join(','));
            if (selectedPlatforms.length > 0) params.set('platform', selectedPlatforms.join(','));
            params.set('format', 'csv');

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

            // Save to recent reports
            const typeLabel = REPORT_TYPES.find(t => t.key === selectedType)?.label || selectedType;
            const filterParts: string[] = [];
            if (startDate && endDate) filterParts.push(`${startDate} to ${endDate}`);
            if (selectedStatuses.length > 0) filterParts.push(`Status: ${selectedStatuses.join(', ')}`);
            if (selectedCampaignIds.length > 0) filterParts.push(`${selectedCampaignIds.length} campaign(s)`);
            if (selectedDomainIds.length > 0) filterParts.push(`${selectedDomainIds.length} domain(s)`);
            if (selectedPlatforms.length > 0) filterParts.push(`Platform: ${selectedPlatforms.join(', ')}`);

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
    }, [selectedType, startDate, endDate, selectedStatuses, selectedCampaignIds, selectedDomainIds, selectedPlatforms]);

    const inputStyle: React.CSSProperties = {
        padding: '0.625rem 1rem',
        borderRadius: '12px',
        border: '1px solid #E5E7EB',
        fontSize: '0.875rem',
        outline: 'none',
        background: '#FFFFFF',
        color: '#111827',
    };

    return (
        <div className="p-4 flex flex-col gap-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
                <p className="text-sm text-gray-500 mt-1">Generate and download CSV reports for your data</p>
            </div>

            {/* Report Type Selection */}
            <div className="premium-card">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Select Report Type</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {REPORT_TYPES.map(rt => (
                        <button
                            key={rt.key}
                            onClick={() => setSelectedType(rt.key)}
                            className={`text-left p-4 rounded-xl border-2 transition-all ${
                                selectedType === rt.key
                                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                            }`}
                        >
                            <div className="text-2xl mb-2">{rt.icon}</div>
                            <div className="font-semibold text-gray-900 text-sm">{rt.label}</div>
                            <div className="text-xs text-gray-500 mt-1 leading-relaxed">{rt.description}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Filters Section */}
            {selectedType && (
                <div className="premium-card">
                    <h2 className="text-base font-semibold text-gray-900 mb-4">Filters</h2>
                    <div className="flex flex-col gap-5">
                        {/* Date Range */}
                        <div className="flex items-end gap-4 flex-wrap">
                            <div className="flex-1 min-w-[180px]">
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                                    Start Date
                                </label>
                                <DatePicker value={startDate} onChange={setStartDate} />
                            </div>
                            <div className="flex-1 min-w-[180px]">
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                                    End Date
                                </label>
                                <DatePicker value={endDate} onChange={setEndDate} />
                            </div>
                        </div>

                        {/* Status Filter */}
                        {showStatusFilter && (
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                                    Status Filter
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {STATUS_OPTIONS[selectedType]?.map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setSelectedStatuses(toggleInArray(selectedStatuses, s))}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                                selectedStatuses.includes(s)
                                                    ? 'bg-blue-500 text-white border-blue-500'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            {s.replace(/_/g, ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Campaign Filter */}
                        {showCampaignFilter && campaigns.length > 0 && (
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                                    Campaign Filter
                                </label>
                                <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto">
                                    {campaigns.map(c => (
                                        <button
                                            key={c.id}
                                            onClick={() => setSelectedCampaignIds(toggleInArray(selectedCampaignIds, c.id))}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                                selectedCampaignIds.includes(c.id)
                                                    ? 'bg-blue-500 text-white border-blue-500'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            {c.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Domain Filter */}
                        {showDomainFilter && domains.length > 0 && (
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                                    Domain Filter
                                </label>
                                <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto">
                                    {domains.map(d => (
                                        <button
                                            key={d.id}
                                            onClick={() => setSelectedDomainIds(toggleInArray(selectedDomainIds, d.id))}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                                selectedDomainIds.includes(d.id)
                                                    ? 'bg-blue-500 text-white border-blue-500'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            {d.domain}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Platform Filter */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                                Platform Filter
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {PLATFORM_OPTIONS.map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setSelectedPlatforms(toggleInArray(selectedPlatforms, p))}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all capitalize ${
                                            selectedPlatforms.includes(p)
                                                ? 'bg-blue-500 text-white border-blue-500'
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Generate Button */}
                        <div className="pt-2">
                            <button
                                onClick={handleGenerate}
                                disabled={generating}
                                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            >
                                {generating ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Generating...
                                    </span>
                                ) : (
                                    'Generate & Download CSV'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Recent Reports */}
            {recentReports.length > 0 && (
                <div className="premium-card">
                    <h2 className="text-base font-semibold text-gray-900 mb-4">Recent Reports</h2>
                    <div className="flex flex-col gap-2">
                        {recentReports.map(r => {
                            const rt = REPORT_TYPES.find(t => t.key === r.type);
                            const formattedDate = new Date(r.timestamp).toLocaleString('en-US', {
                                month: 'short', day: 'numeric', year: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                            });
                            return (
                                <div
                                    key={r.id}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
                                >
                                    <span className="text-xl">{rt?.icon || '\u{1F4C4}'}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-semibold text-gray-900">{r.label}</div>
                                        <div className="text-xs text-gray-500 truncate">{r.filterSummary}</div>
                                    </div>
                                    <div className="text-xs text-gray-400 whitespace-nowrap">{formattedDate}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

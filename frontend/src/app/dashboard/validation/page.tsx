'use client';

import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { apiClient } from '@/lib/api';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertTriangle, Copy, Download, Send, ChevronDown, ChevronRight, Search, X } from 'lucide-react';
import Papa from 'papaparse';
import type { ValidationBatch, ValidationBatchLead, ColumnMapping, ValidationAnalytics } from '@/types/api';
import CustomSelect from '@/components/ui/CustomSelect';
import DatePicker from '@/components/ui/DatePicker';

// ============================================================================
// TYPES
// ============================================================================

interface Campaign {
    id: string;
    name: string;
    source_platform: string;
}

interface ParsedLead {
    email: string;
    first_name?: string;
    last_name?: string;
    company?: string;
    persona?: string;
    lead_score?: number;
}

// Column auto-detect dictionary
const HEADER_VARIANTS: Record<string, string[]> = {
    email: ['email', 'e-mail', 'email_address', 'emailaddress', 'work email', 'mail'],
    first_name: ['first_name', 'firstname', 'first name', 'fname', 'given_name', 'first'],
    last_name: ['last_name', 'lastname', 'last name', 'lname', 'surname', 'last'],
    company: ['company', 'company_name', 'companyname', 'company name', 'organization', 'org', 'account'],
    persona: ['persona', 'title', 'job_title', 'jobtitle', 'job title', 'role', 'position'],
    lead_score: ['lead_score', 'leadscore', 'lead score', 'score', 'rating'],
};

function autoDetectMapping(headers: string[]): ColumnMapping {
    const mapping: Partial<ColumnMapping> = {};
    const norm = headers.map(h => h.trim().toLowerCase());
    for (const [field, variants] of Object.entries(HEADER_VARIANTS)) {
        for (const v of variants) {
            const idx = norm.indexOf(v);
            if (idx !== -1) { (mapping as any)[field] = headers[idx]; break; }
        }
    }
    if (!mapping.email) {
        const idx = norm.findIndex(h => h.includes('email') || h === 'mail');
        if (idx !== -1) mapping.email = headers[idx];
    }
    return mapping as ColumnMapping;
}

// ============================================================================
// STATUS COLORS
// ============================================================================

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
    valid: { bg: '#D1FAE5', text: '#065F46' },
    risky: { bg: '#FEF3C7', text: '#92400E' },
    invalid: { bg: '#FEE2E2', text: '#991B1B' },
    duplicate: { bg: '#E5E7EB', text: '#374151' },
    pending: { bg: '#DBEAFE', text: '#1E40AF' },
};

const ESP_COLORS: Record<string, string> = {
    gmail: '#EA4335',
    microsoft: '#0078D4',
    yahoo: '#6001D2',
    other: '#6B7280',
};

// ============================================================================
// MAIN PAGE
// ============================================================================

function ValidationPageContent() {
    // State
    const [batches, setBatches] = useState<ValidationBatch[]>([]);
    const [selectedBatch, setSelectedBatch] = useState<ValidationBatch | null>(null);
    const [batchLeads, setBatchLeads] = useState<ValidationBatchLead[]>([]);
    const [batchMeta, setBatchMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
    const [analytics, setAnalytics] = useState<ValidationAnalytics | null>(null);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [espPerformance, setEspPerformance] = useState<Array<{
        mailbox_id: string; email: string; status: string;
        esp_scores: Record<string, { send_count: number; bounce_count: number; bounce_rate: number; reply_count: number }>;
    }>>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [espFilter, setEspFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Upload state
    const [showUpload, setShowUpload] = useState(false);
    const [uploadStep, setUploadStep] = useState<'select' | 'mapping' | 'processing' | 'done'>('select');
    const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
    const [csvData, setCsvData] = useState<any[]>([]);
    const [columnMapping, setColumnMapping] = useState<ColumnMapping>({ email: '' });
    const [fileName, setFileName] = useState('');
    const [targetCampaignId, setTargetCampaignId] = useState('');
    const [processingBatchId, setProcessingBatchId] = useState('');
    const [processingProgress, setProcessingProgress] = useState({ current: 0, total: 0, validCount: 0, invalidCount: 0, riskyCount: 0 });
    const [uploading, setUploading] = useState(false);

    // Route state
    const [showRouteModal, setShowRouteModal] = useState(false);
    const [routeCampaignId, setRouteCampaignId] = useState('');
    const [routing, setRouting] = useState(false);
    const [routeResult, setRouteResult] = useState<{ routed: number; failed: number } | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // ========== DATA FETCHING ==========

    // Time-range filter for analytics + batch history
    const [timeRange, setTimeRange] = useState<'all' | '7d' | '30d' | '90d' | 'custom'>('all');
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');

    const buildRangeQuery = useCallback(() => {
        const params = new URLSearchParams();
        if (timeRange === 'custom') {
            if (customFrom) params.set('from', customFrom);
            if (customTo) params.set('to', customTo);
        } else if (timeRange !== 'all') {
            params.set('timeRange', timeRange);
        }
        return params.toString();
    }, [timeRange, customFrom, customTo]);

    const fetchBatches = useCallback(async () => {
        try {
            const qs = buildRangeQuery();
            // apiClient auto-unwraps the `data` key, so res IS the array directly
            // when the backend returns `{success, data, meta}`. meta is lost via the
            // unwrap — we fall back to the array's length for display.
            const res = await apiClient<any>(`/api/validation/batches?limit=50${qs ? `&${qs}` : ''}`);
            const list: ValidationBatch[] = Array.isArray(res) ? res : (res?.data || []);
            setBatches(list);
        } catch { /* graceful */ }
    }, [buildRangeQuery]);

    const fetchAnalytics = useCallback(async () => {
        try {
            const qs = buildRangeQuery();
            // Backend returns `{success, ...analytics}` — no `data` key, so apiClient
            // returns the whole response object. Cast and use directly.
            const res = await apiClient<ValidationAnalytics>(`/api/validation/analytics${qs ? `?${qs}` : ''}`);
            setAnalytics(res);
        } catch { /* graceful */ }
    }, [buildRangeQuery]);

    const fetchCampaigns = useCallback(async () => {
        try {
            const res = await apiClient<any>('/api/dashboard/campaigns?limit=200');
            const list: Campaign[] = Array.isArray(res) ? res : (res?.data || res?.campaigns || []);
            setCampaigns(list);
        } catch { /* graceful */ }
    }, []);

    const fetchEspPerformance = useCallback(async () => {
        try {
            const res = await apiClient<any>('/api/analytics/esp-performance');
            const list = Array.isArray(res) ? res : (res?.data || []);
            setEspPerformance(list);
        } catch { /* graceful */ }
    }, []);

    const fetchBatchLeads = useCallback(async (batchId: string, page = 1) => {
        try {
            const params = new URLSearchParams({ page: String(page), limit: String(batchMeta.limit) });
            if (statusFilter !== 'all') params.set('status', statusFilter);
            if (espFilter !== 'all') params.set('esp', espFilter);
            if (searchQuery.trim()) params.set('search', searchQuery.trim());
            // Backend nests `batch` + `meta` + `leads` inside `data` so the apiClient
            // auto-unwrap preserves them. Fall back to legacy `res.data` shape too.
            const res = await apiClient<any>(`/api/validation/batches/${batchId}?${params}`);
            setBatchLeads(res?.leads || res?.data || []);
            if (res?.meta) setBatchMeta(res.meta);
            if (res?.batch) setSelectedBatch(res.batch);
            setSelectedIds(new Set());
        } catch { /* graceful */ }
    }, [statusFilter, espFilter, searchQuery, batchMeta.limit]);

    useEffect(() => {
        Promise.all([fetchBatches(), fetchAnalytics(), fetchCampaigns(), fetchEspPerformance()]).then(() => setLoading(false));
    }, [fetchBatches, fetchAnalytics, fetchCampaigns]);

    useEffect(() => {
        if (selectedBatch) fetchBatchLeads(selectedBatch.id, batchMeta.page);
    }, [selectedBatch?.id, statusFilter, espFilter, searchQuery, batchMeta.page]);

    // ========== CSV UPLOAD FLOW ==========

    const handleFileSelect = (file: File) => {
        setFileName(file.name);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            preview: 3,
            complete: (result) => {
                const headers = result.meta.fields || [];
                setCsvHeaders(headers);
                setCsvData(result.data as any[]);
                const mapping = autoDetectMapping(headers);
                setColumnMapping(mapping);
                setUploadStep('mapping');
            },
            error: () => { alert('Failed to parse CSV'); }
        });
    };

    const handleConfirmUpload = async () => {
        if (!columnMapping.email) { alert('Email column mapping is required'); return; }
        setUploading(true);

        // Parse full CSV
        const fileInput = fileInputRef.current;
        const file = fileInput?.files?.[0];
        if (!file) { setUploading(false); return; }

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (result) => {
                const rows = result.data as Record<string, string>[];
                const leads: ParsedLead[] = [];
                for (const row of rows) {
                    const email = (row[columnMapping.email] || '').trim().toLowerCase();
                    if (!email || !email.includes('@')) continue;
                    const lead: ParsedLead = { email };
                    if (columnMapping.first_name && row[columnMapping.first_name]) lead.first_name = row[columnMapping.first_name].trim();
                    if (columnMapping.last_name && row[columnMapping.last_name]) lead.last_name = row[columnMapping.last_name].trim();
                    if (columnMapping.company && row[columnMapping.company]) lead.company = row[columnMapping.company].trim();
                    if (columnMapping.persona && row[columnMapping.persona]) lead.persona = row[columnMapping.persona].trim();
                    if (columnMapping.lead_score && row[columnMapping.lead_score]) {
                        const s = parseInt(row[columnMapping.lead_score], 10);
                        lead.lead_score = isNaN(s) ? 50 : Math.min(100, Math.max(0, s));
                    }
                    leads.push(lead);
                }

                try {
                    const res = await apiClient<{ batchId: string; totalCount: number }>('/api/validation/upload', {
                        method: 'POST',
                        body: JSON.stringify({
                            leads,
                            fileName,
                            targetCampaignId: targetCampaignId || undefined,
                            source: 'csv',
                        }),
                    });
                    setProcessingBatchId(res.batchId);
                    setProcessingProgress({ current: 0, total: res.totalCount, validCount: 0, invalidCount: 0, riskyCount: 0 });
                    setUploadStep('processing');

                    // Poll for progress
                    const pollInterval = setInterval(async () => {
                        try {
                            const batch = await apiClient<{ batch: ValidationBatch }>(`/api/validation/batches/${res.batchId}?limit=1`);
                            if (batch?.batch) {
                                setProcessingProgress({
                                    current: batch.batch.valid_count + batch.batch.invalid_count + batch.batch.risky_count + batch.batch.duplicate_count,
                                    total: batch.batch.total_count,
                                    validCount: batch.batch.valid_count,
                                    invalidCount: batch.batch.invalid_count,
                                    riskyCount: batch.batch.risky_count,
                                });
                                if (batch.batch.status === 'completed' || batch.batch.status === 'failed') {
                                    clearInterval(pollInterval);
                                    setUploadStep('done');
                                    setSelectedBatch(batch.batch);
                                    fetchBatchLeads(batch.batch.id);
                                    fetchBatches();
                                    fetchAnalytics();
                                }
                            }
                        } catch { /* continue polling */ }
                    }, 2000);
                } catch (err: any) {
                    alert(err.message || 'Upload failed');
                    setUploadStep('select');
                }
                setUploading(false);
            }
        });
    };

    const resetUpload = () => {
        setShowUpload(false);
        setUploadStep('select');
        setCsvHeaders([]);
        setCsvData([]);
        setColumnMapping({ email: '' });
        setFileName('');
        setTargetCampaignId('');
        setProcessingBatchId('');
        setUploading(false);
    };

    // ========== ROUTING ==========

    const handleRouteLeads = async () => {
        if (!selectedBatch || selectedIds.size === 0 || !routeCampaignId) return;
        setRouting(true);
        try {
            const res = await apiClient<{ routed: number; failed: number }>(`/api/validation/batches/${selectedBatch.id}/route`, {
                method: 'POST',
                body: JSON.stringify({ leadIds: Array.from(selectedIds), campaignId: routeCampaignId }),
            });
            setRouteResult(res);
            fetchBatchLeads(selectedBatch.id, batchMeta.page);
            fetchBatches();
        } catch (err: any) {
            alert(err.message || 'Routing failed');
        }
        setRouting(false);
    };

    // ========== EXPORT ==========

    const handleExport = async (filter?: string[]) => {
        if (!selectedBatch) return;
        try {
            const res = await fetch(`/api/validation/batches/${selectedBatch.id}/export`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ statusFilter: filter }),
            });
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `validation-${selectedBatch.id.slice(0, 8)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } catch { alert('Export failed'); }
    };

    // ========== SELECTION ==========

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };
    const toggleSelectAll = () => {
        if (selectedIds.size === batchLeads.length) setSelectedIds(new Set());
        else setSelectedIds(new Set(batchLeads.map(l => l.id)));
    };

    // ========== RENDER ==========

    if (loading) return <div className="p-6"><LoadingSkeleton type="card" rows={3} /></div>;

    return (
        <div className="p-4 flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Email Validation</h1>
                    <p className="text-xs text-gray-500 mt-0.5">Upload leads, validate emails, classify by ESP, and route to campaigns.</p>
                </div>
                <button
                    onClick={() => { setShowUpload(true); setUploadStep('select'); }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors cursor-pointer"
                >
                    <Upload size={14} />
                    Upload CSV
                </button>
            </div>

            {/* Time range filter — applies to stats + validation history */}
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-semibold text-gray-500 uppercase">Range</span>
                {([
                    { key: 'all', label: 'All time' },
                    { key: '7d', label: '7 days' },
                    { key: '30d', label: '30 days' },
                    { key: '90d', label: '90 days' },
                ] as const).map(r => (
                    <button
                        key={r.key}
                        onClick={() => setTimeRange(r.key)}
                        className="px-2.5 py-1 rounded-md text-[10px] font-semibold cursor-pointer transition-colors"
                        style={{
                            background: timeRange === r.key ? '#111827' : '#FFFFFF',
                            color: timeRange === r.key ? '#FFFFFF' : '#6B7280',
                            border: `1px solid ${timeRange === r.key ? '#111827' : '#D1CBC5'}`,
                        }}
                    >
                        {r.label}
                    </button>
                ))}
                <div className="w-px h-5 bg-gray-200 mx-1" />
                <div className="flex items-center gap-1.5">
                    <div className="w-36">
                        <DatePicker
                            value={customFrom}
                            onChange={v => { setCustomFrom(v); if (customTo || v) setTimeRange('custom'); }}
                            placeholder="From"
                        />
                    </div>
                    <span className="text-[10px] text-gray-400">to</span>
                    <div className="w-36">
                        <DatePicker
                            value={customTo}
                            onChange={v => { setCustomTo(v); if (customFrom || v) setTimeRange('custom'); }}
                            placeholder="To"
                        />
                    </div>
                    {(customFrom || customTo) && (
                        <button
                            onClick={() => { setCustomFrom(''); setCustomTo(''); setTimeRange('all'); }}
                            className="text-[10px] text-gray-500 hover:text-gray-800 cursor-pointer bg-transparent border-none px-1"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Analytics Summary */}
            {analytics && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="premium-card">
                        <div className="text-[10px] font-semibold uppercase text-gray-400 mb-1">Total Validated</div>
                        <div className="text-xl font-bold text-gray-900">{analytics.totalValidated.toLocaleString()}</div>
                    </div>
                    <div className="premium-card">
                        <div className="text-[10px] font-semibold uppercase text-gray-400 mb-1">Pass Rate</div>
                        <div className="text-xl font-bold text-emerald-600">
                            {analytics.totalValidated > 0 ? Math.round(((analytics.statusBreakdown.valid || 0) / analytics.totalValidated) * 100) : 0}%
                        </div>
                    </div>
                    <div className="premium-card">
                        <div className="text-[10px] font-semibold uppercase text-gray-400 mb-1">Invalid Rate</div>
                        <div className="text-xl font-bold text-red-600">
                            {analytics.totalValidated > 0 ? Math.round(((analytics.statusBreakdown.invalid || 0) / analytics.totalValidated) * 100) : 0}%
                        </div>
                    </div>
                    <div className="premium-card">
                        <div className="text-[10px] font-semibold uppercase text-gray-400 mb-1">ESP Split</div>
                        <div className="flex gap-1 mt-1">
                            {Object.entries(analytics.espDistribution || {}).map(([esp, count]) => {
                                const total = Object.values(analytics.espDistribution || {}).reduce((a, b) => a + b, 0);
                                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                                return (
                                    <div key={esp} className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full" style={{ background: ESP_COLORS[esp] || '#6B7280' }} />
                                        <span className="text-[10px] text-gray-500">{esp} {pct}%</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Analytics Deep-Dive: Rejection Reasons + Source Breakdown + Trend */}
            {analytics && analytics.totalValidated > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Rejection Reasons */}
                    <div className="premium-card">
                        <h3 className="text-xs font-bold text-gray-900 mb-2">Rejection Reasons</h3>
                        {(analytics.rejectionReasons || []).length > 0 ? (
                            <div className="flex flex-col gap-1.5">
                                {(analytics.rejectionReasons || []).map(r => {
                                    const totalInvalid = (analytics.statusBreakdown.invalid || 0) + (analytics.statusBreakdown.risky || 0);
                                    const pct = totalInvalid > 0 ? Math.round((r.count / totalInvalid) * 100) : 0;
                                    const labels: Record<string, string> = {
                                        disposable: 'Disposable email',
                                        no_mx: 'No MX records',
                                        syntax: 'Syntax error',
                                        smtp_fail: 'SMTP unreachable',
                                        catch_all: 'Catch-all domain',
                                        role_based: 'Role-based (info@)',
                                        low_score: 'Low confidence score',
                                        api_invalid: 'API rejected',
                                    };
                                    return (
                                        <div key={r.reason}>
                                            <div className="flex items-center justify-between text-[10px] mb-0.5">
                                                <span className="text-gray-600">{labels[r.reason] || r.reason}</span>
                                                <span className="font-semibold text-gray-900">{r.count} ({pct}%)</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-red-400 rounded-full" style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-[10px] text-gray-400 text-center py-4">No rejections yet</p>
                        )}
                    </div>

                    {/* Invalid Rate by Source */}
                    <div className="premium-card">
                        <h3 className="text-xs font-bold text-gray-900 mb-2">Invalid Rate by Source</h3>
                        {(analytics.invalidRateBySource || []).length > 0 ? (
                            <div className="flex flex-col gap-2">
                                {analytics.invalidRateBySource.map(s => {
                                    const ratePct = Math.round(s.rate * 100);
                                    const barColor = ratePct < 3 ? '#10B981' : ratePct < 8 ? '#F59E0B' : '#EF4444';
                                    return (
                                        <div key={s.source}>
                                            <div className="flex items-center justify-between text-[10px] mb-0.5">
                                                <span className="text-gray-600 uppercase font-medium">{s.source}</span>
                                                <span className="font-semibold" style={{ color: barColor }}>{ratePct}% invalid</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full rounded-full" style={{ width: `${Math.min(ratePct, 100)}%`, background: barColor }} />
                                            </div>
                                            <div className="text-[9px] text-gray-400 mt-0.5">{s.total.toLocaleString()} total, {s.invalid.toLocaleString()} invalid</div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-[10px] text-gray-400 text-center py-4">No data yet</p>
                        )}
                    </div>

                    {/* 30-Day Trend */}
                    <div className="premium-card">
                        <h3 className="text-xs font-bold text-gray-900 mb-2">30-Day Trend</h3>
                        {(analytics.trend || []).length > 0 ? (() => {
                            // Group trend data by date
                            const dateMap = new Map<string, Record<string, number>>();
                            for (const t of analytics.trend) {
                                if (!dateMap.has(t.date)) dateMap.set(t.date, {});
                                dateMap.get(t.date)![t.status] = t.count;
                            }
                            const dates = Array.from(dateMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
                            const maxCount = Math.max(...dates.map(([, d]) => Object.values(d).reduce((a, b) => a + b, 0)), 1);
                            return (
                                <div className="flex items-end gap-px h-24">
                                    {dates.slice(-30).map(([date, counts]) => {
                                        const valid = counts.valid || 0;
                                        const invalid = counts.invalid || 0;
                                        const risky = counts.risky || 0;
                                        const total = valid + invalid + risky;
                                        const heightPct = (total / maxCount) * 100;
                                        const validPct = total > 0 ? (valid / total) * 100 : 0;
                                        const riskyPct = total > 0 ? (risky / total) * 100 : 0;
                                        return (
                                            <div key={date} className="flex-1 flex flex-col justify-end" title={`${date}: ${valid} valid, ${invalid} invalid, ${risky} risky`}>
                                                <div className="w-full rounded-sm overflow-hidden" style={{ height: `${heightPct}%`, minHeight: total > 0 ? '2px' : '0' }}>
                                                    <div className="w-full bg-emerald-400" style={{ height: `${validPct}%` }} />
                                                    <div className="w-full bg-amber-400" style={{ height: `${riskyPct}%` }} />
                                                    <div className="w-full bg-red-400" style={{ height: `${100 - validPct - riskyPct}%` }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })() : (
                            <p className="text-[10px] text-gray-400 text-center py-4">No trend data yet</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 justify-center">
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-emerald-400" /><span className="text-[9px] text-gray-400">Valid</span></div>
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-amber-400" /><span className="text-[9px] text-gray-400">Risky</span></div>
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-red-400" /><span className="text-[9px] text-gray-400">Invalid</span></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Mailbox ESP Performance Matrix */}
            {espPerformance.length > 0 && (
                <div className="premium-card">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h2 className="text-sm font-bold text-gray-900">
                                Mailbox ESP Performance
                                {espPerformance.every(mb => Object.values(mb.esp_scores).every(s => s.send_count < 30)) && (
                                    <span className="ml-2 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-amber-100 text-amber-700">Warming up</span>
                                )}
                            </h2>
                            <p className="text-[10px] text-gray-400 mt-0.5">30-day rolling bounce rate per mailbox per recipient ESP. Used for ESP-aware routing.</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b" style={{ borderColor: '#D1CBC5' }}>
                                    <th className="pb-2 text-[10px] font-bold uppercase text-gray-400">Mailbox</th>
                                    <th className="pb-2 text-[10px] font-bold uppercase text-gray-400 text-center" style={{ color: ESP_COLORS.gmail }}>Gmail</th>
                                    <th className="pb-2 text-[10px] font-bold uppercase text-gray-400 text-center" style={{ color: ESP_COLORS.microsoft }}>Microsoft</th>
                                    <th className="pb-2 text-[10px] font-bold uppercase text-gray-400 text-center" style={{ color: ESP_COLORS.yahoo }}>Yahoo</th>
                                    <th className="pb-2 text-[10px] font-bold uppercase text-gray-400 text-center" style={{ color: ESP_COLORS.other }}>Other</th>
                                </tr>
                            </thead>
                            <tbody>
                                {espPerformance.map(mb => (
                                    <tr key={mb.mailbox_id} style={{ borderBottom: '1px solid #D1CBC5' }}>
                                        <td className="py-1.5 text-xs text-gray-900 font-medium max-w-[200px] truncate">{mb.email}</td>
                                        {['gmail', 'microsoft', 'yahoo', 'other'].map(esp => {
                                            const data = mb.esp_scores[esp];
                                            if (!data || data.send_count < 30) {
                                                return <td key={esp} className="py-1.5 text-center text-[10px] text-gray-300">warming up</td>;
                                            }
                                            const rate = data.bounce_rate * 100;
                                            const color = rate < 1 ? '#065F46' : rate < 2 ? '#92400E' : '#991B1B';
                                            const bg = rate < 1 ? '#D1FAE5' : rate < 2 ? '#FEF3C7' : '#FEE2E2';
                                            return (
                                                <td key={esp} className="py-1.5 text-center">
                                                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold" style={{ background: bg, color }}>
                                                        {rate.toFixed(1)}%
                                                    </span>
                                                    <div className="text-[9px] text-gray-400 mt-0.5">{data.send_count} sends</div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Batch History */}
            <div className="premium-card">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold text-gray-900">Upload History</h2>
                    <span className="text-[10px] text-gray-400">{batches.length} batches</span>
                </div>
                {batches.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">No uploads yet. Click "Upload CSV" to get started.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b" style={{ borderColor: '#D1CBC5' }}>
                                    <th className="pb-2 text-[10px] font-bold uppercase text-gray-400">Date</th>
                                    <th className="pb-2 text-[10px] font-bold uppercase text-gray-400">Source</th>
                                    <th className="pb-2 text-[10px] font-bold uppercase text-gray-400">File</th>
                                    <th className="pb-2 text-[10px] font-bold uppercase text-gray-400">Total</th>
                                    <th className="pb-2 text-[10px] font-bold uppercase text-gray-400">Valid</th>
                                    <th className="pb-2 text-[10px] font-bold uppercase text-gray-400">Invalid</th>
                                    <th className="pb-2 text-[10px] font-bold uppercase text-gray-400">Risky</th>
                                    <th className="pb-2 text-[10px] font-bold uppercase text-gray-400">Routed</th>
                                    <th className="pb-2 text-[10px] font-bold uppercase text-gray-400">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {batches.map(b => (
                                    <tr
                                        key={b.id}
                                        onClick={() => { setSelectedBatch(b); setBatchMeta(m => ({ ...m, page: 1 })); }}
                                        className="cursor-pointer hover:bg-[#F5F1EA] transition-colors"
                                        style={{
                                            borderBottom: '1px solid #D1CBC5',
                                            background: selectedBatch?.id === b.id ? '#F5F1EA' : 'transparent',
                                        }}
                                    >
                                        <td className="py-2 text-xs text-gray-700">{new Date(b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                                        <td className="py-2 text-xs text-gray-500 uppercase">{b.source}</td>
                                        <td className="py-2 text-xs text-gray-700 max-w-[150px] truncate">{b.file_name || '—'}</td>
                                        <td className="py-2 text-xs font-semibold text-gray-900">{b.total_count}</td>
                                        <td className="py-2 text-xs text-emerald-600 font-medium">{b.valid_count}</td>
                                        <td className="py-2 text-xs text-red-600 font-medium">{b.invalid_count}</td>
                                        <td className="py-2 text-xs text-amber-600 font-medium">{b.risky_count}</td>
                                        <td className="py-2 text-xs text-blue-600 font-medium">{b.routed_count}</td>
                                        <td className="py-2">
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{
                                                background: b.status === 'completed' ? '#D1FAE5' : b.status === 'processing' ? '#DBEAFE' : '#FEE2E2',
                                                color: b.status === 'completed' ? '#065F46' : b.status === 'processing' ? '#1E40AF' : '#991B1B',
                                            }}>{b.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Results Table (for selected batch) */}
            {selectedBatch && (
                <div className="premium-card">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h2 className="text-sm font-bold text-gray-900">
                                {selectedBatch.file_name || `Batch ${selectedBatch.id.slice(0, 8)}`}
                            </h2>
                            <div className="flex gap-3 mt-1">
                                <span className="text-[10px] text-emerald-600 font-medium">{selectedBatch.valid_count} valid</span>
                                <span className="text-[10px] text-red-600 font-medium">{selectedBatch.invalid_count} invalid</span>
                                <span className="text-[10px] text-amber-600 font-medium">{selectedBatch.risky_count} risky</span>
                                <span className="text-[10px] text-gray-400">{selectedBatch.duplicate_count} duplicate</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {selectedIds.size > 0 && (
                                <button
                                    onClick={() => { setShowRouteModal(true); setRouteResult(null); }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-semibold cursor-pointer hover:bg-gray-800"
                                >
                                    <Send size={11} />
                                    Route {selectedIds.size} to Campaign
                                </button>
                            )}
                            <button
                                onClick={() => handleExport(['valid'])}
                                className="flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-semibold cursor-pointer hover:bg-gray-50"
                                style={{ borderColor: '#D1CBC5' }}
                            >
                                <Download size={11} />
                                Export Clean List
                            </button>
                            <button
                                onClick={() => handleExport()}
                                className="flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-semibold cursor-pointer hover:bg-gray-50 text-gray-500"
                                style={{ borderColor: '#D1CBC5' }}
                            >
                                <Download size={11} />
                                Full Results
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                        {['all', 'valid', 'risky', 'invalid', 'duplicate'].map(s => (
                            <button
                                key={s}
                                onClick={() => { setStatusFilter(s); setBatchMeta(m => ({ ...m, page: 1 })); }}
                                className="px-2.5 py-1 rounded-md text-[10px] font-semibold cursor-pointer transition-colors"
                                style={{
                                    background: statusFilter === s ? '#1F2937' : '#F3F4F6',
                                    color: statusFilter === s ? '#FFFFFF' : '#4B5563',
                                }}
                            >{s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}</button>
                        ))}
                        <div className="w-px h-4 bg-gray-200 mx-1" />
                        {['all', 'gmail', 'microsoft', 'yahoo', 'other'].map(e => (
                            <button
                                key={e}
                                onClick={() => { setEspFilter(e); setBatchMeta(m => ({ ...m, page: 1 })); }}
                                className="px-2.5 py-1 rounded-md text-[10px] font-semibold cursor-pointer transition-colors"
                                style={{
                                    background: espFilter === e ? '#1F2937' : '#F3F4F6',
                                    color: espFilter === e ? '#FFFFFF' : '#4B5563',
                                }}
                            >{e === 'all' ? 'All ESP' : e.charAt(0).toUpperCase() + e.slice(1)}</button>
                        ))}
                        <div className="flex-1" />
                        <div className="relative">
                            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search email..."
                                value={searchQuery}
                                onChange={e => { setSearchQuery(e.target.value); setBatchMeta(m => ({ ...m, page: 1 })); }}
                                className="pl-7 pr-2 py-1 text-xs border rounded-md w-48 outline-none"
                                style={{ borderColor: '#D1CBC5' }}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b" style={{ borderColor: '#D1CBC5' }}>
                                    <th className="pb-2 pr-2">
                                        <input type="checkbox" checked={selectedIds.size === batchLeads.length && batchLeads.length > 0} onChange={toggleSelectAll} className="cursor-pointer" />
                                    </th>
                                    <th className="pb-2 text-[10px] font-bold uppercase text-gray-400">Email</th>
                                    <th className="pb-2 text-[10px] font-bold uppercase text-gray-400">Name</th>
                                    <th className="pb-2 text-[10px] font-bold uppercase text-gray-400">Company</th>
                                    <th className="pb-2 text-[10px] font-bold uppercase text-gray-400">Status</th>
                                    <th className="pb-2 text-[10px] font-bold uppercase text-gray-400">Score</th>
                                    <th className="pb-2 text-[10px] font-bold uppercase text-gray-400">ESP</th>
                                    <th className="pb-2 text-[10px] font-bold uppercase text-gray-400">Routed</th>
                                </tr>
                            </thead>
                            <tbody>
                                {batchLeads.map(lead => (
                                    <tr key={lead.id} className="hover:bg-[#F5F1EA] transition-colors" style={{ borderBottom: '1px solid #D1CBC5' }}>
                                        <td className="py-1.5 pr-2">
                                            <input type="checkbox" checked={selectedIds.has(lead.id)} onChange={() => toggleSelect(lead.id)} className="cursor-pointer" />
                                        </td>
                                        <td className="py-1.5 text-xs text-gray-900 font-medium">{lead.email}</td>
                                        <td className="py-1.5 text-xs text-gray-600">{[lead.first_name, lead.last_name].filter(Boolean).join(' ') || '—'}</td>
                                        <td className="py-1.5 text-xs text-gray-600">{lead.company || '—'}</td>
                                        <td className="py-1.5">
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{
                                                background: (STATUS_COLORS[lead.validation_status] || STATUS_COLORS.pending).bg,
                                                color: (STATUS_COLORS[lead.validation_status] || STATUS_COLORS.pending).text,
                                            }}>
                                                {lead.validation_status}
                                            </span>
                                            {lead.error_message && (
                                                <span className="text-[9px] text-gray-400 block mt-0.5" title={lead.error_message}>
                                                    {lead.error_message.length > 30 ? lead.error_message.slice(0, 30) + '...' : lead.error_message}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-1.5 text-xs text-gray-700 font-medium">{lead.validation_score ?? '—'}</td>
                                        <td className="py-1.5">
                                            {lead.esp_bucket && (
                                                <span className="text-[10px] font-semibold" style={{ color: ESP_COLORS[lead.esp_bucket] || '#6B7280' }}>
                                                    {lead.esp_bucket}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-1.5 text-xs text-gray-500">
                                            {lead.routed_to_campaign_id ? (
                                                <CheckCircle size={12} className="text-emerald-500" />
                                            ) : '—'}
                                        </td>
                                    </tr>
                                ))}
                                {batchLeads.length === 0 && (
                                    <tr><td colSpan={8} className="py-8 text-center text-sm text-gray-400">No leads match this filter.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {batchMeta.totalPages > 1 && (
                        <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: '#D1CBC5' }}>
                            <span className="text-[10px] text-gray-400">{batchMeta.total} leads</span>
                            <div className="flex gap-1">
                                {Array.from({ length: Math.min(batchMeta.totalPages, 10) }, (_, i) => i + 1).map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setBatchMeta(m => ({ ...m, page: p }))}
                                        className="w-6 h-6 rounded text-[10px] font-semibold cursor-pointer"
                                        style={{
                                            background: batchMeta.page === p ? '#1F2937' : 'transparent',
                                            color: batchMeta.page === p ? '#FFFFFF' : '#6B7280',
                                        }}
                                    >{p}</button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ==================== UPLOAD MODAL ==================== */}
            {showUpload && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" onClick={(e) => { if (e.target === e.currentTarget && uploadStep === 'select') resetUpload(); }}>
                    <div className="bg-white rounded-xl max-w-[560px] w-[90%] max-h-[80vh] overflow-y-auto" style={{ border: '1px solid #D1CBC5' }}>
                        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: '#D1CBC5' }}>
                            <h2 className="text-sm font-bold text-gray-900">
                                {uploadStep === 'select' && 'Upload CSV'}
                                {uploadStep === 'mapping' && 'Map Columns'}
                                {uploadStep === 'processing' && 'Validating...'}
                                {uploadStep === 'done' && 'Upload Complete'}
                            </h2>
                            <button onClick={resetUpload} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X size={16} /></button>
                        </div>

                        <div className="p-4">
                            {/* Step 1: File Select */}
                            {uploadStep === 'select' && (
                                <div className="flex flex-col gap-4">
                                    <div
                                        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                                        style={{ borderColor: '#D1CBC5' }}
                                        onClick={() => fileInputRef.current?.click()}
                                        onDragOver={e => e.preventDefault()}
                                        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileSelect(f); }}
                                    >
                                        <FileSpreadsheet size={24} className="mx-auto text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-600 font-medium">Drop a CSV file or click to browse</p>
                                        <p className="text-[10px] text-gray-400 mt-1">Required column: email. Optional: first_name, last_name, company, title, lead_score</p>
                                    </div>
                                    <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />

                                    <div>
                                        <label className="text-[10px] font-semibold text-gray-500 uppercase block mb-1">Route all leads to campaign (optional)</label>
                                        <CustomSelect
                                            value={targetCampaignId}
                                            onChange={setTargetCampaignId}
                                            searchable={campaigns.length > 5}
                                            placeholder="Decide after validation"
                                            options={[
                                                { value: '', label: 'Decide after validation' },
                                                ...campaigns.map(c => ({ value: c.id, label: `${c.name} — ${c.source_platform?.toUpperCase()}` })),
                                            ]}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Column Mapping */}
                            {uploadStep === 'mapping' && (
                                <div className="flex flex-col gap-4">
                                    <p className="text-xs text-gray-500">We detected {csvHeaders.length} columns. Confirm or adjust the mapping below.</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {(['email', 'first_name', 'last_name', 'company', 'persona', 'lead_score'] as const).map(field => (
                                            <div key={field}>
                                                <label className="text-[10px] font-semibold text-gray-500 uppercase block mb-1">
                                                    {field.replace(/_/g, ' ')}{field === 'email' && ' *'}
                                                </label>
                                                <CustomSelect
                                                    value={(columnMapping as any)[field] || ''}
                                                    onChange={(v) => setColumnMapping(m => ({ ...m, [field]: v || undefined }))}
                                                    placeholder="— skip —"
                                                    options={[
                                                        { value: '', label: '— skip —' },
                                                        ...csvHeaders.map(h => ({ value: h, label: h })),
                                                    ]}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Preview */}
                                    {csvData.length > 0 && (
                                        <div className="overflow-x-auto">
                                            <p className="text-[10px] text-gray-400 mb-1">Preview (first {csvData.length} rows)</p>
                                            <table className="w-full text-left text-[10px]">
                                                <thead>
                                                    <tr className="border-b" style={{ borderColor: '#D1CBC5' }}>
                                                        {csvHeaders.slice(0, 6).map(h => <th key={h} className="pb-1 pr-2 text-gray-400">{h}</th>)}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {csvData.map((row, i) => (
                                                        <tr key={i}>
                                                            {csvHeaders.slice(0, 6).map(h => <td key={h} className="py-1 pr-2 text-gray-600 max-w-[100px] truncate">{(row as any)[h] || ''}</td>)}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => setUploadStep('select')} className="px-3 py-1.5 text-xs text-gray-600 border rounded-lg cursor-pointer" style={{ borderColor: '#D1CBC5' }}>Back</button>
                                        <button
                                            onClick={handleConfirmUpload}
                                            disabled={!columnMapping.email || uploading}
                                            className="px-4 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg cursor-pointer hover:bg-gray-800 disabled:opacity-50"
                                        >{uploading ? 'Processing...' : 'Confirm & Validate'}</button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Processing */}
                            {uploadStep === 'processing' && (
                                <div className="text-center py-6">
                                    <div className="w-12 h-12 mx-auto mb-4 border-4 border-gray-100 border-t-gray-900 rounded-full" style={{ animation: 'spin 1s linear infinite' }} />
                                    <p className="text-sm font-semibold text-gray-900 mb-2">Validating {processingProgress.total} leads...</p>
                                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                                        <div className="h-full bg-gray-900 rounded-full transition-all duration-300" style={{ width: `${processingProgress.total > 0 ? (processingProgress.current / processingProgress.total) * 100 : 0}%` }} />
                                    </div>
                                    <div className="flex justify-center gap-4 text-xs">
                                        <span className="text-emerald-600">{processingProgress.validCount} valid</span>
                                        <span className="text-red-600">{processingProgress.invalidCount} invalid</span>
                                        <span className="text-amber-600">{processingProgress.riskyCount} risky</span>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Done */}
                            {uploadStep === 'done' && (
                                <div className="text-center py-6">
                                    <CheckCircle size={32} className="mx-auto text-emerald-500 mb-3" />
                                    <p className="text-sm font-semibold text-gray-900 mb-1">Validation Complete</p>
                                    <p className="text-xs text-gray-500 mb-4">
                                        {processingProgress.validCount} valid, {processingProgress.invalidCount} invalid, {processingProgress.riskyCount} risky
                                    </p>
                                    <button onClick={resetUpload} className="px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-lg cursor-pointer hover:bg-gray-800">
                                        View Results
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ==================== ROUTE MODAL ==================== */}
            {showRouteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" onClick={(e) => { if (e.target === e.currentTarget) { setShowRouteModal(false); setRouteResult(null); } }}>
                    <div className="bg-white rounded-xl max-w-[420px] w-[90%]" style={{ border: '1px solid #D1CBC5' }}>
                        <div className="p-4 border-b" style={{ borderColor: '#D1CBC5' }}>
                            <h2 className="text-sm font-bold text-gray-900">Route {selectedIds.size} Leads to Campaign</h2>
                        </div>
                        <div className="p-4">
                            {routeResult ? (
                                <div className="text-center py-4">
                                    <CheckCircle size={24} className="mx-auto text-emerald-500 mb-2" />
                                    <p className="text-sm font-semibold text-gray-900">{routeResult.routed} leads routed</p>
                                    {routeResult.failed > 0 && <p className="text-xs text-red-500 mt-1">{routeResult.failed} failed</p>}
                                    <button onClick={() => { setShowRouteModal(false); setRouteResult(null); setSelectedIds(new Set()); }} className="mt-3 px-4 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg cursor-pointer">Done</button>
                                </div>
                            ) : (
                                <>
                                    <label className="text-[10px] font-semibold text-gray-500 uppercase block mb-1">Select Campaign</label>
                                    {campaigns.length > 0 ? (
                                        <div className="mb-3">
                                            <CustomSelect
                                                value={routeCampaignId}
                                                onChange={setRouteCampaignId}
                                                searchable={campaigns.length > 5}
                                                placeholder="Choose a campaign..."
                                                options={campaigns.map(c => ({ value: c.id, label: `${c.name} — ${c.source_platform?.toUpperCase()}` }))}
                                            />
                                        </div>
                                    ) : (
                                        <div className="p-3 rounded-lg text-xs text-center mb-3" style={{ background: '#FEF3C7', color: '#92400E' }}>
                                            No campaigns found. Connect a sending platform in Settings first, or export your clean list as CSV.
                                        </div>
                                    )}
                                    <div className="p-2.5 rounded-lg text-[10px] mb-4" style={{ background: '#F5F1EA', color: '#6B7280' }}>
                                        ESP-aware routing is {espPerformance.length > 0 ? 'active' : 'warming up'}. {espPerformance.length > 0
                                            ? 'Leads will be matched to the best-performing mailboxes for their recipient ESP.'
                                            : 'Once enough send data accumulates (~30 sends per mailbox per ESP), scoring activates automatically.'}
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => setShowRouteModal(false)} className="px-3 py-1.5 text-xs text-gray-600 border rounded-lg cursor-pointer" style={{ borderColor: '#D1CBC5' }}>Cancel</button>
                                        <button
                                            onClick={handleRouteLeads}
                                            disabled={!routeCampaignId || routing}
                                            className="px-4 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg cursor-pointer hover:bg-gray-800 disabled:opacity-50"
                                        >{routing ? 'Routing...' : 'Route Leads'}</button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ValidationPage() {
    return (
        <Suspense fallback={<div className="p-6"><LoadingSkeleton type="card" rows={3} /></div>}>
            <ValidationPageContent />
        </Suspense>
    );
}

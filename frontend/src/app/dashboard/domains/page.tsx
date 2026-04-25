'use client';
import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { RowLimitSelector } from '@/components/ui/RowLimitSelector';
import FindingsCard from '@/components/dashboard/FindingsCard';
import { apiClient } from '@/lib/api';
import type { Domain, Mailbox, Campaign, PaginatedResponse, AuditLog } from '@/types/api';
import { getStatusColors } from '@/lib/statusColors';
import { PlatformBadge } from '@/components/ui/PlatformBadge';
import { useSortFilterModal } from '@/hooks/useSortFilterModal';
import { usePagination } from '@/hooks/usePagination';
import MultiSelectDropdown from '@/components/ui/MultiSelectDropdown';
import CustomSelect from '@/components/ui/CustomSelect';
import { useEntityStats } from '@/hooks/useEntityStats';
import EntityStatsBar from '@/components/ui/EntityStatsBar';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';

export default function DomainsPage() {
    const [domains, setDomains] = useState<Domain[]>([]);
    const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
    const selectedDomainRef = useRef<Domain | null>(null);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const entityStats = useEntityStats();

    // Sorting & Filtering (delegated to useSortFilterModal hook)
    const sortFilter = useSortFilterModal({
        sortBy: 'domain_asc',
        minEngagement: '',
        maxEngagement: '',
        minBounceRate: '',
        maxBounceRate: '',
        platform: 'all',
    });

    // Pagination & Selection (delegated to usePagination hook)
    const { meta, setMeta, selectedIds, setSelectedIds, toggleSelection, toggleSelectAll, isSelected, isAllSelected } = usePagination();

    const fetchDomains = useCallback(async () => {
        const { sortBy, minEngagement, maxEngagement, minBounceRate, maxBounceRate, platform } = sortFilter.values;
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: meta.page.toString(),
                limit: meta.limit.toString(),
                sortBy
            });

            // Add filters
            if (selectedStatus.length > 0) params.append('status', selectedStatus.join(','));
            if (searchQuery.trim()) params.append('search', searchQuery.trim());

            // Add sort & filter parameters
            if (minEngagement) params.append('minEngagement', minEngagement);
            if (maxEngagement) params.append('maxEngagement', maxEngagement);
            if (minBounceRate) params.append('minBounceRate', minBounceRate);
            if (maxBounceRate) params.append('maxBounceRate', maxBounceRate);
            if (platform && platform !== 'all') params.append('platform', platform);

            const data = await apiClient<PaginatedResponse<Domain>>(`/api/dashboard/domains?${params}`);
            if (data?.data) {
                setDomains(data.data);
                setMeta(data.meta);
                if (data.data.length > 0) {
                    const currentInResults = selectedDomainRef.current && data.data.some((d: Domain) => d.id === selectedDomainRef.current?.id);
                    if (!currentInResults) setSelectedDomain(data.data[0]);
                }
            } else {
                setDomains([]);
            }
        } catch (err) {
            console.error('Failed to fetch domains:', err);
            setDomains([]);
        } finally {
            setLoading(false);
        }
    }, [meta.page, meta.limit, selectedStatus, searchQuery, sortFilter.values]);

    useEffect(() => { selectedDomainRef.current = selectedDomain; }, [selectedDomain]);

    useEffect(() => {
        fetchDomains();
    }, [fetchDomains]);

    // Auto-refresh when infrastructure assessment completes
    useEffect(() => {
        const handler = () => fetchDomains();
        window.addEventListener('assessment-complete', handler);
        return () => window.removeEventListener('assessment-complete', handler);
    }, [fetchDomains]);

    useEffect(() => {
        if (selectedDomain) {
            apiClient<AuditLog[]>(`/api/dashboard/audit-logs?entity=domain&entity_id=${selectedDomain.id}`)
                .then(setAuditLogs)
                .catch(err => {
                    console.error('Failed to fetch logs:', err);
                    setAuditLogs([]);
                });
        } else {
            setAuditLogs([]);
        }
    }, [selectedDomain]);

    const handlePageChange = (newPage: number) => {
        setMeta(prev => ({ ...prev, page: newPage }));
    };

    const handleLimitChange = (newLimit: number) => {
        setMeta(prev => ({ ...prev, limit: newLimit, page: 1 }));
    };

    const handleApplySortFilter = () => {
        sortFilter.apply();
        setMeta(prev => ({ ...prev, page: 1 }));
    };

    const handleClearFilters = () => {
        sortFilter.clear();
        setMeta(prev => ({ ...prev, page: 1 }));
    };

    if (loading && domains.length === 0) {
        return (
            <div className="p-8">
                <LoadingSkeleton type="table" rows={8} />
            </div>
        );
    }

    return (
        <div className="flex h-full gap-4 p-4">
            {/* Left: List */}
            <div className="premium-card flex flex-col p-4 h-full overflow-hidden rounded-2xl" style={{ width: '380px' }}>
                <h1 className="text-xl font-bold mb-3 shrink-0 text-gray-900">Domains</h1>

                {/* Stats bar — interactive. Clicking a pill filters the list;
                    "All" clears. Replaces the separate status dropdown. */}
                {entityStats?.domains && (
                    <div className="mb-4">
                        <EntityStatsBar
                            total={entityStats.domains.total}
                            activeKeys={selectedStatus}
                            onToggle={(key) => {
                                if (key === 'all') {
                                    setSelectedStatus([]);
                                } else {
                                    setSelectedStatus(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
                                }
                                setMeta(prev => ({ ...prev, page: 1 }));
                            }}
                            stats={[
                                { key: 'healthy', label: 'Healthy', value: entityStats.domains.healthy, color: '#22c55e' },
                                { key: 'warning', label: 'Warning', value: entityStats.domains.warning, color: '#f59e0b' },
                                { key: 'paused',  label: 'Paused',  value: entityStats.domains.paused,  color: '#ef4444' },
                            ]}
                        />
                    </div>
                )}

                {/* Filters */}
                <div className="mb-4 flex flex-col gap-3">
                    {/* Search */}
                    <input
                        type="text"
                        placeholder="Search by domain name..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setMeta(prev => ({ ...prev, page: 1 }));
                        }}
                        className="w-full rounded-xl border border-gray-200 bg-white text-sm outline-none"
                        style={{ padding: '0.625rem 1rem' }}
                    />

                    {/* Sort & Filter Button */}
                    <button
                        onClick={sortFilter.open}
                        className="w-full rounded-xl border border-gray-200 bg-white text-gray-900 text-sm font-semibold cursor-pointer flex items-center justify-center gap-2 transition-all duration-200 hover:bg-gray-50 hover:border-blue-300"
                        style={{ padding: '0.75rem 1rem' }}
                    >
                        <span className="text-base">⚙️</span>
                        Sort & Filter
                        {sortFilter.hasActiveFilters && (
                            <span className="bg-blue-500 text-white text-[0.65rem] rounded-full font-bold" style={{ padding: '0.125rem 0.375rem' }}>
                                Active
                            </span>
                        )}
                    </button>
                </div>

                <div className="flex items-center gap-3 px-2 pb-3 border-b border-gray-100 mb-3">
                    <input
                        type="checkbox"
                        checked={isAllSelected(domains)}
                        onChange={() => toggleSelectAll(domains)}
                        className="w-4 h-4 cursor-pointer"
                        style={{ accentColor: '#2563EB' }}
                    />
                    <span className="text-[0.8rem] text-gray-500 font-medium">Select All ({domains.length})</span>
                </div>

                <div className="scrollbar-hide overflow-y-auto flex-1 flex flex-col gap-3 pr-2">
                    {domains.map(d => (
                        <div
                            key={d.id}
                            onClick={() => setSelectedDomain(d)}
                            className="p-4 rounded-2xl cursor-pointer border shrink-0 flex items-center gap-3 hover:shadow-md"
                            style={{
                                background: selectedDomain?.id === d.id ? '#EFF6FF' : '#FFFFFF',
                                borderColor: selectedDomain?.id === d.id ? '#BFDBFE' : '#F3F4F6',
                                borderLeft: d.status === 'paused' ? '4px solid #EF4444' : (selectedDomain?.id === d.id ? '1px solid #BFDBFE' : '1px solid #F3F4F6'),
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={isSelected(d.id)}
                                onClick={(e) => toggleSelection(e, d.id)}
                                onChange={() => { }}
                                className="w-4 h-4 cursor-pointer"
                                style={{ accentColor: '#2563EB' }}
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-slate-800 text-[0.9rem]">{d.domain}</span>
                                    {d.source_platform && <PlatformBadge platform={d.source_platform} />}
                                </div>
                                <div className="text-[0.7rem] font-semibold rounded-full inline-block" style={{
                                    padding: '2px 8px',
                                    ...getStatusColors(d.status)
                                }}>{d.status.toUpperCase()}</div>
                            </div>
                        </div>
                    ))}
                    {domains.length === 0 && <div className="text-gray-400 text-center p-8 italic">No domains.</div>}
                </div>

                <div className="pt-4 border-t border-gray-100 mt-auto flex justify-between items-center">
                    <RowLimitSelector limit={meta.limit} onLimitChange={handleLimitChange} />
                    <PaginationControls currentPage={meta.page} totalPages={meta.totalPages} onPageChange={handlePageChange} />
                </div>
            </div>

            {/* Right: Details (Unchanged mostly) */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                {selectedDomain ? (
                    <DomainDetailsView
                        selectedDomain={selectedDomain}
                        auditLogs={auditLogs}
                        onDomainRefreshed={(patch) => {
                            setSelectedDomain((prev) => (prev ? { ...prev, ...patch } : prev));
                        }}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
                        <div className="text-5xl">👈</div>
                        <div className="text-xl font-medium">Select a domain to view details</div>
                    </div>
                )}
            </div>

            {/* Sort & Filter Modal */}
            {sortFilter.isOpen && (
                <div
                    className="fixed inset-0 flex items-center justify-center z-[1000] p-4"
                    style={{ background: 'rgba(0, 0, 0, 0.5)' }}
                    onClick={() => sortFilter.close()}
                >
                    <div
                        className="bg-white rounded-2xl max-w-[500px] w-full max-h-[90vh] overflow-hidden flex flex-col shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 m-0">
                                ⚙️ Sort & Filter Domains
                            </h2>
                            <button
                                onClick={() => sortFilter.close()}
                                className="bg-transparent border-none text-2xl text-gray-400 cursor-pointer p-1 leading-none"
                            >
                                ×
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto flex-1">
                            {/* Sort By */}
                            <div className="mb-3">
                                <label htmlFor="modal-sort-by" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Sort By
                                </label>
                                <CustomSelect
                                    value={sortFilter.temp.sortBy}
                                    onChange={(v) => sortFilter.setTempValue('sortBy', v)}
                                    options={[
                                        { value: 'domain_asc', label: 'Domain (A-Z)' },
                                        { value: 'domain_desc', label: 'Domain (Z-A)' },
                                        { value: 'sent_desc', label: 'Sent (High to Low)' },
                                        { value: 'sent_asc', label: 'Sent (Low to High)' },
                                        { value: 'engagement_desc', label: 'Engagement (High to Low)' },
                                        { value: 'engagement_asc', label: 'Engagement (Low to High)' },
                                        { value: 'bounce_desc', label: 'Bounce (High to Low)' },
                                        { value: 'bounce_asc', label: 'Bounce (Low to High)' },
                                    ]}
                                />
                            </div>

                            {/* Engagement Rate Range */}
                            <div className="mb-3">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Engagement Rate Range (%)
                                </label>
                                <div className="flex gap-3 items-center">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={sortFilter.temp.minEngagement}
                                        onChange={(e) => sortFilter.setTempValue('minEngagement', e.target.value)}
                                        min="0"
                                        max="100"
                                        className="flex-1 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm outline-none"
                                        style={{ padding: '0.75rem 1rem' }}
                                    />
                                    <span className="text-gray-500 text-base font-medium">→</span>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={sortFilter.temp.maxEngagement}
                                        onChange={(e) => sortFilter.setTempValue('maxEngagement', e.target.value)}
                                        min="0"
                                        max="100"
                                        className="flex-1 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm outline-none"
                                        style={{ padding: '0.75rem 1rem' }}
                                    />
                                </div>
                            </div>

                            {/* Bounce Rate Range */}
                            <div className="mb-3">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Bounce Rate Range (%)
                                </label>
                                <div className="flex gap-3 items-center">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={sortFilter.temp.minBounceRate}
                                        onChange={(e) => sortFilter.setTempValue('minBounceRate', e.target.value)}
                                        min="0"
                                        max="100"
                                        className="flex-1 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm outline-none"
                                        style={{ padding: '0.75rem 1rem' }}
                                    />
                                    <span className="text-gray-500 text-base font-medium">→</span>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={sortFilter.temp.maxBounceRate}
                                        onChange={(e) => sortFilter.setTempValue('maxBounceRate', e.target.value)}
                                        min="0"
                                        max="100"
                                        className="flex-1 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm outline-none"
                                        style={{ padding: '0.75rem 1rem' }}
                                    />
                                </div>
                            </div>

                            {/* Platform Filter */}
                            <div className="mb-3">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Platform
                                </label>
                                <MultiSelectDropdown
                                    options={[
                                        { value: 'smartlead', label: 'Smartlead' },
                                        { value: 'instantly', label: 'Instantly' },
                                        { value: 'emailbison', label: 'EmailBison' },
                                    ]}
                                    selected={sortFilter.temp.platform === 'all' ? [] : sortFilter.temp.platform.split(',')}
                                    onChange={(vals) => sortFilter.setTempValue('platform', vals.length === 0 ? 'all' : vals.join(','))}
                                    placeholder="All Platforms"
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-200 flex gap-3">
                            <button
                                onClick={handleClearFilters}
                                className="flex-1 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-gray-50"
                                style={{ padding: '0.75rem 1rem' }}
                            >
                                Clear All
                            </button>
                            <button
                                onClick={handleApplySortFilter}
                                className="flex-1 rounded-xl border-none bg-blue-500 text-white text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-blue-600"
                                style={{ padding: '0.75rem 1rem' }}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Action Bar */}
            {selectedIds.size > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3 rounded-2xl shadow-xl" style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)' }}>
                    <div className="bg-white/20 rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold text-white">{selectedIds.size}</div>
                    <span className="text-sm font-semibold text-white">domain{selectedIds.size !== 1 ? 's' : ''} selected</span>
                    <div className="w-px h-6 bg-white/20" />
                    <button
                        onClick={() => {
                            const selected = domains.filter(d => selectedIds.has(d.id));
                            const headers = ['domain', 'status', 'mailbox_count', 'bounce_rate', 'engagement_rate', 'spf_valid', 'dkim_valid', 'dmarc_valid'];
                            const rows = selected.map(d => headers.map(h => {
                                let v: any;
                                if (h === 'mailbox_count') v = (d as any).mailboxes?.length || 0;
                                else v = (d as any)[h];
                                return v == null ? '' : String(v).includes(',') ? `"${v}"` : String(v);
                            }).join(','));
                            const csv = [headers.join(','), ...rows].join('\n');
                            const blob = new Blob([csv], { type: 'text/csv' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a'); a.href = url; a.download = `domains-export-${new Date().toISOString().split('T')[0]}.csv`; a.click();
                            URL.revokeObjectURL(url);
                        }}
                        className="px-3 py-1.5 rounded-lg text-white text-[0.8rem] font-semibold flex items-center gap-1.5" style={{ border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.12)' }}
                    >
                        📥 Export CSV
                    </button>
                    <button onClick={() => setSelectedIds(new Set())} className="px-2 py-1.5 rounded-lg text-white/60 hover:text-white text-xs">✕</button>
                </div>
            )}
        </div>
    );
}

// Memoized component for better Safari performance
function DomainDetailsView({
    selectedDomain,
    auditLogs,
    onDomainRefreshed,
}: {
    selectedDomain: Domain;
    auditLogs: AuditLog[];
    onDomainRefreshed: (patch: Partial<Domain>) => void;
}) {
    // Memoize engagement rate calculations to prevent re-calculation on every render
    const openRate = useMemo(() => {
        return (selectedDomain.total_sent_lifetime || 0) > 0
            ? (((selectedDomain.total_opens || 0) / (selectedDomain.total_sent_lifetime || 1)) * 100).toFixed(1)
            : '0';
    }, [selectedDomain.total_sent_lifetime, selectedDomain.total_opens]);

    const clickRate = useMemo(() => {
        return (selectedDomain.total_sent_lifetime || 0) > 0
            ? (((selectedDomain.total_clicks || 0) / (selectedDomain.total_sent_lifetime || 1)) * 100).toFixed(1)
            : '0';
    }, [selectedDomain.total_sent_lifetime, selectedDomain.total_clicks]);

    const replyRate = useMemo(() => {
        return (selectedDomain.total_sent_lifetime || 0) > 0
            ? (((selectedDomain.total_replies || 0) / (selectedDomain.total_sent_lifetime || 1)) * 100).toFixed(1)
            : '0';
    }, [selectedDomain.total_sent_lifetime, selectedDomain.total_replies]);

    return (
        <div className="animate-fade-in">
            <div className="mb-4">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">{selectedDomain.domain}</h1>
                <p className="text-xs text-gray-500 mt-0.5">Reputation & Usage</p>
            </div>

            {selectedDomain.status === 'paused' && (
                <div className="premium-card mb-3" style={{
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderLeft: '6px solid #EF4444',
                }}>
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">⚠️</span>
                        <div className="flex-1">
                            <h3 className="font-bold text-xl tracking-tight mb-2" style={{ color: '#B91C1C' }}>DOMAIN PAUSED</h3>
                            <p className="text-base leading-relaxed mb-2" style={{ color: '#7F1D1D' }}>
                                {selectedDomain.paused_reason || 'No reason provided'}
                            </p>
                            {selectedDomain.last_pause_at && (
                                <div className="text-xs text-gray-400 mt-2">
                                    Paused {new Date(selectedDomain.last_pause_at).toLocaleString()} by {selectedDomain.paused_by || 'system'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="premium-card mb-3">
                <h2 className="text-xl font-bold mb-3 text-gray-900">Bounce Overview</h2>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <div className="text-slate-500 text-sm font-semibold uppercase tracking-wide mb-2">Bounce Rate Trend</div>
                        <div className="text-2xl font-bold" style={{ color: (selectedDomain.aggregated_bounce_rate_trend || 0) > 2 ? '#EF4444' : '#16A34A' }}>
                            {(selectedDomain.aggregated_bounce_rate_trend || 0).toFixed(2)}<span className="text-2xl">%</span>
                        </div>
                        <div className="text-sm text-gray-400 mt-1">Lifetime aggregate across all mailboxes</div>
                    </div>
                    <div>
                        <div className="text-slate-500 text-sm font-semibold uppercase tracking-wide mb-2">Warnings Triggered</div>
                        <div className="text-2xl font-bold" style={{ color: (selectedDomain.warning_count || 0) > 0 ? '#F59E0B' : '#1E293B' }}>{selectedDomain.warning_count || 0}</div>
                        <div className="text-sm text-gray-400 mt-1">Lifetime incidents</div>
                    </div>
                </div>
            </div>

            {/* Engagement Metrics Section (SOFT SIGNALS - aggregated from all mailboxes) */}
            <div className="premium-card mb-3">
                <div className="mb-3">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">
                        Domain-Wide Engagement
                    </h2>
                    <p className="text-sm text-gray-500">
                        Aggregated metrics across all mailboxes on this domain (informational only)
                    </p>
                </div>

                <div className="grid grid-cols-4 gap-3">
                    <DomainMetric label="Total Sent" value={selectedDomain.total_sent_lifetime} dot="#9ca3af" />
                    <DomainMetric label="Opens"      value={selectedDomain.total_opens}  dot="#3b82f6" rate={`${openRate}% rate`} />
                    <DomainMetric label="Clicks"     value={selectedDomain.total_clicks} dot="#22c55e" rate={`${clickRate}% rate`} />
                    <DomainMetric label="Replies"    value={selectedDomain.total_replies} dot="#8b5cf6" rate={`${replyRate}% rate`} />
                </div>
            </div>

            {/* Recovery Status */}
            {selectedDomain.recovery_phase && selectedDomain.recovery_phase !== 'healthy' && (
                <div className="premium-card mb-3">
                    <h2 className="text-xl font-bold mb-3 text-gray-900 flex items-center gap-3">
                        🔄 Recovery Status
                        <span className="rounded-full text-xs font-semibold uppercase tracking-wide" style={{
                            padding: '0.25rem 0.75rem',
                            background: selectedDomain.recovery_phase === 'paused' ? '#FEF2F2' :
                                selectedDomain.recovery_phase === 'quarantine' ? '#FEF2F2' :
                                    selectedDomain.recovery_phase === 'restricted_send' ? '#FFF7ED' :
                                        '#ECFDF5',
                            color: selectedDomain.recovery_phase === 'paused' ? '#DC2626' :
                                selectedDomain.recovery_phase === 'quarantine' ? '#DC2626' :
                                    selectedDomain.recovery_phase === 'restricted_send' ? '#F59E0B' :
                                        '#16A34A',
                            border: '1px solid',
                            borderColor: selectedDomain.recovery_phase === 'paused' ? '#FEE2E2' :
                                selectedDomain.recovery_phase === 'quarantine' ? '#FEE2E2' :
                                    selectedDomain.recovery_phase === 'restricted_send' ? '#FED7AA' :
                                        '#BBF7D0',
                        }}>
                            {selectedDomain.recovery_phase.replace('_', ' ')}
                        </span>
                    </h2>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        {/* Resilience Score */}
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="text-xs text-slate-500 mb-2 font-semibold uppercase">Resilience</div>
                            <div className="font-bold" style={{
                                fontSize: '1.75rem',
                                color: (selectedDomain.resilience_score || 0) >= 70 ? '#16A34A' :
                                    (selectedDomain.resilience_score || 0) >= 30 ? '#F59E0B' : '#EF4444',
                            }}>
                                {selectedDomain.resilience_score || 0}
                            </div>
                        </div>

                        {/* Clean Sends / Graduation Progress */}
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="text-xs text-slate-500 mb-2 font-semibold uppercase">
                                {selectedDomain.recovery_phase === 'restricted_send' || selectedDomain.recovery_phase === 'warm_recovery' ? 'Graduation Progress' : 'Clean Sends'}
                            </div>
                            <div className="text-slate-800 font-bold" style={{ fontSize: '1.75rem' }}>
                                {selectedDomain.clean_sends_since_phase || 0}
                                {selectedDomain.recovery_phase === 'restricted_send' && `/${(selectedDomain.consecutive_pauses || 0) > 1 ? 25 : 15}`}
                                {selectedDomain.recovery_phase === 'warm_recovery' && `/50`}
                            </div>
                        </div>

                        {/* Relapse Count */}
                        {(selectedDomain.relapse_count || 0) > 0 && (
                            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                                <div className="text-xs mb-2 font-semibold uppercase" style={{ color: '#DC2626' }}>Relapses</div>
                                <div className="font-bold" style={{ fontSize: '1.75rem', color: '#DC2626' }}>
                                    {selectedDomain.relapse_count}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Next Phase Preview */}
                    {selectedDomain.recovery_phase !== 'healthy' && (
                        <div className="bg-blue-50 rounded-xl border border-blue-200 flex items-center gap-2" style={{ padding: '0.875rem 1rem' }}>
                            <span className="text-base opacity-70">→</span>
                            <div className="font-semibold" style={{ fontSize: '0.85rem', color: '#1E40AF' }}>
                                {selectedDomain.recovery_phase === 'paused' && 'Next: Quarantine (after cooldown)'}
                                {selectedDomain.recovery_phase === 'quarantine' && 'Next: Restricted Send (DNS check required)'}
                                {selectedDomain.recovery_phase === 'restricted_send' && `Next: Warm Recovery (need ${Math.max(0, ((selectedDomain.consecutive_pauses || 0) > 1 ? 25 : 15) - (selectedDomain.clean_sends_since_phase || 0))} more clean sends)`}
                                {selectedDomain.recovery_phase === 'warm_recovery' && `Next: Healthy (need ${Math.max(0, 50 - (selectedDomain.clean_sends_since_phase || 0))} more sends, 3+ days, <2% bounce)`}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="premium-card mb-3">
                <h2 className="text-xl font-bold mb-3 text-gray-900">Domain Events Log</h2>
                {auditLogs.length > 0 ? (
                    <div className="max-h-[300px] overflow-y-auto rounded-lg border border-slate-200">
                        <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: '0' }}>
                            <thead className="sticky top-0 z-[1] bg-slate-50">
                                <tr>
                                    <th className="p-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wide" style={{ borderBottom: '2px solid #E2E8F0' }}>Time</th>
                                    <th className="p-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wide" style={{ borderBottom: '2px solid #E2E8F0' }}>Trigger</th>
                                    <th className="p-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wide" style={{ borderBottom: '2px solid #E2E8F0' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {auditLogs.map(log => (
                                    <tr key={log.id} className="transition-colors duration-200 hover:bg-gray-50">
                                        <td className="p-4 border-b border-slate-100 text-sm whitespace-nowrap" style={{ color: '#475569' }}>
                                            {new Date(log.timestamp).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                                        </td>
                                        <td className="p-4 border-b border-slate-100 font-medium text-slate-800" style={{ fontSize: '0.9rem' }}>{log.trigger}</td>
                                        <td className="p-4 border-b border-slate-100 font-semibold" style={{ color: '#2563EB' }}>{log.action}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center text-gray-400 bg-slate-50 rounded-xl italic" style={{ border: '1px dashed #E2E8F0' }}>
                        No events recorded.
                    </div>
                )}
            </div>

            <div className="premium-card mb-3">
                <h2 className="text-xl font-bold mb-3 text-gray-900">Child Mailboxes</h2>
                <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: '0' }}>
                    <thead>
                        <tr>
                            <th className="p-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wide" style={{ borderBottom: '2px solid #E2E8F0' }}>Email</th>
                            <th className="p-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wide" style={{ borderBottom: '2px solid #E2E8F0' }}>Status</th>
                            <th className="p-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wide" style={{ borderBottom: '2px solid #E2E8F0' }}>Campaigns</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedDomain.mailboxes && selectedDomain.mailboxes.map((mb: Mailbox) => (
                            <tr key={mb.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 border-b border-slate-100 text-slate-800 font-medium">{mb.email}</td>
                                <td className="p-4 border-b border-slate-100">
                                    <span className="rounded-full text-xs font-semibold" style={{
                                        padding: '0.25rem 0.75rem',
                                        ...getStatusColors(mb.status)
                                    }}>
                                        {mb.status.toUpperCase()}
                                    </span>
                                </td>
                                <td className="p-4 border-b border-slate-100 text-slate-500">
                                    {mb.campaigns?.map((c: Pick<Campaign, 'id' | 'name' | 'status'>) => c.name).join(', ') || '-'}
                                </td>
                            </tr>
                        ))}
                        {(!selectedDomain.mailboxes || selectedDomain.mailboxes.length === 0) && (
                            <tr><td colSpan={3} className="text-center p-8 text-gray-400 italic">No mailboxes found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* DNS Authentication — SPF / DKIM / DMARC / MX, populated by
                infrastructureAssessmentService during the periodic sweep and
                refreshed live by the healing pipeline. Sits directly above
                Infrastructure Health Issues so the SPF/DKIM/DMARC/MX state
                and the findings derived from it read together. */}
            <DomainDnsCard selectedDomain={selectedDomain} onRefreshed={onDomainRefreshed} />

            {/* Infrastructure Health Issues */}
            <FindingsCard entityType="domain" entityId={selectedDomain.id} />
        </div>
    );
}

function DomainMetric({ label, value, dot, rate }: { label: string; value: number | null | undefined; dot: string; rate?: string }) {
    return (
        <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
            <div className="flex items-center gap-1.5 mb-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: dot }} />
                <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">{label}</div>
            </div>
            <div className="text-2xl font-bold text-gray-900 tabular-nums">
                {(value ?? 0).toLocaleString()}
            </div>
            {rate && <div className="text-[11px] text-gray-500 mt-0.5">{rate}</div>}
        </div>
    );
}

// ─── DNS Authentication card ─────────────────────────────────────────────────

type DnsState = 'pass' | 'warn' | 'fail' | 'unknown';

function dnsTone(state: DnsState): { fg: string; bg: string; border: string; label: string } {
    switch (state) {
        case 'pass':
            return { fg: '#15803D', bg: '#ECFDF5', border: '#BBF7D0', label: 'Passing' };
        case 'warn':
            return { fg: '#B45309', bg: '#FFFBEB', border: '#FED7AA', label: 'Weak' };
        case 'fail':
            return { fg: '#B91C1C', bg: '#FEF2F2', border: '#FECACA', label: 'Failing' };
        default:
            return { fg: '#475569', bg: '#F8FAFC', border: '#E2E8F0', label: 'Not assessed' };
    }
}

// DNS state interpretation distinguishes three things:
//   1. Sweep has never run for this domain (`assessed=false`)         → 'unknown' for every row
//   2. Sweep ran but a transient resolve error stopped a single check → 'unknown' for that row
//   3. Sweep ran and the record genuinely is missing/wrong            → 'fail' / 'warn'
//
// `assessed` is the gate. When false, no per-field interpretation is done so
// we never paint a domain as "Failing" before we've actually checked. This is
// the key contract with the Findings panel — Findings only writes rows when
// the sweep produced failing data, so DNS Authentication must not contradict
// that empty state with red badges.

function spfState(v: boolean | null | undefined, assessed: boolean): DnsState {
    if (!assessed) return 'unknown';
    if (v === true) return 'pass';
    if (v === false) return 'fail';
    return 'unknown';
}
function dkimState(v: boolean | null | undefined, assessed: boolean): DnsState {
    if (!assessed) return 'unknown';
    if (v === true) return 'pass';
    if (v === false) return 'fail';
    return 'unknown';
}
function dmarcState(p: string | null | undefined, assessed: boolean): DnsState {
    if (!assessed) return 'unknown';
    if (!p) return 'fail';            // sweep ran, no DMARC found → legitimate fail
    if (p === 'none') return 'warn';
    return 'pass';
}
function mxState(
    records: Array<{ priority: number; exchange: string }> | null | undefined,
    valid: boolean | null | undefined,
    assessed: boolean,
): DnsState {
    if (!assessed) return 'unknown';
    if (Array.isArray(records)) return records.length > 0 ? 'pass' : 'fail';
    if (valid === true) return 'pass';
    if (valid === false) return 'fail';
    return 'unknown';
}

// Resolution targets for failing/warn rows. Internal docs cover SPF/DKIM/DMARC
// (we own the playbook content); MX points to Google's authoritative setup
// guide since it's typically configured at the domain registrar level.
const RESOLUTION_LINKS = {
    spf: { href: '/docs/help/dns-setup#spf', label: 'How to fix SPF', external: false },
    dkim: { href: '/docs/help/dns-setup#dkim', label: 'How to fix DKIM', external: false },
    dmarc: { href: '/docs/help/dns-setup#dmarc', label: 'How to fix DMARC', external: false },
    mx: { href: '/docs/help/dns-setup#mx', label: 'How to set up MX records', external: false },
} as const;

function DomainDnsCard({
    selectedDomain,
    onRefreshed,
}: {
    selectedDomain: Domain;
    onRefreshed: (patch: Partial<Domain>) => void;
}) {
    const assessed = !!selectedDomain.dns_checked_at;
    const [checking, setChecking] = useState(false);
    const [cooldownMsg, setCooldownMsg] = useState<string | null>(null);

    const handleCheckNow = async () => {
        if (checking) return;
        setChecking(true);
        setCooldownMsg(null);
        try {
            const res = await apiClient<{
                success: boolean;
                cached?: boolean;
                cooldown_seconds_remaining?: number;
                domain: Partial<Domain>;
            }>(`/api/assessment/domain/${selectedDomain.id}/dns/recheck`, { method: 'POST' });
            onRefreshed(res.domain);
            if (res.cached) {
                setCooldownMsg(
                    `DNS was just checked — try again in ${res.cooldown_seconds_remaining ?? 30}s for fresh data.`,
                );
            }
        } catch (err) {
            setCooldownMsg(`Check failed: ${(err as Error).message || 'unknown error'}`);
        } finally {
            setChecking(false);
        }
    };

    const lastChecked = selectedDomain.dns_checked_at
        ? new Date(selectedDomain.dns_checked_at).toLocaleString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
          })
        : null;

    return (
        <div className="premium-card mb-3">
            <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">DNS Authentication</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                        SPF, DKIM, DMARC and MX records for this sending domain.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {lastChecked ? (
                        <span className="text-[11px] text-gray-500">Last checked {lastChecked}</span>
                    ) : (
                        <span className="text-[11px] text-gray-400 italic">Awaiting first assessment</span>
                    )}
                    <button
                        onClick={handleCheckNow}
                        disabled={checking}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
                    >
                        {checking ? (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                        ) : (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 12a9 9 0 0 1-9 9"/><path d="M3 12a9 9 0 0 1 9-9"/><polyline points="21 3 21 9 15 9"/><polyline points="3 21 3 15 9 15"/></svg>
                        )}
                        {checking ? 'Checking…' : 'Check now'}
                    </button>
                </div>
            </div>
            {cooldownMsg && (
                <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 mb-3">
                    {cooldownMsg}
                </div>
            )}

            {!assessed && (
                <div
                    className="rounded-xl border px-3 py-2 mb-3 text-xs"
                    style={{ borderColor: '#E2E8F0', background: '#F8FAFC', color: '#475569' }}
                >
                    The DNS sweep hasn’t run for this domain yet, so SPF, DKIM, DMARC and MX are unknown — not failing.
                    The infrastructure-assessment worker checks each domain on its periodic schedule, and freshly-added
                    domains are picked up on the next run. This is also why <span className="font-semibold">Infrastructure Health Issues</span> is empty: findings are only written when an actual check produces a failure.
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <DnsRow
                    label="SPF"
                    state={spfState(selectedDomain.spf_valid, assessed)}
                    resolution={RESOLUTION_LINKS.spf}
                    detail={
                        !assessed
                            ? 'Awaiting first assessment.'
                            : selectedDomain.spf_valid === true
                              ? 'SPF record found and valid.'
                              : selectedDomain.spf_valid === false
                                ? 'No valid SPF record. Email providers may treat your sends as unauthenticated.'
                                : 'SPF lookup did not return a definitive answer — likely a transient DNS error. Will retry on the next sweep.'
                    }
                />
                <DnsRow
                    label="DKIM"
                    state={dkimState(selectedDomain.dkim_valid, assessed)}
                    resolution={RESOLUTION_LINKS.dkim}
                    detail={
                        !assessed
                            ? 'Awaiting first assessment.'
                            : selectedDomain.dkim_valid === true
                              ? 'DKIM signature record published on at least one common selector.'
                              : selectedDomain.dkim_valid === false
                                ? 'No DKIM record found on common selectors (default, google, selector1, selector2).'
                                : 'DKIM lookup did not return a definitive answer — will retry on the next sweep.'
                    }
                />
                <DnsRow
                    label="DMARC"
                    state={dmarcState(selectedDomain.dmarc_policy, assessed)}
                    resolution={RESOLUTION_LINKS.dmarc}
                    detail={
                        !assessed
                            ? 'Awaiting first assessment.'
                            : selectedDomain.dmarc_policy
                              ? selectedDomain.dmarc_policy === 'none'
                                  ? `Policy: p=none — monitoring only. Upgrade to quarantine or reject once SPF/DKIM are stable.`
                                  : `Policy: p=${selectedDomain.dmarc_policy} — enforcing.`
                              : 'No DMARC record found at _dmarc.<domain>.'
                    }
                />
                <DnsRow
                    label="MX"
                    state={mxState(selectedDomain.mx_records, selectedDomain.mx_valid, assessed)}
                    resolution={RESOLUTION_LINKS.mx}
                    detail={
                        !assessed
                            ? 'Awaiting first assessment.'
                            : Array.isArray(selectedDomain.mx_records) && selectedDomain.mx_records.length > 0
                              ? `${selectedDomain.mx_records.length} record${selectedDomain.mx_records.length === 1 ? '' : 's'} configured.`
                              : selectedDomain.mx_valid === false || (Array.isArray(selectedDomain.mx_records) && selectedDomain.mx_records.length === 0)
                                ? 'No MX records configured — this domain cannot receive replies, bounces, or unsubscribes.'
                                : 'MX lookup did not return a definitive answer — will retry on the next sweep.'
                    }
                >
                    {Array.isArray(selectedDomain.mx_records) && selectedDomain.mx_records.length > 0 && (
                        <div className="mt-2 rounded-md bg-slate-50 border border-slate-200 overflow-hidden">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500 bg-slate-100">
                                        <th className="px-2 py-1 w-20">Priority</th>
                                        <th className="px-2 py-1">Exchange</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedDomain.mx_records.map((r, i) => (
                                        <tr key={i} className="border-t border-slate-200">
                                            <td className="px-2 py-1 tabular-nums text-slate-700">{r.priority}</td>
                                            <td className="px-2 py-1 font-mono text-slate-800">{r.exchange}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </DnsRow>
            </div>
        </div>
    );
}

function DnsRow({
    label,
    state,
    detail,
    resolution,
    children,
}: {
    label: string;
    state: DnsState;
    detail: string;
    resolution: { href: string; label: string; external: boolean };
    children?: React.ReactNode;
}) {
    const tone = dnsTone(state);
    const showResolution = state === 'fail' || state === 'warn';
    return (
        <div className="rounded-xl border p-3" style={{ borderColor: tone.border, background: tone.bg }}>
            <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold" style={{ color: tone.fg }}>{label}</span>
                <span
                    className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded"
                    style={{ color: tone.fg, background: 'rgba(255,255,255,0.6)', border: `1px solid ${tone.border}` }}
                >
                    {tone.label}
                </span>
            </div>
            <p className="text-xs text-gray-700">{detail}</p>
            {showResolution && (
                <a
                    href={resolution.href}
                    target={resolution.external ? '_blank' : undefined}
                    rel={resolution.external ? 'noopener noreferrer' : undefined}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold underline"
                    style={{ color: tone.fg }}
                >
                    {resolution.label}
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        {resolution.external ? (
                            <>
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                <polyline points="15 3 21 3 21 9" />
                                <line x1="10" y1="14" x2="21" y2="3" />
                            </>
                        ) : (
                            <>
                                <line x1="5" y1="12" x2="19" y2="12" />
                                <polyline points="12 5 19 12 12 19" />
                            </>
                        )}
                    </svg>
                </a>
            )}
            {children}
        </div>
    );
}


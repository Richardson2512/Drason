'use client';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { RowLimitSelector } from '@/components/ui/RowLimitSelector';
import FindingsCard from '@/components/dashboard/FindingsCard';
import { apiClient } from '@/lib/api';
import type { Domain, Mailbox, Campaign, PaginatedResponse, AuditLog } from '@/types/api';
import { getStatusColors } from '@/lib/statusColors';
import { PlatformBadge } from '@/components/ui/PlatformBadge';
import { useSortFilterModal } from '@/hooks/useSortFilterModal';
import { usePagination } from '@/hooks/usePagination';

export default function DomainsPage() {
    const [domains, setDomains] = useState<Domain[]>([]);
    const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

    // Filters
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Sorting & Filtering (delegated to useSortFilterModal hook)
    const sortFilter = useSortFilterModal({
        sortBy: 'domain_asc',
        minEngagement: '',
        maxEngagement: '',
        minBounceRate: '',
        maxBounceRate: '',
    });

    // Pagination & Selection (delegated to usePagination hook)
    const { meta, setMeta, toggleSelection, toggleSelectAll, isSelected, isAllSelected } = usePagination();

    const fetchDomains = useCallback(async () => {
        const { sortBy, minEngagement, maxEngagement, minBounceRate, maxBounceRate } = sortFilter.values;
        try {
            const params = new URLSearchParams({
                page: meta.page.toString(),
                limit: meta.limit.toString(),
                sortBy
            });

            // Add filters
            if (selectedStatus !== 'all') params.append('status', selectedStatus);
            if (searchQuery.trim()) params.append('search', searchQuery.trim());

            // Add sort & filter parameters
            if (minEngagement) params.append('minEngagement', minEngagement);
            if (maxEngagement) params.append('maxEngagement', maxEngagement);
            if (minBounceRate) params.append('minBounceRate', minBounceRate);
            if (maxBounceRate) params.append('maxBounceRate', maxBounceRate);

            const data = await apiClient<PaginatedResponse<Domain>>(`/api/dashboard/domains?${params}`);
            if (data?.data) {
                setDomains(data.data);
                setMeta(data.meta);
                if (data.data.length > 0 && !selectedDomain) {
                    setSelectedDomain(data.data[0]);
                }
            } else {
                setDomains([]);
            }
        } catch (err) {
            console.error('Failed to fetch domains:', err);
            setDomains([]);
        }
    }, [meta.page, meta.limit, selectedStatus, searchQuery, sortFilter.values, selectedDomain]);

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

    return (
        <div className="flex h-full gap-8">
            {/* Left: List */}
            <div className="premium-card flex flex-col p-6 h-full overflow-hidden rounded-3xl" style={{ width: '420px' }}>
                <h2 className="text-2xl font-bold mb-4 shrink-0 text-gray-900">Domains</h2>

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

                    {/* Status Filter */}
                    <select
                        value={selectedStatus}
                        onChange={(e) => {
                            setSelectedStatus(e.target.value);
                            setMeta(prev => ({ ...prev, page: 1 }));
                        }}
                        className="w-full rounded-xl border border-gray-200 bg-white text-sm cursor-pointer outline-none"
                        style={{ padding: '0.625rem 1rem' }}
                    >
                        <option value="all">All Status</option>
                        <option value="healthy">Healthy</option>
                        <option value="warning">Warning</option>
                        <option value="paused">Paused</option>
                    </select>

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
                    <DomainDetailsView selectedDomain={selectedDomain} auditLogs={auditLogs} />
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
                        className="bg-white rounded-3xl max-w-[500px] w-full max-h-[90vh] overflow-hidden flex flex-col shadow-xl"
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
                            <div className="mb-6">
                                <label htmlFor="modal-sort-by" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Sort By
                                </label>
                                <select
                                    id="modal-sort-by"
                                    value={sortFilter.temp.sortBy}
                                    onChange={(e) => sortFilter.setTempValue('sortBy', e.target.value)}
                                    className="w-full rounded-xl border border-gray-300 bg-white text-gray-900 text-sm cursor-pointer outline-none"
                                    style={{ padding: '0.75rem 1rem' }}
                                >
                                    <option value="domain_asc">Domain (A-Z)</option>
                                    <option value="domain_desc">Domain (Z-A)</option>
                                    <option value="sent_desc">Sent (High to Low)</option>
                                    <option value="sent_asc">Sent (Low to High)</option>
                                    <option value="engagement_desc">Engagement (High to Low)</option>
                                    <option value="engagement_asc">Engagement (Low to High)</option>
                                    <option value="bounce_desc">Bounce (High to Low)</option>
                                    <option value="bounce_asc">Bounce (Low to High)</option>
                                </select>
                            </div>

                            {/* Engagement Rate Range */}
                            <div className="mb-6">
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
                            <div className="mb-6">
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
        </div>
    );
}

// Memoized component for better Safari performance
function DomainDetailsView({ selectedDomain, auditLogs }: { selectedDomain: Domain; auditLogs: AuditLog[] }) {
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
            <div className="page-header">
                <h1 className="font-extrabold mb-2 text-gray-900 tracking-tight" style={{ fontSize: '2.25rem' }}>{selectedDomain.domain}</h1>
                <div className="text-gray-500" style={{ fontSize: '1.1rem' }}>Reputation & Usage</div>
            </div>

            {selectedDomain.status === 'paused' && (
                <div className="premium-card mb-8" style={{
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderLeft: '6px solid #EF4444',
                }}>
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">⚠️</span>
                        <div className="flex-1">
                            <h3 className="font-extrabold text-xl tracking-tight mb-2" style={{ color: '#B91C1C' }}>DOMAIN PAUSED</h3>
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

            <div className="premium-card mb-8">
                <h2 className="text-xl font-bold mb-6 text-gray-900">Bounce Overview</h2>
                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <div className="text-slate-500 text-sm font-semibold uppercase tracking-wide mb-2">Bounce Rate Trend</div>
                        <div className="text-4xl font-extrabold" style={{ color: (selectedDomain.aggregated_bounce_rate_trend || 0) > 2 ? '#EF4444' : '#16A34A' }}>
                            {(selectedDomain.aggregated_bounce_rate_trend || 0).toFixed(2)}<span className="text-2xl">%</span>
                        </div>
                        <div className="text-sm text-gray-400 mt-1">Lifetime aggregate across all mailboxes</div>
                    </div>
                    <div>
                        <div className="text-slate-500 text-sm font-semibold uppercase tracking-wide mb-2">Warnings Triggered</div>
                        <div className="text-4xl font-extrabold" style={{ color: (selectedDomain.warning_count || 0) > 0 ? '#F59E0B' : '#1E293B' }}>{selectedDomain.warning_count || 0}</div>
                        <div className="text-sm text-gray-400 mt-1">Lifetime incidents</div>
                    </div>
                </div>
            </div>

            {/* Engagement Metrics Section (SOFT SIGNALS - aggregated from all mailboxes) */}
            <div className="premium-card mb-8">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">
                        Domain-Wide Engagement
                    </h2>
                    <p className="text-sm text-gray-500">
                        Aggregated metrics across all mailboxes on this domain (informational only)
                    </p>
                </div>

                <div className="grid grid-cols-4 gap-4">
                    {/* Total Sent */}
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">
                            Total Sent
                        </div>
                        <div className="font-bold text-gray-900" style={{ fontSize: '1.75rem' }}>
                            {selectedDomain.total_sent_lifetime?.toLocaleString() || '0'}
                        </div>
                    </div>

                    {/* Opens */}
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#1E40AF' }}>
                            Opens
                        </div>
                        <div className="font-bold" style={{ fontSize: '1.75rem', color: '#1E3A8A' }}>
                            {selectedDomain.total_opens?.toLocaleString() || '0'}
                        </div>
                        <div className="text-xs text-blue-500 mt-1 font-semibold">
                            {openRate}% rate
                        </div>
                    </div>

                    {/* Clicks */}
                    <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                        <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#166534' }}>
                            Clicks
                        </div>
                        <div className="font-bold" style={{ fontSize: '1.75rem', color: '#15803D' }}>
                            {selectedDomain.total_clicks?.toLocaleString() || '0'}
                        </div>
                        <div className="text-xs text-green-500 mt-1 font-semibold">
                            {clickRate}% rate
                        </div>
                    </div>

                    {/* Replies */}
                    <div className="p-4 rounded-xl border" style={{ background: '#FDF4FF', borderColor: '#F0ABFC' }}>
                        <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#86198F' }}>
                            Replies
                        </div>
                        <div className="font-bold" style={{ fontSize: '1.75rem', color: '#A21CAF' }}>
                            {selectedDomain.total_replies?.toLocaleString() || '0'}
                        </div>
                        <div className="text-xs mt-1 font-semibold" style={{ color: '#C026D3' }}>
                            {replyRate}% rate
                        </div>
                    </div>
                </div>
            </div>

            {/* Recovery Status */}
            {selectedDomain.recovery_phase && selectedDomain.recovery_phase !== 'healthy' && (
                <div className="premium-card mb-8">
                    <h2 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-3">
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
                            <div className="font-extrabold" style={{
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
                            <div className="text-slate-800 font-extrabold" style={{ fontSize: '1.75rem' }}>
                                {selectedDomain.clean_sends_since_phase || 0}
                                {selectedDomain.recovery_phase === 'restricted_send' && `/${(selectedDomain.consecutive_pauses || 0) > 1 ? 25 : 15}`}
                                {selectedDomain.recovery_phase === 'warm_recovery' && `/50`}
                            </div>
                        </div>

                        {/* Relapse Count */}
                        {(selectedDomain.relapse_count || 0) > 0 && (
                            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                                <div className="text-xs mb-2 font-semibold uppercase" style={{ color: '#DC2626' }}>Relapses</div>
                                <div className="font-extrabold" style={{ fontSize: '1.75rem', color: '#DC2626' }}>
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

            <div className="premium-card mb-8">
                <h2 className="text-xl font-bold mb-6 text-gray-900">Domain Events Log</h2>
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

            <div className="premium-card mb-8">
                <h2 className="text-xl font-bold mb-6 text-gray-900">Child Mailboxes</h2>
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

            {/* Infrastructure Health Issues */}
            <FindingsCard entityType="domain" entityId={selectedDomain.id} />
        </div>
    );
}

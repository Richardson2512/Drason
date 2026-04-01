'use client';
import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { RowLimitSelector } from '@/components/ui/RowLimitSelector';
import CampaignsEmptyState from '@/components/dashboard/CampaignsEmptyState';
import StalledCampaignResolutionModal from '@/components/dashboard/StalledCampaignResolutionModal';
import CampaignTopLeads from '@/components/dashboard/CampaignTopLeads';
import ConfirmActionModal from '@/components/modals/ConfirmActionModal';
import { apiClient } from '@/lib/api';
import type { Campaign, Mailbox, DashboardStats, PaginatedResponse } from '@/types/api';
import { PlatformBadge } from '@/components/ui/PlatformBadge';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import MultiSelectDropdown from '@/components/ui/MultiSelectDropdown';
import BulkActionBar from '@/components/ui/BulkActionBar';
import { useSortFilterModal } from '@/hooks/useSortFilterModal';
import { usePagination } from '@/hooks/usePagination';
import { useEntityStats } from '@/hooks/useEntityStats';
import EntityStatsBar from '@/components/ui/EntityStatsBar';

export default function CampaignsPage() {
    const router = useRouter();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
    const [stats, setStats] = useState<Record<string, number> | null>(null);
    const [loading, setLoading] = useState(true);
    const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });

    const { selectedIds: selectedCampaignIds, toggleSelection: toggleCampaignSelection, toggleSelectAll, isAllSelected } = usePagination();
    const entityStats = useEntityStats();

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string[]>([]);

    // Sort & Filter via shared hook
    const sortFilter = useSortFilterModal({
        sortBy: 'name_asc',
        minSent: '',
        maxSent: '',
        minOpenRate: '',
        maxOpenRate: '',
        platform: 'all',
    });

    // Modal state
    const [showResolveModal, setShowResolveModal] = useState(false);
    const [campaignActionLoading, setCampaignActionLoading] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [confirmAction, setConfirmAction] = useState<'pause' | 'resume' | null>(null);

    // Use ref for selectedCampaign to avoid triggering refetches on selection change
    const selectedCampaignRef = useRef(selectedCampaign);
    selectedCampaignRef.current = selectedCampaign;

    const fetchCampaigns = useCallback(async () => {
        setLoading(true);
        setFetchError(null);
        try {
            const { sortBy, minSent, maxSent, minOpenRate, maxOpenRate, platform } = sortFilter.values;
            const params = new URLSearchParams({
                page: meta.page.toString(),
                limit: meta.limit.toString(),
                sortBy
            });

            if (statusFilter.length > 0) params.append('status', statusFilter.join(','));
            if (searchQuery.trim()) params.append('search', searchQuery.trim());
            if (minSent) params.append('minSent', minSent);
            if (maxSent) params.append('maxSent', maxSent);
            if (minOpenRate) params.append('minOpenRate', minOpenRate);
            if (maxOpenRate) params.append('maxOpenRate', maxOpenRate);
            if (platform && platform !== 'all') params.append('platform', platform);

            const data = await apiClient<PaginatedResponse<Campaign>>(`/api/dashboard/campaigns?${params}`);
            if (data?.data) {
                setCampaigns(data.data);
                setMeta(data.meta);
                if (data.data.length > 0 && !selectedCampaignRef.current) {
                    setSelectedCampaign(data.data[0]);
                }
            } else {
                setCampaigns(Array.isArray(data) ? data : []);
            }
        } catch (err: any) {
            console.error('Failed to fetch campaigns:', err);
            setFetchError(err.message || 'Failed to load campaigns');
            // Don't wipe existing campaigns on error — keep stale data visible
        } finally {
            setLoading(false);
        }
    }, [meta.page, meta.limit, statusFilter, searchQuery, sortFilter.values]);

    useEffect(() => {
        fetchCampaigns();
    }, [fetchCampaigns]);

    useEffect(() => {
        if (selectedCampaign) {
            apiClient<Record<string, number>>(`/api/dashboard/stats?campaignId=${selectedCampaign.id}`)
                .then(setStats)
                .catch(err => {
                    console.error('Failed to fetch stats:', err);
                    setStats(null);
                });
        } else {
            setStats(null);
        }
    }, [selectedCampaign]);

    const handlePageChange = (newPage: number) => {
        setMeta(prev => ({ ...prev, page: newPage }));
    };

    const handleLimitChange = (newLimit: number) => {
        setMeta(prev => ({ ...prev, limit: newLimit, page: 1 }));
    };

    const navigateToLeads = (status?: string) => {
        if (!selectedCampaign) return;

        const params = new URLSearchParams({
            campaignId: selectedCampaign.id
        });

        if (status && status !== 'all') {
            params.append('status', status);
        }

        router.push(`/dashboard/leads?${params.toString()}`);
    };

    const handlePauseCampaign = () => {
        if (!selectedCampaign || campaignActionLoading) return;
        setConfirmAction('pause');
    };

    const handleResumeCampaign = () => {
        if (!selectedCampaign || campaignActionLoading) return;
        setConfirmAction('resume');
    };

    const executeConfirmedAction = async () => {
        if (!selectedCampaign || !confirmAction) return;
        setCampaignActionLoading(true);
        try {
            if (confirmAction === 'pause') {
                await apiClient('/api/dashboard/campaign/pause', {
                    method: 'POST',
                    body: JSON.stringify({ campaignId: selectedCampaign.id, reason: 'Manual pause from dashboard' })
                });
                setSelectedCampaign({ ...selectedCampaign, status: 'paused', paused_reason: 'Manual pause from dashboard', paused_by: 'user' });
            } else {
                await apiClient('/api/dashboard/campaign/resume', {
                    method: 'POST',
                    body: JSON.stringify({ campaignId: selectedCampaign.id })
                });
                setSelectedCampaign({ ...selectedCampaign, status: 'active', paused_reason: undefined, paused_at: undefined, paused_by: undefined });
            }
            await fetchCampaigns();
        } catch (err: any) {
            console.error(`Failed to ${confirmAction} campaign:`, err);
        } finally {
            setCampaignActionLoading(false);
            setConfirmAction(null);
        }
    };

    // Sort & Filter Modal Handlers (delegated to useSortFilterModal hook)
    const handleApplySortFilter = () => {
        sortFilter.apply();
        setMeta(prev => ({ ...prev, page: 1 }));
    };

    const handleClearFilters = () => {
        sortFilter.clear();
        setMeta(prev => ({ ...prev, page: 1 }));
    };

    if (loading && campaigns.length === 0) {
        return <div className="p-8"><LoadingSkeleton type="table" rows={8} /></div>;
    }

    if (!loading && (!campaigns || campaigns.length === 0) && !fetchError) {
        return <CampaignsEmptyState />;
    }

    if (!loading && campaigns.length === 0 && fetchError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <div className="text-5xl mb-6">⚠️</div>
                <h2 className="text-2xl font-bold mb-3 text-gray-900">Failed to Load Campaigns</h2>
                <p className="text-gray-500 mb-6">{fetchError}</p>
                <button
                    onClick={fetchCampaigns}
                    className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-all"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="flex h-full gap-8">
            {/* Left: Campaign List */}
            <div className="premium-card flex flex-col p-6 h-full overflow-hidden rounded-3xl" style={{ width: '400px' }}>
                <div className="mb-6 shrink-0">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Campaigns</h2>

                    {/* Stats Breakdown */}
                    {entityStats?.campaigns && (
                        <div className="mb-3">
                            <EntityStatsBar
                                total={entityStats.campaigns.total}
                                stats={[
                                    { label: 'Active', value: entityStats.campaigns.active, color: '#22c55e' },
                                    { label: 'Paused', value: entityStats.campaigns.paused, color: '#ef4444' },
                                    { label: 'Completed', value: entityStats.campaigns.completed, color: '#6b7280' },
                                ]}
                            />
                        </div>
                    )}

                    {/* Search Input */}
                    <input
                        type="text"
                        placeholder="🔍 Search campaigns..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="dash-input mb-3"
                    />

                    {/* Status Filter */}
                    <MultiSelectDropdown
                        options={[
                            { value: 'active', label: 'Active' },
                            { value: 'paused', label: 'Paused' },
                            { value: 'completed', label: 'Completed' },
                        ]}
                        selected={statusFilter}
                        onChange={setStatusFilter}
                        placeholder="All Statuses"
                        className="mb-3"
                    />

                    {/* Sort & Filter Button */}
                    <button
                        onClick={sortFilter.open}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm font-semibold cursor-pointer flex items-center justify-center gap-2 transition-all duration-200 hover:bg-gray-50 hover:border-blue-300"
                    >
                        <span className="text-base">⚙️</span>
                        Sort & Filter
                        {sortFilter.hasActiveFilters && (
                            <span className="bg-blue-500 text-white text-[0.65rem] px-1.5 py-0.5 rounded-full font-bold">
                                Active
                            </span>
                        )}
                    </button>
                </div>

                <div className="flex items-center gap-3 px-2 pb-3 border-b border-gray-100 mb-3">
                    <input
                        type="checkbox"
                        checked={isAllSelected(campaigns)}
                        onChange={() => toggleSelectAll(campaigns)}
                        className="w-4 h-4 cursor-pointer accent-blue-600"
                    />
                    <span className="text-[0.8rem] text-gray-500 font-medium">Select All ({campaigns.length})</span>
                </div>

                <div className="overflow-y-auto flex-1 flex flex-col gap-3 pr-2 scrollbar-hide">
                    {campaigns.map(c => (
                        <div
                            key={c.id}
                            onClick={() => setSelectedCampaign(c)}
                            className="p-5 rounded-2xl cursor-pointer border shrink-0 flex items-center gap-3 transition-all duration-200 hover:shadow-md hover:border-blue-100"
                            style={{
                                background: selectedCampaign?.id === c.id ? '#EFF6FF' : '#FFFFFF',
                                borderColor: selectedCampaign?.id === c.id ? '#BFDBFE' : '#F3F4F6',
                                boxShadow: selectedCampaign?.id === c.id ? '0 4px 6px -1px rgba(37, 99, 235, 0.1)' : 'none',
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={selectedCampaignIds.has(c.id)}
                                onClick={(e) => toggleCampaignSelection(e, c.id)}
                                onChange={() => { }}
                                className="w-4 h-4 cursor-pointer accent-blue-600"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-slate-800">{c.name}</span>
                                    {c.source_platform && <PlatformBadge platform={c.source_platform} />}
                                </div>
                                <div className="text-xs text-slate-500 font-mono">ID: {c.id}</div>
                                <div className="text-[0.7rem] mt-3 inline-block px-3 py-1 rounded-full font-semibold" style={{
                                    background: c.status === 'active' ? '#DCFCE7' : c.status === 'paused' ? '#FEE2E2' : c.status === 'completed' ? '#FFF7ED' : c.status === 'warning' ? '#FEF3C7' : '#F3F4F6',
                                    color: c.status === 'active' ? '#166534' : c.status === 'paused' ? '#991B1B' : c.status === 'completed' ? '#C2410C' : c.status === 'warning' ? '#B45309' : '#6B7280',
                                }}>
                                    {c.status.toUpperCase()}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-4 border-t border-gray-100 mt-auto flex justify-between items-center">
                    <RowLimitSelector limit={meta.limit} onLimitChange={handleLimitChange} />
                    <PaginationControls currentPage={meta.page} totalPages={meta.totalPages} onPageChange={handlePageChange} />
                </div>
            </div>

            {/* Right: Details View */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                {selectedCampaign ? (
                    <div className="animate-fade-in">
                        <div className="page-header flex justify-between items-start">
                            <div>
                                <h1 className="text-4xl font-extrabold mb-2 text-gray-900 tracking-tight">{selectedCampaign.name}</h1>
                                <div className="text-gray-500 text-[1.1rem]">Campaign Performance Details</div>
                            </div>
                            {selectedCampaign.status === 'active' ? (
                                <button
                                    onClick={handlePauseCampaign}
                                    disabled={campaignActionLoading}
                                    className="px-5 py-2.5 bg-white text-red-500 border border-red-300 rounded-[10px] text-sm font-semibold flex items-center gap-2 transition-all duration-200 whitespace-nowrap"
                                    style={{
                                        cursor: campaignActionLoading ? 'not-allowed' : 'pointer',
                                        opacity: campaignActionLoading ? 0.6 : 1,
                                    }}
                                >
                                    {campaignActionLoading ? 'Pausing...' : '⏸ Pause Campaign'}
                                </button>
                            ) : selectedCampaign.status === 'paused' ? (
                                <button
                                    onClick={handleResumeCampaign}
                                    disabled={campaignActionLoading}
                                    className="premium-btn px-5 py-2.5 text-sm font-semibold flex items-center gap-2 whitespace-nowrap"
                                    style={{
                                        opacity: campaignActionLoading ? 0.6 : 1,
                                        cursor: campaignActionLoading ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    {campaignActionLoading ? 'Resuming...' : '▶ Resume Campaign'}
                                </button>
                            ) : null}
                        </div>

                        {/* Pause Reason Banner */}
                        {selectedCampaign.status === 'paused' && selectedCampaign.paused_reason && (
                            <div className="p-4 bg-red-50 border border-red-300 rounded-lg mb-6">
                                <div className="flex items-start gap-3">
                                    <span className="text-xl">⏸️</span>
                                    <div className="flex-1">
                                        <div className="font-bold text-red-900 mb-1">
                                            Campaign Paused
                                        </div>
                                        <div className="text-sm text-red-950 leading-relaxed">
                                            {selectedCampaign.paused_reason}
                                        </div>
                                        {selectedCampaign.paused_at && (
                                            <div className="text-xs text-gray-400 mt-2">
                                                Paused {new Date(selectedCampaign.paused_at).toLocaleString()} by {selectedCampaign.paused_by || 'system'}
                                            </div>
                                        )}
                                        {selectedCampaign.paused_reason === 'Infrastructure health enforcement' && (
                                            <button
                                                onClick={() => setShowResolveModal(true)}
                                                className="mt-4 px-4 py-2 bg-red-900 text-white border-none rounded-md text-sm font-semibold cursor-pointer"
                                            >
                                                Resolve Issue
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Top Stats - SPECIFIC TO CAMPAIGN (Clickable) */}
                        <div className="grid grid-cols-3 gap-6 mb-10">
                            <div
                                className="premium-card hover:shadow-lg stat-card-clickable"
                                onClick={() => navigateToLeads()}
                            >
                                <div className="text-slate-500 text-sm font-semibold uppercase tracking-wide mb-2">Total Leads</div>
                                <div className="text-4xl font-extrabold text-gray-900">{stats ? stats.total : '-'}</div>
                                <div className="text-xs text-gray-400 mt-2 font-medium">Click to view all leads →</div>
                            </div>
                            <div
                                className="premium-card hover:shadow-lg stat-card-clickable" data-variant="green"
                                onClick={() => navigateToLeads('active')}
                            >
                                <div className="text-slate-500 text-sm font-semibold uppercase tracking-wide mb-2">Active Execution</div>
                                <div className="text-4xl font-extrabold text-green-600">{stats ? stats.active : '-'}</div>
                                <div className="text-xs text-gray-400 mt-2 font-medium">Click to view active leads →</div>
                            </div>
                            <div
                                className="premium-card hover:shadow-lg stat-card-clickable" data-variant="red"
                                onClick={() => navigateToLeads('paused')}
                            >
                                <div className="text-slate-500 text-sm font-semibold uppercase tracking-wide mb-2">Paused</div>
                                <div className="text-4xl font-extrabold text-red-500">{stats ? stats.paused : '-'}</div>
                                <div className="text-xs text-gray-400 mt-2 font-medium">Click to view paused leads →</div>
                            </div>
                        </div>

                        {/* Engagement Metrics Section (SOFT SIGNALS - informational only) */}
                        <div className="premium-card mb-10">
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-1">
                                    Engagement Metrics
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Campaign-level analytics (informational only, does not affect automated decisions)
                                </p>
                            </div>

                            <div className="grid grid-cols-4 gap-4">
                                {/* Total Sent */}
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                    <div className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">
                                        Total Sent
                                    </div>
                                    <div className="text-[1.75rem] font-bold text-gray-900">
                                        {selectedCampaign.total_sent?.toLocaleString() || '0'}
                                    </div>
                                </div>

                                {/* Opens */}
                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                                    <div className="text-blue-800 text-xs font-semibold uppercase tracking-wide mb-2">
                                        Opens
                                    </div>
                                    <div className="text-[1.75rem] font-bold text-blue-900">
                                        {selectedCampaign.open_count?.toLocaleString() || '0'}
                                    </div>
                                    <div className="text-xs text-blue-500 mt-1 font-semibold">
                                        {selectedCampaign.open_rate ? `${selectedCampaign.open_rate.toFixed(1)}%` : '0%'} rate
                                    </div>
                                </div>

                                {/* Clicks */}
                                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                                    <div className="text-green-900 text-xs font-semibold uppercase tracking-wide mb-2">
                                        Clicks
                                    </div>
                                    <div className="text-[1.75rem] font-bold text-green-700">
                                        {selectedCampaign.click_count?.toLocaleString() || '0'}
                                    </div>
                                    <div className="text-xs text-green-500 mt-1 font-semibold">
                                        {selectedCampaign.click_rate ? `${selectedCampaign.click_rate.toFixed(1)}%` : '0%'} rate
                                    </div>
                                </div>

                                {/* Replies */}
                                <div className="p-4 bg-fuchsia-50 rounded-xl border border-fuchsia-300">
                                    <div className="text-fuchsia-900 text-xs font-semibold uppercase tracking-wide mb-2">
                                        Replies
                                    </div>
                                    <div className="text-[1.75rem] font-bold text-fuchsia-700">
                                        {selectedCampaign.reply_count?.toLocaleString() || '0'}
                                    </div>
                                    <div className="text-xs text-fuchsia-500 mt-1 font-semibold">
                                        {selectedCampaign.reply_rate ? `${selectedCampaign.reply_rate.toFixed(1)}%` : '0%'} rate
                                    </div>
                                </div>
                            </div>

                            {/* Bounce & Unsubscribe Row */}
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                {/* Bounces */}
                                <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                                    <div className="text-red-900 text-xs font-semibold uppercase tracking-wide mb-2">
                                        Bounces (HARD SIGNAL)
                                    </div>
                                    <div className="text-[1.75rem] font-bold text-red-600">
                                        {selectedCampaign.total_bounced?.toLocaleString() || '0'}
                                    </div>
                                    <div className="text-xs text-red-500 mt-1 font-semibold">
                                        {selectedCampaign.bounce_rate ? `${selectedCampaign.bounce_rate.toFixed(1)}%` : '0%'} rate
                                    </div>
                                </div>

                                {/* Unsubscribes */}
                                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                                    <div className="text-amber-900 text-xs font-semibold uppercase tracking-wide mb-2">
                                        Unsubscribes
                                    </div>
                                    <div className="text-[1.75rem] font-bold text-amber-700">
                                        {selectedCampaign.unsubscribed_count?.toLocaleString() || '0'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Top Performing Leads */}
                        <CampaignTopLeads campaignId={selectedCampaign.id} />

                        {/* Mailboxes Section */}
                        <div className="premium-card">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Connected Mailboxes & Domains</h2>
                                <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold">
                                    {selectedCampaign.mailboxes?.length || 0} Connected
                                </div>
                            </div>

                            {(!selectedCampaign.mailboxes || selectedCampaign.mailboxes.length === 0) ? (
                                <div className="text-center p-8 text-gray-400 italic text-sm">
                                    No mailboxes linked.
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto">
                                    {/* Column headers */}
                                    <div className="grid gap-3 px-3 py-2 border-b-2 border-slate-200" style={{ gridTemplateColumns: '1fr auto auto auto' }}>
                                        <span className="text-[0.7rem] font-bold text-slate-400 uppercase">Mailbox</span>
                                        <span className="text-[0.7rem] font-bold text-slate-400 uppercase min-w-[90px]">Domain</span>
                                        <span className="text-[0.7rem] font-bold text-slate-400 uppercase min-w-[72px]">Status</span>
                                        <span className="text-[0.7rem] font-bold text-slate-400 uppercase min-w-[48px] text-right">Sent</span>
                                    </div>
                                    {selectedCampaign.mailboxes.map((mb: Mailbox) => (
                                        <div key={mb.id} className="grid gap-3 px-3 py-2.5 rounded-lg bg-neutral-50 border border-slate-100 items-center" style={{ gridTemplateColumns: '1fr auto auto auto' }}>
                                            {/* Email — truncated */}
                                            <div className="truncate text-[0.8rem] font-medium text-slate-800" title={mb.email}>
                                                {mb.email}
                                            </div>
                                            {/* Domain */}
                                            <div className="min-w-[90px] text-[0.8rem] text-slate-500 flex items-center gap-1 shrink-0">
                                                <span className="truncate max-w-[80px]" title={mb.domain?.domain}>{mb.domain?.domain}</span>
                                                {mb.domain?.status === 'paused' && (
                                                    <span className="text-red-500 font-bold text-[0.6rem] bg-red-50 px-1.5 py-px rounded shrink-0">PAUSED</span>
                                                )}
                                            </div>
                                            {/* Status badge */}
                                            <div className="min-w-[72px] shrink-0">
                                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold" style={{
                                                    color: (mb.status === 'active' || mb.status === 'healthy') ? '#166534' : (mb.status === 'warning' ? '#B45309' : '#991B1B'),
                                                    background: (mb.status === 'active' || mb.status === 'healthy') ? '#DCFCE7' : (mb.status === 'warning' ? '#FEF3C7' : '#FEE2E2'),
                                                }}>
                                                    {mb.status?.toUpperCase()}
                                                </span>
                                            </div>
                                            {/* Sent count */}
                                            <div className="min-w-[48px] text-right text-[0.8rem] text-slate-600 font-mono shrink-0">
                                                {mb.total_sent_count ?? 0}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
                        <div className="text-5xl">👈</div>
                        <div className="text-xl font-medium">Select a campaign to view performance</div>
                    </div>
                )}
            </div>

            {/* Resolution Modal */}
            {selectedCampaign && (
                <StalledCampaignResolutionModal
                    isOpen={showResolveModal}
                    onClose={() => setShowResolveModal(false)}
                    campaign={selectedCampaign}
                    onSuccess={() => {
                        fetchCampaigns();
                        setShowResolveModal(false);
                    }}
                />
            )}

            {/* Pause / Resume Confirmation Modal */}
            {selectedCampaign && confirmAction && (
                <ConfirmActionModal
                    isOpen={true}
                    title={confirmAction === 'pause' ? 'Pause Campaign' : 'Resume Campaign'}
                    icon={confirmAction === 'pause' ? '⏸️' : '▶️'}
                    message={
                        confirmAction === 'pause'
                            ? `Are you sure you want to pause "${selectedCampaign.name}"? This will stop all email sending for this campaign on the platform.`
                            : `Are you sure you want to resume "${selectedCampaign.name}"? This will reactivate email sending on the platform.`
                    }
                    detail={
                        confirmAction === 'resume' && selectedCampaign.paused_reason
                            ? selectedCampaign.paused_reason
                            : undefined
                    }
                    consequences={
                        confirmAction === 'pause'
                            ? [
                                'Campaign will be paused on the email platform (Smartlead, etc.)',
                                'No new emails will be sent from this campaign',
                                'Leads already in sequence will be paused mid-sequence',
                                'You can resume anytime from this page',
                            ]
                            : [
                                'Campaign will be reactivated on the email platform',
                                'Emails will start sending again immediately',
                                selectedCampaign.paused_by === 'system'
                                    ? 'This campaign was paused by Superkabe due to health issues — the underlying issue may not be resolved'
                                    : 'Leads in sequence will continue where they left off',
                            ]
                    }
                    variant={confirmAction === 'resume' && selectedCampaign.paused_by === 'system' ? 'danger' : 'warning'}
                    confirmLabel={confirmAction === 'pause' ? 'Pause Campaign' : 'Resume Campaign'}
                    cancelLabel="Cancel"
                    loading={campaignActionLoading}
                    onConfirm={executeConfirmedAction}
                    onCancel={() => setConfirmAction(null)}
                />
            )}

            {/* Sort & Filter Modal */}
            {sortFilter.isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4"
                    onClick={() => sortFilter.close()}
                >
                    <div
                        className="bg-white rounded-3xl max-w-[500px] w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 m-0">
                                ⚙️ Sort & Filter Campaigns
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
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm cursor-pointer outline-none"
                                >
                                    <option value="name_asc">Name (A-Z)</option>
                                    <option value="name_desc">Name (Z-A)</option>
                                    <option value="sent_desc">Sent (High to Low)</option>
                                    <option value="sent_asc">Sent (Low to High)</option>
                                    <option value="open_rate_desc">Open Rate (High to Low)</option>
                                    <option value="open_rate_asc">Open Rate (Low to High)</option>
                                    <option value="reply_rate_desc">Reply Rate (High to Low)</option>
                                    <option value="reply_rate_asc">Reply Rate (Low to High)</option>
                                    <option value="bounce_rate_desc">Bounce Rate (High to Low)</option>
                                    <option value="bounce_rate_asc">Bounce Rate (Low to High)</option>
                                </select>
                            </div>

                            {/* Total Sent Range */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Total Sent Range
                                </label>
                                <div className="flex gap-3 items-center">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={sortFilter.temp.minSent}
                                        onChange={(e) => sortFilter.setTempValue('minSent', e.target.value)}
                                        min="0"
                                        className="flex-1 px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm outline-none"
                                    />
                                    <span className="text-gray-500 text-base font-medium">→</span>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={sortFilter.temp.maxSent}
                                        onChange={(e) => sortFilter.setTempValue('maxSent', e.target.value)}
                                        min="0"
                                        className="flex-1 px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm outline-none"
                                    />
                                </div>
                            </div>

                            {/* Open Rate Range */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Open Rate Range (%)
                                </label>
                                <div className="flex gap-3 items-center">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={sortFilter.temp.minOpenRate}
                                        onChange={(e) => sortFilter.setTempValue('minOpenRate', e.target.value)}
                                        min="0"
                                        max="100"
                                        className="flex-1 px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm outline-none"
                                    />
                                    <span className="text-gray-500 text-base font-medium">→</span>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={sortFilter.temp.maxOpenRate}
                                        onChange={(e) => sortFilter.setTempValue('maxOpenRate', e.target.value)}
                                        min="0"
                                        max="100"
                                        className="flex-1 px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm outline-none"
                                    />
                                </div>
                            </div>

                            {/* Platform Filter */}
                            <div className="mb-6">
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
                                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-gray-50"
                            >
                                Clear All
                            </button>
                            <button
                                onClick={handleApplySortFilter}
                                className="flex-1 px-4 py-3 rounded-xl border-none bg-blue-500 text-white text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-blue-600"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Action Bar */}
            {selectedCampaignIds.size > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3 rounded-2xl shadow-xl" style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)' }}>
                    <div className="bg-white/20 rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold text-white">{selectedCampaignIds.size}</div>
                    <span className="text-sm font-semibold text-white">campaign{selectedCampaignIds.size !== 1 ? 's' : ''} selected</span>
                    <div className="w-px h-6 bg-white/20" />
                    <button
                        onClick={() => {
                            const selected = campaigns.filter(c => selectedCampaignIds.has(c.id));
                            const headers = ['name', 'status', 'platform', 'total_sent', 'open_count', 'reply_count', 'bounce_rate', 'paused_reason'];
                            const rows = selected.map(c => headers.map(h => { const v = (c as any)[h]; return v == null ? '' : String(v).includes(',') ? `"${v}"` : String(v); }).join(','));
                            const csv = [headers.join(','), ...rows].join('\n');
                            const blob = new Blob([csv], { type: 'text/csv' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a'); a.href = url; a.download = `campaigns-export-${new Date().toISOString().split('T')[0]}.csv`; a.click();
                            URL.revokeObjectURL(url);
                        }}
                        className="px-3 py-1.5 rounded-lg text-white text-[0.8rem] font-semibold flex items-center gap-1.5" style={{ border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.12)' }}
                    >
                        📥 Export CSV
                    </button>
                    <button onClick={() => { selectedCampaignIds.clear(); window.dispatchEvent(new Event('clear-selection')); }} className="px-2 py-1.5 rounded-lg text-white/60 hover:text-white text-xs">✕</button>
                </div>
            )}
        </div>
    );
}

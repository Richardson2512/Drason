'use client';
import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { RowLimitSelector } from '@/components/ui/RowLimitSelector';
import { ScoreBar } from '@/components/ui/ScoreBar';
import { StatBadge } from '@/components/ui/StatBadge';
import { apiClient } from '@/lib/api';
import { getStatusColors } from '@/lib/statusColors';
import BatchRecommendationsModal from '@/components/dashboard/BatchRecommendationsModal';

function LeadsPageContent() {
    const searchParams = useSearchParams();
    const [leads, setLeads] = useState<any[]>([]);
    const [selectedLead, setSelectedLead] = useState<any>(null);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [leadTab, setLeadTab] = useState('all');
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [selectedCampaignFilter, setSelectedCampaignFilter] = useState<string>('all');

    // Sorting & Filtering State
    const [sortBy, setSortBy] = useState('created_desc');
    const [minScore, setMinScore] = useState<string>('');
    const [maxScore, setMaxScore] = useState<string>('');
    const [hasEngagement, setHasEngagement] = useState<string>('all');

    // Modal State
    const [showSortModal, setShowSortModal] = useState(false);
    const [tempSortBy, setTempSortBy] = useState(sortBy);
    const [tempMinScore, setTempMinScore] = useState(minScore);
    const [tempMaxScore, setTempMaxScore] = useState(maxScore);
    const [tempHasEngagement, setTempHasEngagement] = useState(hasEngagement);

    // Pagination & Selection State
    const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
    const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());

    // Recommendations modal state
    const [showRecommendationsModal, setShowRecommendationsModal] = useState(false);

    // Score breakdown state
    const [scoreBreakdown, setScoreBreakdown] = useState<any>(null);
    const [scoreLoading, setScoreLoading] = useState(false);

    // Manual score refresh state
    const [scoringInProgress, setScoringInProgress] = useState(false);
    const [scoreRefreshResult, setScoreRefreshResult] = useState<any>(null);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');

    // Read URL parameters on mount
    useEffect(() => {
        const campaignId = searchParams.get('campaignId');
        const status = searchParams.get('status');

        if (campaignId) {
            setSelectedCampaignFilter(campaignId);
        }
        if (status) {
            setLeadTab(status);
        }
    }, [searchParams]);

    const fetchLeads = useCallback(async () => {
        const queryParams: any = {
            page: meta.page.toString(),
            limit: meta.limit.toString(),
            status: leadTab,
            sortBy
        };

        // Add campaign filter if not 'all'
        if (selectedCampaignFilter !== 'all') {
            queryParams.campaignId = selectedCampaignFilter;
        }

        // Add search query if present
        if (searchQuery.trim()) {
            queryParams.search = searchQuery.trim();
        }

        // Add score range filters
        if (minScore) {
            queryParams.minScore = minScore;
        }
        if (maxScore) {
            queryParams.maxScore = maxScore;
        }

        // Add engagement filter
        if (hasEngagement !== 'all') {
            queryParams.hasEngagement = hasEngagement;
        }

        const query = new URLSearchParams(queryParams);

        try {
            const data = await apiClient<any>(`/api/dashboard/leads?${query}`);
            if (data?.data) {
                setLeads(data.data);
                setMeta(data.meta);
                // Select first lead if none selected and leads exist
                if (data.data.length > 0 && !selectedLead) {
                    setSelectedLead(data.data[0]);
                }
            } else {
                // Fallback for old API response (should not happen after restart)
                if (Array.isArray(data)) {
                    setLeads(data);
                } else {
                    setLeads([]);
                }
            }
        } catch (err) {
            console.error('Failed to fetch leads:', err);
            setLeads([]);
        }
    }, [meta.page, meta.limit, leadTab, selectedCampaignFilter, searchQuery, sortBy, minScore, maxScore, hasEngagement, selectedLead]);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    // Fetch all campaigns for the filter dropdown
    useEffect(() => {
        apiClient<any>('/api/dashboard/campaigns?limit=1000')
            .then(data => {
                if (data?.data) {
                    setCampaigns(data.data);
                }
            })
            .catch(err => {
                console.error('Failed to fetch campaigns:', err);
                setCampaigns([]);
            });
    }, []);

    // Fetch logs when a lead is selected
    useEffect(() => {
        if (selectedLead) {
            apiClient<any[]>(`/api/dashboard/audit-logs?entity=lead&entity_id=${selectedLead.id}`)
                .then(setAuditLogs)
                .catch(err => {
                    console.error('Failed to fetch logs:', err);
                    setAuditLogs([]);
                });
        } else {
            setAuditLogs([]);
        }
    }, [selectedLead]);

    // Selection Logic
    const toggleLeadSelection = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const newSet = new Set(selectedLeadIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedLeadIds(newSet);
    };

    const toggleSelectAll = () => {
        const allPageIds = leads.map(l => l.id);
        const allSelected = allPageIds.every(id => selectedLeadIds.has(id));

        const newSet = new Set(selectedLeadIds);
        if (allSelected) {
            allPageIds.forEach(id => newSet.delete(id));
        } else {
            allPageIds.forEach(id => newSet.add(id));
        }
        setSelectedLeadIds(newSet);
    };

    const isAllSelected = leads.length > 0 && leads.every(l => selectedLeadIds.has(l.id));

    // Page Change
    const handlePageChange = (newPage: number) => {
        setMeta(prev => ({ ...prev, page: newPage }));
    };

    const handleLimitChange = (newLimit: number) => {
        setMeta(prev => ({ ...prev, limit: newLimit, page: 1 }));
    };

    const handleTabChange = (tab: string) => {
        setLeadTab(tab);
        setMeta(prev => ({ ...prev, page: 1 })); // Reset to page 1 on tab change
        setSelectedLead(null);
    };

    // Sort & Filter Modal Handlers
    const handleOpenSortModal = () => {
        // Sync temp state with current state
        setTempSortBy(sortBy);
        setTempMinScore(minScore);
        setTempMaxScore(maxScore);
        setTempHasEngagement(hasEngagement);
        setShowSortModal(true);
    };

    const handleApplySortFilter = () => {
        // Apply temp state to actual state
        setSortBy(tempSortBy);
        setMinScore(tempMinScore);
        setMaxScore(tempMaxScore);
        setHasEngagement(tempHasEngagement);
        setMeta(prev => ({ ...prev, page: 1 }));
        setShowSortModal(false);
    };

    const handleClearFilters = () => {
        // Clear all filters
        setTempSortBy('created_desc');
        setTempMinScore('');
        setTempMaxScore('');
        setTempHasEngagement('all');
        setSortBy('created_desc');
        setMinScore('');
        setMaxScore('');
        setHasEngagement('all');
        setMeta(prev => ({ ...prev, page: 1 }));
        setShowSortModal(false);
    };

    const handleCampaignFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCampaignFilter(e.target.value);
        setMeta(prev => ({ ...prev, page: 1 })); // Reset to page 1 on filter change
        setSelectedLead(null);
    };

    // Fetch score breakdown for selected lead
    const fetchScoreBreakdown = useCallback(async (leadId: string) => {
        setScoreLoading(true);
        try {
            const result = await apiClient<any>(`/api/leads/${leadId}/score-breakdown`);
            // apiClient already unwraps { success: true, data: X } -> X
            setScoreBreakdown(result);
        } catch (error) {
            console.error('Failed to fetch score breakdown:', error);
            setScoreBreakdown(null);
        } finally {
            setScoreLoading(false);
        }
    }, []);

    // Auto-load score breakdown when lead is selected
    useEffect(() => {
        if (selectedLead?.id) {
            fetchScoreBreakdown(selectedLead.id);
        } else {
            setScoreBreakdown(null);
        }
    }, [selectedLead?.id, fetchScoreBreakdown]);

    // Manual refresh all lead scores
    const handleRefreshScores = async () => {
        setScoringInProgress(true);
        setScoreRefreshResult(null);

        try {
            const result = await apiClient<any>('/api/leads/scoring/sync', {
                method: 'POST',
                timeout: 60000 // 1 minute timeout for scoring
            });

            setScoreRefreshResult(result);

            // Auto-dismiss after 5 seconds
            setTimeout(() => setScoreRefreshResult(null), 5000);

            // Refresh leads to show updated scores
            await fetchLeads();
        } catch (error: any) {
            console.error('Failed to refresh scores:', error);
            setScoreRefreshResult({ error: 'Failed to refresh scores' });
        } finally {
            setScoringInProgress(false);
        }
    };

    // Format relative time helper
    const formatRelativeTime = (dateString: string | null) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    // Deterministic Status Explanation Logic (Based on PRD System States)
    const getSystemNotice = (lead: any) => {
        if (lead.status === 'paused') {
            return { type: 'danger', title: 'System Pause', msg: 'Lead processing has been halted. This typically occurs when the associated mailbox or domain triggers a "Warning" or "Paused" health state due to bounce rates exceeding 2%.' };
        }
        if (lead.status === 'held') {
            return { type: 'warning', title: 'Holding Pool', msg: 'Lead is currently in the Holding Pool. It is waiting for the "Execution Gate" to verify mailbox capacity and domain health before transitioning to Active.' };
        }
        if (lead.status === 'active') {
            return { type: 'success', title: 'Active Execution', msg: 'Lead has passed all health checks and routed to a campaign. It is currently available for outreach by the external sender (Smartlead).' };
        }
        return null;
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const colors = getStatusColors(status);

        return (
            <span style={{
                ...colors,
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'inline-flex',
                alignItems: 'center',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}>
                {status}
            </span>
        );
    };

    return (
        <div style={{ display: 'flex', height: '100%', gap: '1rem' }}>
            {/* Left: Lead List */}
            <div className="premium-card" style={{ width: '420px', display: 'flex', flexDirection: 'column', padding: '1.5rem', height: '100%', overflow: 'hidden', borderRadius: '24px' }}>
                <div style={{ marginBottom: '1.5rem', flexShrink: 0 }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '1rem' }}>Leads</h2>

                    {/* Status Filter Tabs */}
                    <div style={{ flexShrink: 0, marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', background: '#F3F4F6', padding: '0.25rem', borderRadius: '12px' }}>
                            {['all', 'held', 'active', 'paused'].map(t => (
                                <button
                                    key={t}
                                    onClick={() => handleTabChange(t)}
                                    style={{
                                        padding: '0.375rem 0.75rem',
                                        borderRadius: '8px',
                                        background: leadTab === t ? '#FFFFFF' : 'transparent',
                                        color: leadTab === t ? '#111827' : '#6B7280',
                                        boxShadow: leadTab === t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        textTransform: 'capitalize',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Search Input */}
                    <div style={{ marginBottom: '1rem' }}>
                        <input
                            type="text"
                            placeholder="🔍 Search leads by email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.625rem 1rem',
                                border: '2px solid #E5E7EB',
                                borderRadius: '12px',
                                fontSize: '0.875rem',
                                outline: 'none',
                                transition: 'all 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                            onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                        />
                    </div>

                    {/* Score Refresh Result Banner */}
                    {scoreRefreshResult && !scoreRefreshResult.error && (
                        <div style={{
                            background: '#F0FDF4',
                            border: '1px solid #BBF7D0',
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            marginBottom: '1rem',
                            fontSize: '0.875rem',
                            color: '#166534',
                            fontWeight: 500
                        }}>
                            ✅ Updated {scoreRefreshResult.updated} lead scores
                        </div>
                    )}
                    {scoreRefreshResult && scoreRefreshResult.error && (
                        <div style={{
                            background: '#FEF2F2',
                            border: '1px solid #FECACA',
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            marginBottom: '1rem',
                            fontSize: '0.875rem',
                            color: '#991B1B',
                            fontWeight: 500
                        }}>
                            ❌ {scoreRefreshResult.error}
                        </div>
                    )}

                    {/* Campaign Filter Dropdown */}
                    <div style={{ marginBottom: '0.75rem' }}>
                        <label htmlFor="campaign-filter" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                            Filter by Campaign
                        </label>
                        <select
                            id="campaign-filter"
                            value={selectedCampaignFilter}
                            onChange={handleCampaignFilterChange}
                            style={{
                                width: '100%',
                                padding: '0.625rem 1rem',
                                borderRadius: '12px',
                                border: '1px solid #E5E7EB',
                                background: '#FFFFFF',
                                color: '#111827',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                outline: 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            <option value="all">All Campaigns</option>
                            {campaigns.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Sort & Filter Button */}
                    <div style={{ marginTop: '1rem' }}>
                        <button
                            onClick={handleOpenSortModal}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                borderRadius: '12px',
                                border: '1px solid #E5E7EB',
                                background: '#FFFFFF',
                                color: '#111827',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.2s'
                            }}
                            className="hover:bg-gray-50 hover:border-blue-300"
                        >
                            <span style={{ fontSize: '1rem' }}>⚙️</span>
                            Sort & Filter
                            {(sortBy !== 'created_desc' || minScore || maxScore || hasEngagement !== 'all') && (
                                <span style={{
                                    background: '#3B82F6',
                                    color: 'white',
                                    fontSize: '0.65rem',
                                    padding: '0.125rem 0.375rem',
                                    borderRadius: '999px',
                                    fontWeight: 700
                                }}>
                                    Active
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Selection Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 0.5rem 0.75rem 0.5rem', borderBottom: '1px solid #F3F4F6', marginBottom: '0.75rem' }}>
                    <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={toggleSelectAll}
                        style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#2563EB' }}
                    />
                    <span style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 500 }}>Select All ({leads.length})</span>
                </div>

                <div className="scrollbar-hide" style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.5rem' }}>
                    {leads.map(l => (
                        <div
                            key={l.id}
                            onClick={() => setSelectedLead(l)}
                            style={{
                                padding: '1rem',
                                borderRadius: '16px',
                                background: selectedLead?.id === l.id ? '#EFF6FF' : '#FFFFFF',
                                cursor: 'pointer',
                                border: '1px solid',
                                borderColor: selectedLead?.id === l.id ? '#BFDBFE' : '#F3F4F6',
                                borderLeft: l.status === 'paused' ? '4px solid #EF4444' : (selectedLead?.id === l.id ? '1px solid #BFDBFE' : '1px solid #F3F4F6'),
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                flexShrink: 0,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}
                            className="hover:shadow-md"
                        >
                            <input
                                type="checkbox"
                                checked={selectedLeadIds.has(l.id)}
                                onClick={(e) => toggleLeadSelection(e, l.id)}
                                onChange={() => { }} // Dummy handler to suppress generic warnings, handled by onClick
                                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#2563EB' }}
                            />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.9rem', color: '#1E293B' }}>{l.email}</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <span>Score:</span>
                                        <span style={{
                                            fontWeight: 700,
                                            padding: '2px 8px',
                                            borderRadius: '6px',
                                            fontSize: '0.7rem',
                                            background: l.lead_score >= 80 ? '#DCFCE7' :
                                                l.lead_score >= 60 ? '#FEF3C7' :
                                                    l.lead_score >= 40 ? '#FED7AA' : '#FEE2E2',
                                            color: l.lead_score >= 80 ? '#166534' :
                                                l.lead_score >= 60 ? '#92400E' :
                                                    l.lead_score >= 40 ? '#C2410C' : '#991B1B'
                                        }}>
                                            {l.lead_score}/100
                                        </span>
                                    </div>
                                    <div style={{
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                        padding: '2px 8px',
                                        borderRadius: '999px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        ...getStatusColors(l.status)
                                    }}>
                                        {l.status}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {leads.length === 0 && <div style={{ color: '#9CA3AF', textAlign: 'center', padding: '2rem', fontStyle: 'italic' }}>No leads found.</div>}
                </div>

                {/* Pagination Controls */}
                <div style={{ paddingTop: '1rem', borderTop: '1px solid #F3F4F6', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <RowLimitSelector limit={meta.limit} onLimitChange={handleLimitChange} />
                    <PaginationControls currentPage={meta.page} totalPages={meta.totalPages} onPageChange={handlePageChange} />
                </div>
            </div>

            {/* Right: Details */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {selectedLead ? (
                    <>
                        {/* Fixed Header */}
                        <div style={{ paddingRight: '1rem', paddingBottom: '0.5rem', flexShrink: 0 }}>
                            <div className="animate-fade-in">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                    <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#111827', letterSpacing: '-0.025em', margin: 0 }}>{selectedLead.email}</h1>
                                    <StatusBadge status={selectedLead.status} />
                                </div>
                                <div style={{ color: '#6B7280', fontSize: '0.875rem', fontFamily: 'monospace' }}>ID: {selectedLead.id}</div>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="scrollbar-hide" style={{ flex: 1, overflowY: 'auto', paddingRight: '1rem', paddingBottom: '2rem' }}>
                            <div className="animate-fade-in">
                                {/* SYSTEM STATUS EXPLANATION (Deterministic) */}
                                {(() => {
                                    const notice = getSystemNotice(selectedLead);
                                    if (notice) return (
                                        <div className="premium-card" style={{
                                            borderLeft: `6px solid ${notice.type === 'danger' ? '#EF4444' : (notice.type === 'warning' ? '#EAB308' : '#3B82F6')}`,
                                            background: notice.type === 'danger' ? '#FEF2F2' : (notice.type === 'warning' ? '#FFFBEB' : '#EFF6FF'),
                                            marginBottom: '2rem'
                                        }}>
                                            <h3 style={{ fontWeight: '700', marginBottom: '0.5rem', fontSize: '1.1rem', color: notice.type === 'danger' ? '#B91C1C' : (notice.type === 'warning' ? '#B45309' : '#1E40AF') }}>
                                                {notice.title}
                                            </h3>
                                            <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: notice.type === 'danger' ? '#7F1D1D' : (notice.type === 'warning' ? '#78350F' : '#1E3A8A') }}>
                                                {notice.msg}
                                            </p>
                                        </div>
                                    );
                                })()}

                                <div className="grid grid-cols-2 gap-6" style={{ marginBottom: '2rem' }}>
                                    <div className="premium-card">
                                        <h3 style={{ fontSize: '0.875rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6B7280', marginBottom: '1rem' }}>Lead Profile</h3>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <div style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '0.25rem' }}>Persona</div>
                                            <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1E293B' }}>{selectedLead.persona}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '0.25rem' }}>
                                                Engagement Score
                                                <span style={{ fontSize: '0.75rem', color: '#9CA3AF', marginLeft: '0.5rem' }}>
                                                    {selectedLead.lead_score >= 80 ? '🌟 Top Performer' :
                                                        selectedLead.lead_score >= 60 ? '✅ Engaged' :
                                                            selectedLead.lead_score >= 40 ? '😐 Moderate' : '⚠️ Low Activity'}
                                                </span>
                                            </div>
                                            <div style={{
                                                fontSize: '1.5rem',
                                                fontWeight: '700',
                                                color: selectedLead.lead_score >= 80 ? '#16A34A' :
                                                    selectedLead.lead_score >= 60 ? '#D97706' :
                                                        selectedLead.lead_score >= 40 ? '#F97316' : '#DC2626'
                                            }}>
                                                {selectedLead.lead_score} <span style={{ fontSize: '0.875rem', color: '#9CA3AF', fontWeight: '400' }}>/ 100</span>
                                            </div>
                                            <div style={{
                                                fontSize: '0.75rem',
                                                color: '#64748B',
                                                marginTop: '0.5rem',
                                                fontStyle: 'italic'
                                            }}>
                                                {selectedLead.source === 'smartlead'
                                                    ? 'Based on opens, clicks, replies & bounces'
                                                    : 'Initial score (will update after engagement)'}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '0.25rem' }}>Source</div>
                                            <div style={{ fontSize: '1rem', fontWeight: '500', color: '#1E293B' }}>{selectedLead.source}</div>
                                        </div>
                                    </div>

                                    {/* Activity Stats Section */}
                                    <div className="premium-card">
                                        <h3 style={{ fontSize: '0.875rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6B7280', marginBottom: '1rem' }}>Email Activity</h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                            <div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '0.25rem' }}>Sent</div>
                                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B' }}>{selectedLead.emails_sent || 0}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '0.25rem' }}>Opens</div>
                                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10B981' }}>{selectedLead.emails_opened || 0}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '0.25rem' }}>Clicks</div>
                                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#3B82F6' }}>{selectedLead.emails_clicked || 0}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '0.25rem' }}>Replies</div>
                                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#8B5CF6' }}>{selectedLead.emails_replied || 0}</div>
                                            </div>
                                        </div>
                                        {selectedLead.last_activity_at && (
                                            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #E5E7EB' }}>
                                                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                                                    Last Activity: {new Date(selectedLead.last_activity_at).toLocaleString()}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="premium-card">
                                        <h3 style={{ fontSize: '0.875rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6B7280', marginBottom: '1rem' }}>Execution Context</h3>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <div style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '0.25rem' }}>Assigned Campaign</div>
                                            <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#2563EB' }}>
                                                {selectedLead.campaign?.name || 'Unassigned'}
                                            </div>
                                            {selectedLead.campaign && (
                                                <div style={{ fontSize: '0.75rem', color: '#9CA3AF', fontFamily: 'monospace', marginTop: '0.25rem' }}>
                                                    ID: {selectedLead.campaign.id}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '0.25rem' }}>Internal Health</div>
                                            <div style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                background: selectedLead.health_state === 'healthy' ? '#DCFCE7' : '#FEE2E2',
                                                color: selectedLead.health_state === 'healthy' ? '#166534' : '#991B1B',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '999px',
                                                fontWeight: '600',
                                                fontSize: '0.875rem'
                                            }}>
                                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor' }}></span>
                                                {selectedLead.health_state.toUpperCase()}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Score Breakdown Section */}
                                {selectedLead.source === 'smartlead' && (
                                    <div className="premium-card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)', border: '2px solid #E2E8F0' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                📊 Score Breakdown
                                            </h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <button
                                                    onClick={handleRefreshScores}
                                                    disabled={scoringInProgress}
                                                    style={{
                                                        padding: '0.375rem 0.75rem',
                                                        background: scoringInProgress ? '#E5E7EB' : '#3B82F6',
                                                        color: 'white',
                                                        borderRadius: '8px',
                                                        border: 'none',
                                                        cursor: scoringInProgress ? 'not-allowed' : 'pointer',
                                                        fontSize: '0.7rem',
                                                        fontWeight: 600,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.375rem',
                                                        transition: 'all 0.2s',
                                                        opacity: scoringInProgress ? 0.7 : 1,
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                    className={scoringInProgress ? '' : 'hover:bg-blue-600'}
                                                >
                                                    {scoringInProgress ? (
                                                        <>
                                                            <span className="animate-spin">⏳</span>
                                                            Scoring...
                                                        </>
                                                    ) : (
                                                        <>
                                                            🎯 Refresh
                                                        </>
                                                    )}
                                                </button>
                                                <div style={{
                                                    fontSize: '2rem',
                                                    fontWeight: 800,
                                                    color: selectedLead.lead_score >= 80 ? '#16A34A' :
                                                        selectedLead.lead_score >= 60 ? '#D97706' :
                                                            selectedLead.lead_score >= 40 ? '#F97316' : '#DC2626'
                                                }}>
                                                    {selectedLead.lead_score || 0}
                                                </div>
                                            </div>
                                        </div>

                                        {scoreLoading ? (
                                            <div style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>
                                                <div className="animate-spin" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
                                                Loading breakdown...
                                            </div>
                                        ) : scoreBreakdown ? (
                                            <>
                                                {/* Visual breakdown bars */}
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                                                    <ScoreBar
                                                        label="Engagement"
                                                        value={scoreBreakdown.breakdown?.engagement || 0}
                                                        max={50}
                                                        color="#3B82F6"
                                                    />
                                                    <ScoreBar
                                                        label="Recency"
                                                        value={scoreBreakdown.breakdown?.recency || 0}
                                                        max={30}
                                                        color="#8B5CF6"
                                                    />
                                                    <ScoreBar
                                                        label="Frequency"
                                                        value={scoreBreakdown.breakdown?.frequency || 0}
                                                        max={20}
                                                        color="#EC4899"
                                                    />
                                                </div>

                                                {/* Engagement factors */}
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                                    <StatBadge
                                                        icon="👁️"
                                                        label="Opens"
                                                        value={scoreBreakdown.factors?.totalOpens || 0}
                                                    />
                                                    <StatBadge
                                                        icon="🖱️"
                                                        label="Clicks"
                                                        value={scoreBreakdown.factors?.totalClicks || 0}
                                                    />
                                                    <StatBadge
                                                        icon="💬"
                                                        label="Replies"
                                                        value={scoreBreakdown.factors?.totalReplies || 0}
                                                    />
                                                    <StatBadge
                                                        icon="🕐"
                                                        label="Last Active"
                                                        value={formatRelativeTime(scoreBreakdown.factors?.lastEngagement)}
                                                    />
                                                </div>

                                                <div style={{
                                                    marginTop: '1.5rem',
                                                    padding: '0.75rem 1rem',
                                                    background: 'white',
                                                    borderRadius: '8px',
                                                    fontSize: '0.75rem',
                                                    color: '#64748B',
                                                    fontStyle: 'italic',
                                                    border: '1px solid #E2E8F0'
                                                }}>
                                                    💡 Score is calculated from Smartlead engagement data. Higher engagement and recent activity increase the score.
                                                </div>
                                            </>
                                        ) : (
                                            <div style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>
                                                No engagement data available yet. Score will update after first interaction.
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="premium-card">
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: '#111827' }}>Activity Timeline</h2>
                                    {auditLogs.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            {auditLogs.map((log, index) => {
                                                // Get icon and color based on action
                                                const getEventStyle = (action: string) => {
                                                    // Email activities
                                                    if (action.includes('email_sent') || action === 'email_sent') {
                                                        return { icon: '📧', bg: '#EFF6FF', border: '#BFDBFE', color: '#1E40AF' };
                                                    }
                                                    if (action.includes('email_opened') || action.includes('opened')) {
                                                        return { icon: '👁️', bg: '#F0F9FF', border: '#BAE6FD', color: '#0369A1' };
                                                    }
                                                    if (action.includes('email_clicked') || action.includes('clicked')) {
                                                        return { icon: '🔗', bg: '#F0FDFA', border: '#99F6E4', color: '#0F766E' };
                                                    }
                                                    if (action.includes('email_replied') || action.includes('replied')) {
                                                        return { icon: '💬', bg: '#F0FDF4', border: '#BBF7D0', color: '#166534' };
                                                    }
                                                    // Negative events
                                                    if (action.includes('bounced') || action.includes('pause') || action.includes('block')) {
                                                        return { icon: '❌', bg: '#FEF2F2', border: '#FCA5A5', color: '#991B1B' };
                                                    }
                                                    // Lead routing
                                                    if (action.includes('route') || action.includes('assign')) {
                                                        return { icon: '🎯', bg: '#FAF5FF', border: '#E9D5FF', color: '#7C3AED' };
                                                    }
                                                    // Lead creation
                                                    if (action.includes('created') || action.includes('ingest')) {
                                                        return { icon: '✨', bg: '#FFFBEB', border: '#FDE68A', color: '#92400E' };
                                                    }
                                                    // Default
                                                    return { icon: '📋', bg: '#F8FAFC', border: '#E2E8F0', color: '#475569' };
                                                };

                                                const style = getEventStyle(log.action);
                                                const isFirst = index === 0;

                                                return (
                                                    <div
                                                        key={log.id}
                                                        style={{
                                                            background: style.bg,
                                                            border: `1px solid ${style.border}`,
                                                            borderRadius: '12px',
                                                            padding: '1rem',
                                                            position: 'relative',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        className="hover:shadow-md"
                                                    >
                                                        <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                                                            <div style={{
                                                                fontSize: '1.5rem',
                                                                flexShrink: 0,
                                                                width: '40px',
                                                                height: '40px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                background: '#FFFFFF',
                                                                borderRadius: '8px',
                                                                border: `2px solid ${style.border}`
                                                            }}>
                                                                {style.icon}
                                                            </div>
                                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                                                    <div>
                                                                        <div style={{ fontWeight: 700, color: style.color, fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                                                                            {log.action}
                                                                        </div>
                                                                        <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>
                                                                            {log.trigger}
                                                                        </div>
                                                                    </div>
                                                                    <div style={{ fontSize: '0.75rem', color: '#94A3B8', whiteSpace: 'nowrap', marginLeft: '1rem' }}>
                                                                        {new Date(log.timestamp).toLocaleString(undefined, {
                                                                            month: 'short',
                                                                            day: 'numeric',
                                                                            hour: '2-digit',
                                                                            minute: '2-digit'
                                                                        })}
                                                                    </div>
                                                                </div>
                                                                {log.details && (
                                                                    <div style={{
                                                                        fontSize: '0.875rem',
                                                                        color: '#475569',
                                                                        padding: '0.5rem 0.75rem',
                                                                        background: '#FFFFFF',
                                                                        borderRadius: '6px',
                                                                        border: '1px solid #E2E8F0',
                                                                        lineHeight: '1.5'
                                                                    }}>
                                                                        {log.details}
                                                                    </div>
                                                                )}
                                                                {isFirst && (
                                                                    <div style={{
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        gap: '0.25rem',
                                                                        fontSize: '0.7rem',
                                                                        fontWeight: 600,
                                                                        color: '#059669',
                                                                        background: '#D1FAE5',
                                                                        padding: '0.25rem 0.5rem',
                                                                        borderRadius: '4px',
                                                                        marginTop: '0.5rem'
                                                                    }}>
                                                                        <span>●</span> Latest Activity
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF', background: '#F8FAFC', borderRadius: '12px', border: '1px dashed #E2E8F0' }}>
                                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                                            <div style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '0.5rem' }}>No activity yet</div>
                                            <div style={{ fontSize: '0.875rem' }}>Events will appear here once the lead is processed</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9CA3AF', gap: '1rem' }}>
                        <div style={{ fontSize: '3rem' }}>👈</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: '500' }}>Select a lead to view full details</div>
                    </div>
                )}
            </div>

            {/* Sort & Filter Modal */}
            {showSortModal && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '1rem'
                    }}
                    onClick={() => setShowSortModal(false)}
                >
                    <div
                        style={{
                            background: '#FFFFFF',
                            borderRadius: '24px',
                            maxWidth: '500px',
                            width: '100%',
                            maxHeight: '90vh',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div style={{
                            padding: '1.5rem',
                            borderBottom: '1px solid #E5E7EB',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                                ⚙️ Sort & Filter Leads
                            </h2>
                            <button
                                onClick={() => setShowSortModal(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    color: '#9CA3AF',
                                    cursor: 'pointer',
                                    padding: '0.25rem',
                                    lineHeight: 1
                                }}
                            >
                                ×
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div style={{
                            padding: '1.5rem',
                            overflowY: 'auto',
                            flex: 1
                        }}>
                            {/* Sort By */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label htmlFor="modal-sort-by" style={{
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    color: '#374151',
                                    marginBottom: '0.5rem'
                                }}>
                                    Sort By
                                </label>
                                <select
                                    id="modal-sort-by"
                                    value={tempSortBy}
                                    onChange={(e) => setTempSortBy(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '12px',
                                        border: '1px solid #D1D5DB',
                                        background: '#FFFFFF',
                                        color: '#111827',
                                        fontSize: '0.875rem',
                                        cursor: 'pointer',
                                        outline: 'none'
                                    }}
                                >
                                    <option value="created_desc">Newest First</option>
                                    <option value="created_asc">Oldest First</option>
                                    <option value="email_asc">Email (A-Z)</option>
                                    <option value="email_desc">Email (Z-A)</option>
                                    <option value="score_desc">Score (High to Low)</option>
                                    <option value="score_asc">Score (Low to High)</option>
                                    <option value="activity_desc">Recently Active</option>
                                    <option value="activity_asc">Least Active</option>
                                </select>
                            </div>

                            {/* Score Range */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    color: '#374151',
                                    marginBottom: '0.5rem'
                                }}>
                                    Lead Score Range
                                </label>
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    <input
                                        type="number"
                                        placeholder="Min (0)"
                                        value={tempMinScore}
                                        onChange={(e) => setTempMinScore(e.target.value)}
                                        min="0"
                                        max="100"
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem 1rem',
                                            borderRadius: '12px',
                                            border: '1px solid #D1D5DB',
                                            background: '#FFFFFF',
                                            color: '#111827',
                                            fontSize: '0.875rem',
                                            outline: 'none'
                                        }}
                                    />
                                    <span style={{ color: '#6B7280', fontSize: '1rem', fontWeight: 500 }}>→</span>
                                    <input
                                        type="number"
                                        placeholder="Max (100)"
                                        value={tempMaxScore}
                                        onChange={(e) => setTempMaxScore(e.target.value)}
                                        min="0"
                                        max="100"
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem 1rem',
                                            borderRadius: '12px',
                                            border: '1px solid #D1D5DB',
                                            background: '#FFFFFF',
                                            color: '#111827',
                                            fontSize: '0.875rem',
                                            outline: 'none'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Engagement Filter */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label htmlFor="modal-engagement" style={{
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    color: '#374151',
                                    marginBottom: '0.5rem'
                                }}>
                                    Has Engagement
                                </label>
                                <select
                                    id="modal-engagement"
                                    value={tempHasEngagement}
                                    onChange={(e) => setTempHasEngagement(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '12px',
                                        border: '1px solid #D1D5DB',
                                        background: '#FFFFFF',
                                        color: '#111827',
                                        fontSize: '0.875rem',
                                        cursor: 'pointer',
                                        outline: 'none'
                                    }}
                                >
                                    <option value="all">All Leads</option>
                                    <option value="yes">With Engagement (Opens/Clicks/Replies)</option>
                                    <option value="no">No Engagement Yet</option>
                                </select>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div style={{
                            padding: '1.5rem',
                            borderTop: '1px solid #E5E7EB',
                            display: 'flex',
                            gap: '0.75rem'
                        }}>
                            <button
                                onClick={handleClearFilters}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem 1rem',
                                    borderRadius: '12px',
                                    border: '1px solid #D1D5DB',
                                    background: '#FFFFFF',
                                    color: '#374151',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                className="hover:bg-gray-50"
                            >
                                Clear All
                            </button>
                            <button
                                onClick={handleApplySortFilter}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem 1rem',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: '#3B82F6',
                                    color: '#FFFFFF',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                className="hover:bg-blue-600"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Action Bar for Multi-Select */}
            {selectedLeadIds.size >= 2 && (
                <div style={{
                    position: 'fixed',
                    bottom: '2rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 50,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                    borderRadius: '16px',
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1)',
                }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#FFFFFF' }}>
                        {selectedLeadIds.size} leads selected
                    </span>
                    <button
                        onClick={() => setShowRecommendationsModal(true)}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '10px',
                            border: '1px solid rgba(255,255,255,0.3)',
                            background: 'rgba(255,255,255,0.15)',
                            color: '#FFFFFF',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                    >
                        Get Campaign Recommendations
                    </button>
                    <button
                        onClick={() => setSelectedLeadIds(new Set())}
                        style={{
                            padding: '0.5rem 0.75rem',
                            borderRadius: '10px',
                            border: 'none',
                            background: 'rgba(255,255,255,0.1)',
                            color: 'rgba(255,255,255,0.8)',
                            fontSize: '0.8rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                    >
                        Clear
                    </button>
                </div>
            )}

            <BatchRecommendationsModal
                isOpen={showRecommendationsModal}
                onClose={() => setShowRecommendationsModal(false)}
                leadIds={Array.from(selectedLeadIds)}
                leads={leads.filter(l => selectedLeadIds.has(l.id)).map(l => ({ id: l.id, email: l.email }))}
            />
        </div>
    );
}

export default function LeadsPage() {
    return (
        <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6B7280' }}>Loading leads...</div>}>
            <LeadsPageContent />
        </Suspense>
    );
}

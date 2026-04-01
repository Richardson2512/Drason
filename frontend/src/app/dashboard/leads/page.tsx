'use client';
import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import type { Lead, AuditLog, CampaignSummary, ScoreBreakdown, ScoreRefreshResult } from '@/types/api';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { useSortFilterModal } from '@/hooks/useSortFilterModal';
import { usePagination } from '@/hooks/usePagination';
import { useCampaignList } from '@/hooks/useCampaignList';
import LeadSortFilterModal from '@/components/dashboard/leads/LeadSortFilterModal';
import LeadBulkActionBar from '@/components/dashboard/leads/LeadBulkActionBar';
import LeadListPanel from '@/components/dashboard/leads/LeadListPanel';
import LeadDetailPanel from '@/components/dashboard/leads/LeadDetailPanel';
import ValidationActivityPanel from '@/components/dashboard/leads/ValidationActivityPanel';
import { useEntityStats } from '@/hooks/useEntityStats';

function LeadsPageContent() {
    const searchParams = useSearchParams();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const initialLeadSelectionRef = useRef(false);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [leadTab, setLeadTab] = useState('all');
    const { campaigns } = useCampaignList();
    const entityStats = useEntityStats();
    const [selectedCampaignFilter, setSelectedCampaignFilter] = useState<string[]>([]);
    const [leadCampaigns, setLeadCampaigns] = useState<CampaignSummary[]>([]);

    // Sort & Filter via shared hook
    const sortFilter = useSortFilterModal({
        sortBy: 'created_desc',
        minScore: '',
        maxScore: '',
        hasEngagement: 'all',
        platform: 'all',
    });

    // Pagination & Selection via shared hook
    const { meta, setMeta, selectedIds: selectedLeadIds, setSelectedIds: setSelectedLeadIds, toggleSelection: toggleLeadSelection, toggleSelectAll, isAllSelected: computeIsAllSelected } = usePagination();

    // Score breakdown state
    const [scoreBreakdown, setScoreBreakdown] = useState<ScoreBreakdown | null>(null);
    const [scoreLoading, setScoreLoading] = useState(false);

    // Manual score refresh state
    const [scoringInProgress, setScoringInProgress] = useState(false);
    const [scoreRefreshResult, setScoreRefreshResult] = useState<ScoreRefreshResult | null>(null);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [validationExpanded, setValidationExpanded] = useState(false);

    // Read URL parameters on mount
    useEffect(() => {
        const campaignId = searchParams.get('campaignId');
        const status = searchParams.get('status');

        if (campaignId) {
            setSelectedCampaignFilter([campaignId]);
        }
        if (status) {
            setLeadTab(status);
        }
    }, [searchParams]);

    const fetchLeads = useCallback(async () => {
        const { sortBy, minScore, maxScore, hasEngagement, platform } = sortFilter.values;
        const queryParams: Record<string, string> = {
            page: meta.page.toString(),
            limit: meta.limit.toString(),
            status: leadTab,
            sortBy,
        };

        if (selectedCampaignFilter.length > 0) queryParams.campaignId = selectedCampaignFilter.join(',');
        if (searchQuery.trim()) queryParams.search = searchQuery.trim();
        if (minScore) queryParams.minScore = minScore;
        if (maxScore) queryParams.maxScore = maxScore;
        if (hasEngagement !== 'all') queryParams.hasEngagement = hasEngagement;
        if (platform && platform !== 'all') queryParams.platform = platform;

        const query = new URLSearchParams(queryParams);

        try {
            const data = await apiClient<{ data: Lead[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(`/api/dashboard/leads?${query}`);
            if (data?.data) {
                setLeads(data.data);
                setMeta(data.meta);
                if (data.data.length > 0 && !initialLeadSelectionRef.current) {
                    initialLeadSelectionRef.current = true;
                    setSelectedLead(data.data[0]);
                }
            } else {
                setLeads(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error('Failed to fetch leads:', err);
            setLeads([]);
        }
    }, [meta.page, meta.limit, leadTab, selectedCampaignFilter, searchQuery, sortFilter.values]);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    // Auto-refresh when infrastructure assessment completes
    useEffect(() => {
        const handler = () => fetchLeads();
        window.addEventListener('assessment-complete', handler);
        return () => window.removeEventListener('assessment-complete', handler);
    }, [fetchLeads]);

    // Fetch logs when a lead is selected
    useEffect(() => {
        if (selectedLead) {
            apiClient<AuditLog[]>(`/api/dashboard/audit-logs?entity=lead&entity_id=${selectedLead.id}`)
                .then(setAuditLogs)
                .catch(err => {
                    console.error('Failed to fetch logs:', err);
                    setAuditLogs([]);
                });
        } else {
            setAuditLogs([]);
        }
    }, [selectedLead]);

    const isAllSelected = computeIsAllSelected(leads);

    const handlePageChange = (newPage: number) => {
        setMeta(prev => ({ ...prev, page: newPage }));
    };

    const handleLimitChange = (newLimit: number) => {
        setMeta(prev => ({ ...prev, limit: newLimit, page: 1 }));
    };

    const handleTabChange = (tab: string) => {
        setLeadTab(tab);
        setMeta(prev => ({ ...prev, page: 1 }));
        setSelectedLead(null);
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

    const handleCampaignFilterChange = (selected: string[]) => {
        setSelectedCampaignFilter(selected);
        setMeta(prev => ({ ...prev, page: 1 }));
        setSelectedLead(null);
    };

    // Fetch score breakdown for selected lead
    const fetchScoreBreakdown = useCallback(async (leadId: string) => {
        setScoreLoading(true);
        try {
            const result = await apiClient<ScoreBreakdown>(`/api/leads/${leadId}/score-breakdown`);
            setScoreBreakdown(result);
        } catch (error) {
            console.error('Failed to fetch score breakdown:', error);
            setScoreBreakdown(null);
        } finally {
            setScoreLoading(false);
        }
    }, []);

    // Auto-load score breakdown and lead campaigns when lead is selected
    useEffect(() => {
        if (selectedLead?.id) {
            fetchScoreBreakdown(selectedLead.id);
            apiClient<Record<string, any>>(`/api/leads/${selectedLead.id}/campaigns`)
                .then(data => setLeadCampaigns(data?.all_campaigns || []))
                .catch(() => setLeadCampaigns([]));
        } else {
            setScoreBreakdown(null);
            setLeadCampaigns([]);
        }
    }, [selectedLead?.id, fetchScoreBreakdown]);

    // Manual refresh all lead scores
    const handleRefreshScores = async () => {
        setScoringInProgress(true);
        setScoreRefreshResult(null);

        try {
            const result = await apiClient<ScoreRefreshResult>('/api/leads/scoring/sync', {
                method: 'POST',
                timeout: 60000
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

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Validation Activity Panel */}
            <div className="shrink-0">
                <ValidationActivityPanel
                    isExpanded={validationExpanded}
                    onToggle={() => setValidationExpanded(!validationExpanded)}
                />
            </div>

            {/* Lead List + Detail */}
            <div className="flex flex-1 gap-4 min-h-0">
            {/* Left: Lead List */}
            <LeadListPanel
                leads={leads}
                selectedLead={selectedLead}
                onSelectLead={setSelectedLead}
                leadTab={leadTab}
                onTabChange={handleTabChange}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                scoreRefreshResult={scoreRefreshResult}
                campaigns={campaigns}
                selectedCampaignFilter={selectedCampaignFilter}
                onCampaignFilterChange={handleCampaignFilterChange}
                sortFilter={sortFilter}
                selectedLeadIds={selectedLeadIds}
                isAllSelected={isAllSelected}
                onToggleSelection={toggleLeadSelection}
                onToggleSelectAll={toggleSelectAll}
                meta={meta}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
                entityStats={entityStats?.leads}
            />

            {/* Right: Details */}
            <LeadDetailPanel
                lead={selectedLead}
                auditLogs={auditLogs}
                leadCampaigns={leadCampaigns}
                scoreBreakdown={scoreBreakdown}
                scoreLoading={scoreLoading}
                scoringInProgress={scoringInProgress}
                onRefreshScores={handleRefreshScores}
            />

            {/* Sort & Filter Modal */}
            <LeadSortFilterModal
                sortFilter={sortFilter}
                onApply={handleApplySortFilter}
                onClear={handleClearFilters}
            />

            {/* Floating Action Bar for Multi-Select */}
            <LeadBulkActionBar
                selectedLeadIds={selectedLeadIds}
                leads={leads}
                onClearSelection={() => setSelectedLeadIds(new Set())}
            />
            </div>
        </div>
    );
}

export default function LeadsPage() {
    return (
        <Suspense fallback={<div className="p-8"><LoadingSkeleton type="table" rows={10} /></div>}>
            <LeadsPageContent />
        </Suspense>
    );
}

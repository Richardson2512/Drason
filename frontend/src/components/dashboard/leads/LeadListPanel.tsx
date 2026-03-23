import type { Lead, ScoreRefreshResult, CampaignSummary } from '@/types/api';
import type { PaginationMeta } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { RowLimitSelector } from '@/components/ui/RowLimitSelector';
import { getStatusColors } from '@/lib/statusColors';
import { useSortFilterModal } from '@/hooks/useSortFilterModal';
import MultiSelectDropdown from '@/components/ui/MultiSelectDropdown';
import EntityStatsBar from '@/components/ui/EntityStatsBar';

interface LeadListPanelProps {
    leads: Lead[];
    selectedLead: Lead | null;
    onSelectLead: (lead: Lead) => void;
    leadTab: string;
    onTabChange: (tab: string) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    scoreRefreshResult: ScoreRefreshResult | null;
    campaigns: CampaignSummary[];
    selectedCampaignFilter: string[];
    onCampaignFilterChange: (selected: string[]) => void;
    sortFilter: ReturnType<typeof useSortFilterModal>;
    selectedLeadIds: Set<string>;
    isAllSelected: boolean;
    onToggleSelection: (e: React.MouseEvent, id: string) => void;
    onToggleSelectAll: (items: Lead[]) => void;
    meta: PaginationMeta;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
    entityStats?: { total: number; active: number; held: number; paused: number; bounced: number; invalid: number } | null;
}

export default function LeadListPanel({
    leads,
    selectedLead,
    onSelectLead,
    leadTab,
    onTabChange,
    searchQuery,
    onSearchChange,
    scoreRefreshResult,
    campaigns,
    selectedCampaignFilter,
    onCampaignFilterChange,
    sortFilter,
    selectedLeadIds,
    isAllSelected,
    onToggleSelection,
    onToggleSelectAll,
    meta,
    onPageChange,
    onLimitChange,
    entityStats,
}: LeadListPanelProps) {
    return (
        <div className="premium-card flex flex-col p-6 h-full overflow-hidden rounded-3xl" style={{ width: '420px' }}>
            <div className="mb-6 shrink-0">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Leads</h2>

                {/* Stats Breakdown */}
                {entityStats && (
                    <div className="mb-4">
                        <EntityStatsBar
                            total={entityStats.total}
                            stats={[
                                { label: 'Active', value: entityStats.active, color: '#22c55e' },
                                { label: 'Held', value: entityStats.held, color: '#3b82f6' },
                                { label: 'Paused', value: entityStats.paused, color: '#f59e0b' },
                                { label: 'Bounced', value: entityStats.bounced, color: '#ef4444' },
                                { label: 'Invalid', value: entityStats.invalid, color: '#6b7280' },
                            ]}
                        />
                    </div>
                )}

                {/* Status Filter Tabs */}
                <div className="shrink-0 mb-4">
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        {['all', 'held', 'active', 'paused', 'bounced', 'invalid'].map(t => (
                            <button
                                key={t}
                                onClick={() => onTabChange(t)}
                                className="px-3 py-1.5 rounded-lg border-none cursor-pointer text-xs font-semibold capitalize transition-all duration-200"
                                style={{
                                    background: leadTab === t ? '#FFFFFF' : 'transparent',
                                    color: leadTab === t ? '#111827' : '#6B7280',
                                    boxShadow: leadTab === t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                }}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Search Input */}
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search leads by email..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm outline-none transition-all duration-200 focus:border-blue-500"
                    />
                </div>

                {/* Score Refresh Result Banner */}
                {scoreRefreshResult && !scoreRefreshResult.error && (
                    <div className="bg-green-50 border border-green-200 px-4 py-3 rounded-lg mb-4 text-sm text-green-800 font-medium">
                        Updated {scoreRefreshResult.updated} lead scores
                    </div>
                )}
                {scoreRefreshResult && scoreRefreshResult.error && (
                    <div className="bg-red-50 border border-red-200 px-4 py-3 rounded-lg mb-4 text-sm text-red-800 font-medium">
                        {scoreRefreshResult.error}
                    </div>
                )}

                {/* Campaign Filter Dropdown */}
                <div className="mb-3">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                        Filter by Campaign
                    </label>
                    <MultiSelectDropdown
                        options={campaigns.map(c => ({ value: c.id, label: c.name }))}
                        selected={selectedCampaignFilter}
                        onChange={onCampaignFilterChange}
                        placeholder="All Campaigns"
                    />
                </div>

                {/* Sort & Filter Button */}
                <div className="mt-4">
                    <button
                        onClick={sortFilter.open}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm font-semibold cursor-pointer flex items-center justify-center gap-2 transition-all duration-200 hover:bg-gray-50 hover:border-blue-300"
                    >
                        <span className="text-base">Sort & Filter</span>
                        {sortFilter.hasActiveFilters && (
                            <span className="bg-blue-500 text-white text-[0.65rem] px-1.5 py-0.5 rounded-full font-bold">
                                Active
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Selection Header */}
            <div className="flex items-center gap-3 px-2 pb-3 border-b border-gray-100 mb-3">
                <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={() => onToggleSelectAll(leads)}
                    className="w-4 h-4 cursor-pointer accent-blue-600"
                />
                <span className="text-[0.8rem] text-gray-500 font-medium">Select All ({leads.length})</span>
            </div>

            <div className="scrollbar-hide overflow-y-auto flex-1 flex flex-col gap-3 pr-2">
                {leads.map(l => (
                    <div
                        key={l.id}
                        onClick={() => onSelectLead(l)}
                        className="p-4 rounded-2xl cursor-pointer border shrink-0 flex items-center gap-3 transition-all duration-200 hover:shadow-md"
                        style={{
                            background: selectedLead?.id === l.id ? '#EFF6FF' : '#FFFFFF',
                            borderColor: selectedLead?.id === l.id ? '#BFDBFE' : '#F3F4F6',
                            borderLeft: l.status === 'paused' ? '4px solid #EF4444' : (selectedLead?.id === l.id ? '1px solid #BFDBFE' : '1px solid #F3F4F6'),
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={selectedLeadIds.has(l.id)}
                            onClick={(e) => onToggleSelection(e, l.id)}
                            onChange={() => { }}
                            className="w-4 h-4 cursor-pointer accent-blue-600"
                        />
                        <div className="flex-1">
                            <div className="font-semibold mb-1 text-[0.9rem] text-slate-800">{l.email}</div>
                            <div className="flex justify-between items-center">
                                <div className="text-xs text-slate-500 flex items-center gap-1">
                                    <span>Score:</span>
                                    <span className="font-bold px-2 py-0.5 rounded-md text-[0.7rem]" style={{
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
                                <div className="text-[0.7rem] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide" style={getStatusColors(l.status)}>
                                    {l.status}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {leads.length === 0 && <div className="text-gray-400 text-center p-8 italic">No leads found.</div>}
            </div>

            {/* Pagination Controls */}
            <div className="pt-4 border-t border-gray-100 mt-auto flex justify-between items-center">
                <RowLimitSelector limit={meta.limit} onLimitChange={onLimitChange} />
                <PaginationControls currentPage={meta.page} totalPages={meta.totalPages} onPageChange={onPageChange} />
            </div>
        </div>
    );
}

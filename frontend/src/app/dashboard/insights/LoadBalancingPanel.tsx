'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { RowLimitSelector } from '@/components/ui/RowLimitSelector';
import MultiSelectDropdown from '@/components/ui/MultiSelectDropdown';
import CustomSelect from '@/components/ui/CustomSelect';
import type { MailboxLoad, LoadBalancingSuggestion, LoadBalancingReport } from '@/types/api';

type SortField = 'total_sent' | 'effective_load' | 'campaign_count' | 'bounce_rate' | 'engagement_rate' | 'health_score' | 'email';
type SortDir = 'asc' | 'desc';

export default function LoadBalancingPage() {
    const router = useRouter();
    const [report, setReport] = useState<LoadBalancingReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);

    // Distribution table sort & filter
    const [sortField, setSortField] = useState<SortField>('total_sent');
    const [sortDir, setSortDir] = useState<SortDir>('desc');
    const [filterStatus, setFilterStatus] = useState<string[]>([]);
    const [filterCategory, setFilterCategory] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchReport = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiClient<{ success: boolean; report: LoadBalancingReport }>(
                '/api/dashboard/campaigns/load-balancing'
            );
            setReport(data?.report || data as unknown as LoadBalancingReport);
        } catch (err: any) {
            console.error('Failed to fetch load balancing report', err);
            setError('Failed to load load balancing report.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, []);

    const applySuggestion = async (suggestion: LoadBalancingSuggestion) => {
        setApplying(suggestion.mailbox_id);
        try {
            await apiClient('/api/dashboard/campaigns/load-balancing/apply', {
                method: 'POST',
                body: JSON.stringify({ suggestion })
            });
            // Refresh report after applying
            await fetchReport();
        } catch (err: any) {
            console.error('Failed to apply suggestion', err);
            alert(`Failed to apply suggestion: ${err.message}`);
        } finally {
            setApplying(null);
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'overloaded': return '#DC2626';
            case 'optimal': return '#16A34A';
            case 'underutilized': return '#F59E0B';
            default: return '#6B7280';
        }
    };

    const getCategoryBg = (category: string) => {
        switch (category) {
            case 'overloaded': return '#FEE2E2';
            case 'optimal': return '#DCFCE7';
            case 'underutilized': return '#FEF3C7';
            default: return '#F3F4F6';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return '#DC2626';
            case 'medium': return '#F59E0B';
            case 'low': return '#6B7280';
            default: return '#6B7280';
        }
    };

    const getPriorityBg = (priority: string) => {
        switch (priority) {
            case 'high': return '#FEE2E2';
            case 'medium': return '#FEF3C7';
            case 'low': return '#F3F4F6';
            default: return '#F3F4F6';
        }
    };

    if (loading) {
        return (
            <div className="p-8">
                <LoadingSkeleton type="card" rows={3} />
            </div>
        );
    }

    if (error || !report) {
        return (
            <div className="p-8">
                <div className="p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg">
                    {error || 'Failed to load report'}
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 flex flex-col gap-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Mailbox Load Balancing</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Analyze mailbox-campaign distribution and optimize for better redundancy and performance.
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mb-8">
                <div className="p-6 bg-white border border-gray-200 rounded-xl">
                    <div className="text-sm text-gray-500 mb-2">Total Mailboxes</div>
                    <div className="text-[2rem] font-bold text-gray-900">{report.summary.total_mailboxes}</div>
                </div>
                <div className="p-6 bg-white border border-gray-200 rounded-xl">
                    <div className="text-sm text-gray-500 mb-2">Total Campaigns</div>
                    <div className="text-[2rem] font-bold text-gray-900">{report.summary.total_campaigns}</div>
                </div>
                <div className="p-6 bg-red-100 border border-red-300 rounded-xl">
                    <div className="text-sm text-red-900 mb-2">Overloaded</div>
                    <div className="text-[2rem] font-bold text-red-600">{report.summary.overloaded_mailboxes}</div>
                </div>
                <div className="p-6 bg-green-100 border border-green-300 rounded-xl">
                    <div className="text-sm text-green-900 mb-2">Optimal</div>
                    <div className="text-[2rem] font-bold text-green-600">{report.summary.optimal_mailboxes}</div>
                </div>
                <div className="p-6 bg-amber-100 border border-amber-300 rounded-xl">
                    <div className="text-sm text-amber-900 mb-2">Underutilized</div>
                    <div className="text-[2rem] font-bold text-amber-500">{report.summary.underutilized_mailboxes}</div>
                </div>
                <div className="p-6 bg-white border border-gray-200 rounded-xl">
                    <div className="text-sm text-gray-500 mb-2">Avg Campaigns/Mailbox</div>
                    <div className="text-[2rem] font-bold text-gray-900">{report.summary.avg_campaigns_per_mailbox}</div>
                </div>
            </div>

            {/* Health Warnings — show top 5, scrollable */}
            {report.health_warnings.length > 0 && (
                <div className="p-4 bg-amber-100 border border-amber-300 rounded-lg mb-8">
                    <div className="text-sm font-semibold text-amber-800 mb-2">
                        ⚠️ Health Warnings ({report.health_warnings.length})
                    </div>
                    <ul className="m-0 pl-5 text-amber-800 text-sm max-h-[160px] overflow-y-auto">
                        {report.health_warnings.map((warning, idx) => (
                            <li key={idx} className="mb-1">{warning}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Suggestions — show top 3 preview with link to full page */}
            {report.suggestions.length > 0 ? (
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">
                            Optimization Suggestions ({report.suggestions.length})
                        </h2>
                        {report.suggestions.length > 3 && (
                            <button
                                onClick={() => router.push('/dashboard/load-balancing/suggestions')}
                                className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-blue-100"
                            >
                                View All ({report.suggestions.length})
                            </button>
                        )}
                    </div>
                    <div className="flex flex-col gap-4">
                        {report.suggestions.slice(0, 3).map((suggestion, idx) => (
                            <div
                                key={idx}
                                className="p-5 bg-white border border-gray-200 rounded-xl cursor-pointer transition-all duration-200 hover:border-blue-300 hover:shadow-md"
                                onClick={() => router.push(`/dashboard/load-balancing/suggestions?highlight=${idx}`)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span
                                                className="py-1 px-3 text-xs font-semibold rounded-xl uppercase"
                                                style={{
                                                    background: getPriorityBg(suggestion.priority),
                                                    color: getPriorityColor(suggestion.priority)
                                                }}
                                            >
                                                {suggestion.priority} Priority
                                            </span>
                                            <span className="py-1 px-3 bg-blue-50 text-blue-800 text-xs font-semibold rounded-xl">
                                                {suggestion.type.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-700">
                                            <strong>{suggestion.mailbox_email}</strong>
                                            {suggestion.from_campaign_name && <span className="text-gray-400"> &middot; {suggestion.from_campaign_name}</span>}
                                        </div>
                                    </div>
                                    <span className="text-gray-400 text-lg ml-3">&rarr;</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    {report.suggestions.length <= 3 && (
                        <div className="mt-3 text-center">
                            <button
                                onClick={() => router.push('/dashboard/load-balancing/suggestions')}
                                className="text-sm text-blue-600 font-semibold bg-transparent border-none cursor-pointer hover:underline"
                            >
                                View Details
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="p-8 text-center bg-gray-50 border border-gray-200 rounded-xl mb-8">
                    <div className="text-base text-green-600 font-semibold mb-2">
                        No optimization needed
                    </div>
                    <div className="text-sm text-gray-500">
                        Your mailbox distribution is already well-balanced!
                    </div>
                </div>
            )}

            {/* Mailbox Distribution Table */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Mailbox Distribution
                </h2>

                {/* Filters & Sort Controls */}
                <div className="flex flex-wrap items-end gap-3 mb-4">
                    <div className="flex-1 min-w-[200px]">
                        <input
                            type="text"
                            placeholder="Search by email..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm outline-none bg-white"
                        />
                    </div>
                    <div className="min-w-[150px]">
                        <MultiSelectDropdown
                            options={[
                                { value: 'healthy', label: 'Healthy' },
                                { value: 'warning', label: 'Warning' },
                                { value: 'paused', label: 'Paused' },
                            ]}
                            selected={filterStatus}
                            onChange={(v) => { setFilterStatus(v); setPage(1); }}
                            placeholder="All Status"
                        />
                    </div>
                    <div className="min-w-[170px]">
                        <MultiSelectDropdown
                            options={[
                                { value: 'overloaded', label: 'Overloaded' },
                                { value: 'optimal', label: 'Optimal' },
                                { value: 'underutilized', label: 'Underutilized' },
                            ]}
                            selected={filterCategory}
                            onChange={(v) => { setFilterCategory(v); setPage(1); }}
                            placeholder="All Categories"
                        />
                    </div>
                    <div className="min-w-[220px]">
                        <CustomSelect
                            value={`${sortField}_${sortDir}`}
                            onChange={(v) => {
                                const [f, d] = v.split('_') as [SortField, SortDir];
                                setSortField(f);
                                setSortDir(d);
                                setPage(1);
                            }}
                            options={[
                                { value: 'total_sent_desc', label: 'Total Sent (High-Low)' },
                                { value: 'total_sent_asc', label: 'Total Sent (Low-High)' },
                                { value: 'effective_load_desc', label: 'Effective Load (High-Low)' },
                                { value: 'effective_load_asc', label: 'Effective Load (Low-High)' },
                                { value: 'campaign_count_desc', label: 'Campaigns (High-Low)' },
                                { value: 'campaign_count_asc', label: 'Campaigns (Low-High)' },
                                { value: 'bounce_rate_desc', label: 'Bounce Rate (High-Low)' },
                                { value: 'bounce_rate_asc', label: 'Bounce Rate (Low-High)' },
                                { value: 'engagement_rate_desc', label: 'Engagement (High-Low)' },
                                { value: 'engagement_rate_asc', label: 'Engagement (Low-High)' },
                                { value: 'health_score_desc', label: 'Health Score (High-Low)' },
                                { value: 'health_score_asc', label: 'Health Score (Low-High)' },
                                { value: 'email_asc', label: 'Email (A-Z)' },
                                { value: 'email_desc', label: 'Email (Z-A)' },
                            ]}
                        />
                    </div>
                    <RowLimitSelector limit={limit} onLimitChange={(l) => { setLimit(l); setPage(1); }} />
                </div>

                {(() => {
                    // Filter
                    let filtered = report.mailbox_distribution;
                    if (searchQuery.trim()) {
                        const q = searchQuery.trim().toLowerCase();
                        filtered = filtered.filter(m => m.email.toLowerCase().includes(q));
                    }
                    if (filterStatus.length > 0) {
                        filtered = filtered.filter(m => filterStatus.includes(m.status));
                    }
                    if (filterCategory.length > 0) {
                        filtered = filtered.filter(m => filterCategory.includes(m.load_category));
                    }

                    // Sort
                    const sorted = [...filtered].sort((a, b) => {
                        let valA: number | string, valB: number | string;
                        if (sortField === 'email') {
                            valA = a.email.toLowerCase();
                            valB = b.email.toLowerCase();
                            return sortDir === 'asc' ? (valA < valB ? -1 : 1) : (valA > valB ? -1 : 1);
                        }
                        valA = a[sortField];
                        valB = b[sortField];
                        return sortDir === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
                    });

                    const totalPages = Math.ceil(sorted.length / limit);
                    const paginated = sorted.slice((page - 1) * limit, page * limit);

                    const handleHeaderSort = (field: SortField) => {
                        if (sortField === field) {
                            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                        } else {
                            setSortField(field);
                            setSortDir('desc');
                        }
                        setPage(1);
                    };

                    const SortIcon = ({ field }: { field: SortField }) => (
                        <span className="ml-1 text-[0.6rem] inline-block" style={{ opacity: sortField === field ? 1 : 0.3 }}>
                            {sortField === field ? (sortDir === 'asc' ? '▲' : '▼') : '▼'}
                        </span>
                    );

                    return (
                        <>
                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase cursor-pointer hover:text-gray-700 select-none" onClick={() => handleHeaderSort('email')}>
                                                Mailbox<SortIcon field="email" />
                                            </th>
                                            <th className="p-4 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                                            <th className="p-4 text-center text-xs font-semibold text-gray-500 uppercase cursor-pointer hover:text-gray-700 select-none" onClick={() => handleHeaderSort('campaign_count')}>
                                                Campaigns<SortIcon field="campaign_count" />
                                            </th>
                                            <th className="p-4 text-center text-xs font-semibold text-gray-500 uppercase cursor-pointer hover:text-gray-700 select-none" onClick={() => handleHeaderSort('effective_load')}>
                                                Eff. Load<SortIcon field="effective_load" />
                                            </th>
                                            <th className="p-4 text-center text-xs font-semibold text-gray-500 uppercase cursor-pointer hover:text-gray-700 select-none" onClick={() => handleHeaderSort('total_sent')}>
                                                Total Sent<SortIcon field="total_sent" />
                                            </th>
                                            <th className="p-4 text-center text-xs font-semibold text-gray-500 uppercase cursor-pointer hover:text-gray-700 select-none" onClick={() => handleHeaderSort('bounce_rate')}>
                                                Bounce Rate<SortIcon field="bounce_rate" />
                                            </th>
                                            <th className="p-4 text-center text-xs font-semibold text-gray-500 uppercase cursor-pointer hover:text-gray-700 select-none" onClick={() => handleHeaderSort('engagement_rate')}>
                                                Engagement<SortIcon field="engagement_rate" />
                                            </th>
                                            <th className="p-4 text-center text-xs font-semibold text-gray-500 uppercase">Load Category</th>
                                            <th className="p-4 text-center text-xs font-semibold text-gray-500 uppercase cursor-pointer hover:text-gray-700 select-none" onClick={() => handleHeaderSort('health_score')}>
                                                Health<SortIcon field="health_score" />
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginated.length === 0 ? (
                                            <tr>
                                                <td colSpan={9} className="p-8 text-center text-gray-400 italic">No mailboxes match your filters.</td>
                                            </tr>
                                        ) : paginated.map((mb, idx) => (
                                            <tr key={mb.id} style={{ borderBottom: idx < paginated.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                                                <td className="p-4 text-sm text-gray-900">{mb.email}</td>
                                                <td className="p-4 text-center">
                                                    <span
                                                        className={`py-1 px-3 text-xs font-semibold rounded-xl ${
                                                            mb.status === 'healthy'
                                                                ? 'bg-green-100 text-green-600'
                                                                : mb.status === 'warning'
                                                                    ? 'bg-amber-100 text-amber-600'
                                                                    : 'bg-red-100 text-red-600'
                                                        }`}
                                                    >
                                                        {mb.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center text-sm font-semibold text-gray-900">
                                                    {mb.campaign_count}
                                                </td>
                                                <td className="p-4 text-center text-sm font-semibold" style={{ color: mb.effective_load >= 3 ? '#DC2626' : mb.effective_load >= 1 ? '#16A34A' : '#F59E0B' }}>
                                                    {mb.effective_load.toFixed(2)}
                                                </td>
                                                <td className="p-4 text-center text-sm text-gray-500">
                                                    {mb.total_sent > 0 ? mb.total_sent.toLocaleString() : '—'}
                                                </td>
                                                <td className="p-4 text-center text-sm" style={{ color: mb.bounce_rate >= 3 ? '#DC2626' : mb.bounce_rate >= 2 ? '#D97706' : '#6B7280' }}>
                                                    {mb.total_sent > 0 ? `${mb.bounce_rate}%` : '—'}
                                                </td>
                                                <td className="p-4 text-center text-sm" style={{ color: mb.engagement_rate < 2 ? '#DC2626' : mb.engagement_rate < 5 ? '#D97706' : '#6B7280' }}>
                                                    {mb.total_sent > 0 ? `${mb.engagement_rate}%` : '—'}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span
                                                        className="py-1 px-3 text-xs font-semibold rounded-xl capitalize"
                                                        style={{
                                                            background: getCategoryBg(mb.load_category),
                                                            color: getCategoryColor(mb.load_category)
                                                        }}
                                                    >
                                                        {mb.load_category}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center text-sm text-gray-500">
                                                    {mb.health_score.toFixed(0)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {totalPages > 1 && (
                                <div className="mt-4">
                                    <PaginationControls
                                        currentPage={page}
                                        totalPages={totalPages}
                                        onPageChange={setPage}
                                    />
                                </div>
                            )}
                        </>
                    );
                })()}
            </div>
        </div>
    );
}

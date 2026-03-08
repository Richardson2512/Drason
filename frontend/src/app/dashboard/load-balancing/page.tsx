'use client';
import { useState, useEffect, useMemo } from 'react';
import { apiClient } from '@/lib/api';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { RowLimitSelector } from '@/components/ui/RowLimitSelector';
import type { MailboxLoad, LoadBalancingSuggestion, LoadBalancingReport } from '@/types/api';

export default function LoadBalancingPage() {
    const [report, setReport] = useState<LoadBalancingReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);

    const fetchReport = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiClient<{ success: boolean; report: LoadBalancingReport }>(
                '/api/dashboard/campaigns/load-balancing'
            );
            setReport(data.report);
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
        <div className="p-8 max-w-[1400px] mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    ⚖️ Mailbox Load Balancing
                </h1>
                <p className="text-sm text-gray-500">
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

            {/* Health Warnings */}
            {report.health_warnings.length > 0 && (
                <div className="p-4 bg-amber-100 border border-amber-300 rounded-lg mb-8">
                    <div className="text-sm font-semibold text-amber-800 mb-2">
                        ⚠️ Health Warnings
                    </div>
                    <ul className="m-0 pl-5 text-amber-800 text-sm">
                        {report.health_warnings.map((warning, idx) => (
                            <li key={idx}>{warning}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Suggestions */}
            {report.suggestions.length > 0 ? (
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                        📋 Optimization Suggestions ({report.suggestions.length})
                    </h2>
                    <div className="flex flex-col gap-4">
                        {report.suggestions.map((suggestion, idx) => (
                            <div
                                key={idx}
                                className="p-6 bg-white border border-gray-200 rounded-xl"
                            >
                                <div className="flex items-start justify-between mb-4">
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
                                        <div className="text-sm text-gray-700 mb-2">
                                            <strong>Mailbox:</strong> {suggestion.mailbox_email}
                                        </div>
                                        {suggestion.from_campaign_name && (
                                            <div className="text-sm text-gray-700 mb-2">
                                                <strong>From Campaign:</strong> {suggestion.from_campaign_name}
                                            </div>
                                        )}
                                        {suggestion.to_campaign_name && (
                                            <div className="text-sm text-gray-700 mb-2">
                                                <strong>To Campaign:</strong> {suggestion.to_campaign_name}
                                            </div>
                                        )}
                                    </div>
                                    {suggestion.type !== 'move_mailbox' && (
                                        <button
                                            onClick={() => applySuggestion(suggestion)}
                                            disabled={applying === suggestion.mailbox_id}
                                            className={`py-2 px-4 text-white border-none rounded-lg text-sm font-semibold ${
                                                applying === suggestion.mailbox_id
                                                    ? 'bg-blue-300 cursor-not-allowed'
                                                    : 'bg-blue-600 cursor-pointer'
                                            }`}
                                        >
                                            {applying === suggestion.mailbox_id ? 'Applying...' : 'Apply'}
                                        </button>
                                    )}
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg mb-3">
                                    <div className="text-sm text-gray-700 mb-2">
                                        <strong>Reason:</strong> {suggestion.reason}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        <strong>Impact:</strong> {suggestion.expected_impact}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="p-8 text-center bg-gray-50 border border-gray-200 rounded-xl mb-8">
                    <div className="text-base text-green-600 font-semibold mb-2">
                        ✅ No optimization needed
                    </div>
                    <div className="text-sm text-gray-500">
                        Your mailbox distribution is already well-balanced!
                    </div>
                </div>
            )}

            {/* Mailbox Distribution Table */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                        📊 Mailbox Distribution
                    </h2>
                    <RowLimitSelector limit={limit} onLimitChange={(l) => { setLimit(l); setPage(1); }} />
                </div>
                {(() => {
                    const sorted = [...report.mailbox_distribution].sort((a, b) => b.campaign_count - a.campaign_count);
                    const totalPages = Math.ceil(sorted.length / limit);
                    const paginated = sorted.slice((page - 1) * limit, page * limit);

                    return (
                        <>
                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Mailbox</th>
                                            <th className="p-4 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                                            <th className="p-4 text-center text-xs font-semibold text-gray-500 uppercase">Campaigns</th>
                                            <th className="p-4 text-center text-xs font-semibold text-gray-500 uppercase">Total Sent</th>
                                            <th className="p-4 text-center text-xs font-semibold text-gray-500 uppercase">Bounce Rate</th>
                                            <th className="p-4 text-center text-xs font-semibold text-gray-500 uppercase">Engagement</th>
                                            <th className="p-4 text-center text-xs font-semibold text-gray-500 uppercase">Load Category</th>
                                            <th className="p-4 text-center text-xs font-semibold text-gray-500 uppercase">Health Score</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginated.map((mb, idx) => (
                                            <tr key={mb.id} style={{ borderBottom: idx < paginated.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                                                <td className="p-4 text-sm text-gray-900">{mb.email}</td>
                                                <td className="p-4 text-center">
                                                    <span
                                                        className={`py-1 px-3 text-xs font-semibold rounded-xl ${
                                                            mb.status === 'healthy'
                                                                ? 'bg-green-100 text-green-600'
                                                                : 'bg-red-100 text-red-600'
                                                        }`}
                                                    >
                                                        {mb.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center text-sm font-semibold text-gray-900">
                                                    {mb.campaign_count}
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

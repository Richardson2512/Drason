'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import type { LoadBalancingReport, LoadBalancingSuggestion } from '@/types/api';

function getTypeLabel(type: string) {
    switch (type) {
        case 'move_mailbox': return 'Move Mailbox';
        case 'add_mailbox': return 'Add Mailbox';
        case 'remove_mailbox': return 'Remove Mailbox';
        default: return type.replace('_', ' ');
    }
}

function getTypeDescription(type: string) {
    switch (type) {
        case 'move_mailbox':
            return 'Redistribute this mailbox from an overloaded campaign to one that needs more senders. This balances the sending load and reduces the risk of reputation damage from over-concentration.';
        case 'add_mailbox':
            return 'Add an underutilized healthy mailbox to a campaign that has too few senders. This improves redundancy — if one mailbox gets paused, the campaign continues sending through others.';
        case 'remove_mailbox':
            return 'Remove an unhealthy mailbox from active campaigns to prevent deliverability damage. Unhealthy mailboxes with high bounce rates or connection failures can drag down the reputation of every campaign they touch.';
        default:
            return '';
    }
}

function getWhyExplanation(suggestion: LoadBalancingSuggestion) {
    switch (suggestion.type) {
        case 'move_mailbox':
            return `This mailbox is carrying a disproportionate share of sending load. When a single mailbox handles too many campaigns — especially campaigns with few other mailboxes — it becomes a single point of failure. If this mailbox gets paused due to bounces or reputation issues, all connected campaigns lose a sender simultaneously.`;
        case 'add_mailbox':
            return `Campaign "${suggestion.to_campaign_name}" currently has very few mailboxes. If even one mailbox gets paused due to health issues, the remaining mailboxes must absorb all the sending volume, increasing their individual bounce risk. Adding more mailboxes distributes the load and provides fault tolerance.`;
        case 'remove_mailbox':
            return `This mailbox has degraded health metrics (high bounce rate, connection failures, or low engagement). Continuing to send through an unhealthy mailbox damages the domain's sender reputation with inbox providers like Google and Microsoft, which can cause emails from ALL mailboxes on that domain to land in spam.`;
        default:
            return '';
    }
}

function getHowExplanation(suggestion: LoadBalancingSuggestion) {
    switch (suggestion.type) {
        case 'move_mailbox':
            return [
                'Identify an underutilized mailbox on the same domain with good health metrics',
                `Add the replacement mailbox to campaign "${suggestion.from_campaign_name}"`,
                'The overloaded mailbox remains in the campaign — this adds capacity rather than removing it',
                'Monitor bounce rates and engagement for both mailboxes over the next 24-48 hours',
            ];
        case 'add_mailbox':
            return [
                `Add mailbox "${suggestion.mailbox_email}" to campaign "${suggestion.to_campaign_name}" on the sending platform`,
                'The platform will automatically distribute new sends across all campaign mailboxes',
                'Existing leads in progress will continue through their current mailbox',
                'New leads will be assigned to the mailbox with the lightest current load',
            ];
        case 'remove_mailbox':
            return [
                `Remove mailbox "${suggestion.mailbox_email}" from campaign "${suggestion.from_campaign_name}" on the platform`,
                'Leads currently in-progress through this mailbox will stop receiving further sequence emails',
                'The mailbox enters the healing pipeline for monitoring and recovery',
                'Once health metrics recover (bounce rate drops, engagement improves), the mailbox can be re-added',
            ];
        default:
            return [];
    }
}

function getPriorityColor(priority: string) {
    switch (priority) {
        case 'high': return '#DC2626';
        case 'medium': return '#F59E0B';
        case 'low': return '#6B7280';
        default: return '#6B7280';
    }
}

function getPriorityBg(priority: string) {
    switch (priority) {
        case 'high': return '#FEE2E2';
        case 'medium': return '#FEF3C7';
        case 'low': return '#F3F4F6';
        default: return '#F3F4F6';
    }
}

function SuggestionsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const highlightIdx = searchParams.get('highlight') ? parseInt(searchParams.get('highlight')!) : null;

    const [report, setReport] = useState<LoadBalancingReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState<string | null>(null);
    const [expandedIdx, setExpandedIdx] = useState<number | null>(highlightIdx);

    useEffect(() => {
        apiClient<{ success: boolean; report: LoadBalancingReport }>(
            '/api/dashboard/campaigns/load-balancing'
        )
            .then(data => setReport(data.report))
            .catch(err => console.error('Failed to fetch report', err))
            .finally(() => setLoading(false));
    }, []);

    const applySuggestion = async (suggestion: LoadBalancingSuggestion) => {
        setApplying(suggestion.mailbox_id);
        try {
            await apiClient('/api/dashboard/campaigns/load-balancing/apply', {
                method: 'POST',
                body: JSON.stringify({ suggestion })
            });
            // Refresh
            const data = await apiClient<{ success: boolean; report: LoadBalancingReport }>(
                '/api/dashboard/campaigns/load-balancing'
            );
            setReport(data.report);
        } catch (err: any) {
            console.error('Failed to apply suggestion', err);
            alert(`Failed: ${err.message}`);
        } finally {
            setApplying(null);
        }
    };

    if (loading) {
        return <div className="p-8"><LoadingSkeleton type="card" rows={5} /></div>;
    }

    const suggestions = report?.suggestions || [];

    return (
        <div className="p-8 max-w-[1000px] mx-auto">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => router.push('/dashboard/load-balancing')}
                    className="text-sm text-blue-600 font-medium bg-transparent border-none cursor-pointer hover:underline mb-4 flex items-center gap-1"
                >
                    &larr; Back to Load Balancing
                </button>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Optimization Suggestions
                </h1>
                <p className="text-sm text-gray-500">
                    {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''} to improve your mailbox-campaign distribution.
                    Click any suggestion to see the full analysis.
                </p>
            </div>

            {suggestions.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 border border-gray-200 rounded-xl">
                    <div className="text-base text-green-600 font-semibold mb-2">
                        No optimization needed
                    </div>
                    <div className="text-sm text-gray-500">
                        Your mailbox distribution is already well-balanced!
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {suggestions.map((suggestion, idx) => {
                        const isExpanded = expandedIdx === idx;
                        return (
                            <div
                                key={idx}
                                className={`bg-white border rounded-xl transition-all duration-200 ${isExpanded ? 'border-blue-300 shadow-lg' : 'border-gray-200'}`}
                            >
                                {/* Collapsed header — always visible */}
                                <div
                                    className="p-5 cursor-pointer flex items-start justify-between"
                                    onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-sm font-bold text-gray-400 w-6">#{idx + 1}</span>
                                            <span
                                                className="py-1 px-3 text-xs font-semibold rounded-xl uppercase"
                                                style={{
                                                    background: getPriorityBg(suggestion.priority),
                                                    color: getPriorityColor(suggestion.priority)
                                                }}
                                            >
                                                {suggestion.priority}
                                            </span>
                                            <span className="py-1 px-3 bg-blue-50 text-blue-800 text-xs font-semibold rounded-xl">
                                                {getTypeLabel(suggestion.type)}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-900 font-semibold">
                                            {suggestion.mailbox_email}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {suggestion.from_campaign_name && <>From: {suggestion.from_campaign_name}</>}
                                            {suggestion.from_campaign_name && suggestion.to_campaign_name && <> &middot; </>}
                                            {suggestion.to_campaign_name && <>To: {suggestion.to_campaign_name}</>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 ml-4">
                                        {suggestion.type !== 'move_mailbox' && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); applySuggestion(suggestion); }}
                                                disabled={applying === suggestion.mailbox_id}
                                                className={`py-2 px-4 text-white border-none rounded-lg text-sm font-semibold ${
                                                    applying === suggestion.mailbox_id
                                                        ? 'bg-blue-300 cursor-not-allowed'
                                                        : 'bg-blue-600 cursor-pointer hover:bg-blue-700'
                                                }`}
                                            >
                                                {applying === suggestion.mailbox_id ? 'Applying...' : 'Apply'}
                                            </button>
                                        )}
                                        <span className={`text-gray-400 text-lg transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                                            &rsaquo;
                                        </span>
                                    </div>
                                </div>

                                {/* Expanded detail — What, Why, How */}
                                {isExpanded && (
                                    <div className="px-5 pb-5 border-t border-gray-100">
                                        {/* What */}
                                        <div className="mt-4 mb-5">
                                            <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">W</span>
                                                What
                                            </h3>
                                            <div className="ml-8 text-sm text-gray-700 leading-relaxed">
                                                <p className="mb-2">{getTypeDescription(suggestion.type)}</p>
                                                <div className="p-3 bg-gray-50 rounded-lg">
                                                    <div className="text-sm text-gray-700">
                                                        <strong>Mailbox:</strong> {suggestion.mailbox_email}
                                                    </div>
                                                    {suggestion.from_campaign_name && (
                                                        <div className="text-sm text-gray-700 mt-1">
                                                            <strong>From Campaign:</strong> {suggestion.from_campaign_name}
                                                        </div>
                                                    )}
                                                    {suggestion.to_campaign_name && (
                                                        <div className="text-sm text-gray-700 mt-1">
                                                            <strong>To Campaign:</strong> {suggestion.to_campaign_name}
                                                        </div>
                                                    )}
                                                    <div className="text-sm text-gray-500 mt-1">
                                                        <strong>Expected Impact:</strong> {suggestion.expected_impact}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Why */}
                                        <div className="mb-5">
                                            <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center">W</span>
                                                Why
                                            </h3>
                                            <div className="ml-8 text-sm text-gray-700 leading-relaxed">
                                                <p className="mb-2">{getWhyExplanation(suggestion)}</p>
                                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                                                    <strong>Root cause:</strong> {suggestion.reason}
                                                </div>
                                            </div>
                                        </div>

                                        {/* How */}
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                                <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center">H</span>
                                                How
                                            </h3>
                                            <div className="ml-8">
                                                <ol className="m-0 pl-5 text-sm text-gray-700 leading-relaxed flex flex-col gap-2">
                                                    {getHowExplanation(suggestion).map((step, i) => (
                                                        <li key={i}>{step}</li>
                                                    ))}
                                                </ol>
                                                {suggestion.type === 'move_mailbox' && (
                                                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                                                        This is a manual action — review the suggestion and use the platform UI or the add/remove mailbox actions to rebalance.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default function SuggestionsPage() {
    return (
        <Suspense fallback={<div className="p-8"><LoadingSkeleton type="card" rows={5} /></div>}>
            <SuggestionsContent />
        </Suspense>
    );
}

'use client';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import CustomSelect from '@/components/ui/CustomSelect';
import DatePicker from '@/components/ui/DatePicker';

const BOUNCE_TYPE_OPTIONS = [
    { value: 'all', label: 'All Types' },
    { value: 'hard_bounce', label: 'Hard Bounce' },
    { value: 'soft_bounce', label: 'Soft Bounce' },
];

interface BounceAnalyticsProps {
    mailboxId?: string;
    domainId?: string;
    campaignId?: string;
    showFilters?: boolean;
    /** Fallback stats from the mailbox model when BounceEvent records are sparse */
    mailboxStats?: {
        hard_bounce_count?: number;
        total_sent_count?: number;
        window_bounce_count?: number;
    };
}

interface BounceEvent {
    id: string;
    email_address: string;
    bounce_type: string;
    bounce_reason: string | null;
    bounced_at: string;
    mailbox_id: string | null;
    campaign_id: string | null;
    lead_id: string | null;
}

interface MailboxBreakdown {
    mailbox_id: string;
    mailbox_email: string;
    mailbox_status: string;
    bounce_count: number;
}

interface CampaignBreakdown {
    campaign_id: string;
    campaign_name: string;
    campaign_status: string;
    campaign_bounce_rate: number;
    bounce_count: number;
}

interface BounceReason {
    reason: string;
    count: number;
}

export default function BounceAnalytics({ mailboxId, domainId, campaignId, showFilters = false, mailboxStats }: BounceAnalyticsProps) {
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<Record<string, any> | null>(null);
    const [mailboxBreakdown, setMailboxBreakdown] = useState<MailboxBreakdown[]>([]);
    const [campaignBreakdown, setCampaignBreakdown] = useState<CampaignBreakdown[]>([]);
    const [bounceReasons, setBounceReasons] = useState<BounceReason[]>([]);
    const [recentBounces, setRecentBounces] = useState<BounceEvent[]>([]);

    // Filters
    const [bounceTypeFilter, setBounceTypeFilter] = useState<string>('all');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();

                if (mailboxId) params.append('mailbox_id', mailboxId);
                if (domainId) params.append('domain_id', domainId);
                if (campaignId) params.append('campaign_id', campaignId);
                if (bounceTypeFilter !== 'all') params.append('bounce_type', bounceTypeFilter);
                if (startDate) params.append('start_date', startDate);
                if (endDate) params.append('end_date', endDate);
                params.append('limit', '50');

                const data = await apiClient<Record<string, any>>(`/api/analytics/bounces?${params}`);
                // apiClient unwraps { success, data } → data is already the inner object
                // But handle both cases for safety
                const result = data?.data || data;
                if (result?.summary) {
                    setSummary(result.summary);
                    setMailboxBreakdown(result.mailbox_breakdown || []);
                    setCampaignBreakdown(result.campaign_breakdown || []);
                    setBounceReasons(result.bounce_reasons || []);
                    setRecentBounces(result.recent_bounces || []);
                }
            } catch (err) {
                console.error('Failed to fetch bounce analytics:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [mailboxId, domainId, campaignId, bounceTypeFilter, startDate, endDate]);

    if (loading) {
        return (
            <div className="premium-card">
                <h2 className="text-xl font-bold mb-3 text-gray-900">
                    Bounce Analytics
                </h2>
                <div className="p-8 text-center text-gray-400">
                    Loading analytics...
                </div>
            </div>
        );
    }

    if (!summary) {
        // Show mailbox-level stats as fallback when BounceEvent records don't exist
        if (mailboxStats && (mailboxStats.hard_bounce_count || 0) > 0) {
            const totalSent = mailboxStats.total_sent_count || 1;
            const bounceRate = ((mailboxStats.hard_bounce_count || 0) / totalSent * 100).toFixed(2);
            return (
                <div className="premium-card">
                    <h2 className="text-xl font-bold mb-3 text-gray-900">Bounce Analytics</h2>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                            <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Hard Bounces</div>
                            <div className="text-2xl font-bold text-red-600">{(mailboxStats.hard_bounce_count || 0).toLocaleString()}</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Bounce Rate</div>
                            <div className="text-2xl font-bold" style={{ color: parseFloat(bounceRate) >= 3 ? '#DC2626' : parseFloat(bounceRate) >= 2 ? '#D97706' : '#6B7280' }}>
                                {bounceRate}%
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Window Bounces</div>
                            <div className="text-2xl font-bold text-gray-900">{mailboxStats.window_bounce_count || 0}</div>
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-gray-400 text-center">
                        Detailed bounce event breakdown will appear after the next sync
                    </div>
                </div>
            );
        }

        return (
            <div className="premium-card">
                <h2 className="text-xl font-bold mb-3 text-gray-900">
                    Bounce Analytics
                </h2>
                <div className="p-8 text-center text-gray-400">
                    No bounce data available
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-3">
                <div className="premium-card">
                    <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">
                        Total Bounces
                    </h3>
                    <div className="text-4xl font-extrabold text-red-500">
                        {summary.total_bounces}
                    </div>
                </div>

                <div className="premium-card">
                    <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">
                        Hard Bounces
                    </h3>
                    <div className="text-4xl font-extrabold text-red-600">
                        {summary.hard_bounces}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                        {summary.hard_bounce_rate}
                    </div>
                </div>

                <div className="premium-card">
                    <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">
                        Soft Bounces
                    </h3>
                    <div className="text-4xl font-extrabold text-amber-500">
                        {summary.soft_bounces}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                        {summary.soft_bounce_rate}
                    </div>
                </div>
            </div>

            {/* Filters (if enabled) */}
            {showFilters && (
                <div className="premium-card">
                    <h3 className="text-base font-bold mb-4 text-gray-900">Filters</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-500 block mb-2">
                                Bounce Type
                            </label>
                            <CustomSelect
                                value={bounceTypeFilter}
                                onChange={setBounceTypeFilter}
                                options={BOUNCE_TYPE_OPTIONS}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500 block mb-2">
                                Start Date
                            </label>
                            <DatePicker
                                value={startDate}
                                onChange={setStartDate}
                                maxDate={endDate || undefined}
                                placeholder="Any"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500 block mb-2">
                                End Date
                            </label>
                            <DatePicker
                                value={endDate}
                                onChange={setEndDate}
                                minDate={startDate || undefined}
                                placeholder="Any"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Breakdowns */}
            <div className="grid grid-cols-2 gap-3">
                {/* Mailbox Breakdown */}
                {!mailboxId && mailboxBreakdown.length > 0 && (
                    <div className="premium-card">
                        <h3 className="text-base font-bold mb-4 text-gray-900">
                            Top Mailboxes by Bounces
                        </h3>
                        <div className="flex flex-col gap-3">
                            {mailboxBreakdown.slice(0, 5).map((mb) => (
                                <div
                                    key={mb.mailbox_id}
                                    className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center"
                                >
                                    <div>
                                        <div className="font-semibold text-slate-800 text-sm">
                                            {mb.mailbox_email}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1">
                                            Status: {mb.mailbox_status}
                                        </div>
                                    </div>
                                    <div className="font-bold text-xl text-red-500">
                                        {mb.bounce_count}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Campaign Breakdown */}
                {!campaignId && campaignBreakdown.length > 0 && (
                    <div className="premium-card">
                        <h3 className="text-base font-bold mb-4 text-gray-900">
                            Top Campaigns by Bounces
                        </h3>
                        <div className="flex flex-col gap-3">
                            {campaignBreakdown.slice(0, 5).map((c) => (
                                <div
                                    key={c.campaign_id}
                                    className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center"
                                >
                                    <div>
                                        <div className="font-semibold text-slate-800 text-sm">
                                            {c.campaign_name}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1">
                                            Bounce Rate: {c.campaign_bounce_rate.toFixed(2)}%
                                        </div>
                                    </div>
                                    <div className="font-bold text-xl text-red-500">
                                        {c.bounce_count}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Bounce Reasons */}
            {bounceReasons.length > 0 && (
                <div className="premium-card">
                    <h3 className="text-base font-bold mb-4 text-gray-900">
                        Top Bounce Reasons
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {bounceReasons.slice(0, 6).map((reason, idx) => (
                            <div
                                key={idx}
                                className="p-3 bg-red-50 rounded-lg border border-red-100"
                            >
                                <div className="text-sm text-red-900 mb-1">
                                    {reason.reason}
                                </div>
                                <div className="font-bold text-lg text-red-600">
                                    {reason.count} bounces
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Bounces */}
            {recentBounces.length > 0 && (
                <div className="premium-card">
                    <h3 className="text-base font-bold mb-4 text-gray-900">
                        Recent Bounce Events
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: '0' }}>
                            <thead>
                                <tr>
                                    <th className="p-3 text-left border-b-2 border-slate-200 text-xs font-bold text-slate-500 uppercase">Email</th>
                                    <th className="p-3 text-left border-b-2 border-slate-200 text-xs font-bold text-slate-500 uppercase">Type</th>
                                    <th className="p-3 text-left border-b-2 border-slate-200 text-xs font-bold text-slate-500 uppercase">Reason</th>
                                    <th className="p-3 text-left border-b-2 border-slate-200 text-xs font-bold text-slate-500 uppercase">Bounced At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentBounces.slice(0, 10).map((bounce) => (
                                    <tr key={bounce.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-3 border-b border-slate-100 text-sm text-slate-800 font-medium">
                                            {bounce.email_address}
                                        </td>
                                        <td className="p-3 border-b border-slate-100">
                                            <span className="py-1 px-3 rounded-full text-xs font-semibold" style={{
                                                background: bounce.bounce_type === 'hard_bounce' ? '#FEE2E2' : '#FEF3C7',
                                                color: bounce.bounce_type === 'hard_bounce' ? '#991B1B' : '#B45309'
                                            }}>
                                                {bounce.bounce_type.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="p-3 border-b border-slate-100 text-sm text-slate-500 max-w-[250px] truncate">
                                            {bounce.bounce_reason || 'N/A'}
                                        </td>
                                        <td className="p-3 border-b border-slate-100 text-sm text-slate-500 whitespace-nowrap">
                                            {new Date(bounce.bounced_at).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

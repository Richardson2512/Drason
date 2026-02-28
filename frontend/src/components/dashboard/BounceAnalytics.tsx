'use client';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';

interface BounceAnalyticsProps {
    mailboxId?: string;
    campaignId?: string;
    showFilters?: boolean;
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

export default function BounceAnalytics({ mailboxId, campaignId, showFilters = false }: BounceAnalyticsProps) {
    const [loading, setLoading] = useState(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                if (campaignId) params.append('campaign_id', campaignId);
                if (bounceTypeFilter !== 'all') params.append('bounce_type', bounceTypeFilter);
                if (startDate) params.append('start_date', startDate);
                if (endDate) params.append('end_date', endDate);
                params.append('limit', '50');

                const data = await apiClient<any>(`/api/analytics/bounces?${params}`);
                if (data?.data) {
                    setSummary(data.data.summary);
                    setMailboxBreakdown(data.data.mailbox_breakdown || []);
                    setCampaignBreakdown(data.data.campaign_breakdown || []);
                    setBounceReasons(data.data.bounce_reasons || []);
                    setRecentBounces(data.data.recent_bounces || []);
                }
            } catch (err) {
                console.error('Failed to fetch bounce analytics:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [mailboxId, campaignId, bounceTypeFilter, startDate, endDate]);

    if (loading) {
        return (
            <div className="premium-card">
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: '#111827' }}>
                    Bounce Analytics
                </h2>
                <div style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>
                    Loading analytics...
                </div>
            </div>
        );
    }

    if (!summary) {
        return (
            <div className="premium-card">
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: '#111827' }}>
                    Bounce Analytics
                </h2>
                <div style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>
                    No bounce data available
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-6">
                <div className="premium-card">
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#6B7280', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Total Bounces
                    </h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#EF4444' }}>
                        {summary.total_bounces}
                    </div>
                </div>

                <div className="premium-card">
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#6B7280', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Hard Bounces
                    </h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#DC2626' }}>
                        {summary.hard_bounces}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#9CA3AF', marginTop: '0.25rem' }}>
                        {summary.hard_bounce_rate}
                    </div>
                </div>

                <div className="premium-card">
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#6B7280', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Soft Bounces
                    </h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#F59E0B' }}>
                        {summary.soft_bounces}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#9CA3AF', marginTop: '0.25rem' }}>
                        {summary.soft_bounce_rate}
                    </div>
                </div>
            </div>

            {/* Filters (if enabled) */}
            {showFilters && (
                <div className="premium-card">
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#111827' }}>Filters</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#6B7280', display: 'block', marginBottom: '0.5rem' }}>
                                Bounce Type
                            </label>
                            <select
                                value={bounceTypeFilter}
                                onChange={(e) => setBounceTypeFilter(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.625rem 1rem',
                                    borderRadius: '12px',
                                    border: '1px solid #E5E7EB',
                                    background: '#FFFFFF',
                                    fontSize: '0.875rem',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="all">All Types</option>
                                <option value="hard_bounce">Hard Bounce</option>
                                <option value="soft_bounce">Soft Bounce</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#6B7280', display: 'block', marginBottom: '0.5rem' }}>
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.625rem 1rem',
                                    borderRadius: '12px',
                                    border: '1px solid #E5E7EB',
                                    background: '#FFFFFF',
                                    fontSize: '0.875rem'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#6B7280', display: 'block', marginBottom: '0.5rem' }}>
                                End Date
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.625rem 1rem',
                                    borderRadius: '12px',
                                    border: '1px solid #E5E7EB',
                                    background: '#FFFFFF',
                                    fontSize: '0.875rem'
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Breakdowns */}
            <div className="grid grid-cols-2 gap-6">
                {/* Mailbox Breakdown */}
                {!mailboxId && mailboxBreakdown.length > 0 && (
                    <div className="premium-card">
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#111827' }}>
                            Top Mailboxes by Bounces
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {mailboxBreakdown.slice(0, 5).map((mb) => (
                                <div
                                    key={mb.mailbox_id}
                                    style={{
                                        padding: '0.75rem',
                                        background: '#F8FAFC',
                                        borderRadius: '8px',
                                        border: '1px solid #E2E8F0',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 600, color: '#1E293B', fontSize: '0.875rem' }}>
                                            {mb.mailbox_email}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem' }}>
                                            Status: {mb.mailbox_status}
                                        </div>
                                    </div>
                                    <div style={{
                                        fontWeight: 700,
                                        fontSize: '1.25rem',
                                        color: '#EF4444'
                                    }}>
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
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#111827' }}>
                            Top Campaigns by Bounces
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {campaignBreakdown.slice(0, 5).map((c) => (
                                <div
                                    key={c.campaign_id}
                                    style={{
                                        padding: '0.75rem',
                                        background: '#F8FAFC',
                                        borderRadius: '8px',
                                        border: '1px solid #E2E8F0',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 600, color: '#1E293B', fontSize: '0.875rem' }}>
                                            {c.campaign_name}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem' }}>
                                            Bounce Rate: {c.campaign_bounce_rate.toFixed(2)}%
                                        </div>
                                    </div>
                                    <div style={{
                                        fontWeight: 700,
                                        fontSize: '1.25rem',
                                        color: '#EF4444'
                                    }}>
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
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#111827' }}>
                        Top Bounce Reasons
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                        {bounceReasons.slice(0, 6).map((reason, idx) => (
                            <div
                                key={idx}
                                style={{
                                    padding: '0.75rem',
                                    background: '#FEF2F2',
                                    borderRadius: '8px',
                                    border: '1px solid #FEE2E2'
                                }}
                            >
                                <div style={{ fontSize: '0.875rem', color: '#7F1D1D', marginBottom: '0.25rem' }}>
                                    {reason.reason}
                                </div>
                                <div style={{ fontWeight: 700, fontSize: '1.125rem', color: '#DC2626' }}>
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
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#111827' }}>
                        Recent Bounce Events
                    </h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #E2E8F0', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Email</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #E2E8F0', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Type</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #E2E8F0', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Reason</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #E2E8F0', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Bounced At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentBounces.slice(0, 10).map((bounce) => (
                                    <tr key={bounce.id} className="hover:bg-gray-50 transition-colors">
                                        <td style={{ padding: '0.75rem', borderBottom: '1px solid #F1F5F9', fontSize: '0.875rem', color: '#1E293B', fontWeight: 500 }}>
                                            {bounce.email_address}
                                        </td>
                                        <td style={{ padding: '0.75rem', borderBottom: '1px solid #F1F5F9' }}>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '999px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                background: bounce.bounce_type === 'hard_bounce' ? '#FEE2E2' : '#FEF3C7',
                                                color: bounce.bounce_type === 'hard_bounce' ? '#991B1B' : '#B45309'
                                            }}>
                                                {bounce.bounce_type.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.75rem', borderBottom: '1px solid #F1F5F9', fontSize: '0.875rem', color: '#64748B', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {bounce.bounce_reason || 'N/A'}
                                        </td>
                                        <td style={{ padding: '0.75rem', borderBottom: '1px solid #F1F5F9', fontSize: '0.875rem', color: '#64748B', whiteSpace: 'nowrap' }}>
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

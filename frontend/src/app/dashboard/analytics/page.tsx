'use client';
import { useEffect, useState, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { apiClient } from '@/lib/api';

interface DailyData {
    date: string;
    campaign_id: string | null;
    sent_count: number;
    open_count: number;
    click_count: number;
    reply_count: number;
    bounce_count: number;
    unsubscribe_count: number;
}

interface Campaign {
    id: string;
    name: string;
}

function formatShortDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getDefaultDates() {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
    };
}

export default function AnalyticsPage() {
    const defaults = getDefaultDates();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
    const [startDate, setStartDate] = useState(defaults.startDate);
    const [endDate, setEndDate] = useState(defaults.endDate);
    const [data, setData] = useState<DailyData[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        apiClient<any>('/api/dashboard/campaigns?limit=1000')
            .then(res => {
                const list = res?.data || res || [];
                setCampaigns(Array.isArray(list) ? list : []);
            })
            .catch(err => console.error('[Analytics] Failed to fetch campaigns', err));
    }, []);

    const fetchAnalytics = useCallback(async () => {
        if (!selectedCampaignId) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({
                campaign_id: selectedCampaignId,
                start_date: startDate,
                end_date: endDate,
            });
            const result = await apiClient<DailyData[]>(`/api/analytics/daily?${params}`);
            setData(Array.isArray(result) ? result : []);
        } catch {
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [selectedCampaignId, startDate, endDate]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    // Summary stats
    const totalSent = data.reduce((sum, d) => sum + d.sent_count, 0);
    const totalOpens = data.reduce((sum, d) => sum + d.open_count, 0);
    const totalReplies = data.reduce((sum, d) => sum + d.reply_count, 0);
    const totalBounces = data.reduce((sum, d) => sum + d.bounce_count, 0);
    const avgOpenRate = totalSent > 0 ? ((totalOpens / totalSent) * 100).toFixed(1) : '0.0';
    const avgReplyRate = totalSent > 0 ? ((totalReplies / totalSent) * 100).toFixed(1) : '0.0';

    const inputStyle = {
        padding: '0.625rem 1rem',
        borderRadius: '12px',
        border: '1px solid #E5E7EB',
        fontSize: '0.875rem',
        outline: 'none',
        background: '#FFFFFF',
        color: '#111827',
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Page Header */}
            <div>
                <h1 style={{ fontSize: '2.25rem', fontWeight: 700, color: '#111827', letterSpacing: '-0.025em' }}>Analytics</h1>
                <p style={{ fontSize: '1.125rem', color: '#6B7280', marginTop: '0.25rem' }}>Campaign performance trends</p>
            </div>

            {/* Filters */}
            <div className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Campaign</label>
                    <select
                        value={selectedCampaignId}
                        onChange={(e) => setSelectedCampaignId(e.target.value)}
                        style={{ ...inputStyle, width: '100%', cursor: 'pointer' }}
                    >
                        <option value="">Select a campaign...</option>
                        {campaigns.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Start Date</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inputStyle} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>End Date</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={inputStyle} />
                </div>
            </div>

            {/* Main Chart */}
            <div className="premium-card">
                {!selectedCampaignId ? (
                    <div style={{ height: '360px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '1rem' }}>
                        Select a campaign to view analytics
                    </div>
                ) : loading ? (
                    <div style={{ height: '360px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
                        Loading analytics...
                    </div>
                ) : data.length === 0 ? (
                    <div style={{ height: '360px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontStyle: 'italic' }}>
                        No data available for this period
                    </div>
                ) : (
                    <div style={{ height: '360px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="sentGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05} />
                                    </linearGradient>
                                    <linearGradient id="opensGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05} />
                                    </linearGradient>
                                    <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.05} />
                                    </linearGradient>
                                    <linearGradient id="repliesGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.05} />
                                    </linearGradient>
                                    <linearGradient id="bouncesGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={formatShortDate}
                                    stroke="#9CA3AF"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#9CA3AF"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ background: '#FFFFFF', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ fontWeight: 600 }}
                                    labelFormatter={(label) => formatShortDate(String(label))}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                <Area type="monotone" dataKey="sent_count" name="Sent" stroke="#3B82F6" fill="url(#sentGradient)" strokeWidth={2} />
                                <Area type="monotone" dataKey="open_count" name="Opens" stroke="#22c55e" fill="url(#opensGradient)" strokeWidth={2} />
                                <Area type="monotone" dataKey="click_count" name="Clicks" stroke="#8B5CF6" fill="url(#clicksGradient)" strokeWidth={2} />
                                <Area type="monotone" dataKey="reply_count" name="Replies" stroke="#F59E0B" fill="url(#repliesGradient)" strokeWidth={2} />
                                <Area type="monotone" dataKey="bounce_count" name="Bounces" stroke="#ef4444" fill="url(#bouncesGradient)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* Summary Stats */}
            {selectedCampaignId && data.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div style={{ padding: '1.25rem', background: '#F9FAFB', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
                        <div style={{ color: '#6B7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                            Total Sent
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827' }}>
                            {totalSent.toLocaleString()}
                        </div>
                    </div>
                    <div style={{ padding: '1.25rem', background: '#EFF6FF', borderRadius: '16px', border: '1px solid #BFDBFE' }}>
                        <div style={{ color: '#1E40AF', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                            Avg Open Rate
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1E3A8A' }}>
                            {avgOpenRate}%
                        </div>
                    </div>
                    <div style={{ padding: '1.25rem', background: '#F0FDF4', borderRadius: '16px', border: '1px solid #BBF7D0' }}>
                        <div style={{ color: '#166534', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                            Avg Reply Rate
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#15803D' }}>
                            {avgReplyRate}%
                        </div>
                    </div>
                    <div style={{ padding: '1.25rem', background: '#FEF2F2', borderRadius: '16px', border: '1px solid #FECACA' }}>
                        <div style={{ color: '#991B1B', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                            Total Bounces
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#DC2626' }}>
                            {totalBounces.toLocaleString()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

'use client';
import { useEffect, useState, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { apiClient } from '@/lib/api';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import type { DailyData } from '@/types/api';
import { useCampaignList } from '@/hooks/useCampaignList';

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
    const { campaigns } = useCampaignList();
    const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
    const [startDate, setStartDate] = useState(defaults.startDate);
    const [endDate, setEndDate] = useState(defaults.endDate);
    const [data, setData] = useState<DailyData[]>([]);
    const [loading, setLoading] = useState(false);

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

    // Auto-select first campaign when list loads
    useEffect(() => {
        if (!selectedCampaignId && campaigns.length > 0) {
            setSelectedCampaignId(campaigns[0].id);
        }
    }, [campaigns, selectedCampaignId]);

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
        <div className="flex flex-col gap-6">
            {/* Page Header */}
            <div>
                <h1 className="text-[2.25rem] font-bold text-gray-900 tracking-tight">Analytics</h1>
                <p className="text-lg text-gray-500 mt-1">Campaign performance trends</p>
            </div>

            {/* Filters */}
            <div className="premium-card flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Campaign</label>
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
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Start Date</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inputStyle} />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">End Date</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={inputStyle} />
                </div>
            </div>

            {/* Main Chart */}
            <div className="premium-card">
                {!selectedCampaignId ? (
                    <div className="h-[360px] flex items-center justify-center text-gray-400 text-base">
                        Select a campaign to view analytics
                    </div>
                ) : loading ? (
                    <LoadingSkeleton type="chart" />
                ) : data.length === 0 ? (
                    <div className="h-[360px] flex items-center justify-center text-gray-400 italic">
                        No data available for this period
                    </div>
                ) : (
                    <div className="h-[360px]">
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
                    <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200">
                        <div className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">
                            Total Sent
                        </div>
                        <div className="text-[1.75rem] font-bold text-gray-900">
                            {totalSent.toLocaleString()}
                        </div>
                    </div>
                    <div className="p-5 bg-blue-50 rounded-2xl border border-blue-200">
                        <div className="text-blue-800 text-xs font-semibold uppercase tracking-wide mb-2">
                            Avg Open Rate
                        </div>
                        <div className="text-[1.75rem] font-bold text-blue-900">
                            {avgOpenRate}%
                        </div>
                    </div>
                    <div className="p-5 bg-green-50 rounded-2xl border border-green-200">
                        <div className="text-green-800 text-xs font-semibold uppercase tracking-wide mb-2">
                            Avg Reply Rate
                        </div>
                        <div className="text-[1.75rem] font-bold text-green-700">
                            {avgReplyRate}%
                        </div>
                    </div>
                    <div className="p-5 bg-red-50 rounded-2xl border border-red-200">
                        <div className="text-red-800 text-xs font-semibold uppercase tracking-wide mb-2">
                            Total Bounces
                        </div>
                        <div className="text-[1.75rem] font-bold text-red-600">
                            {totalBounces.toLocaleString()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

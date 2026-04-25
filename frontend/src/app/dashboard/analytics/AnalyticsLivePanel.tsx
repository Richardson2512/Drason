'use client';
import { useEffect, useState, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';
import { apiClient } from '@/lib/api';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import type { DailyData } from '@/types/api';
import { useCampaignList } from '@/hooks/useCampaignList';
import DatePicker from '@/components/ui/DatePicker';
import CustomSelect from '@/components/ui/CustomSelect';

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

const CAMPAIGN_COLORS = ['#3B82F6', '#22c55e', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#EC4899', '#F97316'];

interface ComparisonData {
    [campaignId: string]: {
        name: string;
        totals: { sent: number; opens: number; clicks: number; replies: number; bounces: number };
        daily: DailyData[];
    };
}

export default function AnalyticsPage() {
    const defaults = getDefaultDates();
    const { campaigns } = useCampaignList();
    const [selectedCampaignIds, setSelectedCampaignIds] = useState<string[]>([]);
    const [startDate, setStartDate] = useState(defaults.startDate);
    const [endDate, setEndDate] = useState(defaults.endDate);
    const [data, setData] = useState<DailyData[]>([]);
    const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<'single' | 'compare'>('single');

    const isComparing = mode === 'compare' && selectedCampaignIds.length > 1;

    const fetchAnalytics = useCallback(async () => {
        if (selectedCampaignIds.length === 0) return;
        setLoading(true);
        setComparisonData(null);
        setData([]);
        try {
            const params = new URLSearchParams({
                campaign_id: selectedCampaignIds.join(','),
                start_date: startDate,
                end_date: endDate,
            });
            const result = await apiClient<any>(`/api/analytics/daily?${params}`);

            // apiClient unwraps { success, data } → returns data directly
            // For comparison: backend sends { success, comparison: true, data: byCampaign }
            // apiClient returns byCampaign (an object with campaign IDs as keys)
            // For single: backend sends { success, data: [...] }
            // apiClient returns [...] (an array)
            if (result?.comparison) {
                // Raw response (apiClient didn't unwrap)
                setComparisonData(result.data || result);
            } else if (Array.isArray(result)) {
                setData(result);
            } else if (result && typeof result === 'object' && !Array.isArray(result)) {
                // apiClient unwrapped — result is byCampaign object (comparison mode)
                setComparisonData(result);
            } else {
                setData([]);
            }
        } catch {
            setData([]);
            setComparisonData(null);
        } finally {
            setLoading(false);
        }
    }, [selectedCampaignIds, startDate, endDate]);

    // Auto-select first campaign when list loads
    useEffect(() => {
        if (selectedCampaignIds.length === 0 && campaigns.length > 0) {
            setSelectedCampaignIds([campaigns[0].id]);
        }
    }, [campaigns, selectedCampaignIds.length]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    // Single-campaign summary stats
    const totalSent = data.reduce((sum, d) => sum + d.sent_count, 0);
    const totalOpens = data.reduce((sum, d) => sum + d.open_count, 0);
    const totalReplies = data.reduce((sum, d) => sum + d.reply_count, 0);
    const totalBounces = data.reduce((sum, d) => sum + d.bounce_count, 0);
    const avgOpenRate = totalSent > 0 ? ((totalOpens / totalSent) * 100).toFixed(1) : '0.0';
    const avgReplyRate = totalSent > 0 ? ((totalReplies / totalSent) * 100).toFixed(1) : '0.0';

    const toggleCampaign = (id: string) => {
        if (mode === 'single') {
            setSelectedCampaignIds([id]);
        } else {
            setSelectedCampaignIds(prev =>
                prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
            );
        }
    };

    const inputStyle = {
        padding: '0.625rem 1rem',
        borderRadius: '12px',
        border: '1px solid #E5E7EB',
        fontSize: '0.875rem',
        outline: 'none',
        background: '#FFFFFF',
        color: '#111827',
    };

    // Build comparison chart data (merged by date)
    const comparisonChartData = (() => {
        if (!comparisonData) return [];
        const dateMap = new Map<string, Record<string, number>>();
        for (const [cId, cData] of Object.entries(comparisonData)) {
            for (const day of cData.daily) {
                const existing = dateMap.get(day.date) || { date: 0 };
                existing[`${cId}_sent`] = day.sent_count;
                existing[`${cId}_opens`] = day.open_count;
                existing[`${cId}_replies`] = day.reply_count;
                existing[`${cId}_bounces`] = day.bounce_count;
                dateMap.set(day.date, existing);
            }
        }
        return Array.from(dateMap.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, vals]) => ({ date, ...vals }));
    })();

    return (
        <div className="p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                    <p className="text-sm text-gray-500 mt-1">Campaign performance trends</p>
                </div>
                <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
                    <button
                        onClick={() => { setMode('single'); if (selectedCampaignIds.length > 1) setSelectedCampaignIds([selectedCampaignIds[0]]); }}
                        className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${mode === 'single' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Single
                    </button>
                    <button
                        onClick={() => setMode('compare')}
                        className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${mode === 'compare' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Compare
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="premium-card flex flex-col gap-4">
                <div className="flex items-end gap-4 flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                            {mode === 'compare' ? 'Select campaigns to compare' : 'Campaign'}
                        </label>
                        {mode === 'single' ? (
                            <CustomSelect
                                value={selectedCampaignIds[0] || ''}
                                onChange={(v) => setSelectedCampaignIds(v ? [v] : [])}
                                searchable={campaigns.length > 5}
                                placeholder="Select a campaign..."
                                options={campaigns.map(c => ({ value: c.id, label: c.name }))}
                            />
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {campaigns.map((c, idx) => {
                                    const isSelected = selectedCampaignIds.includes(c.id);
                                    const colorIdx = selectedCampaignIds.indexOf(c.id);
                                    const color = colorIdx >= 0 ? CAMPAIGN_COLORS[colorIdx % CAMPAIGN_COLORS.length] : '#9CA3AF';
                                    return (
                                        <button
                                            key={c.id}
                                            onClick={() => toggleCampaign(c.id)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                                isSelected
                                                    ? 'text-white shadow-sm'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                                            }`}
                                            style={isSelected ? { backgroundColor: color, borderColor: color } : {}}
                                        >
                                            {c.name}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    <div className="w-44">
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Start Date</label>
                        <DatePicker value={startDate} onChange={setStartDate} />
                    </div>
                    <div className="w-44">
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">End Date</label>
                        <DatePicker value={endDate} onChange={setEndDate} />
                    </div>
                </div>
                {mode === 'compare' && selectedCampaignIds.length < 2 && (
                    <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                        Select at least 2 campaigns to compare
                    </div>
                )}
            </div>

            {/* ── SINGLE MODE ── */}
            {!isComparing && (
                <>
                    {/* Main Chart */}
                    <div className="premium-card">
                        {selectedCampaignIds.length === 0 ? (
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
                                        <XAxis dataKey="date" tickFormatter={formatShortDate} stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
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
                    {selectedCampaignIds.length > 0 && data.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200">
                                <div className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">Total Sent</div>
                                <div className="text-[1.75rem] font-bold text-gray-900">{totalSent.toLocaleString()}</div>
                            </div>
                            <div className="p-5 bg-blue-50 rounded-2xl border border-blue-200">
                                <div className="text-blue-800 text-xs font-semibold uppercase tracking-wide mb-2">Avg Open Rate</div>
                                <div className="text-[1.75rem] font-bold text-blue-900">{avgOpenRate}%</div>
                            </div>
                            <div className="p-5 bg-green-50 rounded-2xl border border-green-200">
                                <div className="text-green-800 text-xs font-semibold uppercase tracking-wide mb-2">Avg Reply Rate</div>
                                <div className="text-[1.75rem] font-bold text-green-700">{avgReplyRate}%</div>
                            </div>
                            <div className="p-5 bg-red-50 rounded-2xl border border-red-200">
                                <div className="text-red-800 text-xs font-semibold uppercase tracking-wide mb-2">Total Bounces</div>
                                <div className="text-[1.75rem] font-bold text-red-600">{totalBounces.toLocaleString()}</div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ── COMPARISON MODE ── */}
            {isComparing && (
                <>
                    {loading ? (
                        <LoadingSkeleton type="chart" />
                    ) : !comparisonData ? (
                        <div className="premium-card h-[360px] flex items-center justify-center text-gray-400 italic">
                            No comparison data available
                        </div>
                    ) : (
                        <>
                            {/* Comparison Chart — Sends per campaign */}
                            <div className="premium-card">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Sends Over Time</h2>
                                <div className="h-[360px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={comparisonChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                                            <XAxis dataKey="date" tickFormatter={formatShortDate} stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                                            <Tooltip
                                                contentStyle={{ background: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                labelFormatter={(label) => formatShortDate(String(label))}
                                            />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                            {selectedCampaignIds.map((cId, idx) => (
                                                <Area
                                                    key={cId}
                                                    type="monotone"
                                                    dataKey={`${cId}_sent`}
                                                    name={comparisonData[cId]?.name || cId}
                                                    stroke={CAMPAIGN_COLORS[idx % CAMPAIGN_COLORS.length]}
                                                    fill={CAMPAIGN_COLORS[idx % CAMPAIGN_COLORS.length]}
                                                    fillOpacity={0.1}
                                                    strokeWidth={2}
                                                />
                                            ))}
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Comparison Table */}
                            <div className="premium-card">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Campaign Comparison</h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-3 px-4 font-semibold text-gray-500 uppercase text-xs tracking-wide">Campaign</th>
                                                <th className="text-right py-3 px-4 font-semibold text-gray-500 uppercase text-xs tracking-wide">Sent</th>
                                                <th className="text-right py-3 px-4 font-semibold text-gray-500 uppercase text-xs tracking-wide">Opens</th>
                                                <th className="text-right py-3 px-4 font-semibold text-gray-500 uppercase text-xs tracking-wide">Open Rate</th>
                                                <th className="text-right py-3 px-4 font-semibold text-gray-500 uppercase text-xs tracking-wide">Replies</th>
                                                <th className="text-right py-3 px-4 font-semibold text-gray-500 uppercase text-xs tracking-wide">Reply Rate</th>
                                                <th className="text-right py-3 px-4 font-semibold text-gray-500 uppercase text-xs tracking-wide">Bounces</th>
                                                <th className="text-right py-3 px-4 font-semibold text-gray-500 uppercase text-xs tracking-wide">Bounce Rate</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedCampaignIds.map((cId, idx) => {
                                                const c = comparisonData[cId];
                                                if (!c) return null;
                                                const t = c.totals;
                                                const openRate = t.sent > 0 ? ((t.opens / t.sent) * 100).toFixed(1) : '0.0';
                                                const replyRate = t.sent > 0 ? ((t.replies / t.sent) * 100).toFixed(1) : '0.0';
                                                const bounceRate = t.sent > 0 ? ((t.bounces / t.sent) * 100).toFixed(1) : '0.0';
                                                const color = CAMPAIGN_COLORS[idx % CAMPAIGN_COLORS.length];
                                                return (
                                                    <tr key={cId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                        <td className="py-3 px-4 font-semibold text-gray-900 flex items-center gap-2">
                                                            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                                                            <span className="truncate max-w-[200px]">{c.name}</span>
                                                        </td>
                                                        <td className="text-right py-3 px-4 font-mono text-gray-700">{t.sent.toLocaleString()}</td>
                                                        <td className="text-right py-3 px-4 font-mono text-gray-700">{t.opens.toLocaleString()}</td>
                                                        <td className="text-right py-3 px-4 font-mono font-semibold" style={{ color: parseFloat(openRate) >= 40 ? '#16A34A' : parseFloat(openRate) >= 20 ? '#F59E0B' : '#EF4444' }}>{openRate}%</td>
                                                        <td className="text-right py-3 px-4 font-mono text-gray-700">{t.replies.toLocaleString()}</td>
                                                        <td className="text-right py-3 px-4 font-mono font-semibold" style={{ color: parseFloat(replyRate) >= 3 ? '#16A34A' : parseFloat(replyRate) >= 1 ? '#F59E0B' : '#EF4444' }}>{replyRate}%</td>
                                                        <td className="text-right py-3 px-4 font-mono text-gray-700">{t.bounces.toLocaleString()}</td>
                                                        <td className="text-right py-3 px-4 font-mono font-semibold" style={{ color: parseFloat(bounceRate) <= 2 ? '#16A34A' : parseFloat(bounceRate) <= 5 ? '#F59E0B' : '#EF4444' }}>{bounceRate}%</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Bar Chart — Side by side totals */}
                            <div className="premium-card">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Total Performance</h2>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={selectedCampaignIds.map((cId, idx) => {
                                                const c = comparisonData[cId];
                                                if (!c) return { name: cId };
                                                return {
                                                    name: c.name.length > 20 ? c.name.substring(0, 20) + '...' : c.name,
                                                    Sent: c.totals.sent,
                                                    Opens: c.totals.opens,
                                                    Replies: c.totals.replies,
                                                    Bounces: c.totals.bounces,
                                                };
                                            })}
                                            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                                            <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                                            <Tooltip contentStyle={{ background: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                            <Bar dataKey="Sent" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="Opens" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="Replies" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="Bounces" fill="#EF4444" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
}

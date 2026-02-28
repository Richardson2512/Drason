'use client';
import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { apiClient } from '@/lib/api';

interface LeadHealthData {
    total: number;
    green: number;
    yellow: number;
    red: number;
    blocked: number;
    greenPercent: number;
    yellowPercent: number;
    redPercent: number;
    recentBlocked: Array<{
        id: string;
        email: string;
        health_classification: string;
        health_score_calc: number;
        created_at: string;
    }>;
}

function formatRelativeTime(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

export default function LeadHealthChart() {
    const [data, setData] = useState<LeadHealthData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient<LeadHealthData>('/api/dashboard/lead-health-stats')
            .then(setData)
            .catch(err => console.error('[LeadHealthChart] Failed to fetch health stats', err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="premium-card" style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>
                Loading health classifications...
            </div>
        );
    }

    if (!data || data.total === 0) return null;

    const chartData = [
        { name: 'Green', value: data.green, color: '#22c55e' },
        { name: 'Yellow', value: data.yellow, color: '#eab308' },
        { name: 'Red', value: data.red, color: '#ef4444' },
    ];

    return (
        <div className="premium-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111827' }}>Lead Health Gate</h2>
                    <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>Health classification breakdown</p>
                </div>
                <div style={{ background: '#F3F4F6', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, color: '#374151' }}>
                    {data.total} Total
                </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                {/* Left: Donut Chart */}
                <div style={{ width: '55%', minWidth: 0 }}>
                    <div style={{ height: '220px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    cornerRadius={6}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: '#FFFFFF', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ fontWeight: 600 }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#166534' }}>Green {data.greenPercent}%</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#eab308', display: 'inline-block' }} />
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#92400E' }}>Yellow {data.yellowPercent}%</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#991B1B' }}>Red {data.redPercent}%</span>
                        </div>
                    </div>
                </div>

                {/* Right: Recent Blocked Leads */}
                <div style={{ width: '45%', minWidth: 0 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                        Recently Blocked
                    </div>
                    {data.recentBlocked.length === 0 ? (
                        <div style={{ fontSize: '0.85rem', color: '#9CA3AF', fontStyle: 'italic', padding: '1rem 0' }}>
                            No blocked leads
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '240px', overflowY: 'auto' }}>
                            {data.recentBlocked.map((lead) => (
                                <div key={lead.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.625rem', background: '#FAFAFA', borderRadius: '8px', border: '1px solid #F3F4F6' }}>
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1E293B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {lead.email}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: '#9CA3AF', marginTop: '0.125rem' }}>
                                            {formatRelativeTime(lead.created_at)}
                                        </div>
                                    </div>
                                    <span style={{
                                        padding: '0.125rem 0.5rem',
                                        borderRadius: '9999px',
                                        fontSize: '0.65rem',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        flexShrink: 0,
                                        marginLeft: '0.5rem',
                                        background: lead.health_classification === 'red' ? '#FEE2E2' : '#FEF3C7',
                                        color: lead.health_classification === 'red' ? '#991B1B' : '#92400E',
                                    }}>
                                        {lead.health_classification}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

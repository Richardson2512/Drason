'use client';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';

interface TopLead {
    email: string;
    score: number;
    assigned_campaign_id: string;
}

function getScoreColor(score: number): string {
    if (score >= 70) return '#22c55e';
    if (score >= 40) return '#F59E0B';
    return '#ef4444';
}

export default function TopLeadsCard({ campaigns }: { campaigns: Array<{ id: string; name: string }> }) {
    const [leads, setLeads] = useState<TopLead[]>([]);
    const [loading, setLoading] = useState(true);

    const campaignNameMap = new Map(campaigns.map(c => [c.id, c.name]));

    useEffect(() => {
        apiClient<TopLead[]>('/api/leads/top?limit=5')
            .then(data => setLeads(Array.isArray(data) ? data : []))
            .catch(err => console.error('[TopLeadsCard] Failed to fetch top leads', err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="premium-card" style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>
                Loading top leads...
            </div>
        );
    }

    if (leads.length === 0) return null;

    return (
        <div className="premium-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111827' }}>Top Performing Leads</h2>
                    <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>Highest engagement scores across all campaigns</p>
                </div>
                <div style={{ background: '#EFF6FF', color: '#2563EB', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
                    Top 5
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {leads.map((lead, index) => (
                    <div key={lead.email} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '0.75rem 1rem',
                        background: index === 0 ? '#FFFBEB' : '#FAFAFA',
                        borderRadius: '12px',
                        border: `1px solid ${index === 0 ? '#FDE68A' : '#F3F4F6'}`,
                        transition: 'all 0.2s',
                    }}>
                        {/* Rank */}
                        <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: index === 0 ? 'linear-gradient(135deg, #F59E0B, #D97706)' : index < 3 ? '#E5E7EB' : '#F3F4F6',
                            color: index === 0 ? '#FFFFFF' : '#6B7280',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            flexShrink: 0,
                        }}>
                            {index + 1}
                        </div>

                        {/* Email */}
                        <div style={{
                            flex: 1,
                            minWidth: 0,
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: '#1E293B',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}>
                            {lead.email}
                        </div>

                        {/* Score Bar */}
                        <div style={{ width: '120px', flexShrink: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                <span style={{ fontSize: '0.7rem', color: '#9CA3AF', fontWeight: 500 }}>Score</span>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: getScoreColor(lead.score) }}>{lead.score}</span>
                            </div>
                            <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%',
                                    width: `${Math.min(lead.score, 100)}%`,
                                    background: `linear-gradient(90deg, ${getScoreColor(lead.score)}, ${getScoreColor(lead.score)}88)`,
                                    borderRadius: '3px',
                                    transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                }} />
                            </div>
                        </div>

                        {/* Campaign */}
                        <div style={{
                            flexShrink: 0,
                            maxWidth: '140px',
                            padding: '0.25rem 0.625rem',
                            borderRadius: '9999px',
                            background: '#F3F4F6',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            color: '#4B5563',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}>
                            {campaignNameMap.get(lead.assigned_campaign_id) || 'Unassigned'}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

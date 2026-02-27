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

export default function CampaignTopLeads({ campaignId }: { campaignId: string }) {
    const [leads, setLeads] = useState<TopLead[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        setLeads([]);
        apiClient<TopLead[]>(`/api/dashboard/campaigns/${campaignId}/top-leads?limit=10`)
            .then(data => setLeads(Array.isArray(data) ? data : []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [campaignId]);

    if (loading) {
        return (
            <div className="premium-card" style={{ marginBottom: '2.5rem', padding: '2rem', textAlign: 'center', color: '#6B7280' }}>
                Loading top leads...
            </div>
        );
    }

    if (leads.length === 0) {
        return (
            <div className="premium-card" style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem' }}>
                    Top Performing Leads
                </h2>
                <p style={{ fontSize: '0.875rem', color: '#9CA3AF', fontStyle: 'italic' }}>
                    No lead scores available for this campaign yet
                </p>
            </div>
        );
    }

    return (
        <div className="premium-card" style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem' }}>
                        Top Performing Leads
                    </h2>
                    <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                        Highest engagement scores in this campaign
                    </p>
                </div>
                <div style={{ background: '#F0FDF4', color: '#16A34A', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
                    {leads.length} Leads
                </div>
            </div>

            {/* Table Header */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 140px',
                padding: '0.5rem 0.75rem',
                borderBottom: '2px solid #E5E7EB',
                marginBottom: '0.25rem',
            }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</span>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Score</span>
            </div>

            {/* Rows */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {leads.map((lead, index) => (
                    <div key={lead.email} style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 140px',
                        alignItems: 'center',
                        padding: '0.625rem 0.75rem',
                        borderBottom: index < leads.length - 1 ? '1px solid #F3F4F6' : 'none',
                    }}>
                        <div style={{
                            fontSize: '0.8rem',
                            fontWeight: 500,
                            color: '#1E293B',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}>
                            {lead.email}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <div style={{ width: '80px', height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%',
                                    width: `${Math.min(lead.score, 100)}%`,
                                    background: getScoreColor(lead.score),
                                    borderRadius: '3px',
                                    transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                }} />
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: getScoreColor(lead.score), minWidth: '28px', textAlign: 'right' }}>
                                {lead.score}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

'use client';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';

interface Recommendation {
    campaignId: string;
    campaignName: string;
    matchScore: number;
    persona: string;
    healthyMailboxCount: number;
    minRequiredScore: number;
}

interface LeadReport {
    leadId: string;
    recommendations: Recommendation[];
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    leadIds: string[];
    leads: Array<{ id: string; email: string }>;
}

function getMatchColor(score: number): { bg: string; color: string } {
    if (score >= 80) return { bg: '#DCFCE7', color: '#166534' };
    if (score >= 60) return { bg: '#FEF3C7', color: '#92400E' };
    return { bg: '#F3F4F6', color: '#4B5563' };
}

export default function BatchRecommendationsModal({ isOpen, onClose, leadIds, leads }: Props) {
    const [loading, setLoading] = useState(false);
    const [reports, setReports] = useState<LeadReport[]>([]);
    const [error, setError] = useState<string | null>(null);

    const emailMap = new Map(leads.map(l => [l.id, l.email]));

    useEffect(() => {
        if (!isOpen || leadIds.length === 0) return;

        setLoading(true);
        setError(null);
        setReports([]);

        apiClient<any>('/api/dashboard/leads/campaign-recommendations', {
            method: 'POST',
            body: JSON.stringify({
                leadIds,
                options: { excludeCurrentCampaign: true, maxResults: 3 },
            }),
        })
            .then(data => {
                setReports(data?.reports || []);
            })
            .catch((err: any) => {
                setError(err.message || 'Failed to get recommendations');
            })
            .finally(() => setLoading(false));
    }, [isOpen, leadIds]);

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}>
            <div style={{ background: '#FFFFFF', borderRadius: '24px', maxWidth: '700px', width: '90%', maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                {/* Header */}
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem' }}>Campaign Recommendations</h2>
                        <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>Best-matched campaigns for {leadIds.length} selected leads</p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#9CA3AF', padding: '0.25rem', lineHeight: 1 }}
                    >
                        &times;
                    </button>
                </div>

                {/* Body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }}>
                    {loading && (
                        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#6B7280' }}>
                            Analyzing {leadIds.length} leads...
                        </div>
                    )}

                    {error && (
                        <div style={{ padding: '1rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', color: '#991B1B', fontSize: '0.875rem' }}>
                            {error}
                        </div>
                    )}

                    {!loading && !error && reports.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#9CA3AF', fontStyle: 'italic' }}>
                            No recommendations available
                        </div>
                    )}

                    {!loading && !error && reports.map((report, reportIndex) => (
                        <div key={report.leadId} style={{ marginBottom: reportIndex < reports.length - 1 ? '1.5rem' : 0 }}>
                            {/* Lead Email */}
                            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {emailMap.get(report.leadId) || report.leadId}
                            </div>

                            {report.recommendations.length === 0 ? (
                                <div style={{ fontSize: '0.8rem', color: '#9CA3AF', fontStyle: 'italic', padding: '0.5rem 0' }}>
                                    No matching campaigns found
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                                    {report.recommendations.map((rec) => {
                                        const matchStyle = getMatchColor(rec.matchScore);
                                        return (
                                            <div key={rec.campaignId} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                padding: '0.625rem 0.75rem',
                                                background: '#FAFAFA',
                                                borderRadius: '10px',
                                                border: '1px solid #F3F4F6',
                                            }}>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1E293B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {rec.campaignName}
                                                    </div>
                                                    <div style={{ fontSize: '0.7rem', color: '#6B7280', marginTop: '0.125rem' }}>
                                                        {rec.persona} &middot; {rec.healthyMailboxCount} healthy mailbox{rec.healthyMailboxCount !== 1 ? 'es' : ''}
                                                    </div>
                                                </div>
                                                <span style={{
                                                    padding: '0.25rem 0.625rem',
                                                    borderRadius: '9999px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 700,
                                                    background: matchStyle.bg,
                                                    color: matchStyle.color,
                                                    flexShrink: 0,
                                                }}>
                                                    {rec.matchScore}% match
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {reportIndex < reports.length - 1 && (
                                <div style={{ height: '1px', background: '#E5E7EB', marginTop: '1.5rem' }} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div style={{ padding: '1rem 2rem', borderTop: '1px solid #F3F4F6', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '0.625rem 1.5rem',
                            borderRadius: '12px',
                            border: '1px solid #E5E7EB',
                            background: '#FFFFFF',
                            color: '#374151',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

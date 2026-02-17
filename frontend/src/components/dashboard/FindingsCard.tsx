'use client';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';

interface FindingsCardProps {
    entityType: 'mailbox' | 'domain' | 'campaign';
    entityId: string;
}

interface Finding {
    id: string;
    title: string;
    severity: 'critical' | 'warning' | 'info';
    description: string;
    entity_type: string;
    entity_id: string;
    recommendation?: string;
}

export default function FindingsCard({ entityType, entityId }: FindingsCardProps) {
    const [findings, setFindings] = useState<Finding[]>([]);
    const [loading, setLoading] = useState(true);
    const [reportAge, setReportAge] = useState<string>('');

    useEffect(() => {
        const fetchFindings = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    entity_type: entityType,
                    entity_id: entityId
                });

                const data = await apiClient<any>(`/api/findings/entity?${params}`);
                if (data?.data) {
                    setFindings(data.data.findings || []);
                    setReportAge(data.data.reportAge || '');
                }
            } catch (err) {
                console.error('Failed to fetch findings:', err);
                setFindings([]);
            } finally {
                setLoading(false);
            }
        };

        if (entityId) {
            fetchFindings();
        }
    }, [entityType, entityId]);

    const getSeverityStyle = (severity: string) => {
        switch (severity) {
            case 'critical':
                return {
                    bg: '#FEE2E2',
                    border: '#FCA5A5',
                    color: '#991B1B',
                    icon: '🔴'
                };
            case 'warning':
                return {
                    bg: '#FEF3C7',
                    border: '#FCD34D',
                    color: '#B45309',
                    icon: '⚠️'
                };
            case 'info':
            default:
                return {
                    bg: '#E0F2FE',
                    border: '#7DD3FC',
                    color: '#075985',
                    icon: 'ℹ️'
                };
        }
    };

    if (loading) {
        return (
            <div className="premium-card">
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: '#111827' }}>
                    Infrastructure Health Issues
                </h2>
                <div style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>
                    Loading findings...
                </div>
            </div>
        );
    }

    if (!findings || findings.length === 0) {
        return (
            <div className="premium-card">
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: '#111827' }}>
                    Infrastructure Health Issues
                </h2>
                <div style={{
                    padding: '2rem',
                    textAlign: 'center',
                    color: '#10B981',
                    background: '#ECFDF5',
                    borderRadius: '12px',
                    border: '1px solid #A7F3D0'
                }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
                    <div style={{ fontWeight: '600' }}>No Issues Detected</div>
                    <div style={{ fontSize: '0.875rem', marginTop: '0.25rem', opacity: 0.8 }}>
                        This {entityType} is operating normally
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="premium-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>
                    Infrastructure Health Issues
                </h2>
                {reportAge && (
                    <div style={{
                        fontSize: '0.75rem',
                        color: '#6B7280',
                        background: '#F3F4F6',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '999px'
                    }}>
                        Last checked: {reportAge}
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {findings.map((finding) => {
                    const style = getSeverityStyle(finding.severity);
                    return (
                        <div
                            key={finding.id}
                            style={{
                                background: style.bg,
                                border: `1px solid ${style.border}`,
                                borderRadius: '12px',
                                padding: '1rem'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
                                <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>{style.icon}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        fontWeight: '700',
                                        color: style.color,
                                        marginBottom: '0.25rem',
                                        fontSize: '0.95rem'
                                    }}>
                                        {finding.title}
                                    </div>
                                    <div style={{
                                        color: style.color,
                                        fontSize: '0.875rem',
                                        marginBottom: '0.5rem',
                                        opacity: 0.9
                                    }}>
                                        {finding.description}
                                    </div>
                                    {finding.recommendation && (
                                        <div style={{
                                            background: 'rgba(255, 255, 255, 0.6)',
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            fontSize: '0.875rem',
                                            color: style.color,
                                            fontWeight: 500
                                        }}>
                                            <strong>💡 Recommendation:</strong> {finding.recommendation}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

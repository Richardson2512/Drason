'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface MailboxLoad {
    id: string;
    email: string;
    status: string;
    campaign_count: number;
    load_category: 'overloaded' | 'optimal' | 'underutilized';
    health_score: number;
}

interface LoadBalancingSuggestion {
    type: 'move_mailbox' | 'add_mailbox' | 'remove_mailbox';
    mailbox_id: string;
    mailbox_email: string;
    from_campaign_id?: string;
    from_campaign_name?: string;
    to_campaign_id?: string;
    to_campaign_name?: string;
    reason: string;
    expected_impact: string;
    priority: 'high' | 'medium' | 'low';
}

interface LoadBalancingReport {
    summary: {
        total_mailboxes: number;
        total_campaigns: number;
        overloaded_mailboxes: number;
        underutilized_mailboxes: number;
        optimal_mailboxes: number;
        avg_campaigns_per_mailbox: number;
    };
    mailbox_distribution: MailboxLoad[];
    suggestions: LoadBalancingSuggestion[];
    health_warnings: string[];
}

export default function LoadBalancingPage() {
    const [report, setReport] = useState<LoadBalancingReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchReport = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiClient<{ success: boolean; report: LoadBalancingReport }>(
                '/api/dashboard/campaigns/load-balancing'
            );
            setReport(data.report);
        } catch (err: any) {
            console.error('Failed to fetch load balancing report', err);
            setError('Failed to load load balancing report.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, []);

    const applySuggestion = async (suggestion: LoadBalancingSuggestion) => {
        setApplying(suggestion.mailbox_id);
        try {
            await apiClient('/api/dashboard/campaigns/load-balancing/apply', {
                method: 'POST',
                body: JSON.stringify({ suggestion })
            });
            // Refresh report after applying
            await fetchReport();
        } catch (err: any) {
            console.error('Failed to apply suggestion', err);
            alert(`Failed to apply suggestion: ${err.message}`);
        } finally {
            setApplying(null);
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'overloaded': return '#DC2626';
            case 'optimal': return '#16A34A';
            case 'underutilized': return '#F59E0B';
            default: return '#6B7280';
        }
    };

    const getCategoryBg = (category: string) => {
        switch (category) {
            case 'overloaded': return '#FEE2E2';
            case 'optimal': return '#DCFCE7';
            case 'underutilized': return '#FEF3C7';
            default: return '#F3F4F6';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return '#DC2626';
            case 'medium': return '#F59E0B';
            case 'low': return '#6B7280';
            default: return '#6B7280';
        }
    };

    const getPriorityBg = (priority: string) => {
        switch (priority) {
            case 'high': return '#FEE2E2';
            case 'medium': return '#FEF3C7';
            case 'low': return '#F3F4F6';
            default: return '#F3F4F6';
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>
                Loading load balancing report...
            </div>
        );
    }

    if (error || !report) {
        return (
            <div style={{ padding: '2rem' }}>
                <div style={{ padding: '1rem', background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: '8px' }}>
                    {error || 'Failed to load report'}
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>
                    ⚖️ Mailbox Load Balancing
                </h1>
                <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                    Analyze mailbox-campaign distribution and optimize for better redundancy and performance.
                </p>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ padding: '1.5rem', background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem' }}>Total Mailboxes</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#111827' }}>{report.summary.total_mailboxes}</div>
                </div>
                <div style={{ padding: '1.5rem', background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem' }}>Total Campaigns</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#111827' }}>{report.summary.total_campaigns}</div>
                </div>
                <div style={{ padding: '1.5rem', background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.875rem', color: '#7F1D1D', marginBottom: '0.5rem' }}>Overloaded</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#DC2626' }}>{report.summary.overloaded_mailboxes}</div>
                </div>
                <div style={{ padding: '1.5rem', background: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.875rem', color: '#14532D', marginBottom: '0.5rem' }}>Optimal</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#16A34A' }}>{report.summary.optimal_mailboxes}</div>
                </div>
                <div style={{ padding: '1.5rem', background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.875rem', color: '#78350F', marginBottom: '0.5rem' }}>Underutilized</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#F59E0B' }}>{report.summary.underutilized_mailboxes}</div>
                </div>
                <div style={{ padding: '1.5rem', background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem' }}>Avg Campaigns/Mailbox</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#111827' }}>{report.summary.avg_campaigns_per_mailbox}</div>
                </div>
            </div>

            {/* Health Warnings */}
            {report.health_warnings.length > 0 && (
                <div style={{ padding: '1rem', background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '8px', marginBottom: '2rem' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#92400E', marginBottom: '0.5rem' }}>
                        ⚠️ Health Warnings
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#92400E', fontSize: '0.875rem' }}>
                        {report.health_warnings.map((warning, idx) => (
                            <li key={idx}>{warning}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Suggestions */}
            {report.suggestions.length > 0 ? (
                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '1rem' }}>
                        📋 Optimization Suggestions ({report.suggestions.length})
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {report.suggestions.map((suggestion, idx) => (
                            <div
                                key={idx}
                                style={{
                                    padding: '1.5rem',
                                    background: '#FFF',
                                    border: '1px solid #E5E7EB',
                                    borderRadius: '12px'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                            <span
                                                style={{
                                                    padding: '0.25rem 0.75rem',
                                                    background: getPriorityBg(suggestion.priority),
                                                    color: getPriorityColor(suggestion.priority),
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    borderRadius: '12px',
                                                    textTransform: 'uppercase'
                                                }}
                                            >
                                                {suggestion.priority} Priority
                                            </span>
                                            <span
                                                style={{
                                                    padding: '0.25rem 0.75rem',
                                                    background: '#EFF6FF',
                                                    color: '#1E40AF',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    borderRadius: '12px'
                                                }}
                                            >
                                                {suggestion.type.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem' }}>
                                            <strong>Mailbox:</strong> {suggestion.mailbox_email}
                                        </div>
                                        {suggestion.from_campaign_name && (
                                            <div style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem' }}>
                                                <strong>From Campaign:</strong> {suggestion.from_campaign_name}
                                            </div>
                                        )}
                                        {suggestion.to_campaign_name && (
                                            <div style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem' }}>
                                                <strong>To Campaign:</strong> {suggestion.to_campaign_name}
                                            </div>
                                        )}
                                    </div>
                                    {suggestion.type !== 'move_mailbox' && (
                                        <button
                                            onClick={() => applySuggestion(suggestion)}
                                            disabled={applying === suggestion.mailbox_id}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                background: applying === suggestion.mailbox_id ? '#93C5FD' : '#2563EB',
                                                color: '#FFF',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontSize: '0.875rem',
                                                fontWeight: 600,
                                                cursor: applying === suggestion.mailbox_id ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            {applying === suggestion.mailbox_id ? 'Applying...' : 'Apply'}
                                        </button>
                                    )}
                                </div>
                                <div style={{ padding: '1rem', background: '#F9FAFB', borderRadius: '8px', marginBottom: '0.75rem' }}>
                                    <div style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem' }}>
                                        <strong>Reason:</strong> {suggestion.reason}
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                                        <strong>Impact:</strong> {suggestion.expected_impact}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div style={{ padding: '2rem', textAlign: 'center', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '12px', marginBottom: '2rem' }}>
                    <div style={{ fontSize: '1rem', color: '#16A34A', fontWeight: 600, marginBottom: '0.5rem' }}>
                        ✅ No optimization needed
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                        Your mailbox distribution is already well-balanced!
                    </div>
                </div>
            )}

            {/* Mailbox Distribution Table */}
            <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '1rem' }}>
                    📊 Mailbox Distribution
                </h2>
                <div style={{ background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Mailbox</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Status</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Campaigns</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Load Category</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Health Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {report.mailbox_distribution
                                .sort((a, b) => b.campaign_count - a.campaign_count)
                                .map((mb, idx) => (
                                    <tr key={mb.id} style={{ borderBottom: idx < report.mailbox_distribution.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                                        <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#111827' }}>{mb.email}</td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            <span
                                                style={{
                                                    padding: '0.25rem 0.75rem',
                                                    background: mb.status === 'healthy' ? '#DCFCE7' : '#FEE2E2',
                                                    color: mb.status === 'healthy' ? '#16A34A' : '#DC2626',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    borderRadius: '12px'
                                                }}
                                            >
                                                {mb.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: '#111827' }}>
                                            {mb.campaign_count}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            <span
                                                style={{
                                                    padding: '0.25rem 0.75rem',
                                                    background: getCategoryBg(mb.load_category),
                                                    color: getCategoryColor(mb.load_category),
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    borderRadius: '12px',
                                                    textTransform: 'capitalize'
                                                }}
                                            >
                                                {mb.load_category}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', color: '#6B7280' }}>
                                            {mb.health_score.toFixed(0)}
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

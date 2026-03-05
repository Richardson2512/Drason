'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import Link from 'next/link';

interface RiskSignal {
    type: 'mailbox_health' | 'domain_health' | 'bounce_rate' | 'mailbox_count' | 'cooldown';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    score_impact: number;
}

interface Recommendation {
    action: 'add_mailboxes' | 'remove_unhealthy' | 'wait_cooldown' | 'investigate_bounces' | 'fix_domains' | 'no_action';
    label: string;
    campaign_id: string;
    mailbox_ids?: string[];
    domain_ids?: string[];
}

interface CampaignRiskScore {
    campaign_id: string;
    campaign_name: string;
    risk_score: number;
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    stall_probability: number;
    time_to_stall_hours: number | null;
    signals: RiskSignal[];
    recommended_actions: string[];
    recommendations: Recommendation[];
}

interface PredictiveReport {
    timestamp: Date;
    campaigns_analyzed: number;
    at_risk_campaigns: number;
    high_risk_campaigns: number;
    critical_risk_campaigns: number;
    campaign_risks: CampaignRiskScore[];
}

export default function PredictiveRisksPage() {
    const [report, setReport] = useState<PredictiveReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [sendingAlerts, setSendingAlerts] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedCampaigns, setExpandedCampaigns] = useState<Set<string>>(new Set());
    const [applyingRec, setApplyingRec] = useState<string | null>(null);
    const [recResults, setRecResults] = useState<Record<string, { success: boolean; message: string }>>({});

    const fetchReport = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiClient<{ success: boolean; report: PredictiveReport }>(
                '/api/dashboard/campaigns/predictive-risks'
            );
            setReport(data.report);
        } catch (err: any) {
            console.error('Failed to fetch predictive risks', err);
            setError('Failed to load predictive risk report.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, []);

    const sendAlerts = async () => {
        setSendingAlerts(true);
        try {
            await apiClient('/api/dashboard/campaigns/predictive-alerts', {
                method: 'POST'
            });
            alert('Predictive alerts sent successfully!');
        } catch (err: any) {
            console.error('Failed to send alerts', err);
            alert(`Failed to send alerts: ${err.message}`);
        } finally {
            setSendingAlerts(false);
        }
    };

    const applyRecommendation = async (rec: Recommendation, index: number) => {
        const key = `${rec.campaign_id}-${index}`;
        setApplyingRec(key);
        try {
            const data = await apiClient<{ success: boolean; message: string }>(
                '/api/dashboard/campaigns/predictive-risks/apply',
                {
                    method: 'POST',
                    body: JSON.stringify({ recommendation: rec })
                }
            );
            setRecResults(prev => ({ ...prev, [key]: { success: data.success !== false, message: data.message || 'Done' } }));
            // Refresh report after applying
            if (data.success !== false) {
                await fetchReport();
            }
        } catch (err: any) {
            setRecResults(prev => ({ ...prev, [key]: { success: false, message: err.message } }));
        } finally {
            setApplyingRec(null);
        }
    };

    const getActionButtonLabel = (action: string): string => {
        switch (action) {
            case 'add_mailboxes': return 'Auto-Add';
            case 'remove_unhealthy': return 'Remove';
            case 'investigate_bounces': return 'View';
            case 'fix_domains': return 'View';
            case 'wait_cooldown': return 'Info';
            case 'no_action': return '';
            default: return 'Apply';
        }
    };

    const getActionRoute = (rec: Recommendation): string | null => {
        switch (rec.action) {
            case 'investigate_bounces': return `/dashboard/campaigns?highlight=${rec.campaign_id}`;
            case 'fix_domains': return '/dashboard/domains';
            default: return null;
        }
    };

    const toggleExpanded = (campaignId: string) => {
        setExpandedCampaigns(prev => {
            const newSet = new Set(prev);
            if (newSet.has(campaignId)) {
                newSet.delete(campaignId);
            } else {
                newSet.add(campaignId);
            }
            return newSet;
        });
    };

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'critical': return '#DC2626';
            case 'high': return '#F59E0B';
            case 'medium': return '#3B82F6';
            case 'low': return '#16A34A';
            default: return '#6B7280';
        }
    };

    const getRiskBg = (level: string) => {
        switch (level) {
            case 'critical': return '#FEE2E2';
            case 'high': return '#FEF3C7';
            case 'medium': return '#DBEAFE';
            case 'low': return '#DCFCE7';
            default: return '#F3F4F6';
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'critical': return '🔴';
            case 'high': return '🟠';
            case 'medium': return '🟡';
            case 'low': return '🟢';
            default: return '⚪';
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>
                Analyzing campaign health trends...
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
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>
                        🔮 Predictive Risk Monitoring
                    </h1>
                    <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                        Proactive campaign stall detection - catch issues before they happen
                    </p>
                </div>
                <button
                    onClick={sendAlerts}
                    disabled={sendingAlerts}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: sendingAlerts ? '#93C5FD' : '#2563EB',
                        color: '#FFF',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        cursor: sendingAlerts ? 'not-allowed' : 'pointer'
                    }}
                >
                    {sendingAlerts ? 'Sending...' : '📢 Send Alerts'}
                </button>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ padding: '1.5rem', background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem' }}>Campaigns Analyzed</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#111827' }}>{report.campaigns_analyzed}</div>
                </div>
                <div style={{ padding: '1.5rem', background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.875rem', color: '#7F1D1D', marginBottom: '0.5rem' }}>Critical Risk</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#DC2626' }}>{report.critical_risk_campaigns}</div>
                </div>
                <div style={{ padding: '1.5rem', background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.875rem', color: '#78350F', marginBottom: '0.5rem' }}>High Risk</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#F59E0B' }}>{report.high_risk_campaigns}</div>
                </div>
                <div style={{ padding: '1.5rem', background: '#DBEAFE', border: '1px solid #93C5FD', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.875rem', color: '#1E3A8A', marginBottom: '0.5rem' }}>At Risk Total</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#3B82F6' }}>{report.at_risk_campaigns}</div>
                </div>
            </div>

            {/* Campaign Risk Cards */}
            {report.campaign_risks.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {report.campaign_risks.map((campaign) => {
                        const isExpanded = expandedCampaigns.has(campaign.campaign_id);
                        return (
                            <div
                                key={campaign.campaign_id}
                                style={{
                                    background: '#FFF',
                                    border: `2px solid ${getRiskColor(campaign.risk_level)}`,
                                    borderRadius: '12px',
                                    overflow: 'hidden'
                                }}
                            >
                                {/* Header */}
                                <div
                                    onClick={() => toggleExpanded(campaign.campaign_id)}
                                    style={{
                                        padding: '1.5rem',
                                        background: getRiskBg(campaign.risk_level),
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                                                {campaign.campaign_name}
                                            </h3>
                                            <span
                                                style={{
                                                    padding: '0.25rem 0.75rem',
                                                    background: getRiskColor(campaign.risk_level),
                                                    color: '#FFF',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    borderRadius: '12px',
                                                    textTransform: 'uppercase'
                                                }}
                                            >
                                                {campaign.risk_level} Risk
                                            </span>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                            <div>
                                                <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.25rem' }}>Risk Score</div>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: getRiskColor(campaign.risk_level) }}>
                                                    {campaign.risk_score}/100
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.25rem' }}>Stall Probability</div>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>
                                                    {(campaign.stall_probability * 100).toFixed(0)}%
                                                </div>
                                            </div>
                                            {campaign.time_to_stall_hours && (
                                                <div>
                                                    <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.25rem' }}>Est. Time to Stall</div>
                                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#DC2626' }}>
                                                        ~{campaign.time_to_stall_hours}h
                                                    </div>
                                                </div>
                                            )}
                                            <div>
                                                <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.25rem' }}>Warning Signals</div>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>
                                                    {campaign.signals.length}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '1.5rem', color: '#6B7280', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                        ▼
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div style={{ padding: '1.5rem', borderTop: '1px solid #E5E7EB' }}>
                                        {/* Signals */}
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                                                Warning Signals
                                            </h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                {campaign.signals.map((signal, idx) => (
                                                    <div
                                                        key={idx}
                                                        style={{
                                                            padding: '0.75rem',
                                                            background: '#F9FAFB',
                                                            border: '1px solid #E5E7EB',
                                                            borderRadius: '8px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.75rem'
                                                        }}
                                                    >
                                                        <span style={{ fontSize: '1.25rem' }}>{getSeverityIcon(signal.severity)}</span>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontSize: '0.875rem', color: '#374151' }}>{signal.message}</div>
                                                            <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.25rem' }}>
                                                                Impact: +{signal.score_impact} risk points
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Recommendations with Action Buttons */}
                                        <div>
                                            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                                                Recommended Actions
                                            </h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                {(campaign.recommendations || []).map((rec, idx) => {
                                                    const key = `${rec.campaign_id}-${idx}`;
                                                    const result = recResults[key];
                                                    const isApplying = applyingRec === key;
                                                    const route = getActionRoute(rec);
                                                    const btnLabel = getActionButtonLabel(rec.action);

                                                    return (
                                                        <div
                                                            key={idx}
                                                            style={{
                                                                padding: '0.75rem 1rem',
                                                                background: result?.success ? '#F0FDF4' : result ? '#FEF2F2' : '#F9FAFB',
                                                                border: `1px solid ${result?.success ? '#86EFAC' : result ? '#FCA5A5' : '#E5E7EB'}`,
                                                                borderRadius: '8px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'space-between',
                                                                gap: '1rem'
                                                            }}
                                                        >
                                                            <div style={{ flex: 1, fontSize: '0.875rem', color: '#374151' }}>
                                                                {rec.label}
                                                                {result && (
                                                                    <div style={{ fontSize: '0.75rem', color: result.success ? '#16A34A' : '#DC2626', marginTop: '0.25rem' }}>
                                                                        {result.message}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {rec.action !== 'no_action' && rec.action !== 'wait_cooldown' && !result?.success && (
                                                                route ? (
                                                                    <Link
                                                                        href={route}
                                                                        style={{
                                                                            padding: '0.375rem 0.875rem',
                                                                            background: '#2563EB',
                                                                            color: '#FFF',
                                                                            border: 'none',
                                                                            borderRadius: '6px',
                                                                            fontSize: '0.75rem',
                                                                            fontWeight: 600,
                                                                            textDecoration: 'none',
                                                                            whiteSpace: 'nowrap'
                                                                        }}
                                                                    >
                                                                        {btnLabel} →
                                                                    </Link>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => applyRecommendation(rec, idx)}
                                                                        disabled={isApplying}
                                                                        style={{
                                                                            padding: '0.375rem 0.875rem',
                                                                            background: isApplying ? '#93C5FD' : '#2563EB',
                                                                            color: '#FFF',
                                                                            border: 'none',
                                                                            borderRadius: '6px',
                                                                            fontSize: '0.75rem',
                                                                            fontWeight: 600,
                                                                            cursor: isApplying ? 'not-allowed' : 'pointer',
                                                                            whiteSpace: 'nowrap'
                                                                        }}
                                                                    >
                                                                        {isApplying ? 'Applying...' : btnLabel}
                                                                    </button>
                                                                )
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* View Campaign Link */}
                                        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #E5E7EB' }}>
                                            <Link
                                                href={`/dashboard/campaigns?highlight=${campaign.campaign_id}`}
                                                style={{
                                                    display: 'inline-block',
                                                    padding: '0.75rem 1.5rem',
                                                    background: '#2563EB',
                                                    color: '#FFF',
                                                    borderRadius: '8px',
                                                    fontSize: '0.875rem',
                                                    fontWeight: 600,
                                                    textDecoration: 'none'
                                                }}
                                            >
                                                View Campaign →
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div style={{ padding: '3rem', textAlign: 'center', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '12px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#16A34A', marginBottom: '0.5rem' }}>
                        All Campaigns Healthy!
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                        No campaigns at risk of stalling. Great work!
                    </div>
                </div>
            )}
        </div>
    );
}

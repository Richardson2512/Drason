'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { apiClient } from '@/lib/api';

const ScoreGauge = dynamic(() => import('./Charts').then(mod => ({ default: mod.ScoreGauge })), { ssr: false });
const FindingsChart = dynamic(() => import('./Charts').then(mod => ({ default: mod.FindingsChart })), { ssr: false });
const ScoreHistory = dynamic(() => import('./Charts').then(mod => ({ default: mod.ScoreHistory })), { ssr: false });

interface Finding {
    category: string;
    severity: 'critical' | 'warning' | 'info';
    title: string;
    details: string;
    entity?: string;
    entityId?: string;
    entityName?: string;
    message?: string;
    remediation?: string;
}

interface Recommendation {
    priority: number;
    action: string;
    reason: string;
    details?: string;
    link?: string;
    entity?: string;
    entityId?: string;
}

interface SummaryData {
    domains: { total: number; healthy: number; warning: number; paused: number };
    mailboxes: { total: number; healthy: number; warning: number; paused: number };
    campaigns: { total: number; active: number; warning: number; paused: number };
}

interface InfraReport {
    id: string;
    report_type: string;
    assessment_version: string;
    overall_score: number;
    summary: SummaryData;
    findings: Finding[];
    recommendations: Recommendation[];
    created_at: string;
}

const SEVERITY_CONFIG = {
    critical: { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B', accent: '#EF4444', icon: '🔴', label: 'Critical' },
    warning: { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E', accent: '#F59E0B', icon: '🟡', label: 'Warning' },
    info: { bg: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF', accent: '#3B82F6', icon: '🔵', label: 'Info' },
};

function getScoreColor(score: number): string {
    if (score >= 80) return '#16A34A';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
}

function getScoreLabel(score: number): string {
    if (score >= 80) return 'Healthy';
    if (score >= 60) return 'Needs Attention';
    return 'Critical';
}

function getScoreEmoji(score: number): string {
    if (score >= 80) return '✅';
    if (score >= 60) return '⚠️';
    return '🚨';
}

export default function InfrastructureHealthPage() {
    const [report, setReport] = useState<InfraReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reassessing, setReassessing] = useState(false);
    const [reassessResult, setReassessResult] = useState<string | null>(null);
    const [expandedDomain, setExpandedDomain] = useState<string | null>(null);
    const [dnsDetails, setDnsDetails] = useState<Record<string, any>>({});
    const [dnsLoading, setDnsLoading] = useState<string | null>(null);

    // ── Transition Gate State ──
    const [gateData, setGateData] = useState<any>(null);
    const [gateLoading, setGateLoading] = useState(false);
    const [acknowledging, setAcknowledging] = useState(false);
    const [ackResult, setAckResult] = useState<string | null>(null);

    // ── Recovery Status State ──
    const [recoveryData, setRecoveryData] = useState<any>(null);
    const [recoveryLoading, setRecoveryLoading] = useState(false);

    // ── Score History ──
    const [scoreHistory, setScoreHistory] = useState<Array<{ date: string; score: number }>>([]);

    // ── Expanded Finding (for collapsible remediation) ──
    const [expandedFinding, setExpandedFinding] = useState<string | null>(null);

    const fetchReport = useCallback(() => {
        setLoading(true);
        setError(null);
        apiClient<any>('/api/assessment/report')
            .then(data => {
                if (data) {
                    setReport(data);
                } else {
                    setReport(null);
                }
            })
            .catch(err => {
                // If 404, it means no report exists yet, which is not a crash-worthy error
                if (err.message && err.message.includes('404')) {
                    setReport(null);
                } else {
                    setError(err.message || 'Failed to fetch report');
                }
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchReport();
        fetchTransitionGate();
        fetchRecoveryStatus();
        fetchScoreHistory();
    }, [fetchReport]);

    const fetchScoreHistory = async () => {
        try {
            const data = await apiClient<any[]>('/api/assessment/reports');
            if (data && Array.isArray(data)) {
                setScoreHistory(
                    data.reverse().map((r: any) => ({
                        date: new Date(r.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                        score: r.overall_score ?? 0,
                    }))
                );
            }
        } catch (err) {
            console.error('Failed to fetch score history:', err);
        }
    };

    const fetchTransitionGate = async () => {
        setGateLoading(true);
        try {
            const data = await apiClient<any>('/api/healing/transition-gate');
            if (data) {
                setGateData(data);
            }
        } catch (err) {
            console.error('Failed to fetch transition gate:', err);
        } finally {
            setGateLoading(false);
        }
    };

    const fetchRecoveryStatus = async () => {
        setRecoveryLoading(true);
        try {
            const data = await apiClient<any>('/api/healing/recovery-status');
            if (data) {
                setRecoveryData(data);
            }
        } catch (err) {
            console.error('Failed to fetch recovery status:', err);
        } finally {
            setRecoveryLoading(false);
        }
    };

    const handleAcknowledge = async () => {
        setAcknowledging(true);
        setAckResult(null);
        try {
            await apiClient('/api/healing/acknowledge-transition', { method: 'POST' });
            setAckResult('Transition acknowledged. System will operate with current infrastructure.');
            fetchTransitionGate();
        } catch (err: any) {
            setAckResult(`Error: ${err.message}`);
        } finally {
            setAcknowledging(false);
        }
    };

    const handleReassess = async () => {
        setReassessing(true);
        setReassessResult(null);
        try {
            await apiClient('/api/assessment/run', { method: 'POST' });
            setReassessResult('Assessment completed successfully! Refreshing report...');
            setTimeout(fetchReport, 1000);
        } catch (err: any) {
            setReassessResult(`Assessment failed: ${err.message || 'Unknown error'}`);
        } finally {
            setReassessing(false);
        }
    };

    const fetchDNSDetails = async (domainId: string) => {
        if (expandedDomain === domainId) {
            setExpandedDomain(null);
            return;
        }
        setExpandedDomain(domainId);
        if (dnsDetails[domainId]) return;

        setDnsLoading(domainId);
        try {
            const data = await apiClient<any>(`/api/assessment/domain/${domainId}/dns`);
            if (data) {
                setDnsDetails(prev => ({ ...prev, [domainId]: data }));
            }
        } catch (err) {
            console.error('Failed to fetch DNS details:', err);
        } finally {
            setDnsLoading(null);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem' }}>
                <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    border: '3px solid #E5E7EB', borderTopColor: '#2563EB',
                    animation: 'spin 0.8s linear infinite'
                }} />
                <span style={{ color: '#6B7280', fontSize: '1.1rem' }}>Loading Infrastructure Health...</span>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (error) {
        return (
            <div className="premium-card" style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '0.75rem' }}>Failed to Load Report</h2>
                <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>{error}</p>
                <button onClick={fetchReport} className="premium-btn">Retry</button>
            </div>
        );
    }

    if (!report) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80%', gap: '2rem' }}>
                <div style={{
                    width: '120px', height: '120px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #EFF6FF, #F5F3FF)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                }}>
                    <span style={{ fontSize: '3rem' }}>🏗️</span>
                </div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.025em' }}>
                    No Infrastructure Assessment Yet
                </h2>
                <p style={{ color: '#6B7280', fontSize: '1rem', maxWidth: '600px', textAlign: 'center', lineHeight: '1.6' }}>
                    Run your first assessment to get a complete health report. Here&apos;s what we&apos;ll check:
                </p>

                {/* 3-step guide */}
                <div style={{ display: 'flex', gap: '1.5rem', maxWidth: '750px', width: '100%' }}>
                    {[
                        { icon: '🔍', title: 'Scan', desc: 'Check your domains for SPF, DKIM, DMARC records and blacklist status' },
                        { icon: '📊', title: 'Analyze', desc: 'Review mailbox bounce rates and campaign send performance metrics' },
                        { icon: '📋', title: 'Report', desc: 'Get a scored report with specific findings and remediation steps' },
                    ].map((step, i) => (
                        <div key={step.title} style={{
                            flex: 1, padding: '1.5rem', borderRadius: '20px',
                            background: '#fff', border: '1px solid #E5E7EB',
                            textAlign: 'center', position: 'relative',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                        }}>
                            <div style={{
                                position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                                width: '24px', height: '24px', borderRadius: '50%',
                                background: '#2563EB', color: '#fff', fontSize: '0.75rem',
                                fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>{i + 1}</div>
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{step.icon}</div>
                            <div style={{ fontWeight: 800, color: '#111827', marginBottom: '0.35rem' }}>{step.title}</div>
                            <div style={{ color: '#6B7280', fontSize: '0.825rem', lineHeight: 1.5 }}>{step.desc}</div>
                        </div>
                    ))}
                </div>

                <button onClick={handleReassess} className="premium-btn" disabled={reassessing}
                    style={{ padding: '1rem 2rem', fontSize: '1rem', background: '#2563EB', borderRadius: '16px' }}>
                    {reassessing ? 'Running Assessment...' : '🔍 Run Infrastructure Assessment'}
                </button>
                {reassessResult && (
                    <div className="premium-card" style={{ padding: '1rem 1.5rem', maxWidth: '500px', textAlign: 'center' }}>
                        {reassessResult}
                    </div>
                )}
            </div>
        );
    }

    // Build chart data
    const findings = report.findings || [];
    const recommendations = report.recommendations || [];
    const criticalCount = findings.filter(f => f.severity === 'critical').length;
    const warningCount = findings.filter(f => f.severity === 'warning').length;
    const infoCount = findings.filter(f => f.severity === 'info').length;

    const findingsChartData = [
        { name: 'Critical', value: criticalCount, color: '#EF4444' },
        { name: 'Warning', value: warningCount, color: '#F59E0B' },
        { name: 'Info', value: infoCount, color: '#3B82F6' },
    ].filter(d => d.value > 0);

    // Group findings by category
    const findingsByCategory = findings.reduce<Record<string, Finding[]>>((acc, f) => {
        const cat = f.category || 'general';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(f);
        return acc;
    }, {});

    // Extract unique domain findings for DNS drill-down
    const domainFindings = findings.filter(f => f.category === 'domain_dns' && f.entityId);
    const uniqueDomainIds = [...new Set(domainFindings.map(f => f.entityId).filter(Boolean))] as string[];

    const scoreColor = getScoreColor(report.overall_score);

    return (
        <div className="grid gap-6">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span>Infrastructure Health</span>
                    </h1>
                    <p className="page-subtitle">
                        Assessment report from {new Date(report.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })} at {new Date(report.created_at).toLocaleTimeString(undefined, { timeStyle: 'short' })}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <span style={{
                        background: '#F3F4F6', padding: '0.4rem 1rem', borderRadius: '999px',
                        fontSize: '0.75rem', fontWeight: 600, color: '#6B7280'
                    }}>
                        v{report.assessment_version} • {report.report_type.replace(/_/g, ' ')}
                    </span>
                    <button
                        onClick={handleReassess}
                        disabled={reassessing}
                        className="premium-btn"
                        style={{
                            background: '#2563EB', fontSize: '0.875rem', padding: '0.6rem 1.25rem',
                            borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem',
                            opacity: reassessing ? 0.6 : 1
                        }}
                    >
                        {reassessing ? (
                            <>
                                <div style={{
                                    width: '16px', height: '16px', borderRadius: '50%',
                                    border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
                                    animation: 'spin 0.8s linear infinite'
                                }} />
                                Re-assessing...
                            </>
                        ) : (
                            <>🔄 Re-assess</>
                        )}
                    </button>
                </div>
            </div>

            {reassessResult && (
                <div className="premium-card" style={{
                    padding: '1rem 1.5rem',
                    background: reassessResult.includes('success') ? '#F0FDF4' : '#FEF2F2',
                    border: `1px solid ${reassessResult.includes('success') ? '#BBF7D0' : '#FECACA'}`,
                    display: 'flex', alignItems: 'center', gap: '0.75rem'
                }}>
                    <span>{reassessResult.includes('success') ? '✅' : '❌'}</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{reassessResult}</span>
                </div>
            )}

            {/* Score + Summary Row */}

            {/* ── TRANSITION GATE BANNER ── */}
            {gateData && !gateData.canProceed && gateData.score !== undefined && (
                <div className="premium-card" style={{
                    background: 'linear-gradient(135deg, #FEF3C7, #FFFBEB)',
                    border: '2px solid #F59E0B',
                    borderRadius: '20px',
                    padding: '1.75rem 2rem',
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    <div style={{
                        position: 'absolute', top: '-20px', right: '-20px',
                        width: '120px', height: '120px', borderRadius: '50%',
                        background: 'rgba(245, 158, 11, 0.08)',
                    }} />
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem' }}>
                        <div style={{
                            width: '56px', height: '56px', borderRadius: '16px',
                            background: '#FEF3C7', border: '2px solid #FDE68A',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.75rem', flexShrink: 0,
                        }}>
                            ⚠️
                        </div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#92400E', marginBottom: '0.5rem' }}>
                                Infrastructure Score Below Threshold
                            </h3>
                            <p style={{ color: '#78350F', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                                Your infrastructure scored <strong>{gateData.score}/100</strong>.
                                {gateData.pausedCount !== undefined && (
                                    <> <strong>{gateData.pausedCount}</strong> of <strong>{gateData.totalCount}</strong> entities are paused.</>)}
                                {' '}The system requires your acknowledgment before allowing email operations on this infrastructure.
                            </p>
                            <p style={{ color: '#92400E', fontSize: '0.8rem', lineHeight: 1.5, marginBottom: '1rem', fontStyle: 'italic' }}>
                                By acknowledging, you confirm awareness that sending through degraded infrastructure may impact your email reputation.
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <button
                                    onClick={handleAcknowledge}
                                    disabled={acknowledging || gateData.score === 0}
                                    style={{
                                        padding: '0.75rem 1.5rem', borderRadius: '14px',
                                        background: gateData.score === 0 ? '#D1D5DB' : 'linear-gradient(135deg, #F59E0B, #D97706)',
                                        color: '#fff', fontWeight: 700, fontSize: '0.9rem',
                                        border: 'none', cursor: gateData.score === 0 ? 'not-allowed' : 'pointer',
                                        boxShadow: gateData.score === 0 ? 'none' : '0 4px 14px rgba(245, 158, 11, 0.4)',
                                        transition: 'all 0.2s',
                                        opacity: acknowledging ? 0.6 : 1,
                                    }}
                                >
                                    {acknowledging ? 'Acknowledging...' : gateData.score === 0
                                        ? '🔒 All Entities Paused — Manual Healing Required'
                                        : '✅ I Understand the Risks — Proceed'
                                    }
                                </button>
                                <span style={{ fontSize: '0.75rem', color: '#92400E' }}>
                                    Score must be above 0 to proceed
                                </span>
                            </div>
                            {ackResult && (
                                <div style={{
                                    marginTop: '0.75rem', padding: '0.6rem 1rem', borderRadius: '10px',
                                    background: ackResult.includes('acknowledged') ? '#DCFCE7' : '#FEF2F2',
                                    border: `1px solid ${ackResult.includes('acknowledged') ? '#BBF7D0' : '#FECACA'}`,
                                    fontSize: '0.85rem', fontWeight: 500,
                                    color: ackResult.includes('acknowledged') ? '#166534' : '#991B1B',
                                }}>
                                    {ackResult}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── RECOVERY STATUS PANEL ── */}
            {recoveryData && recoveryData.summary && recoveryData.summary.totalRecovering > 0 && (
                <div className="premium-card" style={{ borderRadius: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            🩺 Recovery Status
                        </h2>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <span style={{
                                padding: '0.3rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                                background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE',
                            }}>
                                {recoveryData.summary.mailboxCount} mailboxes
                            </span>
                            <span style={{
                                padding: '0.3rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                                background: '#F5F3FF', color: '#7C3AED', border: '1px solid #DDD6FE',
                            }}>
                                {recoveryData.summary.domainCount} domains
                            </span>
                        </div>
                    </div>

                    {/* Mailbox Recovery Items */}
                    {recoveryData.mailboxes && recoveryData.mailboxes.length > 0 && (
                        <div style={{ marginBottom: '1rem' }}>
                            <div style={{
                                fontSize: '0.7rem', fontWeight: 700, color: '#9CA3AF',
                                textTransform: 'uppercase', letterSpacing: '0.1em',
                                marginBottom: '0.5rem', paddingLeft: '0.25rem',
                            }}>
                                Mailboxes
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {recoveryData.mailboxes.map((mb: any) => (
                                    <RecoveryEntityRow
                                        key={mb.id}
                                        label={mb.email}
                                        phase={mb.recovery_phase}
                                        resilience={mb.resilience_score}
                                        volumeLimit={mb.volumeLimit}
                                        phaseEnteredAt={mb.phase_entered_at}
                                        cleanSends={mb.clean_sends_since_phase}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Domain Recovery Items */}
                    {recoveryData.domains && recoveryData.domains.length > 0 && (
                        <div>
                            <div style={{
                                fontSize: '0.7rem', fontWeight: 700, color: '#9CA3AF',
                                textTransform: 'uppercase', letterSpacing: '0.1em',
                                marginBottom: '0.5rem', paddingLeft: '0.25rem',
                            }}>
                                Domains
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {recoveryData.domains.map((d: any) => (
                                    <RecoveryEntityRow
                                        key={d.id}
                                        label={d.domain}
                                        phase={d.recovery_phase}
                                        resilience={d.resilience_score}
                                        volumeLimit={d.volumeLimit}
                                        phaseEnteredAt={d.phase_entered_at}
                                        cleanSends={d.clean_sends_since_phase}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
            {/* Score Row: Gauge + Entity Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Overall Score with Explainer */}
                <div className="premium-card" style={{ textAlign: 'center', position: 'relative' }}>
                    <div style={{ height: '180px', position: 'relative' }}>
                        <ScoreGauge score={report.overall_score} scoreColor={scoreColor} />
                        <div style={{
                            position: 'absolute', top: '50%', left: '50%',
                            transform: 'translate(-50%, -50%)', textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: scoreColor, lineHeight: 1 }}>
                                {report.overall_score}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600, marginTop: '2px' }}>
                                / 100
                            </div>
                        </div>
                    </div>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        background: `${scoreColor}15`, color: scoreColor,
                        padding: '0.4rem 1rem', borderRadius: '999px',
                        fontSize: '0.875rem', fontWeight: 700
                    }}>
                        {getScoreEmoji(report.overall_score)} {getScoreLabel(report.overall_score)}
                    </span>
                    {/* Score Explainer */}
                    <p style={{ color: '#6B7280', fontSize: '0.75rem', marginTop: '0.75rem', lineHeight: 1.5 }}>
                        {(() => {
                            const issues: string[] = [];
                            if (report.summary.domains?.warning > 0) issues.push(`${report.summary.domains.warning} domain warning(s)`);
                            if (report.summary.domains?.paused > 0) issues.push(`${report.summary.domains.paused} paused domain(s)`);
                            if (report.summary.mailboxes?.warning > 0) issues.push(`${report.summary.mailboxes.warning} mailbox warning(s)`);
                            if (report.summary.mailboxes?.paused > 0) issues.push(`${report.summary.mailboxes.paused} paused mailbox(es)`);
                            if (report.summary.campaigns?.warning > 0) issues.push(`${report.summary.campaigns.warning} campaign warning(s)`);
                            if (report.summary.campaigns?.paused > 0) issues.push(`${report.summary.campaigns.paused} paused campaign(s)`);
                            return issues.length > 0
                                ? `Score reflects ${issues.join(', ')}.`
                                : 'All entities are healthy!';
                        })()}
                    </p>
                    <div style={{ color: '#9CA3AF', fontSize: '0.65rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                        ℹ️ Score = healthy entities ÷ total entities × 100
                    </div>
                </div>

                {/* Entity Status Cards */}
                {[
                    { icon: '🌐', label: 'Domains', data: report.summary.domains, states: ['healthy', 'warning', 'paused'] },
                    { icon: '📬', label: 'Mailboxes', data: report.summary.mailboxes, states: ['healthy', 'warning', 'paused'] },
                    { icon: '📣', label: 'Campaigns', data: report.summary.campaigns, states: ['active', 'warning', 'paused'] },
                ].map(card => {
                    const total = card.data?.total || 0;
                    const slot1 = card.data?.[card.states[0] as keyof typeof card.data] || 0;
                    const slot2 = card.data?.[card.states[1] as keyof typeof card.data] || 0;
                    const slot3 = card.data?.[card.states[2] as keyof typeof card.data] || 0;
                    return (
                        <div key={card.label} className="premium-card" style={{ position: 'relative' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                <span style={{ fontSize: '1.25rem' }}>{card.icon}</span>
                                <span style={{ fontWeight: 700, color: '#111827', fontSize: '1rem' }}>{card.label}</span>
                                <span style={{ marginLeft: 'auto', fontWeight: 800, color: '#111827', fontSize: '1.5rem' }}>{total}</span>
                            </div>
                            {/* Stacked Status Bar */}
                            <div style={{ height: '8px', borderRadius: '4px', background: '#F3F4F6', overflow: 'hidden', display: 'flex' }}>
                                {total > 0 && (
                                    <>
                                        <div style={{ width: `${(slot1 / total) * 100}%`, background: '#16A34A', transition: 'width 0.6s ease' }} />
                                        <div style={{ width: `${(slot2 / total) * 100}%`, background: '#F59E0B', transition: 'width 0.6s ease' }} />
                                        <div style={{ width: `${(slot3 / total) * 100}%`, background: '#EF4444', transition: 'width 0.6s ease' }} />
                                    </>
                                )}
                            </div>
                            {/* Legend */}
                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', fontSize: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16A34A' }} />
                                    <span style={{ color: '#6B7280' }}>{card.states[0].charAt(0).toUpperCase() + card.states[0].slice(1)}: <strong>{slot1}</strong></span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }} />
                                    <span style={{ color: '#6B7280' }}>Warning: <strong>{slot2}</strong></span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} />
                                    <span style={{ color: '#6B7280' }}>Paused: <strong>{slot3}</strong></span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Score History */}
            {scoreHistory.length > 1 && (
                <div className="premium-card">
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111827', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        📈 Score History
                    </h2>
                    <div style={{ height: '200px' }}>
                        <ScoreHistory data={scoreHistory} />
                    </div>
                </div>
            )}

            {/* Findings Distribution + Findings List */}
            {findings.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Distribution Chart */}
                    <div className="premium-card">
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111827', marginBottom: '1rem' }}>
                            Findings Breakdown
                        </h2>
                        <div style={{ height: '200px' }}>
                            <FindingsChart data={findingsChartData} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                            {findingsChartData.map(d => (
                                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#6B7280' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: d.color }} />
                                    {d.name} ({d.value})
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Findings List */}
                    <div className="premium-card" style={{ gridColumn: 'span 2' }}>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111827', marginBottom: '1rem' }}>
                            All Findings
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '500px', overflowY: 'auto' }} className="scrollbar-hide">
                            {Object.entries(findingsByCategory).map(([category, catFindings]) => {
                                const CATEGORY_LABELS: Record<string, string> = {
                                    domain_dns: '🌐 Domain DNS',
                                    mailbox_health: '📬 Mailbox Health',
                                    campaign_health: '📣 Campaign Health',
                                };
                                return (
                                    <div key={category}>
                                        <div style={{
                                            fontSize: '0.7rem', fontWeight: 700, color: '#9CA3AF',
                                            textTransform: 'uppercase', letterSpacing: '0.1em',
                                            marginBottom: '0.5rem', paddingLeft: '0.25rem'
                                        }}>
                                            {CATEGORY_LABELS[category] || category.replace(/_/g, ' ')}
                                        </div>
                                        {catFindings.map((finding, idx) => {
                                            const sev = SEVERITY_CONFIG[finding.severity] || SEVERITY_CONFIG.info;
                                            const findingKey = `${category}-${idx}`;
                                            const isExpanded = expandedFinding === findingKey;
                                            return (
                                                <div key={findingKey} style={{
                                                    padding: '0.875rem 1rem',
                                                    borderRadius: '12px',
                                                    background: sev.bg,
                                                    border: `1px solid ${sev.border}`,
                                                    borderLeft: `4px solid ${sev.accent}`,
                                                    marginBottom: '0.5rem',
                                                    transition: 'all 0.2s',
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <span>{sev.icon}</span>
                                                            <span style={{ fontWeight: 700, color: sev.text, fontSize: '0.9rem' }}>
                                                                {finding.title}
                                                            </span>
                                                        </div>
                                                        <span style={{
                                                            fontSize: '0.65rem', fontWeight: 700, color: sev.text,
                                                            background: `${sev.accent}15`, padding: '0.2rem 0.6rem',
                                                            borderRadius: '999px', textTransform: 'uppercase'
                                                        }}>
                                                            {sev.label}
                                                        </span>
                                                    </div>
                                                    <div style={{ color: sev.text, fontSize: '0.825rem', marginTop: '0.35rem', opacity: 0.85, lineHeight: 1.5 }}>
                                                        {finding.details}
                                                    </div>
                                                    {/* Entity Name (human-readable) */}
                                                    {finding.entity && (
                                                        <div style={{ fontSize: '0.75rem', color: sev.text, opacity: 0.7, marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                                            <span style={{ fontWeight: 600 }}>{finding.entity}:</span>
                                                            <span>{finding.entityName || finding.entityId}</span>
                                                            {finding.category === 'domain_dns' && (
                                                                <span
                                                                    style={{ fontSize: '0.7rem', marginLeft: 'auto', cursor: 'pointer', textDecoration: 'underline' }}
                                                                    onClick={(e) => { e.stopPropagation(); finding.entityId && fetchDNSDetails(finding.entityId); }}
                                                                >
                                                                    {expandedDomain === finding.entityId ? '▲ Hide DNS' : '▼ View DNS'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Collapsible Remediation */}
                                                    {finding.remediation && (
                                                        <div style={{ marginTop: '0.5rem' }}>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setExpandedFinding(isExpanded ? null : findingKey); }}
                                                                style={{
                                                                    background: 'none', border: 'none', cursor: 'pointer',
                                                                    fontSize: '0.75rem', fontWeight: 700, color: sev.accent,
                                                                    padding: '0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.35rem',
                                                                }}
                                                            >
                                                                🔧 {isExpanded ? 'Hide fix ▲' : 'How to fix ▼'}
                                                            </button>
                                                            {isExpanded && (
                                                                <div style={{
                                                                    marginTop: '0.35rem', padding: '0.6rem 0.75rem',
                                                                    borderRadius: '8px', background: `${sev.accent}08`,
                                                                    border: `1px dashed ${sev.border}`,
                                                                    fontSize: '0.8rem', color: sev.text, lineHeight: 1.6,
                                                                }}>
                                                                    {finding.remediation}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Expandable DNS Details */}
                                                    {expandedDomain === finding.entityId && finding.category === 'domain_dns' && (
                                                        <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: `1px solid ${sev.border}` }}>
                                                            {dnsLoading === finding.entityId ? (
                                                                <div style={{ textAlign: 'center', padding: '0.5rem', color: sev.text, fontSize: '0.8rem' }}>
                                                                    Checking DNS records...
                                                                </div>
                                                            ) : dnsDetails[finding.entityId!] ? (
                                                                <DNSDetailPanel dns={dnsDetails[finding.entityId!].dns} domain={dnsDetails[finding.entityId!].domain} />
                                                            ) : (
                                                                <div style={{ textAlign: 'center', padding: '0.5rem', color: sev.text, fontSize: '0.8rem' }}>
                                                                    Click to load DNS details
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
                <div className="premium-card">
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        💡 Recommendations
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {recommendations.sort((a, b) => a.priority - b.priority).map((rec, idx) => (
                            <div key={idx} style={{
                                display: 'flex', gap: '1rem', alignItems: 'flex-start',
                                padding: '1rem 1.25rem', borderRadius: '16px',
                                background: '#F8FAFC', border: '1px solid #E2E8F0',
                                transition: 'all 0.2s'
                            }} className="hover:shadow-md">
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    background: rec.priority <= 2 ? '#FEF2F2' : rec.priority <= 4 ? '#FFFBEB' : '#EFF6FF',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.8rem', fontWeight: 800, flexShrink: 0,
                                    color: rec.priority <= 2 ? '#EF4444' : rec.priority <= 4 ? '#F59E0B' : '#3B82F6',
                                    border: `1px solid ${rec.priority <= 2 ? '#FECACA' : rec.priority <= 4 ? '#FDE68A' : '#BFDBFE'}`
                                }}>
                                    {rec.priority}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                                        {rec.action}
                                    </div>
                                    <div style={{ color: '#64748B', fontSize: '0.825rem', lineHeight: 1.5 }}>
                                        {rec.reason}
                                    </div>
                                </div>
                                {rec.link && (
                                    <Link
                                        href={rec.link}
                                        style={{
                                            padding: '0.4rem 1rem', borderRadius: '10px',
                                            background: '#2563EB', color: '#fff',
                                            fontSize: '0.75rem', fontWeight: 700,
                                            textDecoration: 'none', whiteSpace: 'nowrap',
                                            display: 'flex', alignItems: 'center', gap: '0.25rem',
                                            flexShrink: 0, alignSelf: 'center',
                                        }}
                                    >
                                        View →
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

// ── DNS Detail Panel (inline) ──
function DNSDetailPanel({ dns, domain }: { dns: any; domain: string }) {
    if (!dns) return null;

    const records = [
        { label: 'SPF', valid: dns.spfValid, icon: dns.spfValid ? '✅' : '❌' },
        { label: 'DKIM', valid: dns.dkimValid, icon: dns.dkimValid ? '✅' : '❌' },
        { label: 'DMARC', policy: dns.dmarcPolicy, icon: dns.dmarcPolicy && dns.dmarcPolicy !== 'none' ? '✅' : '⚠️' },
    ];

    return (
        <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '0.5rem' }}>
                DNS Records for {domain}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
                {records.map(r => (
                    <div key={r.label} style={{
                        padding: '0.5rem', borderRadius: '8px', background: '#fff',
                        border: '1px solid #E5E7EB', textAlign: 'center',
                        fontSize: '0.75rem'
                    }}>
                        <div style={{ fontSize: '1.25rem', marginBottom: '0.15rem' }}>{r.icon}</div>
                        <div style={{ fontWeight: 700, color: '#374151' }}>{r.label}</div>
                        {'policy' in r && <div style={{ color: '#6B7280', fontSize: '0.7rem' }}>{r.policy || 'none'}</div>}
                    </div>
                ))}
            </div>

            {/* Blacklist Results */}
            {dns.blacklistResults && Object.keys(dns.blacklistResults).length > 0 && (
                <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151', marginBottom: '0.35rem' }}>Blacklist Check</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {Object.entries(dns.blacklistResults).map(([bl, status]) => (
                            <span key={bl} style={{
                                padding: '0.15rem 0.5rem', borderRadius: '999px',
                                fontSize: '0.65rem', fontWeight: 600,
                                background: status === 'CONFIRMED' ? '#FEE2E2' : status === 'NOT_LISTED' ? '#DCFCE7' : '#FEF3C7',
                                color: status === 'CONFIRMED' ? '#991B1B' : status === 'NOT_LISTED' ? '#166534' : '#92400E',
                                border: `1px solid ${status === 'CONFIRMED' ? '#FECACA' : status === 'NOT_LISTED' ? '#BBF7D0' : '#FDE68A'}`
                            }}>
                                {bl}: {status as string}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#6B7280' }}>
                Score: <span style={{ fontWeight: 700, color: getScoreColor(dns.score) }}>{dns.score}/100</span>
            </div>
        </div>
    );
}

// ── Recovery Entity Row ──
const PHASE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; progress: number }> = {
    paused: { label: 'Paused', color: '#991B1B', bg: '#FEF2F2', border: '#FECACA', progress: 0 },
    quarantine: { label: 'Quarantine', color: '#92400E', bg: '#FFFBEB', border: '#FDE68A', progress: 25 },
    restricted_send: { label: 'Restricted Send', color: '#1E40AF', bg: '#EFF6FF', border: '#BFDBFE', progress: 50 },
    warm_recovery: { label: 'Warm Recovery', color: '#065F46', bg: '#ECFDF5', border: '#A7F3D0', progress: 75 },
    healthy: { label: 'Healthy', color: '#166534', bg: '#F0FDF4', border: '#BBF7D0', progress: 100 },
};

function RecoveryEntityRow({
    label, phase, resilience, volumeLimit, phaseEnteredAt, cleanSends,
}: {
    label: string;
    phase: string;
    resilience?: number;
    volumeLimit?: number;
    phaseEnteredAt?: string;
    cleanSends?: number;
}) {
    const cfg = PHASE_CONFIG[phase] || PHASE_CONFIG.paused;
    const timeInPhase = phaseEnteredAt
        ? formatDuration(Date.now() - new Date(phaseEnteredAt).getTime())
        : null;

    return (
        <div style={{
            padding: '0.875rem 1.25rem', borderRadius: '14px',
            background: cfg.bg, border: `1px solid ${cfg.border}`,
            display: 'flex', alignItems: 'center', gap: '1rem',
            transition: 'all 0.2s',
        }}>
            {/* Phase badge */}
            <div style={{
                padding: '0.25rem 0.7rem', borderRadius: '999px',
                background: `${cfg.color}12`, border: `1px solid ${cfg.color}30`,
                color: cfg.color, fontSize: '0.7rem', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.05em',
                whiteSpace: 'nowrap',
            }}>
                {cfg.label}
            </div>

            {/* Entity name */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {label}
                </div>
                {/* Progress bar */}
                <div style={{
                    marginTop: '0.35rem', height: '4px', borderRadius: '2px',
                    background: '#E5E7EB', overflow: 'hidden',
                }}>
                    <div style={{
                        width: `${cfg.progress}%`, height: '100%',
                        background: `linear-gradient(90deg, ${cfg.color}80, ${cfg.color})`,
                        borderRadius: '2px', transition: 'width 0.6s ease',
                    }} />
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
                {resilience !== undefined && resilience !== null && (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.6rem', color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase' }}>Resilience</div>
                        <div style={{
                            fontSize: '0.85rem', fontWeight: 800,
                            color: resilience >= 70 ? '#16A34A' : resilience >= 30 ? '#F59E0B' : '#EF4444',
                        }}>
                            {resilience}
                        </div>
                    </div>
                )}
                {cleanSends !== undefined && cleanSends !== null && (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.6rem', color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase' }}>Clean Sends</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#374151' }}>
                            {cleanSends}
                        </div>
                    </div>
                )}
                {volumeLimit !== undefined && volumeLimit !== null && (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.6rem', color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase' }}>Vol. Limit</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#374151' }}>
                            {volumeLimit}%
                        </div>
                    </div>
                )}
                {timeInPhase && (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.6rem', color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase' }}>In Phase</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#6B7280' }}>
                            {timeInPhase}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function formatDuration(ms: number): string {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    if (hours < 1) return '<1h';
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
}

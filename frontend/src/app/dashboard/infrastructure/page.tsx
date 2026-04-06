'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { apiClient } from '@/lib/api';
import type { InfraFinding, InfraRecommendation, InfraSummaryData, InfraReport } from '@/types/api';
import { HelpLink } from '@/components/HelpLink';
import { Tooltip } from '@/components/Tooltip';
import { getScoreColor, getScoreLabel, getScoreEmoji } from '@/lib/statusHelpers';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import AssessmentConfirmationModal from '@/components/AssessmentConfirmationModal';
import AssessmentProgressOverlay from '@/components/AssessmentProgressOverlay';

import TransitionGateBanner from './TransitionGateBanner';
// Recovery and warmup panels moved to /dashboard/healing
import FindingsSection from './FindingsSection';
import RecommendationsList from './RecommendationsList';

const ScoreGauge = dynamic(() => import('./Charts').then(mod => ({ default: mod.ScoreGauge })), { ssr: false });
const ScoreHistory = dynamic(() => import('./Charts').then(mod => ({ default: mod.ScoreHistory })), { ssr: false });


export default function InfrastructureHealthPage() {
    const [report, setReport] = useState<InfraReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reassessing, setReassessing] = useState(false);
    const [reassessResult, setReassessResult] = useState<string | null>(null);
    const [assessmentStage, setAssessmentStage] = useState<'syncing' | 'assessing' | 'finalizing'>('syncing');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [expandedDomain, setExpandedDomain] = useState<string | null>(null);
    const [dnsDetails, setDnsDetails] = useState<Record<string, Record<string, any>>>({});
    const [dnsLoading, setDnsLoading] = useState<string | null>(null);

    // ── Transition Gate State ──
    const [gateData, setGateData] = useState<Record<string, any> | null>(null);
    const [gateLoading, setGateLoading] = useState(false);
    const [acknowledging, setAcknowledging] = useState(false);
    const [ackResult, setAckResult] = useState<string | null>(null);

    // ── Recovery Status State ──
    const [recoveryData, setRecoveryData] = useState<Record<string, any> | null>(null);
    const [recoveryLoading, setRecoveryLoading] = useState(false);

    // ── Score History ──
    const [scoreHistory, setScoreHistory] = useState<Array<{ date: string; score: number }>>([]);
    const [scoreRange, setScoreRange] = useState<'7' | '30' | '90'>('30');

    // Warmup status + check moved to /dashboard/healing

    const fetchReport = useCallback(() => {
        setLoading(true);
        setError(null);
        apiClient<InfraReport>('/api/assessment/report')
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

    const fetchAll = useCallback(() => {
        fetchReport();
        fetchTransitionGate();
        fetchRecoveryStatus();
        fetchScoreHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchReport]);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    // Auto-refresh when infrastructure assessment completes
    useEffect(() => {
        const handler = () => {
            fetchReport();
            fetchScoreHistory();
        };
        window.addEventListener('assessment-complete', handler);
        return () => window.removeEventListener('assessment-complete', handler);
    }, [fetchReport]);

    // Refetch score history when range changes
    useEffect(() => {
        fetchScoreHistory(scoreRange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scoreRange]);

    const fetchScoreHistory = async (days: string = scoreRange) => {
        try {
            const data = await apiClient<InfraReport[]>(`/api/assessment/reports?days=${days}`);
            if (data && Array.isArray(data)) {
                // Deduplicate by day — keep only the latest assessment per day
                const byDay = new Map<string, number>();
                data.reverse().forEach((r: { created_at: string; overall_score?: number }) => {
                    const dayKey = new Date(r.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                    byDay.set(dayKey, r.overall_score ?? 0); // later entries overwrite earlier ones
                });
                setScoreHistory(
                    Array.from(byDay.entries()).map(([date, score]) => ({ date, score }))
                );
            }
        } catch (err) {
            console.error('Failed to fetch score history:', err);
        }
    };

    const fetchTransitionGate = async () => {
        setGateLoading(true);
        try {
            const data = await apiClient<Record<string, any>>('/api/healing/transition-gate');
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
            const data = await apiClient<Record<string, any>>('/api/healing/recovery-status');
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
        setAssessmentStage('syncing');
        try {
            setTimeout(() => setAssessmentStage('assessing'), 2000);
            setTimeout(() => setAssessmentStage('finalizing'), 5000);
            await apiClient('/api/assessment/run', { method: 'POST' });
            setReassessResult('Assessment completed successfully! Refreshing report...');
            setTimeout(fetchReport, 1000);

            // Show confirmation modal if there are critical findings
            const findingsData = await apiClient<{ findings: InfraFinding[] }>('/api/findings').catch(() => null);
            const criticalFindings = (findingsData?.findings || []).filter((f: InfraFinding) => f.severity === 'critical' || f.severity === 'warning');
            if (criticalFindings.length > 0) {
                setShowConfirmModal(true);
            }
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
            const data = await apiClient<Record<string, any>>(`/api/assessment/domain/${domainId}/dns`);
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
            <div className="p-8">
                <LoadingSkeleton type="card" rows={3} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="premium-card max-w-[600px] mx-auto mt-16 text-center">
                <div className="text-[3rem] mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Failed to Load Report</h2>
                <p className="text-gray-500 mb-6">{error}</p>
                <button onClick={fetchReport} className="premium-btn">Retry</button>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="flex flex-col items-center justify-center h-[80%] gap-8">
                <div className="w-[120px] h-[120px] rounded-full flex items-center justify-center shadow-xl" style={{
                    background: 'linear-gradient(135deg, #EFF6FF, #F5F3FF)',
                }}>
                    <span className="text-[3rem]">🏗️</span>
                </div>
                <h2 className="text-[1.75rem] font-extrabold text-gray-900 tracking-tight">
                    No Infrastructure Assessment Yet
                </h2>
                <p className="text-gray-500 text-base max-w-[600px] text-center leading-relaxed">
                    Run your first assessment to get a complete health report. Here&apos;s what we&apos;ll check:
                </p>

                {/* 3-step guide */}
                <div className="flex gap-6 max-w-[750px] w-full">
                    {[
                        { icon: '🔍', title: 'Scan', desc: 'Check your domains for SPF, DKIM, DMARC records and blacklist status' },
                        { icon: '📊', title: 'Analyze', desc: 'Review mailbox bounce rates and campaign send performance metrics' },
                        { icon: '📋', title: 'Report', desc: 'Get a scored report with specific findings and remediation steps' },
                    ].map((step, i) => (
                        <div key={step.title} className="flex-1 p-6 rounded-[20px] bg-white border border-gray-200 text-center relative shadow-sm">
                            <div className="absolute top-[-12px] left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#2563EB] text-white text-xs font-extrabold flex items-center justify-center">{i + 1}</div>
                            <div className="text-[2rem] mb-2">{step.icon}</div>
                            <div className="font-extrabold text-gray-900 mb-[0.35rem]">{step.title}</div>
                            <div className="text-gray-500 text-[0.825rem] leading-normal">{step.desc}</div>
                        </div>
                    ))}
                </div>

                <button onClick={handleReassess} className="premium-btn px-8 py-4 text-base bg-[#2563EB] rounded-2xl" disabled={reassessing}>
                    {reassessing ? 'Running Assessment...' : '🔍 Run Infrastructure Assessment'}
                </button>
                {reassessResult && (
                    <div className="premium-card px-6 py-4 max-w-[500px] text-center">
                        {reassessResult}
                    </div>
                )}
            </div>
        );
    }

    const findings = report.findings || [];
    const recommendations = report.recommendations || [];
    const scoreColor = getScoreColor(report.overall_score);

    return (
        <div className="grid gap-6">
            <AssessmentProgressOverlay isVisible={reassessing} stage={assessmentStage} />
            <AssessmentConfirmationModal
                isOpen={showConfirmModal}
                findings={(report?.findings || []).filter((f: InfraFinding) => f.severity === 'critical' || f.severity === 'warning').map((f: InfraFinding) => ({
                    severity: f.severity,
                    title: f.title,
                    entity: f.entity || f.category || '',
                    entityName: f.entityName || f.details || ''
                }))}
                onConfirm={() => { setShowConfirmModal(false); }}
                onReview={() => { setShowConfirmModal(false); }}
            />
            <div className="page-header flex justify-between items-start">
                <div>
                    <h1 className="page-title flex items-center gap-3">
                        <span>Infrastructure Health</span>
                        <HelpLink href="/docs/help/infrastructure-score-explained" size="sm" />
                    </h1>
                    <p className="page-subtitle">
                        Assessment report from {new Date(report.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })} at {new Date(report.created_at).toLocaleTimeString(undefined, { timeStyle: 'short' })}
                    </p>
                </div>
                <div className="flex gap-3 items-center">
                    <span className="bg-gray-100 px-4 py-[0.4rem] rounded-full text-xs font-semibold text-gray-500">
                        v{report.assessment_version} • {report.report_type.replace(/_/g, ' ')}
                    </span>
                    <button
                        onClick={handleReassess}
                        disabled={reassessing}
                        className="premium-btn bg-[#2563EB] text-sm px-5 py-[0.6rem] rounded-xl flex items-center gap-2"
                        style={{
                            opacity: reassessing ? 0.6 : 1
                        }}
                    >
                        {reassessing ? (
                            <>
                                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white" style={{
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
                <div className="premium-card px-6 py-4 flex items-center gap-3" style={{
                    background: reassessResult.includes('success') ? '#F0FDF4' : '#FEF2F2',
                    border: `1px solid ${reassessResult.includes('success') ? '#BBF7D0' : '#FECACA'}`,
                }}>
                    <span>{reassessResult.includes('success') ? '✅' : '❌'}</span>
                    <span className="text-[0.9rem] font-medium">{reassessResult}</span>
                </div>
            )}

            {/* 24/7 Monitoring Banner */}
            <div className="premium-card p-6 rounded-2xl relative overflow-hidden" style={{
                background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
                border: '2px solid #10B981',
            }}>
                <div className="absolute top-[-10px] right-[-10px] text-[4rem] opacity-10">🔄</div>
                <div className="flex items-start gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-[#10B981] flex items-center justify-center text-2xl shrink-0">
                        ⚡
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-extrabold text-[#065F46] m-0">
                                24/7 Automated Monitoring Active
                            </h3>
                            <span className="py-1 px-3 bg-[#10B981] text-white rounded-full text-[0.625rem] font-bold tracking-wide">
                                LIVE
                            </span>
                        </div>
                        <p className="text-sm text-[#047857] mb-4 leading-relaxed">
                            Your infrastructure is being automatically synced every <strong>20 minutes</strong> from all connected platforms.
                            Health assessments run automatically, and campaigns/mailboxes are paused instantly when thresholds are crossed.
                            No manual monitoring needed - the system protects your reputation 24/7, even while you sleep.
                        </p>
                        <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-2">
                                <span className="text-[#10B981] font-bold">✓</span>
                                <span className="text-xs text-[#065F46] font-semibold">Auto-sync every 20min</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[#10B981] font-bold">✓</span>
                                <span className="text-xs text-[#065F46] font-semibold">Real-time health detection</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[#10B981] font-bold">✓</span>
                                <span className="text-xs text-[#065F46] font-semibold">Instant auto-pause protection</span>
                            </div>
                            <Link
                                href="/docs/help/24-7-monitoring"
                                target="_blank"
                                className="text-xs text-[#059669] font-bold underline ml-auto"
                            >
                                Learn how it works →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Score + Summary Row */}

            {/* ── TRANSITION GATE BANNER ── */}
            <TransitionGateBanner
                gateData={gateData}
                onAcknowledge={handleAcknowledge}
                acknowledging={acknowledging}
                ackResult={ackResult}
            />

            {/* Info Banner: Score vs Status Explanation */}
            <div className="premium-card px-6 py-4 flex items-start gap-4" style={{
                background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
                border: '1px solid #BFDBFE',
            }}>
                <div className="shrink-0 w-10 h-10 rounded-xl bg-[#3B82F6] flex items-center justify-center text-xl">
                    💡
                </div>
                <div className="flex-1">
                    <h3 className="text-[0.9rem] font-bold text-[#1E40AF] mb-2">
                        Understanding Your Health Scores
                    </h3>
                    <p className="text-[0.8rem] text-[#1E3A8A] leading-relaxed mb-2">
                        <Tooltip content="Infrastructure score measures DNS health (SPF/DKIM/DMARC) and blacklist status. It's a one-time snapshot taken at sync.">
                            <strong className="border-b-2 border-dotted border-[#3B82F6] cursor-help">Infrastructure Score</strong>
                        </Tooltip>
                        {' '}is different from{' '}
                        <Tooltip content="Entity status shows real-time operational health based on bounce rates. Updates continuously during sending.">
                            <strong className="border-b-2 border-dotted border-[#3B82F6] cursor-help">Entity Status</strong>
                        </Tooltip>
                        . Your entities can show "healthy" even with a low infrastructure score because they measure different things.
                    </p>
                    <HelpLink
                        href="/docs/help/infrastructure-score-explained"
                        label="Learn why this matters →"
                        size="sm"
                    />
                </div>
            </div>

            {/* Score Row: Gauge + Entity Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Overall Score with Explainer */}
                <div className="premium-card text-center relative">
                    <div className="h-[180px] relative">
                        <ScoreGauge score={report.overall_score} scoreColor={scoreColor} />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                            <div className="text-4xl font-extrabold leading-none" style={{ color: scoreColor }}>
                                {report.overall_score}
                            </div>
                            <div className="text-xs text-gray-500 font-semibold mt-[2px]">
                                / 100
                            </div>
                        </div>
                    </div>
                    <span className="inline-flex items-center gap-2 px-4 py-[0.4rem] rounded-full text-sm font-bold" style={{
                        background: `${scoreColor}15`, color: scoreColor,
                    }}>
                        {getScoreEmoji(report.overall_score)} {getScoreLabel(report.overall_score)}
                    </span>
                    {/* Score Explainer */}
                    <p className="text-gray-500 text-xs mt-3 leading-normal">
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
                    <div className="text-gray-400 text-[0.65rem] mt-[0.35rem] flex items-center justify-center gap-1">
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
                        <div key={card.label} className="premium-card relative">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-xl">{card.icon}</span>
                                <span className="font-bold text-gray-900 text-base">{card.label}</span>
                                <span className="ml-auto font-extrabold text-gray-900 text-2xl">{total}</span>
                            </div>
                            {/* Stacked Status Bar */}
                            <div className="h-2 rounded bg-gray-100 overflow-hidden flex">
                                {total > 0 && (
                                    <>
                                        <div className="bg-[#16A34A] transition-[width] duration-[600ms] ease-in-out" style={{ width: `${(slot1 / total) * 100}%` }} />
                                        <div className="bg-[#F59E0B] transition-[width] duration-[600ms] ease-in-out" style={{ width: `${(slot2 / total) * 100}%` }} />
                                        <div className="bg-[#EF4444] transition-[width] duration-[600ms] ease-in-out" style={{ width: `${(slot3 / total) * 100}%` }} />
                                    </>
                                )}
                            </div>
                            {/* Legend */}
                            <div className="flex gap-3 mt-3 text-xs">
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-[#16A34A]" />
                                    <span className="text-gray-500">{card.states[0].charAt(0).toUpperCase() + card.states[0].slice(1)}: <strong>{slot1}</strong></span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                                    <span className="text-gray-500">Warning: <strong>{slot2}</strong></span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-[#EF4444]" />
                                    <span className="text-gray-500">Paused: <strong>{slot3}</strong></span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Score History */}
            {scoreHistory.length > 0 && (
                <div className="premium-card">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            📈 Score History
                        </h2>
                        <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
                            {([['7', '7D'], ['30', '30D'], ['90', '90D']] as const).map(([value, label]) => (
                                <button
                                    key={value}
                                    onClick={() => setScoreRange(value as '7' | '30' | '90')}
                                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                                        scoreRange === value
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="h-[200px]">
                        <ScoreHistory data={scoreHistory} />
                    </div>
                </div>
            )}

            {/* ── HEALING PIPELINE SUMMARY ── */}
            {recoveryData && recoveryData.summary && recoveryData.summary.totalRecovering > 0 && (
                <Link href="/dashboard/healing" className="block premium-card hover:border-blue-200 transition-colors group">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🏥</span>
                            <div>
                                <div className="text-base font-bold text-gray-900">
                                    {recoveryData.summary.totalRecovering} {recoveryData.summary.totalRecovering === 1 ? 'entity' : 'entities'} in healing pipeline
                                </div>
                                <div className="text-sm text-gray-500">
                                    {recoveryData.summary.mailboxCount > 0 && `${recoveryData.summary.mailboxCount} mailbox${recoveryData.summary.mailboxCount > 1 ? 'es' : ''}`}
                                    {recoveryData.summary.mailboxCount > 0 && recoveryData.summary.domainCount > 0 && ' · '}
                                    {recoveryData.summary.domainCount > 0 && `${recoveryData.summary.domainCount} domain${recoveryData.summary.domainCount > 1 ? 's' : ''}`}
                                </div>
                            </div>
                        </div>
                        <span className="text-sm font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">View Details →</span>
                    </div>
                </Link>
            )}

            {/* Findings Distribution + Findings List */}
            <FindingsSection
                findings={findings}
                expandedDomain={expandedDomain}
                onToggleDomain={fetchDNSDetails}
                dnsDetails={dnsDetails}
                dnsLoading={dnsLoading}
            />

            {/* Recommendations */}
            <RecommendationsList recommendations={recommendations} />

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

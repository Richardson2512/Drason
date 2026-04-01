'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import Link from 'next/link';
import type { RiskSignal, PredictiveRecommendation, CampaignRiskScore, PredictiveReport } from '@/types/api';

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
            setReport(data?.report || data as unknown as PredictiveReport);
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

    const applyRecommendation = async (rec: PredictiveRecommendation, index: number) => {
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

    const getActionRoute = (rec: PredictiveRecommendation): string | null => {
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
            <div className="p-8 text-center text-gray-500">
                Analyzing campaign health trends...
            </div>
        );
    }

    if (error || !report) {
        return (
            <div className="p-8">
                <div className="p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg">
                    {error || 'Failed to load report'}
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-[1400px] mx-auto">
            {/* Header */}
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        🔮 Predictive Risk Monitoring
                    </h1>
                    <p className="text-sm text-gray-500">
                        Proactive campaign stall detection - catch issues before they happen
                    </p>
                </div>
                <button
                    onClick={sendAlerts}
                    disabled={sendingAlerts}
                    className={`py-3 px-6 text-white border-none rounded-lg text-sm font-semibold ${sendingAlerts ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 cursor-pointer'}`}
                >
                    {sendingAlerts ? 'Sending...' : '📢 Send Alerts'}
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mb-8">
                <div className="p-6 bg-white border border-gray-200 rounded-xl">
                    <div className="text-sm text-gray-500 mb-2">Campaigns Analyzed</div>
                    <div className="text-3xl font-bold text-gray-900">{report.campaigns_analyzed}</div>
                </div>
                <div className="p-6 bg-red-100 border border-red-300 rounded-xl">
                    <div className="text-sm text-red-900 mb-2">Critical Risk</div>
                    <div className="text-3xl font-bold text-red-600">{report.critical_risk_campaigns}</div>
                </div>
                <div className="p-6 bg-amber-100 border border-yellow-300 rounded-xl">
                    <div className="text-sm text-amber-900 mb-2">High Risk</div>
                    <div className="text-3xl font-bold text-amber-500">{report.high_risk_campaigns}</div>
                </div>
                <div className="p-6 bg-blue-100 border border-blue-300 rounded-xl">
                    <div className="text-sm text-blue-900 mb-2">At Risk Total</div>
                    <div className="text-3xl font-bold text-blue-500">{report.at_risk_campaigns}</div>
                </div>
            </div>

            {/* Campaign Risk Cards */}
            {report.campaign_risks.length > 0 ? (
                <div className="flex flex-col gap-4">
                    {report.campaign_risks.map((campaign) => {
                        const isExpanded = expandedCampaigns.has(campaign.campaign_id);
                        return (
                            <div
                                key={campaign.campaign_id}
                                className="bg-white rounded-xl overflow-hidden"
                                style={{ border: `2px solid ${getRiskColor(campaign.risk_level)}` }}
                            >
                                {/* Header */}
                                <div
                                    onClick={() => toggleExpanded(campaign.campaign_id)}
                                    className="p-6 cursor-pointer flex justify-between items-center"
                                    style={{ background: getRiskBg(campaign.risk_level) }}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <h3 className="text-lg font-bold text-gray-900 m-0">
                                                {campaign.campaign_name}
                                            </h3>
                                            <span
                                                className="py-1 px-3 text-white text-xs font-semibold rounded-xl uppercase"
                                                style={{ background: getRiskColor(campaign.risk_level) }}
                                            >
                                                {campaign.risk_level} Risk
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
                                            <div>
                                                <div className="text-xs text-gray-500 mb-1">Risk Score</div>
                                                <div className="text-2xl font-bold" style={{ color: getRiskColor(campaign.risk_level) }}>
                                                    {campaign.risk_score}/100
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-500 mb-1">Stall Probability</div>
                                                <div className="text-2xl font-bold text-gray-900">
                                                    {(campaign.stall_probability * 100).toFixed(0)}%
                                                </div>
                                            </div>
                                            {campaign.time_to_stall_hours && (
                                                <div>
                                                    <div className="text-xs text-gray-500 mb-1">Est. Time to Stall</div>
                                                    <div className="text-2xl font-bold text-red-600">
                                                        ~{campaign.time_to_stall_hours}h
                                                    </div>
                                                </div>
                                            )}
                                            <div>
                                                <div className="text-xs text-gray-500 mb-1">Warning Signals</div>
                                                <div className="text-2xl font-bold text-gray-900">
                                                    {campaign.signals.length}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-2xl text-gray-500 transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                        ▼
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div className="p-6 border-t border-gray-200">
                                        {/* Signals */}
                                        <div className="mb-6">
                                            <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase">
                                                Warning Signals
                                            </h4>
                                            <div className="flex flex-col gap-2">
                                                {campaign.signals.map((signal, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-3"
                                                    >
                                                        <span className="text-xl">{getSeverityIcon(signal.severity)}</span>
                                                        <div className="flex-1">
                                                            <div className="text-sm text-gray-700">{signal.message}</div>
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                Impact: +{signal.score_impact} risk points
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Recommendations with Action Buttons */}
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase">
                                                Recommended Actions
                                            </h4>
                                            <div className="flex flex-col gap-2">
                                                {(campaign.recommendations || []).map((rec, idx) => {
                                                    const key = `${rec.campaign_id}-${idx}`;
                                                    const result = recResults[key];
                                                    const isApplying = applyingRec === key;
                                                    const route = getActionRoute(rec);
                                                    const btnLabel = getActionButtonLabel(rec.action);

                                                    return (
                                                        <div
                                                            key={idx}
                                                            className={`py-3 px-4 rounded-lg flex items-center justify-between gap-4 border ${result?.success ? 'bg-green-50 border-green-300' : result ? 'bg-red-50 border-red-300' : 'bg-gray-50 border-gray-200'}`}
                                                        >
                                                            <div className="flex-1 text-sm text-gray-700">
                                                                {rec.label}
                                                                {result && (
                                                                    <div className={`text-xs mt-1 ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                                                                        {result.message}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {rec.action !== 'no_action' && rec.action !== 'wait_cooldown' && !result?.success && (
                                                                route ? (
                                                                    <Link
                                                                        href={route}
                                                                        className="py-1.5 px-3.5 bg-blue-600 text-white border-none rounded-md text-xs font-semibold no-underline whitespace-nowrap"
                                                                    >
                                                                        {btnLabel} →
                                                                    </Link>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => applyRecommendation(rec, idx)}
                                                                        disabled={isApplying}
                                                                        className={`py-1.5 px-3.5 text-white border-none rounded-md text-xs font-semibold whitespace-nowrap ${isApplying ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 cursor-pointer'}`}
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
                                        <div className="mt-6 pt-6 border-t border-gray-200">
                                            <Link
                                                href={`/dashboard/campaigns?highlight=${campaign.campaign_id}`}
                                                className="inline-block py-3 px-6 bg-blue-600 text-white rounded-lg text-sm font-semibold no-underline"
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
                <div className="p-12 text-center bg-gray-50 border border-gray-200 rounded-xl">
                    <div className="text-5xl mb-4">✅</div>
                    <div className="text-xl font-bold text-green-600 mb-2">
                        All Campaigns Healthy!
                    </div>
                    <div className="text-sm text-gray-500">
                        No campaigns at risk of stalling. Great work!
                    </div>
                </div>
            )}
        </div>
    );
}

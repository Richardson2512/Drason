'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import CustomSelect from '@/components/ui/CustomSelect';

interface StalledCampaignResolutionModalProps {
    isOpen: boolean;
    onClose: () => void;
    campaign: any;
    onSuccess: () => void;
}

export default function StalledCampaignResolutionModal({ isOpen, onClose, campaign, onSuccess }: StalledCampaignResolutionModalProps) {
    const [resolutionType, setResolutionType] = useState<'add_mailboxes' | 'reroute_leads' | 'manual' | 'wait_recovery' | 'export_archive' | null>(null);
    const [context, setContext] = useState<Record<string, any> | null>(null);
    const [smartRecommendations, setSmartRecommendations] = useState<Record<string, any> | null>(null);
    const [loadingRecommendations, setLoadingRecommendations] = useState(false);

    // Form state
    const [selectedMailboxIds, setSelectedMailboxIds] = useState<string[]>([]);
    const [targetCampaignId, setTargetCampaignId] = useState<string>('');

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch context when modal opens
    useEffect(() => {
        if (!isOpen || !campaign) return;

        const fetchContext = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await apiClient<Record<string, any>>(`/api/dashboard/campaigns/${campaign.id}/stalled-context`);
                setContext(data.context);
            } catch (err: any) {
                console.error('Failed to fetch campaign context', err);
                setError('Failed to load campaign information.');
            } finally {
                setLoading(false);
            }
        };

        fetchContext();
    }, [isOpen, campaign]);

    // Fetch smart recommendations when reroute option is selected
    useEffect(() => {
        if (resolutionType !== 'reroute_leads' || !context || !context.leads.sampleLeadId) return;

        const fetchRecommendations = async () => {
            setLoadingRecommendations(true);
            try {
                const data = await apiClient<Record<string, any>>(
                    `/api/dashboard/leads/${(context.leads as Record<string, any>).sampleLeadId}/campaign-recommendations?excludeCurrentCampaign=true&maxResults=5`
                );
                setSmartRecommendations(data.report);
            } catch (err: any) {
                console.error('Failed to fetch smart recommendations', err);
            } finally {
                setLoadingRecommendations(false);
            }
        };

        fetchRecommendations();
    }, [resolutionType, context]);

    if (!isOpen || !campaign) return null;

    const handleSubmit = async () => {
        if (!resolutionType) return;

        if (resolutionType === 'add_mailboxes' && selectedMailboxIds.length === 0) {
            setError('Please select at least one mailbox.');
            return;
        }

        if (resolutionType === 'reroute_leads' && !targetCampaignId) {
            setError('Please select a target campaign.');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            // Handle export & archive separately
            if (resolutionType === 'export_archive') {
                // Step 1: Export leads
                const exportUrl = `/api/dashboard/campaigns/${campaign.id}/export-leads`;
                const link = document.createElement('a');
                link.href = exportUrl;
                link.download = 'leads.csv';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // Wait a moment for download to start
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Step 2: Archive campaign
                await apiClient(`/api/dashboard/campaigns/${campaign.id}/archive`, {
                    method: 'POST'
                });

                onSuccess();
                onClose();
            } else {
                // Standard resolution
                await apiClient(`/api/dashboard/campaigns/${campaign.id}/resolve-stalled`, {
                    method: 'POST',
                    body: JSON.stringify({
                        resolutionType,
                        selectedMailboxIds: resolutionType === 'add_mailboxes' ? selectedMailboxIds : undefined,
                        targetCampaignId: resolutionType === 'reroute_leads' ? targetCampaignId : undefined
                    })
                });

                onSuccess();
                onClose();
            }
        } catch (err: any) {
            setError(err.message || 'Failed to resolve campaign.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSelectMailbox = (id: string) => {
        setSelectedMailboxIds(prev =>
            prev.includes(id) ? prev.filter(mbId => mbId !== id) : [...prev, id]
        );
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[1000] p-4" style={{ background: 'rgba(0, 0, 0, 0.5)' }} onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="stalled-campaign-modal-title">
            <div className="bg-white rounded-2xl max-w-[700px] w-full max-h-[90vh] flex flex-col overflow-hidden shadow-xl" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="p-6 border-b border-gray-200 bg-red-50">
                    <div>
                        <h2 id="stalled-campaign-modal-title" className="text-xl font-bold text-red-800 m-0 flex items-center gap-2">
                            <span>⚠️</span> Resolve Stalled Campaign
                        </h2>
                        <p className="text-sm text-red-900 mt-1 mb-0">
                            {campaign.name}
                        </p>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1">
                    {error && (
                        <div className="p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center p-8 text-gray-500">
                            Loading campaign context...
                        </div>
                    ) : context ? (
                        <>
                            {/* Context Info Card */}
                            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg mb-6">
                                <div className="text-sm text-gray-700 leading-relaxed">
                                    <div className="mb-2">
                                        <strong>Campaign Health:</strong> <span className="text-red-600">🔴 Stalled</span>
                                    </div>
                                    <div className="mb-2">
                                        <strong>Leads Affected:</strong> {context.leads.total} leads waiting
                                    </div>
                                    <div className="mb-2">
                                        <strong>Available Mailboxes:</strong> {context.mailboxes.available} healthy
                                    </div>
                                    {context.recovery.eta_hours && (
                                        <div className="text-amber-500">
                                            <strong>Recovery ETA:</strong> {context.recovery.message}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 mb-6">
                                This campaign has zero healthy mailboxes. Choose a recovery option below:
                            </p>

                            <div className="flex flex-col gap-4">
                                {/* Option A: Add Mailboxes & Restart */}
                                {context.mailboxes.available > 0 && (
                                    <div
                                        onClick={() => setResolutionType('add_mailboxes')}
                                        className="p-4 border-2 rounded-xl cursor-pointer transition-all duration-200"
                                        style={{
                                            borderColor: resolutionType === 'add_mailboxes' ? '#3B82F6' : '#E5E7EB',
                                            background: resolutionType === 'add_mailboxes' ? '#EFF6FF' : '#FFF'
                                        }}
                                    >
                                        <label className="flex items-center gap-3 cursor-pointer font-semibold text-gray-900">
                                            <input type="radio" checked={resolutionType === 'add_mailboxes'} readOnly className="w-4 h-4" style={{ accentColor: '#3B82F6' }} />
                                            Option A: Add {context.mailboxes.available} Healthy Mailboxes & Restart
                                        </label>
                                        {resolutionType === 'add_mailboxes' && (
                                            <div className="mt-4 pl-9">
                                                <div className="max-h-[150px] overflow-y-auto border border-gray-300 rounded-lg bg-white">
                                                    {context.mailboxes.list.map((mb: any) => (
                                                        <div key={mb.id} className="flex items-center gap-3 p-3 border-b border-gray-100">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedMailboxIds.includes(mb.id)}
                                                                onChange={() => handleSelectMailbox(mb.id)}
                                                                className="w-4 h-4"
                                                                style={{ accentColor: '#3B82F6' }}
                                                            />
                                                            <div className="flex-1">
                                                                <div className="text-sm font-medium text-gray-900">{mb.email}</div>
                                                                {mb.warning && (
                                                                    <div className="text-xs text-amber-500 mt-1">⚠️ {mb.warning}</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Option B: Reroute Leads */}
                                {context.rerouteOptions.available > 0 && (
                                    <div
                                        onClick={() => setResolutionType('reroute_leads')}
                                        className="p-4 border-2 rounded-xl cursor-pointer transition-all duration-200"
                                        style={{
                                            borderColor: resolutionType === 'reroute_leads' ? '#3B82F6' : '#E5E7EB',
                                            background: resolutionType === 'reroute_leads' ? '#EFF6FF' : '#FFF'
                                        }}
                                    >
                                        <label className="flex items-center gap-3 cursor-pointer font-semibold text-gray-900">
                                            <input type="radio" checked={resolutionType === 'reroute_leads'} readOnly className="w-4 h-4" style={{ accentColor: '#3B82F6' }} />
                                            Option B: Reroute {context.leads.total} Leads to Another Campaign
                                        </label>
                                        {resolutionType === 'reroute_leads' && (
                                            <div className="mt-4 pl-9">
                                                {loadingRecommendations ? (
                                                    <div className="p-4 text-center text-gray-500 text-sm">
                                                        🔮 Analyzing campaign matches...
                                                    </div>
                                                ) : smartRecommendations && smartRecommendations.recommended_campaigns.length > 0 ? (
                                                    <>
                                                        <div className="text-sm text-gray-500 mb-3">
                                                            🎯 Smart Recommendations (based on lead: {smartRecommendations.lead_persona}, score: {smartRecommendations.lead_score})
                                                        </div>
                                                        <div className="max-h-[200px] overflow-y-auto border border-gray-300 rounded-lg bg-white">
                                                            {smartRecommendations.recommended_campaigns.map((rec: any) => (
                                                                <div
                                                                    key={rec.campaign_id}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setTargetCampaignId(rec.campaign_id);
                                                                    }}
                                                                    className="p-3 border-b border-gray-100 cursor-pointer transition-colors"
                                                                    style={{
                                                                        background: targetCampaignId === rec.campaign_id ? '#EFF6FF' : '#FFF'
                                                                    }}
                                                                >
                                                                    <div className="flex items-center gap-3 mb-2">
                                                                        <input
                                                                            type="radio"
                                                                            checked={targetCampaignId === rec.campaign_id}
                                                                            readOnly
                                                                            style={{ accentColor: '#3B82F6' }}
                                                                        />
                                                                        <div className="flex-1">
                                                                            <div className="text-sm font-semibold text-gray-900">{rec.campaign_name}</div>
                                                                            <div className="flex items-center gap-2 mt-1">
                                                                                <span className="text-xs font-semibold uppercase rounded" style={{
                                                                                    padding: '0.125rem 0.5rem',
                                                                                    background: rec.confidence === 'high' ? '#DCFCE7' : rec.confidence === 'medium' ? '#FEF3C7' : '#FEE2E2',
                                                                                    color: rec.confidence === 'high' ? '#16A34A' : rec.confidence === 'medium' ? '#F59E0B' : '#DC2626'
                                                                                }}>
                                                                                    {rec.confidence}
                                                                                </span>
                                                                                <span className="text-xs text-gray-500">
                                                                                    Match: {rec.match_score}/100
                                                                                </span>
                                                                                <span className="text-xs text-gray-500">
                                                                                    | {rec.mailbox_count} mailboxes
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    {rec.warnings.length > 0 && (
                                                                        <div className="text-xs text-amber-500 ml-8">
                                                                            ⚠️ {rec.warnings[0]}
                                                                        </div>
                                                                    )}
                                                                    {targetCampaignId === rec.campaign_id && (
                                                                        <div className="mt-2 ml-8 p-2 bg-gray-50 rounded">
                                                                            <div className="text-xs text-gray-700 mb-1 font-semibold">Match Details:</div>
                                                                            <ul className="m-0 pl-4 text-[0.7rem] text-gray-500">
                                                                                {rec.reasons.slice(0, 3).map((reason: string, idx: number) => (
                                                                                    <li key={idx}>{reason}</li>
                                                                                ))}
                                                                            </ul>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <CustomSelect
                                                        value={targetCampaignId}
                                                        onChange={setTargetCampaignId}
                                                        placeholder="Select Target Campaign..."
                                                        options={context.rerouteOptions.list.map((c: any) => ({
                                                            value: c.id,
                                                            label: `${c.name} (${c.healthyMailboxCount} mailboxes)${c.warning ? ` - ⚠️ ${c.warning}` : ''}`,
                                                        }))}
                                                    />
                                                )}
                                                {context.rerouteOptions.warnings.length > 0 && (
                                                    <div className="mt-3 p-3 bg-amber-50 border border-amber-300 rounded-md text-xs text-amber-800">
                                                        ⚠️ Warning: Some campaigns may target different personas/ICPs. Review before rerouting.
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Option C: Wait for Recovery */}
                                {context.recovery.eta_hours && context.recovery.eta_hours <= 24 && (
                                    <div
                                        onClick={() => setResolutionType('wait_recovery')}
                                        className="p-4 border-2 rounded-xl cursor-pointer transition-all duration-200"
                                        style={{
                                            borderColor: resolutionType === 'wait_recovery' ? '#3B82F6' : '#E5E7EB',
                                            background: resolutionType === 'wait_recovery' ? '#EFF6FF' : '#FFF'
                                        }}
                                    >
                                        <label className="flex items-center gap-3 cursor-pointer font-semibold text-gray-900">
                                            <input type="radio" checked={resolutionType === 'wait_recovery'} readOnly className="w-4 h-4" style={{ accentColor: '#3B82F6' }} />
                                            Option C: Wait for Mailbox Recovery
                                        </label>
                                        {resolutionType === 'wait_recovery' && (
                                            <p className="text-sm text-gray-600" style={{ margin: '0.5rem 0 0 2.25rem' }}>
                                                {context.recovery.message}. System will auto-restart campaign when mailboxes become healthy.
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Option D: Export & Archive */}
                                <div
                                    onClick={() => setResolutionType('export_archive')}
                                    className="p-4 border-2 rounded-xl cursor-pointer transition-all duration-200"
                                    style={{
                                        borderColor: resolutionType === 'export_archive' ? '#3B82F6' : '#E5E7EB',
                                        background: resolutionType === 'export_archive' ? '#EFF6FF' : '#FFF'
                                    }}
                                >
                                    <label className="flex items-center gap-3 cursor-pointer font-semibold text-gray-900">
                                        <input type="radio" checked={resolutionType === 'export_archive'} readOnly className="w-4 h-4" style={{ accentColor: '#3B82F6' }} />
                                        Option D: Export Leads & Archive Campaign
                                    </label>
                                    {resolutionType === 'export_archive' && (
                                        <div className="mt-3 pl-9">
                                            <p className="text-sm text-gray-600 mb-3">
                                                Downloads {context.leads.total} leads as CSV and archives this campaign.
                                            </p>
                                            <div className="p-3 bg-amber-50 border border-amber-300 rounded-md text-xs text-amber-800">
                                                ⚠️ Campaign will be paused and marked as archived. Historical data will be preserved.
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Option E: Manual */}
                                <div
                                    onClick={() => setResolutionType('manual')}
                                    className="p-4 border-2 rounded-xl cursor-pointer transition-all duration-200"
                                    style={{
                                        borderColor: resolutionType === 'manual' ? '#3B82F6' : '#E5E7EB',
                                        background: resolutionType === 'manual' ? '#EFF6FF' : '#FFF'
                                    }}
                                >
                                    <label className="flex items-center gap-3 cursor-pointer font-semibold text-gray-900">
                                        <input type="radio" checked={resolutionType === 'manual'} readOnly className="w-4 h-4" style={{ accentColor: '#3B82F6' }} />
                                        Option E: Dismiss & Handle Manually
                                    </label>
                                    {resolutionType === 'manual' && (
                                        <p className="text-sm text-gray-600" style={{ margin: '0.5rem 0 0 2.25rem' }}>
                                            Acknowledge this warning. Superkabe will stop alerting you, and you&apos;ll handle the campaign manually outside the platform.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <p className="text-center text-red-600">Failed to load campaign context</p>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 flex justify-end gap-4 bg-gray-50">
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        className="py-3 px-6 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-semibold"
                        style={{ cursor: submitting ? 'not-allowed' : 'pointer' }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!resolutionType || submitting}
                        className="py-3 px-6 rounded-lg border-none text-white text-sm font-semibold"
                        style={{
                            background: !resolutionType || submitting ? '#93C5FD' : '#2563EB',
                            cursor: !resolutionType || submitting ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {submitting ? 'Resolving...' : 'Confirm Resolution'}
                    </button>
                </div>
            </div>
        </div>
    );
}

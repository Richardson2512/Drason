'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface StalledCampaignResolutionModalProps {
    isOpen: boolean;
    onClose: () => void;
    campaign: any;
    onSuccess: () => void;
}

export default function StalledCampaignResolutionModal({ isOpen, onClose, campaign, onSuccess }: StalledCampaignResolutionModalProps) {
    const [resolutionType, setResolutionType] = useState<'add_mailboxes' | 'reroute_leads' | 'manual' | null>(null);
    const [availableMailboxes, setAvailableMailboxes] = useState<any[]>([]);
    const [activeCampaigns, setActiveCampaigns] = useState<any[]>([]);

    // Form state
    const [selectedMailboxIds, setSelectedMailboxIds] = useState<string[]>([]);
    const [targetCampaignId, setTargetCampaignId] = useState<string>('');

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch required data when modal opens or option selected
    useEffect(() => {
        if (!isOpen || !campaign) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch healthy mailboxes not in this campaign
                if (resolutionType === 'add_mailboxes' || !resolutionType) {
                    const mbData = await apiClient<any>('/api/dashboard/mailboxes?status=active,healthy');
                    // Filter out mailboxes already attached to this campaign
                    const attachedIds = campaign.mailboxes?.map((m: any) => m.id) || [];
                    const available = (mbData.data || []).filter((mb: any) => !attachedIds.includes(mb.id));
                    setAvailableMailboxes(available);
                }

                // Fetch active campaigns for rerouting
                if (resolutionType === 'reroute_leads' || !resolutionType) {
                    const campData = await apiClient<any>('/api/dashboard/campaigns?status=active');
                    const available = (campData.data || []).filter((c: any) => c.id !== campaign.id);
                    setActiveCampaigns(available);
                }
            } catch (err: any) {
                console.error('Failed to fetch modal data', err);
                setError('Failed to fetch required data for resolution.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isOpen, campaign, resolutionType]);

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
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '1rem'
        }} onClick={onClose}>
            <div style={{
                background: '#FFF', borderRadius: '16px', maxWidth: '600px', width: '100%',
                maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FEF2F2' }}>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#991B1B', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>⚠️</span> Resolve Stalled Campaign
                        </h2>
                        <p style={{ fontSize: '0.875rem', color: '#7F1D1D', marginTop: '0.25rem', marginBottom: 0 }}>
                            {campaign.name}
                        </p>
                    </div>
                </div>

                {/* Body */}
                <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
                    {error && (
                        <div style={{ padding: '1rem', background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                            {error}
                        </div>
                    )}

                    <p style={{ fontSize: '0.875rem', color: '#4B5563', marginBottom: '1.5rem' }}>
                        This campaign has zero healthy mailboxes. How would you like to resolve this issue?
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Option A */}
                        <div
                            onClick={() => setResolutionType('add_mailboxes')}
                            style={{
                                padding: '1rem', border: '2px solid',
                                borderColor: resolutionType === 'add_mailboxes' ? '#3B82F6' : '#E5E7EB',
                                borderRadius: '12px', cursor: 'pointer', background: resolutionType === 'add_mailboxes' ? '#EFF6FF' : '#FFF',
                                transition: 'all 0.2s'
                            }}
                        >
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: 600, color: '#111827' }}>
                                <input type="radio" checked={resolutionType === 'add_mailboxes'} readOnly style={{ accentColor: '#3B82F6', width: '16px', height: '16px' }} />
                                Option A: Add Healthy Mailboxes & Restart
                            </label>
                            {resolutionType === 'add_mailboxes' && (
                                <div style={{ marginTop: '1rem', paddingLeft: '2.25rem' }}>
                                    {loading ? (
                                        <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>Loading available mailboxes...</div>
                                    ) : availableMailboxes.length > 0 ? (
                                        <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #D1D5DB', borderRadius: '8px', background: '#FFF' }}>
                                            {availableMailboxes.map(mb => (
                                                <div key={mb.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderBottom: '1px solid #F3F4F6' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedMailboxIds.includes(mb.id)}
                                                        onChange={() => handleSelectMailbox(mb.id)}
                                                        style={{ accentColor: '#3B82F6', width: '16px', height: '16px' }}
                                                    />
                                                    <div>
                                                        <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#111827' }}>{mb.email}</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Win Sent: {mb.window_sent_count || 0}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ fontSize: '0.875rem', color: '#B45309' }}>No available healthy mailboxes found.</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Option B */}
                        <div
                            onClick={() => setResolutionType('reroute_leads')}
                            style={{
                                padding: '1rem', border: '2px solid',
                                borderColor: resolutionType === 'reroute_leads' ? '#3B82F6' : '#E5E7EB',
                                borderRadius: '12px', cursor: 'pointer', background: resolutionType === 'reroute_leads' ? '#EFF6FF' : '#FFF',
                                transition: 'all 0.2s'
                            }}
                        >
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: 600, color: '#111827' }}>
                                <input type="radio" checked={resolutionType === 'reroute_leads'} readOnly style={{ accentColor: '#3B82F6', width: '16px', height: '16px' }} />
                                Option B: Reroute Active Leads
                            </label>
                            {resolutionType === 'reroute_leads' && (
                                <div style={{ marginTop: '1rem', paddingLeft: '2.25rem' }}>
                                    {loading ? (
                                        <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>Loading active campaigns...</div>
                                    ) : (
                                        <select
                                            value={targetCampaignId}
                                            onChange={(e) => setTargetCampaignId(e.target.value)}
                                            style={{
                                                width: '100%', padding: '0.75rem', borderRadius: '8px',
                                                border: '1px solid #D1D5DB', fontSize: '0.875rem', outline: 'none'
                                            }}
                                        >
                                            <option value="">Select Target Campaign...</option>
                                            {activeCampaigns.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Option C */}
                        <div
                            onClick={() => setResolutionType('manual')}
                            style={{
                                padding: '1rem', border: '2px solid',
                                borderColor: resolutionType === 'manual' ? '#3B82F6' : '#E5E7EB',
                                borderRadius: '12px', cursor: 'pointer', background: resolutionType === 'manual' ? '#EFF6FF' : '#FFF',
                                transition: 'all 0.2s'
                            }}
                        >
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: 600, color: '#111827' }}>
                                <input type="radio" checked={resolutionType === 'manual'} readOnly style={{ accentColor: '#3B82F6', width: '16px', height: '16px' }} />
                                Option C: Dismiss & Handle Manually
                            </label>
                            {resolutionType === 'manual' && (
                                <p style={{ fontSize: '0.875rem', color: '#4B5563', margin: '0.5rem 0 0 2.25rem' }}>
                                    Acknowledge this warning. Drason will stop alerting you, and you can resolve the campaign directly in Smartlead.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ padding: '1.5rem', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end', gap: '1rem', background: '#F9FAFB' }}>
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        style={{
                            padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #D1D5DB',
                            background: '#FFF', color: '#374151', fontSize: '0.875rem', fontWeight: 600,
                            cursor: submitting ? 'not-allowed' : 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!resolutionType || submitting}
                        style={{
                            padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none',
                            background: !resolutionType || submitting ? '#93C5FD' : '#2563EB', color: '#FFF',
                            fontSize: '0.875rem', fontWeight: 600, cursor: !resolutionType || submitting ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {submitting ? 'Resolving...' : 'Confirm Resolution'}
                    </button>
                </div>
            </div>
        </div>
    );
}

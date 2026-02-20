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
    const [resolutionType, setResolutionType] = useState<'add_mailboxes' | 'reroute_leads' | 'manual' | 'wait_recovery' | null>(null);
    const [context, setContext] = useState<any>(null);

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
                const data = await apiClient<any>(`/api/dashboard/campaigns/${campaign.id}/stalled-context`);
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
                background: '#FFF', borderRadius: '16px', maxWidth: '700px', width: '100%',
                maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #E5E7EB', background: '#FEF2F2' }}>
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

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#6B7280' }}>
                            Loading campaign context...
                        </div>
                    ) : context ? (
                        <>
                            {/* Context Info Card */}
                            <div style={{ padding: '1rem', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', marginBottom: '1.5rem' }}>
                                <div style={{ fontSize: '0.875rem', color: '#374151', lineHeight: '1.6' }}>
                                    <div style={{ marginBottom: '0.5rem' }}>
                                        <strong>Campaign Health:</strong> <span style={{ color: '#DC2626' }}>🔴 Stalled</span>
                                    </div>
                                    <div style={{ marginBottom: '0.5rem' }}>
                                        <strong>Leads Affected:</strong> {context.leads.total} leads waiting
                                    </div>
                                    <div style={{ marginBottom: '0.5rem' }}>
                                        <strong>Available Mailboxes:</strong> {context.mailboxes.available} healthy
                                    </div>
                                    {context.recovery.eta_hours && (
                                        <div style={{ color: '#F59E0B' }}>
                                            <strong>Recovery ETA:</strong> {context.recovery.message}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <p style={{ fontSize: '0.875rem', color: '#4B5563', marginBottom: '1.5rem' }}>
                                This campaign has zero healthy mailboxes. Choose a recovery option below:
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {/* Option A: Add Mailboxes & Restart */}
                                {context.mailboxes.available > 0 && (
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
                                            Option A: Add {context.mailboxes.available} Healthy Mailboxes & Restart
                                        </label>
                                        {resolutionType === 'add_mailboxes' && (
                                            <div style={{ marginTop: '1rem', paddingLeft: '2.25rem' }}>
                                                <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #D1D5DB', borderRadius: '8px', background: '#FFF' }}>
                                                    {context.mailboxes.list.map((mb: any) => (
                                                        <div key={mb.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderBottom: '1px solid #F3F4F6' }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedMailboxIds.includes(mb.id)}
                                                                onChange={() => handleSelectMailbox(mb.id)}
                                                                style={{ accentColor: '#3B82F6', width: '16px', height: '16px' }}
                                                            />
                                                            <div style={{ flex: 1 }}>
                                                                <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#111827' }}>{mb.email}</div>
                                                                {mb.warning && (
                                                                    <div style={{ fontSize: '0.75rem', color: '#F59E0B', marginTop: '0.25rem' }}>⚠️ {mb.warning}</div>
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
                                        style={{
                                            padding: '1rem', border: '2px solid',
                                            borderColor: resolutionType === 'reroute_leads' ? '#3B82F6' : '#E5E7EB',
                                            borderRadius: '12px', cursor: 'pointer', background: resolutionType === 'reroute_leads' ? '#EFF6FF' : '#FFF',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: 600, color: '#111827' }}>
                                            <input type="radio" checked={resolutionType === 'reroute_leads'} readOnly style={{ accentColor: '#3B82F6', width: '16px', height: '16px' }} />
                                            Option B: Reroute {context.leads.total} Leads to Another Campaign
                                        </label>
                                        {resolutionType === 'reroute_leads' && (
                                            <div style={{ marginTop: '1rem', paddingLeft: '2.25rem' }}>
                                                <select
                                                    value={targetCampaignId}
                                                    onChange={(e) => setTargetCampaignId(e.target.value)}
                                                    style={{
                                                        width: '100%', padding: '0.75rem', borderRadius: '8px',
                                                        border: '1px solid #D1D5DB', fontSize: '0.875rem', outline: 'none'
                                                    }}
                                                >
                                                    <option value="">Select Target Campaign...</option>
                                                    {context.rerouteOptions.list.map((c: any) => (
                                                        <option key={c.id} value={c.id}>
                                                            {c.name} ({c.healthyMailboxCount} mailboxes)
                                                            {c.warning ? ` - ⚠️ ${c.warning}` : ''}
                                                        </option>
                                                    ))}
                                                </select>
                                                {context.rerouteOptions.warnings.length > 0 && (
                                                    <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '6px', fontSize: '0.75rem', color: '#92400E' }}>
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
                                        style={{
                                            padding: '1rem', border: '2px solid',
                                            borderColor: resolutionType === 'wait_recovery' ? '#3B82F6' : '#E5E7EB',
                                            borderRadius: '12px', cursor: 'pointer', background: resolutionType === 'wait_recovery' ? '#EFF6FF' : '#FFF',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: 600, color: '#111827' }}>
                                            <input type="radio" checked={resolutionType === 'wait_recovery'} readOnly style={{ accentColor: '#3B82F6', width: '16px', height: '16px' }} />
                                            Option C: Wait for Mailbox Recovery
                                        </label>
                                        {resolutionType === 'wait_recovery' && (
                                            <p style={{ fontSize: '0.875rem', color: '#4B5563', margin: '0.5rem 0 0 2.25rem' }}>
                                                {context.recovery.message}. System will auto-restart campaign when mailboxes become healthy.
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Option D: Manual */}
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
                                        Option {context.recovery.eta_hours && context.recovery.eta_hours <= 24 ? 'D' : 'C'}: Dismiss & Handle Manually
                                    </label>
                                    {resolutionType === 'manual' && (
                                        <p style={{ fontSize: '0.875rem', color: '#4B5563', margin: '0.5rem 0 0 2.25rem' }}>
                                            Acknowledge this warning. Drason will stop alerting you, and you can resolve the campaign directly in Smartlead.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <p style={{ textAlign: 'center', color: '#DC2626' }}>Failed to load campaign context</p>
                    )}
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

'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import CopyButton from '@/components/CopyButton';

export default function InstantlyCard({
    webhookUrl,
    onTriggerSync,
}: {
    webhookUrl?: string;
    onTriggerSync?: () => Promise<void>;
}) {
    const [apiKey, setApiKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        apiClient<any>('/api/settings')
            .then(data => {
                if (data) {
                    const settings = Array.isArray(data) ? data : [];
                    const keySetting = settings.find((s: any) => s.key === 'INSTANTLY_API_KEY');
                    if (keySetting) setApiKey(keySetting.value);
                }
            })
            .catch(() => { });
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await apiClient('/api/settings', {
                method: 'POST',
                body: JSON.stringify({ INSTANTLY_API_KEY: apiKey }),
            });
            setMsg('Instantly API key saved successfully.');
        } catch (err: any) {
            setMsg(err.message || 'Error saving Instantly settings.');
        } finally {
            setLoading(false);
        }
    };

    const isError = msg.includes('Error') || msg.includes('Failed');

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                    width: '40px', height: '40px', background: '#fff', borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9',
                }}>
                    <img src="/instantly.png" alt="Instantly" width={24} height={24} />
                </div>
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1E293B' }}>
                        Instantly Integration
                    </h2>
                    <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
                        Connect your Instantly account to sync campaigns, monitor deliverability, and auto-heal infrastructure.
                    </p>
                </div>
            </div>

            {/* Status message */}
            {msg && (
                <div style={{
                    padding: '1rem', marginBottom: '1.5rem', borderRadius: '12px', fontSize: '0.9rem',
                    background: isError ? '#FEF2F2' : '#F0FDF4',
                    color: isError ? '#991B1B' : '#166534',
                    border: `1px solid ${isError ? '#FECACA' : '#BBF7D0'}`,
                }}>
                    {msg}
                </div>
            )}

            {/* API Key form */}
            <form onSubmit={handleSave} style={{ marginBottom: '2rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                        display: 'block', marginBottom: '0.5rem',
                        fontSize: '0.875rem', fontWeight: 600, color: '#374151',
                    }}>
                        Instantly API V2 Key
                    </label>
                    <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '0.5rem' }}>
                        Generate at Instantly → Settings → API Keys. Requires Growth plan or above.
                    </p>
                    <input
                        type="password"
                        placeholder="Paste your V2 API key here..."
                        value={apiKey}
                        onChange={e => setApiKey(e.target.value)}
                        className="premium-input w-full"
                        style={{ width: '100%' }}
                    />
                </div>
                <button type="submit" className="premium-btn w-full" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Configuration'}
                </button>
            </form>

            {/* Webhook Endpoint */}
            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1.5rem' }}>
                <div className="flex justify-between items-center mb-2">
                    <h3 style={{
                        fontSize: '0.875rem', fontWeight: 700,
                        color: '#64748B', textTransform: 'uppercase',
                    }}>
                        Webhook Endpoint
                    </h3>
                    {webhookUrl && (
                        <CopyButton
                            text={webhookUrl}
                            label="Copy URL"
                            className="text-xs text-blue-600 font-semibold hover:text-blue-800 transition-colors bg-transparent border-0 p-0"
                        />
                    )}
                </div>

                <div style={{
                    background: '#F8FAFC', padding: '1rem', borderRadius: '8px',
                    border: '1px solid #E2E8F0', wordBreak: 'break-all',
                    fontFamily: 'monospace', fontSize: '0.8rem', color: '#2563EB',
                }}>
                    {webhookUrl || 'Loading...'}
                </div>

                <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.5rem', lineHeight: 1.5 }}>
                    Paste this URL in Instantly → Settings → Integrations → Webhooks.
                    Select all events: email sent, opened, clicked, bounced, replied, unsubscribed.
                    Include the <code style={{ fontFamily: 'monospace', fontWeight: 600 }}>x-organization-id</code> header.
                </p>

                {/* Manual sync button */}
                {onTriggerSync && (
                    <button
                        onClick={async () => {
                            setSyncing(true);
                            try {
                                await onTriggerSync();
                            } finally {
                                setSyncing(false);
                            }
                        }}
                        disabled={loading || syncing}
                        className="premium-btn"
                        style={{
                            width: '100%', marginTop: '1rem',
                            background: '#FFFFFF', color: '#1E293B',
                            border: '1px solid #E2E8F0',
                        }}
                    >
                        {syncing ? 'Syncing...' : 'Trigger Manual Sync'}
                    </button>
                )}

                {/* 24/7 monitoring info */}
                <div style={{
                    marginTop: '1.5rem', padding: '1rem',
                    background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                    border: '2px solid #2563EB', borderRadius: '10px',
                }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '8px',
                            background: '#2563EB', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontSize: '1rem', flexShrink: 0,
                        }}>
                            ⚡
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                                <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#1E40AF', margin: 0 }}>
                                    24/7 Auto-Sync Active
                                </h4>
                                <span style={{
                                    padding: '0.125rem 0.5rem', background: '#2563EB',
                                    color: 'white', borderRadius: '999px', fontSize: '0.5rem',
                                    fontWeight: 700, letterSpacing: '0.05em',
                                }}>
                                    LIVE
                                </span>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: '#1D4ED8', margin: 0, lineHeight: 1.6 }}>
                                Your Instantly data syncs automatically every <strong>20 minutes</strong>.
                                Manual sync is available for immediate updates after changes.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Capability summary */}
                <div style={{
                    marginTop: '1rem', padding: '1rem',
                    background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px',
                }}>
                    <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                        What Superkabe monitors
                    </h4>
                    <ul style={{ margin: 0, padding: '0 0 0 1rem', fontSize: '0.75rem', color: '#64748B', lineHeight: 1.8 }}>
                        <li>Campaign analytics — open, click, reply, bounce rates</li>
                        <li>Per-mailbox daily send & bounce stats</li>
                        <li>Per-domain aggregated health (bounce rate across all mailboxes)</li>
                        <li>Per-lead engagement — opens, clicks, replies, bounce status</li>
                        <li>Warmup analytics — inbox vs spam placement rate</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import CopyButton from '@/components/CopyButton';

export default function EmailBisonCard({ webhookUrl, onTriggerSync }: { webhookUrl?: string; onTriggerSync?: () => Promise<void> }) {
    const [ebApiKey, setEbApiKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        apiClient<any>('/api/settings')
            .then(data => {
                if (data) {
                    const settingsData = Array.isArray(data) ? data : [];
                    const ebKeySetting = settingsData.find((s: any) => s.key === 'EMAILBISON_API_KEY');
                    if (ebKeySetting) setEbApiKey(ebKeySetting.value);
                }
            })
            .catch(() => { });
    }, []);

    const handleSaveEmailBison = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await apiClient('/api/settings', {
                method: 'POST',
                body: JSON.stringify({ EMAILBISON_API_KEY: ebApiKey })
            });
            setMsg('EmailBison API key saved successfully.');
        } catch (err: any) {
            setMsg(err.message || 'Error saving EmailBison settings.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', background: '#fff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                    <img src="/emailbison.png" alt="EmailBison" width={24} height={24} />
                </div>
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1E293B' }}>EmailBison Integration</h2>
                    <p style={{ fontSize: '0.875rem', color: '#64748B' }}>Connect your EmailBison account to sync mailboxes and enable health tracking.</p>
                </div>
            </div>

            {msg && (
                <div style={{
                    padding: '1rem', marginBottom: '1.5rem', borderRadius: '12px', fontSize: '0.9rem',
                    background: msg.includes('Error') || msg.includes('Failed') ? '#FEF2F2' : '#F0FDF4',
                    color: msg.includes('Error') || msg.includes('Failed') ? '#991B1B' : '#166534',
                    border: `1px solid ${msg.includes('Error') || msg.includes('Failed') ? '#FECACA' : '#BBF7D0'}`
                }}>
                    {msg}
                </div>
            )}

            <form onSubmit={handleSaveEmailBison} style={{ marginBottom: '2rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
                        EmailBison API Key
                    </label>
                    <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '0.5rem' }}>
                        Generate at EmailBison → Settings → API Keys. Available on all paid plans.
                    </p>
                    <input
                        type="password"
                        placeholder="Paste your key here..."
                        value={ebApiKey}
                        onChange={e => setEbApiKey(e.target.value)}
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
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Webhook Endpoint</h3>
                    {webhookUrl && <CopyButton text={webhookUrl} label="Copy URL" className="text-xs text-blue-600 font-semibold hover:text-blue-800 transition-colors bg-transparent border-0 p-0" />}
                </div>
                <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0', wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.8rem', color: '#2563EB' }}>
                    {webhookUrl || 'Loading...'}
                </div>
                <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.5rem', lineHeight: 1.5 }}>
                    Paste this URL in EmailBison → Settings → Webhooks.
                    Select all events: email sent, opened, clicked, bounced, replied, unsubscribed.
                    Include the <code style={{ fontFamily: 'monospace', fontWeight: 600 }}>x-organization-id</code> header.
                </p>

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
                        style={{ width: '100%', marginTop: '1rem', background: '#FFFFFF', color: '#1E293B', border: '1px solid #E2E8F0' }}
                    >
                        {syncing ? 'Syncing...' : 'Trigger Manual Sync'}
                    </button>
                )}

                {/* 24/7 Monitoring Info */}
                <div style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)',
                    border: '2px solid #7C3AED',
                    borderRadius: '10px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: '#7C3AED',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1rem',
                            flexShrink: 0
                        }}>
                            ⚡
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                                <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#4C1D95', margin: 0 }}>
                                    24/7 Auto-Sync Active
                                </h4>
                                <span style={{
                                    padding: '0.125rem 0.5rem',
                                    background: '#7C3AED',
                                    color: 'white',
                                    borderRadius: '999px',
                                    fontSize: '0.5rem',
                                    fontWeight: 700,
                                    letterSpacing: '0.05em'
                                }}>
                                    LIVE
                                </span>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: '#5B21B6', margin: 0, lineHeight: 1.6 }}>
                                Your EmailBison data syncs automatically every <strong>20 minutes</strong>.
                                Manual sync is available for immediate updates after changes.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

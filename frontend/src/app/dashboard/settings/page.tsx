'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import CopyButton from '@/components/CopyButton';

export default function Settings() {
    const [apiKey, setApiKey] = useState('');
    const [webhookUrl, setWebhookUrl] = useState('');
    const [smartleadWebhookUrl, setSmartleadWebhookUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    // Phase 5: System Mode
    const [org, setOrg] = useState<any>(null);
    const [systemMode, setSystemMode] = useState('observe');

    useEffect(() => {
        // Fetch current settings
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                if (data.SMARTLEAD_API_KEY) setApiKey(data.SMARTLEAD_API_KEY);
            });

        // Fetch organization info (Phase 5)
        fetch('/api/organization')
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    console.error('Org Fetch Error:', data);
                    setOrg(null); // Keep loading or show error state
                    setMsg(`Error: ${data.message || data.error}`);
                } else {
                    setOrg(data);
                    if (data?.system_mode) setSystemMode(data.system_mode);
                }
            })
            .catch(err => {
                console.error('Fetch failed:', err);
                setMsg('Failed to fetch organization details');
            });

        // Determine Webhook URLs (client-side only to avoid hydration mismatch)
        setWebhookUrl(`${window.location.protocol}//${window.location.hostname}:3001/api/ingest/clay`);
        setSmartleadWebhookUrl(`${window.location.protocol}//${window.location.hostname}:3001/api/monitor/smartlead-webhook`);
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ SMARTLEAD_API_KEY: apiKey })
            });
            setMsg('Settings saved successfully.');
        } catch (err) {
            setMsg('Error saving settings.');
        } finally {
            setLoading(false);
        }
    };

    const handleSystemModeChange = async (mode: string) => {
        setLoading(true);
        try {
            const res = await fetch('/api/organization', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ system_mode: mode })
            });
            if (res.ok) {
                setSystemMode(mode);
                setMsg(`System mode changed to ${mode.toUpperCase()}`);
            } else {
                setMsg('Failed to update system mode');
            }
        } catch (err) {
            setMsg('Error updating system mode.');
        } finally {
            setLoading(false);
        }
    };

    const modeDescriptions: Record<string, { title: string; desc: string; color: string }> = {
        observe: {
            title: 'Observe Mode',
            desc: 'Monitor only. No automatic actions taken. All events logged for analysis.',
            color: '#3b82f6'
        },
        suggest: {
            title: 'Suggest Mode',
            desc: 'System suggests actions but requires manual approval before execution.',
            color: '#eab308'
        },
        enforce: {
            title: 'Enforce Mode',
            desc: 'Full automation. System automatically pauses mailboxes and holds leads based on thresholds.',
            color: '#22c55e'
        }
    };

    return (
        <div style={{ maxWidth: '1200px', paddingLeft: '1rem', paddingBottom: '3rem' }}>
            <div className="page-header">
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', color: '#111827', letterSpacing: '-0.025em' }}>Settings & Configuration</h1>
                <div style={{ color: '#6B7280', fontSize: '1.1rem' }}>Manage integrations, system modes, and credentials</div>
            </div>

            {/* System Mode Control - Phase 5 */}
            <div className="premium-card" style={{ marginBottom: '2.5rem', borderLeft: `6px solid ${modeDescriptions[systemMode]?.color || '#E2E8F0'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#111827' }}>System Mode</h2>
                        <p style={{ color: '#64748B', fontSize: '1rem', maxWidth: '600px', lineHeight: '1.5' }}>
                            Control the level of automation and intervention Superkabe processes.
                        </p>
                    </div>
                    {org && (
                        <div style={{ textAlign: 'right', background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
                            <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Active Mode</div>
                            <div style={{ fontSize: '1.125rem', fontWeight: 800, color: modeDescriptions[systemMode]?.color }}>{systemMode.toUpperCase()}</div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {['observe', 'suggest', 'enforce'].map(mode => (
                        <div
                            key={mode}
                            onClick={() => handleSystemModeChange(mode)}
                            className="hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
                            style={{
                                padding: '1.5rem',
                                borderRadius: '16px',
                                border: systemMode === mode ? `2px solid ${modeDescriptions[mode].color}` : '1px solid #E2E8F0',
                                background: systemMode === mode ? '#FFFFFF' : '#FAFAFA',
                                boxShadow: systemMode === mode ? `0 10px 30px -10px ${modeDescriptions[mode].color}30` : 'none',
                                opacity: systemMode === mode ? 1 : 0.7
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <div style={{ fontSize: '1.125rem', fontWeight: 800, textTransform: 'uppercase', color: modeDescriptions[mode].color }}>
                                    {mode}
                                </div>
                                {systemMode === mode && (
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: modeDescriptions[mode].color }}></div>
                                )}
                            </div>
                            <p style={{ fontSize: '0.875rem', color: '#64748B', lineHeight: '1.6' }}>
                                {modeDescriptions[mode].desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Organization Info */}
            <div className="premium-card" style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: '#1E293B' }}>Organization Details</h2>
                {org ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="col-span-1 md:col-span-3">
                            <div style={{
                                padding: '1rem 1.5rem',
                                background: '#EFF6FF',
                                borderRadius: '12px',
                                border: '1px solid #DBEAFE',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                marginBottom: '1.5rem'
                            }}>
                                <span style={{ fontSize: '1.5rem' }}>💡</span>
                                <div style={{ flex: 1 }}>
                                    <p style={{ color: '#1E40AF', fontSize: '0.9rem', margin: 0 }}>
                                        <strong>Webhook Header Required:</strong> Include <code style={{ fontFamily: 'monospace', fontWeight: 700 }}>x-organization-id</code> in your Clay and Smartlead webhook configurations.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Organization ID</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <code style={{ flex: 1, padding: '0.75rem', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#334155', fontFamily: 'monospace', fontSize: '0.875rem' }}>{org.id}</code>
                                <CopyButton text={org.id} label="Copy" />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Name</label>
                            <div style={{ padding: '0.75rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#1E293B', fontWeight: 600 }}>{org.name}</div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Slug</label>
                            <div style={{ padding: '0.75rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#1E293B' }}>{org.slug}</div>
                        </div>
                    </div>
                ) : (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>Loading Data...</div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Smartlead */}
                <div className="premium-card">
                    <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '40px', height: '40px', background: '#fff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                            <Image src="/smartlead.webp" alt="Smartlead" width={24} height={24} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1E293B' }}>Smartlead Integration</h2>
                            <p style={{ fontSize: '0.875rem', color: '#64748B' }}>Sync campaigns & monitor activity.</p>
                        </div>
                        <a
                            href="/docs/smartlead-integration"
                            target="_blank"
                            title="View integration guide"
                            style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                background: '#F1F5F9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#64748B',
                                textDecoration: 'none',
                                transition: 'all 0.2s',
                                border: '1px solid #E2E8F0'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.background = '#2563EB'; e.currentTarget.style.color = '#FFFFFF'; }}
                            onMouseOut={(e) => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#64748B'; }}
                        >
                            <span style={{ fontSize: '1rem' }}>❓</span>
                        </a>
                    </div>

                    <form onSubmit={handleSave} style={{ marginBottom: '2rem' }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>API Key</label>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={e => setApiKey(e.target.value)}
                                className="premium-input w-full"
                                placeholder="sk_..."
                                style={{ width: '100%' }}
                            />
                        </div>
                        <button type="submit" className="premium-btn w-full" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Configuration'}
                        </button>
                        {msg && <div className="text-center mt-4 text-sm font-medium" style={{ color: msg.includes('Error') ? '#EF4444' : '#10B981' }}>{msg}</div>}
                    </form>

                    <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1.5rem' }}>
                        <div className="flex justify-between items-center mb-2">
                            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Webhook Endpoint</h3>
                            <CopyButton text={smartleadWebhookUrl} label="Copy URL" className="text-xs text-blue-600 font-semibold hover:text-blue-800 transition-colors bg-transparent border-0 p-0" />
                        </div>
                        <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0', wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.8rem', color: '#2563EB' }}>
                            {smartleadWebhookUrl || 'Loading...'}
                        </div>
                        <button
                            onClick={async () => {
                                setLoading(true);
                                try {
                                    const res = await fetch('/api/sync', { method: 'POST' });
                                    const data = await res.json();
                                    setMsg(data.success ? `Synced ${data.result.campaigns_synced} campaigns.` : 'Failed: ' + data.error);
                                } catch (e) { setMsg('Sync error.'); }
                                setLoading(false);
                            }}
                            disabled={loading}
                            className="premium-btn"
                            style={{ width: '100%', marginTop: '1rem', background: '#FFFFFF', color: '#1E293B', border: '1px solid #E2E8F0' }}
                        >
                            Trigger Manual Sync
                        </button>
                    </div>
                </div>

                {/* Clay */}
                <div className="premium-card">
                    <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '40px', height: '40px', background: '#fff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                            <Image src="/clay.png" alt="Clay" width={24} height={24} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1E293B' }}>Clay Integration</h2>
                            <p style={{ fontSize: '0.875rem', color: '#64748B' }}>Ingest leads directly from tables.</p>
                        </div>
                        <a
                            href="/docs/clay-integration"
                            target="_blank"
                            title="View integration guide"
                            style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                background: '#F1F5F9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#64748B',
                                textDecoration: 'none',
                                transition: 'all 0.2s',
                                border: '1px solid #E2E8F0'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.background = '#2563EB'; e.currentTarget.style.color = '#FFFFFF'; }}
                            onMouseOut={(e) => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#64748B'; }}
                        >
                            <span style={{ fontSize: '1rem' }}>❓</span>
                        </a>
                    </div>

                    <div style={{ padding: '1.5rem', background: '#F0F9FF', borderRadius: '16px', border: '1px solid #BAE6FD' }}>
                        <div className="flex justify-between items-center mb-2">
                            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0369A1', textTransform: 'uppercase' }}>Ingestion Webhook</h3>
                            <CopyButton text={webhookUrl} label="Copy URL" className="text-xs text-blue-600 font-semibold hover:text-blue-800 transition-colors bg-transparent border-0 p-0" />
                        </div>
                        <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '8px', border: '1px solid #BAE6FD', wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.8rem', color: '#0284C7', marginBottom: '1rem' }}>
                            {webhookUrl}
                        </div>
                        <p style={{ fontSize: '0.875rem', color: '#0C4A6E', lineHeight: '1.5' }}>
                            Use `HTTP API` column in Clay. Method: POST. Body: JSON.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

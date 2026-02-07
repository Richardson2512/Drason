'use client';
import { useEffect, useState } from 'react';

export default function Settings() {
    const [apiKey, setApiKey] = useState('');
    const [webhookUrl, setWebhookUrl] = useState('');
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
                setOrg(data);
                if (data?.system_mode) setSystemMode(data.system_mode);
            });

        // Determine Webhook URL (client-side)
        setWebhookUrl(`${window.location.protocol}//${window.location.hostname}:3001/api/ingest/clay`);
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
        <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>Settings & Configuration</h1>

            {/* Phase 5: System Mode Control */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>System Mode</h2>
                <p style={{ color: '#a3a3a3', marginBottom: '1rem', fontSize: '0.875rem' }}>
                    Control how Drason responds to threshold breaches and risk events.
                </p>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    {['observe', 'suggest', 'enforce'].map(mode => (
                        <button
                            key={mode}
                            onClick={() => handleSystemModeChange(mode)}
                            disabled={loading}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                borderRadius: '8px',
                                border: systemMode === mode ? `2px solid ${modeDescriptions[mode].color}` : '2px solid #262626',
                                background: systemMode === mode ? `${modeDescriptions[mode].color}20` : '#0a0a0a',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{
                                fontWeight: 600,
                                marginBottom: '0.25rem',
                                color: systemMode === mode ? modeDescriptions[mode].color : '#fff',
                                textTransform: 'uppercase',
                                fontSize: '0.875rem'
                            }}>
                                {mode}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#a3a3a3' }}>
                                {modeDescriptions[mode].desc}
                            </div>
                        </button>
                    ))}
                </div>

                {org && (
                    <div style={{ fontSize: '0.75rem', color: '#525252', marginTop: '0.5rem' }}>
                        Organization: {org.name || org.slug} • Current Mode: <strong style={{ color: modeDescriptions[systemMode]?.color }}>{systemMode.toUpperCase()}</strong>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-8">
                {/* Smartlead */}
                <div className="card">
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Smartlead Integration</h2>
                    <p style={{ color: '#a3a3a3', marginBottom: '1rem', fontSize: '0.875rem' }}>
                        Provide your API Key to enable 2-way sync (Campaigns, Leads, Stats).
                    </p>
                    <form onSubmit={handleSave}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#a3a3a3' }}>API Key</label>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={e => setApiKey(e.target.value)}
                                className="input"
                                style={{ width: '100%', padding: '0.5rem', background: '#0a0a0a', border: '1px solid #262626', borderRadius: '4px', color: '#fff' }}
                                placeholder="sk_..."
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn"
                            disabled={loading}
                            style={{ padding: '0.5rem 1rem', background: '#fff', color: '#000', borderRadius: '4px', fontWeight: 500, cursor: 'pointer' }}
                        >
                            {loading ? 'Saving...' : 'Save API Key'}
                        </button>
                        {msg && <div style={{ marginTop: '1rem', color: msg.includes('Error') || msg.includes('Failed') ? '#ef4444' : '#22c55e' }}>{msg}</div>}
                    </form>

                    <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #262626' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Manual Sync</h3>
                        <p style={{ color: '#a3a3a3', fontSize: '0.875rem', marginBottom: '1rem' }}>
                            Force sync Campaigns & Mailboxes from Smartlead.
                        </p>
                        <button
                            onClick={async () => {
                                setLoading(true);
                                try {
                                    const res = await fetch('/api/sync', { method: 'POST' });
                                    const data = await res.json();
                                    if (data.success) setMsg(`Synced ${data.result.campaigns_synced} campaigns.`);
                                    else setMsg('Sync failed: ' + data.error);
                                } catch (e) { setMsg('Sync error.'); }
                                setLoading(false);
                            }}
                            className="btn"
                            disabled={loading}
                            style={{ padding: '0.5rem 1rem', background: '#262626', color: '#fff', borderRadius: '4px', fontWeight: 500, cursor: 'pointer' }}
                        >
                            Sync Now
                        </button>
                    </div>
                </div>

                {/* Clay */}
                <div className="card">
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Clay / Webhook Integration</h2>
                    <p style={{ color: '#a3a3a3', marginBottom: '1rem', fontSize: '0.875rem' }}>
                        Use this URL in your Clay "HTTP API" column to push leads to Drason.
                    </p>
                    <div style={{ background: '#0a0a0a', padding: '1rem', borderRadius: '4px', border: '1px solid #262626', wordBreak: 'break-all' }}>
                        <code style={{ color: '#22c55e', fontSize: '0.875rem' }}>{webhookUrl}</code>
                    </div>

                    <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #262626' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Smartlead Webhook</h3>
                        <p style={{ color: '#a3a3a3', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                            Configure Smartlead to send events to this endpoint:
                        </p>
                        <div style={{ background: '#0a0a0a', padding: '1rem', borderRadius: '4px', border: '1px solid #262626', wordBreak: 'break-all' }}>
                            <code style={{ color: '#3b82f6', fontSize: '0.875rem' }}>
                                {`${typeof window !== 'undefined' ? window.location.protocol + '//' + window.location.hostname : ''}:3001/api/monitor/smartlead-webhook`}
                            </code>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

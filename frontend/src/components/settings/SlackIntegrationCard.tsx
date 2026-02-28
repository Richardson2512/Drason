'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

export default function SlackIntegrationCard() {
    const [slackConnected, setSlackConnected] = useState(false);
    const [slackChannels, setSlackChannels] = useState<{ id: string, name: string }[]>([]);
    const [slackAlertsChannel, setSlackAlertsChannel] = useState('');
    const [slackAlertsStatus, setSlackAlertsStatus] = useState('active');
    const [slackAlertsLastError, setSlackAlertsLastError] = useState('');
    const [slackAlertsLastErrorAt, setSlackAlertsLastErrorAt] = useState('');
    const [loadingChannels, setLoadingChannels] = useState(false);
    const [savingChannel, setSavingChannel] = useState(false);
    const [disconnectingSlack, setDisconnectingSlack] = useState(false);
    const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        apiClient<any>('/api/settings')
            .then(data => {
                if (data) {
                    const settingsData = Array.isArray(data) ? data : [];
                    const slackSetting = settingsData.find((s: any) => s.key === 'SLACK_CONNECTED');
                    const isSlackConnected = slackSetting?.value === 'true';
                    setSlackConnected(isSlackConnected);

                    if (isSlackConnected) {
                        const channelDef = settingsData.find((s: any) => s.key === 'SLACK_ALERTS_CHANNEL');
                        if (channelDef) setSlackAlertsChannel(channelDef.value);

                        const statusDef = settingsData.find((s: any) => s.key === 'SLACK_ALERTS_STATUS');
                        if (statusDef) setSlackAlertsStatus(statusDef.value);

                        const lastErrDef = settingsData.find((s: any) => s.key === 'SLACK_ALERTS_LAST_ERROR');
                        if (lastErrDef) setSlackAlertsLastError(lastErrDef.value);

                        const lastErrAtDef = settingsData.find((s: any) => s.key === 'SLACK_ALERTS_LAST_ERROR_AT');
                        if (lastErrAtDef) setSlackAlertsLastErrorAt(lastErrAtDef.value);
                    }
                }
            })
            .catch(err => console.error('[SlackIntegrationCard] Failed to fetch settings', err));
    }, []);

    useEffect(() => {
        if (slackConnected) {
            setLoadingChannels(true);
            apiClient<any>('/api/slack/channels')
                .then(res => {
                    if (res?.data) {
                        setSlackChannels(res.data);
                    }
                })
                .catch(err => console.error('Failed to fetch slack channels', err))
                .finally(() => setLoadingChannels(false));
        }
    }, [slackConnected]);

    const handleSaveSlackChannel = async (channelId: string) => {
        try {
            setSavingChannel(true);
            setMsg('');
            const selectedChannel = slackChannels.find(c => c.id === channelId);

            await apiClient<any>('/api/slack/channel', {
                method: 'POST',
                body: JSON.stringify({ channel_id: channelId }),
            });

            setSlackAlertsChannel(channelId);
            setSlackAlertsStatus('active');
            setMsg('Slack alerts channel updated successfully. Test message sent!');
        } catch (e: any) {
            setMsg('Failed to update Slack channel: ' + e.message);
        } finally {
            setSavingChannel(false);
        }
    };

    const handleDisconnectSlack = async () => {
        try {
            setShowDisconnectConfirm(false);
            setDisconnectingSlack(true);
            setMsg('');

            await apiClient<any>('/api/user/settings/slack/disconnect', {
                method: 'POST'
            });

            setSlackConnected(false);
            setSlackAlertsChannel('');
            setSlackAlertsStatus('revoked');
            setMsg('Slack integration disconnected successfully.');
        } catch (e: any) {
            setMsg('Failed to disconnect Slack: ' + e.message);
        } finally {
            setDisconnectingSlack(false);
        }
    };

    const handleSlackConnect = async () => {
        window.location.href = '/api/slack/install';
    };

    return (
        <div style={{
            background: '#FFFFFF', borderRadius: '24px', padding: '2.5rem',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', marginBottom: '2rem', border: '1px solid #E5E7EB'
        }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#111827' }}>Slack Integration</h2>
            <p style={{ color: '#6B7280', fontSize: '0.95rem', marginBottom: '2rem' }}>Connect Slack to receive real-time alerts about domain pausing and infrastructure health.</p>

            {msg && (
                <div style={{
                    padding: '1rem', marginBottom: '2rem', borderRadius: '12px', fontSize: '0.9rem',
                    background: msg.includes('Error') || msg.includes('Failed') ? '#FEF2F2' : '#F0FDF4',
                    color: msg.includes('Error') || msg.includes('Failed') ? '#991B1B' : '#166534',
                    border: `1px solid ${msg.includes('Error') || msg.includes('Failed') ? '#FECACA' : '#BBF7D0'}`
                }}>
                    {msg}
                </div>
            )}

            {!slackConnected ? (
                <button
                    onClick={handleSlackConnect}
                    style={{
                        padding: '0.75rem 2rem', borderRadius: '999px',
                        background: '#111827', color: '#FFFFFF', fontWeight: 600,
                        border: 'none', cursor: 'pointer', fontSize: '1rem',
                        transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        display: 'flex', alignItems: 'center', gap: '0.75rem'
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 127 127" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M27.2 80a13.6 13.6 0 01-13.6 13.6A13.6 13.6 0 010 80a13.6 13.6 0 0113.6-13.6h13.6V80zm6.8 0a13.6 13.6 0 0113.6-13.6 13.6 13.6 0 0113.6 13.6v34a13.6 13.6 0 01-13.6 13.6A13.6 13.6 0 0134 114V80z" fill="#E01E5A" />
                        <path d="M47.6 27.2A13.6 13.6 0 0134 13.6 13.6 13.6 0 0147.6 0a13.6 13.6 0 0113.6 13.6v13.6H47.6zm0 6.8a13.6 13.6 0 0113.6 13.6 13.6 13.6 0 01-13.6 13.6H13.6A13.6 13.6 0 010 47.6 13.6 13.6 0 0113.6 34h34z" fill="#36C5F0" />
                        <path d="M99.6 47.6a13.6 13.6 0 0113.6-13.6 13.6 13.6 0 0113.6 13.6 13.6 13.6 0 01-13.6 13.6H99.6V47.6zm-6.8 0a13.6 13.6 0 01-13.6 13.6 13.6 13.6 0 01-13.6-13.6V13.6A13.6 13.6 0 0179.2 0a13.6 13.6 0 0113.6 13.6v34z" fill="#2EB67D" />
                        <path d="M79.2 99.6a13.6 13.6 0 0113.6 13.6 13.6 13.6 0 01-13.6 13.6 13.6 13.6 0 01-13.6-13.6V99.6h13.6zm0-6.8a13.6 13.6 0 01-13.6-13.6 13.6 13.6 0 0113.6-13.6h34a13.6 13.6 0 0113.6 13.6 13.6 13.6 0 01-13.6 13.6h-34z" fill="#ECB22E" />
                    </svg>
                    Connect Slack
                </button>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{
                            padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 700,
                            background: slackAlertsStatus === 'active' ? '#DCFCE7' : '#FEF2F2',
                            color: slackAlertsStatus === 'active' ? '#166534' : '#991B1B'
                        }}>
                            {slackAlertsStatus === 'active' ? 'Active' : 'Offline'}
                        </span>
                        {slackAlertsLastError && (
                            <span style={{ fontSize: '0.85rem', color: '#EF4444' }}>
                                Last error: {slackAlertsLastError} ({new Date(slackAlertsLastErrorAt).toLocaleString()})
                            </span>
                        )}
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                            Alerts Channel
                        </label>
                        <select
                            value={slackAlertsChannel}
                            onChange={(e) => handleSaveSlackChannel(e.target.value)}
                            disabled={loadingChannels || savingChannel}
                            style={{
                                width: '100%', padding: '0.75rem 1rem', borderRadius: '12px',
                                border: '1px solid #E5E7EB', outline: 'none',
                                background: loadingChannels || savingChannel ? '#F3F4F6' : '#FFFFFF',
                                fontSize: '1rem', color: '#111827'
                            }}
                        >
                            <option value="">Select a channel...</option>
                            {slackChannels.map(c => (
                                <option key={c.id} value={c.id}>#{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                        {showDisconnectConfirm ? (
                            <div style={{ background: '#FEF2F2', padding: '1rem', borderRadius: '12px', border: '1px solid #FECACA', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ color: '#991B1B', fontWeight: 600 }}>Are you sure you want to disconnect Slack?</span>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => setShowDisconnectConfirm(false)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #D1D5DB', background: '#FFFFFF', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                                    <button onClick={handleDisconnectSlack} disabled={disconnectingSlack} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', background: '#DC2626', color: '#FFFFFF', cursor: disconnectingSlack ? 'not-allowed' : 'pointer', fontWeight: 600 }}>{disconnectingSlack ? 'Disconnecting...' : 'Yes, Disconnect'}</button>
                                </div>
                            </div>
                        ) : (
                            <button onClick={() => setShowDisconnectConfirm(true)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #FECACA', background: '#FEF2F2', color: '#DC2626', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}>
                                Disconnect Slack
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

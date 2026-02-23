/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import CopyButton from '@/components/CopyButton';
import HealthEnforcementModal from '@/components/modals/HealthEnforcementModal';
import SyncProgressModal from '@/components/modals/SyncProgressModal';
import { useRouter } from 'next/navigation';

export default function Settings() {
    const router = useRouter();
    const [apiKey, setApiKey] = useState('');
    const [ebApiKey, setEbApiKey] = useState('');
    const [webhookUrl, setWebhookUrl] = useState('');
    const [webhookSecret, setWebhookSecret] = useState('');
    const [smartleadWebhookUrl, setSmartleadWebhookUrl] = useState('');
    const [emailBisonWebhookUrl, setEmailBisonWebhookUrl] = useState('');
    const [slackConnected, setSlackConnected] = useState(false);

    // Slack Alerts State
    const [slackChannels, setSlackChannels] = useState<{ id: string, name: string }[]>([]);
    const [slackAlertsChannel, setSlackAlertsChannel] = useState('');
    const [slackAlertsStatus, setSlackAlertsStatus] = useState('active');
    const [slackAlertsLastError, setSlackAlertsLastError] = useState('');
    const [slackAlertsLastErrorAt, setSlackAlertsLastErrorAt] = useState('');
    const [loadingChannels, setLoadingChannels] = useState(false);
    const [savingChannel, setSavingChannel] = useState(false);
    const [disconnectingSlack, setDisconnectingSlack] = useState(false);
    const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    // Phase 5: System Mode
    const [org, setOrg] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [systemMode, setSystemMode] = useState('observe');

    // Health Enforcement Modal
    const [showHealthModal, setShowHealthModal] = useState(false);
    const [healthCheckData, setHealthCheckData] = useState<any>(null);

    // Sync Progress Modal
    const [showSyncModal, setShowSyncModal] = useState(false);
    const [syncSessionId, setSyncSessionId] = useState<string | null>(null);

    // Integration slide box
    const [activeIntegration, setActiveIntegration] = useState<'smartlead' | 'instantly' | 'emailbison' | 'replyio'>('smartlead');


    useEffect(() => {
        // Fetch current settings
        apiClient<any>('/api/settings')
            .then(data => {
                if (data) {
                    // Check if data is array (new format)
                    const settingsData = Array.isArray(data) ? data : [];
                    const keySetting = settingsData.find((s: any) => s.key === 'SMARTLEAD_API_KEY');
                    if (keySetting) setApiKey(keySetting.value);

                    const ebKeySetting = settingsData.find((s: any) => s.key === 'EMAILBISON_API_KEY');
                    if (ebKeySetting) setEbApiKey(ebKeySetting.value);

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
            .catch(() => { }); // Silent fail for settings

        // Fetch organization info (Phase 5)
        apiClient<any>('/api/organization')
            .then(response => {
                const org = response.data || response; // Handle wrapped response
                setOrg(org);
                if (org?.system_mode) setSystemMode(org.system_mode);
            })
            .catch(() => {
                setMsg('Failed to fetch organization details');
            });

        // Fetch current user
        apiClient<any>('/api/user/me')
            .then(response => {
                const user = response.data || response;
                setUser(user);
            })
            .catch(() => { });

        // Fetch Clay webhook configuration with secret
        apiClient<any>('/api/settings/clay-webhook-url')
            .then(data => {
                // Handle both nested and direct response formats
                const webhookData = data?.data || data;

                if (webhookData?.webhookUrl) {
                    setWebhookUrl(webhookData.webhookUrl);
                    setWebhookSecret(webhookData.webhookSecret || '');
                } else {
                    // Fallback to constructing URL client-side
                    const protocol = window.location.protocol;
                    const hostname = window.location.hostname;
                    const backendUrl = process.env.NEXT_PUBLIC_API_URL || `${protocol}//${hostname}`;
                    setWebhookUrl(`${backendUrl}/api/ingest/clay`);
                }
            })
            .catch(() => {
                // Fallback to constructing URL client-side
                const protocol = window.location.protocol;
                const hostname = window.location.hostname;
                const backendUrl = process.env.NEXT_PUBLIC_API_URL || `${protocol}//${hostname}`;
                setWebhookUrl(`${backendUrl}/api/ingest/clay`);
            });

        setSmartleadWebhookUrl(`${window.location.protocol}//${window.location.hostname}:3001/api/monitor/smartlead-webhook`);
        setEmailBisonWebhookUrl(`${window.location.protocol}//${window.location.hostname}:3001/api/monitor/emailbison-webhook`);
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

            const result = await apiClient<any>('/api/user/settings', {
                method: 'PATCH',
                body: JSON.stringify({
                    slack_alerts_channel: channelId,
                    slack_alerts_channel_name: selectedChannel?.name || null,
                    slack_alerts_status: 'active' // Re-activate if it was failing
                }),
            });

            setSlackAlertsChannel(channelId);
            setSlackAlertsStatus('active');
            setMsg('Slack alerts channel updated successfully. Test message sent!');
        } catch (e: any) {
            setMsg('Failed to update Slack channel: ' + e.message);
        } finally {
            setSavingChannel(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
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
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await apiClient('/api/settings', {
                method: 'POST',
                body: JSON.stringify({ SMARTLEAD_API_KEY: apiKey })
            });
            setMsg('Settings saved successfully.');
        } catch (err: any) {
            setMsg(err.message || 'Error saving settings.');
        } finally {
            setLoading(false);
        }
    };

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

    const handleSystemModeChange = async (mode: string) => {
        setLoading(true);
        try {
            await apiClient('/api/organization', {
                method: 'PATCH',
                body: JSON.stringify({ system_mode: mode })
            });
            setSystemMode(mode);
            setMsg(`System mode changed to ${mode.toUpperCase()}`);
        } catch (err: any) {
            setMsg(err.message || 'Error updating system mode.');
        } finally {
            setLoading(false);
        }
    };

    // Handle test event simulation

    const modeDescriptions: Record<string, {
        title: string;
        desc: string;
        color: string;
        pausingBehavior: string;
        gateBehavior: string;
        gateIcon: string;
    }> = {
        observe: {
            title: 'Observe Mode',
            desc: '⚠️ Least protective. Infrastructure pauses automatically, but new leads still allowed through gate.',
            color: '#3b82f6',
            pausingBehavior: '✅ Auto-pauses unhealthy domains/mailboxes immediately',
            gateBehavior: '⚠️ Allows new leads through even with issues (logs warnings only)',
            gateIcon: '⚠️'
        },
        suggest: {
            title: 'Suggest Mode',
            desc: '⚡ Balanced protection. Infrastructure pauses automatically + shows recommendations.',
            color: '#eab308',
            pausingBehavior: '✅ Auto-pauses unhealthy domains/mailboxes immediately',
            gateBehavior: '⚠️ Allows new leads through but shows caution warnings',
            gateIcon: '⚡'
        },
        enforce: {
            title: 'Enforce Mode',
            desc: '🛡️ Full protection. Infrastructure pauses automatically + blocks risky leads at gate.',
            color: '#22c55e',
            pausingBehavior: '✅ Auto-pauses unhealthy domains/mailboxes immediately',
            gateBehavior: '✅ Blocks new leads when infrastructure unhealthy (recommended)',
            gateIcon: '🛡️'
        }
    };

    return (
        <>
            <div style={{ paddingLeft: '1rem', paddingRight: '1rem', paddingBottom: '3rem' }}>
                <div className="page-header">
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', color: '#111827', letterSpacing: '-0.025em' }}>Settings & Configuration</h1>
                    <div style={{ color: '#6B7280', fontSize: '1.1rem' }}>Manage integrations, system modes, and credentials</div>
                </div>

                {/* System Mode Control - Phase 5 */}
                <div className="premium-card" style={{ marginBottom: '1.5rem', borderLeft: `6px solid ${modeDescriptions[systemMode]?.color || '#E2E8F0'}` }}>
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

                    {/* Explanation Banner */}
                    <div style={{
                        padding: '1.25rem',
                        background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                        border: '2px solid #3B82F6',
                        borderRadius: '12px',
                        marginBottom: '1.5rem'
                    }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
                            <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>💡</span>
                            <div>
                                <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#1E40AF', marginBottom: '0.5rem' }}>
                                    How System Modes Work
                                </h3>
                                <p style={{ fontSize: '0.8rem', color: '#1E40AF', lineHeight: '1.6', margin: 0 }}>
                                    <strong>All modes automatically pause unhealthy infrastructure to protect your reputation.</strong> The difference between modes is how the <strong>execution gate</strong> handles new leads:
                                </p>
                                <ul style={{ fontSize: '0.75rem', color: '#1E40AF', lineHeight: '1.6', margin: '0.5rem 0 0 0', paddingLeft: '1.25rem' }}>
                                    <li><strong>Observe:</strong> Logs warnings but allows leads through</li>
                                    <li><strong>Suggest:</strong> Shows recommendations but allows leads through</li>
                                    <li><strong>Enforce:</strong> Blocks leads when infrastructure unhealthy (recommended)</li>
                                </ul>
                            </div>
                        </div>
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
                                <p style={{ fontSize: '0.875rem', color: '#64748B', lineHeight: '1.6', marginBottom: '1rem' }}>
                                    {modeDescriptions[mode].desc}
                                </p>

                                {/* Detailed Behavior Breakdown */}
                                <div style={{
                                    padding: '1rem',
                                    background: '#F8FAFC',
                                    borderRadius: '10px',
                                    border: '1px solid #F1F5F9',
                                    fontSize: '0.75rem',
                                    lineHeight: '1.6'
                                }}>
                                    <div style={{ marginBottom: '0.75rem' }}>
                                        <div style={{ fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                                            🔧 Infrastructure Pausing:
                                        </div>
                                        <div style={{ color: '#10B981', fontSize: '0.7rem' }}>
                                            {modeDescriptions[mode].pausingBehavior}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                                            {modeDescriptions[mode].gateIcon} Execution Gate:
                                        </div>
                                        <div style={{ color: mode === 'enforce' ? '#10B981' : '#F59E0B', fontSize: '0.7rem' }}>
                                            {modeDescriptions[mode].gateBehavior}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Organization Info */}
                <div className="premium-card" style={{ marginBottom: '1rem' }}>
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
                                            <strong>Webhook Header Required:</strong> Include <code style={{ fontFamily: 'monospace', fontWeight: 700 }}>x-organization-id</code> in your Clay, Smartlead, and EmailBison webhook configurations.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                                    Organization ID
                                    <span style={{ fontSize: '0.65rem', fontWeight: 500, color: '#94A3B8', textTransform: 'none', marginLeft: '0.5rem' }}>(UUID format)</span>
                                </label>
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

                {/* Integration Provider Selector — below Org Details, above the 2-column grid */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    {[
                        { key: 'smartlead' as const, label: 'Smartlead', icon: '/smartlead.webp', active: true },
                        { key: 'instantly' as const, label: 'Instantly', icon: '/instantly.png', active: false },
                        { key: 'emailbison' as const, label: 'EmailBison', icon: '/emailbison.png', active: true },
                        { key: 'replyio' as const, label: 'Reply.io', icon: '/replyio.png', active: false },
                    ].map(provider => (
                        <button
                            key={provider.key}
                            onClick={() => setActiveIntegration(provider.key)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                borderRadius: '10px',
                                border: activeIntegration === provider.key ? '2px solid #2563EB' : '1px solid #E2E8F0',
                                background: activeIntegration === provider.key ? '#EFF6FF' : '#FFFFFF',
                                color: activeIntegration === provider.key ? '#1E40AF' : '#64748B',
                                fontWeight: activeIntegration === provider.key ? 700 : 500,
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                        >
                            {provider.icon && <Image src={provider.icon} alt={provider.label} width={18} height={18} />}
                            {provider.label}
                            {!provider.active && (
                                <span style={{
                                    fontSize: '0.6rem',
                                    background: '#F1F5F9',
                                    color: '#94A3B8',
                                    padding: '0.1rem 0.4rem',
                                    borderRadius: '4px',
                                    fontWeight: 600,
                                }}>SOON</span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Integration Slide Box */}
                    <div className="premium-card" style={{ position: 'relative', overflow: 'hidden' }}>
                        {/* Smartlead Content */}
                        {activeIntegration === 'smartlead' && (
                            <>
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
                                            const sessionId = `sync-${Date.now()}-${Math.random().toString(36).substring(7)}`;
                                            setSyncSessionId(sessionId);
                                            setShowSyncModal(true);
                                            await new Promise(resolve => setTimeout(resolve, 500));
                                            try {
                                                await apiClient<any>(`/api/sync?session=${sessionId}`, {
                                                    method: 'POST',
                                                    timeout: 600_000
                                                });
                                            } catch (e: any) {
                                                console.error('[Sync] API call error:', {
                                                    message: e.message,
                                                    name: e.name,
                                                    stack: e.stack,
                                                    isTimeout: e.message?.includes('timeout')
                                                });
                                            }
                                        }}
                                        disabled={loading}
                                        className="premium-btn"
                                        style={{ width: '100%', marginTop: '1rem', background: '#FFFFFF', color: '#1E293B', border: '1px solid #E2E8F0' }}
                                    >
                                        Trigger Manual Sync
                                    </button>

                                    {/* 24/7 Monitoring Info */}
                                    <div style={{
                                        marginTop: '1.5rem',
                                        padding: '1rem',
                                        background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
                                        border: '2px solid #10B981',
                                        borderRadius: '10px'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                            <div style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '8px',
                                                background: '#10B981',
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
                                                    <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#065F46', margin: 0 }}>
                                                        24/7 Auto-Sync Active
                                                    </h4>
                                                    <span style={{
                                                        padding: '0.125rem 0.5rem',
                                                        background: '#10B981',
                                                        color: 'white',
                                                        borderRadius: '999px',
                                                        fontSize: '0.5rem',
                                                        fontWeight: 700,
                                                        letterSpacing: '0.05em'
                                                    }}>
                                                        LIVE
                                                    </span>
                                                </div>
                                                <p style={{ fontSize: '0.75rem', color: '#047857', margin: 0, lineHeight: 1.6 }}>
                                                    Your Smartlead data syncs automatically every <strong>20 minutes</strong>.
                                                    Manual sync is available for immediate updates after changes.
                                                </p>
                                                <a
                                                    href="/docs/help/24-7-monitoring"
                                                    target="_blank"
                                                    style={{
                                                        fontSize: '0.6875rem',
                                                        color: '#059669',
                                                        fontWeight: 700,
                                                        textDecoration: 'underline',
                                                        marginTop: '0.5rem',
                                                        display: 'inline-block'
                                                    }}
                                                >
                                                    Learn about 24/7 monitoring →
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Instantly — Coming Soon */}
                        {activeIntegration === 'instantly' && (
                            <div style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.5rem' }}>Instantly Integration</h2>
                                <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                                    Connect your Instantly account to sync campaigns, manage mailbox rotation, and monitor deliverability.
                                </p>
                                <div style={{
                                    display: 'inline-block',
                                    padding: '0.5rem 1.5rem',
                                    background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                                    border: '1px solid #93C5FD',
                                    borderRadius: '999px',
                                    color: '#1E40AF',
                                    fontSize: '0.875rem',
                                    fontWeight: 700
                                }}>
                                    🚀 Coming Soon
                                </div>
                            </div>
                        )}

                        {/* EmailBison Integration */}
                        {activeIntegration === 'emailbison' && (
                            <>
                                <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: '40px', height: '40px', background: '#fff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', fontSize: '1.25rem' }}>
                                        🦬
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1E293B' }}>EmailBison Integration</h2>
                                        <p style={{ fontSize: '0.875rem', color: '#64748B' }}>Warm-up monitoring & reputation tracking.</p>
                                    </div>
                                    <a
                                        href="/docs/emailbison-integration"
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

                                <form onSubmit={handleSaveEmailBison} style={{ marginBottom: '2rem' }}>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>API Key</label>
                                        <input
                                            type="password"
                                            value={ebApiKey}
                                            onChange={e => setEbApiKey(e.target.value)}
                                            className="premium-input w-full"
                                            placeholder="eb_..."
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                    <button type="submit" className="premium-btn w-full" disabled={loading}>
                                        {loading ? 'Saving...' : 'Save Configuration'}
                                    </button>
                                    {msg && <div className="text-center mt-4 text-sm font-medium" style={{ color: msg.includes('Error') ? '#EF4444' : '#10B981' }}>{msg}</div>}
                                </form>

                                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Webhook Endpoint</h3>
                                        <CopyButton text={emailBisonWebhookUrl} label="Copy URL" className="text-xs text-blue-600 font-semibold hover:text-blue-800 transition-colors bg-transparent border-0 p-0" />
                                    </div>
                                    <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0', wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.8rem', color: '#2563EB' }}>
                                        {emailBisonWebhookUrl || 'Loading...'}
                                    </div>
                                    <button
                                        onClick={async () => {
                                            const sessionId = `sync-${Date.now()}-${Math.random().toString(36).substring(7)}`;
                                            setSyncSessionId(sessionId);
                                            setShowSyncModal(true);
                                            await new Promise(resolve => setTimeout(resolve, 500));
                                            try {
                                                await apiClient<any>(`/api/sync?session=${sessionId}`, {
                                                    method: 'POST',
                                                    timeout: 600_000
                                                });
                                            } catch (e: any) {
                                                console.error('[Sync] API call error:', {
                                                    message: e?.message,
                                                });
                                            }
                                        }}
                                        disabled={loading}
                                        className="premium-btn"
                                        style={{ width: '100%', marginTop: '1rem', background: '#FFFFFF', color: '#1E293B', border: '1px solid #E2E8F0' }}
                                    >
                                        Trigger Manual Sync
                                    </button>
                                </div>

                                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1.5rem' }}>
                                    <div style={{
                                        padding: '1rem',
                                        background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
                                        border: '2px solid #10B981',
                                        borderRadius: '10px'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                            <div style={{
                                                width: '32px', height: '32px', borderRadius: '8px', background: '#10B981',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0
                                            }}>⚡</div>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#065F46', margin: 0, marginBottom: '0.375rem' }}>
                                                    Multi-Platform Sync
                                                </h4>
                                                <p style={{ fontSize: '0.75rem', color: '#047857', margin: 0, lineHeight: 1.6 }}>
                                                    EmailBison data syncs alongside Smartlead automatically every <strong>20 minutes</strong>.
                                                    Each platform syncs independently with failure isolation.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Reply.io — Coming Soon */}
                        {activeIntegration === 'replyio' && (
                            <div style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.5rem' }}>Reply.io Integration</h2>
                                <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                                    Integrate Reply.io to sync multichannel sequences and track engagement across email, LinkedIn, and calls.
                                </p>
                                <div style={{
                                    display: 'inline-block',
                                    padding: '0.5rem 1.5rem',
                                    background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                                    border: '1px solid #93C5FD',
                                    borderRadius: '999px',
                                    color: '#1E40AF',
                                    fontSize: '0.875rem',
                                    fontWeight: 700
                                }}>
                                    🚀 Coming Soon
                                </div>
                            </div>
                        )}
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

                        {/* Security Warning */}
                        <div style={{ padding: '1rem 1.25rem', background: '#FEF3C7', borderRadius: '12px', border: '1px solid #FDE047', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
                                <span style={{ fontSize: '1.25rem' }}>🔐</span>
                                <div>
                                    <p style={{ fontSize: '0.875rem', color: '#92400E', margin: 0, fontWeight: 600, marginBottom: '0.25rem' }}>
                                        Webhook Security Required
                                    </p>
                                    <p style={{ fontSize: '0.8rem', color: '#78350F', margin: 0, lineHeight: '1.4' }}>
                                        Clay must send HMAC signature to prevent unauthorized access. Configure below.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: '1.5rem', background: '#F0F9FF', borderRadius: '16px', border: '1px solid #BAE6FD', marginBottom: '1rem' }}>
                            <div className="flex justify-between items-center mb-2">
                                <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0369A1', textTransform: 'uppercase' }}>Webhook URL</h3>
                                {webhookUrl && <CopyButton text={webhookUrl} label="Copy" className="text-xs text-blue-600 font-semibold hover:text-blue-800 transition-colors bg-transparent border-0 p-0" />}
                            </div>
                            <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '8px', border: '1px solid #BAE6FD', wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.8rem', color: '#0284C7' }}>
                                {webhookUrl || 'Loading...'}
                            </div>
                            {!webhookUrl && (
                                <p style={{ fontSize: '0.7rem', color: '#0369A1', marginTop: '0.5rem', margin: 0, fontStyle: 'italic' }}>
                                    💡 Refresh the page if this doesn't load
                                </p>
                            )}
                        </div>

                        <div style={{ padding: '1.5rem', background: '#FEF2F2', borderRadius: '16px', border: '1px solid #FECACA', marginBottom: '1rem' }}>
                            <div className="flex justify-between items-center mb-2">
                                <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#991B1B', textTransform: 'uppercase' }}>Webhook Secret</h3>
                                {webhookSecret && <CopyButton text={webhookSecret} label="Copy Secret" className="text-xs text-red-600 font-semibold hover:text-red-800 transition-colors bg-transparent border-0 p-0" />}
                            </div>
                            <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '8px', border: '1px solid #FECACA', wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.75rem', color: '#DC2626' }}>
                                {webhookSecret || 'Generating...'}
                            </div>
                            {webhookSecret ? (
                                <p style={{ fontSize: '0.75rem', color: '#991B1B', marginTop: '0.75rem', margin: 0, lineHeight: '1.4' }}>
                                    ⚠️ Keep this secret safe! Use it to generate HMAC-SHA256 signatures.
                                </p>
                            ) : (
                                <p style={{ fontSize: '0.7rem', color: '#991B1B', marginTop: '0.5rem', margin: 0, fontStyle: 'italic' }}>
                                    💡 Secret auto-generated on first load. Refresh if this doesn't appear.
                                </p>
                            )}
                        </div>

                        <div style={{ padding: '1rem 1.25rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                            <p style={{ fontSize: '0.875rem', color: '#0C4A6E', lineHeight: '1.6', marginBottom: '0.75rem' }}>
                                <strong>Configure in Clay:</strong>
                            </p>
                            <ul style={{ fontSize: '0.8rem', color: '#475569', lineHeight: '1.6', margin: 0, paddingLeft: '1.25rem' }}>
                                <li>Use <code style={{ background: '#E2E8F0', padding: '0.125rem 0.375rem', borderRadius: '4px', fontFamily: 'monospace' }}>HTTP API</code> column</li>
                                <li>Method: <strong>POST</strong></li>
                                <li>Add header: <code style={{ background: '#E2E8F0', padding: '0.125rem 0.375rem', borderRadius: '4px', fontFamily: 'monospace' }}>X-Organization-ID: {org?.id}</code></li>
                                <li>Add header: <code style={{ background: '#E2E8F0', padding: '0.125rem 0.375rem', borderRadius: '4px', fontFamily: 'monospace' }}>X-Clay-Signature: {"<HMAC-SHA256>"}</code></li>
                                <li>Generate signature using webhook secret above</li>
                            </ul>
                        </div>
                    </div>

                    {/* Slack Integration */}
                    <div className="col-span-1 md:col-span-2 premium-card mt-2">
                        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '40px', height: '40px', background: '#fff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52z" fill="#E01E5A" />
                                    <path d="M6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#E01E5A" />
                                    <path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834z" fill="#36C5F0" />
                                    <path d="M8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#36C5F0" />
                                    <path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834z" fill="#2EB67D" />
                                    <path d="M17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z" fill="#2EB67D" />
                                    <path d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52z" fill="#ECB22E" />
                                    <path d="M15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.52h-6.313z" fill="#ECB22E" />
                                </svg>
                            </div>
                            <div style={{ flex: 1 }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1E293B' }}>Slack Bot Integration</h2>
                                <p style={{ fontSize: '0.875rem', color: '#64748B' }}>Get infrastructure alerts and run slash commands directly from Slack.</p>
                            </div>
                            <a
                                href="/docs/slack-integration"
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

                        <div style={{ padding: '1.5rem', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.25rem' }}>
                                    {slackConnected ? 'Slack is Connected' : 'Connect your Workspace'}
                                </h3>
                                <p style={{ fontSize: '0.875rem', color: '#64748B', maxWidth: '400px', lineHeight: '1.5' }}>
                                    {slackConnected
                                        ? 'Your Superkabe bot is installed and actively monitoring your infrastructure.'
                                        : <><span style={{ marginRight: '3px' }}>Install the Superkabe bot to monitor domains and mailboxes via</span><code style={{ background: '#E2E8F0', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>/superkabe</code> commands.</>
                                    }
                                </p>
                            </div>

                            {slackConnected ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.75rem 1.25rem',
                                        background: '#ECFDF5',
                                        color: '#059669',
                                        fontWeight: 700,
                                        fontSize: '0.875rem',
                                        borderRadius: '8px',
                                        border: '1px solid #A7F3D0'
                                    }}>
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Connected
                                    </div>
                                    <button
                                        onClick={() => setShowDisconnectConfirm(true)}
                                        disabled={disconnectingSlack}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            padding: '0.75rem 1.25rem',
                                            background: '#FFFFFF',
                                            color: '#DC2626',
                                            fontWeight: 600,
                                            fontSize: '0.875rem',
                                            borderRadius: '8px',
                                            border: '1px solid #FECACA',
                                            cursor: disconnectingSlack ? 'not-allowed' : 'pointer',
                                            opacity: disconnectingSlack ? 0.7 : 1,
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseOver={(e) => { if (!disconnectingSlack) { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.borderColor = '#F87171'; } }}
                                        onMouseOut={(e) => { if (!disconnectingSlack) { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = '#FECACA'; } }}
                                    >
                                        {disconnectingSlack ? 'Disconnecting...' : 'Disconnect'}
                                    </button>
                                </div>
                            ) : (
                                <a
                                    href={`https://slack.com/oauth/v2/authorize?client_id=${process.env.NEXT_PUBLIC_SLACK_CLIENT_ID}&scope=chat:write,commands,app_mentions:read,channels:read,groups:read&redirect_uri=https://api.superkabe.com/slack/oauth/callback&state=${org?.id}:${user?.id}`}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.75rem 1.25rem',
                                        background: '#FFFFFF',
                                        color: '#0F172A',
                                        fontWeight: 600,
                                        fontSize: '0.875rem',
                                        borderRadius: '8px',
                                        border: '1px solid #CBD5E1',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                        transition: 'all 0.2s ease',
                                        textDecoration: 'none'
                                    }}
                                    onMouseOver={(e) => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#94A3B8'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = '#CBD5E1'; }}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52z" fill="#E01E5A" />
                                        <path d="M6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#E01E5A" />
                                        <path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834z" fill="#36C5F0" />
                                        <path d="M8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#36C5F0" />
                                        <path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834z" fill="#2EB67D" />
                                        <path d="M17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z" fill="#2EB67D" />
                                        <path d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52z" fill="#ECB22E" />
                                        <path d="M15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.52h-6.313z" fill="#ECB22E" />
                                    </svg>
                                    Add to Slack
                                </a>
                            )}
                        </div>

                        {slackConnected && (
                            <div style={{ paddingTop: '1.5rem', marginTop: '1.5rem', borderTop: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        Proactive Alerts Configuration
                                        {slackAlertsStatus === 'active' && slackAlertsChannel && (
                                            <span style={{ fontSize: '0.75rem', padding: '0.1rem 0.4rem', borderRadius: '12px', background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0' }}>Active</span>
                                        )}
                                        {slackAlertsStatus !== 'active' && slackAlertsChannel && (
                                            <span style={{ fontSize: '0.75rem', padding: '0.1rem 0.4rem', borderRadius: '12px', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
                                                {slackAlertsStatus === 'channel_not_found' ? 'Channel Not Found' : slackAlertsStatus === 'auth_error' ? 'Auth Error' : 'Revoked'}
                                            </span>
                                        )}
                                    </h3>
                                    <p style={{ fontSize: '0.875rem', color: '#64748B', maxWidth: '500px', lineHeight: '1.5' }}>
                                        Superkabe will send critical infrastructure events, domain bounce spikes, and risk transitions directly to your designated Slack channel.
                                    </p>
                                </div>

                                {slackAlertsLastError && (
                                    <div style={{ padding: '0.75rem 1rem', background: '#FEF2F2', borderLeft: '4px solid #DC2626', borderRadius: '0 8px 8px 0', fontSize: '0.875rem', color: '#991B1B' }}>
                                        <strong>Alerts Suspended:</strong> {slackAlertsLastError}
                                        {slackAlertsLastErrorAt && <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: '#B91C1C' }}>Last Error: {new Date(slackAlertsLastErrorAt).toLocaleString()}</div>}
                                    </div>
                                )}

                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ flex: 1, maxWidth: '300px' }}>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Destination Channel</label>
                                        <select
                                            value={slackAlertsChannel}
                                            onChange={(e) => handleSaveSlackChannel(e.target.value)}
                                            disabled={loadingChannels || savingChannel}
                                            className="w-full text-sm border-slate-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            style={{ height: '42px', backgroundColor: loadingChannels ? '#F1F5F9' : '#FFFFFF' }}
                                        >
                                            <option value="" disabled>{loadingChannels ? 'Loading channels...' : 'Select a channel'}</option>
                                            {slackChannels.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {(savingChannel || loadingChannels) && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', fontSize: '0.875rem', color: '#64748B' }}>
                                            <svg className="animate-spin h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            {savingChannel ? 'Validating channel...' : 'Fetching list...'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Sync Progress Modal */}
            <SyncProgressModal
                isOpen={showSyncModal}
                sessionId={syncSessionId}
                onClose={() => {
                    setShowSyncModal(false);
                    setSyncSessionId(null);
                    // Optionally refresh the page to show updated data
                    window.location.reload();
                }}
                onPauseCampaigns={async () => {
                    try {
                        setLoading(true);
                        const result = await apiClient<any>('/api/dashboard/campaigns/pause-all', { method: 'POST' });
                        setMsg(result.message || 'All campaigns paused successfully.');
                    } catch (e: any) {
                        setMsg('Failed to pause campaigns: ' + e.message);
                    } finally {
                        setLoading(false);
                    }
                }}
                onViewHealthReport={() => {
                    setShowSyncModal(false);
                    router.push('/dashboard/infrastructure');
                }}
            />

            {/* Slack Disconnect Confirm Modal */}
            {showDisconnectConfirm && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div style={{ background: '#FFFFFF', padding: '2rem', borderRadius: '12px', maxWidth: '400px', width: '90%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '1rem' }}>Disconnect Slack?</h3>
                        <p style={{ fontSize: '0.875rem', color: '#4B5563', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                            Are you sure you want to disconnect Slack? This will remove all proactive alerts, slash commands, and completely uninstall the Superkabe bot from your workspace.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowDisconnectConfirm(false)}
                                disabled={disconnectingSlack}
                                style={{ padding: '0.5rem 1rem', background: '#FFFFFF', color: '#374151', border: '1px solid #D1D5DB', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDisconnectSlack}
                                disabled={disconnectingSlack}
                                style={{ padding: '0.5rem 1rem', background: '#DC2626', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: disconnectingSlack ? 'not-allowed' : 'pointer', opacity: disconnectingSlack ? 0.7 : 1 }}
                            >
                                Disconnect
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Health Enforcement Modal */}
            {healthCheckData && (
                <HealthEnforcementModal
                    isOpen={showHealthModal}
                    onClose={() => setShowHealthModal(false)}
                    criticalCount={healthCheckData.critical_count || 0}
                    findings={healthCheckData.findings || []}
                    overallScore={healthCheckData.overall_score}
                    onPauseCampaigns={async () => {
                        try {
                            setLoading(true);
                            setShowHealthModal(false);
                            const result = await apiClient<any>('/api/dashboard/campaigns/pause-all', { method: 'POST' });
                            setMsg(result.message || 'All campaigns paused successfully.');
                        } catch (e: any) {
                            setMsg('Failed to pause campaigns: ' + e.message);
                        } finally {
                            setLoading(false);
                        }
                    }}
                    onViewDetails={() => {
                        setShowHealthModal(false);
                        router.push('/dashboard/infrastructure');
                    }}
                />
            )}
        </>
    );
}

'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import CopyButton from '@/components/CopyButton';
import HealthEnforcementModal from '@/components/modals/HealthEnforcementModal';
import SyncProgressModal from '@/components/modals/SyncProgressModal';
import { useRouter } from 'next/navigation';
import SystemModeCard from '@/components/settings/SystemModeCard';
import SlackIntegrationCard from '@/components/settings/SlackIntegrationCard';
import EmailBisonCard from '@/components/settings/EmailBisonCard';
import InstantlyCard from '@/components/settings/InstantlyCard';

export default function Settings() {
    const router = useRouter();
    const [apiKey, setApiKey] = useState('');
    const [ebApiKey, setEbApiKey] = useState('');
    const [webhookUrl, setWebhookUrl] = useState('');
    const [webhookSecret, setWebhookSecret] = useState('');
    const [smartleadWebhookUrl, setSmartleadWebhookUrl] = useState('');
    const [emailBisonWebhookUrl, setEmailBisonWebhookUrl] = useState('');
    const [instantlyWebhookUrl, setInstantlyWebhookUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    // Phase 5: System Mode
    const [org, setOrg] = useState<{ id: string; name: string; slug: string; system_mode?: string } | null>(null);
    const [user, setUser] = useState<{ name?: string; email?: string; role?: string } | null>(null);
    const [systemMode, setSystemMode] = useState('observe');

    // Health Enforcement Modal
    const [showHealthModal, setShowHealthModal] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [healthCheckData, setHealthCheckData] = useState<Record<string, any> | null>(null);

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
                }
            })
            .catch(err => console.error('[Settings] Failed to fetch settings', err));

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
            .catch(err => console.error('[Settings] Failed to fetch user info', err));

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

        const backendBase = process.env.NEXT_PUBLIC_API_URL || `${window.location.protocol}//${window.location.hostname}`;
        setSmartleadWebhookUrl(`${backendBase}/api/monitor/smartlead-webhook`);
        setEmailBisonWebhookUrl(`${backendBase}/api/monitor/emailbison-webhook`);
        setInstantlyWebhookUrl(`${backendBase}/api/monitor/instantly-webhook`);
    }, []);

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

    const handleTriggerSync = async () => {
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

                <SystemModeCard />




































































































                {/* Organization Info */}
                <div className="premium-card" style={{ marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: '#1E293B' }}>Organization Details</h2>
                    {org ? (
                        <div>
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

                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                <div style={{ width: '140px', flexShrink: 0 }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Name</label>
                                    <div style={{ padding: '0.75rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#1E293B', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{org.name}</div>
                                </div>
                                <div style={{ width: '120px', flexShrink: 0 }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Slug</label>
                                    <div style={{ padding: '0.75rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#1E293B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{org.slug}</div>
                                </div>
                                <div style={{ flex: 1, minWidth: '260px' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                                        Organization ID
                                        <span style={{ fontSize: '0.65rem', fontWeight: 500, color: '#94A3B8', textTransform: 'none', marginLeft: '0.5rem' }}>(UUID format)</span>
                                    </label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <code style={{ flex: 1, padding: '0.75rem', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#334155', fontFamily: 'monospace', fontSize: '0.875rem' }}>{org.id}</code>
                                        <CopyButton text={org.id} label="Copy" />
                                    </div>
                                </div>
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
                        { key: 'instantly' as const, label: 'Instantly', icon: '/instantly.png', active: true },
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
                                        <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '0.5rem' }}>
                                            Generate at Smartlead → Settings → API Key. Available on all paid plans.
                                        </p>
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
                                    <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.5rem', lineHeight: 1.5 }}>
                                        Paste this URL in Smartlead → Settings → Webhooks.
                                        Select all events: email sent, opened, clicked, bounced, replied, unsubscribed.
                                        Include the <code style={{ fontFamily: 'monospace', fontWeight: 600 }}>x-organization-id</code> header.
                                    </p>
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

                        {/* Instantly */}
                        {activeIntegration === 'instantly' && (
                            <InstantlyCard webhookUrl={instantlyWebhookUrl} onTriggerSync={handleTriggerSync} />
                        )}

                        {activeIntegration === "emailbison" && <EmailBisonCard webhookUrl={emailBisonWebhookUrl} onTriggerSync={handleTriggerSync} />}
















































































































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

                    <SlackIntegrationCard />





























































































































































































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

'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import CopyButton from '@/components/CopyButton';
import HealthEnforcementModal from '@/components/modals/HealthEnforcementModal';
import { useRouter } from 'next/navigation';

export default function Settings() {
    const router = useRouter();
    const [apiKey, setApiKey] = useState('');
    const [webhookUrl, setWebhookUrl] = useState('');
    const [webhookSecret, setWebhookSecret] = useState('');
    const [smartleadWebhookUrl, setSmartleadWebhookUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    // Phase 5: System Mode
    const [org, setOrg] = useState<any>(null);
    const [systemMode, setSystemMode] = useState('observe');

    // Health Enforcement Modal
    const [showHealthModal, setShowHealthModal] = useState(false);
    const [healthCheckData, setHealthCheckData] = useState<any>(null);

    useEffect(() => {
        // Fetch current settings
        apiClient<any>('/api/settings')
            .then(data => {
                if (data) {
                    // Check if data is array (new format)
                    const settingsData = Array.isArray(data) ? data : [];
                    const keySetting = settingsData.find((s: any) => s.key === 'SMARTLEAD_API_KEY');
                    if (keySetting) setApiKey(keySetting.value);
                }
            })
            .catch(() => { }); // Silent fail for settings

        // Fetch organization info (Phase 5)
        apiClient<any>('/api/organization')
            .then(data => {
                setOrg(data);
                if (data?.system_mode) setSystemMode(data.system_mode);
            })
            .catch(err => {
                console.error('Fetch failed:', err);
                setMsg('Failed to fetch organization details');
            });

        // Fetch Clay webhook configuration with secret
        apiClient<any>('/api/settings/clay-webhook-url')
            .then(data => {
                console.log('[SETTINGS] Raw webhook response:', data);

                // Handle both nested and direct response formats
                const webhookData = data?.data || data;

                if (webhookData?.webhookUrl) {
                    setWebhookUrl(webhookData.webhookUrl);
                    setWebhookSecret(webhookData.webhookSecret || '');
                    console.log('[SETTINGS] Webhook config fetched:', {
                        webhookUrl: webhookData.webhookUrl,
                        hasSecret: !!webhookData.webhookSecret
                    });
                } else {
                    console.warn('[SETTINGS] No webhook URL in response, using fallback');
                    // Fallback to constructing URL client-side
                    const protocol = window.location.protocol;
                    const hostname = window.location.hostname;
                    const backendUrl = process.env.NEXT_PUBLIC_API_URL || `${protocol}//${hostname}`;
                    setWebhookUrl(`${backendUrl}/api/ingest/clay`);
                }
            })
            .catch((error) => {
                console.error('[SETTINGS] Failed to fetch webhook config:', error);
                // Fallback to constructing URL client-side
                const protocol = window.location.protocol;
                const hostname = window.location.hostname;
                const backendUrl = process.env.NEXT_PUBLIC_API_URL || `${protocol}//${hostname}`;
                setWebhookUrl(`${backendUrl}/api/ingest/clay`);
            });

        // Determine Smartlead webhook URL (client-side only to avoid hydration mismatch)
        setSmartleadWebhookUrl(`${window.location.protocol}//${window.location.hostname}:3001/api/monitor/smartlead-webhook`);
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
                                    const data = await apiClient<any>('/api/sync', { method: 'POST', timeout: 120_000 });
                                    setMsg(`Synced ${data.campaigns_synced || 0} campaigns.`);

                                    // Check for critical health issues
                                    if (data.health_check?.has_critical_issues) {
                                        setHealthCheckData(data.health_check);
                                        setShowHealthModal(true);
                                    }
                                } catch (e: any) { setMsg('Sync error: ' + e.message); }
                                setLoading(false);
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
            </div>

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
                            // TODO: Implement pause campaigns API call
                            await apiClient('/api/campaigns/pause-all', { method: 'POST' });
                            setMsg('All campaigns paused successfully.');
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
        </div>
    );
}

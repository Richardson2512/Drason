'use client';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type { SettingEntry, Organization, ClayWebhookResponse, SyncResponse } from '@/types/api';
import HealthEnforcementModal from '@/components/modals/HealthEnforcementModal';
import SyncProgressModal from '@/components/modals/SyncProgressModal';
import { useRouter } from 'next/navigation';
import SystemModeCard from '@/components/settings/SystemModeCard';
import SlackIntegrationCard from '@/components/settings/SlackIntegrationCard';
import EmailBisonCard from '@/components/settings/EmailBisonCard';
import InstantlyCard from '@/components/settings/InstantlyCard';
import SmartleadCard from '@/components/settings/SmartleadCard';
import OrganizationDetailsCard from '@/components/settings/OrganizationDetailsCard';
import ClayIntegrationCard from '@/components/settings/ClayIntegrationCard';
import IntegrationSelector from '@/components/settings/IntegrationSelector';

export default function Settings() {
    const router = useRouter();
    const [webhookUrl, setWebhookUrl] = useState('');
    const [webhookSecret, setWebhookSecret] = useState('');
    const [smartleadWebhookUrl, setSmartleadWebhookUrl] = useState('');
    const [emailBisonWebhookUrl, setEmailBisonWebhookUrl] = useState('');
    const [instantlyWebhookUrl, setInstantlyWebhookUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    // Phase 5: System Mode
    const [org, setOrg] = useState<Organization | null>(null);

    // Health Enforcement Modal
    const [showHealthModal, setShowHealthModal] = useState(false);
    const [healthCheckData, setHealthCheckData] = useState<{ critical_count?: number; findings?: { category: string; severity: string; title: string; details: string }[]; overall_score?: number } | null>(null);

    // Sync Progress Modal
    const [showSyncModal, setShowSyncModal] = useState(false);
    const [syncSessionId, setSyncSessionId] = useState<string | null>(null);
    const [syncError, setSyncError] = useState<string | null>(null);
    const [syncResult, setSyncResult] = useState<{ campaigns_synced: number; mailboxes_synced: number; leads_synced: number; health_check?: any } | null>(null);
    const [backendBase, setBackendBase] = useState('');

    // Settings array shared with child cards to avoid duplicate fetches
    const [settingsData, setSettingsData] = useState<SettingEntry[]>([]);

    // Integration slide box — default will be updated after settings load
    const [activeIntegration, setActiveIntegration] = useState<'smartlead' | 'instantly' | 'emailbison' | 'replyio'>('smartlead');
    const [settingsLoaded, setSettingsLoaded] = useState(false);

    // Auto-select first configured integration after settings load
    useEffect(() => {
        if (!settingsLoaded) return;
        const hasSmartlead = settingsData.some(s => s.key === 'SMARTLEAD_API_KEY' && s.value);
        if (hasSmartlead) return; // Smartlead is configured, keep default
        const hasEmailBison = settingsData.some(s => s.key === 'EMAILBISON_API_KEY' && s.value);
        if (hasEmailBison) { setActiveIntegration('emailbison'); return; }
        // Otherwise keep smartlead as default
    }, [settingsLoaded, settingsData]);

    useEffect(() => {
        // Fetch current settings
        apiClient<SettingEntry[]>('/api/settings')
            .then(data => {
                if (data) {
                    const arr = Array.isArray(data) ? data : [];
                    setSettingsData(arr);
                }
                setSettingsLoaded(true);
            })
            .catch(err => {
                console.error('[Settings] Failed to fetch settings', err);
                setSettingsLoaded(true);
            });

        // Fetch organization info (Phase 5)
        apiClient<Organization>('/api/organization')
            .then(response => {
                const org = response;
                setOrg(org);
            })
            .catch(() => {
                setMsg('Failed to fetch organization details');
            });

        // Fetch Clay webhook configuration with secret
        apiClient<ClayWebhookResponse>('/api/settings/clay-webhook-url')
            .then(data => {
                if (data?.webhookUrl) {
                    setWebhookUrl(data.webhookUrl);
                    setWebhookSecret(data.webhookSecret || '');
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

        const computedBackendBase = process.env.NEXT_PUBLIC_API_URL || `${window.location.protocol}//${window.location.hostname}`;
        setBackendBase(computedBackendBase);
        setSmartleadWebhookUrl(`${computedBackendBase}/api/monitor/smartlead-webhook`);
        setEmailBisonWebhookUrl(`${computedBackendBase}/api/monitor/emailbison-webhook`);
        setInstantlyWebhookUrl(`${computedBackendBase}/api/monitor/instantly-webhook`);
    }, []);

    const handleTriggerSync = async () => {
        const sessionId = `sync-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        setSyncSessionId(sessionId);
        setSyncError(null);
        setSyncResult(null);
        setShowSyncModal(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        try {
            const result = await apiClient<{ campaigns_synced: number; mailboxes_synced: number; leads_synced: number; health_check?: any }>(`/api/sync?session=${sessionId}`, {
                method: 'POST',
                timeout: 600_000
            });
            // HTTP response as fallback — if SSE didn't deliver 'complete', this will
            if (result) {
                setSyncResult(result);
            }
        } catch (e: any) {
            setSyncError(e.message || 'Sync failed. Check your API key and try again.');
        }
    };

    return (
        <>
            <div className="px-4 pb-12">
                <div className="page-header">
                    <h1 className="text-4xl font-extrabold mb-2 text-gray-900 tracking-tight">Settings & Configuration</h1>
                    <div className="text-gray-500 text-lg">Manage integrations, system modes, and credentials</div>
                </div>

                <SystemModeCard />

                {/* Organization Info */}
                <OrganizationDetailsCard org={org} />

                {/* Integration Provider Selector — below Org Details, above the 2-column grid */}
                <IntegrationSelector
                    activeIntegration={activeIntegration}
                    onSelect={(key) => setActiveIntegration(key as typeof activeIntegration)}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Integration Slide Box */}
                    <div className="premium-card relative overflow-hidden">
                        {/* Smartlead Content */}
                        {activeIntegration === 'smartlead' && (
                            <SmartleadCard webhookUrl={smartleadWebhookUrl} onTriggerSync={handleTriggerSync} settings={settingsData} />
                        )}

                        {/* Instantly */}
                        {activeIntegration === 'instantly' && (
                            <InstantlyCard webhookUrl={instantlyWebhookUrl} onTriggerSync={handleTriggerSync} settings={settingsData} />
                        )}

                        {activeIntegration === "emailbison" && <EmailBisonCard webhookUrl={emailBisonWebhookUrl} onTriggerSync={handleTriggerSync} settings={settingsData} />}

                        {/* Reply.io — Coming Soon */}
                        {activeIntegration === 'replyio' && (
                            <div className="text-center px-8 py-12">
                                <div className="text-5xl mb-4">💬</div>
                                <h2 className="text-2xl font-bold text-slate-800 mb-2">Reply.io Integration</h2>
                                <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                                    Integrate Reply.io to sync multichannel sequences and track engagement across email, LinkedIn, and calls.
                                </p>
                                <div className="inline-block px-6 py-2 border border-blue-300 rounded-full text-blue-800 text-sm font-bold bg-[linear-gradient(135deg,#EFF6FF_0%,#DBEAFE_100%)]">
                                    🚀 Coming Soon
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Clay */}
                    <ClayIntegrationCard webhookUrl={webhookUrl} webhookSecret={webhookSecret} orgId={org?.id} />

                    <SlackIntegrationCard settings={settingsData} />
                </div>
            </div>

            {/* Sync Progress Modal */}
            <SyncProgressModal
                isOpen={showSyncModal}
                sessionId={syncSessionId}
                externalError={syncError}
                externalResult={syncResult}
                onClose={() => {
                    setShowSyncModal(false);
                    setSyncSessionId(null);
                    // Optionally refresh the page to show updated data
                    window.location.reload();
                }}
                onPauseCampaigns={async () => {
                    try {
                        setLoading(true);
                        const result = await apiClient<{ success: boolean; message?: string }>('/api/dashboard/campaigns/pause-all', { method: 'POST' });
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
                            const result = await apiClient<{ success: boolean; message?: string }>('/api/dashboard/campaigns/pause-all', { method: 'POST' });
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

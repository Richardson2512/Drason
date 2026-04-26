'use client';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type { SettingEntry, Organization, ClayWebhookResponse } from '@/types/api';
import HealthEnforcementModal from '@/components/modals/HealthEnforcementModal';
import { useRouter } from 'next/navigation';
import SystemModeCard from '@/components/settings/SystemModeCard';
import SlackIntegrationCard from '@/components/settings/SlackIntegrationCard';
import OrganizationDetailsCard from '@/components/settings/OrganizationDetailsCard';
import ClayIntegrationCard from '@/components/settings/ClayIntegrationCard';
import PostmasterToolsCard from '@/components/settings/PostmasterToolsCard';

export default function Settings() {
    const router = useRouter();
    const [webhookUrl, setWebhookUrl] = useState('');
    const [webhookSecret, setWebhookSecret] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    // System Mode org context
    const [org, setOrg] = useState<Organization | null>(null);

    // Health Enforcement Modal
    const [showHealthModal, setShowHealthModal] = useState(false);
    const [healthCheckData, setHealthCheckData] = useState<{ critical_count?: number; findings?: { category: string; severity: string; title: string; details: string }[]; overall_score?: number } | null>(null);

    // Settings array shared with child cards (Slack reads its own state)
    const [settingsData, setSettingsData] = useState<SettingEntry[]>([]);

    useEffect(() => {
        // Fetch current settings
        apiClient<SettingEntry[]>('/api/settings')
            .then(data => {
                if (data) {
                    const arr = Array.isArray(data) ? data : [];
                    setSettingsData(arr);
                }
            })
            .catch(err => {
                console.error('[Settings] Failed to fetch settings', err);
            });

        // Fetch organization info
        apiClient<Organization>('/api/organization')
            .then(response => {
                setOrg(response);
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
                    const protocol = window.location.protocol;
                    const hostname = window.location.hostname;
                    const backendUrl = process.env.NEXT_PUBLIC_API_URL || `${protocol}//${hostname}`;
                    setWebhookUrl(`${backendUrl}/api/ingest/clay`);
                }
            })
            .catch(() => {
                const protocol = window.location.protocol;
                const hostname = window.location.hostname;
                const backendUrl = process.env.NEXT_PUBLIC_API_URL || `${protocol}//${hostname}`;
                setWebhookUrl(`${backendUrl}/api/ingest/clay`);
            });
    }, []);

    return (
        <>
            <div className="p-4 pb-12 flex flex-col gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Settings & Configuration</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage system mode, lead-source integrations, and alert channels</p>
                </div>

                <SystemModeCard />

                {/* Organization Info */}
                <OrganizationDetailsCard org={org} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Clay — lead source */}
                    <ClayIntegrationCard webhookUrl={webhookUrl} webhookSecret={webhookSecret} orgId={org?.id} />

                    {/* Slack — alerts */}
                    <SlackIntegrationCard settings={settingsData} />

                    {/* Postmaster Tools — Google reputation API */}
                    <PostmasterToolsCard />
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

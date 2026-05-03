'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Webhook, Slack, Building2, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';

/**
 * Bottom strip showing where this campaign's events flow OUT to:
 *  - Connected CRMs that we sync activity to (HubSpot, Salesforce, Outreach)
 *  - Slack alerts (if configured)
 *  - Custom webhook endpoints
 *
 * V1 reads org-level integration state — campaign-specific sync rules can
 * come later. For now: if the integration is connected at the org level,
 * we show it as "events flow here on reply / open / click".
 */

interface WebhookEndpoint {
    id: string;
    name: string;
    url: string;
    active: boolean;
    events: string[];
    provider: string; // 'generic' | 'slack' | 'discord'
    internal: boolean;
}

interface IntegrationStatus {
    name: string;
    label: string;
    logo: string;
    connected: boolean;
}

export default function SyncTargetsStrip({ orgId }: { orgId?: string }) {
    const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
    const [slackConnected, setSlackConnected] = useState<boolean>(false);
    const [crmConnections, setCrmConnections] = useState<IntegrationStatus[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            try {
                const [webhooksRes, settingsRes] = await Promise.all([
                    apiClient<{ data: WebhookEndpoint[] } | WebhookEndpoint[]>('/api/webhooks').catch(() => null),
                    apiClient<Array<{ key: string; value: string }>>('/api/settings').catch(() => []),
                ]);
                if (cancelled) return;

                const wList: WebhookEndpoint[] = Array.isArray(webhooksRes)
                    ? webhooksRes
                    : (webhooksRes && Array.isArray((webhooksRes as { data?: WebhookEndpoint[] }).data)
                        ? (webhooksRes as { data: WebhookEndpoint[] }).data
                        : []);
                setWebhooks(wList.filter((w) => w.active && !w.internal));

                const settings = Array.isArray(settingsRes) ? settingsRes : [];
                const settingMap = new Map(settings.map((s) => [s.key, s.value]));
                setSlackConnected(settingMap.get('SLACK_CONNECTED') === 'true' || wList.some((w) => w.provider === 'slack' && w.active));

                const crms: IntegrationStatus[] = [
                    { name: 'hubspot',    label: 'HubSpot',    logo: '/logos/hubspot.svg',        connected: !!settingMap.get('HUBSPOT_API_KEY') || !!settingMap.get('HUBSPOT_ACCESS_TOKEN') },
                    { name: 'salesforce', label: 'Salesforce', logo: '/logos/salesforce.svg',     connected: !!settingMap.get('SALESFORCE_REFRESH_TOKEN') || !!settingMap.get('SALESFORCE_ACCESS_TOKEN') },
                    { name: 'outreach',   label: 'Outreach',   logo: '/logos/outreach-icon.png',  connected: !!settingMap.get('OUTREACH_REFRESH_TOKEN') || !!settingMap.get('OUTREACH_ACCESS_TOKEN') },
                ];
                setCrmConnections(crms.filter((c) => c.connected));
            } catch {
                // best-effort — strip just shows empty state
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => { cancelled = true; };
    }, [orgId]);

    const totalSyncTargets = crmConnections.length + webhooks.length + (slackConnected ? 1 : 0);

    return (
        <div className="rounded-xl bg-white p-4" style={{ border: '1px solid #D1CBC5' }}>
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h3 className="text-xs uppercase tracking-wider font-semibold text-[#6B5E4F]">
                        Sync Targets
                    </h3>
                    <p className="text-[11px] text-[#6B5E4F] mt-0.5">
                        {loading
                            ? 'Loading…'
                            : totalSyncTargets === 0
                                ? 'No outbound integrations connected'
                                : `Reply, open, and click events sync to ${totalSyncTargets} target${totalSyncTargets === 1 ? '' : 's'}`}
                    </p>
                </div>
            </div>

            {!loading && totalSyncTargets === 0 ? (
                <div className="text-[11px] text-[#6B5E4F] py-2">
                    Connect a CRM or add a webhook in <a href="/dashboard/integrations" className="underline hover:text-[#1E1E2F]">Integrations</a> to sync campaign events.
                </div>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {crmConnections.map((crm) => (
                        <div
                            key={crm.name}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F0F6FF] text-[#1F4C8F]"
                            style={{ border: '1px solid #C8DBF5' }}
                        >
                            <Image src={crm.logo} alt={crm.label} width={14} height={14} className="shrink-0" unoptimized />
                            <span className="text-xs font-semibold">{crm.label}</span>
                            <span className="text-[10px] opacity-70">CRM sync</span>
                        </div>
                    ))}
                    {slackConnected && (
                        <div
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F5F1FF] text-[#3F2D8C]"
                            style={{ border: '1px solid #DDD3F4' }}
                        >
                            <Slack size={12} strokeWidth={2} />
                            <span className="text-xs font-semibold">Slack</span>
                            <span className="text-[10px] opacity-70">alerts</span>
                        </div>
                    )}
                    {webhooks.map((w) => (
                        <div
                            key={w.id}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F7F2EB] text-[#4A3F30]"
                            style={{ border: '1px solid #D1CBC5' }}
                            title={w.url}
                        >
                            <Webhook size={12} strokeWidth={2} />
                            <span className="text-xs font-semibold truncate max-w-[180px]">{w.name}</span>
                            <span className="text-[10px] opacity-70">
                                {w.events.length === 0 ? 'all events' : `${w.events.length} events`}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

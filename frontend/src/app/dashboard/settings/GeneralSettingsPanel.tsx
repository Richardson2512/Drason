'use client';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type { Organization } from '@/types/api';
import HealthEnforcementModal from '@/components/modals/HealthEnforcementModal';
import { useRouter } from 'next/navigation';
import SystemModeCard from '@/components/settings/SystemModeCard';
import OrganizationDetailsCard from '@/components/settings/OrganizationDetailsCard';
import PostmasterToolsCard from '@/components/settings/PostmasterToolsCard';

// NOTE: Clay and Slack integrations moved to /dashboard/integrations/clay
// and /dashboard/integrations/slack — they're surfaced from the
// integrations grid now instead of crowding this Settings page.
// Postmaster Tools stays here (it's a deliverability monitoring config,
// not a connector users browse for in the integrations grid).

export default function Settings() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    // System Mode org context
    const [org, setOrg] = useState<Organization | null>(null);

    // Health Enforcement Modal
    const [showHealthModal, setShowHealthModal] = useState(false);
    const [healthCheckData, setHealthCheckData] = useState<{ critical_count?: number; findings?: { category: string; severity: string; title: string; details: string }[]; overall_score?: number } | null>(null);

    useEffect(() => {
        // Fetch organization info
        apiClient<Organization>('/api/organization')
            .then(response => {
                setOrg(response);
            })
            .catch(() => {
                setMsg('Failed to fetch organization details');
            });
    }, []);

    return (
        <>
            <div className="p-4 pb-12 flex flex-col gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Settings & Configuration</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage system mode and organization details. Connectors (Clay, Slack, etc.) live under <a href="/dashboard/integrations" className="text-blue-600 hover:underline">Integrations</a>.</p>
                </div>

                <SystemModeCard />

                {/* Organization Info */}
                <OrganizationDetailsCard org={org} />

                {/* Postmaster Tools — Google deliverability monitoring config.
                    Not a "connector" the user shops for; configured per
                    domain after sending starts. Lives here rather than on
                    the integrations grid. */}
                <PostmasterToolsCard />
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

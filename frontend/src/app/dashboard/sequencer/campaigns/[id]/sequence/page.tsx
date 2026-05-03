'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Workflow } from 'lucide-react';
import { apiClient } from '@/lib/api';
import SequenceDiagram from '@/components/sequencer/sequence-diagram/SequenceDiagram';
import LeadSourcesStrip from '@/components/sequencer/sequence-diagram/LeadSourcesStrip';
import SyncTargetsStrip from '@/components/sequencer/sequence-diagram/SyncTargetsStrip';
import AdjacentToolsPanel from '@/components/sequencer/sequence-diagram/AdjacentToolsPanel';
import type { SequenceStepInput, SenderAttribution } from '@/components/sequencer/sequence-diagram/buildGraph';

/**
 * Campaign sequence diagram — visual flow of the email sequence with
 * lead sources at the top, sync targets at the bottom, and adjacent
 * tools (JustCall, HeyReach) on the side.
 *
 * Email-only by design. Multi-channel handoffs are explicit (Adjacent
 * Tools panel) rather than fake-step nodes inside the sequence.
 */

interface CampaignDetail {
    id: string;
    name: string;
    status: string;
    stop_on_reply?: boolean | null;
    stop_on_bounce?: boolean | null;
    total_leads?: number;
    lead_imports?: Array<{
        id: string;
        source: string;
        source_file: string | null;
        source_label: string | null;
        total_submitted: number;
        added_count: number;
        blocked_count: number;
        duplicate_count: number;
        created_at: string;
    }>;
    steps?: SequenceStepInput[];
    accounts?: Array<{
        account: {
            id: string;
            email: string;
            display_name: string | null;
            provider: string;
            connection_status: string;
        };
    }>;
}

export default function CampaignSequenceDiagramPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            setLoading(true);
            setError(null);
            try {
                const res = await apiClient<CampaignDetail>(`/api/sequencer/campaigns/${id}`);
                if (!cancelled) setCampaign(res);
            } catch (err) {
                if (!cancelled) {
                    const msg = err instanceof Error ? err.message : 'Failed to load campaign';
                    setError(msg);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => { cancelled = true; };
    }, [id]);

    const senders: SenderAttribution | undefined = campaign?.accounts && campaign.accounts.length > 0
        ? {
              accounts: campaign.accounts.map((a) => ({
                  email: a.account.email,
                  provider: a.account.provider,
              })),
          }
        : undefined;

    return (
        <div className="px-6 py-6 max-w-7xl mx-auto">
            {/* Breadcrumb + Header */}
            <div className="mb-5">
                <Link
                    href={`/dashboard/sequencer/campaigns/${id}`}
                    className="inline-flex items-center gap-1.5 text-xs text-[#6B5E4F] hover:text-[#1E1E2F] mb-3"
                >
                    <ArrowLeft size={12} strokeWidth={2} />
                    Back to campaign
                </Link>
                <div className="flex items-center gap-2 mb-1">
                    <Workflow size={16} strokeWidth={2} className="text-[#1E1E2F]" />
                    <h1 className="text-xl font-semibold text-[#1E1E2F]">
                        Sequence flow{campaign?.name ? ` — ${campaign.name}` : ''}
                    </h1>
                </div>
                <p className="text-xs text-[#6B5E4F]">
                    Visual map of how this campaign runs: where leads come from, what the email sequence does, and where outcomes flow.
                </p>
            </div>

            {loading && (
                <div className="flex items-center justify-center py-16 gap-2 text-sm text-[#6B5E4F]">
                    <Loader2 size={16} className="animate-spin" />
                    Loading campaign…
                </div>
            )}

            {error && !loading && (
                <div className="rounded-xl bg-[#FDEAEA] text-[#8B1F1F] p-4 text-sm" style={{ border: '1px solid #F4C2C2' }}>
                    {error}
                </div>
            )}

            {!loading && !error && campaign && (
                <div className="space-y-4">
                    {/* TOP — Lead Sources */}
                    <LeadSourcesStrip
                        imports={campaign.lead_imports || []}
                        totalLeads={campaign.total_leads || 0}
                    />

                    {/* MIDDLE — diagram + adjacent tools side panel */}
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-4">
                        <SequenceDiagram
                            steps={campaign.steps || []}
                            settings={{
                                stop_on_reply: campaign.stop_on_reply,
                                stop_on_bounce: campaign.stop_on_bounce,
                            }}
                            senders={senders}
                            minHeight={640}
                        />
                        <AdjacentToolsPanel />
                    </div>

                    {/* BOTTOM — Sync Targets */}
                    <SyncTargetsStrip />
                </div>
            )}
        </div>
    );
}

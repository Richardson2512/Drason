'use client';

/**
 * LinkedIn campaign sequence schema page — per-campaign visual diagram.
 *
 * Replaces the standalone `/dashboard/linkedin/campaigns/sequence-preview`
 * URL: that page rendered a static mock flow at the top-level. This page
 * fetches the actual steps for one campaign and renders the same
 * LinkedInSequenceDiagram with real data, accessed via the
 * "Sequence schema" button on the campaign detail page.
 */

import { useEffect, useState, useCallback, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, GitBranch, Rocket, Loader2, AlertTriangle } from 'lucide-react';
import { apiClient } from '@/lib/api';
import LinkedInSequenceDiagram from '@/components/linkedin/sequence-diagram/LinkedInSequenceDiagram';
import type { LinkedInSequenceStepInput } from '@/components/linkedin/sequence-diagram/buildGraph';

interface SenderRow {
    display_name: string;
    account_type: string;
}

interface StepRow {
    id: string;
    step_number: number;
    step_type: string;
    delay_days: number | null;
    delay_hours: number | null;
    subject: string | null;
    body: string | null;
}

interface CampaignDetail {
    campaign: { id: string; name: string; status: string; stop_on_reply: boolean };
    senders: SenderRow[];
    steps: StepRow[];
}

export default function LinkedInCampaignSequenceSchemaPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [data, setData] = useState<CampaignDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDetail = useCallback(async () => {
        setLoading(true);
        try {
            const d = await apiClient<CampaignDetail>(`/api/linkedin/campaigns/${id}`);
            setData(d);
            setError(null);
        } catch (err: any) {
            setError(err?.message || 'Failed to load campaign');
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchDetail(); }, [fetchDetail]);

    // Translate the controller's step shape into the diagram's input shape.
    // The diagram's node renderers read content from `step_config` per type
    // (note_template for CR, body_template for DM, subject + body for InMail,
    // reaction_type for like_post). Construct the right config from the
    // narrative/wizard's `body` field so nodes don't render with empty copy.
    const diagramSteps: LinkedInSequenceStepInput[] = (data?.steps ?? []).map(s => {
        const step_config: Record<string, unknown> = {};
        switch (s.step_type) {
            case 'linkedin_connection_request':
                if (s.body) step_config.note_template = s.body;
                break;
            case 'linkedin_message':
                if (s.body) step_config.body_template = s.body;
                break;
            case 'linkedin_inmail':
                if (s.subject) step_config.subject = s.subject;
                if (s.body)    step_config.body = s.body;
                break;
            // view_profile / follow / like_post / email don't need extra config —
            // like_post defaults to LIKE / 30-day timespan in the renderer.
        }
        return {
            id: s.id,
            step_number: s.step_number,
            delay_days: s.delay_days ?? 0,
            delay_hours: s.delay_hours ?? 0,
            step_type: s.step_type as LinkedInSequenceStepInput['step_type'],
            subject: s.subject ?? undefined,
            body_html: s.body ?? undefined,
            body_text: s.body ?? undefined,
            step_config,
        };
    });

    return (
        <div className="p-4 flex flex-col gap-4">
            <div>
                <Link
                    href={`/dashboard/linkedin/campaigns/${id}`}
                    className="inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-900 mb-2 no-underline"
                >
                    <ArrowLeft size={11} /> Back to campaign
                </Link>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <GitBranch size={18} strokeWidth={1.75} /> Sequence schema
                        </h1>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {data ? <>Visual flow for <span className="font-semibold text-gray-800">{data.campaign.name}</span></> : 'Visual flow for this campaign'}
                            {data?.campaign.stop_on_reply && <> · pauses on reply</>}
                        </p>
                    </div>
                    {data && (
                        <div className="flex items-center gap-2 text-[11px] text-gray-500">
                            <Rocket size={11} />
                            <span>{data.steps.length} steps · {data.senders.length} senders in rotation</span>
                        </div>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="premium-card flex items-center justify-center py-12 text-xs text-gray-500">
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> Loading schema…
                </div>
            ) : error ? (
                <div className="premium-card flex flex-col items-center justify-center py-12">
                    <AlertTriangle className="w-6 h-6 text-rose-600 mb-2" />
                    <p className="text-sm text-rose-600 mb-3">{error}</p>
                    <button onClick={fetchDetail} className="px-3 py-1.5 bg-gray-900 text-white rounded-md text-xs font-semibold">Retry</button>
                </div>
            ) : data && data.steps.length === 0 ? (
                <div className="premium-card flex flex-col items-center justify-center py-12 text-center">
                    <GitBranch className="w-7 h-7 text-gray-300 mb-2" />
                    <p className="text-sm font-semibold text-gray-900 mb-1">No steps yet</p>
                    <p className="text-xs text-gray-500 max-w-md">
                        This campaign has no sequence steps configured. Build the sequence in the campaign editor first — the schema will render here automatically.
                    </p>
                </div>
            ) : data ? (
                <div className="premium-card !p-0 overflow-hidden">
                    <div className="p-3">
                        <LinkedInSequenceDiagram
                            steps={diagramSteps}
                            senders={data.senders.map(s => ({ name: s.display_name, type: s.account_type }))}
                            stopOnReply={data.campaign.stop_on_reply}
                            minHeight={720}
                        />
                    </div>
                </div>
            ) : null}
        </div>
    );
}

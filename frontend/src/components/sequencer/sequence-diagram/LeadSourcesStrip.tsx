'use client';

import Image from 'next/image';
import { FileText, Database, Building2, Hand, Code, Globe } from 'lucide-react';

/**
 * Top strip showing where this campaign's leads originated.
 *
 * Aggregates the campaign's CampaignLeadImport[] history by source, sums
 * `added_count`, and renders one card per source with the right logo/icon.
 *
 * Sources we recognize (matches backend `CampaignLeadImport.source` enum):
 *   - csv | clay | crm | hubspot | salesforce | apollo | outreach | zoominfo
 *   - manual | api | database | library
 */

interface LeadImport {
    id: string;
    source: string;
    source_file: string | null;
    source_label: string | null;
    total_submitted: number;
    added_count: number;
    blocked_count: number;
    duplicate_count: number;
    created_at: string;
}

interface LeadSourcesStripProps {
    imports: LeadImport[];
    totalLeads: number;
}

interface SourceMeta {
    label: string;
    logo?: string;
    icon?: React.ReactNode;
    bg: string;
    fg: string;
    border: string;
}

const SOURCE_META: Record<string, SourceMeta> = {
    apollo:     { label: 'Apollo',     logo: '/logos/apollo.svg',         bg: '#F5F1FF', fg: '#3F2D8C', border: '#DDD3F4' },
    clay:       { label: 'Clay',       logo: '/clay.png',                  bg: '#FFF8E5', fg: '#7A4A00', border: '#F5E5B0' },
    hubspot:    { label: 'HubSpot',    logo: '/logos/hubspot.svg',         bg: '#FFEFE5', fg: '#A23A00', border: '#F5C6A8' },
    salesforce: { label: 'Salesforce', logo: '/logos/salesforce.svg',      bg: '#E8F4FE', fg: '#0B4F8C', border: '#B8DCF6' },
    outreach:   { label: 'Outreach',   logo: '/logos/outreach-icon.png',   bg: '#FBF1FF', fg: '#5A1E70', border: '#E2C8EC' },
    zoominfo:   { label: 'ZoomInfo',   logo: '/logos/zoominfo.svg',        bg: '#E6F7F4', fg: '#0E6C5C', border: '#B6E2D9' },
    crm:        { label: 'CRM',        icon: <Building2 size={11} strokeWidth={2} />, bg: '#F0F6FF', fg: '#1F4C8F', border: '#C8DBF5' },
    csv:        { label: 'CSV upload', icon: <FileText size={11} strokeWidth={2} />,   bg: '#F7F2EB', fg: '#4A3F30', border: '#D1CBC5' },
    manual:     { label: 'Manual',     icon: <Hand size={11} strokeWidth={2} />,        bg: '#F7F2EB', fg: '#4A3F30', border: '#D1CBC5' },
    api:        { label: 'API',        icon: <Code size={11} strokeWidth={2} />,        bg: '#F0F6FF', fg: '#1F4C8F', border: '#C8DBF5' },
    database:   { label: 'Lead Library', icon: <Database size={11} strokeWidth={2} />,  bg: '#F5F1FF', fg: '#3F2D8C', border: '#DDD3F4' },
    library:    { label: 'Lead Library', icon: <Database size={11} strokeWidth={2} />,  bg: '#F5F1FF', fg: '#3F2D8C', border: '#DDD3F4' },
};

const FALLBACK_META: SourceMeta = {
    label: 'Unknown source',
    icon: <Globe size={11} strokeWidth={2} />,
    bg: '#F7F2EB', fg: '#4A3F30', border: '#D1CBC5',
};

export default function LeadSourcesStrip({ imports, totalLeads }: LeadSourcesStripProps) {
    // Group imports by source key
    const grouped = new Map<string, { added: number; batches: number }>();
    for (const imp of imports || []) {
        const key = (imp.source || '').toLowerCase();
        const prev = grouped.get(key) || { added: 0, batches: 0 };
        prev.added += imp.added_count;
        prev.batches += 1;
        grouped.set(key, prev);
    }

    const sourceEntries = Array.from(grouped.entries())
        .map(([key, agg]) => ({ key, ...agg, meta: SOURCE_META[key] || FALLBACK_META }))
        .sort((a, b) => b.added - a.added);

    return (
        <div className="rounded-xl bg-white p-4" style={{ border: '1px solid #D1CBC5' }}>
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h3 className="text-xs uppercase tracking-wider font-semibold text-[#6B5E4F] flex items-center gap-1.5">
                        Lead Sources
                    </h3>
                    <p className="text-[11px] text-[#6B5E4F] mt-0.5">
                        {totalLeads} total leads in this campaign{sourceEntries.length > 0 ? ` from ${sourceEntries.length} source${sourceEntries.length === 1 ? '' : 's'}` : ''}
                    </p>
                </div>
            </div>

            {sourceEntries.length === 0 ? (
                <div className="text-[11px] text-[#6B5E4F] py-2">
                    No leads added yet. Add leads from your connected integrations or upload a CSV.
                </div>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {sourceEntries.map(({ key, added, batches, meta }) => (
                        <div
                            key={key}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg"
                            style={{ background: meta.bg, color: meta.fg, border: `1px solid ${meta.border}` }}
                        >
                            {meta.logo ? (
                                <Image src={meta.logo} alt={meta.label} width={14} height={14} className="shrink-0" unoptimized />
                            ) : (
                                meta.icon
                            )}
                            <span className="text-xs font-semibold">{meta.label}</span>
                            <span className="text-[11px] tabular-nums opacity-90">
                                {added.toLocaleString()} {added === 1 ? 'lead' : 'leads'}
                            </span>
                            {batches > 1 && (
                                <span className="text-[10px] opacity-70">· {batches} batches</span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

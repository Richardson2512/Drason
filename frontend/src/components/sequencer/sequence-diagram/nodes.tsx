'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Mail, Clock, GitBranch, FlaskConical, CheckCircle2, XCircle, Reply, MailX } from 'lucide-react';
import Image from 'next/image';

/**
 * Node type components for the campaign sequence diagram.
 *
 * Each node:
 *   - Has top + bottom handles (vertical flow)
 *   - Branch nodes have additional 'yes' / 'no' handles on left/right of bottom
 *   - VariantSplit has multiple bottom handles (one per variant)
 *
 * Visual styling matches the platform: white card, #D1CBC5 border, subtle shadow.
 * Compact width (260px) so 3-4 stack horizontally without cramping.
 */

const NODE_WIDTH = 260;

// ============================================================================
// EMAIL NODE
// ============================================================================

export interface EmailNodeData {
    stepNumber: number;
    subject: string;
    bodyPreview: string;
    senderEmail?: string | null;
    senderProvider?: string | null; // 'google' | 'microsoft' | 'smtp'
    senderProviderLogo?: string | null;
    variantCount: number;
    sends?: number;
    opens?: number;
    replies?: number;
}

export const EmailNode = memo(({ data }: NodeProps) => {
    const d = data as unknown as EmailNodeData;
    return (
        <div
            className="rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow"
            style={{ width: NODE_WIDTH, border: '1px solid #D1CBC5' }}
        >
            <Handle type="target" position={Position.Top} className="!bg-[#1E1E2F] !w-2 !h-2 !border-0" />

            <div className="px-3.5 py-2 border-b flex items-center justify-between gap-2" style={{ borderColor: '#F0EBE3' }}>
                <div className="flex items-center gap-1.5 min-w-0">
                    <Mail size={12} className="text-[#1E1E2F] shrink-0" strokeWidth={2} />
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-[#6B5E4F]">
                        Step {d.stepNumber} — Email
                    </span>
                </div>
                {d.variantCount > 1 && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-[#F0F6FF] text-[#1F4C8F]">
                        <FlaskConical size={9} strokeWidth={2.5} />
                        A/B × {d.variantCount}
                    </span>
                )}
            </div>

            <div className="px-3.5 py-2.5">
                <p className="text-xs font-semibold text-[#1E1E2F] line-clamp-1 mb-1">{d.subject || '(no subject)'}</p>
                <p className="text-[11px] text-[#6B5E4F] line-clamp-2 leading-relaxed">{d.bodyPreview}</p>
            </div>

            {(d.senderEmail || d.senderProvider) && (
                <div className="px-3.5 py-1.5 border-t flex items-center gap-1.5" style={{ borderColor: '#F0EBE3', background: '#FAF8F5' }}>
                    {d.senderProviderLogo && (
                        <Image
                            src={d.senderProviderLogo}
                            alt={d.senderProvider || ''}
                            width={11}
                            height={11}
                            className="shrink-0"
                            unoptimized
                        />
                    )}
                    <span className="text-[10px] text-[#6B5E4F] truncate">
                        {d.senderEmail || `via ${d.senderProvider}`}
                    </span>
                </div>
            )}

            {(d.sends !== undefined || d.opens !== undefined || d.replies !== undefined) && (
                <div className="px-3.5 py-1.5 flex items-center gap-3 border-t" style={{ borderColor: '#F0EBE3' }}>
                    {d.sends !== undefined && (
                        <span className="text-[10px] text-[#6B5E4F]">Sent <strong className="text-[#1E1E2F] tabular-nums">{d.sends}</strong></span>
                    )}
                    {d.opens !== undefined && (
                        <span className="text-[10px] text-[#6B5E4F]">Opened <strong className="text-[#1E1E2F] tabular-nums">{d.opens}</strong></span>
                    )}
                    {d.replies !== undefined && (
                        <span className="text-[10px] text-[#6B5E4F]">Replied <strong className="text-[#1E1E2F] tabular-nums">{d.replies}</strong></span>
                    )}
                </div>
            )}

            <Handle type="source" position={Position.Bottom} className="!bg-[#1E1E2F] !w-2 !h-2 !border-0" />
        </div>
    );
});
EmailNode.displayName = 'EmailNode';

// ============================================================================
// WAIT NODE
// ============================================================================

export interface WaitNodeData {
    days: number;
    hours: number;
}

export const WaitNode = memo(({ data }: NodeProps) => {
    const d = data as unknown as WaitNodeData;
    const label =
        d.days > 0 && d.hours > 0 ? `${d.days}d ${d.hours}h`
        : d.days > 0 ? (d.days === 1 ? '1 day' : `${d.days} days`)
        : d.hours > 0 ? (d.hours === 1 ? '1 hour' : `${d.hours} hours`)
        : 'No delay';

    return (
        <div
            className="rounded-full bg-white px-4 py-1.5 shadow-sm flex items-center gap-1.5"
            style={{ width: NODE_WIDTH, border: '1px solid #D1CBC5' }}
        >
            <Handle type="target" position={Position.Top} className="!bg-[#1E1E2F] !w-2 !h-2 !border-0" />
            <Clock size={11} className="text-[#6B5E4F] shrink-0" strokeWidth={2} />
            <span className="text-[11px] text-[#6B5E4F]">
                Wait <strong className="text-[#1E1E2F] font-semibold">{label}</strong>
            </span>
            <Handle type="source" position={Position.Bottom} className="!bg-[#1E1E2F] !w-2 !h-2 !border-0" />
        </div>
    );
});
WaitNode.displayName = 'WaitNode';

// ============================================================================
// BRANCH NODE (condition with yes/no edges)
// ============================================================================

export interface BranchNodeData {
    /** Display label, e.g. "Did they reply?" */
    label: string;
    /** Underlying condition type, e.g. 'if_replied', 'if_opened' */
    condition: string;
}

export const BranchNode = memo(({ data }: NodeProps) => {
    const d = data as unknown as BranchNodeData;
    return (
        <div
            className="rounded-xl bg-white shadow-sm flex items-center gap-2 px-3.5 py-2.5"
            style={{ width: NODE_WIDTH, border: '1px solid #D1CBC5' }}
        >
            <Handle type="target" position={Position.Top} className="!bg-[#1E1E2F] !w-2 !h-2 !border-0" />
            <GitBranch size={12} className="text-[#1E1E2F] shrink-0" strokeWidth={2} />
            <span className="text-xs font-semibold text-[#1E1E2F] truncate">{d.label}</span>
            {/* Two source handles — labeled in CSS via the parent edges */}
            <Handle type="source" position={Position.Bottom} id="yes" style={{ left: '30%' }} className="!bg-[#1F6F3A] !w-2 !h-2 !border-0" />
            <Handle type="source" position={Position.Bottom} id="no"  style={{ left: '70%' }} className="!bg-[#8B1F1F] !w-2 !h-2 !border-0" />
        </div>
    );
});
BranchNode.displayName = 'BranchNode';

// ============================================================================
// EXIT NODE (sequence ends — replied / bounced / completed)
// ============================================================================

export type ExitReason = 'replied' | 'bounced' | 'unsubscribed' | 'completed';

export interface ExitNodeData {
    reason: ExitReason;
    /** Optional count of leads that ended via this path. */
    count?: number;
}

const EXIT_META: Record<ExitReason, { label: string; icon: React.ReactNode; bg: string; fg: string; border: string }> = {
    replied:      { label: 'Sequence ends — Replied',      icon: <Reply size={11} strokeWidth={2.25} />,         bg: '#E8F4EC', fg: '#1F6F3A', border: '#BDE2C6' },
    bounced:      { label: 'Sequence ends — Bounced',      icon: <MailX size={11} strokeWidth={2.25} />,         bg: '#FDEAEA', fg: '#8B1F1F', border: '#F4C2C2' },
    unsubscribed: { label: 'Sequence ends — Unsubscribed', icon: <XCircle size={11} strokeWidth={2.25} />,       bg: '#FDF3E2', fg: '#8B5A1A', border: '#EFD8B0' },
    completed:    { label: 'Sequence complete',            icon: <CheckCircle2 size={11} strokeWidth={2.25} />,  bg: '#F0F6FF', fg: '#1F4C8F', border: '#C8DBF5' },
};

export const ExitNode = memo(({ data }: NodeProps) => {
    const d = data as unknown as ExitNodeData;
    const meta = EXIT_META[d.reason];
    return (
        <div
            className="rounded-full px-4 py-1.5 flex items-center gap-1.5"
            style={{ background: meta.bg, color: meta.fg, border: `1px solid ${meta.border}`, width: NODE_WIDTH }}
        >
            <Handle type="target" position={Position.Top} className="!bg-current !w-2 !h-2 !border-0" />
            {meta.icon}
            <span className="text-[11px] font-semibold flex-1 truncate">{meta.label}</span>
            {d.count !== undefined && (
                <span className="text-[10px] tabular-nums opacity-80">{d.count}</span>
            )}
        </div>
    );
});
ExitNode.displayName = 'ExitNode';

// ============================================================================
// EXPORT MAP
// ============================================================================

export const nodeTypes = {
    email: EmailNode,
    wait: WaitNode,
    branch: BranchNode,
    exit: ExitNode,
};

export const NODE_WIDTH_PX = NODE_WIDTH;
export const NODE_HEIGHT_PX = 100; // approximate — used by dagre layout

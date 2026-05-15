'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Mail, Clock, GitBranch, MessageCircle, UserPlus, Send, Eye, UserCheck, Heart, Search, CheckCircle2, XCircle, FlaskConical, Reply } from 'lucide-react';

/**
 * Node type components for the Super LinkedIn sequence diagram.
 *
 * Parallels the email sequence diagram (components/sequencer/sequence-diagram/)
 * - same visual language, same handle conventions - but one node component
 * per LinkedIn step type so the rendering can lean into the channel-specific
 * affordances (reaction type for like_post, note vs no-note for CR, etc.).
 *
 * Node taxonomy mirrors stepTypeRegistry.ts:
 *   linkedin_connection_request, linkedin_message, linkedin_inmail,
 *   linkedin_view_profile, linkedin_follow, linkedin_like_post,
 *   find_email, email (when a campaign mixes channels), wait, branch, exit
 */

const NODE_WIDTH = 280;

// ────────────────────────────────────────────────────────────────────
// Shared shell - every step node renders inside this card with the
// same handle positions and theme treatment.
// ────────────────────────────────────────────────────────────────────

interface StepShellProps {
    icon: React.ReactNode;
    label: string;
    stepNumber: number;
    tint: string; // tailwind text color for the icon
    children?: React.ReactNode;
    /** Stats row at the bottom (e.g. sent/accepted/replied counts) */
    stats?: Array<{ label: string; value: number | string }>;
    /** Sender attribution row */
    sender?: { name: string; type?: string } | null;
    /** A/B variant badge */
    variantCount?: number;
}

function StepShell({ icon, label, stepNumber, tint, children, stats, sender, variantCount }: StepShellProps) {
    return (
        <div
            className="rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow"
            style={{ width: NODE_WIDTH, border: '1px solid #D1CBC5' }}
        >
            <Handle type="target" position={Position.Top} className="!bg-[#1E1E2F] !w-2 !h-2 !border-0" />

            <div className="px-3.5 py-2 border-b flex items-center justify-between gap-2" style={{ borderColor: '#F0EBE3' }}>
                <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`shrink-0 ${tint}`}>{icon}</span>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-[#6B5E4F]">
                        Step {stepNumber} - {label}
                    </span>
                </div>
                {variantCount && variantCount > 1 && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-[#F0F6FF] text-[#1F4C8F]">
                        <FlaskConical size={9} strokeWidth={2.5} /> A/B × {variantCount}
                    </span>
                )}
            </div>

            {children && <div className="px-3.5 py-2.5">{children}</div>}

            {sender && (
                <div className="px-3.5 py-1.5 border-t flex items-center gap-1.5" style={{ borderColor: '#F0EBE3', background: '#FAF8F5' }}>
                    <UserCheck size={10} className="text-[#6B5E4F] shrink-0" strokeWidth={2} />
                    <span className="text-[10px] text-[#6B5E4F] truncate">
                        {sender.name}{sender.type ? ` · ${sender.type.replace('_', ' ')}` : ''}
                    </span>
                </div>
            )}

            {stats && stats.length > 0 && (
                <div className="px-3.5 py-1.5 flex items-center gap-3 border-t" style={{ borderColor: '#F0EBE3' }}>
                    {stats.map(s => (
                        <span key={s.label} className="text-[10px] text-[#6B5E4F]">
                            {s.label} <strong className="text-[#1E1E2F] tabular-nums">{s.value}</strong>
                        </span>
                    ))}
                </div>
            )}

            <Handle type="source" position={Position.Bottom} className="!bg-[#1E1E2F] !w-2 !h-2 !border-0" />
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────
// Per-step-type nodes
// ────────────────────────────────────────────────────────────────────

export interface ConnectionRequestNodeData {
    stepNumber: number;
    note?: string | null;
    useDefaultFallback?: boolean;
    sender?: { name: string; type?: string } | null;
    variantCount?: number;
    sent?: number;
    accepted?: number;
}

export const ConnectionRequestNode = memo(({ data }: NodeProps) => {
    const d = data as unknown as ConnectionRequestNodeData;
    const stats: { label: string; value: number | string }[] = [];
    if (d.sent !== undefined) stats.push({ label: 'Sent', value: d.sent });
    if (d.accepted !== undefined) stats.push({ label: 'Accepted', value: d.accepted });
    return (
        <StepShell
            icon={<UserPlus size={12} strokeWidth={2} />}
            label="Connection Request"
            stepNumber={d.stepNumber}
            tint="text-[#1F4C8F]"
            sender={d.sender}
            variantCount={d.variantCount}
            stats={stats}
        >
            {d.note ? (
                <p className="text-[11px] text-[#6B5E4F] line-clamp-3 leading-relaxed italic">&ldquo;{d.note}&rdquo;</p>
            ) : (
                <p className="text-[11px] text-[#6B5E4F]">
                    {d.useDefaultFallback ? 'No note · falls back to workspace default' : 'No note (blank CR)'}
                </p>
            )}
        </StepShell>
    );
});
ConnectionRequestNode.displayName = 'ConnectionRequestNode';

export interface MessageNodeData {
    stepNumber: number;
    body?: string | null;
    sender?: { name: string; type?: string } | null;
    variantCount?: number;
    sent?: number;
    replied?: number;
}

export const MessageNode = memo(({ data }: NodeProps) => {
    const d = data as unknown as MessageNodeData;
    const stats: { label: string; value: number | string }[] = [];
    if (d.sent !== undefined) stats.push({ label: 'Sent', value: d.sent });
    if (d.replied !== undefined) stats.push({ label: 'Replied', value: d.replied });
    return (
        <StepShell
            icon={<MessageCircle size={12} strokeWidth={2} />}
            label="LinkedIn DM"
            stepNumber={d.stepNumber}
            tint="text-[#1F6F3A]"
            sender={d.sender}
            variantCount={d.variantCount}
            stats={stats}
        >
            <p className="text-[11px] text-[#6B5E4F] line-clamp-3 leading-relaxed">
                {d.body || '(no message body)'}
            </p>
        </StepShell>
    );
});
MessageNode.displayName = 'MessageNode';

export interface InMailNodeData {
    stepNumber: number;
    subject?: string | null;
    body?: string | null;
    sender?: { name: string; type?: string } | null;
    sent?: number;
    replied?: number;
}

export const InMailNode = memo(({ data }: NodeProps) => {
    const d = data as unknown as InMailNodeData;
    const stats: { label: string; value: number | string }[] = [];
    if (d.sent !== undefined) stats.push({ label: 'Sent', value: d.sent });
    if (d.replied !== undefined) stats.push({ label: 'Replied', value: d.replied });
    return (
        <StepShell
            icon={<Send size={12} strokeWidth={2} />}
            label="InMail"
            stepNumber={d.stepNumber}
            tint="text-[#7C3AED]"
            sender={d.sender}
            stats={stats}
        >
            {d.subject && <p className="text-xs font-semibold text-[#1E1E2F] line-clamp-1 mb-1">{d.subject}</p>}
            <p className="text-[11px] text-[#6B5E4F] line-clamp-2 leading-relaxed">
                {d.body || '(no body)'}
            </p>
        </StepShell>
    );
});
InMailNode.displayName = 'InMailNode';

export interface ViewProfileNodeData { stepNumber: number; sender?: { name: string; type?: string } | null }
export const ViewProfileNode = memo(({ data }: NodeProps) => {
    const d = data as unknown as ViewProfileNodeData;
    return (
        <StepShell
            icon={<Eye size={12} strokeWidth={2} />}
            label="View Profile"
            stepNumber={d.stepNumber}
            tint="text-[#0891B2]"
            sender={d.sender}
        >
            <p className="text-[11px] text-[#6B5E4F]">Visit the lead&apos;s profile - they get a &ldquo;viewed your profile&rdquo; notification.</p>
        </StepShell>
    );
});
ViewProfileNode.displayName = 'ViewProfileNode';

export interface FollowNodeData { stepNumber: number; sender?: { name: string; type?: string } | null }
export const FollowNode = memo(({ data }: NodeProps) => {
    const d = data as unknown as FollowNodeData;
    return (
        <StepShell
            icon={<UserCheck size={12} strokeWidth={2} />}
            label="Follow"
            stepNumber={d.stepNumber}
            tint="text-[#D97706]"
            sender={d.sender}
        >
            <p className="text-[11px] text-[#6B5E4F]">Follow the lead. Must come before any Connection Request in the sequence.</p>
        </StepShell>
    );
});
FollowNode.displayName = 'FollowNode';

const REACTION_LABEL: Record<string, string> = {
    LIKE: 'Like',
    PRAISE: 'Celebrate',
    EMPATHY: 'Love',
    INTEREST: 'Insightful',
    APPRECIATION: 'Support',
    MAYBE: 'Curious',
    FUNNY: 'Funny',
};

export interface LikePostNodeData {
    stepNumber: number;
    reactionType?: string;
    timespanDays?: number;
    skipIfNoPost?: boolean;
    sender?: { name: string; type?: string } | null;
}

export const LikePostNode = memo(({ data }: NodeProps) => {
    const d = data as unknown as LikePostNodeData;
    return (
        <StepShell
            icon={<Heart size={12} strokeWidth={2} />}
            label="React to Recent Post"
            stepNumber={d.stepNumber}
            tint="text-[#DB2777]"
            sender={d.sender}
        >
            <div className="space-y-1">
                <p className="text-[11px] text-[#6B5E4F]">
                    React with <strong className="text-[#1E1E2F]">{REACTION_LABEL[d.reactionType || 'LIKE'] || 'Like'}</strong>
                </p>
                <p className="text-[10px] text-[#9B8C7C]">
                    Search posts from last {d.timespanDays ?? 30}d{d.skipIfNoPost ? ' · skip if none found' : ' · wait if none found'}
                </p>
            </div>
        </StepShell>
    );
});
LikePostNode.displayName = 'LikePostNode';

export interface FindEmailNodeData {
    stepNumber: number;
    providers?: string[];
    found?: number;
    notFound?: number;
}

export const FindEmailNode = memo(({ data }: NodeProps) => {
    const d = data as unknown as FindEmailNodeData;
    const stats: { label: string; value: number | string }[] = [];
    if (d.found !== undefined) stats.push({ label: 'Found', value: d.found });
    if (d.notFound !== undefined) stats.push({ label: 'Not found', value: d.notFound });
    return (
        <div
            className="rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow"
            style={{ width: NODE_WIDTH, border: '1px solid #D1CBC5' }}
        >
            <Handle type="target" position={Position.Top} className="!bg-[#1E1E2F] !w-2 !h-2 !border-0" />
            <div className="px-3.5 py-2 border-b flex items-center gap-1.5" style={{ borderColor: '#F0EBE3' }}>
                <Search size={12} className="text-[#0F766E] shrink-0" strokeWidth={2} />
                <span className="text-[10px] uppercase tracking-wider font-semibold text-[#6B5E4F]">
                    Step {d.stepNumber} - Find Email
                </span>
            </div>
            <div className="px-3.5 py-2.5">
                <p className="text-[11px] text-[#6B5E4F]">
                    Run the enrichment waterfall
                    {d.providers && d.providers.length > 0 ? ` (${d.providers.join(' → ')})` : ''}.
                    Branches into Email Found / Not Found below.
                </p>
            </div>
            {stats.length > 0 && (
                <div className="px-3.5 py-1.5 flex items-center gap-3 border-t" style={{ borderColor: '#F0EBE3' }}>
                    {stats.map(s => (
                        <span key={s.label} className="text-[10px] text-[#6B5E4F]">
                            {s.label} <strong className="text-[#1E1E2F] tabular-nums">{s.value}</strong>
                        </span>
                    ))}
                </div>
            )}
            {/* Two source handles - Found (right/green) and Not Found (left/red) */}
            <Handle type="source" position={Position.Bottom} id="found"     style={{ left: '30%' }} className="!bg-[#1F6F3A] !w-2 !h-2 !border-0" />
            <Handle type="source" position={Position.Bottom} id="not_found" style={{ left: '70%' }} className="!bg-[#8B1F1F] !w-2 !h-2 !border-0" />
        </div>
    );
});
FindEmailNode.displayName = 'FindEmailNode';

export interface EmailNodeData {
    stepNumber: number;
    subject: string;
    bodyPreview: string;
    sender?: { name: string; type?: string } | null;
    variantCount?: number;
    sends?: number;
    opens?: number;
    replies?: number;
}

export const EmailNode = memo(({ data }: NodeProps) => {
    const d = data as unknown as EmailNodeData;
    const stats: { label: string; value: number | string }[] = [];
    if (d.sends !== undefined) stats.push({ label: 'Sent', value: d.sends });
    if (d.opens !== undefined) stats.push({ label: 'Opened', value: d.opens });
    if (d.replies !== undefined) stats.push({ label: 'Replied', value: d.replies });
    return (
        <StepShell
            icon={<Mail size={12} strokeWidth={2} />}
            label="Email"
            stepNumber={d.stepNumber}
            tint="text-[#1E1E2F]"
            sender={d.sender}
            variantCount={d.variantCount}
            stats={stats}
        >
            <p className="text-xs font-semibold text-[#1E1E2F] line-clamp-1 mb-1">{d.subject || '(no subject)'}</p>
            <p className="text-[11px] text-[#6B5E4F] line-clamp-2 leading-relaxed">{d.bodyPreview}</p>
        </StepShell>
    );
});
EmailNode.displayName = 'EmailNode';

// ────────────────────────────────────────────────────────────────────
// Utility nodes (reused across sequences)
// ────────────────────────────────────────────────────────────────────

export interface WaitNodeData { days: number; hours: number }
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

export interface BranchNodeData { label: string; condition: string }
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
            <Handle type="source" position={Position.Bottom} id="yes" style={{ left: '30%' }} className="!bg-[#1F6F3A] !w-2 !h-2 !border-0" />
            <Handle type="source" position={Position.Bottom} id="no"  style={{ left: '70%' }} className="!bg-[#8B1F1F] !w-2 !h-2 !border-0" />
        </div>
    );
});
BranchNode.displayName = 'BranchNode';

export type ExitReason = 'replied' | 'accepted' | 'rejected' | 'completed' | 'skipped';
export interface ExitNodeData { reason: ExitReason; label?: string; count?: number }

const EXIT_META: Record<ExitReason, { label: string; icon: React.ReactNode; bg: string; fg: string; border: string }> = {
    replied:   { label: 'Sequence ends - Replied',          icon: <Reply size={11} strokeWidth={2.25} />,        bg: '#E8F4EC', fg: '#1F6F3A', border: '#BDE2C6' },
    accepted:  { label: 'Connection accepted',              icon: <CheckCircle2 size={11} strokeWidth={2.25} />, bg: '#E8F4EC', fg: '#1F6F3A', border: '#BDE2C6' },
    rejected:  { label: 'Connection rejected',              icon: <XCircle size={11} strokeWidth={2.25} />,      bg: '#FDEAEA', fg: '#8B1F1F', border: '#F4C2C2' },
    completed: { label: 'Sequence complete',                icon: <CheckCircle2 size={11} strokeWidth={2.25} />, bg: '#F0F6FF', fg: '#1F4C8F', border: '#C8DBF5' },
    skipped:   { label: 'Skipped - precondition not met',   icon: <XCircle size={11} strokeWidth={2.25} />,      bg: '#FDF3E2', fg: '#8B5A1A', border: '#EFD8B0' },
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
            <span className="text-[11px] font-semibold flex-1 truncate">{d.label || meta.label}</span>
            {d.count !== undefined && (
                <span className="text-[10px] tabular-nums opacity-80">{d.count}</span>
            )}
        </div>
    );
});
ExitNode.displayName = 'ExitNode';

// ────────────────────────────────────────────────────────────────────
// Export map - keyed by step_type / utility name
// ────────────────────────────────────────────────────────────────────

export const linkedinNodeTypes = {
    linkedin_connection_request: ConnectionRequestNode,
    linkedin_message: MessageNode,
    linkedin_inmail: InMailNode,
    linkedin_view_profile: ViewProfileNode,
    linkedin_follow: FollowNode,
    linkedin_like_post: LikePostNode,
    find_email: FindEmailNode,
    email: EmailNode,
    wait: WaitNode,
    branch: BranchNode,
    exit: ExitNode,
};

export const LINKEDIN_NODE_WIDTH_PX = NODE_WIDTH;
export const LINKEDIN_NODE_HEIGHT_PX = 110;

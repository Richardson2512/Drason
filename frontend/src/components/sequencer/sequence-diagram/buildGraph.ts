import type { Edge, Node } from '@xyflow/react';
import dagre from 'dagre';
import { NODE_WIDTH_PX } from './nodes';

/**
 * Turn a campaign's SequenceStep[] into nodes + edges for React Flow.
 *
 * Visual model:
 *   - Each step generates 2 nodes: a "wait" node (delay) + an "email" node.
 *   - The first step's wait is suppressed if delay is 0 ("Send immediately").
 *   - If the NEXT step has a `condition` (e.g., 'if_no_reply'), the current
 *     step's email connects to a branch node, which forks into:
 *       * a continuing edge (tagged with the matching label)
 *       * a drop-off exit (tagged with the inverse label)
 *   - Campaign-level `stop_on_reply` adds an "Exit: replied" off-ramp from
 *     each email node. `stop_on_bounce` adds "Exit: bounced".
 *   - The last step's outbound edge goes to "Sequence complete".
 *
 * Layout: dagre top-down, vertical spacing tight enough to fit 5+ steps
 * on screen without scrolling.
 */

// ============================================================================
// INPUT TYPES (mirror the campaign API response)
// ============================================================================

export interface SequenceStepInput {
    id: string;
    step_number: number;
    delay_days: number;
    delay_hours: number;
    subject: string;
    body_html: string;
    condition?: string | null;            // 'if_no_reply' | 'if_replied' | etc.
    branch_to_step_number?: number | null;
    variants?: Array<{
        id: string;
        sends?: number;
        opens?: number;
        replies?: number;
    }>;
}

export interface CampaignSettingsInput {
    stop_on_reply?: boolean | null;
    stop_on_bounce?: boolean | null;
}

export interface SenderAttribution {
    accounts: Array<{
        email: string;
        provider: string; // 'google' | 'microsoft' | 'smtp'
    }>;
}

interface BuildOptions {
    settings: CampaignSettingsInput;
    senders?: SenderAttribution;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const NODE_HEIGHT = 100;
const RANK_SEP = 60;
const NODE_SEP = 40;

interface ConditionMeta { label: string; positive: boolean; positiveLabel: string; negativeLabel: string }
const CONDITION_LABELS: Record<string, ConditionMeta> = {
    if_no_reply:    { label: 'Replied?',  positive: false, positiveLabel: 'Replied',   negativeLabel: 'No reply' },
    if_replied:     { label: 'Replied?',  positive: true,  positiveLabel: 'Replied',   negativeLabel: 'No reply' },
    if_opened:      { label: 'Opened?',   positive: true,  positiveLabel: 'Opened',    negativeLabel: "Didn't open" },
    if_not_opened:  { label: 'Opened?',   positive: false, positiveLabel: 'Opened',    negativeLabel: "Didn't open" },
    if_clicked:     { label: 'Clicked?',  positive: true,  positiveLabel: 'Clicked',   negativeLabel: "Didn't click" },
    if_not_clicked: { label: 'Clicked?',  positive: false, positiveLabel: 'Clicked',   negativeLabel: "Didn't click" },
};

// ============================================================================
// PROVIDER → LOGO PATH
// ============================================================================

function providerLogo(provider: string | null | undefined): string | null {
    switch ((provider || '').toLowerCase()) {
        case 'google':    return '/logos/gmail.svg';
        case 'microsoft': return '/logos/microsoft.svg';
        default:          return null;
    }
}

// ============================================================================
// MAIN BUILDER
// ============================================================================

/**
 * Outgoing-edge state passed across iterations. When a branch node is between
 * two steps, the next step's wait/email needs to attach to the branch's
 * "yes" or "no" handle with a labeled edge.
 */
interface PendingConnection {
    sourceId: string;
    /** When source is a branch node, which handle to attach from. */
    sourceHandle?: string;
    /** Edge label (e.g., "Replied", "No reply"). */
    label?: string;
    /** Edge stroke color (green for positive, default otherwise). */
    color?: string;
}

export function buildSequenceGraph(
    steps: SequenceStepInput[],
    opts: BuildOptions,
): { nodes: Node[]; edges: Edge[] } {
    if (!steps || steps.length === 0) {
        return { nodes: [], edges: [] };
    }

    const sorted = [...steps].sort((a, b) => a.step_number - b.step_number);
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const { stop_on_reply, stop_on_bounce } = opts.settings || {};
    const senderPool = opts.senders?.accounts ?? [];

    // The next node downstream attaches to this connection point.
    let pending: PendingConnection | null = null;

    for (let i = 0; i < sorted.length; i++) {
        const step = sorted[i];
        const isFirst = i === 0;
        const isLast = i === sorted.length - 1;

        // ─── Wait node before this step ────────────────────────────────
        const days = step.delay_days || 0;
        const hours = step.delay_hours || 0;
        const isImmediate = isFirst && days === 0 && hours === 0;
        let attachTargetId: string;

        if (!isImmediate) {
            const waitId = `wait-${step.step_number}`;
            nodes.push({
                id: waitId,
                type: 'wait',
                data: { days, hours },
                position: { x: 0, y: 0 },
            });
            if (pending) {
                edges.push(makeEdge(pending, waitId));
            }
            attachTargetId = waitId;
        } else {
            // Email node will be the attach point directly
            attachTargetId = `email-${step.step_number}`;
        }

        // ─── Email node ────────────────────────────────────────────────
        const emailId = `email-${step.step_number}`;
        const sender = senderPool.length > 0 ? senderPool[i % senderPool.length] : null;

        nodes.push({
            id: emailId,
            type: 'email',
            data: {
                stepNumber: step.step_number,
                subject: step.subject,
                bodyPreview: stripHtml(step.body_html).slice(0, 140),
                senderEmail: sender?.email ?? null,
                senderProvider: sender?.provider ?? null,
                senderProviderLogo: sender ? providerLogo(sender.provider) : null,
                variantCount: step.variants?.length ?? 1,
                ...aggregateVariantStats(step.variants),
            },
            position: { x: 0, y: 0 },
        });

        if (!isImmediate) {
            // Wait node already wired to pending; just connect wait → email
            edges.push({ id: `wait-${step.step_number}->${emailId}`, source: `wait-${step.step_number}`, target: emailId, type: 'smoothstep' });
        } else if (pending) {
            edges.push(makeEdge(pending, emailId));
        }

        // ─── Stop-on-reply off-ramp ────────────────────────────────────
        if (stop_on_reply) {
            const replyExitId = `${emailId}-exit-replied`;
            nodes.push({
                id: replyExitId,
                type: 'exit',
                data: { reason: 'replied' },
                position: { x: 0, y: 0 },
            });
            edges.push({
                id: `${emailId}->${replyExitId}`,
                source: emailId,
                target: replyExitId,
                type: 'smoothstep',
                label: 'on reply',
                labelStyle: { fontSize: 10, fontWeight: 600, fill: '#1F6F3A' },
                style: { stroke: '#1F6F3A', strokeDasharray: '4 4' },
            });
        }

        // ─── Stop-on-bounce off-ramp ───────────────────────────────────
        if (stop_on_bounce) {
            const bounceExitId = `${emailId}-exit-bounced`;
            nodes.push({
                id: bounceExitId,
                type: 'exit',
                data: { reason: 'bounced' },
                position: { x: 0, y: 0 },
            });
            edges.push({
                id: `${emailId}->${bounceExitId}`,
                source: emailId,
                target: bounceExitId,
                type: 'smoothstep',
                label: 'on bounce',
                labelStyle: { fontSize: 10, fontWeight: 600, fill: '#8B1F1F' },
                style: { stroke: '#8B1F1F', strokeDasharray: '4 4' },
            });
        }

        // ─── Conditional branch (between this step and next) ───────────
        const nextStep = sorted[i + 1];
        const branchMeta = nextStep?.condition ? CONDITION_LABELS[nextStep.condition] : null;
        if (nextStep && branchMeta) {
            const branchId = `branch-${step.step_number}-${nextStep.step_number}`;
            nodes.push({
                id: branchId,
                type: 'branch',
                data: { label: branchMeta.label, condition: nextStep.condition },
                position: { x: 0, y: 0 },
            });
            edges.push({ id: `${emailId}->${branchId}`, source: emailId, target: branchId, type: 'smoothstep' });

            // Drop-off exit on the inverse path
            const dropId = `${branchId}-drop`;
            nodes.push({
                id: dropId,
                type: 'exit',
                data: { reason: 'completed' },
                position: { x: 0, y: 0 },
            });
            edges.push({
                id: `${branchId}->${dropId}`,
                source: branchId,
                sourceHandle: branchMeta.positive ? 'no' : 'yes',
                target: dropId,
                type: 'smoothstep',
                label: branchMeta.positive ? branchMeta.negativeLabel : branchMeta.positiveLabel,
                labelStyle: { fontSize: 10, fontWeight: 600, fill: '#8B1F1F' },
                style: { stroke: '#8B1F1F' },
            });

            // Continuation: next step attaches to the matching handle of the branch
            pending = {
                sourceId: branchId,
                sourceHandle: branchMeta.positive ? 'yes' : 'no',
                label: branchMeta.positive ? branchMeta.positiveLabel : branchMeta.negativeLabel,
                color: '#1F6F3A',
            };
        } else {
            pending = { sourceId: emailId };
        }

        // ─── If this is the last step, append "Sequence complete" ──────
        if (isLast) {
            const doneId = `${emailId}-done`;
            nodes.push({
                id: doneId,
                type: 'exit',
                data: { reason: 'completed' },
                position: { x: 0, y: 0 },
            });
            edges.push({
                id: `${emailId}->${doneId}`,
                source: emailId,
                target: doneId,
                type: 'smoothstep',
                label: 'sequence ends',
                labelStyle: { fontSize: 10, fontWeight: 600 },
            });
        }
    }

    return applyDagreLayout(nodes, edges);
}

// ============================================================================
// EDGE CONSTRUCTOR
// ============================================================================

function makeEdge(from: PendingConnection, targetId: string): Edge {
    return {
        id: `${from.sourceId}${from.sourceHandle ? ':' + from.sourceHandle : ''}->${targetId}`,
        source: from.sourceId,
        sourceHandle: from.sourceHandle,
        target: targetId,
        type: 'smoothstep',
        label: from.label,
        labelStyle: from.label
            ? { fontSize: 10, fontWeight: 600, fill: from.color || '#1E1E2F' }
            : undefined,
        style: from.color ? { stroke: from.color } : undefined,
    };
}

// ============================================================================
// LAYOUT
// ============================================================================

function applyDagreLayout(nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } {
    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: 'TB', ranksep: RANK_SEP, nodesep: NODE_SEP, edgesep: 12 });
    g.setDefaultEdgeLabel(() => ({}));

    for (const n of nodes) {
        g.setNode(n.id, { width: NODE_WIDTH_PX, height: NODE_HEIGHT });
    }
    for (const e of edges) {
        g.setEdge(e.source, e.target);
    }

    dagre.layout(g);

    const positionedNodes = nodes.map((n) => {
        const layout = g.node(n.id);
        return {
            ...n,
            position: {
                x: layout.x - NODE_WIDTH_PX / 2,
                y: layout.y - NODE_HEIGHT / 2,
            },
        };
    });

    return { nodes: positionedNodes, edges };
}

// ============================================================================
// HELPERS
// ============================================================================

function stripHtml(html: string): string {
    if (!html) return '';
    return html
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\s+/g, ' ')
        .trim();
}

function aggregateVariantStats(variants?: SequenceStepInput['variants']) {
    if (!variants || variants.length === 0) return {};
    const totals = variants.reduce(
        (acc, v) => ({
            sends: acc.sends + (v.sends ?? 0),
            opens: acc.opens + (v.opens ?? 0),
            replies: acc.replies + (v.replies ?? 0),
        }),
        { sends: 0, opens: 0, replies: 0 },
    );
    const out: { sends?: number; opens?: number; replies?: number } = {};
    if (totals.sends > 0)   out.sends = totals.sends;
    if (totals.opens > 0)   out.opens = totals.opens;
    if (totals.replies > 0) out.replies = totals.replies;
    return out;
}

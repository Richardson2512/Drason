import type { Edge, Node } from '@xyflow/react';
import dagre from 'dagre';
import { LINKEDIN_NODE_WIDTH_PX, LINKEDIN_NODE_HEIGHT_PX } from './nodes';

/**
 * Build React Flow nodes + edges from a Super LinkedIn sequence.
 *
 * Mirrors the email sequence diagram's builder (components/sequencer/
 * sequence-diagram/buildGraph.ts) but adapted for the multi-channel
 * step_type vocabulary defined in services/sequencer/stepTypeRegistry.ts.
 *
 * Visual model:
 *   - Each step → a wait node (delay) + a typed step node, in that order.
 *   - find_email steps have two source handles (found / not_found) and
 *     fork into the next step on the "found" path + an exit on "not_found".
 *   - Conditional `condition` predicates (e.g. if_connection) materialize
 *     a branch node between the current step and the next.
 *   - Last step terminates with a "Sequence complete" exit node.
 */

// ────────────────────────────────────────────────────────────────────
// Input types — mirror the campaign-side SequenceStep API shape, with
// the Phase-3 additions (step_type + step_config) folded in.
// ────────────────────────────────────────────────────────────────────

export interface LinkedInSequenceStepInput {
    id: string;
    step_number: number;
    delay_days: number;
    delay_hours: number;
    step_type: string;
    step_config?: Record<string, unknown>;
    /** Email steps still use these legacy columns. */
    subject?: string;
    body_html?: string;
    body_text?: string;
    /** Existing condition + branch_to_step_number primitives. */
    condition?: string | null;
    branch_to_step_number?: number | null;
    /** Per-step rollup counts (analytics overlay). */
    sent?: number;
    accepted?: number;
    replied?: number;
    opens?: number;
    found?: number;
    not_found?: number;
}

export interface LinkedInDiagramOptions {
    senders?: Array<{ name: string; type?: string }>;
    /** When TRUE, terminate every step with an "exit — replied" off-ramp
     *  on the lead's first reply. */
    stopOnReply?: boolean;
}

// ────────────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────────────

const RANK_SEP = 70;
const NODE_SEP = 50;

const CONDITION_LABELS: Record<string, { label: string; positiveLabel: string; negativeLabel: string; positive: boolean }> = {
    if_no_reply:          { label: 'Replied?',     positive: false, positiveLabel: 'Replied',  negativeLabel: 'No reply' },
    if_replied:           { label: 'Replied?',     positive: true,  positiveLabel: 'Replied',  negativeLabel: 'No reply' },
    if_opened:            { label: 'Opened?',      positive: true,  positiveLabel: 'Opened',   negativeLabel: "Didn't open" },
    if_not_opened:        { label: 'Opened?',      positive: false, positiveLabel: 'Opened',   negativeLabel: "Didn't open" },
    if_clicked:           { label: 'Clicked?',     positive: true,  positiveLabel: 'Clicked',  negativeLabel: "Didn't click" },
    if_not_clicked:       { label: 'Clicked?',     positive: false, positiveLabel: 'Clicked',  negativeLabel: "Didn't click" },
    if_connection:        { label: 'Connected?',   positive: true,  positiveLabel: 'Connected', negativeLabel: 'Not connected' },
    if_not_connection:    { label: 'Connected?',   positive: false, positiveLabel: 'Connected', negativeLabel: 'Not connected' },
    if_email_found:       { label: 'Email found?', positive: true,  positiveLabel: 'Found',    negativeLabel: 'Not found' },
    if_not_email_found:   { label: 'Email found?', positive: false, positiveLabel: 'Found',    negativeLabel: 'Not found' },
};

interface PendingConnection {
    sourceId: string;
    sourceHandle?: string;
    label?: string;
    color?: string;
}

// ────────────────────────────────────────────────────────────────────
// Main builder
// ────────────────────────────────────────────────────────────────────

export function buildLinkedInSequenceGraph(
    steps: LinkedInSequenceStepInput[],
    opts: LinkedInDiagramOptions = {},
): { nodes: Node[]; edges: Edge[] } {
    if (!steps || steps.length === 0) return { nodes: [], edges: [] };

    const sorted = [...steps].sort((a, b) => a.step_number - b.step_number);
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const senderPool = opts.senders ?? [];

    let pending: PendingConnection | null = null;

    for (let i = 0; i < sorted.length; i++) {
        const step = sorted[i];
        const isFirst = i === 0;
        const isLast = i === sorted.length - 1;

        // ── Wait node ─────────────────────────────────────────────
        const days = step.delay_days || 0;
        const hours = step.delay_hours || 0;
        const isImmediate = isFirst && days === 0 && hours === 0;

        if (!isImmediate) {
            const waitId = `wait-${step.step_number}`;
            nodes.push({ id: waitId, type: 'wait', data: { days, hours }, position: { x: 0, y: 0 } });
            if (pending) edges.push(makeEdge(pending, waitId));
            pending = { sourceId: waitId };
        }

        // ── Step node (typed) ─────────────────────────────────────
        const stepId = `step-${step.step_number}`;
        const sender = senderPool.length > 0 ? senderPool[i % senderPool.length] : null;
        const data = stepDataFor(step, sender);
        nodes.push({ id: stepId, type: step.step_type, data, position: { x: 0, y: 0 } });

        if (pending) edges.push(makeEdge(pending, stepId));

        // ── find_email forks into Found / Not Found ───────────────
        if (step.step_type === 'find_email') {
            const notFoundExitId = `${stepId}-not-found`;
            nodes.push({
                id: notFoundExitId,
                type: 'exit',
                data: { reason: 'skipped', label: 'No email found — drops out' },
                position: { x: 0, y: 0 },
            });
            edges.push({
                id: `${stepId}->${notFoundExitId}`,
                source: stepId,
                sourceHandle: 'not_found',
                target: notFoundExitId,
                type: 'smoothstep',
                label: 'Not found',
                labelStyle: { fontSize: 10, fontWeight: 600, fill: '#8B1F1F' },
                style: { stroke: '#8B1F1F' },
            });
            pending = { sourceId: stepId, sourceHandle: 'found', label: 'Found', color: '#1F6F3A' };
        }

        // ── stop-on-reply off-ramp (applies to message/inmail/email) ──
        if (opts.stopOnReply && ['linkedin_message', 'linkedin_inmail', 'email'].includes(step.step_type)) {
            const replyExitId = `${stepId}-replied`;
            nodes.push({ id: replyExitId, type: 'exit', data: { reason: 'replied' }, position: { x: 0, y: 0 } });
            edges.push({
                id: `${stepId}->${replyExitId}`,
                source: stepId,
                target: replyExitId,
                type: 'smoothstep',
                label: 'on reply',
                labelStyle: { fontSize: 10, fontWeight: 600, fill: '#1F6F3A' },
                style: { stroke: '#1F6F3A', strokeDasharray: '4 4' },
            });
        }

        // ── Conditional branch into next step ─────────────────────
        const nextStep = sorted[i + 1];
        const branchMeta = nextStep?.condition ? CONDITION_LABELS[nextStep.condition] : null;
        if (nextStep && branchMeta) {
            const branchId = `branch-${step.step_number}-${nextStep.step_number}`;
            nodes.push({
                id: branchId,
                type: 'branch',
                data: { label: branchMeta.label, condition: nextStep.condition || '' },
                position: { x: 0, y: 0 },
            });
            if (step.step_type !== 'find_email') {
                edges.push({ id: `${stepId}->${branchId}`, source: stepId, target: branchId, type: 'smoothstep' });
            } else if (pending) {
                edges.push(makeEdge(pending, branchId));
            }

            // Drop-off exit on the inverse path.
            const dropId = `${branchId}-drop`;
            nodes.push({
                id: dropId,
                type: 'exit',
                data: { reason: 'completed', label: branchMeta.positive ? `Dropped — ${branchMeta.negativeLabel}` : `Dropped — ${branchMeta.positiveLabel}` },
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

            pending = {
                sourceId: branchId,
                sourceHandle: branchMeta.positive ? 'yes' : 'no',
                label: branchMeta.positive ? branchMeta.positiveLabel : branchMeta.negativeLabel,
                color: '#1F6F3A',
            };
        } else if (step.step_type !== 'find_email') {
            pending = { sourceId: stepId };
        }

        // ── Terminal: append Sequence complete ────────────────────
        if (isLast) {
            const doneId = `${stepId}-done`;
            nodes.push({ id: doneId, type: 'exit', data: { reason: 'completed' }, position: { x: 0, y: 0 } });
            if (pending) edges.push(makeEdge({ ...pending, label: pending.label || 'sequence ends' }, doneId));
        }
    }

    return applyDagreLayout(nodes, edges);
}

// ────────────────────────────────────────────────────────────────────
// Per-step-type data shaping
// ────────────────────────────────────────────────────────────────────

function stepDataFor(step: LinkedInSequenceStepInput, sender: { name: string; type?: string } | null) {
    const cfg = step.step_config || {};
    const base = { stepNumber: step.step_number, sender };

    switch (step.step_type) {
        case 'linkedin_connection_request':
            return {
                ...base,
                note: (cfg.note_template as string | undefined) || null,
                useDefaultFallback: Boolean(cfg.use_workspace_default_note_fallback),
                sent: step.sent,
                accepted: step.accepted,
            };
        case 'linkedin_message':
            return {
                ...base,
                body: (cfg.body_template as string | undefined) || step.body_text || null,
                sent: step.sent,
                replied: step.replied,
            };
        case 'linkedin_inmail':
            return {
                ...base,
                subject: (cfg.subject as string | undefined) || step.subject || null,
                body: (cfg.body as string | undefined) || step.body_text || null,
                sent: step.sent,
                replied: step.replied,
            };
        case 'linkedin_view_profile':
        case 'linkedin_follow':
            return base;
        case 'linkedin_like_post':
            return {
                ...base,
                reactionType: (cfg.reaction_type as string | undefined) || 'LIKE',
                timespanDays: Number(cfg.post_selection_timespan_days ?? 30),
                skipIfNoPost: Boolean(cfg.skip_if_no_post),
            };
        case 'find_email':
            return {
                stepNumber: step.step_number,
                providers: (cfg.providers_override as string[] | undefined) || undefined,
                found: step.found,
                notFound: step.not_found,
            };
        case 'email':
            return {
                ...base,
                subject: step.subject || '',
                bodyPreview: stripHtml(step.body_html || '').slice(0, 140),
                sends: step.sent,
                opens: step.opens,
                replies: step.replied,
            };
        default:
            return base;
    }
}

// ────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────

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

function applyDagreLayout(nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } {
    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: 'TB', ranksep: RANK_SEP, nodesep: NODE_SEP, edgesep: 14 });
    g.setDefaultEdgeLabel(() => ({}));

    for (const n of nodes) g.setNode(n.id, { width: LINKEDIN_NODE_WIDTH_PX, height: LINKEDIN_NODE_HEIGHT_PX });
    for (const e of edges) g.setEdge(e.source, e.target);

    dagre.layout(g);

    const positioned = nodes.map(n => {
        const l = g.node(n.id);
        return {
            ...n,
            position: { x: l.x - LINKEDIN_NODE_WIDTH_PX / 2, y: l.y - LINKEDIN_NODE_HEIGHT_PX / 2 },
        };
    });
    return { nodes: positioned, edges };
}

function stripHtml(html: string): string {
    if (!html) return '';
    return html
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/\s+/g, ' ').trim();
}

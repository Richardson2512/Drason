'use client';

import { useMemo } from 'react';
import { ReactFlow, Background, BackgroundVariant, Controls, MiniMap, ReactFlowProvider, type Node, type Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { linkedinNodeTypes } from './nodes';
import { buildLinkedInSequenceGraph, type LinkedInSequenceStepInput, type LinkedInDiagramOptions } from './buildGraph';

interface LinkedInSequenceDiagramProps {
    steps: LinkedInSequenceStepInput[];
    senders?: LinkedInDiagramOptions['senders'];
    stopOnReply?: boolean;
    minHeight?: number;
}

/**
 * Super LinkedIn sequence visualizer.
 *
 * Renders a multi-channel sequence (Connection Request / Message /
 * InMail / View Profile / Follow / Like Post / Find Email / Email) as
 * a top-down React Flow graph. Mirrors the email-side SequenceDiagram so
 * the visual language is consistent for users running both channels.
 */
export default function LinkedInSequenceDiagram({
    steps,
    senders,
    stopOnReply,
    minHeight = 600,
}: LinkedInSequenceDiagramProps) {
    const { nodes, edges } = useMemo<{ nodes: Node[]; edges: Edge[] }>(
        () => buildLinkedInSequenceGraph(steps, { senders, stopOnReply }),
        [steps, senders, stopOnReply],
    );

    if (nodes.length === 0) {
        return (
            <div
                className="rounded-xl bg-white flex items-center justify-center text-center px-6 py-12"
                style={{ minHeight, border: '1px solid #D1CBC5' }}
            >
                <div>
                    <p className="text-sm font-semibold text-[#1E1E2F] mb-1">No sequence steps yet</p>
                    <p className="text-xs text-[#6B5E4F]">
                        Add steps in the campaign editor to see them visualized here.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="rounded-xl overflow-hidden"
            // ReactFlow uses height: 100% on its root div (via its CSS).
            // The parent therefore needs a RESOLVED height - not just
            // minHeight - or ReactFlow lays out at 0px and renders blank.
            style={{ height: minHeight, minHeight, border: '1px solid #D1CBC5', background: '#FBFAF7' }}
        >
            <ReactFlowProvider>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={linkedinNodeTypes}
                    fitView
                    fitViewOptions={{ padding: 0.18, minZoom: 0.4, maxZoom: 1.2 }}
                    proOptions={{ hideAttribution: true }}
                    nodesDraggable={false}
                    nodesConnectable={false}
                    elementsSelectable
                    panOnDrag
                    zoomOnScroll
                    zoomOnPinch
                    minZoom={0.3}
                    maxZoom={1.5}
                    defaultEdgeOptions={{ type: 'smoothstep', style: { stroke: '#1E1E2F', strokeWidth: 1.5 } }}
                >
                    <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#D1CBC5" />
                    <Controls
                        showInteractive={false}
                        className="!bg-white !border !border-[#D1CBC5] !rounded-lg !shadow-sm"
                    />
                    <MiniMap
                        nodeColor={(n) => {
                            switch (n.type) {
                                case 'linkedin_connection_request': return '#1F4C8F';
                                case 'linkedin_message':            return '#1F6F3A';
                                case 'linkedin_inmail':             return '#7C3AED';
                                case 'linkedin_view_profile':       return '#0891B2';
                                case 'linkedin_follow':             return '#D97706';
                                case 'linkedin_like_post':          return '#DB2777';
                                case 'find_email':                  return '#0F766E';
                                case 'email':                       return '#1E1E2F';
                                case 'wait':                        return '#D1CBC5';
                                case 'branch':                      return '#6B5E4F';
                                case 'exit':                        return '#1F6F3A';
                                default:                            return '#1E1E2F';
                            }
                        }}
                        nodeStrokeWidth={2}
                        zoomable
                        pannable
                        className="!bg-white !border !border-[#D1CBC5] !rounded-lg"
                    />
                </ReactFlow>
            </ReactFlowProvider>
        </div>
    );
}

'use client';

import { useMemo } from 'react';
import { ReactFlow, Background, BackgroundVariant, Controls, MiniMap, ReactFlowProvider, type Node, type Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes } from './nodes';
import { buildSequenceGraph, type SequenceStepInput, type CampaignSettingsInput, type SenderAttribution } from './buildGraph';

interface SequenceDiagramProps {
    steps: SequenceStepInput[];
    settings: CampaignSettingsInput;
    senders?: SenderAttribution;
    /** Optional explicit height; default fills its container. */
    minHeight?: number;
}

export default function SequenceDiagram({ steps, settings, senders, minHeight = 600 }: SequenceDiagramProps) {
    const { nodes, edges } = useMemo<{ nodes: Node[]; edges: Edge[] }>(
        () => buildSequenceGraph(steps, { settings, senders }),
        [steps, settings, senders],
    );

    if (nodes.length === 0) {
        return (
            <div
                className="rounded-xl bg-white flex items-center justify-center text-center px-6 py-12"
                style={{ minHeight, border: '1px solid #D1CBC5' }}
            >
                <div>
                    <p className="text-sm font-semibold text-[#1E1E2F] mb-1">No sequence steps yet</p>
                    <p className="text-xs text-[#6B5E4F]">Add steps in the campaign editor to see them visualized here.</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="rounded-xl overflow-hidden"
            style={{ minHeight, border: '1px solid #D1CBC5', background: '#FBFAF7' }}
        >
            <ReactFlowProvider>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    fitView
                    fitViewOptions={{ padding: 0.18, minZoom: 0.4, maxZoom: 1.2 }}
                    proOptions={{ hideAttribution: true }}
                    nodesDraggable={false}
                    nodesConnectable={false}
                    elementsSelectable={true}
                    panOnDrag
                    zoomOnScroll
                    zoomOnPinch
                    minZoom={0.3}
                    maxZoom={1.5}
                    defaultEdgeOptions={{
                        type: 'smoothstep',
                        style: { stroke: '#1E1E2F', strokeWidth: 1.5 },
                    }}
                >
                    <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#D1CBC5" />
                    <Controls
                        showInteractive={false}
                        className="!bg-white !border !border-[#D1CBC5] !rounded-lg !shadow-sm"
                    />
                    <MiniMap
                        nodeColor={(n) => {
                            switch (n.type) {
                                case 'email':  return '#1E1E2F';
                                case 'wait':   return '#D1CBC5';
                                case 'branch': return '#6B5E4F';
                                case 'exit':   return '#1F6F3A';
                                default:       return '#1E1E2F';
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

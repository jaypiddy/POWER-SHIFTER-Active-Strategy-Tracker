import React, { useCallback, useMemo, useEffect } from 'react';
import {
    ReactFlow,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
    BackgroundVariant,
    MiniMap,
    Handle,
    Position,
    Panel,
    useReactFlow,
    ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Target, Activity, Zap, CheckSquare, Layout } from 'lucide-react';
import dagre from 'dagre';
import { Bet, Outcome1Y, Measure, BetAction, User, Theme } from '../types';
import { StrategyNode } from './StrategyNode';

interface StrategyExplorerIIProps {
    outcomes: Outcome1Y[];
    measures: Measure[];
    bets: Bet[];
    tasks: BetAction[];
    themes: Theme[];
    users: User[];
    onNavigate: (id: string, tab?: string) => void;
}

// Wrapper for the generic StrategyNode to add React Flow Handles
const ReactFlowStrategyNode = ({ data }: { data: any }) => {
    return (
        <div className="w-[320px]">
            {/* Handle Config: Left-to-Right Flow */}
            {(data.type !== 'outcome') && (
                <Handle
                    type="target"
                    position={Position.Left}
                    className="!bg-slate-400 !w-3 !h-3 !-ml-1.5 !border-none"
                />
            )}

            <StrategyNode
                item={data.item}
                type={data.type}
                users={data.users}
                onNavigate={data.onNavigate}
                theme={data.theme}
                isActive={false}
                className="!mb-0 shadow-xl border-slate-700"
            />

            {(data.type !== 'task') && (
                <Handle
                    type="source"
                    position={Position.Right}
                    className="!bg-slate-400 !w-3 !h-3 !-mr-1.5 !border-none"
                />
            )}
        </div>
    );
};

const nodeTypes = {
    strategyNode: ReactFlowStrategyNode,
};

// Dagre Layout Helper
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    const nodeWidth = 350; // Card width + gap
    const nodeHeight = 200; // Average card height

    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        return {
            ...node,
            targetPosition: Position.Left,
            sourcePosition: Position.Right,
            // We are shifting the dagre node position (anchor=center center) to the top left
            // so it matches the React Flow node anchor point (top left).
            position: {
                x: nodeWithPosition.x - nodeWidth / 2,
                y: nodeWithPosition.y - nodeHeight / 2,
            },
        };
    });

    return { nodes: layoutedNodes, edges };
};

const StrategyExplorerInner = ({ outcomes, measures, bets, tasks, users, themes, onNavigate }: StrategyExplorerIIProps) => {

    // Transform Data into Nodes & Edges
    const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
        const nodes: Node[] = [];
        const edges: Edge[] = [];
        const xGap = 450; // Wider gap for larger cards
        const yGap = 20; // Vertical spacing handled by position calculation

        const cardHeight = 200;

        // 1. Outcomes (Column 1)
        outcomes.forEach((o, index) => {
            const theme = themes.find(t => t.id === o.theme_id);
            nodes.push({
                id: o.id,
                type: 'strategyNode',
                // Initial placement, will be overridden by layout
                position: { x: 0, y: index * (cardHeight + yGap) },
                data: { item: o, type: 'outcome', users, onNavigate, theme },
            });
        });

        // 2. Measures (Column 2)
        measures.forEach((m, index) => {
            nodes.push({
                id: m.id,
                type: 'strategyNode',
                position: { x: xGap, y: index * (150 + yGap) },
                data: { item: m, type: 'measure', users, onNavigate },
            });
            if (m.outcome_id) {
                edges.push({
                    id: `e-${m.outcome_id}-${m.id}`,
                    source: m.outcome_id,
                    target: m.id,
                    animated: true,
                    style: { stroke: '#3b82f6', strokeWidth: 2 }
                });
            }
        });

        // 3. Bets (Column 3)
        bets.forEach((b, index) => {
            const theme = themes.find(t => t.id === b.theme_id);
            nodes.push({
                id: b.id,
                type: 'strategyNode',
                position: { x: xGap * 2, y: index * (250 + yGap) },
                data: { item: b, type: 'bet', users, onNavigate, theme },
            });
            // Link to Measures
            b.linked_measure_ids?.forEach(mid => {
                edges.push({
                    id: `e-${mid}-${b.id}`,
                    source: mid,
                    target: b.id,
                    animated: true,
                    style: { stroke: '#10b981', strokeWidth: 2 }
                });
            });

        });

        // 4. Tasks
        tasks.forEach((t, index) => {
            nodes.push({
                id: t.id,
                type: 'strategyNode',
                position: { x: xGap * 3, y: index * (100 + yGap) },
                data: { item: t, type: 'task', users, onNavigate },
            });
            if (t.bet_id) {
                edges.push({
                    id: `e-${t.bet_id}-${t.id}`,
                    source: t.bet_id,
                    target: t.id,
                    animated: true,
                    style: { stroke: '#f59e0b', strokeWidth: 2 }
                });
            }
        });

        return { nodes, edges };
    }, [outcomes, measures, bets, tasks, users, themes, onNavigate]);


    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const { fitView } = useReactFlow();
    const isFirstLayout = React.useRef(true);

    // Initial Layout Effect
    useEffect(() => {
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges);
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);

        // Fit view ONLY on first layout to avoid resetting user zoom on updates
        if (isFirstLayout.current) {
            setTimeout(() => {
                window.requestAnimationFrame(() => fitView({ padding: 0.2 }));
            }, 100);
            isFirstLayout.current = false;
        }

    }, [initialNodes, initialEdges, setNodes, setEdges, fitView]);

    const onLayout = useCallback(() => {
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges);
        setNodes([...layoutedNodes]);
        setEdges([...layoutedEdges]);
        window.requestAnimationFrame(() => fitView({ padding: 0.2 }));
    }, [nodes, edges, setNodes, setEdges, fitView]);

    return (
        <div className="w-full h-screen bg-slate-950 text-white relative">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                colorMode="dark"
                minZoom={0.1}
                maxZoom={1.5}
            >
                <Background color="#334155" variant={BackgroundVariant.Dots} gap={20} size={1} />
                <Controls className="bg-slate-800 border-slate-700 text-white fill-current" />
                <MiniMap
                    className="bg-slate-900 border-slate-800"
                    nodeColor={(n) => {
                        switch (n.data.type) {
                            case 'outcome': return '#3b82f6';
                            case 'bet': return '#10b981';
                            case 'measure': return '#a855f7';
                            case 'task': return '#f59e0b';
                            default: return '#64748b';
                        }
                    }}
                />
                <Panel position="top-right" className="z-50 m-4">
                    <button
                        onClick={onLayout}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-xs font-bold transition-colors shadow-lg shadow-blue-900/20 text-white border border-blue-500"
                    >
                        <Layout size={14} />
                        Auto-Layout
                    </button>
                </Panel>
            </ReactFlow>
        </div>
    );
}

export default function StrategyExplorerII(props: StrategyExplorerIIProps) {
    return (
        <ReactFlowProvider>
            <StrategyExplorerInner {...props} />
        </ReactFlowProvider>
    );
}

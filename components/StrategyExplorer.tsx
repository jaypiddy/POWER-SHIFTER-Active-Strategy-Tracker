import React, { useState, useEffect, useRef, useLayoutEffect, useMemo } from 'react';
import { Target, Activity, Zap, Search, CheckSquare, Pencil } from 'lucide-react';
import { Outcome1Y, Measure, Bet, Theme, BetAction, User } from '../types';

interface StrategyExplorerProps {
    outcomes: Outcome1Y[];
    measures: Measure[];
    bets: Bet[];
    tasks: BetAction[];
    themes: Theme[];
    users: User[];
    onNavigate: (id: string, tab?: string) => void;
}

// Card component removed, using StrategyNode
import { StrategyNode } from './StrategyNode';

interface ErrorBoundaryProps {
    fallback: React.ReactNode;
    children: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    public state: ErrorBoundaryState = {
        hasError: false,
        error: null
    };

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("StrategyExplorer Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 bg-slate-900 text-red-400">
                    <h2 className="text-xl font-bold mb-2">Strategy Explorer Error</h2>
                    <pre className="bg-slate-950 p-4 rounded border border-red-900/50 overflow-auto text-xs font-mono">
                        {this.state.error?.message}
                    </pre>
                </div>
            )
        }
        return this.props.children;
    }
}

export default function StrategyExplorerWrapper(props: StrategyExplorerProps) {
    return (
        <ErrorBoundary fallback={<div>Error loading explorer</div>}>
            <StrategyExplorer {...props} />
        </ErrorBoundary>
    );
}

function StrategyExplorer({ outcomes, measures, bets, themes, tasks, users, onNavigate }: StrategyExplorerProps) {
    // User Filter State
    const [selectedUserId, setSelectedUserId] = useState<string>('all');

    // State & Refs
    const [hovered, setHovered] = useState<{ id: string | null, type: string | null }>({ id: null, type: null });
    const [connections, setConnections] = useState<any[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleHover = (id: string | null, type: string | null) => {
        setHovered({ id, type });
    };

    const setRef = (id: string, el: HTMLDivElement | null) => {
        if (id) cardRefs.current[id] = el;
    };

    // Filter Logic

    // 1. Identify "Base" Bets (Matches Filter)
    const baseBets = useMemo(() => bets.filter(b => {
        if (b.stage === 'Archived') return false;
        if (selectedUserId === 'all') return true;
        return b.owner_user_ids?.includes(selectedUserId);
    }), [bets, selectedUserId]);

    // 2. Identify "Base" Tasks (Matches Filter)
    const filteredTasks = useMemo(() => tasks.filter(t => {
        if (selectedUserId === 'all') return true;
        return t.owner_id === selectedUserId;
    }), [tasks, selectedUserId]);

    // 3. Identify Measures visible via Top-Down (User -> Outcome -> Measure) OR Bottom-Up (Bet -> Measure)
    const filteredMeasures = useMemo(() => {
        // A. Measures explicitly owned (if we had ownership) or belonging to Owned Outcomes
        // B. Measures linked by visible Bets
        const activeBetMeasureIds = new Set(baseBets.flatMap(b => b.linked_measure_ids || []));

        return measures.filter(m => {
            // Include if linked by a visible bet
            if (activeBetMeasureIds.has(m.id)) return true;

            // Include if parent outcome matches filter (Legacy strict filter)
            if (selectedUserId === 'all') return true;
            const parentOutcome = outcomes.find(o => o.id === m.outcome_id);
            return parentOutcome?.owner_user_ids?.includes(selectedUserId) ?? false;
        });
    }, [measures, baseBets, outcomes, selectedUserId]);

    // 4. Identify Outcomes visible via Top-Down (User -> Outcome) OR Bottom-Up (Measure -> Outcome)
    const filteredOutcomes = useMemo(() => {
        const activeMeasureOutcomeIds = new Set(filteredMeasures.map(m => m.outcome_id).filter(Boolean) as string[]);

        return outcomes.filter(o => {
            // Include if parent of a visible measure
            if (activeMeasureOutcomeIds.has(o.id)) return true;

            // Include if matches filter
            if (selectedUserId === 'all') return true;
            return o.owner_user_ids?.includes(selectedUserId);
        });
    }, [outcomes, filteredMeasures, selectedUserId]);

    // Rename baseBets to filteredBets for compatibility with rest of component
    const filteredBets = baseBets;

    // Calculate lines (use filtered lists)
    useLayoutEffect(() => {
        if (!containerRef.current) return;

        const newConnections: any[] = [];
        const containerRect = containerRef.current.getBoundingClientRect();

        // Helper to get coordinates
        const getCoords = (id: string, side: 'left' | 'right') => {
            const el = cardRefs.current[id];
            if (!el) return null;
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return null;
            return {
                x: side === 'right' ? (rect.right - containerRect.left) : (rect.left - containerRect.left),
                y: (rect.top - containerRect.top) + (rect.height / 2)
            };
        };

        // 1. Link Outcomes to Measures
        filteredMeasures.forEach(measure => {
            if (!measure.outcome_id) return;
            // distinct check if parent is technically visible
            // We can check if parent is in filteredOutcomes

            // Optimization: Create Set for lookup if performance becomes an issue
            // For now Array.find is okay if N is small
            const isParentVisible = filteredOutcomes.some(o => o.id === measure.outcome_id);
            if (!isParentVisible) return;

            const start = getCoords(measure.outcome_id, 'right');
            const end = getCoords(measure.id, 'left');

            if (start && end) {
                newConnections.push({
                    id: `${measure.outcome_id}-${measure.id}`,
                    start,
                    end,
                    sourceId: measure.outcome_id,
                    targetId: measure.id,
                    type: 'outcome-measure'
                });
            }
        });

        // 2. Link Measures to Bets (New Cascade)
        // bets have linked_measure_ids array
        filteredBets.forEach(bet => {
            let hasMeasureLink = false;

            if (bet.linked_measure_ids && bet.linked_measure_ids.length > 0) {
                bet.linked_measure_ids.forEach(measureId => {
                    const start = getCoords(measureId, 'right');
                    const end = getCoords(bet.id, 'left');

                    if (start && end) {
                        hasMeasureLink = true;
                        newConnections.push({
                            id: `${measureId}-${bet.id}`,
                            start,
                            end,
                            sourceId: measureId,
                            targetId: bet.id,
                            type: 'measure-bet'
                        });
                    }
                });
            }

            // Fallback: Link directly to Outcome if no measure links (or legacy data)
            // AND if bet has linked_outcome_ids
            if (!hasMeasureLink && bet.linked_outcome_ids && bet.linked_outcome_ids.length > 0) {
                bet.linked_outcome_ids.forEach(outcomeId => {
                    const start = getCoords(outcomeId, 'right');
                    const end = getCoords(bet.id, 'left');

                    if (start && end) {
                        newConnections.push({
                            id: `${outcomeId}-${bet.id}`,
                            start,
                            end,
                            sourceId: outcomeId,
                            targetId: bet.id,
                            type: 'outcome-bet' // New type for direct links
                        });
                    }
                });
            }
        });

        // 3. Link Bets to Tasks
        // We need a set of visible bets for fast lookup
        const filteredBetIds = new Set(filteredBets.map(b => b.id));

        filteredTasks.forEach(task => {
            if (!task.bet_id) return;
            if (!filteredBetIds.has(task.bet_id)) return; // Only draw if parent bet is visible

            const start = getCoords(task.bet_id, 'right');
            const end = getCoords(task.id, 'left');

            if (start && end) {
                newConnections.push({
                    id: `${task.bet_id}-${task.id}`,
                    start,
                    end,
                    sourceId: task.bet_id,
                    targetId: task.id,
                    type: 'bet-task'
                });
            }
        });

        setConnections(newConnections);
    }, [windowWidth, filteredOutcomes, filteredMeasures, filteredBets, filteredTasks]);

    // Determine which items are "active" based on hover
    const getActiveState = () => {
        if (!hovered.id) return { activeIds: new Set<string>(), isIdle: true };

        const activeIds = new Set<string>();
        activeIds.add(hovered.id);

        // Filter Logic

        // If hovering Outcome
        if (hovered.type === 'outcome') {
            // Show Children (Measures)
            const connectedMeasures = filteredMeasures.filter(m => m.outcome_id === hovered.id);
            connectedMeasures.forEach(m => {
                activeIds.add(m.id);
                // Show Grandchildren (Bets linked to these measures)
                const connectedBets = filteredBets.filter(b => b.linked_measure_ids?.includes(m.id));
                connectedBets.forEach(b => {
                    activeIds.add(b.id);
                    // Show Great-Grandchildren (Tasks)
                    const connectedTasks = filteredTasks.filter(t => t.bet_id === b.id);
                    connectedTasks.forEach(t => activeIds.add(t.id));
                });
            });

            // Show Direct Child Bets (Legacy/Fallback)
            const directChildBets = filteredBets.filter(b => b.linked_outcome_ids?.includes(hovered.id!));
            directChildBets.forEach(b => {
                activeIds.add(b.id);
                const connectedTasks = filteredTasks.filter(t => t.bet_id === b.id);
                connectedTasks.forEach(t => activeIds.add(t.id));
            });
        }

        // If hovering Measure
        if (hovered.type === 'measure') {
            const measure = filteredMeasures.find(m => m.id === hovered.id);
            if (measure) {
                // Show Parent Outcome
                if (measure.outcome_id) activeIds.add(measure.outcome_id);

                // Show Children (Bets)
                const connectedBets = filteredBets.filter(b => b.linked_measure_ids?.includes(measure.id));
                connectedBets.forEach(b => {
                    activeIds.add(b.id);
                    // Show Grandchildren (Tasks)
                    const connectedTasks = filteredTasks.filter(t => t.bet_id === b.id);
                    connectedTasks.forEach(t => activeIds.add(t.id));
                });
            }
        }

        // If hovering Bet
        if (hovered.type === 'bet') {
            const bet = filteredBets.find(b => b.id === hovered.id);
            if (bet) {
                // Show Parent Measures
                if (bet.linked_measure_ids) {
                    bet.linked_measure_ids.forEach(mid => {
                        activeIds.add(mid);
                        // Show Grandparent Outcomes
                        const measure = measures.find(m => m.id === mid);
                        if (measure?.outcome_id) activeIds.add(measure.outcome_id);
                    });
                }

                // Show Parent Outcomes (Direct Link)
                if (bet.linked_outcome_ids) {
                    bet.linked_outcome_ids.forEach(oid => activeIds.add(oid));
                }

                // Show Child Tasks
                const connectedTasks = filteredTasks.filter(t => t.bet_id === bet.id);
                connectedTasks.forEach(t => activeIds.add(t.id));
            }
        }

        // If hovering Task
        if (hovered.type === 'task') {
            const task = filteredTasks.find(t => t.id === hovered.id);
            if (task && task.bet_id) {
                // Show Parent Bet
                activeIds.add(task.bet_id);
                const bet = filteredBets.find(b => b.id === task.bet_id);

                // Show Grandparent Outcome (via Measure)
                if (bet && bet.linked_measure_ids) {
                    bet.linked_measure_ids.forEach(mid => {
                        activeIds.add(mid);
                        const measure = measures.find(m => m.id === mid);
                        if (measure?.outcome_id) activeIds.add(measure.outcome_id);
                    });
                }

                // Show Grandparent Outcome (Direct)
                if (bet && bet.linked_outcome_ids) {
                    bet.linked_outcome_ids.forEach(oid => activeIds.add(oid));
                }
            }
        }

        return { activeIds, isIdle: false };
    };

    const { activeIds, isIdle } = getActiveState();

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 p-8 font-sans animate-in fade-in duration-500 overflow-x-auto">
            {/* Header */}
            <div className="max-w-[1800px] mx-auto mb-10 px-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                            <Search className="w-8 h-8 text-blue-400" />
                            Strategy Explorer
                        </h1>
                        <p className="text-slate-400">Visualize the "Golden Thread" from Outcomes to Measures to Bets to Tasks.</p>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* OWNER FILTER */}
                        <div className="flex items-center gap-3 bg-slate-800 p-2 rounded-lg border border-slate-700">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filter By:</span>
                            <select
                                value={selectedUserId}
                                onChange={(e) => setSelectedUserId(e.target.value)}
                                className="bg-slate-900 border border-slate-600 text-white text-sm rounded px-3 py-1 focus:outline-none focus:border-blue-500"
                            >
                                <option value="all">Check All Responsible</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>
                                        {u.firstName} {u.lastName}
                                    </option>
                                ))}
                            </select>
                        </div>


                    </div>
                </div>
            </div>

            {/* Main Canvas */}
            <div ref={containerRef} className="max-w-[1800px] mx-auto relative px-8 min-w-[1200px]">

                {/* Connection Layer (SVG) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
                    <defs>
                        <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                    </defs>
                    {connections.map(conn => {
                        const isConnActive = activeIds.has(conn.sourceId) && activeIds.has(conn.targetId);
                        const isDimmed = !isIdle && !isConnActive;

                        // Bezier Curve Logic
                        const deltaX = conn.end.x - conn.start.x;
                        const c1x = conn.start.x + (deltaX * 0.5);
                        const c2x = conn.end.x - (deltaX * 0.5);
                        const pathData = `M ${conn.start.x} ${conn.start.y} C ${c1x} ${conn.start.y}, ${c2x} ${conn.end.y}, ${conn.end.x} ${conn.end.y}`;

                        return (
                            <g key={conn.id}>
                                {/* Background thick line for better visibility */}
                                <path
                                    d={pathData}
                                    fill="none"
                                    stroke={isConnActive ? "#3b82f6" : "#475569"}
                                    strokeWidth={isConnActive ? 3 : 1}
                                    strokeOpacity={isDimmed ? 0.05 : (isConnActive ? 0.8 : 0.2)}
                                    className="transition-all duration-300"
                                />
                                {/* Animated dash for active lines */}
                                {isConnActive && (
                                    <path
                                        d={pathData}
                                        fill="none"
                                        stroke="white"
                                        strokeWidth={1}
                                        strokeDasharray="8,8"
                                        className="animate-dash opacity-60"
                                    />
                                )}
                            </g>
                        );
                    })}
                </svg>

                {/* Columns Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-16 relative z-10 text-left">

                    {/* Column 1: Outcomes */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-blue-400 mb-6 flex items-center gap-2 border-b border-blue-500/30 pb-2">
                            <Target className="w-5 h-5" /> Outcomes
                        </h2>
                        {filteredOutcomes.length > 0 ? filteredOutcomes.map(item => {
                            // Find theme color
                            const theme = themes.find(t => t.id === item.theme_id);
                            // We pass themeColor as explicit style or check Card implementation
                            return (
                                <StrategyNode
                                    key={item.id}
                                    item={item}
                                    type="outcome"
                                    isActive={activeIds.has(item.id)}
                                    isDimmed={!isIdle && !activeIds.has(item.id)}
                                    onHover={handleHover}
                                    setRef={setRef}
                                    users={users}
                                    onNavigate={onNavigate}
                                    themeColor={theme?.color} // Pass theme color if needed by StrategyNode
                                />
                            );
                        }) : (
                            <p className="text-slate-500 italic">No outcomes matching filter.</p>
                        )}
                    </div>

                    {/* Column 2: Measures */}
                    <div className="space-y-6 mt-12 md:mt-0">
                        <h2 className="text-xl font-bold text-purple-400 mb-6 flex items-center gap-2 border-b border-purple-500/30 pb-2">
                            <Activity className="w-5 h-5" /> Measures
                        </h2>
                        {filteredMeasures.length > 0 ? filteredMeasures.map(item => (
                            <StrategyNode
                                key={item.id}
                                item={item}
                                type="measure"
                                isActive={activeIds.has(item.id)}
                                isDimmed={!isIdle && !activeIds.has(item.id)}
                                onHover={handleHover}
                                setRef={setRef}
                                users={users}
                                onNavigate={onNavigate}
                            />
                        )) : (
                            <p className="text-slate-500 italic">No measures matching filter.</p>
                        )}
                    </div>

                    {/* Column 3: Bets */}
                    <div className="space-y-6 mt-24 md:mt-0">
                        <h2 className="text-xl font-bold text-emerald-400 mb-6 flex items-center gap-2 border-b border-emerald-500/30 pb-2">
                            <Zap className="w-5 h-5" /> Bets
                        </h2>
                        {filteredBets.length > 0 ? filteredBets.map(item => (
                            <StrategyNode
                                key={item.id}
                                item={item}
                                type="bet"
                                isActive={activeIds.has(item.id)}
                                isDimmed={!isIdle && !activeIds.has(item.id)}
                                onHover={handleHover}
                                setRef={setRef}
                                users={users}
                                onNavigate={onNavigate}
                                theme={themes.find(t => t.id === item.theme_id)} // Pass theme object
                            />
                        )) : (
                            <p className="text-slate-500 italic">No bets matching filter.</p>
                        )}
                    </div>

                    {/* Column 4: Tasks */}
                    <div className="space-y-6 mt-36 md:mt-0">
                        <h2 className="text-xl font-bold text-amber-400 mb-6 flex items-center gap-2 border-b border-amber-500/30 pb-2">
                            <CheckSquare className="w-5 h-5" /> Tasks
                        </h2>
                        {filteredTasks.length > 0 ? filteredTasks.map(item => (
                            <StrategyNode
                                key={item.id}
                                item={item}
                                type="task"
                                isActive={activeIds.has(item.id)}
                                isDimmed={!isIdle && !activeIds.has(item.id)}
                                onHover={handleHover}
                                setRef={setRef}
                                users={users}
                                onNavigate={onNavigate}
                            />
                        )) : (
                            <p className="text-slate-500 italic">No tasks matching filter.</p>
                        )}
                    </div>

                </div>
            </div>

            <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -20;
          }
        }
        .animate-dash {
          animation: dash 1s linear infinite;
        }
      `}</style>
        </div>
    );
}

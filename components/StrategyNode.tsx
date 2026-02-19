import React from 'react';
import { Target, Activity, Zap, CheckSquare, Pencil, Calendar } from 'lucide-react';
import { User, Theme } from '../types';

interface StrategyNodeProps {
    item: any;
    type: 'outcome' | 'measure' | 'bet' | 'task';
    isActive?: boolean;
    isDimmed?: boolean;
    onHover?: (id: string | null, type: string | null) => void;
    setRef?: (id: string, el: HTMLDivElement | null) => void;
    themeColor?: string;
    theme?: Theme; // Add full theme object
    users: User[];
    onNavigate?: (id: string, tab?: string) => void;
    className?: string; // Allow custom classes
    style?: React.CSSProperties; // Allow custom styles
}

export const StrategyNode: React.FC<StrategyNodeProps> = ({
    item,
    type,
    isActive = false,
    isDimmed = false,
    onHover,
    setRef,
    themeColor,
    theme,
    users,
    onNavigate,
    className = "",
    style = {}
}) => {
    const icons = {
        outcome: <Target size={18} />,
        measure: <Activity size={18} />,
        bet: <Zap size={18} />,
        task: <CheckSquare size={18} />
    };

    const borderColors: Record<string, string> = {
        outcome: "border-l-blue-500",
        measure: "border-l-purple-500",
        bet: "border-l-emerald-500",
        task: "border-l-amber-500"
    };

    // Helper for task priority/size badge
    const getTaskBadge = (size: string) => {
        const colors = {
            S: 'bg-slate-700 text-slate-300',
            M: 'bg-blue-900/50 text-blue-200 border-blue-800',
            L: 'bg-purple-900/50 text-purple-200 border-purple-800',
            XL: 'bg-amber-900/50 text-amber-200 border-amber-800'
        };
        const colorClass = colors[size as keyof typeof colors] || colors.S;

        return (
            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border border-transparent ${colorClass}`}>
                {size}
            </span>
        );
    };

    // Use name for Measure, title for others
    const title = item.title || item.name || 'Untitled';
    const description = item.description || item.definition || '';

    // If we have a specific theme color, use it for Outcomes
    // const dynamicBorder = themeColor ? `border-l-[${themeColor}]` : borderColors[type];

    const activeClass = isActive
        ? "ring-2 ring-white shadow-[0_0_15px_rgba(255,255,255,0.3)] bg-slate-800 scale-105 z-10"
        : "bg-slate-800 hover:bg-slate-750";

    const dimClass = isDimmed ? "opacity-20 blur-[1px]" : "opacity-100";

    // Find Owner
    let ownerId: string | undefined;
    if (type === 'outcome' || type === 'bet') {
        ownerId = item.owner_user_ids?.[0];
    } else if (type === 'task') {
        ownerId = item.owner_id;
    }
    // Measures don't have explicit owners in current data model

    const owner = ownerId ? users.find((u: User) => u.id === ownerId) : null;

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card hover/click interference
        if (!onNavigate) return;

        if (type === 'bet') {
            onNavigate(item.id, 'overview');
        } else if (type === 'task') {
            // Navigate to the parent bet and switch to tasks tab
            onNavigate(item.bet_id, 'tasks');
        }
    };

    return (
        <div
            ref={(el) => setRef ? setRef(item?.id, el) : null}
            className={`relative p-4 mb-4 rounded-lg shadow-lg border-l-4 transition-all duration-300 cursor-default ${activeClass} ${dimClass} ${type === 'outcome' && themeColor ? '' : borderColors[type]} ${className}`}
            style={{
                ...(type === 'outcome' && themeColor ? { borderLeftColor: themeColor } : {}),
                ...style
            }}
            onMouseEnter={() => item?.id && onHover && onHover(item.id, type)}
            onMouseLeave={() => onHover && onHover(null, null)}
        >
            <div className="flex items-center justify-between mb-2">
                {/* Header Left */}
                <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    {icons[type]}
                    <span>{type}</span>
                </div>

                {/* Header Right */}
                <div className="flex items-center gap-2">
                    {onNavigate && (type === 'bet' || type === 'task') && (
                        <button
                            onClick={handleEdit}
                            className="text-slate-500 hover:text-white transition-colors p-1 rounded hover:bg-slate-700"
                            title="Edit"
                        >
                            <Pencil size={12} />
                        </button>
                    )}
                    {/* Consistent Owner Avatar for all types including Task */}
                    {owner && (
                        <div className="group/avatar relative">
                            {owner.avatar ? (
                                <img src={owner.avatar} alt={owner.firstName} className="w-6 h-6 rounded-full border border-slate-600 object-cover" />
                            ) : (
                                <div className="w-6 h-6 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-[10px] text-white font-bold">
                                    {owner.firstName[0]}{owner.lastName[0]}
                                </div>
                            )}
                            <div className="absolute bottom-full right-0 mb-2 hidden group-hover/avatar:block whitespace-nowrap bg-black text-white text-xs px-2 py-1 rounded shadow-lg z-50">
                                {owner.firstName} {owner.lastName}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Title Area */}
            <div className="flex items-start justify-between gap-2">
                <h3 className="text-white font-bold leading-tight mb-1 text-sm">{title}</h3>
                {type === 'task' && item.tshirt_size && getTaskBadge(item.tshirt_size)}
            </div>

            {/* Type/Theme Badges (Bets only) */}
            {type === 'bet' && (
                <div className="flex flex-wrap gap-2 mb-2 mt-1">
                    {item.bet_type && (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800/50 px-1.5 py-0.5 rounded border border-slate-700">
                            {item.bet_type}
                        </span>
                    )}
                    {theme && (() => {
                        const colorMap: Record<string, string> = {
                            blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
                            emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                            amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                            rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
                            purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
                            indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
                            cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
                        };
                        const themeClass = colorMap[theme.color] || 'text-slate-400 bg-slate-500/10 border-slate-500/20';

                        return (
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${themeClass}`}>
                                {theme.name}
                            </span>
                        );
                    })()}
                </div>
            )}

            {/* Description */}
            {/* Description */}
            {type === 'task' ? (
                <div className="mt-2 p-2 bg-slate-900/50 rounded border border-slate-800/50">
                    <p className={`text-xs line-clamp-3 leading-relaxed ${description ? 'text-slate-300' : 'text-slate-500 italic'}`}>
                        {description || 'No description provided.'}
                    </p>
                </div>
            ) : description ? (
                <p className="text-slate-500 text-xs mt-2 line-clamp-2">{description}</p>
            ) : null}

            {/* Problem Statement (Bets only) */}
            {type === 'bet' && item.problem_statement && (
                <div className="mt-2 p-2 bg-slate-900/50 rounded border border-slate-800/50">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Problem</span>
                    <p className="text-slate-300 text-xs line-clamp-3 leading-relaxed">{item.problem_statement}</p>
                </div>
            )}

            {/* Measure Target */}
            {type === 'measure' && (
                <div className="mt-3 flex flex-col gap-1 text-xs bg-slate-900/50 p-3 rounded border border-slate-800/50">
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Target</span>
                    <span className="text-purple-300 font-mono leading-relaxed">{item.target || 'N/A'}</span>
                </div>
            )}

            {/* Bet Footer */}
            {type === 'bet' && (
                <div className="mt-3 flex items-center justify-between border-t border-slate-700/50 pt-2">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${item.stage === 'Discovery' ? 'bg-purple-500' :
                            item.stage === 'Delivery' ? 'bg-blue-500' :
                                item.stage === 'Validation' ? 'bg-amber-500' :
                                    'bg-slate-500'
                            }`}></div>
                        <span className="text-[10px] font-bold uppercase tracking-wide text-slate-300">
                            {item.stage || 'Draft'}
                        </span>
                    </div>
                    {item.progress !== undefined && (
                        <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 rounded-full"
                                    style={{ width: `${item.progress}%` }}
                                ></div>
                            </div>
                            <span className="text-[10px] font-mono text-slate-500">{item.progress}%</span>
                        </div>
                    )}
                </div>
            )}

            {/* Task Footer */}
            {type === 'task' && (
                <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 w-full">
                        {item.due_date && (
                            <div className="flex items-center gap-1.5 text-slate-400">
                                <Calendar size={12} />
                                <span className="text-[10px] font-medium">{item.due_date}</span>
                            </div>
                        )}
                        {item.progress !== undefined && (
                            <div className="flex items-center gap-2 flex-grow">
                                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 rounded-full"
                                        style={{ width: `${item.progress}%` }}
                                    ></div>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 min-w-[24px] text-right">{item.progress}%</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

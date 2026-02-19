import React, { useState, useEffect } from 'react';
import { ActivityLog } from '../types';
import { subscribeToCollection } from '../services/firestoreService';
import {
    PlusCircle,
    TrendingUp,
    AlertTriangle,
    MessageSquare,
    CheckCircle,
    Activity,
    ArrowRight
} from 'lucide-react';

interface ActivityFeedProps {
    onNavigate?: (entityId: string, tab?: string) => void;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ onNavigate }) => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);

    useEffect(() => {
        const unsubscribe = subscribeToCollection('activity_logs', (data) => {
            // Sort client-side just in case, though firestore query handles it
            const sorted = (data as ActivityLog[]).sort((a, b) =>
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
            setLogs(sorted.slice(0, 20)); // Limit to most recent 20
        }, 'timestamp');

        return () => unsubscribe();
    }, []);

    const getIcon = (type: ActivityLog['type']) => {
        switch (type) {
            case 'bet_created':
                return <PlusCircle className="w-4 h-4 text-blue-400" />;
            case 'bet_updated':
                return <TrendingUp className="w-4 h-4 text-emerald-400" />;
            case 'bet_blocked':
                return <AlertTriangle className="w-4 h-4 text-rose-500" />;
            case 'outcome_updated':
                return <Activity className="w-4 h-4 text-amber-400" />;
            case 'comment_added':
                return <MessageSquare className="w-4 h-4 text-slate-400" />;
            case 'task_completed':
                return <CheckCircle className="w-4 h-4 text-purple-400" />;
            default:
                return <ArrowRight className="w-4 h-4 text-slate-500" />;
        }
    };

    const getFormatTime = (isoString: string) => {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        return date.toLocaleDateString();
    };

    const getTargetTab = (type: ActivityLog['type']) => {
        switch (type) {
            case 'comment_added': return 'discussion';
            case 'task_completed': return 'bet tasks';
            case 'bet_blocked': return 'overview'; // or risks/council
            case 'outcome_updated': return 'outcomes'; // Note: Outcomes might be separate from bets
            default: return 'updates'; // Activity/History tab
        }
    };

    if (logs.length === 0) {
        return (
            <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-800 p-6 min-h-[200px] flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-3">
                    <Activity className="w-6 h-6 text-slate-600" />
                </div>
                <p className="text-sm text-slate-400 font-medium">No recent activity.</p>
                <p className="text-xs text-slate-600 mt-1">Strategic actions you take will appear here.</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-800 p-6">
            <h3 className="font-bold text-slate-200 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                Strategic Pulse
            </h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto px-4 custom-scrollbar">
                {logs.map((log) => (
                    <div
                        key={log.id}
                        className="relative pl-6 pb-4 border-l border-slate-800 last:border-0 last:pb-0 group cursor-pointer"
                        onClick={() => onNavigate && onNavigate(log.entityId, getTargetTab(log.type))}
                    >
                        <div className="absolute -left-2 top-1 w-4 h-4 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center z-10 group-hover:border-blue-500/50 transition-colors">
                            {getIcon(log.type)}
                        </div>
                        <div className="flex justify-between items-start">
                            <div className="space-y-0.5">
                                <p className="text-xs text-slate-500 font-mono flex items-center gap-2">
                                    {getFormatTime(log.timestamp)}
                                    <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                                    <span className="text-slate-400">{log.userName}</span>
                                </p>
                                <div className="text-sm font-medium text-slate-300 group-hover:text-slate-100 transition-colors leading-snug">
                                    <span className="font-bold text-white">{log.entityTitle}</span>
                                    <span className="mx-1 text-slate-600">·</span>
                                    <span className="text-slate-400">{log.details}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActivityFeed;

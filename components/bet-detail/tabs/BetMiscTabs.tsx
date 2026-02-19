import React from 'react';
import { useBetDetail } from '../BetDetailContext';
import { ActivityLog } from '../../../types';

export const BetUpdates: React.FC = () => {
    const { bet, activityLogs } = useBetDetail();

    // Filter logs for this bet
    const filteredLogs = activityLogs
        .filter(log => log.entityId === bet.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const getIconForType = (type: ActivityLog['type']) => {
        switch (type) {
            case 'bet_created': return 'fa-plus-circle text-blue-500';
            case 'bet_updated': return 'fa-pencil-alt text-amber-500';
            case 'bet_blocked': return 'fa-ban text-rose-500';
            case 'task_completed': return 'fa-check-circle text-emerald-500';
            case 'comment_added': return 'fa-comment text-slate-400';
            default: return 'fa-history text-slate-400';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800">Activity & Decisions</h3>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{filteredLogs.length} EVENTS</span>
            </div>

            <div className="relative border-l-2 border-slate-100 ml-4 space-y-8 py-2">
                {filteredLogs.map(log => (
                    <div key={log.id} className="relative pl-8">
                        {/* Timeline Dot */}
                        <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 shrink-0 overflow-hidden ring-2 ring-white shadow-sm mt-1">
                                {log.userAvatar ? (
                                    <img src={log.userAvatar} alt={log.userName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold">
                                        {log.userName.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex-1 hover:border-blue-200 transition-colors">
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-900 text-sm">{log.userName}</span>
                                        <span className="text-xs text-slate-400">• {new Date(log.timestamp).toLocaleDateString()} at {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <i className={`fas ${getIconForType(log.type)}`}></i>
                                </div>
                                <p className="text-slate-600 text-sm">{log.details}</p>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredLogs.length === 0 && (
                    <div className="pl-8">
                        <div className="text-center py-12 bg-slate-50 border border-dashed rounded-2xl">
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <i className="fas fa-history text-slate-300"></i>
                            </div>
                            <p className="text-slate-400 italic text-sm">No activity recorded yet.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export const BetLearnings: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 transition-transform hover:rotate-12">
                <i className="fas fa-lightbulb text-2xl text-blue-500"></i>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">The Archive of Wisdom</h3>
            <p className="text-slate-500 max-w-sm text-sm leading-relaxed font-light">
                Once this bet is archived or completed, log your evidence-based learnings here to inform future strategy.
            </p>
        </div>
    );
};

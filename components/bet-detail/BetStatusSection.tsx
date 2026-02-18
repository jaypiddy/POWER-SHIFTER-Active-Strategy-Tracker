import React, { useState } from 'react';
import { BET_STAGES, TIMEBOXES } from '../../constants';
import { useBetDetail } from './BetDetailContext';

export const BetStatusSection: React.FC = () => {
    const { bet, onUpdate, canEdit, users } = useBetDetail();

    const getTimeboxLabel = (val: string) => {
        if (val === 'H1') return 'Horizon 1';
        if (val === 'H2') return 'Horizon 2';
        return val;
    };

    return (
        <div className="px-8 pb-8 pt-2 bg-white border-b border-slate-100 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                    {/* Stage Select */}
                    <div className="flex items-center gap-2 cursor-pointer group bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stage</span>
                        <select
                            disabled={!canEdit}
                            value={bet.stage}
                            onChange={(e) => onUpdate({ ...bet, stage: e.target.value as any })}
                            className="bg-transparent font-bold text-slate-700 focus:outline-none appearance-none cursor-pointer text-sm"
                        >
                            {BET_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <i className="fas fa-chevron-down text-[10px] text-slate-400 pointer-events-none"></i>
                    </div>

                    {/* Timebox Select */}
                    <div className="flex items-center gap-2 cursor-pointer group bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Timebox</span>
                        <select
                            disabled={!canEdit}
                            value={bet.timebox}
                            onChange={(e) => onUpdate({ ...bet, timebox: e.target.value as any })}
                            className="bg-transparent font-bold text-slate-700 focus:outline-none appearance-none cursor-pointer text-sm"
                        >
                            {TIMEBOXES.map(t => <option key={t} value={t}>{getTimeboxLabel(t)}</option>)}
                        </select>
                        <i className="fas fa-chevron-down text-[10px] text-slate-400 pointer-events-none"></i>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Owners */}
                    <div className="flex -space-x-2">
                        {bet.owner_user_ids.map(ownerId => {
                            const owner = users.find(u => u.id === ownerId);
                            return owner ? (
                                <div key={owner.id} className="w-8 h-8 rounded-full border-2 border-white ring-1 ring-slate-200 overflow-hidden" title={owner.firstName}>
                                    <img src={owner.avatar} className="w-full h-full object-cover" alt={owner.firstName} />
                                </div>
                            ) : null;
                        })}
                        {canEdit && (
                            <button className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors">
                                <i className="fas fa-plus text-xs"></i>
                            </button>
                        )}
                    </div>

                    {/* Progress */}
                    <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                        <span className="text-sm font-bold text-slate-700">{bet.progress}%</span>
                        <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${bet.progress}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

import React, { useState } from 'react';
import { BET_STAGES, TIMEBOXES } from '../../constants';
import { useBetDetail } from './BetDetailContext';

export const BetStatusSection: React.FC = () => {
    const { bet, onUpdate, canEdit, users, outcomes, measures } = useBetDetail();
    const [showUserPicker, setShowUserPicker] = useState(false);
    const [showOwnerPicker, setShowOwnerPicker] = useState(false);
    const supportSponsor = bet.support_sponsor_id ? users.find(u => u.id === bet.support_sponsor_id) : null;

    const availableUsers = users.filter(u =>
        !bet.owner_user_ids.includes(u.id) &&
        u.id !== bet.support_sponsor_id
    );

    const handleAddSponsor = (userId: string) => {
        onUpdate({ ...bet, support_sponsor_id: userId });
        setShowUserPicker(false);
    };

    const handleRemoveSponsor = () => {
        onUpdate({ ...bet, support_sponsor_id: undefined });
    };

    const getTimeboxLabel = (val: string) => {
        if (val === 'H1') return 'Horizon 1';
        if (val === 'H2') return 'Horizon 2';
        return val;
    };

    return (
        <div className="px-8 pb-8 pt-2 bg-slate-900 border-b border-slate-800 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                    {/* Stage Select */}
                    <div className="flex items-center gap-2 cursor-pointer group bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stage</span>
                        <select
                            disabled={!canEdit}
                            value={bet.stage}
                            onChange={(e) => onUpdate({ ...bet, stage: e.target.value as any })}
                            className="bg-transparent font-bold text-slate-200 focus:outline-none appearance-none cursor-pointer text-sm"
                        >
                            {BET_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <i className="fas fa-chevron-down text-[10px] text-slate-400 pointer-events-none"></i>
                    </div>

                    {/* Timebox Select */}
                    <div className="flex items-center gap-2 cursor-pointer group bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Timebox</span>
                        <select
                            disabled={!canEdit}
                            value={bet.timebox}
                            onChange={(e) => onUpdate({ ...bet, timebox: e.target.value as any })}
                            className="bg-transparent font-bold text-slate-200 focus:outline-none appearance-none cursor-pointer text-sm"
                        >
                            {TIMEBOXES.map(t => <option key={t} value={t}>{getTimeboxLabel(t)}</option>)}
                        </select>
                        <i className="fas fa-chevron-down text-[10px] text-slate-400 pointer-events-none"></i>
                    </div>

                    {/* Measure Select (Replaces Outcome) */}
                    <div className="flex items-center gap-2 cursor-pointer group bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Measure</span>
                        <select
                            disabled={!canEdit}
                            value={bet.linked_measure_ids?.[0] || ''}
                            onChange={(e) => {
                                const val = e.target.value;
                                onUpdate({ ...bet, linked_measure_ids: val ? [val] : [] });
                            }}
                            className="bg-transparent font-bold text-slate-200 focus:outline-none appearance-none cursor-pointer text-sm max-w-[150px] truncate"
                        >
                            <option value="">No Measure</option>
                            {measures.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                        <i className="fas fa-chevron-down text-[10px] text-slate-400 pointer-events-none"></i>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Owners & Support */}
                    <div className="flex items-center gap-2">
                        <div className="flex -space-x-2 items-center">

                            {bet.owner_user_ids.map(ownerId => {
                                const owner = users.find(u => u.id === ownerId);
                                return owner ? (
                                    <div key={owner.id} className="relative group/owner flex items-center">
                                        <button
                                            disabled={!canEdit}
                                            onClick={() => setShowOwnerPicker(!showOwnerPicker)}
                                            className="w-8 h-8 rounded-full border-2 border-slate-900 ring-1 ring-slate-700 overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all hover:ring-blue-400 shrink-0"
                                            title={`Owner: ${owner.firstName} (Click to reassign)`}
                                        >
                                            <img src={owner.avatar} className="w-full h-full object-cover" alt={owner.firstName} />
                                        </button>

                                        {/* Owner Picker Dropdown */}
                                        {showOwnerPicker && (
                                            <div className="absolute top-full left-0 mt-2 w-48 bg-slate-900 rounded-xl shadow-xl border border-slate-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                                                <div className="px-3 py-2 bg-slate-950 border-b border-slate-800">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reassign Owner</p>
                                                </div>
                                                <div className="max-h-48 overflow-y-auto p-1 scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600">
                                                    {users.filter(u => u.id !== owner.id).map(u => (
                                                        <button
                                                            key={u.id}
                                                            onClick={() => {
                                                                onUpdate({ ...bet, owner_user_ids: [u.id] });
                                                                setShowOwnerPicker(false);
                                                            }}
                                                            className="w-full flex items-center gap-2 p-2 hover:bg-slate-800 rounded-lg transition-colors text-left"
                                                        >
                                                            <img src={u.avatar} className="w-5 h-5 rounded-full" alt="" />
                                                            <span className="text-xs font-bold text-slate-200 truncate">{u.firstName} {u.lastName}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : null;
                            })}
                        </div>

                        {/* Support Sponsor */}
                        {supportSponsor && (
                            <div className="relative group flex items-center">
                                <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-600 ring-1 ring-slate-700 overflow-hidden ml-1 shrink-0" title={`Support: ${supportSponsor.firstName}`}>
                                    <img src={supportSponsor.avatar} className="w-full h-full object-cover opacity-90" alt={supportSponsor.firstName} />
                                </div>
                                {canEdit && (
                                    <button
                                        aria-label="Remove Support Sponsor"
                                        className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Add Support Button */}
                        {canEdit && !supportSponsor && (
                            <div className="relative flex items-center">
                                <button
                                    aria-label="Add Support Sponsor"
                                    className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-slate-400 hover:text-blue-400 hover:bg-slate-700 transition-colors shrink-0"
                                    title="Add Support Sponsor"
                                >
                                    <i className="fas fa-plus text-xs"></i>
                                </button>

                                {showUserPicker && (
                                    <div className="absolute top-full right-0 mt-2 w-48 bg-slate-900 rounded-xl shadow-xl border border-slate-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                                        <div className="px-3 py-2 bg-slate-950 border-b border-slate-800">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Support</p>
                                        </div>
                                        <div className="max-h-48 overflow-y-auto p-1 scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600">
                                            {availableUsers.length > 0 ? availableUsers.map(u => (
                                                <button
                                                    key={u.id}
                                                    onClick={() => handleAddSponsor(u.id)}
                                                    className="w-full flex items-center gap-2 p-2 hover:bg-slate-800 rounded-lg transition-colors text-left"
                                                >
                                                    <img src={u.avatar} className="w-5 h-5 rounded-full" alt="" />
                                                    <span className="text-xs font-bold text-slate-200 truncate">{u.firstName} {u.lastName}</span>
                                                </button>
                                            )) : (
                                                <p className="text-xs text-slate-400 p-2 text-center italic">No users available</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Progress */}
                    <div className="flex items-center gap-3 pl-4 border-l border-slate-700">
                        <span className="text-sm font-bold text-slate-200">{bet.progress}%</span>
                        <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${bet.progress}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Click outside listener for picker could be added here, 
                but for simplicity we just rely on selecting or clicking toggle again */}
            {(showUserPicker || showOwnerPicker) && (
                <div className="fixed inset-0 z-40 bg-transparent" onClick={() => { setShowUserPicker(false); setShowOwnerPicker(false); }}></div>
            )}
        </div>
    );
};

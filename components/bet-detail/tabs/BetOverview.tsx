import React, { useState } from 'react';
import { useBetDetail } from '../BetDetailContext';
import { tightenHypothesis } from '../../../services/geminiService';

export const BetOverview: React.FC = () => {
    const { bet, onUpdate, canEdit } = useBetDetail();
    const [localBet, setLocalBet] = useState(bet);
    const [isTightening, setIsTightening] = useState(false);

    // Sync local state when prop changes (scrolling through bets or external updates)
    React.useEffect(() => {
        setLocalBet(bet);
    }, [bet.id, bet.updated_at]);

    const handleChange = (field: keyof typeof bet, value: any, commit = false) => {
        setLocalBet(prev => {
            const updated = { ...prev, [field]: value };
            if (commit) {
                onUpdate(updated);
            }
            return updated;
        });
    };

    const handleBlur = () => {
        if (JSON.stringify(localBet) !== JSON.stringify(bet)) {
            onUpdate(localBet);
        }
    };

    const handleTighten = async () => {
        if (!canEdit) return;
        setIsTightening(true);
        try {
            const tightened = await tightenHypothesis(bet.problem_statement, bet.hypothesis);
            if (tightened) {
                onUpdate({ ...bet, hypothesis: tightened });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsTightening(false);
        }
    };

    return (
        <div className="space-y-6">
            <section className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Strategic Timeline</label>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Intentional Start</p>
                        <input
                            type="date"
                            disabled={!canEdit}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            value={localBet.start_date || ''}
                            onChange={(e) => handleChange('start_date', e.target.value, true)}
                        />
                    </div>
                    <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Target Completion</p>
                        <input
                            type="date"
                            disabled={!canEdit}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            value={localBet.completion_date || ''}
                            onChange={(e) => handleChange('completion_date', e.target.value, true)}
                        />
                    </div>
                </div>
            </section>

            <section>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">The Problem Statement</label>
                <textarea
                    disabled={!canEdit}
                    value={localBet.problem_statement}
                    onChange={(e) => handleChange('problem_statement', e.target.value)}
                    onBlur={handleBlur}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-4 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed font-light placeholder:text-slate-600"
                    rows={4}
                />
            </section>

            <section>
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">The Hypothesis</label>
                    {canEdit && (
                        <button
                            onClick={handleTighten}
                            disabled={isTightening}
                            className="text-[10px] font-bold text-blue-400 uppercase flex items-center gap-1.5 bg-blue-900/30 px-2 py-1 rounded hover:bg-blue-900/50 transition-colors border border-blue-900/50"
                        >
                            <i className={`fas fa-wand-magic-sparkles ${isTightening ? 'animate-spin' : ''}`}></i>
                            Tighten with GPT
                        </button>
                    )}
                </div>
                <textarea
                    disabled={!canEdit}
                    value={localBet.hypothesis}
                    onChange={(e) => handleChange('hypothesis', e.target.value)}
                    onBlur={handleBlur}
                    className="w-full bg-blue-900/10 border border-blue-900/30 rounded-lg p-4 text-sm text-slate-200 font-medium focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"
                    rows={4}
                />
            </section>
        </div>
    );
};

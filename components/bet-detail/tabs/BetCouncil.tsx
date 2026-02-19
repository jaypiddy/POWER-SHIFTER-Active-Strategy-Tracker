import React from 'react';
import StrategicCouncil from '../../StrategicCouncil';
import { useBetDetail } from '../BetDetailContext';

export const BetCouncil: React.FC = () => {
    const { bet, themes, outcomes, canvas } = useBetDetail();

    const theme = themes.find(t => t.id === bet.theme_id);
    const linkedOutcomes = (outcomes || []).filter(o => bet.linked_outcome_ids?.includes(o.id));

    return (
        <div className="space-y-6">
            <div className="bg-blue-900/20 p-6 rounded-2xl border border-blue-900/50 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-600/80 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-900/40">
                    <i className="fas fa-brain"></i>
                </div>
                <div>
                    <h3 className="font-bold text-blue-100">Strategic Coaching Session</h3>
                    <p className="text-sm text-blue-300 leading-relaxed font-light">
                        The Strategic Council uses Gemini to analyze your bet. It persists throughout your session in this modal.
                    </p>
                </div>
            </div>
            <StrategicCouncil
                bet={bet}
                theme={theme}
                outcomes={linkedOutcomes}
                canvas={canvas}
            />
        </div>
    );
};

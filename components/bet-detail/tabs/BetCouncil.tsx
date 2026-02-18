import React from 'react';
import StrategicCouncil from '../../StrategicCouncil';
import { useBetDetail } from '../BetDetailContext';

export const BetCouncil: React.FC = () => {
    const { bet } = useBetDetail();

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0">
                    <i className="fas fa-brain"></i>
                </div>
                <div>
                    <h3 className="font-bold text-blue-900">Strategic Coaching Session</h3>
                    <p className="text-sm text-blue-700 leading-relaxed font-light">
                        The Strategic Council uses Gemini to analyze your bet. It persists throughout your session in this modal.
                    </p>
                </div>
            </div>
            <StrategicCouncil bet={bet} />
        </div>
    );
};

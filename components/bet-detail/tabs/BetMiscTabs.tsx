import React from 'react';

export const BetUpdates: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800">Activity & Decisions</h3>
            </div>
            <div className="text-center py-20 bg-slate-50 border border-dashed rounded-2xl text-slate-400 italic font-light">
                History logs are generated automatically from session snapshots.
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

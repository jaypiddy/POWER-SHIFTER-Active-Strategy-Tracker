import React from 'react';
import { useBetDetail } from './BetDetailContext';

export const BetTabs: React.FC = () => {
    const { activeTab, setActiveTab } = useBetDetail();
    const tabs = ['Overview', 'Bet Tasks', 'Council', 'Updates', 'Discussion', 'Learnings'];

    return (
        <nav className="flex px-8 border-b border-slate-800 bg-slate-900 overflow-x-auto no-scrollbar shadow-sm">
            {tabs.map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab.toLowerCase())}
                    className={`px-4 py-4 text-sm font-bold transition-colors border-b-2 -mb-px whitespace-nowrap ${activeTab === tab.toLowerCase() ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'
                        }`}
                >
                    {tab === 'Council' ? (
                        <span className="flex items-center gap-2">
                            <i className="fas fa-gavel text-[10px]"></i>
                            Council
                        </span>
                    ) : tab}
                </button>
            ))}
        </nav>
    );
};

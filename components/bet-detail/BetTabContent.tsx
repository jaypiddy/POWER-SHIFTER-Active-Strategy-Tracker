import React from 'react';
import { useBetDetail } from './BetDetailContext';
import { BetOverview } from './tabs/BetOverview';
import { BetTasks } from './tabs/BetTasks';
import { BetCouncil } from './tabs/BetCouncil';
import { BetDiscussion } from './tabs/BetDiscussion';
import { BetUpdates, BetLearnings } from './tabs/BetMiscTabs';

export const BetTabContent: React.FC = () => {
    const { activeTab } = useBetDetail();

    return (
        <div className="p-8 space-y-8">
            <div className={activeTab === 'overview' ? 'block' : 'hidden'}>
                <BetOverview />
            </div>
            <div className={activeTab === 'bet tasks' ? 'block' : 'hidden'}>
                <BetTasks />
            </div>
            <div className={activeTab === 'council' ? 'block' : 'hidden'}>
                <BetCouncil />
            </div>
            <div className={activeTab === 'updates' ? 'block' : 'hidden'}>
                <BetUpdates />
            </div>
            <div className={activeTab === 'discussion' ? 'block' : 'hidden'}>
                <BetDiscussion />
            </div>
            <div className={activeTab === 'learnings' ? 'block' : 'hidden'}>
                <BetLearnings />
            </div>
        </div>
    );
};

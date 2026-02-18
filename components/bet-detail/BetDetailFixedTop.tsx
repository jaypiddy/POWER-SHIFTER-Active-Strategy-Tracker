import React from 'react';
import { BetDetailHeader } from './BetDetailHeader';
import { BetStatusSection } from './BetStatusSection';
import { BetTabs } from './BetTabs';

export const BetDetailFixedTop: React.FC = () => {
    return (
        <div className="bg-white z-10">
            <BetDetailHeader />
            <BetStatusSection />
            <BetTabs />
        </div>
    );
};

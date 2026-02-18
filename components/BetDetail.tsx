import React, { useState } from 'react';
import { Bet, User, Comment, BetAction, Theme } from '../types';
import { BetDetailProvider } from './bet-detail/BetDetailContext';
import { BetDetailFixedTop } from './bet-detail/BetDetailFixedTop';
import { BetTabContent } from './bet-detail/BetTabContent';

interface BetDetailProps {
  bet: Bet;
  onClose: () => void;
  onUpdate: (bet: Bet) => void;
  onDelete: (id: string) => void;
  onArchive: (bet: Bet) => void;
  onSaveTask: (task: BetAction) => void;
  onDeleteTask: (taskId: string) => void;
  currentUser: User;
  comments: Comment[];
  onAddComment: (body: string) => void;
  users?: User[];
  themes: Theme[];
}

const BetDetail: React.FC<BetDetailProps> = (props) => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <BetDetailProvider {...props} users={props.users || []} activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end">
        <div className="w-full max-w-3xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 overscroll-none overflow-hidden">

          <BetDetailFixedTop />

          <div className="flex-1 overflow-y-auto no-scrollbar">
            <BetTabContent />
          </div>

        </div>
      </div>
    </BetDetailProvider>
  );
};

export default BetDetail;

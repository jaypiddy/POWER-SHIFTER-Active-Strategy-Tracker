import React, { useState, useEffect } from 'react';
import { BetDetailProvider } from './bet-detail/BetDetailContext';
import { BetDetailFixedTop } from './bet-detail/BetDetailFixedTop';
import { BetTabContent } from './bet-detail/BetTabContent';
import { Bet, User, Comment, BetAction, Theme, Outcome1Y, Canvas, ActivityLog, Measure } from '../types';

export interface BetDetailProps {
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
  onUpdateComment: (comment: Comment) => void;
  onDeleteComment: (commentId: string) => void;
  users: User[];
  themes: Theme[];
  outcomes: Outcome1Y[];
  measures: Measure[]; // Add measures prop
  canvas: Canvas;
  initialFocusTaskId?: string;
  activityLogs: ActivityLog[];
  initialActiveTab?: string;
}

const BetDetail: React.FC<BetDetailProps> = (props) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Auto-switch to tasks tab if deep linking to a task
  useEffect(() => {
    if (props.initialFocusTaskId) {
      setActiveTab('bet tasks');
    } else if (props.initialActiveTab) {
      setActiveTab(props.initialActiveTab);
    }
  }, [props.initialFocusTaskId, props.initialActiveTab]);

  return (
    <BetDetailProvider {...props} activeTab={activeTab} setActiveTab={setActiveTab}>
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end"
        onClick={props.onClose}
      >
        <div
          className="w-full max-w-3xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 overscroll-none overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >

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

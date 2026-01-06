
import React, { useState, useEffect } from 'react';
import { Bet, User, Comment, BetAction, ActionProgress } from '../types';
import { THEMES, BET_STAGES, TIMEBOXES } from '../constants';
import { tightenHypothesis } from '../services/geminiService';
import CommentList from './CommentList';
import StrategicCouncil from './StrategicCouncil';

interface BetDetailProps {
  bet: Bet;
  onClose: () => void;
  onUpdate: (bet: Bet) => void;
  currentUser: User;
  comments: Comment[];
  onAddComment: (body: string) => void;
  users?: User[]; 
}

const BetDetail: React.FC<BetDetailProps> = ({ bet, onClose, onUpdate, currentUser, comments, onAddComment, users = [] }) => {
  const [activeBet, setActiveBet] = useState(bet);
  const [activeTab, setActiveTab] = useState('overview');
  const [isTightening, setIsTightening] = useState(false);
  const [editingAction, setEditingAction] = useState<BetAction | null>(null);

  const canEdit = currentUser.role === 'Admin' || currentUser.role === 'Editor';
  const theme = THEMES.find(t => t.id === activeBet.theme_id);

  useEffect(() => {
    if (activeBet.actions.length > 0) {
      const totalProgress = activeBet.actions.reduce((acc, curr) => acc + curr.progress, 0);
      const averageProgress = Math.round(totalProgress / activeBet.actions.length);
      if (averageProgress !== activeBet.progress) {
        setActiveBet(prev => ({ ...prev, progress: averageProgress }));
      }
    } else {
      if (activeBet.progress !== 0) {
        setActiveBet(prev => ({ ...prev, progress: 0 }));
      }
    }
  }, [activeBet.actions]);

  const handleTighten = async () => {
    if (!canEdit) return;
    setIsTightening(true);
    try {
      const tightened = await tightenHypothesis(activeBet.problem_statement, activeBet.hypothesis);
      if (tightened) {
        setActiveBet({ ...activeBet, hypothesis: tightened });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTightening(false);
    }
  };

  const getTimeboxLabel = (val: string) => {
    if (val === 'H1') return 'Horizon 1';
    if (val === 'H2') return 'Horizon 2';
    return val;
  };

  const handleUpdateAction = (id: string, updates: Partial<BetAction>) => {
    const newActions = activeBet.actions.map(a => a.id === id ? { ...a, ...updates } : a);
    setActiveBet({ ...activeBet, actions: newActions });
    if (editingAction && editingAction.id === id) {
      setEditingAction({ ...editingAction, ...updates });
    }
  };

  const handleAddAction = () => {
    const newAction: BetAction = {
      id: `a-${Date.now()}`,
      title: 'New Strategic Task',
      description: '',
      tshirt_size: 'M',
      progress: 0,
      start_date: new Date().toISOString().split('T')[0],
      due_date: new Date().toISOString().split('T')[0]
    };
    setActiveBet(prev => ({ ...prev, actions: [...prev.actions, newAction] }));
    setEditingAction(newAction);
  };

  const handleRemoveAction = (id: string) => {
    if (window.confirm('Remove this strategic task?')) {
      setActiveBet(prev => ({ ...prev, actions: prev.actions.filter(a => a.id !== id) }));
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end">
      <div className="w-full max-w-3xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Screenshot-Matched Header */}
        <header className="px-8 pt-8 pb-6 border-b border-slate-100 bg-white relative">
          <button 
            onClick={onClose} 
            className="absolute left-2 top-8 p-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
          
          <div className="flex justify-between items-start pl-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-widest`}>
                  {theme?.name || 'Theme'}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                  {activeBet.bet_type}
                </span>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 leading-tight">
                {activeBet.title}
              </h2>
            </div>
            
            <button 
              onClick={() => onUpdate(activeBet)}
              className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-900/20 transition-all active:scale-95"
            >
              Save Changes
            </button>
          </div>
        </header>

        {/* Status Bar - Matched to Screenshot */}
        <div className="px-8 py-3 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
           <div className="flex items-center gap-8">
              {/* Stage Selection */}
              <div className="flex items-center gap-2 cursor-pointer group">
                <select 
                  disabled={!canEdit}
                  value={activeBet.stage} 
                  onChange={(e) => setActiveBet({...activeBet, stage: e.target.value as any})}
                  className="bg-transparent font-bold text-slate-700 focus:outline-none appearance-none cursor-pointer pr-4"
                >
                  {BET_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <i className="fas fa-chevron-down text-[10px] text-slate-400 -ml-3 pointer-events-none"></i>
              </div>

              {/* Progress Bar */}
              <div className="flex items-center gap-4">
                 <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${activeBet.progress}%` }}></div>
                 </div>
                 <span className="text-sm font-bold text-slate-700">{activeBet.progress}%</span>
              </div>

              {/* Horizon Selection */}
              <div className="flex items-center gap-2 cursor-pointer group border-l border-slate-200 pl-8">
                <select 
                   disabled={!canEdit}
                   value={activeBet.timebox}
                   onChange={(e) => setActiveBet({...activeBet, timebox: e.target.value as any})}
                   className="bg-transparent font-bold text-slate-700 focus:outline-none appearance-none cursor-pointer pr-4"
                >
                   {TIMEBOXES.map(t => <option key={t} value={t}>{getTimeboxLabel(t)}</option>)}
                </select>
                <i className="fas fa-chevron-down text-[10px] text-slate-400 -ml-3 pointer-events-none"></i>
              </div>
           </div>

           {/* Owner Section - Fixed Icons & Names Below */}
           <div className="flex gap-4">
              {activeBet.owner_user_ids.map(ownerId => {
                const owner = users.find(u => u.id === ownerId);
                return owner ? (
                  <div key={owner.id} className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full border-2 border-white ring-1 ring-slate-200 overflow-hidden mb-1">
                      <img src={owner.avatar} className="w-full h-full object-cover" alt={owner.firstName} />
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{owner.firstName}</span>
                  </div>
                ) : null;
              })}
           </div>
        </div>

        {/* Content Tabs */}
        <div className="flex-1 overflow-y-auto">
          <nav className="flex px-8 border-b border-slate-100 bg-white sticky top-0 z-10 overflow-x-auto no-scrollbar">
            {['Overview', 'Bet Tasks', 'Council', 'Updates', 'Discussion', 'Learnings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`px-4 py-4 text-sm font-bold transition-colors border-b-2 -mb-px whitespace-nowrap ${
                  activeTab === tab.toLowerCase() ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab === 'council' ? (
                  <span className="flex items-center gap-2">
                     <i className="fas fa-gavel text-[10px]"></i>
                     Council
                  </span>
                ) : tab}
              </button>
            ))}
          </nav>

          <div className="p-8 space-y-8">
            {/* Conditional Visibility Rendering for persistence */}
            <div className={activeTab === 'overview' ? 'block' : 'hidden'}>
              <div className="space-y-6">
                <section className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Strategic Timeline</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Intentional Start</p>
                      <input 
                        type="date"
                        disabled={!canEdit}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                        value={activeBet.start_date || ''}
                        onChange={(e) => setActiveBet({...activeBet, start_date: e.target.value})}
                      />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Target Completion</p>
                      <input 
                        type="date"
                        disabled={!canEdit}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                        value={activeBet.completion_date || ''}
                        onChange={(e) => setActiveBet({...activeBet, completion_date: e.target.value})}
                      />
                    </div>
                  </div>
                </section>

                <section>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">The Problem Statement</label>
                  <textarea 
                    disabled={!canEdit}
                    value={activeBet.problem_statement}
                    onChange={(e) => setActiveBet({...activeBet, problem_statement: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed font-light"
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
                        className="text-[10px] font-bold text-blue-600 uppercase flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                      >
                        <i className={`fas fa-wand-magic-sparkles ${isTightening ? 'animate-spin' : ''}`}></i>
                        Tighten with GPT
                      </button>
                    )}
                  </div>
                  <textarea 
                    disabled={!canEdit}
                    value={activeBet.hypothesis}
                    onChange={(e) => setActiveBet({...activeBet, hypothesis: e.target.value})}
                    className="w-full bg-blue-50/30 border border-blue-100 rounded-lg p-4 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"
                    rows={4}
                  />
                </section>
              </div>
            </div>

            <div className={activeTab === 'bet tasks' ? 'block' : 'hidden'}>
               <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Bet Tasks</h3>
                    {canEdit && (
                      <button 
                        onClick={handleAddAction}
                        className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors shadow-sm"
                      >
                        <i className="fas fa-plus mr-1.5"></i> Add Task
                      </button>
                    )}
                 </div>
                 <div className="space-y-4">
                    {activeBet.actions.map((action) => {
                      const assignee = users.find(u => u.id === action.owner_id);
                      return (
                        <div key={action.id} className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4 transition-all hover:border-blue-200 shadow-sm relative group">
                          <div className="flex justify-between items-start gap-4">
                             <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                   <p className="font-bold text-slate-800 truncate">{action.title}</p>
                                   <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 rounded">{action.tshirt_size}</span>
                                </div>
                                <p className="text-xs text-slate-500 font-light line-clamp-1 mb-3">{action.description || 'No description provided.'}</p>
                                <div className="flex items-center gap-4">
                                   <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase">
                                      <i className="far fa-calendar"></i>
                                      <span>{action.due_date || 'No date'}</span>
                                   </div>
                                   {assignee && (
                                     <div className="flex items-center gap-1">
                                        <img src={assignee.avatar} className="w-4 h-4 rounded-full" alt="" />
                                        <span className="text-[10px] font-bold text-slate-600">{assignee.firstName}</span>
                                     </div>
                                   )}
                                </div>
                             </div>
                             <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                               {canEdit && (
                                 <button onClick={() => setEditingAction(action)} className="text-slate-400 hover:text-blue-600 p-2 transition-colors">
                                    <i className="fas fa-pen text-sm"></i>
                                 </button>
                               )}
                               {canEdit && (
                                 <button onClick={() => handleRemoveAction(action.id)} className="text-slate-300 hover:text-rose-500 transition-colors p-2">
                                    <i className="fas fa-trash-alt text-sm"></i>
                                 </button>
                               )}
                             </div>
                          </div>
                        </div>
                      );
                    })}
                 </div>
               </div>
            </div>

            {/* Persistent Council Memory - Always mounted but hidden if not active */}
            <div className={activeTab === 'council' ? 'block' : 'hidden'}>
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
                <StrategicCouncil bet={activeBet} />
              </div>
            </div>

            <div className={activeTab === 'updates' ? 'block' : 'hidden'}>
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-800">Activity & Decisions</h3>
                </div>
                <div className="text-center py-20 bg-slate-50 border border-dashed rounded-2xl text-slate-400 italic font-light">
                   History logs are generated automatically from session snapshots.
                </div>
              </div>
            </div>

            <div className={activeTab === 'discussion' ? 'block' : 'hidden'}>
              <CommentList 
                comments={comments}
                entityId={bet.id}
                entityType="Bet"
                currentUser={currentUser}
                onAddComment={onAddComment}
              />
            </div>

            <div className={activeTab === 'learnings' ? 'block' : 'hidden'}>
              <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 transition-transform hover:rotate-12">
                   <i className="fas fa-lightbulb text-2xl text-blue-500"></i>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">The Archive of Wisdom</h3>
                <p className="text-slate-500 max-w-sm text-sm leading-relaxed font-light">
                  Once this bet is archived or completed, log your evidence-based learnings here to inform future strategy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task Edit Modal */}
      {editingAction && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
           <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <header className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                 <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Edit Strategic Task</h3>
                 <button onClick={() => setEditingAction(null)} className="text-slate-400 hover:text-slate-600">
                    <i className="fas fa-times"></i>
                 </button>
              </header>
              <div className="p-8 space-y-6">
                 <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Task Title</label>
                    <input 
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800"
                      value={editingAction.title}
                      onChange={(e) => handleUpdateAction(editingAction.id, { title: e.target.value })}
                    />
                 </div>
                 <div className="pt-4">
                    <button 
                      onClick={() => setEditingAction(null)}
                      className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all"
                    >
                       Done Editing
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default BetDetail;

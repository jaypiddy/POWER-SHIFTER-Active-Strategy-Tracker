
import React, { useState, useEffect } from 'react';
import { Bet, User, Comment, BetAction, ActionProgress, Theme } from '../types';
import { BET_STAGES, TIMEBOXES } from '../constants';
import { tightenHypothesis } from '../services/geminiService';
import CommentList from './CommentList';
import StrategicCouncil from './StrategicCouncil';

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

const BetDetail: React.FC<BetDetailProps> = ({ bet, onClose, onUpdate, onDelete, onArchive, onSaveTask, onDeleteTask, currentUser, comments, onAddComment, users = [], themes }) => {
  const [activeBet, setActiveBet] = useState(bet);
  const [activeTab, setActiveTab] = useState('overview');
  const [isTightening, setIsTightening] = useState(false);
  const [editingAction, setEditingAction] = useState<BetAction | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const canEdit = currentUser.role === 'Admin' || currentUser.role === 'Editor';
  const theme = themes.find(t => t.id === activeBet.theme_id);
  const isArchived = activeBet.stage === 'Archived';

  // Sync state if prop changes (e.g., from Firestore subscription)
  useEffect(() => {
    setActiveBet(bet);
  }, [bet]);

  // Calculate overall progress based on task cumulative percentages
  useEffect(() => {
    if (activeBet.actions.length > 0) {
      const totalProgress = activeBet.actions.reduce((acc, curr) => acc + curr.progress, 0);
      const averageProgress = Math.round(totalProgress / activeBet.actions.length);
      if (averageProgress !== activeBet.progress) {
        onUpdate({ ...activeBet, progress: averageProgress });
      }
    } else {
      if (activeBet.progress !== 0) {
        onUpdate({ ...activeBet, progress: 0 });
      }
    }
  }, [activeBet.actions.map(a => a.progress).join(',')]);

  const handleTighten = async () => {
    if (!canEdit) return;
    setIsTightening(true);
    try {
      const tightened = await tightenHypothesis(activeBet.problem_statement, activeBet.hypothesis);
      if (tightened) {
        onUpdate({ ...activeBet, hypothesis: tightened });
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

  const handleAddAction = () => {
    const newAction: BetAction = {
      id: `a-${Date.now()}`,
      bet_id: activeBet.id,
      title: 'New Strategic Task',
      description: '',
      tshirt_size: 'M',
      progress: 0,
      start_date: new Date().toISOString().split('T')[0],
      due_date: new Date().toISOString().split('T')[0]
    };
    // Don't save immediately, just open the editor with this draft
    setEditingAction(newAction);
  };

  const handleUpdateActionLocal = (updates: Partial<BetAction>) => {
    if (!editingAction) return;
    setEditingAction({ ...editingAction, ...updates });
  };

  const handleDoneEditing = () => {
    if (editingAction) {
      onSaveTask(editingAction);
      setEditingAction(null);
    }
  };

  const handleRemoveAction = (id: string) => {
    if (window.confirm('Remove this strategic task?')) {
      onDeleteTask(id);
    }
  };

  const progressSteps: ActionProgress[] = [0, 25, 50, 75, 100];

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end">
      <div className="w-full max-w-3xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
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
                <span className={`px-2 py-1 rounded bg-${theme?.color || 'blue'}-50 text-${theme?.color || 'blue'}-600 text-[10px] font-bold uppercase tracking-widest`}>
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
            
            <div className="flex items-center gap-3">
              {canEdit && (
                <>
                  {!isArchived && (
                    <button 
                      onClick={() => onArchive(activeBet)}
                      className="p-3 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                      title="Archive Bet"
                    >
                      <i className="fas fa-box-archive"></i>
                    </button>
                  )}
                  <button 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    title="Delete Permanently"
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </>
              )}
              <button 
                onClick={() => onUpdate(activeBet)}
                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-900/20 transition-all active:scale-95"
              >
                Save Meta Changes
              </button>
            </div>
          </div>
        </header>

        {/* Status Bar */}
        <div className="px-8 py-3 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
           <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 cursor-pointer group">
                <select 
                  disabled={!canEdit}
                  value={activeBet.stage} 
                  onChange={(e) => onUpdate({...activeBet, stage: e.target.value as any})}
                  className="bg-transparent font-bold text-slate-700 focus:outline-none appearance-none cursor-pointer pr-4"
                >
                  {BET_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <i className="fas fa-chevron-down text-[10px] text-slate-400 -ml-3 pointer-events-none"></i>
              </div>

              <div className="flex items-center gap-4">
                 <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${activeBet.progress}%` }}></div>
                 </div>
                 <span className="text-sm font-bold text-slate-700">{activeBet.progress}%</span>
              </div>

              <div className="flex items-center gap-2 cursor-pointer group border-l border-slate-200 pl-8">
                <select 
                   disabled={!canEdit}
                   value={activeBet.timebox}
                   onChange={(e) => onUpdate({...activeBet, timebox: e.target.value as any})}
                   className="bg-transparent font-bold text-slate-700 focus:outline-none appearance-none cursor-pointer pr-4"
                >
                   {TIMEBOXES.map(t => <option key={t} value={t}>{getTimeboxLabel(t)}</option>)}
                </select>
                <i className="fas fa-chevron-down text-[10px] text-slate-400 -ml-3 pointer-events-none"></i>
              </div>
           </div>

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
        <div className="flex-1 overflow-y-auto no-scrollbar">
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
                        onChange={(e) => onUpdate({...activeBet, start_date: e.target.value})}
                      />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Target Completion</p>
                      <input 
                        type="date"
                        disabled={!canEdit}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                        value={activeBet.completion_date || ''}
                        onChange={(e) => onUpdate({...activeBet, completion_date: e.target.value})}
                      />
                    </div>
                  </div>
                </section>

                <section>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">The Problem Statement</label>
                  <textarea 
                    disabled={!canEdit}
                    value={activeBet.problem_statement}
                    onChange={(e) => onUpdate({...activeBet, problem_statement: e.target.value})}
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
                    onChange={(e) => onUpdate({...activeBet, hypothesis: e.target.value})}
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
                                <div className="flex items-center gap-6">
                                   <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase">
                                      <i className="far fa-calendar"></i>
                                      <span>{action.due_date || 'No date'}</span>
                                   </div>
                                   <div className="flex-1 max-w-[100px] flex items-center gap-2">
                                      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500" style={{ width: `${action.progress}%` }}></div>
                                      </div>
                                      <span className="text-[10px] font-bold text-slate-500">{action.progress}%</span>
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
                    {activeBet.actions.length === 0 && (
                      <div className="py-12 text-center bg-slate-50 border-2 border-dashed border-slate-100 rounded-2xl">
                         <p className="text-sm text-slate-400 italic">No tasks defined for this bet.</p>
                      </div>
                    )}
                 </div>
               </div>
            </div>

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
                      onChange={(e) => handleUpdateActionLocal({ title: e.target.value })}
                    />
                 </div>
                 
                 <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Task Completion (%)</label>
                    <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                       {progressSteps.map((step) => (
                         <button
                           key={step}
                           type="button"
                           onClick={() => handleUpdateActionLocal({ progress: step })}
                           className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                             editingAction.progress === step 
                               ? 'bg-blue-600 text-white shadow-lg' 
                               : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'
                           }`}
                         >
                           {step}%
                         </button>
                       ))}
                    </div>
                    <p className="text-[9px] text-slate-400 mt-2 font-medium italic">Task progress increments are restricted to 25% steps.</p>
                 </div>

                 <div className="pt-4">
                    <button 
                      onClick={handleDoneEditing}
                      className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20"
                    >
                       Done Editing
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[70] flex items-center justify-center p-4">
           <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <header className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-rose-50/50">
                 <h3 className="text-xs font-bold text-rose-800 uppercase tracking-widest flex items-center gap-2">
                    <i className="fas fa-triangle-exclamation"></i>
                    Confirm Permanent Deletion
                 </h3>
                 <button onClick={() => setShowDeleteConfirm(false)} className="text-rose-400 hover:text-rose-600 transition-colors">
                    <i className="fas fa-times"></i>
                 </button>
              </header>
              <div className="p-8 space-y-6 text-center">
                 <p className="text-sm text-slate-600 leading-relaxed font-light">
                    Are you sure you want to delete <strong className="text-slate-900">"{activeBet.title}"</strong>? 
                    This action will permanently remove all associated tasks, history, and discussions from the platform.
                 </p>
                 
                 <div className="flex gap-3">
                    <button 
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => { onDelete(activeBet.id); setShowDeleteConfirm(false); }}
                      className="flex-1 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 shadow-lg shadow-rose-900/20 transition-all active:scale-95"
                    >
                      Confirm Delete
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

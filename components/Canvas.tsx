
import React, { useState, useEffect } from 'react';
import { Canvas as CanvasType, Bet, Theme, Outcome1Y, User, Comment, CanvasSnapshot } from '../types';
import { THEMES } from '../constants';
import CommentList from './CommentList';

interface CanvasProps {
  canvas: CanvasType;
  bets: Bet[];
  outcomes: Outcome1Y[];
  currentUser: User;
  comments: Comment[];
  snapshots: CanvasSnapshot[];
  onUpdateCanvas: (canvas: CanvasType) => void;
  onAddComment: (body: string) => void;
  onCreateSnapshot: () => void;
}

const Canvas: React.FC<CanvasProps> = ({ canvas, bets, outcomes, currentUser, comments, snapshots, onUpdateCanvas, onAddComment, onCreateSnapshot }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [viewingSnapshot, setViewingSnapshot] = useState<CanvasSnapshot | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  
  const canEdit = currentUser.role === 'Admin' || currentUser.role === 'Editor';
  const isAdmin = currentUser.role === 'Admin';

  const getBetsByTimebox = (timebox: string) => bets.filter(b => b.timebox === timebox);

  const formatTimeboxLabel = (timebox: string) => {
    if (timebox === 'H1') return 'Horizon 1';
    if (timebox === 'H2') return 'Horizon 2';
    return timebox;
  };

  const handleValueChange = (key: keyof CanvasType, value: string) => {
    onUpdateCanvas({
      ...canvas,
      [key]: value,
      updated_at: new Date().toISOString(),
      updated_by: currentUser.id
    });
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Active Strategy Canvas</h1>
          <p className="text-slate-500 mt-1 font-light">Version 2024.Q2 • Last revised by {canvas.updated_by === 'u1' ? 'Alex Strategist' : canvas.updated_by}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className={`px-4 py-2 border rounded-lg font-bold transition-all shadow-sm flex items-center gap-2 ${showHistory ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
          >
            <i className="fas fa-history text-xs"></i>
            {showHistory ? 'Hide History' : 'Snapshot Archive'}
          </button>
          {canEdit && (
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 shadow-sm transition-all"
            >
              {isEditing ? 'Finish Edits' : 'Edit Canvas'}
            </button>
          )}
          {isAdmin && (
            <button 
              onClick={onCreateSnapshot}
              className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-900/10 transition-all flex items-center gap-2"
            >
              <i className="fas fa-camera"></i>
              Create Snapshot
            </button>
          )}
        </div>
      </header>

      {/* Identity Layer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Purpose', key: 'purpose' as const, icon: 'fa-heart', color: 'rose' },
          { label: 'Vision', key: 'vision' as const, icon: 'fa-eye', color: 'blue' },
          { label: 'Values', key: 'values' as const, icon: 'fa-shield-halved', color: 'amber' },
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
            <div className={`w-10 h-10 rounded-lg bg-${item.color}-50 flex items-center justify-center mb-4`}>
              <i className={`fas ${item.icon} text-${item.color}-600`}></i>
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">{item.label}</h3>
            {isEditing ? (
              <textarea 
                className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-light"
                value={canvas[item.key]}
                rows={3}
                onChange={(e) => handleValueChange(item.key, e.target.value)}
              />
            ) : (
              <p className="text-slate-700 font-light leading-relaxed">{canvas[item.key]}</p>
            )}
          </div>
        ))}
      </div>

      {/* Strategy Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {THEMES.map((theme) => {
          const themeOutcomes = outcomes.filter(o => o.theme_id === theme.id);
          return (
            <div key={theme.id} className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col transition-all hover:border-blue-200">
              <div className={`px-4 py-3 border-b border-slate-100 bg-${theme.color}-50 flex items-center gap-2 rounded-t-xl`}>
                 <span className={`w-2 h-2 rounded-full bg-${theme.color}-500`}></span>
                 <h3 className="font-bold text-slate-800 text-sm uppercase truncate">{theme.name}</h3>
              </div>
              <div className="p-4 flex-1 space-y-4">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Target Outcomes</h4>
                  {themeOutcomes.map(o => (
                    <div key={o.id} className="mb-2 p-2 bg-slate-50 rounded border border-slate-100 flex items-start gap-2">
                       <span className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                         o.status === 'Green' ? 'bg-emerald-500' : 
                         o.status === 'Yellow' ? 'bg-amber-500' : 'bg-rose-500'
                       }`}></span>
                       <p className="text-xs font-semibold text-slate-700 leading-tight">{o.title}</p>
                    </div>
                  ))}
                  {themeOutcomes.length === 0 && <p className="text-xs text-slate-400 italic font-light">No outcomes defined.</p>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Archive / History Section */}
      {showHistory && (
        <section className="animate-in slide-in-from-top duration-300">
           <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8">
              <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-bold text-slate-800">Strategic Audit Trail</h2>
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{snapshots.length} versions archived</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {snapshots.length > 0 ? [...snapshots].reverse().map(snapshot => (
                   <button 
                     key={snapshot.id}
                     onClick={() => setViewingSnapshot(snapshot)}
                     className="bg-white border border-slate-200 p-5 rounded-xl text-left hover:border-blue-300 hover:shadow-md transition-all group"
                   >
                      <div className="flex justify-between items-start mb-3">
                         <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                           <i className="fas fa-camera text-sm"></i>
                         </div>
                         <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(snapshot.created_at).toLocaleDateString()}</span>
                      </div>
                      <h4 className="font-bold text-slate-800 mb-1">Version {snapshot.id.slice(-4).toUpperCase()}</h4>
                      <p className="text-xs text-slate-500 font-light mb-3">Captured by {snapshot.created_by}</p>
                      
                      <div className="flex gap-1.5">
                         {snapshot.outcomes.slice(0, 5).map((o, idx) => (
                           <div key={idx} className={`w-1.5 h-1.5 rounded-full ${o.status === 'Green' ? 'bg-emerald-400' : o.status === 'Yellow' ? 'bg-amber-400' : 'bg-rose-400'}`} />
                         ))}
                         {snapshot.outcomes.length > 5 && <span className="text-[8px] text-slate-300 font-bold">+{snapshot.outcomes.length - 5}</span>}
                      </div>
                   </button>
                 )) : (
                   <div className="col-span-full py-12 text-center text-slate-400 italic font-light border-2 border-dashed border-slate-200 rounded-xl">
                      No snapshots created yet.
                   </div>
                 )}
              </div>
           </div>
        </section>
      )}

      {/* Bets Portfolio View */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <i className="fas fa-layer-group text-blue-500"></i>
            Strategic Bets
          </h2>
          <div className="flex gap-4 text-[10px] uppercase font-bold text-slate-400">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Current Horizon</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400"></span> Future Sequence</span>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {['H1', 'H2', 'Backlog'].map((box) => (
            <div key={box} className="bg-slate-100/50 rounded-xl border border-dashed border-slate-300 min-h-[400px] flex flex-col">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white/40 rounded-t-xl">
                <h3 className="font-bold text-slate-600 flex items-center gap-2 italic uppercase tracking-wider">
                  <span className={`w-1.5 h-1.5 rounded-full ${box === 'H1' ? 'bg-blue-500' : 'bg-slate-400'}`}></span>
                  {formatTimeboxLabel(box)}
                </h3>
                <span className="text-xs font-bold text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                  {getBetsByTimebox(box).length}
                </span>
              </div>
              <div className="p-4 space-y-3 flex-1">
                {getBetsByTimebox(box).map(bet => {
                  const theme = THEMES.find(t => t.id === bet.theme_id);
                  return (
                    <div key={bet.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-all cursor-pointer group hover:border-blue-300">
                      <div className="flex justify-between items-start mb-2">
                         <span className={`text-[10px] font-bold uppercase text-${theme?.color}-600 bg-${theme?.color}-50 px-1.5 rounded`}>
                           {theme?.name}
                         </span>
                         <span className={`text-[10px] font-bold px-1.5 rounded uppercase ${
                           bet.stage === 'Blocked' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'
                         }`}>
                           {bet.stage}
                         </span>
                      </div>
                      <p className="font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors leading-snug">{bet.title}</p>
                      <div className="flex items-center gap-2">
                         <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-blue-500" style={{ width: `${bet.progress}%` }}></div>
                         </div>
                         <span className="text-[10px] font-bold text-slate-400">{bet.progress}%</span>
                      </div>
                    </div>
                  );
                })}
                {getBetsByTimebox(box).length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 py-10">
                    <i className="fas fa-inbox text-2xl mb-2 opacity-20"></i>
                    <p className="text-[10px] uppercase font-bold tracking-widest">Empty {formatTimeboxLabel(box)}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Canvas Discussion */}
      <div className="mt-12 bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-4xl mx-auto">
        <CommentList 
          comments={comments}
          entityId={canvas.id}
          entityType="Canvas"
          currentUser={currentUser}
          onAddComment={onAddComment}
        />
      </div>

      {/* Snapshot Viewer Modal */}
      {viewingSnapshot && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
           <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
              <header className="px-8 py-6 bg-slate-900 text-white flex justify-between items-center">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center">
                       <i className="fas fa-clock-rotate-left text-xl"></i>
                    </div>
                    <div>
                       <h2 className="text-xl font-bold">Snapshot History: {new Date(viewingSnapshot.created_at).toLocaleDateString()}</h2>
                       <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Captured by {viewingSnapshot.created_by}</p>
                    </div>
                 </div>
                 <button onClick={() => setViewingSnapshot(null)} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
                    <i className="fas fa-times text-xl"></i>
                 </button>
              </header>

              <div className="flex-1 overflow-y-auto p-10 space-y-12">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                      { label: 'Purpose', value: viewingSnapshot.purpose, color: 'rose' },
                      { label: 'Vision', value: viewingSnapshot.vision, color: 'blue' },
                      { label: 'Values', value: viewingSnapshot.values, color: 'amber' },
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-3">
                         <h3 className={`text-[10px] font-bold text-${item.color}-500 uppercase tracking-widest`}>{item.label}</h3>
                         <p className="text-slate-700 font-light leading-relaxed">{item.value}</p>
                      </div>
                    ))}
                 </div>

                 <div className="space-y-6">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Outcome Health at Time of Capture</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                       {viewingSnapshot.outcomes.map((o, idx) => {
                         const theme = THEMES.find(t => t.id === o.theme_id);
                         return (
                           <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                              <div className="min-w-0">
                                 <span className={`text-[8px] font-bold uppercase text-${theme?.color}-600 mb-1 block`}>{theme?.name}</span>
                                 <h4 className="font-bold text-slate-800 text-sm truncate pr-2">{o.title}</h4>
                              </div>
                              <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${o.status === 'Green' ? 'bg-emerald-100 text-emerald-700' : o.status === 'Yellow' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                                 {o.status}
                              </div>
                           </div>
                         );
                       })}
                    </div>
                 </div>
              </div>

              <footer className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-center">
                 <button onClick={() => setViewingSnapshot(null)} className="px-8 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all">
                    Exit Historical View
                 </button>
              </footer>
           </div>
        </div>
      )}
    </div>
  );
};

export default Canvas;

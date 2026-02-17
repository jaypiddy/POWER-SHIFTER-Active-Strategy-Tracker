
import React, { useState, useEffect } from 'react';
import { Canvas as CanvasType, Bet, Theme, Outcome1Y, User, Comment, CanvasSnapshot, StrategicValue } from '../types';
import CommentList from './CommentList';

interface CanvasProps {
  canvas: CanvasType;
  bets: Bet[];
  outcomes: Outcome1Y[];
  currentUser: User;
  comments: Comment[];
  snapshots: CanvasSnapshot[];
  themes: Theme[];
  onUpdateCanvas: (canvas: CanvasType) => void;
  onUpdateTheme: (theme: Theme) => void;
  onAddComment: (body: string) => void;
  onCreateSnapshot: () => void;
  onNewBet: (themeId?: string) => void;
}

const Canvas: React.FC<CanvasProps> = ({ canvas, bets, outcomes, currentUser, comments, snapshots, themes, onUpdateCanvas, onUpdateTheme, onAddComment, onCreateSnapshot, onNewBet }) => {
  const [isEditingIdentity, setIsEditingIdentity] = useState(false);
  const [tempCanvas, setTempCanvas] = useState<CanvasType>(canvas);
  const [viewingSnapshot, setViewingSnapshot] = useState<CanvasSnapshot | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [editingThemes, setEditingThemes] = useState<Theme | null>(null);
  const [localThemeState, setLocalThemeState] = useState<Theme[]>(themes);
  const [isBulkSaving, setIsBulkSaving] = useState(false);
  
  const canEdit = currentUser.role === 'Admin' || currentUser.role === 'Editor';
  const isAdmin = currentUser.role === 'Admin';

  // Sync local temp state when prop canvas changes (from external sync)
  useEffect(() => {
    if (!isEditingIdentity) {
      setTempCanvas(canvas);
    }
  }, [canvas, isEditingIdentity]);

  const handleIdentitySave = async () => {
    setIsBulkSaving(true);
    try {
      const updated = {
        ...tempCanvas,
        updated_at: new Date().toISOString(),
        updated_by: currentUser.id
      };
      await onUpdateCanvas(updated);
      setIsEditingIdentity(false);
    } catch (e) {
      console.error(e);
      alert("Failed to save identity changes.");
    } finally {
      setIsBulkSaving(false);
    }
  };

  const updateTempValue = (index: number, updates: Partial<StrategicValue>) => {
    const updatedValues = [...tempCanvas.values];
    updatedValues[index] = { ...updatedValues[index], ...updates };
    setTempCanvas({ ...tempCanvas, values: updatedValues });
  };

  const addTempValue = () => {
    setTempCanvas({ 
      ...tempCanvas, 
      values: [...tempCanvas.values, { title: '', description: '' }] 
    });
  };

  const removeTempValue = (index: number) => {
    setTempCanvas({ ...tempCanvas, values: tempCanvas.values.filter((_, i) => i !== index) });
  };

  const handleUpdateLocalThemeField = (id: string, field: keyof Theme, value: any) => {
    setLocalThemeState(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const handleSaveTheme = (theme: Theme) => {
    onUpdateTheme(theme);
  };

  const openThemeEditor = (targetTheme?: Theme) => {
    setLocalThemeState(themes);
    setEditingThemes(targetTheme || themes[0]);
  };

  const handleCloseAndSaveAllThemes = async () => {
    setIsBulkSaving(true);
    try {
      for (const t of localThemeState) {
        await onUpdateTheme(t);
      }
      setEditingThemes(null);
    } catch (error) {
      console.error("Failed to save themes:", error);
      alert("Error saving theme configuration.");
    } finally {
      setIsBulkSaving(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Active Strategy Canvas</h1>
          <p className="text-slate-500 mt-1 font-light">Version 2024.Q2 • Last revised by Alex Strategist</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className={`px-4 py-2 border rounded-lg font-bold transition-all shadow-sm flex items-center gap-2 ${showHistory ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
          >
            <i className="fas fa-history text-xs"></i>
            Snapshot Archive
          </button>
          {canEdit && (
            <div className="flex gap-2">
               <button 
                  onClick={() => openThemeEditor()}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 shadow-sm transition-all flex items-center gap-2"
                >
                  <i className="fas fa-pen-nib text-xs"></i>
                  Themes
                </button>
                <button 
                  disabled={isBulkSaving}
                  onClick={() => isEditingIdentity ? handleIdentitySave() : setIsEditingIdentity(true)}
                  className={`px-4 py-2 border font-bold rounded-lg transition-all shadow-sm flex items-center gap-2 ${
                    isEditingIdentity ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {isBulkSaving ? <i className="fas fa-circle-notch animate-spin"></i> : <i className={`fas ${isEditingIdentity ? 'fa-check' : 'fa-id-card'} text-xs`}></i>}
                  {isEditingIdentity ? (isBulkSaving ? 'Saving...' : 'Finish Edits') : 'Edit Identity'}
                </button>
            </div>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Purpose */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center mb-6">
            <i className="fas fa-heart text-rose-600 text-lg"></i>
          </div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Purpose</h3>
          {isEditingIdentity ? (
            <textarea 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none font-light leading-relaxed"
              value={tempCanvas.purpose}
              rows={3}
              onChange={(e) => setTempCanvas({...tempCanvas, purpose: e.target.value})}
            />
          ) : (
            <p className="text-slate-800 text-lg font-light leading-relaxed">{canvas.purpose}</p>
          )}
        </div>

        {/* Vision */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-6">
            <i className="fas fa-eye text-blue-600 text-lg"></i>
          </div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Vision</h3>
          {isEditingIdentity ? (
            <textarea 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none font-light leading-relaxed"
              value={tempCanvas.vision}
              rows={3}
              onChange={(e) => setTempCanvas({...tempCanvas, vision: e.target.value})}
            />
          ) : (
            <p className="text-slate-800 text-lg font-light leading-relaxed">{canvas.vision}</p>
          )}
        </div>

        {/* Values */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mb-6">
            <i className="fas fa-shield-halved text-amber-600 text-lg"></i>
          </div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Values</h3>
            {isEditingIdentity && (
              <button onClick={addTempValue} className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors">
                <i className="fas fa-plus mr-1"></i> Add
              </button>
            )}
          </div>
          
          <div className="space-y-4 flex-1">
            {isEditingIdentity ? (
              <div className="space-y-4">
                {tempCanvas.values.map((v, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 relative group">
                    <button 
                      onClick={() => removeTempValue(idx)} 
                      className="absolute top-2 right-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <i className="fas fa-trash-alt text-[10px]"></i>
                    </button>
                    <div className="space-y-2">
                      <input 
                        type="text"
                        placeholder="Value Headline"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                        value={v.title}
                        onChange={(e) => updateTempValue(idx, { title: e.target.value })}
                      />
                      <textarea 
                        placeholder="Value Description"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 font-light focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        rows={2}
                        value={v.description}
                        onChange={(e) => updateTempValue(idx, { description: e.target.value })}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ul className="space-y-5">
                {canvas.values.map((v, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <i className="fas fa-check text-xs text-amber-500 mt-1.5 shrink-0"></i>
                    <div>
                      <span className="text-slate-900 text-base font-bold block leading-tight">{v.title}</span>
                      <p className="text-slate-500 text-sm font-light leading-relaxed mt-1">{v.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Strategic Themes Layout - Max 2 per row as individual cards */}
      <div className="space-y-8 pt-8">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] text-center">Our Strategic Themes</h2>
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
          {themes.map((theme) => {
            const themeOutcomes = outcomes.filter(o => o.theme_id === theme.id);
            return (
              <div 
                key={theme.id} 
                className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col group relative transition-all hover:shadow-blue-900/5"
              >
                {/* Vertical Accent Color Line */}
                <div className={`absolute left-0 top-0 bottom-0 w-2 bg-${theme.color}-500/20 group-hover:bg-${theme.color}-500 transition-all duration-500`}></div>
                
                <div className="p-12 flex-1 flex flex-col relative">
                  {canEdit && (
                    <button 
                      onClick={() => openThemeEditor(theme)}
                      className="absolute top-10 right-10 p-2 text-slate-200 hover:text-slate-500 hover:bg-slate-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      title="Edit this theme"
                    >
                      <i className="fas fa-pen text-[10px]"></i>
                    </button>
                  )}

                  <header className="mb-12 text-center">
                    <h3 className="font-bold text-slate-900 text-base uppercase tracking-[0.25em]">{theme.name}</h3>
                  </header>

                  <div className="flex-1 space-y-12">
                    {theme.definition && (
                      <div className="px-4">
                        <p className="text-lg font-bold text-slate-900 leading-relaxed text-center italic">
                          "{theme.definition}"
                        </p>
                      </div>
                    )}
                    
                    {theme.description && (
                      <div className="text-[15px] text-slate-600 font-light leading-relaxed whitespace-pre-line text-center px-4">
                        {theme.description}
                      </div>
                    )}

                    {theme.successCriteria && (
                      <div className="bg-slate-50/60 p-8 rounded-[2rem] border border-slate-100 shadow-inner mt-6">
                        <span className="font-bold uppercase text-[10px] text-slate-400 block mb-4 tracking-widest">Target Milestone:</span>
                        <p className="text-xs text-slate-500 leading-relaxed italic font-light">
                          {theme.successCriteria}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-10 border-t border-slate-100 mt-12">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Commitment</h4>
                      <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-bold">{themeOutcomes.length}</span>
                    </div>
                    
                    <div className="space-y-4">
                      {themeOutcomes.length > 0 ? themeOutcomes.map(o => (
                        <div key={o.id} className="flex items-center gap-4 group/item">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${
                            o.status === 'Green' ? 'bg-emerald-500' : 
                            o.status === 'Yellow' ? 'bg-amber-500' : 'bg-rose-500'
                          }`}></span>
                          <p className="text-xs font-bold text-slate-700 truncate group-hover/item:text-blue-600 transition-colors" title={o.title}>{o.title}</p>
                        </div>
                      )) : (
                        <p className="text-xs text-slate-300 italic font-light text-center py-4">No active outcomes.</p>
                      )}
                    </div>

                    {canEdit && (
                      <div className="mt-8 flex justify-end">
                        <button 
                          onClick={() => onNewBet(theme.id)}
                          className="text-xs font-bold text-blue-600 flex items-center gap-2 hover:text-blue-700 transition-colors"
                        >
                          <i className="fas fa-plus-circle"></i>
                          Create Bet
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Snapshot History UI */}
      {showHistory && (
        <section className="animate-in slide-in-from-top duration-300">
           <div className="bg-slate-50 rounded-[2.5rem] border border-slate-200 p-10">
              <div className="flex justify-between items-center mb-8">
                 <h2 className="text-2xl font-bold text-slate-800">Strategic Audit Trail</h2>
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{snapshots.length} versions archived</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {snapshots.length > 0 ? [...snapshots].reverse().map(snapshot => (
                   <button 
                     key={snapshot.id}
                     onClick={() => setViewingSnapshot(snapshot)}
                     className="bg-white border border-slate-200 p-6 rounded-2xl text-left hover:border-blue-300 hover:shadow-xl transition-all group"
                   >
                      <div className="flex justify-between items-start mb-4">
                         <div className="p-3 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                           <i className="fas fa-camera text-sm"></i>
                         </div>
                         <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(snapshot.created_at).toLocaleDateString()}</span>
                      </div>
                      <h4 className="font-bold text-slate-800 mb-1">Version {snapshot.id.slice(-4).toUpperCase()}</h4>
                      <p className="text-xs text-slate-500 font-light">Captured by {snapshot.created_by}</p>
                   </button>
                 )) : (
                   <div className="col-span-full py-16 text-center text-slate-400 italic font-light border-2 border-dashed border-slate-200 rounded-[2rem]">
                      No snapshots created yet.
                   </div>
                 )}
              </div>
           </div>
        </section>
      )}

      {/* Configure Themes Modal */}
      {editingThemes && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-6xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <header className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Architecture</h3>
                <h2 className="text-2xl font-bold text-slate-900">Configure Strategic Themes</h2>
              </div>
              <button onClick={() => setEditingThemes(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <i className="fas fa-times text-2xl"></i>
              </button>
            </header>
            
            <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-50/20">
              <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                {localThemeState.map(t => (
                  <div 
                    key={t.id} 
                    className={`p-10 rounded-[2.5rem] border-2 bg-white transition-all relative ${editingThemes.id === t.id ? `border-${t.color}-500 shadow-2xl ring-8 ring-${t.color}-500/5` : 'border-slate-100 shadow-sm opacity-90'}`}
                    onClick={() => setEditingThemes(t)}
                  >
                    <div className={`absolute left-0 top-12 bottom-12 w-2 rounded-r-full bg-${t.color}-500 opacity-80`}></div>

                    <div className="space-y-8">
                      <div className="flex items-center gap-4">
                        <div className={`w-4 h-4 rounded-full bg-${t.color}-500 shadow-lg shadow-${t.color}-500/20`}></div>
                        <input 
                          type="text" 
                          className="bg-transparent border-none focus:ring-0 p-0 text-2xl font-bold text-slate-900 w-full"
                          value={t.name}
                          onChange={(e) => handleUpdateLocalThemeField(t.id, 'name', e.target.value)}
                          placeholder="Theme Title"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Theme Context (Description)</label>
                        <textarea 
                          className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl p-5 text-sm focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed min-h-[120px] font-light"
                          value={t.description}
                          onChange={(e) => handleUpdateLocalThemeField(t.id, 'description', e.target.value)}
                          placeholder="Describe the overall context..."
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Core Definition (The Intent)</label>
                        <textarea 
                          className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl p-5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed min-h-[100px]"
                          value={t.definition || ''}
                          onChange={(e) => handleUpdateLocalThemeField(t.id, 'definition', e.target.value)}
                          placeholder="What is the core statement of this theme?"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Milestone</label>
                        <textarea 
                          className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl p-5 text-sm italic text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed min-h-[100px]"
                          value={t.successCriteria || ''}
                          onChange={(e) => handleUpdateLocalThemeField(t.id, 'successCriteria', e.target.value)}
                          placeholder="What are the leading indicators of success?"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>

                      <div className="flex items-center justify-between pt-4">
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">UI Accent Color</span>
                         <div className="flex gap-3">
                            {['blue', 'emerald', 'amber', 'rose', 'indigo', 'violet'].map(color => (
                              <button 
                                key={color}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateLocalThemeField(t.id, 'color', color);
                                }}
                                className={`w-8 h-8 rounded-full bg-${color}-500 border-4 ${ t.color === color ? 'border-slate-900 scale-110 shadow-xl' : 'border-white shadow-sm' } transition-all hover:scale-125`}
                              />
                            ))}
                         </div>
                      </div>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveTheme(t);
                        }}
                        className={`w-full py-5 bg-slate-900 text-white font-bold rounded-[1.25rem] text-sm hover:bg-slate-800 transition-all mt-6 active:scale-95 shadow-2xl shadow-slate-900/20`}
                      >
                        Apply Changes to {t.name}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <footer className="p-10 border-t border-slate-100 flex justify-center bg-white">
               <button 
                 disabled={isBulkSaving}
                 onClick={handleCloseAndSaveAllThemes}
                 className="px-12 py-4 bg-slate-100 text-slate-900 font-bold rounded-2xl hover:bg-slate-200 shadow-sm transition-all flex items-center gap-3"
               >
                 {isBulkSaving ? <i className="fas fa-circle-notch animate-spin"></i> : <i className="fas fa-check"></i>}
                 {isBulkSaving ? 'Syncing Themes...' : 'Done Configuring Themes'}
               </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Canvas;

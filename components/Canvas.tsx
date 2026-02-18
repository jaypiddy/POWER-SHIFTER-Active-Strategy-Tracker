
import React, { useState, useEffect, useRef } from 'react';

// Auto-resize textarea component to eliminate awkward scrollbars
const AutoResizeTextarea = ({
  value,
  onChange,
  placeholder,
  className
}: {
  value: string,
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void,
  placeholder?: string,
  className?: string
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to correctly calculate new scrollHeight (shrink if needed)
      textareaRef.current.style.height = 'auto';
      // Set height to scrollHeight
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`${className} overflow-hidden resize-none`}
      rows={1}
    />
  );
};
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
          <h1 className="text-4xl font-bold text-slate-100 tracking-tight">Active Strategy Canvas</h1>
          <p className="text-slate-400 mt-1 font-light">Version 2024.Q2 • Last revised by Alex Strategist</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`px-4 py-2 border rounded-lg font-bold transition-all shadow-sm flex items-center gap-2 ${showHistory ? 'bg-slate-800 text-white border-slate-700' : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'}`}
          >
            <i className="fas fa-history text-xs"></i>
            Snapshot Archive
          </button>
          {canEdit && (
            <div className="flex gap-2">
              <button
                onClick={() => openThemeEditor()}
                className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 font-bold rounded-lg hover:bg-slate-800 hover:text-white shadow-sm transition-all flex items-center gap-2"
              >
                <i className="fas fa-pen-nib text-xs"></i>
                Themes
              </button>
              <button
                disabled={isBulkSaving}
                onClick={() => isEditingIdentity ? handleIdentitySave() : setIsEditingIdentity(true)}
                className={`px-4 py-2 border font-bold rounded-lg transition-all shadow-sm flex items-center gap-2 ${isEditingIdentity ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
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
      {/* Identity Layer */}
      <div className="flex flex-col gap-8 max-w-5xl mx-auto">
        {/* Purpose */}
        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl shadow-black/20 w-full">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-6">
            <i className="fas fa-heart text-rose-500 text-lg"></i>
          </div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Purpose</h3>
          {isEditingIdentity ? (
            <AutoResizeTextarea
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-light leading-relaxed min-h-[100px]"
              value={tempCanvas.purpose}
              onChange={(e) => setTempCanvas({ ...tempCanvas, purpose: e.target.value })}
            />
          ) : (
            <p className="text-slate-200 text-lg font-light leading-relaxed whitespace-pre-wrap">{canvas.purpose}</p>
          )}
        </div>

        {/* Vision */}
        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl shadow-black/20 w-full">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6">
            <i className="fas fa-eye text-blue-500 text-lg"></i>
          </div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Vision</h3>
          {isEditingIdentity ? (
            <AutoResizeTextarea
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-light leading-relaxed min-h-[100px]"
              value={tempCanvas.vision}
              onChange={(e) => setTempCanvas({ ...tempCanvas, vision: e.target.value })}
            />
          ) : (
            <p className="text-slate-200 text-lg font-light leading-relaxed whitespace-pre-wrap">{canvas.vision}</p>
          )}
        </div>

        {/* Values */}
        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl shadow-black/20 flex flex-col w-full">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6">
            <i className="fas fa-shield-halved text-amber-500 text-lg"></i>
          </div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Values</h3>
            {isEditingIdentity && (
              <button onClick={addTempValue} className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded hover:bg-blue-500/20 transition-colors">
                <i className="fas fa-plus mr-1"></i> Add
              </button>
            )}
          </div>

          <div className="flex-1">
            {isEditingIdentity ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tempCanvas.values.map((v, idx) => (
                  <div key={idx} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 relative group h-full">
                    <button
                      onClick={() => removeTempValue(idx)}
                      className="absolute top-2 right-2 text-slate-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 z-10"
                    >
                      <i className="fas fa-trash-alt text-[10px]"></i>
                    </button>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Value Headline"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                        value={v.title}
                        onChange={(e) => updateTempValue(idx, { title: e.target.value })}
                      />
                      <AutoResizeTextarea
                        placeholder="Value Description"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-400 font-light focus:ring-2 focus:ring-blue-500 outline-none block"
                        value={v.description}
                        onChange={(e) => updateTempValue(idx, { description: e.target.value })}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {canvas.values.map((v, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <i className="fas fa-check text-xs text-amber-500 mt-1.5 shrink-0"></i>
                    <div>
                      <span className="text-slate-100 text-base font-bold block leading-tight">{v.title}</span>
                      <p className="text-slate-400 text-sm font-light leading-relaxed mt-1 whitespace-pre-wrap">{v.description}</p>
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
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] text-center">Our Strategic Themes</h2>
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
          {themes.map((theme) => {
            const themeOutcomes = outcomes.filter(o => o.theme_id === theme.id);
            return (
              <div
                key={theme.id}
                className="group relative flex flex-col bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-blue-900/20 transition-all duration-300"
              >
                {/* Top Accent Line */}
                <div className={`h-1 w-full bg-${theme.color}-500 opacity-80 group-hover:opacity-100 transition-opacity`} />

                <div className="p-8 flex-1 flex flex-col relative">
                  {canEdit && (
                    <button
                      onClick={() => openThemeEditor(theme)}
                      className="absolute top-6 right-6 p-2 text-slate-600 hover:text-white hover:bg-slate-800 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Edit this theme"
                    >
                      <i className="fas fa-pen text-xs"></i>
                    </button>
                  )}

                  {/* Header */}
                  <div className="mb-6 pr-8">
                    <h3 className="text-xl font-bold text-slate-100 tracking-tight mb-2">{theme.name}</h3>
                    {theme.definition && (
                      <p className="text-slate-400 italic font-light text-sm leading-relaxed border-l-2 border-slate-800 pl-3">
                        "{theme.definition}"
                      </p>
                    )}
                  </div>

                  {/* Body Description */}
                  {theme.description && (
                    <div className="flex-1 mb-8">
                      <p className="text-sm text-slate-300 leading-relaxed font-normal whitespace-pre-line">
                        {theme.description}
                      </p>
                    </div>
                  )}

                  {/* Metric / Success Criteria */}
                  {theme.successCriteria && (
                    <div className="mt-auto bg-slate-950/50 rounded-xl p-4 border border-slate-800/50">
                      <div className="flex items-center gap-2 mb-2">
                        <i className="fas fa-flag-checkered text-slate-600 text-[10px]"></i>
                        <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                          Target Milestone
                        </label>
                      </div>
                      <p className="text-xs text-slate-300 font-mono leading-relaxed">
                        {theme.successCriteria}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer: Active Commitments */}
                <div className="px-8 py-4 bg-slate-950/30 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-blue-500"></span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Bets</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold ${themeOutcomes.length > 0 ? 'text-slate-200' : 'text-slate-600'}`}>
                      {themeOutcomes.length}
                    </span>
                    {canEdit && (
                      <button
                        onClick={() => onNewBet(theme.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-blue-500 hover:text-blue-400 uppercase tracking-wider flex items-center gap-1 ml-2"
                      >
                        <i className="fas fa-plus"></i> Add
                      </button>
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
          <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 p-10">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-slate-200">Strategic Audit Trail</h2>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{snapshots.length} versions archived</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {snapshots.length > 0 ? [...snapshots].reverse().map(snapshot => (
                <button
                  key={snapshot.id}
                  onClick={() => setViewingSnapshot(snapshot)}
                  className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-left hover:border-blue-500 hover:shadow-xl transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-slate-800 rounded-xl text-slate-500 group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-colors">
                      <i className="fas fa-camera text-sm"></i>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{new Date(snapshot.created_at).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-bold text-slate-200 mb-1">Version {snapshot.id.slice(-4).toUpperCase()}</h4>
                  <p className="text-xs text-slate-500 font-light">Captured by {snapshot.created_by}</p>
                </button>
              )) : (
                <div className="col-span-full py-16 text-center text-slate-600 italic font-light border-2 border-dashed border-slate-800 rounded-[2rem]">
                  No snapshots created yet.
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Configure Themes Modal */}
      {editingThemes && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-6xl bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] border border-slate-800">
            <header className="px-10 py-8 border-b border-slate-800 flex justify-between items-center bg-slate-950/30">
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Architecture</h3>
                <h2 className="text-2xl font-bold text-slate-100">Configure Strategic Themes</h2>
              </div>
              <button onClick={() => setEditingThemes(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <i className="fas fa-times text-2xl"></i>
              </button>
            </header>

            <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-950/30">
              <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                {localThemeState.map(t => (
                  <div
                    key={t.id}
                    className={`p-10 rounded-[2.5rem] border-2 bg-slate-900 transition-all relative ${editingThemes.id === t.id ? `border-${t.color}-500 shadow-2xl ring-8 ring-${t.color}-500/5` : 'border-slate-800 shadow-sm opacity-90'}`}
                    onClick={() => setEditingThemes(t)}
                  >
                    <div className={`absolute left-0 top-12 bottom-12 w-2 rounded-r-full bg-${t.color}-500 opacity-80`}></div>

                    <div className="space-y-8">
                      <div className="flex items-center gap-4">
                        <div className={`w-4 h-4 rounded-full bg-${t.color}-500 shadow-lg shadow-${t.color}-500/20`}></div>
                        <input
                          type="text"
                          className="bg-transparent border-none focus:ring-0 p-0 text-2xl font-bold text-slate-100 w-full"
                          value={t.name}
                          onChange={(e) => handleUpdateLocalThemeField(t.id, 'name', e.target.value)}
                          placeholder="Theme Title"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Theme Context (Description)</label>
                        <textarea
                          className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-5 text-sm focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed min-h-[120px] font-light text-slate-300"
                          value={t.description}
                          onChange={(e) => handleUpdateLocalThemeField(t.id, 'description', e.target.value)}
                          placeholder="Describe the overall context..."
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Core Definition (The Intent)</label>
                        <textarea
                          className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-5 text-sm font-bold text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed min-h-[100px]"
                          value={t.definition || ''}
                          onChange={(e) => handleUpdateLocalThemeField(t.id, 'definition', e.target.value)}
                          placeholder="What is the core statement of this theme?"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Target Milestone</label>
                        <textarea
                          className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-5 text-sm italic text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed min-h-[100px]"
                          value={t.successCriteria || ''}
                          onChange={(e) => handleUpdateLocalThemeField(t.id, 'successCriteria', e.target.value)}
                          placeholder="What are the leading indicators of success?"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>

                      <div className="flex items-center justify-between pt-4">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">UI Accent Color</span>
                        <div className="flex gap-3">
                          {['blue', 'emerald', 'amber', 'rose', 'indigo', 'violet'].map(color => (
                            <button
                              key={color}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateLocalThemeField(t.id, 'color', color);
                              }}
                              className={`w-8 h-8 rounded-full bg-${color}-500 border-4 ${t.color === color ? 'border-slate-900 scale-110 shadow-xl' : 'border-white shadow-sm'} transition-all hover:scale-125`}
                            />
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveTheme(t);
                        }}
                        className={`w-full py-5 bg-slate-800 text-white font-bold rounded-[1.25rem] text-sm hover:bg-slate-700 transition-all mt-6 active:scale-95 shadow-2xl shadow-black/20`}
                      >
                        Apply Changes to {t.name}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <footer className="p-10 border-t border-slate-800 flex justify-center bg-slate-900">
              <button
                disabled={isBulkSaving}
                onClick={handleCloseAndSaveAllThemes}
                className="px-12 py-4 bg-slate-800 text-slate-200 font-bold rounded-2xl hover:bg-slate-700 shadow-sm transition-all flex items-center gap-3"
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

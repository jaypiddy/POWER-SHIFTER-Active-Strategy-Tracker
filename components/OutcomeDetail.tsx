
import React, { useState } from 'react';
import { Outcome1Y, Measure, User, Status, Theme } from '../types';
import { suggestMeasures } from '../services/geminiService';

interface OutcomeDetailProps {
  outcome: Outcome1Y;
  measures: Measure[];
  currentUser: User;
  onClose: () => void;
  onUpdate: (outcome: Outcome1Y) => void;
  onAddMeasure: (measure: Measure) => void;
  onUpdateMeasure: (measure: Measure) => void;
  onDeleteMeasure: (id: string) => void;
  themes: Theme[];
}

const STATUS_DEFINITIONS: Record<Status, string> = {
  Green: "Healthy: Execution is on track. Key measures are meeting or exceeding targets with no significant risks identified.",
  Yellow: "At Risk: Friction detected. Some measures are slightly off-track or emerging risks require active monitoring.",
  Red: "Critical: Significant deviation. Key measures are missing targets or major blockers require urgent intervention."
};

const OutcomeDetail: React.FC<OutcomeDetailProps> = ({ outcome, measures, currentUser, onClose, onUpdate, onAddMeasure, onUpdateMeasure, onDeleteMeasure, themes }) => {
  const [activeOutcome, setActiveOutcome] = useState(outcome);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [editingMeasure, setEditingMeasure] = useState<Measure | null>(null);
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [manualMeasure, setManualMeasure] = useState({
    name: '',
    definition: '',
    target: '',
    cadence: 'Monthly' as Measure['cadence']
  });
  
  const canEdit = currentUser.role === 'Admin' || currentUser.role === 'Editor';
  const theme = themes.find(t => t.id === outcome.theme_id);
  const outcomeMeasures = measures.filter(m => m.outcome_id === outcome.id);

  const handleSuggest = async () => {
    setIsSuggesting(true);
    setSuggestions([]);
    setShowManualAdd(false);
    try {
      const results = await suggestMeasures(activeOutcome.title + ": " + activeOutcome.description);
      setSuggestions(results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleAddSuggested = (s: any) => {
    const newMeasure: Measure = {
      id: `m-${Date.now()}`,
      outcome_id: outcome.id,
      name: s.name,
      definition: s.definition,
      cadence: 'Monthly',
      source_type: 'Manual',
      target: s.threshold,
      thresholds: { green_above: 0 } 
    };
    onAddMeasure(newMeasure);
    setSuggestions(suggestions.filter(item => item.name !== s.name));
  };

  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualMeasure.name || !manualMeasure.target) return;

    const newMeasure: Measure = {
      id: `m-${Date.now()}`,
      outcome_id: outcome.id,
      name: manualMeasure.name,
      definition: manualMeasure.definition,
      cadence: manualMeasure.cadence,
      source_type: 'Manual',
      target: manualMeasure.target,
      thresholds: { green_above: 0 }
    };
    onAddMeasure(newMeasure);
    setManualMeasure({ name: '', definition: '', target: '', cadence: 'Monthly' });
    setShowManualAdd(false);
  };

  const handleUpdateMeasureLocal = (updates: Partial<Measure>) => {
    if (!editingMeasure) return;
    setEditingMeasure({ ...editingMeasure, ...updates });
  };

  const saveEditedMeasure = () => {
    if (editingMeasure) {
      onUpdateMeasure(editingMeasure);
      setEditingMeasure(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <header className="p-6 border-b border-slate-100 flex justify-between items-center bg-white z-20">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
              <i className="fas fa-times"></i>
            </button>
            <div>
               <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-${theme?.color || 'slate'}-50 text-${theme?.color || 'slate'}-700 mb-1 inline-block`}>
                  {theme?.name || 'Unassigned'}
               </span>
               <h2 className="text-xl font-bold text-slate-900">{activeOutcome.title}</h2>
            </div>
          </div>
          {canEdit && (
            <button onClick={() => onUpdate(activeOutcome)} className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors">
              Save Status
            </button>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">
           <section>
              <div className="flex items-center gap-2 mb-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Health Status</label>
                <i className="fas fa-circle-info text-[10px] text-slate-300"></i>
              </div>
              <div className="flex gap-3">
                {(['Green', 'Yellow', 'Red'] as const).map(s => (
                  <div key={s} className="relative flex-1 group">
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 p-3 bg-slate-900/95 backdrop-blur-md text-[11px] text-slate-100 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 transform -translate-y-1 group-hover:translate-y-0 z-[60] leading-relaxed font-light">
                      <div className="font-bold mb-1 border-b border-white/10 pb-1">{s} Logic</div>
                      {STATUS_DEFINITIONS[s]}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-slate-900/95"></div>
                    </div>

                    <button 
                      disabled={!canEdit}
                      onClick={() => setActiveOutcome({...activeOutcome, status: s})}
                      className={`w-full py-3 rounded-xl border-2 font-bold transition-all ${
                        activeOutcome.status === s 
                          ? (s === 'Green' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : s === 'Yellow' ? 'bg-amber-50 border-amber-500 text-amber-700' : 'bg-rose-50 border-rose-500 text-rose-700') 
                          : 'bg-white border-slate-100 text-slate-400 opacity-50 grayscale hover:opacity-100 hover:grayscale-0'
                      }`}
                    >
                      {s}
                    </button>
                  </div>
                ))}
              </div>
           </section>

           <section className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                 <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <i className="fas fa-chart-line text-blue-500"></i>
                    Measures & KPIs
                 </h3>
                 <div className="flex gap-2">
                    {canEdit && (
                      <button 
                        onClick={() => { setShowManualAdd(!showManualAdd); setSuggestions([]); }}
                        className="text-[10px] font-bold text-slate-600 uppercase flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors"
                      >
                        <i className="fas fa-plus"></i>
                        Manual Add
                      </button>
                    )}
                    {canEdit && (
                      <button 
                        onClick={handleSuggest}
                        disabled={isSuggesting}
                        className="text-[10px] font-bold text-blue-600 uppercase flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <i className={`fas fa-wand-magic-sparkles ${isSuggesting ? 'animate-spin' : ''}`}></i>
                        AI Suggestions
                      </button>
                    )}
                 </div>
              </div>

              {/* Manual Add Form */}
              {showManualAdd && (
                <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-4 animate-in slide-in-from-top-4 duration-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">New Strategic Measurement</span>
                    <button onClick={() => setShowManualAdd(false)} className="text-slate-400 hover:text-slate-600">
                       <i className="fas fa-times text-xs"></i>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <input 
                        type="text" 
                        placeholder="Measure Name (e.g., Monthly Recurring Revenue)" 
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                        value={manualMeasure.name}
                        onChange={e => setManualMeasure({...manualMeasure, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <input 
                        type="text" 
                        placeholder="Success Target" 
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={manualMeasure.target}
                        onChange={e => setManualMeasure({...manualMeasure, target: e.target.value})}
                      />
                    </div>
                    <div>
                      <select 
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={manualMeasure.cadence}
                        onChange={e => setManualMeasure({...manualMeasure, cadence: e.target.value as any})}
                      >
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Quarterly">Quarterly</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <textarea 
                        placeholder="Definition & data source details..." 
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-light h-20 resize-none"
                        value={manualMeasure.definition}
                        onChange={e => setManualMeasure({...manualMeasure, definition: e.target.value})}
                      />
                    </div>
                  </div>
                  <button 
                    onClick={handleAddManual}
                    className="w-full py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all text-xs"
                  >
                    Add Measurement
                  </button>
                </div>
              )}

              {/* AI Suggestions */}
              {suggestions.length > 0 && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-4">
                   <div className="flex items-center gap-2">
                      <i className="fas fa-sparkles text-blue-500 text-xs"></i>
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">AI Recommendations:</p>
                   </div>
                   {suggestions.map((s, i) => (
                     <div key={i} className="bg-blue-50/50 border border-blue-100 p-5 rounded-2xl flex justify-between items-start gap-4 shadow-sm hover:bg-blue-50 transition-colors">
                        <div className="flex-1">
                           <p className="font-bold text-blue-900 text-sm">{s.name}</p>
                           <p className="text-xs text-blue-700 mt-1 font-light leading-relaxed">{s.definition}</p>
                           <p className="text-[10px] font-bold text-blue-800 mt-3 tracking-tight bg-blue-100/50 w-fit px-2 py-0.5 rounded">Target: {s.threshold}</p>
                        </div>
                        <button 
                          onClick={() => handleAddSuggested(s)}
                          className="p-2 bg-white text-blue-600 rounded-xl border border-blue-200 hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-90"
                          title="Add this KPI"
                        >
                           <i className="fas fa-plus"></i>
                        </button>
                     </div>
                   ))}
                </div>
              )}

              {/* List of existing measures */}
              <div className="space-y-4">
                 {outcomeMeasures.map(m => (
                    <div key={m.id} className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm space-y-4 group hover:border-blue-200 transition-all hover:shadow-md">
                       <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                             <div className="flex items-center gap-2 mb-1.5">
                                <h4 className="font-bold text-slate-900">{m.name}</h4>
                                <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">{m.cadence}</span>
                             </div>
                             <p className="text-xs text-slate-500 font-light leading-relaxed line-clamp-2">{m.definition}</p>
                          </div>
                          {canEdit && (
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                               <button 
                                 onClick={() => setEditingMeasure(m)}
                                 className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                               >
                                 <i className="fas fa-pen text-xs"></i>
                               </button>
                               <button 
                                 onClick={() => window.confirm('Delete this measure?') && onDeleteMeasure(m.id)}
                                 className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                               >
                                 <i className="fas fa-trash-alt text-xs"></i>
                               </button>
                            </div>
                          )}
                       </div>
                       <div className="flex items-center gap-10 pt-4 border-t border-slate-50">
                          <div>
                             <p className="text-[9px] font-bold text-slate-400 uppercase mb-1 tracking-widest">Target Objective</p>
                             <p className="text-sm font-bold text-blue-600">{m.target}</p>
                          </div>
                          <div>
                             <p className="text-[9px] font-bold text-slate-400 uppercase mb-1 tracking-widest">Data Source</p>
                             <p className="text-sm font-bold text-slate-700">{m.source_type}</p>
                          </div>
                       </div>
                    </div>
                 ))}
                 {outcomeMeasures.length === 0 && !isSuggesting && suggestions.length === 0 && !showManualAdd && (
                   <div className="py-20 text-center bg-slate-50 border-2 border-dashed border-slate-100 rounded-[2rem]">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                         <i className="fas fa-chart-bar text-slate-300"></i>
                      </div>
                      <p className="text-sm text-slate-400 italic">No strategic measurements defined.</p>
                      <p className="text-[10px] text-slate-300 mt-1 uppercase font-bold">Use AI suggestions or add manually above.</p>
                   </div>
                 )}
              </div>
           </section>
        </div>

        {/* Edit Measure Modal */}
        {editingMeasure && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <header className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Adjust KPI Measure</h3>
                <button onClick={() => setEditingMeasure(null)} className="text-slate-400 hover:text-slate-600">
                  <i className="fas fa-times"></i>
                </button>
              </header>
              <div className="p-8 space-y-6 text-slate-700">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Measure Name</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                    value={editingMeasure.name}
                    onChange={e => handleUpdateMeasureLocal({ name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Definition</label>
                  <textarea 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed font-light"
                    rows={3}
                    value={editingMeasure.definition}
                    onChange={e => handleUpdateMeasureLocal({ definition: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Target Value</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-600"
                      value={editingMeasure.target}
                      onChange={e => handleUpdateMeasureLocal({ target: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Cadence</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      value={editingMeasure.cadence}
                      onChange={e => handleUpdateMeasureLocal({ cadence: e.target.value as any })}
                    >
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Data Source</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={editingMeasure.source_type}
                    onChange={e => handleUpdateMeasureLocal({ source_type: e.target.value as any })}
                  >
                    <option value="Manual">Manual Entry</option>
                    <option value="Sheet">Google Sheet</option>
                    <option value="Integration">Third Party Integration</option>
                  </select>
                </div>
                <div className="pt-4">
                  <button 
                    onClick={saveEditedMeasure}
                    className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-95"
                  >
                    Update Measure
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutcomeDetail;


import React, { useState } from 'react';
import { Outcome1Y, Theme, User, Measure } from '../types';
import { THEMES } from '../constants';

interface OutcomesProps {
  outcomes: Outcome1Y[];
  measures: Measure[];
  users: User[];
  currentUser: User;
  onSelectOutcome: (outcome: Outcome1Y) => void;
}

const Outcomes: React.FC<OutcomesProps> = ({ outcomes, measures, users, currentUser, onSelectOutcome }) => {
  const [filterTheme, setFilterTheme] = useState('all');

  const filteredOutcomes = outcomes.filter(o => 
    filterTheme === 'all' || o.theme_id === filterTheme
  );

  const getHealthCount = (status: string) => outcomes.filter(o => o.status === status).length;

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Strategic Outcomes</h1>
          <p className="text-slate-500 mt-1">Measuring the real-world impact of our strategic pillars.</p>
        </div>
        <div className="flex gap-4">
           <div className="flex bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
              {[
                { label: 'Green', color: 'emerald', count: getHealthCount('Green') },
                { label: 'Yellow', color: 'amber', count: getHealthCount('Yellow') },
                { label: 'Red', color: 'rose', count: getHealthCount('Red') },
              ].map(s => (
                <div key={s.label} className="px-3 py-1.5 flex items-center gap-2 border-r last:border-0 border-slate-100">
                  <span className={`w-2 h-2 rounded-full bg-${s.color}-500`}></span>
                  <span className="text-xs font-bold text-slate-700">{s.count}</span>
                </div>
              ))}
           </div>
           {currentUser.role !== 'Viewer' && (
             <button className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-900/10 transition-all">
                Define New Outcome
             </button>
           )}
        </div>
      </header>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        <button 
          onClick={() => setFilterTheme('all')}
          className={`px-4 py-2 rounded-full text-xs font-bold border transition-all whitespace-nowrap ${
            filterTheme === 'all' 
              ? 'bg-slate-900 text-white border-slate-900' 
              : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
          }`}
        >
          All Themes
        </button>
        {THEMES.map(theme => (
          <button 
            key={theme.id}
            onClick={() => setFilterTheme(theme.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold border transition-all whitespace-nowrap ${
              filterTheme === theme.id 
                ? `bg-${theme.color}-600 text-white border-${theme.color}-600 shadow-lg shadow-${theme.color}-900/10` 
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
            }`}
          >
            {theme.name}
          </button>
        ))}
      </div>

      {/* Grouped View */}
      <div className="space-y-12">
        {THEMES.filter(t => filterTheme === 'all' || t.id === filterTheme).map(theme => {
          const themeOutcomes = filteredOutcomes.filter(o => o.theme_id === theme.id);
          if (themeOutcomes.length === 0 && filterTheme !== 'all') return null;
          
          return (
            <section key={theme.id} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-1 h-6 bg-${theme.color}-500 rounded-full`}></div>
                <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider">{theme.name}</h2>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{themeOutcomes.length}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {themeOutcomes.map(outcome => {
                  const outcomeMeasures = measures.filter(m => m.outcome_id === outcome.id);
                  const owner = users.find(u => outcome.owner_user_ids.includes(u.id));
                  
                  return (
                    <div 
                      key={outcome.id} 
                      onClick={() => onSelectOutcome(outcome)}
                      className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group flex flex-col h-full"
                    >
                      <div className="p-6 flex-1 space-y-4">
                        <div className="flex justify-between items-start">
                           <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                             outcome.status === 'Green' ? 'bg-emerald-50 text-emerald-600' :
                             outcome.status === 'Yellow' ? 'bg-amber-50 text-amber-600' :
                             'bg-rose-50 text-rose-600'
                           }`}>
                             {outcome.status}
                           </div>
                           <span className="text-[10px] font-bold text-slate-400">Horizon: {outcome.time_horizon}</span>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight mb-2">
                            {outcome.title}
                          </h3>
                          <p className="text-sm text-slate-500 font-light line-clamp-2 leading-relaxed">
                            {outcome.description}
                          </p>
                        </div>

                        <div className="pt-4 border-t border-slate-50">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Linked Measures ({outcomeMeasures.length})</p>
                           {outcomeMeasures.length > 0 ? (
                             <div className="space-y-2">
                               {outcomeMeasures.map(m => (
                                 <div key={m.id} className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                                   <span className="text-xs font-semibold text-slate-700 truncate">{m.name}</span>
                                   <span className="text-xs font-bold text-blue-600">{m.target}</span>
                                 </div>
                               ))}
                             </div>
                           ) : (
                             <p className="text-xs text-slate-300 italic">No measures defined.</p>
                           )}
                        </div>
                      </div>

                      <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center rounded-b-2xl">
                         <div className="flex items-center gap-2">
                           <img src={owner?.avatar} className="w-6 h-6 rounded-full ring-2 ring-white" alt="" />
                           <span className="text-xs font-medium text-slate-500">{owner?.firstName}</span>
                         </div>
                         <div className="text-[10px] font-bold text-slate-400 uppercase">
                           Review: {outcome.last_reviewed_at}
                         </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {themeOutcomes.length === 0 && (
                 <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl py-12 flex flex-col items-center justify-center text-slate-400">
                    <i className="fas fa-bullseye text-2xl mb-2 opacity-20"></i>
                    <p className="text-xs font-bold uppercase tracking-widest">No outcomes for this pillar</p>
                 </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default Outcomes;

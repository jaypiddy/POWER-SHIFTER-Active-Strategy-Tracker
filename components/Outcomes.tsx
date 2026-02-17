
import React, { useState } from 'react';
import { Outcome1Y, Theme, User, Measure } from '../types';

interface OutcomesProps {
  outcomes: Outcome1Y[];
  measures: Measure[];
  users: User[];
  themes: Theme[];
  currentUser: User;
  onSelectOutcome: (outcome: Outcome1Y) => void;
  onNewOutcome: () => void;
}

const Outcomes: React.FC<OutcomesProps> = ({ outcomes, measures, users, themes, currentUser, onSelectOutcome, onNewOutcome }) => {
  const [filterTheme, setFilterTheme] = useState('all');
  const [filterUser, setFilterUser] = useState('all');

  const filteredOutcomes = outcomes.filter(o => 
    (filterTheme === 'all' || o.theme_id === filterTheme) &&
    (filterUser === 'all' || o.owner_user_ids.includes(filterUser))
  );

  const getHealthCount = (status: string) => outcomes.filter(o => o.status === status).length;

  // Get only users who actually own outcomes to keep the filter relevant
  const outcomeOwners = users.filter(u => outcomes.some(o => o.owner_user_ids.includes(u.id)));

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Strategic Outcomes</h1>
          <p className="text-slate-500 mt-1 font-light leading-relaxed">Measuring the real-world impact of our strategic pillars.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex bg-white rounded-2xl border border-slate-200 p-1 shadow-sm">
              {[
                { label: 'Green', color: 'emerald', count: getHealthCount('Green') },
                { label: 'Yellow', color: 'amber', count: getHealthCount('Yellow') },
                { label: 'Red', color: 'rose', count: getHealthCount('Red') },
              ].map(s => (
                <div key={s.label} className="px-4 py-2 flex items-center gap-2.5 border-r last:border-0 border-slate-100">
                  <span className={`w-2.5 h-2.5 rounded-full bg-${s.color}-500 shadow-sm shadow-${s.color}-500/20`}></span>
                  <span className="text-xs font-bold text-slate-700">{s.count}</span>
                </div>
              ))}
           </div>
           {currentUser.role !== 'Viewer' && (
             <button 
               onClick={onNewOutcome}
               className="px-8 py-3.5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-900/20 transition-all active:scale-95 flex items-center gap-2"
             >
                <i className="fas fa-plus-circle text-xs"></i>
                Define Outcome
             </button>
           )}
        </div>
      </header>

      {/* Filter Control Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        {/* Theme Filters */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Filter by Theme</label>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button 
              onClick={() => setFilterTheme('all')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold border transition-all whitespace-nowrap ${
                filterTheme === 'all' 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/10' 
                  : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-300'
              }`}
            >
              All Strategic Themes
            </button>
            {themes.map(theme => (
              <button 
                key={theme.id}
                onClick={() => setFilterTheme(theme.id)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold border transition-all whitespace-nowrap flex items-center gap-2 ${
                  filterTheme === theme.id 
                    ? `bg-${theme.color}-600 text-white border-${theme.color}-600 shadow-lg shadow-${theme.color}-900/10` 
                    : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-300'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${filterTheme === theme.id ? 'bg-white' : `bg-${theme.color}-500`}`}></span>
                {theme.name}
              </button>
            ))}
          </div>
        </div>

        {/* User Filters */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Filter by Owner</label>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            <button 
              onClick={() => setFilterUser('all')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold border transition-all whitespace-nowrap ${
                filterUser === 'all' 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/10' 
                  : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-300'
              }`}
            >
              Everyone
            </button>
            {outcomeOwners.map(user => (
              <button 
                key={user.id}
                onClick={() => setFilterUser(user.id)}
                className={`group px-4 py-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap flex items-center gap-3 ${
                  filterUser === user.id 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-900/10' 
                    : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-300'
                }`}
              >
                <img 
                  src={user.avatar} 
                  className={`w-6 h-6 rounded-full border-2 ${filterUser === user.id ? 'border-blue-400' : 'border-white'} transition-colors`} 
                  alt="" 
                />
                <span>{user.firstName} {user.lastName}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grouped View */}
      <div className="space-y-12">
        {themes.filter(t => filterTheme === 'all' || t.id === filterTheme).map(theme => {
          const themeOutcomes = filteredOutcomes.filter(o => o.theme_id === theme.id);
          if (themeOutcomes.length === 0) return null;
          
          return (
            <section key={theme.id} className="space-y-6">
              <div className="flex items-center gap-4">
                <div className={`w-1.5 h-8 bg-${theme.color}-500 rounded-full shadow-sm`}></div>
                <h2 className="text-xl font-bold text-slate-800 uppercase tracking-widest">{theme.name}</h2>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{themeOutcomes.length} Active</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {themeOutcomes.map(outcome => {
                  const outcomeMeasures = measures.filter(m => m.outcome_id === outcome.id);
                  const owner = users.find(u => outcome.owner_user_ids.includes(u.id));
                  
                  return (
                    <div 
                      key={outcome.id} 
                      onClick={() => onSelectOutcome(outcome)}
                      className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-900/5 hover:-translate-y-1 transition-all cursor-pointer group flex flex-col h-full overflow-hidden"
                    >
                      <div className="p-10 flex-1 space-y-6">
                        <div className="flex justify-between items-center">
                           <div className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${
                             outcome.status === 'Green' ? 'bg-emerald-50 text-emerald-600' :
                             outcome.status === 'Yellow' ? 'bg-amber-50 text-amber-600' :
                             'bg-rose-50 text-rose-600'
                           }`}>
                             {outcome.status}
                           </div>
                           <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">Horizon: {outcome.time_horizon}</span>
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug mb-3">
                            {outcome.title}
                          </h3>
                          <p className="text-sm text-slate-500 font-light line-clamp-2 leading-relaxed">
                            {outcome.description}
                          </p>
                        </div>

                        <div className="pt-6 border-t border-slate-50">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Strategic Measures ({outcomeMeasures.length})</p>
                           {outcomeMeasures.length > 0 ? (
                             <div className="space-y-3">
                               {outcomeMeasures.slice(0, 2).map(m => (
                                 <div key={m.id} className="flex justify-between items-center bg-slate-50/50 px-4 py-2.5 rounded-xl border border-slate-100">
                                   <span className="text-xs font-bold text-slate-700 truncate">{m.name}</span>
                                   <span className="text-xs font-bold text-blue-600">{m.target}</span>
                                 </div>
                               ))}
                               {outcomeMeasures.length > 2 && (
                                 <p className="text-[10px] text-slate-400 font-medium text-center">+ {outcomeMeasures.length - 2} more measures</p>
                               )}
                             </div>
                           ) : (
                             <p className="text-xs text-slate-300 italic font-light">No measures defined.</p>
                           )}
                        </div>
                      </div>

                      <div className="px-10 py-6 bg-slate-50/50 border-t border-slate-50 flex justify-between items-center">
                         <div className="flex items-center gap-3">
                           <img src={owner?.avatar} className="w-8 h-8 rounded-full ring-4 ring-white shadow-sm" alt="" />
                           <div className="flex flex-col">
                             <span className="text-xs font-bold text-slate-700">{owner?.firstName} {owner?.lastName}</span>
                             <span className="text-[9px] font-bold text-slate-400 uppercase">Primary Owner</span>
                           </div>
                         </div>
                         <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                           Last Sync: {outcome.last_reviewed_at}
                         </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        {filteredOutcomes.length === 0 && (
          <div className="py-24 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-search text-3xl text-slate-200"></i>
            </div>
            <h3 className="text-lg font-bold text-slate-400">No outcomes match these filters.</h3>
            <p className="text-sm text-slate-300 font-light mt-1">Adjust your theme or owner selection to see results.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Outcomes;

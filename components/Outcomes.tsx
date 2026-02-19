
import React, { useState } from 'react';
import { Outcome1Y, Theme, User, Measure } from '../types';
import GenericFilterBar from './GenericFilterBar';
import { StrategyNode } from './StrategyNode';

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
  const [search, setSearch] = useState('');
  const [filterTheme, setFilterTheme] = useState('all');
  const [filterUser, setFilterUser] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredOutcomes = outcomes.filter(o =>
    (filterTheme === 'all' || o.theme_id === filterTheme) &&
    (filterUser === 'all' || o.owner_user_ids.includes(filterUser)) &&
    (filterStatus === 'all' || o.status === filterStatus) &&
    (search === '' || o.title.toLowerCase().includes(search.toLowerCase()))
  );

  const getHealthCount = (status: string) => outcomes.filter(o => o.status === status).length;

  // Get only users who actually own outcomes to keep the filter relevant
  const outcomeOwners = users.filter(u => outcomes.some(o => o.owner_user_ids.includes(u.id)));

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Strategic Outcomes</h1>
          <p className="text-slate-400 mt-1 font-light leading-relaxed">Measuring the real-world impact of our strategic pillars.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-900 rounded-2xl border border-slate-800 p-1 shadow-sm">
            {[
              { label: 'Green', color: 'emerald', count: getHealthCount('Green') },
              { label: 'Yellow', color: 'amber', count: getHealthCount('Yellow') },
              { label: 'Red', color: 'rose', count: getHealthCount('Red') },
            ].map(s => (
              <div key={s.label} className="px-4 py-2 flex items-center gap-2.5 border-r last:border-0 border-slate-800">
                <span className={`w-2.5 h-2.5 rounded-full bg-${s.color}-500 shadow-sm shadow-${s.color}-500/20`}></span>
                <span className="text-xs font-bold text-slate-300">{s.count}</span>
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
      <GenericFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search outcomes..."
        themes={themes}
        selectedTheme={filterTheme}
        onThemeChange={setFilterTheme}
        users={outcomeOwners}
        selectedUser={filterUser}
        onUserChange={setFilterUser}
        statusOptions={[
          { label: 'Green', value: 'Green' },
          { label: 'Yellow', value: 'Yellow' },
          { label: 'Red', value: 'Red' }
        ]}
        selectedStatus={filterStatus}
        onStatusChange={setFilterStatus}
        statusLabel="All Statuses"
      />

      {/* Grouped View */}
      <div className="space-y-12">
        {themes.filter(t => filterTheme === 'all' || t.id === filterTheme).map(theme => {
          const themeOutcomes = filteredOutcomes.filter(o => o.theme_id === theme.id);
          if (themeOutcomes.length === 0) return null;

          return (
            <section key={theme.id} className="space-y-6">
              <div className="flex items-center gap-4">
                <div className={`w-1.5 h-8 bg-${theme.color}-500 rounded-full shadow-sm`}></div>
                <h2 className="text-xl font-bold text-slate-200 uppercase tracking-widest">{theme.name}</h2>
                <span className="text-xs font-bold text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">{themeOutcomes.length} Active</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {themeOutcomes.map(outcome => {
                  const outcomeMeasures = measures.filter(m => m.outcome_id === outcome.id);
                  const owner = users.find(u => outcome.owner_user_ids.includes(u.id));

                  return (
                    <div
                      key={outcome.id}
                      onClick={() => onSelectOutcome(outcome)}
                      className="bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-1 transition-all cursor-pointer group flex flex-col h-full overflow-hidden"
                    >
                      <div className="p-10 flex-1 space-y-6">
                        <div className="flex justify-between items-center">
                          <div className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${outcome.status === 'Green' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            outcome.status === 'Yellow' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                              'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                            {outcome.status}
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-2 py-1 rounded border border-slate-700">Horizon: {outcome.time_horizon}</span>
                        </div>

                        <div>
                          <h3 className="text-xl font-bold text-slate-100 group-hover:text-blue-400 transition-colors leading-snug mb-3">
                            {outcome.title}
                          </h3>
                          <p className="text-sm text-slate-400 font-light line-clamp-2 leading-relaxed">
                            {outcome.description}
                          </p>
                        </div>

                        <div className="pt-6 border-t border-slate-800">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Strategic Measures ({outcomeMeasures.length})</p>
                          {outcomeMeasures.length > 0 ? (
                            <div className="space-y-4">
                              {outcomeMeasures.map(m => (
                                <StrategyNode
                                  key={m.id}
                                  item={m}
                                  type="measure"
                                  isActive={false}
                                  isDimmed={false}
                                  themeColor={undefined}
                                  users={users}
                                  className="!mb-0 shadow-sm hover:shadow-md" // Override default margin and shadow
                                />
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-600 italic font-light">No measures defined.</p>
                          )}
                        </div>
                      </div>

                      <div className="px-10 py-6 bg-slate-800/30 border-t border-slate-800 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <img src={owner?.avatar} className="w-8 h-8 rounded-full ring-2 ring-slate-700 bg-slate-800" alt="" />
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-300">{owner?.firstName} {owner?.lastName}</span>
                            <span className="text-[9px] font-bold text-slate-500 uppercase">Primary Owner</span>
                          </div>
                        </div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
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
          <div className="py-24 text-center bg-slate-900 rounded-[3rem] border border-dashed border-slate-800">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-search text-3xl text-slate-600"></i>
            </div>
            <h3 className="text-lg font-bold text-slate-300">No outcomes match these filters.</h3>
            <p className="text-sm text-slate-500 font-light mt-1">Adjust your theme or owner selection to see results.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Outcomes;

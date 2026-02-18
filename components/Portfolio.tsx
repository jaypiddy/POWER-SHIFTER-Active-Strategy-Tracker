import React, { useState } from 'react';
import { Bet, User, Theme } from '../types';

interface PortfolioProps {
  bets: Bet[];
  users: User[];
  themes: Theme[];
  onSelectBet: (bet: Bet) => void;
  onNewBet: () => void;
  onDeleteBet: (id: string) => void;
  onArchiveBet: (bet: Bet) => void;
  currentUser: User;
}

const Portfolio: React.FC<PortfolioProps> = ({ bets, users, themes, onSelectBet, onNewBet, onDeleteBet, onArchiveBet, currentUser }) => {
  const [search, setSearch] = useState('');
  const [filterTheme, setFilterTheme] = useState('all');
  const [betToDelete, setBetToDelete] = useState<Bet | null>(null);
  const [expandedBets, setExpandedBets] = useState<Set<string>>(new Set());

  const canModify = currentUser.role === 'Admin' || currentUser.role === 'Editor';

  const filteredBets = bets.filter(bet => {
    const matchesSearch = bet.title.toLowerCase().includes(search.toLowerCase());
    const matchesTheme = filterTheme === 'all' || bet.theme_id === filterTheme;
    return matchesSearch && matchesTheme;
  });

  const handleDeleteConfirm = () => {
    if (betToDelete) {
      onDeleteBet(betToDelete.id);
      setBetToDelete(null);
    }
  };

  const toggleExpand = (betId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedBets);
    if (newExpanded.has(betId)) {
      newExpanded.delete(betId);
    } else {
      newExpanded.add(betId);
    }
    setExpandedBets(newExpanded);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Strategic Bets</h1>
          <p className="text-slate-400 mt-1">Managing {bets.length} high-stakes strategic investments.</p>
        </div>
        {canModify && (
          <button
            onClick={onNewBet}
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-900/10 transition-all flex items-center gap-2"
          >
            <i className="fas fa-plus"></i>
            New Strategic Bet
          </button>
        )}
      </header>

      {/* Filters */}
      <div className="bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-800 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[300px] relative">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
          <input
            type="text"
            placeholder="Search bets by title..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-11 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-600"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm font-medium text-slate-300 focus:outline-none"
            value={filterTheme}
            onChange={(e) => setFilterTheme(e.target.value)}
          >
            <option value="all">All Themes</option>
            {themes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
      </div>

      {/* Bets Table */}
      <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950 border-b border-slate-800">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Strategic Bet</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Theme</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Owner</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Stage</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Progress</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredBets.map((bet) => {
              const theme = themes.find(t => t.id === bet.theme_id);
              const owner = users.find(u => bet.owner_user_ids.includes(u.id));
              const isArchived = bet.stage === 'Archived';
              const isCompleted = bet.stage === 'Completed';
              const isExpanded = expandedBets.has(bet.id);
              const hasTasks = bet.actions && bet.actions.length > 0;

              return (
                <React.Fragment key={bet.id}>
                  <tr
                    onClick={() => onSelectBet(bet)}
                    className={`hover:bg-slate-800/50 cursor-pointer transition-colors group ${isArchived ? 'opacity-60 bg-slate-900' : ''} ${isExpanded ? 'bg-slate-800/30' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {hasTasks && (
                          <button
                            onClick={(e) => toggleExpand(bet.id, e)}
                            className={`p-1 text-slate-500 hover:text-blue-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                          >
                            <i className="fas fa-chevron-right text-xs"></i>
                          </button>
                        )}
                        {!hasTasks && <div className="w-5"></div>}
                        <div>
                          <p className={`font-bold ${isArchived ? 'text-slate-500' : 'text-slate-200'} group-hover:text-blue-400 transition-colors`}>{bet.title}</p>
                          <p className="text-[9px] text-slate-500 mt-0.5 uppercase font-bold tracking-wider">{bet.bet_type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-${theme?.color || 'slate'}-500/10 text-${theme?.color || 'slate'}-400 border border-${theme?.color || 'slate'}-500/20`}>
                        {theme?.name || 'Unassigned'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {owner ? (
                        <div className="flex items-center gap-2">
                          <img src={owner.avatar} className="w-6 h-6 rounded-full bg-slate-800 ring-2 ring-slate-700" alt="" />
                          <span className="text-xs font-bold text-slate-300">{owner.firstName}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-600 font-light italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${bet.stage === 'Blocked' ? 'bg-rose-500' :
                          bet.stage === 'In Progress' ? 'bg-blue-500' :
                            bet.stage === 'Completed' ? 'bg-emerald-500' :
                              isArchived ? 'bg-slate-600' : 'bg-slate-500'
                          }`}></span>
                        <span className={`text-xs font-bold ${isArchived ? 'text-slate-500' : 'text-slate-300'}`}>{bet.stage}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 w-48">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full ${bet.stage === 'Blocked' ? 'bg-rose-500' : 'bg-blue-500'}`} style={{ width: `${bet.progress}%` }}></div>
                        </div>
                        <span className="text-xs font-bold text-slate-500">{bet.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {canModify && !isArchived && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Archive "${bet.title}"? This moves it to the strategic history.`)) {
                                onArchiveBet(bet);
                              }
                            }}
                            className={`p-2 rounded-lg text-slate-500 hover:text-amber-500 hover:bg-amber-500/10 transition-all ${isCompleted ? 'text-amber-500' : ''}`}
                            title="Archive Bet"
                          >
                            <i className="fas fa-box-archive"></i>
                          </button>
                        )}
                        {canModify && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setBetToDelete(bet);
                            }}
                            className="p-2 rounded-lg text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                            title="Delete Permanently"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        )}
                        {!canModify && <span className="text-xs text-slate-600 px-2 py-1 bg-slate-800 rounded">LOCKED</span>}
                      </div>
                    </td>
                  </tr>

                  {isExpanded && bet.actions && (
                    <tr className="bg-slate-900/50">
                      <td colSpan={6} className="px-6 pb-6 pt-2">
                        <div className="pl-8 border-l-2 border-slate-800 space-y-3">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Bet Tasks</p>
                          {bet.actions.map(action => {
                            const assignee = users.find(u => u.id === action.owner_id);
                            return (
                              <div key={action.id} className="flex items-center gap-4 bg-slate-950/50 p-3 rounded-lg border border-slate-800/50 hover:border-slate-700 transition-colors transform hover:translate-x-1 duration-200">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-bold text-slate-300">{action.title}</h4>
                                    <span className="text-[9px] font-bold text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">{action.tshirt_size}</span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] text-slate-500">
                                      <i className="far fa-calendar mr-1"></i>
                                      {action.due_date || 'No Date'}
                                    </span>
                                    {assignee && (
                                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                        <i className="fas fa-user-circle"></i>
                                        {assignee.firstName}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="w-32 flex items-center gap-3">
                                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500" style={{ width: `${action.progress}%` }}></div>
                                  </div>
                                  <span className="text-[10px] font-bold text-slate-500">{action.progress}%</span>
                                </div>
                              </div>
                            );
                          })}
                          {bet.actions.length === 0 && (
                            <p className="text-sm text-slate-600 italic">No tasks yet.</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
        {filteredBets.length === 0 && (
          <div className="p-20 text-center">
            <i className="fas fa-inbox text-slate-700 text-5xl mb-4"></i>
            <p className="text-slate-500 font-medium italic">No strategic bets found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {betToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <header className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-rose-50/50">
              <h3 className="text-xs font-bold text-rose-400 uppercase tracking-widest flex items-center gap-2">
                <i className="fas fa-triangle-exclamation"></i>
                Confirm Permanent Deletion
              </h3>
              <button onClick={() => setBetToDelete(null)} className="text-rose-500 hover:text-rose-400 transition-colors">
                <i className="fas fa-times"></i>
              </button>
            </header>
            <div className="p-8 space-y-6 text-center">
              <p className="text-sm text-slate-400 leading-relaxed font-light">
                Are you sure you want to delete <strong className="text-slate-200">"{betToDelete.title}"</strong>?
                This action will permanently remove all associated tasks, history, and discussions from the platform.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setBetToDelete(null)}
                  className="flex-1 py-3 border border-slate-700 text-slate-400 font-bold rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
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

export default Portfolio;

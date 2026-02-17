
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Strategic Bets</h1>
          <p className="text-slate-500 mt-1">Managing {bets.length} high-stakes strategic investments.</p>
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
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[300px] relative">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input 
            type="text"
            placeholder="Search bets by title..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-11 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <select 
            className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 focus:outline-none"
            value={filterTheme}
            onChange={(e) => setFilterTheme(e.target.value)}
          >
            <option value="all">All Themes</option>
            {themes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
      </div>

      {/* Bets Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Strategic Bet</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Theme</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Owner</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Stage</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Progress</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredBets.map((bet) => {
              const theme = themes.find(t => t.id === bet.theme_id);
              const owner = users.find(u => bet.owner_user_ids.includes(u.id));
              const isArchived = bet.stage === 'Archived';
              const isCompleted = bet.stage === 'Completed';

              return (
                <tr 
                  key={bet.id} 
                  onClick={() => onSelectBet(bet)}
                  className={`hover:bg-slate-50/80 cursor-pointer transition-colors group ${isArchived ? 'opacity-60 bg-slate-50/30' : ''}`}
                >
                  <td className="px-6 py-4">
                    <p className={`font-bold ${isArchived ? 'text-slate-500' : 'text-slate-800'} group-hover:text-blue-600 transition-colors`}>{bet.title}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5 uppercase font-bold tracking-wider">{bet.bet_type}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-${theme?.color || 'slate'}-50 text-${theme?.color || 'slate'}-700`}>
                       {theme?.name || 'Unassigned'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {owner ? (
                      <div className="flex items-center gap-2">
                        <img src={owner.avatar} className="w-6 h-6 rounded-full bg-slate-100 ring-2 ring-white" alt="" />
                        <span className="text-xs font-bold text-slate-700">{owner.firstName}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-300 font-light italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        bet.stage === 'Blocked' ? 'bg-rose-500' : 
                        bet.stage === 'In Progress' ? 'bg-blue-500' : 
                        bet.stage === 'Completed' ? 'bg-emerald-500' : 
                        isArchived ? 'bg-slate-400' : 'bg-slate-300'
                      }`}></span>
                      <span className={`text-xs font-bold ${isArchived ? 'text-slate-400' : 'text-slate-700'}`}>{bet.stage}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 w-48">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
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
                          className={`p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all ${isCompleted ? 'text-amber-500' : ''}`}
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
                          className="p-2 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all"
                          title="Delete Permanently"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      )}
                      {!canModify && <span className="text-xs text-slate-300 px-2 py-1 bg-slate-100 rounded">LOCKED</span>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredBets.length === 0 && (
          <div className="p-20 text-center">
            <i className="fas fa-inbox text-slate-200 text-5xl mb-4"></i>
            <p className="text-slate-500 font-medium italic">No strategic bets found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {betToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
           <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <header className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-rose-50/50">
                 <h3 className="text-xs font-bold text-rose-800 uppercase tracking-widest flex items-center gap-2">
                    <i className="fas fa-triangle-exclamation"></i>
                    Confirm Permanent Deletion
                 </h3>
                 <button onClick={() => setBetToDelete(null)} className="text-rose-400 hover:text-rose-600 transition-colors">
                    <i className="fas fa-times"></i>
                 </button>
              </header>
              <div className="p-8 space-y-6 text-center">
                 <p className="text-sm text-slate-600 leading-relaxed font-light">
                    Are you sure you want to delete <strong className="text-slate-900">"{betToDelete.title}"</strong>? 
                    This action will permanently remove all associated tasks, history, and discussions from the platform.
                 </p>
                 
                 <div className="flex gap-3">
                    <button 
                      onClick={() => setBetToDelete(null)}
                      className="flex-1 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
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

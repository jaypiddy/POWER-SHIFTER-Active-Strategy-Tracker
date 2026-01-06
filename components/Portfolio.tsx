
import React, { useState } from 'react';
import { Bet, User } from '../types';
import { THEMES, BET_STAGES } from '../constants';

interface PortfolioProps {
  bets: Bet[];
  users: User[];
  onSelectBet: (bet: Bet) => void;
  onNewBet: () => void;
  currentUser: User;
}

const Portfolio: React.FC<PortfolioProps> = ({ bets, users, onSelectBet, onNewBet, currentUser }) => {
  const [search, setSearch] = useState('');
  const [filterTheme, setFilterTheme] = useState('all');
  
  const canCreate = currentUser.role === 'Admin' || currentUser.role === 'Editor';

  const filteredBets = bets.filter(bet => {
    const matchesSearch = bet.title.toLowerCase().includes(search.toLowerCase());
    const matchesTheme = filterTheme === 'all' || bet.theme_id === filterTheme;
    return matchesSearch && matchesTheme;
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Strategic Bets</h1>
          <p className="text-slate-500 mt-1">Managing {bets.length} high-stakes strategic investments.</p>
        </div>
        {canCreate && (
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
            placeholder="Search bets by title, hypothesis or owner..."
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
            {THEMES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
      </div>

      {/* Bets Table-like View */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Strategic Bet</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Theme</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Owner</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Stage</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Progress</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Size</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredBets.map((bet) => {
              const theme = THEMES.find(t => t.id === bet.theme_id);
              const owner = users.find(u => bet.owner_user_ids.includes(u.id));
              return (
                <tr 
                  key={bet.id} 
                  onClick={() => onSelectBet(bet)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                >
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{bet.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5 uppercase font-medium tracking-wide">{bet.bet_type}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-${theme?.color}-50 text-${theme?.color}-700`}>
                       {theme?.name}
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
                        bet.stage === 'Completed' ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}></span>
                      <span className="text-xs font-bold text-slate-700">{bet.stage}</span>
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
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                      {bet.tshirt_size}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredBets.length === 0 && (
          <div className="p-20 text-center">
            <i className="fas fa-search text-slate-200 text-5xl mb-4"></i>
            <p className="text-slate-500 font-medium">No strategic bets found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Portfolio;

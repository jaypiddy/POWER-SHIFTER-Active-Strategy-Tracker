
import React, { useState } from 'react';
import { Bet, User, BetType, BetTimebox, TshirtSize, Theme } from '../types';
import { TIMEBOXES } from '../constants';

interface BetCreateProps {
  onClose: () => void;
  onCreate: (bet: Bet) => void;
  currentUser: User;
  themes: Theme[];
  initialThemeId?: string;
}

const BetCreate: React.FC<BetCreateProps> = ({ onClose, onCreate, currentUser, themes, initialThemeId }) => {
  const [formData, setFormData] = useState({
    title: '',
    theme_id: initialThemeId || (themes.length > 0 ? themes[0].id : ''),
    bet_type: 'Delivery' as BetType,
    problem_statement: '',
    hypothesis: '',
    timebox: 'H1' as BetTimebox,
    tshirt_size: 'M' as TshirtSize,
    start_date: new Date().toISOString().split('T')[0],
    completion_date: '',
  });

  const selectedTheme = themes.find(t => t.id === formData.theme_id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newBet: Bet = {
      id: `b-${Date.now()}`,
      workspace_id: 'w1',
      title: formData.title,
      theme_id: formData.theme_id,
      linked_outcome_ids: [],
      bet_type: formData.bet_type,
      problem_statement: formData.problem_statement,
      hypothesis: formData.hypothesis,
      success_signals: '',
      risks_assumptions: '',
      stage: 'Idea',
      timebox: formData.timebox,
      start_date: formData.start_date,
      completion_date: formData.completion_date,
      estimated_completion: formData.timebox === 'H1' ? 'Q2 2024' : 'Q4 2024',
      tshirt_size: formData.tshirt_size,
      progress: 0,
      actions: [],
      owner_user_ids: [currentUser.id],
      stakeholder_user_ids: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    onCreate(newBet);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <header className={`px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-${selectedTheme?.color || 'slate'}-50/50`}>
          <div>
            <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">New Strategic Bet</h2>
            <p className="text-sm text-slate-500 font-light mt-0.5">Define your hypothesis-driven strategic investment.</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <i className="fas fa-times text-lg"></i>
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[75vh] no-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Bet Title</label>
              <input 
                required
                autoFocus
                type="text" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="e.g., AI strategy copilot integration"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Strategic Pillar (Theme)</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                value={formData.theme_id}
                onChange={e => setFormData({...formData, theme_id: e.target.value})}
              >
                {themes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Bet Type</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                value={formData.bet_type}
                onChange={e => setFormData({...formData, bet_type: e.target.value as BetType})}
              >
                <option value="Delivery">Delivery (Scaling core value)</option>
                <option value="Discovery">Discovery (Exploring unknowns)</option>
                <option value="Enablement">Enablement (Supporting systems)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Start Date</label>
              <input 
                type="date"
                required
                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.start_date}
                onChange={e => setFormData({...formData, start_date: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">End Date (Target)</label>
              <input 
                type="date"
                required
                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.completion_date}
                onChange={e => setFormData({...formData, completion_date: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Problem Statement</label>
            <textarea 
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed font-light"
              rows={3}
              value={formData.problem_statement}
              onChange={e => setFormData({...formData, problem_statement: e.target.value})}
              placeholder="What current constraint or opportunity are we addressing?"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Timebox Horizon</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.timebox}
                onChange={e => setFormData({...formData, timebox: e.target.value as BetTimebox})}
              >
                {TIMEBOXES.map(tb => <option key={tb} value={tb}>{tb === 'H1' ? 'Horizon 1 (Now)' : tb === 'H2' ? 'Horizon 2 (Next)' : 'Backlog'}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Initial Size (Effort)</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.tshirt_size}
                onChange={e => setFormData({...formData, tshirt_size: e.target.value as TshirtSize})}
              >
                <option value="S">S - Small (Low effort)</option>
                <option value="M">M - Medium (Moderate)</option>
                <option value="L">L - Large (Significant)</option>
                <option value="XL">XL - Extra Large (Heavy)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-4 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={`flex-1 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 shadow-xl shadow-slate-900/20 transition-all active:scale-95 flex items-center justify-center gap-2`}
            >
              <i className="fas fa-rocket text-xs"></i>
              Commit to Bet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BetCreate;

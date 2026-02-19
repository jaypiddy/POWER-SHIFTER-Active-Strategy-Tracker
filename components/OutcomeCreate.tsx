
import React, { useState } from 'react';
import { Outcome1Y, User, Status, Theme } from '../types';

interface OutcomeCreateProps {
  onClose: () => void;
  onCreate: (outcome: Outcome1Y) => void;
  currentUser: User;
  users: User[];
  themes: Theme[];
}

const OutcomeCreate: React.FC<OutcomeCreateProps> = ({ onClose, onCreate, currentUser, users, themes }) => {
  const [formData, setFormData] = useState({
    title: '',
    theme_id: themes.length > 0 ? themes[0].id : '',
    time_horizon: new Date().getFullYear().toString(),
    owner_id: currentUser.id,
  });

  const selectedTheme = themes.find(t => t.id === formData.theme_id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newOutcome: Outcome1Y = {
      id: `o-${Date.now()}`,
      workspace_id: 'w1',
      theme_id: formData.theme_id,
      title: formData.title,
      description: '', // Description (Core Definition) removed from UI, defaulting to empty
      time_horizon: formData.time_horizon,
      status: 'Green',
      owner_user_ids: [formData.owner_id],
      last_reviewed_at: new Date().toISOString().split('T')[0],
    };
    onCreate(newOutcome);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex justify-end">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        <header className={`px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-${selectedTheme?.color || 'slate'}-50/50`}>
          <div>
            <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Define Strategic Outcome</h2>
            <p className="text-sm text-slate-500 font-light mt-0.5">Set a measurable goal for your strategic pillar.</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <i className="fas fa-times text-lg"></i>
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[75vh] no-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Outcome Title</label>
              <input
                required
                autoFocus
                type="text"
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none font-bold placeholder:text-slate-400"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Expand Market Share by 20%"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Strategic Pillar (Theme)</label>
              <select
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                value={formData.theme_id}
                onChange={e => setFormData({ ...formData, theme_id: e.target.value })}
              >
                {themes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Primary Owner</label>
              <select
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                value={formData.owner_id}
                onChange={e => setFormData({ ...formData, owner_id: e.target.value })}
              >
                {users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Target Year / Horizon</label>
              <input
                type="text"
                required
                className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.time_horizon}
                onChange={e => setFormData({ ...formData, time_horizon: e.target.value })}
                placeholder="e.g., 2024"
              />
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
              className={`flex-1 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-xl shadow-blue-900/20 transition-all active:scale-95 flex items-center justify-center gap-2`}
            >
              <i className="fas fa-bullseye text-xs"></i>
              Define Outcome
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OutcomeCreate;

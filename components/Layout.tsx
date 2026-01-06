
import React from 'react';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  onSwitchRole: (role: User['role']) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, currentUser, onSwitchRole }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie' },
    { id: 'canvas', label: 'Strategy Canvas', icon: 'fa-map' },
    { id: 'portfolio', label: 'Strategic Bets', icon: 'fa-briefcase' },
    { id: 'outcomes', label: 'Outcomes', icon: 'fa-bullseye' },
    { id: 'rhythms', label: 'Rhythms', icon: 'fa-calendar-check' },
    { id: 'team', label: 'Team', icon: 'fa-users' },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <i className="fas fa-bolt text-sm"></i>
          </div>
          <span className="font-bold text-lg tracking-tight uppercase">Power Shifter</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <i className={`fas ${item.icon} w-5`}></i>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Role Switcher (Simulator) */}
        <div className="px-4 py-4 border-t border-slate-800">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-3">Simulator: Switch Role</p>
          <div className="flex gap-1 px-2">
            {(['Admin', 'Editor', 'Viewer'] as const).map(role => (
              <button
                key={role}
                onClick={() => onSwitchRole(role)}
                className={`flex-1 py-1 text-[10px] font-bold rounded transition-colors ${
                  currentUser.role === role ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {role[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-slate-800 space-y-4">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'profile' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <i className="fas fa-cog"></i>
            Profile & Settings
          </button>
          
          <div className="flex items-center gap-3 px-1">
            <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden ring-2 ring-blue-500/20">
              <img src={currentUser.avatar} alt={`${currentUser.firstName} ${currentUser.lastName}`} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{currentUser.firstName} {currentUser.lastName}</p>
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{currentUser.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50 p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

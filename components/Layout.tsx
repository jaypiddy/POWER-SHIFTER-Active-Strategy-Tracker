import React, { useState, useEffect } from 'react';
import { User } from '../types';
import {
  PieChart,
  Map,
  Briefcase,
  Target,
  CalendarCheck,
  Users,
  Zap,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Search
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  onSwitchRole: (role: User['role']) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, currentUser, onSwitchRole }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile menu on tab change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [activeTab]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: PieChart },
    { id: 'explorer', label: 'Strategy Explorer', icon: Search },
    { id: 'canvas', label: 'Strategy Canvas', icon: Map },
    { id: 'portfolio', label: 'Strategic Bets', icon: Briefcase },
    { id: 'outcomes', label: 'Outcomes', icon: Target },
    { id: 'rhythms', label: 'Rhythms', icon: CalendarCheck },
    { id: 'team', label: 'Team', icon: Users },
  ];

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleMobileMenu = () => setIsMobileOpen(!isMobileOpen);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-50">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-3">
          <img src="/ps-wordmark.png" alt="Power Shifter" className="h-6 w-auto object-contain" />
        </div>
        <button
          onClick={toggleMobileMenu}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-colors"
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile Drawer */}
      <aside
        className={`fixed md:relative z-50 inset-y-0 left-0 bg-slate-950/50 border-r border-slate-800 flex flex-col backdrop-blur-xl transition-all duration-300 ease-in-out overflow-x-hidden
          ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
          ${isCollapsed ? 'md:w-20' : 'md:w-64'}
        `}
      >
        {/* Sidebar Header (Desktop) */}
        <div className={`p-6 border-b border-slate-800 hidden md:flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} overflow-x-hidden h-20`}>
          {isCollapsed ? (
            <div className="w-8 h-8 flex items-center justify-center shrink-0">
              <img src="/PS-Logo-TheShiftyShift-2021-RGB-Blue.png" alt="PS" className="w-full h-full object-contain" />
            </div>
          ) : (
            <img src="/ps-wordmark.png" alt="Power Shifter" className="h-6 w-auto object-contain" />
          )}
        </div>

        {/* Mobile Header Spacer */}
        <div className="md:hidden h-16" />

        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto overflow-x-hidden scrollbar-hide">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 group relative ${activeTab === item.id
                ? 'bg-slate-800 text-green-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 hover:border-slate-800 border border-transparent'
                }`}
              title={isCollapsed ? item.label : ''}
            >
              <item.icon className={`w-5 h-5 shrink-0 ${activeTab === item.id ? 'text-green-500' : 'text-slate-500'} ${isCollapsed ? '' : ''}`} />
              {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">{item.label}</span>}

              {/* Tooltip for Collapsed Mode */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-slate-200 text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-slate-700 shadow-xl">
                  {item.label}
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* Desktop Collapse Toggle */}
        <div className="hidden md:flex p-4 border-t border-slate-800 justify-end">
          <button
            onClick={toggleSidebar}
            className={`p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors ${isCollapsed ? 'mx-auto' : ''}`}
          >
            {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>
        </div>

        {/* Role Switcher (Simulator) */}
        {!isCollapsed && (
          <div className="px-4 py-4 border-t border-slate-800">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-3 whitespace-nowrap">Simulator: Switch Role</p>
            <div className="flex gap-1 px-2">
              {(['Admin', 'Editor', 'Viewer'] as const).map(role => (
                <button
                  key={role}
                  onClick={() => onSwitchRole(role)}
                  aria-label={`Switch to ${role} role`}
                  className={`flex-1 py-1 text-[10px] font-bold rounded transition-colors outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-900 ${currentUser.role === role ? 'bg-green-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                >
                  {role[0]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* User Profile Footer */}
        <div className={`p-4 border-t border-slate-800 space-y-4 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-lg text-xs font-bold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${activeTab === 'profile' ? 'bg-slate-800 text-green-400' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            title="Profile & Settings"
          >
            <Settings className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span className="whitespace-nowrap">Profile & Settings</span>}
          </button>

          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-1`}>
            <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden ring-2 ring-slate-700 shrink-0">
              <img src={currentUser.avatar} alt={`${currentUser.firstName} ${currentUser.lastName}`} className="w-full h-full object-cover" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-slate-200">{currentUser.firstName} {currentUser.lastName}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{currentUser.role}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-950 pt-16 md:pt-0 scrollbar-hide">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

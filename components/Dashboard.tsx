
import React, { useState } from 'react';
import { Bet, Outcome1Y, RhythmSession, User, Theme } from '../types';
import { generateStrategyReport } from '../services/geminiService';
import StrategyReport from './StrategyReport';

interface DashboardProps {
  bets: Bet[];
  outcomes: Outcome1Y[];
  sessions: RhythmSession[];
  currentUser: User;
  themes: Theme[];
  onNewBet: (themeId?: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ bets, outcomes, sessions, currentUser, themes, onNewBet }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<string | null>(null);

  const activeBets = bets.filter(b => !['Completed', 'Archived'].includes(b.stage));
  const inProgressBets = bets.filter(b => b.stage === 'In Progress');
  const blockedBets = bets.filter(b => b.stage === 'Blocked');
  
  // Calculate Strategic Debt & Coverage Gap
  const coveredOutcomeIds = new Set(activeBets.flatMap(b => b.linked_outcome_ids));
  const orphanedOutcomes = outcomes.filter(o => !coveredOutcomeIds.has(o.id));
  const coveragePercent = outcomes.length > 0 
    ? Math.round(((outcomes.length - orphanedOutcomes.length) / outcomes.length) * 100) 
    : 100;

  const atRiskBets = bets.filter(b => b.stage === 'Blocked' || (b.progress < 50 && b.estimated_completion.includes('Q2')));
  
  const canAct = currentUser.role !== 'Viewer';

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const report = await generateStrategyReport(outcomes, bets);
      setReportData(report || null);
    } catch (error) {
      console.error("Failed to generate report:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Executive Snapshot</h1>
          <p className="text-slate-500 mt-1">Hello, {currentUser.firstName}. You have {currentUser.role} access.</p>
        </div>
        {canAct && (
           <button 
             onClick={handleGenerateReport}
             disabled={isGenerating}
             className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-50"
           >
              {isGenerating ? (
                <>
                  <i className="fas fa-circle-notch animate-spin"></i>
                  Synthesizing...
                </>
              ) : (
                <>
                  <i className="fas fa-file-contract text-blue-400"></i>
                  Quarterly Report
                </>
              )}
           </button>
        )}
      </header>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Active Bets', value: activeBets.length, color: 'blue', icon: 'fa-play' },
          { label: 'Blocked Items', value: blockedBets.length, color: 'rose', icon: 'fa-ban' },
          { label: 'Strategic Coverage', value: `${coveragePercent}%`, color: coveragePercent < 70 ? 'amber' : 'emerald', icon: 'fa-shield-halved' },
          { label: 'Orphaned Goals', value: orphanedOutcomes.length, color: orphanedOutcomes.length > 0 ? 'amber' : 'slate', icon: 'fa-link-slash' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-blue-200 transition-colors group">
            <div className={`w-10 h-10 rounded-lg bg-${stat.color}-50 flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
              <i className={`fas ${stat.icon} text-${stat.color}-600`}></i>
            </div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Strategic Debt & Gap Analysis Section */}
      {orphanedOutcomes.length > 0 && (
        <section className="bg-amber-50/30 border border-amber-100 rounded-2xl p-6 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
                <i className="fas fa-triangle-exclamation"></i>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 leading-none">Strategic Debt Alert</h2>
                <p className="text-xs text-amber-700 font-medium mt-1 uppercase tracking-wider">Identified {orphanedOutcomes.length} Coverage Gaps</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded uppercase">Action Required</span>
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-6 max-w-2xl font-light">
            These strategic outcomes are currently "orphaned"—they have no active bets committed to them. 
            This represents a failure to execute against declared strategy.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {orphanedOutcomes.map(o => {
              const theme = themes.find(t => t.id === o.theme_id);
              return (
                <div key={o.id} className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm flex flex-col justify-between hover:border-amber-400 transition-colors cursor-default">
                  <div>
                    <span className={`text-[9px] font-bold uppercase text-${theme?.color || 'slate'}-600 bg-${theme?.color || 'slate'}-50 px-1.5 py-0.5 rounded mb-2 inline-block`}>
                      {theme?.name || 'Unassigned'}
                    </span>
                    <h4 className="font-bold text-slate-800 text-sm leading-snug">{o.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1 italic font-light">{o.description}</p>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button 
                      onClick={() => onNewBet(o.theme_id)}
                      className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <i className="fas fa-plus-circle"></i> Create Bet
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Outcome Health */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Outcomes Health by Theme</h3>
              <button className="text-blue-600 text-sm font-medium hover:underline">View All</button>
            </div>
            <div className="p-6 space-y-4">
              {themes.map((theme) => {
                const themeOutcomes = outcomes.filter(o => o.theme_id === theme.id);
                const status = themeOutcomes.some(o => o.status === 'Red') ? 'Red' : themeOutcomes.some(o => o.status === 'Yellow') ? 'Yellow' : 'Green';
                return (
                  <div key={theme.id} className="flex items-center gap-4 group">
                    <div className="w-2.5 h-12 bg-slate-100 rounded-full overflow-hidden flex flex-col justify-end">
                      <div className={`w-full h-1/2 bg-${status === 'Red' ? 'rose' : status === 'Yellow' ? 'amber' : 'emerald'}-500`}></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-end mb-1">
                        <span className="font-semibold text-slate-700">{theme.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${
                          status === 'Green' ? 'bg-emerald-100 text-emerald-700' : 
                          status === 'Yellow' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                        }`}>{status}</span>
                      </div>
                      <div className="text-sm text-slate-500 truncate">
                        {themeOutcomes.length} linked outcomes
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Priority Attention: At-Risk Bets</h3>
            </div>
            <div className="p-0">
              {atRiskBets.length > 0 ? (
                atRiskBets.map((bet) => (
                  <div key={bet.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors border-b last:border-0 border-slate-50">
                    <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
                      <i className="fas fa-exclamation-triangle text-rose-500"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{bet.title}</p>
                      <p className="text-xs text-slate-500">Targeted for {bet.estimated_completion} • Currently {bet.progress}%</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-rose-600 uppercase bg-rose-100 px-2 py-1 rounded">{bet.stage}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-slate-400">
                  <i className="fas fa-check-circle text-4xl mb-3 text-emerald-100"></i>
                  <p>All bets performing as expected.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Rhythms & Recent */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-xl shadow-lg p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <i className="fas fa-history text-blue-400"></i>
              Upcoming Rhythm
            </h3>
            {sessions.filter(s => s.status === 'Planned').map(s => (
              <div key={s.id} className="mb-4 last:mb-0 border-l-2 border-blue-500 pl-4 py-1">
                <p className="font-semibold">{s.name}</p>
                <p className="text-sm text-slate-400">{new Date(s.scheduled_at).toLocaleDateString()} @ 10:00 AM</p>
                {canAct && (
                  <button className="mt-3 w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-2 rounded-lg transition-colors">
                    Join Session
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-800 mb-4">Strategic Pulse</h3>
            <div className="space-y-4">
              <div className="relative pl-6 pb-4 border-l border-slate-200">
                <div className="absolute -left-1 top-0 w-2 h-2 rounded-full bg-blue-500"></div>
                <p className="text-xs text-slate-400">2 hours ago</p>
                <p className="text-sm font-medium text-slate-700">Bet "AI Strategy Copilot" progress updated to 65%</p>
              </div>
              <div className="relative pl-6 pb-4 border-l border-slate-200">
                <div className="absolute -left-1 top-0 w-2 h-2 rounded-full bg-emerald-500"></div>
                <p className="text-xs text-slate-400">Yesterday</p>
                <p className="text-sm font-medium text-slate-700">New Outcome added: "Scalable Infrastructure Upgrade"</p>
              </div>
              <div className="relative pl-6 border-l border-slate-200">
                <div className="absolute -left-1 top-0 w-2 h-2 rounded-full bg-slate-300"></div>
                <p className="text-xs text-slate-400">3 days ago</p>
                <p className="text-sm font-medium text-slate-700">Quarterly Reset Version 2024.Q1 archived.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Strategy Report Modal */}
      {reportData && (
        <StrategyReport 
          content={reportData} 
          onClose={() => setReportData(null)} 
        />
      )}
    </div>
  );
};

export default Dashboard;

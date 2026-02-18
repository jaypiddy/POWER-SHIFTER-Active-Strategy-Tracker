import React, { useState } from 'react';
import { Bet, Outcome1Y, RhythmSession, User, Theme } from '../types';
import { generateStrategyReport } from '../services/geminiService';
import StrategyReport from './StrategyReport';
import {
  Play,
  Ban,
  Shield,
  Link2Off,
  AlertTriangle,
  PlusCircle,
  History,
  CheckCircle,
  FileText,
  Loader2,
  Activity,
  TrendingUp
} from 'lucide-react';

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
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Executive Snapshot</h1>
          <p className="text-slate-400 mt-1 font-medium">Hello, {currentUser.firstName}. You have <span className="text-green-400">{currentUser.role}</span> access.</p>
        </div>
        {canAct && (
          <button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="px-4 py-2 bg-slate-800 text-slate-200 border border-slate-700 text-sm font-bold rounded-lg hover:bg-slate-700 hover:text-white transition-all flex items-center gap-2 disabled:opacity-50 shadow-sm"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                Synthesizing...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 text-blue-400" />
                Quarterly Report
              </>
            )}
          </button>
        )}
      </header>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[minmax(140px,auto)]">

        {/* Strategic Coverage (Hero Metric) */}
        <div className="col-span-1 md:col-span-2 md:row-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition-all shadow-lg shadow-black/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <div className="flex flex-col h-full justify-between relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${coveragePercent < 70 ? 'bg-amber-500/10 text-amber-500' : 'bg-green-500/10 text-green-500'}`}>
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Strategic Coverage</h3>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-mono font-bold text-slate-100">{coveragePercent}%</span>
                <span className="text-sm text-slate-500 font-medium">of outcomes linked</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full mt-4 overflow-hidden" role="progressbar" aria-valuenow={coveragePercent} aria-valuemin={0} aria-valuemax={100} aria-label="Strategic Coverage Percentage">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${coveragePercent < 70 ? 'bg-gradient-to-r from-amber-600 to-amber-400' : 'bg-gradient-to-r from-green-600 to-green-400'
                    }`}
                  style={{ width: `${coveragePercent}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Bets */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500/30 transition-all hover:bg-slate-900/80 group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Active Bets</p>
              <h4 className="text-3xl font-mono font-bold text-white group-hover:text-blue-400 transition-colors">{activeBets.length}</h4>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <Play className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Blocked Items */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-rose-500/30 transition-all hover:bg-slate-900/80 group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Blocked</p>
              <h4 className="text-3xl font-mono font-bold text-white group-hover:text-rose-400 transition-colors">{blockedBets.length}</h4>
            </div>
            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500">
              <Ban className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Orphaned Goals */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-amber-500/30 transition-all hover:bg-slate-900/80 group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Orphaned</p>
              <h4 className="text-3xl font-mono font-bold text-white group-hover:text-amber-400 transition-colors">{orphanedOutcomes.length}</h4>
            </div>
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
              <Link2Off className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Upcoming Rhythm (Tall Card) */}
        <div className="md:row-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl"></div>
          <div className="flex items-center gap-2 mb-4">
            <History className="w-4 h-4 text-blue-400" />
            <h3 className="font-bold text-slate-300">Rhythm</h3>
          </div>

          <div className="flex-1 space-y-4">
            {sessions.filter(s => s.status === 'Planned').slice(0, 3).map(s => (
              <div key={s.id} className="relative pl-4 border-l-2 border-slate-700 py-1 hover:border-blue-500 transition-colors group">
                <p className="font-medium text-slate-200 text-sm group-hover:text-blue-300 transition-colors">{s.name}</p>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{new Date(s.scheduled_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>

          {canAct && (
            <button className="mt-4 w-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold py-2 rounded-lg transition-colors border border-slate-700">
              Join Session
            </button>
          )}
        </div>

      </div>

      {/* Strategic Debt Alert */}
      {orphanedOutcomes.length > 0 && (
        <section className="bg-amber-950/20 border border-amber-900/30 rounded-2xl p-6 animate-in slide-in-from-top-2 relative overflow-hidden">
          <div className="absolute left-0 top-0 w-1 h-full bg-amber-600"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-900/40 text-amber-500 flex items-center justify-center border border-amber-500/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-amber-100 leading-none">Strategic Debt Alert</h2>
                <p className="text-xs text-amber-500/80 font-medium mt-1 uppercase tracking-wider">Identified {orphanedOutcomes.length} Coverage Gaps</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-amber-950 bg-amber-500 px-2 py-1 rounded uppercase">Action Required</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {orphanedOutcomes.map(o => {
              const theme = themes.find(t => t.id === o.theme_id);
              return (
                <div key={o.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between hover:border-amber-500/30 transition-colors group">
                  <div>
                    <span className={`text-[9px] font-bold uppercase text-slate-900 px-1.5 py-0.5 rounded mb-2 inline-block`} style={{ backgroundColor: theme?.color ? '#e2e8f0' : '#f1f5f9' }}>
                      {theme?.name || 'Unassigned'}
                    </span>
                    <h4 className="font-bold text-slate-200 text-sm leading-snug">{o.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 italic font-light group-hover:text-slate-300">{o.description}</p>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => onNewBet(o.theme_id)}
                      className="text-[10px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                    >
                      <PlusCircle className="w-3 h-3" /> Create Bet
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
          <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/30">
              <h3 className="font-bold text-slate-200 flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-500" />
                Outcomes Health by Theme
              </h3>
              <button className="text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors">View All</button>
            </div>
            <div className="p-6 space-y-4">
              {themes.map((theme) => {
                const themeOutcomes = outcomes.filter(o => o.theme_id === theme.id);
                const status = themeOutcomes.some(o => o.status === 'Red') ? 'Red' : themeOutcomes.some(o => o.status === 'Yellow') ? 'Yellow' : 'Green';
                return (
                  <div key={theme.id} className="flex items-center gap-4 group">
                    <div className="w-2.5 h-12 bg-slate-800 rounded-full overflow-hidden flex flex-col justify-end">
                      <div className={`w-full h-1/2 ${status === 'Red' ? 'bg-rose-500' : status === 'Yellow' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-end mb-1">
                        <span className="font-semibold text-slate-300 group-hover:text-white transition-colors">{theme.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${status === 'Green' ? 'bg-emerald-500/10 text-emerald-400' :
                          status === 'Yellow' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
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

          <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/30">
              <h3 className="font-bold text-slate-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                Priority Attention: At-Risk Bets
              </h3>
            </div>
            <div className="p-0">
              {atRiskBets.length > 0 ? (
                atRiskBets.map((bet) => (
                  <div key={bet.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-800/50 transition-colors border-b last:border-0 border-slate-800 group">
                    <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0 border border-rose-500/20 group-hover:border-rose-500/40 transition-colors">
                      <AlertTriangle className="w-5 h-5 text-rose-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-200 truncate group-hover:text-white">{bet.title}</p>
                      <p className="text-xs text-slate-500 font-mono">Target: {bet.estimated_completion} • <span className="text-slate-400">{bet.progress}%</span></p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-rose-400 uppercase bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20">{bet.stage}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-slate-500">
                  <CheckCircle className="w-12 h-12 mb-3 text-emerald-500/20 mx-auto" />
                  <p>All bets performing as expected.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Recent Activity */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-800 p-6">
            <h3 className="font-bold text-slate-200 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              Strategic Pulse
            </h3>
            <div className="space-y-4">
              <div className="relative pl-6 pb-4 border-l border-slate-800 group">
                <div className="absolute -left-1 top-1 w-2 h-2 rounded-full bg-blue-500 ring-4 ring-slate-900 group-hover:ring-blue-500/20 transition-all"></div>
                <p className="text-xs text-slate-500 font-mono mb-1">2 hours ago</p>
                <p className="text-sm font-medium text-slate-300 group-hover:text-slate-100 transition-colors">Bet "AI Strategy Copilot" progress updated to 65%</p>
              </div>
              <div className="relative pl-6 pb-4 border-l border-slate-800 group">
                <div className="absolute -left-1 top-1 w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-slate-900 group-hover:ring-emerald-500/20 transition-all"></div>
                <p className="text-xs text-slate-500 font-mono mb-1">Yesterday</p>
                <p className="text-sm font-medium text-slate-300 group-hover:text-slate-100 transition-colors">New Outcome added: "Scalable Infrastructure Upgrade"</p>
              </div>
              <div className="relative pl-6 border-l border-slate-800 group">
                <div className="absolute -left-1 top-1 w-2 h-2 rounded-full bg-slate-600 ring-4 ring-slate-900"></div>
                <p className="text-xs text-slate-500 font-mono mb-1">3 days ago</p>
                <p className="text-sm font-medium text-slate-300 group-hover:text-slate-100 transition-colors">Quarterly Reset Version 2024.Q1 archived.</p>
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

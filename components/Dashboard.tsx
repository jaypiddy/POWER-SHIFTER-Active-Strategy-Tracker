import React, { useState } from 'react';
import { Bet, Outcome1Y, RhythmSession, User, Theme } from '../types';
import { generateStrategyReport } from '../services/geminiService';
import StrategyReport from './StrategyReport';
import ActivityFeed from './ActivityFeed';
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
  TrendingUp,
  Info
} from 'lucide-react';
import { InfoTooltip } from './InfoTooltip';

interface DashboardProps {
  bets: Bet[];
  outcomes: Outcome1Y[];
  sessions: RhythmSession[];
  currentUser: User;
  themes: Theme[];
  onNewBet: (themeId?: string) => void;
  onNavigate?: (entityId: string, tab?: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ bets, outcomes, sessions, currentUser, themes, onNewBet, onNavigate }) => {
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(140px,auto)]">

        {/* Strategic Coverage (Hero Metric) */}
        <div className="col-span-1 md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 relative group hover:border-slate-700 transition-all shadow-lg shadow-black/20">
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
          </div>

          <div className="absolute top-6 right-6 z-20">
            <InfoTooltip
              what="Tracking how many of your 1-Year Outcomes are directly supported by Active Bets."
              good="> 80% coverage. Most goals have an action plan."
              bad="< 50%. You have goals that are just wishes without a plan."
            />
          </div>

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

        {/* Upcoming Rhythm (Tall Card - Now same row height/priority) */}
        <div className="col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col relative">
          <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl"></div>
          </div>

          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-blue-400" />
              <h3 className="font-bold text-slate-300">Rhythm</h3>
            </div>
            <div>
              <InfoTooltip
                what="Adherence to your strategic operating cadence and meeting schedule."
                good="Consistent sessions and documented outcomes."
                bad="Missed meetings or 'zombie' standing meetings with no value."
              />
            </div>
          </div>

          <div className="flex-1 space-y-4 relative z-10">
            {sessions.filter(s => s.status === 'Planned').slice(0, 3).map(s => (
              <div key={s.id} className="relative pl-4 border-l-2 border-slate-700 py-1 hover:border-blue-500 transition-colors group">
                <p className="font-medium text-slate-200 text-sm group-hover:text-blue-300 transition-colors">{s.name}</p>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{new Date(s.scheduled_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>

          {canAct && (
            <button className="mt-4 w-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold py-2 rounded-lg transition-colors border border-slate-700 relative z-10">
              Join Session
            </button>
          )}
        </div>

        {/* Row 2: Active Bets, Blocked, Orphaned */}
        {/* Active Bets */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500/30 transition-all hover:bg-slate-900/80 group relative">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Bets</p>
                <InfoTooltip
                  what="The number of strategic initiatives currently in flight (In Progress)."
                  good="3-5 per team. Focused execution."
                  bad="> 7 per team. Context switching kills momentum."
                />
              </div>
              <h4 className="text-3xl font-mono font-bold text-white group-hover:text-blue-400 transition-colors">{activeBets.length}</h4>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <Play className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Orphaned Goals - Moved here per request */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-amber-500/30 transition-all hover:bg-slate-900/80 group relative">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Orphaned Bets</p>
                <InfoTooltip
                  what="1-Year Outcomes that have NO active bets linked to them."
                  good="0. Every goal has a plan."
                  bad="> 0. You are hoping for results rather than planning for them."
                />
              </div>
              <h4 className="text-3xl font-mono font-bold text-white group-hover:text-amber-400 transition-colors">{orphanedOutcomes.length}</h4>
            </div>
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
              <Link2Off className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Blocked Items */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-rose-500/30 transition-all hover:bg-slate-900/80 group relative">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Blocked Bets</p>
                <InfoTooltip
                  what="Bets that cannot proceed due to external dependencies or issues."
                  good="0. Flow is unimpeded."
                  bad="> 0. Strategy is stalled. Needs unblocking immediately."
                />
              </div>
              <h4 className="text-3xl font-mono font-bold text-white group-hover:text-rose-400 transition-colors">{blockedBets.length}</h4>
            </div>
            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500">
              <Ban className="w-5 h-5" />
            </div>
          </div>
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

      {/* Right Col: Active Strategy Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* System Balance (Adaptive Cycle) */}
        <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-800 p-6 relative">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              System Balance
            </h3>
            <InfoTooltip
              what="The mix of work types: Renewal (Discovery), Growth (Delivery), and Maturity (Enablement)."
              good="A balanced mix appropriate for your stage (e.g., 30/50/20)."
              bad="100% Delivery (Feature Factory) or 100% Discovery (Science Project)."
            />
          </div>

          <div className="space-y-4">
            {/* Distribution Bar */}
            <div className="flex h-4 rounded-full overflow-hidden w-full">
              {['Discovery', 'Delivery', 'Enablement'].map((type) => {
                const count = activeBets.filter(b => b.bet_type === type).length;
                const pct = activeBets.length > 0 ? (count / activeBets.length) * 100 : 0;
                const color = type === 'Discovery' ? 'bg-purple-500' : type === 'Delivery' ? 'bg-blue-500' : 'bg-emerald-500';

                if (pct === 0) return null;

                return (
                  <div key={type} style={{ width: `${pct}%` }} className={`${color} hover:opacity-90 transition-opacity relative group`}>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                      <span className="text-[10px] font-bold text-white shadow-sm">{Math.round(pct)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: 'Renewal (Discovery)', type: 'Discovery', color: 'bg-purple-500', desc: 'Exploration' },
                { label: 'Growth (Delivery)', type: 'Delivery', color: 'bg-blue-500', desc: 'Execution' },
                { label: 'Maturity (Enablement)', type: 'Enablement', color: 'bg-emerald-500', desc: 'Systems' }
              ].map(item => {
                const count = activeBets.filter(b => b.bet_type === item.type).length;
                return (
                  <div key={item.type} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                      <span className="text-slate-300 font-medium">{item.label}</span>
                    </div>
                    <span className="text-slate-500 font-mono">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Lethargy Detector (Stale Bets) */}
        <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-800 relative">
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/30 flex justify-between items-center rounded-t-xl">
            <h3 className="font-bold text-slate-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Lethargy Detector
            </h3>
            <InfoTooltip
              what="Identifies 'Active' bets that haven't had any updates for > 30 days."
              good="0 Stagnant bets. High velocity."
              bad="Stagnant bets exist. These are 'Zombie Projects' eating resources."
            />
          </div>

          <div className="p-0">
            {(() => {
              const staleThreshold = new Date();
              staleThreshold.setDate(staleThreshold.getDate() - 30);
              const staleBets = activeBets.filter(b => b.stage === 'In Progress' && new Date(b.updated_at) < staleThreshold);

              if (staleBets.length === 0) {
                return (
                  <div className="p-8 text-center">
                    <div className="w-12 h-12 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Activity className="w-6 h-6 text-slate-600" />
                    </div>
                    <p className="text-sm text-slate-400 font-medium">All active bets are moving.</p>
                    <p className="text-xs text-slate-600 mt-1">No stagnation detected (&gt;30 days).</p>
                  </div>
                );
              }

              return (
                <div>
                  {staleBets.map(bet => {
                    const daysStale = Math.floor((new Date().getTime() - new Date(bet.updated_at).getTime()) / (1000 * 3600 * 24));
                    return (
                      <div key={bet.id} className="px-6 py-4 border-b last:border-0 border-slate-800 hover:bg-slate-800/30 transition-colors group">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="text-sm font-bold text-slate-300 group-hover:text-amber-400 transition-colors line-clamp-1">{bet.title}</h4>
                          <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                            {daysStale}d
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-mono">Last update: {new Date(bet.updated_at).toLocaleDateString()}</p>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Right Col: Activity Feed */}
      <div className="space-y-6">
        <ActivityFeed onNavigate={onNavigate} />
      </div>



      {/* Strategy Report Modal */}
      {
        reportData && (
          <StrategyReport
            content={reportData}
            onClose={() => setReportData(null)}
          />
        )
      }
    </div >
  );
};

export default Dashboard;

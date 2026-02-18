
import React, { useState, useRef, useEffect } from 'react';
import { RhythmSession, Bet, User, RhythmCadence, Comment } from '../types';
import { generateMeetingBrief, summarizeMeetingRecording, fetchMiroBoardName } from '../services/geminiService';

interface RhythmsProps {
  sessions: RhythmSession[];
  bets: Bet[];
  currentUser: User;
  onAddSession: (session: RhythmSession) => void;
  onUpdateSession: (session: RhythmSession) => void;
  users: User[];
  comments: Comment[];
}

const TITLES_MAPPING: Record<string, RhythmCadence> = {
  "Weekly Bet Check-in": "Weekly",
  "Monthly Progress Review": "Monthly",
  "Quarterly Strategy Reset": "Quarterly",
  "Annual Vision Session": "Yearly"
};

const STANDARD_TITLES = Object.keys(TITLES_MAPPING);

const Rhythms: React.FC<RhythmsProps> = ({ sessions, bets, currentUser, onAddSession, onUpdateSession, users, comments }) => {
  const [activeSession, setActiveSession] = useState<RhythmSession | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // UI View state
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [rhythmTab, setRhythmTab] = useState<'active' | 'archived'>('active');

  // Form state
  const [formName, setFormName] = useState('');
  const [isCustomTitle, setIsCustomTitle] = useState(false);
  const [formCadence, setFormCadence] = useState<RhythmCadence>('Weekly');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formMiro, setFormMiro] = useState('');
  const [isScrapingMiro, setIsScrapingMiro] = useState(false);

  // Live editing buffer
  const [liveNotes, setLiveNotes] = useState('');

  // Recording state
  const [isProcessingRecording, setIsProcessingRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canEdit = currentUser.role === 'Admin' || currentUser.role === 'Editor';

  // Sync liveNotes buffer when activeSession changes
  useEffect(() => {
    if (activeSession) {
      setLiveNotes(activeSession.notes || '');
    }
  }, [activeSession?.id]);

  // Handle Miro URL paste/change for automatic scraping
  useEffect(() => {
    const scrape = async () => {
      if (formMiro.includes('miro.com/app/board/') && !isScrapingMiro) {
        setIsScrapingMiro(true);
        const detectedName = await fetchMiroBoardName(formMiro);
        if (detectedName) {
          setIsCustomTitle(true);
          setFormName(detectedName);
          setFormCadence('Monthly');
        }
        setIsScrapingMiro(false);
      }
    };
    const timeoutId = setTimeout(scrape, 800);
    return () => clearTimeout(timeoutId);
  }, [formMiro]);

  const openCreateModal = () => {
    setFormName(STANDARD_TITLES[0]);
    setIsCustomTitle(false);
    setFormCadence(TITLES_MAPPING[STANDARD_TITLES[0]]);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormMiro('');
    setModalMode('create');
  };

  const openEditModal = (session: RhythmSession) => {
    const isStandard = STANDARD_TITLES.includes(session.name);
    setFormName(session.name);
    setIsCustomTitle(!isStandard);
    setFormCadence(session.cadence);
    setFormDate(new Date(session.scheduled_at).toISOString().split('T')[0]);
    setFormMiro(session.miro_link || '');
    setEditingSessionId(session.id);
    setModalMode('edit');
  };

  const startMeeting = async (session: RhythmSession) => {
    setActiveSession(session);
    setIsGenerating(true);
    try {
      const gBrief = await generateMeetingBrief(bets, comments, users);
      const updatedSession = { ...session, auto_brief: gBrief };
      await onUpdateSession(updatedSession);
      setActiveSession(updatedSession);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveLiveNotes = async () => {
    if (!activeSession) return;
    setIsSaving(true);
    try {
      const updated = { ...activeSession, notes: liveNotes };
      await onUpdateSession(updated);
      setActiveSession(updated);
    } catch (e) {
      alert("Error saving notes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchiveSession = (session: RhythmSession) => {
    onUpdateSession({ ...session, archived_at: new Date().toISOString() });
  };

  const handleUnarchiveSession = (session: RhythmSession) => {
    const { archived_at, ...rest } = session;
    onUpdateSession(rest as RhythmSession);
  };

  const handleSaveRhythm = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = formName || 'Unnamed Session';

    if (modalMode === 'create') {
      const session: RhythmSession = {
        id: `rs-${Date.now()}`,
        name: finalName,
        cadence: formCadence,
        scheduled_at: new Date(formDate).toISOString(),
        status: 'Planned',
        miro_link: formMiro,
      };
      onAddSession(session);
    } else if (modalMode === 'edit' && editingSessionId) {
      const existing = sessions.find(s => s.id === editingSessionId);
      if (existing) {
        onUpdateSession({
          ...existing,
          name: finalName,
          cadence: formCadence,
          scheduled_at: new Date(formDate).toISOString(),
          miro_link: formMiro,
        });
      }
    }
    setModalMode(null);
  };

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeSession) return;

    setIsProcessingRecording(true);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const summary = await summarizeMeetingRecording(base64Data, file.type, bets);
        const updated = { ...activeSession, recording_uri: summary || "Analysis failed." };
        await onUpdateSession(updated);
        setActiveSession(updated);
        setIsProcessingRecording(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setIsProcessingRecording(false);
      alert("Error processing recording.");
    }
  };

  const renderRichText = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('###')) return <h3 key={i} className="text-lg font-bold text-slate-900 mt-4 mb-2">{line.replace('###', '').trim()}</h3>;
      if (line.startsWith('##')) return <h2 key={i} className="text-xl font-bold text-slate-900 mt-6 mb-3 border-b border-slate-100 pb-1">{line.replace('##', '').trim()}</h2>;
      if (line.startsWith('#')) return <h1 key={i} className="text-2xl font-bold text-slate-900 mt-8 mb-4">{line.replace('#', '').trim()}</h1>;
      if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
        return (
          <div key={i} className="flex items-start gap-2 ml-4 mb-1">
            <span className="text-blue-500 font-bold">•</span>
            <span className="text-slate-700 leading-relaxed font-light">{line.replace(/^[-*]/, '').trim()}</span>
          </div>
        );
      }
      return line.trim() === '' ? <br key={i} /> : <p key={i} className="mb-2 text-slate-700 leading-relaxed font-light">{line}</p>;
    });
  };

  const filteredSessions = sessions.filter(s => rhythmTab === 'active' ? !s.archived_at : !!s.archived_at);

  if (activeSession) {
    return (
      <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
        <header className="flex justify-between items-center bg-slate-900 -mx-8 -mt-8 p-8 text-white">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-bold uppercase tracking-widest bg-blue-600 px-2 py-1 rounded">Meeting Mode</span>
              <span className="text-slate-600">/</span>
              <span className="text-xs font-medium text-slate-400">{activeSession.cadence} Session</span>
              {activeSession.miro_link && (
                <a href={activeSession.miro_link} target="_blank" rel="noopener noreferrer" className="text-xs font-bold bg-amber-500/20 text-amber-400 px-2 py-1 rounded border border-amber-500/30 flex items-center gap-1 hover:bg-amber-500/30 transition-colors">
                  <i className="fas fa-object-group"></i> Miro Board
                </a>
              )}
            </div>
            <h1 className="text-3xl font-bold">{activeSession.name}</h1>
          </div>
          <button onClick={() => { setActiveSession(null); setLiveNotes(''); }} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 transition-colors">
            Exit Session
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/30">
                <h3 className="font-bold text-slate-200 flex items-center gap-2">
                  <i className="fas fa-wand-magic-sparkles text-blue-500"></i>
                  Strategic Context (AI Brief)
                </h3>
                {activeSession.auto_brief && (
                  <button onClick={() => copyToClipboard(activeSession.auto_brief!)} className="text-xs font-bold text-slate-500 hover:text-blue-600 px-3 py-1.5 rounded-lg transition-all">
                    <i className={`fas ${copyFeedback ? 'fa-check text-emerald-500' : 'fa-copy'} mr-2`}></i>
                    Copy Brief
                  </button>
                )}
              </div>
              <div className="p-8 prose prose-slate prose-invert max-w-none min-h-[200px]">
                {isGenerating ? (
                  <div className="space-y-4">
                    <div className="h-4 bg-slate-800 rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-slate-800 rounded w-1/2 animate-pulse"></div>
                  </div>
                ) : (
                  <div className="text-slate-300">
                    {activeSession.auto_brief ? renderRichText(activeSession.auto_brief) : <p className="text-slate-500 italic">No briefing data found.</p>}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/30">
                <h3 className="font-bold text-slate-200 flex items-center gap-2">
                  <i className="fas fa-microphone-lines text-rose-500"></i>
                  Recording Synthesis
                </h3>
                <div className="flex items-center gap-3">
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="audio/*,video/*" />
                  <button onClick={() => fileInputRef.current?.click()} disabled={isProcessingRecording} className="text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700 px-4 py-2 rounded-xl hover:bg-slate-700 transition-colors flex items-center gap-2">
                    <i className="fas fa-upload"></i>
                    {isProcessingRecording ? 'Analyzing...' : 'Analyze Recording'}
                  </button>
                </div>
              </div>
              <div className="p-8 min-h-[100px]">
                {isProcessingRecording ? (
                  <div className="flex flex-col items-center justify-center py-10 space-y-4">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-bold text-slate-500 uppercase">Generating Strategic Summary...</p>
                  </div>
                ) : activeSession.recording_uri ? (
                  renderRichText(activeSession.recording_uri)
                ) : (
                  <p className="text-slate-500 text-sm italic text-center py-4">Upload a meeting file to store a permanent strategic summary.</p>
                )}
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/30">
                <h3 className="font-bold text-slate-200">Live Session Notes</h3>
                <button
                  onClick={handleSaveLiveNotes}
                  disabled={isSaving}
                  className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? <i className="fas fa-circle-notch animate-spin"></i> : <i className="fas fa-save"></i>}
                  Save Session Insights
                </button>
              </div>
              <div className="p-0">
                <textarea
                  value={liveNotes}
                  onChange={(e) => setLiveNotes(e.target.value)}
                  placeholder="Capture decisions, actions, and strategic learnings here..."
                  className="w-full h-64 bg-slate-900 border-none p-8 text-slate-300 focus:ring-0 outline-none leading-relaxed font-light resize-none placeholder:text-slate-600"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-950/40 rounded-2xl border border-slate-800 p-6">
              <h3 className="font-bold text-slate-300 mb-4 uppercase text-[10px] tracking-widest text-slate-500">Standard Agenda</h3>
              <ul className="space-y-4">
                {[
                  { t: 'Portfolio Alignment', d: 'Review health of current bets' },
                  { t: 'Blocker Deconstruction', d: 'Deep dive into red/yellow items' },
                  { t: 'Hypothesis Adjustment', d: 'Pivot or persevere based on evidence' }
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="w-6 h-6 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-400 shrink-0">{i + 1}</span>
                    <div>
                      <p className="text-sm font-bold text-slate-200 leading-tight">{item.t}</p>
                      <p className="text-[11px] text-slate-500 font-light mt-0.5">{item.d}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            {activeSession.miro_link && (
              <div className="bg-slate-900 rounded-2xl p-6 text-white overflow-hidden relative group">
                <div className="absolute top-0 right-0 -m-4 opacity-10 group-hover:scale-125 transition-transform"><i className="fas fa-object-group text-8xl"></i></div>
                <h3 className="font-bold mb-2 relative">Project Board</h3>
                <a href={activeSession.miro_link} target="_blank" rel="noopener noreferrer" className="relative block w-full bg-slate-800 text-white text-center font-bold py-3 rounded-xl hover:bg-slate-700 border border-slate-700 transition-colors">Launch Miro Board</a>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Strategic Rhythms</h1>
          <p className="text-slate-400 mt-1">Operationalize strategy through scheduled checkpoints.</p>

          <div className="flex mt-6 bg-slate-900 border border-slate-800 p-1 rounded-xl w-fit shadow-sm">
            <button
              onClick={() => setRhythmTab('active')}
              className={`px-5 py-2 text-xs font-bold rounded-lg transition-all ${rhythmTab === 'active' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-300'}`}
            >
              Active Cycles
            </button>
            <button
              onClick={() => setRhythmTab('archived')}
              className={`px-5 py-2 text-xs font-bold rounded-lg transition-all ${rhythmTab === 'archived' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-300'}`}
            >
              Archive
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-slate-950 rounded-xl p-1 border border-slate-800">
            <button
              onClick={() => setViewMode('card')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'card' ? 'bg-slate-800 shadow-sm text-blue-500' : 'text-slate-500'}`}
            >
              <i className="fas fa-th-large"></i>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-slate-800 shadow-sm text-blue-500' : 'text-slate-500'}`}
            >
              <i className="fas fa-list"></i>
            </button>
          </div>

          {canEdit && rhythmTab === 'active' && (
            <button
              onClick={openCreateModal}
              className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-900/10 transition-all flex items-center gap-2"
            >
              <i className="fas fa-plus text-xs"></i>
              Add Rhythm
            </button>
          )}
        </div>
      </header>

      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session) => (
            <div key={session.id} className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 overflow-hidden group hover:shadow-md transition-shadow relative">
              <div className="absolute top-4 right-4 flex gap-1 z-10">
                {canEdit && (
                  <button onClick={() => openEditModal(session)} className="p-2 bg-slate-800 text-slate-400 hover:text-blue-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" title="Edit Session">
                    <i className="fas fa-pen text-xs"></i>
                  </button>
                )}
                {canEdit && rhythmTab === 'active' && (
                  <button onClick={() => handleArchiveSession(session)} className="p-2 bg-slate-800 text-slate-400 hover:text-rose-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" title="Archive Session">
                    <i className="fas fa-box-archive text-xs"></i>
                  </button>
                )}
                {canEdit && rhythmTab === 'archived' && (
                  <button onClick={() => handleUnarchiveSession(session)} className="p-2 bg-slate-800 text-slate-400 hover:text-emerald-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" title="Restore Session">
                    <i className="fas fa-rotate-left text-xs"></i>
                  </button>
                )}
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${session.cadence === 'Yearly' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-800 text-slate-500 group-hover:bg-blue-500/10 group-hover:text-blue-400'}`}>
                    <i className={`fas ${session.cadence === 'Weekly' ? 'fa-bolt' : session.cadence === 'Monthly' ? 'fa-calendar' : session.cadence === 'Quarterly' ? 'fa-compass' : 'fa-gem'} text-xl`}></i>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${session.cadence === 'Weekly' ? 'bg-blue-500/10 text-blue-400' : session.cadence === 'Monthly' ? 'bg-amber-500/10 text-amber-400' : session.cadence === 'Yearly' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      {session.cadence}
                    </span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-1">{session.name}</h3>
                <p className="text-sm text-slate-400 mb-6 font-light">
                  {rhythmTab === 'active' ? `Targeted: ${new Date(session.scheduled_at).toLocaleDateString()}` : `Closed: ${new Date(session.archived_at!).toLocaleDateString()}`}
                </p>
                {rhythmTab === 'active' && (
                  <button onClick={() => startMeeting(session)} className="w-full py-3 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 bg-slate-900 text-white hover:bg-slate-800">
                    <i className="fas fa-play text-xs"></i>
                    Enter Meeting Mode
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Rhythm Cycle</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Frequency</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Date</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredSessions.map((session) => (
                <tr key={session.id} className="hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <i className={`fas ${session.cadence === 'Weekly' ? 'fa-bolt' : session.cadence === 'Monthly' ? 'fa-calendar' : session.cadence === 'Quarterly' ? 'fa-compass' : 'fa-gem'} text-slate-500`}></i>
                      <span className="font-bold text-slate-200">{session.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{session.cadence}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-400 font-light">{new Date(session.scheduled_at).toLocaleDateString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400">{session.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {rhythmTab === 'active' && (
                        <button onClick={() => startMeeting(session)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Start Meeting">
                          <i className="fas fa-play"></i>
                        </button>
                      )}
                      {canEdit && (
                        <button onClick={() => openEditModal(session)} className="p-2 text-slate-500 hover:text-blue-400 rounded-lg transition-colors" title="Edit">
                          <i className="fas fa-pen"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredSessions.length === 0 && (
        <div className="p-20 text-center bg-slate-900 rounded-2xl border-2 border-dashed border-slate-800">
          <i className="fas fa-calendar-alt text-slate-700 text-5xl mb-4"></i>
          <p className="text-slate-500 font-medium">No sessions scheduled.</p>
        </div>
      )}

      {modalMode && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-800">
            <header className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <h3 className="font-bold text-slate-200 uppercase tracking-widest text-xs">{modalMode === 'create' ? 'Add Rhythm Template' : 'Edit Rhythm Template'}</h3>
              <button onClick={() => setModalMode(null)} className="text-slate-500 hover:text-slate-300 p-1"><i className="fas fa-times"></i></button>
            </header>
            <form onSubmit={handleSaveRhythm} className="p-6 space-y-4 text-slate-200">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Session Title</label>
                <div className="relative space-y-3">
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-200"
                    value={isCustomTitle ? "custom" : formName}
                    onChange={(e) => {
                      if (e.target.value === "custom") {
                        setIsCustomTitle(true);
                        setFormName("");
                      } else {
                        setIsCustomTitle(false);
                        const newName = e.target.value;
                        setFormName(newName);
                        if (TITLES_MAPPING[newName]) {
                          setFormCadence(TITLES_MAPPING[newName]);
                        }
                      }
                    }}
                  >
                    {STANDARD_TITLES.map(title => (
                      <option key={title} value={title}>{title}</option>
                    ))}
                    <option value="custom">Custom...</option>
                  </select>
                  {isCustomTitle && (
                    <div className="animate-in slide-in-from-top-2 duration-200 space-y-3">
                      <input required autoFocus type="text" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-200" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Enter custom session name..." />
                      <div className="flex gap-2">
                        {(['Weekly', 'Monthly', 'Quarterly', 'Yearly'] as RhythmCadence[]).map(c => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setFormCadence(c)}
                            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border ${formCadence === c ? 'bg-slate-800 text-white border-slate-700' : 'bg-slate-950 text-slate-500 border-slate-800 hover:border-slate-600'
                              }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {isScrapingMiro && <div className="absolute right-3 top-3"><i className="fas fa-circle-notch animate-spin text-blue-500 text-xs"></i></div>}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Target Date</label>
                  <input type="date" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-300" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Miro Board Link (Optional)</label>
                <div className="relative">
                  <i className="fas fa-object-group absolute left-3 top-1/2 -translate-y-1/2 text-amber-500/50"></i>
                  <input type="url" placeholder="https://miro.com/app/board/..." className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-300 placeholder:text-slate-600" value={formMiro} onChange={(e) => setFormMiro(e.target.value)} />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setModalMode(null)} className="flex-1 py-2.5 border border-slate-700 text-slate-400 font-bold rounded-xl hover:bg-slate-800 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-900/20 active:scale-95 transition-all">Save Template</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rhythms;

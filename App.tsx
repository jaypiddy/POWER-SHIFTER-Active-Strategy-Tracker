
import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from './services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import {
  getUserById,
  saveUser,
  subscribeToCollection,
  saveBet,
  saveOutcome,
  saveMeasure,
  deleteMeasure,
  saveComment,
  deleteComment,
  saveSession,
  deleteBet,
  saveTheme,
  saveTask,
  deleteTask,
  saveCanvas,
  saveSnapshot
} from './services/firestoreService';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Canvas from './components/Canvas';
import Portfolio from './components/Portfolio';
import Rhythms from './components/Rhythms';
import Outcomes from './components/Outcomes';
import OutcomeDetail from './components/OutcomeDetail';
import OutcomeCreate from './components/OutcomeCreate';
import BetDetail from './components/BetDetail';
import BetCreate from './components/BetCreate';
import UserManagement from './components/UserManagement';
import Auth from './components/Auth';
import Profile from './components/Profile';
import StrategyExplorer from './components/StrategyExplorer';
import { INITIAL_CANVAS } from './mockData';
import { THEMES as SEED_THEMES } from './constants';
import { Bet, User, Comment, RhythmSession, Outcome1Y, Measure, CanvasSnapshot, Canvas as CanvasType, Theme, BetAction } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [permissionError, setPermissionError] = useState(false);

  // Live App State from Firestore
  const [users, setUsers] = useState<User[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [bets, setBets] = useState<Bet[]>([]);
  const [tasks, setTasks] = useState<BetAction[]>([]);
  const [outcomes, setOutcomes] = useState<Outcome1Y[]>([]);
  const [measures, setMeasures] = useState<Measure[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [sessions, setSessions] = useState<RhythmSession[]>([]);
  const [snapshots, setSnapshots] = useState<CanvasSnapshot[]>([]);
  const [activityLogs, setActivityLogs] = useState<import('./types').ActivityLog[]>([]);
  const [canvas, setCanvas] = useState<CanvasType>(INITIAL_CANVAS);

  const [selectedBet, setSelectedBet] = useState<Bet | null>(null);
  const [activeTaskId, setActiveTaskId] = useState<string | undefined>(undefined);
  const [initialBetTab, setInitialBetTab] = useState<string | undefined>(undefined);
  const [selectedOutcome, setSelectedOutcome] = useState<Outcome1Y | null>(null);
  const [isCreatingBet, setIsCreatingBet] = useState(false);
  const [initialBetThemeId, setInitialBetThemeId] = useState<string | undefined>(undefined);
  const [isCreatingOutcome, setIsCreatingOutcome] = useState(false);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setAuthLoading(true);
        try {
          // Check if user exists in Firestore
          const userProfile = await getUserById(fbUser.uid);

          if (userProfile) {
            setCurrentUser(userProfile);
            setPermissionError(false);
          } else {
            // New user - create profile
            const newUser: User = {
              id: fbUser.uid,
              firstName: fbUser.displayName?.split(' ')[0] || 'User',
              lastName: fbUser.displayName?.split(' ')[1] || '',
              email: fbUser.email || '',
              role: 'Viewer', // Default role
              title: '',
              active: true,
              avatar: fbUser.photoURL || `https://ui-avatars.com/api/?name=${fbUser.displayName || 'User'}&background=random`
            };
            await saveUser(newUser);
            setCurrentUser(newUser);
          }
        } catch (error: any) {
          console.error("Auth Error:", error);
          if (error.code === 'permission-denied') {
            setPermissionError(true);
          }
        } finally {
          setAuthLoading(false);
        }
      } else {
        setCurrentUser(null);
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Real-time Global Data Subscriptions
  useEffect(() => {
    // CRITICAL: Only subscribe to global collections if we have a valid authenticated user object
    if (!currentUser) return;

    const unsubUsers = subscribeToCollection('users', (data) => setUsers(data as User[]));
    const unsubThemes = subscribeToCollection('themes', (data) => {
      if (data.length === 0) {
        SEED_THEMES.forEach(t => saveTheme({ ...t, workspace_id: 'w1' }));
      } else {
        setThemes(data as Theme[]);
      }
    }, 'order');
    const unsubBets = subscribeToCollection('bets', (data) => setBets(data as Bet[]), 'updated_at');
    const unsubTasks = subscribeToCollection('tasks', (data) => setTasks(data as BetAction[]));
    const unsubOutcomes = subscribeToCollection('outcomes', (data) => setOutcomes(data as Outcome1Y[]));
    const unsubMeasures = subscribeToCollection('measures', (data) => setMeasures(data as Measure[]));
    const unsubComments = subscribeToCollection('comments', (data) => setComments(data as Comment[]), 'created_at');
    const unsubSessions = subscribeToCollection('sessions', (data) => setSessions(data as RhythmSession[]), 'scheduled_at');
    const unsubSnapshots = subscribeToCollection('snapshots', (data) => setSnapshots(data as CanvasSnapshot[]), 'created_at');
    const unsubActivityLogs = subscribeToCollection('activity_logs', (data) => setActivityLogs(data as import('./types').ActivityLog[]), 'timestamp');

    // Strategy Canvas Subscription (Document c1)
    const unsubCanvas = onSnapshot(doc(db, 'canvas', 'c1'), (snapshot) => {
      if (snapshot.exists()) {
        setCanvas(snapshot.data() as CanvasType);
      } else {
        saveCanvas(INITIAL_CANVAS);
      }
    }, (error) => {
      console.warn("Strategy Canvas access restricted.");
    });

    return () => {
      unsubUsers();
      unsubThemes();
      unsubBets();
      unsubTasks();
      unsubOutcomes();
      unsubMeasures();
      unsubComments();
      unsubSessions();
      unsubSnapshots();
      unsubActivityLogs();
      unsubCanvas();
    };
  }, [currentUser]);

  // Derived state: Bets with their tasks populated
  const populatedBets = bets.map(b => ({
    ...b,
    actions: tasks.filter(t => t.bet_id === b.id)
  }));

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleAddComment = async (entityType: Comment['entity_type'], entityId: string, body: string) => {
    if (!currentUser) return;
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      entity_type: entityType,
      entity_id: entityId,
      author_id: currentUser.id,
      author_name: `${currentUser.firstName} ${currentUser.lastName}`,
      author_avatar: currentUser.avatar,
      body,
      created_at: new Date().toISOString(),
    };
    await saveComment(newComment);
  };

  const handleUpdateComment = async (comment: Comment) => {
    await saveComment(comment);
  };

  const handleDeleteComment = async (commentId: string) => {
    await deleteComment(commentId);
  };

  const handleUpdateCanvas = async (updatedCanvas: CanvasType) => {
    await saveCanvas(updatedCanvas);
  };

  const handleCreateSnapshot = async (currentCanvas: CanvasType) => {
    if (!currentUser) return;
    const newSnapshot: CanvasSnapshot = {
      id: `sn-${Date.now()}`,
      created_at: new Date().toISOString(),
      created_by: `${currentUser.firstName} ${currentUser.lastName}`,
      purpose: currentCanvas.purpose,
      vision: currentCanvas.vision,
      values: currentCanvas.values,
      outcomes: outcomes.map(o => ({
        title: o.title,
        status: o.status,
        theme_id: o.theme_id
      }))
    };
    await saveSnapshot(newSnapshot);
    alert("Strategic Snapshot created and archived to Firestore.");
  };

  const handleCreateOutcome = async (newOutcome: Outcome1Y) => {
    await saveOutcome(newOutcome);
    setIsCreatingOutcome(false);
    setSelectedOutcome(newOutcome);
  };

  const handleUpdateOutcome = async (updatedOutcome: Outcome1Y) => {
    await saveOutcome(updatedOutcome);
    setSelectedOutcome(null);
  };

  const handleUpdateTheme = async (updatedTheme: Theme) => {
    await saveTheme(updatedTheme);
  };

  const handleAddMeasure = async (newMeasure: Measure) => {
    await saveMeasure(newMeasure);
  };

  const handleUpdateMeasure = async (updatedMeasure: Measure) => {
    await saveMeasure(updatedMeasure);
  };

  const handleDeleteMeasure = async (measureId: string) => {
    await deleteMeasure(measureId);
  };

  const handleAddSession = async (newSession: RhythmSession) => {
    await saveSession(newSession);
  };

  const handleUpdateSession = async (updatedSession: RhythmSession) => {
    await saveSession(updatedSession);
  };

  const handleAddUser = (user: User) => {
    saveUser(user);
  };

  const handleUpdateUser = (updatedUser: User) => {
    saveUser(updatedUser);
    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  const handleOpenNewBet = (themeId?: string) => {
    setInitialBetThemeId(themeId);
    setIsCreatingBet(true);
  };

  const handleCreateBet = async (newBet: Bet) => {
    await saveBet(newBet);
    setIsCreatingBet(false);
    setSelectedBet(newBet);
  };

  const handleUpdateBet = async (updatedBet: Bet) => {
    updatedBet.updated_at = new Date().toISOString();
    // Optimistic update to prevent UI reversion
    setBets(prev => prev.map(b => b.id === updatedBet.id ? updatedBet : b));
    await saveBet(updatedBet);
    // Keep modal open after update
  };

  const handleDeleteBet = async (betId: string) => {
    // Delete associated tasks first
    const betTasks = tasks.filter(t => t.bet_id === betId);
    for (const t of betTasks) {
      await deleteTask(t.id);
    }
    await deleteBet(betId);
    if (selectedBet?.id === betId) setSelectedBet(null);
  };

  const handleArchiveBet = async (bet: Bet) => {
    const updatedBet = {
      ...bet,
      stage: 'Archived' as const,
      archived_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    await saveBet(updatedBet);
    if (selectedBet?.id === bet.id) setSelectedBet(null);
  };

  const handleSaveTask = async (task: BetAction) => {
    await saveTask(task);

    // Auto-calculate progress for the related bet
    const relatedBet = bets.find(b => b.id === task.bet_id);
    if (relatedBet) {
      const otherTasks = tasks.filter(t => t.bet_id === task.bet_id && t.id !== task.id);
      const allTasks = [...otherTasks, task];

      const total = allTasks.length;
      const sumProgress = allTasks.reduce((acc, t) => acc + Number(t.progress || 0), 0);
      const newProgress = total === 0 ? 0 : Math.round(sumProgress / total);

      if (relatedBet.progress !== newProgress) {
        const updatedBet = {
          ...relatedBet,
          progress: newProgress,
          updated_at: new Date().toISOString()
        };
        // Optimistic update for immediate feedback
        setBets(prev => prev.map(b => b.id === updatedBet.id ? updatedBet : b));
        await saveBet(updatedBet);
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    await deleteTask(taskId);

    if (taskToDelete) {
      const relatedBet = bets.find(b => b.id === taskToDelete.bet_id);
      if (relatedBet) {
        const remainingTasks = tasks.filter(t => t.bet_id === taskToDelete.bet_id && t.id !== taskId);

        const total = remainingTasks.length;
        const sumProgress = remainingTasks.reduce((acc, t) => acc + Number(t.progress || 0), 0);
        const newProgress = total === 0 ? 0 : Math.round(sumProgress / total);

        if (relatedBet.progress !== newProgress) {
          const updatedBet = {
            ...relatedBet,
            progress: newProgress,
            updated_at: new Date().toISOString()
          };
          setBets(prev => prev.map(b => b.id === updatedBet.id ? updatedBet : b));
          await saveBet(updatedBet);
        }
      }
    }
  };

  const switchUser = (role: User['role']) => {
    if (currentUser) {
      const updated = { ...currentUser, role };
      setCurrentUser(updated);
      saveUser(updated);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Warming Engine...</p>
        </div>
      </div>
    );
  }

  if (permissionError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6">
        <div className="max-w-lg bg-slate-800 p-8 rounded-xl border border-rose-500/30 shadow-2xl">
          <h2 className="text-2xl font-bold text-rose-500 mb-4"><i className="fas fa-lock mr-2"></i> Database Access Denied</h2>
          <p className="text-slate-300 mb-6">
            Your user is authenticated, but Firestore denied access to your profile. This usually means the <strong>database rules</strong> haven't been applied in the Firebase Console yet.
          </p>
          <div className="bg-slate-950 p-4 rounded mb-6 text-sm font-mono text-slate-400 overflow-x-auto border border-slate-700">
            <p className="mb-2 text-slate-500">// Copy this to Firebase Console &gt; Firestore &gt; Rules</p>
            <pre>{`match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}`}</pre>
          </div>

          <div className="flex gap-4">
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded font-bold transition-colors">
              I've Updated Rules, Retry
            </button>
            <button onClick={handleLogout} className="px-4 py-2 border border-slate-600 hover:bg-slate-700 rounded font-bold transition-colors">
              Log Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Auth />;
  }

  const handleNavigate = (entityId: string, tab?: string) => {
    // Try to find if it's a bet
    const bet = bets.find(b => b.id === entityId);
    if (bet) {
      setInitialBetTab(tab);
      setSelectedBet(bet);
      return;
    }
    // Try outcome
    const outcome = outcomes.find(o => o.id === entityId);
    if (outcome) {
      setSelectedOutcome(outcome);
      setActiveTab('outcomes');
      return;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard
          bets={populatedBets}
          outcomes={outcomes}
          sessions={sessions}
          currentUser={currentUser}
          themes={themes}
          onNewBet={handleOpenNewBet}
          onNavigate={handleNavigate}
        />;
      case 'explorer':
        return (
          <StrategyExplorer
            outcomes={outcomes}
            measures={measures}
            bets={populatedBets}
            tasks={tasks}
            users={users}
            themes={themes}
            onNavigate={handleNavigate}
          />
        );
      case 'canvas':
        return (
          <Canvas
            canvas={canvas}
            bets={populatedBets}
            outcomes={outcomes}
            currentUser={currentUser}
            comments={comments}
            snapshots={snapshots}
            themes={themes}
            onUpdateCanvas={handleUpdateCanvas}
            onUpdateTheme={handleUpdateTheme}
            onAddComment={(body) => handleAddComment('Canvas', canvas.id, body)}
            onCreateSnapshot={() => handleCreateSnapshot(canvas)}
            onNewBet={handleOpenNewBet}
          />
        );
      case 'portfolio':
        return (
          <Portfolio
            bets={populatedBets}
            users={users}
            themes={themes}
            onSelectBet={(bet, taskId) => {
              setSelectedBet(bet);
              setActiveTaskId(taskId);
            }}
            onNewBet={() => handleOpenNewBet()}
            onDeleteBet={handleDeleteBet}
            onArchiveBet={handleArchiveBet}
            currentUser={currentUser}
          />
        );
      case 'outcomes':
        return (
          <Outcomes
            outcomes={outcomes}
            measures={measures}
            users={users}
            themes={themes}
            currentUser={currentUser}
            onSelectOutcome={setSelectedOutcome}
            onNewOutcome={() => setIsCreatingOutcome(true)}
          />
        );
      case 'rhythms':
        return (
          <Rhythms
            sessions={sessions}
            bets={populatedBets}
            currentUser={currentUser}
            onAddSession={handleAddSession}
            onUpdateSession={handleUpdateSession}
            users={users}
            comments={comments}
          />
        );
      case 'team':
        return (
          <UserManagement
            users={users}
            themes={themes}
            currentUser={currentUser}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
          />
        );
      case 'profile':
        return (
          <Profile
            currentUser={currentUser}
            themes={themes}
            onUpdateUser={handleUpdateUser}
          />
        );
      default:
        return <Dashboard bets={populatedBets} outcomes={outcomes} sessions={sessions} currentUser={currentUser} themes={themes} onNewBet={handleOpenNewBet} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} onSwitchRole={switchUser}>
      <div className="flex justify-end mb-4 gap-6">
        {activeTab === 'profile' && (
          <button
            onClick={() => setActiveTab('dashboard')}
            className="text-[10px] font-bold text-emerald-500 hover:text-emerald-400 uppercase tracking-widest transition-colors flex items-center gap-2"
          >
            <i className="fas fa-check"></i>
            Close Profile
          </button>
        )}
        <button
          onClick={handleLogout}
          className="text-[10px] font-bold text-rose-500 hover:text-rose-400 uppercase tracking-widest transition-colors flex items-center gap-2"
        >
          <i className="fas fa-sign-out-alt"></i>
          Logout
        </button>
      </div>

      {renderContent()}

      <AnimatePresence>
        {selectedBet && (
          <BetDetail
            key="bet-detail"
            bet={populatedBets.find(b => b.id === selectedBet.id) || selectedBet}
            onClose={() => {
              setSelectedBet(null);
              setActiveTaskId(undefined);
              setInitialBetTab(undefined);
            }}
            onUpdate={handleUpdateBet}
            onDelete={handleDeleteBet}
            onArchive={handleArchiveBet}
            onSaveTask={handleSaveTask}
            onDeleteTask={handleDeleteTask}
            currentUser={currentUser}
            comments={comments}
            onAddComment={(body) => handleAddComment('Bet', selectedBet.id, body)}
            onUpdateComment={handleUpdateComment}
            onDeleteComment={handleDeleteComment}
            users={users}
            themes={themes}
            initialFocusTaskId={activeTaskId}
            activityLogs={activityLogs}
            outcomes={outcomes}
            measures={measures}
            initialActiveTab={initialBetTab}
          />
        )}
      </AnimatePresence>

      {isCreatingBet && (
        <BetCreate
          onClose={() => setIsCreatingBet(false)}
          onCreate={handleCreateBet}
          currentUser={currentUser}
          themes={themes}
          initialThemeId={initialBetThemeId}
        />
      )}

      {isCreatingOutcome && (
        <OutcomeCreate
          onClose={() => setIsCreatingOutcome(false)}
          onCreate={handleCreateOutcome}
          currentUser={currentUser}
          users={users}
          themes={themes}
        />
      )}

      {selectedOutcome && (
        <OutcomeDetail
          outcome={selectedOutcome}
          measures={measures}
          currentUser={currentUser}
          onClose={() => setSelectedOutcome(null)}
          onUpdate={handleUpdateOutcome}
          onAddMeasure={handleAddMeasure}
          onUpdateMeasure={handleUpdateMeasure}
          onDeleteMeasure={handleDeleteMeasure}
          themes={themes}
          users={users}
        />
      )}
    </Layout>
  );
};

export default App;

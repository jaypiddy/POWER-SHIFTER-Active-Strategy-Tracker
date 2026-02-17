
import React, { useState, useEffect } from 'react';
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
import { INITIAL_CANVAS } from './mockData';
import { THEMES as SEED_THEMES } from './constants';
import { Bet, User, Comment, RhythmSession, Outcome1Y, Measure, CanvasSnapshot, Canvas as CanvasType, Theme, BetAction } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

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
  const [canvas, setCanvas] = useState<CanvasType>(INITIAL_CANVAS);
  
  const [selectedBet, setSelectedBet] = useState<Bet | null>(null);
  const [selectedOutcome, setSelectedOutcome] = useState<Outcome1Y | null>(null);
  const [isCreatingBet, setIsCreatingBet] = useState(false);
  const [initialBetThemeId, setInitialBetThemeId] = useState<string | undefined>(undefined);
  const [isCreatingOutcome, setIsCreatingOutcome] = useState(false);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          // ADD A SMALL DELAY to ensure the background Firestore Auth handshake completes.
          // This is the most effective way to prevent "Missing or insufficient permissions"
          // during the very first request of a new session.
          await new Promise(resolve => setTimeout(resolve, 500));

          const userData = await getUserById(fbUser.uid);
          if (userData) {
            setCurrentUser(userData);
          } else {
            const fallbackUser: User = {
              id: fbUser.uid,
              firstName: fbUser.displayName?.split(' ')[0] || 'Unknown',
              lastName: fbUser.displayName?.split(' ')[1] || 'User',
              email: fbUser.email || '',
              role: 'Editor',
              title: 'Strategic Partner',
              active: true,
              avatar: fbUser.photoURL || `https://ui-avatars.com/api/?name=${fbUser.displayName || 'User'}&background=random`
            };
            await saveUser(fallbackUser);
            setCurrentUser(fallbackUser);
          }
        } catch (error) {
          console.error("Critical: Failed to sync user profile from Firestore:", error);
          // If after several retries it still fails, we force a logout to let the user retry.
          if (error instanceof Error && (error.message.includes('permissions') || error.message.includes('permission-denied'))) {
            alert("Security handshake delayed. Please try refreshing the page.");
          }
        }
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
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
    await saveBet(updatedBet);
    setSelectedBet(null);
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
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
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

  if (!currentUser) {
    return <Auth />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard bets={populatedBets} outcomes={outcomes} sessions={sessions} currentUser={currentUser} themes={themes} onNewBet={handleOpenNewBet} />;
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
            onSelectBet={setSelectedBet} 
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
      <div className="flex justify-end mb-4">
        <button 
          onClick={handleLogout}
          className="text-[10px] font-bold text-slate-400 hover:text-rose-500 uppercase tracking-widest transition-colors flex items-center gap-2"
        >
          <i className="fas fa-sign-out-alt"></i>
          Logout
        </button>
      </div>
      
      {renderContent()}
      
      {selectedBet && (
        <BetDetail 
          bet={populatedBets.find(b => b.id === selectedBet.id) || selectedBet} 
          onClose={() => setSelectedBet(null)} 
          onUpdate={handleUpdateBet}
          onDelete={handleDeleteBet}
          onArchive={handleArchiveBet}
          onSaveTask={handleSaveTask}
          onDeleteTask={handleDeleteTask}
          currentUser={currentUser}
          comments={comments}
          onAddComment={(body) => handleAddComment('Bet', selectedBet.id, body)}
          users={users}
          themes={themes}
        />
      )}

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
          onDeleteMeasure={deleteMeasure}
          themes={themes}
        />
      )}
    </Layout>
  );
};

export default App;

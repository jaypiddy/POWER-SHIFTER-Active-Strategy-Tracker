
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './services/firebase';
import { 
  getUserById, 
  saveUser, 
  subscribeToCollection, 
  saveBet, 
  saveOutcome, 
  saveMeasure, 
  deleteMeasure,
  saveComment,
  saveSession
} from './services/firestoreService';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Canvas from './components/Canvas';
import Portfolio from './components/Portfolio';
import Rhythms from './components/Rhythms';
import Outcomes from './components/Outcomes';
import OutcomeDetail from './components/OutcomeDetail';
import BetDetail from './components/BetDetail';
import BetCreate from './components/BetCreate';
import UserManagement from './components/UserManagement';
import Auth from './components/Auth';
import Profile from './components/Profile';
import { INITIAL_CANVAS } from './mockData';
import { Bet, User, Comment, RhythmSession, Outcome1Y, Measure, CanvasSnapshot, Canvas as CanvasType } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Live App State from Firestore
  const [users, setUsers] = useState<User[]>([]);
  const [bets, setBets] = useState<Bet[]>([]);
  const [outcomes, setOutcomes] = useState<Outcome1Y[]>([]);
  const [measures, setMeasures] = useState<Measure[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [sessions, setSessions] = useState<RhythmSession[]>([]);
  const [snapshots, setSnapshots] = useState<CanvasSnapshot[]>([]);
  const [canvas, setCanvas] = useState<CanvasType>(INITIAL_CANVAS);
  
  const [selectedBet, setSelectedBet] = useState<Bet | null>(null);
  const [selectedOutcome, setSelectedOutcome] = useState<Outcome1Y | null>(null);
  const [isCreatingBet, setIsCreatingBet] = useState(false);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
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
            title: 'Team Member',
            active: true,
            avatar: fbUser.photoURL || `https://ui-avatars.com/api/?name=${fbUser.displayName || 'User'}&background=random`
          };
          setCurrentUser(fallbackUser);
          await saveUser(fallbackUser);
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
    if (!currentUser) return;

    const unsubUsers = subscribeToCollection('users', (data) => setUsers(data as User[]));
    const unsubBets = subscribeToCollection('bets', (data) => setBets(data as Bet[]), 'updated_at');
    const unsubOutcomes = subscribeToCollection('outcomes', (data) => setOutcomes(data as Outcome1Y[]));
    const unsubMeasures = subscribeToCollection('measures', (data) => setMeasures(data as Measure[]));
    const unsubComments = subscribeToCollection('comments', (data) => setComments(data as Comment[]), 'created_at');
    const unsubSessions = subscribeToCollection('sessions', (data) => setSessions(data as RhythmSession[]), 'scheduled_at');

    return () => {
      unsubUsers();
      unsubBets();
      unsubOutcomes();
      unsubMeasures();
      unsubComments();
      unsubSessions();
    };
  }, [currentUser]);

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

  const handleCreateSnapshot = (currentCanvas: CanvasType) => {
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
    setSnapshots([...snapshots, newSnapshot]);
    alert("Strategic Snapshot created and archived locally.");
  };

  const handleUpdateOutcome = async (updatedOutcome: Outcome1Y) => {
    await saveOutcome(updatedOutcome);
    setSelectedOutcome(null);
  };

  const handleAddMeasure = async (newMeasure: Measure) => {
    await saveMeasure(newMeasure);
  };

  const handleUpdateMeasure = async (updatedMeasure: Measure) => {
    await saveMeasure(updatedMeasure);
  };

  const handleDeleteMeasure = async (id: string) => {
    await deleteMeasure(id);
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
        return <Dashboard bets={bets} outcomes={outcomes} sessions={sessions} currentUser={currentUser} />;
      case 'canvas':
        return (
          <Canvas 
            canvas={canvas} 
            bets={bets} 
            outcomes={outcomes} 
            currentUser={currentUser}
            comments={comments}
            snapshots={snapshots}
            onUpdateCanvas={setCanvas}
            onAddComment={(body) => handleAddComment('Canvas', canvas.id, body)}
            onCreateSnapshot={() => handleCreateSnapshot(canvas)}
          />
        );
      case 'portfolio':
        return <Portfolio bets={bets} users={users} onSelectBet={setSelectedBet} onNewBet={() => setIsCreatingBet(true)} currentUser={currentUser} />;
      case 'outcomes':
        return (
          <Outcomes 
            outcomes={outcomes} 
            measures={measures} 
            users={users} 
            currentUser={currentUser} 
            onSelectOutcome={setSelectedOutcome} 
          />
        );
      case 'rhythms':
        return (
          <Rhythms 
            sessions={sessions} 
            bets={bets} 
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
            currentUser={currentUser} 
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
          />
        );
      case 'profile':
        return (
          <Profile 
            currentUser={currentUser} 
            onUpdateUser={handleUpdateUser} 
          />
        );
      default:
        return <Dashboard bets={bets} outcomes={outcomes} sessions={sessions} currentUser={currentUser} />;
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
          bet={selectedBet} 
          onClose={() => setSelectedBet(null)} 
          onUpdate={handleUpdateBet}
          currentUser={currentUser}
          comments={comments}
          onAddComment={(body) => handleAddComment('Bet', selectedBet.id, body)}
          users={users}
        />
      )}

      {isCreatingBet && (
        <BetCreate 
          onClose={() => setIsCreatingBet(false)} 
          onCreate={handleCreateBet}
          currentUser={currentUser}
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
        />
      )}
    </Layout>
  );
};

export default App;

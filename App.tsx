
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './services/firebase';
import { getUserById } from './services/firestoreService';
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
import { INITIAL_CANVAS, INITIAL_BETS, INITIAL_OUTCOMES, RHYTHM_SESSIONS, INITIAL_COMMENTS, INITIAL_MEASURES } from './mockData';
import { Bet, User, Comment, RhythmSession, Outcome1Y, Measure, CanvasSnapshot, Canvas as CanvasType } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // App State (Mock data until fully synced with Firestore)
  const [users, setUsers] = useState<User[]>([]);
  const [bets, setBets] = useState<Bet[]>(INITIAL_BETS);
  const [outcomes, setOutcomes] = useState<Outcome1Y[]>(INITIAL_OUTCOMES);
  const [measures, setMeasures] = useState<Measure[]>(INITIAL_MEASURES);
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);
  const [sessions, setSessions] = useState<RhythmSession[]>(RHYTHM_SESSIONS);
  const [snapshots, setSnapshots] = useState<CanvasSnapshot[]>([]);
  const [canvas, setCanvas] = useState<CanvasType>(INITIAL_CANVAS);
  
  const [selectedBet, setSelectedBet] = useState<Bet | null>(null);
  const [selectedOutcome, setSelectedOutcome] = useState<Outcome1Y | null>(null);
  const [isCreatingBet, setIsCreatingBet] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // Fetch extended user data from Firestore
        const userData = await getUserById(fbUser.uid);
        if (userData) {
          setCurrentUser(userData);
        } else {
          // Fallback if firestore document hasn't propagated yet
          setCurrentUser({
            id: fbUser.uid,
            firstName: fbUser.displayName?.split(' ')[0] || 'Unknown',
            lastName: fbUser.displayName?.split(' ')[1] || 'User',
            email: fbUser.email || '',
            role: 'Editor',
            title: 'Team Member',
            active: true,
            avatar: fbUser.photoURL || undefined
          });
        }
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleAddComment = (entityType: Comment['entity_type'], entityId: string, body: string) => {
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
    setComments([...comments, newComment]);
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
    alert("Strategic Snapshot created and archived.");
  };

  const handleUpdateOutcome = (updatedOutcome: Outcome1Y) => {
    setOutcomes(outcomes.map(o => o.id === updatedOutcome.id ? updatedOutcome : o));
    setSelectedOutcome(null);
  };

  const handleAddMeasure = (newMeasure: Measure) => {
    setMeasures([...measures, newMeasure]);
  };

  const handleUpdateMeasure = (updatedMeasure: Measure) => {
    setMeasures(measures.map(m => m.id === updatedMeasure.id ? updatedMeasure : m));
  };

  const handleDeleteMeasure = (id: string) => {
    setMeasures(measures.filter(m => m.id !== id));
  };

  const handleAddSession = (newSession: RhythmSession) => {
    setSessions([...sessions, newSession]);
  };

  const handleUpdateSession = (updatedSession: RhythmSession) => {
    setSessions(sessions.map(s => s.id === updatedSession.id ? updatedSession : s));
  };

  const handleAddUser = (user: User) => {
    setUsers([...users, user]);
  };

  const handleUpdateUser = (updatedUser: User) => {
    const newUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    setUsers(newUsers);
    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  const handleCreateBet = (newBet: Bet) => {
    setBets([newBet, ...bets]);
    setIsCreatingBet(false);
    setSelectedBet(newBet);
  };

  const switchUser = (role: User['role']) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, role });
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
          onUpdate={(updatedBet) => {
            setBets(bets.map(b => b.id === updatedBet.id ? updatedBet : b));
            setSelectedBet(null);
          }}
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

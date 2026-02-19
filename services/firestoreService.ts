
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  getDoc,
  query,
  deleteDoc,
  orderBy
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { Bet, User, Comment, Canvas, Outcome1Y, RhythmSession, Measure, Theme, BetAction, CanvasSnapshot } from '../types';

/**
 * A utility to retry firestore operations that might fail due to 
 * Auth token propagation delays immediately after login.
 */
async function runWithRetry<T>(fn: () => Promise<T>, retries = 5, delay = 800): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    const isPermissionError = err.code === 'permission-denied' ||
      err.message?.toLowerCase().includes('permissions') ||
      err.message?.toLowerCase().includes('permission-denied');

    if (retries > 0 && isPermissionError) {
      console.debug(`Firestore permission race detected. Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return runWithRetry(fn, retries - 1, delay * 1.5);
    }
    throw err;
  }
}

export const subscribeToCollection = (
  collectionName: string,
  callback: (data: any[]) => void,
  orderField?: string
) => {
  try {
    const q = orderField
      ? query(collection(db, collectionName), orderBy(orderField, 'desc'))
      : query(collection(db, collectionName));

    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      callback(items);
    }, (error) => {
      if (error.code === 'permission-denied') {
        console.warn(`Transient access denied to '${collectionName}'. This is normal during initial login sync.`);
      } else {
        console.error(`Error subscribing to collection '${collectionName}':`, error);
      }
    });
  } catch (err) {
    console.error(`Failed to initiate subscription for '${collectionName}':`, err);
    return () => { };
  }
};

export const saveTask = async (task: BetAction) => {
  // Check for completion
  if (task.progress === 100) {
    const existingTask = await runWithRetry(async () => {
      const snap = await getDoc(doc(db, 'tasks', task.id));
      return snap.exists() ? snap.data() as BetAction : null;
    });

    if (!existingTask || existingTask.progress < 100) {
      // Fetch bet title for context
      const betSnap = await getDoc(doc(db, 'bets', task.bet_id));
      const betTitle = betSnap.exists() ? betSnap.data().title : 'Unknown Bet';

      const user = auth.currentUser;
      if (user) {
        logActivity({
          id: `log-${Date.now()}`,
          type: 'task_completed',
          entityId: task.bet_id, // Link to Bet for context
          entityTitle: task.title,
          timestamp: new Date().toISOString(),
          userId: user.uid,
          userName: user.displayName || 'Unknown User',
          userAvatar: user.photoURL || undefined,
          details: `Completed task in "${betTitle}"`
        });
      }
    }
  }
  await runWithRetry(() => setDoc(doc(db, 'tasks', task.id), task));
};

export const deleteTask = async (taskId: string) => {
  await deleteDoc(doc(db, 'tasks', taskId));
};

// Activity Logging Helper
export const logActivity = async (log: import('../types').ActivityLog) => {
  await runWithRetry(() => setDoc(doc(db, 'activity_logs', log.id), log));
};

export const saveBet = async (bet: Bet) => {
  const { actions, ...betData } = bet;

  // Logic to detect changes and log activity
  const existingBet = await runWithRetry(async () => {
    const snap = await getDoc(doc(db, 'bets', bet.id));
    return snap.exists() ? snap.data() as Bet : null;
  });

  const user = auth.currentUser;
  if (user) {
    const baseLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: user.uid,
      userName: user.displayName || 'Unknown User',
      userAvatar: user.photoURL || undefined,
      entityId: bet.id,
      entityTitle: bet.title,
    };

    if (!existingBet) {
      // New Bet
      logActivity({
        ...baseLog,
        type: 'bet_created',
        details: `New ${bet.bet_type} Bet created`
      });
    } else {
      // Stage Change
      if (existingBet.stage !== bet.stage) {
        if (bet.stage === 'Blocked') {
          logActivity({
            ...baseLog,
            type: 'bet_blocked',
            details: `Flagged as Blocked`
          });
        } else {
          logActivity({
            ...baseLog,
            type: 'bet_updated',
            details: `Moved to ${bet.stage}`
          });
        }
      }
    }
  }

  await runWithRetry(() => setDoc(doc(db, 'bets', bet.id), betData));
};

export const deleteBet = async (betId: string) => {
  await deleteDoc(doc(db, 'bets', betId));
};

export const saveUser = async (user: User) => {
  await runWithRetry(() => setDoc(doc(db, 'users', user.id), user));
};

export const getUserById = async (userId: string): Promise<User | null> => {
  return await runWithRetry(async () => {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as User;
    }
    return null;
  });
};

export const deleteUserRecord = async (userId: string) => {
  await deleteDoc(doc(db, 'users', userId));
};

export const saveComment = async (comment: Comment) => {
  // New Comment Log
  const existingComment = await runWithRetry(async () => {
    const snap = await getDoc(doc(db, 'comments', comment.id));
    return snap.exists();
  });

  if (!existingComment) {
    // Fetch entity title if possible, or generic
    let entityTitle = 'Strategy Item';
    if (comment.entity_type === 'Bet') {
      const betSnap = await getDoc(doc(db, 'bets', comment.entity_id));
      if (betSnap.exists()) entityTitle = betSnap.data().title;
    }

    logActivity({
      id: `log-${Date.now()}`,
      type: 'comment_added',
      entityId: comment.entity_id,
      entityTitle: entityTitle,
      timestamp: new Date().toISOString(),
      userId: comment.author_id,
      userName: comment.author_name,
      userAvatar: comment.author_avatar,
      details: `Commented: "${comment.body.substring(0, 50)}${comment.body.length > 50 ? '...' : ''}"`
    });
  }

  await runWithRetry(() => setDoc(doc(db, 'comments', comment.id), comment));
};

export const deleteComment = async (commentId: string) => {
  await deleteDoc(doc(db, 'comments', commentId));
};

export const saveCanvas = async (canvas: Canvas) => {
  await runWithRetry(() => setDoc(doc(db, 'canvas', canvas.id), canvas));
};

export const saveSnapshot = async (snapshot: CanvasSnapshot) => {
  await runWithRetry(() => setDoc(doc(db, 'snapshots', snapshot.id), snapshot));
};

export const saveOutcome = async (outcome: Outcome1Y) => {
  const existingOutcome = await runWithRetry(async () => {
    const snap = await getDoc(doc(db, 'outcomes', outcome.id));
    return snap.exists() ? snap.data() as Outcome1Y : null;
  });

  if (existingOutcome && existingOutcome.status !== outcome.status) {
    const user = auth.currentUser;
    if (user) {
      logActivity({
        id: `log-${Date.now()}`,
        type: 'outcome_updated',
        entityId: outcome.id,
        entityTitle: outcome.title,
        timestamp: new Date().toISOString(),
        userId: user.uid,
        userName: user.displayName || 'Unknown',
        userAvatar: user.photoURL || undefined,
        details: `Status changed to ${outcome.status}`
      });
    }
  }

  await runWithRetry(() => setDoc(doc(db, 'outcomes', outcome.id), outcome));
};

export const saveMeasure = async (measure: Measure) => {
  await runWithRetry(() => setDoc(doc(db, 'measures', measure.id), measure));
};

export const deleteMeasure = async (measureId: string) => {
  await deleteDoc(doc(db, 'measures', measureId));
};

export const saveSession = async (session: RhythmSession) => {
  await runWithRetry(() => setDoc(doc(db, 'sessions', session.id), session));
};

export const saveTheme = async (theme: Theme) => {
  await runWithRetry(() => setDoc(doc(db, 'themes', theme.id), theme));
};

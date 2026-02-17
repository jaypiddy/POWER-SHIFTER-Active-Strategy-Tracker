
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
import { db } from './firebase';
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
    return () => {};
  }
};

export const saveBet = async (bet: Bet) => {
  const { actions, ...betData } = bet;
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
  await runWithRetry(() => setDoc(doc(db, 'comments', comment.id), comment));
};

export const saveCanvas = async (canvas: Canvas) => {
  await runWithRetry(() => setDoc(doc(db, 'canvas', canvas.id), canvas));
};

export const saveSnapshot = async (snapshot: CanvasSnapshot) => {
  await runWithRetry(() => setDoc(doc(db, 'snapshots', snapshot.id), snapshot));
};

export const saveOutcome = async (outcome: Outcome1Y) => {
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

export const saveTask = async (task: BetAction) => {
  await runWithRetry(() => setDoc(doc(db, 'tasks', task.id), task));
};

export const deleteTask = async (taskId: string) => {
  await deleteDoc(doc(db, 'tasks', taskId));
};

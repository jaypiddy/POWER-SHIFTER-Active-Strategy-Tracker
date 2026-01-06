
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
import { Bet, User, Comment, Canvas, Outcome1Y, RhythmSession, Measure } from '../types';

export const subscribeToCollection = (collectionName: string, callback: (data: any[]) => void, orderField?: string) => {
  try {
    const q = orderField 
      ? query(collection(db, collectionName), orderBy(orderField, 'desc'))
      : query(collection(db, collectionName));
      
    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(items);
    }, (error) => {
      console.error(`Error subscribing to collection '${collectionName}':`, error);
    });
  } catch (err) {
    console.error(`Failed to initiate subscription for '${collectionName}':`, err);
    return () => {};
  }
};

export const saveBet = async (bet: Bet) => {
  await setDoc(doc(db, 'bets', bet.id), bet);
};

export const deleteBet = async (betId: string) => {
  await deleteDoc(doc(db, 'bets', betId));
};

export const saveUser = async (user: User) => {
  await setDoc(doc(db, 'users', user.id), user);
};

export const getUserById = async (userId: string): Promise<User | null> => {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as User;
  }
  return null;
};

export const deleteUserRecord = async (userId: string) => {
  await deleteDoc(doc(db, 'users', userId));
};

export const saveComment = async (comment: Comment) => {
  await setDoc(doc(db, 'comments', comment.id), comment);
};

export const saveCanvas = async (canvas: Canvas) => {
  await setDoc(doc(db, 'canvas', canvas.id), canvas);
};

export const saveOutcome = async (outcome: Outcome1Y) => {
  await setDoc(doc(db, 'outcomes', outcome.id), outcome);
};

export const saveMeasure = async (measure: Measure) => {
  await setDoc(doc(db, 'measures', measure.id), measure);
};

export const deleteMeasure = async (measureId: string) => {
  await deleteDoc(doc(db, 'measures', measureId));
};

export const saveSession = async (session: RhythmSession) => {
  await setDoc(doc(db, 'sessions', session.id), session);
};

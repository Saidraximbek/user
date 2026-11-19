import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  Firestore,
} from 'firebase/firestore';
import { TestSession, StudentRecord, FirebaseConfigState } from '../types';

const STORAGE_KEY_FB_CONFIG = 'zehnora_firebase_config_v1';

// Foydalanuvchi taqdim etgan Firebase loyihasi konfiguratsiyasi (finance-9b58b)
export const DEFAULT_FIREBASE_CONFIG: FirebaseConfigState = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDdcFMeG3fjZmt_r1ahNa6e0Y0o4oYxuh0',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'finance-9b58b.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'finance-9b58b',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'finance-9b58b.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '725197214128',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:725197214128:web:cba03df6ee7110257ac675',
};

export type FirebaseStatus = 'idle' | 'connected' | 'permission_denied' | 'error';

let currentFirebaseStatus: FirebaseStatus = 'idle';
let currentFirebaseErrorMessage: string = '';
const statusListeners: Array<(status: FirebaseStatus, message: string) => void> = [];

export function setFirebaseStatus(status: FirebaseStatus, message = '') {
  currentFirebaseStatus = status;
  currentFirebaseErrorMessage = message;
  statusListeners.forEach((fn) => fn(status, message));
}

export function subscribeFirebaseStatus(
  fn: (status: FirebaseStatus, message: string) => void
): () => void {
  statusListeners.push(fn);
  fn(currentFirebaseStatus, currentFirebaseErrorMessage);
  return () => {
    const idx = statusListeners.indexOf(fn);
    if (idx >= 0) statusListeners.splice(idx, 1);
  };
}

export function isPermissionDeniedError(err: unknown): boolean {
  if (!err) return false;
  const str = String(err);
  const code = (err as { code?: string })?.code;
  return (
    code === 'permission-denied' ||
    str.includes('permission-denied') ||
    str.includes('PERMISSION_DENIED') ||
    str.includes('Missing or insufficient permissions')
  );
}

export function getStoredFirebaseConfig(): FirebaseConfigState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FB_CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.projectId && parsed.projectId === 'finance-9b58b') {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Firebase config o‘qishda xatolik:', e);
  }
  return DEFAULT_FIREBASE_CONFIG;
}

export function saveFirebaseConfig(config: FirebaseConfigState): void {
  localStorage.setItem(STORAGE_KEY_FB_CONFIG, JSON.stringify(config));
  // Reset cached instances to use new config
  firebaseAppInstance = null;
  firestoreInstance = null;
}

let firebaseAppInstance: FirebaseApp | null = null;
let firestoreInstance: Firestore | null = null;

export function getFirebaseFirestore(): Firestore | null {
  try {
    const config = getStoredFirebaseConfig();
    if (!config.projectId) return null;

    if (!firebaseAppInstance) {
      if (getApps().length > 0) {
        firebaseAppInstance = getApp();
      } else {
        firebaseAppInstance = initializeApp(config);
      }
    }
    if (!firestoreInstance && firebaseAppInstance) {
      firestoreInstance = getFirestore(firebaseAppInstance);
    }
    return firestoreInstance;
  } catch (error) {
    console.warn('Firebase init ogohlantirishi:', error);
    return null;
  }
}

/**
 * Sinovni Firebase Firestore ga saqlash
 */
export async function syncSessionToFirebase(session: TestSession): Promise<boolean> {
  const db = getFirebaseFirestore();
  if (!db) {
    setFirebaseStatus('error', 'Firebase ulanishi mavjud emas');
    return false;
  }

  try {
    const sessionRef = doc(db, 'test_sessions', session.id);
    await setDoc(
      sessionRef,
      {
        ...session,
        syncedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    setFirebaseStatus('connected');
    return true;
  } catch (err) {
    if (isPermissionDeniedError(err)) {
      setFirebaseStatus(
        'permission_denied',
        'Firebase Firestore ruxsati cheklangan (permission-denied). Firebase Console > Firestore Database > Rules bo‘limida "allow read, write: if true;" qoidasini o‘rnating.'
      );
    } else {
      setFirebaseStatus('error', (err as Error)?.message || 'Firebase saqlash xatosi');
    }
    console.warn('Firebase-ga saqlashda xatolik (offline rejim ishlaydi):', err);
    return false;
  }
}

/**
 * Barcha sinovlarni Firebase dan olish (bir martalik)
 */
export async function fetchSessionsFromFirebase(): Promise<TestSession[]> {
  const db = getFirebaseFirestore();
  if (!db) return [];

  try {
    const colRef = collection(db, 'test_sessions');
    const snap = await getDocs(colRef);
    const sessions: TestSession[] = [];
    snap.forEach((d) => {
      const data = d.data() as TestSession;
      if (
        data &&
        data.id &&
        !data.id.startsWith('demo_') &&
        !data.title?.toLowerCase().includes('demo')
      ) {
        sessions.push(data);
      }
    });
    setFirebaseStatus('connected');
    return sessions;
  } catch (err) {
    if (isPermissionDeniedError(err)) {
      setFirebaseStatus(
        'permission_denied',
        'Firebase Firestore ruxsati cheklangan (permission-denied). Firebase Console > Firestore Database > Rules bo‘limida "allow read, write: if true;" qoidasini o‘rnating.'
      );
    } else {
      setFirebaseStatus('error', (err as Error)?.message || 'Firebase yuklash xatosi');
    }
    console.warn('Firebase-dan o‘qishda ogohlantirish:', err);
    return [];
  }
}

/**
 * Sinovlarni Firebase Firestore dan jonli kuzatish (Real-time snapshot listener)
 */
export function subscribeToSessions(
  onUpdate: (sessions: TestSession[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const db = getFirebaseFirestore();
  if (!db) {
    setFirebaseStatus('error', 'Firebase Firestore ulanishi mavjud emas');
    return () => {};
  }

  try {
    const colRef = collection(db, 'test_sessions');
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        setFirebaseStatus('connected');
        const sessions: TestSession[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as TestSession;
          if (
            data &&
            data.id &&
            !data.id.startsWith('demo_') &&
            !data.title?.toLowerCase().includes('demo')
          ) {
            sessions.push(data);
          }
        });
        onUpdate(sessions);
      },
      (err) => {
        if (isPermissionDeniedError(err)) {
          setFirebaseStatus(
            'permission_denied',
            'Firebase Firestore ruxsati cheklangan (permission-denied). Firebase Console > Firestore Database > Rules bo‘limida "allow read, write: if true;" qoidasini o‘rnating.'
          );
        } else {
          setFirebaseStatus('error', (err as Error)?.message || 'Firebase xatoligi');
        }
        if (onError) onError(err);
      }
    );
    return unsubscribe;
  } catch (err) {
    if (isPermissionDeniedError(err)) {
      setFirebaseStatus(
        'permission_denied',
        'Firebase Firestore ruxsati cheklangan (permission-denied).'
      );
    } else {
      setFirebaseStatus('error', (err as Error)?.message || 'Firebase ulanish xatoligi');
    }
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Sinovni Firebase dan o'chirish
 */
export async function deleteSessionFromFirebase(sessionId: string): Promise<boolean> {
  const db = getFirebaseFirestore();
  if (!db) return false;

  try {
    await deleteDoc(doc(db, 'test_sessions', sessionId));
    return true;
  } catch (err) {
    if (isPermissionDeniedError(err)) {
      setFirebaseStatus(
        'permission_denied',
        'Firebase Firestore ruxsati cheklangan (permission-denied).'
      );
    }
    console.warn('Firebase-dan o‘chirishda xatolik:', err);
    return false;
  }
}

/**
 * O'quvchi javobini Firebase-ga yuborish
 */
export async function submitStudentAnswer(
  sessionId: string,
  currentSession: TestSession,
  student: StudentRecord
): Promise<TestSession> {
  // 1. Mavjud sessiyadagi o'quvchilar ro'yxatiga qo'shish yoki yangilash
  const existingIdx = currentSession.students.findIndex(
    (s) =>
      s.id === student.id ||
      (s.name.toLowerCase() === student.name.toLowerCase() &&
        s.className === student.className)
  );

  let updatedStudents: StudentRecord[];
  if (existingIdx >= 0) {
    updatedStudents = [...currentSession.students];
    updatedStudents[existingIdx] = student;
  } else {
    updatedStudents = [...currentSession.students, student];
  }

  const updatedSession: TestSession = {
    ...currentSession,
    students: updatedStudents,
    updatedAt: new Date().toISOString(),
  };

  // Firebase-ga yozish
  await syncSessionToFirebase(updatedSession);
  return updatedSession;
}

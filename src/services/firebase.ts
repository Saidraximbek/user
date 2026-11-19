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

export function getStoredFirebaseConfig(): FirebaseConfigState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FB_CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Agar eski placeholder bo'lsa, yangi finance-9b58b loyihasiga o'tkazish
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
  if (!db) return false;

  try {
    const sessionRef = doc(db, 'test_sessions', session.id);
    await setDoc(sessionRef, {
      ...session,
      syncedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn('Firebase-ga saqlashda xatolik (offline rejim ishlaydi):', err);
    return false;
  }
}

/**
 * Barcha sinovlarni Firebase dan olish
 */
export async function fetchSessionsFromFirebase(): Promise<TestSession[]> {
  const db = getFirebaseFirestore();
  if (!db) return [];

  try {
    const colRef = collection(db, 'test_sessions');
    const snap = await getDocs(colRef);
    const sessions: TestSession[] = [];
    snap.forEach((d) => {
      sessions.push(d.data() as TestSession);
    });
    return sessions;
  } catch (err) {
    console.warn('Firebase-dan o‘qishda ogohlantirish:', err);
    return [];
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
    console.warn('Firebase-dan o‘chirishda xatolik:', err);
    return false;
  }
}

/**
 * O'quvchi javobini Firebase-ga yuborish
 */
export async function submitStudentAnswer(sessionId: string, currentSession: TestSession, student: StudentRecord): Promise<TestSession> {
  // 1. Mavjud sessiyadagi o'quvchilar ro'yxatiga qo'shish yoki yangilash
  const existingIdx = currentSession.students.findIndex(
    (s) => s.id === student.id || (s.name.toLowerCase() === student.name.toLowerCase() && s.className === student.className)
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

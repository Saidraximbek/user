import { TestSession } from '../types';
import { syncSessionToFirebase, deleteSessionFromFirebase } from '../services/firebase';

const STORAGE_KEY_SESSIONS = 'zehnora_rash_sessions_v1';
const STORAGE_KEY_ACTIVE_ID = 'zehnora_rash_active_id_v1';
const STORAGE_KEY_ADMIN_PASS = 'zehnora_rash_admin_pass_v1';

export const DEFAULT_ADMIN_PASSWORD = 'admin';

export function getAdminPassword(): string {
  if (typeof localStorage === 'undefined') return DEFAULT_ADMIN_PASSWORD;
  return localStorage.getItem(STORAGE_KEY_ADMIN_PASS) || DEFAULT_ADMIN_PASSWORD;
}

export function setAdminPassword(newPass: string): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_ADMIN_PASS, newPass);
}

export function getAllSessions(): TestSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSIONS);
    if (!raw) return [];
    return JSON.parse(raw) as TestSession[];
  } catch (e) {
    console.error('Sessiyalarni o‘qishda xatolik:', e);
    return [];
  }
}

export function saveSession(session: TestSession, syncToRemote = true): void {
  try {
    const sessions = getAllSessions();
    const existingIdx = sessions.findIndex((s) => s.id === session.id);
    const updatedSession = { ...session, updatedAt: session.updatedAt || new Date().toISOString() };

    if (existingIdx >= 0) {
      sessions[existingIdx] = updatedSession;
    } else {
      sessions.unshift(updatedSession);
    }

    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, session.id);

    // Firebase Firestore bilan sinxronlash
    if (syncToRemote) {
      syncSessionToFirebase(updatedSession).catch((err) => {
        console.warn('Firebase sync xatosi:', err);
      });
    }
  } catch (e) {
    console.error('Sessiyani saqlashda xatolik:', e);
  }
}

export function deleteSession(id: string): void {
  try {
    const sessions = getAllSessions().filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
    const activeId = getActiveSessionId();
    if (activeId === id) {
      localStorage.removeItem(STORAGE_KEY_ACTIVE_ID);
    }

    // Firebase-dan ham o'chirish
    deleteSessionFromFirebase(id).catch((err) => {
      console.warn('Firebase delete xatosi:', err);
    });
  } catch (e) {
    console.error('Sessiyani o‘chirishda xatolik:', e);
  }
}

export function getActiveSessionId(): string | null {
  return localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
}

export function setActiveSessionId(id: string): void {
  localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
}

export function createNewSession(questionCount = 30): TestSession {
  const id = `session_${Date.now()}`;
  const questions = Array.from({ length: questionCount }, (_, idx) => ({
    id: `q_${idx + 1}`,
    number: idx + 1,
    label: (idx + 1).toString(),
    key: 'A',
    type: 'choice' as const,
    topic: '',
  }));

  const session: TestSession = {
    id,
    title: 'Yangi matematika sinovi',
    groupName: '10-A sinf',
    date: new Date().toISOString().split('T')[0],
    questionCount,
    questions,
    students: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveSession(session);
  return session;
}

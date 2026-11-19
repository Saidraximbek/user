import { describe, it, expect, beforeEach } from 'vitest';
import { createDemoSession } from './mockSession';
import { analyzeTestSession } from '../math/testAnalysis';
import {
  saveSession,
  getAllSessions,
  getActiveSessionId,
  setActiveSessionId,
} from '../storage/testStorage';
import { TestSession } from '../types';

// Mock localStorage for node environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('To‘liq foydalanuvchi ish jarayoni integratsion testi (E2E Simulyatsiya)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('Demo ochish -> Natijani ko‘rish -> Bitta javobni o‘zgartirish -> Qayta hisoblash -> Sahifani yangilash', () => {
    // 1. QADAM: Demo sinovni ochish
    const demoSession = createDemoSession();
    expect(demoSession.students.length).toBe(25);
    expect(demoSession.questions.length).toBe(30);

    saveSession(demoSession);
    setActiveSessionId(demoSession.id);

    // 2. QADAM: Natijalarni ko'rish
    const report1 = analyzeTestSession(demoSession);
    expect(report1.studentResults.length).toBe(25);
    expect(report1.questionResults.length).toBe(30);

    const aliInitial = report1.studentResults.find((s) => s.name === 'Ali Karimov')!;
    const initialAliScore = aliInitial.rawScore;
    const initialAliTheta = aliInitial.theta;

    // 3. QADAM: Bitta javobni o'zgartirish (Ali Karimovning xato javobini to'g'ri kalitga o'zgartiramiz)
    // Ali Karimovning 28 ta to'g'ri javobi bor edi. Xato ishlagan savolini to'g'irlaymiz:
    const updatedStudents = demoSession.students.map((st) => {
      if (st.name === 'Ali Karimov') {
        const newAns = [...st.answers];
        // 1-savol kaliti A. Agar uni o'zgartirsak yoki boshqa savolni o'zgartirsak:
        // Masalan 1-savol javobini 'B' ga (xatoga) o'zgartiraylik
        newAns[0] = 'B'; // Oldin 'A' edi (to'g'ri edi), endi xato bo'ldi
        return { ...st, answers: newAns };
      }
      return st;
    });

    const modifiedSession: TestSession = {
      ...demoSession,
      students: updatedStudents,
      updatedAt: new Date().toISOString(),
    };

    // Sinov xotiraga saqlanadi
    saveSession(modifiedSession);

    // 4. QADAM: Qayta hisoblash
    const report2 = analyzeTestSession(modifiedSession);
    const aliUpdated = report2.studentResults.find((s) => s.name === 'Ali Karimov')!;

    // Ball 1 taga kamaygan bo'lishi kerak va theta ham kamaygan bo'lishi kerak
    expect(aliUpdated.rawScore).toBe(initialAliScore - 1);
    expect(aliUpdated.theta).toBeLessThan(initialAliTheta);

    // 5. QADAM: Sahifani yangilash (LocalStorage'dan qayta o'qish)
    const activeId = getActiveSessionId();
    expect(activeId).toBe(modifiedSession.id);

    const reloadedSessions = getAllSessions();
    const reloadedActiveSession = reloadedSessions.find((s) => s.id === activeId)!;

    expect(reloadedActiveSession).toBeDefined();
    expect(reloadedActiveSession.title).toBe(demoSession.title);
    expect(reloadedActiveSession.students.length).toBe(25);

    // Ali Karimovning o'zgargan javobi ('B') saqlanib qolganligini tekshiramiz
    const aliReloaded = reloadedActiveSession.students.find((s) => s.name === 'Ali Karimov')!;
    expect(aliReloaded.answers[0]).toBe('B');

    // Qayta tiklangan sessiya tahlili ham aynan bir xil chiqadi
    const reloadedReport = analyzeTestSession(reloadedActiveSession);
    const aliFinal = reloadedReport.studentResults.find((s) => s.name === 'Ali Karimov')!;
    expect(aliFinal.rawScore).toBe(aliUpdated.rawScore);
    expect(aliFinal.theta).toBe(aliUpdated.theta);
  });
});

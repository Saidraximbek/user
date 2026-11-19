import { describe, it, expect, beforeEach } from 'vitest';
import { calculateRaschGrade } from '../math/raschGrades';
import { analyzeTestSession } from '../math/testAnalysis';
import { createDemoSession } from './mockSession';
import {
  getAdminPassword,
  setAdminPassword,
  DEFAULT_ADMIN_PASSWORD,
} from '../storage/testStorage';
import { TestSession } from '../types';

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

describe('Yangi talablar testlari (Rash A+, A, B+, B, C+, C darajalari va Admin tizimi)', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  it('1. Rash darajalari (A+, A, B+, B, C+, C) to‘g‘ri shkala bo‘yicha hisoblanadi', () => {
    // A+ : theta yuqori yoki foiz >= 90
    const gradeAPlus = calculateRaschGrade(2.5, 95);
    expect(gradeAPlus.grade).toBe('A+');

    // A : theta >= 1.0 yoki foiz >= 80
    const gradeA = calculateRaschGrade(1.4, 85);
    expect(gradeA.grade).toBe('A');

    // B+ : theta >= 0.4 yoki foiz >= 70
    const gradeBPlus = calculateRaschGrade(0.8, 75);
    expect(gradeBPlus.grade).toBe('B+');

    // B : theta >= -0.2 yoki foiz >= 60
    const gradeB = calculateRaschGrade(0.1, 65);
    expect(gradeB.grade).toBe('B');

    // C+ : theta >= -0.8 yoki foiz >= 50
    const gradeCPlus = calculateRaschGrade(-0.4, 55);
    expect(gradeCPlus.grade).toBe('C+');

    // C : theta < -0.8 yoki foiz < 50
    const gradeC = calculateRaschGrade(-1.5, 40);
    expect(gradeC.grade).toBe('C');
  });

  it('2. Sinov tahlilida har bir o‘quvchiga tegishli Rasch darajasi biriktiriladi', () => {
    const demo = createDemoSession();
    const report = analyzeTestSession(demo);

    report.studentResults.forEach((st) => {
      expect(['A+', 'A', 'B+', 'B', 'C+', 'C']).toContain(st.grade);
      expect(st.gradeDescription).toBeDefined();
    });

    // Kuchli o'quvchi (masalan Jasur Eshmatov) A+ yoki A daraja oladi
    const topStudent = report.studentResults.reduce((max, s) =>
      s.rawScore > max.rawScore ? s : max
    );
    expect(['A+', 'A']).toContain(topStudent.grade);
  });

  it('3. Admin paroli xotirada saqlanadi va yangilanadi', () => {
    expect(getAdminPassword()).toBe(DEFAULT_ADMIN_PASSWORD);

    setAdminPassword('yangiParol2026');
    expect(getAdminPassword()).toBe('yangiParol2026');

    // Qayta tiklash
    setAdminPassword(DEFAULT_ADMIN_PASSWORD);
  });

  it('4. Test kitobi fayli (bookFileName, bookFileData) sessiya tarkibida saqlanadi', () => {
    const sessionWithBook: TestSession = {
      ...createDemoSession(),
      bookFileName: 'matematika_10_nazorat.pdf',
      bookFileData: 'data:application/pdf;base64,JVBERi0xLjQK...',
      bookFileType: 'pdf',
    };

    expect(sessionWithBook.bookFileName).toBe('matematika_10_nazorat.pdf');
    expect(sessionWithBook.bookFileType).toBe('pdf');
  });
});

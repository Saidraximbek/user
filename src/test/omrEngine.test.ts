import { describe, it, expect, beforeEach } from 'vitest';
import { getOmrTemplate } from '../utils/omrTemplate';
import { processOmrImage } from '../utils/omrEngine';
import { createSyntheticOmrSheet } from './omrTestGenerator';
import { QuestionDef, TestSession } from '../types';
import { analyzeTestSession } from '../math/testAnalysis';
import { mergeScannedResults } from '../utils/omrSync';

// Mock localStorage va Canvas agar kerak bo'lsa
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

describe('OMR Skaner va Titul Tahlili (Vitest)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // 20 savollik test savollari
  const questions20: QuestionDef[] = Array.from({ length: 20 }, (_, idx) => ({
    id: `q_${idx + 1}`,
    number: idx + 1,
    label: (idx + 1).toString(),
    key: ['A', 'B', 'C', 'D'][idx % 4],
    type: 'choice' as const,
  }));

  // 30 savollik test savollari
  const questions30: QuestionDef[] = Array.from({ length: 30 }, (_, idx) => ({
    id: `q_${idx + 1}`,
    number: idx + 1,
    label: (idx + 1).toString(),
    key: ['A', 'B', 'C', 'D'][idx % 4],
    type: 'choice' as const,
  }));

  it('1. 20 savollik shablon to‘g‘ri shakllanadi (2 ustun, har biri 10 tadan)', () => {
    const template = getOmrTemplate(questions20);
    expect(template.questionCount).toBe(20);
    expect(template.questionRows.length).toBe(20);
    expect(template.cornerMarkers.topLeft.x).toBe(80);
    expect(template.cornerMarkers.topRight.x).toBe(1120);

    // Har bir yopiq savolda 4 ta variant bo'lishi kerak
    expect(template.questionRows[0].options.length).toBe(4);
    expect(template.questionRows[0].options.map((o) => o.optionLabel)).toEqual(['A', 'B', 'C', 'D']);
  });

  it('2. 30 savollik shablon to‘g‘ri shakllanadi (2 ustun, har biri 15 tadan)', () => {
    const template = getOmrTemplate(questions30);
    expect(template.questionCount).toBe(30);
    expect(template.questionRows.length).toBe(30);
  });

  it('3. Toza varaq (barcha savollar bo‘sh): barcha javoblar "-" deb aniqlanadi', async () => {
    const template = getOmrTemplate(questions20);
    // Hech qanday belgi yo'q
    const canvas = createSyntheticOmrSheet(template, {});
    const result = await processOmrImage(canvas, questions20);

    expect(result.success).toBe(true);
    expect(result.detections.length).toBe(20);

    // Barchasi bo'sh bo'lishi kerak
    const allOmitted = result.detections.every((d) => d.isOmitted && d.detectedAnswer === '-');
    expect(allOmitted).toBe(true);
  });

  it('4. Belgilangan javoblar (Known answers) aniq o‘qiladi', async () => {
    const template = getOmrTemplate(questions20);
    // Ma'lum javoblar to'plami
    const knownAnswers: Record<number, string> = {
      1: 'A',
      2: 'B',
      3: 'C',
      4: 'D',
      5: 'A',
      6: 'B',
      7: 'C',
      8: 'D',
    };

    const canvas = createSyntheticOmrSheet(template, knownAnswers);
    const result = await processOmrImage(canvas, questions20);

    expect(result.success).toBe(true);

    // 1-8 savollar aniq o'qilgan bo'lishi kerak
    expect(result.detections[0].detectedAnswer).toBe('A');
    expect(result.detections[1].detectedAnswer).toBe('B');
    expect(result.detections[2].detectedAnswer).toBe('C');
    expect(result.detections[3].detectedAnswer).toBe('D');
    expect(result.detections[4].detectedAnswer).toBe('A');
    expect(result.detections[5].detectedAnswer).toBe('B');
    expect(result.detections[6].detectedAnswer).toBe('C');
    expect(result.detections[7].detectedAnswer).toBe('D');

    // Belgilanmagan 9-savol bo'sh bo'lishi kerak
    expect(result.detections[8].detectedAnswer).toBe('-');
  });

  it('5. Ikkita belgi bo‘yalgan savolda shubhali holat (isAmbiguous = true, needsReview = true) aniqlanadi', async () => {
    const template = getOmrTemplate(questions20);
    const knownAnswers: Record<number, string> = { 1: 'C' };

    // 2-savolga A va B ikkita belgi qo'yiladi
    const canvas = createSyntheticOmrSheet(template, knownAnswers, {
      doubleMarkQuestions: [2],
    });

    const result = await processOmrImage(canvas, questions20);
    expect(result.success).toBe(true);

    const q2 = result.detections.find((d) => d.questionNumber === 2)!;
    expect(q2.isAmbiguous).toBe(true);
    expect(q2.needsReview).toBe(true);
    expect(result.reviewNeededCount).toBeGreaterThanOrEqual(1);
    expect(q2.cropDataUrl).toBeDefined();
  });

  it('6. Burchagi kesilgan varaqda xatolik qaytariladi va qayta suratga olish so‘raladi', async () => {
    const template = getOmrTemplate(questions20);
    // Yuqori chap burchak kesilgan varaq
    const canvas = createSyntheticOmrSheet(template, { 1: 'A' }, {
      cutCorner: 'topLeft',
    });

    const result = await processOmrImage(canvas, questions20);
    expect(result.success).toBe(false);
    expect(result.errorMessage).toContain('Tayanch burchak belgilari');
  });

  it('7. 30 savollik shablon uchun 30 ta savol to‘liq o‘qiladi', async () => {
    const template = getOmrTemplate(questions30);
    const answers30: Record<number, string> = {};
    for (let i = 1; i <= 30; i++) {
      answers30[i] = ['A', 'B', 'C', 'D'][(i - 1) % 4];
    }

    const canvas = createSyntheticOmrSheet(template, answers30);
    const result = await processOmrImage(canvas, questions30);

    expect(result.success).toBe(true);
    expect(result.detections.length).toBe(30);
    expect(result.detections[0].detectedAnswer).toBe('A');
    expect(result.detections[14].detectedAnswer).toBe('C');
    expect(result.detections[29].detectedAnswer).toBe('B');
  });

  it('8. Skanerlangan javoblar Rash moduliga uzatilganda qobiliyat theta va daraja (A+, A...) hisoblanadi', () => {
    const session: TestSession = {
      id: 'omr_test_sess',
      title: 'OMR Nazorat',
      groupName: '10-A',
      date: '2026-11-19',
      questionCount: 4,
      questions: [
        { id: 'q1', number: 1, label: '1', key: 'A', type: 'choice' },
        { id: 'q2', number: 2, label: '2', key: 'B', type: 'choice' },
        { id: 'q3', number: 3, label: '3', key: 'C', type: 'choice' },
        { id: 'q4', number: 4, label: '4', key: 'D', type: 'choice' },
      ],
      students: [
        // Skanerdan kelgan o'quvchi javoblari
        {
          id: 'omr_st_1',
          name: 'Sardor Rahimiy',
          answers: ['A', 'B', 'C', 'D'], // 4/4 to'liq ball
        },
      ],
      createdAt: '2026-11-19T10:00:00Z',
      updatedAt: '2026-11-19T10:00:00Z',
    };

    const report = analyzeTestSession(session);
    const st = report.studentResults[0];

    expect(st.rawScore).toBe(4);
    expect(st.percent).toBe(100);
    expect(st.grade).toBe('A+'); // Mukammal daraja
    expect(Number.isFinite(st.theta)).toBe(true);
  });

  it('9. Telefon va Noutbuk sinxronlash: natijalar birlashtiriladi va dublikatlar oldi olinadi', () => {
    const session: TestSession = {
      id: 'sess_sync_1',
      title: 'Sinxron Sinov',
      groupName: '11-A',
      date: '2026-11-19',
      questionCount: 2,
      questions: [
        { id: 'q1', number: 1, label: '1', key: 'A', type: 'choice' },
        { id: 'q2', number: 2, label: '2', key: 'B', type: 'choice' },
      ],
      students: [
        { id: 'st_1', name: 'Ali Karimov', answers: ['A', '-'] },
      ],
      createdAt: '2026-11-19T10:00:00Z',
      updatedAt: '2026-11-19T10:00:00Z',
    };

    // Telefondan kelgan paket (Ali yangilangan javobi va yangi Vali)
    const mobilePkg = JSON.stringify({
      app: 'zehnora_omr_sync',
      version: 1,
      sessionId: 'sess_sync_1',
      sessionTitle: 'Sinxron Sinov',
      questionCount: 2,
      exportedAt: new Date().toISOString(),
      submissions: [
        { id: 'st_1', name: 'Ali Karimov', className: '11-A', answers: ['A', 'B'] },
        { id: 'st_2', name: 'Vali Salimov', className: '11-A', answers: ['B', 'B'] },
      ],
    });

    const { updatedSession, addedCount, updatedCount } = mergeScannedResults(session, mobilePkg);

    expect(addedCount).toBe(1); // Vali qo'shildi
    expect(updatedCount).toBe(1); // Ali yangilandi
    expect(updatedSession.students.length).toBe(2);

    const ali = updatedSession.students.find((s) => s.id === 'st_1')!;
    expect(ali.answers).toEqual(['A', 'B']); // Yangilangan javob
  });

  it('10. End-to-End jarayon: Titul yaratish -> OMR o‘qish -> O‘qituvchi tuzatishi -> Rash hisoboti', async () => {
    // 1. Sinov yaratish
    const session: TestSession = {
      id: 'e2e_session_1',
      title: 'Matematika Yakuniy Nazorat',
      groupName: '11-B',
      date: '2026-11-19',
      questionCount: 4,
      questions: [
        { id: 'q1', number: 1, label: '1', key: 'A', topic: 'Algebra', type: 'choice' },
        { id: 'q2', number: 2, label: '2', key: 'B', topic: 'Algebra', type: 'choice' },
        { id: 'q3', number: 3, label: '3', key: 'C', topic: 'Geometriya', type: 'choice' },
        { id: 'q4', number: 4, label: '4', key: 'D', topic: 'Geometriya', type: 'choice' },
      ],
      students: [
        { id: 'st_existing', name: 'Zuhra Karimova', answers: ['A', 'B', 'A', 'D'] },
      ],
      createdAt: '2026-11-19T10:00:00Z',
      updatedAt: '2026-11-19T10:00:00Z',
    };

    // 2. OMR shablon va titul tasviri
    const template = getOmrTemplate(session.questions);
    // O'quvchi: Q1=A, Q2=shubhali(A va B), Q3=C, Q4=D
    const canvas = createSyntheticOmrSheet(template, { 1: 'A', 3: 'C', 4: 'D' }, {
      doubleMarkQuestions: [2],
    });

    // 3. OMR Skaner tahlili
    const scanResult = await processOmrImage(canvas, session.questions, session.id);
    expect(scanResult.success).toBe(true);
    expect(scanResult.detections.length).toBe(4);

    // Q2 shubhali bo'lishi kerak
    const q2Detection = scanResult.detections.find((d) => d.questionNumber === 2)!;
    expect(q2Detection.needsReview).toBe(true);
    expect(q2Detection.cropDataUrl).toBeDefined();

    // 4. O'qituvchi tasdig'i va tuzatishi (Teacher review simulation)
    const finalAnswers = scanResult.detections.map((d) => {
      if (d.questionNumber === 2) {
        return 'B'; // O'qituvchi kesmani ko'rib B ni tasdiqladi
      }
      return d.detectedAnswer;
    });

    // 5. O'quvchini sinovga saqlash
    session.students.push({
      id: 'st_new_scanned',
      name: 'Bobur Mirzoyev',
      answers: finalAnswers,
    });

    // 6. Rash hisoblash modulini ishga tushirish
    const report = analyzeTestSession(session);

    // Tekshirish: 2 ta o'quvchi
    expect(report.studentResults.length).toBe(2);

    const bobur = report.studentResults.find((s) => s.name === 'Bobur Mirzoyev')!;
    expect(bobur.rawScore).toBe(4); // 4 ta to'g'ri (A, B, C, D)
    expect(bobur.percent).toBe(100);
    expect(bobur.grade).toBe('A+');
    expect(Number.isFinite(bobur.theta)).toBe(true);

    // Mavzular bo'yicha tahlil tekshiruvi
    expect(report.topicResults.length).toBe(2);
    const algebra = report.topicResults.find((t) => t.topic === 'Algebra')!;
    expect(algebra.correctCount).toBe(4); // Har ikki o'quvchi ham Q1 va Q2 ni to'g'ri topdi
  });
});

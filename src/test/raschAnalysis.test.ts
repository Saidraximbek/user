import { describe, it, expect } from 'vitest';
import { analyzeTestSession } from '../math/testAnalysis';
import { parseExcelStudentData, parseAnswerKeyInput } from '../utils/excelParser';
import { parseSessionFromJson } from '../utils/exportImport';
import { createDemoSession } from './mockSession';
import { TestSession, QuestionDef } from '../types';

describe('Zehnora — Rash tahlili testlari', () => {
  // Test 1: Kalit ABCD, javob A-CD bo'lsa: 3 ta to'g'ri, 0 ta noto'g'ri, 1 ta javobsiz, 75%
  it('1. Kalit ABCD, javob A-CD bo‘lsa: 3 ta to‘g‘ri, 0 ta noto‘g‘ri, 1 ta javobsiz, 75%', () => {
    const questions: QuestionDef[] = [
      { id: 'q1', number: 1, label: '1', key: 'A', type: 'choice' },
      { id: 'q2', number: 2, label: '2', key: 'B', type: 'choice' },
      { id: 'q3', number: 3, label: '3', key: 'C', type: 'choice' },
      { id: 'q4', number: 4, label: '4', key: 'D', type: 'choice' },
    ];

    const session: TestSession = {
      id: 'test_session_1',
      title: 'Kichik sinov',
      groupName: 'Guruh 1',
      date: '2026-11-18',
      questionCount: 4,
      questions,
      students: [
        {
          id: 'st_1',
          name: 'Ali Karimov',
          answers: ['A', '-', 'C', 'D'], // Q2 javobsiz ('-')
        },
      ],
      createdAt: '2026-11-18T10:00:00Z',
      updatedAt: '2026-11-18T10:00:00Z',
    };

    const report = analyzeTestSession(session);
    const res = report.studentResults[0];

    expect(res.correctCount).toBe(3);
    expect(res.incorrectCount).toBe(0);
    expect(res.omittedCount).toBe(1);
    expect(res.rawScore).toBe(3);
    expect(res.percent).toBe(75);
  });

  // Test 2: Excel'dan o'rtadagi bo'sh katak bilan ko'chirilgan javoblar siljimaydi
  it('2. Excel’dan o‘rtadagi bo‘sh katak bilan ko‘chirilgan javoblar siljimaydi', () => {
    const questions: QuestionDef[] = [
      { id: 'q1', number: 1, label: 'Q1', key: 'A', type: 'choice' },
      { id: 'q2', number: 2, label: 'Q2', key: 'B', type: 'choice' },
      { id: 'q3', number: 3, label: 'Q3', key: 'C', type: 'choice' },
      { id: 'q4', number: 4, label: 'Q4', key: 'D', type: 'choice' },
    ];

    // Q2 bo'sh katak (\t\t): Ali Karimov \t A \t [bo'sh] \t C \t D
    const pastedExcel = 'Ali Karimov\tA\t\tC\tD';
    const parsed = parseExcelStudentData(pastedExcel, questions);

    expect(parsed.rows.length).toBe(1);
    const answers = parsed.rows[0].rawAnswers;
    // Q1 = A, Q2 = '-', Q3 = C, Q4 = D (Q3 javobi Q2 ga siljimagan!)
    expect(answers[0]).toBe('A');
    expect(answers[1]).toBe('-');
    expect(answers[2]).toBe('C');
    expect(answers[3]).toBe('D');
  });

  // Test 3: Bir xil umumiy ball bir xil theta beradi. Yuqoriroq umumiy ball yuqoriroq theta beradi.
  it('3. Bir xil umumiy ball bir xil theta beradi. Yuqoriroq umumiy ball yuqoriroq theta beradi', () => {
    const questions: QuestionDef[] = [
      { id: 'q1', number: 1, label: '1', key: 'A', type: 'choice' },
      { id: 'q2', number: 2, label: '2', key: 'B', type: 'choice' },
      { id: 'q3', number: 3, label: '3', key: 'C', type: 'choice' },
      { id: 'q4', number: 4, label: '4', key: 'D', type: 'choice' },
      { id: 'q5', number: 5, label: '5', key: 'A', type: 'choice' },
      { id: 'q6', number: 6, label: '6', key: 'B', type: 'choice' },
    ];

    const session: TestSession = {
      id: 'test_session_3',
      title: 'Ballar solishtiruvi',
      groupName: 'Guruh 3',
      date: '2026-11-18',
      questionCount: 6,
      questions,
      students: [
        // Ali: Q1, Q2, Q3 to'g'ri (3 ta to'g'ri)
        { id: 'st_1', name: 'Ali Karimov', answers: ['A', 'B', 'C', 'A', 'B', 'C'] },
        // Vali: Q4, Q5, Q6 to'g'ri (3 ta to'g'ri) — savollari boshqa bo'lsa ham umumiy balli bir xil!
        { id: 'st_2', name: 'Vali Salimov', answers: ['B', 'A', 'D', 'D', 'A', 'B'] },
        // Jasur: 5 ta to'g'ri (yuqoriroq ball)
        { id: 'st_3', name: 'Jasur Eshmatov', answers: ['A', 'B', 'C', 'D', 'A', 'C'] },
        // Dilnoza: 1 ta to'g'ri (pastroq ball)
        { id: 'st_4', name: 'Dilnoza Toirova', answers: ['A', 'A', 'A', 'A', 'B', 'C'] },
      ],
      createdAt: '2026-11-18T10:00:00Z',
      updatedAt: '2026-11-18T10:00:00Z',
    };

    const report = analyzeTestSession(session);
    const ali = report.studentResults.find((s) => s.name === 'Ali Karimov')!;
    const vali = report.studentResults.find((s) => s.name === 'Vali Salimov')!;
    const jasur = report.studentResults.find((s) => s.name === 'Jasur Eshmatov')!;
    const dilnoza = report.studentResults.find((s) => s.name === 'Dilnoza Toirova')!;

    // 1) Bir xil umumiy ball olgan ikki o'quvchiga bir xil theta chiqishi kerak
    expect(ali.rawScore).toBe(vali.rawScore);
    expect(ali.theta).toBe(vali.theta);

    // 2) Yuqoriroq umumiy ball yuqoriroq theta beradi
    expect(jasur.rawScore).toBeGreaterThan(ali.rawScore);
    expect(jasur.theta).toBeGreaterThan(ali.theta);

    // 3) Pastroq ball pastroq theta beradi
    expect(dilnoza.rawScore).toBeLessThan(ali.rawScore);
    expect(dilnoza.theta).toBeLessThan(ali.theta);
  });

  // Test 4: Kamroq o'quvchi topgan savolning b qiymati yuqoriroq chiqadi
  it('4. Kamroq o‘quvchi topgan savolning b qiymati yuqoriroq chiqadi', () => {
    const questions: QuestionDef[] = [
      { id: 'q1', number: 1, label: 'Q1', key: 'A', type: 'choice' }, // Oson savol (ko'pchilik topadi)
      { id: 'q2', number: 2, label: 'Q2', key: 'B', type: 'choice' }, // Qiyin savol (kamchilik topadi)
    ];

    const session: TestSession = {
      id: 'test_session_4',
      title: 'Qiyinlik solishtiruvi',
      groupName: 'Guruh 4',
      date: '2026-11-18',
      questionCount: 2,
      questions,
      students: [
        { id: 'st_1', name: 'O‘quvchi 1', answers: ['A', 'A'] }, // Q1 to'g'ri, Q2 xato
        { id: 'st_2', name: 'O‘quvchi 2', answers: ['A', 'A'] }, // Q1 to'g'ri, Q2 xato
        { id: 'st_3', name: 'O‘quvchi 3', answers: ['A', 'A'] }, // Q1 to'g'ri, Q2 xato
        { id: 'st_4', name: 'O‘quvchi 4', answers: ['A', 'B'] }, // Q1 to'g'ri, Q2 to'g'ri
        { id: 'st_5', name: 'O‘quvchi 5', answers: ['A', 'C'] }, // Q1 to'g'ri, Q2 xato
      ],
      createdAt: '2026-11-18T10:00:00Z',
      updatedAt: '2026-11-18T10:00:00Z',
    };

    const report = analyzeTestSession(session);
    const q1 = report.questionResults.find((q) => q.questionLabel === 'Q1')!;
    const q2 = report.questionResults.find((q) => q.questionLabel === 'Q2')!;

    // Q1 ni 5 kishi topdi, Q2 ni 1 kishi topdi
    expect(q1.correctCount).toBe(5);
    expect(q2.correctCount).toBe(1);

    // Kamroq o'quvchi topgan savol qiyinroq bo'ladi -> b qiymati yuqoriroq
    expect(q2.b).toBeGreaterThan(q1.b);
  });

  // Test 5: Hammasini topgan va hech birini topmagan o'quvchida NaN yoki Infinity chiqmaydi
  it('5. Hammasini topgan va hech birini topmagan o‘quvchida NaN yoki Infinity chiqmaydi', () => {
    const questions: QuestionDef[] = [
      { id: 'q1', number: 1, label: '1', key: 'A', type: 'choice' },
      { id: 'q2', number: 2, label: '2', key: 'B', type: 'choice' },
      { id: 'q3', number: 3, label: '3', key: 'C', type: 'choice' },
      { id: 'q4', number: 4, label: '4', key: 'D', type: 'choice' },
    ];

    const session: TestSession = {
      id: 'test_session_5',
      title: 'Ekstremal ballar',
      groupName: 'Guruh 5',
      date: '2026-11-18',
      questionCount: 4,
      questions,
      students: [
        // Hammasini topgan (4/4)
        { id: 'st_all', name: 'A’lochi O‘quvchi', answers: ['A', 'B', 'C', 'D'] },
        // Hech birini topmagan (0/4)
        { id: 'st_zero', name: 'Nol Ball', answers: ['B', 'A', 'D', 'C'] },
        // O'rtacha o'quvchi
        { id: 'st_mid', name: 'O‘rta O‘quvchi', answers: ['A', 'B', 'A', 'A'] },
      ],
      createdAt: '2026-11-18T10:00:00Z',
      updatedAt: '2026-11-18T10:00:00Z',
    };

    const report = analyzeTestSession(session);
    const stAll = report.studentResults.find((s) => s.name === 'A’lochi O‘quvchi')!;
    const stZero = report.studentResults.find((s) => s.name === 'Nol Ball')!;

    expect(Number.isFinite(stAll.theta)).toBe(true);
    expect(Number.isNaN(stAll.theta)).toBe(false);

    expect(Number.isFinite(stZero.theta)).toBe(true);
    expect(Number.isNaN(stZero.theta)).toBe(false);

    expect(stAll.theta).toBeGreaterThan(stZero.theta);
  });

  // Test 6: Kalit tahrirlangandan keyin hisobot yangilanadi
  it('6. Kalit tahrirlangandan keyin hisobot yangilanadi', () => {
    const session: TestSession = {
      id: 'test_session_6',
      title: 'Kalit tahriri',
      groupName: 'Guruh 6',
      date: '2026-11-18',
      questionCount: 2,
      questions: [
        { id: 'q1', number: 1, label: '1', key: 'A', type: 'choice' },
        { id: 'q2', number: 2, label: '2', key: 'B', type: 'choice' },
      ],
      students: [
        { id: 'st_1', name: 'Ali', answers: ['A', 'C'] }, // Q1 to'g'ri, Q2 xato
      ],
      createdAt: '2026-11-18T10:00:00Z',
      updatedAt: '2026-11-18T10:00:00Z',
    };

    const report1 = analyzeTestSession(session);
    expect(report1.studentResults[0].rawScore).toBe(1);

    // O'qituvchi 2-savol kalitini 'B' dan 'C' ga o'zgartirdi
    const updatedSession: TestSession = {
      ...session,
      questions: [
        { id: 'q1', number: 1, label: '1', key: 'A', type: 'choice' },
        { id: 'q2', number: 2, label: '2', key: 'C', type: 'choice' }, // Yangi kalit 'C'
      ],
    };

    const report2 = analyzeTestSession(updatedSession);
    expect(report2.studentResults[0].rawScore).toBe(2); // Endi 2 ta to'g'ri!
  });

  // Test 7: JSON zaxirani qayta ochganda sinov va javoblar tiklanadi
  it('7. JSON zaxirani qayta ochganda sinov va javoblar tiklanadi', () => {
    const originalSession: TestSession = {
      id: 'backup_123',
      title: 'Matematika Nazorati',
      groupName: '11-B sinf',
      date: '2026-11-18',
      questionCount: 3,
      questions: [
        { id: 'q1', number: 1, label: '1', key: 'A', type: 'choice', topic: 'Kasrlar' },
        { id: 'q2', number: 2, label: '2', key: 'C', type: 'choice', topic: 'Tenglamalar' },
        { id: 'q3', number: 3, label: '3a', key: '1', type: 'binary', topic: 'Ochiq savol' },
      ],
      students: [
        { id: 'st_1', name: 'Nodirbek', answers: ['A', 'C', '1'] },
        { id: 'st_2', name: 'Zulayho', answers: ['B', '-', '0'] },
      ],
      createdAt: '2026-11-18T09:00:00Z',
      updatedAt: '2026-11-18T09:30:00Z',
    };

    const jsonString = JSON.stringify(originalSession);
    const restoredSession = parseSessionFromJson(jsonString);

    expect(restoredSession.title).toBe(originalSession.title);
    expect(restoredSession.groupName).toBe(originalSession.groupName);
    expect(restoredSession.questions.length).toBe(3);
    expect(restoredSession.questions[2].label).toBe('3a');
    expect(restoredSession.questions[2].type).toBe('binary');
    expect(restoredSession.students.length).toBe(2);
    expect(restoredSession.students[1].answers).toEqual(['B', '-', '0']);
  });

  // Test 8: Demo sinov to'liq 30 savol va 25 o'quvchi bilan muvaffaqiyatli hisoblanadi
  it('8. Demo sinov 30 savol va 25 o‘quvchi bilan to‘liq tahlil qilinadi', () => {
    const demo = createDemoSession();
    expect(demo.questions.length).toBe(30);
    expect(demo.students.length).toBe(25);

    const report = analyzeTestSession(demo);
    expect(report.studentResults.length).toBe(25);
    expect(report.questionResults.length).toBe(30);
    expect(report.topicResults.length).toBeGreaterThan(0);

    // Har bir o'quvchining theta bahosi mavjud va chekli
    report.studentResults.forEach((st) => {
      expect(Number.isFinite(st.theta)).toBe(true);
      expect(st.percent).toBeGreaterThanOrEqual(0);
      expect(st.percent).toBeLessThanOrEqual(100);
    });

    // Eng past mavzu "Takrorlash uchun" (isNeedsReview) deb belgilangan
    const reviewTopics = report.topicResults.filter((t) => t.isNeedsReview);
    expect(reviewTopics.length).toBeGreaterThan(0);
  });

  // Test 9: Hamma bir xil umumiy ball olsa, ogohlantirish beriladi
  it('9. Guruhdagi barcha o‘quvchilar bir xil umumiy ball olsa, ogohlantirish qaytariladi', () => {
    const questions: QuestionDef[] = [
      { id: 'q1', number: 1, label: '1', key: 'A', type: 'choice' },
      { id: 'q2', number: 2, label: '2', key: 'B', type: 'choice' },
    ];

    const session: TestSession = {
      id: 'test_session_same',
      title: 'Bir xil ballar',
      groupName: 'Guruh X',
      date: '2026-11-18',
      questionCount: 2,
      questions,
      students: [
        { id: 'st_1', name: 'Ali', answers: ['A', 'A'] }, // 1 ball
        { id: 'st_2', name: 'Vali', answers: ['A', 'A'] }, // 1 ball
        { id: 'st_3', name: 'Gani', answers: ['A', 'A'] }, // 1 ball
      ],
      createdAt: '2026-11-18T10:00:00Z',
      updatedAt: '2026-11-18T10:00:00Z',
    };

    const report = analyzeTestSession(session);
    expect(report.hasSameTotalScores).toBe(true);
    expect(report.warnings.some((w) => w.includes('bir xil umumiy ball'))).toBe(true);
  });

  // Test 10: 0/1 binary ochiq savollar (masalan 30a va 30b) to'g'ri tekshiriladi
  it('10. 0/1 binary ochiq savollar (30a va 30b) to‘g‘ri baholanadi', () => {
    const questions: QuestionDef[] = [
      { id: 'q1', number: 1, label: '30a', key: '1', type: 'binary' },
      { id: 'q2', number: 2, label: '30b', key: '1', type: 'binary' },
    ];

    const session: TestSession = {
      id: 'test_binary',
      title: 'Ochiq savollar',
      groupName: 'Guruh B',
      date: '2026-11-18',
      questionCount: 2,
      questions,
      students: [
        { id: 'st_1', name: 'O‘quvchi 1', answers: ['1', '0'] }, // 30a to'g'ri, 30b xato
      ],
      createdAt: '2026-11-18T10:00:00Z',
      updatedAt: '2026-11-18T10:00:00Z',
    };

    const report = analyzeTestSession(session);
    const st = report.studentResults[0];
    expect(st.rawScore).toBe(1);
    expect(st.correctCount).toBe(1);
    expect(st.incorrectCount).toBe(1);
    expect(st.answerDetails[0].isCorrect).toBe(true);
    expect(st.answerDetails[1].isCorrect).toBe(false);
  });
});

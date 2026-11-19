import {
  QuestionDef,
  StudentRecord,
  StudentRaschResult,
  QuestionRaschResult,
  TopicRaschResult,
  RaschAnalysisReport,
  TestSession,
} from '../types';
import { estimateRaschParameters } from './rasch';
import { calculateRaschGrade } from './raschGrades';

/**
 * Javobni tozalash va standartlashtirish
 */
export function normalizeAnswer(ans: string | null | undefined): string {
  if (ans === null || ans === undefined) return '-';
  const trimmed = ans.trim().toUpperCase();
  if (trimmed === '' || trimmed === '-') return '-';
  return trimmed;
}

/**
 * 0/1 matritsasini va to'liq tahlil hisobotini yaratish
 */
export function analyzeTestSession(session: TestSession): RaschAnalysisReport {
  const { questions, students } = session;
  const N = students.length;
  const M = questions.length;

  if (N === 0 || M === 0) {
    return {
      sessionId: session.id,
      calculatedAt: new Date().toISOString(),
      studentResults: [],
      questionResults: [],
      topicResults: [],
      hasSameTotalScores: false,
      isSmallGroup: true,
      warnings: ["O'quvchilar yoki savollar mavjud emas."],
      iterations: 0,
      converged: true,
      note: "Bu baho shu sinov va guruh javoblari asosida hisoblangan.",
    };
  }

  // 1. 0/1 matritsani tuzish va o'quvchilarning har bir savol bo'yicha tahlilini yig'ish
  const matrix: number[][] = [];
  const studentDetailedAnswers: StudentRaschResult['answerDetails'][] = [];
  const studentRawScores: number[] = [];
  const studentCorrectCounts: number[] = [];
  const studentIncorrectCounts: number[] = [];
  const studentOmittedCounts: number[] = [];

  // Savol bo'yicha distractor hisoblagichlari
  const questionDistractors: Record<string, number>[] = questions.map(() => ({}));
  const questionCorrectCounts: number[] = new Array(M).fill(0);

  for (let i = 0; i < N; i++) {
    const student = students[i];
    const row: number[] = [];
    const details: StudentRaschResult['answerDetails'] = [];

    let correct = 0;
    let incorrect = 0;
    let omitted = 0;

    for (let j = 0; j < M; j++) {
      const q = questions[j];
      const rawAns = student.answers[j];
      const normAns = normalizeAnswer(rawAns);
      const isOmitted = normAns === '-';
      const normKey = q.key.trim().toUpperCase();

      // Distractor hisobiga kiritish
      const distKey = isOmitted ? '-' : normAns;
      questionDistractors[j][distKey] = (questionDistractors[j][distKey] || 0) + 1;

      let isCorrect = false;
      if (!isOmitted) {
        if (q.type === 'binary') {
          // 0/1 tekshiruvi: "1" to'g'ri, "0" noto'g'ri
          isCorrect = normAns === '1' || normAns === normKey;
        } else {
          isCorrect = normAns === normKey;
        }
      }

      if (isCorrect) {
        correct++;
        row.push(1);
        questionCorrectCounts[j]++;
      } else {
        if (isOmitted) {
          omitted++;
        } else {
          incorrect++;
        }
        row.push(0);
      }

      details.push({
        questionNumber: q.number,
        questionLabel: q.label,
        studentAnswer: isOmitted ? '-' : normAns,
        correctAnswer: normKey,
        isCorrect,
        isOmitted,
        topic: q.topic?.trim() || undefined,
      });
    }

    matrix.push(row);
    studentDetailedAnswers.push(details);
    studentRawScores.push(correct);
    studentCorrectCounts.push(correct);
    studentIncorrectCounts.push(incorrect);
    studentOmittedCounts.push(omitted);
  }

  // 2. Rash parametrlarini hisoblash
  const raschOutput = estimateRaschParameters({ matrix });

  // 3. O'quvchilar natijalarini shakllantirish
  const studentResults: StudentRaschResult[] = students.map((student, i) => {
    const rawScore = studentRawScores[i];
    const percent = Math.round((rawScore / M) * 1000) / 10; // masalan 83.3%
    const theta = Math.round(raschOutput.thetas[i] * 100) / 100;
    const isApproximate = raschOutput.extremeStudents[i] || raschOutput.isSmallGroup;
    const gradeInfo = calculateRaschGrade(theta, percent);

    return {
      studentId: student.id,
      name: student.name,
      className: student.className,
      rawScore,
      totalQuestions: M,
      percent,
      theta,
      grade: gradeInfo.grade,
      gradeDescription: gradeInfo.title,
      correctCount: studentCorrectCounts[i],
      incorrectCount: studentIncorrectCounts[i],
      omittedCount: studentOmittedCounts[i],
      isApproximate,
      answerDetails: studentDetailedAnswers[i],
    };
  });

  // 4. Savollar natijalarini shakllantirish
  const questionResults: QuestionRaschResult[] = questions.map((q, j) => {
    const correctCount = questionCorrectCounts[j];
    const percent = Math.round((correctCount / N) * 1000) / 10;
    const isApproximate = raschOutput.extremeQuestions[j] || raschOutput.isSmallGroup;

    return {
      questionNumber: q.number,
      questionLabel: q.label,
      key: q.key.trim().toUpperCase(),
      topic: q.topic?.trim() || undefined,
      correctCount,
      totalStudents: N,
      percent,
      b: Math.round(raschOutput.bValues[j] * 100) / 100,
      isApproximate,
      distractorCounts: questionDistractors[j],
    };
  });

  // 5. Mavzular bo'yicha tahlil
  // Mavzular faqat haqiqatda mavjud bo'lsa kiritiladi, o'ylab topilmaydi
  const topicMap: Record<string, { questionNumbers: number[]; correctCount: number }> = {};

  questions.forEach((q, j) => {
    const topic = q.topic?.trim();
    if (topic && topic.length > 0) {
      if (!topicMap[topic]) {
        topicMap[topic] = { questionNumbers: [], correctCount: 0 };
      }
      topicMap[topic].questionNumbers.push(q.number);
      topicMap[topic].correctCount += questionCorrectCounts[j];
    }
  });

  const topicResults: TopicRaschResult[] = Object.entries(topicMap).map(([topic, data]) => {
    const qCount = data.questionNumbers.length;
    const totalOpportunities = N * qCount; // Masalan: 12 o'quvchi * 3 savol = 36
    const percent = totalOpportunities > 0
      ? Math.round((data.correctCount / totalOpportunities) * 1000) / 10
      : 0;

    return {
      topic,
      questionCount: qCount,
      questionNumbers: data.questionNumbers,
      correctCount: data.correctCount,
      totalOpportunities,
      percent,
      isNeedsReview: false, // Quyida eng pastini belgilaymiz
    };
  });

  // Eng past foizli mavzuni "Takrorlash uchun" (isNeedsReview) deb belgilash
  if (topicResults.length > 0) {
    let minPercent = Infinity;
    topicResults.forEach((t) => {
      if (t.percent < minPercent) {
        minPercent = t.percent;
      }
    });

    // Agar barcha mavzular 100% bo'lmasa, eng pastlarini belgilaymiz
    if (minPercent < 100) {
      topicResults.forEach((t) => {
        if (t.percent === minPercent) {
          t.isNeedsReview = true;
        }
      });
    }
  }

  return {
    sessionId: session.id,
    calculatedAt: new Date().toISOString(),
    studentResults,
    questionResults,
    topicResults,
    hasSameTotalScores: raschOutput.hasSameTotalScores,
    isSmallGroup: raschOutput.isSmallGroup,
    warnings: raschOutput.warnings,
    iterations: raschOutput.iterations,
    converged: raschOutput.converged,
    note: "Bu baho shu sinov va guruh javoblari asosida hisoblangan.",
  };
}

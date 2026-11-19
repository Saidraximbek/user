import { TestSession, RaschAnalysisReport } from '../types';

/**
 * UTF-8 BOM bilan CSV faylini shakllantirish va yuklab olish
 * Excel buni to'g'ri o'zbek lotin harflari va o'zgarmas ustunlar bilan ochadi.
 */
export function exportToCsv(session: TestSession, report: RaschAnalysisReport): void {
  const BOM = '\uFEFF';
  const rows: string[][] = [];

  // 1. Sarlavha ma'lumotlari
  rows.push(['Zehnora — Rash tahlili hisoboti']);
  rows.push(['Test nomi:', session.title]);
  rows.push(['Guruh:', session.groupName]);
  rows.push(['Sana:', session.date]);
  rows.push(['Savollar soni:', session.questionCount.toString()]);
  rows.push(['O‘quvchilar soni:', session.students.length.toString()]);
  rows.push(['Hisoblangan vaqt:', report.calculatedAt]);
  rows.push(['Izoh:', report.note]);
  rows.push([]);

  // 2. O'quvchilar natijalari jadvali
  rows.push([
    'T/r',
    'O‘quvchi ismi',
    'To‘g‘ri',
    'Noto‘g‘ri',
    'Javobsiz',
    'Xom ball',
    'Foiz (%)',
    'Rash bahosi (Theta)',
    'Rash darajasi',
    'Eslatma',
  ]);

  report.studentResults.forEach((st, idx) => {
    rows.push([
      (idx + 1).toString(),
      `"${st.name.replace(/"/g, '""')}"`,
      st.correctCount.toString(),
      st.incorrectCount.toString(),
      st.omittedCount.toString(),
      st.rawScore.toString(),
      st.percent.toFixed(1),
      st.theta.toFixed(2),
      st.grade || '',
      st.isApproximate ? 'Taxminiy baho' : '',
    ]);
  });

  rows.push([]);

  // 3. Savollar natijalari jadvali
  rows.push([
    'Savol',
    'Mavzu',
    'To‘g‘ri kalit',
    'To‘g‘ri ishlaganlar soni',
    'To‘g‘ri foizi (%)',
    'Rash qiyinligi (b)',
    'Holati',
  ]);

  report.questionResults.forEach((q) => {
    rows.push([
      q.questionLabel,
      `"${(q.topic || 'Ko‘rsatilmagan').replace(/"/g, '""')}"`,
      q.key,
      q.correctCount.toString(),
      q.percent.toFixed(1),
      q.b.toFixed(2),
      q.isApproximate ? 'Taxminiy' : 'Aniq',
    ]);
  });

  rows.push([]);

  // 4. Mavzular tahlili
  if (report.topicResults.length > 0) {
    rows.push([
      'Mavzu',
      'Savollar soni',
      'To‘g‘ri javoblar soni',
      'Jami imkoniyatlar',
      'O‘zlashtirish foizi (%)',
      'Xulosa',
    ]);

    report.topicResults.forEach((t) => {
      rows.push([
        `"${t.topic.replace(/"/g, '""')}"`,
        t.questionCount.toString(),
        t.correctCount.toString(),
        t.totalOpportunities.toString(),
        t.percent.toFixed(1),
        t.isNeedsReview ? 'Takrorlash uchun tavsiya etiladi' : 'Qoniqarli',
      ]);
    });
  }

  const csvContent = BOM + rows.map((r) => r.join(';')).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const safeFilename = `${session.title || 'sinov'}_rash_tahlili.csv`.replace(/[^\w\d\-_.]/g, '_');
  link.setAttribute('download', safeFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Sinovni to'liq JSON faylga eksport qilish
 */
export function exportSessionToJson(session: TestSession): void {
  const jsonString = JSON.stringify(session, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const safeFilename = `${session.title || 'sinov'}_zaxira_${session.date}.json`.replace(/[^\w\d\-_.]/g, '_');
  link.setAttribute('download', safeFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * JSON faylni o'qish va tiklash
 */
export function parseSessionFromJson(jsonString: string): TestSession {
  try {
    const data = JSON.parse(jsonString) as Partial<TestSession>;
    if (!data.title || !data.questions || !data.students) {
      throw new Error("JSON fayl tarkibida kerakli maydonlar (title, questions, students) topilmadi.");
    }
    // Id va boshqa maydonlar to'liqligini tekshirish
    return {
      id: data.id || `session_${Date.now()}`,
      title: data.title,
      groupName: data.groupName || '',
      date: data.date || new Date().toISOString().split('T')[0],
      questionCount: data.questions.length,
      questions: data.questions,
      students: data.students,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Noma’lum xatolik';
    throw new Error(`Faylni o‘qishda xatolik: ${msg}`);
  }
}

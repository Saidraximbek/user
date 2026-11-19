import { TestSession, StudentRecord } from '../types';

export interface ScannedResultsPackage {
  app: 'zehnora_omr_sync';
  version: number;
  sessionId: string;
  sessionTitle: string;
  questionCount: number;
  exportedAt: string;
  submissions: StudentRecord[];
}

/**
 * Telefonda skanerlangan o'quvchilar javoblarini JSON fayl qilib yuklab olish
 */
export function exportScannedResultsFile(session: TestSession): void {
  const pkg: ScannedResultsPackage = {
    app: 'zehnora_omr_sync',
    version: 1,
    sessionId: session.id,
    sessionTitle: session.title,
    questionCount: session.questionCount,
    exportedAt: new Date().toISOString(),
    submissions: session.students,
  };

  const jsonString = JSON.stringify(pkg, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const safeFilename = `${session.title || 'sinov'}_skaner_natijalari_${session.students.length}ta.json`.replace(/[^\w\d\-_.]/g, '_');
  link.setAttribute('download', safeFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Telefondan skanerlangan natijalarni noutbukdagi sinovga birlashtirish (Deduplication)
 */
export function mergeScannedResults(
  currentSession: TestSession,
  importedJsonString: string
): { updatedSession: TestSession; addedCount: number; updatedCount: number } {
  let pkg: ScannedResultsPackage;
  try {
    pkg = JSON.parse(importedJsonString) as ScannedResultsPackage;
  } catch {
    throw new Error('Tanlangan fayl yaroqli JSON formati emas.');
  }

  if (pkg.app !== 'zehnora_omr_sync' || !pkg.sessionId) {
    throw new Error('Fayl Zehnora OMR skaner natijalari formati emas.');
  }

  if (pkg.sessionId !== currentSession.id) {
    throw new Error(
      `Sinov mos kelmadi! Fayldagi sinov: "${pkg.sessionTitle}" (ID: ${pkg.sessionId}), noutbukdagi joriy sinov: "${currentSession.title}" (ID: ${currentSession.id}).`
    );
  }

  if (pkg.questionCount !== currentSession.questionCount) {
    throw new Error(
      `Savollar soni mos kelmadi! Kutilgan: ${currentSession.questionCount} ta, faylda: ${pkg.questionCount} ta.`
    );
  }

  const existingStudents = [...currentSession.students];
  let addedCount = 0;
  let updatedCount = 0;

  for (const newSt of pkg.submissions) {
    const existingIdx = existingStudents.findIndex(
      (s) =>
        s.id === newSt.id ||
        (s.name.trim().toLowerCase() === newSt.name.trim().toLowerCase() &&
          s.className === newSt.className)
    );

    if (existingIdx >= 0) {
      existingStudents[existingIdx] = {
        ...existingStudents[existingIdx],
        answers: newSt.answers,
        submittedAt: newSt.submittedAt || new Date().toISOString(),
      };
      updatedCount++;
    } else {
      existingStudents.push({
        ...newSt,
        id: newSt.id || `st_${Date.now()}_${addedCount}`,
      });
      addedCount++;
    }
  }

  const updatedSession: TestSession = {
    ...currentSession,
    students: existingStudents,
    updatedAt: new Date().toISOString(),
  };

  return { updatedSession, addedCount, updatedCount };
}

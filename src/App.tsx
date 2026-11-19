import React, { useState, useEffect } from 'react';
import {
  TestSession,
  QuestionDef,
  StudentRecord,
  RaschAnalysisReport,
  StudentRaschResult,
} from './types';
import { OmrScanResult } from './types/omr';
import {
  getAllSessions,
  saveSession,
  deleteSession,
  getActiveSessionId,
  setActiveSessionId,
  createNewSession,
} from './storage/testStorage';
import { analyzeTestSession } from './math/testAnalysis';
import { Navbar } from './components/Navbar';
import { TestHeaderForm } from './components/TestHeaderForm';
import { AnswerKeyEditor } from './components/AnswerKeyEditor';
import { StudentList } from './components/StudentList';
import { ExcelImportModal } from './components/ExcelImportModal';
import { StudentInputModal } from './components/StudentInputModal';
import { SavedTestsModal } from './components/SavedTestsModal';
import { CalculationInfoModal } from './components/CalculationInfoModal';
import { ResultsView } from './components/results/ResultsView';
import { PrintGroupReport } from './components/print/PrintGroupReport';
import { PrintStudentCard } from './components/print/PrintStudentCard';
import { AdminLoginModal } from './components/auth/AdminLoginModal';
import { TestBookUploader } from './components/admin/TestBookUploader';
import { FirebaseConfigModal } from './components/admin/FirebaseConfigModal';
import { StudentPortalView } from './components/student/StudentPortalView';
import { OmrSheetGenerator } from './components/omr/OmrSheetGenerator';
import { OmrScannerModal } from './components/omr/OmrScannerModal';
import { OmrReviewModal } from './components/omr/OmrReviewModal';
import { OmrSyncModal } from './components/omr/OmrSyncModal';
import {
  Calculator,
  Sparkles,
  Camera,
  Printer,
  FileText,
  Users,
  BarChart3,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Eye,
  ShieldAlert,
} from 'lucide-react';

export function App() {
  // Standart holatda o'qituvchi boshqaruv paneli
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    const val = localStorage.getItem('zehnora_is_admin_v1');
    if (val === null) return true;
    return val === 'true';
  });

  // 3 asosiy qadam: 'setup' (Sinov & Kalit) | 'students' (Skaner & O'quvchilar) | 'results' (Rash Tahlili)
  const [activeStep, setActiveStep] = useState<'setup' | 'students' | 'results'>('setup');

  // Asosiy sessiya va saqlanganlar
  const [session, setSession] = useState<TestSession>(() => {
    const all = getAllSessions().filter(
      (s) => !s.id.startsWith('demo_') && !s.title.toLowerCase().includes('demo')
    );
    const activeId = getActiveSessionId();
    if (activeId && !activeId.startsWith('demo_') && !activeId.toLowerCase().includes('demo')) {
      const found = all.find((s) => s.id === activeId);
      if (found) return found;
    }
    if (all.length > 0) return all[0];
    return createNewSession(30);
  });

  const [savedSessions, setSavedSessions] = useState<TestSession[]>([]);
  const [report, setReport] = useState<RaschAnalysisReport | null>(null);
  const [isDirty, setIsDirty] = useState<boolean>(false);

  // Modallar holati
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isFirebaseConfigOpen, setIsFirebaseConfigOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  // OMR holatlari
  const [isOmrPrintOpen, setIsOmrPrintOpen] = useState(false);
  const [isOmrScannerOpen, setIsOmrScannerOpen] = useState(false);
  const [isOmrReviewOpen, setIsOmrReviewOpen] = useState(false);
  const [isOmrSyncOpen, setIsOmrSyncOpen] = useState(false);
  const [activeScanResult, setActiveScanResult] = useState<OmrScanResult | null>(null);

  // Chop etish ko'rinishlari
  const [printGroupMode, setPrintGroupMode] = useState(false);
  const [printStudentCard, setPrintStudentCard] = useState<StudentRaschResult | null>(null);

  const reloadSavedSessions = () => {
    const list = getAllSessions().filter(
      (s) => !s.id.startsWith('demo_') && !s.title.toLowerCase().includes('demo')
    );
    setSavedSessions(list);
  };

  useEffect(() => {
    // Brauzerda avval saqlanib qolgan har qanday demo sinovlarni tozalash
    try {
      const raw = localStorage.getItem('zehnora_rash_sessions_v1');
      if (raw) {
        const list = JSON.parse(raw);
        const filtered = list.filter(
          (s: any) => !s.id.startsWith('demo_') && !s.title.toLowerCase().includes('demo')
        );
        if (filtered.length !== list.length) {
          localStorage.setItem('zehnora_rash_sessions_v1', JSON.stringify(filtered));
        }
      }
      const activeId = localStorage.getItem('zehnora_rash_active_id_v1');
      if (activeId && (activeId.startsWith('demo_') || activeId.toLowerCase().includes('demo'))) {
        localStorage.removeItem('zehnora_rash_active_id_v1');
        const fresh = createNewSession(30);
        setSession(fresh);
      }
    } catch (e) {
      console.warn(e);
    }
    reloadSavedSessions();
  }, []);

  const handleUpdateSession = (updatedFields: Partial<TestSession>) => {
    const updated: TestSession = {
      ...session,
      ...updatedFields,
      updatedAt: new Date().toISOString(),
    };
    setSession(updated);
    saveSession(updated);
    reloadSavedSessions();
    setIsDirty(true);
  };

  const handleUpdateQuestionCount = (newCount: number) => {
    if (newCount === session.questionCount) return;

    let updatedQuestions: QuestionDef[] = [...session.questions];
    if (newCount > updatedQuestions.length) {
      for (let i = updatedQuestions.length; i < newCount; i++) {
        updatedQuestions.push({
          id: `q_${Date.now()}_${i + 1}`,
          number: i + 1,
          label: (i + 1).toString(),
          key: 'A',
          type: 'choice',
          topic: '',
        });
      }
    } else {
      updatedQuestions = updatedQuestions.slice(0, newCount);
    }

    const updatedStudents: StudentRecord[] = session.students.map((st) => {
      let ans = [...st.answers];
      if (newCount > ans.length) {
        ans = ans.concat(new Array(newCount - ans.length).fill('-'));
      } else {
        ans = ans.slice(0, newCount);
      }
      return { ...st, answers: ans };
    });

    handleUpdateSession({
      questionCount: newCount,
      questions: updatedQuestions,
      students: updatedStudents,
    });
  };

  const handleUpdateQuestions = (newQuestions: QuestionDef[]) => {
    handleUpdateSession({
      questions: newQuestions,
      questionCount: newQuestions.length,
    });
  };

  const handleNewSession = () => {
    const newSess = createNewSession(30);
    setSession(newSess);
    setReport(null);
    setIsDirty(false);
    setActiveStep('setup');
    reloadSavedSessions();
  };

  const handleSelectSession = (id: string) => {
    const all = getAllSessions();
    const found = all.find((s) => s.id === id);
    if (found) {
      setSession(found);
      setActiveSessionId(found.id);
      setReport(null);
      setIsDirty(false);
      setActiveStep('setup');
    }
  };

  const handleDeleteSession = (id: string) => {
    deleteSession(id);
    const updatedList = getAllSessions();
    setSavedSessions(updatedList);
    if (session.id === id) {
      if (updatedList.length > 0) {
        setSession(updatedList[0]);
        setActiveSessionId(updatedList[0].id);
      } else {
        const fresh = createNewSession(30);
        setSession(fresh);
      }
      setReport(null);
    }
  };

  const handleImportSession = (imported: TestSession) => {
    saveSession(imported);
    setActiveSessionId(imported.id);
    setSession(imported);
    reloadSavedSessions();
    setReport(null);
    setIsDirty(false);
  };

  const handleSaveStudent = (student: StudentRecord) => {
    let updatedList: StudentRecord[];
    const exists = session.students.some((s) => s.id === student.id);
    if (exists) {
      updatedList = session.students.map((s) => (s.id === student.id ? student : s));
    } else {
      updatedList = [...session.students, student];
    }
    handleUpdateSession({ students: updatedList });
  };

  const handleDeleteStudent = (id: string) => {
    const updated = session.students.filter((s) => s.id !== id);
    handleUpdateSession({ students: updated });
  };

  const handleClearStudents = () => {
    if (window.confirm('Barcha o‘quvchilar ro‘yxatini tozalashni tasdiqlaysizmi?')) {
      handleUpdateSession({ students: [] });
      setReport(null);
    }
  };

  const handleImportStudents = (newStudents: StudentRecord[], replaceExisting: boolean) => {
    let merged: StudentRecord[];
    if (replaceExisting) {
      merged = newStudents;
    } else {
      merged = [...session.students, ...newStudents];
    }
    handleUpdateSession({ students: merged });
    setIsExcelModalOpen(false);
  };

  const handleCalculate = () => {
    if (session.students.length === 0) {
      alert('Iltimos, avval o‘quvchilar javoblarini kiriting yoki skanerlang.');
      setActiveStep('students');
      return;
    }

    try {
      const rep = analyzeTestSession(session);
      setReport(rep);
      setIsDirty(false);
      setActiveStep('results'); // To'g'ridan to'g'ri natijalar sahifasiga o'tkazish
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Noma’lum xatolik';
      alert(`Hisoblashda xatolik yuz berdi: ${msg}`);
    }
  };

  const handleLoginSuccess = () => {
    setIsAdmin(true);
    localStorage.setItem('zehnora_is_admin_v1', 'true');
    setIsAdminLoginOpen(false);
  };

  const handleLogoutAdmin = () => {
    setIsAdmin(false);
    localStorage.setItem('zehnora_is_admin_v1', 'false');
  };

  // OMR Skanerdan natija qaytganda
  const handleOmrScanSuccess = (scanResult: OmrScanResult) => {
    setIsOmrScannerOpen(false);
    setActiveScanResult(scanResult);
    setIsOmrReviewOpen(true);
  };

  // OMR O'qituvchi tasdiqlab keyingi titulga o'tganda
  const handleOmrConfirmAndNext = (
    studentName: string,
    studentId: string | undefined,
    answers: string[],
    isReplace: boolean
  ) => {
    const updatedStudents = [...session.students];
    const existingIdx = updatedStudents.findIndex(
      (s) =>
        (studentId && s.id === studentId) ||
        s.name.trim().toLowerCase() === studentName.trim().toLowerCase()
    );

    const record: StudentRecord = {
      id: studentId || (existingIdx >= 0 ? updatedStudents[existingIdx].id : `st_${Date.now()}`),
      name: studentName.trim(),
      className: session.groupName,
      answers,
      submittedAt: new Date().toISOString(),
    };

    if (existingIdx >= 0 && isReplace) {
      updatedStudents[existingIdx] = record;
    } else if (existingIdx >= 0) {
      updatedStudents[existingIdx] = record;
    } else {
      updatedStudents.push(record);
    }

    handleUpdateSession({ students: updatedStudents });
    setIsOmrReviewOpen(false);
    setActiveScanResult(null);
    setIsOmrScannerOpen(true);
  };

  // 1. Agar Titul chiqarish ochilgan bo'lsa
  if (isOmrPrintOpen) {
    return (
      <OmrSheetGenerator
        session={session}
        onClose={() => setIsOmrPrintOpen(false)}
      />
    );
  }

  // 2. Chop etish ko'rinishlari
  if (printGroupMode && report) {
    return (
      <PrintGroupReport
        session={session}
        report={report}
        onClose={() => setPrintGroupMode(false)}
      />
    );
  }

  if (printStudentCard) {
    return (
      <PrintStudentCard
        session={session}
        student={printStudentCard}
        onClose={() => setPrintStudentCard(null)}
      />
    );
  }

  const enteredKeysCount = session.questions.filter((q) => q.key && q.key !== '-').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      {/* Yuqori Navbar */}
      <Navbar
        currentSession={session}
        savedSessionsCount={savedSessions.length}
        isAdmin={isAdmin}
        onNewSession={handleNewSession}
        onOpenSavedModal={() => setIsSavedModalOpen(true)}
        onOpenInfoModal={() => setIsInfoModalOpen(true)}
        onImportSession={handleImportSession}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onLogoutAdmin={handleLogoutAdmin}
        onOpenFirebaseConfig={() => setIsFirebaseConfigOpen(true)}
        onOpenOmrPrint={() => setIsOmrPrintOpen(true)}
        onOpenOmrScanner={() => setIsOmrScannerOpen(true)}
      />

      {/* O'QUVCHI PORTALI KO'RINISHI (Agar o'qituvchi o'quvchi rejimiga o'tsa) */}
      {!isAdmin ? (
        <main>
          <div className="bg-amber-500 text-white px-4 py-2 text-xs flex items-center justify-between shadow-xs">
            <span>Siz hozir o‘quvchilar test topshirish portalidasiz.</span>
            <button
              onClick={() => setIsAdmin(true)}
              className="font-bold underline cursor-pointer"
            >
              O‘qituvchi boshqaruviga qaytish →
            </button>
          </div>
          <StudentPortalView
            session={session}
            onStudentSubmitted={(updatedSess) => {
              setSession(updatedSess);
              saveSession(updatedSess);
              reloadSavedSessions();
            }}
          />
        </main>
      ) : (
        /* ASOSIY O'QITUVCHI BOSHQARUVI: 3 QADAMLI ZAMONAVIY INTERFEYS */
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-7 space-y-6 animate-fadeIn">
          {/* 3 ta Asosiy Qadam (Stepper / Tabs) — Mobil va Desktop uchun qulay */}
          <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-xs flex items-center gap-1 sm:gap-2">
            {/* Qadam 1 */}
            <button
              type="button"
              onClick={() => setActiveStep('setup')}
              className={`flex-1 py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
                activeStep === 'setup'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span className="truncate">1. Sinov & Kalit</span>
              <span
                className={`hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  activeStep === 'setup' ? 'bg-indigo-500/50 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {enteredKeysCount}/{session.questionCount}
              </span>
            </button>

            {/* Qadam 2 */}
            <button
              type="button"
              onClick={() => setActiveStep('students')}
              className={`flex-1 py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
                activeStep === 'students'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span className="truncate">2. Skaner & O‘quvchilar</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  activeStep === 'students' ? 'bg-indigo-500/50 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {session.students.length}
              </span>
            </button>

            {/* Qadam 3 */}
            <button
              type="button"
              onClick={() => {
                if (session.students.length > 0 && !report) {
                  handleCalculate();
                } else {
                  setActiveStep('results');
                }
              }}
              className={`flex-1 py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
                activeStep === 'results'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-4 h-4 shrink-0" />
              <span className="truncate">3. Natijalar</span>
              {report && (
                <span
                  className={`hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    activeStep === 'results' ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  ✓
                </span>
              )}
            </button>
          </div>

          {/* QADAM 1: SINOV VA JAVOB KALITI */}
          {activeStep === 'setup' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Sinov asosiy parametrlari */}
              <TestHeaderForm
                session={session}
                onChangeSession={handleUpdateSession}
                onUpdateQuestionCount={handleUpdateQuestionCount}
              />

              {/* To'g'ri javoblar kaliti va mavzular */}
              <AnswerKeyEditor
                questions={session.questions}
                onChangeQuestions={handleUpdateQuestions}
                onKeyChangedNotification={() => setIsDirty(true)}
              />

              {/* Test kitobini biriktirish (PDF/rasm) */}
              <TestBookUploader
                session={session}
                onChangeSession={handleUpdateSession}
              />

              {/* Qadam tugmasi */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep('students')}
                  className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer active:scale-95"
                >
                  <span>2-Qadam: O‘quvchilar va Skanerlashga o‘tish</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* QADAM 2: SKANERLASH VA O'QUVCHILAR RO'YXATI */}
          {activeStep === 'students' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Tezkor OMR amallar kartalari (Mobil va Desktop uchun ko'rkam) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 1. Skanerlash kartasi */}
                <div
                  onClick={() => setIsOmrScannerOpen(true)}
                  className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-700 text-white p-5 rounded-2xl shadow-md shadow-indigo-600/20 cursor-pointer hover:shadow-lg hover:from-indigo-500 hover:to-blue-600 transition-all flex items-center justify-between group active:scale-[0.98]"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Camera className="w-5 h-5 text-indigo-200" />
                      <h3 className="font-bold text-base">Kamera bilan skanerlash</h3>
                    </div>
                    <p className="text-xs text-indigo-100/90">
                      Qog‘oz titulni telefon kamerasi orqali bir zumda tekshiring
                    </p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors shrink-0">
                    <Camera className="w-6 h-6" />
                  </div>
                </div>

                {/* 2. Titul chiqarish kartasi */}
                <div
                  onClick={() => setIsOmrPrintOpen(true)}
                  className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all flex items-center justify-between group active:scale-[0.98]"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Printer className="w-5 h-5 text-indigo-600" />
                      <h3 className="font-bold text-slate-900 text-base">Titul chiqarish (A4)</h3>
                    </div>
                    <p className="text-xs text-slate-500">
                      20 yoki 30 savollik javoblar varaqasini chop etish
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 text-slate-700 rounded-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors shrink-0">
                    <Printer className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* O'quvchilar ro'yxati (Mobil kartochkalar + Desktop jadval) */}
              <StudentList
                students={session.students}
                questions={session.questions}
                onOpenExcelImport={() => setIsExcelModalOpen(true)}
                onOpenAddStudent={() => {
                  setEditingStudent(null);
                  setIsStudentModalOpen(true);
                }}
                onEditStudent={(st) => {
                  setEditingStudent(st);
                  setIsStudentModalOpen(true);
                }}
                onDeleteStudent={handleDeleteStudent}
                onClearStudents={handleClearStudents}
                onOpenOmrPrint={() => setIsOmrPrintOpen(true)}
                onOpenOmrScanner={() => setIsOmrScannerOpen(true)}
                onOpenOmrSync={() => setIsOmrSyncOpen(true)}
              />

              {/* Pastki Asosiy Hisoblash banneri */}
              <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 rounded-2xl p-5 sm:p-6 text-white shadow-xl shadow-indigo-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    Rash tahlilini hisoblash
                  </h3>
                  <p className="text-xs sm:text-sm text-indigo-100 max-w-xl">
                    Dixotomik 1 parametrli Rash modeli orqali har bir o‘quvchining qobiliyati (θ), xalqaro baholash darajalari (A+, A, B...) va savol qiyinliklari hisoblanadi.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCalculate}
                  disabled={session.students.length === 0}
                  className={`w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer shrink-0 ${
                    session.students.length === 0
                      ? 'bg-slate-400/60 text-slate-200 cursor-not-allowed'
                      : 'bg-white text-indigo-700 hover:bg-indigo-50 hover:shadow-indigo-300 active:scale-95'
                  }`}
                >
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <span>Natijalarni hisoblash →</span>
                </button>
              </div>
            </div>
          )}

          {/* QADAM 3: NATIJALAR VA RASHTAHLILI */}
          {activeStep === 'results' && (
            <div className="space-y-5 animate-fadeIn">
              {!report ? (
                /* Agar hali hisoblanmagan bo'lsa */
                <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center space-y-4 shadow-xs">
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                    <Calculator className="w-8 h-8" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1.5">
                    <h3 className="font-bold text-slate-800 text-lg">
                      Natijalar hali hisoblanmagan
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500">
                      {session.students.length === 0
                        ? 'Avval 2-qadamda o‘quvchilar javoblarini skanerlang yoki kiriting.'
                        : `${session.students.length} nafar o‘quvchi javoblari tayyor. Rash modelini hisoblash uchun quyidagi tugmani bosing.`}
                    </p>
                  </div>
                  <div className="flex justify-center gap-3 pt-2">
                    {session.students.length === 0 ? (
                      <button
                        type="button"
                        onClick={() => setActiveStep('students')}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
                      >
                        O‘quvchilar bo‘limiga o‘tish
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleCalculate}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Rash tahlilini hisoblash</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Hisobot tayyor bo'lganda */
                <div className="space-y-4">
                  <ResultsView
                    report={report}
                    session={session}
                    isDirty={isDirty}
                    onRecalculate={handleCalculate}
                    onPrintGroupReport={() => setPrintGroupMode(true)}
                    onPrintStudentCard={(st) => setPrintStudentCard(st)}
                  />

                  {/* Qaytish tugmasi */}
                  <div className="flex justify-start pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveStep('students')}
                      className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <ArrowLeft className="w-4 h-4 text-slate-500" />
                      <span>O‘quvchilar ro‘yxatiga qaytish</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      )}

      {/* MODALLAR */}

      {/* OMR Skanerlash Modali */}
      <OmrScannerModal
        isOpen={isOmrScannerOpen}
        session={session}
        onClose={() => setIsOmrScannerOpen(false)}
        onScanSuccess={handleOmrScanSuccess}
      />

      {/* OMR O'qituvchi Tasdig'i Modali (Asl surat kesmasi bilan) */}
      {activeScanResult && (
        <OmrReviewModal
          isOpen={isOmrReviewOpen}
          scanResult={activeScanResult}
          session={session}
          onClose={() => {
            setIsOmrReviewOpen(false);
            setActiveScanResult(null);
          }}
          onConfirmAndNext={handleOmrConfirmAndNext}
        />
      )}

      {/* OMR Telefon/Noutbuk Sinxronlash Modali */}
      <OmrSyncModal
        isOpen={isOmrSyncOpen}
        session={session}
        onClose={() => setIsOmrSyncOpen(false)}
        onUpdateSession={(updated) => {
          setSession(updated);
          saveSession(updated);
          reloadSavedSessions();
          setIsDirty(true);
        }}
      />

      {/* Admin Login Modali */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Firebase Config Modali */}
      <FirebaseConfigModal
        isOpen={isFirebaseConfigOpen}
        onClose={() => setIsFirebaseConfigOpen(false)}
        onConfigSaved={() => {
          reloadSavedSessions();
        }}
      />

      {/* Excel Import Modali */}
      <ExcelImportModal
        isOpen={isExcelModalOpen}
        questions={session.questions}
        onClose={() => setIsExcelModalOpen(false)}
        onImportStudents={handleImportStudents}
      />

      {/* Talaba Qo'shish Modali */}
      <StudentInputModal
        isOpen={isStudentModalOpen}
        questions={session.questions}
        initialStudent={editingStudent}
        onClose={() => {
          setIsStudentModalOpen(false);
          setEditingStudent(null);
        }}
        onSave={handleSaveStudent}
      />

      {/* Saqlangan Testlar Modali */}
      <SavedTestsModal
        isOpen={isSavedModalOpen}
        sessions={savedSessions}
        currentSessionId={session.id}
        onClose={() => setIsSavedModalOpen(false)}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
      />

      {/* Hisoblash Haqida Modali */}
      <CalculationInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />
    </div>
  );
}

export default App;

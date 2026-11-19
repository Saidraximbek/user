import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Camera,
  User,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Eye,
} from 'lucide-react';
import {
  OmrScanResult,
  QuestionDetectionResult,
} from '../../types/omr';
import { TestSession, StudentRecord } from '../../types';
import { calculateRaschGrade } from '../../math/raschGrades';

interface OmrReviewModalProps {
  isOpen: boolean;
  scanResult: OmrScanResult;
  session: TestSession;
  onClose: () => void;
  onConfirmAndNext: (
    studentName: string,
    studentId: string | undefined,
    answers: string[],
    isReplace: boolean
  ) => void;
}

export const OmrReviewModal: React.FC<OmrReviewModalProps> = ({
  isOpen,
  scanResult,
  session,
  onClose,
  onConfirmAndNext,
}) => {
  // O'quvchi ismi
  const [studentName, setStudentName] = useState<string>(() => {
    if (scanResult.studentName) return scanResult.studentName;
    if (scanResult.studentId) {
      const found = session.students.find((s) => s.id === scanResult.studentId);
      if (found) return found.name;
    }
    return '';
  });

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    scanResult.studentId || ''
  );

  // Tahrirlanadigan javoblar
  const [answers, setAnswers] = useState<Record<number, string>>(() => {
    const map: Record<number, string> = {};
    scanResult.detections.forEach((d) => {
      map[d.questionNumber] = d.detectedAnswer;
    });
    return map;
  });

  // Shubhali savollar ro'yxati va ularning holati
  const [resolvedQuestions, setResolvedQuestions] = useState<Record<number, boolean>>({});

  if (!isOpen) return null;

  // Takroriy o'quvchi tekshiruvi
  const existingStudent = session.students.find(
    (s) =>
      (selectedStudentId && s.id === selectedStudentId) ||
      (studentName.trim() && s.name.toLowerCase() === studentName.trim().toLowerCase())
  );

  // Shubhali savollar
  const suspiciousDetections = scanResult.detections.filter((d) => d.needsReview);
  const allSuspiciousResolved = suspiciousDetections.every(
    (d) => resolvedQuestions[d.questionNumber] || (answers[d.questionNumber] && answers[d.questionNumber] !== '?')
  );

  const handleSelectAnswer = (qNum: number, ans: string) => {
    setAnswers((prev) => ({ ...prev, [qNum]: ans }));
    setResolvedQuestions((prev) => ({ ...prev, [qNum]: true }));
  };

  const handleStudentSelect = (stId: string) => {
    setSelectedStudentId(stId);
    if (stId === 'new') {
      setStudentName('');
    } else {
      const st = session.students.find((s) => s.id === stId);
      if (st) {
        setStudentName(st.name);
      }
    }
  };

  // Xom ball hisoblash
  let rawScore = 0;
  session.questions.forEach((q) => {
    const studentAns = answers[q.number] || '-';
    const isCorrect = q.type === 'binary'
      ? studentAns === q.key || (studentAns === '1')
      : studentAns === q.key;
    if (isCorrect) rawScore++;
  });
  const percent = Math.round((rawScore / session.questionCount) * 1000) / 10;
  const gradeInfo = calculateRaschGrade(percent >= 70 ? 1.0 : -0.5, percent);

  const handleConfirm = (replaceExisting: boolean) => {
    if (!studentName.trim()) {
      alert('Iltimos, o‘quvchi ismini tanlang yoki kiriting!');
      return;
    }

    const finalAnswersList = session.questions.map((q) => answers[q.number] || '-');
    onConfirmAndNext(studentName.trim(), selectedStudentId || undefined, finalAnswersList, replaceExisting);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">OMR Skaner — O‘qituvchi tasdig‘i</h3>
              <p className="text-xs text-indigo-100">
                Aniqlangan natijalarni ko‘rib chiqing va tasdiqlang
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* 1. O'quvchi tanlash yoki kiritish */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              O‘quvchi ma’lumotlari:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">
                  Guruh ro‘yxatidan tanlash:
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => handleStudentSelect(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                >
                  <option value="">-- Ro‘yxatdan tanlash (ixtiyoriy) --</option>
                  {session.students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.className || session.groupName})
                    </option>
                  ))}
                  <option value="new">+ Yangi o‘quvchi yozish</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">
                  O‘quvchi F.I.Sh: *
                </label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Masalan: Ali Karimov"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
                />
              </div>
            </div>

            {/* Takroriy titul ogohlantirishi */}
            {existingStudent && (
              <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">
                    "{existingStudent.name}" ushbu sinovda avval skanerlangan!
                  </span>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Ikki nusxa yaratilmaydi. "Tasdiqlash" tugmasini bosganingizda avvalgi javoblar ushbu yangi skaner natijasi bilan almashtiriladi.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 2. Dastlabki hisoblangan natija ko'rsatkichi */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
              <span className="text-[11px] text-emerald-800 block">Xom ball</span>
              <span className="text-xl font-bold text-emerald-700">
                {rawScore} / {session.questionCount}
              </span>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3">
              <span className="text-[11px] text-indigo-800 block">O‘zlashtirish</span>
              <span className="text-xl font-bold text-indigo-900 font-mono">
                {percent.toFixed(1)}%
              </span>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
              <span className="text-[11px] text-purple-800 block">Taxminiy daraja</span>
              <span className="text-xl font-black text-purple-700">
                {gradeInfo.grade}
              </span>
            </div>
          </div>

          {/* 3. SHUBHALI SAVOLLAR (Asl suratdan kesma bilan ko'rsatiladi!) */}
          {suspiciousDetections.length > 0 && (
            <div className="border border-amber-300 rounded-xl overflow-hidden bg-amber-50/40 space-y-3 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <h4 className="font-bold text-slate-900 text-sm">
                    Tekshirilishi kerak bo‘lgan shubhali savollar ({suspiciousDetections.length} ta):
                  </h4>
                </div>
                <span className="text-xs text-amber-800 font-medium">
                  Asl suratdan o‘sha qator kesmasini ko‘rib, to‘g‘ri javobni tanlang
                </span>
              </div>

              <div className="space-y-3">
                {suspiciousDetections.map((det) => {
                  const currentChoice = answers[det.questionNumber] || '-';
                  const isResolved = resolvedQuestions[det.questionNumber];
                  const qDef = session.questions.find((q) => q.number === det.questionNumber);
                  const isBinary = qDef?.type === 'binary';
                  const options = isBinary ? ['1', '0'] : ['A', 'B', 'C', 'D'];

                  return (
                    <div
                      key={det.questionNumber}
                      className={`p-3 rounded-xl border transition-all bg-white ${
                        isResolved ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-amber-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded">
                              {det.questionLabel}-savol
                            </span>
                            <span className="text-xs text-rose-700 font-semibold">
                              {det.reviewReason}
                            </span>
                          </div>

                          {/* ASL SURATDAN KESMA (Crop Snippet) */}
                          {det.cropDataUrl && (
                            <div className="border border-slate-300 rounded-lg overflow-hidden bg-slate-900/5 max-w-sm mt-1">
                              <img
                                src={det.cropDataUrl}
                                alt={`${det.questionLabel}-savol kesmasi`}
                                className="w-full h-auto block"
                                title="Asl qog‘oz varaqasidan qirqib olingan rasm"
                              />
                            </div>
                          )}
                        </div>

                        {/* O'qituvchi tanlaydigan tugmalar */}
                        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                          {options.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleSelectAnswer(det.questionNumber, opt)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                                currentChoice === opt
                                  ? 'bg-emerald-600 text-white shadow-xs scale-105'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => handleSelectAnswer(det.questionNumber, '-')}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                              currentChoice === '-'
                                ? 'bg-slate-700 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Javobsiz (—)
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. Barcha savollar ro'yxati (Kichik panjarali ko'rinish) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Barcha {session.questionCount} ta savol javoblari:
              </h4>
              <span className="text-xs text-slate-500">
                Istalgan katak ustiga bosib javobni o‘zgartirishingiz mumkin
              </span>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
              {session.questions.map((q) => {
                const ans = answers[q.number] || '-';
                const isCorrect = q.type === 'binary'
                  ? ans === q.key || ans === '1'
                  : ans === q.key;

                return (
                  <div
                    key={q.id}
                    className={`p-1.5 rounded-lg text-center border text-xs ${
                      ans === '-'
                        ? 'bg-slate-100 border-slate-200 text-slate-400'
                        : isCorrect
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                        : 'bg-rose-50 border-rose-300 text-rose-900 font-bold'
                    }`}
                  >
                    <div className="text-[10px] text-slate-500 font-mono">{q.label}</div>
                    <div className="font-mono text-sm">{ans}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Bekor qilish
          </button>

          <button
            type="button"
            onClick={() => handleConfirm(Boolean(existingStudent))}
            disabled={!allSuspiciousResolved || !studentName.trim()}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
              allSuspiciousResolved && studentName.trim()
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {!studentName.trim()
                ? 'O‘quvchi ismini kiriting'
                : !allSuspiciousResolved
                ? 'Shubhali savollarni tasdiqlang'
                : 'Tasdiqlash va keyingi titul'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

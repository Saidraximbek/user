import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Send,
  CheckCircle,
  FileText,
  User,
  Hash,
  Award,
  Download,
  ExternalLink,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Lock,
  Layers,
} from 'lucide-react';
import { TestSession, StudentRecord, StudentRaschResult } from '../../types';
import { calculateRaschGrade } from '../../math/raschGrades';
import { analyzeTestSession } from '../../math/testAnalysis';
import { submitStudentAnswer } from '../../services/firebase';

interface StudentPortalViewProps {
  session: TestSession;
  onStudentSubmitted: (updatedSession: TestSession) => void;
  onOpenAdminLogin?: () => void;
  savedSessions?: TestSession[];
  onSelectSession?: (sessionId: string) => void;
}

export const StudentPortalView: React.FC<StudentPortalViewProps> = ({
  session,
  onStudentSubmitted,
  onOpenAdminLogin,
  savedSessions = [],
  onSelectSession,
}) => {
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState(session.groupName || '');
  const [answers, setAnswers] = useState<string[]>(() =>
    new Array(session.questionCount).fill('-')
  );
  const [quickString, setQuickString] = useState('');
  const [activeTab, setActiveTab] = useState<'book' | 'answers'>('answers');
  const [submittedResult, setSubmittedResult] = useState<StudentRaschResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setAnswers(new Array(session.questionCount).fill('-'));
    setQuickString('');
    setStudentClass(session.groupName || '');
    setSubmittedResult(null);
  }, [session.id, session.questionCount]);

  const filledCount = answers.filter((a) => a && a !== '-').length;
  const targetCount = session.questionCount;

  // Bir savol javobini yangilash
  const handleSelectAnswer = (qIdx: number, val: string) => {
    const updated = [...answers];
    updated[qIdx] = updated[qIdx] === val ? '-' : val;
    setAnswers(updated);
    setQuickString(updated.join(''));
  };

  // Bir satrli ixcham kiritish
  const handleQuickStringChange = (val: string) => {
    setQuickString(val);
    const chars = val.toUpperCase().split('');
    const updated = session.questions.map((_, idx) => {
      const c = chars[idx];
      return c && c !== ' ' ? c : '-';
    });
    setAnswers(updated);
  };

  // Javoblarni topshirish
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      alert('Iltimos, ism va familiyangizni kiriting!');
      return;
    }

    if (filledCount === 0) {
      if (!window.confirm('Siz birorta ham savolga javob belgilamadingiz. Davom ettirasizmi?')) {
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const studentRecord: StudentRecord = {
        id: `st_${Date.now()}`,
        name: studentName.trim(),
        className: studentClass.trim(),
        submittedAt: new Date().toISOString(),
        answers: answers.map((a) => (a === '-' ? '-' : a)),
      };

      // Firebase va LocalStorage-ga yozish
      const updatedSession = await submitStudentAnswer(session.id, session, studentRecord);
      onStudentSubmitted(updatedSession);

      // Rash modeli bo'yicha tahlil qilib, o'quvchining darajasini hisoblash
      const rep = analyzeTestSession(updatedSession);
      const myResult = rep.studentResults.find((s) => s.studentId === studentRecord.id) ||
        rep.studentResults[rep.studentResults.length - 1];

      setSubmittedResult(myResult);
    } catch (err) {
      console.error(err);
      alert('Javobni yuborishda xatolik yuz berdi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Agar natija allaqachon topshirilgan bo'lsa: Natija va A+, A, B... sertifikati ekrani
  if (submittedResult) {
    const gradeInfo = calculateRaschGrade(submittedResult.theta, submittedResult.percent);

    return (
      <div className="max-w-3xl mx-auto py-8 px-4 animate-fadeIn">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 p-8 text-white text-center relative overflow-hidden">
            <div className="w-16 h-16 bg-white/20 rounded-2xl mx-auto flex items-center justify-center mb-4">
              <Award className="w-9 h-9 text-white" />
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-white/20 rounded-full inline-block mb-2">
              Sinov yakunlandi • Farg‘oniy Maktabi
            </span>
            <h2 className="text-2xl sm:text-3xl font-black">{submittedResult.name}</h2>
            <p className="text-sm text-indigo-100 mt-1">
              {session.title} {studentClass ? `• ${studentClass}` : ''}
            </p>
          </div>

          {/* Rasch Daraja Sertifikati */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className={`p-6 rounded-2xl border ${gradeInfo.borderClass} ${gradeInfo.bgClass} text-center space-y-3`}>
              <div className="text-xs uppercase font-bold text-slate-500 tracking-widest">
                Rash modeli bo‘yicha belgilangan darajangiz:
              </div>
              <div className="flex items-center justify-center gap-3">
                <span className={`text-5xl sm:text-6xl font-black px-6 py-2 rounded-2xl shadow-md ${gradeInfo.badgeClass}`}>
                  {gradeInfo.grade}
                </span>
              </div>
              <div className="text-base sm:text-lg font-bold text-slate-900">
                {gradeInfo.title}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
                {gradeInfo.description}
              </p>
            </div>

            {/* Statistik ko'rsatkichlar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 block">To‘g‘ri javoblar</span>
                <span className="text-xl font-bold text-emerald-600">
                  {submittedResult.correctCount} / {submittedResult.totalQuestions}
                </span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 block">Noto‘g‘ri</span>
                <span className="text-xl font-bold text-rose-600">
                  {submittedResult.incorrectCount} ta
                </span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 block">O‘zlashtirish</span>
                <span className="text-xl font-bold text-slate-900">
                  {submittedResult.percent.toFixed(1)}%
                </span>
              </div>
              <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-200">
                <span className="text-xs text-indigo-700 block font-medium">Rash bahosi (θ)</span>
                <span className="text-xl font-bold font-mono text-indigo-950">
                  {submittedResult.theta >= 0
                    ? `+${submittedResult.theta.toFixed(2)}`
                    : submittedResult.theta.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Savollar bo'yicha batafsil ro'yxat */}
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-3">
                Savollar bo‘yicha to‘liq hisobot:
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-1">
                {submittedResult.answerDetails.map((det) => (
                  <div
                    key={det.questionNumber}
                    className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                      det.isCorrect
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : det.isOmitted
                        ? 'bg-slate-50 border-slate-200 text-slate-600'
                        : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                  >
                    <span className="font-mono font-bold">{det.questionLabel}-savol</span>
                    <span className="font-mono">
                      Javob: <strong>{det.studentAnswer}</strong>
                    </span>
                    <span className="font-bold">
                      {det.isCorrect ? '✓' : det.isOmitted ? '—' : '✗'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setSubmittedResult(null);
                  setAnswers(new Array(session.questionCount).fill('-'));
                  setQuickString('');
                }}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Boshqa o‘quvchi javobini kiritish</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fadeIn">
      {/* Test sarlavhasi banneri */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-full">
              Farg‘oniy Maktabi • O‘quvchilar xonasi
            </span>
            {savedSessions.length > 1 && onSelectSession && (
              <div className="relative inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg">
                <Layers className="w-3 h-3 text-indigo-600" />
                <label htmlFor="test-select" className="text-[11px] text-slate-500 font-medium">Testni tanlash:</label>
                <select
                  id="test-select"
                  value={session.id}
                  onChange={(e) => onSelectSession(e.target.value)}
                  className="text-xs bg-transparent border-0 font-bold text-indigo-900 cursor-pointer focus:outline-none"
                >
                  {savedSessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} ({s.groupName})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5">
            {session.title}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sinf: <strong>{session.groupName || 'Ko‘rsatilmagan'}</strong> • Sana: <strong>{session.date}</strong> • Savollar soni: <strong>{session.questionCount} ta</strong>
          </p>
        </div>

        {/* Tab almashtirish (Faqat Test kitobi va Javob kiritish) */}
        <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('book')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'book'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Test kitobi</span>
            {session.bookFileName && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('answers')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'answers'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Javob kiritish</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded-full font-bold">
              {filledCount}/{targetCount}
            </span>
          </button>
        </div>
      </div>

      {/* 1. TEST KITOBI BO'LIMI */}
      {activeTab === 'book' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-base">Test savollari kitobi</h3>
            </div>
            {session.bookFileName && session.bookFileData && (
              <div className="flex items-center gap-2">
                <a
                  href={session.bookFileData}
                  download={session.bookFileName}
                  className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Faylni yuklab olish</span>
                </a>
              </div>
            )}
          </div>

          {session.bookFileName && session.bookFileData ? (
            <div className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
                <span>Fayl nomi: <strong>{session.bookFileName}</strong></span>
                <span className="text-slate-500">Savollarni o‘qib, "Javob kiritish" bo‘limida belgilang</span>
              </div>

              {session.bookFileType === 'image' ? (
                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-[70vh] overflow-y-auto flex justify-center bg-slate-900/5">
                  <img
                    src={session.bookFileData}
                    alt="Test kitobi"
                    className="max-w-full h-auto object-contain"
                  />
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden h-[75vh]">
                  <iframe
                    src={session.bookFileData}
                    title="Test savollari"
                    className="w-full h-full border-0"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 space-y-3">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-800 text-base">
                Elektron test kitobi yuklanmagan
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                O‘qituvchi test savollarini qog‘oz variantda taqdim etgan. Iltimos, qog‘ozdagi savollarni ishlab, javoblaringizni <strong>"Javob kiritish"</strong> bo‘limiga kiriting.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('answers')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors inline-flex items-center gap-1.5"
              >
                <span>Javob kiritishga o‘tish</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2. JAVOB KIRITISH BO'LIMI */}
      {activeTab === 'answers' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* O'quvchi ma'lumotlari */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" />
              O‘quvchi ma’lumotlari
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Ism va Familiyangiz (F.I.Sh.) *
                </label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Masalan: Ali Karimov"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Sinfingiz
                </label>
                <input
                  type="text"
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                  placeholder="Masalan: 10-A"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Javoblar varaqasi */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Javoblar varaqasi ({session.questionCount} ta savol)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Har bir savol uchun tanlagan javob variantingizni bosing
                </p>
              </div>

              {/* Jonli progress */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-800">
                    {filledCount} / {targetCount} ta belgilandi
                  </span>
                  <div className="w-32 bg-slate-100 rounded-full h-2 mt-1 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(filledCount / targetCount) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tezkor satrli kiritish */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Tezkor javoblar satri (ABCDABCD...):
              </label>
              <input
                type="text"
                value={quickString}
                onChange={(e) => handleQuickStringChange(e.target.value)}
                placeholder="Masalan: ABCDABCD..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono tracking-widest uppercase font-bold"
              />
              <span className="text-[11px] text-slate-500">
                Savollarni birma-bir pastdagi tugmalardan ham belgilashingiz mumkin.
              </span>
            </div>

            {/* Interaktiv savollar ro'yxati */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {session.questions.map((q, idx) => {
                const currentAns = answers[idx] || '-';
                const options = q.type === 'binary' ? ['1', '0'] : ['A', 'B', 'C', 'D'];

                return (
                  <div
                    key={q.id}
                    className={`p-3 rounded-xl border transition-all ${
                      currentAns !== '-'
                        ? 'bg-indigo-50/40 border-indigo-200'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-bold text-xs text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        {q.label}-savol
                      </span>
                      {q.topic && (
                        <span className="text-[10px] text-slate-500 truncate max-w-20" title={q.topic}>
                          {q.topic}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-1">
                      {options.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleSelectAnswer(idx, opt)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                            currentAns === opt
                              ? 'bg-indigo-600 text-white shadow-xs scale-105'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Yuborish tugmasi */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                Topshirganingizdan so‘ng sizga <strong>A+, A, B+, B, C+, C</strong> darajangiz va batafsil xato-kamchiliklaringiz ko‘rsatiladi.
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Topshirilmoqda...' : 'Javoblarni topshirish'}</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

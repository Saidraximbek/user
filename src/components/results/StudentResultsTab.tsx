import React, { useState } from 'react';
import {
  StudentRaschResult,
  TestSession,
} from '../../types';
import {
  Check,
  X as CloseIcon,
  Minus,
  Printer,
  ChevronRight,
  User,
  Info,
} from 'lucide-react';

interface StudentResultsTabProps {
  studentResults: StudentRaschResult[];
  session: TestSession;
  onPrintStudentCard: (student: StudentRaschResult) => void;
}

export const StudentResultsTab: React.FC<StudentResultsTabProps> = ({
  studentResults,
  session,
  onPrintStudentCard,
}) => {
  const [selectedStudent, setSelectedStudent] = useState<StudentRaschResult | null>(null);

  return (
    <div className="space-y-4">
      {/* Mobil ko'rinish: Card list (block sm:hidden) */}
      <div className="block sm:hidden space-y-3">
        {studentResults.map((st, idx) => (
          <div
            key={st.studentId}
            className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3 cursor-pointer hover:border-indigo-300 transition-all"
            onClick={() => setSelectedStudent(st)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-mono text-xs flex items-center justify-center font-bold">
                  {idx + 1}
                </span>
                <span className="font-bold text-slate-900 text-sm">{st.name}</span>
                {st.isApproximate && (
                  <span className="px-1.5 py-0.5 text-[9px] bg-amber-100 text-amber-800 rounded font-normal">
                    taxminiy
                  </span>
                )}
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-black shadow-2xs ${
                  st.grade === 'A+'
                    ? 'bg-emerald-600 text-white'
                    : st.grade === 'A'
                    ? 'bg-teal-600 text-white'
                    : st.grade === 'B+'
                    ? 'bg-blue-600 text-white'
                    : st.grade === 'B'
                    ? 'bg-indigo-600 text-white'
                    : st.grade === 'C+'
                    ? 'bg-amber-500 text-white'
                    : 'bg-rose-600 text-white'
                }`}
              >
                {st.grade}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block">Xom ball</span>
                <span className="font-bold text-slate-800 text-xs">
                  {st.rawScore} / {st.totalQuestions}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">O‘zlashtirish</span>
                <span className="font-bold text-indigo-700 text-xs">
                  {st.percent.toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Rash (θ)</span>
                <span className="font-bold font-mono text-indigo-900 text-xs">
                  {st.theta >= 0 ? `+${st.theta.toFixed(2)}` : st.theta.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-emerald-700 font-semibold text-[11px]">
                  ✓ {st.correctCount}
                </span>
                <span className="text-rose-700 font-semibold text-[11px]">
                  ✗ {st.incorrectCount}
                </span>
                <span className="text-slate-500 font-semibold text-[11px]">
                  — {st.omittedCount}
                </span>
              </div>

              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => onPrintStudentCard(st)}
                  className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                  title="Chop etish"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStudent(st)}
                  className="flex items-center gap-1 text-xs text-indigo-600 font-bold hover:text-indigo-700"
                >
                  <span>Batafsil</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop ko'rinish: Katta jadval (hidden sm:block) */}
      <div className="hidden sm:block border border-slate-200 rounded-2xl overflow-hidden shadow-xs bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3 w-10 text-center">№</th>
                <th className="p-3 min-w-44">O‘quvchi F.I.Sh.</th>
                <th className="p-3 text-center text-emerald-700 bg-emerald-50/50">
                  To‘g‘ri (✓)
                </th>
                <th className="p-3 text-center text-rose-700 bg-rose-50/50">
                  Noto‘g‘ri (✗)
                </th>
                <th className="p-3 text-center text-slate-600 bg-slate-100/50">
                  Javobsiz (—)
                </th>
                <th className="p-3 text-center">Xom ball</th>
                <th className="p-3 text-center font-bold">O‘zlashtirish (%)</th>
                <th className="p-3 text-center bg-indigo-50/60 text-indigo-900 font-bold">
                  Rash qobiliyati (θ)
                </th>
                <th className="p-3 text-center font-bold text-slate-800">
                  Rash darajasi
                </th>
                <th className="p-3 text-center w-28">Batafsil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {studentResults.map((st, idx) => (
                <tr
                  key={st.studentId}
                  className="hover:bg-indigo-50/20 transition-colors group cursor-pointer"
                  onClick={() => setSelectedStudent(st)}
                >
                  <td className="p-3 text-center text-slate-400 font-mono">
                    {idx + 1}
                  </td>
                  <td className="p-3 font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    <div className="flex items-center gap-1.5">
                      <span>{st.name}</span>
                      {st.isApproximate && (
                        <span
                          className="px-1.5 py-0.5 text-[10px] bg-amber-100 text-amber-800 rounded font-normal"
                          title="Ekstremal ball yoki kichik guruh sababli taxminiy baho"
                        >
                          taxminiy
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-center font-bold text-emerald-700 bg-emerald-50/30">
                    {st.correctCount}
                  </td>
                  <td className="p-3 text-center font-bold text-rose-700 bg-rose-50/30">
                    {st.incorrectCount}
                  </td>
                  <td className="p-3 text-center font-medium text-slate-500 bg-slate-50/30">
                    {st.omittedCount}
                  </td>
                  <td className="p-3 text-center font-semibold text-slate-800">
                    {st.rawScore} / {st.totalQuestions}
                  </td>
                  <td className="p-3 text-center font-bold text-slate-900">
                    <div className="flex items-center justify-center gap-1.5">
                      <div className="w-12 bg-slate-100 rounded-full h-2 overflow-hidden hidden sm:block">
                        <div
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ width: `${Math.min(100, st.percent)}%` }}
                        />
                      </div>
                      <span>{st.percent.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="p-3 text-center font-mono font-bold text-indigo-900 bg-indigo-50/40">
                    {st.theta >= 0 ? `+${st.theta.toFixed(2)}` : st.theta.toFixed(2)}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-black shadow-2xs ${
                        st.grade === 'A+'
                          ? 'bg-emerald-600 text-white'
                          : st.grade === 'A'
                          ? 'bg-teal-600 text-white'
                          : st.grade === 'B+'
                          ? 'bg-blue-600 text-white'
                          : st.grade === 'B'
                          ? 'bg-indigo-600 text-white'
                          : st.grade === 'C+'
                          ? 'bg-amber-500 text-white'
                          : 'bg-rose-600 text-white'
                      }`}
                    >
                      {st.grade}
                    </span>
                  </td>
                  <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => setSelectedStudent(st)}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded-md transition-colors"
                        title="Javoblar varaqasini ko‘rish"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onPrintStudentCard(st)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                        title="Alohida o‘quvchi vedomostini chop etish"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* O'quvchi batafsil javob varaqasi modali */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto no-print">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{selectedStudent.name}</h3>
                  <p className="text-xs text-indigo-100">
                    {session.title} • {session.groupName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Summary bar */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-4 bg-slate-50 border-b border-slate-200 text-center text-xs">
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">To‘g‘ri</span>
                <span className="text-base font-bold text-emerald-600">
                  {selectedStudent.correctCount}
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Noto‘g‘ri</span>
                <span className="text-base font-bold text-rose-600">
                  {selectedStudent.incorrectCount}
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Javobsiz</span>
                <span className="text-base font-bold text-slate-600">
                  {selectedStudent.omittedCount}
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-indigo-100 bg-indigo-50/50">
                <span className="text-indigo-600 block font-medium">Rash qobiliyati (θ)</span>
                <span className="text-base font-bold text-indigo-900 font-mono">
                  {selectedStudent.theta >= 0
                    ? `+${selectedStudent.theta.toFixed(2)}`
                    : selectedStudent.theta.toFixed(2)}
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200 col-span-2 sm:col-span-1">
                <span className="text-slate-500 block">Rash darajasi</span>
                <span className="text-base font-black text-indigo-700">
                  {selectedStudent.grade}
                </span>
              </div>
            </div>

            {/* Savollar ro'yxati */}
            <div className="p-6 overflow-y-auto flex-1 space-y-2">
              <div className="text-xs font-semibold text-slate-500 mb-2 flex items-center justify-between">
                <span>Savollar bo‘yicha batafsil tahlil:</span>
                <span className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-emerald-700">
                    <Check className="w-3.5 h-3.5" /> To‘g‘ri
                  </span>
                  <span className="flex items-center gap-1 text-rose-700">
                    <CloseIcon className="w-3.5 h-3.5" /> Noto‘g‘ri
                  </span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <Minus className="w-3.5 h-3.5" /> Javobsiz
                  </span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedStudent.answerDetails.map((det) => (
                  <div
                    key={det.questionNumber}
                    className={`p-2.5 rounded-lg border flex items-center justify-between text-xs transition-colors ${
                      det.isCorrect
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                        : det.isOmitted
                        ? 'bg-slate-50 border-slate-200 text-slate-600'
                        : 'bg-rose-50/60 border-rose-200 text-rose-950'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center font-mono font-bold text-slate-700 text-[11px]">
                        {det.questionLabel}
                      </span>
                      <div>
                        {det.topic && (
                          <span className="text-[10px] text-slate-500 block truncate max-w-36">
                            {det.topic}
                          </span>
                        )}
                        <span className="font-medium text-[11px]">
                          Kalit: <strong className="font-mono">{det.correctAnswer}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs">
                        Javob: {det.studentAnswer}
                      </span>
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-white ${
                          det.isCorrect
                            ? 'bg-emerald-600'
                            : det.isOmitted
                            ? 'bg-slate-400'
                            : 'bg-rose-600'
                        }`}
                      >
                        {det.isCorrect ? (
                          <Check className="w-3 h-3" />
                        ) : det.isOmitted ? (
                          <Minus className="w-3 h-3" />
                        ) : (
                          <CloseIcon className="w-3 h-3" />
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => onPrintStudentCard(selectedStudent)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                Vedomostni chop etish
              </button>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="px-5 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-colors cursor-pointer"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

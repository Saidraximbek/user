import React from 'react';
import { TestSession, StudentRaschResult } from '../../types';
import { Printer, ArrowLeft, Check, X as CloseIcon, Minus } from 'lucide-react';

interface PrintStudentCardProps {
  session: TestSession;
  student: StudentRaschResult;
  onClose: () => void;
}

export const PrintStudentCard: React.FC<PrintStudentCardProps> = ({
  session,
  student,
  onClose,
}) => {
  return (
    <div className="bg-white min-h-screen text-slate-900 p-6 sm:p-10">
      {/* Ekranda ko'rinuvchi boshqaruv paneli */}
      <div className="no-print max-w-3xl mx-auto mb-8 bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between shadow-lg">
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Natijalarga qaytish
        </button>
        <div className="text-xs text-slate-300">
          O‘quvchi individual varaqasi (A4 format)
        </div>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Vedomostni chop etish</span>
        </button>
      </div>

      {/* A4 Bosma Vedomost */}
      <div className="max-w-3xl mx-auto space-y-6 text-xs">
        {/* Sarlavha */}
        <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              Farg‘oniy Maktabi • Matematika kafedrasi
            </div>
            <h1 className="text-xl font-black text-slate-950 mt-1">
              O‘quvchining shaxsiy diagnostika vedomosti
            </h1>
            <div className="text-base font-bold text-indigo-700 mt-1">
              {student.name}
            </div>
          </div>
          <div className="text-right space-y-0.5 text-slate-600">
            <div>
              Sinf: <strong className="text-slate-900">{session.groupName || '—'}</strong>
            </div>
            <div>
              Sinov: <strong className="text-slate-900">{session.title}</strong>
            </div>
            <div>
              Sana: <strong className="text-slate-900">{session.date}</strong>
            </div>
          </div>
        </div>

        {/* Natijalar ko'rsatkichlari */}
        <div className="grid grid-cols-5 gap-2 border border-slate-300 rounded-lg p-3 text-center bg-slate-50">
          <div>
            <span className="text-[11px] text-slate-500 block">To‘g‘ri</span>
            <span className="text-base font-bold text-emerald-700">{student.correctCount} ta</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block">Noto‘g‘ri</span>
            <span className="text-base font-bold text-rose-700">{student.incorrectCount} ta</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block">O‘zlashtirish</span>
            <span className="text-base font-bold text-slate-900">{student.percent.toFixed(1)}%</span>
          </div>
          <div className="bg-indigo-50/50 border border-indigo-200 rounded p-1">
            <span className="text-[11px] text-indigo-800 font-semibold block">Rash (θ)</span>
            <span className="text-base font-bold font-mono text-indigo-950">
              {student.theta >= 0 ? `+${student.theta.toFixed(2)}` : student.theta.toFixed(2)}
            </span>
          </div>
          <div className="bg-white border border-slate-300 rounded p-1">
            <span className="text-[11px] text-slate-700 font-bold block">Rash darajasi</span>
            <span className="text-lg font-black text-indigo-700">
              {student.grade}
            </span>
          </div>
        </div>

        {/* Savollar tahlili jadvali */}
        <div>
          <h2 className="text-sm font-bold text-slate-950 uppercase tracking-wider mb-2 border-l-4 border-indigo-600 pl-2">
            Savollar va javoblar varaqasi
          </h2>
          <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
            <thead className="bg-slate-100 font-bold border-b border-slate-300">
              <tr>
                <th className="p-1.5 border border-slate-300 w-10 text-center">Savol</th>
                <th className="p-1.5 border border-slate-300">Mavzu</th>
                <th className="p-1.5 border border-slate-300 text-center w-16">To‘g‘ri kalit</th>
                <th className="p-1.5 border border-slate-300 text-center w-20">O‘quvchi javobi</th>
                <th className="p-1.5 border border-slate-300 text-center w-20">Natija</th>
              </tr>
            </thead>
            <tbody>
              {student.answerDetails.map((det) => (
                <tr key={det.questionNumber} className="border-b border-slate-200">
                  <td className="p-1.5 border border-slate-300 text-center font-mono font-bold">
                    {det.questionLabel}
                  </td>
                  <td className="p-1.5 border border-slate-300 text-slate-700">
                    {det.topic || '—'}
                  </td>
                  <td className="p-1.5 border border-slate-300 text-center font-mono font-bold">
                    {det.correctAnswer}
                  </td>
                  <td className="p-1.5 border border-slate-300 text-center font-mono font-bold">
                    {det.studentAnswer}
                  </td>
                  <td className="p-1.5 border border-slate-300 text-center font-bold">
                    {det.isCorrect ? (
                      <span className="text-emerald-700 inline-flex items-center gap-1">
                        ✓ To‘g‘ri
                      </span>
                    ) : det.isOmitted ? (
                      <span className="text-slate-500 inline-flex items-center gap-1">
                        — Javobsiz
                      </span>
                    ) : (
                      <span className="text-rose-700 inline-flex items-center gap-1">
                        ✗ Noto‘g‘ri
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Izoh va imzolar */}
        <div className="pt-4 text-[11px] text-slate-500 italic">
          * Ushbu baho Farg‘oniy Maktabi ichki matematika sinovi javoblari asosida Rash modeli orqali hisoblangan.
        </div>

        <div className="pt-8 flex justify-between items-center text-slate-700 text-xs">
          <div>
            Farg‘oniy Maktabi matematika o‘qituvchisi: ____________________
          </div>
          <div>
            Ota-ona tanishdi: ____________________
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { TestSession, RaschAnalysisReport } from '../../types';
import { Printer, ArrowLeft } from 'lucide-react';

interface PrintGroupReportProps {
  session: TestSession;
  report: RaschAnalysisReport;
  onClose: () => void;
}

export const PrintGroupReport: React.FC<PrintGroupReportProps> = ({
  session,
  report,
  onClose,
}) => {
  return (
    <div className="bg-white min-h-screen text-slate-900 p-6 sm:p-10">
      {/* Chop etish boshqaruv paneli (faqat ekranda ko'rinadi) */}
      <div className="no-print max-w-4xl mx-auto mb-8 bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Dasturga qaytish
          </button>
        </div>
        <div className="text-xs text-slate-300">
          A4 formatiga moslangan hisobot ko‘rinishi
        </div>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Chop etish (Print / PDF)</span>
        </button>
      </div>

      {/* A4 Formatdagi Asosiy Bosma Hujjat */}
      <div className="max-w-4xl mx-auto space-y-6 text-xs">
        {/* Hujjat Sarlavhasi */}
        <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              Farg‘oniy Maktabi • Matematika kafedrasi
            </div>
            <h1 className="text-xl font-black text-slate-950 mt-1">
              Guruh bo‘yicha Rash tahlili hisoboti
            </h1>
            <div className="text-sm font-semibold text-slate-800 mt-1">
              {session.title}
            </div>
          </div>
          <div className="text-right space-y-0.5 text-slate-600">
            <div>
              Sinf / Guruh: <strong className="text-slate-900">{session.groupName || '—'}</strong>
            </div>
            <div>
              Sana: <strong className="text-slate-900">{session.date}</strong>
            </div>
            <div>
              Savollar: <strong className="text-slate-900">{session.questionCount} ta</strong> | O‘quvchilar: <strong className="text-slate-900">{session.students.length} nafar</strong>
            </div>
          </div>
        </div>

        {/* Eslatma va ogohlantirishlar */}
        <div className="bg-slate-50 border border-slate-200 p-2.5 rounded text-[11px] text-slate-700 italic">
          * {report.note} Baholash dixotomik 1 parametrli Rash modeli (Regularized Joint MAP) yordamida o‘tkazilgan.
        </div>

        {/* 1. O'quvchilar natijalari jadvali */}
        <div>
          <h2 className="text-sm font-bold text-slate-950 uppercase tracking-wider mb-2 border-l-4 border-indigo-600 pl-2">
            1. O‘quvchilar natijalari va qobiliyat ko‘rsatkichlari (Theta)
          </h2>
          <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
            <thead className="bg-slate-100 font-bold border-b border-slate-300">
              <tr>
                <th className="p-1.5 border border-slate-300 w-8 text-center">№</th>
                <th className="p-1.5 border border-slate-300">O‘quvchi F.I.Sh.</th>
                <th className="p-1.5 border border-slate-300 text-center w-14">To‘g‘ri</th>
                <th className="p-1.5 border border-slate-300 text-center w-14">Noto‘g‘ri</th>
                <th className="p-1.5 border border-slate-300 text-center w-14">Javobsiz</th>
                <th className="p-1.5 border border-slate-300 text-center w-16">Xom ball</th>
                <th className="p-1.5 border border-slate-300 text-center w-16">Foiz (%)</th>
                <th className="p-1.5 border border-slate-300 text-center w-20">Rash bahosi (θ)</th>
                <th className="p-1.5 border border-slate-300 text-center w-16">Daraja</th>
              </tr>
            </thead>
            <tbody>
              {report.studentResults.map((st, idx) => (
                <tr key={st.studentId} className={idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                  <td className="p-1.5 border border-slate-300 text-center text-slate-500 font-mono">
                    {idx + 1}
                  </td>
                  <td className="p-1.5 border border-slate-300 font-medium text-slate-900">
                    {st.name} {st.isApproximate ? '(taxminiy)' : ''}
                  </td>
                  <td className="p-1.5 border border-slate-300 text-center font-bold text-emerald-700">
                    {st.correctCount}
                  </td>
                  <td className="p-1.5 border border-slate-300 text-center font-medium text-rose-700">
                    {st.incorrectCount}
                  </td>
                  <td className="p-1.5 border border-slate-300 text-center text-slate-500">
                    {st.omittedCount}
                  </td>
                  <td className="p-1.5 border border-slate-300 text-center font-semibold">
                    {st.rawScore} / {st.totalQuestions}
                  </td>
                  <td className="p-1.5 border border-slate-300 text-center font-bold">
                    {st.percent.toFixed(1)}%
                  </td>
                  <td className="p-1.5 border border-slate-300 text-center font-mono font-bold text-indigo-900">
                    {st.theta >= 0 ? `+${st.theta.toFixed(2)}` : st.theta.toFixed(2)}
                  </td>
                  <td className="p-1.5 border border-slate-300 text-center font-bold">
                    {st.grade}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 2. Mavzular bo'yicha o'zlashtirish tahlili */}
        {report.topicResults.length > 0 && (
          <div className="pt-2">
            <h2 className="text-sm font-bold text-slate-950 uppercase tracking-wider mb-2 border-l-4 border-indigo-600 pl-2">
              2. Matematika mavzulari bo‘yicha o‘zlashtirish
            </h2>
            <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
              <thead className="bg-slate-100 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-1.5 border border-slate-300 w-8 text-center">№</th>
                  <th className="p-1.5 border border-slate-300">Mavzu nomi</th>
                  <th className="p-1.5 border border-slate-300 text-center w-20">Savollar soni</th>
                  <th className="p-1.5 border border-slate-300 text-center">To‘g‘ri / Jami imkoniyat</th>
                  <th className="p-1.5 border border-slate-300 text-center w-24">Foiz (%)</th>
                  <th className="p-1.5 border border-slate-300 text-center w-36">Xulosa / Tavsiya</th>
                </tr>
              </thead>
              <tbody>
                {report.topicResults.map((t, idx) => (
                  <tr key={t.topic} className={idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                    <td className="p-1.5 border border-slate-300 text-center text-slate-500 font-mono">
                      {idx + 1}
                    </td>
                    <td className="p-1.5 border border-slate-300 font-medium">
                      {t.topic}
                    </td>
                    <td className="p-1.5 border border-slate-300 text-center">
                      {t.questionCount} ta
                    </td>
                    <td className="p-1.5 border border-slate-300 text-center font-mono">
                      {t.correctCount} / {t.totalOpportunities}
                    </td>
                    <td className="p-1.5 border border-slate-300 text-center font-bold">
                      {t.percent.toFixed(1)}%
                    </td>
                    <td className="p-1.5 border border-slate-300 text-center font-semibold">
                      {t.isNeedsReview ? (
                        <span className="text-rose-700 font-bold">Takrorlash kerak</span>
                      ) : (
                        <span className="text-emerald-700">Qoniqarli</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Imzolar qatori */}
        <div className="pt-8 flex justify-between items-center text-slate-700 text-xs">
          <div>
            Farg‘oniy Maktabi matematika o‘qituvchisi: ____________________
          </div>
          <div>
            Kafedra mudiri / Ilmiy bo‘lim: ____________________
          </div>
        </div>
      </div>
    </div>
  );
};

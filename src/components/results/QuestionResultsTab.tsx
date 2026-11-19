import React, { useState } from 'react';
import {
  QuestionRaschResult,
} from '../../types';
import {
  ArrowUpDown,
  BarChart2,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  X as CloseIcon,
} from 'lucide-react';

interface QuestionResultsTabProps {
  questionResults: QuestionRaschResult[];
}

export const QuestionResultsTab: React.FC<QuestionResultsTabProps> = ({
  questionResults,
}) => {
  const [sortByDifficulty, setSortByDifficulty] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionRaschResult | null>(null);

  // Saralash: Agar sortByDifficulty true bo'lsa b bo'yicha kamayish tartibida (eng qiyin savollar yuqorida)
  const displayedQuestions = [...questionResults].sort((a, b) => {
    if (sortByDifficulty) {
      return b.b - a.b;
    }
    return a.questionNumber - b.questionNumber;
  });

  return (
    <div className="space-y-4">
      {/* Yuqori boshqaruv paneli */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="text-xs text-slate-600">
          Savollar soni: <strong className="text-slate-900">{questionResults.length} ta</strong>. 
          Savol ustiga bosib <span className="text-indigo-600 font-semibold">variantlar tanlovi tahlilini (distraktorlar)</span> ko‘rishingiz mumkin.
        </div>

        <button
          type="button"
          onClick={() => setSortByDifficulty(!sortByDifficulty)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
            sortByDifficulty
              ? 'bg-amber-50 text-amber-800 border-amber-300'
              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
          }`}
        >
          <ArrowUpDown className="w-3.5 h-3.5 text-amber-600" />
          <span>
            {sortByDifficulty
              ? 'Eng qiyin savollar yuqorida (b ↓)'
              : 'Tartib bo‘yicha ko‘rsatish'}
          </span>
        </button>
      </div>

      {/* Mobil ko'rinish: Card list (block sm:hidden) */}
      <div className="block sm:hidden space-y-2.5">
        {displayedQuestions.map((q) => (
          <div
            key={q.questionNumber}
            onClick={() => setSelectedQuestion(q)}
            className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs hover:border-indigo-300 transition-all cursor-pointer space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-mono font-bold text-xs flex items-center justify-center">
                  {q.questionLabel}
                </span>
                <span className="text-xs font-semibold text-slate-800">
                  Kalit: <strong className="font-mono text-indigo-600">{q.key}</strong>
                </span>
                {q.topic && (
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full truncate max-w-[130px]">
                    {q.topic}
                  </span>
                )}
              </div>

              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  q.percent >= 70
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : q.percent >= 40
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {q.percent.toFixed(0)}%
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 text-slate-600">
              <span>
                To‘g‘ri: <strong>{q.correctCount} / {q.totalStudents}</strong> o‘quvchi
              </span>
              <span className="font-mono font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded">
                b = {q.b >= 0 ? `+${q.b.toFixed(2)}` : q.b.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Savollar jadvali: Desktop (hidden sm:block) */}
      <div className="hidden sm:block border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3 w-16 text-center">Savol</th>
                <th className="p-3 min-w-44">Mavzu</th>
                <th className="p-3 text-center w-16">Kalit</th>
                <th className="p-3 text-center">To‘g‘ri ishlaganlar</th>
                <th className="p-3 text-center">To‘g‘ri foizi (%)</th>
                <th className="p-3 text-center bg-amber-50/60 text-amber-950 font-bold">
                  Rash qiyinligi (b)
                </th>
                <th className="p-3 text-center w-24">Variantlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {displayedQuestions.map((q) => (
                <tr
                  key={q.questionNumber}
                  onClick={() => setSelectedQuestion(q)}
                  className="hover:bg-indigo-50/20 transition-colors group cursor-pointer"
                >
                  <td className="p-3 text-center font-mono font-bold text-slate-800">
                    <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center mx-auto group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors">
                      {q.questionLabel}
                    </span>
                  </td>
                  <td className="p-3 font-medium text-slate-700">
                    {q.topic ? (
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                        {q.topic}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">Ko‘rsatilmagan</span>
                    )}
                  </td>
                  <td className="p-3 text-center font-mono font-bold text-indigo-700">
                    {q.key}
                  </td>
                  <td className="p-3 text-center font-semibold text-slate-800">
                    {q.correctCount} / {q.totalStudents}
                  </td>
                  <td className="p-3 text-center font-bold text-slate-900">
                    <div className="flex items-center justify-center gap-1.5">
                      <div className="w-12 bg-slate-100 rounded-full h-2 overflow-hidden hidden sm:block">
                        <div
                          className={`h-2 rounded-full ${
                            q.percent >= 70
                              ? 'bg-emerald-500'
                              : q.percent >= 40
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(100, q.percent)}%` }}
                        />
                      </div>
                      <span>{q.percent.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="p-3 text-center font-mono font-bold text-amber-900 bg-amber-50/30">
                    <div className="flex items-center justify-center gap-1">
                      <span>{q.b >= 0 ? `+${q.b.toFixed(2)}` : q.b.toFixed(2)}</span>
                      {q.isApproximate && (
                        <span
                          className="text-[10px] px-1 bg-amber-100 text-amber-800 rounded font-normal"
                          title="Ekstremal natija sababli taxminiy baho"
                        >
                          *
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedQuestion(q);
                      }}
                      className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors inline-flex items-center gap-1 text-[11px] font-semibold"
                    >
                      <BarChart2 className="w-3.5 h-3.5" />
                      <span>Tahlil</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Savol variantlari (distraktorlar) tahlili modali */}
      {selectedQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto no-print">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <BarChart2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">
                    {selectedQuestion.questionLabel}-savol variantlari tahlili
                  </h3>
                  <p className="text-xs text-amber-100">
                    To‘g‘ri kalit: <strong className="font-mono">{selectedQuestion.key}</strong> • Qiyinlik b:{' '}
                    <strong>{selectedQuestion.b >= 0 ? `+${selectedQuestion.b.toFixed(2)}` : selectedQuestion.b.toFixed(2)}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedQuestion(null)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-xs text-slate-600">
                Sinfdagi jami <strong>{selectedQuestion.totalStudents} nafar</strong> o‘quvchining ushbu savolga bergan variantlari taqsimoti:
              </div>

              {/* Variantlar taqsimoti */}
              <div className="space-y-2.5">
                {['A', 'B', 'C', 'D', '1', '0', '-']
                  .filter((opt) => selectedQuestion.distractorCounts[opt] !== undefined || opt === selectedQuestion.key)
                  .map((opt) => {
                    const count = selectedQuestion.distractorCounts[opt] || 0;
                    const pct = selectedQuestion.totalStudents > 0
                      ? Math.round((count / selectedQuestion.totalStudents) * 1000) / 10
                      : 0;
                    const isKey = opt === selectedQuestion.key;
                    const isOmitted = opt === '-';

                    return (
                      <div
                        key={opt}
                        className={`p-3 rounded-xl border transition-all ${
                          isKey
                            ? 'bg-emerald-50/70 border-emerald-300'
                            : isOmitted
                            ? 'bg-slate-50 border-slate-200'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-6 h-6 rounded-md font-mono font-bold flex items-center justify-center text-xs ${
                                isKey
                                  ? 'bg-emerald-600 text-white'
                                  : isOmitted
                                  ? 'bg-slate-200 text-slate-700'
                                  : 'bg-slate-100 text-slate-800'
                              }`}
                            >
                              {opt === '-' ? '—' : opt}
                            </span>
                            <span className="font-semibold text-slate-800">
                              {isKey
                                ? 'To‘g‘ri javob kaliti'
                                : isOmitted
                                ? 'Javobsiz qoldirilgan'
                                : `${opt} varianti (chalg‘ituvchi)`}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="font-bold text-slate-900">{count} ta</span>
                            <span className="text-slate-500 ml-1.5">({pct.toFixed(1)}%)</span>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              isKey
                                ? 'bg-emerald-500'
                                : isOmitted
                                ? 'bg-slate-400'
                                : 'bg-amber-400'
                            }`}
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedQuestion(null)}
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

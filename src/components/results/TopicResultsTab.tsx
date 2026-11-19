import React from 'react';
import { TopicRaschResult } from '../../types';
import { Tag, AlertCircle, CheckCircle2, BookmarkCheck } from 'lucide-react';

interface TopicResultsTabProps {
  topicResults: TopicRaschResult[];
}

export const TopicResultsTab: React.FC<TopicResultsTabProps> = ({ topicResults }) => {
  if (topicResults.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center">
          <Tag className="w-6 h-6" />
        </div>
        <h4 className="font-semibold text-slate-800 text-sm">
          Sinov savollariga mavzular biriktirilmagan
        </h4>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Mavzular bo‘yicha batafsil o‘zlashtirish tahlilini ko‘rish uchun yuqoridagi kalit tahrirlash bo‘limida savollarga mavzu (masalan: "Kasrlar", "Geometriya") kiriting.
        </p>
      </div>
    );
  }

  // Saralash: eng past o'zlashtirilgan mavzular yuqorida (o'qituvchiga qaysi mavzuni takrorlash kerakligini ko'rsatish uchun)
  const sortedTopics = [...topicResults].sort((a, b) => a.percent - b.percent);

  return (
    <div className="space-y-4">
      {/* Tushuntirish va e'tibor banneri */}
      {sortedTopics.some((t) => t.isNeedsReview) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 space-y-1">
            <span className="font-bold text-sm block">Takrorlash uchun mavzu aniqlandi</span>
            <p>
              Guruh natijalari tahliliga ko‘ra eng past o‘zlashtirilgan mavzular quyida qizil nishon bilan belgilangan. Ushbu mavzular bo‘yicha qo‘shimcha mashg‘ulot yoki takrorlash darsini rejalashtirish tavsiya etiladi.
            </p>
          </div>
        </div>
      )}

      {/* Mobil ko'rinish: Card list (block sm:hidden) */}
      <div className="block sm:hidden space-y-2.5">
        {sortedTopics.map((topic, idx) => (
          <div
            key={topic.topic}
            className={`bg-white border rounded-xl p-3.5 shadow-2xs space-y-2.5 ${
              topic.isNeedsReview ? 'border-rose-200 bg-rose-50/20' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="font-bold text-slate-900 text-sm">{topic.topic}</span>
              </div>
              {topic.isNeedsReview ? (
                <span className="text-[10px] font-bold bg-rose-600 text-white px-2 py-0.5 rounded-full">
                  Takrorlash uchun
                </span>
              ) : (
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                  {topic.percent >= 70 ? 'Yaxshi' : 'O‘rtacha'}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>O‘zlashtirish</span>
                <span className="font-bold text-slate-900">{topic.percent.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full ${
                    topic.isNeedsReview
                      ? 'bg-rose-500'
                      : topic.percent >= 70
                      ? 'bg-emerald-500'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min(100, topic.percent)}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 text-slate-500">
              <span>
                To‘g‘ri: <strong>{topic.correctCount} / {topic.totalOpportunities}</strong>
              </span>
              <span>
                Savollar: <strong>{topic.questionNumbers.map((n) => `№${n}`).join(', ')}</strong>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Mavzular jadvali: Desktop (hidden sm:block) */}
      <div className="hidden sm:block border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3 w-10 text-center">№</th>
                <th className="p-3 min-w-44">Mavzu nomi</th>
                <th className="p-3 text-center">Savollar soni</th>
                <th className="p-3 text-center">Tegishli savollar</th>
                <th className="p-3 text-center">To‘g‘ri javoblar / Jami imkoniyatlar</th>
                <th className="p-3 text-center font-bold">O‘zlashtirish foizi</th>
                <th className="p-3 text-center w-36">Tavsiya</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sortedTopics.map((topic, idx) => (
                <tr
                  key={topic.topic}
                  className={`hover:bg-slate-50 transition-colors ${
                    topic.isNeedsReview ? 'bg-rose-50/30' : ''
                  }`}
                >
                  <td className="p-3 text-center text-slate-400 font-mono">
                    {idx + 1}
                  </td>
                  <td className="p-3 font-semibold text-slate-900">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{topic.topic}</span>
                    </div>
                  </td>
                  <td className="p-3 text-center font-semibold text-slate-700">
                    {topic.questionCount} ta
                  </td>
                  <td className="p-3 text-center text-slate-500 font-mono text-[11px]">
                    {topic.questionNumbers.map((n) => `№${n}`).join(', ')}
                  </td>
                  <td className="p-3 text-center font-semibold text-slate-800">
                    <span className="font-mono">{topic.correctCount}</span> / <span className="font-mono">{topic.totalOpportunities}</span>
                  </td>
                  <td className="p-3 text-center font-bold text-slate-900">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 bg-slate-100 rounded-full h-2.5 overflow-hidden hidden sm:block">
                        <div
                          className={`h-2.5 rounded-full ${
                            topic.isNeedsReview
                              ? 'bg-rose-500'
                              : topic.percent >= 70
                              ? 'bg-emerald-500'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(100, topic.percent)}%` }}
                        />
                      </div>
                      <span className="font-mono">{topic.percent.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    {topic.isNeedsReview ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        <AlertCircle className="w-3 h-3 text-rose-600" />
                        Takrorlash uchun
                      </span>
                    ) : topic.percent >= 70 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        O‘zlashtirilgan
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                        <BookmarkCheck className="w-3 h-3 text-slate-500" />
                        O‘rtacha
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

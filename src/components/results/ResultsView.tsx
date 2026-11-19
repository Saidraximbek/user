import React, { useState } from 'react';
import {
  RaschAnalysisReport,
  TestSession,
  StudentRaschResult,
} from '../../types';
import { StudentResultsTab } from './StudentResultsTab';
import { QuestionResultsTab } from './QuestionResultsTab';
import { TopicResultsTab } from './TopicResultsTab';
import {
  Users,
  HelpCircle,
  Tag,
  Download,
  Printer,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { exportToCsv } from '../../utils/exportImport';

interface ResultsViewProps {
  report: RaschAnalysisReport;
  session: TestSession;
  isDirty: boolean;
  onRecalculate: () => void;
  onPrintGroupReport: () => void;
  onPrintStudentCard: (student: StudentRaschResult) => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  report,
  session,
  isDirty,
  onRecalculate,
  onPrintGroupReport,
  onPrintStudentCard,
}) => {
  const [activeTab, setActiveTab] = useState<'students' | 'questions' | 'topics'>('students');

  // Guruh o'rtacha ko'rsatkichlari
  const totalStudents = report.studentResults.length;
  const avgPercent =
    totalStudents > 0
      ? report.studentResults.reduce((sum, s) => sum + s.percent, 0) / totalStudents
      : 0;
  const avgTheta =
    totalStudents > 0
      ? report.studentResults.reduce((sum, s) => sum + s.theta, 0) / totalStudents
      : 0;

  const sortedTopics = [...report.topicResults].sort((a, b) => a.percent - b.percent);
  const weakestTopic = sortedTopics[0];

  return (
    <div className="space-y-4">
      {/* 4 ta Asosiy Xulosa Kartochkalari */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Jami o‘quvchilar
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900">{totalStudents}</span>
            <span className="text-xs text-slate-500 font-medium">nafar</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            O‘rtacha natija
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-indigo-600">
              {avgPercent.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            O‘rtacha qobiliyat (θ)
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-mono text-indigo-900">
              {avgTheta >= 0 ? `+${avgTheta.toFixed(2)}` : avgTheta.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400">logit</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Takrorlash uchun mavzu
          </span>
          <div className="truncate">
            {weakestTopic ? (
              <span className="text-sm font-bold text-rose-600 truncate block" title={weakestTopic.topic}>
                {weakestTopic.topic} ({weakestTopic.percent.toFixed(0)}%)
              </span>
            ) : (
              <span className="text-xs text-slate-400 italic">Mavzu kiritilmagan</span>
            )}
          </div>
        </div>
      </div>
      {/* Agar kalit yoki javoblar o'zgargan bo'lsa: Qayta hisoblash kerak banneri */}
      {isDirty && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-200 text-amber-800 rounded-lg">
              <RotateCcw className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <h4 className="font-bold text-amber-950 text-sm">
                Kalit yoki o‘quvchilar javoblari o‘zgargan
              </h4>
              <p className="text-xs text-amber-800">
                Ushbu hisobot eski ma’lumotlarga asoslangan. Yangilangan natijalarni olish uchun qayta hisoblang.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRecalculate}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Qayta hisoblash</span>
          </button>
        </div>
      )}

      {/* Model haqida muhim qisqa izoh va ogohlantirishlar */}
      <div className="bg-slate-100/80 border border-slate-200 rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-slate-700">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-600 shrink-0" />
          <span className="font-medium text-slate-800">
            {report.note}
          </span>
        </div>

        {/* Amallar: CSV va Chop etish */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => exportToCsv(session, report)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            title="Excel ochadigan UTF-8 BOM bilan CSV formatida yuklab olish"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Excel (CSV)</span>
          </button>

          <button
            type="button"
            onClick={onPrintGroupReport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            title="A4 formatida guruh hisobotini chop etish"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Chop etish / PDF</span>
          </button>
        </div>
      </div>

      {/* Guruh bo'yicha matematik ogohlantirishlar */}
      {report.warnings.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-amber-950">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Statistik eslatmalar:
          </div>
          <ul className="list-disc list-inside space-y-0.5">
            {report.warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 3 ta bo'lim tablari */}
      <div className="border-b border-slate-200 flex items-center gap-2 pt-2">
        <button
          type="button"
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'students'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>O‘quvchilar ({report.studentResults.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('questions')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'questions'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Savollar ({report.questionResults.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('topics')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'topics'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Mavzular ({report.topicResults.length})</span>
        </button>
      </div>

      {/* Bo'limlar tarkibi */}
      <div>
        {activeTab === 'students' && (
          <StudentResultsTab
            studentResults={report.studentResults}
            session={session}
            onPrintStudentCard={onPrintStudentCard}
          />
        )}

        {activeTab === 'questions' && (
          <QuestionResultsTab questionResults={report.questionResults} />
        )}

        {activeTab === 'topics' && (
          <TopicResultsTab topicResults={report.topicResults} />
        )}
      </div>
    </div>
  );
};

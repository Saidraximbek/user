import React from 'react';
import { FileText, Users, Calendar, Hash } from 'lucide-react';
import { TestSession } from '../types';

interface TestHeaderFormProps {
  session: TestSession;
  onChangeSession: (updated: Partial<TestSession>) => void;
  onUpdateQuestionCount: (newCount: number) => void;
}

export const TestHeaderForm: React.FC<TestHeaderFormProps> = ({
  session,
  onChangeSession,
  onUpdateQuestionCount,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 transition-all">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Test nomi */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            Sinov / Test nomi
          </label>
          <input
            type="text"
            value={session.title}
            onChange={(e) => onChangeSession({ title: e.target.value })}
            placeholder="Masalan: 10-sinf Matematika nazorati"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium"
          />
        </div>

        {/* Guruh / Sinf */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            Sinf / Guruh
          </label>
          <input
            type="text"
            value={session.groupName}
            onChange={(e) => onChangeSession({ groupName: e.target.value })}
            placeholder="Masalan: 10-A sinf"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium"
          />
        </div>

        {/* Sana */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            Sana
          </label>
          <input
            type="date"
            value={session.date}
            onChange={(e) => onChangeSession({ date: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium"
          />
        </div>

        {/* Savollar soni */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-amber-600" />
            Savollar soni
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="100"
              value={session.questionCount}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val > 0 && val <= 100) {
                  onUpdateQuestionCount(val);
                }
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium"
            />
            <span className="text-xs text-slate-500 whitespace-nowrap">ta savol</span>
          </div>
        </div>
      </div>
    </div>
  );
};

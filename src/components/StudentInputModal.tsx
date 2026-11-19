import React, { useState, useEffect } from 'react';
import { X, UserPlus, Check } from 'lucide-react';
import { QuestionDef, StudentRecord } from '../types';

interface StudentInputModalProps {
  isOpen: boolean;
  questions: QuestionDef[];
  initialStudent?: StudentRecord | null;
  onClose: () => void;
  onSave: (student: StudentRecord) => void;
}

export const StudentInputModal: React.FC<StudentInputModalProps> = ({
  isOpen,
  questions,
  initialStudent,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [answers, setAnswers] = useState<string[]>([]);
  const [compactString, setCompactString] = useState('');

  useEffect(() => {
    if (initialStudent) {
      setName(initialStudent.name);
      const ans = initialStudent.answers.map((a) => a || '-');
      setAnswers(ans);
      setCompactString(ans.join(''));
    } else {
      setName('');
      const emptyAns = new Array(questions.length).fill('-');
      setAnswers(emptyAns);
      setCompactString(emptyAns.join(''));
    }
  }, [initialStudent, questions]);

  if (!isOpen) return null;

  const handleCompactChange = (val: string) => {
    setCompactString(val);
    const chars = val.toUpperCase().split('');
    const newAnswers = questions.map((_, idx) => {
      const char = chars[idx];
      return char && char !== ' ' ? char : '-';
    });
    setAnswers(newAnswers);
  };

  const handleCellChange = (idx: number, char: string) => {
    const updated = [...answers];
    const upper = char.trim().toUpperCase();
    updated[idx] = upper === '' || upper === '-' ? '-' : upper;
    setAnswers(updated);
    setCompactString(updated.join(''));
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('Iltimos, o‘quvchi ismini kiriting.');
      return;
    }

    const student: StudentRecord = {
      id: initialStudent?.id || `st_${Date.now()}`,
      name: name.trim(),
      answers: answers.map((a) => (a === '-' ? '-' : a)),
    };

    onSave(student);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold">
              {initialStudent ? 'O‘quvchi javoblarini tahrirlash' : 'Yangi o‘quvchi qo‘shish'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              O‘quvchi F.I.Sh.
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masalan: O‘quvchi familiyasi va ismi"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Javoblar satri ({questions.length} ta savol)
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                "-" = javobsiz qoldirilgan
              </span>
            </div>
            <input
              type="text"
              value={compactString}
              onChange={(e) => handleCompactChange(e.target.value)}
              placeholder="ABCDABCD..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Har bir savol kataklari:
            </label>
            <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
              {questions.map((q, idx) => (
                <div key={q.id} className="text-center">
                  <div className="text-[10px] text-slate-500 font-mono">{q.label}</div>
                  <input
                    type="text"
                    maxLength={1}
                    value={answers[idx] === '-' ? '' : answers[idx]}
                    placeholder="-"
                    onChange={(e) => handleCellChange(idx, e.target.value)}
                    className="w-full text-center py-1 bg-white border border-slate-300 rounded text-xs font-mono font-bold focus:border-indigo-600"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Bekor qilish
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Check className="w-4 h-4" />
            <span>Saqlash</span>
          </button>
        </div>
      </div>
    </div>
  );
};

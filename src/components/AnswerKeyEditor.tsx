import React, { useState, useEffect } from 'react';
import { KeyRound, Sparkles, Check, ChevronDown, ChevronUp, Layers, Tag } from 'lucide-react';
import { QuestionDef, QuestionType } from '../types';
import { parseAnswerKeyInput } from '../utils/excelParser';

interface AnswerKeyEditorProps {
  questions: QuestionDef[];
  onChangeQuestions: (updated: QuestionDef[]) => void;
  onKeyChangedNotification?: () => void;
}

export const AnswerKeyEditor: React.FC<AnswerKeyEditorProps> = ({
  questions,
  onChangeQuestions,
  onKeyChangedNotification,
}) => {
  const [quickInput, setQuickInput] = useState('');
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);

  // Hozirgi kalitlar asosida ixcham satrni shakllantirish
  useEffect(() => {
    const str = questions.map((q) => q.key || '-').join('');
    setQuickInput(str);
  }, [questions]);

  // Mavjud barcha mavzular (datalist uchun)
  const existingTopics = Array.from(
    new Set(questions.map((q) => q.topic?.trim()).filter(Boolean))
  ) as string[];

  // Kiritilgan javoblar hisoblagichi
  const parsedKeys = parseAnswerKeyInput(quickInput, questions.length);
  const enteredCount = parsedKeys.length;
  const targetCount = questions.length;

  const handleQuickInputChange = (val: string) => {
    setQuickInput(val);
    const keys = parseAnswerKeyInput(val, targetCount);

    if (keys.length > 0) {
      const updated = questions.map((q, idx) => {
        if (idx < keys.length) {
          const k = keys[idx];
          // Agar binary savol bo'lsa va A/B kelsa, 1 ga moslashtirish yoki to'g'ridan to'g'ri olish
          return { ...q, key: k };
        }
        return q;
      });
      onChangeQuestions(updated);
      onKeyChangedNotification?.();
    }
  };

  const handleApplyQuickKey = () => {
    const keys = parseAnswerKeyInput(quickInput, targetCount);
    const updated = questions.map((q, idx) => {
      const k = idx < keys.length ? keys[idx] : q.key || 'A';
      return { ...q, key: k };
    });
    onChangeQuestions(updated);
    onKeyChangedNotification?.();
  };

  const handleUpdateQuestion = (index: number, patch: Partial<QuestionDef>) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...patch };
    onChangeQuestions(updated);
    onKeyChangedNotification?.();
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">To‘g‘ri javoblar kaliti</h3>
            <p className="text-xs text-slate-500">
              Bir satrda "ABCDABCD..." yoki alohida kataklarda belgilang
            </p>
          </div>
        </div>

        {/* Hisoblagich */}
        <div className="flex items-center gap-2">
          <div
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              enteredCount === targetCount
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : enteredCount < targetCount
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}
          >
            {enteredCount === targetCount && <Check className="w-3.5 h-3.5" />}
            <span>
              {targetCount} tadan {enteredCount} ta javob kiritildi
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
            className="text-xs font-medium text-slate-600 hover:text-indigo-600 px-2 py-1 rounded hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
          >
            {isDetailsExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                <span>Mavzularni yashirish</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                <span>Mavzular va turlarni tahrirlash</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bir satrli tezkor kiritish */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={quickInput}
              onChange={(e) => handleQuickInputChange(e.target.value)}
              placeholder="Masalan: ABCDABCDABCDABCD..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 font-mono tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-semibold"
            />
          </div>
          <button
            type="button"
            onClick={handleApplyQuickKey}
            className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            Kalitni yangilash
          </button>
        </div>

        {/* Tezkor tugmachalar qatori (Quick selector pills) */}
        <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50/70 rounded-xl border border-slate-200 max-h-48 overflow-y-auto">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              className="flex items-center bg-white border border-slate-200 rounded-md p-1 shadow-2xs hover:border-indigo-300 transition-colors"
            >
              <span className="text-[11px] font-bold text-slate-500 px-1.5 border-r border-slate-100">
                {q.label}
              </span>
              {q.type === 'binary' ? (
                <div className="flex pl-1">
                  {['1', '0'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleUpdateQuestion(idx, { key: opt })}
                      className={`text-xs px-1.5 py-0.5 rounded font-mono font-bold transition-colors cursor-pointer ${
                        q.key === opt
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex pl-1">
                  {['A', 'B', 'C', 'D'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleUpdateQuestion(idx, { key: opt })}
                      className={`text-xs px-1.5 py-0.5 rounded font-mono font-bold transition-colors cursor-pointer ${
                        q.key === opt
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Har bir savolga mavzu biriktirish va turini sozlash (Batafsil ro'yxat) */}
      {isDetailsExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-200 animate-fadeIn">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" />
              Savollar parametrlari, yorliqlari va mavzulari
            </h4>
            <span className="text-xs text-slate-500">
              Masalan: 30-savolni "30a" va "30b" (0/1 binary) sifatida ajratishingiz mumkin
            </span>
          </div>

          <datalist id="existing-topics-list">
            {existingTopics.map((top) => (
              <option key={top} value={top} />
            ))}
          </datalist>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {questions.map((q, idx) => (
              <div
                key={q.id}
                className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2 rounded-lg border border-slate-200 hover:bg-indigo-50/20 transition-colors"
              >
                {/* Yorliq (Label: masalan "1" yoki "30a") */}
                <div className="col-span-2 sm:col-span-1">
                  <input
                    type="text"
                    value={q.label}
                    onChange={(e) => handleUpdateQuestion(idx, { label: e.target.value })}
                    title="Savol yorlig'i"
                    className="w-full text-center px-1.5 py-1 text-xs font-bold bg-white border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Tur (Type: Choice yoki Binary) */}
                <div className="col-span-4 sm:col-span-2">
                  <select
                    value={q.type}
                    onChange={(e) => {
                      const newType = e.target.value as QuestionType;
                      handleUpdateQuestion(idx, {
                        type: newType,
                        key: newType === 'binary' ? '1' : 'A',
                      });
                    }}
                    className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 font-medium"
                  >
                    <option value="choice">A/B/C/D</option>
                    <option value="binary">0/1 (Ochiq)</option>
                  </select>
                </div>

                {/* To'g'ri kalit */}
                <div className="col-span-3 sm:col-span-2 flex justify-center">
                  {q.type === 'binary' ? (
                    <select
                      value={q.key}
                      onChange={(e) => handleUpdateQuestion(idx, { key: e.target.value })}
                      className="w-full px-2 py-1 text-xs font-bold text-center bg-white border border-indigo-300 text-indigo-700 rounded focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="1">1 (To‘g‘ri)</option>
                      <option value="0">0 (Xato)</option>
                    </select>
                  ) : (
                    <select
                      value={q.key}
                      onChange={(e) => handleUpdateQuestion(idx, { key: e.target.value })}
                      className="w-full px-2 py-1 text-xs font-bold text-center bg-white border border-indigo-300 text-indigo-700 rounded focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  )}
                </div>

                {/* Mavzu */}
                <div className="col-span-3 sm:col-span-7">
                  <div className="relative">
                    <input
                      type="text"
                      list="existing-topics-list"
                      value={q.topic || ''}
                      onChange={(e) => handleUpdateQuestion(idx, { topic: e.target.value })}
                      placeholder="Mavzu biriktirish (ixtiyoriy, masalan: Kasrlar)"
                      className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500"
                    />
                    <Tag className="w-3 h-3 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

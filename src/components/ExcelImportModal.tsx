import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  HelpCircle,
  Edit2,
  ArrowRight,
} from 'lucide-react';
import { QuestionDef, StudentRecord } from '../types';
import { parseExcelStudentData, ParsedStudentRow } from '../utils/excelParser';

interface ExcelImportModalProps {
  isOpen: boolean;
  questions: QuestionDef[];
  onClose: () => void;
  onImportStudents: (newStudents: StudentRecord[], replaceExisting: boolean) => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  questions,
  onClose,
  onImportStudents,
}) => {
  const [pasteText, setPasteText] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [globalErrors, setGlobalErrors] = useState<string[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [replaceExisting, setReplaceExisting] = useState(true);

  if (!isOpen) return null;

  const handleParse = (text: string) => {
    setPasteText(text);
    if (!text.trim()) {
      setParsedRows([]);
      setGlobalErrors([]);
      setIsPreviewMode(false);
      return;
    }

    const res = parseExcelStudentData(text, questions);
    setParsedRows(res.rows);
    setGlobalErrors(res.globalErrors);
    setIsPreviewMode(true);
  };

  const handleCellEdit = (rowIdx: number, qIdx: number, newVal: string) => {
    const updated = [...parsedRows];
    const row = updated[rowIdx];
    const newAnswers = [...row.rawAnswers];

    const trimmed = newVal.trim().toUpperCase();
    newAnswers[qIdx] = trimmed === '' || trimmed === '-' ? '-' : trimmed;

    // Qayta tekshirish
    const qDef = questions[qIdx];
    const errors: string[] = [];
    if (!row.name.trim()) {
      errors.push(`Qator ${row.rowIndex}: O‘quvchi ismi ko‘rsatilmagan.`);
    }

    newAnswers.forEach((ans, j) => {
      const q = questions[j];
      if (ans && ans !== '-') {
        if (q.type === 'binary') {
          if (!/^[01]$/.test(ans)) {
            errors.push(`Qator ${row.rowIndex}, ${j + 1}-ustun (${q.label}): Noma’lum belgi '${ans}'.`);
          }
        } else {
          if (!/^[ABCD]$/.test(ans)) {
            errors.push(`Qator ${row.rowIndex}, ${j + 1}-ustun (${q.label}): Noma’lum belgi '${ans}'.`);
          }
        }
      }
    });

    updated[rowIdx] = {
      ...row,
      rawAnswers: newAnswers,
      hasErrors: errors.length > 0,
      errors,
    };

    setParsedRows(updated);
  };

  const handleNameEdit = (rowIdx: number, newName: string) => {
    const updated = [...parsedRows];
    updated[rowIdx] = {
      ...updated[rowIdx],
      name: newName,
      hasErrors: updated[rowIdx].errors.length > 0 && !newName.trim(),
    };
    setParsedRows(updated);
  };

  const handleDeleteRow = (rowIdx: number) => {
    const updated = parsedRows.filter((_, idx) => idx !== rowIdx);
    setParsedRows(updated);
  };

  const handleConfirmImport = () => {
    // Xatosi yo'q yoki barcha tuzatilgan qatorlarni studentlar formatiga o'tkazish
    const validRows = parsedRows.filter((r) => r.name.trim().length > 0);

    const students: StudentRecord[] = validRows.map((r, idx) => ({
      id: `st_${Date.now()}_${idx}`,
      name: r.name.trim(),
      answers: r.rawAnswers.map((a) => (a === '-' ? '-' : a || '-')),
    }));

    onImportStudents(students, replaceExisting);
    onClose();
  };

  const totalErrors = parsedRows.filter((r) => r.hasErrors).length;
  const canImport = parsedRows.length > 0 && totalErrors === 0 && globalErrors.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <FileSpreadsheet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Excel’dan o‘quvchilar javoblarini import qilish</h3>
              <p className="text-xs text-emerald-100">
                Excel jadvalidan nusxa olib, Ctrl+V bilan joylashtiring
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Format Yo'riqnomasi */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <HelpCircle className="w-4 h-4 text-emerald-700" />
              Qo‘llab-quvvatlanadigan ikkala Excel shakli:
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-emerald-800">
              <div className="bg-white p-2.5 rounded-lg border border-emerald-100 font-mono">
                <span className="font-sans font-semibold text-emerald-950 block mb-1">
                  1-shakl: Ixcham javob satri
                </span>
                Ali Karimov [Tab] ABCDABCD...
                <p className="font-sans text-[11px] text-slate-500 mt-1">
                  "-" belgisi tashlab ketilgan savolni bildiradi (0 ball oladi).
                </p>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-emerald-100 font-mono">
                <span className="font-sans font-semibold text-emerald-950 block mb-1">
                  2-shakl: Har bir savol alohida katakda
                </span>
                Ali Karimov [Tab] A [Tab] B [Tab] [Tab] D ...
                <p className="font-sans text-[11px] text-slate-500 mt-1">
                  Bo‘sh kataklar joyida saqlanadi, keyingi savollar siljimaydi!
                </p>
              </div>
            </div>
          </div>

          {/* Paste Maydoni */}
          {!isPreviewMode ? (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Excel’dan ko‘chirilgan matnni shu yerga joylashtiring (Ctrl+V):
              </label>
              <textarea
                rows={10}
                value={pasteText}
                onChange={(e) => handleParse(e.target.value)}
                placeholder={`Masalan:\nO‘quvchi 1\tABCDABCDABCDABCDABCDABCDABCD11\nO‘quvchi 2\tA\tB\tC\tD\t\tB\tA...`}
                className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all leading-relaxed"
              />
            </div>
          ) : (
            /* Preview va Tahrirlash rejimi */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <Edit2 className="w-4 h-4 text-emerald-600" />
                    Jadvalni tekshirish va tahrirlash ({parsedRows.length} ta o‘quvchi)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Katakdagi qiymatni to‘g‘ridan-to‘g‘ri bosib o‘zgartirishingiz mumkin
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPreviewMode(false)}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors"
                >
                  Matnni qayta tahrirlash
                </button>
              </div>

              {/* Xatoliklar bloki */}
              {(totalErrors > 0 || globalErrors.length > 0) && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5 text-rose-900">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Tuzatilishi kerak bo‘lgan qator va ustunlar:
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 max-h-32 overflow-y-auto">
                    {globalErrors.map((err, idx) => (
                      <li key={`g_${idx}`}>{err}</li>
                    ))}
                    {parsedRows
                      .filter((r) => r.hasErrors)
                      .flatMap((r) => r.errors)
                      .map((err, idx) => (
                        <li key={`r_${idx}`}>{err}</li>
                      ))}
                  </ul>
                </div>
              )}

              {/* Preview Jadvali */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs max-h-80 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 sticky top-0 z-10 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2 w-10 text-center">№</th>
                      <th className="p-2 min-w-36">O‘quvchi ismi</th>
                      {questions.map((q) => (
                        <th
                          key={q.id}
                          className="p-2 text-center w-8 border-l border-slate-200"
                          title={`${q.label}-savol (${q.type === 'binary' ? '0/1' : 'ABCD'})`}
                        >
                          {q.label}
                        </th>
                      ))}
                      <th className="p-2 w-10 text-center">Amal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {parsedRows.map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        className={`hover:bg-slate-50 transition-colors ${
                          row.hasErrors ? 'bg-rose-50/50' : ''
                        }`}
                      >
                        <td className="p-2 text-center text-slate-400 font-mono">
                          {row.rowIndex}
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={row.name}
                            onChange={(e) => handleNameEdit(rIdx, e.target.value)}
                            className={`w-full px-2 py-1 rounded border text-xs font-medium ${
                              !row.name.trim()
                                ? 'border-rose-400 bg-rose-50'
                                : 'border-slate-200 bg-white'
                            }`}
                          />
                        </td>
                        {questions.map((q, qIdx) => {
                          const ans = row.rawAnswers[qIdx] || '-';
                          const isInvalid =
                            ans !== '-' &&
                            (q.type === 'binary'
                              ? !/^[01]$/.test(ans)
                              : !/^[ABCD]$/.test(ans));

                          return (
                            <td
                              key={q.id}
                              className={`p-1 text-center border-l border-slate-200 ${
                                isInvalid ? 'bg-rose-200' : ''
                              }`}
                            >
                              <input
                                type="text"
                                maxLength={2}
                                value={ans === '-' ? '' : ans}
                                placeholder="-"
                                onChange={(e) => handleCellEdit(rIdx, qIdx, e.target.value)}
                                className={`w-7 text-center py-1 font-mono font-bold rounded text-xs ${
                                  isInvalid
                                    ? 'bg-rose-100 text-rose-800 border border-rose-400'
                                    : ans === '-'
                                    ? 'text-slate-400 bg-slate-50'
                                    : 'text-indigo-900 bg-white border border-slate-200'
                                }`}
                              />
                            </td>
                          );
                        })}
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteRow(rIdx)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Qatorni o‘chirish"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Qo'shish yoki almashtirish sozlamasi */}
          {isPreviewMode && (
            <div className="flex items-center gap-4 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="font-semibold text-slate-800">Qo‘shish usuli:</span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  checked={replaceExisting}
                  onChange={() => setReplaceExisting(true)}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                Mavjud o‘quvchilar ro‘yxatini almashtirish
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  checked={!replaceExisting}
                  onChange={() => setReplaceExisting(false)}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                Mavjud ro‘yxatga qo‘shish
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Bekor qilish
          </button>

          {!isPreviewMode ? (
            <button
              type="button"
              onClick={() => handleParse(pasteText)}
              disabled={!pasteText.trim()}
              className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
            >
              <span>Jadvalni ko‘rib chiqish</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={!canImport}
              className={`px-6 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs ${
                canImport
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {totalErrors > 0
                  ? `Xatoliklarni tuzating (${totalErrors} ta qator)`
                  : `${parsedRows.length} ta o‘quvchini import qilish`}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

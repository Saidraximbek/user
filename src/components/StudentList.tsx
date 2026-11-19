import React from 'react';
import {
  Users,
  FileSpreadsheet,
  UserPlus,
  Trash2,
  Edit,
  Camera,
  Printer,
  ArrowRightLeft,
} from 'lucide-react';
import { QuestionDef, StudentRecord } from '../types';

interface StudentListProps {
  students: StudentRecord[];
  questions: QuestionDef[];
  onOpenExcelImport: () => void;
  onOpenAddStudent: () => void;
  onEditStudent: (student: StudentRecord) => void;
  onDeleteStudent: (id: string) => void;
  onClearStudents: () => void;
  onOpenOmrPrint: () => void;
  onOpenOmrScanner: () => void;
  onOpenOmrSync: () => void;
}

export const StudentList: React.FC<StudentListProps> = ({
  students,
  questions,
  onOpenExcelImport,
  onOpenAddStudent,
  onEditStudent,
  onDeleteStudent,
  onClearStudents,
  onOpenOmrPrint,
  onOpenOmrScanner,
  onOpenOmrSync,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-6 transition-all">
      {/* Sarlavha va asosiy amallar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base">O‘quvchilar ro‘yxati</h3>
              <span className="bg-indigo-50 text-indigo-700 font-bold text-xs px-2.5 py-0.5 rounded-full border border-indigo-100">
                {students.length} nafar
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Qog‘ozdagi javoblarni skanerlash, Excel’dan nusxalash yoki qo‘lda kiritish
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Titul chiqarish */}
          <button
            type="button"
            onClick={onOpenOmrPrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            title="A4 formatdagi javoblar varaqasini chop etish"
          >
            <Printer className="w-4 h-4 text-slate-300" />
            <span>Titul chiqarish</span>
          </button>

          {/* Skanerlash */}
          <button
            type="button"
            onClick={onOpenOmrScanner}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ring-2 ring-indigo-200"
            title="Telefon kamerasi yoki rasm orqali varaqni tekshirish"
          >
            <Camera className="w-4 h-4" />
            <span>Skanerlash (OMR)</span>
          </button>

          {/* Telefon bilan sinxronlash */}
          <button
            type="button"
            onClick={onOpenOmrSync}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            title="Noutbuk va telefon o‘rtasida natijalarni uzatish"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Sinxronlash</span>
          </button>

          {/* Excel Import */}
          <button
            type="button"
            onClick={onOpenExcelImport}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Excel Ctrl+V</span>
          </button>

          {/* O'quvchi qo'shish */}
          <button
            type="button"
            onClick={onOpenAddStudent}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Qo‘lda qo‘shish</span>
          </button>

          {/* Tozalash */}
          {students.length > 0 && (
            <button
              type="button"
              onClick={onClearStudents}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              title="Barcha o‘quvchilarni ro‘yxatdan o‘chirish"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* O'quvchilar ro'yxati yoki Bo'sh holat */}
      {students.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 sm:p-10 text-center bg-slate-50/50 space-y-4">
          <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            <Camera className="w-7 h-7 text-indigo-600" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h4 className="font-bold text-slate-800 text-base">
              Hozircha o‘quvchilar javoblari yo‘q
            </h4>
            <p className="text-xs sm:text-sm text-slate-500">
              Qog‘ozdagi javoblar varaqasini telefon kamerasi orqali skanerlang yoki Excel jadvalidan nusxa oling.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={onOpenOmrScanner}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              Skanerlashni boshlash
            </button>
            <button
              type="button"
              onClick={onOpenExcelImport}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Excel’dan nusxalash
            </button>
            <button
              type="button"
              onClick={onOpenAddStudent}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <UserPlus className="w-4 h-4 text-indigo-600" />
              Qo‘lda kiritish
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Mobil ko'rinish: Card list (sm:hidden) */}
          <div className="block sm:hidden space-y-2.5">
            {students.map((student, idx) => {
              const filledCount = student.answers.filter((a) => a && a !== '-').length;
              return (
                <div
                  key={student.id}
                  className="bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-mono text-xs flex items-center justify-center font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-slate-900 text-sm truncate">
                        {student.name}
                      </span>
                      {student.className && (
                        <span className="text-[11px] text-slate-500 shrink-0">
                          ({student.className})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => onEditStudent(student)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-indigo-50"
                        title="Tahrirlash"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteStudent(student.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        title="O‘chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                    <div className="font-mono text-[11px] text-slate-600 tracking-wider truncate max-w-[190px] bg-white px-2 py-0.5 rounded border border-slate-200">
                      {student.answers.map((a) => a || '-').join('')}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                      {filledCount} / {questions.length} javob
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop ko'rinish: Katta jadval (hidden sm:block) */}
          <div className="hidden sm:block border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="max-h-80 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    <th className="p-3 w-12 text-center">№</th>
                    <th className="p-3 min-w-44">O‘quvchi F.I.Sh.</th>
                    <th className="p-3">
                      Javoblar satri ({questions.length} ta savol)
                    </th>
                    <th className="p-3 w-24 text-center">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {students.map((student, idx) => {
                    const filledCount = student.answers.filter((a) => a && a !== '-').length;

                    return (
                      <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 text-center text-slate-400 font-mono">
                          {idx + 1}
                        </td>
                        <td className="p-3 font-semibold text-slate-800">
                          <div className="flex items-center gap-1.5">
                            <span>{student.name}</span>
                            {student.className && (
                              <span className="text-[10px] text-slate-400 font-normal">
                                ({student.className})
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-700 tracking-wider text-[11px] truncate max-w-xs sm:max-w-md block bg-slate-100 px-2.5 py-1 rounded">
                              {student.answers.map((a) => a || '-').join('')}
                            </span>
                            <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap">
                              ({filledCount}/{questions.length})
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => onEditStudent(student)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                              title="Tahrirlash"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteStudent(student.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="O‘chirish"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

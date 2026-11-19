import React, { useRef } from 'react';
import { Upload, FileText, Trash2, Eye, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { TestSession } from '../../types';

interface TestBookUploaderProps {
  session: TestSession;
  onChangeSession: (updated: Partial<TestSession>) => void;
}

export const TestBookUploader: React.FC<TestBookUploaderProps> = ({
  session,
  onChangeSession,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('Fayl hajmi 15MB dan oshmasligi kerak.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const fileType = file.type.includes('pdf')
        ? 'pdf'
        : file.type.includes('image')
        ? 'image'
        : 'other';

      onChangeSession({
        bookFileName: file.name,
        bookFileData: result,
        bookFileType: fileType,
      });
    };

    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveFile = () => {
    if (window.confirm('Haqiqatan ham yuklangan test faylini o‘chirmoqchimisiz?')) {
      onChangeSession({
        bookFileName: undefined,
        bookFileData: undefined,
        bookFileType: undefined,
      });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Test savollari kitobchasi (Fayllar)</h3>
            <p className="text-xs text-slate-500">
              O‘quvchilar ko‘rishi uchun PDF yoki rasm shaklidagi test savollarini yuklang
            </p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,image/*,.doc,.docx"
          className="hidden"
          onChange={handleFileUpload}
        />

        {!session.bookFileName ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Test faylini yuklash (PDF/Rasm)</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              Faylni almashtirish
            </button>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Faylni o‘chirish"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {session.bookFileName ? (
        <div className="bg-purple-50/50 border border-purple-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs uppercase shrink-0">
              {session.bookFileType || 'PDF'}
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">{session.bookFileName}</span>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full">
                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                  Yuklangan
                </span>
              </div>
              <p className="text-xs text-slate-500">
                O‘quvchilar foydalanuvchi sahifasida ushbu test kitobini ochib, savollarni ko‘rishlari mumkin.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {session.bookFileData && (
              <a
                href={session.bookFileData}
                target="_blank"
                rel="noreferrer"
                download={session.bookFileName}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-purple-700 hover:bg-purple-100 border border-purple-300 rounded-lg text-xs font-semibold transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Ochib ko‘rish</span>
              </a>
            )}
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-slate-300 rounded-xl p-6 text-center text-slate-500 bg-slate-50/50">
          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-xs font-medium text-slate-700">
            Hozircha test fayli yuklanmagan
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            O‘quvchilar ekranda savollarni ko‘rishi uchun test kitobini PDF yoki rasm formatida yuklang.
          </p>
        </div>
      )}
    </div>
  );
};

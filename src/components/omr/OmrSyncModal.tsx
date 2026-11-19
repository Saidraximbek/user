import React, { useRef } from 'react';
import {
  Smartphone,
  Laptop,
  ArrowRightLeft,
  Download,
  Upload,
  X,
  CheckCircle,
  FileSpreadsheet,
  HelpCircle,
} from 'lucide-react';
import { TestSession } from '../../types';
import { exportSessionToJson } from '../../utils/exportImport';
import { exportScannedResultsFile, mergeScannedResults } from '../../utils/omrSync';

interface OmrSyncModalProps {
  isOpen: boolean;
  session: TestSession;
  onClose: () => void;
  onUpdateSession: (updated: TestSession) => void;
}

export const OmrSyncModal: React.FC<OmrSyncModalProps> = ({
  isOpen,
  session,
  onClose,
  onUpdateSession,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImportScannedFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const { updatedSession, addedCount, updatedCount } = mergeScannedResults(
          session,
          text
        );
        onUpdateSession(updatedSession);
        alert(
          `Muvaffaqiyatli birlashtirildi!\nQo‘shilgan yangi o‘quvchilar: ${addedCount} ta\nYangilangan javoblar: ${updatedCount} ta.`
        );
        onClose();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Noma’lum xatolik';
        alert(`Xatolik: ${msg}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-fadeIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <ArrowRightLeft className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Telefon va Noutbuk o‘rtasida sinxronlash</h3>
              <p className="text-xs text-blue-100">
                Noutbukda tayyorlab, telefonda skanerlang
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

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-slate-700">
          {/* Jarayon tushuntirishi */}
          <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="p-2">
              <Laptop className="w-6 h-6 text-indigo-600 mx-auto mb-1" />
              <span className="font-bold block">1. Noutbukda</span>
              <span className="text-[11px] text-slate-500">Testni tayyorlang va telefonga eksport qiling</span>
            </div>
            <div className="p-2 border-x border-slate-200">
              <Smartphone className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
              <span className="font-bold block">2. Telefonda</span>
              <span className="text-[11px] text-slate-500">Kamerali skaner bilan titullarni tekshiring</span>
            </div>
            <div className="p-2">
              <Laptop className="w-6 h-6 text-blue-600 mx-auto mb-1" />
              <span className="font-bold block">3. Noutbukda</span>
              <span className="text-[11px] text-slate-500">Natijalarni birlashtirib, Rash hisobotini oling</span>
            </div>
          </div>

          {/* 1-amal: Sinovni telefonga eksport qilish */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Laptop className="w-4 h-4 text-indigo-600" />
                  1. Sinovni telefonga o‘tkazish
                </h4>
                <p className="text-[11px] text-slate-500">
                  Ushbu sinovni telefonga o‘tkazish uchun JSON faylini yuklab oling (yoki Telegram orqali telefonga yuboring)
                </p>
              </div>
              <button
                type="button"
                onClick={() => exportSessionToJson(session)}
                className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Sinov fayli</span>
              </button>
            </div>
          </div>

          {/* 2-amal: Telefonda skanerlangan natijalarni eksport qilish */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-2 bg-emerald-50/30">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  2. Telefonda skanerlangan natijalarni faylga chiqarish
                </h4>
                <p className="text-[11px] text-slate-500">
                  Telefonda barcha titullarni skanerlab bo‘lgach, natijalar faylini yuklab oling ({session.students.length} ta o‘quvchi)
                </p>
              </div>
              <button
                type="button"
                onClick={() => exportScannedResultsFile(session)}
                disabled={session.students.length === 0}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>Natijalarni yuklash</span>
              </button>
            </div>
          </div>

          {/* 3-amal: Noutbukda natijalarni birlashtirish */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-2 bg-blue-50/30">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-blue-600" />
                  3. Noutbukda natijalarni birlashtirish (Import)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Telefondan olingan natijalar faylini tanlang. Takroriy o‘quvchilar dublikat bo‘lmaydi.
                </p>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <Upload className="w-4 h-4" />
                <span>Natijalarni qo‘shish</span>
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportScannedFile}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold cursor-pointer"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
};

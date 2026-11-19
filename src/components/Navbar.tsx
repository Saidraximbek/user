import React, { useRef, useState } from 'react';
import {
  PlusCircle,
  FolderOpen,
  HelpCircle,
  Download,
  Upload,
  GraduationCap,
  ShieldCheck,
  Printer,
  Camera,
  Menu,
  X,
  Lock,
  LogOut,
  Cloud,
  Shield,
} from 'lucide-react';
import { TestSession } from '../types';
import { exportSessionToJson, parseSessionFromJson } from '../utils/exportImport';
import { FirebaseStatus } from '../services/firebase';

interface NavbarProps {
  currentSession: TestSession;
  savedSessionsCount: number;
  isAdmin: boolean;
  firebaseStatus?: FirebaseStatus;
  onNewSession: () => void;
  onOpenSavedModal: () => void;
  onOpenInfoModal: () => void;
  onImportSession: (session: TestSession) => void;
  onOpenAdminLogin: () => void;
  onLogoutAdmin: () => void;
  onOpenFirebaseConfig: () => void;
  onOpenOmrPrint?: () => void;
  onOpenOmrScanner?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentSession,
  savedSessionsCount,
  isAdmin,
  firebaseStatus = 'idle',
  onNewSession,
  onOpenSavedModal,
  onOpenInfoModal,
  onImportSession,
  onOpenAdminLogin,
  onLogoutAdmin,
  onOpenFirebaseConfig,
  onOpenOmrPrint,
  onOpenOmrScanner,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const restored = parseSessionFromJson(text);
        onImportSession(restored);
        alert(`"${restored.title}" sinovi muvaffaqiyatli tiklandi!`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Noma’lum xatolik';
        alert(`Xatolik: ${msg}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo va Maktab ma'lumoti */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Zehnora
                </h1>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Rash tahlili
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Farg‘oniy Maktabi
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium truncate max-w-[200px] sm:max-w-xs">
                {currentSession.title} ({currentSession.groupName})
              </p>
            </div>
          </div>

          {/* Desktop o'ng tarafdagi boshqaruv amallari */}
          <div className="hidden md:flex items-center gap-2">
            {/* Firebase holati */}
            <button
              type="button"
              onClick={onOpenFirebaseConfig}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl border transition-colors cursor-pointer ${
                firebaseStatus === 'connected'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : firebaseStatus === 'permission_denied'
                  ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              title={
                firebaseStatus === 'connected'
                  ? 'Firebase: Ulangan (Baza sinxronlangan)'
                  : firebaseStatus === 'permission_denied'
                  ? 'Firebase: Ruxsat berilmagan (Firestore qoidalari yangilanishi kerak)'
                  : 'Firebase sozlamalari'
              }
            >
              <Cloud className="w-3.5 h-3.5" />
              <span className="hidden lg:inline text-[11px]">
                {firebaseStatus === 'connected'
                  ? 'Baza ulangan'
                  : firebaseStatus === 'permission_denied'
                  ? 'Baza ruxsati kerak'
                  : 'Firebase'}
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  firebaseStatus === 'connected'
                    ? 'bg-emerald-500 animate-pulse'
                    : firebaseStatus === 'permission_denied'
                    ? 'bg-amber-500'
                    : 'bg-slate-400'
                }`}
              />
            </button>

            {isAdmin ? (
              <>
                {/* OMR Skanerlash */}
                {onOpenOmrScanner && (
                  <button
                    type="button"
                    onClick={onOpenOmrScanner}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all cursor-pointer shadow-xs ring-2 ring-indigo-200 active:scale-95"
                    title="Telefon kamerasi bilan tekshirish"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Skanerlash</span>
                  </button>
                )}

                {/* Titul chiqarish */}
                {onOpenOmrPrint && (
                  <button
                    type="button"
                    onClick={onOpenOmrPrint}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all cursor-pointer shadow-2xs"
                    title="A4 formatdagi javoblar varaqasini chop etish"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-300" />
                    <span>Titul (A4)</span>
                  </button>
                )}

                {/* Yangi sinov */}
                <button
                  type="button"
                  onClick={onNewSession}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-indigo-600" />
                  <span>Yangi test</span>
                </button>

                {/* Saqlangan sinovlar */}
                <button
                  type="button"
                  onClick={onOpenSavedModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                >
                  <FolderOpen className="w-4 h-4 text-amber-600" />
                  <span>Saqlanganlar ({savedSessionsCount})</span>
                </button>

                {/* JSON Eksport */}
                <button
                  type="button"
                  onClick={() => exportSessionToJson(currentSession)}
                  className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  title="Testni JSON fayl qilib saqlash"
                >
                  <Download className="w-4 h-4" />
                </button>

                {/* JSON Import */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  title="Testni JSON fayldan tiklash"
                >
                  <Upload className="w-4 h-4" />
                </button>

                {/* Hisoblash haqida */}
                <button
                  type="button"
                  onClick={onOpenInfoModal}
                  className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  title="Rash modeli haqida ma’lumot"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>

                {/* Admin chiqish tugmasi */}
                <button
                  type="button"
                  onClick={onLogoutAdmin}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                  title="O‘qituvchi boshqaruvidan chiqish"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  <span>Chiqish</span>
                </button>
              </>
            ) : (
              /* NON-ADMIN: O'QUVCHI KO'RINISHI UCHUN ADMIN KIRISH TUGMASI */
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenInfoModal}
                  className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  title="Rash modeli haqida ma’lumot"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={onOpenAdminLogin}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all cursor-pointer ring-2 ring-indigo-200"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Admin sifatida kirish</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobil navigatsiya tugmalari */}
          <div className="flex md:hidden items-center gap-2">
            {!isAdmin ? (
              <button
                type="button"
                onClick={onOpenAdminLogin}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-xl shadow-xs"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            ) : (
              onOpenOmrScanner && (
                <button
                  type="button"
                  onClick={onOpenOmrScanner}
                  className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs ring-2 ring-indigo-200 active:scale-95"
                  title="Skanerlash"
                >
                  <Camera className="w-4 h-4" />
                </button>
              )
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobil menyu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2 shadow-lg animate-fadeIn">
          {isAdmin ? (
            <>
              <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    onNewSession();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
                >
                  <PlusCircle className="w-4 h-4 text-indigo-600" />
                  <span>Yangi test</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onOpenSavedModal();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
                >
                  <FolderOpen className="w-4 h-4 text-amber-600" />
                  <span>Saqlangan ({savedSessionsCount})</span>
                </button>
              </div>

              <div className="flex flex-col gap-1.5 pt-1">
                {onOpenOmrPrint && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenOmrPrint();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                  >
                    <Printer className="w-4 h-4 text-slate-500" />
                    <span>Titul varaqasini chop etish (A4)</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    onOpenFirebaseConfig();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                >
                  <Cloud className="w-4 h-4 text-indigo-600" />
                  <span>Firebase sozlamalari ({firebaseStatus})</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    exportSessionToJson(currentSession);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>Testni JSON faylga saqlash</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    fileInputRef.current?.click();
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                >
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span>JSON fayldan yuklash</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onOpenInfoModal();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                >
                  <HelpCircle className="w-4 h-4 text-indigo-600" />
                  <span>Rash modeli haqida ma’lumot</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onLogoutAdmin();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg mt-2"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>Admin rejimidan chiqish</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2 py-1">
              <button
                type="button"
                onClick={() => {
                  onOpenAdminLogin();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
              >
                <Lock className="w-4 h-4" />
                <span>Admin sifatida kirish (O‘qituvchi)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onOpenInfoModal();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                <HelpCircle className="w-4 h-4 text-indigo-600" />
                <span>Rash modeli haqida ma’lumot</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Yashirin fayl yuklash input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileUpload}
      />
    </header>
  );
};

import React, { useState } from 'react';
import { Lock, Eye, EyeOff, X, ShieldCheck, KeyRound } from 'lucide-react';
import { getAdminPassword, setAdminPassword } from '../../storage/testStorage';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const currentPass = getAdminPassword();

    if (password === currentPass) {
      setError('');
      setPassword('');
      onLoginSuccess();
      onClose();
    } else {
      setError('Noto‘g‘ri parol kiritildi! Iltimos, qayta urinib ko‘ring.');
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    const currentPass = getAdminPassword();

    if (password !== currentPass) {
      setError('Joriy parol noto‘g‘ri!');
      return;
    }

    if (!newPassword.trim() || newPassword.length < 4) {
      setError('Yangi parol kamida 4 ta belgidan iborat bo‘lishi kerak!');
      return;
    }

    setAdminPassword(newPassword.trim());
    alert('Admin paroli muvaffaqiyatli yangilandi!');
    setIsChangingPass(false);
    setPassword('');
    setNewPassword('');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 no-print">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Admin sifatida kirish</h3>
              <p className="text-xs text-indigo-200">Farg‘oniy Maktabi o‘qituvchilar paneli</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {!isChangingPass ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Admin parolini kiriting:
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="Parol..."
                    autoFocus
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-slate-400 hover:text-slate-600 absolute right-2.5 top-2 rounded"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {error && <p className="text-xs text-rose-600 mt-2 font-medium">{error}</p>}
              </div>

              <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3 text-xs text-indigo-900 flex items-start gap-2">
                <KeyRound className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">Standart kirish paroli:</span>
                  <span className="font-mono font-bold text-indigo-700 bg-white px-1.5 py-0.5 rounded border border-indigo-200 mt-0.5 inline-block">
                    admin
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPass(true);
                    setError('');
                  }}
                  className="text-xs text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  Parolni o‘zgartirish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-200 cursor-pointer"
                >
                  Kirish
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Joriy parol:
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Joriy parol..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Yangi parol:
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Yangi parol (kamida 4 ta belgi)..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPass(false);
                    setError('');
                  }}
                  className="text-xs text-slate-600 hover:text-slate-800"
                >
                  Ortga
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold"
                >
                  Yangi parolni saqlash
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Database, X, Check, RotateCcw } from 'lucide-react';
import {
  getStoredFirebaseConfig,
  saveFirebaseConfig,
  DEFAULT_FIREBASE_CONFIG,
} from '../../services/firebase';
import { FirebaseConfigState } from '../../types';

interface FirebaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved,
}) => {
  const [config, setConfig] = useState<FirebaseConfigState>(() => getStoredFirebaseConfig());

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveFirebaseConfig(config);
    alert('Firebase sozlamalari saqlandi! Dastur ushbu bazaga ulanadi.');
    onConfigSaved();
    onClose();
  };

  const handleResetDefault = () => {
    if (window.confirm('Standart Firebase sozlamalariga qaytarmoqchimisiz?')) {
      setConfig(DEFAULT_FIREBASE_CONFIG);
      saveFirebaseConfig(DEFAULT_FIREBASE_CONFIG);
      onConfigSaved();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 no-print">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Firebase ma’lumotlar bazasi sozlamalari</h3>
              <p className="text-xs text-amber-100">Firestore bulutli sinxronizatsiyasi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
          <p className="text-slate-600">
            Sinovlar, test kitoblari va o‘quvchilar javoblari to‘g‘ridan-to‘g‘ri Firebase Firestore bazasiga saqlanadi. O‘z loyihangiz parametrlarini kiritishingiz mumkin:
          </p>

          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Project ID *</label>
              <input
                type="text"
                required
                value={config.projectId}
                onChange={(e) => setConfig({ ...config, projectId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">API Key</label>
              <input
                type="text"
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Auth Domain</label>
              <input
                type="text"
                value={config.authDomain}
                onChange={(e) => setConfig({ ...config, authDomain: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Storage Bucket</label>
              <input
                type="text"
                value={config.storageBucket}
                onChange={(e) => setConfig({ ...config, storageBucket: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">App ID</label>
              <input
                type="text"
                value={config.appId}
                onChange={(e) => setConfig({ ...config, appId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleResetDefault}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Standartga qaytarish</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow"
              >
                <Check className="w-4 h-4" />
                <span>Saqlash</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

import React from 'react';
import { X, FolderOpen, Calendar, Users, Hash, Trash2, Download, ArrowRight } from 'lucide-react';
import { TestSession } from '../types';
import { exportSessionToJson } from '../utils/exportImport';

interface SavedTestsModalProps {
  isOpen: boolean;
  sessions: TestSession[];
  currentSessionId: string;
  onClose: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
}

export const SavedTestsModal: React.FC<SavedTestsModalProps> = ({
  isOpen,
  sessions,
  currentSessionId,
  onClose,
  onSelectSession,
  onDeleteSession,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <FolderOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Saqlangan sinovlar ro‘yxati</h3>
              <p className="text-xs text-amber-100">
                Brauzer xotirasida saqlangan barcha sinovlar ({sessions.length} ta)
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

        <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto">
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              Hali saqlangan sinovlar mavjud emas.
            </div>
          ) : (
            sessions.map((sess) => {
              const isCurrent = sess.id === currentSessionId;

              return (
                <div
                  key={sess.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isCurrent
                      ? 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-300'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{sess.title}</h4>
                      {isCurrent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                          Hozir ochiq
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      {sess.groupName && (
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <Users className="w-3.5 h-3.5 text-blue-600" />
                          {sess.groupName}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {sess.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Hash className="w-3.5 h-3.5 text-slate-400" />
                        {sess.questionCount} ta savol
                      </span>
                      <span>•</span>
                      <span>{sess.students.length} ta o‘quvchi</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => exportSessionToJson(sess)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="JSON zaxirasini yuklab olish"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`"${sess.title}" sinovini o‘chirishni tasdiqlaysizmi?`)) {
                          onDeleteSession(sess.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Sinovni o‘chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {!isCurrent && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectSession(sess.id);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <span>Ochish</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-colors cursor-pointer"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
};

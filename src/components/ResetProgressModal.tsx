import React from 'react';
import { AlertTriangle, X, RotateCcw } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface ResetProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isQuizMode?: boolean;
}

export const ResetProgressModal: React.FC<ResetProgressModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isQuizMode = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          soundManager.playModalClose();
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-modal-title"
    >
      <div className="relative w-full max-w-md bg-white dark:bg-[#111827] border border-slate-200 dark:border-blue-500/30 rounded-2xl p-6 sm:p-7 shadow-2xl dark:shadow-[0_0_50px_rgba(0,0,0,0.9)] text-center animate-scale-enter font-sans">
        {/* Warning Icon Badge */}
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-500/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-xs">
          <AlertTriangle className="w-7 h-7 stroke-[2.2]" />
        </div>

        {/* Title */}
        <h2
          id="reset-modal-title"
          className="text-2xl sm:text-3xl font-black font-sans text-slate-900 dark:text-white tracking-tight uppercase mb-3"
        >
          {isQuizMode ? 'RESET QUIZ PROGRESS?' : 'RESET PROGRESS?'}
        </h2>

        {/* Body Description */}
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-6 font-medium">
          {isQuizMode ? (
            <>All answers and progress will be cleared. This action cannot be undone.</>
          ) : (
            <>
              Are you sure you want to reset your learning progress?
              <br className="hidden sm:inline" /> All completed theory chapters,
              watched videos, completed game levels, quiz progress, and
              mastery progress will be reset.
            </>
          )}
        </p>

        {/* Action Buttons: [ EXIT / CANCEL ] [ RESET / RESET PROGRESS ] */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {/* EXIT / CANCEL Button */}
          <button
            id="btn-modal-exit-reset"
            onClick={() => {
              soundManager.playModalClose();
              onClose();
            }}
            className="py-3 px-5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer active:scale-95 shadow-xs"
          >
            {isQuizMode ? 'CANCEL' : 'EXIT'}
          </button>

          {/* RESET Button */}
          <button
            id="btn-modal-confirm-reset"
            onClick={() => {
              soundManager.playReset();
              onConfirm();
              onClose();
            }}
            className="py-3 px-5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/30 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.5]" />
            <span>{isQuizMode ? 'RESET PROGRESS' : 'RESET'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { X, Lightbulb } from 'lucide-react';
import { soundManager } from '../utils/audio';

export interface HintCardProps {
  hint: string;
  onClose: () => void;
}

/**
 * HintCard Component
 *
 * Lightweight, non-intrusive hint display card rendered inline in game levels.
 * Displays a concise educational clue for the current challenge without disrupting gameplay.
 */
export const HintCard: React.FC<HintCardProps> = ({ hint, onClose }) => {
  return (
    <div
      role="region"
      aria-label="Challenge Hint"
      className="w-full bg-amber-50/90 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-500/40 rounded-xl p-3 sm:p-4 shadow-2xs transition-all duration-200 animate-fadeIn select-none"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-900/50 border border-amber-200 dark:border-amber-500/40 flex items-center justify-center shrink-0 text-amber-700 dark:text-amber-400 mt-0.5">
            <Lightbulb className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-amber-800 dark:text-amber-300 block">
              Hint (−2 pts)
            </span>
            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 mt-0.5 font-medium leading-relaxed font-sans">
              {hint}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            soundManager.playClick();
            onClose();
          }}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-amber-100 dark:hover:bg-amber-900/40 cursor-pointer transition-colors shrink-0"
          title="Close hint"
          aria-label="Close hint"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

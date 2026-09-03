import React from 'react';
import { Sparkles, ArrowRight, X, CheckCircle2 } from 'lucide-react';
import { soundManager } from '../utils/audio';

export interface GuidedSolvePanelProps {
  stepNumber: number;
  totalSteps?: number;
  explanation: string;
  isComplete?: boolean;
  nextButtonLabel?: string;
  onNextStep: () => void;
  onStop: () => void;
}

/**
 * GuidedSolvePanel Component
 * 
 * Compact, educational teaching assistant card for Linear Search game levels.
 * Renders inline within the game interface, explains the upcoming logical step,
 * and allows executing exactly one step at a time via "Next Step" or exiting via "Stop".
 */
export const GuidedSolvePanel: React.FC<GuidedSolvePanelProps> = ({
  stepNumber,
  totalSteps,
  explanation,
  isComplete = false,
  nextButtonLabel = 'Next Step',
  onNextStep,
  onStop,
}) => {
  const handleNext = () => {
    soundManager.playClick();
    onNextStep();
  };

  const handleStop = () => {
    soundManager.playClick();
    onStop();
  };

  return (
    <div
      id="guided-solve-panel"
      className="w-full bg-white dark:bg-[#0F172A] border-2 border-[#2563EB]/40 dark:border-blue-500/40 rounded-2xl p-4 sm:p-5 shadow-xs transition-all duration-200 animate-page-enter select-none"
    >
      {/* Header with Title and Step Counter */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-blue-500/20">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#EFF6FF] dark:bg-blue-950/60 border border-[#DBEAFE] dark:border-blue-500/30 flex items-center justify-center text-[#2563EB] dark:text-[#3B82F6]">
            {isComplete ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#3B82F6]" />
            )}
          </div>
          <span className="text-xs font-bold font-mono uppercase tracking-wider text-[#2563EB] dark:text-[#3B82F6]">
            Guided Solve
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-[#172033] border border-slate-200 dark:border-blue-500/30 text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
            {totalSteps ? `Step ${stepNumber} of ${totalSteps}` : `Step ${stepNumber}`}
          </span>
        </div>
      </div>

      {/* Educational Step Explanation */}
      <div className="py-3">
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-sans">
          {explanation}
        </p>
      </div>

      {/* Actions (Stop vs Next Step) */}
      <div className="pt-3 border-t border-slate-100 dark:border-blue-500/15 flex items-center justify-between gap-3">
        <button
          id="btn-guided-solve-stop"
          type="button"
          onClick={handleStop}
          className="btn-modern-secondary px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
          title="Exit Guided Solve and continue manually"
        >
          <X className="w-3.5 h-3.5" />
          <span>Stop</span>
        </button>

        <button
          id="btn-guided-solve-next"
          type="button"
          onClick={handleNext}
          className="btn-modern-primary px-4 sm:px-5 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <span>{nextButtonLabel}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

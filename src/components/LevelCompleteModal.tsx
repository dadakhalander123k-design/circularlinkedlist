import React, { useEffect } from 'react';
import { Award, ArrowRight, RotateCcw, Sparkles, Layers, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { LevelConfig } from '../types/game';
import { soundManager } from '../utils/audio';

interface LevelCompleteModalProps {
  level: LevelConfig;
  score: number;
  onNextLevel: () => void;
  onReplayLevel: () => void;
  onOpenLab?: () => void;
  hasNextLevel: boolean;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  level,
  score,
  onNextLevel,
  onReplayLevel,
  onOpenLab,
  hasNextLevel,
}) => {
  useEffect(() => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#2563EB', '#1D4ED8', '#6366F1', '#10B981'],
      });
    } catch {
      // Ignore
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-editorial-fade font-sans">
      <div className="bg-white dark:bg-[#111827] w-full max-w-md border border-slate-200 dark:border-blue-500/30 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden p-6 sm:p-8 flex flex-col items-center text-center">
        {/* Victory Icon */}
        <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] dark:bg-blue-950/50 border border-[#DBEAFE] dark:border-blue-500/30 text-[#2563EB] dark:text-[#3B82F6] flex items-center justify-center mb-3 shadow-xs">
          <Award className="w-8 h-8" />
        </div>

        <span className="text-[11px] font-bold font-mono uppercase tracking-widest text-[#2563EB] dark:text-[#3B82F6] bg-[#EFF6FF] dark:bg-blue-950/60 px-3 py-1 rounded-md border border-[#DBEAFE] dark:border-blue-500/30 mb-2">
          Module Verified // State Saved
        </span>

        <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight uppercase mb-1">
          {level.title} Completed
        </h3>

        <div className="my-4 p-4 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-blue-500/20 rounded-xl w-full text-left">
          <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 font-mono mb-1">Field Summary</div>
          <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 leading-snug">
            "{level.techniqueSummary}"
          </p>
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-blue-500/20 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500 dark:text-slate-400 font-semibold">Core Formula:</span>
            <span className="font-bold text-[#2563EB] dark:text-[#3B82F6] bg-white dark:bg-[#0B1120] px-2.5 py-1 rounded-md border border-slate-200 dark:border-blue-500/30">
              {level.formulaDisplay}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 mb-6 font-semibold font-mono">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>Status: <strong className="text-emerald-600 dark:text-emerald-400">Level Mastered & Verified</strong></span>
        </div>

        {/* Buttons */}
        <div className="w-full flex flex-col sm:flex-row gap-2.5">
          <button
            id="btn-replay-level-modal"
            onClick={() => {
              soundManager.playSecondaryClick();
              onReplayLevel();
            }}
            className="flex-1 btn-modern-secondary py-2.5 px-4 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Replay</span>
          </button>

          {hasNextLevel ? (
            <button
              id="btn-next-level-modal"
              onClick={() => {
                soundManager.playPrimaryClick();
                onNextLevel();
              }}
              className="flex-2 btn-modern-primary py-2.5 px-5 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Next Module</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="flex-2 flex flex-col sm:flex-row gap-2">
              <button
                id="btn-master-exam-modal"
                onClick={() => {
                  soundManager.playPrimaryClick();
                  onNextLevel();
                }}
                className="flex-1 btn-modern-primary py-2.5 px-4 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>Completion</span>
              </button>
              {onOpenLab && (
                <button
                  id="btn-open-lab-modal"
                  onClick={() => {
                    soundManager.playSecondaryClick();
                    onOpenLab();
                  }}
                  className="flex-1 btn-modern-secondary py-2.5 px-4 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#3B82F6]" />
                  <span>Open Lab</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

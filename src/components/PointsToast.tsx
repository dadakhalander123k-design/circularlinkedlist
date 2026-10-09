import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, PlusCircle, MinusCircle } from 'lucide-react';
import { PointChangeEventDetail } from '../utils/pointsManager';

export const PointsToast: React.FC = () => {
  const [currentToast, setCurrentToast] = useState<PointChangeEventDetail | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handlePointsChanged = (event: Event) => {
      const customEvent = event as CustomEvent<PointChangeEventDetail>;
      if (!customEvent.detail) return;

      const delta = customEvent.detail.actualDelta ?? customEvent.detail.delta;
      // Do not display toast if no points were awarded or deducted
      if (delta === 0) return;

      setCurrentToast(customEvent.detail);

      clearTimeout(timeoutId);
      // Auto-dismiss in 2.5 seconds (2–3 seconds requirement)
      timeoutId = setTimeout(() => {
        setCurrentToast(null);
      }, 2500);
    };

    window.addEventListener('points_changed', handlePointsChanged);
    return () => {
      window.removeEventListener('points_changed', handlePointsChanged);
      clearTimeout(timeoutId);
    };
  }, []);

  if (!currentToast) return null;

  const delta = currentToast.actualDelta ?? currentToast.delta;
  if (delta === 0) return null;

  const isPositive = delta > 0;
  const deltaString = isPositive ? `+${delta}` : `${delta}`;
  const pointsWord = Math.abs(delta) === 1 ? 'Point' : 'Points';

  // Format activity description to match prompt examples cleanly
  let activityLabel = currentToast.description;
  if (currentToast.type === 'QUIZ_CORRECT') activityLabel = 'Correct Answer!';
  else if (currentToast.type === 'QUIZ_WRONG') activityLabel = 'Incorrect Answer';
  else if (currentToast.type === 'THEORY_COMPLETED') activityLabel = 'Theory Module Completed';
  else if (currentToast.type === 'VIDEO_COMPLETED' || currentToast.type === 'VISUALIZE_COMPLETED') activityLabel = 'Visualization Completed';
  else if (currentToast.type === 'GAME_COMPLETED') activityLabel = 'Game Level Completed';
  else if (currentToast.type === 'HINT_USED') activityLabel = 'Hint Used';
  else if (currentToast.type === 'GUIDED_SOLVE_USED') activityLabel = 'Guided Solve Used';

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 right-4 sm:right-6 z-50 pointer-events-none select-none animate-fadeIn"
    >
      <div
        className={`px-4 py-3 rounded-2xl shadow-xl border-2 backdrop-blur-md flex items-center gap-3 transition-all duration-200 transform max-w-sm sm:max-w-md ${
          isPositive
            ? 'bg-white dark:bg-[#0F172A] border-emerald-500/80 text-slate-900 dark:text-white shadow-emerald-500/10'
            : 'bg-white dark:bg-[#0F172A] border-rose-500/80 text-slate-900 dark:text-white shadow-rose-500/10'
        }`}
      >
        {/* Status Indicator Icon */}
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
            isPositive
              ? 'bg-emerald-500 text-white'
              : 'bg-rose-500 text-white'
          }`}
        >
          {isPositive ? (
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
          ) : (
            <MinusCircle className="w-4 h-4 stroke-[2.5]" />
          )}
        </div>

        {/* Message and Amount */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`font-mono font-black text-sm sm:text-base ${
                isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {deltaString} {pointsWord}
            </span>
            <span className="text-slate-400 dark:text-slate-500 font-bold text-xs sm:text-sm">
              —
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
              {activityLabel}
            </span>
          </div>

          <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">
            Total: {currentToast.totalPoints} Points
          </div>
        </div>
      </div>
    </div>
  );
};

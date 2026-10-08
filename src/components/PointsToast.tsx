import React, { useState, useEffect } from 'react';
import { Sparkles, MinusCircle, PlusCircle } from 'lucide-react';
import { PointChangeEventDetail } from '../utils/pointsManager';

export const PointsToast: React.FC = () => {
  const [currentToast, setCurrentToast] = useState<PointChangeEventDetail | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handlePointsChanged = (event: Event) => {
      const customEvent = event as CustomEvent<PointChangeEventDetail>;
      if (!customEvent.detail) return;

      setCurrentToast(customEvent.detail);

      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setCurrentToast(null);
      }, 2600);
    };

    window.addEventListener('points_changed', handlePointsChanged);
    return () => {
      window.removeEventListener('points_changed', handlePointsChanged);
      clearTimeout(timeoutId);
    };
  }, []);

  if (!currentToast) return null;

  const isPositive = currentToast.delta > 0;
  const deltaString = isPositive ? `+${currentToast.delta}` : `${currentToast.delta}`;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 right-4 sm:right-6 z-50 pointer-events-none animate-fadeIn select-none"
    >
      <div
        className={`px-4 py-2.5 rounded-2xl shadow-lg border backdrop-blur-md flex items-center gap-3 transition-all transform duration-200 ${
          isPositive
            ? 'bg-emerald-50/95 dark:bg-emerald-950/90 border-emerald-300 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-100'
            : 'bg-rose-50/95 dark:bg-rose-950/90 border-rose-300 dark:border-rose-500/40 text-rose-900 dark:text-rose-100'
        }`}
      >
        <div
          className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
            isPositive
              ? 'bg-emerald-500 text-white shadow-xs'
              : 'bg-rose-500 text-white shadow-xs'
          }`}
        >
          {isPositive ? <PlusCircle className="w-4 h-4" /> : <MinusCircle className="w-4 h-4" />}
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-black text-sm">
              {deltaString} {Math.abs(currentToast.delta) === 1 ? 'Point' : 'Points'}
            </span>
            <span className="text-xs opacity-75">• Total: {currentToast.totalPoints}</span>
          </div>
          <span className="text-xs font-medium opacity-90 truncate max-w-xs">
            {currentToast.description}
          </span>
        </div>
      </div>
    </div>
  );
};

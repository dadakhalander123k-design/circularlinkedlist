import React from 'react';
import { Compass, Home, BookOpen, Gamepad2, ArrowLeft } from 'lucide-react';
import { soundManager } from '../utils/audio';

export interface NotFoundViewProps {
  onNavigateHome: () => void;
  onNavigateTheory: () => void;
  onNavigateGame: () => void;
  onNavigateLab: () => void;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({
  onNavigateHome,
  onNavigateTheory,
  onNavigateGame,
  onNavigateLab,
}) => {
  return (
    <div
      id="not-found-view"
      className="w-full max-w-4xl mx-auto py-12 px-4 sm:px-6 flex flex-col items-center justify-center text-center font-sans animate-page-enter"
    >
      <div className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-blue-500/20 rounded-3xl p-8 sm:p-12 shadow-xs dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] space-y-6">
        {/* Error Code Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#EFF6FF] dark:bg-blue-950/60 border border-[#DBEAFE] dark:border-blue-500/30 rounded-full text-xs font-mono font-bold text-[#2563EB] dark:text-[#3B82F6] uppercase tracking-wider">
          <Compass className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6] animate-spin-slow" />
          <span>Error 404 • Resource Not Found</span>
        </div>

        {/* Primary Page Heading */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white">
            Page Not Found
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
            The requested sequential address or learning chapter does not exist in our curriculum index.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            id="btn-404-home"
            onClick={() => {
              soundManager.playClick();
              onNavigateHome();
            }}
            className="btn-modern-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Return to Overview</span>
          </button>

          <button
            id="btn-404-theory"
            onClick={() => {
              soundManager.playClick();
              onNavigateTheory();
            }}
            className="btn-modern-secondary px-4 py-2.5 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all"
          >
            <BookOpen className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6]" />
            <span>Browse Theory</span>
          </button>

          <button
            id="btn-404-game"
            onClick={() => {
              soundManager.playClick();
              onNavigateGame();
            }}
            className="btn-modern-secondary px-4 py-2.5 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all"
          >
            <Gamepad2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Play Quest</span>
          </button>
        </div>
      </div>
    </div>
  );
};

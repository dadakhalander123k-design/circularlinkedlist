import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Star,
  TrendingUp,
  Eye,
  Gamepad2,
  Brain,
} from 'lucide-react';
import { progressManager } from '../utils/progressManager';
import { pointsManager, CATEGORY_CAPS } from '../utils/pointsManager';
import { ModuleRecord, UserProgressState, MainViewTab } from '../types/game';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface MyProgressViewProps {
  onNavigateToTab: (tab: ModuleRecord['targetTab'] | MainViewTab, levelId?: number, chapterId?: string) => void;
}

export const MyProgressView: React.FC<MyProgressViewProps> = ({ onNavigateToTab }) => {
  useScrollReveal();
  const [, setProgressState] = useState<UserProgressState>(progressManager.getState());
  const [pointsState, setPointsState] = useState(() => pointsManager.getState());
  const [breakdown, setBreakdown] = useState(() => pointsManager.getBreakdown());

  useEffect(() => {
    progressManager.checkAndCompleteCertification();
    const unsubProgress = progressManager.subscribe((state) => {
      setProgressState(state);
    });
    const unsubPoints = pointsManager.subscribe((st) => {
      setPointsState(st);
      setBreakdown(pointsManager.getBreakdown());
    });
    return () => {
      unsubProgress && unsubProgress();
      unsubPoints && unsubPoints();
    };
  }, []);

  const stats = progressManager.getStats();

  const visualizeMax = CATEGORY_CAPS.VISUALIZE; // 20
  const gameMax = CATEGORY_CAPS.GAME; // 50
  const quizMax = CATEGORY_CAPS.QUIZ; // 30

  const visualizePercent = Math.min(100, Math.max(0, Math.round((breakdown.visualization / visualizeMax) * 100)));
  const gamePercent = Math.min(100, Math.max(0, Math.round((breakdown.games / gameMax) * 100)));
  const quizPercent = Math.min(100, Math.max(0, Math.round((breakdown.quiz / quizMax) * 100)));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 font-sans text-slate-900 dark:text-white animate-page-enter pb-16">
      {/* 1. Overall Completion Card — Matching Reference Screenshot Card 1 */}
      <div
        id="progress-overall-card"
        className="bg-white dark:bg-[#0B132B] border border-slate-200/90 dark:border-slate-800/80 rounded-2xl sm:rounded-3xl p-6 sm:p-7 shadow-xs dark:shadow-xl relative overflow-hidden reveal-on-scroll"
      >
        {/* Top: Progress Icon + Circular Linked List Learning Progress Heading + Description */}
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0">
            <TrendingUp className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex flex-wrap items-center gap-x-2">
              <span>Circular Linked List</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400">
                Learning Progress
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Track your journey through Circular Linked List concepts, algorithms, problem solving, complexity, and practical applications.
            </p>
          </div>
        </div>

        {/* Middle: OVERALL COMPLETION + X of Y Modules + Percentage */}
        <div className="mt-6 pt-2 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
                OVERALL COMPLETION
              </span>
              <span className="text-xs font-mono px-3 py-0.5 bg-blue-50 dark:bg-slate-800/90 border border-blue-200/80 dark:border-slate-700/60 text-[#2563EB] dark:text-slate-300 rounded-full font-medium">
                {stats.completed} of {stats.total} Modules
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5">
              Complete all learning activities to master Circular Linked List and earn 100 points.
            </p>
          </div>

          <div className="text-3xl sm:text-4xl font-extrabold text-[#2563EB] dark:text-[#3B82F6] font-mono tracking-tight self-end sm:self-auto leading-none">
            {stats.percentage}%
          </div>
        </div>

        {/* Bottom: Horizontal Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800/90 rounded-full h-3 overflow-hidden mt-3.5 relative border border-slate-200/50 dark:border-transparent">
          <div
            className="bg-[#2563EB] dark:bg-[#3B82F6] h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${stats.percentage}%`, minWidth: stats.percentage > 0 ? '8px' : '4px' }}
          />
        </div>
      </div>

      {/* 2. Topic Score Card with 3 Categories — Matching Reference Screenshot Card 2 */}
      <div
        id="progress-topic-score-card"
        className="bg-white dark:bg-[#0B132B] border border-slate-200/90 dark:border-slate-800/80 rounded-2xl sm:rounded-3xl p-6 sm:p-7 shadow-xs dark:shadow-xl mt-6 relative overflow-hidden reveal-on-scroll stagger-1"
      >
        {/* Header: Trophy Icon + Topic Score Heading + Subtitle + Total Points Area */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left: Blue-to-Purple Gradient Trophy Icon + Headings */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/25 shrink-0">
              <Trophy className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Circular Linked List Topic Score
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                Earned points are calculated from completed, persisted activities.
              </p>
            </div>
          </div>

          {/* Right: Total Points Area */}
          <div className="flex items-center gap-3 self-end sm:self-auto bg-blue-50/70 dark:bg-slate-900/60 border border-blue-200/80 dark:border-slate-800/80 px-4 py-2.5 rounded-2xl">
            <div className="w-11 h-11 rounded-xl bg-white dark:bg-slate-800/90 border border-blue-200/80 dark:border-slate-700/60 flex items-center justify-center text-amber-500 dark:text-amber-400 relative shadow-xs dark:shadow-inner shrink-0">
              <Star className="w-6 h-6 fill-amber-400 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.65)]" />
              <span className="absolute -top-1 -right-1 text-[10px] text-amber-400 dark:text-amber-300">✦</span>
            </div>
            <div className="text-right">
              <div className="flex items-baseline justify-end gap-1.5 font-mono leading-none">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#2563EB] dark:text-blue-400">
                  {pointsState.totalPoints}
                </span>
                <span className="text-xl sm:text-2xl font-bold text-slate-500 dark:text-slate-400">
                  / 100
                </span>
              </div>
              <div className="text-[10px] font-bold font-mono uppercase tracking-widest text-[#2563EB]/80 dark:text-slate-400 mt-1">
                TOTAL POINTS
              </div>
            </div>
          </div>
        </div>

        {/* Three Category Cards — Exact Order: 1. Visualize (20), 2. Game (50), 3. Quiz (30) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          {/* Hidden Learn Card for selector compatibility */}
          <div id="category-card-learn" className="hidden" aria-hidden="true" />

          {/* 1. Visualize Card (20 pts) */}
          <div
            id="category-card-visualize"
            onClick={() => onNavigateToTab('VIDEO')}
            className="bg-slate-50/80 dark:bg-[#070D1A] border border-slate-200/80 dark:border-slate-800/80 hover:border-purple-500/50 dark:hover:border-purple-500/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer group shadow-xs dark:shadow-none"
          >
            <div>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-purple-100/80 dark:bg-purple-950/70 border border-purple-200 dark:border-purple-500/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">Visualize</div>
                  <div className="text-base sm:text-lg font-extrabold font-mono text-slate-900 dark:text-white leading-tight">
                    {breakdown.visualization} / {visualizeMax}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 mt-4">
                <div className="flex-1 bg-slate-200/80 dark:bg-slate-800/90 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#2563EB] dark:bg-blue-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${visualizePercent}%` }}
                  />
                </div>
                <span className="text-xs font-bold font-mono text-[#2563EB] dark:text-blue-400 shrink-0">
                  {visualizePercent}%
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3">
              2 visualization videos (10 pts each)
            </p>
          </div>

          {/* 2. Game Card (50 pts) */}
          <div
            id="category-card-game"
            onClick={() => onNavigateToTab('GAME', 1)}
            className="bg-slate-50/80 dark:bg-[#070D1A] border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-500/50 dark:hover:border-indigo-500/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer group shadow-xs dark:shadow-none"
          >
            <div>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-indigo-100/80 dark:bg-gradient-to-br dark:from-indigo-900/60 dark:to-purple-950/60 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">Game</div>
                  <div className="text-base sm:text-lg font-extrabold font-mono text-slate-900 dark:text-white leading-tight">
                    {breakdown.games} / {gameMax}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 mt-4">
                <div className="flex-1 bg-slate-200/80 dark:bg-slate-800/90 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#2563EB] dark:bg-blue-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${gamePercent}%` }}
                  />
                </div>
                <span className="text-xs font-bold font-mono text-[#2563EB] dark:text-blue-400 shrink-0">
                  {gamePercent}%
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3">
              5 game levels (10 pts each, Hint − 2, Guided −4)
            </p>
          </div>

          {/* 3. Quiz Card (30 pts) */}
          <div
            id="category-card-quiz"
            onClick={() => onNavigateToTab('QUIZ')}
            className="bg-slate-50/80 dark:bg-[#070D1A] border border-slate-200/80 dark:border-slate-800/80 hover:border-sky-500/50 dark:hover:border-sky-500/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer group shadow-xs dark:shadow-none"
          >
            <div>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-sky-100/80 dark:bg-sky-950/70 border border-sky-200 dark:border-sky-500/30 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">Quiz</div>
                  <div className="text-base sm:text-lg font-extrabold font-mono text-slate-900 dark:text-white leading-tight">
                    {breakdown.quiz} / {quizMax}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 mt-4">
                <div className="flex-1 bg-slate-200/80 dark:bg-slate-800/90 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#2563EB] dark:bg-blue-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${quizPercent}%` }}
                  />
                </div>
                <span className="text-xs font-bold font-mono text-[#2563EB] dark:text-blue-400 shrink-0">
                  {quizPercent}%
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3">
              10 quiz questions (+3 correct, −2 wrong, 0 timeout)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProgressView;

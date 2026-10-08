import React, { useState, useEffect } from 'react';
import {
  Award,
  BookOpen,
  Sparkles,
  Gamepad2,
  HelpCircle,
  AlertCircle,
  TrendingUp,
  Clock,
  History,
  CheckCircle2,
  MinusCircle,
  PlusCircle,
  ShieldAlert,
} from 'lucide-react';
import { pointsManager, PointsState, PointsBreakdown } from '../utils/pointsManager';
import { useScrollReveal } from '../hooks/useScrollReveal';

export const PointsView: React.FC = () => {
  useScrollReveal();
  const [pointsState, setPointsState] = useState<PointsState>(() => pointsManager.getState());
  const [breakdown, setBreakdown] = useState<PointsBreakdown>(() => pointsManager.getBreakdown());

  useEffect(() => {
    const unsubscribe = pointsManager.subscribe((state) => {
      setPointsState(state);
      setBreakdown(pointsManager.getBreakdown());
    });
    return unsubscribe;
  }, []);

  const totalPoints = pointsState.totalPoints;
  const recentActivities = pointsState.activities;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'THEORY_COMPLETED':
        return BookOpen;
      case 'VISUALIZE_COMPLETED':
      case 'VIDEO_COMPLETED':
        return Sparkles;
      case 'GAME_COMPLETED':
        return Gamepad2;
      case 'QUIZ_CORRECT':
        return CheckCircle2;
      case 'QUIZ_WRONG':
        return AlertCircle;
      case 'HINT_USED':
      case 'GUIDED_SOLVE_USED':
        return ShieldAlert;
      default:
        return Award;
    }
  };

  const formatActivityTime = (timestamp: number) => {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 font-sans text-slate-900 dark:text-white animate-page-enter pb-24 space-y-8">
      {/* 1. Header Banner */}
      <div className="border-b border-slate-200 dark:border-blue-500/20 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-3">
            <span className="text-xs sm:text-sm font-bold font-mono uppercase tracking-widest text-[#2563EB] dark:text-[#3B82F6] bg-[#EFF6FF] dark:bg-blue-950/60 px-3 py-1 rounded-md border border-[#DBEAFE] dark:border-blue-500/30">
              Central Points Ledger
            </span>
            <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
              Live Tracker
            </span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight animate-heading-enter">
          Points & Activity
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mt-2 leading-relaxed">
          Transparent ledger of all Points earned across Theory modules, Visualizations, Game levels, and Quizzes.
        </p>
      </div>

      {/* 2. Main Total Points Display Card */}
      <section
        id="points-total-card"
        aria-label="Current Total Points"
        className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-blue-500/20 rounded-3xl p-8 sm:p-10 shadow-xs text-center flex flex-col items-center justify-center relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-48 h-48 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-bold font-mono uppercase tracking-wider mb-3">
          <Award className="w-3.5 h-3.5" />
          <span>Active Total</span>
        </div>

        <div className="text-5xl sm:text-7xl font-black text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-3 my-1">
          <span className="text-amber-500 select-none animate-pulse">⭐</span>
          <span className="font-mono">{totalPoints}</span>
          <span className="text-2xl sm:text-4xl font-extrabold text-[#2563EB] dark:text-[#3B82F6] ml-1">
            Points
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-md mt-2">
          Earn points by completing theory lessons (+2), visualizations (+3), and game levels (+4).
        </p>
      </section>

      {/* 3. Two-Column Layout: Breakdown & Scoring Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Points Breakdown (Takes 2 columns on lg) */}
        <section
          id="points-breakdown-section"
          aria-label="Points Breakdown"
          className="lg:col-span-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-blue-500/20 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-blue-500/15 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#EFF6FF] dark:bg-blue-950/50 text-[#2563EB] dark:text-[#3B82F6] border border-[#DBEAFE] dark:border-blue-500/30">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-sans text-slate-900 dark:text-white">
                Points Breakdown
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
              Categorized
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-blue-500/10">
            {/* Theory */}
            <div className="py-3.5 flex items-center justify-between text-sm sm:text-base">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-500/20 flex items-center justify-center text-[#2563EB] dark:text-[#3B82F6]">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-200">Theory</span>
              </div>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {breakdown.theory >= 0 ? `+${breakdown.theory}` : breakdown.theory}
              </span>
            </div>

            {/* Visualization */}
            <div className="py-3.5 flex items-center justify-between text-sm sm:text-base">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-200">Visualization</span>
              </div>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {breakdown.visualization >= 0 ? `+${breakdown.visualization}` : breakdown.visualization}
              </span>
            </div>

            {/* Games */}
            <div className="py-3.5 flex items-center justify-between text-sm sm:text-base">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Gamepad2 className="w-4 h-4" />
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-200">Games</span>
              </div>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {breakdown.games >= 0 ? `+${breakdown.games}` : breakdown.games}
              </span>
            </div>

            {/* Quiz */}
            <div className="py-3.5 flex items-center justify-between text-sm sm:text-base">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-200">Quiz</span>
              </div>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {breakdown.quiz >= 0 ? `+${breakdown.quiz}` : breakdown.quiz}
              </span>
            </div>

            {/* Penalties */}
            <div className="py-3.5 flex items-center justify-between text-sm sm:text-base">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-200">Penalties</span>
              </div>
              <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                {breakdown.penalties <= 0 ? breakdown.penalties : `-${breakdown.penalties}`}
              </span>
            </div>

            {/* Total Line */}
            <div className="pt-4 mt-2 flex items-center justify-between border-t-2 border-slate-200 dark:border-blue-500/30 font-bold text-base sm:text-lg">
              <span className="text-slate-900 dark:text-white">Total</span>
              <span className="font-mono text-xl sm:text-2xl text-[#2563EB] dark:text-[#3B82F6]">
                {breakdown.total}
              </span>
            </div>
          </div>
        </section>

        {/* Right Column: Scoring Rules Reference */}
        <section
          aria-label="Scoring Rules Reference"
          className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-blue-500/20 rounded-2xl p-6 shadow-xs space-y-4"
        >
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-blue-500/15 pb-3">
            <Award className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6]" />
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-100">
              Scoring Rules
            </h3>
          </div>

          <ul className="space-y-2.5 text-xs sm:text-sm">
            <li className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-blue-900/20">
              <span className="text-slate-600 dark:text-slate-300">Complete Theory module</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">+2</span>
            </li>
            <li className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-blue-900/20">
              <span className="text-slate-600 dark:text-slate-300">Complete Visualize module</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">+3</span>
            </li>
            <li className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-blue-900/20">
              <span className="text-slate-600 dark:text-slate-300">Complete Game level</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">+4</span>
            </li>
            <li className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-blue-900/20">
              <span className="text-slate-600 dark:text-slate-300">Use Hint</span>
              <span className="font-mono font-bold text-rose-600 dark:text-rose-400">-1</span>
            </li>
            <li className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-blue-900/20">
              <span className="text-slate-600 dark:text-slate-300">Use Guided Solve</span>
              <span className="font-mono font-bold text-rose-600 dark:text-rose-400">-2</span>
            </li>
            <li className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-blue-900/20">
              <span className="text-slate-600 dark:text-slate-300">Quiz correct answer</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">+1</span>
            </li>
            <li className="flex items-center justify-between py-1">
              <span className="text-slate-600 dark:text-slate-300">Quiz wrong answer</span>
              <span className="font-mono font-bold text-rose-600 dark:text-rose-400">-1</span>
            </li>
          </ul>

          <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
            Completion rewards are awarded once per unique module or level.
          </div>
        </section>
      </div>

      {/* 4. Recent Activity Ledger */}
      <section
        id="points-activity-section"
        aria-label="Recent Points Activity"
        className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-blue-500/20 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4"
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-blue-500/15 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#EFF6FF] dark:bg-blue-950/50 text-[#2563EB] dark:text-[#3B82F6] border border-[#DBEAFE] dark:border-blue-500/30">
              <History className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold font-sans text-slate-900 dark:text-white">
              Recent Activity
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
            {recentActivities.length} {recentActivities.length === 1 ? 'event' : 'events'}
          </span>
        </div>

        {recentActivities.length === 0 ? (
          <div className="py-12 text-center text-slate-500 dark:text-slate-400 space-y-2">
            <Clock className="w-8 h-8 mx-auto text-slate-400 dark:text-slate-600" />
            <p className="font-semibold text-sm">No Points activity recorded yet.</p>
            <p className="text-xs max-w-sm mx-auto">
              Complete Theory chapters, watch video lessons, solve game levels, or answer quiz questions to begin accumulating Points.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentActivities.map((act) => {
              const isPositive = act.points > 0;
              const pointsDisplay = isPositive ? `+${act.points}` : `${act.points}`;
              const Icon = getActivityIcon(act.type);

              return (
                <div
                  key={act.id}
                  className="p-3.5 sm:p-4 rounded-xl bg-slate-50/70 dark:bg-[#0B1120]/60 border border-slate-100 dark:border-blue-500/15 flex items-center justify-between gap-3 transition-colors hover:border-slate-200 dark:hover:border-blue-500/30"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Points Value Tag */}
                    <span
                      className={`px-2.5 py-1 rounded-lg font-mono font-extrabold text-xs sm:text-sm shrink-0 border ${
                        isPositive
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30'
                      }`}
                    >
                      {pointsDisplay}
                    </span>

                    {/* Activity Icon */}
                    <div className="p-1.5 rounded-lg bg-white dark:bg-blue-950/50 border border-slate-200/80 dark:border-blue-500/20 text-slate-600 dark:text-slate-300 shrink-0 hidden xs:flex">
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    {/* Activity Description */}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                        {act.description}
                      </p>
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        {act.type.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Relative Timestamp */}
                  <span className="text-xs font-mono text-slate-400 dark:text-slate-500 shrink-0">
                    {formatActivityTime(act.timestamp)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

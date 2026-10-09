import React, { useState, useEffect } from 'react';
import {
  Award,
  BookOpen,
  Sparkles,
  Gamepad2,
  HelpCircle,
  TrendingUp,
  Clock,
  History,
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 font-sans text-slate-900 dark:text-white animate-page-enter space-y-6 pb-24">
      {/* 1. Header Card Matching Screenshot 1 */}
      <section
        id="points-header-card"
        aria-label="Points Overview"
        className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-blue-500/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6"
      >
        {/* Left Side */}
        <div className="space-y-2.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFF6FF] dark:bg-blue-950/60 border border-[#DBEAFE] dark:border-blue-500/30 text-[#2563EB] dark:text-[#3B82F6] text-xs font-bold font-mono tracking-wider">
            <Award className="w-3.5 h-3.5" />
            <span>CENTRAL POINTS SYSTEM</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] dark:text-white tracking-tight">
            Points
          </h1>

          <p className="text-xs sm:text-sm text-[#475569] dark:text-slate-300 leading-relaxed font-sans">
            Circular Linked List scoring: Visualization (20 pts), Game Levels (50 pts), and Quiz Assessment (30 pts).
          </p>
        </div>

        {/* Right Side: Total Points Card */}
        <div className="bg-[#EFF6FF] dark:bg-blue-950/40 border border-[#DBEAFE] dark:border-blue-500/30 rounded-2xl p-5 sm:px-6 sm:py-5 text-right flex flex-col items-end justify-center min-w-[170px] sm:min-w-[190px] shadow-xs shrink-0">
          <span className="text-[11px] sm:text-xs font-bold font-mono uppercase tracking-wider text-[#2563EB] dark:text-[#3B82F6]">
            TOTAL POINTS
          </span>

          <div className="text-3xl sm:text-4xl font-black text-[#0F172A] dark:text-white font-mono my-1 tracking-tight flex items-baseline justify-end gap-1">
            <span>{totalPoints}</span>
            <span className="text-lg sm:text-xl font-bold text-[#64748B] dark:text-slate-400">/ 100</span>
          </div>

          <span className="text-xs font-medium text-[#64748B] dark:text-slate-400 font-mono">
            {totalPoints} / 100 Points
          </span>
        </div>
      </section>

      {/* 2. Two-Column Layout Matching Screenshot 2: Points Breakdown & Scoring Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Points Breakdown Card (Wider, ~2/3) */}
        <section
          id="points-breakdown-section"
          aria-label="Points Breakdown"
          className="lg:col-span-7 xl:col-span-8 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-blue-500/20 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-blue-500/15 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] dark:bg-blue-950/50 text-[#2563EB] dark:text-[#3B82F6] border border-[#DBEAFE] dark:border-blue-500/30 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold font-sans text-[#0F172A] dark:text-white">
                Points Breakdown
              </h2>
            </div>
            <span className="text-xs font-mono font-medium text-[#94A3B8] dark:text-slate-500">
              Categorized
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-blue-500/10">
            {/* Visualization */}
            <div className="py-3 flex items-center justify-between text-sm sm:text-base">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-semibold text-[#1E293B] dark:text-slate-200 text-sm sm:text-base">
                  Visualization (Max 20)
                </span>
              </div>
              <span className="font-mono font-bold text-[#0F172A] dark:text-white text-sm sm:text-base">
                {breakdown.visualization >= 0 ? `+${breakdown.visualization}` : breakdown.visualization}
              </span>
            </div>

            {/* Games */}
            <div className="py-3 flex items-center justify-between text-sm sm:text-base">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Gamepad2 className="w-4 h-4" />
                </div>
                <span className="font-semibold text-[#1E293B] dark:text-slate-200 text-sm sm:text-base">
                  Games (Max 50)
                </span>
              </div>
              <span className="font-mono font-bold text-[#0F172A] dark:text-white text-sm sm:text-base">
                {breakdown.games >= 0 ? `+${breakdown.games}` : breakdown.games}
              </span>
            </div>

            {/* Quiz */}
            <div className="py-3 flex items-center justify-between text-sm sm:text-base">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <span className="font-semibold text-[#1E293B] dark:text-slate-200 text-sm sm:text-base">
                  Quiz (Max 30)
                </span>
              </div>
              <span className="font-mono font-bold text-[#0F172A] dark:text-white text-sm sm:text-base">
                {breakdown.quiz >= 0 ? `+${breakdown.quiz}` : breakdown.quiz}
              </span>
            </div>

            {/* Deductions */}
            <div className="py-3 flex items-center justify-between text-sm sm:text-base">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <span className="font-semibold text-[#1E293B] dark:text-slate-200 text-sm sm:text-base">
                  Deductions (Hints −2 / Guided −4)
                </span>
              </div>
              <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-sm sm:text-base">
                {breakdown.penalties <= 0 ? breakdown.penalties : `-${breakdown.penalties}`}
              </span>
            </div>

            {/* Total Line */}
            <div className="pt-4 mt-1 flex items-center justify-between border-t-2 border-slate-100 dark:border-blue-500/20">
              <span className="font-bold text-[#0F172A] dark:text-white text-base sm:text-lg">
                Total
              </span>
              <span className="font-mono font-bold text-lg sm:text-xl text-[#2563EB] dark:text-[#3B82F6]">
                {totalPoints} / 100
              </span>
            </div>
          </div>
        </section>

        {/* Right Column: Scoring Rules Card (Narrower, ~1/3) */}
        <section
          aria-label="Scoring Rules Reference"
          className="lg:col-span-5 xl:col-span-4 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-blue-500/20 rounded-2xl p-6 shadow-xs space-y-4"
        >
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-blue-500/15 pb-3">
            <Award className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6] shrink-0" />
            <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wider text-[#0F172A] dark:text-slate-100 font-mono">
              SCORING RULES
            </h3>
          </div>

          <ul className="divide-y divide-slate-100 dark:divide-blue-500/10 text-xs sm:text-[13px]">
            <li className="flex items-center justify-between py-2">
              <span className="text-[#475569] dark:text-slate-300">Complete Video Lesson (2 × 10)</span>
              <span className="font-mono font-bold text-[#059669] dark:text-emerald-400 text-right shrink-0">
                +10 (max 20)
              </span>
            </li>
            <li className="flex items-center justify-between py-2">
              <span className="text-[#475569] dark:text-slate-300">Complete Game Level (5 × 10)</span>
              <span className="font-mono font-bold text-[#059669] dark:text-emerald-400 text-right shrink-0">
                +10 (max 50)
              </span>
            </li>
            <li className="flex items-center justify-between py-2">
              <span className="text-[#475569] dark:text-slate-300">Quiz Question Correct</span>
              <span className="font-mono font-bold text-[#059669] dark:text-emerald-400 text-right shrink-0">
                +3
              </span>
            </li>
            <li className="flex items-center justify-between py-2">
              <span className="text-[#475569] dark:text-slate-300">Quiz Question Incorrect</span>
              <span className="font-mono font-bold text-[#E11D48] dark:text-rose-400 text-right shrink-0">
                −2
              </span>
            </li>
            <li className="flex items-center justify-between py-2">
              <span className="text-[#475569] dark:text-slate-300">Quiz Timeout / Unanswered</span>
              <span className="font-mono font-bold text-slate-400 dark:text-slate-500 text-right shrink-0">
                0
              </span>
            </li>
            <li className="flex items-center justify-between py-2">
              <span className="text-[#475569] dark:text-slate-300">Quiz Maximum Positive Cap</span>
              <span className="font-mono font-bold text-[#0F172A] dark:text-slate-200 text-right shrink-0">
                Max 30
              </span>
            </li>
            <li className="flex items-center justify-between py-2">
              <span className="text-[#475569] dark:text-slate-300">Use Hint (per actual use)</span>
              <span className="font-mono font-bold text-[#E11D48] dark:text-rose-400 text-right shrink-0">
                −2
              </span>
            </li>
            <li className="flex items-center justify-between py-2">
              <span className="text-[#475569] dark:text-slate-300">Use Guided Solve (per actual use)</span>
              <span className="font-mono font-bold text-[#E11D48] dark:text-rose-400 text-right shrink-0">
                −4
              </span>
            </li>
            <li className="flex items-center justify-between py-2">
              <span className="text-[#475569] dark:text-slate-300">Learn / Theory Section</span>
              <span className="font-mono font-bold text-slate-400 dark:text-slate-500 text-right shrink-0">
                0 pts
              </span>
            </li>
            <li className="flex items-center justify-between py-2">
              <span className="text-[#475569] dark:text-slate-300">Total Score Scale</span>
              <span className="font-mono font-bold text-[#0F172A] dark:text-slate-200 text-right shrink-0">
                0 – 100 Points
              </span>
            </li>
          </ul>

          <div className="pt-2 text-[11px] text-[#64748B] dark:text-slate-400 leading-relaxed font-sans">
            Completion rewards are awarded once per unique video or level. Hints (−2 pts) and Guided Solves (−4 pts) deduct points for every actual use. Quiz questions award +3 for correct, −2 for wrong, and 0 for timeouts. The total reflects all earned points and deductions out of 100.
          </div>
        </section>
      </div>

      {/* 3. Recent Activity Section Matching Screenshot 3 */}
      <section
        id="points-activity-section"
        aria-label="Recent Points Activity"
        className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-blue-500/20 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4"
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-blue-500/15 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] dark:bg-blue-950/50 text-[#2563EB] dark:text-[#3B82F6] border border-[#DBEAFE] dark:border-blue-500/30 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold font-sans text-[#0F172A] dark:text-white">
              Recent Activity
            </h2>
          </div>
          <span className="text-xs font-mono font-medium text-[#64748B] dark:text-slate-400">
            {recentActivities.length} {recentActivities.length === 1 ? 'event' : 'events'}
          </span>
        </div>

        {recentActivities.length === 0 ? (
          <div className="py-12 text-center text-slate-500 dark:text-slate-400 space-y-2">
            <Clock className="w-8 h-8 mx-auto text-slate-400 dark:text-slate-600" />
            <p className="font-semibold text-sm">No Points activity recorded yet.</p>
            <p className="text-xs max-w-sm mx-auto text-slate-400">
              Complete Theory chapters, watch video lessons, solve game levels, or answer quiz questions to begin accumulating Points.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivities.map((act) => {
              const isPositive = act.points > 0;
              const pointsDisplay = isPositive ? `+${act.points}` : `${act.points}`;

              return (
                <div
                  key={act.id}
                  className="p-3.5 sm:p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0B1120]/70 border border-slate-100 dark:border-blue-500/15 flex items-center justify-between gap-4 transition-colors hover:border-slate-200 dark:hover:border-blue-500/30"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* Points Value Tag Badge */}
                    <span
                      className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs sm:text-sm shrink-0 border ${
                        isPositive
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-[#059669] dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                          : 'bg-rose-50 dark:bg-rose-950/50 text-[#E11D48] dark:text-rose-300 border-rose-200 dark:border-rose-500/30'
                      }`}
                    >
                      {pointsDisplay}
                    </span>

                    {/* Activity Title & Uppercase Type */}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-semibold text-[#0F172A] dark:text-slate-100 truncate">
                        {act.description}
                      </p>
                      <span className="text-[11px] font-mono uppercase text-[#64748B] dark:text-slate-400 tracking-wider">
                        {act.type.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Relative Timestamp */}
                  <span className="text-xs font-mono text-[#64748B] dark:text-slate-400 shrink-0">
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

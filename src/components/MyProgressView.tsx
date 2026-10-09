import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  ArrowRight,
  Trophy,
  BookOpen,
  Gamepad2,
  Video,
  Award,
  Check,
  Star,
  Circle,
  TrendingUp,
  Eye,
  Brain,
  Clock,
  XCircle,
} from 'lucide-react';
import { progressManager } from '../utils/progressManager';
import { pointsManager, CATEGORY_CAPS } from '../utils/pointsManager';
import { ModuleRecord, ModuleStatus, UserProgressState, MainViewTab } from '../types/game';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { CompletionCelebrationModal } from './CompletionCelebrationModal';
import { soundManager } from '../utils/audio';
import { GAME_LEVELS } from '../data/levels';
import { QUIZ_QUESTIONS } from './QuizView';

interface MyProgressViewProps {
  onNavigateToTab: (tab: ModuleRecord['targetTab'] | MainViewTab, levelId?: number, chapterId?: string) => void;
}

export const MyProgressView: React.FC<MyProgressViewProps> = ({ onNavigateToTab }) => {
  useScrollReveal();
  const [progressState, setProgressState] = useState<UserProgressState>(progressManager.getState());
  const [pointsState, setPointsState] = useState(() => pointsManager.getState());
  const [breakdown, setBreakdown] = useState(() => pointsManager.getBreakdown());
  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'FUNDAMENTALS' | 'OPERATIONS' | 'ANALYSIS'>('ALL');

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
  const videoStats = progressManager.getVideoStats();
  const modules = progressManager.getModules();
  const is100Percent = stats.percentage === 100;

  const studentAnswers = useMemo<Record<number, any>>(() => {
    try {
      const stored = localStorage.getItem('hash_quest_quiz_answers_v4') || localStorage.getItem('cll_quiz_answers_v1');
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return {};
  }, [pointsState]);

  const filteredModules = activeFilter === 'ALL'
    ? modules
    : activeFilter === 'FUNDAMENTALS'
      ? modules.filter((m) => ['INTRODUCTION', 'FUNDAMENTALS', 'STRUCTURE', 'VARIATIONS', 'COMPARISON', 'MEMORY', 'POINTERS'].includes(m.category))
      : activeFilter === 'OPERATIONS'
        ? modules.filter((m) => m.category === 'OPERATIONS')
        : modules.filter((m) => ['ANALYSIS', 'APPLICATIONS', 'COMPLEXITY'].includes(m.category));

  const visualizeMax = CATEGORY_CAPS.VISUALIZE; // 20
  const gameMax = CATEGORY_CAPS.GAME; // 50
  const quizMax = CATEGORY_CAPS.QUIZ; // 30

  const visualizePercent = Math.min(100, Math.max(0, Math.round((breakdown.visualization / visualizeMax) * 100)));
  const gamePercent = Math.min(100, Math.max(0, Math.round((breakdown.games / gameMax) * 100)));
  const quizPercent = Math.min(100, Math.max(0, Math.round((breakdown.quiz / quizMax) * 100)));

  const renderStatusBadge = (status: ModuleStatus) => {
    switch (status) {
      case 'MASTERED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs sm:text-sm font-bold rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>Mastered</span>
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs sm:text-sm font-bold rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
            <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
            <span>Completed</span>
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs sm:text-sm font-bold rounded-full bg-[#EFF6FF] dark:bg-blue-950/50 text-[#2563EB] dark:text-[#3B82F6] border border-[#DBEAFE] dark:border-blue-500/30">
            <span className="w-2 h-2 rounded-full bg-[#2563EB] dark:bg-[#3B82F6] animate-pulse" />
            <span>In Progress</span>
          </span>
        );
      case 'NOT_STARTED':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs sm:text-sm font-semibold rounded-full bg-slate-50 dark:bg-[#0F172A] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-blue-500/20">
            <Circle className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span>Not Started</span>
          </span>
        );
    }
  };

  const handleModuleClick = (module: ModuleRecord) => {
    soundManager.playSelect();
    progressManager.startModule(module.id);
    onNavigateToTab(module.targetTab, module.targetLevelId, module.targetChapterId);
  };

  const handleContinueNext = () => {
    soundManager.playPrimaryClick();
    if (stats.nextModule) {
      handleModuleClick(stats.nextModule);
    } else {
      onNavigateToTab('GAME', 1);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 font-sans text-slate-900 dark:text-white animate-page-enter pb-24">
      {/* Top Utility Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold font-mono uppercase tracking-widest text-[#2563EB] dark:text-[#3B82F6] bg-[#EFF6FF] dark:bg-blue-950/60 px-2.5 py-1 rounded-md border border-[#DBEAFE] dark:border-blue-500/30">
            Curriculum Progress Tracker
          </span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Last synced: {new Date(progressState.lastActiveTimestamp).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* 100% Completion Golden Banner if Completed */}
      {is100Percent && (
        <div
          id="progress-100-percent-banner"
          className="mb-6 p-5 bg-gradient-to-r from-[#EFF6FF] via-[#F8FAFF] to-[#DBEAFE]/70 dark:from-[#172033] dark:via-[#111827] dark:to-[#0B1120] border border-[#DBEAFE] dark:border-blue-500/30 rounded-2xl shadow-xs dark:shadow-none flex flex-col sm:flex-row items-center justify-between gap-4 animate-editorial-scale"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#2563EB] dark:bg-[#3B82F6] text-white flex items-center justify-center font-bold shadow-xs">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="text-xs font-bold font-mono text-[#2563EB] dark:text-[#3B82F6] uppercase tracking-wider">
                ★ Congratulations! 100% Curriculum Completed
              </div>
              <div className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                You Have Mastered All 17 Circular Linked List Modules & Activities
              </div>
            </div>
          </div>

          <button
            id="btn-open-certificate-from-progress"
            onClick={() => {
              soundManager.playModalOpen();
              setShowCertificateModal(true);
            }}
            className="btn-modern-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all"
          >
            <Award className="w-4 h-4" />
            <span>View Certificate</span>
          </button>
        </div>
      )}

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

      {/* 2. Topic Score Card with 4 Categories — Matching Reference Screenshot Card 2 */}
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
              5 game levels (10 pts each, Hint −2, Guided −4)
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

      {/* Performance Stats & Next Recommendation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 mb-8">
        {/* Stats Breakdown */}
        <div className="bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between shadow-xs dark:shadow-xl reveal-on-scroll">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 font-mono">
            Performance Stats
          </div>

          <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 dark:border-slate-800 text-center">
            <div>
              <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">{stats.mastered}</div>
              <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase mt-0.5">Mastered ★</div>
            </div>
            <div className="border-x border-slate-100 dark:border-slate-800">
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">{stats.completed} / {stats.total}</div>
              <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase mt-0.5">Activities</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-[#2563EB] dark:text-[#3B82F6] font-mono">{progressState.levelsCompleted.length} / 5</div>
              <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase mt-0.5">Levels Won</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-3 font-medium">
            <Trophy className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6] shrink-0" />
            <span className="truncate">Master Challenges: {progressState.masterChallengesCompleted.length >= 4 ? 'All Clear (Master)' : `${progressState.masterChallengesCompleted.length} / 4 Challenges`}</span>
          </div>
        </div>

        {/* Next Recommended Step */}
        <div className="bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between shadow-xs dark:shadow-xl reveal-on-scroll stagger-1">
          <div>
            <div className="flex items-center justify-between text-xs font-bold font-mono uppercase tracking-wider text-[#2563EB] dark:text-[#3B82F6] mb-1">
              <span>Recommended Next Step</span>
              <span className="w-2 h-2 rounded-full bg-[#2563EB] dark:bg-[#3B82F6] animate-ping" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">
              {stats.nextModule?.title || 'All Modules Completed!'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {stats.nextModule?.criteriaDescription || 'You have successfully finished all curriculum activities.'}
            </p>
          </div>

          <button
            id="btn-continue-learning-cta"
            onClick={handleContinueNext}
            className="w-full mt-4 btn-modern-primary py-2.5 px-4 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            <span>Continue Learning</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Video Learning Lessons Progress Card */}
      <div className="bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 mb-8 shadow-xs dark:shadow-xl reveal-on-scroll">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#EFF6FF] dark:bg-blue-950/50 text-[#2563EB] dark:text-[#3B82F6] border border-[#DBEAFE] dark:border-blue-500/30">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                VIDEO LESSONS
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                2 VIDEOS ({videoStats.completed} / 2 Completed)
              </h4>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playNav();
              onNavigateToTab('VIDEO');
            }}
            className="text-xs sm:text-sm font-bold text-[#2563EB] dark:text-[#3B82F6] hover:text-[#1D4ED8] dark:hover:text-[#3B82F6] flex items-center gap-1.5 self-start sm:self-auto cursor-pointer transition-colors"
          >
            <span>Open Video Section</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          {/* Lesson 1 status */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#070D1A] border border-slate-200/80 dark:border-slate-800">
            <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
              Lesson 01: What is Circular Linked List?
            </span>
            {videoStats.isIntroCompleted ? (
              <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">
                <Check className="w-4 h-4 stroke-[2.5]" /> Completed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs sm:text-sm text-slate-400">
                <Circle className="w-3.5 h-3.5" /> Not completed
              </span>
            )}
          </div>

          {/* Lesson 2 status */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#070D1A] border border-slate-200/80 dark:border-slate-800">
            <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
              Lesson 02: Operations of Circular Linked List
            </span>
            {videoStats.isCollisionCompleted ? (
              <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">
                <Check className="w-4 h-4 stroke-[2.5]" /> Completed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs sm:text-sm text-slate-400">
                <Circle className="w-3.5 h-3.5" /> Not completed
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Game Levels Progress Card */}
      <div className="bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 mb-8 shadow-xs dark:shadow-xl reveal-on-scroll">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                GAME LEVELS
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                5 LEVELS ({progressState.levelsCompleted.length} / 5 Completed)
              </h4>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playNav();
              onNavigateToTab('GAME');
            }}
            className="text-xs sm:text-sm font-bold text-[#2563EB] dark:text-[#3B82F6] hover:text-[#1D4ED8] dark:hover:text-[#3B82F6] flex items-center gap-1.5 self-start sm:self-auto cursor-pointer transition-colors"
          >
            <span>Play Game</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          {GAME_LEVELS.map((lvl) => {
            const isCompleted = progressState.levelsCompleted.includes(lvl.id);
            return (
              <div
                key={lvl.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#070D1A] border border-slate-200/80 dark:border-slate-800"
              >
                <div className="flex flex-col pr-2">
                  <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {lvl.title}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    +10 pts reward
                  </span>
                </div>
                {isCompleted ? (
                  <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Check className="w-4 h-4 stroke-[2.5]" /> Completed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs sm:text-sm text-slate-400 shrink-0">
                    <Circle className="w-3.5 h-3.5" /> Not completed
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quiz Questions Progress Card */}
      <div className="bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 mb-8 shadow-xs dark:shadow-xl reveal-on-scroll">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                QUIZ ASSESSMENT
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                10 QUESTIONS ({Object.keys(studentAnswers).length} / 10 Evaluated)
              </h4>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playNav();
              onNavigateToTab('QUIZ');
            }}
            className="text-xs sm:text-sm font-bold text-[#2563EB] dark:text-[#3B82F6] hover:text-[#1D4ED8] dark:hover:text-[#3B82F6] flex items-center gap-1.5 self-start sm:self-auto cursor-pointer transition-colors"
          >
            <span>Open Quiz</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          {QUIZ_QUESTIONS.map((q, idx) => {
            const ans = studentAnswers[q.id];
            const isAnswered = ans !== undefined;
            const isTimeout = ans?.isTimeout;
            const isCorrect = ans?.isCorrect;

            return (
              <div
                key={q.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#070D1A] border border-slate-200/80 dark:border-slate-800"
              >
                <div className="flex flex-col pr-2 min-w-0">
                  <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                    Q{idx + 1}: {q.question}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {q.techniqueCode || 'CLL Concept'}
                  </span>
                </div>
                {isAnswered ? (
                  isTimeout ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 shrink-0">
                      <Clock className="w-3.5 h-3.5" /> Timed Out (0 pts)
                    </span>
                  ) : isCorrect ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" /> +3 pts Correct
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 shrink-0">
                      <XCircle className="w-3.5 h-3.5" /> −2 pts Wrong
                    </span>
                  )
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-slate-400 shrink-0">
                    <Circle className="w-3.5 h-3.5" /> Unanswered
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-blue-500/20 pb-3 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {(['ALL', 'FUNDAMENTALS', 'OPERATIONS', 'ANALYSIS'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                soundManager.playTab();
                setActiveFilter(cat);
              }}
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${activeFilter === cat
                ? 'bg-[#2563EB] dark:bg-[#3B82F6] text-white shadow-xs'
                : 'bg-slate-100 dark:bg-[#0F172A] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#172033]'
                }`}
            >
              {cat === 'ALL' ? 'All 17 Modules' : cat.charAt(0) + cat.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
          Showing {filteredModules.length} of {modules.length} modules
        </div>
      </div>

      {/* Module Ledger Cards List */}
      <div className="space-y-4">
        {filteredModules.map((m, idx) => {
          const isDone = m.status === 'COMPLETED' || m.status === 'MASTERED';
          const isInProgress = m.status === 'IN_PROGRESS';
          const staggerClass = idx < 6 ? `stagger-${idx + 1}` : '';

          return (
            <div
              key={m.id}
              id={`progress-module-${m.id}`}
              className={`bg-white dark:bg-[#111827] border rounded-2xl p-5 sm:p-6 transition-all duration-200 shadow-xs dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] reveal-on-scroll ${staggerClass} ${isDone
                ? 'border-slate-200 dark:border-blue-500/20 hover:border-slate-300 dark:hover:border-blue-500/40'
                : isInProgress
                  ? 'border-[#DBEAFE] dark:border-blue-400/50 ring-1 ring-blue-200 dark:ring-blue-500/30'
                  : 'border-slate-200 dark:border-blue-500/20 hover:border-slate-300 dark:hover:border-blue-500/40'
                }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Left metadata & title */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs sm:text-sm font-bold font-mono px-2.5 py-1 bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-blue-500/30 text-slate-700 dark:text-slate-300 rounded-md">
                      {m.code}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-[#2563EB] dark:text-[#3B82F6] uppercase font-mono">
                      {m.category}
                    </span>
                    {renderStatusBadge(m.status)}
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {m.title}
                  </h2>

                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                    {m.description}
                  </p>

                  <div className="mt-3.5 flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#0F172A] px-3.5 py-2 rounded-lg border border-slate-200/80 dark:border-blue-500/20 inline-block font-sans">
                    <span className="font-bold text-slate-700 dark:text-slate-200">Criteria:</span>
                    <span>{m.criteriaDescription}</span>
                  </div>
                </div>

                {/* Right Action & Progress Meter */}
                <div className="flex flex-col sm:items-end justify-between gap-3 shrink-0 sm:border-l sm:border-slate-100 dark:sm:border-blue-500/15 sm:pl-6">
                  <div className="w-full sm:w-40 text-right">
                    <div className="flex justify-between items-center text-xs sm:text-sm font-bold mb-1 text-slate-500 dark:text-slate-400">
                      <span>Progress</span>
                      <span className="text-slate-900 dark:text-white font-mono">{m.progressPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${m.status === 'MASTERED'
                          ? 'bg-amber-500'
                          : m.status === 'COMPLETED'
                            ? 'bg-emerald-600'
                            : 'bg-[#2563EB] dark:bg-[#3B82F6]'
                          }`}
                        style={{ width: `${m.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <button
                    id={`btn-open-module-${m.id}`}
                    onClick={() => handleModuleClick(m)}
                    className={`px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 cursor-pointer transition-all ${isDone
                      ? 'btn-modern-secondary'
                      : 'btn-modern-primary'
                      }`}
                  >
                    <span>{isDone ? 'Review Module' : isInProgress ? 'Resume Activity' : 'Start Module'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 100% Completion Certificate Modal */}
      <CompletionCelebrationModal
        isOpen={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
        onNavigateToLab={() => onNavigateToTab('LAB')}
        onNavigateToProgress={() => setShowCertificateModal(false)}
      />
    </div>
  );
};

export default MyProgressView;

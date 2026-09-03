import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Trophy,
  BookOpen,
  Gamepad2,
  Layers,
  Video,
  Award,
  AlertTriangle,
  Flame,
  Check,
  Star,
  Circle,
  Clock,
} from 'lucide-react';
import { progressManager } from '../utils/progressManager';
import { ModuleRecord, ModuleStatus, UserProgressState, MainViewTab } from '../types/game';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { CompletionCelebrationModal } from './CompletionCelebrationModal';
import { ResetProgressModal } from './ResetProgressModal';
import { soundManager } from '../utils/audio';

interface MyProgressViewProps {
  onNavigateToTab: (tab: MainViewTab, levelId?: number, chapterId?: string) => void;
}

export const MyProgressView: React.FC<MyProgressViewProps> = ({ onNavigateToTab }) => {
  useScrollReveal();
  const [progressState, setProgressState] = useState<UserProgressState>(progressManager.getState());
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'FOUNDATION' | 'MECHANICS' | 'ANALYSIS' | 'PRACTICE'>('ALL');

  useEffect(() => {
    progressManager.checkAndCompleteCertification();
    const unsubscribe = progressManager.subscribe((state) => {
      setProgressState(state);
    });
    return unsubscribe;
  }, []);

  const stats = progressManager.getStats();
  const videoStats = progressManager.getVideoStats();
  const modules = progressManager.getModules();
  const is100Percent = stats.percentage === 100;

  const filteredModules = activeFilter === 'ALL'
    ? modules
    : modules.filter((m) => m.category === activeFilter);

  const handleReset = () => {
    soundManager.playReset();
    progressManager.resetProgress();
    setShowResetConfirm(false);
  };

  const renderStatusBadge = (status: ModuleStatus) => {
    switch (status) {
      case 'MASTERED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
            <span>Mastered</span>
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
            <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
            <span>Completed</span>
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#EFF6FF] dark:bg-blue-950/50 text-[#2563EB] dark:text-[#3B82F6] border border-[#DBEAFE] dark:border-blue-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] dark:bg-[#3B82F6] animate-pulse" />
            <span>In Progress</span>
          </span>
        );
      case 'NOT_STARTED':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full bg-slate-50 dark:bg-[#0F172A] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-blue-500/20">
            <Circle className="w-3 h-3 text-slate-400 dark:text-slate-500" />
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
      {/* Header Section */}
      <div className="border-b border-slate-200 dark:border-blue-500/20 pb-6 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold font-mono uppercase tracking-widest text-[#2563EB] dark:text-[#3B82F6] bg-[#EFF6FF] dark:bg-blue-950/60 px-2.5 py-1 rounded-md border border-[#DBEAFE] dark:border-blue-500/30">
              Curriculum Progress Tracker
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Last synced: {new Date(progressState.lastActiveTimestamp).toLocaleDateString()}
            </span>
          </div>

          <button
            id="btn-reset-progress-dialog"
            onClick={() => {
              soundManager.playModalOpen();
              setShowResetConfirm(true);
            }}
            className="text-xs font-medium text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Progress</span>
          </button>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight animate-heading-enter">
          Learning Progress & Mastery
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl mt-1 leading-relaxed">
          Track your journey through sequential search mechanics, complexity analysis, and interactive lab experiments.
        </p>

        {/* 100% Completion Golden Banner if Completed */}
        {is100Percent && (
          <div
            id="progress-100-percent-banner"
            className="mt-6 p-5 bg-gradient-to-r from-[#EFF6FF] to-blue-100/60 dark:from-blue-950/50 dark:to-blue-900/40 border border-[#DBEAFE] dark:border-blue-500/30 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 animate-editorial-scale"
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
                  You Have Mastered All Circular Linked List Modules & Activities
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
      </div>

      {/* Progress Summary Cards & Next Action */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Card 1: Main Progress Metric */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-blue-500/25 rounded-2xl p-6 shadow-xs dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] relative overflow-hidden reveal-on-scroll">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Overall Completion
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-5xl font-extrabold text-slate-900 dark:text-white leading-none">
              {stats.percentage}%
            </span>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 font-mono">
              ({stats.completed} of {stats.total} Activities)
            </span>
          </div>

          {/* Clean Segmented Progress Bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#1D4ED8] via-[#2563EB] to-[#6366F1] h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${stats.percentage}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-2.5">
            <span>0% Beginner</span>
            <span>100% Master</span>
          </div>
        </div>

        {/* Card 2: Stats Breakdown */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-blue-500/25 rounded-2xl p-6 flex flex-col justify-between shadow-xs dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] reveal-on-scroll stagger-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Performance Stats
          </div>

          <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 dark:border-blue-500/15 text-center">
            <div>
              <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">{stats.mastered}</div>
              <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase mt-0.5">Mastered ★</div>
            </div>
            <div className="border-x border-slate-100 dark:border-blue-500/15">
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

        {/* Card 3: Next Recommended Step */}
        <div className="bg-gradient-to-br from-[#EFF6FF]/60 to-white dark:from-blue-950/40 dark:to-[#111827] border border-[#DBEAFE] dark:border-blue-500/30 rounded-2xl p-6 flex flex-col justify-between shadow-xs dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] reveal-on-scroll stagger-2">
          <div>
            <div className="flex items-center justify-between text-xs font-bold font-mono uppercase tracking-wider text-[#2563EB] dark:text-[#3B82F6] mb-1">
              <span>Recommended Next Step</span>
              <span className="w-2 h-2 rounded-full bg-[#2563EB] dark:bg-[#3B82F6] animate-ping" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">
              {stats.nextModule.title}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">
              {stats.nextModule.criteriaDescription}
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
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-blue-500/25 rounded-2xl p-5 mb-8 shadow-xs dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] reveal-on-scroll">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#EFF6FF] dark:bg-blue-950/50 text-[#2563EB] dark:text-[#3B82F6] border border-[#DBEAFE] dark:border-blue-500/30">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                VIDEO LESSONS
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                2 VIDEOS ({videoStats.completed} / 2 Completed)
              </h4>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playNav();
              onNavigateToTab('VIDEO');
            }}
            className="text-xs font-semibold text-[#2563EB] dark:text-[#3B82F6] hover:text-[#1D4ED8] dark:hover:text-[#3B82F6] flex items-center gap-1.5 self-start sm:self-auto cursor-pointer transition-colors"
          >
            <span>Open Video Section</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-blue-500/15">
          {/* Lesson 1 status */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200/80 dark:border-blue-500/20">
            <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
              Lesson 01: What is Linear Search?
            </span>
            {videoStats.isIntroCompleted ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <Check className="w-3.5 h-3.5 stroke-[2.5]" /> Completed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                <Circle className="w-3 h-3" /> Not completed
              </span>
            )}
          </div>

          {/* Lesson 2 status */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200/80 dark:border-blue-500/20">
            <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
              Lesson 02: How Does Linear Search Work?
            </span>
            {videoStats.isCollisionCompleted ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <Check className="w-3.5 h-3.5 stroke-[2.5]" /> Completed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                <Circle className="w-3 h-3" /> Not completed
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-blue-500/20 pb-3 mb-6">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {(['ALL', 'FOUNDATION', 'MECHANICS', 'ANALYSIS', 'PRACTICE'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                soundManager.playTab();
                setActiveFilter(cat);
              }}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${activeFilter === cat
                ? 'bg-[#2563EB] dark:bg-[#3B82F6] text-white shadow-xs'
                : 'bg-slate-100 dark:bg-[#0F172A] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#172033]'
                }`}
            >
              {cat === 'ALL' ? 'All Modules' : cat.charAt(0) + cat.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Showing {filteredModules.length} of {modules.length} modules
        </div>
      </div>

      {/* Module Ledger Cards List */}
      <div className="space-y-3.5">
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
                    <span className="text-xs font-bold font-mono px-2 py-0.5 bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-blue-500/30 text-slate-700 dark:text-slate-300 rounded-md">
                      {m.code}
                    </span>
                    <span className="text-xs font-semibold text-[#2563EB] dark:text-[#3B82F6] uppercase font-mono">
                      {m.category}
                    </span>
                    {renderStatusBadge(m.status)}
                  </div>

                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {m.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {m.description}
                  </p>

                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#0F172A] px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-blue-500/20 inline-block font-sans">
                    <span className="font-bold text-slate-700 dark:text-slate-200">Criteria:</span>
                    <span>{m.criteriaDescription}</span>
                  </div>
                </div>

                {/* Right Action & Progress Meter */}
                <div className="flex flex-col sm:items-end justify-between gap-3 shrink-0 sm:border-l sm:border-slate-100 dark:sm:border-blue-500/15 sm:pl-6">
                  <div className="w-full sm:w-36 text-right">
                    <div className="flex justify-between items-center text-xs font-semibold mb-1 text-slate-500 dark:text-slate-400">
                      <span>Progress</span>
                      <span className="text-slate-900 dark:text-white font-mono">{m.progressPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
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
                    className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 cursor-pointer transition-all ${isDone
                      ? 'btn-modern-secondary'
                      : 'btn-modern-primary'
                      }`}
                  >
                    <span>{isDone ? 'Review Module' : isInProgress ? 'Resume Activity' : 'Start Module'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Centered Confirmation Modal for Reset */}
      <ResetProgressModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleReset}
      />

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
